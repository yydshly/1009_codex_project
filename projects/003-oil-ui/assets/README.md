# 素材与证据说明

- `proof-van-gogh.webp`、`proof-mona-lisa.webp`、`showcase.webp`：上游固定提交 `7987bb38afeea1ff8e96641b3ffebb5601fe67d2` 的 `assets/readme/` 原图；MIT，oil-oil。属于作者公开展示样例，本地未运行其完整业务。
- `overview-desktop.png`：2026-10-09 本地研究网页的实际桌面截图；当前根索引改用完整中文引导图。
- `summary-desktop.jpg`：新增“研究汇总与价值”章节的实际浏览器首屏截图，2026-10-09；记录研究结论的呈现，不代表审美评分或对照实验效果。
- `oil-ui-understanding-v1.png`：2026-10-09 使用内置 `image_gen` 制作的中文研究总览信息图。七个模块涵盖能力、原理、模型对照、创意边界、复用价值、扩展与 3D 组合；内容依据本项目研究。三张上游原图作为视觉拼贴输入，拼贴经过图像生成处理，不能替代原始截图或效果对照证据。保留 oil-oil / MIT 来源说明。
- `oil-ui-understanding-prompt.txt`：上述信息图的完整生成提示词，记录参考图角色、准确文案、布局与事实边界；未使用 CLI/API 回退。
- `workbench-desktop.png`、`workbench-mobile.png`：本地工作台实际截图，1280×900 / 390×844 视口；长图包含完整页面。
- `captures/`：上游截图工具输出的图片、操作三帧及报告。初次报告的 favicon 问题已在最终检查中修正。
- `verification.json`：本地程序与浏览器验证摘要，不是审美评分。
- `captures/publication-overview/`、`publication-modules/`、`publication-comparison/`：2026-10-12 发布版本的实际浏览器截图与 CDP 报告，覆盖桌面、手机、模块及模型对照章节；未报告控制台错误、横向溢出或图片加载失败。截图用于检查呈现，不是独立审美评价。
- `publication.json`：本次本地检查、远端提交与公开部署记录；状态随实际证据更新。
- `captures/public-overview/`：2026-10-12 GitHub Pages 公开网址的桌面/手机实际截图、CDP 报告与 HTTP 检查；对应内容提交 `72a019a`，8 个资源返回 200，13 个唯一章节及公开原图 SHA-256 均已核验。
- `favicon.svg`：本地绘制的静态标识。
- `preview.svg`：脚手架原始占位图，当前索引不使用它。

网页发布素材由 `scripts/build.mjs` 从本目录同步到 `web/assets/`。生成器需要的字体位于 `tools/oil-ui/assets/fonts/`，保留 OFL。所有上游代码和图片的许可副本在 `tools/oil-ui/LICENSE` 与 `web/licenses/`。
