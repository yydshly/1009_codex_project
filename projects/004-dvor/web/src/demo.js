import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pipeline } from './vendor/core/post.js';
import { buildSky } from './vendor/core/sky.js';
import { PAL } from './vendor/core/palette.js';
import { gradientMap } from './vendor/core/toon.js';
import { setOutlineResolution } from './vendor/core/outline.js';
import { Player } from './vendor/core/player.js';
import { R, CENTER, positionAt, basisAt } from './vendor/world/planet.js';
import { buildFluff } from './vendor/world/nature.js';
import { buildCommunity } from './community.js';
import { communityStops, originalStops } from './content.js';

const PRESETS = {
  evening: { title: '傍晚明信片', bands: 3, sun: 28, ink: 85, fog: 45, shadow: '#4d7d86', light: '#fff0dc', warmth: 0.085, saturation: 1.06 },
  daylight: { title: '清爽日间', bands: 4, sun: 62, ink: 42, fog: 25, shadow: '#718c9a', light: '#faf9ef', warmth: 0.02, saturation: 0.96 },
  ink: { title: '浓墨动画', bands: 2, sun: 36, ink: 135, fog: 30, shadow: '#53647d', light: '#ffe8c4', warmth: 0.06, saturation: 1.15 },
};
const STORAGE_KEY = 'dvor-004-style-v1';

export async function initializeDemo() {
  const stage = document.getElementById('scene-stage');
  const canvas = document.getElementById('scene-canvas');
  const loading = document.getElementById('scene-loading');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true, stencil: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.2, 1800);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxDistance = 650;
  controls.minDistance = 3;
  controls.maxPolarAngle = Math.PI * 0.495;
  const sun = new THREE.DirectionalLight(PAL.sun, 2.35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -65, right: 65, top: 65, bottom: -65, near: 1, far: 500 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  const fill = new THREE.DirectionalLight(PAL.fill, 1.1);
  const bounce = new THREE.DirectionalLight(0xcfe0d8, 0.32);
  const hemi = new THREE.HemisphereLight(PAL.hemiSky, PAL.hemiGround, 1.05);
  scene.add(sun, sun.target, fill, fill.target, bounce, bounce.target, hemi);
  const sky = buildSky(scene, 760);
  const pipeline = new Pipeline(renderer, scene, camera, { pixelBudget: 1.5e6 });
  const fluff = buildFluff(scene, camera, { count: 240, radius: 22 });
  let current, source = 'community', stops = communityStops, selected = -1, english = false;
  let mode = 'orbit', compared = false, state = { ...PRESETS.evening }, visible = false, markers = [];
  const worlds = new Map(), visited = new Set();
  const raycaster = new THREE.Raycaster();
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const player = new Player(camera, canvas, { colliders: [], heightAt: () => 0, bounds: { z0: -10, z1: 100 } }, { pos: new THREE.Vector3(0, 0, 2), yaw: Math.PI });
  player.onLockChange = locked => {
    if (locked) { mode = 'walk'; controls.enabled = false; }
    else if (mode === 'walk') {
      mode = 'orbit'; controls.enabled = true;
      controls.target.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(12));
    }
    document.getElementById('reticle').hidden = !locked;
    document.getElementById('walking').setAttribute('aria-pressed', String(locked));
    document.getElementById('scene-help').textContent = locked ? 'WASD 行走 · Shift 跑步 · E 互动 · Esc 退出漫游' : '拖拽旋转 · 滚轮缩放 · 点击地点阅读';
    document.getElementById('scene-markers').hidden = locked;
  };
  player.onInteract = target => {
    if (!document.getElementById('inscription-note').hidden) closeNote();
    else if (target?.note) showNote(target.note);
    else target?.action?.();
  };

  function materialSet() {
    const set = new Set();
    current.container.traverse(object => { if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(mat => set.add(mat)); });
    return set;
  }
  const continuousRamp = new THREE.DataTexture(Uint8Array.from({ length: 256 * 4 }, (_, i) => i % 4 === 3 ? 255 : Math.floor(i / 4)), 256, 1, THREE.RGBAFormat);
  continuousRamp.needsUpdate = true;
  function applyStyle() {
    for (const mat of materialSet()) {
      if (mat.isMeshToonMaterial) {
        mat.gradientMap = compared ? continuousRamp : gradientMap(state.bands);
        mat.userData.shadowTint?.value.set(compared ? '#ffffff' : state.shadow);
        mat.needsUpdate = true;
      }
      if (mat.isShaderMaterial && mat.uniforms.uThickness && mat.uniforms.uColor) mat.visible = !compared && state.ink > 0;
    }
    pipeline.enabled.ink = !compared;
    pipeline.ink.mat.uniforms.uStrength.value = state.ink / 100;
    pipeline.ink.mat.uniforms.uFadeStart.value = 45;
    pipeline.ink.mat.uniforms.uFadeEnd.value = 120;
    pipeline.ink.mat.uniforms.uSkyDepth.value = 720;
    const grade = pipeline.grade.mat.uniforms;
    // Keep linear-to-sRGB output even during the neutral comparison.
    grade.uShadowTint.value.set(compared ? '#ffffff' : '#afc6c5');
    grade.uLightTint.value.set(compared ? '#ffffff' : state.light);
    grade.uWarmth.value = compared ? 0 : state.warmth;
    grade.uSaturation.value = compared ? 1 : state.saturation;
    grade.uLift.value = compared ? 0 : 0.038;
    grade.uVignette.value = compared ? 0 : 0.17;
    scene.fog = mode === 'planet' || compared || state.fog === 0 ? null : new THREE.Fog(PAL.fog, 90 - state.fog * 0.6, 330 - state.fog * 1.8);
    fluff.points.visible = document.getElementById('particles').checked;
    for (const key of ['bands', 'sun', 'ink', 'fog']) {
      document.getElementById(key).value = state[key];
      document.getElementById(`${key}-output`).textContent = state[key] + (key === 'bands' ? ' 档' : key === 'sun' ? '°' : '%');
    }
    document.getElementById('shadow-color').value = state.shadow;
    updateLights(); renderOnce();
    document.getElementById('style-status').textContent = compared ? '原色对照 · 连续光照，描边与艺术调色已关闭' : `${state.title} · 当前设置可保存为自己的预设`;
    document.getElementById('compare-style').setAttribute('aria-pressed', String(compared));
  }
  function updateLights() {
    const origin = mode === 'planet' ? CENTER : positionAt(0, 0, source === 'community' ? 42 : 45);
    const basis = basisAt(0, source === 'community' ? 42 : 45);
    const elevation = state.sun * Math.PI / 180;
    const local = new THREE.Vector3(-Math.cos(elevation) * 85, Math.sin(elevation) * 85, Math.cos(elevation) * 60);
    const set = (light, localPos) => {
      light.target.position.copy(origin);
      light.position.copy(origin).addScaledVector(basis.east, localPos.x).addScaledVector(basis.up, localPos.y).addScaledVector(basis.north, localPos.z);
    };
    set(sun, mode === 'planet' ? local.multiplyScalar(4) : local);
    set(fill, new THREE.Vector3(50, 24, -40));
    set(bounce, new THREE.Vector3(10, -18, -40));
    const half = mode === 'planet' ? R * 1.2 : 65;
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, far: mode === 'planet' ? 1000 : 500 });
    sun.shadow.camera.updateProjectionMatrix();
  }
  function renderOnce() {
    sky.dome.position.copy(camera.position); sky.clouds.position.copy(camera.position);
    pipeline.render(); updateMarkers();
  }
  function resize() {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height; camera.updateProjectionMatrix();
    pipeline.setSize(width, height); setOutlineResolution(pipeline.size.x, pipeline.size.y);
    if (current) renderOnce();
  }
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { rootMargin: '80px' }).observe(stage);

  function leaveWalk() {
    if (player.locked) controls.target.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(12));
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    mode = 'orbit'; controls.enabled = true;
    document.getElementById('scene-markers').hidden = false;
    document.getElementById('reticle').hidden = true;
  }
  window.addEventListener('keydown', event => {
    if (event.code === 'Escape' && player.locked) { closeNote(); leaveWalk(); }
  });
  function viewAt(view, target) {
    leaveWalk();
    camera.up.copy(basisAt(target[0], target[2]).up);
    camera.position.copy(positionAt(...view)); controls.target.copy(positionAt(...target));
    controls.update(); applyStyle();
  }
  function overview() {
    viewAt(source === 'community' ? [48, 38, -2] : [55, 43, 0], source === 'community' ? [-3, 4, 42] : [0, 5, 49]);
    document.getElementById('planet-view').setAttribute('aria-pressed', 'false');
  }
  function showNote(note) {
    document.getElementById('note-original').textContent = note.original || note.title || '';
    document.getElementById('note-translation').textContent = note.translation || '';
    document.getElementById('note-context').textContent = note.context || '';
    document.getElementById('inscription-note').hidden = false;
  }
  function closeNote() { document.getElementById('inscription-note').hidden = true; }
  document.getElementById('close-note').addEventListener('click', closeNote);

  function renderStops() {
    const route = document.getElementById('route-stops');
    route.replaceChildren();
    document.getElementById('scene-markers').replaceChildren();
    markers = stops.map((stop, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'route-stop'; button.dataset.stop = stop.id;
      button.setAttribute('aria-pressed', String(index === selected));
      const number = document.createElement('span'); number.className = 'stop-number'; number.textContent = String(index + 1).padStart(2, '0');
      const title = document.createElement('span'); title.textContent = english && stop.enTitle ? stop.enTitle : stop.title;
      const check = document.createElement('span'); check.className = 'stop-check'; check.textContent = visited.has(index) ? '✓' : '↗';
      button.append(number, title, check); button.addEventListener('click', () => selectStop(index)); route.append(button);
      const marker = document.createElement('button'); marker.type = 'button'; marker.className = 'scene-marker'; marker.dataset.marker = stop.id;
      marker.textContent = `${index + 1} · ${stop.title.split(' · ')[0]}`; marker.setAttribute('aria-pressed', String(index === selected));
      marker.addEventListener('click', () => selectStop(index)); document.getElementById('scene-markers').append(marker);
      return { button: marker, position: positionAt(stop.x, stop.height, stop.z) };
    });
    document.getElementById('visit-progress').textContent = `已浏览 ${visited.size} / ${stops.length} 个地点`;
  }
  function updateMarkers() {
    const width = stage.clientWidth, height = stage.clientHeight;
    markers.forEach(marker => {
      const p = marker.position.clone().project(camera);
      marker.button.hidden = mode !== 'orbit' || p.z < -1 || p.z > 1 || Math.abs(p.x) > 0.93 || Math.abs(p.y) > 0.88;
      marker.button.style.left = `${(p.x * 0.5 + 0.5) * width}px`;
      marker.button.style.top = `${(-p.y * 0.5 + 0.5) * height}px`;
    });
  }
  function detail() {
    const stop = stops[selected];
    if (!stop) return;
    const box = document.getElementById('location-detail');
    box.replaceChildren();
    for (const [tag, text, className] of [['span', source === 'community' ? '社区开放日 / 演示内容' : '上游庭院 / 实际源码复现', 'detail-kicker'], ['h4', english && stop.enTitle ? stop.enTitle : stop.title], ['p', english && stop.enBody ? stop.enBody : stop.body], ['small', stop.tag]]) {
      const element = document.createElement(tag); element.textContent = text; if (className) element.className = className; box.append(element);
    }
    document.getElementById('next-stop').textContent = selected === stops.length - 1 ? '重新浏览 →' : '下一站 →';
  }
  function selectStop(index) {
    selected = index; visited.add(index); closeNote();
    const stop = stops[index]; viewAt(stop.view, stop.target); renderStops(); detail();
    if (source === 'original' && stop.id === 'tram') current.world.tram.x = -34;
    updateMarkers();
  }
  async function selectWorld(next) {
    if (next === source && current) return;
    loading.hidden = false;
    // Yield the loading indicator without depending on a foreground tab's rAF.
    await new Promise(resolve => setTimeout(resolve, 0));
    leaveWalk(); closeNote();
    if (current) current.container.visible = false;
    source = next; stops = next === 'community' ? communityStops : originalStops; selected = -1; visited.clear();
    if (!worlds.has(next)) {
      const container = new THREE.Group(); scene.add(container);
      const builder = next === 'community' ? buildCommunity : (await import('./vendor/world/index.js')).buildWorld;
      const world = builder(container); worlds.set(next, { container, world });
    }
    current = worlds.get(next); current.container.visible = true;
    player.world = current.world;
    player.spawn.pos.set(next === 'community' ? 0 : 0.2, 0, next === 'community' ? 2 : 16.2);
    player.spawn.yaw = Math.PI; player.spawn.pitch = 0.04; player.reset();
    document.querySelectorAll('[data-world]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.world === next)));
    document.getElementById('scene-name').textContent = next === 'community' ? '柳荫里 · 社区开放日' : 'Dvor · June 2001';
    document.getElementById('route-title').textContent = next === 'community' ? '第一次来，怎么走？' : '在原作中走一走';
    document.getElementById('location-detail').innerHTML = '<span class="detail-kicker">选择一个地点</span><h4>让内容与位置发生关联</h4><p>点击场景中的标记或地点，观察镜头定位与空间注释。</p>';
    document.getElementById('next-stop').textContent = '开始导览 →';
    document.getElementById('language-toggle').disabled = next === 'original';
    renderStops(); overview(); resize(); loading.hidden = true;
  }
  document.querySelectorAll('[data-world]').forEach(button => button.addEventListener('click', () => selectWorld(button.dataset.world).catch(reportError)));
  document.getElementById('overview').addEventListener('click', () => { closeNote(); overview(); });
  document.getElementById('planet-view').addEventListener('click', () => {
    if (mode === 'planet') { overview(); return; }
    leaveWalk(); mode = 'planet'; closeNote();
    camera.up.set(0, 1, 0); camera.position.copy(CENTER).add(new THREE.Vector3(210, 370, 260)); controls.target.copy(CENTER); controls.update();
    document.getElementById('planet-view').setAttribute('aria-pressed', 'true'); applyStyle();
  });
  document.getElementById('walking').addEventListener('click', async () => {
    if (player.locked) { leaveWalk(); overview(); return; }
    if (!canvas.requestPointerLock) { document.getElementById('scene-help').textContent = '此设备可用拖拽与地点导览浏览'; return; }
    closeNote(); player.reset(); player.applyCamera(0);
    try { await canvas.requestPointerLock(); } catch { overview(); document.getElementById('scene-help').textContent = '可使用拖拽与地点导览浏览'; }
  });
  document.getElementById('fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await stage.requestFullscreen(); } catch { document.getElementById('scene-help').textContent = '可继续拖拽浏览场景'; }
  });
  document.getElementById('next-stop').addEventListener('click', () => selectStop((selected + 1) % stops.length));
  document.getElementById('language-toggle').addEventListener('click', () => { english = !english; renderStops(); detail(); document.getElementById('language-toggle').textContent = english ? '中文注释' : 'English 注释'; });
  document.getElementById('animate-prop').addEventListener('click', () => {
    current.world.interactables.find(target => target.label === 'Spin the roundabout')?.action?.();
    document.getElementById('animate-prop').textContent = '转盘已推动 ↻';
    setTimeout(() => { document.getElementById('animate-prop').textContent = '推一把转盘 ↻'; }, 1800);
  });
  let pointerStart;
  canvas.addEventListener('pointerdown', event => { pointerStart = [event.clientX, event.clientY]; });
  canvas.addEventListener('pointerup', event => {
    if (player.locked || !pointerStart || Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 5) return;
    const rect = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
    const targets = current.world.interactables;
    const hit = raycaster.intersectObjects(targets.map(target => target.hitbox), false)[0];
    const target = hit && targets.find(target => target.hitbox === hit.object);
    if (target?.note) showNote(target.note); else target?.action?.();
  });
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    state = { ...PRESETS[button.dataset.preset] }; compared = false;
    document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); applyStyle();
  }));
  for (const key of ['bands', 'sun', 'ink', 'fog']) document.getElementById(key).addEventListener('input', event => {
    state[key] = Number(event.target.value); state.title = '自定义风格';
    document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', 'false')); applyStyle();
  });
  document.getElementById('shadow-color').addEventListener('input', event => { state.shadow = event.target.value; state.title = '自定义风格'; applyStyle(); });
  document.getElementById('particles').addEventListener('change', applyStyle);
  document.getElementById('compare-style').addEventListener('click', () => { compared = !compared; applyStyle(); });
  document.getElementById('save-preset').addEventListener('click', () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); document.getElementById('style-status').textContent = '预设已保存 · 下次打开此页面会恢复'; }
    catch { document.getElementById('style-status').textContent = '当前浏览器无法保存，可导出 JSON 保留预设'; }
  });
  document.getElementById('export-preset').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ format: 'dvor-style-v1', ...state }, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'dvor-style.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      for (const [key, min, max] of [['bands', 2, 5], ['sun', 12, 75], ['ink', 0, 150], ['fog', 0, 100]]) if (Number.isFinite(saved[key])) state[key] = Math.round(Math.max(min, Math.min(max, saved[key])));
      if (/^#[0-9a-f]{6}$/i.test(saved.shadow)) state.shadow = saved.shadow;
      if (/^#[0-9a-f]{6}$/i.test(saved.light)) state.light = saved.light;
      if (Number.isFinite(saved.warmth)) state.warmth = Math.max(0, Math.min(0.2, saved.warmth));
      if (Number.isFinite(saved.saturation)) state.saturation = Math.max(0.5, Math.min(1.5, saved.saturation));
      state.title = '本机保存的风格'; document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    }
  } catch { /* Missing or invalid local preferences keep the default preset. */ }
  await selectWorld('community');
  let previous = performance.now();
  function frame(time) {
    requestAnimationFrame(frame);
    const dt = Math.min((time - previous) / 1000, 0.05); previous = time;
    if (!visible || document.hidden) return;
    if (!reduceMotion) current.world.update(dt);
    if (player.locked) { player.update(dt); player.pick(current.world.interactables); }
    else controls.update();
    if (!reduceMotion) fluff.update(dt);
    renderOnce();
  }
  requestAnimationFrame(frame);
  window.__dvorLab = {
    ready: true, renderer, scene, camera, pipeline, player,
    get source() { return source; }, get mode() { return mode; }, get style() { return { ...state }; },
    get selected() { return selected; }, get world() { return current.world; },
  };
  function reportError(error) {
    console.error(error); loading.hidden = false; loading.textContent = '场景暂时无法显示。请使用支持 WebGL 的浏览器；研究内容和原始样例仍可阅读。';
  }
}
