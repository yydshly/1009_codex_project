import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createPumpModel } from '../../../002-dioramas/web/pump-model.js';
import { PumpContent, PUMP_PARTS } from '../src/pump-content.js';
import { StageLayout } from '../src/stage-layout.js';
import { STAGE_TEMPLATES, createTemplateStage } from '../src/stage-templates.js';
import { createDefaultStage, createElement, serializeStage } from '../src/stage-definition.js';
import { stageEffectIds, syncConfiguredEffects } from '../src/stage-effects.js';
import { parseProgram } from '../src/program-loader.js';
import { readFile } from 'node:fs/promises';

test('002 与展台引用同一个工厂；独立实例保留六个部件和相同几何，不共享交互状态', async () => {
  const originalScene = await readFile(new URL('../../../002-dioramas/web/scene.js', import.meta.url), 'utf8');
  assert.ok(originalScene.includes("import { createPumpModel } from './pump-model.js'"));
  assert.ok(originalScene.includes('createPumpModel(THREE)'));
  const source = createPumpModel(THREE), host = createPumpModel(THREE);
  try {
    assert.deepEqual([...host.partGroups.keys()].sort(), PUMP_PARTS.map(part => part.id).sort());
    assert.ok(host.pickable.length > 65); assert.equal(host.pickable.length, source.pickable.length);
    assert.notEqual(host.root, source.root); host.select('seal');
    assert.equal(source.pickable.find(mesh => mesh.userData.partId === 'seal').material.emissiveIntensity, 1);
    for (const [index, object] of host.pickable.entries()) {
      assert.equal(object.userData.partId, source.pickable[index].userData.partId);
      assert.deepEqual(object.geometry.attributes.position.array, source.pickable[index].geometry.attributes.position.array);
    }
  } finally { source.dispose(); host.dispose(); }
});
test('共用展开与流向状态：展开还原、透明外壳、有限粒子、高亮和完整资源释放', () => {
  const model = createPumpModel(THREE);
  model.update({ explode: 1, reducedMotion: true });
  for (const part of model.partGroups.values()) assert.deepEqual(part.position.toArray(), part.userData.home.clone().add(part.userData.offset).toArray());
  model.update({ explode: 0, shell: 'transparent', flow: true, time: 3.2, dt: .02, reducedMotion: true });
  assert.equal(model.flowGroup.visible, true);
  assert.ok(model.casing.children.every(mesh => mesh.material.opacity === .14 && !mesh.material.depthWrite));
  assert.equal(model.select('impeller'), true); assert.equal(model.select('unknown'), false);
  assert.ok(model.pickable.filter(mesh => mesh.userData.partId === 'impeller').every(mesh => mesh.material.emissiveIntensity > 0));
  model.update({ explode: 1, flow: true, reducedMotion: true }); assert.equal(model.flowGroup.visible, false);
  model.update({ reducedMotion: true });
  for (const part of model.partGroups.values()) assert.deepEqual(part.position.toArray(), part.userData.home.toArray());
  model.root.traverse(object => { if (object.geometry) for (const number of object.geometry.attributes.position.array) assert.ok(Number.isFinite(number)); });
  let released = 0; const count = model.resources.size; model.resources.forEach(resource => resource.addEventListener('dispose', () => released++));
  model.dispose(); assert.equal(released, count); assert.equal(model.resources.size, 0);
});
test('五套舞台的模型继承插槽、屏幕继承构件，旋转展开不改写舞台，重载不遗留业务对象', () => {
  for (const template of STAGE_TEMPLATES) {
    const stage = createTemplateStage(template.id), before = serializeStage(stage), layout = new StageLayout(new THREE.Scene()); layout.build(stage);
    const originals = new Map([...layout.records].map(([id, record]) => [id, [...record.root.children]]));
    const content = new PumpContent(layout, { makeScreenTexture: () => new THREE.Texture() });
    assert.ok(content.model, template.id); assert.equal(content.productRoot.parent, layout.records.get(content.slotId).root);
    if (template.id === 'studio') assert.equal(content.slotId, 'product-slot', '产品内容优先放在商品圆台');
    assert.equal(content.screens.length, stage.objects.filter(object => object.type === 'screen').length);
    for (const angle of [0, 45, 90, 180]) {
      content.update({rotation: angle, explode: 0}, 0, 0, true); layout.scene.updateMatrixWorld(true);
      const box = content.bounds(); assert.ok(box.min.toArray().every(Number.isFinite)); assert.ok(box.max.toArray().every(Number.isFinite));
    }
    content.update({rotation: 45, explode: 1}, 0, 0, true); content.select('seal');
    assert.equal(serializeStage(stage), before); let stageDisposed = false;
    layout.records.values().next().value.root.children[0].geometry.addEventListener('dispose', () => {stageDisposed = true;});
    content.dispose(); assert.equal(stageDisposed, false);
    for (const [id, record] of layout.records) assert.deepEqual(record.root.children, originals.get(id));
    layout.dispose();
  }
});
test('世界坐标射线点选返回真实部件 ID，透明外壳优先命中内部部件', () => {
  const stage = createDefaultStage(), slot = stage.objects.find(object => object.type === 'slot'); slot.position = [4, 2, -3]; slot.rotationY = 35;
  const layout = new StageLayout(new THREE.Scene()); layout.build(stage); const content = new PumpContent(layout);
  content.update({ rotation: 24, explode: 1 }, 0, 0, true); layout.scene.updateMatrixWorld(true);
  const motor = content.model.partGroups.get('motor'), target = motor.getWorldPosition(new THREE.Vector3());
  const origin = target.clone().add(new THREE.Vector3(0, 3, 2));
  const ray = new THREE.Raycaster(origin, target.clone().sub(origin).normalize());
  assert.equal(content.pick(ray, 'solid'), 'motor');
  // Use a real leaf mesh ray through the now isolated inlet flange.
  const mesh = content.model.pickable.find(object => object.userData.partId === 'inlet');
  const target2 = mesh.getWorldPosition(new THREE.Vector3());
  const origin2 = target2.clone().add(new THREE.Vector3(0, 2, 0));
  assert.equal(content.pick(new THREE.Raycaster(origin2, target2.clone().sub(origin2).normalize()), 'transparent'), 'inlet');
  content.dispose(); layout.dispose();
});
test('展台绑定的海豚和流光在讲解页保持节目、参数和布置，部件交互不改动激光', async () => {
  const stage = JSON.parse(await readFile(new URL('../public/stages/exhibition-effects.json', import.meta.url))), before = serializeStage(stage);
  const layout = new StageLayout(new THREE.Scene()); layout.build(stage); const content = new PumpContent(layout);
  const assets = new Map();
  for (const id of stageEffectIds(stage)) {
    const catalog = JSON.parse(await readFile(new URL('../public/shows/catalog.json', import.meta.url))), entry = catalog.find(entry => entry.id === id);
    const bytes = await readFile(new URL(`../public/${entry.file}`, import.meta.url)); assets.set(id, parseProgram(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), entry));
  }
  syncConfiguredEffects(layout, assets, .1); content.update({rotation: 80, explode: 1}, 0, 0, true); content.select('impeller');
  for (const record of layout.records.values()) if (record.show) {
    assert.equal(record.show.asset, assets.get(record.element.program)); assert.equal(record.show.pointRate, record.element.pointRate);
    assert.equal(record.show.intensity, record.element.intensity); assert.equal(record.show.beamIntensity, record.element.beamIntensity);
  }
  assert.equal(serializeStage(stage), before); content.dispose(); layout.dispose();
});
test('缺插槽或屏幕时仍保留场景，明确说明缺项；仅释放业务自身资源', () => {
  const stage = { ...createDefaultStage(), objects: [createElement('platform', 'floor')] }, layout = new StageLayout(new THREE.Scene()); layout.build(stage);
  const content = new PumpContent(layout); assert.equal(content.model, null); assert.equal(content.warnings.length, 2);
  assert.equal(content.pick(new THREE.Raycaster()), null); content.dispose(); assert.equal(layout.records.size, 1); layout.dispose();
});
