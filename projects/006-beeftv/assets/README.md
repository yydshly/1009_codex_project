# 截图与素材说明

- beeftv-overview.png：2400×4623 高清能力全景图，覆盖输入输出、创作链路、六类能力、架构、演示截图、应用场景、效果、扩展与使用边界。
- beeftv-overview.html：可编辑排版源，使用相对路径引用 preview.png；最终 PNG 由 Chromium 精确排版截图生成。
- preview.png：本项目原创研究网页的桌面实际截图，1440×1000。
- mobile-preview.png：本项目原创研究网页的手机尺寸实际截图，390×844。
- preview.svg：模板旧占位图，未被索引或研究文档用作预览。

截图对象是此子项目的能力讲解网页，不是 BeefTV 原生应用；画布、镜头画面和播放为原创交互示意，没有实际 AI 生成结果。

三张插画位于 web/public/assets/：coffee-scene.svg、product-scene.svg、reading-scene.svg，均为本项目原创绘制。favicon 同为原创研究页标记，未复制上游 Logo。

全景图渲染脚本为 web/scripts/render-overview.mjs。重渲染时需要可用的 Playwright / Chromium；可通过 BEEFTV_PLAYWRIGHT_ENTRY 指定 Playwright 的 index.mjs 文件，或自行在渲染环境安装 Playwright。此依赖仅用于图像导出，静态网页运行无需安装。

PNG 发布副本位于 web/public/assets/beeftv-overview.png。本轮按用户要求保留原图，禁止用新截图覆盖图中引用的 preview.png，也不重新渲染覆盖原 PNG。新截图使用独立名称。

## 原图保留校验

原文件与发布副本均为 SHA-256：

    000ED36CB6284114AE470D3E8C37C239C306F0E0D2A33A5324A2D0748E737458

尺寸 2400×4623。web/scripts/check.mjs 会在发布前核对两份文件。

2026-10-12 完整研究页新截图：web-preview-20261012.png（桌面首页）、web-mobile-20261012.png（移动首页）、web-overview-20261012.png（全景导览区域）；均独立于原图引用的 preview.png。
