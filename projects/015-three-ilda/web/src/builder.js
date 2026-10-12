import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { LaserShowPipeline } from '../vendor/three-ilda/src/webgl.js';
import { StageProgramLibrary } from './stage-program-library.js';
import { assignStageEffect } from './stage-effects.js';
import { renderEffectCards } from './effect-cards.js';
import { filterEffects } from './effect-filter.js';
import { StageEditHistory } from './stage-edit-history.js';
import { StageLayout } from './stage-layout.js';
import { createDefaultStage, createElement, ELEMENT_TYPES, MAX_ELEMENTS, serializeStage, validateStage } from './stage-definition.js';
import { STAGE_LIBRARY_KEY, readStageLibrary, readStageSelection, resolveReference, selectStageReference, saveStageProject } from './stage-projects.js';
import { renderTemplateCards } from './template-cards.js';
import { stageFrame } from './stage-framing.js';
import './stage-library.css';
import './style.css';
import './builder.css';
import './stage-effects.css';

const $ = id => document.getElementById(id);
const base = new URL(import.meta.env.BASE_URL, document.baseURI);
const state = { stage: createDefaultStage(), selected: '', playing: false, guides: true, errors: [], ready: false, busy: false, projectId: '', templateId: null, revision: 0, dirty: false, conflict: false };
const programLibrary = new StageProgramLibrary(base), resources = new Set();
const history = new StageEditHistory();
let renderer, scene, camera, controls, transform, layout, pipeline, resizeObserver, catalog = [];
let pendingLoads = 0, lastTick = 0, pointerStart, effectRequest = 0, dragGroup = null, interaction = 0;
const status = (message, error = false) => { $('builder-status').textContent = message; $('builder-status').classList.toggle('error', error); };
const selected = () => state.stage.objects.find(element => element.id === state.selected);
const dirty = (group = null) => {
  history.record(state.stage, state.selected, { group }); state.dirty = history.isDirty(state.stage);
  renderProjects(); renderHistory();
  status(state.dirty ? '有未保存修改。可撤销调整，保存后两种业务读取新配置。' : '已回到保存的布置。');
};
function renderHistory() {
  $('builder-undo').disabled = !state.ready || state.busy || !history.canUndo;
  $('builder-redo').disabled = !state.ready || state.busy || !history.canRedo;
}
function setBusy(value) {
  state.busy = value;
  for (const id of ['builder-name', 'builder-theme', 'builder-save-as', 'builder-export', 'builder-import', 'builder-reset', 'builder-guides', 'builder-project-refresh', 'builder-project-fork']) $(id).disabled = !state.ready || value;
  $('builder-properties').querySelectorAll('input,select,button').forEach(input => { input.disabled = !state.ready || value || (input.id === 'element-depth' && selected()?.type === 'laser'); });
  document.querySelector('.stage-effect-panel').setAttribute('aria-busy', String(value));
  renderProjects(); renderList(); renderHistory(); updatePreviewButton();
}

function renderProjects() {
  const select = $('builder-project'); select.replaceChildren();
  const draft = document.createElement('option'); draft.value = ''; draft.textContent = '模板草稿 / 未保存'; select.append(draft);
  state.conflict = false; $('builder-project-update').hidden = true;
  try {
    for (const project of readStageLibrary(localStorage).projects) {
      const current = project.id === state.projectId, stale = current && project.revision !== state.revision;
      const option = document.createElement('option'); option.value = project.id;
      option.textContent = current ? `${state.stage.name} · v${state.revision}${stale ? `（已有 v${project.revision}）` : ''}` : `${project.stage.name} · v${project.revision}`; select.append(option);
      if (stale) {
        state.conflict = true; $('builder-project-update').hidden = false;
        $('builder-project-update-message').textContent = `此项目已在其他页面更新到 v${project.revision}，当前画布仍为 v${state.revision}。可读取最新版本，或另存当前修改。`;
      }
    }
  } catch (error) { status(`方案库读取失败：${error.message}；仍可导出当前配置。`, true); }
  select.value = state.projectId; select.disabled = !state.ready || state.busy;
  $('builder-project-status').textContent = `${state.projectId ? `独立项目 · v${state.revision}` : '模板草稿'}${state.dirty ? ' · 有未保存修改' : state.projectId ? ' · 已保存' : ''}`;
  $('builder-save').textContent = state.projectId ? '保存项目' : '创建项目';
  $('builder-save').disabled = !state.ready || state.busy || state.conflict || (Boolean(state.projectId) && !state.dirty);
  document.querySelectorAll('[data-template]').forEach(button => {
    button.disabled = !state.ready || state.busy; button.setAttribute('aria-pressed',String(button.dataset.template === state.templateId));
  });
}
const canSwitch = () => !state.dirty || window.confirm('当前布置有未保存修改。切换会放弃这些修改，是否继续？');
async function openSelection(selection, { keepHistory = false, selectedId = '' } = {}) {
  setBusy(true);
  try {
  state.projectId = selection.projectId; state.templateId = selection.templateId; state.revision = selection.revision; state.dirty = false;
  await applyStage(selection.stage);
  if (selectedId && state.stage.objects.some(object => object.id === selectedId)) select(selectedId, false);
  if (keepHistory) { history.record(state.stage, state.selected); history.markSaved(state.stage); }
  else history.reset(state.stage, state.selected);
  setView('perspective'); renderProjects();
  } finally { setBusy(false); }
}
async function useTemplate(id) {
  if (!canSwitch()) return;
  try {
    const selection = selectStageReference(localStorage,`template:${id}`); await openSelection(selection);
    status(`已载入「${selection.stage.name}」模板。修改后另存项目，模板保持原样。`);
  } catch (error) { status(`模板读取失败：${error.message}`,true); }
}
async function saveProject(asNew) {
  if (!state.ready || state.busy) return;
  try {
    // 保存也提交仍在属性输入框中的值，避免依赖失焦事件。
    if (!commitProperties() || !commitName()) return;
    renderProjects(); if (!asNew && state.conflict) { status('此项目已有新版本。请读取最新版本，或另存当前修改。', true); return; }
    if (!asNew && state.projectId && !state.dirty) { status('当前项目已经保存。'); return; }
    const selection = saveStageProject(localStorage,state.stage,{projectId:asNew ? '' : state.projectId,templateId:state.templateId,expectedRevision:state.revision});
    await openSelection(selection, { keepHistory: true, selectedId: state.selected });
    status(`${asNew ? '已另存独立项目' : '项目已保存'}：「${selection.stage.name}」· v${selection.revision}。音乐演出与产品发布会同步使用此项目。`);
  } catch (error) { renderProjects(); status(`保存失败：${error.message}；仍可导出 JSON。`,true); }
}

async function restoreHistory(direction) {
  if (!state.ready || state.busy) return;
  const snapshot = history[direction](); if (!snapshot) return;
  setBusy(true);
  try {
    await applyStage(snapshot.stage);
    select(state.stage.objects.some(object => object.id === snapshot.selected) ? snapshot.selected : state.stage.objects[0]?.id ?? '', false);
    state.dirty = history.isDirty(state.stage);
    status(`${direction === 'undo' ? '已撤销上一步' : '已重做'}。${state.dirty ? '保存后更新业务页面。' : '已回到保存的布置。'}`);
  } finally { setBusy(false); }
}
function commitName(group = null) {
  try {
    const next = validateStage({ ...state.stage, name: $('builder-name').value });
    if (next.name !== state.stage.name) { state.stage = next; dirty(group); }
    return true;
  } catch (error) { status(error.message, true); return false; }
}

function setTheme() {
  scene.background = new THREE.Color(state.stage.theme === 'gallery' ? '#102a33' : '#030912');
}
function setView(name) {
  const frame = stageFrame(state.stage), n = frame.extent;
  const positions = { perspective: [n*.72, n*.48, n*1.05], front: [0,n*.2,n*1.4], top: [0,n*1.6,.01] };
  controls.target.set(...frame.center); camera.position.copy(controls.target).add(new THREE.Vector3(...positions[name])); controls.update();
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === name)));
}
function renderList() {
  $('builder-objects').replaceChildren();
  for (const element of state.stage.objects) {
    const button = document.createElement('button'), name = document.createElement('span'), type = document.createElement('small');
    button.type = 'button'; button.dataset.element = element.id; name.textContent = element.name; type.textContent = ELEMENT_TYPES[element.type];
    button.append(name, type); button.disabled = !state.ready || state.busy; button.setAttribute('aria-pressed', String(element.id === state.selected));
    button.addEventListener('click', () => select(element.id)); $('builder-objects').append(button);
  }
  $('builder-count').textContent = `${state.stage.objects.length} / ${MAX_ELEMENTS}`;
  document.querySelectorAll('[data-add]').forEach(button => { button.disabled = !state.ready || state.busy || state.stage.objects.length >= MAX_ELEMENTS; });
  renderEffectBindings();
}
function renderEffectBindings() {
  const target = $('builder-effect-target'), previous = target.value;
  target.replaceChildren(new Option('全部激光设备', 'all'));
  const devices = state.stage.objects.filter(object => object.type === 'laser');
  for (const device of devices) target.append(new Option(device.name, device.id));
  target.value = devices.some(device => device.id === previous) ? previous : 'all';
  $('builder-effect-mode').value = state.stage.effectMode ?? 'business';
  $('builder-effect-help').textContent = state.stage.effectMode === 'stage'
    ? '当前业务沿用设备绑定的效果、点率与亮度。修改后保存，两个业务页面即可更新。'
    : '当前业务使用各自的光效编排。搭建器仍预览设备绑定的素材；点击效果会切换为「沿用展台效果」。';
  $('builder-effect-bindings').replaceChildren();
  for (const device of devices) {
    const entry = catalog.find(entry => entry.id === device.program), button = document.createElement('button');
    button.type = 'button'; button.dataset.effectDevice = device.id; button.disabled = !state.ready || state.busy; button.textContent = `${device.name} · ${entry?.name ?? device.program}`;
    button.setAttribute('aria-pressed', String(target.value === device.id));
    button.addEventListener('click', () => { target.value = device.id; select(device.id); }); $('builder-effect-bindings').append(button);
  }
  const programs = devices.filter(device => target.value === 'all' || device.id === target.value).map(device => device.program);
  document.querySelectorAll('[data-effect]').forEach(button => { button.disabled = !state.ready || state.busy || !devices.length; button.setAttribute('aria-pressed', String(programs.length > 0 && programs.every(id => id === button.dataset.effect))); });
  $('builder-effect-mode').disabled = !state.ready || state.busy;
  target.disabled = !state.ready || state.busy || !devices.length;
}
function filterEffectCards() {
  const visible = new Set(filterEffects(catalog, $('builder-effect-search').value, $('builder-effect-origin').value).map(entry => entry.id));
  document.querySelectorAll('[data-effect]').forEach(button => { button.hidden = !visible.has(button.dataset.effect); });
  $('builder-effect-count').textContent = `显示 ${visible.size} / ${catalog.length} 个效果`;
  $('builder-effect-empty').hidden = visible.size > 0;
}
async function applyEffect(id) {
  if (!state.ready || state.busy) return;
  const request = ++effectRequest, original = state.stage, target = $('builder-effect-target').value;
  setBusy(true);
  try {
    status('正在载入效果…'); const asset = await getAsset(id);
    if (request !== effectRequest || original !== state.stage) return;
    const next = assignStageEffect(state.stage, id, target), entry = catalog.find(entry => entry.id === id);
    state.stage = next; transform.detach();
    for (const device of next.objects.filter(object => object.type === 'laser' && (target === 'all' || object.id === target))) {
      layout.add(device); layout.setProgram(device.id, asset, entry.track);
    }
    select(state.selected, false); dirty(); state.playing = true; updatePreviewButton();
    status(`已将「${entry.name}」接入${target === 'all' ? '全部激光设备' : next.objects.find(object => object.id === target).name}。保存或另存后，音乐与发布会沿用这些效果。`);
  } catch (error) { if (request === effectRequest) status(error.message, true); }
  finally { setBusy(false); }
}
function select(id, remember = true) {
  state.selected = id;
  if (remember) history.select(id);
  const element = selected(); transform.detach();
  $('builder-properties').hidden = !element; $('builder-empty').hidden = Boolean(element);
  if (element) {
    const root = layout.records.get(id)?.root;
    if (root && state.guides) transform.attach(root);
    $('builder-type').textContent = ELEMENT_TYPES[element.type]; $('element-name').value = element.name;
    ['x', 'y', 'z'].forEach((axis, i) => { $(`element-${axis}`).value = element.position[i]; });
    ['width', 'height', 'depth'].forEach((axis, i) => { $(`element-${axis}`).value = element.size[i]; });
    $('element-rotation').value = element.rotationY; $('element-color').value = element.color;
    $('builder-size-label').textContent = element.type === 'laser' ? '投影面尺寸' : '尺寸';
    $('element-depth').disabled = element.type === 'laser';
    $('builder-shape-row').hidden = element.type !== 'platform';
    if (element.type === 'platform') $('element-shape').value = element.shape;
    $('builder-laser-fields').hidden = element.type !== 'laser';
    $('builder-slot-note').hidden = element.type !== 'slot';
    if (element.type === 'laser') {
      $('element-program').value = element.program;
      ['x', 'y', 'z'].forEach((axis, i) => { $(`element-aperture-${axis}`).value = element.aperture[i]; });
      $('element-rate').value = element.pointRate; $('element-intensity').value = element.intensity; $('element-beam').value = element.beamIntensity;
    }
  }
  renderList();
}
const getAsset = id => programLibrary.get(id);
function updatePreviewButton() {
  $('builder-preview').disabled = !state.ready || state.busy || pendingLoads > 0 || !layout?.shows.length;
  $('builder-preview').textContent = state.playing ? 'Ⅱ 暂停光效' : '▶ 预览光效';
}
async function loadProgram(record) {
  if (!record.show) return;
  pendingLoads++; updatePreviewButton();
  try {
    const asset = await getAsset(record.element.program);
    // 导入、删除和连续改节目时，不让过期请求覆盖新的构件。
    if (layout.records.get(record.element.id) === record) layout.setProgram(record.element.id, asset, catalog.find(entry => entry.id === record.element.program)?.track);
  } catch (error) {
    if (layout.records.get(record.element.id) === record) { state.errors.push(error.message); status(error.message, true); }
  } finally { pendingLoads--; updatePreviewButton(); }
}
async function applyStage(definition) {
  const stage = validateStage(definition);
  transform.detach(); state.playing = false; state.stage = stage;
  layout.build(stage); setTheme();
  $('builder-name').value = stage.name; $('builder-theme').value = stage.theme;
  select(stage.objects[0]?.id ?? '', false);
  await Promise.all([...layout.records.values()].map(record => loadProgram(record)));
  updatePreviewButton();
}
function commitProperties(group = null) {
  const element = selected(); if (!element) return true;
  const candidate = structuredClone(element);
  candidate.name = $('element-name').value;
  candidate.position = ['x', 'y', 'z'].map(axis => $(`element-${axis}`).valueAsNumber);
  candidate.size = ['width', 'height', 'depth'].map(axis => $(`element-${axis}`).valueAsNumber);
  candidate.rotationY = $('element-rotation').valueAsNumber; candidate.color = $('element-color').value;
  if (candidate.type === 'platform') candidate.shape = $('element-shape').value;
  if (candidate.type === 'laser') {
    candidate.program = $('element-program').value;
    candidate.aperture = ['x', 'y', 'z'].map(axis => $(`element-aperture-${axis}`).valueAsNumber);
    candidate.pointRate = $('element-rate').valueAsNumber; candidate.intensity = $('element-intensity').valueAsNumber; candidate.beamIntensity = $('element-beam').valueAsNumber;
  }
  try {
    const next = validateStage({ ...state.stage, ...(candidate.type === 'laser' && candidate.program !== element.program ? { effectMode: 'stage' } : {}), objects: state.stage.objects.map(object => object.id === candidate.id ? candidate : object) });
    if (serializeStage(next) === serializeStage(state.stage)) return true;
    transform.detach(); state.stage = next;
    const record = layout.add(next.objects.find(object => object.id === candidate.id));
    select(candidate.id, false); dirty(group); loadProgram(record); return true;
  } catch (error) { status(error.message, true); select(element.id); return false; }
}
function bind() {
  $('builder-effect-search').addEventListener('input', filterEffectCards);
  $('builder-effect-origin').addEventListener('change', filterEffectCards);
  $('builder-undo').addEventListener('click', () => restoreHistory('undo'));
  $('builder-redo').addEventListener('click', () => restoreHistory('redo'));
  $('builder-project-fork').addEventListener('click', () => saveProject(true));
  $('builder-project-refresh').addEventListener('click', async () => {
    if (!canSwitch()) return;
    try {
      const selection = resolveReference(readStageLibrary(localStorage), `project:${state.projectId}`);
      await openSelection(selection); status(`已读取最新项目：${selection.stage.name} · v${selection.revision}。`);
    } catch (error) { status(error.message, true); }
  });
  $('builder-effect-mode').addEventListener('change', () => { state.stage = validateStage({ ...state.stage, effectMode: $('builder-effect-mode').value }); dirty(); renderEffectBindings(); });
  $('builder-effect-target').addEventListener('change', renderEffectBindings);
  $('builder-properties').addEventListener('submit', event => event.preventDefault());
  $('builder-properties').addEventListener('change', event => commitProperties(`property:${state.selected}:${event.target.id}`));
  $('builder-properties').addEventListener('input', event => {
    if (['number','color'].includes(event.target.type) && event.target.value !== '' && event.target.validity.valid) commitProperties(`property:${state.selected}:${event.target.id}`);
  });
  $('builder-properties').addEventListener('focusout', () => history.endGroup());
  $('builder-name').addEventListener('input', () => { if ($('builder-name').value.trim()) commitName('stage-name'); });
  $('builder-name').addEventListener('change', () => { if (!commitName('stage-name')) $('builder-name').value = state.stage.name; history.endGroup(); });
  $('builder-theme').addEventListener('change', () => { state.stage.theme = $('builder-theme').value; setTheme(); dirty(); });
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => {
    if (state.stage.objects.length >= MAX_ELEMENTS) return;
    const element = createElement(button.dataset.add, `element-${crypto.randomUUID()}`);
    state.stage.objects.push(element); const record = layout.add(element); select(element.id, false); dirty(); loadProgram(record); updatePreviewButton();
  }));
  $('builder-remove').addEventListener('click', () => {
    if (!selected()) return;
    transform.detach(); layout.remove(state.selected); state.stage.objects = state.stage.objects.filter(element => element.id !== state.selected);
    select(state.stage.objects[0]?.id ?? '', false); dirty(); updatePreviewButton();
  });
  $('builder-reset').addEventListener('click', async () => {
    setBusy(true); try { await applyStage(createDefaultStage()); dirty(); } finally { setBusy(false); }
  });
  $('builder-save').addEventListener('click', () => saveProject(false));
  $('builder-save-as').addEventListener('click', () => saveProject(true));
  $('builder-project').addEventListener('change', async () => {
    const id = $('builder-project').value; if (!id || !canSwitch()) { renderProjects(); return; }
    try { const selection = selectStageReference(localStorage,`project:${id}`); await openSelection(selection); status(`已打开${selection.label}。修改后可保存或另存独立项目。`); }
    catch (error) { renderProjects(); status(error.message,true); }
  });
  $('builder-export').addEventListener('click', () => {
    if (!commitProperties() || !commitName()) return;
    const url = URL.createObjectURL(new Blob([serializeStage(state.stage)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'virtual-stage.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); status('已导出舞台配置；节目内容仍由素材库提供。');
  });
  $('builder-import').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 256 * 1024) throw new Error('配置文件超过 256 KiB');
      const definition = validateStage(JSON.parse(await file.text()));
      const missing = definition.objects.filter(object => object.type === 'laser' && !catalog.some(entry => entry.id === object.program));
      if (missing.length) throw new Error(`缺少节目素材：${missing.map(object => object.program).join('、')}`);
      await Promise.all([...new Set(definition.objects.filter(object => object.type === 'laser').map(object => object.program))].map(getAsset));
      if (!canSwitch()) return;
      setBusy(true);
      state.projectId = ''; state.templateId = null; state.revision = 0;
      await applyStage(definition); history.reset(state.stage, state.selected); history.markUnsaved(); dirty(); status('配置已导入为新草稿，保存为项目后，两种业务即可读取。');
    } catch (error) { status(`导入失败：${error.message}`, true); }
    finally { event.target.value = ''; setBusy(false); }
  });
  $('builder-preview').addEventListener('click', () => { state.playing = !state.playing; updatePreviewButton(); status(state.playing ? '正在预览各设备的展台效果；保存后两种业务可沿用。' : '光效预览已暂停。'); });
  $('builder-guides').addEventListener('click', () => {
    state.guides = !state.guides; $('builder-guides').textContent = state.guides ? '坐标轴开启' : '坐标轴关闭';
    $('builder-guides').setAttribute('aria-pressed', String(state.guides)); select(state.selected);
  });
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  transform.addEventListener('dragging-changed', event => {
    controls.enabled = !event.value;
    if (event.value) dragGroup = `drag:${++interaction}`;
    else { history.endGroup(); select(state.selected); dragGroup = null; }
  });
  transform.addEventListener('objectChange', () => {
    const element = selected(); if (!element) return;
    element.position = transform.object.position.toArray().map(value => Math.round(value * 100) / 100);
    ['x', 'y', 'z'].forEach((axis, i) => { $(`element-${axis}`).value = element.position[i]; }); dirty(dragGroup);
  });
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  renderer.domElement.addEventListener('pointerdown', event => { pointerStart = [event.clientX, event.clientY]; });
  renderer.domElement.addEventListener('pointerup', event => {
    if (state.busy) return;
    if (!pointerStart || Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 4 || transform.axis || transform.dragging) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera); scene.updateMatrixWorld(true);
    const hits = raycaster.intersectObjects([...layout.records.values()].map(record => record.root), true);
    for (const hit of hits) {
      let object = hit.object;
      while (object && !object.userData.elementId) object = object.parent;
      if (object) { select(object.userData.elementId); return; }
    }
  });
  window.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || !state.ready || state.busy) return;
    const key = event.key.toLowerCase();
    if (key === 's') { event.preventDefault(); saveProject(event.shiftKey); return; }
    if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (key === 'z' || key === 'y') { event.preventDefault(); restoreHistory(key === 'y' || event.shiftKey ? 'redo' : 'undo'); }
  });
  window.addEventListener('beforeunload', event => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });
}
async function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('builder-view'), antialias: false });
    if (!renderer.extensions.has('EXT_color_buffer_float') && !renderer.extensions.has('EXT_color_buffer_half_float')) throw new Error('光效预览需要支持浮点颜色缓冲的 WebGL 2 浏览器');
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
    renderer.debug.onShaderError = () => { state.playing = false; updatePreviewButton(); status('光效着色器编译失败，请检查 GPU 支持。', true); };
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(48, 1, .1, 150);
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = 3; controls.maxDistance = 75; controls.maxPolarAngle = Math.PI * .49;
    transform = new TransformControls(camera, renderer.domElement); transform.setMode('translate'); transform.setTranslationSnap(.1);
    transform.minX = -30; transform.maxX = 30; transform.minY = 0; transform.maxY = 20; transform.minZ = -30; transform.maxZ = 30;
    scene.add(transform.getHelper());
    const grid = new THREE.GridHelper(60, 60, '#294b62', '#112637'); grid.position.y = -.01; scene.add(grid);
    resources.add(grid.geometry); (Array.isArray(grid.material) ? grid.material : [grid.material]).forEach(material => resources.add(material));
    pipeline = new LaserShowPipeline(renderer, scene, camera, { samples: 0, strength: 3 }); layout = new StageLayout(scene, pipeline);
    catalog = await programLibrary.catalog();
    for (const entry of catalog) { const option = document.createElement('option'); option.value = entry.id; option.textContent = `${entry.name} · ${entry.origin === 'upstream' ? '上游' : '原创'}`; $('element-program').append(option); }
    const saved = readStageSelection(localStorage);
    renderTemplateCards($('stage-template-grid'),useTemplate);
    renderEffectCards($('builder-effect-grid'), catalog, applyEffect);
    filterEffectCards();
    bind(); await openSelection(saved);
    const resize = () => { const host = $('builder-viewport'), width = host.clientWidth, height = host.clientHeight; renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe($('builder-viewport')); resize();
    state.ready = true; $('builder-loading').hidden = true; setBusy(false);
    if (!state.errors.length) status(saved.warning || `已读取${saved.label}。选择模板或项目，修改后保存 / 另存。`, Boolean(saved.warning));
    window.addEventListener('storage', event => { if (event.key === STAGE_LIBRARY_KEY || event.key === null) renderProjects(); });
    renderer.setAnimationLoop(now => {
      const delta = lastTick ? Math.min(.05, (now - lastTick) / 1000) : 0; lastTick = now;
      layout.shows.forEach(show => { show.playing = state.playing && !document.hidden; show.update(delta); });
      controls.update(); pipeline.render();
    });
    window.stageBuilder = { state, layout, scene, camera, renderer, exportStage: () => serializeStage(state.stage), importStage: applyStage };
  } catch (error) { state.errors.push(error.message); $('builder-loading').textContent = `场景准备失败：${error.message}`; status(error.message, true); }
}
document.addEventListener('visibilitychange', () => { lastTick = 0; if (document.hidden) { state.playing = false; updatePreviewButton(); } });
window.addEventListener('pagehide', () => { renderer?.setAnimationLoop(null); resizeObserver?.disconnect(); transform?.dispose(); controls?.dispose(); layout?.dispose(); pipeline?.dispose(); resources.forEach(resource => resource.dispose()); renderer?.dispose(); });
init();
