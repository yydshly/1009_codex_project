# MV 研究网页运行说明

原生 HTML/CSS/JavaScript，Node.js 22+ 用于本地服务；无 npm 依赖。

## 本地预览

    npm.cmd run dev

访问 http://127.0.0.1:4182/ 。npm.cmd run check 检查网页脚本与静态服务语法。

## Pages 集成

发布目录 public/ 包含 index.html、styles.css、app.js、favicon.svg、assets/overview-infographic.png／svg 和 assets/upstream-frames/ 的四张样片截图；本地资源使用相对路径。根 projects.json 的 pagesDir 为 web/public；两个 GitHub 工作流增加语法检查。无需安装或编译本网页。

在总库根目录运行：

    npm.cmd run index:sync
    npm.cmd run check
    npm.cmd run pages:build

随后在本目录运行 npm.cmd run preview:pages，访问 http://127.0.0.1:4183/012-motion-graphics-music-video/ 。

发布地址：https://yydshly.github.io/1009_codex_project/012-motion-graphics-music-video/ 。2026-10-12 通过现有 Publish GitHub Pages 工作流部署成功，已核对公开网页、原图、样片图片、实际播放和截图切换；结果记录在 ../research.md。

端口占用时可设置环境变量 PORT，例如 PowerShell：`$env:PORT='4192'` 后运行 dev。Pages 预览同样支持 PORT；服务仅监听 127.0.0.1。

## 交互

- 播放／暂停 16 秒静音编排；拖动时间轴定位，终点停止，再播放回到开头。
- 显示／隐藏角色素材、代码图形和后期光效，理解合成分工。
- 切换五个制作环节和四种底层职责。
- 切换三种使用场景，下载对应 Markdown brief。
- 筛选复用、适配和新增的扩展方向。
- 从证据区域打开固定提交源码或作者样片。
- 两支作者样片支持页内 YouTube 播放、收起播放器、切换两张真实截图；播放下一支会卸载前一支播放器。
- 首页导览使用原始理解图，“一图总览”默认展开，支持折叠、打开原图、下载 PNG 和查看可编辑 SVG；原图字节保留，风格缩略为示意。
- 八组模块提供输入、产出与固定源码链接；口型专节说明目标音频、对齐、演唱表演与实际审查。

制作能力段的音乐节拍和 SVG 角色为原创静音示意；作者成片单独标注。点击播放后连接 YouTube（youtube-nocookie.com），视频含音频；加载受网络和 YouTube 播放规则影响，可使用原片链接。截图可离线阅读。没有模型调用、视频导出、密钥输入或上游运行。下载内容为创作说明。

## 文件

public/ 为完整发布内容；scripts/serve.mjs 为本地只读静态服务，提供 JPEG MIME。作者截图原件保存在 ../assets/upstream-frames/，发布副本位于 public/assets/upstream-frames/。网页预览截图保存在 ../assets/。
