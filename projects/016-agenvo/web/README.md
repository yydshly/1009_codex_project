# Agenvo研究网页

原生HTML/CSS/JavaScript，零npm依赖。Node.js22+构建/预览；源码`src/`、原图`../assets/agenvo-guide.png`。

```sh
npm run build
npm run check
npm run dev
```

本地http://127.0.0.1:4186/。build把四个源文件/原PNG写到`dist/`并替换固定源码SHA。check验证语法、资源、锚点、版本、原PNG字节一致。dist不提交。

仓库pagesDir为web/dist；pages.yml和validate.yml接入build/check。资源相对路径，无SPA回退。根index:sync/check/pages:build生成`_site/016-agenvo/index.html`。

AGENVO_PREVIEW_ROOT指定汇总站点目录，AGENVO_PREVIEW_PORT指定端口；只监听127.0.0.1。在线地址：https://yydshly.github.io/1009_codex_project/016-agenvo/。

完整内容涵盖图、版本、能力、模块、身份、原生接入、部署、事件/执行/权限、官方对比、价值、扩展、依据。流程/标签都是阅读示意，不连接真实Agent，不收密钥。

弹窗Escape关闭，标签支持左右/Home/End，目录/详情/原图下载，响应式与减少动画偏好。不加载外部字体/脚本/分析服务；点击来源链接才访问外站。
