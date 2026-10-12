(() => {
  'use strict';
  const frame = document.getElementById('garden-frame');
  const status = document.getElementById('garden-status');
  const pause = document.getElementById('garden-pause');
  const burst = document.getElementById('garden-burst');
  const view = document.getElementById('view-toggle');
  const explanations = ['数学曲面生成花瓣。同一批粒子可以重新排布成不同形态。', '相同粒子重新定位成环。位置与光色连续过渡，观察形态之间的关系。', '粒子沿旋臂分布成星系。在纯效果模式拖动旋转，观察空间层次。'];
  let state = { available: false, paused: false, form: 0, reducedMotion: false };
  let effectOnly = false;
  let effectNote = '';
  const targetOrigin = location.origin === 'null' ? '*' : location.origin;
  function send(action, data = {}) { frame.contentWindow.postMessage({ type: 'astra-garden-command', action, ...data }, targetOrigin); }
  function render() {
    document.body.classList.toggle('background-ready', state.available);
    for (const button of document.querySelectorAll('[data-garden-form]')) { button.disabled = !state.available; button.setAttribute('aria-pressed', String(Number(button.dataset.gardenForm) === state.form)); }
    document.getElementById('form-explanation').textContent = effectNote || explanations[state.form];
    pause.disabled = view.disabled = !state.available;
    burst.disabled = !state.available || state.reducedMotion;
    pause.textContent = state.paused ? '继续背景' : '暂停背景';
    pause.setAttribute('aria-pressed', String(state.paused));
    status.textContent = !state.available ? 'WebGL 暂不可用，说明图仍可阅读；可尝试开启硬件加速。' : state.reducedMotion ? '系统已减少动态效果：默认暂停，仍可换形。' : state.paused ? '背景已暂停，可以仔细观察结构。' : '本地原作正在运行 · 静音 · 无模型调用';
  }
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
    if (event.data?.type === 'astra-garden-exit' && effectOnly) { setView(false); view.focus(); return; }
    if (event.data?.type !== 'astra-garden-state') return;
    const data = event.data;
    if (typeof data.available !== 'boolean' || typeof data.paused !== 'boolean' || !Number.isInteger(data.form) || data.form < 0 || data.form > 2 || typeof data.reducedMotion !== 'boolean') return;
    if (data.form !== state.form) effectNote = '';
    clearTimeout(loadingTimeout); state = data; render();
  });
  for (const button of document.querySelectorAll('[data-garden-form]')) button.addEventListener('click', () => { effectNote = ''; send('form', { form: Number(button.dataset.gardenForm) }); });
  pause.addEventListener('click', () => send('pause', { paused: !state.paused }));
  burst.addEventListener('click', () => { effectNote = '粒子短暂散开再聚拢。这是艺术化的引力想象，并非真实物理模拟。'; send('burst'); render(); });
  function setView(value) {
    effectOnly = value;
    document.body.classList.toggle('effect-only', value);
    document.getElementById('overview-figure').hidden = value;
    document.getElementById('effect-hint').hidden = !value;
    view.textContent = value ? '返回说明图' : '只看背景效果';
    view.setAttribute('aria-pressed', String(value));
    frame.setAttribute('aria-hidden', String(!value));
    frame.parentElement.setAttribute('aria-hidden', String(!value));
    frame.tabIndex = value ? 0 : -1;
    if (value) window.scrollTo({ top: 0, behavior: 'instant' });
  }
  view.addEventListener('click', () => setView(!effectOnly));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && effectOnly) { setView(false); view.focus(); } });
  frame.addEventListener('error', () => { status.textContent = '背景加载失败，说明图仍可阅读。'; });
  frame.addEventListener('load', () => send('state'));
  const loadingTimeout = setTimeout(() => { status.textContent = '背景暂未加载，可先阅读说明图，或打开完整原作。'; }, 8000);
  // Request state when the iframe finished before the parent's deferred script.
  // A later load event covers the opposite order without navigating via about:blank.
  send('state');
})();
