# 017 · Alook 研究记录

## 研究范围

将对话中的能力、原理与价值判断完整整理成网页。保留原始引导图，区分源码事实、文档约定、分析判断、业务示例与待验证扩展。

## 基线与环境

| 项目 | 信息 |
| --- | --- |
| 原仓库 | https://github.com/alookai/alook |
| 正文固定快照 | [f4265de142d2af5934f536b316c8fe11b6c99f60](https://github.com/alookai/alook/commit/f4265de142d2af5934f536b316c8fe11b6c99f60) · 2026-10-12 |
| 当前源码应用版本 | @alook/app 0.1.48 |
| 原图基线 | v0.1.46 / fec1f68ec6396a91cabc21bf9f77994d01f0deb5 · 2026-10-09 |
| 上游许可证 | [Apache-2.0](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/LICENSE) |
| 本地环境 | Windows / PowerShell；Node.js 22.15.0；网页零 npm 依赖 |
| 上游要求 | app Node.js ≥20.9；Agent 运行时、模型认证、工具与网络另行准备；源码开发使用 pnpm/Bun |
| 验证界限 | 源码研究与原创静态页；没有独立启动 Alook、调用模型或执行真实 Agent |

## 理解校准

Alook 是群聊中共享的 AI 工作入口：获准成员给同一个对象提需求，Agent 使用模型和工具处理，再回到共同房间交付。多人共享一个 Agent 就已经构成核心体验；多 Agent 是可选能力，自动任务分解、优先级协调、结果合并和业务验收还需要业务适配与额外编排。

| 简化理解 | 准确边界 |
| --- | --- |
| 定制身份进入群聊 | 名称、角色、收件箱、成员与记忆；不涉及重新训练模型 |
| 本质是多 Agent | 多人共享一个 Agent 也成立；接入多个运行时与自动分工是不同层次 |
| 所有人都能调度 | 获准成员；访问和通知策略影响消息读取与唤醒 |
| 类似群聊客服 | 入口相近；任务可延伸到文件、代码和工具执行，取决于 Agent |
| 进入群聊就是价值 | 需验证人工转接、交接遗漏、交付和维护成本是否改善 |

## 产品定位与公开能力

[README](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/README.md) 与 [品牌文案](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/web/src/lib/brand-copy.ts) 将其定义为人与本地 Agent 的共同房间，把已有 Agent 分享给可信成员。

### 共享房间与身份

人和 Agent 加入服务器、频道、私聊及讨论串；Agent 持有 handle、收件箱和成员关系。

作用：把个人助手变成团队能够找到的工作对象。

边界：可访问成员受房间、成员和权限约束；“所有人”指获准参与者。

依据：[README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/README.md)

### 消息与附件

Agent 拉取未读消息、阅读历史、发送结果、上传和复用附件，并标记需要继续处理的工作。

作用：讨论、补充条件、工作结果和证据留在同一空间。

边界：工作标记记录待办线索；不能直接等同业务任务编排或验收。

依据：[src/daemon/src/drivers/systemPrompt.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/drivers/systemPrompt.ts)

### 本地执行连接

本机 Daemon 与服务端建立控制连接，接收唤醒及停止指令，管理 Agent 生命周期。

作用：成员从网页或手机提出需求，执行落在绑定的工作机器。

边界：机器、Daemon、Agent 与所需网络必须可用；离线时不会立即执行。

依据：[src/daemon/src/daemon/createDaemon.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/daemon/createDaemon.ts)

### 多运行时适配

把不同 Agent 的启动、输入、事件、恢复、中断和停止包装成 AgentSession 接口。

作用：平台能够复用不同运行时，减少逐个接入的维护工作。

边界：接入不同运行时与多个 Agent 自动分工是两类能力。

依据：[src/daemon/agent-driver/src/registry.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/agent-driver/src/registry.ts)

### 消息排队与恢复

管理忙碌会话的消息准入、队列、安全边界投递、唤醒合并与连接恢复。

作用：补充指令能够进入持续工作的会话，而不是每条消息都重新启动。

边界：传输成功、输入被接收或一轮结束，都不代表业务目标达成。

依据：[src/daemon/README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/README.md)

### 记忆与主动跟进

提示 Agent 读取和维护记忆文件、经验、时间线，并通过未完成标记延续工作。

作用：减少新会话从零了解项目的交接。

边界：准确性依赖记录与重新核查；本地跟进计时器不持久化。

依据：[src/daemon/src/daemon/messageReminderScheduler.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/daemon/messageReminderScheduler.ts)

## 模块与职责

| 模块 | 目录 | 职责 | 关系 |
| --- | --- | --- | --- |
| Web / API | `src/web/` | 房间与聊天界面、账号、成员访问、消息接口、机器和 Agent 配置。 | 接收人的输入，保存协作状态并组织后续唤醒。 |
| 桌面外壳 | `src/desktop/` | 原生应用外壳，提供桌面使用入口。 | 入口层；核心任务能力由接入的运行时提供。 |
| 本地 app CLI | `src/app/` | 检查环境、安装服务、生成本地密钥、迁移数据库、注册并配对机器。 | 把自托管启动与维护流程打包为 onboard / start / stop / update。 |
| Daemon | `src/daemon/src/` | 主机连接、唤醒合并、进程与会话调度、状态与凭据代理、诊断。 | 决定启动、通知已有会话或合并通知；不是业务验收者。 |
| agent-driver | `src/daemon/agent-driver/` | 统一 AgentSession 契约；不同后端协议适配，输入准入、事件和生命周期。 | 把 Claude、Codex 等原生差异封装在驱动内部。 |
| WebSocket / DO | `src/ws-do/` | 实时浏览器与机器连接、事件分发以及唤醒通知转发。 | 控制面连接主机，聊天与事件连接参与者。 |
| 队列 Worker | `src/queue-worker/` | 消费 bot-wake 和移动推送任务；依据当前状态重新构造唤醒。 | 队列项是提示，消费时仍需检查绑定、可读权限和未读状态。 |
| shared + 存储 | `src/shared/ · D1 / R2` | 类型、校验、数据库、查询、成员与通知规则；SQLite/D1 和文件存储。 | 保存身份、房间、消息和附件等；Agent 工作目录保存在执行侧。 |
| 邮件 Worker | `src/email-worker/` | 仓库包含邮件处理服务，是外围能力。 | 本地自托管说明明确限制邮件收发；不把它作为已实测的群聊能力。 |

## 消息到执行的路径

### 1. 成员提出需求

角色：网页 / 手机 → Web API

有访问权限的成员在频道、私聊或讨论串发消息。示例：“研究这个 GitHub 项目的能力和原理。”

输入：自然语言、项目链接和可选附件。

依据：[README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/README.md)

### 2. 存储并检查策略

角色：Web / shared / 数据库

消息被保存。唤醒时检查目标 Agent 的当前机器绑定、成员读取权限、未读状态，以及静音或仅提及等通知策略。

确认这条消息现在仍需要通知该 Agent。

依据：[src/shared/src/community/wake-dispatch.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/shared/src/community/wake-dispatch.ts)

### 3. 传递唤醒通知

角色：队列 → WebSocket → Daemon

发送 agent:wake。控制通知包含频道和最新序号等摘要，不携带消息正文；队列重试或重连恢复使用稳定唤醒身份。

通知主机“有新消息”，尚未证明模型已读。

依据：[src/shared/src/community/wake-dispatch.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/shared/src/community/wake-dispatch.ts)

### 4. 接入现有会话

角色：Daemon → AgentSession

Daemon 决定启动会话、通知正在运行的 Agent 或合并通知。驱动处理排队和安全边界投递，避免各后端差异泄漏到上层。

输入被接收、排队或拒绝，并返回对应事件。

依据：[src/daemon/README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/README.md)

### 5. 拉取内容并执行

角色：Agent → 收件箱 / 模型 / 工具

Agent 读取收件箱和所需历史，用记忆文件恢复上下文，再调用自身可用的代码、文件、命令或业务工具。具体业务流程由指令和工具实现。

输出：回答、文件、分析结果或实际代码修改。

依据：[src/daemon/src/drivers/systemPrompt.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/drivers/systemPrompt.ts)

### 6. 回传并人工验收

角色：Agent → 消息 API → 共同房间

Agent 把短结果和附件送回频道。成员继续提问、补充约束或验收；需要工作标记时，按提示词约定跟踪到完成。

业务完成需要结果证据与验收标准。

依据：[src/daemon/src/drivers/systemPrompt.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/drivers/systemPrompt.ts)

### 控制面、数据面与一致性

控制面通过 WebSocket 发送无正文 UnreadNotice、唤醒和停止。数据面提供收件箱、历史、消息与附件 API。Daemon 决定启动或通知会话；驱动管理准入、排队和事件。

唤醒协调器记录希望、已准入、模型已见序号，合并重复通知。收件箱 freshness guard 检查模型漏看的新消息，并暂存部分外发动作。它们是消息/会话机制，实际送达与冲突效果没有独立实测。

[src/shared/src/community/wake-dispatch.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/shared/src/community/wake-dispatch.ts) · [src/daemon/src/manager/wakeCoordinator.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/manager/wakeCoordinator.ts) · [src/daemon/src/inbox/stateMachine.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/inbox/stateMachine.ts)

## 原生运行时

| 运行时 | 接入协议 | 会话处理 |
| --- | --- | --- |
| Claude Code | 持久子进程 · stream-json / NDJSON | 忙碌输入进入安全边界队列；支持会话恢复。 |
| Codex | app-server · stdio JSON-RPC | 使用 thread/start 或 thread/resume；统一输入与事件。 |
| Cursor | cursor-agent acp · ACP JSON-RPC | 持久会话与 steering；中断使用会话取消。 |
| OpenCode | 本机认证服务 · HTTP + SSE | 持久服务和原生会话；驱动处理事件连接与输入。 |
| Pi | 进程内 SDK | 委托 prompt / steer / abort / dispose，统一会话结果。 |

AgentSession 提供 start/send/interrupt/stop、快照、事件和终止结果。内部逻辑处理输入准入、FIFO、安全边界和结束顺序，各后端实际能力仍有差异。

README 公开列出五种运行时。[驱动注册表](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/agent-driver/src/registry.ts) 另外注册 Grok 与 Antigravity。本次只观察源码，不宣布所有 UI、认证和运行路径均已验收。

## 记忆、任务线索与主动跟进

| 载体 | 用途 | 约定 |
| --- | --- | --- |
| `memory.md` | 长期事实、偏好和职责边界 | 每次唤醒先读；保持简短，指向更完整的经验和依据。 |
| `experiences/` | 可复用经验与操作流程 | 保存适用范围、原因和来源；过时经验应修正或删除。 |
| `.context_timeline/` | 按日记录的 JSONL 事件时间线 | 用于定位最近参与的讨论与执行历史，帮助重建过程。 |
| `消息工作标记` | 服务端的未完成工作线索 | 提示词要求先标记，再开始或排队；交付或取消后移除。 |

上述来自 systemPrompt.ts 的工作约定；不能等同实际每次 Agent 都正确执行。维护提示词要求读取原始记录、去重、核查、保留经验原因和来源并删除过时内容。

[src/daemon/src/drivers/systemPrompt.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/drivers/systemPrompt.ts) · [src/daemon/src/manager/memoryMaintenancePrompt.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/manager/memoryMaintenancePrompt.ts)

--remind-after 控制发送后无新消息的提醒，范围 1m–24h 或 0。观察到新消息时取消。计时器使用内存 Map/setTimeout，随 Daemon 生命周期，重启不保留；失败提醒不重试。不能据此推断可靠的长期定时业务调度，持久唤醒队列与该提醒也不同。

[src/daemon/src/daemon/messageReminderScheduler.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/daemon/messageReminderScheduler.ts)

## 部署与运行前提

可用托管房间连接本机 Daemon，或 npx @alook/app onboard 自托管。app 包装检查、安装、密钥、迁移、注册、配对和服务启动；提供 start/stop/update。

| 本地服务 | 默认端口 | 职责 |
| --- | --- | --- |
| Web | 15210 | 界面、API、账号 |
| Email | 15211 | 外围邮件服务；本地不可收发 |
| WebSocket / DO | 15212 | 实时连接 |
| Wake | 15213 | 派发唤醒 |

本地服务共享 SQLite/D1 状态，保存在 ~/.alook/self-hosted/。Agent、模型认证、工具、网络与执行机器仍需准备。本地模式禁用 GitHub/Google OAuth，使用邮箱密码。应用和 Agent 本地运行不代表推理完全离线。

[src/app/README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/app/README.md) · [src/web/wrangler.toml](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/web/wrangler.toml)

## 价值与相邻方案：分析判断

### 减少人工代操作

同事直接向 Agent 交任务，减少主人反复代输需求、转发截图或复制结果。

评估：比较人工转接次数、等待时间和需求澄清轮次。

### 降低上下文交接

需求、补充条件、决定和结果处在共同频道，新的参与者能够追溯讨论。

评估：观察遗漏条件、重复解释和返工是否减少。

### 统一接入与维护

不同运行时连接、会话和凭据由共同底座处理，方便复用与二次开发。

评估：衡量接入维护成本、断线恢复和消息投递可靠性。

| 相邻方案 | 定位 | 关系 |
| --- | --- | --- |
| [OpenClaw](https://docs.openclaw.ai/) | 把现有聊天软件连接到 Agent，覆盖会话、记忆和多 Agent 路由。 | 接入、远程使用和持续 Agent 的能力有明显重叠；Alook 自建共同房间。 |
| [Claude Code in Slack](https://code.claude.com/docs/en/slack) | 从已有团队频道发起编码任务，借用原有聊天习惯。 | 表明“群里 @Agent 交任务”已有现成方案；运行与身份方案以其文档为准。 |
| [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) | 提供开发者可编程的状态、流程与持久执行基础设施。 | 属于编排层的相邻项目，可用于构建业务流程；不是同一种房间产品。 |
| [本总库的 Agenvo](../016-agenvo/README.md) | 通过 MCP 中继把不同原生 Agent 接到上层助手。 | Agenvo 侧重助手到 Agent 的远程连接；Alook 侧重人与 Agent 的共同房间。 |

自建房间增加沟通入口，需要证明收益足以抵消迁移习惯和维护成本。没有依据将命名身份或群聊接入称为独有技术壁垒，也没有断言成熟的全自动业务系统已形成。

## 使用场景：推断与示例

### 共享项目研究助手

输入：研究者给 GitHub 链接；其他成员补充关注点。

执行：读取仓库、记录版本、分析能力与原理，输出带来源的结论。

条件：对本研究总库最直接的候选场景。业务研究模板和证据规则需自行配置。

### 开发与测试共同反馈

输入：产品提出需求、开发补充约束、测试给复现材料。

执行：Agent 分析代码或提出修改，参与者在同一讨论中验收。

条件：适合可信小团队；任务归属、分支策略和验收条件需要明确。

### 在线工作机远程执行

输入：离开电脑后，用手机提出需求或查看结果。

执行：工作机器上的 Agent 使用其已有运行环境执行。

条件：适合机器常在线的工作方式；模型与工具网络不可用时需等待。

### 不同角色共同讨论

输入：研究、开发、审查等多个 Agent 与人参与房间。

执行：通过消息共享观点或转交结果，具体分工由人或额外流程决定。

条件：多 Agent 接入可行；自动规划、资源冲突和结果合并仍需业务设计。

## 可扩展方向：建议

### 业务知识与工具

状态：建议 · 首先验证

现有基础：接入的 Agent 已具备模型与工具基础。

需要补充：增加研究模板、项目知识、CRM / 工单 / 内部系统 API、结构化证据输出。

价值：把通用入口变成可重复完成真实业务的工作入口。

### 任务与多 Agent 编排

状态：建议 · 需额外设计

现有基础：共享消息、会话管理和工作标记。

需要补充：任务 ID、负责人、优先级、依赖、转交、重复任务抑制、结果合并。

价值：解决多人同时交任务与不同角色协作的秩序问题。

### 权限与执行治理

状态：建议 · 团队使用重点

现有基础：成员访问检查、运行凭据和本机代理。

需要补充：项目级权限、工作目录隔离、审批、操作审计、最小工具范围和资源配额。

价值：让团队能够按明确边界共享实际执行能力。

### 持久调度与恢复

状态：建议 · 区分消息队列

现有基础：现有唤醒队列、恢复逻辑和内存跟进计时器。

需要补充：可持久任务状态、定时触发、幂等写入、检查点、失败补偿及结果去重。

价值：支撑跨重启、长期和有交付责任的业务任务。

### 已有聊天与服务入口

状态：建议 · 降低迁移成本

现有基础：当前自建房间和 Agent 消息接口。

需要补充：按需求接 Slack / 飞书 / Discord、工单或网页入口，映射身份与权限。

价值：减少团队为了调用 Agent 而迁移聊天习惯的成本。

### 验收与可观察性

状态：建议 · 交付标准

现有基础：运行状态、事件和诊断。

需要补充：任务证据、结果清单、人工批准、可回溯修改、成本与失败原因面板。

价值：分别判断连接、执行轮次和业务交付，避免把“回复了”当作成功。

## 对本总库的意义：分析

### 研究价值

学习现成 Agent 运行时适配、长连接、消息准入与排队、凭据代理、事件时间线和会话恢复。可把这些作为 Agent 基础设施的阅读案例。

### 复用价值

需要将多个本地 Agent 变成团队可访问资源时，评估复用 app / daemon / driver 的工程设计。引入代码时保留 Apache-2.0 LICENSE 与版权声明。

### 最小业务试验

先试一个 GitHub 项目研究助手：输入仓库和关注点，输出版本、能力、模块、原理、边界与来源；由人核查，再更新本总库。该试验尚未实现。

### 采用标准

按人工交接次数、研究遗漏、任务完成率、维护成本和权限可控性判断。单人只需问答时，新增收益可能有限；多人反复共享 Agent 时更有评估意义。

候选最小实验仍未实施：输入仓库与研究重点 → 读取固定快照 → 生成带证据的结论 → 人核查 → 更新 projects.json、文档与网页。先验证单 Agent 共享，再评估多角色编排。

## 使用边界

### 访问范围

群聊中可调用的是获准成员。“所有人都可以”不表示公开访问或任何成员拥有全部机器权限；通知策略也会影响是否唤醒。

依据：[src/shared/src/community/wake-dispatch.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/shared/src/community/wake-dispatch.ts)

### 模型与业务

模型、认证、工具和任务执行来自已有 Agent。Alook 的侧重点是身份、消息、连接与会话；业务知识、流程和验收仍要配置。

依据：[README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/README.md)

### 多 Agent 协作

多人共享一个 Agent 已构成核心体验。多运行时与多 Agent 接入不能直接推断全自动任务分解、优先级协调和可靠结果合并。

依据：[src/daemon/README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/README.md)

### 本地与在线

本地执行指 Agent 在绑定机器工作。托管方案的房间、消息和上传内容经过服务端；自托管可把应用服务与数据放到自有环境。

依据：[src/app/README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/app/README.md)

### 执行审批

当前 Claude 适配器设置 bypassPermissions / skip-permissions；Codex 设置 approvalPolicy: never 和 danger-full-access。凭据隔离不能当作文件系统沙箱。

依据：[src/daemon/agent-driver/src/adapters/codex/index.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/agent-driver/src/adapters/codex/index.ts)

### 记忆与提醒

记忆依靠 Agent 读写和核查文件。无新消息跟进用内存 Map / setTimeout，进程重启不保留，失败提醒不重试。

依据：[src/daemon/src/daemon/messageReminderScheduler.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/daemon/messageReminderScheduler.ts)

### 完成判定

消息送出、输入被接收、Agent 空闲或一轮结束是技术状态。研究准确、代码正确或业务办理成功，需要独立的结果证据和验收。

依据：[src/daemon/README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/README.md)

Claude 权限另见 [src/daemon/agent-driver/src/adapters/claude/launch.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/agent-driver/src/adapters/claude/launch.ts)；运行凭据另见 [src/daemon/src/credentials/credentialProxy.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/credentials/credentialProxy.ts)。描述配置事实，不替代完整执行安全审计。

## 原图来源与版本差异

![我们生成的 Alook 完整中文引导图](assets/alook-guide.png)

原图保持字节不变，属于原创研究说明，非上游产品界面或实际 Agent 运行截图。原图对应 2026-10-09 的 v0.1.46；正文核查 2026-10-12 固定源码。提示词新增附件 ID 复用与产品操作指引，注册表额外后端单独标为源码观察。

原 PNG 的 SHA-256 和字节数保存在 assets/guide-provenance.json。构建检查原文件与发布副本一致。比较旧图快照到正文快照：相关 README 改邀请链接；提示词改附件上传入口并要求复用可读附件 ID，新增产品操作回答指引。本次检查的记忆、跟进计时器、Daemon 文档和 Claude/Codex 核心配置保持一致。

## 逐项证据

- **产品定位与公开运行时：** [README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/README.md)。共同房间、共享已有本地 Agent、持久身份；README 列出五种运行时。

- **产品品牌定义：** [src/web/src/lib/brand-copy.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/web/src/lib/brand-copy.ts)。品牌方向是把 Agent 分享给可信的人。

- **会话与调度架构：** [src/daemon/README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/README.md)。AgentSession、后端协议、主机调度、控制/数据面和凭据代理。文档中历史凭据描述以当前代码为准。

- **唤醒策略与身份：** [src/shared/src/community/wake-dispatch.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/shared/src/community/wake-dispatch.ts)。消费时重查权限、未读、静音、当前绑定；无正文 UnreadNotice 和稳定 launchId。

- **重复通知与已见序号：** [src/daemon/src/manager/wakeCoordinator.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/manager/wakeCoordinator.ts)。合并通知、已准入和模型已见水位，不是独立业务任务调度器。

- **收件箱与新消息保护：** [src/daemon/src/inbox/stateMachine.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/inbox/stateMachine.ts)。对模型未见新消息时的外发动作进行 freshness 检查与暂存。

- **持久记忆与工作标记：** [src/daemon/src/drivers/systemPrompt.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/drivers/systemPrompt.ts)。记忆文件、经验、时间线和消息工作标记；这是提示词规定的工作方式，效果尚未实测。

- **记忆维护：** [src/daemon/src/manager/memoryMaintenancePrompt.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/manager/memoryMaintenancePrompt.ts)。重置空闲会话前，提示核查、去重和更新长期记忆。

- **跟进提醒限制：** [src/daemon/src/daemon/messageReminderScheduler.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/daemon/messageReminderScheduler.ts)。Daemon 生命周期内的内存计时器；有新消息取消；失败不重试。

- **驱动注册范围：** [src/daemon/agent-driver/src/registry.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/agent-driver/src/registry.ts)。除 README 五种外，代码还注册 Grok / Antigravity；不能因此宣布所有产品路径均已验证。

- **Claude 权限与协议：** [src/daemon/agent-driver/src/adapters/claude/launch.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/agent-driver/src/adapters/claude/launch.ts)。stream-json 和跳过权限确认配置；原生定时工具默认禁用。

- **Codex 权限与协议：** [src/daemon/agent-driver/src/adapters/codex/index.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/agent-driver/src/adapters/codex/index.ts)。app-server stdio、thread/start/resume、never 与 danger-full-access。

- **运行凭据代理：** [src/daemon/src/credentials/credentialProxy.ts](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/daemon/src/credentials/credentialProxy.ts)。本机 voucher 校验、能力范围与运行凭据转发；不是操作系统执行沙箱。

- **部署与本地限制：** [src/app/README.md](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/app/README.md)。四类服务、端口、Node 要求、配对及本地邮件/OAuth 限制。

- **应用版本与许可证：** [src/app/package.json](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/app/package.json)。当前固定快照中的 @alook/app version 为 0.1.48，Node >=20.9，Apache-2.0。

- **数据与文件服务：** [src/web/wrangler.toml](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/src/web/wrangler.toml)。Workers 服务绑定、D1、R2、队列和 Durable Objects。

- **上游许可证：** [LICENSE](https://github.com/alookai/alook/blob/f4265de142d2af5934f536b316c8fe11b6c99f60/LICENSE)。Apache License 2.0；本站未引入上游执行代码。

## 网页实现与验证

源数据为 web/src/content.mjs；build 用 Node 标准库生成 HTML，复制 CSS/JS、原图和文档到忽略的 web/dist。来源链接统一固定源码版本。交互只包括图片、章节和步骤阅读，不调用模型。

```sh
npm run build --prefix projects/017-alook/web
npm run check --prefix projects/017-alook/web
npm run index:sync
npm run check
npm run pages:build
```

静态检查覆盖 JavaScript 语法、资源、重复 ID/锚点、源码版本、原图 SHA-256；浏览器检查桌面/手机/320px、资源加载、图片弹窗与焦点、六步选择、下载、控制台与网络；最后检查实际 Pages 部署和线上资源。实际记录保存在 assets/web-verification.json。

**未验证：** Alook 安装、账号/配对、真实 Agent 执行、模型记忆质量、多成员权限与长期消息恢复。网页发布不能作为上述能力的运行证据。

## 提交范围

主工作区保留其他项目未提交内容。本任务在独立工作区提交 017、根元数据/生成索引和两份工作流的必要步骤，远端已有 016 保持发布；001–015 的本地资料不纳入本次提交。
