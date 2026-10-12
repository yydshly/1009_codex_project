import { effects, effectPreviews, parts, reusable, steps, upstream, upstreamImages } from './content.js';
import { createPumpScene } from './scene.js';
import understandingMapUrl from '../assets/understanding-map.svg?url';
import understandingMapPngUrl from '../assets/understanding-map.png?url';
import researchSummary from './research-summary.json';

document.querySelector('#understanding-map').src = understandingMapUrl;
document.querySelector('[data-map-full]').href = understandingMapPngUrl;
document.querySelector('[data-map-svg]').href = understandingMapUrl;
document.querySelector('[data-map-png]').href = understandingMapPngUrl;
document.querySelector('#research-summary-text').textContent = researchSummary.summary;
const summaryGrid = document.querySelector('#research-summary-grid');
researchSummary.sections.forEach(({ label, text }) => {
  const card = document.createElement('article');
  const heading = document.createElement('h4');
  const description = document.createElement('p');
  heading.textContent = label;
  description.textContent = text;
  card.append(heading, description);
  summaryGrid.append(card);
});

function setActive(buttons, current) {
  buttons.forEach((button) => {
    const active = button === current;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

let visibleEffects = [];
function renderEffects(filter) {
  const categories = { product: '产品与材质', nature: '自然与粒子', story: '探索与叙事' };
  visibleEffects = effects.filter((effect) => filter === 'all' || effect.category === filter);
  document.querySelector('#effect-grid').innerHTML = visibleEffects.map((effect) =>
    '<article class="effect-card"><button class="effect-image" data-effect="' + effect.slug + '" aria-label="放大 ' + effect.name + ' 的上游截图"><img src="' + effectPreviews[effect.slug] + '" alt="' + effect.name + '：上游案例画面截图" width="1280" height="800" loading="lazy" decoding="async"><span>上游截图 <b>放大 ↗</b></span></button><div class="effect-top"><span class="effect-num">' + effect.number + '</span><span class="effect-tag">' + categories[effect.category] + '</span></div><h3>' + effect.name + '</h3><p>' + effect.description + '</p><div class="effect-bottom"><span class="' + (effect.checked ? 'checked' : '') + '">' + (effect.checked ? '已阅读相关源码' : 'README 描述') + '</span><a href="' + upstream + 'examples/' + effect.slug + '/main.js" target="_blank" rel="noreferrer">查看实现 ↗</a></div></article>'
  ).join('');
}
renderEffects('all');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
filterButtons.forEach((button) => button.addEventListener('click', () => {
  setActive(filterButtons, button);
  renderEffects(button.dataset.filter);
}));

const effectDialog = document.querySelector('#effect-dialog');
let previewIndex = 0;
let previewTrigger = null;
function updatePreview() {
  const effect = visibleEffects[previewIndex];
  document.querySelector('#effect-dialog-title').textContent = effect.number + ' / ' + effect.name;
  const image = document.querySelector('#effect-dialog-image');
  image.src = effectPreviews[effect.slug];
  image.alt = effect.name + '：上游案例画面截图';
  document.querySelector('#effect-dialog-description').textContent = '特色交互：' + effect.description;
  document.querySelector('#effect-dialog-technique').textContent = '复用思路：' + effect.technique;
  document.querySelector('#effect-dialog-position').textContent = (previewIndex + 1) + ' / ' + visibleEffects.length;
  document.querySelector('#effect-dialog-source').href = upstreamImages + effect.slug + '.webp';
  document.querySelector('#effect-dialog-code').href = upstream + 'examples/' + effect.slug + '/main.js';
}
function movePreview(offset) {
  previewIndex = (previewIndex + offset + visibleEffects.length) % visibleEffects.length;
  updatePreview();
}
document.querySelector('#effect-grid').addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-effect]');
  if (!trigger) return;
  previewIndex = visibleEffects.findIndex((effect) => effect.slug === trigger.dataset.effect);
  previewTrigger = trigger;
  updatePreview();
  effectDialog.showModal();
  document.body.classList.add('preview-open');
});
document.querySelector('#close-effect').addEventListener('click', () => effectDialog.close());
document.querySelector('#previous-effect').addEventListener('click', () => movePreview(-1));
document.querySelector('#next-effect').addEventListener('click', () => movePreview(1));
effectDialog.addEventListener('click', (event) => {
  // Native dialog includes its backdrop in its bounding box event target.
  if (event.target === effectDialog) {
    const box = effectDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) effectDialog.close();
  }
});
effectDialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    movePreview(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
effectDialog.addEventListener('close', () => {
  document.body.classList.remove('preview-open');
  previewTrigger?.focus({ preventScroll: true });
});

function renderStep(id) {
  const step = steps[id];
  document.querySelector('#pipeline-detail').innerHTML = '<h3>' + step.title + '</h3><div><p>' + step.text + '</p><a href="' + upstream + step.path + '" target="_blank" rel="noreferrer">依据 / ' + step.path + ' ↗</a></div>';
}
renderStep('image');
const stepButtons = [...document.querySelectorAll('[data-step]')];
stepButtons.forEach((button) => button.addEventListener('click', () => {
  setActive(stepButtons, button);
  renderStep(button.dataset.step);
}));

document.querySelector('#reuse-rows').innerHTML = reusable.map((row) =>
  '<tr><td>' + row[0] + '</td><td><a href="' + upstream + row[1] + '" target="_blank" rel="noreferrer">' + row[1] + '</a><br>' + row[2] + '</td><td>' + row[3] + '</td><td class="' + (row[4] === '尚未加入' ? '' : 'used') + '">' + row[4] + '</td></tr>'
).join('');

const partList = document.querySelector('#part-list');
partList.innerHTML = parts.map((part) => '<button data-part="' + part.id + '" aria-pressed="' + (part.id === 'motor') + '" class="' + (part.id === 'motor' ? 'active' : '') + '">' + part.name + '</button>').join('');
function showPart(id) {
  const part = parts.find((item) => item.id === id);
  if (!part) return;
  document.querySelector('#part-number').textContent = part.code;
  document.querySelector('#part-title').textContent = part.name;
  document.querySelector('#part-description').textContent = part.description;
  document.querySelector('#part-tech').textContent = '技术：' + part.tech;
  setActive([...partList.querySelectorAll('button')], partList.querySelector('[data-part="' + id + '"]'));
}

let pump;
try {
  pump = createPumpScene(document.querySelector('#pump-canvas'), showPart);
  document.querySelector('#render-status').textContent = '3D 场景已就绪';
} catch (error) {
  console.error('Pump scene initialization failed', error);
  document.querySelector('#fallback').hidden = false;
  document.querySelector('#render-status').textContent = '结构说明模式';
}
// The complete text, navigation and part descriptions remain usable without WebGL.
partList.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
  showPart(button.dataset.part);
  pump?.select(button.dataset.part);
}));
const explode = document.querySelector('#explode');
const flow = document.querySelector('#flow-toggle');
const presets = [...document.querySelectorAll('[data-preset]')];
const shellButtons = [...document.querySelectorAll('[data-shell]')];
function clearPreset() {
  setActive(presets, null);
}
function setExplode(value) {
  explode.value = value;
  document.querySelector('#explode-value').value = value + '%';
  pump?.setExplode(Number(value) / 100);
}
function setShell(mode) {
  setActive(shellButtons, shellButtons.find((button) => button.dataset.shell === mode));
  pump?.setShell(mode);
}
function setFlow(enabled) {
  flow.checked = enabled;
  pump?.setFlow(enabled);
}
explode.addEventListener('input', () => {
  clearPreset();
  setExplode(explode.value);
  if (Number(explode.value) > 0) setFlow(false);
});
shellButtons.forEach((button) => button.addEventListener('click', () => {
  clearPreset();
  setShell(button.dataset.shell);
}));
flow.addEventListener('change', () => {
  clearPreset();
  if (flow.checked) {
    setExplode(0);
    setShell('transparent');
  }
  setFlow(flow.checked);
});
function applyPreset(name) {
  setActive(presets, presets.find((button) => button.dataset.preset === name));
  setExplode(name === 'structure' ? 85 : 0);
  setShell(name === 'flow' ? 'transparent' : 'solid');
  setFlow(name === 'flow');
  const selected = name === 'flow' ? 'impeller' : name === 'structure' ? 'casing' : 'motor';
  showPart(selected);
  pump?.select(selected);
  pump?.setCamera(name);
}
presets.forEach((button) => button.addEventListener('click', () => applyPreset(button.dataset.preset)));
document.querySelector('#reset-scene').addEventListener('click', () => applyPreset('showcase'));

const navLinks = [...document.querySelectorAll('.sidebar nav a')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
function updateNav() {
  const offset = innerWidth < 930 ? 130 : 90;
  // Choose the physically nearest passed section in the document.
  const active = sections.filter((section) => section.getBoundingClientRect().top <= offset).sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0] || sections[0];
  navLinks.forEach((link) => {
    const current = link.getAttribute('href') === '#' + active.id;
    link.classList.toggle('current', current);
    if (current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
addEventListener('scroll', updateNav, { passive: true });
updateNav();
