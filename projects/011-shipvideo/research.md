# 011 · ShipVideo 研究记录

## 基线与验证范围

- 上游：[diggerhq/shipvideo](https://github.com/diggerhq/shipvideo)。
- 研究提交：[53d7c6f752fb85b449de8cf806b77ad21808a8f1](https://github.com/diggerhq/shipvideo/tree/53d7c6f752fb85b449de8cf806b77ad21808a8f1)。2026-10-09 使用 git ls-remote 确认当时 HEAD 与此一致。
- 上游环境：README 描述 OpenComputer 会话使用 Amazon Linux 2023 arm64、Node.js 22；首次调用工具安装 Chromium、FFmpeg 和系统库。
- 本地环境：Windows、Node.js 22.15.0；HTML/CSS/JS 无第三方依赖；Codex 内置浏览器。
- 研究日期：2026-10-09，Asia/Shanghai。
- 许可证：完整仓库树未发现 LICENSE；GitHub API 仓库信息 license=null。这只是当前提交的发现，不将仓库自动视为 MIT 或其他开放许可。
- 完成源码阅读与本地讲解页验证；没有安装运行上游 Agent，没有生成付费视频。速度、用量和生成质量均未实测。
- 上游源码通过固定 commit 的公开源文件只读查看，未引入本子项目。

## 核心问题与结论

### 2026-10-12 复核与完整整理

GitHub commits/main API 返回仍为 53d7c6f752fb85b449de8cf806b77ad21808a8f1。原始引导图沿用 2026-10-10 制作的 PNG/SVG，图示基线与本次源码一致；未重新生成或替换图片。

本次补充十项完整摘要、八类模块、任务流转及效果边界，摘要元数据统一维护于 projects.json 的 011.summary 与 011.summarySections。build 使用 Node.js 标准库将完整摘要同步到静态 HTML。原始引导图完整性见 assets/guide-integrity.json。

### 1. 核心是“理解网页，再写代码制作视频”吗？

是。网址模式读取页面文字和元数据；提示词模式直接使用文字简报。Agent 将信息组织成短片，写出 HTML/CSS/SVG/Canvas 动画，再调用工具检查和渲染。

web_fetch 使用 fetch 获取响应并剥离 HTML，不执行页面 JavaScript，不登录产品，不自动录制真实操作。颜色与字体是 HTML 文本线索提取，不等于完整的浏览器计算样式分析。

依据：[web.ts](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/opencomputer/agents/director/tools/web.ts)、[agent.ts](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/opencomputer/agents/director/agent.ts)。

### 2. 底层依赖 Remotion 或 HeyGen 吗？

当前代码没有使用这两者。渲染器安装 playwright-core 与 ffmpeg-static，启动 Chromium，注入虚拟时钟，截图并将帧流输入 FFmpeg。根依赖为 OpenComputer Agent SDK，前端使用 Next.js 与 React。

这属于代码定义画面、浏览器逐帧导出的视频制作路线。没有证据说明该实现源自 Remotion，也没有 HeyGen 生成接口。

依据：[renderer.ts](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/opencomputer/agents/director/tools/renderer.ts)、[根 package.json](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/package.json)、[前端 package.json](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/web/package.json)。

### 3. 输入和输出具体是什么？

| 环节 | 内容 | 依据与边界 |
| --- | --- | --- |
| URL 输入 | HTTP(S) 网址，原前端可补 https 前缀 | 获取响应文字；页面脚本不执行 |
| Prompt 输入 | 文字创作简报，原前端上限 2000 字符 | 不支持在该表单上传视频、图片或文档 |
| 中间产物 | 完整 HTML 动画 | Agent 提示词建议小于 60 KB；当前交付 API 不返回 HTML 编辑项目 |
| 检查结果 | 错误列表、若干时间点的可见文字与背景色 | 无完整视觉评审；不保证事实正确或画面优美 |
| 最终文件 | H.264 MP4，1920×1080，默认 30 fps，静音 | 工具可选 24/30 fps，时长限制 3–90 秒；导演目标 20–40 秒 |
| 下载 | videos/<job>.mp4 保存在会话工作区，前端签名下载 | 本次未验证服务保留期与签名有效期 |

依据：[创建任务与输入验证](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/web/src/app/api/jobs/route.ts)、[scene.ts](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/opencomputer/agents/director/tools/scene.ts)、[状态与下载路由](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/web/src/app/api/jobs/%5Bid%5D/route.ts)。

## 架构与数据流

1. Next.js POST /api/jobs 校验输入、生成 jobId，创建 OpenComputer 会话并等待运行环境连接。
2. 发送包含 jobId、模式和输入的 JOB 文本给导演 Agent。
3. 网址模式调用 web_fetch；导演编排叙事、写动画代码、调用 check_scene 并修正问题。
4. render_video 启动浏览器、按帧推进虚拟时钟、截图，经 FFmpeg 编码成 MP4。
5. 完整文件从本地工具目录复制到 /workspace/videos/<job>.mp4。
6. GET 状态路由读取会话事件，找到视频后返回签名下载链接。

OpenComputer 提供 Agent、模型网关与会话运行环境；前端提供输入、状态与下载界面。生成任务依赖后端服务，不能仅用 GitHub Pages 执行。

## 能力与限制

### 八类模块的分工

| 模块 | 责任 | 主要依据 |
| --- | --- | --- |
| Web 输入与展示 | Next.js/React 的网址与简报入口、阶段状态、预览和下载 | web/src/app/page.tsx |
| 任务创建 API | 输入和限额校验、jobId、创建会话、等待 runtime.connected、发送 JOB | web/src/app/api/jobs/route.ts |
| 会话与运行环境 | OpenComputer 会话、事件、消息、工作区下载和 Linux 运行环境 | web/src/lib/oc.ts、README |
| 导演 Agent | 叙事、动画代码、调用检查与渲染；提示词约束创作范围 | opencomputer/agents/director/agent.ts |
| 网页读取工具 | 静态 HTML 文字和元数据，不登录或操作浏览器 | tools/web.ts |
| 场景工具 | check_scene 的技术线索；render_video 的参数校验、渲染调用与工作区复制 | tools/scene.ts |
| 逐帧渲染器 | 虚拟时钟、Chromium 截图流、FFmpeg 视频编码 | tools/renderer.ts |
| 状态与交付 API | 文件存在时返回签名 URL，否则读取事件阶段和失败信息 | web/src/app/api/jobs/[id]/route.ts |

任务 API 创建会话后，先等待运行环境连接再开始 Agent turn。GET 状态路由先探测目标视频文件，再读取工具和 turn 事件；工具失败可显示修正阶段，已结束但未产出视频的任务会成为错误。状态请求自身异常可能返回 working 与 warning，因此阶段标签不是完整的业务验收或持久工作流证明。

补充来源：[Web 入口](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/web/src/app/page.tsx)、[会话 API 客户端](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/web/src/lib/oc.ts)、[任务创建](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/web/src/app/api/jobs/route.ts)、[状态与文件交付](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/web/src/app/api/jobs/%5Bid%5D/route.ts)。

### 效果类型和实测边界

动态文字可以分段呈现信息，流程与数据图形可以解释机制，绘制界面可以表达抽象交互。网页转短片的增量取决于这些表达是否有助理解：普通介绍文字逐句显示，并不会自动形成较高业务价值。真实功能演示、人物表演和摄影需要另行采集或制作素材。

本地 24 秒 HTML 动画只验证说明网页的交互和四种预设叙事，不代表上游 Agent 实际生成、MP4 编码质量、中文排版质量或商业效果。原始说明图中的三种效果关键帧同样是示意。

- 适合动态文字、抽象流程、计数器、数据流、图表和绘制的界面示意。
- Agent 提示词要求 6–10 个节奏段、每段一个核心想法，并要求不要捏造数字；这是模型约束，不是事实核验器。
- 工具直接拒绝 video/audio/iframe 标签；外部图片、脚本、随机数、CSS transitions 等在导演提示词中受限。提示词限制与工具强制校验需区分。
- 当前 FFmpeg 输入只有 JPEG 图像流，未接入配音、音乐与音画合成。
- 虚拟时钟推进 rAF、定时器及 CSS/WAAPI 动画，提高时间状态的可控性；模型重新生成作品并不确定。
- check_scene 的文字检查只检查文本节点、样式与几何边界等线索；不等于理解图形、核实卖点、评审构图或完整检查遮挡。
- 原渲染环境是 Linux arm64。迁移到本地 Windows 需要适配 Bash、系统库安装、浏览器路径和文件路径。
- 官网称视频任务约四分钟、约十万 tokens；README 称 30 秒视频渲染约 30–40 秒。前者是整体任务描述，后者是渲染阶段，均为作者描述，未实测。
- 当前前端的内存限额为软限制；如公开提供批量服务，需要增加持久任务、实际预算与访问管理。这属于扩展工程工作。

依据：[Agent](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/opencomputer/agents/director/agent.ts)、[检查工具](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/opencomputer/agents/director/tools/scene.ts)、[渲染器](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/opencomputer/agents/director/tools/renderer.ts)、[限额实现](https://github.com/diggerhq/shipvideo/blob/53d7c6f752fb85b449de8cf806b77ad21808a8f1/web/src/lib/limits.ts)、[官方演示](https://launchvideo.io/)。

## 版本差异

官网技术文案描述 Vercel Blob 上传 token、公开 Blob 视频链接；固定提交的 README、scene.ts 与下载路由均使用会话工作区，web/package.json 也没有 Blob 依赖。网页按固定提交说明，不将官网旧技术文案当成当前代码事实。

## 使用场景与个人价值

以下为根据现有能力提出的使用建议，不声称已在上游验证每个场景。

| 场景 | 建议输入 | 输出用途 | 实际边界 |
| --- | --- | --- | --- |
| 产品发布 | 定位、受众、三项具体能力、品牌与 CTA | 产品介绍、发布预告 | 真实拍摄素材与人物表演需补充制作流程 |
| 功能更新 | 旧流程、新步骤、已核实变化 | 版本更新与使用说明 | 绘制界面不等于真实操作录屏 |
| 技术解释 | 数据流、术语、依赖、成功与失败分支 | API / Agent / 工作流解释 | 架构与数字需先核实 |
| 研究传播 | 能力、证据、限制与研究入口 | 项目介绍与总库传播 | 自动抓取不等于深入研究整个仓库 |

对当前总库的意义：现有文档、图片和 Web 演示可增加视频入口；学习将代码动画包装成服务任务的流程。001 Motion Video Kit 提供制作方法与评审对照；006 BeefTV 提供素材及时间线工作台对照。先用一份核实后的中文简报验证质量，再决定是否批量接入。

## 实际业务价值（2026-10-10 补充）

本节为基于已确认制作能力的业务用途推导，不是上游客户案例、已验证增收结果或转化保证。

价值链为：已有产品页或简报 → 审核后的解释短片 → 对应分发渠道 → 试用、预约或功能使用。生成 MP4 只完成其中的素材制作环节；渠道、行动入口与统计仍需自行安排。

| 业务用途 | 作用方式 | 衡量指标 |
| --- | --- | --- |
| 制作效率 | 从已有信息起草脚本和动画，减少重复内容制作 | 每条可用成片总工时、模型及运行成本、返工与审核费用 |
| 产品获客 | 制作痛点、机制与行动入口短片，用于发布和视频渠道 | 有效产品访问、试用、合格线索；播放量是过程指标 |
| 销售解释 | 使用流程短片解释抽象方案，供会议及跟进沟通复用 | 解释工时、重复问题、演示预约或后续方案沟通 |
| 功能采用 | 将更新说明做成步骤短片，进入已有客户渠道 | 目标功能实际使用、重复咨询；复杂操作需要真实素材 |

总成本应包括模型与运行费用、核实修改人力、失败重试、配音与尺寸适配等。比较对象是达到发布要求的成片，而非模型起草时间。

网页采用一个明确标为假想的客服工单产品示例：产品页描述收集请求、按规则分派、查看状态；短片组织为痛点、三步流程、预约演示，记录制作工时与有效预约。没有调用模型生成该案例视频，没有接入预约或统计服务。

对总库的判断：如果主要用于个人学习，商业价值低，主要收益是理解与积累。如果后续面向客户、课程读者或合作方，短片可用于作品展示、知识讲解和销售沟通。需要先选择明确受众及一个目标；不建议仅为了增加视频数量而给所有项目批量制作。

验证方法建议：在尽量相近的受众、渠道和主题条件下，比较文字、图文与视频，记录全部制作投入及实际行动。业务指标为建议，尚未实测。当前横屏静音限制仍成立；分发与统计不属于当前上游代码功能。

## 可扩展方向

### 当前采纳结论（2026-10-10）

按本次明确的研究用途，我们仅借鉴“读取信息 → 编排内容 → 写动画代码 → 稳定渲染”的流程：使用已核实资料，组织结构化叙事，生成按时间定义的动画代码，再以可控时钟逐帧输出。

这是一条可研究和复用的自动制片技术路线。当前不将 ShipVideo 视为已验证的业务方案，也没有据此接入总库批量制片或确认付费客户需求。前述产品发布、销售解释、功能采用等保留为条件性的应用推导。

中文全景图见 assets/overview-infographic.png，完整提示词见 assets/overview-prompt.txt。图中的关键帧为绘制示意，不是上游生成视频的实际截图；图示依据沿用本文件固定提交的源码研究，未新增运行证据。

### 后续候选方向

这些方向均未在本子项目实现：

1. 结构化简报与中文模板：从已审核研究材料提取字段，增加中文排版、字数、字体与安全区域规则。
2. 视觉评审与成本记录：保存 HTML、分镜、关键帧与用量；增加溢出检查与人工审核。
3. 竖屏与音频合成：参数化尺寸，增加配音、音乐、字幕时间与 FFmpeg 音画合成。
4. 真实产品操作素材：增加浏览器操作、截图/录屏与受控素材输入。
5. 多模型、本地渲染与批量任务：分离模型、运行环境和任务存储，适配本地系统，增加队列与预算。

## 本地实验与验证

制作原创 24 秒讲解动画，提供四种预设叙事；使用自身 HTML/JS 根据时间计算画面。该实验验证讲解网页的交互，未使用上游渲染器或输出 MP4。

浏览器确认输入方式、编辑保存、四种场景、四步原理、提示词复制、动画播放/暂停/尾帧及反向定位。桌面和移动端截图见 assets/。检查与汇总结果见 [verification.md](verification.md)。
