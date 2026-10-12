/* Parent controls use the original work's buttons; no renderer implementation is changed. */
(() => {
  'use strict';
  const pause = document.getElementById('pause');
  const fallback = document.getElementById('fallback');
  if (!pause || !fallback) return;
  const origin = location.origin === 'null' ? '*' : location.origin;
  function report() {
    parent.postMessage({ type: 'astra-garden-state', available: fallback.hidden, paused: pause.getAttribute('aria-pressed') === 'true', form: Number(document.querySelector('[data-form][aria-pressed="true"]')?.dataset.form || 0), reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }, origin);
  }
  new MutationObserver(report).observe(pause, { attributes: true, attributeFilter: ['aria-pressed'] });
  new MutationObserver(report).observe(fallback, { attributes: true, attributeFilter: ['hidden'] });
  for (const button of document.querySelectorAll('[data-form]')) new MutationObserver(report).observe(button, { attributes: true, attributeFilter: ['aria-pressed'] });
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'astra-garden-command') return;
    const command = event.data;
    if (command.action === 'form' && Number.isInteger(command.form) && command.form >= 0 && command.form <= 2) document.querySelector(`[data-form="${command.form}"]`).click();
    else if (command.action === 'pause' && typeof command.paused === 'boolean' && (pause.getAttribute('aria-pressed') === 'true') !== command.paused) pause.click();
    else if (command.action === 'burst') document.getElementById('release').click();
    else if (command.action === 'reset') document.getElementById('reset').click();
    report();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') parent.postMessage({ type: 'astra-garden-exit' }, origin); });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', report);
  report();
})();
