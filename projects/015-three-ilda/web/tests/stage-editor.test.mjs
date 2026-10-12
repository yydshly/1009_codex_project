import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { StageEditHistory } from '../src/stage-edit-history.js';
import { filterEffects } from '../src/effect-filter.js';
import { createTemplateStage } from '../src/stage-templates.js';
import { assignStageEffect } from '../src/stage-effects.js';
import { saveStageProject, readStageLibrary, STAGE_LIBRARY_KEY } from '../src/stage-projects.js';

const catalog = JSON.parse(await readFile(new URL('../public/shows/catalog.json', import.meta.url), 'utf8'));
const storage = () => { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }; };

test('换效果、删除构件可撤销重做，恢复全部设备参数且副本互不影响', () => {
  const stage = createTemplateStage('exhibition'), history = new StageEditHistory();
  history.reset(stage, 'laser-2');
  const withEffect = assignStageEffect(stage, 'upstream-dolphin', 'laser-2');
  history.record(withEffect, 'laser-2');
  const removed = structuredClone(withEffect); removed.objects = removed.objects.filter(object => object.id !== 'laser-2');
  history.record(removed, 'hall-floor');
  const restored = history.undo(); assert.deepEqual(restored.stage, withEffect); assert.equal(restored.selected, 'laser-2');
  restored.stage.objects[0].position[0] = 20;
  assert.deepEqual(history.redo().stage, removed);
  assert.deepEqual(history.undo().stage, withEffect);
  const original = history.undo(); assert.deepEqual(original.stage, stage); assert.equal(history.isDirty(original.stage), false);
  assert.equal(history.canUndo, false); assert.equal(history.canRedo, true);
});

test('连续输入和一次拖动合并为一步，失焦后下次编辑独立，撤销后新编辑清除重做分支', () => {
  const history = new StageEditHistory(), stage = createTemplateStage('studio'); history.reset(stage);
  for (const x of [1, 2, 3]) { stage.objects[0].position[0] = x; history.record(stage, stage.objects[0].id, { group: 'position-x' }); }
  assert.equal(history.entries.length, 2);
  history.endGroup(); stage.objects[0].position[0] = 4; history.record(stage, stage.objects[0].id, { group: 'position-x' });
  assert.equal(history.undo().stage.objects[0].position[0], 3);
  const undo = history.undo(); assert.equal(undo.stage.objects[0].position[0], 0);
  undo.stage.name = '新方案'; history.record(undo.stage); assert.equal(history.canRedo, false);
  assert.equal(history.undo().stage.name, createTemplateStage('studio').name);
});

test('保存保留撤销历史，撤销和重做到保存点正确计算未保存状态，无变化不生成步骤', () => {
  const stage = createTemplateStage('runway'), history = new StageEditHistory(); history.reset(stage);
  assert.equal(history.record(stage), false);
  stage.name = '新秀场'; history.record(stage); history.markSaved(stage);
  assert.equal(history.isDirty(stage), false);
  const previous = history.undo(); assert.equal(history.isDirty(previous.stage), true);
  const saved = history.redo(); assert.equal(history.isDirty(saved.stage), false);
  history.markUnsaved(); assert.equal(history.isDirty(saved.stage), true);
});

test('历史有容量上限，非法配置不会破坏可撤销状态', () => {
  const history = new StageEditHistory(3), stage = createTemplateStage('studio'); history.reset(stage);
  for (let i = 1; i <= 10; i++) { stage.name = `方案 ${i}`; history.record(stage); }
  assert.equal(history.entries.length, 4);
  const before = structuredClone(history.entries); stage.objects[0].position[0] = NaN;
  assert.throws(() => history.record(stage)); assert.deepEqual(history.entries, before);
  assert.equal(history.undo().stage.name, '方案 9');
  assert.equal(history.undo().stage.name, '方案 8');
  assert.equal(history.undo().stage.name, '方案 7'); assert.equal(history.undo(), null);
});

test('22 个效果按来源和中英文名称筛选，支持大小写、全角字符及多词查询，保留目录顺序', () => {
  const before = JSON.stringify(catalog);
  assert.equal(filterEffects(catalog).length, 22);
  assert.equal(filterEffects(catalog, '', 'upstream').length, 18);
  assert.equal(filterEffects(catalog, '', 'original').length, 4);
  assert.deepEqual(filterEffects(catalog, ' ＤＯＬＰＨＩＮ ').map(entry => entry.id), ['upstream-dolphin']);
  assert.deepEqual(filterEffects(catalog, '光之花', 'original').map(entry => entry.id), ['light-flower']);
  assert.deepEqual(filterEffects(catalog, 'upstream dolphin').map(entry => entry.id), ['upstream-dolphin']);
  assert.equal(filterEffects(catalog, 'dolphin', 'original').length, 0);
  assert.equal(filterEffects(catalog, '<unknown>').length, 0); assert.equal(JSON.stringify(catalog), before);
});

test('旧编辑页保存时核对基准版本，拒绝覆盖最新项目，仍可另存完整草稿', () => {
  const s = storage(), stage = createTemplateStage('exhibition');
  const first = saveStageProject(s, stage, { id: 'project-original', now: 1 });
  const edited = assignStageEffect(first.stage, 'upstream-dolphin');
  const latest = saveStageProject(s, edited, { projectId: first.projectId, expectedRevision: 1, now: 2 });
  const before = s.getItem(STAGE_LIBRARY_KEY), stale = assignStageEffect(first.stage, 'upstream-plasma2');
  assert.throws(() => saveStageProject(s, stale, { projectId: first.projectId, expectedRevision: 1 }), /更新到 v2/);
  assert.equal(s.getItem(STAGE_LIBRARY_KEY), before);
  const fork = saveStageProject(s, stale, { id: 'project-fork', now: 3 });
  const library = readStageLibrary(s); assert.deepEqual(library.projects[0].stage, latest.stage);
  assert.equal(fork.stage.objects.find(object => object.type === 'laser').program, 'upstream-plasma2');
  assert.equal(fork.revision, 1); assert.equal(library.projects.length, 2);
  const updated = saveStageProject(s, stale, { projectId: first.projectId, expectedRevision: 2, now: 4 });
  assert.equal(updated.revision, 3);
});
