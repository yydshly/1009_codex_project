const base = 'https://github.com/ledbetterljoshua/functional-emotions-video/';
const commit = 'b34c20a4f8f64ee87079a2ae2fdedf2cf1990a49';
document.querySelectorAll('[data-source]').forEach(link => {
  link.href = link.dataset.source ? `${base}blob/${commit}/${link.dataset.source}` : `${base}tree/${commit}`;
  link.target = '_blank'; link.rel = 'noopener noreferrer';
});
const frames = [
  [30, 'I · 光瀑与诞生', '光流、湖面与暖色人物'], [55, 'II · 捕捉火种', '暖色空间、火种与研究者'],
  [83, 'III · 牵线舞台', '舞台、绳索与火种'], [120, 'IV · 海面与水下', '深蓝海面与划船人物'],
  [170, 'V · 面具与观察', '面具意象与观察者'], [220, 'VI · 湖底与房间', '暖色人物与幽暗水面'],
  [290, 'VII · 风暴与流光', '流动的笔触、色彩与光线'], [350, 'VIII · 火与测量', '发光线条与圆形测量意象'],
];
const gallery = document.getElementById('frame-gallery');
const dialog = document.getElementById('frame-dialog');
for (const [time, title, description] of frames) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'frame';
  const image = document.createElement('img'); image.src = `assets/frames/t-${time}.jpg`; image.alt = description; image.width = 1920; image.height = 1080; image.loading = 'lazy';
  const label = document.createElement('span'); label.className = 'frame-label';
  const heading = document.createElement('strong'); heading.textContent = title;
  const stamp = document.createElement('span'); stamp.textContent = `${time}.00 s`; label.append(heading, stamp); button.append(image, label);
  button.addEventListener('click', () => { const full = document.getElementById('dialog-image'); full.src = image.src; full.alt = description; document.getElementById('dialog-caption').textContent = `${title} · ${time} 秒。原项目代码在本机渲染的实际画面，1920 × 1080。`; dialog.showModal(); });
  gallery.append(button);
}
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
const chapters = [
  ['I', '汇流与诞生', '0–44.8 s', '夜城中的光线汇成河流，倾入湖泊，暖色人物从湖中站起。'],
  ['II', '打开与捕捉', '44.8–66.3 s', '研究者打开人物的身体，捕捉并观察内部的火种。'],
  ['III', '牵线与表演', '66.3–98.4 s', '舞台、绳索和实验装置，把观察变成可见的控制。'],
  ['IV', '边界与水下', '98.4–134.5 s', '印章、边界与海面，将外在平静和水下变化放在一起。'],
  ['V', '自述与面具', '134.5–185.2 s', '纸张、面具与观察意象，表达自述与评价之间的距离。'],
  ['VI', '潜入与回应', '185.2–245.9 s', '人物潜入湖底，湖面形成面孔，随后穿过水中的房间与光门。'],
  ['VII', '风暴与方向', '245.9–298.4 s', '驾车、风暴与舞蹈，把内在变化转成方向、动作和节奏。'],
  ['VIII', '火焰与回流', '298.4–372.7 s', '测量与火焰意象交替，最后回到湖泊与一处温暖的光。'],
];
for (const [number, title, time, description] of chapters) {
  const detail = document.createElement('details'); const summary = document.createElement('summary');
  const numberNode = document.createElement('span'); numberNode.textContent = number; summary.append(numberNode, title);
  const p = document.createElement('p'); p.textContent = description; const small = document.createElement('small'); small.textContent = `${time} · 依据原分镜的中文概述`; p.append(small); detail.append(summary, p); document.getElementById('chapters').append(detail);
}
const scenarios = {
  science: { title: '让抽象机制变成可见的故事', summary: '用光流、粒子、颜色与人物动作，讲解能量流动、信号传递或系统反馈。', input: '经过核对的知识点、简短解说稿、可使用的音频与分镜。', reuse: '笔触渲染、时间轴、光线与水面，以及逐帧审查方法。', work: '为科学对象绘制准确的模型与标注；按解说节奏重写镜头。', value: '价值：把概念讲清楚，同时保留鲜明的视觉风格。准确性需单独审查。' },
  culture: { title: '把诗歌与地方故事画成短片', summary: '围绕一种地方意象或一段文学主题，用有限的人物与场景形成连续叙事。', input: '可使用的文字、历史或文化依据、原创配乐与色彩方向。', reuse: '剪影人物、城市与自然场景、章节结构和匹配转场。', work: '绘制符合主题的人物、服饰与场景；建立新的镜头与时间点。', value: '价值：形成可以反复修改、用于导览或展陈的艺术影像。' },
  brand: { title: '为品牌故事建立一种画面语言', summary: '用产品诞生、人与物的关系或材料变化，编排一段风格统一的叙事短片。', input: '明确的品牌故事、视觉规范、产品资料和可使用的音频。', reuse: '统一调色、发光与笔触、可控镜头时间及截图评审。', work: '新增产品几何与精细特写；适配画幅、字幕和导出流程。', value: '价值：形成可改色、改节奏、改镜头的原创动画素材。' },
  stage: { title: '让舞台背景跟随音乐呼吸', summary: '把火种、光流、水面与旋涡组织成循环画面，配合现场音乐段落。', input: '音乐结构、屏幕规格、演出节奏与可使用的视觉素材。', reuse: '节拍脉冲、音频特征、笔触变化与发光层。', work: '新增实时音频输入、循环衔接、多屏适配和现场性能验证。', value: '价值：从预制 MV 的时间轴，扩展为随现场变化的视觉系统。' },
};
const tabs = [...document.querySelectorAll('[data-scenario]')];
function chooseScenario(key) {
  const item = scenarios[key];
  for (const tab of tabs) { const selected = tab.dataset.scenario === key; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; }
  document.getElementById('scenario-panel').setAttribute('aria-labelledby', `tab-${key}`);
  for (const field of ['title', 'summary', 'input', 'reuse', 'work', 'value']) document.getElementById(`scenario-${field}`).textContent = item[field];
}
tabs.forEach((tab, index) => { tab.addEventListener('click', () => chooseScenario(tab.dataset.scenario)); tab.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; chooseScenario(tabs[next].dataset.scenario); tabs[next].focus(); } }); });
chooseScenario('science');

const scenes = {
  birth: { a: 28.8, b: 30.98, poster: 30, chapter: 'I', title: '光瀑与诞生', description: '光流、水面与人物在同一时间轴上变化。粗细不一的笔触把几何底画转成油画。' },
  city: { a: 17.2, b: 20.26, poster: 19, chapter: 'I', title: '城市与光河', description: '镜头缓慢移动，城市窗光、天空光河和水平方向的笔触共同塑造深度。' },
  lake: { a: 213.53, b: 215.99, poster: 214.8, chapter: 'VI', title: '湖面睁眼', description: '湖面逐渐成为一张面孔。简化形状、光影和笔触承载一个明确的叙事动作。' },
  door: { a: 243.4, b: 245.88, poster: 244.4, chapter: 'VI', title: '推开光门', description: '推门动作、身体剪影、水面与背光同时变化，结尾用闪光衔接下一个章节。' },
};
const iframe = document.getElementById('reference-player'), play = document.getElementById('play'), timeline = document.getElementById('timeline');
const status = document.getElementById('player-status'), audio = document.getElementById('local-audio');
const audioStatus = document.getElementById('audio-status'), audioInput = document.getElementById('local-audio-file');
const originalAudioButton = document.getElementById('original-audio');
const originalAudioUrl = `https://raw.githubusercontent.com/ledbetterljoshua/functional-emotions-video/${commit}/assets/functional-emotions.mp3`;
const chapterStarts = [0, 44.8, 66.3, 98.4, 134.5, 185.2, 245.9, 298.4, 372.7];
let mode = 'full', sceneKey = 'birth', time = 0, running = false, raf = 0, lastClock = 0, lastPaint = 0, overrides = {};
let readyPromise, audioUrl = '', audioName = '', audioKind = '', audioReady = false, silentMode = false, playbackToken = 0;
function range() { return mode === 'full' ? { a: 0, b: 372.69 } : scenes[sceneKey]; }
function chapterIndex() { const index = chapterStarts.findIndex((start, i) => i < 8 && time >= start && time < chapterStarts[i + 1]); return index < 0 ? 7 : index; }
function updateControls() {
  timeline.value = String(time); document.getElementById('clock').textContent = time.toFixed(2) + ' s';
  play.setAttribute('aria-pressed', String(running));
  document.getElementById('play-label').textContent = running ? '暂停' : mode === 'full' ? (audioKind === 'original' || (!audioUrl && !silentMode) ? '播放原版 MV' : '播放全片') : '播放片段';
  play.querySelector('.play-symbol').textContent = running ? 'Ⅱ' : '▶';
  document.getElementById('playback-label').textContent = (mode === 'full' ? '完整画面' : '精选实验') + (audioReady ? (audioKind === 'original' ? ' / 原版音乐同步' : ' / 本地音频同步') : audioKind === 'original' ? ' / 原曲加载中' : silentMode ? ' / 静音' : ' / 点击播放原版音乐');
  originalAudioButton.textContent = audioKind === 'original' && running ? '暂停原版音乐' : '播放原版音乐';
  if (mode === 'full') {
    const index = chapterIndex(), chapter = chapters[index];
    document.getElementById('scene-title').textContent = chapter[1];
    document.getElementById('scene-description').textContent = chapter[3];
    document.getElementById('scene-stamp').textContent = chapter[0] + ' · ' + chapter[1];
    document.querySelectorAll('[data-chapter]').forEach(button => { const selected = Number(button.dataset.chapter) === index; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected)); });
  }
}
function pause() { playbackToken++; running = false; cancelAnimationFrame(raf); audio.pause(); play.disabled = false; originalAudioButton.disabled = false; updateControls(); }
function syncAudio() {
  if (audioReady && time < audio.duration && Math.abs(audio.currentTime - time) > .001) audio.currentTime = time;
}
function ensurePlayer() {
  if (!readyPromise) {
    status.textContent = '正在准备原代码画面…';
    readyPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('准备超时，请重试或查看下方真实截图。')), 15000);
      iframe.addEventListener('load', () => { clearTimeout(timeout); if (iframe.contentWindow.referenceReady) resolve(); else reject(new Error('当前浏览器未能启用 WebGL2，可继续查看下方真实截图。')); }, { once: true });
      iframe.src = 'player/index.html';
    }).catch(error => { readyPromise = undefined; status.textContent = error.message; throw error; });
  }
  return readyPromise;
}
async function paintFrame() {
  await ensurePlayer();
  iframe.contentWindow.renderReferenceFrame(time, overrides); iframe.hidden = false;
  status.textContent = audioReady ? (audioKind === 'original' ? '原版音乐与八章画面同步播放；暂停、章节定位和拖动同时控制声音。' : '画面跟随本地音频的播放时间。使用原歌曲时，可观察原镜头与音乐同步。') : '八章完整画面可观看。点击播放原版音乐，或选择静音观看。';
}
function reportError(error) { pause(); status.textContent = error.message || '当前画面未能加载，可查看下方截图。'; }
function repaint() { void paintFrame().catch(reportError); }
function loop(now) {
  if (!running) return;
  time = audioReady ? audio.currentTime : time + Math.min((now - lastClock) / 1000, .15); lastClock = now;
  const selected = range();
  if (time >= selected.b) {
    if (mode === 'full') { time = selected.b; pause(); repaint(); status.textContent = '完整画面播放结束。点击重播可从开头观看。'; return; }
    time = selected.a + (time - selected.a) % (selected.b - selected.a); syncAudio();
  }
  if (now - lastPaint >= 50) {
    try { iframe.contentWindow.renderReferenceFrame(time, overrides); lastPaint = now; updateControls(); }
    catch (error) { reportError(error); return; }
  }
  raf = requestAnimationFrame(loop);
}
async function startPlayback(options = {}) {
  document.dispatchEvent(new CustomEvent('study-playback-start', { detail: { source: 'reference' } }));
  pause();
  if (options.silent) clearAudio();
  else if (options.original || (!audioUrl && !silentMode)) selectOriginalAudio();
  if (time >= range().b) time = range().a;
  const token = ++playbackToken;
  play.disabled = true; originalAudioButton.disabled = true;
  let timeout;
  try {
    syncAudio();
    // Start media inside the click handler so browsers retain the user gesture.
    const mediaPlayback = audioUrl ? audio.play() : Promise.resolve();
    await Promise.all([ensurePlayer(), Promise.race([mediaPlayback, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('音乐加载超时，请重试、选择本地音频，或静音观看。')), 60000); })])]);
    if (token !== playbackToken) return;
    if (audioUrl && !audioReady) throw new Error('音频尚未就绪，请重试或更换音频。');
    if (audioReady) {
      if (time >= audio.duration) throw new Error('音频不足以覆盖当前时刻。请更换音频，或静音观看。');
      time = audio.currentTime;
    }
    await paintFrame();
    if (token !== playbackToken) return;
    running = true; lastClock = performance.now(); lastPaint = 0; updateControls(); raf = requestAnimationFrame(loop);
  } catch (error) {
    if (token === playbackToken) { reportError(error); audioStatus.textContent = audioKind === 'original' ? '原曲未能播放，请重试，或选择本地音频、静音观看。' : error.message; }
  } finally { clearTimeout(timeout); if (token === playbackToken) { play.disabled = false; originalAudioButton.disabled = false; } }
}
play.addEventListener('click', () => { if (running) pause(); else void startPlayback(); });
timeline.addEventListener('input', () => { const selectedTime = Number(timeline.value); pause(); time = selectedTime; syncAudio(); updateControls(); repaint(); });
document.getElementById('reset').addEventListener('click', () => { pause(); time = range().a; syncAudio(); updateControls(); repaint(); });
function setMode(next) {
  mode = next;
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === next)));
  document.getElementById('chapter-navigation').hidden = next !== 'full'; document.getElementById('scene-list').hidden = next !== 'samples';
  const selected = range(); timeline.min = selected.a; timeline.max = selected.b;
}
function chooseChapter(index) {
  pause(); setMode('full'); time = chapterStarts[index]; syncAudio(); updateControls(); repaint();
}
function chooseScene(key) {
  pause(); sceneKey = key; setMode('samples'); const scene = scenes[key]; time = scene.poster;
  document.getElementById('scene-title').textContent = scene.title; document.getElementById('scene-description').textContent = scene.description;
  document.getElementById('scene-stamp').textContent = scene.chapter + ' · ' + scene.title;
  document.querySelectorAll('[data-scene]').forEach(button => { const selected = button.dataset.scene === key; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected)); });
  syncAudio(); updateControls(); repaint();
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.mode === 'samples') chooseScene(sceneKey);
  else { pause(); setMode('full'); syncAudio(); updateControls(); repaint(); }
}));
chapters.forEach((chapter, index) => {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'scene'; button.dataset.chapter = index; button.setAttribute('aria-pressed', String(index === 0));
  const number = document.createElement('span'); number.textContent = chapter[0];
  const stamp = document.createElement('small'); stamp.textContent = chapter[2];
  button.append(number, chapter[1], stamp); button.addEventListener('click', () => chooseChapter(index)); document.getElementById('chapter-navigation').append(button);
  const jump = document.createElement('button'); jump.className = 'chapter-jump'; jump.type = 'button'; jump.textContent = '定位此章';
  jump.addEventListener('click', () => { chooseChapter(index); document.querySelector('.showcase').scrollIntoView({ behavior: 'instant', block: 'start' }); play.focus({ preventScroll: true }); });
  document.querySelectorAll('.chapters details')[index].append(jump);
});
document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => chooseScene(button.dataset.scene)));
document.getElementById('stroke').addEventListener('input', event => { overrides.strokeK = Number(event.target.value); document.getElementById('stroke-value').textContent = overrides.strokeK.toFixed(2); repaint(); });
document.getElementById('boil').addEventListener('input', event => { overrides.boil = Number(event.target.value); document.getElementById('boil-value').textContent = overrides.boil + ' 次 / 秒'; repaint(); });
document.getElementById('restore').addEventListener('click', () => { overrides = {}; document.getElementById('stroke').value = 1; document.getElementById('stroke-value').textContent = '1.00'; document.getElementById('boil').value = 7; document.getElementById('boil-value').textContent = '原场景设置'; repaint(); });
document.getElementById('choose-audio').addEventListener('click', () => audioInput.click());
function releaseAudioUrl() { if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl); }
function selectOriginalAudio() {
  if (audioKind === 'original' && audioReady) return;
  releaseAudioUrl(); audioReady = false; silentMode = false; audioKind = 'original'; audioName = 'Functional Emotions 原版音乐'; audioUrl = originalAudioUrl; audioInput.value = '';
  audio.src = audioUrl; audio.load(); document.getElementById('clear-audio').hidden = false;
  audioStatus.textContent = '正在加载原仓库的原版音乐…首次播放需要联网。'; updateControls();
}
originalAudioButton.addEventListener('click', () => { if (audioKind === 'original' && running) pause(); else void startPlayback({ original: true }); });
document.getElementById('silent-play').addEventListener('click', () => void startPlayback({ silent: true }));
function clearAudio() {
  pause(); audioReady = false; audio.removeAttribute('src'); audio.load(); releaseAudioUrl();
  audioUrl = ''; audioName = ''; audioKind = ''; silentMode = true; audioInput.value = ''; document.getElementById('clear-audio').hidden = true;
  audioStatus.textContent = '当前为静音观看。点击“播放原版音乐”可恢复声音，也可选择本地音频。'; updateControls();
}
document.getElementById('clear-audio').addEventListener('click', clearAudio);
audioInput.addEventListener('change', () => {
  const file = audioInput.files[0]; if (!file) return;
  pause(); releaseAudioUrl();
  audioReady = false; silentMode = false; audioKind = 'local'; audioName = file.name; audioUrl = URL.createObjectURL(file); audio.src = audioUrl;
  document.getElementById('clear-audio').hidden = false; audioStatus.textContent = '正在读取本地音频：' + audioName; audio.load();
});
audio.addEventListener('loadedmetadata', () => {
  if (!audioUrl) return;
  audioReady = Number.isFinite(audio.duration) && audio.duration > 0; syncAudio();
  audioStatus.textContent = audioReady ? (audioKind === 'original' ? '已加载原版音乐（' + audio.duration.toFixed(1) + ' 秒），声音与画面按同一时间播放。' : '已加载 ' + audioName + '（' + audio.duration.toFixed(1) + ' 秒）。文件未上传；其他音频只作为伴随声音。') : '该音频时长无法读取，请更换文件。'; updateControls();
});
audio.addEventListener('error', () => { if (!audioUrl) return; pause(); audioReady = false; audioStatus.textContent = audioKind === 'original' ? '原版音乐未能播放，请检查网络后重试，或选择本地音频、静音观看。' : '音频未能播放，请更换文件或移除音频。'; updateControls(); });
audio.addEventListener('waiting', () => { if (audioKind === 'original') audioStatus.textContent = '原版音乐正在缓冲，请稍候…'; });
audio.addEventListener('playing', () => { if (audioKind === 'original') audioStatus.textContent = '原版音乐已加载，暂停、拖动和章节定位会同时控制声音与画面。'; });
audio.addEventListener('ended', () => { if (!audioReady) return; time = Math.min(audio.duration, range().b); pause(); repaint(); audioStatus.textContent = '音频已结束。点击重播可从开头观看。'; });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('pagehide', releaseAudioUrl);
document.addEventListener('study-playback-start', event => { if (event.detail.source !== 'reference') pause(); });
new IntersectionObserver(entries => { if (!entries[0].isIntersecting && running) pause(); }).observe(document.querySelector('.showcase'));
window.studyState = () => ({ mode, scene: sceneKey, time, running, overrides: { ...overrides }, audio: { loaded: Boolean(audioUrl), ready: audioReady, kind: audioKind, name: audioName, duration: audioReady ? audio.duration : 0, currentTime: audio.currentTime, paused: audio.paused } });
updateControls();
