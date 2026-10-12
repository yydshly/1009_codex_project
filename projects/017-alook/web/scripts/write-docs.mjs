import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as d from '../src/content.mjs';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const code = value => '`' + value + '`';
const reference = (file, label = file) => `[${label}](${d.source(file)})`;
const rows = (headers, values) => ['| ' + headers.join(' | ') + ' |', '| ' + headers.map(() => '---').join(' | ') + ' |', ...values.map(row => '| ' + row.map(v => String(v).replaceAll('|', '\\|').replaceAll('\n', '<br>')).join(' | ') + ' |')].join('\n');
const environment = rows(['项目', '信息'], [
  ['原仓库', d.repository], ['正文固定快照', `[${d.sourceRef}](${d.repository}/commit/${d.sourceRef}) · ${d.researchDate}`],
  ['当前源码应用版本', '@alook/app 0.1.48'], ['原图基线', `v0.1.46 / ${d.guideRef} · 2026-10-09`],
  ['上游许可证', reference('LICENSE', 'Apache-2.0')], ['本地环境', 'Windows / PowerShell；Node.js 22.15.0；网页零 npm 依赖'],
  ['上游要求', 'app Node.js ≥20.9；Agent 运行时、模型认证、工具与网络另行准备；源码开发使用 pnpm/Bun'],
  ['验证界限', '源码研究与原创静态页；没有独立启动 Alook、调用模型或执行真实 Agent'],
]);
const commands = ['```sh', 'npm run build --prefix projects/017-alook/web', 'npm run check --prefix projects/017-alook/web', 'npm run index:sync', 'npm run check', 'npm run pages:build', '```'].join('\n');
const definition = 'Alook 是群聊中共享的 AI 工作入口：获准成员给同一个对象提需求，Agent 使用模型和工具处理，再回到共同房间交付。多人共享一个 Agent 就已经构成核心体验；多 Agent 是可选能力，自动任务分解、优先级协调、结果合并和业务验收还需要业务适配与额外编排。';
const picture = '![我们生成的 Alook 完整中文引导图](assets/alook-guide.png)\n\n原图保持字节不变，属于原创研究说明，非上游产品界面或实际 Agent 运行截图。原图对应 2026-10-09 的 v0.1.46；正文核查 2026-10-12 固定源码。提示词新增附件 ID 复用与产品操作指引，注册表额外后端单独标为源码观察。';
const readme = [
  '# 017 · Alook：群聊共享 Agent 与持续协作研究', '> ' + d.summary,
  '[在线研究网页](https://yydshly.github.io/1009_codex_project/017-alook/) · [研究记录](research.md) · [网页说明](web/README.md) · [原仓库](' + d.repository + ')',
  environment, '## 我们形成的理解', definition,
  '产品方向是把个人 Agent 变成可信团队能够共同使用的工作资源。名字、角色说明、成员关系与持久上下文构成可被找到的对象，模型与实际任务能力来自接入运行时。',
  '## 完整摘要', ...d.summarySections.map(s => `- **${s.label}：** ${s.text}`),
  '## 原始引导图', picture,
  '## 网页内容与阅读方式', '13 个章节覆盖定位、原图、能力、模块、执行路径、记忆、部署、价值、场景、扩展、个人意义、边界和证据。',
  '- 原图放大、打开原尺寸和下载；Escape 关闭并恢复焦点。\n- 六步调用路径可选中阅读，并查看对应角色、技术边界和固定源码。\n- 完整摘要、模块表、运行时、记忆、扩展和证据同时可见。\n- 手机表格按列名重排，支持 320px；没有外部字体、脚本或分析服务。\n- 研究说明与过程记录支持下载。',
  '交互用于阅读，没有连接真实 Agent、不收集密钥，也没有实现图中的业务扩展。',
  '## 构建与发布', commands,
  '子项目 web/ 运行 npm run dev，本地地址 http://127.0.0.1:4187/。统一 Pages 子路径为 /1009_codex_project/017-alook/。pagesDir 指向 web/dist；两份根工作流构建与检查；web/dist 和 _site 不提交。',
  '## 来源与本地改动', '依据固定快照中的 README、app/daemon 文档、唤醒、会话、记忆、凭据与驱动源码，以及相邻项目官方资料。本地新增原创研究数据、文字、页面和原图；未引入上游执行代码。以后引入代码时保留 Apache-2.0 LICENSE 与版权声明。',
].join('\n\n') + '\n';
const research = [
  '# 017 · Alook 研究记录', '## 研究范围', '将对话中的能力、原理与价值判断完整整理成网页。保留原始引导图，区分源码事实、文档约定、分析判断、业务示例与待验证扩展。',
  '## 基线与环境', environment,
  '## 理解校准', definition,
  rows(['简化理解', '准确边界'], [
    ['定制身份进入群聊', '名称、角色、收件箱、成员与记忆；不涉及重新训练模型'],
    ['本质是多 Agent', '多人共享一个 Agent 也成立；接入多个运行时与自动分工是不同层次'],
    ['所有人都能调度', '获准成员；访问和通知策略影响消息读取与唤醒'],
    ['类似群聊客服', '入口相近；任务可延伸到文件、代码和工具执行，取决于 Agent'],
    ['进入群聊就是价值', '需验证人工转接、交接遗漏、交付和维护成本是否改善'],
  ]),
  '## 产品定位与公开能力', reference('README.md', 'README') + ' 与 ' + reference('src/web/src/lib/brand-copy.ts', '品牌文案') + ' 将其定义为人与本地 Agent 的共同房间，把已有 Agent 分享给可信成员。',
  ...d.capabilities.map(c => `### ${c.name}\n\n${c.what}\n\n作用：${c.meaning}\n\n边界：${c.boundary}\n\n依据：${reference(c.file)}`),
  '## 模块与职责', rows(['模块', '目录', '职责', '关系'], d.modules.map(m => [m.name, code(m.path), m.responsibility, m.relation])),
  '## 消息到执行的路径', ...d.steps.map((s, i) => `### ${i + 1}. ${s.title}\n\n角色：${s.actor}\n\n${s.text}\n\n${s.result}\n\n依据：${reference(s.file)}`),
  '### 控制面、数据面与一致性', '控制面通过 WebSocket 发送无正文 UnreadNotice、唤醒和停止。数据面提供收件箱、历史、消息与附件 API。Daemon 决定启动或通知会话；驱动管理准入、排队和事件。',
  '唤醒协调器记录希望、已准入、模型已见序号，合并重复通知。收件箱 freshness guard 检查模型漏看的新消息，并暂存部分外发动作。它们是消息/会话机制，实际送达与冲突效果没有独立实测。',
  reference('src/shared/src/community/wake-dispatch.ts') + ' · ' + reference('src/daemon/src/manager/wakeCoordinator.ts') + ' · ' + reference('src/daemon/src/inbox/stateMachine.ts'),
  '## 原生运行时', rows(['运行时', '接入协议', '会话处理'], d.runtimes.map(r => [r.name, r.protocol, r.delivery])),
  'AgentSession 提供 start/send/interrupt/stop、快照、事件和终止结果。内部逻辑处理输入准入、FIFO、安全边界和结束顺序，各后端实际能力仍有差异。',
  'README 公开列出五种运行时。' + reference('src/daemon/agent-driver/src/registry.ts', '驱动注册表') + ' 另外注册 Grok 与 Antigravity。本次只观察源码，不宣布所有 UI、认证和运行路径均已验收。',
  '## 记忆、任务线索与主动跟进', rows(['载体', '用途', '约定'], d.memories.map(m => [code(m.name), m.role, m.rule])),
  '上述来自 systemPrompt.ts 的工作约定；不能等同实际每次 Agent 都正确执行。维护提示词要求读取原始记录、去重、核查、保留经验原因和来源并删除过时内容。',
  reference('src/daemon/src/drivers/systemPrompt.ts') + ' · ' + reference('src/daemon/src/manager/memoryMaintenancePrompt.ts'),
  '--remind-after 控制发送后无新消息的提醒，范围 1m–24h 或 0。观察到新消息时取消。计时器使用内存 Map/setTimeout，随 Daemon 生命周期，重启不保留；失败提醒不重试。不能据此推断可靠的长期定时业务调度，持久唤醒队列与该提醒也不同。',
  reference('src/daemon/src/daemon/messageReminderScheduler.ts'),
  '## 部署与运行前提', '可用托管房间连接本机 Daemon，或 npx @alook/app onboard 自托管。app 包装检查、安装、密钥、迁移、注册、配对和服务启动；提供 start/stop/update。',
  rows(['本地服务', '默认端口', '职责'], [['Web', '15210', '界面、API、账号'], ['Email', '15211', '外围邮件服务；本地不可收发'], ['WebSocket / DO', '15212', '实时连接'], ['Wake', '15213', '派发唤醒']]),
  '本地服务共享 SQLite/D1 状态，保存在 ~/.alook/self-hosted/。Agent、模型认证、工具、网络与执行机器仍需准备。本地模式禁用 GitHub/Google OAuth，使用邮箱密码。应用和 Agent 本地运行不代表推理完全离线。',
  reference('src/app/README.md') + ' · ' + reference('src/web/wrangler.toml'),
  '## 价值与相邻方案：分析判断', ...d.values.map(v => `### ${v.title}\n\n${v.text}\n\n评估：${v.check}`),
  rows(['相邻方案', '定位', '关系'], d.comparisons.map(c => [`[${c.name}](${c.url.startsWith('../') ? '../016-agenvo/README.md' : c.url})`, c.focus, c.overlap])),
  '自建房间增加沟通入口，需要证明收益足以抵消迁移习惯和维护成本。没有依据将命名身份或群聊接入称为独有技术壁垒，也没有断言成熟的全自动业务系统已形成。',
  '## 使用场景：推断与示例', ...d.scenarios.map(s => `### ${s.name}\n\n输入：${s.input}\n\n执行：${s.execution}\n\n条件：${s.fit}`),
  '## 可扩展方向：建议', ...d.extensions.map(x => `### ${x.title}\n\n状态：${x.status}\n\n现有基础：${x.from}\n\n需要补充：${x.add}\n\n价值：${x.value}`),
  '## 对本总库的意义：分析', ...d.personal.map(p => `### ${p.title}\n\n${p.text}`),
  '候选最小实验仍未实施：输入仓库与研究重点 → 读取固定快照 → 生成带证据的结论 → 人核查 → 更新 projects.json、文档与网页。先验证单 Agent 共享，再评估多角色编排。',
  '## 使用边界', ...d.boundaries.map(b => `### ${b.title}\n\n${b.text}\n\n依据：${reference(b.file)}`),
  'Claude 权限另见 ' + reference('src/daemon/agent-driver/src/adapters/claude/launch.ts') + '；运行凭据另见 ' + reference('src/daemon/src/credentials/credentialProxy.ts') + '。描述配置事实，不替代完整执行安全审计。',
  '## 原图来源与版本差异', picture,
  '原 PNG 的 SHA-256 和字节数保存在 assets/guide-provenance.json。构建检查原文件与发布副本一致。比较旧图快照到正文快照：相关 README 改邀请链接；提示词改附件上传入口并要求复用可读附件 ID，新增产品操作回答指引。本次检查的记忆、跟进计时器、Daemon 文档和 Claude/Codex 核心配置保持一致。',
  '## 逐项证据', ...d.evidence.map(e => `- **${e.title}：** ${reference(e.file)}。${e.detail}`),
  '## 网页实现与验证', '源数据为 web/src/content.mjs；build 用 Node 标准库生成 HTML，复制 CSS/JS、原图和文档到忽略的 web/dist。来源链接统一固定源码版本。交互只包括图片、章节和步骤阅读，不调用模型。',
  commands,
  '静态检查覆盖 JavaScript 语法、资源、重复 ID/锚点、源码版本、原图 SHA-256；浏览器检查桌面/手机/320px、资源加载、图片弹窗与焦点、六步选择、下载、控制台与网络；最后检查实际 Pages 部署和线上资源。实际记录保存在 assets/web-verification.json。',
  '**未验证：** Alook 安装、账号/配对、真实 Agent 执行、模型记忆质量、多成员权限与长期消息恢复。网页发布不能作为上述能力的运行证据。',
  '## 提交范围', '主工作区保留其他项目未提交内容。本任务在独立工作区提交 017、根元数据/生成索引和两份工作流的必要步骤，远端已有 016 保持发布；001–015 的本地资料不纳入本次提交。',
].join('\n\n') + '\n';
await writeFile(path.join(project, 'README.md'), readme);
await writeFile(path.join(project, 'research.md'), research);
