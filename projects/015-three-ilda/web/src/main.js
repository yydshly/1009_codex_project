import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LaserShow, LaserShowPipeline } from '../vendor/three-ilda/src/webgl.js';
import { parseProgram } from './program-loader.js';
import { ProgramCarousel } from './program-carousel.js';
import './style.css';
import './product.css';

const $ = id => document.getElementById(id);
const base = new URL(import.meta.env.BASE_URL, document.baseURI);
const state = { mode: 'full', sample: null, buffer: null, ready: false, framesRendered: 0, errors: [], view: 'perspective' };
const modeNames = { raw: '原始路线', scanner: '振镜扫描', full: '完整光效' };
const descriptions = {
  raw: '直接连接文件中的可见点。不经过镜子惯性、残影和辉光；随同一节目时钟切换帧。',
  scanner: '真实扫描器计算镜子的位置与速度，显示随时间衰减的轨迹。此阶段关闭辉光与空气光束。',
  full: '扫描轨迹加上辉光和空气光束。图案本身仍来自同一份文件。',
};
let renderer, scene, camera, show, pipeline, orbit, raw, wall, currentFrame = -1, lastUpdate = performance.now(), loadToken = 0;
let programs = [], galleryFilter = 'all', carousel;
const status = (message, error = false) => { $('status').textContent = message; $('status').classList.toggle('error', error); };
async function initGallery() {
  const response = await fetch(new URL('shows/catalog.json', base));
  if (!response.ok) throw new Error(`节目目录读取失败（${response.status}）`);
  programs = await response.json();
  carousel = new ProgramCarousel(programs.map(entry => entry.id));
  for (const origin of ['upstream', 'original']) {
    const group = document.createElement('optgroup'); group.label = origin === 'upstream' ? '上游节目 · 18' : '本地原创 · 4';
    for (const entry of programs.filter(p => p.origin === origin)) {
      const option = document.createElement('option'); option.value = entry.id; option.textContent = entry.name; group.append(option);
    }
    $('program').append(group);
  }
  for (const entry of programs) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'sample-card'; button.dataset.sample = entry.id; button.dataset.origin = entry.origin;
    button.setAttribute('aria-pressed', 'false'); button.setAttribute('aria-label', `播放${entry.name}`);
    const image = document.createElement('img'); image.src = new URL(entry.preview, base).href; image.alt = ''; image.loading = 'lazy'; image.width = 240; image.height = 130;
    const info = document.createElement('span'); info.className = 'sample-info';
    const title = document.createElement('strong'); title.textContent = entry.name;
    const source = document.createElement('small'); source.className = 'sample-en'; source.textContent = entry.origin === 'upstream' ? `上游 · ${entry.en}` : '本地原创';
    const note = document.createElement('small'); note.textContent = entry.note;
    info.append(title, source, note); button.append(image, info);
    button.addEventListener('click', async () => {
      await loadSample(entry.id);
      $('experiment').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }); $('sample-list').append(button);
  }
  filterGallery();
}
function filterGallery() {
  const query = $('program-search').value.trim().toLocaleLowerCase();
  let count = 0;
  for (const entry of programs) {
    const visible = (galleryFilter === 'all' || galleryFilter === entry.origin) && `${entry.name} ${entry.en ?? ''}`.toLocaleLowerCase().includes(query);
    document.querySelector(`[data-sample="${entry.id}"]`).hidden = !visible;
    if (visible) count++;
  }
  $('gallery-count').textContent = `${count} / ${programs.length} 个节目`;
  $('gallery-empty').hidden = count > 0;
}
function stepProgram(direction) {
  const index = programs.findIndex(p => p.id === (state.requestedSample ?? state.sample));
  loadSample(programs[(index + direction + programs.length) % programs.length].id);
}
function setView(view) {
  state.view = view;
  const positions = { perspective: [5.7, 3.8, 8.3], front: [0, 1.7, 9.2], side: [7.5, 3.2, 2.5] };
  camera.position.set(...positions[view]); orbit.target.set(0, 1.65, .6); orbit.update();
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
}
function updateRaw() {
  if (!show.scanner || currentFrame === show.frame) return;
  currentFrame = show.frame;
  const frame = show.scanner.frames[show.frame], p = [], c = [];
  for (let i = 1; i < frame.count; i++) {
    if (frame.blank[i - 1] || frame.blank[i]) continue;
    for (const k of [i - 1, i]) {
      p.push(frame.position[k * 3] * 2.4, frame.position[k * 3 + 1] * 1.6, 0);
      c.push(frame.color[k * 3], frame.color[k * 3 + 1], frame.color[k * 3 + 2]);
    }
  }
  raw.geometry.dispose(); raw.geometry = new THREE.BufferGeometry();
  raw.geometry.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); raw.geometry.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
}
function setMode(mode) {
  state.mode = mode;
  raw.visible = mode === 'raw'; show.projection.visible = mode !== 'raw';
  show.beamMode = mode === 'full' && $('beams').checked ? 'Front' : 'Disabled';
  pipeline.glow.strength = mode === 'full' ? Number($('bloom').value) : 0;
  for (const id of ['gain', 'damping', 'decay', 'blank']) $(id).disabled = mode === 'raw';
  for (const id of ['bloom', 'beam', 'beams']) $(id).disabled = mode !== 'full';
  $('mode-description').textContent = descriptions[mode]; $('mode-label').textContent = `LIVE / ${modeNames[mode]}`;
  document.querySelectorAll('[data-mode]').forEach(b => { const on = b.dataset.mode === mode; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
}
function setPlaying(playing) {
  show.playing = playing; $('play').textContent = playing ? 'Ⅱ 暂停' : '▶ 播放'; $('play').setAttribute('aria-label', playing ? '暂停播放' : '继续播放');
  syncCarousel();
}
function restartProgram() {
  show.reset(); currentFrame = -1; carousel?.reset(show.scanner); updateRaw();
}
function syncCarousel() {
  if (!carousel) return;
  $('carousel-toggle').textContent = carousel.enabled ? '停止自动轮播' : '开启自动轮播';
  $('carousel-toggle').setAttribute('aria-pressed', String(carousel.enabled));
  const next = programs.find(entry => entry.id === carousel.nextId);
  const text = !carousel.enabled ? '轮播已关闭 · 可手动选择节目'
    : carousel.loading ? '正在加载下一节目…'
    : !show.playing ? '播放已暂停 · 轮播等待'
    : `第 ${show.frame + 1} / ${show.frameCount} 帧 · 播完后切换到 ${next?.name ?? ''}`;
  if ($('carousel-status').textContent !== text) $('carousel-status').textContent = text;
}
async function useBuffer(buffer, name, sampleId = null, token = ++loadToken, entry = {}) {
  if (token !== loadToken) return;
  const asset = parseProgram(buffer, entry);
  show.setData(asset, entry.track ?? asset.tracks.keys().next().value); state.buffer = buffer; state.sample = sampleId; state.requestedSample = sampleId; currentFrame = -1;
  // setData 默认预扫描第 1 帧；reset 才能让播放从第 1 帧的第 1 个点开始。
  show.reset(); carousel?.select(sampleId, show.scanner);
  state.inputName = name;
  const source = entry.origin === 'upstream' ? '上游节目' : sampleId ? '本地原创' : '用户导入';
  $('sample-label').textContent = `${name} / ${source} ILDA`;
  $('program').value = sampleId ?? '';
  const index = programs.findIndex(p => p.id === sampleId);
  $('program-position').textContent = index >= 0 ? `${String(index + 1).padStart(2, '0')} / ${programs.length}` : '本地文件';
  $('program-origin').textContent = source;
  $('seek').max = show.frameCount - 1;
  $('point-count').textContent = asset.totalPoints.toLocaleString();
  $('track').replaceChildren();
  for (const id of show.trackIds) { const option = document.createElement('option'); option.value = id; option.textContent = `设备 ${id}`; $('track').append(option); }
  $('track').value = show.track;
  document.querySelectorAll('[data-sample]').forEach(b => { const on = b.dataset.sample === sampleId; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
  // 文件链接使用 Blob 保留导入的数据，切换时释放旧对象 URL。
  if ($('download').dataset.url) URL.revokeObjectURL($('download').dataset.url);
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/octet-stream' }));
  $('download').href = url; $('download').dataset.url = url; $('download').download = entry.file?.split('/').at(-1) ?? name;
  setPlaying(true); setMode(state.mode); updateRaw();
  lastUpdate = performance.now();
  const fallback = asset.paletteFallbacks ? `；${asset.paletteFallbacks} 个无效调色板索引回退为白色` : '';
  status(`${source} · ${name} · ${asset.frames.length} 帧 · ${asset.totalPoints.toLocaleString()} 点 · ${asset.tracks.size} 轨道 · 解析 ${asset.parseTimeMs.toFixed(2)} ms${fallback}`);
}
async function loadSample(id) {
  const token = ++loadToken, def = programs.find(s => s.id === id);
  if (!def) return;
  state.requestedSample = id;
  carousel?.beginLoad(); syncCarousel();
  status(`读取 ${def.name}…`);
  try {
    const response = await fetch(new URL(def.file, base));
    if (!response.ok) throw new Error(`文件下载失败（${response.status}）`);
    await useBuffer(await response.arrayBuffer(), def.name, id, token, def);
  } catch (error) {
    if (token === loadToken) {
      state.requestedSample = state.sample; $('program').value = state.sample ?? '';
      const wasRotating = carousel?.enabled;
      if (carousel) { carousel.select(state.sample, show.scanner); carousel.setEnabled(false); syncCarousel(); }
      status(`${error.message}${wasRotating ? '；自动轮播已停止。' : ''}`, true);
    }
  }
}
function bindControls() {
  $('carousel-toggle').addEventListener('click', () => {
    carousel.setEnabled(!carousel.enabled);
    if (carousel.enabled) {
      if (state.sample && !carousel.loading) restartProgram();
      setPlaying(true);
      if (!state.sample) loadSample(programs[0].id);
    }
    syncCarousel();
  });
  $('program').addEventListener('change', () => { if ($('program').value) loadSample($('program').value); });
  $('program-prev').addEventListener('click', () => stepProgram(-1));
  $('program-next').addEventListener('click', () => stepProgram(1));
  $('program-search').addEventListener('input', filterGallery);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    galleryFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    filterGallery();
  }));
  const bindings = [
    ['rate', 'rate-value', 'pointRate', v => `${v.toLocaleString()} pps`],
    ['gain', 'gain-value', 'gain', v => v.toFixed(2)],
    ['damping', 'damping-value', 'dampening', v => v.toFixed(2)],
    ['decay', 'decay-value', 'lightDecay', v => v.toFixed(2)],
    ['blank', 'blank-value', 'blankingOffset', v => `${v} 点`],
    ['beam', 'beam-value', 'beamIntensity', v => v.toFixed(2)],
  ];
  for (const [id, output, property, format] of bindings) {
    const apply = () => {
      const v = Number($(id).value); show[property] = v; $(output).textContent = format(v);
      // 上游在暂停时调振镜参数会重建所选帧，需要同步新的扫描计数。
      if (!show.playing) carousel?.reset(show.scanner);
    };
    $(id).addEventListener('input', apply); apply();
  }
  $('bloom').addEventListener('input', () => { $('bloom-value').textContent = Number($('bloom').value).toFixed(1); if (state.mode === 'full') pipeline.glow.strength = Number($('bloom').value); });
  $('beams').addEventListener('change', () => setMode(state.mode));
  $('occlusion').addEventListener('change', () => { wall.visible = $('occlusion').checked; });
  $('play').addEventListener('click', () => setPlaying(!show.playing));
  $('restart').addEventListener('click', () => { restartProgram(); setPlaying(true); });
  $('seek').addEventListener('input', () => { setPlaying(false); show.seekFrame(Number($('seek').value)); currentFrame = -1; carousel?.reset(show.scanner); syncCarousel(); updateRaw(); });
  $('track').addEventListener('change', () => { show.setTrack(Number($('track').value)); $('seek').max = show.frameCount - 1; restartProgram(); syncCarousel(); });
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  $('reset').addEventListener('click', () => {
    const defaults = { rate: 12000, gain: .51, damping: .39, decay: .9, blank: -3, bloom: 8, beam: .9 };
    for (const [id, value] of Object.entries(defaults)) { $(id).value = value; $(id).dispatchEvent(new Event('input')); }
    $('beams').checked = true; $('occlusion').checked = false; wall.visible = false; setMode('full'); setView('perspective'); restartProgram(); setPlaying(true);
  });
  $('file').addEventListener('change', async () => {
    const file = $('file').files[0]; $('file').value = ''; if (!file) return;
    carousel.setEnabled(false); syncCarousel();
    const token = ++loadToken;
    try {
      if (file.size > 32 * 1024 * 1024) throw new Error('文件超过解析器 32 MiB 上限，请选择更小的节目。');
      await useBuffer(await file.arrayBuffer(), file.name, null, token);
    } catch (error) { if (token === loadToken) status(`无法导入：${error.message}`, true); }
  });
  $('capture').addEventListener('click', () => {
    try {
      render();
      const data = atob(renderer.domElement.toDataURL('image/png').split(',')[1]);
      const bytes = Uint8Array.from(data, c => c.charCodeAt(0)), link = $('image-download');
      if (link.dataset.url) URL.revokeObjectURL(link.dataset.url);
      const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      link.href = url; link.dataset.url = url; link.download = `ilda-${state.sample ?? 'import'}-${state.mode}.png`; link.hidden = false;
      status('当前画面已生成 PNG，点击「下载 PNG」获取文件。');
    } catch (error) { status(`画面保存失败：${error.message}`, true); }
  });
}
function drawTrace() {
  if (!show.scanner) return;
  const canvas = $('trace'), w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio, 2);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const scale = Math.min(w * .47, h * .46), x = n => w / 2 + n * scale, y = n => h / 2 - n * scale;
  ctx.strokeStyle = '#203a28'; ctx.lineWidth = .5; ctx.beginPath();
  for (let n = -1; n <= 1.001; n += .25) { ctx.moveTo(x(n), y(-1)); ctx.lineTo(x(n), y(1)); ctx.moveTo(x(-1), y(n)); ctx.lineTo(x(1), y(n)); } ctx.stroke();
  const frame = show.scanner.frames[show.frame]; ctx.strokeStyle = '#667f6a'; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 1; i < frame.count; i++) {
    if (frame.blank[i] || frame.blank[i - 1]) continue;
    const a = (i - 1) * 3, b = i * 3; ctx.moveTo(x(frame.position[a]), y(frame.position[a + 1])); ctx.lineTo(x(frame.position[b]), y(frame.position[b + 1]));
  } ctx.stroke(); ctx.setLineDash([]);
  const out = show.scanner.snapshot(show.lightDecay); ctx.lineWidth = 1.4;
  for (let i = 1; i < out.count; i++) {
    if (out.blank[i] || out.blank[i - 1]) continue;
    const a = (i - 1) * 3, b = i * 3, alpha = Math.max(out.color[b], out.color[b + 1], out.color[b + 2]); if (alpha < .02) continue;
    ctx.strokeStyle = `rgba(180,247,166,${Math.min(1, alpha)})`; ctx.beginPath(); ctx.moveTo(x(out.position[a]), y(out.position[a + 1])); ctx.lineTo(x(out.position[b]), y(out.position[b + 1])); ctx.stroke();
  }
  ctx.fillStyle = '#d7fbd0'; ctx.beginPath(); ctx.arc(x(show.scanner.x), y(show.scanner.y), 2.8, 0, Math.PI * 2); ctx.fill();
}
function render() { if (state.mode === 'raw') renderer.render(scene, camera); else pipeline.render(); }
async function init() {
  try {
    const playbackControls = ['play', 'restart', 'reset', 'track', 'file', 'seek', 'program', 'program-prev', 'program-next', 'carousel-toggle'];
    playbackControls.forEach(id => { $(id).disabled = true; });
    renderer = new THREE.WebGLRenderer({ canvas: $('view'), antialias: false, preserveDrawingBuffer: true });
    if (!renderer.extensions.has('EXT_color_buffer_float') && !renderer.extensions.has('EXT_color_buffer_half_float')) throw new Error('此浏览器缺少浮点颜色缓冲，完整光效需要支持该扩展的 WebGL 2 环境。');
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping; renderer.setClearColor(0x020805);
    renderer.debug.onShaderError = () => { state.errors.push('shader compile error'); status('着色器编译失败，请检查浏览器 GPU 支持。', true); };
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(39, 1, .1, 100);
    orbit = new OrbitControls(camera, renderer.domElement); orbit.enableDamping = true; orbit.minDistance = 4; orbit.maxDistance = 16; orbit.maxPolarAngle = Math.PI * .6;
    show = new LaserShow(null, { capacity: 4096, width: 4.8, height: 3.2 }); show.position.y = 1.7; scene.add(show);
    raw = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); raw.frustumCulled = false; show.add(raw);
    const grid = new THREE.GridHelper(16, 24, new THREE.Color(.018, .05, .025), new THREE.Color(.006, .026, .011)); grid.position.y = -.05; scene.add(grid);
    const screenFrame = new THREE.EdgesGeometry(new THREE.PlaneGeometry(5.2, 3.6));
    const screenOutline = new THREE.LineSegments(screenFrame, new THREE.LineBasicMaterial({ color: new THREE.Color(.016, .044, .024) })); screenOutline.position.y = 1.7; scene.add(screenOutline);
    const projector = new THREE.Mesh(new THREE.BoxGeometry(.4, .25, .55), new THREE.MeshBasicMaterial({ color: new THREE.Color(.025, .056, .032) }));
    projector.position.copy(show.projector.position); projector.position.z += .28; show.add(projector);
    const aperture = new THREE.Mesh(new THREE.SphereGeometry(.028, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(.12, .6, .2) })); aperture.position.copy(show.projector.position); show.add(aperture);
    wall = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(.013, .032, .02), side: THREE.DoubleSide })); wall.position.set(.45, 1.7, 1.4); wall.visible = false; scene.add(wall);
    const border = new THREE.LineSegments(new THREE.EdgesGeometry(wall.geometry), new THREE.LineBasicMaterial({ color: new THREE.Color(.06, .14, .08) })); border.position.z = .002; wall.add(border);
    pipeline = new LaserShowPipeline(renderer, scene, camera, { samples: 0, strength: 8, radius: 1, threshold: 0 }); pipeline.add(show);
    const resize = () => { const w = $('stage').clientWidth, h = $('stage').clientHeight; renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe($('stage')); resize(); setView('perspective'); bindControls();
    await initGallery();
    await loadSample(programs[0].id);
    if (!show.asset) throw new Error('ILDA 节目未成功加载。');
    $('loading').hidden = true; state.ready = true;
    playbackControls.forEach(id => { $(id).disabled = false; }); carousel.setEnabled(true); syncCarousel(); lastUpdate = performance.now();
    let counter = 0, fpsClock = performance.now(), lastTrace = 0;
    renderer.setAnimationLoop(now => {
      const elapsed = Math.max((now - lastUpdate) / 1000, 0), dt = Math.min(elapsed, .05); lastUpdate = now;
      if (document.hidden) return;
      show.update(carousel.playbackDelta(dt, show.pointRate, { playing: show.playing }));
      updateRaw(); orbit.update(); render(); state.framesRendered++; counter++;
      // 先提交片尾画面，再加载下一节目；完成依据是实际扫描完的点数。
      const nextProgram = carousel.advance({ playing: show.playing });
      if (nextProgram) loadSample(nextProgram);
      syncCarousel();
      $('seek').value = show.frame; $('frame-label').textContent = `${String(show.frame + 1).padStart(2, '0')} / ${show.frameCount}`;
      if (now - lastTrace > 65) { drawTrace(); lastTrace = now; }
      if (now - fpsClock > 500) {
        $('fps').textContent = `${Math.round(counter * 1000 / (now - fpsClock))} fps`; fpsClock = now; counter = 0;
        $('trail-count').textContent = `${show.scanner.count.toLocaleString()} 样本`;
        const frame = show.scanner.frames[show.frame]; $('show-rate').textContent = `${(show.pointRate / frame.count).toFixed(1)} 帧/s`;
      }
    });
    window.ildaLab = { state, show, pipeline, renderer, scene, camera, raw, wall, carousel, setMode, setView, setPlaying, useBuffer, loadSample, render };
  } catch (error) {
    state.errors.push(error.message); $('loading').hidden = false; $('loading').textContent = `引擎启动失败：${error.message}`; status(error.message, true);
    ['play', 'restart', 'capture', 'program', 'program-prev', 'program-next', 'carousel-toggle'].forEach(id => { $(id).disabled = true; });
  }
}
document.addEventListener('visibilitychange', () => { lastUpdate = performance.now(); });
window.addEventListener('pagehide', () => { renderer?.setAnimationLoop(null); pipeline?.dispose(); raw?.geometry.dispose(); raw?.material.dispose(); show?.dispose(); orbit?.dispose(); renderer?.dispose(); });
init();
