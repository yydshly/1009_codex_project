import { SCORE, shotAt } from './score.js';
const frame = document.getElementById('journey-frame'), audio = document.getElementById('journey-audio');
const play = document.getElementById('journey-play'), slider = document.getElementById('journey-time');
const status = document.getElementById('journey-status'), choices = document.querySelectorAll('[data-journey-shot]');
let time = 0, running = false, pending = false, token = 0, raf = 0, lastPaint = 0, framePromise;
const options = { style: 'paint', tone: 'gold' };
function controls() {
  play.textContent = pending ? '准备声画…' : running ? '暂停原创 MV' : '播放原创 MV'; play.setAttribute('aria-pressed', String(running));
  slider.value = String(time); document.getElementById('journey-clock').textContent = time.toFixed(2) + ' / 32 s';
  const index = shotAt(time), shot = SCORE.shots[index];
  document.getElementById('journey-current').textContent = (index + 1) + ' / ' + shot.title;
  document.getElementById('journey-cue').textContent = shot.sync;
  document.getElementById('journey-beat').textContent = (Math.min(47, Math.floor(time / SCORE.beat)) + 1) + ' / 48 拍';
  choices.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.journeyShot) === index)));
}
function pause() { token++; running = pending = false; cancelAnimationFrame(raf); audio.pause(); controls(); }
function ensureFrame() {
  if (!framePromise) framePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('油画场景准备超时，可重试或查看底部真实截图。')), 15000);
    frame.addEventListener('load', () => { clearTimeout(timeout); frame.contentWindow.journeyReady ? resolve() : reject(new Error(frame.contentWindow.journeyError || '当前浏览器未启用 WebGL2。')); }, { once: true });
    frame.src = 'demo/player.html';
  }).catch(error => { framePromise = undefined; throw error; });
  return framePromise;
}
function paint() { const result = frame.contentWindow.renderJourneyFrame(time, options); frame.hidden = false; document.getElementById('journey-poster').hidden = true; return result; }
function fail(error) { pause(); status.textContent = error.message || '演示未能播放，请重试。'; }
async function repaint() { try { await ensureFrame(); paint(); controls(); } catch (error) { fail(error); } }
function syncAudio() { if (audio.readyState >= 1 && Math.abs(audio.currentTime - time) > .001) audio.currentTime = Math.min(time, audio.duration); }
function loop(now) {
  if (!running) return;
  time = Math.min(SCORE.duration, audio.currentTime);
  if (now - lastPaint >= 50) { try { paint(); controls(); lastPaint = now; } catch (error) { fail(error); return; } }
  raf = requestAnimationFrame(loop);
}
async function start() {
  document.dispatchEvent(new CustomEvent('study-playback-start', { detail: { source: 'journey' } }));
  pause(); if (time >= 31.99) time = 0; syncAudio();
  const request = ++token; pending = true; controls(); status.textContent = '正在准备原创音乐与油画场景…';
  try {
    await Promise.all([ensureFrame(), audio.play()]);
    if (request !== token) return;
    time = audio.currentTime; paint(); running = true; pending = false; lastPaint = 0; controls();
    status.textContent = '原创音乐正在驱动画面时间；切镜、光点、水纹和树的生长按同一乐谱编排。'; raf = requestAnimationFrame(loop);
  } catch (error) { if (request === token) fail(error); }
}
play.addEventListener('click', () => { if (running || pending) pause(); else void start(); });
document.getElementById('journey-reset').addEventListener('click', () => { pause(); time = 0; syncAudio(); void repaint(); status.textContent = '已回到开头，点击播放可重新观看。'; });
slider.addEventListener('input', () => { const next = Number(slider.value); pause(); time = next; syncAudio(); void repaint(); });
choices.forEach(button => button.addEventListener('click', () => { pause(); time = SCORE.shots[Number(button.dataset.journeyShot)].start; syncAudio(); void repaint(); }));
for (const name of ['style', 'tone']) document.getElementById('journey-' + name).addEventListener('change', event => { options[name] = event.target.value; if (!running) void repaint(); });
document.getElementById('journey-mute').addEventListener('click', event => { audio.muted = !audio.muted; event.currentTarget.textContent = audio.muted ? '开启声音' : '关闭声音'; event.currentTarget.setAttribute('aria-pressed', String(audio.muted)); });
audio.addEventListener('loadedmetadata', syncAudio);
audio.addEventListener('ended', () => { time = SCORE.duration; pause(); void repaint(); status.textContent = '32 秒原创 MV 已播放完毕，可重播、换配色或比较底画与油画。'; });
audio.addEventListener('error', () => fail(new Error('原创音频加载失败，请刷新页面后重试。')));
document.addEventListener('study-playback-start', event => { if (event.detail.source !== 'journey') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
new IntersectionObserver(entries => { if (!entries[0].isIntersecting && (running || pending)) pause(); }).observe(document.getElementById('original-demo'));
window.journeyState = () => ({ time, running, pending, shot: shotAt(time), options: { ...options }, audioTime: audio.currentTime, audioPaused: audio.paused, muted: audio.muted, duration: audio.readyState ? audio.duration : 0 });
controls();
fetch('assets/demo/export-status.json').then(response => response.json()).then(result => { document.getElementById('journey-mp4').hidden = !result.mp4Available; }).catch(() => {});
