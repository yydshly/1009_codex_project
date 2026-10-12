const frame = document.getElementById('live-blueprint');
const toggle = document.getElementById('live-toggle');
const seek = document.getElementById('live-seek');
const status = document.getElementById('live-status');
let ready = false, running = false, visible = false, manuallyPaused = false;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const control = (action, value) => { if (ready) frame.contentWindow.postMessage({type:'lemo-blueprint-control',action,value}, location.origin); };
function resume() { for (const video of document.querySelectorAll('video')) video.pause(); control('play'); }
window.addEventListener('message', event => {
  if (event.source !== frame.contentWindow || event.origin !== location.origin || event.data?.type !== 'lemo-blueprint-preview') return;
  if (event.data.error) { status.textContent = event.data.error; return; }
  const firstReady = !ready;
  ready = event.data.ready; running = event.data.running;
  toggle.disabled = !ready; seek.disabled = !ready;
  seek.max = event.data.duration; seek.value = event.data.time;
  document.getElementById('live-time').textContent = `${event.data.time.toFixed(1)} / ${event.data.duration.toFixed(1)} 秒`;
  toggle.textContent = running ? '暂停演示 Ⅱ' : '继续播放 ▶';
  status.textContent = running ? '上游蓝图画面源码正在本地运行 · 静音画面演示' : '画面已就绪，可播放或拖动时间查看；本地文件无需联网。';
  if (firstReady && visible && !reducedMotion) resume();
});
toggle.addEventListener('click', () => { manuallyPaused = running; if (running) control('pause'); else resume(); });
seek.addEventListener('input', () => { control('pause'); manuallyPaused = true; control('seek', Number(seek.value)); });
document.querySelectorAll('[data-demo-time]').forEach(button => button.addEventListener('click', () => { control('seek', Number(button.dataset.demoTime)); manuallyPaused = false; resume(); }));
new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  if (!visible) control('pause');
  else if (ready && !manuallyPaused && !reducedMotion) resume();
}, {threshold:.2}).observe(frame);
document.addEventListener('visibilitychange', () => { if (document.hidden) control('pause'); else if (visible && !manuallyPaused && !reducedMotion) resume(); });
