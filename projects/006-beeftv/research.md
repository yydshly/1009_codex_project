# 006 · BeefTV 研究记录

## 研究范围与基线

目标：说明 BeefTV 的能力、运行原理和使用场景，通过原创网页展示从文案／图片到视频交付的流程。研究应用架构与接口，网页演示不执行模型调用。

| 项目 | 记录 |
| --- | --- |
| 原仓库 | https://github.com/glanderness/BeefTV |
| 固定提交 | a2196d32782be6090beb003590ce11a956a423e1 |
| 提交时间 | 2026-10-09T01:39:55+08:00 |
| 版本文件 | v1.7.14；验收资料描述候选源码，未据此宣称公开包已发布 |
| 上游许可证 | MIT；[LICENSE](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/LICENSE) 保留 BeefTV、basketikun 与 ddcat 版权 |
| 上游来源 | [NOTICE](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/NOTICE) 记录衍生自 Infinite Canvas v0.5.0 / 568f0f1 |
| 研究环境 | Windows / PowerShell；Node.js v22.15.0；本机 Chromium 浏览器审查 |
| 上游构建要求 | Go 1.25、Bun、Wails 系统组件；Windows 需要用于 go-sqlite3 的 GCC |
| 研究网页 | 原生 HTML/CSS/JavaScript；Node.js 22+ 静态预览服务；无 npm 依赖 |
| 研究日期 | 2026-10-09（Asia/Shanghai） |
| 上游运行 | 未启动桌面版、未配置渠道、未进行付费生成 |

## 能力与证据

下表固定指向研究提交。维护者验收记录是上游提供的证据，不视为本项目复现。

| 结论 | 依据与验证层级 |
| --- | --- |
| 画布承载节点、连线、素材与生成流程 | [README](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/README.md)、[画布入口](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/web/src/pages/canvas/project.tsx)，文档与源码 |
| React/Wails、Go API、SQLite 与资源目录 | [本地架构](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/docs/local-first-architecture.md)、[Go 依赖](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/backend/go.mod)，文档与源码 |
| 视频任务处理素材检查、适配、查询和保存 | [视频模型合同](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/docs/content/docs/backend/video-model-contracts.mdx)、[协议接口](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/backend/internal/protocol/adapter.go)，文档与源码 |
| 当前源码具有 Pi 助手与真实业务工具 | [Pi 复用矩阵](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/docs/refactor/pi-official-reuse.md)、[操作桥](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/agent-host/operation-bridge.mjs)，源码与文档 |
| 助手修改节点、模型配置、时间线，提出付费生成 | [业务操作清单](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/docs/refactor/agent-operation-coverage-20261008.md) 与操作桥白名单，文档与源码 |
| 时间线通过语义计划降低为原生或 wasm FFmpeg 步骤 | [剪辑与导出](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/docs/refactor/editing.md)，架构文档 |
| 维护者报告实际生成与 15 秒成片修订 | [v1.7.14 验收](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/docs/release-evidence/v1.7.14-targeted.md)，上游记录；本项目未重新验证 |
| CLI/MCP 复用业务能力，外部 Agent 自行审批 | 同版验收与[权限合同](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/docs/refactor/agent-access-20261008.md)，文档 |
| 性能优化包括网格空间索引 | [空间索引](https://github.com/glanderness/BeefTV/blob/a2196d32782be6090beb003590ce11a956a423e1/web/src/lib/canvas/canvas-spatial-index.ts)，源码；未进行性能测量 |

## 原理与边界

数据流：导入媒体 → 本地资源目录与 SQLite → 画布节点及参考连线 → 生成任务 → 协议适配与供应商 → 结果保存并绑定画布 → 时间线 → FFmpeg 成片。

助手路径：画布上下文 → Pi 会话 → 已鉴权业务工具 → Go 参数与归属校验 → 持久记录及结果 → 下一轮判断。新会话使用 Pi Durable；既有 JSONL 会话继续使用 Pi Coding Agent，不将二者存储格式混为一谈。

- 本地优先针对工作区持久化，模型调用可能将提示词及参考媒体发送给供应商。
- 可发现模型 ID 不代表生成已验证；参考数量、传输和时长需按协议核验。
- 内置助手的付费生成经过界面确认；外部 Agent 使用自己的审批，仍接受业务鉴权。
- 时间线可控制时长与节奏，生成动作、文字和人物一致性需要检查。
- 桌面版为单用户本地工作区，不将旧托管登录、支付或团队同步描述为默认能力。
- features.mdx 中旧 Agent 退场是历史内容；当前入口、Pi 宿主及较新验收表明替换内核已进入源码树。部分重构文档所提文件已移动，路径以当前源码为准。
- 同版验收 JSON 的 releasePublished / releaseComplete 为 false，不据版本文件推断正式发布状态。

## 原创网页实现

采用暖色纸面、橙色标记和画布示意表达“连接创作过程”。素材为原创 SVG 插画，播放面板标注示意属性。

- 3 场景：咖啡品牌、产品展示、阅读倡议。
- 5 环节：输入、分镜、生成、剪辑、交付；每步有可控项、依赖条件和依据。
- 15 秒分镜顺序／字幕示意，可暂停、定位、重新播放，无自动播放。
- 下载当前场景 Markdown 流程卡，明确不是视频或可导入项目。
- 手动／Pi／外部 Agent 三种入口，动态说明调用方式。
- 语义按钮、aria-pressed、更新区域、可见焦点、跳过导航、时间轴与减少动态效果适配；禁用 JavaScript 时仍可阅读基础说明。
- 发布目录 web/public，资源使用相对路径，不依赖服务器路由回退。

## 本地验证

Chromium 实际操作网页，并查看桌面、移动端及整页截图。

| 验证 | 范围 |
| --- | --- |
| 语法 | node --check web/public/app.js |
| 流程 | 5 步切换、末步返回、3 场景内容和插画更新 |
| 播放 | 时间推进、暂停、第二镜头定位、15 秒终点、切换场景归零 |
| 下载 | 保存并读取 Markdown，文件名与场景内容一致 |
| 架构与入口 | 3 操作方式、首页节点跳转并匹配咖啡场景 |
| FAQ | 展开与内容显示 |
| 响应式 | 390、768、1024、1440px，无文档横向溢出 |
| 媒体与运行 | 图片加载，无页面异常、4xx/5xx 或外部 API/资源请求 |
| 动效 | 减少动态效果时不缩放预览画面 |
| 仓库 | 索引同步、根级校验、Pages 汇总 |
| 子路径 | 从汇总站点 /006-beeftv/ 检查资源与交互 |

初次视觉检查发现 SVG 的 HTML 高度导致画布图片伸长，已用 height:auto 修正并重新检查。截图对象为本项目网页，非上游应用。

## 全景图补充（2026-10-09）

新增 assets/beeftv-overview.png 单张高清长图，以及可编辑 HTML 排版源和 Chromium 渲染脚本。图内覆盖入口／输入、五步创作链路、四类输出、六类能力、Go / Pi / 模型 / FFmpeg 分工、实际研究页截图、五类应用场景、使用价值与限制，并将可扩展方向明确标为建议。

图片以 2400 像素宽导出，总高度 4623 像素；图片资源完整加载，未发现文档横向溢出或内容容器裁切。经过整图视觉检查，文字与截图说明保持可读。图中源码结论、上游验收记录与本次网页演示保持原有验证层级，未新增桌面运行或付费生成声明。

本图通过原生 HTML/CSS 确定性排版生成，引用现有原始截图，没有调用 AI 图像生成或编辑截图内容。

## 后续可选研究

- 在独立环境安装桌面版，记录实际运行结果。
- 经过费用授权后执行明确支持参考媒体的最小生成样例。
- 分别评估人物一致性、动作和剪辑结果，不以任务提交成功替代效果验证。
- 部署工作已进入本轮执行，公开验证结果在下文记录。

## 完整理解汇总（2026-10-12）

本轮继续采用同一固定上游提交，没有将旧研究误写为最新版本确认。综合说明如下：

### 定位

连接创意、参考媒体、生成任务、助手操作与剪辑成片的本地 AI 视频工作台；无限画布承载创作上下文。

### 入口与出口

手动桌面界面、内置 Pi 与外部 MCP/CLI；输入文案/提示词、图片/视频/音频参考、模型渠道与参数，输出生成素材、可播放下载的视频、可编辑工作区和操作/任务记录。

### 能力

多模态生成、画布与资产组织、分镜及批量任务、Pi 业务工具、媒体工具/时间线/字幕/FFmpeg 导出、渠道和自动化接入；生成画质由具体模型决定。

### 模块

按职责归纳画布、项目与资产、模型目录与协议、异步任务、Pi 与 Skills、受控操作层、媒体工具与剪辑、插件接缝八类；该分类为研究归纳。

### 原理

React/Wails → Go 本地 API → SQLite/资源目录；模型合同校验 → 创建/轮询/下载；Pi 工具由 Go 做权限、版本、幂等与撤销；统一剪辑计划分别交给 native/wasm FFmpeg 执行。

### 效果与证据

完整原全景图引导；本页验证三场景、五步骤、15 秒分镜示意与三入口切换，流程卡为说明文件。维护者记录候选版 4 图/8 视频与 15 秒阅读成片两版；本研究未复跑桌面或付费生成。

### 场景

品牌广告与产品展示、短剧和视觉分镜预演、知识/阅读倡议、多模型与 Agent 实验、素材复用和迭代交付。

### 价值

上下文与结果关系可见、生成到剪辑连续、人工与助手协作、模型可替换、资产状态可追踪、职责分工可研究；未量化效率、ROI 或商业转化。

### 扩展

行业模板与品牌约束、新模型合同和适配器、精细声音/剪辑、质量评测与素材选择、可恢复自动化、团队同步与共享资产；列明现有接入点、开发内容和验收目标。

### 边界

默认单用户本地工作区，生成可能向供应商发送参考且收费；工具非任意 shell，模型发现不等于生成验证；VERSION v1.7.14 的发行状态在固定验收中未完成；高级合成、团队协作与端到端性能需另验。

### 网页与证据处理

- 原 2400×4623 全景图及其中 preview.png 保持不变，正文完整展示并提供放大、原图与下载入口；新截图另命名。
- 添加模块职责、输入输出、三条执行链路、场景与效果层级、价值与扩展条件；八类模块是本项目按职责归纳，不声明上游官方计数。
- 时间线 editing.Compile 和画布独立 FFmpeg 工具明确分开；native 与 wasm 是统一计划的不同执行路径。
- 内置 Pi 的生成确认和外部 Agent 自身审批分别说明；助手工具目录不推断覆盖所有界面功能，也不开放任意 shell。
- 本地 SQLite/资源目录不推断离线生成、云同步、团队能力；IndexedDB 是浏览器降级路径。
- 维护者记录的候选版 4 图/8 视频与两版 15 秒阅读片标为上游证据，网页插画与动画标为原创示意。
- 固定发行 JSON 为 docs/release-evidence/v1.7.14.json；版本、性能与效果均按其证据范围表述。
- 新增 check.mjs 验证锚点、资源与原图 SHA-256。网页依旧无运行时依赖、无模型请求。

### 发布隔离

本轮从远端 main 创建隔离发布检出，加入 006 子项目和它在元数据、总索引与工作流中的变更；共享工作区其他项目的未提交修改保留。GitHub Pages 汇总已有已提交项目，避免发布未提交目录。

### 本轮本地验证结果

完整研究与原流程浏览器检查通过：9 个章节入口、8 类模块、3 条链路、5 类场景、6 类价值与 6 个扩展方向；原图尺寸及下载 SHA-256 一致；弹窗 Esc/关闭/焦点恢复；390/768/1024/1440px 无文档溢出；无 JS 仍可读核心正文；原有 3 场景/5 步骤/3 入口、播放/暂停/定位/归零、流程卡下载与减少动态效果正常；无页面异常、4xx/5xx 或外部资源/API 请求。新截图独立保存并视觉检查。

根级 index:sync、check 与 pages:build 通过；发布检出另行验证已有已提交项目的完整汇总。
