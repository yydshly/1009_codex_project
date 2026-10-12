# ShipVideo 中文能力研究网页

原生 HTML/CSS/JavaScript，发布文件位于 public/。不需要 npm install，不需要模型凭据。保留原始中文引导图，提供十项完整理解摘要、输入输出、能力、八类模块与任务链路、原理分步、效果与场景、业务价值和验证指标、扩展建议与源码依据；明确我们当前仅借鉴自动制片流程。

## 运行

在总库根目录执行：

    npm.cmd run check --prefix projects/011-shipvideo/web
    npm.cmd run build --prefix projects/011-shipvideo/web
    npm.cmd run dev --prefix projects/011-shipvideo/web

打开 http://127.0.0.1:4321/1009_codex_project/011-shipvideo/ 。

本地服务器仅监听 127.0.0.1，端口 4321，支持 GET/HEAD。自己的页面从 public/ 读取，跨项目链接和总索引从根 _site/ 读取；修改页面后刷新即可。

## 发布

projects.json 的 pagesDir 为 web/public，资源采用相对路径。build 仅将 projects.json 的 summarySections 同步为静态 HTML；Pages 与 Validate 工作流执行 build 和 check 后使用总库 pages:build 汇总，无依赖安装。

    npm.cmd run index:sync
    npm.cmd run check
    npm.cmd run pages:build

发布汇总的入口为 _site/011-shipvideo/index.html。在线地址：https://yydshly.github.io/1009_codex_project/011-shipvideo/ 。提交与 Pages 发布证据见 ../verification.md。

## 交互与验证边界

- URL / Prompt 切换，两个输入草稿在当前页面内保留；刷新后回到默认示例。
- 四个制作环节、四种应用场景与扩展折叠说明。
- 中文全景图位于 public/assets/overview-infographic.png，点击图片在新标签打开原图供放大阅读。项目 assets/ 保留同图与完整生成提示词；图中画面均为说明性绘制。
- 24 秒原创 HTML 动画：播放、暂停、重播、拖动、键盘 Home/End 与反向定位。
- 场景提示词载入与剪贴板复制，复制不可用时选中输入文字供手动复制。
- 页面默认暂停，尊重减少动态效果设置；后台隐藏时暂停播放。
- 没有网页抓取、模型生成、任务 API 或 MP4 导出。场景中的文字、流程与产品均为本地预设示意，复制按钮仅复制简报。

正文和布局在 HTML 中提供，基础阅读不依赖 JavaScript。动画控制、动态链接与交互需要 JavaScript。完整网页检查涵盖资源、锚点、节点引用与脚本语法；浏览器验证见 ../verification.md。
