# 图片与验证记录

## 一图总览

`dvor-overview.png` 是本次整理的高清知识长图，包含八个模块：能力、已有视觉效果、渲染管线、世界搭建、本地扩展、可复用模块、应用与未来方向、提示词控制。

图内直接使用六类上游原始截图与本地社区实际截图，共九处图片插入；通过 CSS 等比例裁切，未用生成画面替代项目运行证据。绿色标记上游已实现，橙色标记本地已完成，虚线标记扩展建议。基础几何、平面到球面的箭头与三档色块为讲解示意。

| 文件 | 内容与生成方式 |
| --- | --- |
| `dvor-overview.png` | 2400×6357 PNG；基于真实截图与准确中文排版，经本机 Chromium 导出 |
| `dvor-overview.html` | 可编辑排版源；使用本目录截图和 `../web/public/samples/` 图片，无外部资源 |
| `dvor-overview-prompt.txt` | 完整制图内容规格及 imagegen 重试所用提示词；提示词不是成功生成图片的证据 |
| `dvor-overview-verification.json` | 八个模块、九张插图加载、关键说明、无裁切和无页面错误的导出记录 |

最初两次 imagegen 调用均因网络错误未返回图像；最终交付采用 HTML/CSS 原生排版与截图导出，不是模型生成海报或 CLI/API 制图。原始截图的署名和授权沿用本页下方说明。导出脚本为 `web/scripts/render-overview.mjs`，在 `web/` 执行 `node scripts/render-overview.mjs` 可重新生成 PNG 与检查记录。修改中文与配色可直接编辑 HTML，修改后应重新导出核对。

## 本地实际截图

2026-10-12 全面整理后的页面由 `web/tests/verify-research.mjs` 验证：`research-first-screen.png` 为桌面首屏，`research-desktop.png` 为桌面整页，`research-mobile.png` 为 390px 宽模拟整页，`research-verification.json` 记录原图资源与下载 SHA-256、模态交互、导航、完整研究内容和响应式检查。此前原始图和原作截图保留。

以下 PNG 由本子项目浏览器验证脚本在 2026-10-09 使用本机 Chrome headless 生成，3D 场景使用实际 WebGL，没有用占位图替代。场景截图来自 `web/tests/verify.mjs`；提示词章节与最新整页截图来自 `web/tests/verify-prompts.mjs`。

| 文件 | 内容与条件 |
| --- | --- |
| `preview.png` | 社区全景与四站导览界面；桌面 1440×980 浏览器中的实验区域 |
| `community-guide.png` | 选择邻里书屋后的实际镜头与导览说明 |
| `planet-view.png` | 新社区球面投影的小行星远景 |
| `original-reproduction.png` | 上游世界源码在本地应用内实际构建；新增摄像机和参数配置 |
| `page-desktop.png` | 中文研究网页桌面完整页面 |
| `page-mobile.png` | 浏览器模拟 390px 宽的响应式完整页面；不是手机硬件测试 |
| `verification.json` | 用户操作、数据和实际渲染的验证证据，以及错误/请求记录 |
| `pages-verification.json` | 汇总后的编号子路径、动态世界 chunk、图片和许可证加载证据 |
| `prompt-desktop.png` | 新增提示词章节实际桌面截图：视觉规格、可编辑模板、逐轮修正与验收说明 |
| `prompt-mobile.png` | 390px 浏览器模拟的提示词章节；表格与长模板在自身区域滚动 |
| `prompt-verification.json` | 七项新增浏览器检查：编辑/切换、实际剪贴板、TXT 内容、参数带入、修正复制、失败回退与响应式 |

`preview.svg` 是脚手架创建时的占位图，现已停用；不作为完成后的项目预览。

## 上游原始样例

网页 `web/public/samples/` 中六个文件原样复制自固定提交：

[Dvor docs/shots](https://github.com/amirmushichge/dvor/tree/30d6f684670915865743c79f44f931a43d987113/docs/shots)：`01-arch.jpg`、`02-playground.jpg`、`03-garages.jpg`、`04-panel.jpg`、`05-tram.jpg`、`06-planet.jpg`。

分别展示通道构图、设施、车库、住宅立面、电车和小行星。网页缩略图做等比例裁切，点击放大查看完整图。它们是上游作品截图，不是本地场景截图，署名和两份 MIT 声明在网页底部与发布目录保留。
