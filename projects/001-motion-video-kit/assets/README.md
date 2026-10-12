# 实际截图、视频帧与测量

采集日期：2026-10-09。本目录中的实际图像均来自本次本地实现，不是上游成片或界面。

| 文件 | 内容与采集方式 |
| --- | --- |
| site-desktop.jpg | 本地中文研究网页首页实际截图，默认桌面视口；编号 001 目录与第 18 秒代码动画画面 |
| site-mobile.jpg | 390 × 844 浏览器尺寸测试的实际截图，图像为375 × 812，内容宽375px；播放器、分镜与下一研究章节，无页面横向溢出 |
| site-overview-desktop.png | 2026-10-12 完整研究页桌面首屏实际截图；已生成的能力全景图作为首屏引导 |
| site-overview-mobile.png | 2026-10-12 完整研究页窄屏实际截图；同一引导图、可滚动章节目录与摘要，具体像素见验证记录 |
| preview.jpg | 本地实际 MP4 的 18 秒关键帧，1280 × 720；界面为说明性绘制 |
| demo-contact-sheet.jpg | 本地 MP4 每 2 秒一帧，共 12 帧，按时间顺序从左到右、从上到下排列 |
| validation.json | HyperFrames 实际运行、布局、对比度与 lint 检查的汇总，含采样时刻 |
| film-metrics.json | 独立评审的全片帧差测量、规格与 SHA256；按报告中的阈值解读 |
| capability-map-v1.png | 3840 × 2560 中文能力全景图；原创矢量排版，嵌入 preview.jpg 的实际视频帧，分别标注本地验证、作者案例与扩展设想 |
| capability-map-v1.svg | 同版可编辑矢量源文件；实际视频帧内嵌为 JPEG，不依赖外部图像链接。中文文字保留为可编辑文本，查看时需中文字体 |
| capability-map.metadata.json | 全景图研究基线、制作方式、图像证据、字体和完整文案记录 |

完整密集帧、CSV、诊断及 MP4 放在被忽略的 web/review-frames/、web/renders/ 中，不提交。指标不是广告转化数据。

preview.svg 是项目创建时的占位图，已不用于 README、总索引或网页；保留时仅代表占位，不描述成实际界面。

网页中屋顶和折叠设备为原创 CSS 机制示意，已经明确标注；专业参考影片仅提供原作者链接。

## 全景图制作与再生成

全景图由 [build-capability-map.mjs](../scripts/build-capability-map.mjs) 绘制原生 SVG，再用 Sharp 导出 PNG；没有修改嵌入 JPEG 的原始字节。图中的屋顶与手机图标是原创机制示意，不是上游成片截图。两个 prompt 文件保留图像生成服务的失败尝试，均因网络错误未产出图片；最终图没有使用生成模型或 API 回退。

再生成需要 Node.js 22+、Sharp 和中文字体。将 `MOTION_SHARP_MODULE` 设为本机 Sharp 的 ESM 入口绝对路径，然后在子项目目录运行 `node scripts/build-capability-map.mjs`。本次使用 Sharp 0.35.5 与 Windows Microsoft YaHei；不分发字体文件。网页构建直接复制已保存的 PNG 与 SVG，无需运行图像生成脚本或安装 Sharp。
