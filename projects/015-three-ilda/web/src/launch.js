import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LaserShowPipeline } from '../vendor/three-ilda/src/webgl.js';
import { StageLayout } from './stage-layout.js';
import { readStageSelection } from './stage-projects.js';
import { mountStagePicker } from './stage-picker.js';
import { stageFrame } from './stage-framing.js';
import { StageProgramLibrary } from './stage-program-library.js';
import { stageUsesEffects, stageEffectIds, syncConfiguredEffects, stageEffectSummary } from './stage-effects.js';
import { LaunchContent, PRODUCT_FINISHES } from './launch-content.js';
import { LaunchClock, LAUNCH_CUES, LAUNCH_DURATION, launchPoseAt, formatLaunchTime, syncLaunchShows } from './launch-plan.js';
import './style.css';
import './launch.css';
import './stage-effects.css';

const $ = id => document.getElementById(id), base = new URL(import.meta.env.BASE_URL, document.baseURI);
const state = { ready: false, finish: 'pearl', detail: null, view: 'wide', frames: 0, errors: [], name: 'AURA ONE', tagline: '让声音，成为空间的一部分。', stage: null };
const clock = new LaunchClock(), assets = new Map(), resources = new Set(), boards = new Map();
const programLibrary = new StageProgramLibrary(base);
let catalog = [];
let renderer, scene, camera, controls, pipeline, layout, content, resizeObserver, keyLight, fillLight, stagePicker;
let lastCue = '', lastUi = 0, revision = 0, lastPlaying = false;
const status = (message, error = false) => { $('launch-status').textContent = message; $('launch-status').classList.toggle('error', error); };
function setEnabled(ready) {
  state.ready = ready;
  ['launch-play', 'launch-restart', 'launch-seek', 'launch-detail', 'launch-detail-auto'].forEach(id => { $(id).disabled = !ready; });
  document.querySelectorAll('[data-launch-cue]').forEach(button => { button.disabled = !ready; });
}
function focus() {
  if (content?.productRoot) { const target = new THREE.Vector3(); content.productRoot.parent.getWorldPosition(target); target.y += content.productRoot.scale.y * 1.7; return target; }
  const platform = state.stage?.objects.find(object => object.type === 'platform');
  return new THREE.Vector3(...(platform?.position ?? [0, 0, 0])).add(new THREE.Vector3(0, 2, 0));
}
function setView(name) {
  state.view = name; const frame=stageFrame(state.stage), target = name === 'product' ? focus() : new THREE.Vector3(...frame.center);
  const extent = frame.extent;
  const offsets = { wide: [extent * .65, extent * .35, extent * 1.1], product: [4.8, 2.1, 7], top: [.01, Math.max(23, extent * 1.5), .01] };
  camera.position.copy(target).add(new THREE.Vector3(...offsets[name])); controls.target.copy(target); controls.update();
  document.querySelectorAll('[data-launch-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.launchView === name)));
}
function makeScreenTexture(element) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = Math.max(128, Math.min(1024, Math.round(1024 * element.size[1] / element.size[0])));
  const context = canvas.getContext('2d'); if (!context) throw new Error('无法生成发布会屏幕内容');
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  boards.set(element.id, { canvas, context, texture }); return texture;
}
function fitText(context, text, maxWidth, fontSize) {
  let size = fontSize;
  do { context.font = `500 ${size}px "Segoe UI", "Microsoft YaHei", sans-serif`; if (context.measureText(text).width <= maxWidth) break; size -= 2; } while (size > 12);
}
function refreshBoards(cue) {
  for (const { canvas, context: ctx, texture } of boards.values()) {
    const { width: w, height: h } = canvas;
    const gradient = ctx.createLinearGradient(0, 0, w, h); gradient.addColorStop(0, '#091e28'); gradient.addColorStop(1, state.finish === 'mist' ? '#153f52' : '#123b38');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#47695f'; ctx.lineWidth = 2; ctx.strokeRect(w * .035, h * .06, w * .93, h * .88);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#81a79a';
    fitText(ctx, 'AURA STUDIO / CONCEPT LAUNCH', w * .85, h * .05); ctx.fillText('AURA STUDIO / CONCEPT LAUNCH', w / 2, h * .22);
    ctx.fillStyle = '#c2ddd5'; fitText(ctx, state.name, w * .84, Math.min(100, h * .22)); ctx.fillText(state.name, w / 2, h * .44);
    ctx.fillStyle = '#7fbaad'; fitText(ctx, state.tagline, w * .85, h * .065); ctx.fillText(state.tagline, w / 2, h * .63);
    ctx.fillStyle = '#5d9387'; fitText(ctx, cue.screen, w * .85, h * .045); ctx.fillText(cue.screen, w / 2, h * .79);
    texture.needsUpdate = true;
  }
}
async function readLayout({ autoPlay = false } = {}) {
  const request = ++revision; clock.pause(); setEnabled(false); $('launch-loading').hidden = false;
  $('launch-loading').textContent = '正在装配同一份舞台…'; $('launch-reload').disabled = true;
  try {
    const saved = readStageSelection(localStorage);
    catalog = await programLibrary.catalog();
    const loaded = await programLibrary.load(stageUsesEffects(saved.stage) ? stageEffectIds(saved.stage) : LAUNCH_CUES.flatMap(cue => cue.programs));
    if (request !== revision) return;
    assets.clear(); for (const [id, data] of loaded) assets.set(id, data);
    content?.dispose(); boards.clear(); state.stage = saved.stage;
    layout.build(saved.stage); content = new LaunchContent(layout, { makeScreenTexture }); content.product?.setFinish(state.finish);
    scene.background.set(saved.stage.theme === 'gallery' ? '#102a33' : '#030c16');
    const target = focus(); keyLight.position.copy(target).add(new THREE.Vector3(-3, 7, 6)); keyLight.target.position.copy(target);
    fillLight.position.copy(target).add(new THREE.Vector3(4, 2, -1));
    const screens = [...layout.records.values()].filter(record => record.element.type === 'screen').length;
    $('launch-layout').textContent = `${saved.label} · ${layout.shows.length} 台激光 · ${screens} 面屏幕`;
    $('launch-effects').textContent = stageEffectSummary(saved.stage, catalog);
    clock.seek(0); state.detail = null; lastCue = ''; setView(state.view); setEnabled(true); $('launch-loading').hidden = true;
    if (autoPlay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) clock.play();
    const warnings = [saved.warning, ...content.warnings].filter(Boolean);
    status(warnings.length ? warnings.join(' ') : '同一舞台已接入发布会内容。可以切换阶段、近距离观察产品，或修改文案与配色。', warnings.length > 0);
    draw(clock.time); syncUi(clock.time);
  } catch (error) {
    state.errors.push(error.message); $('launch-loading').textContent = `发布会准备失败：${error.message}`; status(error.message, true);
  } finally { if (request === revision) $('launch-reload').disabled = false; }
}
function syncUi(time) {
  const pose = launchPoseAt(time, state.detail), cue = pose.cue;
  if (cue.id !== lastCue) {
    lastCue = cue.id; refreshBoards(cue);
    document.querySelectorAll('[data-launch-cue]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.launchCue === cue.id)));
  }
  $('launch-title').textContent = cue.title.replace('AURA ONE', state.name); $('launch-caption').textContent = cue.caption;
  $('launch-model-name').textContent = state.name; $('launch-seek').value = time; $('launch-time').textContent = `${formatLaunchTime(time)} / 01:00`;
  $('launch-play').textContent = clock.playing ? 'Ⅱ 暂停发布流程' : time >= LAUNCH_DURATION ? '↺ 再看一遍' : '▶ 播放发布流程';
  const expanded = pose.detail > .5;
  $('launch-detail').textContent = expanded ? '收起产品结构 ↙' : '展开产品结构 ↗'; $('launch-detail').setAttribute('aria-pressed', String(expanded));
  $('launch-detail-state').textContent = state.detail === null ? '结构展示跟随流程自动变化' : '手动展示；可恢复跟随流程';
}
function draw(time) {
  const pose = launchPoseAt(time, state.detail), cue = pose.cue, reuse = stageUsesEffects(state.stage);
  if (reuse) syncConfiguredEffects(layout, assets, time, catalog); else syncLaunchShows(layout.shows, assets, time);
  content.product?.update(pose);
  const devices = [...layout.records.values()].filter(record => record.show);
  if (!reuse) devices.forEach(record => {
    record.show.intensity = record.element.intensity * cue.gain * (.9 + pose.pulse * .1);
    record.show.beamIntensity = record.element.beamIntensity * cue.beams;
  });
  pipeline.glow.strength = reuse ? 2.4 : .9 + cue.gain * 1.3;
  controls.update(); pipeline.render(); state.frames++;
}
function bind() {
  for (const [i, cue] of LAUNCH_CUES.entries()) {
    const button = document.createElement('button'), index = document.createElement('span'), name = document.createElement('strong'), time = document.createElement('small');
    button.type = 'button'; button.dataset.launchCue = cue.id; button.disabled = true;
    index.textContent = `0${i + 1}`; name.textContent = cue.short; time.textContent = `${formatLaunchTime(cue.start)}—${formatLaunchTime(cue.end)}`;
    button.append(index, name, time); button.setAttribute('aria-pressed', String(i === 0));
    button.addEventListener('click', () => { state.detail = null; clock.seek(cue.start + (cue.id === 'reveal' ? 2 : .1)); syncUi(clock.time); });
    $('launch-chapters').append(button);
  }
  $('launch-play').addEventListener('click', () => { clock.playing ? clock.pause() : clock.play(); syncUi(clock.time); });
  $('launch-restart').addEventListener('click', () => { state.detail = null; clock.seek(0); clock.play(); syncUi(clock.time); });
  $('launch-seek').addEventListener('input', () => { clock.seek(Number($('launch-seek').value)); syncUi(clock.time); });
  $('launch-reload').addEventListener('click', readLayout);
  document.querySelectorAll('[data-launch-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.launchView)));
  document.querySelectorAll('[data-finish]').forEach(button => button.addEventListener('click', () => {
    state.finish = button.dataset.finish; content?.product?.setFinish(state.finish); refreshBoards(launchPoseAt(clock.time).cue);
    document.querySelectorAll('[data-finish]').forEach(option => option.setAttribute('aria-pressed', String(option.dataset.finish === state.finish)));
    status(`产品配色已切换为${PRODUCT_FINISHES[state.finish].name}；舞台空间与设备配置保持原样。`);
  }));
  $('launch-detail').addEventListener('click', () => { state.detail = launchPoseAt(clock.time, state.detail).detail > .5 ? 0 : 1; syncUi(clock.time); });
  $('launch-detail-auto').addEventListener('click', () => { state.detail = null; syncUi(clock.time); });
  for (const [id, key] of [['launch-product-name', 'name'], ['launch-tagline', 'tagline']]) {
    const updateContent = () => {
      const text = $(id).value.trim(); if (!text) return;
      state[key] = text; refreshBoards(launchPoseAt(clock.time).cue); syncUi(clock.time); status('发布内容已更新；同一份舞台配置继续复用。');
    };
    $(id).addEventListener('input', updateContent);
    $(id).addEventListener('change', () => {
      if (!$(id).value.trim()) { $(id).value = state[key]; status('发布内容不能为空。', true); }
      else updateContent();
    });
  }
  $('launch-fullscreen').addEventListener('click', async () => {
    try { document.fullscreenElement ? await document.exitFullscreen() : await $('launch-viewport').requestFullscreen(); }
    catch (error) { status(`全屏未开启：${error.message}`, true); }
  });
}
async function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('launch-view'), antialias: false });
    if (!renderer.extensions.has('EXT_color_buffer_float') && !renderer.extensions.has('EXT_color_buffer_half_float')) throw new Error('光效需要支持浮点颜色缓冲的 WebGL 2 浏览器');
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
    renderer.debug.onShaderError = () => { clock.pause(); state.errors.push('shader compile error'); status('发布会着色器编译失败，请检查 GPU 支持。', true); };
    scene = new THREE.Scene(); scene.background = new THREE.Color('#030c16'); camera = new THREE.PerspectiveCamera(48, 1, .1, 200);
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = 2.5; controls.maxDistance = 110; controls.maxPolarAngle = Math.PI * .49;
    scene.add(new THREE.AmbientLight('#bfdbe2', 1.5)); keyLight = new THREE.DirectionalLight('#ecf8f0', 3.5); scene.add(keyLight, keyLight.target);
    fillLight = new THREE.PointLight('#65cfd2', 22, 40, 2); scene.add(fillLight);
    const groundGeometry = new THREE.CircleGeometry(60, 96), groundMaterial = new THREE.MeshBasicMaterial({ color: '#07121a' });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial); ground.rotation.x = -Math.PI / 2; ground.position.y = -.06; scene.add(ground);
    resources.add(groundGeometry); resources.add(groundMaterial);
    pipeline = new LaserShowPipeline(renderer, scene, camera, { samples: 0, strength: 1.8, threshold: .72 }); layout = new StageLayout(scene, pipeline, { showSlots: false });
    bind();
    const resize = () => { const host = $('launch-viewport'), width = host.clientWidth, height = host.clientHeight; renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe($('launch-viewport')); resize();
    await readLayout({autoPlay:true});
    stagePicker = mountStagePicker($('launch-stage-select'),()=>readLayout(),error=>status(`项目选择失败：${error.message}`,true));
    let fpsAt = performance.now(), frames = 0;
    renderer.setAnimationLoop(now => {
      if (!state.ready) return;
      const time = clock.time; draw(time); frames++;
      if (now - lastUi > 100 || lastPlaying !== clock.playing) { syncUi(time); lastUi = now; }
      if (lastPlaying && !clock.playing && time >= LAUNCH_DURATION) status('发布流程结束。可以重播、手动展开结构，或换一份发布内容。');
      lastPlaying = clock.playing;
      if (now - fpsAt > 1000) { $('launch-frame-note').textContent = `${Math.round(frames * 1000 / (now - fpsAt))} fps · 拖动旋转`; frames = 0; fpsAt = now; }
    });
    window.productLaunch = { state, clock, scene, camera, renderer, pipeline, layout, get content() { return content; }, readLayout, setView };
  } catch (error) { state.errors.push(error.message); $('launch-loading').hidden = false; $('launch-loading').textContent = `发布会准备失败：${error.message}`; status(error.message, true); }
}
document.addEventListener('visibilitychange', () => { if (document.hidden && clock.playing) { clock.pause(); syncUi(clock.time); status('页面已切到后台，发布流程暂停；返回后可继续。'); } });
window.addEventListener('pagehide', () => { stagePicker?.dispose(); revision++; clock.pause(); renderer?.setAnimationLoop(null); resizeObserver?.disconnect(); content?.dispose(); layout?.dispose(); pipeline?.dispose(); resources.forEach(resource => resource.dispose()); controls?.dispose(); renderer?.dispose(); });
init();
