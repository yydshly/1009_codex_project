# 一图总览：素材、机制与制作依据

制作日期：2026-10-10。范围：总库子项目 014「字间／我还在这里」，汇总当前研究，完整多场景人物演唱尚未通过。主图位于 [高清 PNG](../web/public/assets/overview/overview.png) 与 [自包含 SVG](../web/public/assets/overview/overview.svg)。

## 制作方式

使用内置 `image_gen.imagegen` 生成一张无文字的抽象背景，`transparent_background=false`；未下载或运行本地生成模型。原始图片直接复制为 `web/public/assets/overview/abstract-background.png`，没有修图；图中以 0.36 不透明度作为装饰性背景，不代表模型权重、激活、注意力或实际声音数据。

`scripts/build_overview.mjs` 用 Node.js 标准库构建 1920×4530 SVG，精确排版中文、关系箭头、真实缓存数值和素材署名。四张位图全部以内嵌 data URI 保存，文字与流程为矢量；`scripts/render_overview.mjs` 使用现有 Playwright 和 Chrome 按 1.5 倍导出 2880×6795 PNG。生成器另存完整文字版与可点击来源，不让研究解释依赖位图识字。

内置 imagegen 保存的原始文件：

`D:/codex/home/generated_images/01a12376-5999-7431-9778-694a0fcc97c3/exec-901eb9a5-da5e-490f-bc18-d0fe69511b61.png`

完整背景提示词如下；没有在提示词中要求生成真实视频截图、人物或文本：

```text
Use case: infographic-diagram background asset. Generate a restrained abstract cinematic technical background for the existing '字间 / 我还在这里' Chinese token cinema research overview. Landscape 16:9. Very dark navy #090d12 with sparse muted cyan and warm amber points and thin curved paths concentrated at the far edges. Subtle matrix-like luminous point cloud at the far right, dissolving into faint musical waveform-like lines at the far left. The central 75% must remain almost flat dark negative space for accurate Chinese text and diagrams that will be typeset separately. Editorial scientific-poster feeling, elegant and understated, no human figures, no scenes, no writing, no letters, no numbers, no logos, no labels, no arrows, no panel boxes. This is an explicitly artistic illustrative background, not a visualization of actual model weights. No bright dominant glow. The background itself is the single requested raster asset.
```

## 三张真实效果帧

| 图内素材 | 来源与时间 | 处理方式 |
| --- | --- | --- |
| reference-tokens.jpg | DJ SHO 原片 00:28 | 复制既有原片抽帧封面，保留完整画面 |
| our-performance.jpg | 中文动态演唱初版 00:30 | 复制既有 Canvas 实际渲染帧 assets/motion-frame-3.jpg，保留 HeyGen 水印 |
| reference-shore.jpg | DJ SHO 原片 03:48 | 用已安装 FFmpeg 抽取真实帧并等比缩至 1200 像素宽，保留完整画面 |

原片：[DJ SHO 原帖](https://x.com/DJ_SHO974/status/2108569544151146742)。作者关于 Suno V6、Wan 3.0／Higgsfield、Blender、Claude Opus 5.5 和真实 GPT-2 权重的说明属于作者陈述；未公开完整工程和具体口型步骤。本图按功能归类，不补造未披露的口型模型或字幕实现代码。

原片按用户要求下载用于独立研究对照，未发现开源授权，保留作者署名，未作为中文原创成片素材。完整视频来源与 SHA-256 见 [reference-source.json](../web/public/assets/research/reference-source.json)。四张位图的哈希见 [overview-provenance.json](../web/public/assets/overview/overview-provenance.json)。

## 模型机制的官方依据

- [MiniMax Music-3.0 官方技术介绍](https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model)：歌词、风格到歌曲，以及 Hybrid-LM、RVQ、flow matching、Flow-VAE 架构。音频 token 与本片 GPT-2 文字分词的 ID 不属于同一表示。
- [HeyGen Avatar V 技术报告](https://dynamic.heygen.ai/www/Paper%20Links/avatarv_tech_report.pdf)：身份与音频条件、DiT／flow matching、音频交叉注意力，作为人物表演的机制参考。
- [HeyGen Photo Avatar 官方说明](https://help.heygen.com/en/articles/10034438-how-to-get-started-with-photo-avatars)：照片输入和表演设置的作用。本次平台任务的每层内部处理没有逐层核验，不能直接把论文每一步当成已验证任务流程。
- [OpenAI GPT-2 官方介绍](https://openai.com/index/better-language-models/)：因果语言预测背景。本片实际编号与预测来自既有 Xenova GPT-2 ONNX 缓存，模型 revision 在 research.md 中记录。
- [Sync 官方口型模型说明](https://sync.so/docs/models/lipsync)：歌唱、人声输入和稳定视频的素材建议，支撑下一条待验证路线。不能据此确定 ChatArt 内部失败原因，也不能保证新的路线成功。

## 我们的可复核数据与表达边界

Token ID 与 Top 3 概率直接来自 [song-model-data.json](../web/public/assets/song-model-data.json)，示例为歌词「我还在这里」。Top 3 是下一字节片段的概率，实际片段另列其概率；不将这些数值当成整词概率或嘴形准确率。ID、参数权重、激活和注意力分开说明。所有关系曲线、几何位置和冷暖色属于创作编排。

歌曲长度、27 行实际唱词、镜头与节奏来自 song-timeline.json／song-score.json；表演 3 视频、8 映射与 114.70 秒来自 performance-manifest.json。歌词边界为 ASR 近似和插值，重音视觉指标为词长与混音 RMS，没有宣称音素强制对齐或独立人声重音检测。

三轮约 10 秒测试、320 钻石、实际分辨率与拒绝结论来自 [experiment-log.json](../web/public/assets/research/experiment-log.json) 和对应质量记录。波形相关性说明原唱保留和时间尺度，不代表中文口型准确率；三条 `approvedForMV=false`，未加入成片。图中的情绪解释属于作品分析，虚构人物的自我表达不构成模型意识证据。

## 验证记录

- [overview-layout-verification.json](overview-layout-verification.json)：205 个文字标签的实际字框，无重叠或超出总图边界。
- [overview-page-verification.json](overview-page-verification.json)：主页与矢量阅读器、三处视频实际播放、声音互斥、全屏、手机布局、缺少导出时回退。
- [research-page-verification.json](research-page-verification.json)：原片与三轮拒绝样片播放器的回归验证。
- overview-preview.png／overview-mobile.png／overview-viewer-preview.png：本地网页实际截图；overview-proof-*.png：主图分区导出。
