import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LaserShowPipeline } from '../vendor/three-ilda/src/webgl.js';
import { StageLayout } from './stage-layout.js';
import { readStageSelection } from './stage-projects.js';
import { mountStagePicker } from './stage-picker.js';
import { stageFrame } from './stage-framing.js';
import { StageProgramLibrary } from './stage-program-library.js';
import { stageUsesEffects, stageEffectIds, syncConfiguredEffects, stageEffectSummary } from './stage-effects.js';
import { StageAudio } from './stage-audio.js';
import { STAGE_CUES, STAGE_DURATION, stageCueAt, beatPulseAt, stageEnvelopeAt, formatStageTime, syncStageShows } from './stage-plan.js';
import './style.css';
import './stage.css';
import './stage-effects.css';

const $ = id => document.getElementById(id), base = new URL(import.meta.env.BASE_URL, document.baseURI);
const state = { ready: false, theme: 'stars', camera: 'audience', cheers: 0, frames: 0, errors: [], cue: 'arrival' };
let renderer, scene, camera, controls, pipeline, audio, resizeObserver, stars, city, sculpture, layout, stageDefinition, stagePicker;
let cheerUntil = 0, cheerStrength = 0, lastCue = '', lastUi = 0, lastPlaying = false, projectRequest = 0, catalog = [];
const shows = [], assets = new Map(), resources = new Set();
const programLibrary = new StageProgramLibrary(base);
const keep = resource => { resources.add(resource); return resource; };
const material = color => keep(new THREE.MeshBasicMaterial({ color }));
const status = (text, error = false) => { $('concert-status').textContent = text; $('concert-status').classList.toggle('error', error); };
function mesh(geometry, mat, parent = scene) { const object = new THREE.Mesh(keep(geometry), mat); parent.add(object); return object; }
function outline(geometry, color, parent = scene) {
  const object = new THREE.LineSegments(keep(new THREE.EdgesGeometry(geometry)), keep(new THREE.LineBasicMaterial({ color })));
  parent.add(object); return object;
}
function setCamera(name) {
  state.camera = name; $('concert-tour').checked = false;
  const frame = stageFrame(stageDefinition), n = frame.extent;
  const positions = { audience: [n*.6,n*.3,n*1.05], front: [0,n*.16,n*1.3], close: [-n*.4,n*.14,n*.7] };
  controls.target.set(...frame.center); camera.position.copy(controls.target).add(new THREE.Vector3(...positions[name])); controls.update();
  document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === name)));
}
function setTheme(theme) {
  state.theme = theme; stars.visible = theme === 'stars'; city.visible = theme === 'city';
  scene.background.set(theme === 'stars' ? 0x030817 : 0x0b0615); scene.fog.color.copy(scene.background);
  $('concert-atmosphere').textContent = theme === 'stars' ? '星海主题' : '霓虹城市主题';
  document.querySelectorAll('[data-theme]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
}
function buildVenue() {
  scene.fog = new THREE.FogExp2(0x030817, .019);
  const ground = mesh(new THREE.CircleGeometry(32, 80), material(0x050b16)); ground.rotation.x = -Math.PI / 2; ground.position.y = -.35;
  const positions = new Float32Array(700 * 3);
  for (let i = 0; i < 700; i++) {
    const unit = n => { const value = Math.sin((i + 1) * n) * 43758.5453; return value - Math.floor(value); };
    positions.set([(unit(12.9898) - .5) * 44, unit(78.233) * 19 + 2, unit(39.425) * 34 - 26], i * 3);
  }
  const starGeometry = keep(new THREE.BufferGeometry()); starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  stars = new THREE.Points(starGeometry, keep(new THREE.PointsMaterial({ size: .075, color: 0x608bb8, transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending }))); scene.add(stars);
  city = new THREE.Group(); scene.add(city);
  for (let i = 0; i < 22; i++) {
    const height = 2.5 + ((i * 7) % 11) * .6, building = mesh(new THREE.BoxGeometry(1.3, height, 1.1), material(0x101222), city);
    building.position.set((i - 10.5) * 1.9, height / 2, -12 - Math.abs(i - 10.5) * .2);
    const edges = outline(building.geometry, i % 2 ? 0x432f61 : 0x233f59, city); edges.position.copy(building.position);
  }
}
function setEnabled(ready) {
  state.ready = ready;
  ['concert-play', 'concert-restart', 'concert-seek', 'concert-mute', 'concert-volume'].forEach(id => { $(id).disabled = !ready; });
  document.querySelectorAll('[data-cue]').forEach(button => { button.disabled = !ready; });
}
async function readProject() {
  const request = ++projectRequest; audio?.pause(); setEnabled(false); $('concert-loading').hidden = false;
  $('concert-loading').textContent = '正在读取舞台与效果…';
  try {
  const saved = readStageSelection(localStorage);
  catalog = await programLibrary.catalog();
  const loaded = await programLibrary.load(stageUsesEffects(saved.stage) ? stageEffectIds(saved.stage) : ['light-flower', 'corners', 'orbits', 'lab-mark']);
  if (request !== projectRequest) return false;
  assets.clear(); for (const [id, data] of loaded) assets.set(id, data);
  if (sculpture) {
    sculpture.removeFromParent();
    for (const resource of [sculpture.geometry,sculpture.material]) { resource.dispose(); resources.delete(resource); }
    sculpture = null;
  }
  stageDefinition = saved.stage; layout.build(stageDefinition); shows.splice(0,shows.length,...layout.shows);
  const slot = stageDefinition.objects.find(object => object.type === 'slot');
  if (slot) {
    sculpture = mesh(new THREE.IcosahedronGeometry(.72,1),material(0x274c76),layout.records.get(slot.id).root);
    sculpture.material.wireframe = true; sculpture.position.y = 1; sculpture.userData.baseY = 1;
  }
  const screens = stageDefinition.objects.filter(object=>object.type==='screen').length;
  $('concert-layout').textContent = `${saved.label} · ${shows.length} 台激光 · ${screens} 面屏幕`;
  $('concert-effects').textContent = stageEffectSummary(stageDefinition, catalog);
  cheerUntil = 0; cheerStrength = 0; lastCue = ''; setCamera(state.camera);
  if (audio) { setEnabled(true); $('concert-loading').hidden = true; draw(audio.time); syncUi(audio.time,stageCueAt(audio.time)); }
  status(saved.warning || '已装配所选舞台；空间来自同一项目，音乐脚本独立运行。点击播放继续。',Boolean(saved.warning));
  return true;
  } catch (error) {
    if (request === projectRequest) { state.errors.push(error.message); $('concert-loading').textContent = `舞台准备失败：${error.message}`; status(error.message, true); }
    return false;
  }
}
function syncUi(time, cue) {
  const changed = cue.id !== lastCue;
  if (changed) {
    lastCue = cue.id; state.cue = cue.id; $('concert-cue').textContent = cue.name; $('concert-caption').textContent = cue.caption;
    document.querySelectorAll('[data-cue]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cue === cue.id)));
  }
  $('concert-seek').value = time; $('concert-time').textContent = `${formatStageTime(time)} / 01:30`;
  $('concert-play').textContent = audio.playing ? 'Ⅱ 暂停演出' : time >= STAGE_DURATION ? '↺ 再看一遍' : time > 0 ? '▶ 继续演出' : '▶ 开始演出';
  $('concert-play').setAttribute('aria-label', audio.playing ? '暂停演出与音乐' : '播放演出与音乐');
  $('concert-cheer').disabled = !audio.playing;
}
async function play() {
  $('concert-play').disabled = true; status('正在准备音频播放…');
  try { await audio.play(); if (audio.playing) status('原创配乐播放中 · 切换视角或点击应援，参与这场单人演出。'); }
  catch (error) { state.errors.push(error.message); status(`音乐无法播放：${error.message}`, true); }
  finally { $('concert-play').disabled = !state.ready; syncUi(audio.time, stageCueAt(audio.time)); }
}
function bindControls() {
  $('concert-play').addEventListener('click', () => {
    if (audio.playing) { audio.pause(); status('演出已暂停，镜头仍可自由观察。'); syncUi(audio.time, stageCueAt(audio.time)); }
    else play();
  });
  $('concert-restart').addEventListener('click', () => { audio.seek(0); cheerUntil = 0; cheerStrength = 0; if (!audio.playing) play(); });
  $('concert-seek').addEventListener('input', () => { audio.seek(Number($('concert-seek').value)); syncUi(audio.time, stageCueAt(audio.time)); });
  for (const cue of STAGE_CUES) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.cue = cue.id; button.disabled = true;
    const name = document.createElement('span'); name.textContent = cue.short;
    const time = document.createElement('small'); time.textContent = `${formatStageTime(cue.start)} — ${formatStageTime(cue.end)}`;
    button.append(name, time); button.setAttribute('aria-pressed', String(cue.id === 'arrival'));
    button.addEventListener('click', () => { audio.seek(cue.start + .1); syncUi(audio.time, cue); status(`已切换到${cue.name}${audio.playing ? '，音乐与舞台同步播放。' : '，点击继续播放。'}`); });
    $('concert-chapters').append(button);
  }
  document.querySelectorAll('[data-camera]').forEach(button => button.addEventListener('click', () => setCamera(button.dataset.camera)));
  document.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme)));
  controls.addEventListener('start', () => { $('concert-tour').checked = false; });
  $('concert-tour').addEventListener('change', () => { document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(!$('concert-tour').checked && button.dataset.camera === state.camera))); });
  $('concert-mute').addEventListener('click', () => {
    audio.muted = !audio.muted; audio.applyVolume(); $('concert-mute').textContent = audio.muted ? '声音关闭' : '声音开启'; $('concert-mute').setAttribute('aria-pressed', String(audio.muted));
  });
  $('concert-volume').addEventListener('input', () => { audio.volume = Number($('concert-volume').value) / 100; audio.applyVolume(); });
  $('concert-cheer').addEventListener('click', () => {
    if (!audio.playing) return;
    state.cheers++; cheerStrength = Math.min(1.5, cheerStrength + .5); cheerUntil = audio.time + 2.5;
    $('concert-cheer-count').textContent = state.cheers; status(`第 ${state.cheers} 次应援 · 当前浏览器中的舞台亮度和粒子增强。`);
  });
  $('concert-fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('concert-viewport').requestFullscreen(); }
    catch (error) { status(`全屏未开启：${error.message}`, true); }
  });
}
function draw(time) {
  const reuse = stageUsesEffects(stageDefinition), cue = stageCueAt(time), pulse = beatPulseAt(time), envelope = stageEnvelopeAt(time);
  if (reuse) syncConfiguredEffects(layout, assets, time, catalog); else syncStageShows(shows, assets, time);
  const cheer = Math.max(0, Math.min(1, (cheerUntil - time) / 2.5)) * cheerStrength;
  if (!cheer) cheerStrength = 0;
  const energy = (cue.gain + pulse * .2 + cheer * .25) * envelope;
  if (!reuse) shows.forEach((show, i) => {
    const device = stageDefinition.objects.filter(object => object.type === 'laser')[i];
    show.intensity = device.intensity * (.4 + energy * 1.2); show.beamIntensity = device.beamIntensity * (cue.beams + pulse * .15 + cheer * .2) * envelope;
    show.zoom = .55 + energy * .35; show.rotation.z = Math.sin(time * .16 + i * 2) * .17;
    show.rotation.y = Math.sin(time * .1 + i) * (cue.id === 'chorus' ? .14 : .07);
  });
  pipeline.glow.strength = reuse ? 2.4 : cue.bloom * (.7 + pulse * .3) + cheer;
  const tint = state.theme === 'stars' ? [0.12, .32, .59] : [.42, .15, .5];
  if (sculpture) {
    sculpture.material.color.setRGB(...tint.map(value => value * (.5 + energy))); sculpture.rotation.set(time * .14, time * .3, Math.sin(time * .1) * .25);
    sculpture.position.y = sculpture.userData.baseY + Math.sin(time * .6) * .15;
  }
  stars.rotation.y = time * .003; stars.rotation.z = Math.sin(time * .02) * .025;
  stars.material.size = .065 + pulse * .015 + cheer * .045;
  if ($('concert-tour').checked) {
    const frame = stageFrame(stageDefinition), n=frame.extent;
    camera.position.set(frame.center[0]+Math.sin(time*.065)*n*.7,6+Math.sin(time*.08)*1.6,frame.center[2]+n+Math.cos(time*.065)*n*.3);
    camera.lookAt(...frame.center);
  } else controls.update();
  pipeline.render(); state.frames++;
  return cue;
}
async function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('concert-view'), antialias: false });
    if (!renderer.extensions.has('EXT_color_buffer_float') && !renderer.extensions.has('EXT_color_buffer_half_float')) throw new Error('舞台光效需要支持浮点颜色缓冲的 WebGL 2 浏览器。');
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
    renderer.debug.onShaderError = () => { state.errors.push('shader compile error'); audio?.pause(); status('舞台着色器编译失败，请检查 GPU 支持。', true); };
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x030817);
    camera = new THREE.PerspectiveCamera(48, 1, .1, 100);
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = 4; controls.maxDistance = 100; controls.maxPolarAngle = Math.PI * .48;
    pipeline = new LaserShowPipeline(renderer, scene, camera, { samples: 0, strength: 4 });
    layout = new StageLayout(scene,pipeline,{showSlots:false});
    buildVenue(); setTheme('stars'); bindControls();
    if (!await readProject()) return;
    const score = await fetch(new URL('stage/aurora-90s.wav', base)); if (!score.ok) throw new Error('原创配乐读取失败，请先构建样例。');
    audio = new StageAudio(await score.arrayBuffer());
    const resize = () => { const host = $('concert-viewport'), width = host.clientWidth, height = host.clientHeight; renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe($('concert-viewport')); resize();
    setEnabled(true); $('concert-loading').hidden = true;
    stagePicker = mountStagePicker($('concert-stage-select'),readProject,error=>status(`项目选择失败：${error.message}`,true));
    $('concert-stage-reload').addEventListener('click',()=>{ readProject(); stagePicker.refresh(); });
    status(stageUsesEffects(stageDefinition) ? '已接入展台保存的效果 · 音乐只提供时钟与内容，不替换这些节目；点击播放。' : '已装配舞台配置 · 当前选择业务编排，音乐脚本驱动原创光效。');
    let fpsAt = performance.now(), frames = 0;
    renderer.setAnimationLoop(now => {
      if (!state.ready) return;
      const time = audio.time, cue = draw(time); frames++;
      if (now - lastUi > 100 || cue.id !== lastCue || lastPlaying !== audio.playing) { syncUi(time, cue); lastUi = now; }
      if (lastPlaying && !audio.playing && time >= STAGE_DURATION) status('演出结束 · 可以重播、切换主题，或返回产品记录继续研究。');
      lastPlaying = audio.playing;
      if (now - fpsAt > 1000) { $('concert-fps').textContent = `${Math.round(frames * 1000 / (now - fpsAt))} fps · 拖动旋转`; frames = 0; fpsAt = now; }
    });
    window.virtualStage = { state, audio, scene, camera, shows, layout, stageDefinition, pipeline, renderer, setTheme, setCamera };
  } catch (error) {
    state.errors.push(error.message); $('concert-loading').hidden = false; $('concert-loading').textContent = `舞台准备失败：${error.message}`; status(error.message, true);
  }
}
document.addEventListener('visibilitychange', () => { if (document.hidden && audio?.playing) { audio.pause(); status('页面已切到后台，演出自动暂停；返回后点击继续。'); syncUi(audio.time, stageCueAt(audio.time)); } });
window.addEventListener('pagehide', () => { projectRequest++; stagePicker?.dispose(); renderer?.setAnimationLoop(null); audio?.dispose(); resizeObserver?.disconnect(); layout?.dispose(); pipeline?.dispose(); resources.forEach(resource => resource.dispose()); controls?.dispose(); renderer?.dispose(); });
init();
