import { capabilities, levels, scales, models } from './data.js';

const grid = document.querySelector('#capability-grid');
function renderCapabilities(filter) {
  const rows = capabilities.filter(item => filter === 'all' || item.level === filter);
  grid.innerHTML = rows.map(item => `<article class="capability" data-level="${item.level}"><div class="card-top"><span>${item.id} / ${item.domain}</span><span class="badge ${item.level}">${levels[item.level]}</span></div><h3>${item.title}</h3><p>${item.detail}</p><div class="card-value">${item.value}</div><small>${item.example}</small></article>`).join('');
  document.querySelector('#filter-status').textContent = `显示 ${rows.length} 项${filter === 'all' ? '' : levels[filter]}能力`;
}
function renderScale(key) {
  const item = scales[key];
  document.querySelector('#scale-number').textContent = item.number;
  document.querySelector('#scale-word').textContent = item.word;
  document.querySelector('#scale-content').innerHTML = `<span class="badge observed">演示能力归纳</span><h3>${item.title}</h3><p>${item.detail}</p><p class="scale-example">${item.example}</p><div class="scale-limit"><strong>证据边界</strong><p>${item.limit}</p></div>`;
}
function renderModel(key) {
  const item = models[key];
  document.querySelector('#model-content').innerHTML = `<p class="model-label">${item.label}</p><h3>${item.title}</h3><dl><dt>看到的证据</dt><dd>${item.evidence}</dd><dt>合理判断</dt><dd>${item.judgment}</dd><dt>需要核对</dt><dd>${item.pending}</dd></dl><div class="model-flow">${item.flow.map((word, index) => `${index ? '<i aria-hidden="true">→</i>' : ''}<span>${word}</span>`).join('')}</div><p class="small-note">${item.note}</p>`;
}
function bindGroup(attribute, render) {
  const buttons = [...document.querySelectorAll(`[${attribute}]`)];
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
    render(button.getAttribute(attribute));
  }));
}
bindGroup('data-filter', renderCapabilities);
bindGroup('data-scale', renderScale);
bindGroup('data-model', renderModel);
renderCapabilities('all');
renderScale('earth');
renderModel('earth');
