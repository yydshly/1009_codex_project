import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as data from '../src/content.mjs';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.dirname(web);
const dist = path.join(web, 'dist');
await import('./write-docs.mjs');
const escape = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const link = (file, label = '源码依据 ↗') => `<a class="source-link" href="${data.source(file)}" target="_blank" rel="noreferrer">${escape(label)}</a>`;
const table = (headers, rows) => `<table><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, i) => `<td data-label="${escape(headers[i])}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const panels = (items, render, className = '') => `<div class="panels ${className}">${items.map(render).join('')}</div>`;
const sectionHeading = (n, kicker, title, text) => `<header class="section-heading"><p class="eyebrow">${n} / ${kicker}</p><h2>${title}</h2><p>${text}</p></header>`;
const toc = [
  ['definition', '定位与完整摘要'], ['guide', '原始引导图'], ['capabilities', '能力与边界'],
  ['modules', '模块与职责'], ['principle', '消息如何变成工作'], ['memory', '记忆与跟进'],
  ['deployment', '部署与运行条件'], ['value', '价值与相邻方案'], ['scenarios', '适合的场景'],
  ['extensions', '可扩展方向'], ['personal', '对我们的意义'], ['boundaries', '使用边界'], ['sources', '版本与证据'],
];

await mkdir(path.join(dist, 'assets'), { recursive: true });
await cp(path.join(project, 'assets/alook-guide.png'), path.join(dist, 'assets/alook-guide.png'));
for (const file of ['styles.css', 'app.js', 'favicon.svg']) await cp(path.join(web, 'src', file), path.join(dist, file));
for (const file of ['README.md', 'research.md']) await cp(path.join(project, file), path.join(dist, file));

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(data.summary)}">
  <meta name="theme-color" content="#123e47">
  <meta property="og:title" content="Alook：群聊共享 Agent 与持续协作研究">
  <meta property="og:description" content="能力、模块、原理、价值、场景与扩展方向；保留完整中文引导图。">
  <meta property="og:type" content="article">
  <title>Alook：群聊共享 Agent 与持续协作研究 · 017</title>
  <link rel="icon" href="./favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="./styles.css">
  <script src="./app.js" defer></script>
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="topbar"><a class="brand" href="../"><span class="brand-mark">017</span><span>开源项目研究<span class="brand-small">ALOOK / SHARED AGENTS</span></span></a><nav aria-label="外部资料"><a href="${data.repository}" target="_blank" rel="noreferrer">原仓库 ↗</a><a href="./research.md" download>研究记录 ↓</a></nav></header>
<main id="main">
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy"><p class="eyebrow">产品定义 · 协作入口 · 运行管理</p><h1 id="hero-title">群聊里的<br><em>共享 Agent</em> 入口</h1><p class="hero-lead">让有访问权限的成员，共同调用一个或多个本地 AI Agent。人提出需求，Agent 使用模型与工具完成工作，再把结果带回共同房间。</p><p class="hero-core"><strong>多人 → 一个 Agent 也成立。</strong><br>多 Agent 是可选能力；自动分工还需要额外编排。</p><div class="actions"><a class="button primary" href="#guide">看完整引导图</a><a class="button" href="#principle">理解执行链路</a></div><p class="small muted">原图：2026-10-09 / v0.1.46 · 正文核查：${data.researchDate} / app 0.1.48<br>源码与文档研究；真实 Agent 未独立实跑。</p></div>
    <figure class="hero-figure"><button type="button" class="image-button" data-guide-open aria-label="放大 Alook 原始中文引导图"><img src="./assets/alook-guide.png" width="1086" height="1448" alt="Alook 原始中文信息图：共享入口、侧重点、价值、场景、扩展方向、个人意义与边界"></button><figcaption><span>我们形成的理解</span><span>点击放大 ↗</span></figcaption></figure>
  </section>
  <div class="reading-layout">
    <aside class="contents"><p class="eyebrow">阅读目录</p><nav aria-label="章节目录">${toc.map(([id, title], i) => `<a href="#${id}"><span>${String(i + 1).padStart(2, '0')}</span>${title}</a>`).join('')}</nav><p class="small">青色：源码能力<br>蓝色：分析判断<br>琥珀色：扩展建议</p></aside>
    <div class="article">
      <section id="definition">
        ${sectionHeading('01', 'PRODUCT DEFINITION', '先把产品说清楚', '产品方向是把个人 Agent 变成可信团队能够共同使用的工作资源。以下把我们的理解与源码事实分开记录。')}
        <div class="definition-statement">一个共享的 AI 工作入口，加上身份、消息、连接和会话管理。</div>
        <div class="layers"><div><span>模型</span><strong>理解与推理</strong></div><div><span>Agent</span><strong>上下文、工具与执行</strong></div><div class="layer-focus"><span>Alook</span><strong>人和 Agent 的协作入口</strong></div><div><span>业务适配</span><strong>知识、流程与验收</strong></div></div>
        <p>“群聊客服”可以帮助理解入口形态：获准成员给同一个对象发消息。它能够执行什么工作，取决于接入 Agent 的工具、工作环境和业务配置。“给 AI 定制身份”指名称、角色说明和持久上下文，不涉及重新训练模型。</p>
        <p>当前品牌定义强调<strong>把已有 Agent 分享给可信的人</strong>，并保持 Agent 在自己的机器上执行。${link('src/web/src/lib/brand-copy.ts', '品牌文案 ↗')}</p>
        <h3>完整研究摘要</h3>
        <dl class="summary-list">${data.summarySections.map(s => `<div><dt>${escape(s.label)}</dt><dd>${escape(s.text)}</dd></div>`).join('')}</dl>
      </section>
      <section id="guide">
        ${sectionHeading('02', 'ORIGINAL GUIDE', '保留我们生成的完整引导图', '原图保持字节不变，可放大、打开原尺寸和下载。它是中文研究说明图，不是 Alook 的真实软件界面。')}
        <div class="guide-stage"><button type="button" class="image-button" data-guide-open aria-label="放大完整引导图"><img src="./assets/alook-guide.png" width="1086" height="1448" loading="lazy" alt="完整中文引导图，含六个主题面板和多人到本地 Agent 的调用路径"></button></div>
        <div class="actions"><button class="button primary" type="button" data-guide-open>放大阅读</button><a class="button" href="./assets/alook-guide.png" target="_blank" rel="noreferrer">打开原尺寸 ↗</a><a class="button" href="./assets/alook-guide.png" download="alook-guide.png">下载 PNG ↓</a></div>
        <div class="version-note"><strong>版本说明</strong><p>原图依据 v0.1.46 / <code>fec1f68</code>（2026-10-09）；正文依据 <code>${data.sourceRef.slice(0, 7)}</code>（2026-10-12），该快照中的 <code>@alook/app</code> 版本为 0.1.48。核心定位与图中架构保持一致；当前提示词补充了附件 ID 跨会话目标复用和产品操作指引。原图没有覆盖全部新增细节。</p><p>正文另外注明：驱动注册表还包含 Grok / Antigravity；这属于源码观察，未据此宣布所有产品接入路径都已验证。</p></div>
      </section>
      <section id="capabilities">
        ${sectionHeading('03', 'CAPABILITIES', '平台负责什么，Agent 负责什么', '区分协作底座与具体任务能力：平台让 Agent 可被找到、通知和使用，业务能力由模型、工具及流程共同决定。')}
        ${panels(data.capabilities, c => `<article class="capability"><span class="badge existing">源码能力</span><h3>${escape(c.name)}</h3><p>${escape(c.what)}</p><dl><div><dt>作用</dt><dd>${escape(c.meaning)}</dd></div><div><dt>边界</dt><dd>${escape(c.boundary)}</dd></div></dl>${link(c.file)}</article>`)}
      </section>
      <section id="modules">
        ${sectionHeading('04', 'MODULES', '从入口到执行的九个模块', '代码按职责组织。外围应用与服务负责可访问性，Daemon 和驱动把任务送入真正的 Agent。')}
        ${table(['模块 / 目录', '职责', '在链路中的作用'], data.modules.map(m => [`<strong>${escape(m.name)}</strong><code class="block-code">${escape(m.path)}</code>`, escape(m.responsibility), `${escape(m.relation)}<br>${link(m.file)}`]))}
        <p class="small muted">应用技术栈包含 Next.js、Cloudflare Workers、Durable Objects、D1/SQLite、R2；桌面为原生外壳。本地 app CLI 借助 Wrangler 运行相应服务。${link('src/web/wrangler.toml', '部署配置 ↗')}</p>
      </section>
      <section id="principle">
        ${sectionHeading('05', 'MESSAGE → WORK', '一条群聊消息如何变成实际工作', '下面是阅读示意。选择步骤查看边界；它不发送消息、不连接模型，也不操作你的机器。')}
        <ol class="flow-steps">${data.steps.map((s, i) => `<li><button type="button" data-step="${i}" aria-pressed="${i === 0}" aria-controls="step-detail"><span>${String(i + 1).padStart(2, '0')}</span><strong>${escape(s.title)}</strong><small>${escape(s.actor)}</small></button></li>`).join('')}</ol>
        <div class="step-detail" id="step-detail" aria-live="polite"><p class="eyebrow" id="step-actor">${escape(data.steps[0].actor)}</p><h3 id="step-title">${escape(data.steps[0].title)}</h3><p id="step-text">${escape(data.steps[0].text)}</p><p class="step-result" id="step-result">${escape(data.steps[0].result)}</p><a class="source-link" id="step-source" href="${data.source(data.steps[0].file)}" target="_blank" rel="noreferrer">对应源码 ↗</a></div>
        <h3>控制面与数据面分开</h3><p>控制面通过 WebSocket 告诉主机“某频道有新消息”或“停止”；数据面提供 Agent 使用的读历史、收件箱、发送与附件等接口。唤醒通知、模型读取确认和结果回传分别发生，不能合并成一个“任务已经成功”的状态。</p>
        <h3>驱动隐藏原生协议差异</h3>
        ${table(['运行时', '原生接入', '输入与会话处理'], data.runtimes.map(r => [`<strong>${escape(r.name)}</strong>`, escape(r.protocol), `${escape(r.delivery)}<br>${link(r.file)}`]))}
        <p><code>AgentSession</code> 提供 <code>start</code>、<code>send</code>、<code>interrupt</code>、<code>stop</code>、快照和标准事件。驱动会处理 FIFO、准入、投递和结束顺序，具体能力仍随后端而异。</p>
        <h3>消息一致性比“收到通知”更细</h3><p>唤醒协调器维护希望投递、已经准入和模型已见的消息序号，合并重复通知。收件箱 freshness 逻辑还会检查 Agent 是否漏看新消息，并对部分外发动作进行暂存。这些机制降低过时上下文风险，实际效果需要端到端实验验证。${link('src/daemon/src/manager/wakeCoordinator.ts', '唤醒协调 ↗')} · ${link('src/daemon/src/inbox/stateMachine.ts', '收件箱保护 ↗')}</p>
      </section>
      <section id="memory">
        ${sectionHeading('06', 'MEMORY & INITIATIVE', '连续性来自记录与重新读取', '记忆由工作目录文件、事件记录和服务端标记组成，Agent 按提示词读取、核查和维护。')}
        ${table(['载体', '保存什么', '工作约定'], data.memories.map(m => [`<code>${escape(m.name)}</code>`, escape(m.role), escape(m.rule)]))}
        <p>空闲会话准备重置时，维护提示词要求去重、核查事实、学习可复用经验并修正过时内容。它说明设计意图，不能保证每次记忆都正确。${link('src/daemon/src/manager/memoryMaintenancePrompt.ts', '记忆维护提示 ↗')}</p>
        <div class="reminder"><h3>主动跟进的具体边界</h3><p>发送消息时可指定 <code>--remind-after</code>，范围为 1 分钟到 24 小时，或 0 关闭。若期间没有更新的消息，Daemon 再提醒 Agent；观察到新消息会取消提醒。</p><p><strong>这类提醒使用内存 Map 和 setTimeout。</strong> 守护进程重启后不保留，提醒交付失败也不重试。现有持久唤醒队列与这种本地计时器不同，长期业务调度仍需额外设计。${link('src/daemon/src/daemon/messageReminderScheduler.ts', '跟进实现 ↗')}</p></div>
      </section>
      <section id="deployment">
        ${sectionHeading('07', 'DEPLOYMENT', '两种使用方式，一组执行前提', '这是上游的运行方式说明。我们本次部署的是这份静态研究网页，不是 Alook 服务或真实 Agent。')}
        <div class="deployment-options"><article><span class="badge existing">托管入口</span><h3>使用 Alook 房间，连接本机</h3><p>账号与协作界面使用托管平台，本机运行并配对 Daemon，选用已安装的 Agent。服务端处理聊天和状态，工作在绑定机器执行。</p><p>需要可信成员、可连接的机器、运行时与模型认证。</p></article><article><span class="badge existing">自托管</span><h3>应用服务也放在自有环境</h3><p><code>npx @alook/app onboard</code> 检查环境、安装服务、生成密钥、迁移数据库、创建本地账号并配对机器。后续有 start / stop / update。</p><p>当前 app 要求 Node.js ≥20.9；源码开发还使用 pnpm 与 Bun。</p></article></div>
        ${table(['本地服务', '默认端口', '用途'], [['Web', '15210', '界面、API 与账号'], ['Email Worker', '15211', '邮件处理服务；本地模式不能邮件收发'], ['WebSocket / DO', '15212', '实时连接'], ['Wake Worker', '15213', '派发未读消息唤醒']])}
        <p>本地服务共享 SQLite/D1 状态，数据保存在 <code>~/.alook/self-hosted/</code> 对应目录。Agent、模型调用方式和工作权限另行准备；Agent 进程在本地不代表推理也完全离线。本地模式禁用 GitHub/Google OAuth，使用邮箱与密码。${link('src/app/README.md', '上游自托管说明 ↗')}</p>
      </section>
      <section id="value">
        ${sectionHeading('08', 'VALUE · ANALYSIS', '价值落在减少交接与可靠交付', '“AI 可以进群”已有现成方案。我们的判断是：差异化主要来自完整的共享体验与运行管理，技术独占性尚不能从源码直接证明。')}
        ${panels(data.values, v => `<article class="value-item"><span class="badge interpretation">分析判断</span><h3>${escape(v.title)}</h3><p>${escape(v.text)}</p><p class="small"><strong>验证方式：</strong>${escape(v.check)}</p></article>`, 'three')}
        <h3>相邻项目的侧重点</h3>
        ${table(['方案', '主要侧重点', '与 Alook 的关系'], data.comparisons.map(c => [`<a href="${c.url}"${c.url.startsWith('https:') ? ' target="_blank" rel="noreferrer"' : ''}>${escape(c.name)} ↗</a>`, escape(c.focus), escape(c.overlap)]))}
        <p>自建房间意味着团队多一个沟通入口。采用时需要证明：共同上下文、工作接续与交付收益足以抵消聊天迁移和服务维护成本。当前没有据此断言 Alook 已形成商业壁垒或成熟的全自动业务系统。</p>
      </section>
      <section id="scenarios">
        ${sectionHeading('09', 'USE CASES · ANALYSIS', '适合可信小团队的共同工作', '以下是基于能力的场景判断与业务示例，不是已经连接并运行的本地演示。')}
        ${panels(data.scenarios, s => `<article class="scenario"><span class="badge interpretation">示例场景</span><h3>${escape(s.name)}</h3><dl><div><dt>输入</dt><dd>${escape(s.input)}</dd></div><div><dt>执行</dt><dd>${escape(s.execution)}</dd></div><div><dt>条件</dt><dd>${escape(s.fit)}</dd></div></dl></article>`)}
        <p>单人简单问答、已经顺畅使用现有 Agent 的流程，新增共享底座的收益可能有限。需要严格持久调度、交易式执行或无人验收的业务，应先补流程和可靠性设计。</p>
      </section>
      <section id="extensions">
        ${sectionHeading('10', 'EXTENSIONS · PROPOSALS', '从共享入口扩展到业务交付', '所有方向都是建议或待验证工作，不能读成 Alook 当前已经完整提供的功能。先验证一个真实任务，再决定扩展范围。')}
        ${panels(data.extensions, x => `<article class="extension"><span class="badge proposal">${escape(x.status)}</span><h3>${escape(x.title)}</h3><dl><div><dt>基础</dt><dd>${escape(x.from)}</dd></div><div><dt>补充</dt><dd>${escape(x.add)}</dd></div><div><dt>价值</dt><dd>${escape(x.value)}</dd></div></dl></article>`)}
      </section>
      <section id="personal">
        ${sectionHeading('11', 'FOR THIS RESEARCH HUB', '对我们的意义：先研究，再小范围验证', '按本总库“研究优秀开源项目、评估可复用能力”的背景分析；没有假定你已有某个团队或业务系统。')}
        <ol class="personal-list">${data.personal.map((p, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><div><h3>${escape(p.title)}</h3><p>${escape(p.text)}</p></div></li>`).join('')}</ol>
        <div class="experiment"><h3>候选最小实验 · 尚未实施</h3><p>输入一个仓库与研究重点 → Agent 读取固定版本 → 输出能力、模块、原理、边界和来源 → 人核查 → 更新 <code>projects.json</code>、研究文档与网页。代码提交或发布等动作按业务权限执行。</p><p>先验证单 Agent 共享，再按需要引入研究、实现与审查角色。成功标准是证据完整、交接更少、结果可验收。</p></div>
      </section>
      <section id="boundaries">
        ${sectionHeading('12', 'BOUNDARIES', '把边界作为采用条件', '身份、成员访问、运行凭据和实际执行权限属于不同层次。共享执行能力前，需要了解各层在当前版本的实际行为。')}
        <dl class="boundary-list">${data.boundaries.map(b => `<div><dt>${escape(b.title)}</dt><dd><p>${escape(b.text)}</p>${link(b.file)}</dd></div>`).join('')}</dl>
        <p class="small">Claude 的权限配置另见 ${link('src/daemon/agent-driver/src/adapters/claude/launch.ts', 'launch.ts ↗')}；运行凭据代理见 ${link('src/daemon/src/credentials/credentialProxy.ts', 'credentialProxy.ts ↗')}。权限事实描述对应固定源码，不宣称已经完成执行安全评估。</p>
      </section>
      <section id="sources">
        ${sectionHeading('13', 'EVIDENCE & VALIDATION', '每个结论都能回到版本与依据', '源码事实、文档表述、分析判断、示例和扩展建议分别标注；网页验证与上游 Agent 验证分开记录。')}
        <dl class="summary-list"><div><dt>原仓库</dt><dd><a href="${data.repository}" target="_blank" rel="noreferrer">alookai/alook ↗</a></dd></div><div><dt>正文快照</dt><dd><a class="long-ref" href="${data.repository}/commit/${data.sourceRef}" target="_blank" rel="noreferrer">${data.sourceRef}</a> · ${data.researchDate}</dd></div><div><dt>图示基线</dt><dd>v0.1.46 / <a href="${data.repository}/commit/${data.guideRef}" target="_blank" rel="noreferrer">${data.guideRef.slice(0, 7)}</a> · 2026-10-09；完整原 PNG 保留。</dd></div><div><dt>许可证</dt><dd>${link('LICENSE', 'Apache-2.0 ↗')}；本站是原创研究文字与页面，未引入上游执行代码。</dd></div><div><dt>验证范围</dt><dd>静态网页构建、资源与锚点、原图一致性、桌面/手机阅读、图片放大、步骤切换和 Pages 发布。未独立启动 Alook、调用模型或执行 Agent 任务。</dd></div></dl>
        <div class="source-list">${data.evidence.map(e => `<article><h3>${link(e.file, e.title + ' ↗')}</h3><code>${escape(e.file)}</code><p>${escape(e.detail)}</p></article>`).join('')}</div>
        <div class="actions"><a class="button" href="./README.md" download>下载研究说明 ↓</a><a class="button" href="./research.md" download>下载研究记录 ↓</a><a class="button" href="#main">返回开头 ↑</a></div>
      </section>
    </div>
  </div>
</main>
<footer><p><strong>017 · Alook 研究</strong><br>把个人 Agent 变成可信团队可共同使用的工作资源。</p><a href="../">返回研究总索引 ↑</a></footer>
<dialog id="guide-dialog" aria-labelledby="guide-dialog-title"><div class="dialog-toolbar"><h2 id="guide-dialog-title">完整引导图 · 原图</h2><a href="./assets/alook-guide.png" download="alook-guide.png">下载 PNG ↓</a><button type="button" id="guide-close" aria-label="关闭引导图">关闭 ×</button></div><div class="dialog-image"><img src="./assets/alook-guide.png" width="1086" height="1448" alt="Alook 完整原始中文引导图，保持生成时版本"></div></dialog>
<script type="application/json" id="flow-data">${JSON.stringify(data.steps.map(s => ({ ...s, url: data.source(s.file) }))).replaceAll('<', '\\u003c')}</script>
</body>
</html>`;
await writeFile(path.join(dist, 'index.html'), html);
console.log('Alook 完整研究页已构建：13 个章节、原始引导图和固定源码链接。');
