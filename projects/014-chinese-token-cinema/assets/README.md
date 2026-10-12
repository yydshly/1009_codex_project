# 素材与验证

## 一图总览

- overview-guide.png：原完整引导图 PNG 的逐字节副本，用于根索引预览，不是新生成版本。
- ../web/public/assets/research/research-summary.json：2026-10-12 十项全面摘要、八模块输入输出和四类扩展条件。

- overview-source.md：生成方式、完整背景提示词、三张真实帧与六项机制来源；保留作者和水印。
- ../web/public/assets/overview/overview.png：2880×6795 高清完整图。
- ../web/public/assets/overview/overview.svg：1920×4530 自包含矢量图，文字可编辑，位图内嵌。
- ../web/public/assets/overview/overview-content.json：八模块完整文字、来源与实际实验状态。
- ../web/public/assets/overview/overview-provenance.json：图内四张位图的 SHA-256 与制作方法。
- overview-preview.png、overview-mobile.png、overview-viewer-preview.png：实际网页和阅读器截图。
- overview-proof-top.png、overview-proof-data.png、overview-proof-bottom.png：完整图分区导出，供排版复核。
- overview-layout-verification.json：205 个文字标签的实际字框，无重叠或超出总图边界。
- overview-page-verification.json：三处真实效果播放、声音互斥、放大、全屏、缺少本地导出回退与手机布局验证。

## 既有素材

- preview.png：桌面播放器实际截图。
- mobile.png：390px 宽手机布局实际截图。
- frame-1.jpg 至 frame-6.jpg：同一渲染器的实际关键帧。
- verification.json：浏览器实际播放、跳转及手机布局结果。
- prompts.md：内置 imagegen 提示词；场景图位于 ../web/public/assets。
- song-preview.png、song-mobile.png、song-frame-*.jpg：135.59 秒演唱版的实际播放器与渲染器截图。
- online-performance.md、online-performance-plan.json：线上制作记录与原始裁剪输入计划；14 条输入不表示 14 条生成视频。
- online-performance-result.json：三条实际生成视频的线上来源、文件哈希、音频核对及八段原歌映射。
- heygen-completed-jobs.png：三条 HeyGen 人物演唱任务的实际完成记录。
- heygen-pilot-contact.jpg、heygen-batch-a-contact.jpg、heygen-batch-b-contact.jpg：三条实际视频不同时间的抽帧。
- heygen-pilot-audio-verification.json、heygen-batch-a-audio-verification.json：原音频保留与时间偏移核对，不是嘴形精度评估。
- motion-preview.png、motion-mobile.png、motion-frame-*.jpg、motion-verification.json：动态演唱版的实际网页、渲染帧和播放检查。
- motion-live-preview.png：完整版导出后，本地播放器停在副歌的实际截图，包含 MP4 下载入口。
- motion-export-contact.jpg、motion-export-audio-verification.json：从最终 MP4 抽取的六帧，以及最终音轨与原歌的互相关核对。
- higgsfield-login.png：Higgsfield 登录界面的实际截图，不是生成视频结果。
- multiscene-storyboard.md、scene-performance-plan.json：冷色机房主歌与暖色海岸结尾的分镜和 52.5 秒原唱输入映射；新增完整表演尚未通过，三条机房测试另有记录。
- multiscene-progress.json、heygen-scene-quota.jpg：两场景线上草稿与平台实际额度限制；用户选择换用其他已有额度工具。
- scene-plan-preview.png、scene-plan-verse.jpg、scene-plan-chorus.jpg、scene-plan-ending.jpg：分镜预览实际截图；机房与海岸为静帧运镜，雨夜沿用已生成的口型视频。
- scene-plan-verification.json：分镜预览的原歌实际播放、情绪段落跳转、待生成状态和手机布局检查。
- chatart-performance.md、chatart-performance-inputs.json：实际 ChatArt 平台制作记录与三条原唱 MP3 输入；输入不表示已完成生成。
- chatart-opening-generating.png：10 月 10 日机房开场任务在视频分类中实际显示生成中的截图，不是完成画面。
- chatart-opening-quality-review.json、chatart-opening-frame-review.json：实际完成样片的来源、哈希、12 帧复核及拒绝接入成片的原因。
- chatart-opening-contact.jpg、chatart-opening-face-contact.jpg、chatart-opening-at-1s.jpg：实际样片的镜头变化及脸部诊断抽帧，非新生成预览图。
- chatart-opening-audio-verification.json：原上传歌曲保留与时间偏移核对，非音素口型评分。
- chatart-revised-pilot-prompt.txt：固定构图、连续单镜头的修订输入，已用于 Seedance 短测试。
- seedance-single-shot-input.json、seedance-single-shot-submitted.png：实际 Seedance 2.0 图片与原唱 WAV 参考的 10 秒测试；扣除 120 钻石、实际提交为 480p，完成后仍未通过原唱同步检查。
- seedance-single-shot-generating.png：历史状态截图，当时新测试仍在生成；不代表当前状态。
- seedance-single-shot-completed.png、seedance-single-shot-quality-review.json：本次实际完成页面、来源、哈希与质量结论；人物稳定性改善，原唱同步不通过，不接入成片。
- seedance-single-shot-contact.jpg、seedance-single-shot-mouth-sequence.jpg、seedance-single-shot-frame-review.json：12 个全画面及 40 个连续嘴形抽帧，均来自实际视频，不是生成示意或音素精度评分。
- seedance-single-shot-audio-verification.json：实际输出与上传 WAV 的波形相关性仅 0.10525，原音轨保留检查失败；此低相关性下的峰值偏移不能当作嘴形校正值。
- chatart-lipsync-repair-input.json、chatart-lipsync-repair-prompt.txt：原唱驱动的修复测试，Art MV 8 专用演唱对口型模式，固定机位、UI 显示 10 秒，720p；实际输出仍未通过表演复核。
- chatart-lipsync-repair-submitted.png、chatart-lipsync-repair-generating.png：15:31 提交与当时生成中的历史凭证，仅本条扣除 100 钻石，未批量生成。
- chatart-lipsync-repair-completed.png、chatart-lipsync-repair-quality-review.json：最新实际完成结果与拒绝接入的结论；原唱保留，尾部无人声段仍出现嘴形开合。
- chatart-lipsync-repair-contact.jpg、chatart-lipsync-repair-mouth-sequence.jpg、chatart-lipsync-repair-frame-review.json：真实输出的 12 个完整画面及 40 个脸部样本，非音素精度评分。
- chatart-lipsync-repair-input-audio-verification.json、chatart-lipsync-repair-audio-verification.json：输入录音与实际输出音轨的分别核对，不能代替嘴形与演唱表演验收。

五张场景图是 AI 生成静帧。动态演唱段使用线上生成视频，HeyGen 水印保留。编号和预测由实际 GPT-2 运行得到；粒子和连线为视觉编排。

## 网页研究区

- ../web/public/assets/reference/token-study.mp4、shore-study.mp4：各 12 秒的真实原片研究引用，保留原声、完整画面与作者署名；分别来自原片 00:24–00:36、03:44–03:56，非完整原片，哈希与来源在 reference-source.json。

- research-preview.png、research-tests-preview.png、research-mobile.png：研究区实际桌面、三轮测试与手机截图；原片播放器保留 DJ SHO 署名。
- reference-contact.jpg：从实际下载的 DJ SHO 原片抽取九个时间点，用于确认字幕、人物、技术界面及镜头变化；不是独立生成图。
- research-page-verification.json：原片和三条拒绝样片的真实播放、定位、音频互斥、键盘、范围请求、缺少本地原片时的回退及手机布局检查。
- ../web/public/assets/research/reference-source.json：原片作者、原帖、公开媒体地址、文件哈希、大小与六处观看重点。本地 MP4 与原始下载元数据被忽略，不提交 Git。
- ../web/public/assets/research/experiment-log.json：三次实际完成但拒绝接入的测试、320 钻石扣费、音频核对与质量记录。
- ../web/public/assets/experiments/：三条原始平台输出视频及实际抽帧封面，独立供网页复核；opening-original.mp3 为原歌开头输入，均未加入成片清单。
- ../web/public/assets/research/*-quality-review.json、*-audio-verification.json 与证据 JPG：原始复核记录的网页副本，SHA-256 与下载输出核对一致。
