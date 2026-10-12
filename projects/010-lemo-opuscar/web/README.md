# Lemo-Opuscar 中文研究网页

Node.js 22+标准库负责构建和HTTP预览，原生HTML/CSS/JS实现，无npm依赖。

[线上完整研究网页](https://yydshly.github.io/1009_codex_project/010-lemo-opuscar/)。本轮沿用完整原始引导图，PNG/SVG由构建按字节复制到 `dist/assets/guide/`；能力、模块、原理与扩展说明读取 `data/research-guide.json`。

```sh
npm run build --prefix projects/010-lemo-opuscar/web
npm run check --prefix projects/010-lemo-opuscar/web
npm run dev --prefix projects/010-lemo-opuscar/web
```

打开 http://127.0.0.1:4320/1009_codex_project/010-lemo-opuscar/ 。通过HTTP读取数据，不使用file://直接打开。

## 结构与行为

- public/：本地编写的页面、样式和交互。
- public/guide.js、guide.css：原图展开/收起、6类能力、8类模块、6项原理、8项扩展及实现/验证条件。
- data/research-guide.json：2026-10-12全面理解、来源基线、摘要与分项说明。
- public/screening.js：首屏、图鉴与长片正文播放器，静音自动播放、风格切换、片段定位、加载状态与重试。
- public/live-demo.js：本地蓝图画面播放、暂停、时间拖动与阶段按钮。
- public/demos/blueprint/：上游蓝图样片的真实画面模块、数据、字体与许可证；本地新增iframe预览控制。保持原作绘制坐标，以960×540视口合成、最多12fps预览，无音轨且无需外部网络。
- data/catalog.json：43种风格、完整规格、技术说明、固定来源、视频地址。
- data/opuscar98.json：98个长片片段。
- ../assets/upstream/：固定版本静帧、海报与LICENSE。
- scripts/build.mjs：生成被忽略的dist，构建时无需网络。
- scripts/check.mjs：校验43/98项、类别、来源、时间范围、规格、图像与语法。
- scripts/serve.mjs：4320端口，适配Pages编号子路径。

首屏水墨样片在可见时静音自动播放，四个缩略图切换首屏播放器。图鉴中的43项选择器、卡片图片和“页内播放”按钮在正文播放器播放对应视频；该播放器首次进入视野时静音播放所选样片。多个视频互斥播放，声音由原生控件开启。减少动画偏好下不自动开始。

43种风格支持分类、中英文名称/故事/用途搜索及60秒筛选。原生dialog保留完整文档与视频，ESC或关闭释放弹窗资源。OPUSCAR 98使用正文播放器，支持年代与文字搜索，点击在长片中跳转；后续播放继续到下个片段。导演时间线、制作轨道可点击阅读。

场景预设和任务表单生成文本，支持剪贴板复制；权限不可用时选中文本手动复制。文字、图片、数据本地读取，视频联网。支持手机、键盘和减少动画偏好。

理解区补充官方展示页、仓库制片工具与本地研究页的分工。场景区列出输入材料；“对我们的意义”区说明项目解释、审美规范、可修改工程与制作路线评估，并以尚未制片的45秒离心泵任务作为验证建议。区内按钮复用现有预设，将主题与蓝图风格写入任务表单。

`#overview` 是本轮讨论的连续全景图：5步电影元素创作链路、9类43种完整风格、6项约束、作品模块、6类场景、4项个人价值和交付流程。蓝图iframe在进入视野时运行，离开暂停；减少动画偏好不自动播放。其画面静音，上游有声样片由原生video播放。43个风格按钮复用完整规范弹层，案例复用98片段播放器，试验复用任务预设。

入口以 `#guide` 的原始引导图开始，随后按能力、模块、原理阅读。交互版全景图默认折叠，展开后才进入其中的本地动画与规范按钮；独立实时演示和完整图鉴仍可直接访问。新章节与扩展建议都有证据或实现条件，表单继续只整理任务文本。

`public/overview-content.js` 是网页与导出图共用的总结内容；名称和分类来自固定版本catalog。`scripts/overview-svg.mjs`在构建时生成 `dist/lemo-opuscar-overview.svg`，作品JPEG以data URI内嵌，可离线保存。网页将SVG绘制到canvas后下载1600px宽完整PNG，静态版本用真实作品静帧表示动画。`../scripts/verify-overview.mjs`检查此流程，可复用LEMO_PLAYWRIGHT_PATH与LEMO_PREVIEW_URL配置。

## 验证与发布

../scripts/verify-browser.mjs使用环境已有Playwright，可设置LEMO_PLAYWRIGHT_PATH指向包目录，或使用可解析的本地安装。在运行中的预览页检查用户流程，结果与截图保存在../assets/。

projects.json的pagesDir为web/dist，Pages与校验工作流均运行本项目构建与检查。根目录执行：

```sh
npm run index:sync
npm run check
npm run pages:build
```

目标路径/1009_codex_project/010-lemo-opuscar/。本次完成本地网页和发布构建接入。
