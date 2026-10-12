import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { createTemplateStage } from '../src/stage-templates.js';
import { validateStage, serializeStage } from '../src/stage-definition.js';
import { assignStageEffect, stageUsesEffects, stageEffectIds, syncConfiguredEffects, stageEffectSummary } from '../src/stage-effects.js';
import { StageProgramLibrary } from '../src/stage-program-library.js';
import { StageLayout } from '../src/stage-layout.js';
import { saveStageProject, readStageSelection } from '../src/stage-projects.js';
import { syncStageShows } from '../src/stage-plan.js';
import { syncLaunchShows } from '../src/launch-plan.js';

const catalog = JSON.parse(await readFile(new URL('../public/shows/catalog.json', import.meta.url), 'utf8'));
function fileLibrary() {
  const calls = new Map();
  const library = new StageProgramLibrary(new URL('https://local.example/015/'), async url => {
    const file = url.pathname.slice('/015/'.length); calls.set(file, (calls.get(file) ?? 0) + 1);
    if (file === 'shows/catalog.json') return { ok: true, json: async () => catalog };
    const bytes = await readFile(new URL(`../public/${file}`, import.meta.url));
    return { ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
  });
  return { library, calls };
}
const memoryStorage = () => { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }; };
const trailFingerprint = show => {
  const snapshot = show.scanner.snapshot(.89);
  return { count: snapshot.count, position: createHash('sha256').update(Buffer.from(snapshot.position.buffer, 0, snapshot.count * 3 * 4)).digest('hex') };
};

test('效果接入方式兼容旧配置，按设备与全部接入返回独立配置，非法目标不修改原方案', () => {
  const original = createTemplateStage('runway'), before = serializeStage(original);
  assert.equal(stageUsesEffects(original), false);
  assert.equal(stageEffectSummary(original, catalog), '光效来源：业务编排');
  const one = assignStageEffect(original, 'upstream-dolphin', 'laser-2');
  assert.equal(one.objects.find(o => o.id === 'laser-1').program, 'corners');
  assert.equal(one.objects.find(o => o.id === 'laser-2').program, 'upstream-dolphin');
  assert.equal(one.effectMode, 'stage'); assert.equal(JSON.parse(serializeStage(one)).effectMode, 'stage');
  const all = assignStageEffect(one, 'upstream-plasma2'); assert.deepEqual(stageEffectIds(all), ['upstream-plasma2']);
  assert.equal(serializeStage(original), before); assert.throws(() => assignStageEffect(original, 'orbits', 'rear-deck'));
  assert.throws(() => validateStage({ ...original, effectMode: 'invalid' }));
  assert.throws(() => assignStageEffect(original, 'https://example.com'));
});

test('同一效果加载只请求一次，22 个真实节目共享解析入口和上游调色板并按编号路径交付', async () => {
  const { library, calls } = fileLibrary();
  const [a, b] = await Promise.all([library.get('upstream-sylvester'), library.get('upstream-sylvester')]);
  assert.equal(a, b);
  const assets = await library.load(catalog.map(entry => entry.id)); assert.equal(assets.size, 22);
  assert.equal(calls.get('shows/catalog.json'), 1);
  for (const entry of catalog) { assert.equal(calls.get(entry.file), 1); assert.ok(assets.get(entry.id).tracks.size > 0); }
  assert.equal(await library.get('upstream-sylvester'), a);
});

test('缺失 ID 不获取任意 URL，加载失败允许重试且不缓存失败结果', async () => {
  let fileCalls = 0;
  const library = new StageProgramLibrary(new URL('https://local.example/'), async url => url.pathname.endsWith('catalog.json') ? { ok: true, json: async () => catalog } : { ok: ++fileCalls > 1, arrayBuffer: async () => {
    const bytes = await readFile(new URL('../public/shows/corners.ild', import.meta.url)); return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  } });
  await assert.rejects(library.get('missing'), /没有节目/); assert.equal(fileCalls, 0);
  await assert.rejects(library.get('corners'), /效果加载失败/); assert.ok(await library.get('corners')); assert.equal(fileCalls, 2);
});

test('保存的三种节目被两个真实业务装配器复用，保持节目、点率和亮度；业务时钟互不影响', async () => {
  let stage = createTemplateStage('runway');
  for (const [index, id] of ['upstream-dolphin', 'upstream-plasma2', 'upstream-dancer'].entries()) stage = assignStageEffect(stage, id, `laser-${index + 1}`);
  const storage = memoryStorage(); saveStageProject(storage, stage, { id: 'project-effects', now: 100 });
  const { library } = fileLibrary(), assets = await library.load(stageEffectIds(stage));
  const music = new StageLayout(new THREE.Scene(), null), launch = new StageLayout(new THREE.Scene(), null);
  music.build(readStageSelection(storage).stage); launch.build(readStageSelection(storage).stage);
  try {
    syncConfiguredEffects(music, assets, .2, catalog); syncConfiguredEffects(launch, assets, .2, catalog);
    for (const [id, record] of music.records) if (record.show) {
      const other = launch.records.get(id);
      assert.equal(record.show.asset, assets.get(record.element.program)); assert.equal(other.show.asset, record.show.asset);
      assert.equal(record.show.pointRate, record.element.pointRate); assert.equal(record.show.intensity, record.element.intensity);
      assert.equal(record.show.beamIntensity, record.element.beamIntensity); assert.equal(record.show.zoom, 1);
      assert.deepEqual(record.show.rotation.toArray(), other.show.rotation.toArray());
      assert.deepEqual(trailFingerprint(record.show), trailFingerprint(other.show));
    }
    const frozen = launch.shows[0].time; syncConfiguredEffects(music, assets, .3, catalog); assert.equal(launch.shows[0].time, frozen);
    assert.ok(stageEffectSummary(stage, catalog).includes('DOLPHIN'));
  } finally { music.dispose(); launch.dispose(); }
});

test('暂停重复取样不重建扫描器，向前、向后跳转与初次取样一致，全部 22 效果可接入', async () => {
  const { library } = fileLibrary(), assets = await library.load(catalog.map(entry => entry.id));
  const layout = new StageLayout(new THREE.Scene(), null);
  try {
    for (const entry of catalog) {
      layout.build(assignStageEffect(createTemplateStage('studio'), entry.id));
      syncConfiguredEffects(layout, assets, .1, catalog); const show = layout.shows[0], scanner = show.scanner;
      const initial = trailFingerprint(show);
      syncConfiguredEffects(layout, assets, .1, catalog); assert.equal(show.scanner, scanner); assert.equal(show.time, .1);
      syncConfiguredEffects(layout, assets, .2, catalog); assert.equal(show.scanner, scanner); assert.ok(show.time > .1);
      syncConfiguredEffects(layout, assets, .1, catalog); assert.deepEqual(trailFingerprint(show), initial, entry.id);
      syncConfiguredEffects(layout, assets, 1.2, catalog); assert.equal(show.time, 1.2); assert.ok(show.scanner.samples > 0);
    }
  } finally { layout.dispose(); }
});

test('切回业务编排后仍可运行原脚本，回到展台效果时恢复保存节目与参数', async () => {
  const { library } = fileLibrary(), assets = await library.load(['upstream-dolphin', 'corners', 'light-flower', 'orbits', 'lab-mark']);
  const stage = assignStageEffect(createTemplateStage('studio'), 'upstream-dolphin');
  const layout = new StageLayout(new THREE.Scene(), null); layout.build(stage);
  try {
    syncConfiguredEffects(layout, assets, .2, catalog); const upstream = layout.shows[0].asset;
    syncStageShows(layout.shows, assets, 35); assert.notEqual(layout.shows[0].asset, upstream);
    syncLaunchShows(layout.shows, assets, 12); assert.notEqual(layout.shows[0].asset, upstream);
    syncConfiguredEffects(layout, assets, .2, catalog); assert.equal(layout.shows[0].asset, upstream);
    assert.equal(layout.shows[0].intensity, stage.objects.find(o => o.type === 'laser').intensity);
    assert.deepEqual(stageEffectIds(stage), ['upstream-dolphin']);
  } finally { layout.dispose(); }
});
