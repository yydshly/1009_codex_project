# BeefTV 完整中文能力研究网页

[公开网页](https://yydshly.github.io/1009_codex_project/006-beeftv/) · [完整研究](../README.md) · [证据记录](../research.md)

原生 HTML/CSS/JavaScript，无运行时依赖或模型请求。用本次原全景图引导，覆盖入口出口、能力、模块、原理、场景、价值、扩展和验证边界。

## 运行与检查

Node.js 22+，本目录运行：

    npm.cmd run dev
    npm.cmd run check

打开 http://127.0.0.1:4176/ 。check.mjs 检查所有 JS 语法、HTML 锚点与资源文件、原图和发布副本的尺寸及 SHA-256，不请求模型。

## 交互

原全景图在正文完整显示，提供高清原图、PNG 下载与原生 dialog 放大阅读，支持 Esc 关闭和焦点恢复。章节导航连接入口出口、六类能力、八类职责模块、三种入口、三条执行链路、使用效果与场景、价值、扩展及证据。

保留 3 场景、5 步骤、15 秒分镜/字幕播放与定位、3 种架构入口、流程卡下载和 FAQ。页面的 SVG 与动画是原创讲解示意；流程卡不是视频或项目导入文件。未配置供应商密钥或执行上游渲染。

## 静态发布

public/ 是可直接发布目录，所有站内资源用相对路径，适配统一 Pages 的 /006-beeftv/。Pages 与 validate 工作流运行本项目 check，然后由总库汇总；无需安装依赖。

总库根目录执行 index:sync、check 与 pages:build。再从本目录运行 npm.cmd run preview:pages，访问 http://127.0.0.1:4177/006-beeftv/。

公开地址：https://yydshly.github.io/1009_codex_project/006-beeftv/ 。实际部署状态与运行编号记录在 ../research.md。

原图和其 HTML 排版源在 ../assets/，发布副本为 public/assets/beeftv-overview.png。原图属于保留素材，请保持字节不变；新页面截图使用独立文件名。research.css 为完整研究章节样式，guide.js 为图像阅读交互，app.js 为原流程讲解。
