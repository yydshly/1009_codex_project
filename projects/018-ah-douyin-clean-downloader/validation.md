# 网页与发布验证记录

验证日期：2026-10-12。研究对象：`feat/creator-batch-offline` / v0.5.0 / `dbd22a4711d448770169c186dcc7708a2357b5ec`。

## 已完成的本地检查

- Node.js v22.15.0 / Windows：`npm run build`、`npm run check`（子项目），以及根目录 `npm run index:sync`、`npm run check`、`npm run pages:build` 通过。
- 检查脚本验证 JavaScript 语法、HTML 唯一 ID、资源和锚点、ARIA 关联，以及固定提交和验证范围说明。
- 原始引导图与发布拷贝字节一致；SHA-256 为 `ff4cfde8057ae27bb920db6fe054bfa09157a015b912cb4890f5b35e2d25c987`，尺寸 941 × 1672。三处展示均正常加载。
- Codex 浏览器在桌面 1280 × 720、手机 390 × 844 和窄屏 320 × 640 验证；页面无全局横向溢出，宽表格和章节导航在自身容器内滚动。
- 验证三条路线切换、选中状态与可见面板一致；键盘 Home 返回单条下载路线。
- 验证引导图弹窗打开、941 像素原尺寸显示、Escape 关闭及手机关闭按钮；手机弹窗适配屏幕。
- 浏览器控制台未发现警告或错误。桌面与手机首屏截图分别为 [page-desktop.jpg](assets/page-desktop.jpg) 和 [page-mobile.jpg](assets/page-mobile.jpg)。截图是本研究网页，不是上游产品或真实采集结果。

## 发布验收

目标地址：<https://yydshly.github.io/1009_codex_project/018-ah-douyin-clean-downloader/>。

发布使用仓库的 GitHub Pages 工作流，018 构建检查步骤已加入发布和验证工作流。发布后通过 GitHub Actions 运行结果、公开页面与原图响应验证；最终工作流与提交链接记录在交付消息中。

## 上游工具的验证范围

本次是固定源码和文档审查，并验证原创研究网页。未登录抖音，未下载真实作品，未执行 MLX/Apple Vision 识别，未独立复现作者自报的 139 条样本，也未认证风控安全、长期成功率或内容准确率。扩展建议没有作为后端实现。
