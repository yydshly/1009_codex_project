# Alook 完整研究网页

原生 HTML/CSS/JavaScript + Node.js 22 标准库构建，零 npm 依赖。

```sh
npm run build
npm run check
npm run dev
```

- 本地预览：http://127.0.0.1:4187/
- 在线阅读：https://yydshly.github.io/1009_codex_project/017-alook/
- 内容：`src/content.mjs`，13 章节，事实/判断/建议/示例分别标注。
- 页面生成：`scripts/build.mjs`，所有上游源码链接固定到 `f4265de142d2af5934f536b316c8fe11b6c99f60`。
- 原引导图：`../assets/alook-guide.png`，发布资源复制后 SHA-256 不变。
- 构建产物：`dist/`，忽略提交；`pagesDir` 为 `web/dist`。
- README/研究记录由 `scripts/write-docs.mjs` 同步内容，复制到发布目录供下载。

## 阅读交互与边界

图片放大、原尺寸、下载；Escape 关闭并返回按钮。六步执行链路可选择查看角色、边界与固定源码。手机表格按列名重排，目录和全部内容可访问。

这是研究说明网页，未连接真实 Agent，未启动 Alook，不收集密钥。图中业务扩展不等同页面已实现。

## 检查与 Pages

`check` 检查脚本语法、资源、HTML ID/锚点、源码版本、原图 provenance 与发布副本一致性。

根两份工作流执行本页 build/check。根 `npm run index:sync`、`npm run check`、`npm run pages:build` 生成 `_site/017-alook/index.html`。

服务仅监听 `127.0.0.1`。`ALOOK_PREVIEW_ROOT` 指定汇总站点，`ALOOK_PREVIEW_PORT` 修改端口。无 SPA 回退，不需要密钥或后端。
