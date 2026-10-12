import { bodies, presets, interpretCommand, capabilities, scenarios, sources } from './content.js';
import { createSolarScene } from './scene.js';

const $ = (selector) => document.querySelector(selector);
let scene;
let currentCommand;
let narrationEnabled = false;
let tourTimer = null;
let tourStep = 0;
const supportsSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

function stopTour() {
  clearInterval(tourTimer); tourTimer = null;
  $('#tour-toggle').textContent = '播放 6 步演示';
  $('#tour-toggle').setAttribute('aria-pressed', 'false');
  $('#demo-progress').textContent = currentCommand ? '动作已执行' : '等待指令';
}
function speak(text) {
  if (!narrationEnabled || !supportsSpeech) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN'; utterance.rate = 1;
  const voice = window.speechSynthesis.getVoices().find((item) => /^zh/.test(item.lang));
  if (voice) utterance.voice = voice;
  utterance.onerror = (event) => {
    if (!['canceled', 'interrupted'].includes(event.error)) $('#tts-note').textContent = '系统朗读暂不可用，文字与画面演示仍可正常使用。';
  };
  window.speechSynthesis.speak(utterance);
}
function renderChart(command) {
  const panel = $('#chart-panel');
  panel.replaceChildren();
  panel.hidden = !['display_data', 'get_iss_position'].includes(command.name);
  if (panel.hidden) return;
  if (command.name === 'get_iss_position') {
    panel.innerHTML = '<h4>ISS 坐标 · 固定示例</h4><div class="iss-coordinates"><div><small>纬度</small><strong>31.20°</strong></div><div><small>经度</small><strong>121.50°</strong></div></div><p class="chart-note">非实时位置。此模型未按经纬度定位。</p>';
    return;
  }
  const isPie = command.args.chart === 'pie';
  panel.innerHTML = `<h4>地球表面陆海比例（约）</h4><div role="img" aria-label="海洋约百分之七十一，陆地约百分之二十九" class="chart-body">${isPie ? '<div class="donut"></div><div class="chart-legend"><span><i class="legend-dot"></i>海洋 71%</span><span><i class="legend-dot land"></i>陆地 29%</span></div>' : '<div class="bars"><div class="bar-row"><span>海洋</span><div class="bar-track"><div class="bar-fill" style="width:71%"></div></div><span>71%</span></div><div class="bar-row"><span>陆地</span><div class="bar-track"><div class="bar-fill land" style="width:29%"></div></div><span>29%</span></div></div>'}</div><div class="chart-switch" aria-label="图表类型"><button data-chart="pie" aria-pressed="${isPie}">饼图</button><button data-chart="bar" aria-pressed="${!isPie}">柱状图</button></div><p class="chart-note">固定示例数据 · 海洋面积依据 <a href="https://science.nasa.gov/earth/facts/#surface" target="_blank" rel="noreferrer">NASA</a></p>`;
  panel.querySelectorAll('[data-chart]').forEach((button) => button.addEventListener('click', () => {
    runCommand(button.dataset.chart === 'bar' ? '比较地球陆地和海洋面积' : '地球陆海比例');
  }));
}
function runCommand(text, { automatic = false } = {}) {
  if (!automatic) stopTour();
  if (supportsSpeech) window.speechSynthesis.cancel();
  const command = interpretCommand(text);
  $('#utterance').textContent = `“${text.trim() || '请输入指令'}”`;
  $('#command-input').value = text;
  if (!command) {
    $('#reply').textContent = '本地演示只匹配已列出的关键词。试试“看看土星”“地球陆海比例”“冥王星的卫星”“俯视轨道”或“回到全景”。画面保持上一状态。';
    $('#tool-code').textContent = '// 未匹配到预设工具';
    $('#action-result').textContent = '没有执行新的场景动作。';
    $('#chart-panel').hidden = true;
    $('#demo-progress').textContent = '未匹配指令';
    $('#presets').querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', 'false'));
    return;
  }
  currentCommand = command;
  $('#reply').textContent = command.reply;
  $('#tool-code').textContent = `${command.name}(${JSON.stringify(command.args, null, 2)})`;
  $('#action-result').textContent = command.result;
  $('#view-label').textContent = command.title;
  $('#demo-progress').textContent = automatic ? `自动演示 ${tourStep + 1} / 6` : '动作已执行';
  $('#presets').querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(command.preset === button.dataset.preset)));
  scene?.applyCommand(command);
  renderChart(command);
  speak(command.reply);
}

presets.forEach((preset) => {
  const button = document.createElement('button');
  button.className = 'preset-button'; button.textContent = preset.text;
  button.dataset.preset = preset.id; button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => runCommand(preset.text)); $('#presets').append(button);
});
capabilities.forEach((capability, index) => {
  const article = document.createElement('article'); article.className = 'capability-card';
  article.innerHTML = `<span class="card-index">${String(index + 1).padStart(2, '0')} / 已有工具</span><h3>${capability.title}</h3><p>${capability.description}</p><code>${capability.code}</code><button class="card-action">在演示中查看</button>`;
  article.querySelector('button').addEventListener('click', () => {
    runCommand(capability.command); $('#demo').scrollIntoView({ behavior: 'smooth' });
  });
  $('#capability-grid').append(article);
});
function selectScenario(id, { focus = false } = {}) {
  const scenario = scenarios.find((item) => item.id === id);
  const panel = $('#scenario-detail'); panel.setAttribute('aria-labelledby', `scenario-${id}`);
  $('#scenario-tabs').querySelectorAll('button').forEach((button) => {
    const selected = button.dataset.scenario === id;
    button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  });
  panel.innerHTML = `<p class="eyebrow">可扩展方案 · 未在本页实现</p><h3>${scenario.title}</h3><p>${scenario.description}</p><div class="scenario-example">${scenario.example}</div><div class="scenario-chain">${scenario.chain.map((step) => `<span>${step}</span>`).join('')}</div><dl><div><dt>可以复用</dt><dd>${scenario.reuse}</dd></div><div><dt>需要新增</dt><dd>${scenario.build}</dd></div><div><dt>实际价值</dt><dd>${scenario.value}</dd></div><div><dt>能力边界</dt><dd>${scenario.boundary}</dd></div></dl>`;
}
scenarios.forEach((scenario, index) => {
  const button = document.createElement('button'); button.className = 'scenario-tab';
  button.id = `scenario-${scenario.id}`; button.dataset.scenario = scenario.id;
  button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', 'scenario-detail');
  button.innerHTML = `<strong>${scenario.title}</strong><span>${scenario.subtitle}</span>`;
  button.addEventListener('click', () => selectScenario(scenario.id));
  button.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const offset = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? scenarios.length - 1 : (index + offset + scenarios.length) % scenarios.length;
      selectScenario(scenarios[nextIndex].id, { focus: true });
    }
  }); $('#scenario-tabs').append(button);
});
selectScenario(scenarios[0].id);
sources.forEach(([label, url]) => {
  const link = document.createElement('a'); link.textContent = label; link.href = url;
  link.target = '_blank'; link.rel = 'noreferrer'; $('#source-links').append(link);
});
try {
  scene = createSolarScene($('#solar-canvas'), $('#planet-labels'), (id) => {
    const body = bodies.find((item) => item.id === id); runCommand(`看看${body.label}`);
  });
  $('#motion-toggle').setAttribute('aria-pressed', String(scene.paused));
  $('#motion-toggle').textContent = scene.paused ? '继续自转' : '暂停自转';
} catch (error) {
  console.error('WebGL scene unavailable:', error);
  $('#scene-fallback').hidden = false; $('#motion-toggle').disabled = true;
}
$('#command-form').addEventListener('submit', (event) => { event.preventDefault(); runCommand($('#command-input').value); });
$('#motion-toggle').addEventListener('click', () => {
  if (!scene) return; scene.setPaused(!scene.paused);
  $('#motion-toggle').setAttribute('aria-pressed', String(scene.paused));
  $('#motion-toggle').textContent = scene.paused ? '继续自转' : '暂停自转';
});
$('#read-toggle').disabled = !supportsSpeech;
if (!supportsSpeech) $('#tts-note').textContent = '此浏览器不支持系统朗读，文字与场景演示仍可使用。';
$('#read-toggle').addEventListener('click', () => {
  narrationEnabled = !narrationEnabled;
  $('#read-toggle').setAttribute('aria-pressed', String(narrationEnabled));
  $('#read-toggle').textContent = narrationEnabled ? '关闭浏览器朗读' : '开启浏览器朗读';
  if (narrationEnabled && currentCommand) speak(currentCommand.reply);
  else window.speechSynthesis.cancel();
});
$('#tour-toggle').addEventListener('click', () => {
  if (tourTimer) { stopTour(); if (supportsSpeech) window.speechSynthesis.cancel(); return; }
  tourStep = 0; runCommand(presets[0].text, { automatic: true });
  $('#tour-toggle').textContent = '停止自动演示'; $('#tour-toggle').setAttribute('aria-pressed', 'true');
  tourTimer = setInterval(() => {
    tourStep++;
    if (tourStep === presets.length) { stopTour(); $('#demo-progress').textContent = '6 步演示完成'; return; }
    runCommand(presets[tourStep].text, { automatic: true });
  }, 5500);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopTour(); if (supportsSpeech) window.speechSynthesis.cancel(); } });
runCommand(presets[0].text);
