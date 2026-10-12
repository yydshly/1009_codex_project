# 图片说明

preview.png 是本项目原创研究网页实际首屏截图，使用 Codex 内置 Chromium 浏览器捕获。右侧 SVG 角色、代码图形和光效展示分层关系，模拟 120 BPM 的 16 秒静音时间线。

上述首屏截图不是上游软件界面或付费模型成片。没有下载作者的完整视频或字体。

mobile.png 为响应式移动端截图（390×844）；同样是本项目原创网页。

新建时的 preview.svg 占位图已退出索引，不作为研究效果图。

principle.png 为网页“底层原理”段的实际截图（1280×800 视口），展示 Agent、Ruby、模型和本地工具的分工；可在网页中继续向下查看合成交付与说明。

2026-10-10 新增 upstream-frames/ 中的四张作者样片实际播放截图，出处、时间点与采集方式见该目录 README.md。这些画面来自作者成片，与原创 SVG 示意分别标注。

examples.jpg 是本项目样片对照段的实际网页截图（1280×900 视口），含两支作者作品的真实画面、播放入口和截图选择。examples-mobile.jpg 为同段 390×844 视口的实际移动截图。作者画面的权利和来源见 upstream-frames/README.md。

overview-infographic.png 为 2026-10-10 完成的 2400×3500 中文理解总览图，汇总目标、输入输出、Opus 导演、图像与视频生成、口型对齐、代码编排、扩展场景、个人价值与边界。内置 imagegen 两次请求均因网络错误失败，最终使用原创 SVG 排版与本机 bundled Sharp 渲染为 PNG。图内风格缩略为原创图形示意，不是作者成片或软件截图。事实基线为研究提交 759ba6a；模型名称按上游约定，不代表本次调用或当前可用性验证。尝试生图的提示词保存在 overview-infographic.prompt.txt；未使用 imagegen CLI fallback、未调用上游付费制作工具。

原件和可编辑 overview-infographic.svg 在本目录；排版源为 overview-layout.mjs。网页发布副本在 web/public/assets/overview-infographic.png 与 overview-infographic.svg。阅读网页不需要 Sharp；重新导出时可用 MV_OVERVIEW_SHARP 指向 Sharp 模块路径后运行 Node 排版脚本。

overview-web.jpg 为“一图总览”展开后的实际网页验证截图。浏览器核对主图已加载，原始尺寸为 2400×3500；截图用于记录网页接入，完整理解图以 PNG／SVG 原件为准。

2026-10-12 保持理解图 PNG／SVG 字节不变，首页改用原图导览，完整图默认展开。preview-20261012.jpg 为本轮 1280×720 首屏实际截图；mobile-20261012.jpg 为 390×844 实际截图；examples-20261012.jpg 为本轮样片对照区实际截图。初版 preview.png、mobile.png、principle.png 和 10-10 截图继续保留为过程记录。

published-20261012.jpg 为 GitHub Pages 部署成功后，通过公开 HTTPS 地址捕获的 1280×720 实际首屏截图，用于核对本轮交付；画面中的引导图仍为原始理解图。
