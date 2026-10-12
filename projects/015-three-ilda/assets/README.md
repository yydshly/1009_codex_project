# 图片与验证证据

本次网页整理沿用 `research-overview.png` / `research-overview.svg` 作为引导图，保持原始字节与 2026-10-10 日期。1920 × 3780 中文总览含实际光之花和 v4 展台截图、三层分工、已实现成果、16 类 / 64 项待验证方向；是本项目理解图，非上游官方架构图。生成源为 `web/scripts/generate-overview.mjs`；`research-overview-browser.jpg` 和 `research-overview-validation.json` 记录原图显示与交付，`research-overview-page.jpg` 是当时页面视口截图。

`stage-entry-exhibit.jpg` 是 v4 三岛展台的真实封面；`pump-tour-impeller.jpg` 是自动结构介绍中叶轮章节；`pump-tour-validation.json` 与 `pump-exhibit-validation.json` 分别记录自动讲解和 002 模型接入的实际范围。它们按原字节随网页交付，不能解释为全部节目、设备或商业场景均已验证。2026-10-12 的完整网页与 Pages 部署检查另存为发布记录，保留各轮原证据。

以下截图为初版四组原创输入的真实 WebGL 2 画面或测量，界面由本子项目制作。新增 18 上游节目后的列表没有另存浏览器截图；不要将初版截图描述为新版 22 节目界面。

| 文件 | 内容 |
| --- | --- |
| `preview.jpg` | 编号子路径构建版的光之花完整光效，暂停第 52 帧；实验台显示阶段、参数与空气光束 |
| `desktop-full.jpg` | 中文研究页桌面完整截图 |
| `raw-route.jpg` | 同一节目与暂停帧的原始目标路线 |
| `scanner-trail.jpg` | 实际振镜轨迹与余辉，关闭辉光和光束 |
| `occlusion.jpg` | 不透明挡板的相机深度遮挡 |
| `mobile-full.jpg` | 编号子路径构建版的 390 px 视口完整截图，包含生成后的 PNG 下载链接；无横向溢出 |
| `webgl-validation.json` | 真实 GPU 像素自检，含浏览器与 GPU 信息 |
| `browser-verification.json` | UI 流程和检查记录 |
| `upstream-program-validation.json` | 新增 18 个上游文件的版本、原文件哈希、帧/点数和 CPU 几何测试结果；不是 GPU 报告 |
| `carousel-validation.json` | 完整播放轮播的 6 项 Node 测试和默认设置，包含逐点扫描全部 22 个真实文件；不是浏览器或 GPU 报告 |
| `launch-desktop.jpg` | 本次发布会实际浏览器完整截图：默认舞台，原创概念产品揭幕与近景；不是概念图 |
| `launch-validation.json` | 6 项发布会接入测试、71 项总用例、真实浏览器交互和页面交付记录；配置跨业务复用由 Node 用例验证 |
| `stage-validation.json` | 6 项独立演出测试、7 项舞台资产与装配测试、原创配乐与交付记录；音频传输使用可控上下文，不是浏览器音频或 GPU 报告 |
| `reuse-builder.jpg` | 新环岛配置在搭建器中的实际画面，包含 11 构件列表和椭圆台面属性 |
| `reuse-music.jpg` | 音乐业务实际读取环岛保存配置，四台激光、双屏和左侧内容台；暂停于副歌 |
| `reuse-launch.jpg` | 产品发布会实际读取同一环岛保存配置，产品位于左侧内容台，两面屏幕挂载文案；暂停于揭幕 |
| `stage-reuse-export.json` | 通过搭建器 UI 导入、保存、刷新后实际导出的配置，与公开的环岛布置逐字段一致 |
| `stage-reuse-validation.json` | 本次保存与跨业务复用的浏览器检查、配置指纹、截图和校验记录；不追溯改写历史验证范围 |
| `template-aurora-island.jpg` / `template-grand-launch.jpg` / `template-runway.jpg` / `template-exhibition.jpg` / `template-studio.jpg` | 五套模板逐一载入搭建器后的实际 GPU 画面；卡片中的小图标明确标为平面示意 |
| `stage-library.jpg` | 五套模板与另存独立项目的实际搭建器截图 |
| `stage-library-music.jpg` / `stage-library-launch.jpg` | 两种业务选择同一独立项目及版本后的实际舞台画面 |
| `stage-library-validation.json` | 方案库的模板切换、修改 / 另存 / 更新版本、刷新和跨页选择实测，以及 78 项 Node 与交付检查；不表示已经实现云端协作 |
| `library-project-a.json` / `library-project-b.json` | 通过 UI 修改、另存和更新后实际导出的两份独立配置；分别保留 3.6 / 4.8 宽走台与 4 / 5 深前岛 |
| `stage-effects-builder.jpg` / `stage-effects-music.jpg` / `stage-effects-launch.jpg` | 两个上游效果实际接入三岛展台，以及两个业务读取相同效果绑定后的真实浏览器画面 |
| `stage-effects-export.json` | 实际 UI 导出的展台效果配置，保存 effectMode 与各设备节目、点率和亮度；公开下载副本为 web/public/stages/exhibition-effects.json |
| `stage-effects-validation.json` | 本次效果接入、模式保存与跨页同步、播放 / 跳转和截图记录，以及 84 项 Node 与交付检查 |
| `stage-editor-builder.jpg` | 搜索与来源筛选、撤销重做、保存状态和真实效果预览的浏览器画面 |
| `stage-editor-validation.json` | 编辑流程的实际交互与多页版本提示、原方案保留、90 项 Node 和构建 / 交付检查记录 |

2026-10-10（Asia/Shanghai）在 Windows / Chromium 155 / RTX 4070 Laptop / ANGLE D3D11 保存。只能证明该环境和输入；不证明真实设备准确度或 WebGPU 等价性。原始 `preview.svg` 占位图已被真实截图替换。

## 2026-10-12 公开发布

- `publication-validation.json`：源提交、成功的 GitHub 校验与 Pages 工作流、104 测试、编号路径 / 公开 HTTP 资源核验、原图哈希及浏览器实际范围。
- `publication-webpage.jpg`：正式研究网页的实际浏览器截图，停在原始引导图位置；不是图像生成稿。
- `publication-pump.jpg`：公开站点的实际默认极光环岛泵展台，选中叶轮并同步讲解；线上站点没有本地 v4 保存项目，因此与历史三岛截图布置不同。
