const ref = '255562b04b1e5ecaa4ba98e5c9aa191d5ba7f6fa';
const base = `https://github.com/echris6/motion-video-kit/blob/${ref}/business-motion-film/`;
const sources = {
  skill: ['Skill 工作流', base + 'SKILL.md'],
  grammar: ['动效规则', base + 'references/motion-grammar.md'],
  three: ['Three.js 渲染约定', base + 'references/three-js-patterns.md'],
  overlays: ['三维投影标注模板', base + 'templates/projected-overlays.js'],
  lab: ['组件实验模板', base + 'templates/component-lab.html'],
  scripts: ['测量与音频脚本', base.replace('/blob/', '/tree/') + 'scripts/'],
  gauntlet: ['独立评审机制', base + 'references/gauntlet.md'],
  quality: ['质量标准', base + 'references/quality-bar.md'],
  audio: ['音频设计', base + 'references/audio.md'],
  mix: ['离线混音源码', base + 'scripts/offline-mix.py'],
  alder: ['ALDER 案例复盘', base + 'references/case-study-alder.md'],
  duo: ['折叠手机案例复盘', base + 'references/case-study-duo.md'],
  references: ['28 部参考影片索引', base + 'references/launch-film-notes.md'],
  hyperframes: ['HyperFrames 渲染实现', 'https://github.com/heygen-com/hyperframes#how-it-works'],
  comparison: ['HyperFrames 与 Remotion', 'https://hyperframes.heygen.com/guides/hyperframes-vs-remotion'],
  remotion: ['Remotion 基础', 'https://www.remotion.dev/docs/the-fundamentals']
};
for (const anchor of document.querySelectorAll('[data-source]')) {
  anchor.href = sources[anchor.dataset.source][1];
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
}
document.querySelector('a[href="#reference-files"]').addEventListener('click', () => {
  document.querySelector('#reference-files').open = true;
});
const sourceList = document.querySelector('#source-list');
for (const [name, url] of Object.values(sources)) {
  const a = document.createElement('a');
  a.textContent = name + ' ↗'; a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; sourceList.append(a);
}
const layerCopy = {
  workflow: ['制作方法：把需求变成可执行的任务', 'Brief、参考片段、分镜、组件实验、全片评审与交付记录。Skill 由 AI 助手读取并执行；评审循环不由某个后台服务自动完成。', 'skill'],
  scene: ['画面层：每个动作都计算自时间 t', '文字与界面使用 HTML/SVG；动画可由 GSAP 统一控制。三维组件实现 render(t)，标注通过三维锚点投影到屏幕。本地例子选择适合软件工作流的二维代码动画。', 'three'],
  renderer: ['渲染层：定位，而不是等待实时播放', 'HyperFrames 将可定位动画跳转到每一帧对应的时间，再由 Chrome 绘制与捕获。机器渲染得慢，也不应改变时间轴上的动作。', 'hyperframes'],
  encode: ['输出层：将捕获的画面编码为视频', 'FFmpeg 负责视频编码和音频处理。本地提供可编辑的动画与实际 MP4 渲染；此演示没有配乐，不验证上游混音流程。', 'mix']
};
const layerDetail = document.querySelector('#layer-detail');
function showLayer(key) {
  const [title, copy, source] = layerCopy[key];
  layerDetail.replaceChildren();
  const strong = document.createElement('strong'); strong.textContent = title;
  const p = document.createElement('p'); p.textContent = copy;
  const a = document.createElement('a'); a.textContent = sources[source][0] + ' ↗'; a.href = sources[source][1]; a.target = '_blank'; a.rel = 'noopener noreferrer';
  layerDetail.append(strong, p, a);
  for (const button of document.querySelectorAll('[data-layer]')) { const active = button.dataset.layer === key; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); }
}
for (const button of document.querySelectorAll('[data-layer]')) button.addEventListener('click', () => showLayer(button.dataset.layer));
showLayer('workflow');

const frame = document.querySelector('#motion-frame');
const seek = document.querySelector('#seek');
const play = document.querySelector('#play');
const speed = document.querySelector('#speed');
const time = document.querySelector('#time');
const duration = 24;
let currentTime = 0, playing = false, lastTimestamp = 0, ready = false, animationFrame = 0;
let pendingRequests = new Map(), requestSequence = 0;
const format = t => `00:${String(Math.floor(t)).padStart(2, '0')}`;
function send(t, requestId) { frame.contentWindow.postMessage({ type: 'motion-seek', time: t, requestId }, location.origin); }
function update(t) {
  currentTime = Math.min(duration, Math.max(0, t));
  seek.value = String(currentTime);
  seek.setAttribute('aria-valuetext', `${currentTime.toFixed(1)} 秒，共 24 秒`);
  time.textContent = `${format(currentTime)} / 00:24`;
  send(currentTime);
  const chapter = currentTime < 4 ? 0 : currentTime < 9 ? 1 : currentTime < 14 ? 2 : currentTime < 20 ? 3 : 4;
  document.querySelectorAll('[data-time]').forEach((button, i) => { button.classList.toggle('selected', i === chapter); button.setAttribute('aria-pressed', String(i === chapter)); });
}
function setPlaying(value) {
  cancelAnimationFrame(animationFrame);
  playing = value; lastTimestamp = 0;
  play.innerHTML = playing ? '<span aria-hidden="true">Ⅱ</span> 暂停' : '<span aria-hidden="true">▶</span> 播放演示';
  play.setAttribute('aria-label', playing ? '暂停演示' : '播放演示');
  if (playing) animationFrame = requestAnimationFrame(tick);
}
function tick(timestamp) {
  if (!playing) return;
  if (lastTimestamp) update(currentTime + (timestamp - lastTimestamp) / 1000 * Number(speed.value));
  lastTimestamp = timestamp;
  if (currentTime >= duration) setPlaying(false);
  else animationFrame = requestAnimationFrame(tick);
}
play.addEventListener('click', () => { if (currentTime >= duration) update(0); setPlaying(!playing); });
document.querySelector('#replay').addEventListener('click', () => { update(0); if (!playing) setPlaying(true); });
seek.addEventListener('input', () => { setPlaying(false); update(Number(seek.value)); });
for (const button of document.querySelectorAll('[data-time]')) button.addEventListener('click', () => { setPlaying(false); update(Number(button.dataset.time)); });
document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); });
frame.addEventListener('load', () => update(currentTime));
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
  if (event.data?.type === 'motion-ready') { ready = true; update(currentTime); }
  if (event.data?.type === 'motion-state' && pendingRequests.has(event.data.requestId)) {
    const callback = pendingRequests.get(event.data.requestId); pendingRequests.delete(event.data.requestId); callback(event.data.state);
  }
});
function stateAt(t) {
  return new Promise((resolve, reject) => {
    const id = ++requestSequence;
    const timeout = setTimeout(() => { pendingRequests.delete(id); reject(new Error('动画响应超时')); }, 4000);
    pendingRequests.set(id, state => { clearTimeout(timeout); resolve(state); });
    send(t, id);
  });
}
document.querySelector('#test-seek').addEventListener('click', async event => {
  const button = event.currentTarget, output = document.querySelector('#seek-result');
  setPlaying(false); button.disabled = true; output.className = 'test-result';
  try {
    if (!ready) await stateAt(0);
    await stateAt(18); const fromLater = await stateAt(8);
    await stateAt(2); const fromEarlier = await stateAt(8);
    const equal = JSON.stringify(fromLater) === JSON.stringify(fromEarlier);
    output.textContent = equal ? `一致：18→8 秒与 2→8 秒，两条路径得到相同的 ${fromLater.length} 项布局状态。` : '两条路径存在差异，请查看研究记录。';
    output.classList.add(equal ? 'pass' : 'fail'); update(8);
  } catch { output.textContent = '暂时无法比较，请等待演示加载后重试。'; output.classList.add('fail'); }
  finally { button.disabled = false; }
});
const nav = [...document.querySelectorAll('.sidebar nav a')];
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { for (const a of nav) a.classList.toggle('active', a.hash === '#' + entry.target.id); }
}, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
document.querySelectorAll('main>section[id]').forEach(section => observer.observe(section));
fetch('./project.json').then(response => {
  if (!response.ok) throw new Error('研究元数据读取失败');
  return response.json();
}).then(data => {
  document.querySelector('#download').hidden = !data.renderAvailable;
  if (Array.isArray(data.summarySections) && data.summarySections.length) {
    const summary = document.querySelector('#overview-summary');
    summary.replaceChildren();
    for (const { label, text } of data.summarySections) {
      const item = document.createElement('div');
      const term = document.createElement('dt'); term.textContent = label;
      const definition = document.createElement('dd'); definition.textContent = text;
      item.append(term, definition); summary.append(item);
    }
  }
}).catch(() => {});
