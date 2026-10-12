import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as d from '../src/content.mjs';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.dirname(web);
const dist = path.join(web, 'dist');
if (path.dirname(dist) !== web || path.basename(dist) !== 'dist') throw new Error('Invalid output directory');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets'), { recursive: true });
for (const file of ['style.css', 'app.js']) await cp(path.join(web, 'src', file), path.join(dist, file));
for (const file of ['libtv-summary.png', 'guide-provenance.json']) await cp(path.join(project, 'assets', file), path.join(dist, 'assets', file));
for (const file of ['README.md', 'research.md']) await cp(path.join(project, file), path.join(dist, file));
await cp(path.join(project, 'licenses/upstream-MIT.txt'), path.join(dist, 'upstream-MIT.txt'));

const e = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const source = (file, label = file.split('/').at(-1)) => '<a href="' + d.repository + '/blob/' + d.sourceRef + '/' + file + '" target="_blank" rel="noopener noreferrer">' + e(label) + ' ↗</a>';
const section = (number, eyebrow, title, intro) => '<div class="section-heading"><span class="section-no">' + number + '</span><div><p class="eyebrow">' + eyebrow + '</p><h2>' + title + '</h2><p class="section-intro">' + intro + '</p></div></div>';
const table = (heads, rows) => '<div class="table-scroll" tabindex="0" role="region" aria-label="' + e(heads.join('、')) + '对照表"><table><thead><tr>' + heads.map(h => '<th scope="col">' + e(h) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map((v, i) => '<' + (i === 0 ? 'th scope="row"' : 'td') + '>' + e(v) + '</' + (i === 0 ? 'th' : 'td') + '>').join('') + '</tr>').join('') + '</tbody></table></div>';
const flow = (steps, mode) => '<ol class="flow-steps">' + steps.map((step, i) => '<li><span class="flow-number">' + String(i + 1).padStart(2, '0') + '</span><h3>' + e(step.title) + '</h3><p>' + e(step.text) + '</p>' + (step.file ? '<code>' + e(step.file) + '</code>' : '') + '</li>').join('') + '</ol><p class="flow-caption">' + (mode === 'service' ? '调用流程来自公开代码与技能说明。云端编排内部实现未公开。' : '创作链条是我们对这类产品的概括，不代表开源脚本实现了各阶段算法。') + '</p>';
const sections = [
  ['understanding', '核心理解'], ['workflows', '两条流程'], ['capabilities', '能力边界'], ['modules', '代码模块'],
  ['interfaces', '接口原理'], ['coupling', '耦合与扩展'], ['scenarios', '使用场景'], ['value', '我们的价值'],
  ['extensions', '扩展方向'], ['own-system', '自建方向'], ['evidence', '依据与验证']
];
const html = [
  '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
  '<meta name="description" content="' + e('LibTV Skills 完整中文研究：专用接入 Skill 的能力、七个模块、会话协议、LibTV 服务端 Agent 与模型依赖、有限复用价值、扩展条件和证据边界。') + '">',
  '<meta name="theme-color" content="#163d35"><title>' + e(d.title) + '</title><link rel="stylesheet" href="./style.css"><script defer src="./app.js"></script></head><body>',
  '<a class="skip-link" href="#main">跳到正文</a>',
  '<header class="site-header"><div class="wrap header-inner"><a class="wordmark" href="#main"><span class="research-mark">019</span><strong>LibTV Skills</strong><span class="header-label">独立研究</span></a><nav aria-label="顶部导航"><a href="../">总索引</a><a href="#value">采用判断</a><a href="' + d.repository + '" target="_blank" rel="noopener noreferrer">原仓库 ↗</a></nav></div></header>',
  '<main id="main" class="wrap"><section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">AGENT SKILL / CLOUD CREATION</p><h1 id="hero-title">理解创作链，<br>也看清<span>接入边界。</span></h1><p class="hero-lead">LibTV Skills 是外部 Agent 调用 LibTV 自家创作服务的专用 Skill。它公开操作约束与接入脚本，把创作编排交给服务端 Agent，画面生成依赖图片／视频模型。</p>',
  '<div class="verdict"><span>我们的结论</span><strong>对自建、自由接模型的创作系统，<br>直接复用价值有限。</strong><p>可研究接入方式、任务查询和结果交付；核心创作系统仍需另行实现。</p></div>',
  '<div class="hero-meta"><span>固定提交 <code>c609246</code></span><span>MIT</span><span>复核 2026-10-12</span></div><div class="actions"><a class="button" href="#understanding">开始阅读 ↓</a><button class="button secondary" type="button" data-open-guide>查看完整引导图 ↗</button></div>',
  '<p class="scope-note">以下区分公开代码、官方能力描述、我们的判断和扩展建议。网页只解释研究，不提交创作任务。</p></div>',
  '<figure id="guide" class="guide-figure"><a href="./assets/libtv-summary.png" target="_blank" rel="noopener" data-open-guide aria-label="放大完整 LibTV 理解总结图"><img src="./assets/libtv-summary.png" width="2400" height="3748" alt="本次对话生成的完整中文总结图：创作链条、Skill 与 LibTV 服务端 Agent 的技术依赖、公开操作与有限复用价值"></a><figcaption><span>原始理解总结图 · 2026-10-09</span><a href="./assets/libtv-summary.png" download>下载 PNG ↓</a><p>本地排版的独立说明图，非上游界面或生成效果实测。原文件字节保持不变。</p></figcaption></figure></section>',
  '<div class="reading-layout"><aside class="reading-nav"><p class="eyebrow">阅读路径</p><nav aria-label="章节导航">' + sections.map(([id, label], i) => '<a href="#' + id + '"><span>' + String(i + 1).padStart(2, '0') + '</span>' + label + '</a>').join('') + '</nav><a class="nav-download" href="./research.md" download>下载研究记录 ↓</a></aside><div class="reading-content">',
  '<section id="understanding" class="section">' + section('01', 'ESSENCE / OUR UNDERSTANDING', '内容与制作过程是核心，画布是操作方式。', '故事、人物、场景、分镜和视频构造决定作品。把这些内容组织成可检查、可修改的过程，是创作系统的核心工作。'),
  '<div class="meaning-block"><h3>这个公开库的本质：面向创作调用的动作约束。</h3><p>Skill 说明外部 Agent 何时触发、怎样上传、如何传递原始要求、怎样查询和取件。故事推演、人物设定、镜头拆解、模型选择和提示词编写，按官方设计交给 LibTV 服务端 Agent。它的“步骤约束”主要约束接入过程，不能解释为已经开源了整套创作算法。</p><p class="source-note">' + source('skills/libtv-skill/SKILL.md', '技能说明与分工依据') + '</p></div>',
  '<div class="role-grid">' + d.roles.map(role => '<article><span class="badge">' + e(role.tag) + '</span><h3>' + e(role.name) + '</h3><strong>' + e(role.title) + '</strong><p>' + e(role.description) + '</p></article>').join('') + '</div>',
  '<aside class="note"><strong>界面可以不同，业务对象与后台能力需要保留。</strong><p>画布适合查看素材关系，表格适合批量检查镜头，时间线适合调整节奏，对话适合表达要求。这是我们的产品设计判断。换一种呈现方式，不会自动增加人物一致性、镜头控制或成片能力。</p></aside></section>',
  '<section id="workflows" class="section">' + section('02', 'TWO FLOWS / DIFFERENT RESPONSIBILITIES', '创作链与接入链，分开理解。', '一条解释作品怎样形成，一条解释这个 Skill 怎样与云端服务交互。'),
  '<div class="flow-tabs" role="tablist" aria-label="选择流程"><button id="tab-service" type="button" role="tab" aria-selected="true" aria-controls="panel-service">接入与技术依赖</button><button id="tab-creation" type="button" role="tab" aria-selected="false" aria-controls="panel-creation" tabindex="-1">内容创作链条</button></div>',
  '<div id="panel-service" class="flow-panel" role="tabpanel" aria-labelledby="tab-service"><p class="badge source-badge">公开接口＋官方分工说明</p><div class="dependency-line"><span>外部 Agent</span><b>→</b><span class="open">LibTV Skill</span><b>→</b><span class="cloud">LibTV 服务端 Agent</span><b>→</b><span class="cloud">图片／视频模型</span><b>→</b><span>生成结果</span></div>' + flow(d.serviceFlow, 'service') + '</div>',
  '<div id="panel-creation" class="flow-panel" role="tabpanel" aria-labelledby="tab-creation"><p class="badge analysis-badge">我们的创作流程概括</p>' + flow(d.creation, 'creation') + '<p>故事与分镜描述决定要求，模型实现具体画面，镜头选择、剪辑和质量检查决定最终交付。单个镜头生成成功不等于整项制作完成。</p></div></section>',
  '<section id="capabilities" class="section">' + section('03', 'CAPABILITIES / CODE VS DESCRIPTION', '公开接入操作，和云端创作能力。', '前四行有具体操作脚本，后两行来自官方平台能力描述。能力层级不同，不能合并成“整个产品已开源”。'),
  table(['类别', '能力', '证据层级', '依据模块', '使用边界'], d.capabilities),
  '<p class="source-note">' + source('README.md', '仓库定位') + ' · ' + source('skills/libtv-skill/SKILL.md', '云端能力描述') + '</p>',
  '<p>官网当前呈现视频、图片、音频、剧本与智能剪辑等入口；本研究以固定仓库的接口与说明为基线。官网展示能力更广，并不代表对应功能已经通过独立操作脚本或精细参数开放。</p><p class="source-note"><a href="https://www.liblib.tv/" target="_blank" rel="noopener noreferrer">LibTV 官网 ↗</a> · 2026-10-12 复核；不固定当前型号或价格。</p></section>',
  '<section id="modules" class="section">' + section('04', 'MODULES / FIXED SOURCE', '1 个 Skill，5 个操作脚本，1 个公共模块。', '模块集中在接入层。展开查看每一项的机制、职责和实现边界。'),
  '<div class="module-list">' + d.modules.map((item, i) => '<details' + (i < 2 ? ' open' : '') + '><summary><span class="module-number">' + String(i + 1).padStart(2, '0') + '</span><div><h3>' + e(item.name) + '</h3><code>' + e(item.file.split('/').at(-1)) + '</code></div><span class="expand" aria-hidden="true">＋</span></summary><div class="module-body"><p><strong>职责：</strong>' + e(item.role) + '</p><p><strong>机制：</strong>' + e(item.mechanism) + '</p><p class="boundary"><strong>边界：</strong>' + e(item.boundary) + '</p><p class="source-note">' + source(item.file, '查看固定源码') + '</p></div></details>').join('') + '</div></section>',
  '<section id="interfaces" class="section">' + section('05', 'MECHANISM / API CONTRACT', '高层自然语言要求，经会话协议送往云端。', '公开请求路径及主要字段如下。服务内部如何拆解故事、保持人物、编排剪辑，没有包含在客户端源码中。'),
  table(['方法', '接口', '输入', '输出', '用途'], d.interfaces),
  '<div class="mechanism-grid"><article><h3>授权与服务地址</h3><p>LIBTV_ACCESS_KEY 用作 Bearer 鉴权。默认服务地址为 im.liblib.tv，可通过 OPENAPI_IM_BASE 或 IM_BASE_URL 配置。Python 标准库处理 HTTP 和 JSON。</p><p>上传素材先取得 URL，再与用户原始要求一起发送。结果返回 sessionId 与 projectUuid，画布地址由项目 ID 拼接。</p><p class="source-note">' + source('skills/libtv-skill/scripts/_common.py', '公共客户端') + '</p></article>',
  '<article><h3>异步查询与完成判断</h3><p>query_session 是单次读取。Skill 要求宿主每 8 秒查询，用最大 seq 增量拉取；超过 3 分钟无结果时停止当前轮询并提示用户。</p><p>文档用结果 URL 判断完成；下载器也解析 tool 结果。它没有公开完整的任务状态协议、取消接口或长期恢复调度，不能保证多步骤任务已全部完成。</p><p class="source-note">' + source('skills/libtv-skill/SKILL.md', '轮询约定') + ' · ' + source('skills/libtv-skill/scripts/download_results.py', '结果解析') + '</p></article></div>',
  '<aside class="note"><strong>自然语言指令，并不等同于精确可复现参数。</strong><p>公开会话客户端主要传 message 与 sessionId。模型 ID、seed、实际模型提示词、分镜与时间线没有独立的 CLI 参数合同。用户在 Issue #12 报告过后端改写提示词带来的风格与复现问题；这是用户反馈，不是我们实测或对所有任务的结论。</p><p class="source-note"><a href="' + d.repository + '/issues/12" target="_blank" rel="noopener noreferrer">用户关于原始提示词与可见性的反馈 ↗</a></p></aside></section>',
  '<section id="coupling" class="section">' + section('06', 'COUPLING / EXTENSION CONDITIONS', '能改服务器地址，仍需要兼容接口。', '“给不同 Agent 使用”和“自由替换后台、模型”是两种不同的扩展。'),
  table(['扩展方式', '需要满足什么', '实际范围'], d.coupling),
  '<div class="coupling-callout"><strong>三处明确的平台联系</strong><p>默认 IM 地址采用 LibTV 服务；画布 URL 前缀固定为 LibTV；assistant 文本结果提取正则限定 LibTV 素材域名。tool 的结构化结果和手动 URL 下载有不同路径，不能把全部下载都说成只能下载该域名。</p><p class="source-note">' + source('skills/libtv-skill/scripts/_common.py', '服务与画布地址') + ' · ' + source('skills/libtv-skill/scripts/download_results.py', '结果提取路径') + '</p></div></section>',
  '<section id="scenarios" class="section">' + section('07', 'SCENARIOS / CLOUD DEPENDENT', '适用场景，仍依赖服务端的实际能力。', '下面是官方描述能力对应的应用方式。当前网页没有生成作品，也没有验证成片质量。'),
  '<div class="scenario-grid">' + d.scenarios.map(item => '<article><h3>' + e(item.title) + '</h3><p>' + e(item.use) + '</p><p class="small"><strong>条件：</strong>' + e(item.condition) + '</p></article>').join('') + '</div></section>',
  '<section id="value" class="section">' + section('08', 'VALUE / OUR ADOPTION DECISION', '对我们：接入样例有用途，核心复用价值有限。', '评价对象是这个公开库，评价目标是我们自建、自由连接模型并控制内容制作的系统。'),
  '<div class="value-list">' + d.values.map(item => '<article><div><span class="badge ' + (item.verdict.includes('有限') ? 'limit-badge' : '') + '">' + e(item.verdict) + '</span><h3>' + e(item.scenario) + '</h3></div><p>' + e(item.text) + '</p></article>').join('') + '</div>',
  '<div class="value-conclusion"><p class="eyebrow">OUR POSITION</p><h3>专用服务接入样例。</h3><p>我们保留它的接口分工和取件流程作为参考。可控的创作对象、模型适配、人物与镜头约束、局部重做、剪辑执行和质量闭环，需要在自己的系统中实现。</p><p>这个判断不等于 LibTV 产品对所有用户都没有价值。接入便利性与云端实际效果，是不同的评价项。</p></div></section>',
  '<section id="extensions" class="section">' + section('09', 'EXTENSIONS / PROPOSALS', '可扩展方向，要标清改动层次。', '以下全部是我们的建议，尚未在本项目实施。小范围客户端改造与独立创作引擎开发，工作量和依赖条件不同。'),
  '<div class="extension-list">' + d.extensions.map((item, i) => '<article><span class="extension-number">' + String(i + 1).padStart(2, '0') + '</span><div><span class="badge proposal-badge">' + e(item.scope) + ' · 建议</span><h3>' + e(item.title) + '</h3><dl><div><dt>基础</dt><dd>' + e(item.basis) + '</dd></div><div><dt>需补充</dt><dd>' + e(item.work) + '</dd></div><div><dt>边界</dt><dd>' + e(item.boundary) + '</dd></div></dl></div></article>').join('') + '</div></section>',
  '<section id="own-system" class="section">' + section('10', 'OWN SYSTEM / DESIGN PROPOSAL', '界面之外，先定义可修改的创作对象。', '这套对象结构来自我们的讨论，是自建方向，不是从 LibTV 开源库提取的已有实现。'),
  table(['核心对象', '建议保存的内容', '要解决的问题'], d.objects),
  '<div class="example"><span class="badge proposal-badge">交互示例 · 尚未实现</span><h3>“把第三个镜头改成近景。”</h3><ol><li>定位第三个镜头，保留人物与场景参考。</li><li>变更景别，把修改记录成新版本。</li><li>生成候选，检查人物外观与前后镜头连续性。</li><li>用户选择后替换时间线，并更新成片。</li></ol><p>这一过程需要明确的镜头 ID、依赖关系、版本与剪辑执行。画布、表格、对话都可作为它的入口。</p></div>',
  '<div class="related"><h3>与总库已有研究各取一部分</h3><a href="../001-motion-video-kit/"><strong>Motion Video Kit</strong><span>制作方法、确定性渲染与评审流程 →</span></a><a href="../006-beeftv/"><strong>BeefTV</strong><span>项目组织、模型适配、助手操作与剪辑执行 →</span></a><p>LibTV Skills 在这里补充专用服务接入的参照；没有据此推断这些项目可直接互相兼容。</p></div></section>',
  '<section id="evidence" class="section">' + section('11', 'EVIDENCE / VERIFICATION SCOPE', '结论有来源，验证有范围。', '固定源码事实、官方能力描述、用户反馈、我们的判断与扩展建议分开阅读。'),
  '<dl class="baseline"><div><dt>原仓库</dt><dd><a href="' + d.repository + '" target="_blank" rel="noopener noreferrer">libtv-labs/libtv-skills ↗</a> · <a href="https://github.com/libtv-labs" target="_blank" rel="noopener noreferrer">组织 ↗</a></dd></div><div><dt>固定提交</dt><dd><a class="long-ref" href="' + d.repository + '/commit/' + d.sourceRef + '" target="_blank" rel="noopener noreferrer">' + d.sourceRef + '</a></dd></div><div><dt>时间</dt><dd>提交 2026-03-18；引导图 2026-10-09；网页与来源复核 2026-10-12。复核时 main HEAD 仍为同一提交。</dd></div><div><dt>许可与环境</dt><dd>' + source('LICENSE', 'MIT') + ' · Windows／PowerShell，Node.js 22.15.0；网页只使用原生 HTML／CSS／JavaScript 和 Node 标准库。</dd></div><div><dt>引导图</dt><dd>2400 × 3748 原 PNG 与可编辑 HTML 原样保留；发布文件用 SHA-256 校验一致。图是独立理解总结，不是上游 UI 或真实生成作品。</dd></div><div><dt>验证范围</dt><dd>固定源码与文档研究、网页构建、链接与资源、图文件一致性、桌面／手机阅读、交互和 Pages 发布。未配置 API Key，未执行真实生成、模型推理或成片质量评测。</dd></div></dl>',
  '<div class="evidence-list">' + d.evidence.map(([file, name, detail]) => '<article><h3>' + source(file, name) + '</h3><code>' + e(file) + '</code><p>' + e(detail) + '</p></article>').join('') + '</div>',
  '<div class="actions"><a class="button secondary" href="./README.md" download>下载完整说明 ↓</a><a class="button secondary" href="./research.md" download>下载研究记录 ↓</a><a class="button secondary" href="./assets/guide-provenance.json" download>下载图像来源记录 ↓</a></div></section>',
  '</div></div></main><footer class="wrap site-footer"><div><strong>019 · LibTV Skills 研究</strong><p>理解创作链，也明确服务边界。</p></div><a href="../">返回总索引 ↗</a><a href="#main">回到开头 ↑</a></footer>',
  '<dialog id="guide-dialog" aria-labelledby="guide-title"><div class="dialog-bar"><h2 id="guide-title">完整理解总结图 · 原 PNG</h2><button id="guide-size" type="button" aria-pressed="false">原始尺寸</button><a href="./assets/libtv-summary.png" download>下载 PNG ↓</a><button id="guide-close" type="button" aria-label="关闭引导图">关闭 ×</button></div><p class="dialog-caption">2400 × 3748 · 2026-10-09 本地排版 · 原文件保持不变</p><div class="dialog-image"><img src="./assets/libtv-summary.png" width="2400" height="3748" alt="完整 LibTV Skills 中文理解总结图"></div></dialog>',
  '</body></html>'
].join('\n');
await writeFile(path.join(dist, 'index.html'), html);
console.log('019 LibTV Skills：11 个章节、完整引导图与两条流程已构建。');
