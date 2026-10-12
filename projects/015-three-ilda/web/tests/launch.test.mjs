import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { createDefaultStage, createElement, saveStage, loadStage, serializeStage } from '../src/stage-definition.js';
import { StageLayout } from '../src/stage-layout.js';
import { LaunchContent, createLaunchProduct, PRODUCT_FINISHES } from '../src/launch-content.js';
import { LaunchClock, LAUNCH_CUES, LAUNCH_DURATION, launchCueAt, launchPoseAt, syncLaunchShows } from '../src/launch-plan.js';
import { parseProgram } from '../src/program-loader.js';
import { syncStageShows } from '../src/stage-plan.js';

test('发布会四段完整覆盖一分钟，揭幕与结构在边界连续变化，手动展开可覆盖业务动画', () => {
  assert.equal(LAUNCH_CUES[0].start, 0); assert.equal(LAUNCH_CUES.at(-1).end, LAUNCH_DURATION);
  LAUNCH_CUES.forEach((cue, index) => {
    if (index) assert.equal(cue.start, LAUNCH_CUES[index - 1].end);
    assert.equal(launchCueAt(cue.start), cue); assert.equal(launchCueAt(cue.end - .001), cue);
  });
  assert.equal(launchPoseAt(0).reveal, 0); assert.equal(launchPoseAt(10).reveal, 1);
  assert.equal(launchPoseAt(24).detail, 0); assert.equal(launchPoseAt(26).detail, 1); assert.equal(launchPoseAt(44).detail, 0);
  assert.equal(launchPoseAt(0, 1).detail, 1); assert.equal(launchPoseAt(30, 0).detail, 0);
  for (const time of [0, 7.99, 8, 24, 42, 44, 60, Infinity, -1]) {
    const pose = launchPoseAt(time); assert.ok(pose.reveal >= 0 && pose.reveal <= 1); assert.ok(pose.detail >= 0 && pose.detail <= 1);
  }
});
test('发布会时钟暂停、后台停顿、前后跳段、片尾和重播不会累积错误进度', () => {
  let now = 100; const clock = new LaunchClock(() => now);
  assert.equal(clock.time, 0); clock.play(); now += 12.5; assert.equal(clock.time, 12.5);
  clock.pause(); now += 100; assert.equal(clock.time, 12.5); assert.equal(clock.playing, false);
  clock.seek(30); clock.play(); now += 4; assert.equal(clock.time, 34);
  clock.seek(8); now += 2; assert.equal(clock.time, 10);
  clock.seek(59); now += 10; assert.equal(clock.time, 60); assert.equal(clock.playing, false);
  clock.play(); assert.equal(clock.time, 0); now += 1; assert.equal(clock.time, 1);
  clock.seek(60); assert.equal(clock.playing, false); clock.seek(-20); assert.equal(clock.time, 0);
});
test('两个独立业务使用同一份保存配置，节目不同且每台设备的布局、尺寸、出光口与点率一致', async () => {
  const values = new Map(), storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const stage = createDefaultStage(); stage.name = '两种业务共用的舞台'; stage.objects[0].size[0] = 20;
  stage.objects.push(createElement('laser', 'extra-device'));
  stage.objects.filter(object => object.type === 'laser').forEach((device, i) => { device.position = [i * 4, 4, -2]; device.rotationY = i * 8; device.pointRate = 6000 + i * 1000; device.aperture[0] = -i; });
  saveStage(storage, stage); const before = serializeStage(loadStage(storage).stage);
  const concert = new StageLayout(new THREE.Scene(), null, { showSlots: false }), launch = new StageLayout(new THREE.Scene(), null, { showSlots: false });
  concert.build(loadStage(storage).stage); launch.build(loadStage(storage).stage);
  const assets = new Map();
  for (const id of ['corners', 'lab-mark', 'orbits', 'light-flower']) {
    const bytes = await readFile(new URL(`../public/shows/${id}.ild`, import.meta.url));
    assets.set(id, parseProgram(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
  }
  try {
    syncStageShows(concert.shows, assets, 31.5); const cue = syncLaunchShows(launch.shows, assets, 31.5);
    for (const [i, show] of launch.shows.entries()) {
      const other = concert.shows[i]; assert.notEqual(show.asset, other.asset);
      assert.deepEqual(show.parent.position.toArray(), other.parent.position.toArray()); assert.equal(show.parent.rotation.y, other.parent.rotation.y);
      assert.deepEqual(show._projectionSize.toArray(), other._projectionSize.toArray()); assert.deepEqual(show.projector.position.toArray(), other.projector.position.toArray());
      assert.equal(show.pointRate, other.pointRate); assert.equal(show.asset, assets.get(cue.programs[i % 3]));
      assert.equal(show.scanner.samples, Math.floor((31.5 - cue.start) * show.pointRate));
    }
    for (const time of [8.25, 8.25, 0, 45.5, 60]) {
      const cue = syncLaunchShows(launch.shows, assets, time);
      launch.shows.forEach(show => { assert.equal(show.time, time - cue.start); assert.equal(show.playing, false); });
    }
    assert.equal(serializeStage(loadStage(storage).stage), before);
    assert.equal(serializeStage(stage), before);
  } finally { launch.dispose(); concert.dispose(); }
});
test('发布会产品与文案挂到已有插槽和屏幕，继承其空间变换，不修改舞台构件', () => {
  const definition = createDefaultStage(); definition.objects[2].position = [6, 1, 3]; definition.objects[2].rotationY = 45;
  definition.objects[1].position = [2, 4, -6]; definition.objects[1].rotationY = 20;
  const screen2 = createElement('screen', 'side-screen'); screen2.position[0] = 8; definition.objects.push(screen2);
  const before = serializeStage(definition), scene = new THREE.Scene(), layout = new StageLayout(scene);
  layout.build(definition); const record = layout.records.get('backdrop'), original = record.root.children[0], originalChildren = [...record.root.children];
  const content = new LaunchContent(layout, { makeScreenTexture: () => new THREE.Texture() });
  scene.updateMatrixWorld(true);
  assert.equal(content.slotId, 'content'); assert.equal(content.productRoot.parent, layout.records.get('content').root);
  assert.equal(content.screens.length, 2); assert.equal(content.screens[0].plane.parent, record.root);
  assert.equal(content.screens[0].plane.position.z, definition.objects[1].size[2] / 2 + .015);
  const target = content.productRoot.getWorldPosition(new THREE.Vector3()); assert.deepEqual(target.toArray(), [6, 1, 3]);
  assert.equal(record.root.children[0], original); assert.equal(serializeStage(definition), before);
  content.dispose(); assert.deepEqual(record.root.children, originalChildren);
  assert.equal(record.root.children.length, 2); assert.equal(layout.records.size, definition.objects.length); layout.dispose();
});
test('概念产品模型可展开、还原和换色，所有几何有限且业务资源可完整释放', () => {
  const product = createLaunchProduct(); let released = 0;
  product.resources.forEach(resource => resource.addEventListener('dispose', () => released++));
  const expected = product.resources.size; assert.ok(expected > 10);
  product.update(launchPoseAt(30)); product.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(product.root); assert.ok(box.max.y > 4);
  for (const part of product.parts) assert.equal(part.object.position.y, part.y + part.lift);
  product.update(launchPoseAt(50)); product.parts.forEach(part => assert.equal(part.object.position.y, part.y));
  for (const id of Object.keys(PRODUCT_FINISHES)) { product.setFinish(id); assert.equal(product.shell.color.getHexString(), PRODUCT_FINISHES[id].color.slice(1)); }
  assert.throws(() => product.setFinish('unknown'));
  product.root.traverse(object => {
    const positions = object.geometry?.attributes.position; if (positions) for (const value of positions.array) assert.ok(Number.isFinite(value));
  });
  product.dispose(); assert.equal(released, expected); assert.equal(product.resources.size, 0);
});
test('无插槽或屏幕时给出接入说明，不擅自增改舞台；业务释放不销毁共享舞台资源', () => {
  const layout = new StageLayout(new THREE.Scene()); layout.build({ ...createDefaultStage(), objects: [createElement('platform', 'deck')] });
  const content = new LaunchContent(layout); assert.equal(content.product, null); assert.equal(content.warnings.length, 2);
  const platform = layout.records.get('deck').root.children[0]; let disposed = false;
  platform.geometry.addEventListener('dispose', () => { disposed = true; }); content.dispose(); assert.equal(disposed, false);
  assert.equal(layout.records.size, 1); layout.dispose(); assert.equal(disposed, true);
});
