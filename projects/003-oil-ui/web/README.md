# Oil UI 研究网页

本目录直接作为 `pagesDir: "web"` 发布，使用相对资源地址；根入口 `index.html`，实际场景 `demo.html`，方向比较 `lab/styles/style-explorer.html`，版式比较 `lab/layouts/style-explorer.html`。

在仓库根目录执行：

```sh
node projects/003-oil-ui/scripts/build.mjs
node projects/003-oil-ui/scripts/serve.mjs
```

打开 <http://127.0.0.1:4173/>，完整原始引导图直接展示在入口。十三个章节涵盖能力、模块、原理、约束、质量、流程、模型对照、效果、实验、价值、场景与扩展、证据和总结。研究汇总入口为 <http://127.0.0.1:4173/#summary>。`build.mjs` 同步发布版本真实项目快照、图片、验证记录和设计约定，快照日期按 Asia/Shanghai 计算。无 npm 依赖，Node 22+ 即可。

重新生成已提交的对比页：`node projects/003-oil-ui/scripts/generate-experiment.mjs`（需要 Python 3.10+）。验证业务模型：`node --test projects/003-oil-ui/tests/model.test.mjs`。静态入口与资源检查：`node projects/003-oil-ui/scripts/check-web.mjs`。

`.github/workflows/pages.yml` 和 `validate.yml` 运行同步、静态检查和模型测试。运行 `npm run index:sync`、`npm run check`、`npm run pages:build`，汇总到 `_site/003-oil-ui/`。发布地址为 <https://yydshly.github.io/1009_codex_project/003-oil-ui/>，实际部署状态、提交与公开检查记录见 `../assets/publication.json`。统一 Pages 使用手动工作流触发；本站只发布研究与本地交互展示。

研究内容、截图来源和功能范围见父目录文档。工作台的笔记存储与导出均在浏览器本机完成。提供“验证一次保存失败”按钮用于检查错误反馈，不会删除已有笔记。
