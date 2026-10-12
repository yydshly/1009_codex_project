import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LaserShowPipeline } from '../vendor/three-ilda/src/webgl.js';
import { StageLayout } from './stage-layout.js';
import { stageFrame } from './stage-framing.js';
import { readStageSelection } from './stage-projects.js';
import { mountStagePicker } from './stage-picker.js';
import { StageProgramLibrary } from './stage-program-library.js';
import { stageEffectIds, syncConfiguredEffects } from './stage-effects.js';
import { PumpContent, PUMP_PARTS } from './pump-content.js';
import { PumpTourClock, PUMP_TOUR_CUES, PUMP_TOUR_DURATION, pumpTourPoseAt, formatPumpTourTime } from './pump-tour.js';
import { PumpNarration } from './pump-narration.js';
import './style.css';
import './launch.css';
import './stage-effects.css';
import './pump.css';
import './pump-tour.css';

const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const state = { ready: false, stage: null, selected: 'motor', explode: 0, rotation: 0, shell: 'solid', flow: false, auto: false, view: 'wide', effects: true };
const tour = { clock: new PumpTourClock(), engaged: false, cueId: '', completed: false, manual: false };
const narration = new PumpNarration({
  onAvailability: available => { $('pump-tour-voice').disabled = !available; if (!available) $('pump-tour-voice').checked = false; $('pump-voice-note').textContent = available ? '使用本机中文声音 · 可选' : '此浏览器无本机中文声音 · 屏幕讲解可用'; },
  onError: () => { narration.setEnabled(false); $('pump-tour-voice').checked = false; $('pump-voice-note').textContent = '声音未能播放 · 继续屏幕讲解'; },
});
const library = new StageProgramLibrary(new URL(import.meta.env.BASE_URL, document.baseURI));
const boards = new Map(), resources = new Set(), raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let renderer, scene, camera, controls, pipeline, layout, content, picker, resizeObserver, keyLight;
let catalog = [], assets = new Map(), generation = 0, time = 0, modelTime = 0, pointerDown, last = 0, lastUi = 0;
function status(message, error = false) { $('pump-status').textContent = message; $('pump-status').classList.toggle('error', error); }
function enable(ready) {
  state.ready = ready;
  document.querySelectorAll('.pump-controls button, .pump-controls input, [data-pump-mode], #pump-effects-toggle, [data-pump-view]').forEach(element => { element.disabled = !ready; });
  $('pump-slot').disabled = !ready || !content?.model;
  ['pump-tour-play', 'pump-tour-restart', 'pump-tour-seek'].forEach(id => { $(id).disabled = !ready || !content?.model; });
  document.querySelectorAll('[data-tour-cue]').forEach(button => { button.disabled = !ready || !content?.model; });
}
function makeScreenTexture(element) {
  const canvas = document.createElement('canvas'); canvas.width = 1024;
  canvas.height = Math.max(128, Math.min(1024, Math.round(1024 * element.size[1] / element.size[0])));
  const context = canvas.getContext('2d'); if (!context) throw new Error('屏幕讲解纹理创建失败');
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  boards.set(element.id, { canvas, context, texture }); return texture;
}
function wrapText(ctx, text, x, y, width, lineHeight, maxLines = 4) {
  let line = '', lines = 0;
  for (const char of text) {
    if (ctx.measureText(line + char).width > width && line) {
      ctx.fillText(line, x, y + lines * lineHeight); line = ''; lines++;
      if (lines >= maxLines - 1) { ctx.fillText('…', x, y + lines * lineHeight); return; }
    }
    line += char;
  }
  if (line) ctx.fillText(line, x, y + lines * lineHeight);
}
function refreshBoards() {
  const part = PUMP_PARTS.find(part => part.id === state.selected), index = PUMP_PARTS.indexOf(part) + 1;
  const cue = tour.engaged ? pumpTourPoseAt(tour.clock.time).cue : null;
  const mode = cue ? `自动讲解 / ${cue.step ? `部件 ${cue.step} / 6` : cue.short}` : state.flow ? '流向示意 / 进水 → 叶轮 → 上方出口' : state.explode > 0 ? '展开结构 / 六个部件各司其职' : '动力链 / 电机 → 联轴器 → 叶轮';
  const title = cue ? (cue.step ? `0${cue.step} · ${part.name}` : cue.title) : `0${index} · ${part.name}`, description = cue?.narration ?? part.description;
  $('pump-screen-title').textContent = title;
  $('pump-screen-body').textContent = description;
  $('pump-screen-status').textContent = boards.size ? `已同步 ${boards.size} 面舞台屏幕 · ${mode}` : '舞台无屏幕 · 此处保留完整讲解';
  for (const { canvas, context: ctx, texture } of boards.values()) {
    const { width: w, height: h } = canvas, font = Math.min(h * .045, 38);
    const gradient = ctx.createLinearGradient(0, 0, w, h); gradient.addColorStop(0, '#082c35'); gradient.addColorStop(1, '#163d31');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#40766a'; ctx.lineWidth = 3; ctx.strokeRect(w * .035, h * .04, w * .93, h * .92);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#72b9a4';
    ctx.font = `${Math.min(28, h * .035)}px "Microsoft YaHei", sans-serif`; ctx.fillText('FLOW—01 / PRODUCT STRUCTURE', w * .08, h * .16);
    ctx.font = `${Math.min(cue?.step === 0 ? 52 : 84, h * .12)}px "Microsoft YaHei", sans-serif`; ctx.fillStyle = '#bfdfcb'; ctx.fillText(title, w * .08, h * .35);
    ctx.font = `${font}px "Microsoft YaHei", sans-serif`; ctx.fillStyle = '#98c8b1'; wrapText(ctx, description, w * .08, h * .52, w * .84, font * 1.6);
    ctx.font = `${Math.min(25, h * .035)}px "Microsoft YaHei", sans-serif`; ctx.fillStyle = '#6fa891'; ctx.fillText(mode, w * .08, h * .87);
    texture.needsUpdate = true;
  }
}
function selectPart(id, fromModel = false, automatic = false) {
  const part = PUMP_PARTS.find(part => part.id === id); if (!part) return;
  state.selected = id; content?.select(id);
  document.querySelectorAll('[data-pump-part]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pumpPart === id)));
  $('pump-part-code').textContent = part.code; $('pump-part-name').textContent = part.name; $('pump-part-description').textContent = part.description;
  $('pump-overlay-title').textContent = part.name; $('pump-overlay-caption').textContent = fromModel ? '已从模型点选 · 讲解同步到屏幕' : '点击模型部件，或在右侧选择。';
  refreshBoards(); if (state.ready && !automatic) status(`已选择${part.name}；${boards.size ? `${boards.size} 面舞台屏幕同步讲解。` : '完整讲解显示在部件面板。'}`);
}
function syncControls() {
  $('pump-explode').value = Math.round(state.explode * 100); $('pump-explode-value').textContent = `${Math.round(state.explode * 100)}%`;
  $('pump-rotation').value = Math.round(state.rotation); $('pump-rotation-value').textContent = `${Math.round(state.rotation)}°`;
  $('pump-auto').setAttribute('aria-pressed', String(state.auto)); $('pump-auto').textContent = state.auto ? '停止自动旋转' : '自动旋转';
  $('pump-shell').setAttribute('aria-pressed', String(state.shell === 'transparent'));
  $('pump-effects-toggle').setAttribute('aria-pressed', String(state.effects)); $('pump-effects-toggle').textContent = state.effects ? 'Ⅱ 暂停激光效果' : '▶ 继续激光效果';
}
function setView(name) {
  if (!camera || !state.stage) return;
  state.view = name;
  const frame = stageFrame(state.stage), box = content?.bounds();
  let target = new THREE.Vector3(...frame.center), extent = frame.extent;
  if (name === 'product' && box) {
    target = box.getCenter(new THREE.Vector3());
    // Keep sufficient room for the fully exploded assembly, also before its transition finishes.
    extent = Math.max(1.2, content.productRoot.scale.x * 9.4);
  }
  const ratio = Math.max(1, 1 / camera.aspect);
  const offset = name === 'product' ? [-extent * .75, extent * .46, extent * 1.2] : [extent * .2, extent * .35, extent * .95];
  camera.position.copy(target).add(new THREE.Vector3(...offset).multiplyScalar(ratio)); controls.target.copy(target); controls.update();
  document.querySelectorAll('[data-pump-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pumpView === name)));
}
function syncTourUi() {
  const seconds = tour.clock.time, playing = tour.clock.playing, cue = pumpTourPoseAt(seconds).cue;
  $('pump-tour-play').textContent = playing ? 'Ⅱ 暂停自动讲解' : seconds >= PUMP_TOUR_DURATION ? '↺ 再看完整介绍' : seconds > 0 ? '▶ 继续自动讲解' : '▶ 开始自动讲解';
  $('pump-tour-play').setAttribute('aria-pressed', String(playing));
  $('pump-tour-time').textContent = `${formatPumpTourTime(seconds)} / 01:48`; $('pump-tour-seek').value = seconds;
  $('pump-tour-current').textContent = tour.engaged ? cue.title : '整机总览 → 六部件 → 流向总结';
  document.querySelectorAll('[data-tour-cue]').forEach(button => {
    if (tour.engaged && button.dataset.tourCue === cue.id) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
  });
}
function tourCamera(pose, dt = 0, snap = false) {
  if (!content?.model) return;
  const wide = pose.view === 'wide', box = pose.view === 'part' ? content.partBounds(pose.selected) : content.bounds();
  const frame = stageFrame(state.stage), target = wide ? new THREE.Vector3(...frame.center) : box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const extent = wide ? frame.extent : pose.view === 'part' ? Math.max(content.productRoot.scale.x * 4.5, size.length() * 2, .8) : Math.max(content.productRoot.scale.x * 9.4, 1.2);
  const offset = new THREE.Vector3(...(wide ? [extent * .2, extent * .35, extent * .95] : pose.view === 'part' ? [-extent * 1.15, extent * .46, extent * .72] : [-extent * .75, extent * .46, extent * 1.2]));
  // Follow the pump's shaft axis so thin rings and the impeller blades stay readable while rotating.
  if (pose.view === 'part') offset.applyQuaternion(content.productRoot.getWorldQuaternion(new THREE.Quaternion()));
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), pose.cameraAngle * Math.PI / 180).multiplyScalar(Math.max(1, 1 / camera.aspect));
  const goal = target.clone().add(offset), amount = snap || reducedMotion.matches ? 1 : 1 - Math.exp(-3 * dt);
  camera.position.lerp(goal, amount); controls.target.lerp(target, amount);
  state.view = wide ? 'wide' : 'product';
  document.querySelectorAll('[data-pump-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pumpView === state.view)));
}
function applyTour({ snap = false, dt = 0 } = {}) {
  if (!tour.engaged || !state.ready || !content?.model) return;
  const pose = pumpTourPoseAt(tour.clock.time);
  Object.assign(state, { selected: pose.selected, explode: pose.explode, rotation: pose.rotation, shell: pose.shell, flow: pose.flow, auto: false });
  if (pose.cue.id !== tour.cueId) {
    tour.cueId = pose.cue.id; selectPart(pose.selected, false, true);
    $('pump-overlay-title').textContent = pose.cue.title; $('pump-overlay-caption').textContent = pose.cue.narration;
    $('pump-tour-note').textContent = `${pose.cue.step ? `正在介绍部件 ${pose.cue.step} / 6` : pose.cue.short} · 旋转、结构和镜头跟随讲解；手动操作可转为自由观察`;
    if (tour.clock.playing) narration.speak(pose.cue.narration);
  }
  content.update(state, snap || !tour.clock.playing ? 0 : dt, pose.time, snap || reducedMotion.matches);
  scene.updateMatrixWorld(true); tourCamera(pose, tour.clock.playing ? dt : 0, snap);
  document.querySelectorAll('[data-pump-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pumpMode === (pose.flow ? 'flow' : pose.explode > .05 ? 'exploded' : 'assembled'))));
  if (pose.finished && !tour.completed) {
    tour.completed = true; narration.cancel();
    $('pump-tour-note').textContent = '完整介绍结束 · 六个部件已介绍完毕，可重播或自由探索';
    status('整机、六部件和流向讲解已播放完毕。可以重播，或点击模型继续探索。');
  }
}
function startTour(restart = false) {
  if (!state.ready || !content?.model) return;
  if (restart) tour.clock.seek(0);
  tour.engaged = true; tour.manual = false; tour.completed = false; tour.cueId = ''; state.auto = false;
  tour.clock.play(); applyTour({ snap: true }); syncControls(); syncTourUi();
  status('自动讲解已开始：按顺序介绍六个部件，旋转、展开、镜头与屏幕同步。');
}
function pauseTour(reason = '讲解已暂停 · 模型与镜头保持当前位置，点击继续即可接着看') {
  tour.clock.pause(); narration.cancel(); syncControls(); syncTourUi(); $('pump-tour-note').textContent = reason;
}
function interruptTour() {
  if (!tour.engaged) return;
  pauseTour('已转为手动探索 · 点击继续自动讲解可回到当前章节');
  tour.engaged = false; tour.cueId = ''; tour.manual = true; syncTourUi();
  selectPart(state.selected, false, true);
}
function seekTour(seconds) {
  if (!state.ready || !content?.model) return;
  narration.cancel(); tour.engaged = true; tour.manual = false; tour.completed = false; tour.cueId = '';
  tour.clock.seek(seconds); applyTour({ snap: true }); syncControls(); syncTourUi();
  if (!tour.clock.playing && seconds < PUMP_TOUR_DURATION) $('pump-tour-note').textContent = '已定位章节 · 点击继续自动讲解，或自由观察';
}
async function readLayout() {
  interruptTour(); tour.clock.seek(0); tour.completed = false; syncTourUi();
  $('pump-tour-note').textContent = '约 1 分 48 秒 · 自动旋转、展开与切换镜头 · 可暂停或手动探索';
  const request = ++generation; enable(false); $('pump-loading').hidden = false; $('pump-reload').disabled = true;
  $('pump-loading').textContent = '正在把 002 模型装入同一份舞台…';
  try {
    const saved = readStageSelection(localStorage); catalog = await library.catalog();
    const loaded = await library.load(stageEffectIds(saved.stage)); if (request !== generation) return;
    content?.dispose(); boards.clear(); assets = loaded; state.stage = saved.stage;
    layout.build(saved.stage); content = new PumpContent(layout, { makeScreenTexture }); time = 0;
    scene.background.set(saved.stage.theme === 'gallery' ? '#102a33' : '#030c16');
    const slotSelect = $('pump-slot'); slotSelect.replaceChildren();
    for (const record of layout.records.values()) if (record.element.type === 'slot') {
      const option = document.createElement('option'); option.value = record.element.id; option.textContent = `${record.element.name} · ${record.element.id}`; slotSelect.append(option);
    }
    slotSelect.value = content.slotId;
    $('pump-layout').textContent = `${saved.label} · ${layout.shows.length} 台激光 · ${boards.size} 面屏幕 · 模型来自 002`;
    const names = stageEffectIds(saved.stage).map(id => catalog.find(entry => entry.id === id)?.name ?? id);
    $('pump-effects').textContent = `沿用设备绑定效果：${names.join(' / ') || '无激光设备'}${saved.stage.effectMode === 'business' ? '（讲解业务直接使用设备绑定）' : ''}`;
    content.update(state, 0, time, true); selectPart(state.selected); positionLight(); setView(state.view); enable(true); $('pump-loading').hidden = true; syncControls(); syncTourUi();
    const warnings = [saved.warning, ...content.warnings].filter(Boolean);
    status(warnings.length ? warnings.join(' ') : '002 模型已接入；点击部件、展开结构或切换流向，舞台屏幕同步讲解。', Boolean(warnings.length));
  } catch (error) { $('pump-loading').textContent = `装配失败：${error.message}`; status(error.message, true); }
  finally { if (request === generation) $('pump-reload').disabled = false; }
}
function positionLight() {
  const target = content?.bounds()?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3();
  keyLight.position.copy(target).add(new THREE.Vector3(-4, 7, 6)); keyLight.target.position.copy(target);
}
function mode(name) {
  state.explode = name === 'exploded' ? 1 : 0; state.shell = name === 'flow' ? 'transparent' : 'solid'; state.flow = name === 'flow'; state.auto = false;
  document.querySelectorAll('[data-pump-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pumpMode === name)));
  selectPart(name === 'flow' ? 'impeller' : name === 'exploded' ? 'casing' : 'motor'); syncControls();
  if (name !== 'assembled') setView('product');
}
function clearMode() { document.querySelectorAll('[data-pump-mode]').forEach(button => button.setAttribute('aria-pressed', 'false')); }
function bind() {
  for (const cue of PUMP_TOUR_CUES) {
    const button = document.createElement('button'), stamp = document.createElement('small'); button.type = 'button'; button.dataset.tourCue = cue.id; button.disabled = true;
    stamp.textContent = formatPumpTourTime(cue.start); button.append(stamp, cue.short);
    button.addEventListener('click', () => seekTour(cue.start)); $('pump-tour-chapters').append(button);
  }
  $('pump-tour-play').addEventListener('click', () => { tour.clock.playing ? pauseTour() : startTour(); });
  $('pump-tour-restart').addEventListener('click', () => startTour(true));
  $('pump-tour-seek').addEventListener('input', () => seekTour(Number($('pump-tour-seek').value)));
  $('pump-tour-voice').addEventListener('change', () => {
    narration.setEnabled($('pump-tour-voice').checked);
    if (tour.engaged && tour.clock.playing) narration.speak(pumpTourPoseAt(tour.clock.time).cue.narration);
  });
  for (const [index, part] of PUMP_PARTS.entries()) {
    const button = document.createElement('button'), number = document.createElement('small'); button.type = 'button'; button.dataset.pumpPart = part.id;
    number.textContent = `0${index + 1}`; button.append(number, part.name); button.setAttribute('aria-pressed', String(part.id === state.selected));
    button.addEventListener('click', () => { interruptTour(); selectPart(part.id); }); $('pump-parts').append(button);
  }
  selectPart(state.selected);
  $('pump-reload').addEventListener('click', readLayout);
  document.querySelectorAll('[data-pump-view]').forEach(button => button.addEventListener('click', () => { interruptTour(); setView(button.dataset.pumpView); }));
  document.querySelectorAll('[data-pump-mode]').forEach(button => button.addEventListener('click', () => { interruptTour(); mode(button.dataset.pumpMode); }));
  $('pump-explode').addEventListener('input', () => { interruptTour(); state.explode = Number($('pump-explode').value) / 100; state.flow = false; clearMode(); syncControls(); refreshBoards(); });
  $('pump-rotation').addEventListener('input', () => { interruptTour(); state.rotation = Number($('pump-rotation').value); state.auto = false; syncControls(); });
  $('pump-auto').addEventListener('click', () => { interruptTour(); state.auto = !state.auto; syncControls(); });
  $('pump-shell').addEventListener('click', () => { interruptTour(); state.shell = state.shell === 'solid' ? 'transparent' : 'solid'; clearMode(); syncControls(); });
  $('pump-reset').addEventListener('click', () => { interruptTour(); state.rotation = 0; mode('assembled'); setView('wide'); });
  $('pump-effects-toggle').addEventListener('click', () => { state.effects = !state.effects; syncControls(); });
  $('pump-slot').addEventListener('change', () => {
    interruptTour();
    const slotId = $('pump-slot').value; content.dispose(); boards.clear(); content = new PumpContent(layout, { makeScreenTexture, slotId });
    content.update(state, 0, time, true); selectPart(state.selected); positionLight(); setView(state.view);
  });
  $('pump-fullscreen').addEventListener('click', async () => {
    try { document.fullscreenElement ? await document.exitFullscreen() : await $('pump-viewport').requestFullscreen(); }
    catch (error) { status(`全屏未开启：${error.message}`, true); }
  });
  const canvas = $('pump-view');
  canvas.addEventListener('pointerdown', event => { if (event.button === 0) pointerDown = { x: event.clientX, y: event.clientY, id: event.pointerId }; });
  canvas.addEventListener('pointercancel', () => { pointerDown = null; });
  canvas.addEventListener('pointerup', event => {
    const start = pointerDown; pointerDown = null;
    if (!state.ready || !start || event.pointerId !== start.id || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
    const rect = canvas.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    scene.updateMatrixWorld(true); raycaster.setFromCamera(pointer, camera); const id = content.pick(raycaster, state.shell); if (id) { interruptTour(); selectPart(id, true); }
  });
}
async function init() {
  bind(); enable(false);
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('pump-view'), antialias: false });
    if (!renderer.extensions.has('EXT_color_buffer_float') && !renderer.extensions.has('EXT_color_buffer_half_float')) throw new Error('需要支持浮点颜色缓冲的 WebGL 2 浏览器');
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
    renderer.debug.onShaderError = () => { enable(false); status('着色器编译失败，请检查 GPU 支持。', true); };
    scene = new THREE.Scene(); scene.background = new THREE.Color('#030c16'); camera = new THREE.PerspectiveCamera(45, 1, .03, 200);
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = .8; controls.maxDistance = 110; controls.maxPolarAngle = Math.PI * .49;
    controls.addEventListener('start', interruptTour);
    scene.add(new THREE.AmbientLight('#bfdbe2', 1.5)); keyLight = new THREE.DirectionalLight('#ecf8f0', 3.2); scene.add(keyLight, keyLight.target);
    const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment(), environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture; scene.environmentIntensity = .8; resources.add(environment); room.dispose(); pmrem.dispose();
    const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 96), new THREE.MeshBasicMaterial({ color: '#07121a' }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.06; scene.add(ground); resources.add(ground.geometry); resources.add(ground.material);
    pipeline = new LaserShowPipeline(renderer, scene, camera, { samples: 0, strength: 2.4, threshold: .72 }); layout = new StageLayout(scene, pipeline, { showSlots: false });
    const resize = () => {
      const host = $('pump-viewport'), width = host.clientWidth, height = host.clientHeight; renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(width, height, false); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix();
      if (state.ready) { if (tour.engaged) tourCamera(pumpTourPoseAt(tour.clock.time), 0, true); else setView(state.view); }
    };
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe($('pump-viewport')); resize();
    await readLayout(); picker = mountStagePicker($('pump-stage-select'), readLayout, error => status(error.message, true));
    let frames = 0, fpsAt = performance.now();
    renderer.setAnimationLoop(now => {
      const dt = Math.max(0, Math.min(.05, (now - (last || now)) / 1000)); last = now;
      if (!state.ready || document.hidden) return;
      if (state.effects) time += dt;
      if (tour.engaged) applyTour({ dt });
      else {
        modelTime += dt;
        if (state.auto) state.rotation = ((state.rotation + dt * 14 + 180) % 360) - 180;
        content.update(state, dt, modelTime, reducedMotion.matches);
      }
      syncConfiguredEffects(layout, assets, time, catalog); controls.update(); pipeline.render(); frames++;
      if (now - lastUi > 100) { if (state.auto || tour.engaged) syncControls(); syncTourUi(); lastUi = now; }
      if (now - fpsAt > 1000) { $('pump-frame-note').textContent = `${Math.round(frames * 1000 / (now - fpsAt))} fps · 点击部件`; frames = 0; fpsAt = now; }
    });
    if (new URL(location.href).searchParams.get('tour') === '1') startTour(true);
  } catch (error) { $('pump-loading').hidden = false; $('pump-loading').textContent = `三维展台未就绪：${error.message}。部件文字仍可阅读。`; status(error.message, true); }
}
window.addEventListener('pagehide', () => {
  tour.clock.pause(); narration.dispose();
  generation++; picker?.dispose(); renderer?.setAnimationLoop(null); resizeObserver?.disconnect(); content?.dispose(); layout?.dispose();
  pipeline?.dispose(); controls?.dispose(); resources.forEach(resource => resource.dispose()); renderer?.dispose();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && tour.clock.playing) pauseTour('页面进入后台，自动讲解已暂停 · 返回后点击继续，接着介绍当前部件');
});
init();
