# LibTV Skills 完整中文研究网页

本页整理对仓库的理解与采用判断：专用接入 Skill、LibTV 自家服务端 Agent、图片／视频模型与画布的分工，公开操作与模块，接口协议、异步查询、服务耦合、使用场景、有限复用价值和扩展条件。

## 运行

需要 Node.js 22+，无需安装依赖：

```text
npm run build
npm run check
npm run dev
```

浏览器打开 http://127.0.0.1:4519/。PORT 可指定本地端口。src/content.mjs 保存正文数据；src/style.css 和 src/app.js 保存样式、流程切换与原图阅读交互。

## 文档与摘要

修改 content.mjs 后，可执行 node scripts/write-docs.mjs 生成项目 README、研究基线与 projects.json 的全面摘要；补录的交付记录需要保留，不应在交付后无条件重新生成。

## 引导图

assets/libtv-summary.png 从项目 assets/ 原文件复制，2400×3748。完整 PNG 在网页中展示，支持对话框放大、原始尺寸、关闭／Escape 与下载。SHA-256 与 guide-provenance.json 一致；HTML 排版源保留在项目 assets/。

## 验证与发布

npm run check 检查脚本语法、链接、锚点、ARIA 关系、固定提交和原图一致性。发布前另外检查浏览器中的桌面／手机布局、流程点击与键盘、模块展开、原图缩放和下载。

项目 pagesDir 为 web/dist。根工作流构建与检查本页，再通过 npm run pages:build 汇总到 _site/019-libtv-skills/。构建目录不提交，正式地址为 https://yydshly.github.io/1009_codex_project/019-libtv-skills/。

本页不收集密钥、不调用 LibTV API 或执行模型生成。示意、官方描述、用户反馈、研究判断与建议分别标注；浏览器检查只确认研究网页，不确认上游创作质量。

## 浏览器验证辅助

可使用本机已有的 Playwright 包运行 node scripts/verify-browser.cjs，第一参数为 Playwright 包的绝对路径或模块名，第二参数为预览 URL。需要本机 Chrome。检查流程点击／键盘、原图缩放／下载／哈希、文档下载、无 JS 阅读与四种视口，并将实际截图保存到项目 assets/。此辅助未列入网页运行依赖或 CI 必装依赖。
