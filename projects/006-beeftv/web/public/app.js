const commit = 'a2196d32782be6090beb003590ce11a956a423e1';
const source = `https://github.com/glanderness/BeefTV/blob/${commit}/`;
const scenarios = {
  coffee: {
    title: '咖啡品牌短片', image: './assets/coffee-scene.svg', alt: '原创示意插画：晨光中的咖啡杯',
    brief: '为一家咖啡店制作 15 秒品牌短片：暖色晨光、木桌、蒸汽，表达“给日常留一点温度”。',
    shots: ['晨光与蒸汽', '咖啡细节', '品牌收尾'],
    captions: ['给日常，留一点温度。', '一杯香气，让时间慢下来。', '从这一杯，开始今天。'],
    shotNotes: '01 晨光下的咖啡杯（5s） → 02 杯沿与蒸汽细节（5s） → 03 品牌文字收尾（5s）',
    prompt: '使用已连接的咖啡参考图。晨光从左侧照入，镜头缓慢推进，暖色木桌，蒸汽轻轻上升。',
    edit: '按 3 个镜头排列，控制为 15 秒；添加三段字幕，调整旁白音量，保留品牌收尾。',
    revision: '“第一段短一秒，第二段长一秒，保留总时长和最后的品牌文字。”',
  },
  product: {
    title: '产品展示', image: './assets/product-scene.svg', alt: '原创示意插画：绿色产品瓶与展示台',
    brief: '用一张产品图制作 15 秒展示片：自然绿色、柔和光线，突出外观、使用感受与产品名称。',
    shots: ['产品亮相', '细节观察', '名称收尾'],
    captions: ['从一个细节，认识它。', '让设计，走进日常。', '看见你的产品。'],
    shotNotes: '01 产品整体亮相（5s） → 02 材质与瓶身细节（5s） → 03 产品名称收尾（5s）',
    prompt: '参考已连接的产品图片。保持瓶身外观，柔和侧光，绿色背景，缓慢推进展示材质细节。',
    edit: '串联整体与细节镜头，统一色调表达，添加产品名称字幕；导出前检查外观和文字。',
    revision: '“把细节镜头提前，最后两秒保留产品名称，并降低旁白音量。”',
  },
  reading: {
    title: '阅读倡议', image: './assets/reading-scene.svg', alt: '原创示意插画：窗光中的书本与手机',
    brief: '制作一段 15 秒阅读倡议短片：放下手机，打开一本书，在安静的窗光里读上一页。',
    shots: ['书桌与窗光', '翻开书页', '静态结尾'],
    captions: ['把手机放下。', '让一页书，带你走远一点。', '给阅读，留十五秒。'],
    shotNotes: '01 建立书桌环境（5s） → 02 翻页与窗光变化（5s） → 03 阅读倡议静态结尾（5s）',
    prompt: '参考已连接的书桌图片。书页缓慢翻动，保持桌面布局，窗光温柔变化，安静的阅读氛围。',
    edit: '按旁白节奏裁切镜头，保留最后的静态文字；检查字幕、声音和最终时长。',
    revision: '“中段延长半秒、后段缩短半秒，总时长保持 15 秒，保留原旁白和字幕。”',
  },
};
const steps = [
  { label: '输入创意', title: '先定义，你想让观众记住什么。', description: '整理主题、文案与参考图片，在画布里建立文本和媒体节点。把素材连到需要它的节点，让后续操作使用明确的创作上下文。', exampleLabel: '创意简报 / 示例', value: 'brief', control: '故事主题、风格、受众、参考素材。', dependency: '引用素材需要满足渠道支持的类型与数量。', doc: 'docs/local-first-architecture.md' },
  { label: '设计分镜', title: '把一个完整想法，拆成几个镜头。', description: '为镜头建立节点，写清主体、动作和视觉表达。可以手工组织，也可以让助手读取素材、建立镜头草稿和参考连线。', exampleLabel: '分镜草稿 / 示例', value: 'shotNotes', control: '镜头数量、叙事顺序、提示词与参考关系。', dependency: '助手输出仍需要人工检查与调整。', doc: 'docs/refactor/agent-operation-coverage-20261008.md' },
  { label: '生成素材', title: '让适合的模型，完成适合的镜头。', description: '选择模型和渠道，按其支持范围配置比例、时长与参考素材。后端负责请求适配、异步查询和结果保存；内置助手先提出生成方案，由你确认后执行。', exampleLabel: '镜头提示词 / 示例', value: 'prompt', control: '模型选择、提示词、参考图和模型支持的参数。', dependency: '画面质量、动作准确度和一致性取决于模型；供应商可能收费。', doc: 'docs/content/docs/backend/video-model-contracts.mdx' },
  { label: '编排与剪辑', title: '让素材，在时间线上形成表达。', description: '将图片、视频和音频编排为时间线，裁切、排序、调整音量并添加字幕。Go 编译剪辑计划，再由 FFmpeg 执行导出。助手也可修改已接入的时间线操作。', exampleLabel: '剪辑安排 / 示例', value: 'edit', control: '镜头顺序、片段时长、声音音量、字幕与输出选项。', dependency: '素材质量和模型生成瑕疵需要逐段检查；渲染使用本机资源。', doc: 'docs/refactor/editing.md' },
  { label: '导出与迭代', title: '交付一版，也保留下一版的可能。', description: '将完成的渲染结果绑定为成片节点，播放、检查并下载。保留画布和素材关系，通过自然语言或手动修改继续迭代。下方可下载本场景的制作流程说明。', exampleLabel: '下一轮修改 / 示例', value: 'revision', control: '修订目标、镜头节奏、版本选择与最终交付。', dependency: '本页只演示流程；实际视频要在 BeefTV 应用中生成与渲染。', doc: 'docs/release-evidence/v1.7.14-targeted.md' },
];
const modes = {
  manual: { title: '界面与画布', subtitle: 'React / Wails · 节点、参考素材、时间线', tag: '你来操作', connector: '提交经过校验的创作操作', description: '你决定节点内容、模型与时间线。画布将结构化参数提交给本地服务，结果再回到素材库和画布。' },
  assistant: { title: 'Pi 助手与画布上下文', subtitle: '持久会话 → 工具调用 → 结果检查 → 继续修改', tag: '助手参与', connector: '调用受控业务工具', description: 'Pi 管理助手执行；Go 验证工具的范围与版本。可选择只读、当前画布或完全访问；内置助手提出的付费媒体生成需要界面确认。' },
  external: { title: '外部 Agent / MCP / CLI', subtitle: '外部客户端 → 业务操作目录 → 同一业务层', tag: '开放接入', connector: '经过鉴权的 MCP / CLI 操作', description: '外部 Agent 使用自己的审批流程，复用素材、画布、任务和渲染接口。业务层继续校验身份、素材归属与版本；能力以实际工具目录为准。' },
};

let scenarioKey = 'coffee';
let currentStep = 0;
let seconds = 0;
let playing = false;
let frame = 0;
let startedAt = 0;
let startingSeconds = 0;
let currentShot = -1;
const $ = (selector) => document.querySelector(selector);
const seek = $('#timeline-seek');
const detail = $('#step-detail');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function selectStep(index) {
  currentStep = index;
  document.querySelectorAll('[data-step]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === index)));
  const step = steps[index];
  const scenario = scenarios[scenarioKey];
  detail.innerHTML = `<div class="detail-kicker"><span>STEP ${String(index + 1).padStart(2, '0')}</span><span>${scenario.title} / 15 秒</span></div><h3>${step.title}</h3><p class="detail-description">${step.description}</p><div class="detail-example"><small>${step.exampleLabel}</small>${scenario[step.value]}</div><div class="detail-controls"><div><strong>你能控制</strong><p>${step.control}</p></div><div><strong>需要考虑</strong><p>${step.dependency}</p></div></div><div class="detail-footer"><a class="step-source" href="${source}${step.doc}" target="_blank" rel="noopener noreferrer">查看这个环节的依据 ↗</a><button class="next-step" id="next-step">${index === 4 ? '重新浏览流程 ↺' : '下一步：' + steps[index + 1].label + ' →'}</button></div>`;
  $('#next-step').addEventListener('click', () => selectStep((currentStep + 1) % steps.length));
}

function updateTimeline() {
  const scenario = scenarios[scenarioKey];
  const shot = Math.min(2, Math.floor(seconds / 5));
  seek.value = String(seconds);
  $('#playhead').style.left = `${Math.min(99.8, seconds / 15 * 100)}%`;
  $('#time-output').textContent = `00:${String(Math.floor(seconds)).padStart(2, '0')} / 00:15`;
  if (shot !== currentShot) {
    currentShot = shot;
    $('#film-shot').textContent = `镜头 ${String(shot + 1).padStart(2, '0')} / ${scenario.shots[shot]}`;
    $('#film-caption').textContent = scenario.captions[shot];
  }
  const scale = reducedMotion.matches ? 1.04 : 1.04 + (seconds % 5) * 0.009 + shot * 0.025;
  $('#film-image').style.transform = `scale(${scale})`;
  $('#film-image').style.objectPosition = ['35% 50%', '50% 60%', '65% 50%'][shot];
}

function setPlaybackButton() {
  $('#play-symbol').textContent = playing ? 'Ⅱ' : '▶';
  $('#play-text').textContent = playing ? '暂停示意' : seconds >= 15 ? '重新播放' : '播放示意';
  $('#play-button').setAttribute('aria-label', playing ? '暂停分镜示意' : seconds >= 15 ? '重新播放分镜示意' : '播放分镜示意');
}

function pause(status = '已暂停') {
  playing = false;
  cancelAnimationFrame(frame);
  setPlaybackButton();
  $('#play-status').textContent = status;
}

function tick(now) {
  if (!playing) return;
  seconds = Math.min(15, startingSeconds + (now - startedAt) / 1000);
  updateTimeline();
  if (seconds >= 15) pause('示意播放完成');
  else frame = requestAnimationFrame(tick);
}

function selectScenario(key) {
  if (!Object.hasOwn(scenarios, key)) return;
  scenarioKey = key;
  pause('待播放');
  seconds = 0;
  currentShot = -1;
  const scenario = scenarios[key];
  document.querySelectorAll('[data-scenario]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.scenario === key)));
  $('#film-image').src = scenario.image;
  $('#film-image').alt = scenario.alt;
  scenario.shots.forEach((name, index) => { $(`#track-label-${index}`).textContent = name; });
  updateTimeline();
  setPlaybackButton();
  selectStep(currentStep);
}

function selectMode(key) {
  const mode = modes[key];
  document.querySelectorAll('[data-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === key)));
  $('#entry-title').textContent = mode.title;
  $('#entry-description').textContent = mode.subtitle;
  $('#entry-tag').textContent = mode.tag;
  $('#connector-text').textContent = mode.connector;
  $('#mode-description').textContent = mode.description;
}

document.querySelectorAll('[data-step]').forEach((button) => button.addEventListener('click', () => selectStep(Number(button.dataset.step))));
document.querySelectorAll('[data-scenario]').forEach((button) => button.addEventListener('click', () => selectScenario(button.dataset.scenario)));
document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => selectMode(button.dataset.mode)));
document.querySelectorAll('[data-jump-step]').forEach((button) => button.addEventListener('click', () => {
  // The hero always illustrates the coffee workflow, including after another scenario was selected.
  selectScenario('coffee');
  selectStep(Number(button.dataset.jumpStep));
  $('#workflow').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
}));
$('#play-button').addEventListener('click', () => {
  if (playing) { pause(); return; }
  if (seconds >= 15) seconds = 0;
  playing = true;
  startedAt = performance.now();
  startingSeconds = seconds;
  $('#play-status').textContent = '播放分镜示意';
  setPlaybackButton();
  frame = requestAnimationFrame(tick);
});
seek.addEventListener('input', () => {
  pause('已定位');
  seconds = Number(seek.value);
  updateTimeline();
  setPlaybackButton();
});
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); });
$('#download-flow').addEventListener('click', () => {
  const scenario = scenarios[scenarioKey];
  const body = `# BeefTV 制作流程卡：${scenario.title}\n\n这是独立研究页的创作示例，不是已生成的视频或 BeefTV 可导入项目文件。\n\n## 创意简报\n\n${scenario.brief}\n\n## 分镜\n\n${scenario.shotNotes}\n\n## 镜头提示词示例\n\n${scenario.prompt}\n\n## 剪辑与迭代\n\n${scenario.edit}\n\n${scenario.revision}\n\n## 执行步骤\n\n${steps.map((step, i) => `${i + 1}. ${step.label}：${step.description}`).join('\n')}\n\n## 运行边界\n\n- 需在 BeefTV 桌面版中配置模型渠道、导入参考素材。\n- 模型参数与参考能力以渠道合同为准，生成可能收费。\n- 工作区数据本地保存；相关参考媒体可能发送给供应商。\n- 本页没有调用模型、执行渲染或验证上游应用。\n\n研究日期：2026-10-09\n研究提交：${commit}\n原仓库：https://github.com/glanderness/BeefTV\n`;
  const url = URL.createObjectURL(new Blob([body], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `BeefTV-${scenarioKey}-workflow.md`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

selectScenario('coffee');
selectMode('manual');
