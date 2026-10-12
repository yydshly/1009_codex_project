import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { StageLayout } from '../src/stage-layout.js';
import { createDefaultStage, createElement, validateStage, serializeStage, saveStage, loadStage, STAGE_STORAGE_KEY, MAX_ELEMENTS } from '../src/stage-definition.js';
import { parseProgram } from '../src/program-loader.js';
import { syncStageShows } from '../src/stage-plan.js';
import { LaserShowPipeline } from '../vendor/three-ilda/src/webgl.js';

async function asset(id) {
  const bytes = await readFile(new URL(`../public/shows/${id}.ild`, import.meta.url));
  return parseProgram(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}
function storageFixture() {
  const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
test('舞台 JSON 往返保存空间资产，不引入附带的演出时间线或任意资源 URL', () => {
  const stage = createDefaultStage(), original = structuredClone(stage);
  stage.timeline = ['song']; stage.objects[3].url = 'https://example.invalid/arbitrary.js';
  const result = JSON.parse(serializeStage(stage));
  assert.deepEqual(result, original); assert.notEqual(result.objects, stage.objects);
  result.objects[0].position[0] = 20; assert.equal(stage.objects[0].position[0], 0);
  assert.equal(result.objects[3].program, 'corners');
});
test('非法版本、重复 ID、非有限坐标、不合理尺寸和设备参数不能进入场景', () => {
  const invalid = [
    stage => { stage.version = 2; }, stage => { stage.objects[1].id = stage.objects[0].id; },
    stage => { stage.objects[0].position[0] = NaN; }, stage => { stage.objects[0].size[1] = 0; },
    stage => { stage.objects[0].position[1] = -1; }, stage => { stage.objects[0].rotationY = Infinity; },
    stage => { stage.objects[3].program = '../remote'; }, stage => { stage.objects[3].aperture[2] = -2; },
    stage => { stage.objects[3].pointRate = 50001; }, stage => { stage.objects[3].beamIntensity = 3; },
    stage => { stage.objects[0].type = 'script'; }, stage => { stage.objects = Array(MAX_ELEMENTS + 1).fill(stage.objects[0]); },
  ];
  invalid.forEach(mutate => { const stage = createDefaultStage(); mutate(stage); assert.throws(() => validateStage(stage)); });
  assert.deepEqual(validateStage({ ...createDefaultStage(), objects: [] }).objects, []);
});
test('同一浏览器的编辑器与业务读取相同配置，损坏配置回退并提供原因，存储失败不伪报成功', () => {
  const storage = storageFixture(), stage = createDefaultStage();
  assert.equal(loadStage(storage).saved, false);
  stage.name = '演出业务读取的舞台'; stage.objects[0].size[0] = 20; saveStage(storage, stage);
  assert.deepEqual(loadStage(storage), { stage, saved: true, warning: '' });
  storage.setItem(STAGE_STORAGE_KEY, '{broken'); const broken = loadStage(storage);
  assert.equal(broken.saved, false); assert.ok(broken.warning); assert.deepEqual(broken.stage, createDefaultStage());
  assert.throws(() => saveStage({ setItem() { throw new Error('quota'); } }, stage), /quota/);
});
test('台面与设备的尺寸、方向、出光口在真实 Three.js 场景中正确装配', () => {
  const scene = new THREE.Scene(), layout = new StageLayout(scene);
  const stage = createDefaultStage(); stage.objects[0].shape = 'round';
  const laser = stage.objects[3]; laser.position = [10, 4, -2]; laser.rotationY = 90; laser.aperture = [1, -2, 5];
  layout.build(stage); scene.updateMatrixWorld(true);
  try {
    const deck = layout.records.get('deck').root.children[0]; assert.equal(deck.geometry.type, 'CylinderGeometry');
    assert.deepEqual(deck.scale.toArray(), stage.objects[0].size);
    const record = layout.records.get(laser.id); assert.deepEqual(record.root.position.toArray(), [10, 4, -2]);
    assert.ok(Math.abs(record.root.rotation.y - Math.PI / 2) < 1e-9);
    const origin = record.show.projector.getWorldPosition(new THREE.Vector3());
    assert.ok(origin.distanceTo(new THREE.Vector3(15, 2, -3)) < 1e-9);
    assert.equal(record.show.pointRate, laser.pointRate); assert.equal(record.show.beamIntensity, laser.beamIntensity);
    assert.deepEqual(record.show._projectionSize.toArray(), laser.size.slice(0, 2));
  } finally { layout.dispose(); }
  assert.equal(scene.children.length, 0);
});
test('构件替换和删除释放旧 LaserShow 与管线注册，其他设备继续保持扫描状态', async () => {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera();
  // 构造真实管线及资源，不调用 render，不宣称 GPU 执行。
  const pipeline = new LaserShowPipeline({}, scene, camera, { samples: 0 }); const layout = new StageLayout(scene, pipeline);
  layout.build(createDefaultStage()); const input = await asset('corners');
  const old = layout.records.get('laser-1').show, preserved = layout.records.get('laser-2').show;
  layout.setProgram('laser-2', input); preserved.playing = true; preserved.update(.05); const time = preserved.time;
  const changed = createElement('laser', 'laser-1'); changed.size[0] = 8; layout.add(changed);
  assert.equal(old.disposed, true); assert.equal(pipeline.shows.has(old), false); assert.equal(pipeline.shows.size, 3);
  assert.equal(layout.records.get('laser-2').show, preserved); assert.equal(preserved.time, time);
  layout.remove('laser-1'); assert.equal(pipeline.shows.size, 2);
  layout.dispose(); assert.equal(pipeline.shows.size, 0); assert.equal(preserved.disposed, true); pipeline.dispose();
});
test('装配器中的真实 LaserShow 可加载全部 22 个素材并生成有限扫描几何', async () => {
  const catalog = JSON.parse(await readFile(new URL('../public/shows/catalog.json', import.meta.url), 'utf8'));
  const stage = { ...createDefaultStage(), objects: [createElement('laser', 'device')] };
  const layout = new StageLayout(new THREE.Scene()); layout.build(stage);
  try {
    const show = layout.shows[0];
    for (const entry of catalog) {
      const bytes = await readFile(new URL(`../public/${entry.file}`, import.meta.url));
      layout.setProgram('device', parseProgram(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), entry));
      show.playing = true; show.update(.08);
      assert.ok(show.projection.geometry.drawRange.count > 0, entry.id);
      for (const value of show.scanner.snapshot(.9).position) assert.ok(Number.isFinite(value), entry.id);
    }
  } finally { layout.dispose(); }
});
test('独立演出脚本复用保存的五台设备，不改变舞台位置、尺寸、朝向和各自点率', async () => {
  const storage = storageFixture(), stage = createDefaultStage();
  stage.objects = Array.from({ length: 5 }, (_, i) => {
    const laser = createElement('laser', `device-${i}`); laser.position[0] = i * 3; laser.pointRate = 5000 + i * 1000; laser.rotationY = i * 10; return laser;
  });
  saveStage(storage, stage); const layout = new StageLayout(new THREE.Scene(), null, { showSlots: false }); layout.build(loadStage(storage).stage);
  const assets = new Map(); for (const id of ['corners', 'lab-mark', 'orbits', 'light-flower']) assets.set(id, await asset(id));
  try {
    const cue = syncStageShows(layout.shows, assets, 31.25);
    layout.shows.forEach((show, i) => {
      assert.equal(show.asset, assets.get(cue.programs[i % 3])); assert.equal(show.time, 1.25);
      assert.equal(show.pointRate, stage.objects[i].pointRate); assert.equal(show.scanner.samples, Math.floor(1.25 * show.pointRate));
      assert.deepEqual(show.parent.position.toArray(), stage.objects[i].position);
      assert.deepEqual(show._projectionSize.toArray(), stage.objects[i].size.slice(0, 2));
      assert.ok(Math.abs(show.parent.rotation.y - THREE.MathUtils.degToRad(stage.objects[i].rotationY)) < 1e-9);
    });
  } finally { layout.dispose(); }
});
