import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseline, source, rules, modules, kinds, scenarios, values, extensions, examples, sources } from './content.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const link = (url, text) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(text)} <span aria-hidden="true">↗</span></a>`;
const badge = (status) => `<span class="badge ${status}">${status === 'stable' ? '默认稳定' : '需开启预览'}</span>`;
const heading = (number, title, intro) => `<div class="section-head"><p class="eyebrow">${number}</p><div><h2>${title}</h2><p>${intro}</p></div></div>`;
const guide = await readFile(path.join(root, '../assets/overview-infographic.png'));
if (createHash('sha256').update(guide).digest('hex') !== baseline.guideHash) throw new Error('原始引导图校验不一致');

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Seiso 中文完整研究：Markdown 文档检查能力、Rust 模块、规则与算法原理、稳定与预览功能、使用场景、个人和研究总库价值、配置与业务扩展边界。保留原始引导图。">
  <meta name="theme-color" content="#102d43">
  <meta property="og:title" content="Seiso 文档规则检查与扩展研究">
  <meta property="og:description" content="理解 Markdown 元数据、文档结构与本地规则如何协同检查，以及对 AI 文档和研究总库的价值。">
  <meta property="og:image" content="${baseline.url}overview-infographic.png">
  <meta property="og:url" content="${baseline.url}">
  <link rel="canonical" href="${baseline.url}">
  <link rel="stylesheet" href="./styles.css">
  <script src="./app.js" defer></script>
  <title>Seiso 文档规则检查与扩展研究 · 007</title>
</head>
<body>
<a class="skip-link" href="#main">跳到主要内容</a>
<header class="site-header">
  <div class="header-inner"><a class="brand" href="#top"><span class="brand-mark" aria-hidden="true">S</span><span>Seiso <small>研究 007</small></span></a><nav aria-label="页面导航"><a href="#guide">引导图</a><a href="#capabilities">能力</a><a href="#architecture">模块与原理</a><a href="#value">场景与价值</a><a href="#extensions">扩展</a><a href="#sources">依据</a></nav><a class="hub-link" href="../">总库 <span aria-hidden="true">↗</span></a></div>
</header>
<main id="main">
<section class="hero wrap" id="top">
  <div class="hero-copy"><p class="eyebrow">MARKDOWN · 本地静态检查 · AI 文档维护</p><h1>让项目文档<br><span>接受可重复的检查。</span></h1><p class="hero-description">Seiso 把明确的文档维护要求变成规则。它用文档类型与配置选择策略，再检查 Markdown 的正文、结构和引用，给出可追踪的问题与修改建议。</p><div class="hero-actions"><a class="button primary" href="#guide">从完整引导图开始 <span aria-hidden="true">↓</span></a>${link(baseline.repository, '查看原仓库')}</div><p class="baseline">固定快照 <code>7e5b3b1</code> · 源码版本 ${baseline.version} · MIT<br>原图 ${baseline.researchedAt} · 网页整理 ${baseline.publishedAt}</p></div>
  <div class="hero-model" aria-label="Seiso 输入到输出关系"><div class="model-heading"><span class="dot"></span> 输入到诊断</div><pre><code>---
kind: howto
lang: zh
---

# 安装指南
[配置说明](reference.md)</code></pre><div class="model-arrow" aria-hidden="true">↓</div><div class="model-equation"><span>类型与策略</span><span>正文与结构</span><span>规则与索引</span></div><div class="model-output"><span class="output-icon" aria-hidden="true">✓</span><div><strong>位置 · 规则 · 来源 · 建议</strong><p>本地规则和算法执行检查，外部人或 AI 决定内容改写。</p></div></div><div class="rule-count"><div><strong>5</strong><span>默认稳定规则</span></div><div><strong>22</strong><span>预览规则</span></div></div></div>
</section>

<section class="section wrap" id="guide">
${heading('01 / 全景导览', '保留我们生成的完整引导图', '先看全景，再沿能力、模块、使用场景与扩展方向逐层阅读。点击图片可放大，原 PNG 字节保持不变。')}
<div class="guide-layout"><figure class="guide-figure"><button class="guide-open" id="guide-open" aria-label="放大 Seiso 完整中文引导图" aria-haspopup="dialog"><img src="./overview-infographic.png" alt="Seiso 文档规则检查全景图，包含本地算法、稳定和预览能力、使用场景、总库价值及扩展边界" width="1120" height="1402" fetchpriority="high"></button><figcaption>2026-10-09 原始中文研究说明图 · 非软件界面 · <a href="./overview-infographic.png" target="_blank" rel="noopener">打开完整原图 ↗</a></figcaption></figure>
<aside class="guide-reading"><h3>读图时记住四件事</h3><ol><li><strong>字段负责选择策略</strong><p>kind、lang、canonical 是内置元数据；类型也可由文件路径映射得到。</p></li><li><strong>检查读取完整文档</strong><p>标题、句子、列表、表格与链接均可提供规则需要的输入。</p></li><li><strong>大部分内容规则是预览</strong><p>重复内容、结构、表达与易变值检查需主动开启，并评估误报。</p></li><li><strong>扩展建议有开发成本</strong><p>业务字段、语义审阅和知识系统不会因为增加字段就自动出现。</p></li></ol><div class="callout"><strong>重复的是检查流程</strong><p>每次编辑或提交重复执行检查。文档内容本身无需重复，也不必使用完全相同的模板。</p></div></aside></div>
</section>

<section class="section tinted" id="capabilities"><div class="wrap">
${heading('02 / 能力地图', '从明确错误，到需要判断的风险', '默认规则偏保守；预览规则覆盖更丰富的文档维护问题。规则是否适用，还取决于文档类型、配置、语言和输入完整性。')}
<div class="capability-overview"><article><span class="badge stable">默认稳定</span><h3>类型、文件目标、例外</h3><p>文档类型缺失或无效、本地文件目标不存在，以及例外声明无效或不再需要。</p></article><article><span class="badge preview">开启预览</span><h3>内容、结构、引用与归属</h3><p>易变状态、对话残留、章节组织、标题锚点、重复定义、相似段落和邻近证据。</p></article><article><span class="badge neutral">处理结果</span><h3>诊断优先，修复有边界</h3><p>文本、JSON、SARIF、GitHub 注解。<code>--fix</code> 主要清理确认失效的例外，不自动改写文档含义。</p></article></div>
<div class="rules-header"><div><h3>27 条规则一览</h3><p id="rule-count" aria-live="polite">显示全部 27 条规则</p></div><div class="filter-group" role="group" aria-label="按规则状态筛选"><button type="button" data-rule-filter="all" aria-pressed="true">全部</button><button type="button" data-rule-filter="stable" aria-pressed="false">默认稳定</button><button type="button" data-rule-filter="preview" aria-pressed="false">预览规则</button></div></div>
<div class="rule-list">${rules.map(rule => `<details class="rule" data-status="${rule.status}"><summary><code>${rule.code}</code><span class="rule-title">${escape(rule.title)}</span>${badge(rule.status)}<span class="rule-plus" aria-hidden="true">+</span></summary><div class="rule-detail"><p><span class="rule-family">${escape(rule.family)}</span> ${escape(rule.detail)}</p>${link(rule.url, '查看固定版本规则说明')}</div></details>`).join('')}</div>
<p class="source-note">状态依据 ${link(source('src/rules/mod.rs'), '固定快照的规则注册表')}。预览规则不是质量已获保证的默认门禁。</p>
</div></section>

<section class="section wrap" id="architecture">
${heading('03 / 模块与原理', '解析文档，再建立关系，最后执行检查', 'Seiso 用 Rust 实现，同时暴露库与 CLI。流程主要是解析器、策略、词表、正则、结构启发式、文件系统检查和集合相似度。')}
<ol class="pipeline"><li><span>01</span><h3>加载</h3><p>读取 Markdown、配置与需要的工作区输入。</p></li><li><span>02</span><h3>解析</h3><p>建立文档模型，保留标题、块、句子、链接与原文位置。</p></li><li><span>03</span><h3>关联</h3><p>解析类型、语言、领域、标题锚点和目标路径。</p></li><li><span>04</span><h3>检查</h3><p>执行所选单文件与跨文件规则，处理例外与完整性。</p></li><li><span>05</span><h3>报告</h3><p>输出位置、关联依据与建议，按条件应用有限修复。</p></li></ol>
<div class="table-wrap"><table><caption>核心源码模块及职责</caption><thead><tr><th scope="col">模块</th><th scope="col">职责</th><th scope="col">具体输入与处理</th></tr></thead><tbody>${modules.map(module => `<tr><th scope="row">${link(module.url, module.name)}</th><td>${escape(module.title)}</td><td>${escape(module.description)}</td></tr>`).join('')}</tbody></table></div>
<div class="mechanism-grid"><article><p class="eyebrow">类型与配置</p><h3>字段是策略入口</h3><p><code>kind</code> 声明用途，<code>lang</code> 控制语言，<code>canonical</code> 参与权威来源排序。声明优先于路径映射，损坏的声明不会被映射救回。</p><p>只有内置字段和已实现规则有相应语义。业务字段需要新的检查实现。</p></article><article><p class="eyebrow">词表与结构</p><h3>识别语言和章节信号</h3><p>内置中英日词表结合句子、标题、上下文与阈值，识别对话残留、易变值和章节职责。代码块与普通正文有不同输入边界。</p><p>匹配到信号是风险提示，不代表完整理解了技术语义。</p></article><article><p class="eyebrow">跨文件比较</p><h3>比较集合，提示重复维护</h3><p>DUP001 默认要求至少五个共同标识符，Jaccard 相似度 ≥ 0.8。DUP003 对足够长、信息量足够的独立段落比较五字符片段，相似度 ≥ 0.9。</p><p>同语言、同领域才比较；高相似度不证明错误，也不能发现所有改写后的同义内容。</p></article><article><p class="eyebrow">索引与缓存</p><h3>缓存解析，重新判断策略</h3><p>本地链接和锚点借助路径与文档索引检查；缓存只保存内容派生的解析结果，并按内容哈希识别输入。</p><p>配置、文件路径、链接目标和规则结果会重新判断。缓存不是知识库。</p></article></div>
<div class="ownership"><strong>重复内容的来源排序</strong><p><code>canonical: true</code> → generated → reference → ADR → howto → README → 其他类型。排序依据是约定；最高优先级相同则提示作者决定，不用 Git 年龄代替判断。</p></div>
</section>

<section class="section tinted" id="examples"><div class="wrap">
${heading('04 / 规则如何判定', '看得到证据，才知道该怎么修', '下面是依据官方规则解释的文档示例，用于理解判断流程；页面没有运行 Seiso，也没有把这些示例当作实测输出。')}
<div class="example-tabs" role="tablist" aria-label="规则示例">${examples.map((item, i) => `<button role="tab" type="button" id="tab-${item.id}" aria-controls="example-${item.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${escape(item.label)}</button>`).join('')}</div>
${examples.map((item, i) => `<article class="example-panel" id="example-${item.id}" role="tabpanel" aria-labelledby="tab-${item.id}"${i === 0 ? '' : ' hidden'}><div class="example-input"><p class="code-label">文档示例</p><pre><code>${escape(item.before)}</code></pre></div><div class="example-explanation"><div><code>${item.code}</code> ${badge(item.status)}</div><h3>工具观察到什么</h3><p>${escape(item.observation)}</p><h3>作者需要决定什么</h3><p>${escape(item.decision)}</p></div><div class="example-after"><p class="code-label">一种修复方式</p><pre><code>${escape(item.after)}</code></pre></div></article>`).join('')}
</div></section>

<section class="section wrap" id="value">
${heading('05 / 使用场景与价值', '把文档维护接到你的研究流程中', '适合文档反复更新、检查标准明确、项目持续维护的场景。它的价值主要是发现一类可重复识别的问题，减少遗漏与多处维护。')}
<div class="scenario-grid">${scenarios.map(([title, description, boundary], i) => `<article><span class="scenario-number">0${i + 1}</span><h3>${title}</h3><p>${description}</p><p class="scenario-boundary">${boundary}</p></article>`).join('')}</div>
<div class="value-board"><div class="value-intro"><p class="eyebrow">你的 GITHUB 研究总库</p><h3>补充内容检查，保留已有校验。</h3><p><code>projects.json</code> 保存元数据，<code>index:sync</code> 生成索引，<code>npm run check</code> 校验编号、目录和图片。Seiso 补充 Markdown 内容、结构与引用问题。</p><p class="value-caution">固定 commit、运行环境与许可证是研究复现依据。按用途保留，必要时解释例外；不能为了通过规则删除必要证据。</p></div><div class="value-items">${values.map(([title, detail]) => `<article><h4>${title}</h4><p>${detail}</p></article>`).join('')}</div></div>
<div class="tradeoff"><h3>什么时候值得采用</h3><p>当文档数量和修改频率使人工评审容易遗漏、团队愿意约定文档职责时，自动检查更有价值。只有几份随手笔记，或需要判断技术结论是否正确时，单靠这些规则收益有限。当前研究未量化采用后节省的时间或质量提升。</p></div>
</section>

<section class="section tinted" id="adoption"><div class="wrap">
${heading('06 / 接入方法', '先跑稳定检查，再评估预览规则', '配置要符合你的文档用途。总库的业务字段要求与 Seiso 的内置规则分别负责不同检查，不能因为声明一个字段就推断它已被验证。')}
<div class="adoption-grid"><article><h3>命令入口</h3><pre><code>npm install -g @scarletkc/seiso
seiso init
seiso check

# 本地评估预览规则
seiso check --preview
seiso rule --all
seiso rule DUP003

# 查看策略与结构
seiso policy
seiso index --dump
seiso check --output-format json</code></pre><p>审阅 init 建议的映射与排除项，再依赖结果。本页不把 Seiso 安装到总库根依赖中。</p></article><article><h3>研究总库配置示意</h3><pre><code>include = ["**/*.md"]
preview = false

[[kinds]]
path = "**/README.md"
kind = "readme"

[[kinds]]
path = "**/AGENTS.md"
kind = "agents"

[[domains]]
path = "projects/007-seiso/**"
name = "seiso"

[lint.lexicon.zh]
extend-stale-markers = ["截至目前"]</code></pre><p>这是配置示意，尚未应用到总库。综合研究记录应先按用途组织；不同项目应分别配置领域。</p></article></div>
<details class="kind-details"><summary>文档类型对应哪些用途 <span aria-hidden="true">+</span></summary><div class="table-wrap"><table><caption>Seiso 约定的九种文档类型</caption><thead><tr><th scope="col">类型</th><th scope="col">读者任务</th><th scope="col">主要内容</th></tr></thead><tbody>${kinds.map(([kind, question, description]) => `<tr><th scope="row"><code>${kind}</code></th><td>${question}</td><td>${description}</td></tr>`).join('')}</tbody></table></div></details>
<div class="workflow-strip"><span>研究模板</span><span>人或 AI 写 Markdown</span><span>总库校验 + Seiso</span><span>修复并复查</span><span>提交</span></div>
<div class="command-note"><p><strong>退出状态：</strong>0 表示无违反或显式 exit-zero，1 表示发现违反，2 表示工具错误或检查未完成。无规则生效的检查也可能返回 0，接入门禁前要检查 policy。</p><p><strong>集成边界：</strong>Claude Code PostToolUse 在保存后反馈，不能撤销编辑，也不覆盖 shell 写入；提交前仍需检查。官方 pre-commit 的 Python 环境从源码构建，需 Rust 工具链。</p></div>
</div></section>

<section class="section wrap" id="extensions">
${heading('07 / 可扩展方向', '按能力来源分层，避免把设想当现成产品', '先使用已有配置，再接入工作流。只有新增规则或外部系统，才会获得业务校验、语义审阅和知识管理等新能力。')}
<div class="extension-grid">${extensions.map((item, i) => `<article class="extension level-${i}"><div class="extension-meta"><span>0${i + 1} / ${item.level}</span><span>${item.status}</span></div><h3>${item.title}</h3><ul>${item.items.map(text => `<li>${text}</li>`).join('')}</ul><p>${item.boundary}</p></article>`).join('')}</div>
</section>

<section class="section dark" id="boundaries"><div class="wrap boundary-layout"><div><p class="eyebrow">08 / 能力边界</p><h2>规则能检查的，<br>与人需要判断的。</h2><p>自动检查的价值建立在清晰边界上：诊断强度不应超过证据，修复也不应创造没有依据的事实。</p></div><ul><li><strong>技术事实与证据质量</strong><span>不核验文档与代码语义一致，也不证明比较结论或引用来源可靠。</span></li><li><strong>语义重复与合理例外</strong><span>相似度和词表会漏掉改写，也可能提示合理重复。判断和理由由作者提供。</span></li><li><strong>任意业务字段</strong><span>来源、commit、环境、许可证等需要额外规则；不是通用 schema 验证器。</span></li><li><strong>数据库与知识检索</strong><span>本地索引和缓存服务检查，不提供知识库存储、查询或模型推理。</span></li><li><strong>外部链接与自动改写</strong><span>不抓取外部 URL；--fix 不承担文档含义改写，外部 Agent 可以另行处理。</span></li></ul></div></section>

<section class="section wrap" id="sources">
${heading('09 / 依据与验证', '结论落到固定源码，扩展落到明确建议', '本页继承 2026-10-09 的研究基线与原图，并于 2026-10-12 整理。描述固定快照的能力，不把源码版本当成当前最新版本。')}
<div class="evidence-summary"><p><strong>源码事实：</strong>规则、模块、算法、配置与集成来自固定快照。</p><p><strong>应用判断：</strong>对总库的价值与采用条件是基于机制的分析，尚未量化实际收益。</p><p><strong>示例与扩展：</strong>文档示例用于解释规则；业务检查器、模型与知识系统属于待开发方向。</p><p><strong>验证范围：</strong>研究网页、资源与交互可独立验证；本次没有运行上游 Seiso CLI 或其完整测试集。</p></div>
<div class="source-grid">${sources.map(item => `<a href="${item.url}" target="_blank" rel="noopener noreferrer"><strong>${item.label} <span aria-hidden="true">↗</span></strong><code>${item.path}</code></a>`).join('')}</div>
<p class="license-note">源码基线 <code>${baseline.commit}</code> · ${baseline.version} · MIT / Copyright (c) 2026 ScarletKc。本站为独立中文研究说明，未复制上游实现。</p>
</section>
</main>
<footer class="site-footer wrap"><p><strong>007 / Seiso</strong> · GitHub 项目研究总库</p><div><a href="../">返回总索引</a>${link('https://github.com/yydshly/1009_codex_project/tree/main/projects/007-seiso', '研究文档')}${link(baseline.repository, '上游仓库')}<a href="#top">回到顶部 ↑</a></div></footer>
<dialog id="guide-dialog" aria-labelledby="guide-dialog-title"><div class="dialog-header"><h2 id="guide-dialog-title">Seiso 完整中文引导图</h2><button id="guide-close" type="button" aria-label="关闭引导图">关闭 ×</button></div><div class="dialog-image"><img src="./overview-infographic.png" alt="可放大阅读的 Seiso 完整原始引导图"></div></dialog>
</body></html>`;

await mkdir(dist, { recursive: true });
await writeFile(path.join(dist, 'index.html'), html);
await writeFile(path.join(dist, 'overview-infographic.png'), guide);
for (const file of ['styles.css', 'app.js']) await cp(path.join(root, file), path.join(dist, file));
console.log('Seiso 研究页已构建：固定源码、27 条规则、11 个模块、原始引导图。');
