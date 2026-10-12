export const sourceRef = 'f4265de142d2af5934f536b316c8fe11b6c99f60';
export const guideRef = 'fec1f68ec6396a91cabc21bf9f77994d01f0deb5';
export const researchDate = '2026-10-12';
export const repository = 'https://github.com/alookai/alook';
export const source = (file) => `${repository}/blob/${sourceRef}/${file}`;

export const summary = '群聊中的共享 AI 入口，让有访问权限的成员共同调用一个或多个本地 Agent。全面梳理身份与消息、Web/Daemon/驱动/队列/存储模块、消息唤醒与实际执行链路、文件记忆和跟进、自托管、多人协作价值、业务适配与多 Agent 边界、可扩展方向和研究总库复用意义；保留原始中文引导图，补充当前 0.1.48 源码核查。研究网页已完成，真实 Agent 未独立实跑。';

export const summarySections = [
  { label: '定位', text: '群聊中共享的 AI 工作入口，面向已有本地 Agent 的开发者与可信小团队；多人调用一个 Agent 也成立，多 Agent 为可选。' },
  { label: '能力', text: '频道、私聊和讨论串、持久身份与成员关系、收件箱、消息和附件、本地执行连接、会话延续及未完成工作标记。实际任务能力来自接入的 Agent、模型与工具。' },
  { label: '模块', text: 'Web/API 与桌面入口、app 自托管 CLI、Daemon、agent-driver、WebSocket Durable Objects、唤醒队列、shared 数据与权限逻辑，以及 D1/SQLite 和文件存储。' },
  { label: '原理', text: '人发消息后，服务端存储并重查访问和通知策略，经队列与 WebSocket 发出无正文唤醒通知；Daemon 启动或通知已有会话，Agent 拉取收件箱、执行工具并把结果送回群聊。' },
  { label: '记忆与跟进', text: 'memory.md、experiences/、事件时间线和消息工作标记恢复上下文；无新消息跟进提醒为 Daemon 内存计时器，重启不保留，不能据此推断可靠长期定时调度。' },
  { label: '部署', text: '可使用托管房间连接本机 Daemon，或用 @alook/app 自托管四类本地服务；Agent、模型认证及执行机器另行准备。本站只部署研究网页。' },
  { label: '价值与场景', text: '减少人工代输、结果转发与上下文交接，统一多运行时接入；适合共享开发和研究助手、多人反馈与在线工作机远程执行。群聊接入本身差异化有限，价值需以交付验证。' },
  { label: '边界与扩展', text: '自动分工、业务验收和治理仍需设计；本地执行不等于全部数据本地，Claude/Codex 适配器默认跳过审批。扩展可围绕业务工具、任务编排、隔离审计、持久调度、现有聊天入口及结果验收。' },
  { label: '个人意义与依据', text: '优先研究驱动、消息调度和上下文恢复，可试做 GitHub 项目研究助手；保留 2026-10-09 原图，正文依据 f4265de 固定快照，区分源码事实、分析判断、示例和待验证建议。' },
];

export const capabilities = [
  { name: '共享房间与身份', what: '人和 Agent 加入服务器、频道、私聊及讨论串；Agent 持有 handle、收件箱和成员关系。', meaning: '把个人助手变成团队能够找到的工作对象。', boundary: '可访问成员受房间、成员和权限约束；“所有人”指获准参与者。', file: 'README.md' },
  { name: '消息与附件', what: 'Agent 拉取未读消息、阅读历史、发送结果、上传和复用附件，并标记需要继续处理的工作。', meaning: '讨论、补充条件、工作结果和证据留在同一空间。', boundary: '工作标记记录待办线索；不能直接等同业务任务编排或验收。', file: 'src/daemon/src/drivers/systemPrompt.ts' },
  { name: '本地执行连接', what: '本机 Daemon 与服务端建立控制连接，接收唤醒及停止指令，管理 Agent 生命周期。', meaning: '成员从网页或手机提出需求，执行落在绑定的工作机器。', boundary: '机器、Daemon、Agent 与所需网络必须可用；离线时不会立即执行。', file: 'src/daemon/src/daemon/createDaemon.ts' },
  { name: '多运行时适配', what: '把不同 Agent 的启动、输入、事件、恢复、中断和停止包装成 AgentSession 接口。', meaning: '平台能够复用不同运行时，减少逐个接入的维护工作。', boundary: '接入不同运行时与多个 Agent 自动分工是两类能力。', file: 'src/daemon/agent-driver/src/registry.ts' },
  { name: '消息排队与恢复', what: '管理忙碌会话的消息准入、队列、安全边界投递、唤醒合并与连接恢复。', meaning: '补充指令能够进入持续工作的会话，而不是每条消息都重新启动。', boundary: '传输成功、输入被接收或一轮结束，都不代表业务目标达成。', file: 'src/daemon/README.md' },
  { name: '记忆与主动跟进', what: '提示 Agent 读取和维护记忆文件、经验、时间线，并通过未完成标记延续工作。', meaning: '减少新会话从零了解项目的交接。', boundary: '准确性依赖记录与重新核查；本地跟进计时器不持久化。', file: 'src/daemon/src/daemon/messageReminderScheduler.ts' },
];

export const modules = [
  { name: 'Web / API', path: 'src/web/', responsibility: '房间与聊天界面、账号、成员访问、消息接口、机器和 Agent 配置。', relation: '接收人的输入，保存协作状态并组织后续唤醒。', file: 'README.md' },
  { name: '桌面外壳', path: 'src/desktop/', responsibility: '原生应用外壳，提供桌面使用入口。', relation: '入口层；核心任务能力由接入的运行时提供。', file: 'README.md' },
  { name: '本地 app CLI', path: 'src/app/', responsibility: '检查环境、安装服务、生成本地密钥、迁移数据库、注册并配对机器。', relation: '把自托管启动与维护流程打包为 onboard / start / stop / update。', file: 'src/app/README.md' },
  { name: 'Daemon', path: 'src/daemon/src/', responsibility: '主机连接、唤醒合并、进程与会话调度、状态与凭据代理、诊断。', relation: '决定启动、通知已有会话或合并通知；不是业务验收者。', file: 'src/daemon/README.md' },
  { name: 'agent-driver', path: 'src/daemon/agent-driver/', responsibility: '统一 AgentSession 契约；不同后端协议适配，输入准入、事件和生命周期。', relation: '把 Claude、Codex 等原生差异封装在驱动内部。', file: 'src/daemon/agent-driver/README.md' },
  { name: 'WebSocket / DO', path: 'src/ws-do/', responsibility: '实时浏览器与机器连接、事件分发以及唤醒通知转发。', relation: '控制面连接主机，聊天与事件连接参与者。', file: 'src/ws-do/src/ws-durable.ts' },
  { name: '队列 Worker', path: 'src/queue-worker/', responsibility: '消费 bot-wake 和移动推送任务；依据当前状态重新构造唤醒。', relation: '队列项是提示，消费时仍需检查绑定、可读权限和未读状态。', file: 'src/queue-worker/src/task-handler.ts' },
  { name: 'shared + 存储', path: 'src/shared/ · D1 / R2', responsibility: '类型、校验、数据库、查询、成员与通知规则；SQLite/D1 和文件存储。', relation: '保存身份、房间、消息和附件等；Agent 工作目录保存在执行侧。', file: 'src/web/wrangler.toml' },
  { name: '邮件 Worker', path: 'src/email-worker/', responsibility: '仓库包含邮件处理服务，是外围能力。', relation: '本地自托管说明明确限制邮件收发；不把它作为已实测的群聊能力。', file: 'src/app/README.md' },
];

export const steps = [
  { title: '成员提出需求', actor: '网页 / 手机 → Web API', text: '有访问权限的成员在频道、私聊或讨论串发消息。示例：“研究这个 GitHub 项目的能力和原理。”', result: '输入：自然语言、项目链接和可选附件。', file: 'README.md' },
  { title: '存储并检查策略', actor: 'Web / shared / 数据库', text: '消息被保存。唤醒时检查目标 Agent 的当前机器绑定、成员读取权限、未读状态，以及静音或仅提及等通知策略。', result: '确认这条消息现在仍需要通知该 Agent。', file: 'src/shared/src/community/wake-dispatch.ts' },
  { title: '传递唤醒通知', actor: '队列 → WebSocket → Daemon', text: '发送 agent:wake。控制通知包含频道和最新序号等摘要，不携带消息正文；队列重试或重连恢复使用稳定唤醒身份。', result: '通知主机“有新消息”，尚未证明模型已读。', file: 'src/shared/src/community/wake-dispatch.ts' },
  { title: '接入现有会话', actor: 'Daemon → AgentSession', text: 'Daemon 决定启动会话、通知正在运行的 Agent 或合并通知。驱动处理排队和安全边界投递，避免各后端差异泄漏到上层。', result: '输入被接收、排队或拒绝，并返回对应事件。', file: 'src/daemon/README.md' },
  { title: '拉取内容并执行', actor: 'Agent → 收件箱 / 模型 / 工具', text: 'Agent 读取收件箱和所需历史，用记忆文件恢复上下文，再调用自身可用的代码、文件、命令或业务工具。具体业务流程由指令和工具实现。', result: '输出：回答、文件、分析结果或实际代码修改。', file: 'src/daemon/src/drivers/systemPrompt.ts' },
  { title: '回传并人工验收', actor: 'Agent → 消息 API → 共同房间', text: 'Agent 把短结果和附件送回频道。成员继续提问、补充约束或验收；需要工作标记时，按提示词约定跟踪到完成。', result: '业务完成需要结果证据与验收标准。', file: 'src/daemon/src/drivers/systemPrompt.ts' },
];

export const runtimes = [
  { name: 'Claude Code', protocol: '持久子进程 · stream-json / NDJSON', delivery: '忙碌输入进入安全边界队列；支持会话恢复。', file: 'src/daemon/agent-driver/src/adapters/claude/launch.ts' },
  { name: 'Codex', protocol: 'app-server · stdio JSON-RPC', delivery: '使用 thread/start 或 thread/resume；统一输入与事件。', file: 'src/daemon/agent-driver/src/adapters/codex/index.ts' },
  { name: 'Cursor', protocol: 'cursor-agent acp · ACP JSON-RPC', delivery: '持久会话与 steering；中断使用会话取消。', file: 'src/daemon/README.md' },
  { name: 'OpenCode', protocol: '本机认证服务 · HTTP + SSE', delivery: '持久服务和原生会话；驱动处理事件连接与输入。', file: 'src/daemon/README.md' },
  { name: 'Pi', protocol: '进程内 SDK', delivery: '委托 prompt / steer / abort / dispose，统一会话结果。', file: 'src/daemon/README.md' },
];

export const memories = [
  { name: 'memory.md', role: '长期事实、偏好和职责边界', rule: '每次唤醒先读；保持简短，指向更完整的经验和依据。' },
  { name: 'experiences/', role: '可复用经验与操作流程', rule: '保存适用范围、原因和来源；过时经验应修正或删除。' },
  { name: '.context_timeline/', role: '按日记录的 JSONL 事件时间线', rule: '用于定位最近参与的讨论与执行历史，帮助重建过程。' },
  { name: '消息工作标记', role: '服务端的未完成工作线索', rule: '提示词要求先标记，再开始或排队；交付或取消后移除。' },
];

export const values = [
  { title: '减少人工代操作', text: '同事直接向 Agent 交任务，减少主人反复代输需求、转发截图或复制结果。', check: '比较人工转接次数、等待时间和需求澄清轮次。' },
  { title: '降低上下文交接', text: '需求、补充条件、决定和结果处在共同频道，新的参与者能够追溯讨论。', check: '观察遗漏条件、重复解释和返工是否减少。' },
  { title: '统一接入与维护', text: '不同运行时连接、会话和凭据由共同底座处理，方便复用与二次开发。', check: '衡量接入维护成本、断线恢复和消息投递可靠性。' },
];

export const comparisons = [
  { name: 'OpenClaw', focus: '把现有聊天软件连接到 Agent，覆盖会话、记忆和多 Agent 路由。', overlap: '接入、远程使用和持续 Agent 的能力有明显重叠；Alook 自建共同房间。', url: 'https://docs.openclaw.ai/' },
  { name: 'Claude Code in Slack', focus: '从已有团队频道发起编码任务，借用原有聊天习惯。', overlap: '表明“群里 @Agent 交任务”已有现成方案；运行与身份方案以其文档为准。', url: 'https://code.claude.com/docs/en/slack' },
  { name: 'LangGraph', focus: '提供开发者可编程的状态、流程与持久执行基础设施。', overlap: '属于编排层的相邻项目，可用于构建业务流程；不是同一种房间产品。', url: 'https://docs.langchain.com/oss/python/langgraph/overview' },
  { name: '本总库的 Agenvo', focus: '通过 MCP 中继把不同原生 Agent 接到上层助手。', overlap: 'Agenvo 侧重助手到 Agent 的远程连接；Alook 侧重人与 Agent 的共同房间。', url: '../016-agenvo/' },
];

export const scenarios = [
  { name: '共享项目研究助手', input: '研究者给 GitHub 链接；其他成员补充关注点。', execution: '读取仓库、记录版本、分析能力与原理，输出带来源的结论。', fit: '对本研究总库最直接的候选场景。业务研究模板和证据规则需自行配置。' },
  { name: '开发与测试共同反馈', input: '产品提出需求、开发补充约束、测试给复现材料。', execution: 'Agent 分析代码或提出修改，参与者在同一讨论中验收。', fit: '适合可信小团队；任务归属、分支策略和验收条件需要明确。' },
  { name: '在线工作机远程执行', input: '离开电脑后，用手机提出需求或查看结果。', execution: '工作机器上的 Agent 使用其已有运行环境执行。', fit: '适合机器常在线的工作方式；模型与工具网络不可用时需等待。' },
  { name: '不同角色共同讨论', input: '研究、开发、审查等多个 Agent 与人参与房间。', execution: '通过消息共享观点或转交结果，具体分工由人或额外流程决定。', fit: '多 Agent 接入可行；自动规划、资源冲突和结果合并仍需业务设计。' },
];

export const extensions = [
  { title: '业务知识与工具', status: '建议 · 首先验证', from: '接入的 Agent 已具备模型与工具基础。', add: '增加研究模板、项目知识、CRM / 工单 / 内部系统 API、结构化证据输出。', value: '把通用入口变成可重复完成真实业务的工作入口。' },
  { title: '任务与多 Agent 编排', status: '建议 · 需额外设计', from: '共享消息、会话管理和工作标记。', add: '任务 ID、负责人、优先级、依赖、转交、重复任务抑制、结果合并。', value: '解决多人同时交任务与不同角色协作的秩序问题。' },
  { title: '权限与执行治理', status: '建议 · 团队使用重点', from: '成员访问检查、运行凭据和本机代理。', add: '项目级权限、工作目录隔离、审批、操作审计、最小工具范围和资源配额。', value: '让团队能够按明确边界共享实际执行能力。' },
  { title: '持久调度与恢复', status: '建议 · 区分消息队列', from: '现有唤醒队列、恢复逻辑和内存跟进计时器。', add: '可持久任务状态、定时触发、幂等写入、检查点、失败补偿及结果去重。', value: '支撑跨重启、长期和有交付责任的业务任务。' },
  { title: '已有聊天与服务入口', status: '建议 · 降低迁移成本', from: '当前自建房间和 Agent 消息接口。', add: '按需求接 Slack / 飞书 / Discord、工单或网页入口，映射身份与权限。', value: '减少团队为了调用 Agent 而迁移聊天习惯的成本。' },
  { title: '验收与可观察性', status: '建议 · 交付标准', from: '运行状态、事件和诊断。', add: '任务证据、结果清单、人工批准、可回溯修改、成本与失败原因面板。', value: '分别判断连接、执行轮次和业务交付，避免把“回复了”当作成功。' },
];

export const boundaries = [
  { title: '访问范围', text: '群聊中可调用的是获准成员。“所有人都可以”不表示公开访问或任何成员拥有全部机器权限；通知策略也会影响是否唤醒。', file: 'src/shared/src/community/wake-dispatch.ts' },
  { title: '模型与业务', text: '模型、认证、工具和任务执行来自已有 Agent。Alook 的侧重点是身份、消息、连接与会话；业务知识、流程和验收仍要配置。', file: 'README.md' },
  { title: '多 Agent 协作', text: '多人共享一个 Agent 已构成核心体验。多运行时与多 Agent 接入不能直接推断全自动任务分解、优先级协调和可靠结果合并。', file: 'src/daemon/README.md' },
  { title: '本地与在线', text: '本地执行指 Agent 在绑定机器工作。托管方案的房间、消息和上传内容经过服务端；自托管可把应用服务与数据放到自有环境。', file: 'src/app/README.md' },
  { title: '执行审批', text: '当前 Claude 适配器设置 bypassPermissions / skip-permissions；Codex 设置 approvalPolicy: never 和 danger-full-access。凭据隔离不能当作文件系统沙箱。', file: 'src/daemon/agent-driver/src/adapters/codex/index.ts' },
  { title: '记忆与提醒', text: '记忆依靠 Agent 读写和核查文件。无新消息跟进用内存 Map / setTimeout，进程重启不保留，失败提醒不重试。', file: 'src/daemon/src/daemon/messageReminderScheduler.ts' },
  { title: '完成判定', text: '消息送出、输入被接收、Agent 空闲或一轮结束是技术状态。研究准确、代码正确或业务办理成功，需要独立的结果证据和验收。', file: 'src/daemon/README.md' },
];

export const personal = [
  { title: '研究价值', text: '学习现成 Agent 运行时适配、长连接、消息准入与排队、凭据代理、事件时间线和会话恢复。可把这些作为 Agent 基础设施的阅读案例。' },
  { title: '复用价值', text: '需要将多个本地 Agent 变成团队可访问资源时，评估复用 app / daemon / driver 的工程设计。引入代码时保留 Apache-2.0 LICENSE 与版权声明。' },
  { title: '最小业务试验', text: '先试一个 GitHub 项目研究助手：输入仓库和关注点，输出版本、能力、模块、原理、边界与来源；由人核查，再更新本总库。该试验尚未实现。' },
  { title: '采用标准', text: '按人工交接次数、研究遗漏、任务完成率、维护成本和权限可控性判断。单人只需问答时，新增收益可能有限；多人反复共享 Agent 时更有评估意义。' },
];

export const evidence = [
  { title: '产品定位与公开运行时', file: 'README.md', detail: '共同房间、共享已有本地 Agent、持久身份；README 列出五种运行时。' },
  { title: '产品品牌定义', file: 'src/web/src/lib/brand-copy.ts', detail: '品牌方向是把 Agent 分享给可信的人。' },
  { title: '会话与调度架构', file: 'src/daemon/README.md', detail: 'AgentSession、后端协议、主机调度、控制/数据面和凭据代理。文档中历史凭据描述以当前代码为准。' },
  { title: '唤醒策略与身份', file: 'src/shared/src/community/wake-dispatch.ts', detail: '消费时重查权限、未读、静音、当前绑定；无正文 UnreadNotice 和稳定 launchId。' },
  { title: '重复通知与已见序号', file: 'src/daemon/src/manager/wakeCoordinator.ts', detail: '合并通知、已准入和模型已见水位，不是独立业务任务调度器。' },
  { title: '收件箱与新消息保护', file: 'src/daemon/src/inbox/stateMachine.ts', detail: '对模型未见新消息时的外发动作进行 freshness 检查与暂存。' },
  { title: '持久记忆与工作标记', file: 'src/daemon/src/drivers/systemPrompt.ts', detail: '记忆文件、经验、时间线和消息工作标记；这是提示词规定的工作方式，效果尚未实测。' },
  { title: '记忆维护', file: 'src/daemon/src/manager/memoryMaintenancePrompt.ts', detail: '重置空闲会话前，提示核查、去重和更新长期记忆。' },
  { title: '跟进提醒限制', file: 'src/daemon/src/daemon/messageReminderScheduler.ts', detail: 'Daemon 生命周期内的内存计时器；有新消息取消；失败不重试。' },
  { title: '驱动注册范围', file: 'src/daemon/agent-driver/src/registry.ts', detail: '除 README 五种外，代码还注册 Grok / Antigravity；不能因此宣布所有产品路径均已验证。' },
  { title: 'Claude 权限与协议', file: 'src/daemon/agent-driver/src/adapters/claude/launch.ts', detail: 'stream-json 和跳过权限确认配置；原生定时工具默认禁用。' },
  { title: 'Codex 权限与协议', file: 'src/daemon/agent-driver/src/adapters/codex/index.ts', detail: 'app-server stdio、thread/start/resume、never 与 danger-full-access。' },
  { title: '运行凭据代理', file: 'src/daemon/src/credentials/credentialProxy.ts', detail: '本机 voucher 校验、能力范围与运行凭据转发；不是操作系统执行沙箱。' },
  { title: '部署与本地限制', file: 'src/app/README.md', detail: '四类服务、端口、Node 要求、配对及本地邮件/OAuth 限制。' },
  { title: '应用版本与许可证', file: 'src/app/package.json', detail: '当前固定快照中的 @alook/app version 为 0.1.48，Node >=20.9，Apache-2.0。' },
  { title: '数据与文件服务', file: 'src/web/wrangler.toml', detail: 'Workers 服务绑定、D1、R2、队列和 Durable Objects。' },
  { title: '上游许可证', file: 'LICENSE', detail: 'Apache License 2.0；本站未引入上游执行代码。' },
];
