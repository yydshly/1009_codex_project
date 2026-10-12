const reference = '42ec7142a3da1dcce1846de8a3fc0b4891b4c8ae';
const source = file => `https://github.com/MartinDelophy/awesome-gpt-6-astra/blob/${reference}/${file}`;
const capabilities = {
  catalog: { number: '01', tag: '体验入口', title: '先玩到成品，再判断想研究什么。', description: '目录按动作、解谜、策略、冒险、竞速和实验玩法整理作品。条目记录作者、平台、玩法说明与在线入口，让抽象的 AI 编程成果变成可体验的案例。', points: ['作品标题直达浏览器体验', '作者署名与模型参与说明', '实机预览和访问条件'], location: 'README', path: '作品分类 → 条目 → 在线体验', boundary: '目录收录是一份社区推荐。作品是否兼容你的设备，需要在相应作品中确认。', file: 'README.zh-CN.md' },
  process: { number: '02', tag: '开发证据', title: '从“做出了什么”，追溯到“怎么做的”。', description: '部分作品公开创作记录、需求、提示词和验证笔记。你可以观察模型、人类反馈、代码工具与素材生成分别承担什么工作，而不只看一张完成后的图片。', points: ['原始请求与复用规格', '模型和创作者的分工', '实现、调试与验证记录'], location: '创作记录 / PROMPT', path: '需求 → 实现 → 反馈 → 成品', boundary: '资料由作者提供，完整程度不同。轨道花园明确说明复用 Prompt 根据成品整理，不是原始完整输入。', file: 'works/orbital-garden/PROMPT.md' },
  remix: { number: '03', tag: '可运行样本', title: '选择公开源码的作品，做一次小实验。', description: '仓库内的 works/ 保存部分完整作品。轨道花园可直接打开单文件 HTML；雷霆战机通过 HTTP 运行 JavaScript 模块；较复杂作品拥有独立依赖和构建方式。', points: ['阅读具体的交互与规则', '按作品说明独立运行', '修改参数、玩法或界面'], location: 'works/', path: '运行说明 → 源码 → 修改 → 验证', boundary: '175 个收录作品不等于 175 份源码。第三方作品是否开源、采用何种许可，需要单独确认。', file: 'works/thunderfall/README.md' },
  gallery: { number: '04', tag: '组织与展示', title: '让一份 Markdown 清单，成为可搜索的目录。', description: 'website/ 提供作品展示站，支持分类、关键词搜索和中英文切换。目录来自上游 README，配合预览图片、缓存和失败兜底，让内容更新与网站界面发布分开维护。', points: ['README 驱动目录', '分类、搜索与预览图片', '请求驱动的缓存更新'], location: 'website/', path: 'README → 目录 API → 搜索与展示', boundary: '本页展示的是研究快照。上游网站的自动更新需要其目录服务；复制一个静态页面不会获得这个后端能力。', file: 'website/README.md' },
};
const flows = {
  catalog: { label: '网站的数据流', note: '目录网站抓取公开 README 并解析展示；它的自动更新由访问请求驱动，不是实时推送，也不是后台持续抓取。', steps: [
    { name: '维护 README', output: '作品条目', kicker: '输入 / 作者提交与维护记录', title: 'README 是目录的数据源。', description: '维护者按分类记录作品名称、直达链接、作者、平台和预览图片。收录要求可进入浏览器作品，并提供作者的模型参与说明；源码与开发日志是可选资料。', file: 'CONTRIBUTING.md' },
    { name: '解析与归类', output: '结构化目录', kicker: '处理 / Markdown 转结构化数据', title: '从列表与表格中读出作品信息。', description: '服务端使用 Markdown 解析器读取标题、列表和表格，提取名称、作者、描述、源码、体验入口与首张预览图；再按类别归类、生成稳定 ID 并去重。这个步骤使用确定的解析规则。', file: 'website/server/catalog.js' },
    { name: '缓存与兜底', output: '稳定的数据', kicker: '保障 / 成功缓存与旧数据回退', title: '五分钟缓存，失败时保留可用目录。', description: '服务端按请求刷新上游，成功结果缓存五分钟；浏览器在页面可见时也定期检查。上游暂时不可用时，优先保留最近成功的数据，再回退到本地快照，并标记数据状态。', file: 'website/README.md' },
    { name: '展示与检索', output: '可浏览的作品', kicker: '产出 / 分类、搜索与预览', title: '让目录可浏览，让入口可追溯。', description: 'React 前端按类别和关键词筛选作品，并支持中英文界面。预览服务优先用条目中的图片，再尝试本地截图或公开页面图片；没有图片时显示“暂无预览”，保留作品入口。', file: 'website/src/App.jsx' },
  ] },
  creation: { label: '作品的开发流程', note: '这是依据公开创作记录归纳的常见路径。具体作品的分工不同；模型参与开发，不代表玩家每次操作都要调用 AI 服务。', steps: [
    { name: '定义需求', output: '玩法与交付要求', kicker: '输入 / 人的目标与约束', title: '把创意写成可以判断的要求。', description: '描述玩法、画面、交互、运行环境和交付形式。轨道花园的复用规格包括单文件、数学实时绘图、触控、声音和海报导出；这份详细规格是在成品之后整理的。', file: 'works/orbital-garden/PROMPT.md' },
    { name: '设计与实现', output: '代码与素材', kicker: '处理 / 代码、数学与素材分工', title: '由程序构造画面与规则。', description: '轨道花园用参数曲面与 WebGL 着色器绘制粒子；雷霆战机用 Canvas 绘图并实时合成声音。三分天下另行生成地形与头像，说明代码开发和美术生成可以各自承担明确任务。', file: 'works/three-kingdoms/README.md' },
    { name: '试玩与迭代', output: '可检查的结果', kicker: '反馈 / 规则检查与交互修正', title: '用运行结果检验想法。', description: '作者记录实现、调试、测试与审阅。雷霆战机文档区分引擎测试、自动模拟、浏览器检查和未验证的实物手机体验。读记录时，要看实际验证了哪些范围。', file: 'works/thunderfall/README.md' },
    { name: '发布与体验', output: '浏览器成品', kicker: '产出 / 独立运行的网页', title: '让浏览器执行最终代码。', description: '这些示例发布为浏览器作品，按自身 JavaScript、图形和规则运行。轨道花园无需运行依赖或 API Key；较复杂作品需要先安装依赖并构建，再发布静态产物。', file: 'works/orbital-garden/README.md' },
  ] },
};
const scenarios = {
  learn: { title: '从一个完整案例开始。', description: '将需求、实现和成品对照起来，观察 AI 参与了哪些工作，以及人工反馈如何改变结果。', steps: ['体验一项作品，记录具体交互。', '阅读创作记录与 Prompt，区分原始输入和整理后的规格。', '打开源码，定位一个机制，做一次小改动。'], result: '一条可解释、可验证的开发路径，而不是只收藏一个链接。', file: 'works/orbital-garden/PROMPT.md' },
  prototype: { title: '先验证一个核心玩法。', description: '把案例当作机制参考，选择最小的移动、碰撞、反馈或成长循环，建立可以试玩的版本。', steps: ['从雷霆战机观察移动、受击和武器反馈。', '阅读引擎与设计说明，选择一个小机制重做。', '检查流程和操作，再逐步增加关卡与内容。'], result: '可试玩的原型，以及可以解释的实现选择。', file: 'works/thunderfall/DESIGN.md' },
  art: { title: '让数学成为可操作的体验。', description: '轨道花园展示了从程序生成到完整互动作品的路径，可以研究形态、动画、声音和导出如何协同。', steps: ['体验形态切换、扰动、暂停和海报导出。', '查看参数曲面、平滑插值与 WebGL 绘制。', '替换一种形态，测试性能、触控与减少动态效果。'], result: '适合个人网站、创意作品集或互动展览的实验起点。', file: 'works/orbital-garden/README.md' },
  archive: { title: '让记录和展示使用同一份内容。', description: '学习 README 驱动的目录结构，把来源、版本、简介和图片组织成可维护的案例条目。', steps: ['定义稳定的条目格式与作者、版本、许可字段。', '研究目录解析、去重、搜索与预览选择。', '按实际需求决定静态构建或请求驱动更新。'], result: '减少重复维护，并让每一项推荐都能追溯到证据。', file: 'website/server/catalog.js' },
};
const byId = id => document.getElementById(id);
const setText = (id, value) => { byId(id).textContent = value; };
function replaceList(element, values) {
  element.replaceChildren(...values.map(value => { const li = document.createElement('li'); li.textContent = value; return li; }));
}
function selectTab(button) {
  const group = button.closest('[role="tablist"]');
  for (const tab of group.querySelectorAll('[role="tab"]')) { const selected = tab === button; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; }
}
for (const tablist of document.querySelectorAll('[role="tablist"]')) {
  tablist.addEventListener('keydown', event => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[index].focus(); tabs[index].click();
  });
}
for (const button of document.querySelectorAll('[data-capability]')) {
  button.addEventListener('click', () => {
    selectTab(button);
    const data = capabilities[button.dataset.capability];
    byId('capability-panel').setAttribute('aria-labelledby', button.id);
    for (const [id, key] of [['cap-tag','tag'],['cap-title','title'],['cap-description','description'],['cap-boundary','boundary'],['cap-number','number']]) setText(id, data[key]);
    replaceList(byId('cap-points'), data.points);
    const sub = document.createElement('span'); sub.textContent = data.path;
    byId('cap-location').replaceChildren(document.createTextNode(data.location), document.createElement('br'), sub);
    byId('cap-source').href = source(data.file);
  });
}
let activeFlow = 'catalog';
function showStep(index) {
  const step = flows[activeFlow].steps[index];
  for (const button of byId('flow-steps').querySelectorAll('button')) button.setAttribute('aria-pressed', String(Number(button.dataset.step) === index));
  setText('step-symbol', String(index + 1).padStart(2, '0'));
  for (const [id, key] of [['step-kicker','kicker'],['step-title','title'],['step-description','description']]) setText(id, step[key]);
  byId('step-source').href = source(step.file);
}
byId('flow-steps').addEventListener('click', event => { const button = event.target.closest('[data-step]'); if (button) showStep(Number(button.dataset.step)); });
for (const button of document.querySelectorAll('[data-flow]')) {
  button.addEventListener('click', () => {
    selectTab(button); activeFlow = button.dataset.flow;
    byId('flow-panel').setAttribute('aria-labelledby', button.id);
    setText('flow-label', flows[activeFlow].label); setText('flow-note', flows[activeFlow].note);
    for (const [index, step] of flows[activeFlow].steps.entries()) {
      const target = byId('flow-steps').querySelector(`[data-step="${index}"]`);
      target.querySelector('strong').textContent = step.name; target.querySelector('small').textContent = step.output;
    }
    showStep(0);
  });
}
byId('scenario').addEventListener('change', event => {
  const data = scenarios[event.target.value];
  for (const [id, key] of [['scenario-title','title'],['scenario-description','description'],['scenario-result','result']]) setText(id, data[key]);
  replaceList(byId('scenario-steps'), data.steps); byId('scenario-source').href = source(data.file);
});
for (const link of document.querySelectorAll('[data-source]')) link.href = source(link.dataset.source);
