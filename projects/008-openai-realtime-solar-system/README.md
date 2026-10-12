# 008 · Realtime Solar System：实时语音、工具调用与 3D 场景联动研究

OpenAI 的实时语音与 3D 网页工程集成示例：用户提问后，Realtime API 生成语音回答并选择预设工具，前端执行 Spline 对象聚焦、卫星、轨道、镜头复位、图表或 ISS 查询。它提供从会话连接、工具定义到场景适配的参考；底层语音模型和渲染来自外部，算法研究深度有限。

本研究完整梳理能力、七组模块、执行机制、可见效果、适用场景、对已有项目的价值、投入条件和六类扩展方向。保留本次对话生成的中文汇总图作为引导，配合独立 Three.js 交互示意和固定源码依据。网页不调用真实 Realtime，扩展建议与收益尚待开发验证。

[返回总索引](../../README.md#有序索引) · [研究记录](research.md) · [原仓库](https://github.com/openai/openai-realtime-solar-system) · [Web 运行说明](web/README.md)

![Realtime Solar System 中文理解汇总：效果、能力、原理、扩展场景、个人价值与能力边界](assets/overview-infographic.png)

*内置 imagegen 生成的研究说明图，参考上游自带截图和本地交互截图。图中效果区域为图像生成后的参考展示，不作为未经修改的原生界面证据；扩展场景需要新增开发，语音体验尚未实测。*

[高清汇总图](assets/overview-infographic.png) · [完整生成提示词](assets/overview-prompt.txt) · [本地演示原始截图](assets/preview.png)

本地演示原始截图中的文字指令使用关键词规则，朗读使用浏览器系统语音，不代表模型响应速度或音质。

## 展示内容

- 交互太阳系：点选六类指令，观察镜头、卫星、图表和 ISS 示意对象变化。
- 工具调用：同步显示工具名称、参数与执行结果；支持文字输入和六步自动演示。
- 能力与边界：语音会话、六个工具，上游与本页的对照，以及数据、动画与反馈限制。
- 模块与原理：七组模块、源码入口、完整七步执行链路和前后端分工。
- 场景与价值：设备教学、社区导览、产品结构和研究总库导览，说明可复用部分、所需开发、个人价值、投入条件与验证方式。
- 扩展方向：真实语音小实验、执行反馈、可信资料、通用场景接口、实时数据和任务评测，按建议顺序推进。
- 上游对照：原仓库自带截图、固定提交的源码依据、完整 MIT 许可证。

本页不调用模型、不访问麦克风、无需密钥。扩展方案是开发建议，尚未实现为真实语音应用。

## 能力与边界

| 上游工具 | 能力 | 边界 |
| --- | --- | --- |
| focus_planet | 聚焦天体 | 需要对应动画；README 未列出金星、天王星聚焦效果 |
| display_data | 饼图、柱状图 | 数值由模型传入，无自动事实核验 |
| show_moons | 显示卫星 | 木星四颗伽利略卫星、冥王星五颗卫星 |
| show_orbit | 切到轨道俯视镜头 | 预设动画，不包含天文历表计算 |
| get_iss_position | 查询 ISS 经纬度并播报 | 场景触发预设动画，没有按经纬度定位 |
| reset_camera | 镜头复位 | 在预先配置的事件范围内执行 |

上游没有实现任意场景理解、3D 生成、物理模拟或视觉反馈闭环。语音理解来自 OpenAI，3D 渲染与预设动画来自 Spline，仓库主要实现连接与调度。

上游默认返回工具成功，没有确认动画完成；响应处理使用 `find` 只取首个工具调用。可靠的复杂任务还需要参数验证、多调用调度、取消和真实执行反馈。

## 模块与原理

| 模块 | 源码入口 | 职责 |
| --- | --- | --- |
| 短期凭据 | `app/api/session/route.ts` | 服务器持有正式 Key 并签发短期凭据，固定配置有效期 600 秒 |
| 实时会话 | `components/app.tsx` | WebRTC / SDP、音频、数据通道、状态和工具结果回传 |
| 工具与提示词 | `lib/config.ts`、`lib/constants.ts` | 动作范围、参数、角色说明、模型与声音 |
| 场景适配 | `components/scene.tsx` | 参数到 Spline 对象与预制事件的映射 |
| 图表组件 | `lib/components-mapping.tsx`、`components/charts/` | 模型传值到饼图 / 柱状图 |
| 外部数据 | `app/api/iss/route.ts` | 查询 ISS 经纬度；三维位置映射未实现 |
| 控制与日志 | `components/controls.tsx`、`components/logs.tsx` | 会话、麦克风开关和事件观察 |

建立连接 → `session.update` 注册工具 → 模型理解语音 → `response.done` 获取名称与 JSON 参数 → 前端执行事件 / 图表 / 查询 → 按 `call_id` 回传 `function_call_output` → 继续回答或结束释放资源。工具定义限制动作范围，场景与动画仍需预制；回传成功不自动形成视觉验收闭环。

## 对你的价值与可扩展方向

已有 Dioramas、Dvor 或其他 3D 页面时，可以借鉴本库补上自然语言操作入口。适合对象明确、动作有限、解释与画面一起变化的教学、培训、售前与导览；普通网页组件也可使用同一工具调用模式。

如果目标是研究新算法、自动建模或工业仿真，本库优先级较低。资产与动画、领域资料、服务器、API 和数据维护都需要投入。语音是否更方便应对比按钮操作，记录任务完成率、时间、纠错、延迟与成本；本次没有证明学习收益或商业转化。

建议先在一个已有场景接通对象聚焦、动画播放、可信图表三个动作，再增加参数验证、执行反馈与多调用调度，接可信资料和引用，抽取 Spline / Three.js / 普通网页通用操作接口，加入真实坐标或设备数据驱动画面，最后进行设备和真实任务评测。这些是开发方向，尚未实现。

## 基线与环境

| 项目 | 信息 |
| --- | --- |
| 上游提交 | [18025b656a5c7a5e9f52dddfe3981da808ae30bb](https://github.com/openai/openai-realtime-solar-system/commit/18025b656a5c7a5e9f52dddfe3981da808ae30bb) |
| 提交日期 / 研究 / 整理日期 | 2026-03-04 / 2026-10-09 / 2026-10-12 |
| 上游配置 | Next.js 15、React 19、Spline；gpt-realtime-1.5、coral 声音 |
| 本页环境 | Windows、PowerShell、Node.js 22.15.0、Vite 6.4.3、Three.js 0.180.0 |
| 上游许可 | MIT，Copyright (c) 2025 OpenAI；[完整许可](LICENSE.upstream) |
| 验证范围 | 本页构建、浏览器交互、移动布局和 Pages 子路径；未接通上游语音 |

来源和 Three.js 许可见 [第三方说明](web/THIRD_PARTY_NOTICES.md)。本页地球图表采用固定近似数据：海洋约 71%、陆地约 29%，海洋面积依据 [NASA Earth Facts](https://science.nasa.gov/earth/facts/#surface)。ISS 坐标、纹理、尺寸与轨道明确标为示意。

## 运行与发布

在 web/ 执行 npm ci 和 npm run dev，打开 http://127.0.0.1:5198/ 。执行 npm run build 后，以 npm run preview 打开 http://127.0.0.1:5199/ 。

根元数据的 pagesDir 为 web/dist，两个工作流已添加本项目安装、检查与构建。根目录执行 npm run index:sync、npm run check、npm run pages:build。

网页发布地址：[008 · Realtime Solar System](https://yydshly.github.io/1009_codex_project/008-openai-realtime-solar-system/)。部署与公开页面验证结果记录于 research.md。

真实语音扩展需要另行部署服务器签发短期凭据，正式 API Key 仅存于服务器。静态 Pages 不能直接承载上游会话接口。
