/* Original local composition inspired by Motion Video Kit's seekable render contract.
   Copyright 2026. No upstream footage or models are included. */
const DURATION = 24;
const stage = document.querySelector('#stage');
function fitStage() {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const scale = Math.min(width / 1280, height / 720);
  stage.style.transform = `scale(${scale})`;
  stage.style.marginLeft = `${Math.max(0, (width - 1280 * scale) / 2)}px`;
  stage.style.marginTop = `${Math.max(0, (height - 720 * scale) / 2)}px`;
}
window.addEventListener('resize', fitStage);
fitStage();
// Stable initial state is outside zero-duration timeline tweens, so seeking
// backwards to exactly zero cannot undo the completed first composition.
gsap.set('.scene', { opacity: 0 });
gsap.set('#scene-intro', { opacity: 1 });
gsap.set('#actor', { x: 787, y: 273, rotation: -4, scale: 1 });
gsap.set('#actor-bar', { scaleX: .15 });
gsap.set('#progress', { scaleX: 0 });
gsap.set('#create-connector,#file-tree,#file-readme,#file-research,#file-assets,#file-web,#terminal,#terminal-result,#evidence-card,#evidence-commit,#evidence-license,#evidence-fact,#evidence-tabs,#browser-feature-a,#browser-feature-b,#browser-feature-c,#page-chip,#end-cta,#end-path,#page-caption,.browser-sidebar,.browser-heading', { opacity: 0 });
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
tl.to('#progress', { scaleX: 1, duration: DURATION, ease: 'none' }, 0)
  .to('#grid', { x: -35, y: -24, duration: DURATION, ease: 'none' }, 0)
  .to('#halo', { x: -250, y: 110, scale: 1.3, duration: 14, ease: 'none' }, 0)
  .to('#orbit', { rotation: 100, scale: 1.17, duration: 14, ease: 'none' }, 0)
  .to('#intro-ghost', { y: -13, rotation: 12, duration: 3.3, ease: 'sine.inOut' }, 0)
  .to('#actor', { y: 259, rotation: -2, duration: 3.3, ease: 'sine.inOut' }, 0)
  .to('#intro-line', { x: 14, duration: 2.8, ease: 'none' }, .6)
  .to('#actor-bar', { scaleX: 1, duration: 3.7, ease: 'none' }, 0)
  .to('#scene-intro', { opacity: 0, x: -90, duration: .3 }, 3.72)
  .fromTo('#scene-create', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: .34, immediateRender: false }, 4.08)
  .to('#actor', { x: 90, y: 292, rotation: 0, scale: .94, duration: .66 }, 3.94)
  .fromTo('#terminal', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .3, immediateRender: false }, 4.4)
  .fromTo('#create-connector', { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: .3, immediateRender: false }, 5.1)
  .fromTo('#file-tree', { opacity: 0, scale: .97, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: .4, immediateRender: false }, 5.2)
  .fromTo('#file-readme', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .4, immediateRender: false }, 5.2)
  .fromTo('#file-research', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .4, immediateRender: false }, 5.48)
  .fromTo('#file-assets', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .4, immediateRender: false }, 5.76)
  .fromTo('#file-web', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .4, immediateRender: false }, 6.04)
  .fromTo('#terminal-result', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .35, immediateRender: false }, 6.6)
  .to('#file-tree', { y: -7, scale: 1.014, duration: 1.5, ease: 'none' }, 6.95)
  .to('#actor', { y: 285, duration: 2.4, ease: 'none' }, 6.3)
  .to('#scene-create', { opacity: 0, y: -25, duration: .25 }, 8.7)
  .fromTo('#scene-evidence', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .32, immediateRender: false }, 9.05)
  .to('#actor', { x: 95, y: 292, scale: .96, rotation: -2, duration: .48 }, 8.95)
  .fromTo('#evidence-card', { opacity: 0, scale: .97 }, { opacity: 1, scale: 1, duration: .4, immediateRender: false }, 9.4)
  .fromTo('#evidence-commit', { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: .4, immediateRender: false }, 9.4)
  .fromTo('#evidence-license', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .5, immediateRender: false }, 10.1)
  .fromTo('#evidence-fact', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .5, immediateRender: false }, 10.8)
  .fromTo('#evidence-tabs', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .45, immediateRender: false }, 11.5)
  .to('#evidence-card', { scale: 1.022, y: -9, duration: 2.1, ease: 'none' }, 11.65)
  .to('#actor', { rotation: 0, y: 280, duration: 2.5, ease: 'sine.inOut' }, 11.1)
  .to('#scene-evidence', { opacity: 0, x: -25, duration: .26 }, 13.68)
  .to(stage, { backgroundColor: '#f1f2f8', duration: .44 }, 13.96)
  .to('#masthead-label', { color: '#485269', duration: .44 }, 13.96)
  .to('#masthead-edition', { color: '#525c72', duration: .44 }, 13.96)
  .to('#mark', { color: '#5148e5', duration: .44 }, 13.96)
  .to('#disclaimer', { color: '#515c72', duration: .44 }, 13.96)
  .to('#actor', { x: 512, y: 390, rotation: 0, scale: .71, duration: .49 }, 13.96)
  .fromTo('#scene-page', { opacity: 0, x: 25 }, { opacity: 1, x: 0, duration: .32, immediateRender: false }, 14.45)
  .fromTo('#browser', { scale: .99, y: 8 }, { scale: 1, y: 0, duration: .32, immediateRender: false }, 14.45)
  .fromTo('#page-caption,.browser-sidebar,.browser-heading', { opacity: 0 }, { opacity: 1, duration: .32, immediateRender: false }, 14.45)
  .fromTo('#browser-feature-a', { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: .45, immediateRender: false }, 14.55)
  .fromTo('#browser-feature-b', { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: .45, immediateRender: false }, 15.45)
  .fromTo('#browser-feature-c', { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: .45, immediateRender: false }, 15.9)
  .fromTo('#page-chip', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4, immediateRender: false }, 17.3)
  .to('#browser', { y: -6, duration: 2.8, ease: 'none' }, 16.8)
  .to('#actor', { y: 384, duration: 2.8, ease: 'none' }, 16.8)
  .to('#scene-page', { opacity: 0, scale: 1.01, duration: .28 }, 19.64)
  .to(stage, { backgroundColor: '#101323', duration: .44 }, 19.94)
  .to('#masthead-label', { color: '#c1c7db', duration: .44 }, 19.94)
  .to('#masthead-edition', { color: '#a1aabe', duration: .44 }, 19.94)
  .to('#mark', { color: '#d9ff77', duration: .44 }, 19.94)
  .to('#disclaimer', { color: '#9ba6bc', duration: .44 }, 19.94)
  .fromTo('#scene-end', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .32, immediateRender: false }, 20.45)
  .to('#actor', { x: 826, y: 255, scale: .98, rotation: 3, duration: .66 }, 20.05)
  .fromTo('#end-cta', { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: .45, immediateRender: false }, 20.85)
  .fromTo('#end-path', { opacity: 0 }, { opacity: 1, duration: .45, immediateRender: false }, 21.1)
  .to('#actor', { y: 240, rotation: 0, duration: 2.6, ease: 'sine.inOut' }, 21.4)
  .to('#end-title', { x: 7, duration: 2.3, ease: 'none' }, 21.7);

window.__timelines = { 'research-workflow': tl };
window.__hf = window.__hf || {};
window.__hf.buildReady = { 'research-workflow': document.fonts.ready };
function seek(t) { tl.seek(Math.min(DURATION, Math.max(0, t)), false); }
function getFrameState() {
  return [...document.querySelectorAll('[data-state]')].map(element => {
    const style = getComputedStyle(element);
    return [element.id, style.transform, style.opacity, style.color, style.backgroundColor];
  });
}
window.addEventListener('hf-seek', event => seek(event.detail.time));
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent) return;
  if (event.data?.type === 'motion-seek') {
    seek(Number(event.data.time));
    if (event.data.requestId) parent.postMessage({ type: 'motion-state', requestId: event.data.requestId, state: getFrameState() }, location.origin);
  }
});
// Prime GSAP's time-zero sets before showing a paused first frame.
tl.totalTime(0.000001, true);
seek(0);
document.fonts.ready.then(() => parent.postMessage({ type: 'motion-ready' }, location.origin));
