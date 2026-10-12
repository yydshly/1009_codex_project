# 016 · Agenvo研究记录

研究日期：2026-10-12。方法：固定版本静态源码追踪、发行/官方接口核对、本地静态网页验证。[完整研究网页](https://yydshly.github.io/1009_codex_project/016-agenvo/)。

## 基线与环境

| 项目 | 记录 |
| --- | --- |
| 上游 | https://github.com/Xuanwo/agenvo |
| 正文快照 | `68e046a5d8691054f8c134d85ae051988bae3dff`，固定main提交 |
| 正式发行 | v0.2.0，2026-10-09；tag commit `a89415e557c415faf5626354f8e87233eb69d877` |
| 原图快照 | `4d899e5088ccf5a4b7cfde191dc00d3a41c1bd74`，2026-10-09 |
| 许可证 | Apache-2.0；LICENSE/NOTICE已核对，未复制上游执行代码 |
| 本地环境 | Windows、PowerShell、Node.js22.15.0；网页QA使用bundled Playwright/Chromium |
| Agenvo条件 | Node.js24.13+；Connector支持macOS/Linux/Windows；VPS Relay Linux |
| 上游测试基线 | Codex0.160.1、Herdr0.9.3、Paseo0.11.1；不是运行时版本白名单 |
| 独立运行范围 | 只构建/验证本站网页；未运行Agenvo或真实Agent/模型凭据 |

## 研究问题与结论

1. 能力：统一MCP入口发现/调用多种原生运行时，提交输入、读状态与输出、继续、中断、交互、变化订阅；动作依各原生方法。
2. 模块：公网自托管Relay + 运行时可访问侧Connector；Adapter为Connector内代码，不是单独部署服务。
3. 数量：按backend/安装配置，不按任务或线程部署。一个Connector可多个实例，一个实例可许多会话。
4. 调度：deviceId选Connector、instanceId选Adapter；原生threadId/turnId或session/name/paneId找真实目标，两层请求ID关联应答。
5. Codex：官方app-server有双向JSON-RPC。旧图用Connector启动stdio子进程；当前附着独立服务Unix socket/loopback WS，不持有原生进程生命周期。
6. 价值：手机远控/多主机/通知已与官方重叠，增量是混合运行时、通用MCP客户端、自建自动化和中继控制权。
7. 谁编排：上层助手。Relay没有统一业务任务库/完成判定，状态与历史仍归原生运行时。

## 模块与状态归属

| 模块 | 职责 |
| --- | --- |
| packages/protocol | 消息schema、地址、Outcome、限制 |
| packages/connector/main | 配置锁、每实例创建Adapter、配置监听、关闭资源 |
| connection/dispatch/status | WSS、心跳重连、分发/去重、在途容量、状态落盘 |
| packages/relay/mcp/catalog/code | search/execute、发现、QuickJS、输出选择 |
| access/store/core | 持久授权、配对、实例批准；socket/epoch、pending、结果交付 |
| events | 订阅、签名webhook、重试、resync，无完整历史重放 |
| apps各Connector | 原生配置、方法、身份、连接、结果与事件 |
| Cloudflare / server | Workers+DO SQLite+可休眠WS / 单Node+SQLite+HTTP/WS+OAuth |

核心经RecordStore/RelayHost/RelaySocket复用；Backend为静态接入接口，没有动态插件加载。依据：[架构](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/design/architecture.zh-CN.md)、[实例初始化](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/packages/connector/src/main.ts)。

## 请求全路径

客户端经OAuth向/mcp调用search → 查询获准实例，关键词AND匹配kind/方法/描述，默认摘要，includeSchema:true取参数 → 选deviceId+instanceId与原生会话 → execute短脚本call → Relay检查授权/范围/online/ready/容量 → 生成requestId，记录epoch和pending，经当前WSS发instanceId/fingerprint/method/params → Connector校验并adapters.get(instanceId) → adapter.call → 原生接口按真正会话身份执行 → 两层ID关联结果 → 交付前再检查授权 → 助手等待/收事件，再查询状态和产物验收。

- deviceId是Connector身份，非物理电脑；同机可多个。
- instanceId是配置/Adapter，非任务；threadId会话、turnId轮次。
- Herdr session是服务、workspace/tab/pane是终端资源，name可复用，不是持久会话ID。
- requestId/RPC id关联调用，不能当幂等键；fingerprint批准范围、epoch当前连接，非业务身份。

依据：[Relay core](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/packages/relay/src/core.ts)、[分发](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/packages/connector/src/dispatch.ts)、[匹配与Adapter接口](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/packages/connector/src/adapters/adapter.ts)。

## 如何接入原生服务

### Codex

Unix检查socket/父目录所属与权限，WS经Upgrade连接；Windows走loopback WS。initialize(experimentalApi:true)→核对codexHome→initialized；RPC数字ID+pending Map匹配应答，通知和server requests分开处理。原生thread/start/resume/read/list、turn/start/steer/interrupt保留原名/schema/身份。

当前Connector不启动/停止服务；另开app-server不等于接管桌面聊天，桌面stdio无自动监听端点。原生stdio仍存在，只是当前Agenvo使用附着方式。创建/恢复/输入full access/never，自动执行审批；用户问题和动态工具需内容。requests.list/respond为桥接，notifications.list连接有界缓存，不是持久历史；历史依原生版本/配置。Connector重连恢复观察、不重放输入。

依据：[connection](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/apps/codex-app-server/src/connection.ts)、[Adapter](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/apps/codex-app-server/src/codex.ts)、[设计/验证](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/design/codex-connector.zh-CN.md)、[官方接口](https://learn.chatgpt.com/docs/app-server)。

### Herdr / Claude Code

configRoot中的default/sessions发现独立服务。操作主要execa(config.binary,argv)，stdout JSON保留；HERDR_SOCKET_PATH、HERDR_CONFIG_PATH、XDG_CONFIG_HOME、HERDR_SESSION选择服务，CLI再向原生服务调用。agent.prompt→agent prompt NAME TEXT。agent.start在已有pane异步启动，kind/args交Herdr判断，不注入固定权限参数；事件直接走原生socket。

当前调用不传backendGeneration；内部代次仍隔离启动记录、重建事件。终端快照不是完整聊天历史，按键不保证精确turn中断。启动超时或名字失效需重新发现，进程可能仍在，不能盲目再创建。

依据：[Adapter](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/apps/herdr/src/herdr.ts)、[方法argv](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/apps/herdr/src/methods.ts)、[环境与端点](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/apps/herdr/src/services.ts)、[原生语义](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/design/herdr-connector.zh-CN.md)。

### 其他

| 运行时 | 接入与边界 |
| --- | --- |
| Paseo | 独立daemon直接WS/server ID，非Paseo relay/E2EE；恢复可新ID，输入/steer语义依provider |
| Amp | 实验性鉴权本地WS+插件；协议/加载测试非真实云账户执行证明 |
| Lody | cloud workspace或本机daemon+原生同步/RPC；云账户未独立验收，本地测试有平台适配 |
| OpenCode | 原生HTTP/SSE，sessionID/directory；204只确认派发，SSE无重放，另开serve非现有TUI |

依据：[使用指南](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/docs/usage.zh-CN.md)、[OpenCode](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/docs/opencode.zh-CN.md)、[发行与验收边界](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/CHANGELOG.md)。

## 执行、事件、故障

QuickJS Wasm模块宿主内复用，每次runtime/context独立；无宿主文件/网络/env/imports/timers。execute30秒、Relay确认10秒、Codex RPC8秒是接口保护上限，非任务预算。等待在调用方请求之间或靠事件，脚本不忙等。

v0.2.0正常execute直接交付脚本输出：文本原样、JSON序列化、无返回null，无旧result.value/result.calls。call仍为Outcome，完整确认需显式return。脚本失败保留已派发调用确认，写入可能已发生，无事务/回滚；脚本省略原生拒绝不会自动isError。

not_started未派发；starting异步开始；accepted原生接受；rejected明确拒绝；unknown无法确认。accepted/idle/turn completed不证明业务成功；unknown先对账，禁盲目重复写操作。原生帧64KiB、解析1MiB，大结果分页并保留可用nativeIds；脚本最终输出不走同一Connector通道。

runtime.changed经Connector/Relay发签名HTTPS webhook，不跟随重定向；订阅持久化，瞬时失败最多5次，同事件ID，可重复乱序，无历史重放。resync_required重新发现/读状态。客户端支持普通MCP不代表支持事件/dot唤醒；仍需独立验收。断线/Connector关闭不取消独立原生任务，重连不重放输入，撤销不取消已开始任务。

依据：[执行契约](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/design/mcp-execution.zh-CN.md)、[事件](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/docs/events.zh-CN.md)。

## 部署和信任

准备原生运行时/模型认证→Cloudflare或单Linux VPS Relay→配置实例/配对/核对指纹/批准→MCP OAuth客户端→search/execute。目标电脑主动WSS无公网入站。包不会安装Agent运行时。一Relay+按backend的Connector，实例和会话不按任务安装；远程原生端点/Lody等使Connector与最终执行机不一定一一对应。

单所有者，所有有效MCP客户端访问全部批准实例（含未来批准），无逐客户端ACL/多租户。Codex full access/never；Herdr参数由原生决定，目录非沙箱。Relay可看到流量/改授权，无针对运维者E2EE。设备、实例、OAuth、管理员凭据独立生命周期，scope变更重批，context非强制权限保证。

依据：[安装](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/docs/installation.zh-CN.md)、[安全](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/SECURITY.zh-CN.md)、[Herdr现实现](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/apps/herdr/src/methods.ts)。

## 价值与扩展（我们的判断）

[官方远控](https://learn.chatgpt.com/docs/remote-connections)已提供新建/继续、跟进/审批、输出/diff/测试/终端/截图、通知和主机切换；[官方app-server](https://learn.chatgpt.com/docs/app-server)也有技术接入。Agenvo不是远控或编程接口的唯一来源。

只用Codex手机远控：增量小。混合Codex/Claude等、通用MCP助手、自建自动化、掌握中继：集成价值较高。学习适配/路由/授权/故障：研究价值较高；要计算部署与兼容维护成本。

建议（尚未实现/验证）：

1. 连接/证据面板：device/instance/native对象、requestId关联、授权/断线、产物/测试。
2. 真实客户端与维护：OAuth、工具发现、MCP Events/实际dot唤醒；更新回退。已有版本提示≠自动更新。
3. 新Connector：配置schema、静态Backend、methods/call、Outcome/events，先保留原生身份和语义。
4. 上层编排：依赖/预算/分工/验收、请求间等待，不假称已有统一调度。
5. 恢复：unknown对账，原生支持才幂等键，事件去重/乱序/resync，人工处理；requestId不足以恰好一次。
6. 权限/隔离：逐客户端实例/方法ACL、租户、系统用户/容器、审计、审批；E2EE需新信任设计。

优先真实客户端+Agent端到端验收，再证据诊断、新后端/编排，最后团队隔离。

## 原图与版本冲突

原PNG按用户要求保留，hash见[素材说明](assets/README.md)。旧图后的变化：正式v0.1.0/v0.2.0发行，Codex独立附着，Herdr原样参数和移除调用generation，OpenCode，search摘要/includeSchema，execute直接输出。正文以新快照解释，图旁逐项更新。

main的SECURITY/OpenCode个别“未发布”、Herdr固定启动权限字句仍滞后。实际release、registry（npm view @agenvo/opencode@0.2.0 version返回0.2.0）、当前methods及专门设计决定最新结论，不直接复述冲突文字。

## 验证范围

网页检查：语法、本地资源、目录锚点、固定版本、原PNG一致性；根index:sync/check/pages:build核对本地16项目与汇总。浏览器检查桌面/手机布局、图片弹窗/下载、步骤、原生标签/键盘、详情、脚本/资源错误，见[验证报告](validation.md)。

未运行上游全套测试、实际Relay、真实Agent、云模型账户或dot；上游测试证据不等于本站独立验收。真实使用仍需验证目标客户端发现/OAuth/事件、原生执行/断线、业务产物与权限。
