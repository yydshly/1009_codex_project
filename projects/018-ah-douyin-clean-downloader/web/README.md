# 抖音内容工作流研究页

这是面向阅读与讨论的完整研究网页，包含摘要、原始引导图、能力、模块、三条实现路线、交付验收、风控边界、运行环境、个人价值、产品意义、扩展方向及固定源码依据。页面提供章节导航、路线切换和原图放大/下载。

## 运行与构建

使用 Node.js 22+ 标准库、静态 HTML、CSS 和 JavaScript，无需安装依赖。所有正文数据集中在 `src/content.mjs`。

```powershell
npm run docs
npm run build
npm run check
npm run dev
```

`docs` 同步项目 README、研究记录和根目录中本项目的完整摘要；`build` 生成 `dist/index.html`，逐字节复制原引导图；`check` 校验脚本语法、页面锚点、资源路径、ARIA 关联、来源提交及原图 SHA-256；`dev` 在 `http://127.0.0.1:4198/` 提供本地预览。可通过 `PORT` 修改端口。

根目录发布检查：

```powershell
npm run index:sync
npm run check
npm run pages:build
```

`dist/` 与根 `_site/` 为被忽略的构建产物。构建工作流先生成各子项目，再发布统一站点；此项目使用相对资源路径，可部署到编号子路径。

## 发布与验证范围

部署地址：<https://yydshly.github.io/1009_codex_project/018-ah-douyin-clean-downloader/>

页面为纯静态研究展示，没有账户登录、抖音请求、视频下载服务或模型运行。浏览器交互与发布验证记录见 [validation.md](../validation.md)；上游运行能力按固定提交源码进行分析，未在当前 Windows 环境登录抖音实测。引导图说明见 [assets/README.md](../assets/README.md)。
