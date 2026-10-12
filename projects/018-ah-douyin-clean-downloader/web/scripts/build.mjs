import { mkdir, readFile, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as data from '../src/content.mjs';
const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(web);
const dist = path.join(web, 'dist');
await mkdir(path.join(dist, 'assets'), { recursive: true });
for (const filename of ['styles.css', 'app.js', 'favicon.svg']) await copyFile(path.join(web, 'src', filename), path.join(dist, filename));
await copyFile(path.join(root, 'assets/douyin-guide.png'), path.join(dist, 'assets/douyin-guide.png'));
for (const filename of ['README.md', 'research.md']) await copyFile(path.join(root, filename), path.join(dist, filename));
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const link = (file, label = file) => '<a href="' + data.source(file) + '" target="_blank" rel="noreferrer">' + escape(label) + ' ↗</a>';
const section = (number, label, title, intro) => '<header class="section-heading"><p class="eyebrow">' + number + ' / ' + label + '</p><h2>' + title + '</h2><p>' + intro + '</p></header>';
const table = (headers, rows) => '<div class="table-scroll"><table><thead><tr>' + headers.map(h => '<th scope="col">' + escape(h) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(cell => '<td>' + escape(cell) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
const summaryList = data.summarySections.map(row => '<div><dt>' + escape(row.label) + '</dt><dd>' + escape(row.text) + '</dd></div>').join('');
const nav = [
  ['overview', '完整摘要'], ['guide', '引导图'], ['capabilities', '能力'], ['modules', '模块'],
  ['principle', '实现原理'], ['outputs', '交付与验收'], ['risk', '风控与边界'],
  ['environment', '环境与成本'], ['value', '价值与场景'], ['extensions', '扩展方向'], ['evidence', '依据'],
];
const routePanels = data.routes.map((route, index) => '<section id="route-' + route.id + '" role="tabpanel" aria-labelledby="tab-' + route.id + '"' + (index ? ' hidden' : '') + '><p class="route-intro">' + escape(route.description) + '</p><ol class="route-steps ' + route.color + '">' + route.steps.map((step, i) => '<li><span class="step-no">' + String(i + 1).padStart(2, '0') + '</span><div><h3>' + escape(step.title) + '</h3><p>' + escape(step.text) + '</p><p class="source-note">' + link(step.file, '源码依据') + '</p></div></li>').join('') + '</ol></section>').join('');
const html = [
  '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
  '<title>018 · ' + escape(data.title) + '</title><meta name="description" content="' + escape(data.summary) + '">',
  '<meta name="color-scheme" content="light"><link rel="icon" href="./favicon.svg"><link rel="stylesheet" href="./styles.css"><script src="./app.js" defer></script></head><body>',
  '<a class="skip" href="#main">跳到正文</a>',
  '<header class="site-head"><a class="brand" href="../"><span class="brand-mark">018</span><span>项目研究<span class="brand-sub">DOUYIN CONTENT WORKFLOW</span></span></a><nav aria-label="站点入口"><a href="#guide">引导图</a><a href="' + data.repository + '/tree/' + data.branch + '" target="_blank" rel="noreferrer">原分支 ↗</a><a href="../">总索引 ↗</a></nav></header>',
  '<main id="main"><div class="wrap"><section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span class="dot"></span>018 / AGENT SKILL RESEARCH</p><h1 id="hero-title">从抖音链接，<br>到可追溯的<span>内容资料库。</span></h1>',
  '<p class="hero-lead">下载只是起点。这个库将公开作品采集、视频获取、本地识别和 Codex 写作串成一条素材工作流。我们拆开它的能力与实现，判断什么时候值得采用。</p>',
  '<div class="hero-actions"><a class="button primary" href="#overview">阅读完整摘要 ↓</a><button class="button secondary" type="button" data-open-guide>展开引导图 ↗</button></div>',
  '<ul class="hero-facts"><li>' + data.version + ' · 指定分支</li><li><a href="' + data.repository + '/commit/' + data.sourceRef + '" target="_blank" rel="noreferrer">' + data.sourceRef.slice(0, 7) + ' ↗</a></li><li>复核 ' + data.researchDate + '</li></ul>',
  '<p class="small">原创研究页 · 原始引导图保留 · 未登录抖音实测</p></div>',
  '<button class="guide-peek" type="button" data-open-guide aria-label="展开完整中文引导图"><span class="peek-top">本次讨论的完整引导图 <span>查看原图 ↗</span></span><img src="./assets/douyin-guide.png" width="941" height="1672" alt="完整中文引导图，概括能力、三条实现路线、交付效果、价值与使用边界"><span class="peek-bottom">完整原图 · 可放大、下载</span></button></section>',
  '<div class="thesis"><p class="eyebrow">我们的核心理解</p><p><strong>浏览器负责整号目录采集，接口负责视频下载，本地模型负责识别，Codex 负责校对与创作。</strong>它的工程价值在于把重复步骤与成果管理连接起来；正常登录和真实浏览器并不保证免风控。</p></div></div>',
  '<nav class="toc" aria-label="章节导航"><div class="wrap">' + nav.map(([id, text]) => '<a href="#' + id + '">' + text + '</a>').join('') + '</div></nav>',
  '<div class="wrap article-body"><section id="overview" class="section">',
  section('01', 'COMPLETE SUMMARY', '一段完整理解，十个判断维度', '先读能力、模块、原理与采用条件。下文分别补充源码事实、我们的判断和尚未实现的扩展建议。'),
  '<dl class="summary-list">' + summaryList + '</dl></section>',
  '<section id="guide" class="section guide-section"><div>',
  section('02', 'ORIGINAL GUIDE', '保留我们的原始引导图', '这张图汇总了本次讨论：技术分工、八项能力、交付结果、个人价值和使用边界。'),
  '<p>原图生成于 <strong>' + data.guideDate + '</strong>，依据同一 ' + data.version + ' / ' + data.sourceRef.slice(0, 7) + ' 快照。2026-10-12 再核对，指定分支仍指向这一提交。</p>',
  '<p>它是研究说明图，不是上游软件界面或真实采集截图。原 PNG 字节保留，网页仅调整展示尺寸。</p>',
  '<div class="actions"><button class="button primary" type="button" data-open-guide>放大阅读 ↗</button><a class="button secondary" href="./assets/douyin-guide.png" download="douyin-guide.png">下载原 PNG ↓</a></div>',
  '<aside class="note"><strong>读图要点</strong><p>整号目录的 ID 会返回 HTTP 下载器；视频不是全部在浏览器里保存。已有资料库可以直接进入改写准备，不必再次采集。</p></aside></div>',
  '<figure class="guide-full"><button type="button" data-open-guide aria-label="放大原始引导图"><img src="./assets/douyin-guide.png" width="941" height="1672" loading="lazy" alt="抖音内容采集与加工完整信息图，五大板块，包含技术分工和判断边界"></button><figcaption>AI 生成的中文研究说明图 · 原文件保留 · 点击放大</figcaption></figure></section>',
  '<section id="capabilities" class="section">',
  section('03', 'CAPABILITIES / SOURCE FACTS', '除了视频下载，还有八类交付能力', '输入决定走哪条路线；单条转写与整号机器稿的交付标准不同。'),
  '<div class="capability-grid">' + data.capabilities.map((item, i) => '<article><span class="item-number">' + String(i + 1).padStart(2, '0') + '</span><h3>' + escape(item.title) + '</h3><dl><div><dt>输入</dt><dd>' + escape(item.input) + '</dd></div><div><dt>结果</dt><dd>' + escape(item.output) + '</dd></div><div><dt>边界</dt><dd>' + escape(item.boundary) + '</dd></div></dl><p class="source-note">' + link(item.file, '实现 / 说明') + '</p></article>').join('') + '</div></section>',
  '<section id="modules" class="section">',
  section('04', 'MODULES / SOURCE FACTS', '把模型、浏览器与确定性脚本分开看', 'Skill 是统一入口，具体动作由多个小模块承担。下载和文件验收无需逐条调用大模型。'),
  '<div class="module-list">' + data.modules.map((item, i) => '<article><span class="module-no">' + String(i + 1).padStart(2, '0') + '</span><div><h3>' + escape(item.title) + '</h3><p>' + escape(item.role) + '</p><div class="file-links">' + item.files.map(file => link(file)).join('') + '</div></div><span class="role-label">' + escape(item.responsibility) + '</span></article>').join('') + '</div></section>',
  '<section id="principle" class="section">',
  section('05', 'MECHANISM / SOURCE FACTS', '实现原理：三条入口，各自分工', '切换流程阅读示意。本站只展示研究，不连接抖音账号、不执行下载或识别。'),
  '<div class="route-tabs" role="tablist" aria-label="选择处理路线">' + data.routes.map((route, index) => '<button type="button" role="tab" id="tab-' + route.id + '" aria-controls="route-' + route.id + '" aria-selected="' + (index === 0) + '">' + escape(route.label) + '</button>').join('') + '</div>',
  routePanels,
  '<div class="mechanism-grid"><article><span class="badge fact">源码事实</span><h3>找地址，保存响应字节</h3><p>单条路线查询平台自身的元数据接口，取得播放源 URL，再用 curl 保存其返回的文件。代码中的 User-Agent 是客户端声明，不是完整 App 模拟。</p><pre><code>官方分享链接 → 视频 ID\n→ feed 元数据 → play_addr_h264 / play_addr\n→ MP4 文件 → ffprobe 校验</code></pre><p class="source-note">' + link('scripts/download_douyin.py', '下载器源码') + '</p></article>',
  '<article><span class="badge analysis">理解与判断</span><h3>防护控制的是请求能否取得资源</h3><p>对于这条路线处理的 MP4，服务器允许请求取得文件后，程序便可保存响应。关键难点是持续获得可用目录和地址，以及正确处理失败。</p><p>浏览器正常登录能提供网页所需会话和 SDK 环境，但不能证明服务端不再校验请求，也不能证明独立下载接口长期可用。</p><p class="source-note">' + link('references/backend.md', '后端边界') + '</p></article></div></section>',
  '<section id="outputs" class="section">',
  section('06', 'OUTPUTS & ACCEPTANCE', '把一批视频变成可检索、可回溯的资料', '以下是文件类型与目录职责的示意；没有在本站展示真实抖音媒体或声称已完成账号采集。'),
  table(['位置', '产物', '记录与用途'], data.deliverables),
  '<h3 class="subheading">全量完成需要逐项证据</h3><dl class="flag-list">' + data.acceptance.map(item => '<div><dt><code>' + escape(item.flag) + '</code></dt><dd>' + escape(item.text) + '</dd></div>').join('') + '</dl>',
  '<aside class="note"><strong>三个层次分别验收</strong><p>目录完整 → 文件完整 → 内容准确。前两者可以主要靠脚本判断；最后一层需要语义、事实和听音复核。作者在文档中记录过一次 139 条视频实测，这只是上游自报样本，不是我们独立复现，也不是成功率或准确率保证。</p><p class="source-note">' + link('references/creator-batch.md', '上游完成条件与样本说明') + '</p></aside>',
  '<h3 class="subheading">同目录续跑，并不等于整条视频断点续传</h3><p>这里的主要恢复单位是作品：校验已有源文件、模型设置和输出，跳过成功项，继续缺失或失败项。下载器使用 .part 和有限重试；不应从“可续跑”推断支持每个 HTTP 文件的字节级断点续传。</p>',
  '<p>刷新指标后，命名与索引会同步，文件内容与哈希保留。改写库的 WORK 快照与 OUT 成品独立，源库漂移或人工修改会阻止静默覆盖。</p><p class="source-note">' + link('scripts/download_batch.py', '作品级恢复') + ' · ' + link('scripts/name_artifacts.py', '命名与恢复') + ' · ' + link('scripts/batch_rewrite.py', '源快照与成品保护') + '</p></section>',
  '<section id="risk" class="section">',
  section('07', 'LIMITS / SOURCE FACTS', '这里仍会被风控吗？可能会。', '登录和浏览器是采集条件，不是免风控证明。源码与文档没有提供可据以保证账号安全或长期无人值守的阈值。'),
  '<div class="boundary-list">' + data.boundaries.map(item => '<article><h3>' + escape(item.title) + '</h3><p>' + escape(item.text) + '</p><p class="source-note">' + link(item.file, '依据') + '</p></article>').join('') + '</div>',
  '<p class="boundary-foot">失败可能出现在目录采集、元数据查询或文件获取，需结合实际错误判断；本地 ASR、OCR 和整理已经下载的文件，不再向抖音请求数据。</p></section>',
  '<section id="environment" class="section">',
  section('08', 'ENVIRONMENT & COST', '当前 Windows 环境，采用范围需要分层', '本研究页可以在浏览器阅读；上游完整采集和识别路线的运行环境另有要求。'),
  table(['模式', '依赖', '可用范围 / 条件'], data.environments),
  '<div class="cost-row"><article><h3>联网获取</h3><p>链接、目录、媒体、封面和首次权重准备需要网络。平台可访问性是独立条件。</p></article><article><h3>本地计算</h3><p>ASR/OCR、哈希与存储消耗本机资源。资料量越大，原片保留和哈希复核的成本越明显。</p></article><article><h3>模型内容工作</h3><p>Codex 对话、校对、创作和语义核验仍使用模型用量；机械脚本的零在线调用仅指辅助范围。</p></article></div>',
  '<p>完整移植不能只换 Edge 路径，还需替换 MLX/Apple Vision，并处理 POSIX 文件锁、进程和工具依赖。现有资料库的 Python 改写辅助更易跨平台，但创作依然由模型执行。</p>',
  '<p class="source-note">' + link('scripts/bootstrap.sh', '环境安装检查') + ' · ' + link('scripts/launch_browser_collector.py', '浏览器启动器') + ' · ' + link('scripts/ocr_covers.swift', 'Vision 识字') + '</p></section>',
  '<section id="value" class="section">',
  section('09', 'VALUE / OUR ANALYSIS', '对我们：价值取决于规模与已有工具', '这是基于当前 Windows 研究总库与本次讨论的采用判断，不是上游宣称的性能或商业壁垒。'),
  '<div class="value-list">' + data.values.map(item => '<article><div><span class="badge analysis">' + escape(item.verdict) + '</span><h3>' + escape(item.scenario) + '</h3></div><p>' + escape(item.text) + '</p></article>').join('') + '</div>',
  '<div class="meaning"><p class="eyebrow">PRODUCT MEANING</p><h3>减少重复操作，让素材有结构、来源和完成状态。</h3><p>产品把分散命令封装为自然语言驱动的工作流。它的主要意义是工程整合和成果管理；对少量下载任务，完整接入的收益可能有限。我们当前优先借鉴模块分工、检查点、哈希和可验收交付。</p></div>',
  '<h3 class="subheading">能力对应的使用场景</h3><div class="scenario-grid">' + data.scenarios.map(item => '<article><h3>' + escape(item.title) + '</h3><p>' + escape(item.text) + '</p><p class="small"><strong>条件：</strong>' + escape(item.condition) + '</p></article>').join('') + '</div></section>',
  '<section id="extensions" class="section">',
  section('10', 'EXTENSIONS / PROPOSALS', '可以扩展什么，先从可复用的证据结构开始', '下面全部是建议或待验证方向；本次只交付研究网页，没有实施这些后端或新增采集能力。'),
  '<div class="extension-list">' + data.extensions.map((item, i) => '<article><span class="item-number">' + String(i + 1).padStart(2, '0') + '</span><div><h3>' + escape(item.title) + ' <span class="badge proposal">' + escape(item.status) + '</span></h3><dl><div><dt>基础</dt><dd>' + escape(item.base) + '</dd></div><div><dt>补充</dt><dd>' + escape(item.add) + '</dd></div><div><dt>价值</dt><dd>' + escape(item.value) + '</dd></div></dl></div></article>').join('') + '</div>',
  '<aside class="note"><strong>我们的最小候选实验 · 尚未实施</strong><p>直接用自有本地视频建立“原片 → 机器稿/SRT → 校对版 → 来源索引”的小资料库，验证证据格式、时间段回跳和修订记录。先证明资料管理收益，再决定是否接入抖音联网采集和完整苹果路线。</p></aside></section>',
  '<section id="evidence" class="section">',
  section('11', 'EVIDENCE & VERIFICATION', '每个事实，都能回到固定版本', '页面区分源码事实、上游文档表述、分析判断、示意和扩展建议。网页验证与上游工具实测分开记录。'),
  '<dl class="summary-list"><div><dt>原分支</dt><dd><a href="' + data.repository + '/tree/' + data.branch + '" target="_blank" rel="noreferrer">' + escape(data.branch) + ' ↗</a></dd></div><div><dt>固定提交</dt><dd><a class="long-ref" href="' + data.repository + '/commit/' + data.sourceRef + '" target="_blank" rel="noreferrer">' + data.sourceRef + '</a> · ' + data.version + '</dd></div><div><dt>日期</dt><dd>引导图 ' + data.guideDate + '；复核与网页整理 ' + data.researchDate + '。指定分支指向未变；研究不混入 main 分支的其他版本能力。</dd></div><div><dt>许可</dt><dd>' + link('LICENSE', 'AH Source Available Non-Commercial License 1.0') + '。本站为原创说明和网页代码，未引入上游下载执行代码；软件许可与视频素材授权分别确认。</dd></div><div><dt>验证范围</dt><dd>固定源码与文档审查、网页构建、脚本语法、锚点/资源/原图一致性、桌面与手机阅读、交互以及 Pages 发布。未登录抖音，未下载真实作品，未在本机运行 MLX/OCR 或独立认证账号风控安全。</dd></div></dl>',
  '<div class="evidence-list">' + data.evidence.map(([file, title, detail]) => '<article><h3>' + link(file, title) + '</h3><p><code>' + escape(file) + '</code></p><p>' + escape(detail) + '</p></article>').join('') + '</div>',
  '<div class="actions"><a class="button secondary" href="./README.md" download>下载研究说明 ↓</a><a class="button secondary" href="./research.md" download>下载研究记录 ↓</a><a class="button secondary" href="#main">返回开头 ↑</a></div></section></div></main>',
  '<footer class="wrap site-footer"><div><strong>018 · 抖音内容工作流研究</strong><p>获取、识别、创作与验收，各自有边界。</p></div><a href="../">返回总索引 ↗</a></footer>',
  '<dialog id="guide-dialog" aria-labelledby="guide-dialog-title"><div class="dialog-bar"><h2 id="guide-dialog-title">完整引导图 · 原 PNG</h2><button id="guide-size" type="button" aria-pressed="false">原始尺寸</button><a href="./assets/douyin-guide.png" download="douyin-guide.png">下载 PNG ↓</a><button id="guide-close" type="button" aria-label="关闭引导图">关闭 ×</button></div><p class="dialog-caption">941 × 1672 · 原图生成于 2026-10-09 · 说明图，非上游界面</p><div class="dialog-image"><img src="./assets/douyin-guide.png" width="941" height="1672" alt="完整中文研究引导图原文件"></div></dialog>',
  '</body></html>',
].join('\n');
await writeFile(path.join(dist, 'index.html'), html);
console.log('018 研究页已构建：完整摘要、11 个章节、三条路线与原始引导图。');
