# 002 · Dioramas 研究记录

## 研究目标与结论

说明能力、底层原理、已有效果、使用场景、扩展方向和可复用技术；用真实需求做一个可操作扩展示例。

Dioramas 将素材流水线、实时渲染封装与交互案例组合起来。核心可迁移价值是将已有素材通过算法、状态控制、镜头与内容组织成完整作品。生成算法来自外部服务，图形基础大量使用成熟库；自定义渲染与交互仍有明确工程价值。

## 基线与环境

| 项目 | 记录 |
| --- | --- |
| 原仓库 | https://github.com/blendi-remade/dioramas |
| commit | 868539fb5b64a843071a2247d5d8bacb706a07b1 |
| 上游提交时间 | 2026-09-30 00:07:49 UTC |
| 研究日期 | 2026-10-09，Asia/Shanghai |
| 本地环境 | Windows / PowerShell；Node.js 22.15.0；npm 10.9.2 |
| 上游技术 | Three.js r186、postprocessing、N8AO、GSAP、Lenis、Rapier、Vite |
| 上游代码许可 | MIT，Copyright (c) 2026 Blendi |
| 上游素材许可 | CC BY 4.0；署名格式见 ASSET-LICENSES.md |
| 本地依赖 | Three.js 0.186.1、Vite 8.3.4；精确版本由 package-lock.json 锁定 |
| 引入范围 | 文档与源码阅读；20 张原样上游案例截图；未复制引擎、案例代码或模型 |
| 用户约束 | 不下载大文件，不下载模型；未克隆上游仓库，未调用生成 API |

## 证据等级

1. 源码观察：检查生成、优化、共享渲染、资源加载、构建配置和截图工具，以及 koi、horologie、sucre 的页面主代码。
2. 仓库描述：20 个案例的特色交互来自 README。检查主代码不等于审计每个辅助模块。
3. 本地验证：对独立编写的离心泵场景进行浏览器、移动布局与静态构建验证。
4. 研究判断：适用场景、迁移方式与扩展方向为分析结论。

没有运行上游 20 个网站，没有实测其帧率，没有复现外部 AI 生成过程。

## 底层原理与关键证据

制作阶段：文字 brief → 生图服务 → 白底参考图 → 图转 3D → 原始 GLB → 优化模型与贴图。

访问阶段：加载模型 → 设置材质与灯光 → 浏览器帧循环 → 用户输入更新状态 → 镜头 / 物体 / 效果变化 → HTML 内容同步。

### 素材生产与优化

[scripts/gen.mjs](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/scripts/gen.mjs) 调用 fal-ai/nano-banana-2 和 meshy/v7.1/image-to-3d，也支持多图转 3D。脚本规范参考图背景、面数、对称性与 PBR 参数。Meshy 请求 ID 写入 manifest 后轮询，可恢复已提交网格任务。图片路径与网格任务的持久化方式不同，不能笼统宣称所有请求具有相同恢复保证。

[scripts/optimize.mjs](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/scripts/optimize.mjs) 使用 glTF Transform 去重、焊接、可选简化、量化、meshopt 和 WebP。默认贴图尺寸 2048。文件压缩降低传输成本，不能直接推导运行时显存和帧率。

### 共享渲染与网页

[src/core/engine.js](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/src/core/engine.js) 封装 WebGLRenderer、镜头、resize、帧循环与后期。HalfFloat HDR 缓冲中组合环境遮蔽和辉光，再进行色调映射；色差使用独立 pass。normalize / prepModel 处理模型尺寸、落地、阴影和材质。

[src/core/assets.js](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/src/core/assets.js) 使用 GLTFLoader、MeshoptDecoder 等，并提供表面采样。可加载已有合法 GLB，素材来源不限定为 AI。

[docs/ENGINE.md](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/docs/ENGINE.md) 介绍自定义平面反射、体积光、程序纹理、滚动、输入与页面结构。本次没有逐行审计全部着色器。固定 canvas 承载场景，HTML 负责章节、文字与按钮。

### 场景控制与具体交互

[horologie/main.js](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/examples/horologie/main.js) 包含镜头、分解比例、姿态、景深等关键状态与插值，并调用 buildMovement。展开需要分件结构与控制，不能假定任意整体网格能自动拆解。

[koi/main.js](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/examples/koi/main.js) 调用 RippleSim、鱼群与场景模块，将输入映射为水面命中和喂鱼行为，还包含水下渲染与反射。

[sucre/main.js](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/examples/sucre/main.js) 组合产品、拾取、镜头、音效与糕点行为模块。物理能力依赖辅助代码和第三方库，生成模型只提供素材。

## 上游已有 20 个案例

| 案例 | README 描述的特色交互 |
| --- | --- |
| Reliquary | 提灯探索博物馆，拍摄文物使其亮起 |
| Abyssal | 滚动下潜，控制探照灯 |
| Hammer & Ember | 加热刀刃，点击产生火花 |
| Bell & Moss | 擦掉玻璃凝结水 |
| Still Water | 涟漪与喂鱼 |
| Florae | 粒子花朵变形、散开 |
| Velocity Lab | X 光 / 热成像 / CAD 风格观察 |
| Hangar Nine | 长按启动机甲 |
| Maison Sucre | 糕点物理互动 |
| Monolith | 拖动太阳改变光照 |
| Low Frequency | 唱片与合成音频 |
| Gambit | 滚动重演棋局，然后自由下棋 |
| Atlas of Drifting Isles | 浮岛之间飞行 |
| Lithos | 长按打开晶洞 |
| Artemis | 滚动驱动骨骼宇航员行走 |
| The Keeper | 控制风暴中的灯塔光束 |
| Kōen | 盆景四季变化 |
| Nocturne | 香水瓶与晃动液体 |
| Nightshift Motor Co. | 雨中摩托车加速表现 |
| Aurel Horologie | 展开手表机芯 |

依据：[README](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/README.md)。Web 提供全部 20 张上游截图、分类、页面内放大与每个案例的源码链接。上游图片明确标注来源，不充当本地运行上游的证据。

## 使用场景与复用

适合围绕视觉体验组织内容的品牌产品、展览、艺术专题、活动和设备认知。表格后台、快速检索、低性能设备优先的流程，收益可能较少。实际采用需评估资产、交互目的、加载速度与文字可读性。

| 可迁移技术 | 上游位置 | 本次采用 |
| --- | --- | --- |
| 加载 / 规范化 | core/assets.js、engine.js | 程序几何替代文件 |
| PBR / 环境光 | core/engine.js | 独立实现 |
| 阴影 / 后期 | core/engine.js | 阴影、ACES；未加入 AO / 辉光 |
| 平面反射 | core/reflector.js、ENGINE.md | 未加入 |
| 体积光 / 程序纹理 | volumetric.js、textures.js、ENGINE.md | 未加入 |
| 输入 / 射线拾取 | core/input.js、案例主代码 | 独立实现 |
| 状态插值 | horologie/main.js | 按钮与滑块驱动的独立实现 |
| 动态模拟 | koi/main.js | 仅路径粒子示意，无流体求解 |
| 截图评审 | scripts/review.mjs | 本地浏览器验证 |

特定效果可能需要抽取案例逻辑、补充结构资产并调整参数。直接复用代码时保留上游 MIT 版权和 LICENSE；素材遵守 CC BY 4.0。

## 真实场景扩展：供水泵售前与部件认知

### 真实需求与边界

供应商向客户介绍工厂供水泵，培训人员识别电机、联轴器、机械密封、叶轮、泵腔和进水口。界面需要展示整机、探索结构、说明流向并重置。

本实验用代码生成教学结构，无厂商、型号或尺寸。复杂蜗壳简化为圆形腔；机械密封仅表示位置；联轴器罩省略以便观察。不是检修操作指引，不计算流场、流量、扬程、应力或实际转速。

部件用途依据：
[KSB Impeller](https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/impeller-1116078)、
[KSB Pump casing](https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/pump-casing-1118596)、
[KSB Mechanical seal](https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/mechanical-seal-1117958)。

没有复制其图片、产品模型或大段原文，示意不代表 KSB 产品。

### 实现映射

| 层 | 本地实现 | 参考思路 |
| --- | --- | --- |
| 素材 | scene.js 的分组、圆柱、环、曲线叶片 | 保留独立部件 ID |
| 视觉 | PBR、RoomEnvironment、方向光、阴影、ACES | 材质与灯光组合 |
| 输入 | OrbitControls、Raycaster、按钮 | 命中映射到说明 |
| 状态 | explode、shell、flow、selected、cameraGoal | 关键状态与镜头插值 |
| 讲解 | content.js 部件 ID 与文案 | HTML 与 3D 对应 |
| 动态 | CatmullRomCurve3 + InstancedMesh | 路径粒子表达流向 |

展开位置 = 装配位置 + 展开方向 × 展开比例。

指数阻尼 = 当前值 + 差值 × (1 − exp(−8dt))。流向模式自动回到装配状态并开启透视，以免展开结构与连续流路混用。粒子沿预设曲线运动，不解算流体方程。

减少运动偏好下暂停叶轮与粒子连续运动；离开视口或页面隐藏时跳过绘制；WebGL 初始化失败时正文与部件说明仍可阅读。选择按钮提供触摸和键盘等效操作。

原作品采用滚动叙事。本次改为“产品展示 → 结构展开 → 流向讲解”的明确按钮与滑块，便于客户演示。

### 可扩展方向

1. 用授权分件 GLB 替换程序几何，保留 ID、装配位置、展开方向与内容映射；整体网格先分件。
2. 增加热点锚点、镜头关键帧与配置校验，把场景抽成 SceneConfig。
3. 添加经过专业审核的识别题、步骤检查与学习记录；实际设备数据由独立服务提供。
4. 用目标手机、笔记本实测，加入贴图 / 面数分级与静态替代视图。

以上为后续设想，尚未实现。

## 实验与验证

独立构建成功，资源使用相对路径，适合编号子目录。首轮浏览器真实渲染无 pageerror、无水平溢出，初始场景约 52,376 个三角形、140 次绘制调用；这只描述本地简化场景，不推断上游帧率。

最终交互、移动、无模型请求与静态子路径检查记录见 [assets/verification.json](assets/verification.json)。预览、展开、流向和移动截图均由本地浏览器生成。

根 index:sync、check、pages:build 用于验证元数据、索引与站点汇总。Pages 与 validate 工作流已加入独立构建步骤；初版未部署，2026-10-12 发布与线上验证见 deployment.md。

## 后续研究

- 深入分析反射、体积光、水面着色器和 GPU 成本。
- 验证不同授权资产如何迁移场景控制层。
- 在真实低性能设备上测试性能、输入和替代视图。
- 用真实分件模型验证结构，由专业人员审核说明。
- 线上部署已于 2026-10-12 完成，后续维护时按工作流重新构建、部署并验证关键交互。

## 补充实验：直接呈现已有效果

用户希望在网页中直接看到已有作品。沿 public/img/index 发现 20 张 WebP；scripts/thumbs.mjs 说明该目录由浏览器捕获各案例画面并输出为 1280 × 800 的图库图片。

引入范围限定为这 20 张截图：单张 50,048–181,244 字节，总量 1,791,330 字节。下载脚本限制单文件 200 KiB，验证 WebP 魔数、实际字节数和 Git blob SHA-1；没有下载模型、大文件、视频或仓库。图片未修改，许可依据 ASSET-LICENSES.md，为 CC BY 4.0。图源、固定提交与哈希记录在 assets/upstream-gallery/manifest.json，页面和放大视图都署名。

Vite 从 assets/upstream-gallery 导入图片，生产构建生成相对子路径资源。卡片懒加载；点击进入原生 dialog，支持前后切换、左右方向键、Escape 关闭与焦点返回；移动端使用同一图览。

图片能展示原作品的静态画面，不能演示水波、拖动、长按等原有行为。完整 3D 交互需要上游模型，在用户约束下未加载。离心泵实验仍提供本地真实交互。

检查结果见 assets/gallery-verification.json，实际图览截图为 assets/gallery-desktop.png、assets/gallery-mobile.png 和 assets/gallery-detail.png。

## 补充理解：从模型素材到最终作品

用户希望把对话中形成的理解完整补进网页，用一张图解释制作、设计、接入和最终呈现。新增 #understanding 与 assets/understanding-map.svg / .png。图为本次研究原创整理，不是上游官方架构图。

### 完整链路与职责

1. 需求与设计目标：明确产品、品牌或展览主题，以及对象、风格、叙事与内容。
2. 外部生图服务：Nano Banana 2 经 fal 生成参考图，也可生成额外 2D 素材。生成算法属于外部服务。
3. 外部图转 3D 服务：Meshy 7.1 经 fal 把单图或多图转换为 GLB 与 PBR 贴图；部分角色资产另有骨骼与动画处理。
4. Dioramas 素材工程：开发脚本组织参数、任务与结果记录；Meshy 请求 ID 在轮询前持久化。优化脚本执行去重、焊接、可选减面、量化、meshopt 与 WebP 压缩。
5. 场景和网页设计：设计构图、材质、灯光、镜头、章节、交互规则、文案和排版，并编写代码。素材生成脚本没有完成这些工作。
6. 共享引擎：在 Three.js 与成熟库上组织相机、帧循环、尺寸适配、资源、后期、输入、滚动与通用界面；部分效果为项目自定义实现。
7. 场景代码与 HTML / CSS：定义各作品的差异、状态与反馈；按需接入着色器、粒子、物理、音频、骨骼或游戏规则。
8. 浏览器运行：用户输入更新状态，逐帧改变镜头、物体和效果参数；WebGL / GPU 绘制，HTML 更新内容。成品通常直接读取已有资产，常规访问无需再次生成素材。
9. 截图、测试与迭代：检查关键状态、移动布局、输入、报错与运行信息；设计评审反馈到素材与实现，得到完整网页。

图中的“最终作品 = 设计目标 + 可用素材 + 共享引擎 + 场景代码 + HTML 内容 + 测试迭代”为概念汇总，不是自动生成保证。图转 3D 只是素材来源之一；已有合法素材、CAD 导出或程序几何，也能接入后续链路。共享引擎是可复用的运行基础，具体页面规则和布局仍由作品代码实现。

### 共享引擎的复用边界

| 模块 | 已有职责 | 场景还需提供 |
| --- | --- | --- |
| engine.js / assets.js | 渲染循环、相机、尺寸适配、环境与后期、资源加载与表面采样 | 素材、主题参数、构图、镜头与更新逻辑 |
| input.js / scroll.js | 指针状态与平滑值；Lenis / GSAP、滚动进度与文字显现 | 输入到具体状态的映射、触发条件与章节编排 |
| ui.js | 加载、光标、磁吸按钮与案例导航 | 页面内容、排版、交互提示与反馈 |
| reflector.js / volumetric.js / textures.js | 平面反射、体积光与 GPU 程序纹理 | 接入场景、选材、参数与性能适配 |
| examples/<slug>/* | 作品专属视觉、控制、音频、物理或规则组合 | 迁移时抽取实现并调整素材与需求 |

机甲蓄力的文字示例用来说明职责：Pointer 提供按下状态；案例逻辑累计蓄力并定义速度、上限与释放行为；参数改变材质、灯光、粒子和动画；引擎持续绘制。它是职责解释，没有在本地复现该案例。

### 开发工具的职责

gen：调用外部服务生产素材；optimize / optimize-all：优化与批处理；shot：指定状态截图与运行信息；review：桌面多状态、手机截图与汇总；contact：拼接评审图；thumbs：捕获图库画面。截图工具提供证据，审美与完整性需要进一步评审。工具中的端口、路径和 Chrome / GPU 参数需要按目标环境适配。

依据为固定提交的 [ENGINE.md](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/docs/ENGINE.md)、[gen.mjs](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/scripts/gen.mjs)、[optimize.mjs](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/scripts/optimize.mjs)、[shot.mjs](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/scripts/shot.mjs)、[review.mjs](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/scripts/review.mjs)、[thumbs.mjs](https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/scripts/thumbs.mjs) 与前文案例代码。本次重新核对上述文本，没有运行生成任务或下载模型。

### 图与网页呈现

SVG 使用可编辑文字、分阶段底色与流程箭头，1600 × 1940；同尺寸 PNG 由本地 Chromium 渲染生成。网页显示 SVG，提供 PNG 大图及两种格式下载，通过 Vite 导入到相对资源路径。正文提供相同职责的文字说明，小屏布局单列，无需在缩小的图上阅读全部文字。

验证记录在 assets/understanding-verification.json；网页实际截图为 assets/understanding-desktop.png 与 understanding-mobile.png。验证包含图片与下载、移动布局、共享引擎与工具内容、原有图览及泵交互，以及生产子路径资源。

## 2026-10-12 完整整理与发布

用户要求汇总完整理解、全面摘要、沿用原引导图，并提交到远端与部署。保留固定提交 868539fb5b64a843071a2247d5d8bacb706a07b1，本轮聚焦研究整理与发布，不将该快照描述为上游当前版本。

### 整理结果

- projects.json 的 002 条目改为完整摘要，并加入定位、能力、模块、原理、效果与证据、场景、价值、扩展和边界九个 summarySections。网页 research-summary.json 保留同一份文本，根索引由脚本生成。
- 原 understanding-map.svg / PNG 原样保留，作为网页引导图与总库预览；正文进一步解释生成素材和实时渲染、外部服务和项目代码的职责。
- 增加 9 文件核心模块地图，分别列明已有职责和场景仍需配置的工作；保留 7 项开发工具与案例实现的边界。
- 补充六方面价值、迁移条件与采用建议。价值为研究判断，没有据此验证营销效果或生产效率。
- 扩展方向细化为资产与语义、SceneConfig、特效模块、教学任务、设备分级、质量台账；每项提供验收标准，均为未来建议。
- 网页调整为总览、能力模块、原理、效果、场景、价值复用、泵实验、扩展、证据；泵模型独立工厂和部件说明随本项目发布。

### 原图保留证据

| 文件 | SHA-256 |
| --- | --- |
| understanding-map.svg | 3ecc3ba2463c5b546afa7e3b08b02605ba1477d65cb6a32bfacef4df3357e07e |
| understanding-map.png | 8cd319155ed9f65cb979fe63737042b04434f83fd52f56c0fc6dad1797e755c8 |

上述哈希在整理前记录，构建与发布后再次对照。没有重绘或裁改原图，没有下载上游模型、大文件或调用生成服务。

### 验证与提交范围

网页属于纯静态研究页面，流程为访问编号子路径 → 加载本地构建资源和原图 → 查看九维摘要、模块和效果 → 操作泵实验。无业务 API、数据库或模型服务调用。新一轮验证记录在 assets/publish-verification.json，发布状态与线上地址记录在 deployment.md。

仓库同时存在其他未提交研究项目。本轮在独立发布工作树中，只纳入 002 文件、对应 projects.json 条目、脚本生成的根 README 和两个工作流中的 Dioramas 构建步骤，保留既有线上项目。其他未完成内容保留在原工作区，不纳入本次提交。

### 发布完成证据

发布提交为 48514682e0034eebef1e77449779ab964ea77e2f；GitHub Pages 运行 38221250281 与校验运行 38221232224 均成功。在线网址为 https://yydshly.github.io/1009_codex_project/002-dioramas/。本地生产子路径 34 项、公开网页 33 项检查通过，原图哈希一致，无模型请求。实际证据、截图和性能限制见 deployment.md 与 assets/published-verification.json。没有下载模型、大文件或调用生成服务。

### 三维泵作为可复用内容（2026-10-10）

为接入 015 的既有展台，将原 scene.js 的程序几何、六部件分组、透明 / 展开 / 流向动画提取为 web/pump-model.js；部件描述为 web/pump-parts.js。原 002 页面现在也调用同一个工厂，保留原有操作。工厂注入宿主 Three，不创建渲染器；015 使用自己的 Three 版本，把模型挂到舞台插槽，把讲解映射到已有屏幕。该复用不增加 Dioramas 上游素材，来源与许可证结论不变。
