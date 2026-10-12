# Dioramas 发布与验证记录

整理与验证日期：2026-10-12。已发布并验证：[Dioramas 完整研究网页](https://yydshly.github.io/1009_codex_project/002-dioramas/)。

本轮沿用原 understanding-map.svg / PNG，固定研究源码为 868539fb5b64a843071a2247d5d8bacb706a07b1。发布的是中文研究网页、静态案例图览与独立离心泵交互实验。

发布流程：本地构建与浏览器验证 → 独立工作树提交本项目及索引和构建配置 → 推送 main → 手动触发 GitHub Pages → 检查线上页面、图片、许可和交互。

## 远端与部署

- 发布提交：[48514682e0034eebef1e77449779ab964ea77e2f](https://github.com/yydshly/1009_codex_project/commit/48514682e0034eebef1e77449779ab964ea77e2f)，已推送到 origin/main。
- [Publish GitHub Pages / 38221250281](https://github.com/yydshly/1009_codex_project/actions/runs/38221250281)：build 与 deploy 均成功。
- [Validate research index / 38221232224](https://github.com/yydshly/1009_codex_project/actions/runs/38221232224)：成功。
- Pages 部署完成时间：2026-10-12 16:03:44（Asia/Shanghai，Actions 的 UTC 时间换算）。

发布工作树仅包含本项目、002 元数据、脚本生成的根索引和两个工作流中的新增构建步骤。原有 001、016、017、018 项目保持原内容；原工作区其他尚未提交的研究没有纳入本次发布。

## 浏览器验证

本地生产子路径完成 34 项检查：[publish-verification.json](assets/publish-verification.json)。公开网页完成 33 项检查：[published-verification.json](assets/published-verification.json)。Chromium 151.0.7922.34，桌面 1440 × 1000，手机 390 × 844。

确认九维摘要与元数据一致、9 个共享模块、7 项工具、6 方面价值、6 项扩展及验收、20 个案例和筛选放大；原图加载与 SVG / PNG 下载、部件选择、展开、镜头拖动、透视、流向、重置与手机操作均通过。无 pageerror、失败响应、模型请求或外部运行时请求，桌面与手机无横向溢出。线上可见结果见 [桌面截图](assets/published-desktop.png) 与 [手机截图](assets/published-mobile.png)。

原图 SHA-256 在线复核一致：SVG 为 3ecc3ba2463c5b546afa7e3b08b02605ba1477d65cb6a32bfacef4df3357e07e，PNG 为 8cd319155ed9f65cb979fe63737042b04434f83fd52f56c0fc6dad1797e755c8。

本地和 CI 构建成功。图形脚本 787,600 字节，Node zlib 默认 gzip 测量为 204,309 字节；Vite 提示其超出 750 kB 的未压缩体积阈值。没有据此验证真实手机帧率，后续可进一步分块和按需加载。验证覆盖研究页与独立泵实验，没有运行上游 20 个完整场景、AI 素材生成或工业仿真。

本记录和线上证据随后单独提交，不修改已部署网页内容。
