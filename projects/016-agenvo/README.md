# 016 · Agenvo：远程 Agent 连接与调度研究

> **定位：** 自托管 MCP 中继，远程接入 Codex、Herdr 中的 Claude Code 等原生 Agent。

- **能力：** 发现运行时、提交任务、查询进度与结果、继续与中断、响应原生交互、订阅变化；具体动作依运行时而定。
- **模块：** 客户端负责决策；Relay 管连接、授权和请求；Connector 内置 Adapter；原生 Agent 负责执行与会话历史。
- **原理：** Connector 主动 WSS 连接 Relay，按 deviceId / instanceId 分发，再通过原生 API / CLI 和 threadId、session / name 等定位会话。
- **部署：** 通常一个 Relay，目标侧按运行时安装 Connector；Adapter 随包提供，每个任务无需单独部署。Agent 与模型认证需自行准备。
- **价值：** 跨 Agent 统一入口，减少自建助手和自动化系统的接入重复工作；仅为手机继续用 Codex，增量价值有限。
- **边界：** 单所有者，无统一业务调度器或成功判定；脚本隔离不等于执行沙箱，Relay 可见流量。本站未独立运行原生 Agent。
- **扩展：** 连接与证据面板、客户端验收、新运行时适配、任务编排、故障恢复、细粒度权限，均属建议或待验证方向。
- **引导图与依据：** 保留原中文完整引导图；正文固定于 `68e046a`，逐项补充 v0.2.0 和当前实现变化。

[返回总索引](../../README.md#有序索引) · [研究记录](research.md) · [网页运行说明](web/README.md) · [在线阅读](https://yydshly.github.io/1009_codex_project/016-agenvo/)

| 项目 | 信息 |
| --- | --- |
| 上游 | [Xuanwo/agenvo](https://github.com/Xuanwo/agenvo) |
| 正文源码快照 | [`68e046a5d8691054f8c134d85ae051988bae3dff`](https://github.com/Xuanwo/agenvo/tree/68e046a5d8691054f8c134d85ae051988bae3dff)，2026-10-12 核对 |
| 正式发行 | [v0.2.0](https://github.com/Xuanwo/agenvo/releases/tag/v0.2.0)，tag commit `a89415e557c415faf5626354f8e87233eb69d877` |
| 原图快照 | `4d899e5088ccf5a4b7cfde191dc00d3a41c1bd74`，2026-10-09 生成 |
| 上游许可证 | [Apache-2.0](https://github.com/Xuanwo/agenvo/blob/68e046a5d8691054f8c134d85ae051988bae3dff/LICENSE) |
| 研究环境 | Windows / PowerShell；网页 Node.js 22.15.0；Agenvo 要求 Node.js 24.13+ |
| 状态 | 源码研究与静态研究网页完成；未独立运行 Agenvo Relay、真实 Agent 或模型服务 |

## 我们形成的理解

Agenvo 负责连接和调用：上层助手接收人的目标，通过 MCP 访问自托管 Relay；目标侧 Connector 主动建立 WSS，按实例找到内置 Adapter；Adapter 使用原生接口，把任务送到正确的会话或 Agent。助手负责决策和工作流，原生运行时负责执行、历史与会话状态。

它提供发现、创建工作上下文、提交输入、查询状态与输出、继续与中断、交互应答、事件订阅等接入能力，具体动作取决于运行时。没有独立的统一业务任务状态库、自动调度器或业务成功判定。

当前 Codex Connector 通过 Unix socket / loopback WebSocket 连接**独立运行的 app-server**，不启动或停止原生进程；以原生 threadId / turnId 定位会话和轮次。Claude Code 等经 Herdr 接入，操作主要转成 Herdr CLI，session 选择服务、name / paneId 定位原生 Agent，事件直接订阅原生 socket。Paseo、Amp、Lody、OpenCode 使用各自 daemon、插件、同步或 HTTP/SSE 接口。

通常一个个人部署使用一个 Relay，目标侧按需要安装 backend 对应 Connector。Adapter 随包部署；一个 Connector 可有多个实例，每个实例可以有多个原生会话。每个任务、thread 或 Claude Code 进程不需要重新安装 Connector。远程原生端点等场景下，Connector 不必与执行机一一对应。

## 对我们的价值

Codex 官方远控已经支持手机继续工作、主机切换、跟进指令、审批、查看输出和任务通知。只为了手机控制 Codex，Agenvo 的增量价值有限，还增加自托管维护成本。

需要把不同原生 Agent 接入同一通用助手、接入自己的自动化系统，或希望修改并掌握中继基础设施时，它更有集成价值。研究价值包括原生能力发现、长连接路由、请求关联、权限批准、事件恢复和不确定执行处理。原生平台本身也支持 API / SDK 等接入；Agenvo 提供可复用的接入实现。

## 完整引导图

![我们生成的 Agenvo 完整中文引导图](assets/agenvo-guide.png)

原图未改动，属于原创研究说明，非上游产品截图。原图版本相关结论对应2026-10-09：当时未发布、Codex 曾由 Connector 启动 stdio 子进程。如今已发布 v0.2.0，Codex 改为附着独立服务；Herdr 启动参数转由原生处理；新增 OpenCode；MCP search / execute 返回方式改变。网页在原图旁逐项补充，正文依据新快照。不要将两个版本混用。

## 网页说明与阅读方式

依次包含引导图、能力、模块、六步调用路径、原生接入、部署、事件与执行状态、信任边界、官方对比与适用场景、扩展建议、证据与验证范围。

- 原图放大、打开原尺寸和下载。
- 六步调用路径逐项展示：发现 → 选择实例和会话 → Relay 路由 → Connector 分发 → 原生执行 → 观察与验收。
- Codex / Herdr / 其他运行时说明同时展示，以分节链接定位，保留不同身份和原生语义。
- 模块表、脚本隔离、输出契约与阅读清单默认展开，长说明按标签分行。
- 手机表格按列名逐项展示，无须横向拖动；保留弹窗 Escape 关闭和锚点目录。

交互为阅读辅助，没有连接真实 Agent；页面不收集密钥。扩展方向明确标注为建议或待验证。

## 构建与发布

```sh
npm run build --prefix projects/016-agenvo/web
npm run check --prefix projects/016-agenvo/web
npm run index:sync
npm run check
npm run pages:build
```

在子项目`web/`运行`npm run dev`，本地地址http://127.0.0.1:4186/。统一Pages路径`/1009_codex_project/016-agenvo/`。零npm依赖，`web/dist/`、`_site/`不提交。两份GitHub工作流接入构建检查，Publish GitHub Pages手动发布。

## 边界与扩展

单所有者、有效客户端可访问所有获准实例；无逐客户端实例ACL。Codex full access/never；Herdr当前原样转发参数，权限由原生配置决定。Relay可看到流量，无针对运维者的E2EE。

accepted只是提交确认，idle/turn completed不是业务成功。unknown后先查状态；写操作不自动重放；事件可重复、乱序、无历史重放；撤销不取消已开始的任务。

建议先完成真实客户端与Agent端到端验收，再补连接/证据面板、部署维护、新Connector、上层编排、恢复策略、细粒度权限和隔离。详见[研究记录](research.md)。

## 来源与本地改动

读取上游固定版本源码、设计、文档和测试，以及OpenAI官方文档。本地新增原创研究文字、HTML/CSS/JS、构建工具与图片，未引入上游执行代码。只读源码位于忽略提交的`upstream/`。上游测试作为证据引用，不等同本站独立实测。
