# 008 · Realtime Solar System 研究依据与实验记录

## 研究基线

原仓库：https://github.com/openai/openai-realtime-solar-system 。固定提交为 18025b656a5c7a5e9f52dddfe3981da808ae30bb，提交时间 2026-03-04 17:05:46 +0100，说明 add va。源码包版本 0.1.0，模型配置 gpt-realtime-1.5，声音 coral；这些是研究提交的配置，不是最新模型推荐。

研究日期为 2026-10-09；环境为 Windows、PowerShell、Node.js 22.15.0。上游采用 MIT，Copyright (c) 2025 OpenAI。本地阅读克隆在被忽略的 upstream/openai-realtime-solar-system/。本项目没有复制上游应用实现代码，复制了自带截图并保留完整许可证。

## 实际执行机制

原项目使用 Next.js、React、Spline 与图表组件。浏览器从 /api/session 获取短期凭据，建立 WebRTC 连接，通过音频轨道传输麦克风和模型输出，通过 oai-events 数据通道传输事件。

服务端在 app/api/session/route.ts 读取 OPENAI_API_KEY，调用 /v1/realtime/client_secrets，设置凭据签发后 600 秒失效。这是凭据有效时间，不能当成会话时长限制。

前端用 session.update 注册提示词和六个工具。收到 response.done 后读取函数调用，更新 React 状态，场景组件解析参数并执行动作。工具结果以 function_call_output 返回；图表与 ISS 查询还会请求后续响应。

场景使用 spline.current.emitEvent 的 mouseDown 事件触发已有对象动画。对象、名称、动画和镜头必须提前配置。README 说明的聚焦对象包括太阳、地球、水星、火星、木星、土星、海王星和冥王星。工具枚举额外包含金星、天王星，不能据此断言它们的动画已完成。

show_moons 限定四颗伽利略卫星与五颗冥王星卫星。display_data 的数值由模型传入，前端显示饼图或柱状图，没有来源查询或事实校验。

app/api/iss/route.ts 查询 Open Notify 的经纬度。components/scene.tsx 仅触发 ISS 动画，不使用坐标设置对象位置。可以确认位置查询与动画触发，不能确认真实位置在场景中同步。

## 技术深度判断

它是工程集成示例：语音与函数调用能力来自 OpenAI，3D 渲染和动画来自 Spline，应用主要负责连接、工具定义、状态与事件映射。

源码没有实现新语音算法、通用场景理解、3D 生成、物理模拟、自主规划或视觉闭环。前端通常默认返回工具成功，未核验场景动画是否完成；函数调用输出使用 find，只处理第一个调用。正式扩展应验证参数、遍历实际调用并回传真实执行状态。

对总库的主要增量是给已有 3D 场景增加语音入口。适合学习工程连接方式，算法研究价值较低。此为源码分析判断，未量化教学效果、性能或使用收益。

## 本地实验设计

独立 Three.js 场景没有引入 Spline 运行时或上游模型。尺寸、距离、程序化纹理、轨道和运动为教学示意，没有天文历表计算。

页面持续标注原创交互示意、无模型调用。输入使用有限关键词匹配，未知指令不伪造工具调用并保持画面。浏览器系统朗读是可选功能，明确不代表 Realtime 的音质或时延。不录音、不需要密钥，不请求会话和 ISS API。

演示六类动作：聚焦土星；显示地球陆海图表；显示木星四颗或冥王星五颗卫星；俯视轨道；显示 ISS 示例；镜头复位。为了易读，图表、卫星和 ISS 同时聚焦对应对象，这不是逐行复刻上游动画。

图表采用海洋约 71%、陆地约 29%，依据 [NASA Earth Facts / Surface](https://science.nasa.gov/earth/facts/#surface)，陆地为补数。ISS 坐标为独立设置的固定示例 31.20°、121.50°，页面明确标注非实时，模型没有按经纬度定位。

## 扩展场景与价值

| 场景 | 可复用 | 需要新增 | 价值和边界 |
| --- | --- | --- | --- |
| 002 离心泵教学 | 会话、工具协议、动作映射 | 部件 ID、聚焦、流动动画与可信教材 | 提问联动对象展示；不自动提供流体仿真 |
| 004 社区导览 | 语音与镜头控制模式 | 地点、服务信息与更新维护 | 提问定位地点；真实导航需要定位及地图 |
| 产品结构讲解 | 自然语言到受限动作的接口 | 拆解动画、零件关系、规格与版本 | 辅助展厅与培训；不自动理解任意 CAD |
| 研究总库导览 | 语音会话与工具入口 | 检索、来源展示、对比组件 | 复用编号及元数据；上游没有知识库 |

这些是扩展建议，不是上游或本页已有功能。建议先验证对象聚焦、动画播放与可信图表三个动作。

真实接入需服务器签发短期凭据、访问控制、参数验证、执行反馈与预算管理。正式 Key 不放到静态前端。外部查询应处理失败、超时和数据更新时间。纯静态研究页可直接汇入 Pages。

## 验证与交付

使用 Vite 6.4.3、Three.js 0.180.0、Playwright 1.62.1。web/tests/verify.mjs 检查真实页面的指令、图表、卫星、轨道、ISS、复位、未知输入、四类扩展标签页、键盘操作、完整自动演示、390px 布局、截图与许可资源。

在 web/ 执行 npm run check、npm run build；启动 npm run preview 后运行 npm run verify。生产预览报告为 assets/browser-verification.json。使用 SOLAR_URL 指向汇总站点的编号路径运行同一流程，报告为 assets/pages-verification.json。

首轮验证发现土星聚焦后名称标签被顶部裁掉；已将标签锚点从环外缘调整到球体上方，再复查。

根目录执行 npm run index:sync、npm run check、npm run pages:build。pagesDir 指向 web/dist，pages.yml 与 validate.yml 添加安装、检查与构建。构建产物和依赖不提交。

实际截图为 assets/preview.png、chart-demo.png、mobile.png；上游截图为 upstream-screenshot.png，完整来源与许可见 web/THIRD_PARTY_NOTICES.md。

本次未接通上游语音，未验证模型工具选择、音质、网络时延与 Open Notify 当前可用性，未执行远程部署。浏览器朗读开关经过验证，音频听感未测试。

## 理解汇总图

2026-10-09 使用内置 imagegen 生成 assets/overview-infographic.png，完整提示词保存在 assets/overview-prompt.txt。输入参考图为上游自带截图、本地土星聚焦截图及地球图表截图；没有调用图片 API 或配置密钥。生成结果已目视核对中文、能力和来源标签。

汇总图明确区分已有能力、需要新增开发的使用场景，以及仍需真实语音接入验证的收益。它保留“工程集成样例、算法研究深度有限”的判断，未增加新算法、通用场景理解或仿真能力。效果区域由图像生成工具根据截图参考构成，不应作为原生界面像素级证据；原始截图仍分别保留。

汇总图已加入 README、总索引与静态展示页。生成图中的“上游自带截图”和“本地示意”表示参考来源；图片类型始终为 AI 生成研究说明图。图文事实以本研究记录及固定源码依据为准。

## 固定版本与官方依据

- [README 与演示范围](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/README.md)
- [工具与提示词](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/lib/config.ts)
- [WebRTC 与工具处理](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/components/app.tsx)
- [场景事件](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/components/scene.tsx)
- [短期凭据](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/app/api/session/route.ts)
- [ISS 查询](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/app/api/iss/route.ts)
- [模型配置](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/lib/constants.ts)
- [依赖版本](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/package.json)
- [上游 LICENSE](https://github.com/openai/openai-realtime-solar-system/blob/18025b656a5c7a5e9f52dddfe3981da808ae30bb/LICENSE)
- [OpenAI 官方 WebRTC 文档](https://developers.openai.com/api/docs/guides/voice-webrtc)
- [OpenAI 官方函数调用文档](https://developers.openai.com/api/docs/guides/realtime-conversations#function-calling)

## 2026-10-12 全面整理与发布

沿用原始 overview-infographic.png 作为网页引导图，未重新生成或修改原 PNG。网页补齐语音会话、上游与本页验证范围对照、七组源码模块、七步执行机制、成功反馈与首个调用限制、投入判断、任务验证方法和六类扩展路线。项目元数据新增定位、能力、模块、原理、效果、场景、个人价值、投入条件、扩展、边界和依据十一组摘要，与总索引同步。

再次核查固定提交中的 app.tsx、scene.tsx、session/route.ts：会话在通道打开后注册工具；响应使用 find 取首个函数调用；场景通过 mouseDown 名称事件执行预制动作；默认工具成功未验收画面。2026-10-12 读取 OpenAI 官方函数调用文档，确认应用执行工具并按 call_id 回传结果的分工；本研究保留固定提交，不将模型配置升级为当前推荐。

真实语音接入、多调用调度、可信检索、坐标映射和收益测量仍为扩展建议。本次交付静态研究页及可操作本地规则示意，部署不意味着这些能力已经接通。

隔离发布目录以当时 origin/main 为基线，仅增加 008 及必要的元数据、生成索引、Oil UI 元数据快照和两个工作流中的 008 构建步骤，保留其他已发布项目。执行 npm run index:sync、npm run check、npm run pages:build，12 个已收录发布项目汇总成功；原工作区的 19 项完整索引也通过校验。

通过 http://127.0.0.1:5248/008-openai-realtime-solar-system/ 对生产汇总执行浏览器验证：11 项检查通过，错误和失败请求均为空，覆盖七区内容、引导图、六类动作、两种图表、未知输入、标签页与键盘、完整自动演示、朗读开关、许可证和 390px 无横向溢出。新截图与报告保存于 assets/verification-2026-10-12/，原有参考截图不覆盖。

引导图的源文件、public 副本与汇总产物 SHA-256 一致：8470fee498cc0329de0e3a7aa19a49b83212c3eac2c176e5c71ae4441971a1e2。
