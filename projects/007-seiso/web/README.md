# Seiso 研究展示说明

完整研究页地址：[Seiso 文档检查与扩展研究](https://yydshly.github.io/1009_codex_project/007-seiso/)。

## 运行与构建

需要 Node.js 22 或更高版本，使用标准库，无需 npm install。

```sh
npm run build
npm run check
npm run dev
```

本地地址为 http://127.0.0.1:4317/1009_codex_project/007-seiso/。可用 SEISO_PREVIEW_PORT 修改预览端口。

## 网页内容与交互

九个阅读区域包含原始引导图、能力和全部规则、源码模块与原理、说明性示例、场景与个人价值、采用方法、分层扩展、能力边界和固定来源。

支持原图放大与 Escape 关闭、规则状态筛选、规则解释展开、三个示例切换及方向键操作。页面没有运行 Seiso CLI；说明性示例与实际执行结果明确区分。

## 文件与发布

- content.mjs：固定版本、研究文字、规则、模块与摘要。
- build.mjs：生成静态 HTML 并复制原始引导图。
- styles.css / app.js：响应式样式与浏览交互。
- check.mjs：来源、章节、本地引用、锚点、资源与原图 SHA-256 校验。
- serve.mjs：仅监听 loopback 的本地预览服务。

输出到忽略提交的 dist/。projects.json 的 pagesDir 指向 web/dist；发布与校验工作流均先执行本项目 build、check，再统一运行 index 校验与 pages:build。实际发布由 GitHub Actions 完成，不提交 dist 或 _site。

原图来自 ../assets/overview-infographic.png，完整复制到 dist 并核对 SHA-256；不重新绘制或压缩。历史图像的能力基线和网页正文均明确为 7e5b3b1 / 0.3.0。
