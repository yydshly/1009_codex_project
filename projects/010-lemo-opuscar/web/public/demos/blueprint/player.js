// Local preview controls only. Original drawing modules remain unmodified.
let time = 8, running = false, duration = 46.667, previous = 0, lastFrame = 0;
const send = extra => parent.postMessage({ type:'lemo-blueprint-preview', time, running, duration, ...extra }, location.origin);
try {
  // Keep original 1920×1080 drawing coordinates, composite a lighter 960×540 preview.
  const canvas = document.getElementById('c'); canvas.width = 960; canvas.height = 540;
  const gl = canvas.getContext('webgl2', {preserveDrawingBuffer:true,antialias:false});
  if (!gl) throw new Error('WebGL2 unavailable');
  const viewport = gl.viewport.bind(gl);
  gl.viewport = () => viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);
  await import('./main.js');
  duration = window.DUR;
  window.render(time);
  window.previewState = { ready:true, time, running, duration, frames:1 };
  const draw = () => { window.render(time); Object.assign(window.previewState, {time,running}); window.previewState.frames++; send({ready:true}); };
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'lemo-blueprint-control') return;
    const { action, value } = event.data;
    if (action === 'play') { running = true; previous = performance.now(); }
    if (action === 'pause') running = false;
    if (action === 'seek' && Number.isFinite(value)) { time = Math.max(0, Math.min(duration - .001, value)); previous = performance.now(); }
    draw();
  });
  function tick(now) {
    if (running && now - lastFrame >= 1000 / 12) {
      time = (time + (now - previous) / 1000) % duration;
      previous = now; lastFrame = now; draw();
    }
    requestAnimationFrame(tick);
  }
  send({ready:true}); requestAnimationFrame(tick);
} catch (error) {
  const message = '本地蓝图画面未能启动，请使用支持 WebGL2 的浏览器。';
  const panel = document.getElementById('error'); panel.style.display = 'grid'; panel.textContent = message;
  send({ready:false,error:message}); console.error(error);
}
