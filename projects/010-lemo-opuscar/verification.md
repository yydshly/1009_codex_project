# Lemo-Opuscar 网页验证

日期：2026-10-09。Windows、Node.js v22.15.0、已有Playwright/Chromium；页面按正式Pages编号子路径访问。

## 已通过

- 静态数据：43种风格、9类、98个片段、完整STYLE与DEMO、来源commit、时间范围、图像和脚本语法。
- 浏览器：43项初始显示、分类、中文与用途搜索、空结果重置、时长筛选。
- 风格详情：原生对话框、完整风格规格、技术说明、选择风格后进入任务表单、ESC关闭与媒体资源释放。
- 导演与生产：45秒时间线、五个轨道切换。
- 长片索引：98项完整展示、10个年代、画风搜索、中文提示词展开。
- 任务：场景预设、画幅、声音、分镜、生成与真实剪贴板复制。Windows剪贴板的CRLF按平台差异归一化后比较。
- 所有141张风格与片段JPEG可在浏览器解码；本地资源无HTTP错误，浏览器无脚本异常。
- 1440px桌面与390px手机检查；主页、图鉴和手机详情没有页面横向溢出，截图已保存并目视检查。
- 中国水墨视频读取成功：48秒、1280×720、readyState=4，首帧可解码；未逐一完整观看43支影片。
- 所有43支样片及OPUSCAR 98共44个在线视频地址，HTTP HEAD均返回200、video/mp4、支持bytes范围读取。
- `npm run index:sync`、根`npm run check`和`npm run pages:build`通过，汇总站点含本项目index.html。两份工作流已加入本项目构建与检查。

证据：[浏览器记录](assets/browser-verification.json)、[44个媒体地址](assets/media-link-verification.json)、[实际截图](assets/README.md)。

## 观察到的限制

OPUSCAR 98视频约88.7MB，能解析391.424秒元数据。针对第93个片段“无依之地”，诊断时currentTime已设为276.25秒，但播放器处于seeking、目标帧尚未缓冲。45秒和90秒的目标画面等待均超时，不能将此记为成功播放跳转。

页面在加载、等待和跳转时给出缓冲状态，提供官方播放器及1080p源文件入口；文档与141张静帧仍在本地可读。实际远端播放速度取决于网络与上游服务。本次没有为绕过缓冲而复制远端视频。

## 未验证或未执行

- Agent从主题到MP4的完整制片、中文TTS、采样配乐、GPU渲染质量与速度。
- 作者30–60分钟制作时长和token成本。
- 所有43支样片的逐片完整观看与听评。
- Git推送和线上Pages发布。本次已完成本地构建与发布流程接入。

## 2026-10-10 内容补充验证

用户流程：阅读官方展示页定位与总库价值 → 选择首个验证任务 → 写入主题与风格 → 生成并复制任务描述。新增部分为浏览器本地交互，无模型服务、后台API或凭据依赖。

- 三类入口、四项价值正常显示；所有页内导航锚点有效。
- 新价值区按钮将离心泵主题和蓝图风格写入表单，输出45秒创作描述；实际剪贴板内容与页面一致。
- 43种风格仍在主页显示，选择全部年代后98个片段完整。
- 1440、1120、900、390px下无页面横向溢出，390px下新按钮可用。
- 本地资源无HTTP失败，浏览器无脚本异常；桌面与手机截图已目视检查。

证据：[补充交互记录](assets/context-verification.json)、[官方定位桌面截图](assets/official-guide.png)、[价值区桌面截图](assets/value.png)、[官方定位手机截图](assets/official-guide-mobile.png)、[价值区手机截图](assets/value-mobile.png)。首页preview.png已按新增导航更新。本次不重复远端视频播放检查，以上媒体限制继续适用。

本次网页构建、数据校验、根索引同步、总库检查与Pages汇总构建均通过；汇总站点包含010子路径和新增价值区。没有推送或线上发布。

## 2026-10-10 正文演示与本地原作画面

- 首屏和图鉴的真实水墨视频已实际播放：48秒、1280×720、连续解码至少12帧；不再需要弹窗观看。
- 43种选择器与卡片切换正文播放器，多个视频互斥，保留风格详情入口。长片和片段也改为正文播放器。
- 蓝图视频与OPUSCAR 98在两次检查中未能及时收到可播放帧；蓝图HEAD为200、video/mp4、8.2MB，但浏览器请求持续等待。15秒后显示缓冲较慢、重试与原视频入口，不能将这两项记录为播放通过。
- 为保证网页直接有可运行效果，导入固定版本蓝图样片的真实画面模块、台词时长数据和原作字体，保留MIT、CREDITS及每类字体OFL，使用本地iframe控制播放。原作画面模块未改动，预览合成视口960×540，最多12fps，无音轨。
- 阻断全部外部网络后，本地蓝图仍加载原作字体、自动播放、暂停、拖动至11秒、跳转到20秒；实际渲染帧内容不同，播放器状态和时间持续推进。
- 1440/1120/900/390px无横向溢出，手机画面和控件完整；减少动画偏好下不自动播放。本地资源无HTTP失败，浏览器无脚本异常。

证据：[正文视频检查](assets/inline-verification.json)、[远端复查](assets/inline-playback-recheck.json)、[本地画面检查](assets/live-demo-verification.json)、[真实蓝图截图](assets/live-demo.png)。原作导入依据和哈希见web/public/demos/blueprint/import-manifest.json；预览改动见同目录ADAPTATIONS.md。没有导入MP4或原作音轨，没有执行安装或完整制片导出流程。

## 2026-10-10 全量理解图与导出

用户流程：进入 `#overview` → 本地catalog与共用总结内容渲染全景图 → 查看风格或观看画面模块 → 将构建时生成的内嵌图片SVG绘制为PNG并下载。

- 5步电影元素创作链路、9类43个风格名称、3个电影案例、6项约束、6类场景、4项个人价值及5步交付完整呈现。名称与本地固定版本catalog逐项一致，下载图也包含全部名称。
- 总览内蓝图风格按钮进入已有真实规范弹层，试验按钮将离心泵主题和蓝图风格写入已有任务表单。
- 阻断外部网络后，图中原作蓝图代码可运行、暂停与切换阶段；暂停后的时间不变，两个阶段的实际画面哈希不同。减少动画偏好下不自动播放。
- PNG按钮实际触发下载，文件为1600×4219、约2.38MB；SVG为原生文字、图形与内嵌JPEG，无脚本、外部HTML和外部图片依赖，所有文字处于画布宽度内。
- 1440/1120/900/390px没有横向溢出，桌面完整图和390px手机界面已实际截图。脚本异常与本地HTTP失败均为空。
- 独立在线检查确认默认蓝图动画自动运行；点击图中水墨作品后，原生视频输出1280×720、readyState=4、连续12帧，同时蓝图暂停。玻璃产品与立体书的来源、海报和选择状态通过，未将这两项记为实际播放验证。
- 第一次导出检查发现一个风格名称被跨行拆开，调整为按完整名称排布并扩大分类区域；重新验证通过。动态网页与下载图共用总结内容，但下载图用真实静帧替代播放器。

证据：[完整图检查](assets/overview-verification.json)、[独立媒体检查](assets/overview-media-verification.json)、[网页实际截图](assets/overview-page.png)、[PNG下载文件](assets/understanding-overview.png)、[SVG](assets/understanding-overview.svg)。本轮未执行新题材制片和音轨导出；个人价值与场景为资料基础上的应用建议。

## 重跑全景图

```sh
node projects/010-lemo-opuscar/scripts/verify-overview.mjs
```

需要先启动本地服务，并使用LEMO_PLAYWRIGHT_PATH指向环境已有Playwright目录。全景图检查阻断外部网络，上游完整视频的播放由独立媒体检查记录。

## 重跑原有页面

```sh
npm run build --prefix projects/010-lemo-opuscar/web
npm run check --prefix projects/010-lemo-opuscar/web
npm run dev --prefix projects/010-lemo-opuscar/web
```

本地服务启动后，用已有Playwright运行`scripts/verify-browser.mjs`；需要时设置`LEMO_PLAYWRIGHT_PATH`。`scripts/verify-media-links.mjs`仅检查远端头部，不保存视频文件。

## 2026-10-12 全面整理与发布前验证

用户流程：原始引导图入口 → 能力、模块、原理、场景、价值和扩展说明 → 展开原图/交互版 → 本地原作画面与规范 → 原始PNG/SVG保存。全面说明使用research-guide.json，来源仍固定于a75e2b3。

| 环节 | 结果与证据 |
| --- | --- |
| 页面到本地数据 | 六类能力、八类模块、六项原理、八个扩展及实现/验证条件全部呈现，日期2026-10-12 |
| 原始引导图 | PNG/SVG均HTTP200，图片1600×4219，原始SHA-256一致；展开/收起有效 |
| 动画与资料 | 阻断外部网络时蓝图资源就绪、播放推进、暂停有效；交互版43种风格及完整蓝图规范可打开 |
| 手机与脚本 | 1440/1120/900/390px无横向溢出，脚本异常与本站HTTP失败均为空 |
| 构建与索引 | 010构建/检查、总库index:sync/check和pages:build通过；引导图按字节复制，许可证和原作模块哈希保留 |

证据：[本地流程](assets/publication-local-verification.json)、[引导图入口](assets/publication-local-guide.png)、[模块说明](assets/publication-local-modules.png)、[手机网页](assets/publication-local-mobile.png)。此检查不将外部视频全量播放、新题材Agent制片、TTS和音轨合成记为通过。

发布在独立Git工作区从最新origin/main进行，只纳入010源码、该项目元数据、生成索引和两个工作流的010构建步骤。远端其他已发布项目保留，本地其他未提交项目没有纳入此次提交。项目内assets/upstream是保留的研究图像与许可证，使用项目级.gitignore例外纳入；可选的上游克隆继续忽略。

复核命令：`node projects/010-lemo-opuscar/scripts/verify-publication.mjs`。通过LEMO_PREVIEW_URL选择本地或公开地址，LEMO_PLAYWRIGHT_PATH指向已有Playwright。此脚本不覆盖原始引导图。

## 2026-10-12 GitHub Pages部署与公开地址复核

- 内容提交：[8feb92c](https://github.com/yydshly/1009_codex_project/commit/8feb92c716a04fc54714aeb0a5d6313499e94bf7)。包含330个文件，只发布010及必要的索引与构建接入。
- [远端校验38260074109](https://github.com/yydshly/1009_codex_project/actions/runs/38260074109)成功；[Pages构建与部署38260107208](https://github.com/yydshly/1009_codex_project/actions/runs/38260107208)的build/deploy均成功，部署对应上述内容提交。
- 公开地址：[完整网页与引导图](https://yydshly.github.io/1009_codex_project/010-lemo-opuscar/#guide)。总库首页HTTP200，010入口及全面摘要存在；首页预览previews/010-lemo-opuscar.png的SHA-256与原始PNG一致。
- 公开页面实际浏览器复核通过：六类能力、八类模块、六项原理、八项扩展完整呈现；原始PNG/SVG均HTTP200、字节和哈希不变，原图展开/收起有效。
- 阻断外部网络后，公开页面上的原作蓝图代码仍可加载、播放推进和暂停；43种风格交互入口及完整蓝图规范正常。这里验证的是随页面部署的画面代码，不将全部远端视频实际播放记为通过。
- 1440/1120/900/390px均无横向溢出，脚本异常和本站HTTP失败均为空。首次公开导航在30秒默认等待内超时，独立访问确认HTTP200并成功加载；将检查导航预算改为60秒后完整复核通过。

证据：[线上检查](assets/publication-public-verification.json)、[原图入口](assets/publication-public-guide.png)、[模块说明](assets/publication-public-modules.png)、[手机网页](assets/publication-public-mobile.png)。网页已部署，Agent新题材制片、TTS及音轨合成的边界仍沿用前述记录。
