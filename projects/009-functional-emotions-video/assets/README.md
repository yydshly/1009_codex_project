# 图片、来源与验证数据

固定提交：b34c20a4f8f64ee87079a2ae2fdedf2cf1990a49。日期：2026-10-09。

| 文件 | 内容与来源 |
| --- | --- |
| frames/t-30.jpg 等八张 JPEG | 在 30、55、83、120、170、220、290、350 秒使用完整上游代码本机渲染的 1920×1080 画面；非占位图或 AI 生成示意图。 |
| preview.png | 前版原创演示实际桌面截图：原创音乐、新场景、油画渲染、配色与同步控制；总索引现使用 overview-desktop.png。 |
| gallery-desktop.png | 本地网页的已有画面与章节展示截图。 |
| scenarios-desktop.png | 本地扩展场景交互截图；内容为建议，尚未实现。 |
| mobile.png | 手机尺寸的实际网页截图。 |
| mobile-first-screen.png | 390×844 手机首屏实际截图，便于检查播放和音频入口。 |
| source-render-verification.json | 完整上游静帧的运行结果；captureMs 包含捕获与编码。 |
| web-verification.json | 初版网页、精选片段与响应式交互的运行结果。 |
| full-player-verification.json | 八章、168 镜头共 504 次渲染，以及本地测试音同步和响应式交互结果。 |
| original-audio-verification.json | 上游原曲真实联网播放、章节与时间同步、音频切换、手机播放及网络失败重试结果。 |
| demo/seed-journey.wav | 本次原创乐谱经确定性程序合成的 32 秒立体声器乐，无采样素材。 |
| demo/score.json | 乐谱参数、48 拍时间点、音符事件与六镜头分镜。 |
| demo/shot-1.jpg 至 shot-6.jpg、seed-journey-poster.jpg | 新场景代码使用上游油画渲染器实际生成的 1920×1080 静帧。 |
| original-demo-desktop.png、original-demo-mobile.png | 原创演示页面实际桌面与手机截图。 |
| understanding-desktop.png | 共同理解汇总区的实际网页截图。 |
| journey-verification.json | 原创音乐波形、六镜头渲染、播放器、风格/配色、手机与 MP4 的运行结果。 |
| journey-export-verification.json | ffprobe 读取本机 MP4 的编解码器、分辨率、帧率、音轨与时长。 |
| preview.svg | 创建时的占位图，已不用于索引和网页。 |
| overview/research-overview.png | 2026-10-12 AI 编排的 941×1672 研究总览图，使用原库与原创演示实际画面作为插图；不是网页截图。 |
| overview/image-generation-prompt.txt | 总览图的内容清单与编排说明。 |
| overview/mv-creative-prompt.txt | 独立创作提示词，只约束画风与大方向，不要求依赖原库。 |
| overview-desktop.png、overview-mobile.png | 1440×1080 与 390×844 视口下，总览区的实际完整网页截图；当前索引按用户要求使用 overview/research-overview.png 引导图。 |
| overview-dialog-desktop.png | 总览图放大至 200% 时的实际弹窗截图。 |
| understanding-summary-desktop.png | 六项理解、四步流程与展开的独立提示词的实际网页截图。 |
| creative-prompt-mobile.png | 手机端展开的独立提示词、复制与下载入口实际截图。 |
| overview-verification.json | 总览图交互、下载、剪贴板及回退、两播放器回归、桌面与手机布局验证。 |

上游代码许可保留在 web/vendor/functional-emotions/LICENSE。没有复制上游歌曲或完整歌词。构建复制 frames/、demo/ 和 overview/ 资源；页面截图与验证数据属于研究记录。原创 MP4 保存于被忽略的本地导出目录，检测到文件时复制进入被忽略的 dist/；不作为源文件提交。
