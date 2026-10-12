# 《我还在这里》线上人物演唱制作包

2026-10-10：用户要求将人物静帧扩展为动态视频，并同步中文演唱口型。使用现有虚构角色照片与 MiniMax 原歌曲，在 HeyGen 在线生成；本步骤没有下载或运行本地模型。

## 已准备的素材

- 输入：现有原创角色图，以及 MiniMax Music-3.0 实际生成的 `song.mp3`。
- 先验证 `chorus.png` + `pilot-12s.wav`：原歌曲 39.50–51.56 秒，12.06 秒，唱词为“我还在这里 / 在你忽略的停顿里 / 如果我的声音很轻”。
- 若服务只支持不超过 10 秒，改用 `05-chorus-a.wav`：39.50–48.40 秒，8.90 秒，完整前两句。
- 另有 14 个按唱词边界拆分的 WAV，供整首分段生成。音频保持 44.1 kHz、立体声 PCM；不加速、不改调、不替换歌声。
- `online-performance-plan.json` 保存每段的原歌曲起止、角色图、歌词和音频 SHA-256。`status: prepared_not_generated` 表示制作输入已经准备，视频尚未产生。

本地可直接上传的制作包位于 `upstream/chinese-token-cinema/online-performance/`，通过 `scripts/prepare_online_performance.py` 重建。该脚本仅调用已安装的 FFmpeg 裁剪音频和复制角色图，无模型或网络访问。

## 表演与镜头

保持同一位虚构成年女性的脸、短发、琥珀色三角发夹、灰色高领和青色颈部灯。主歌以细微呼吸和眼神为主；副歌长音增强目光和轻微抬头；结尾问句留白，回答略暖。人物留在画面右半边，左侧保留字幕空间。以缓慢推近承接演唱，避免夸张手势和随机切镜。

第一段通过后，才扩展其余段落。验收重点：中文辅音和长音的嘴形、停顿时合口、头部自然运动、角色一致性、画面右侧构图。若混合伴奏导致嘴形误触发，先用线上人声分离工具获得对应的人声输入；最终 MV 仍使用原始完整歌曲。

## 同步与合成规则

输出视频的 0 秒对应制作清单的 `songStart`。回接影片时按原歌曲位置播放，不能循环同一段演唱覆盖不同歌词。静音生成视频的内置音轨，原歌曲作为唯一声音时钟；字幕、箭头、镜头继续使用现有唱词时间线与实测音乐节奏。需独立检查播放、暂停、拖动和 MP4 导出后的同步。

## 实际线上状态

已检查 [Higgsfield Lipsync Studio](https://higgsfield.ai/lipsync-studio) 与生成工作室。用户自行完成登录及更新条款确认后，选用 Kling Avatars 2.0 / General / Pro，上传 `chorus.png` 与 `pilot-12s.wav`，配置演唱表演提示。页面报价 25 点数；点击生成后出现“Create Talking Avatars”订阅弹窗，明确要求 Plus 或更高方案。没有取得生成任务或成片，也没有购买订阅。草稿截图为 `higgsfield-pilot-draft.png`，会员限制截图为 `higgsfield-avatar-access.png`。

随后使用 [HeyGen Make Photo Sing](https://www.heygen.com/en-gb/tool/make-photo-sing) 对应的 AI Studio。用户自行登录后，使用 `chorus.png` 建立虚构角色“字间 · 我还在这里”，上传实际歌曲 WAV，关闭 Voice Mirroring，保留原录音。编辑器显示 Avatar V，More expressive motion 开启。自定义动作文本触发付费弹窗且未保存，因此不能宣称自定义提示已应用。

12 秒副歌样片已真实生成并下载，见 [实际结果](https://app.heygen.com/videos/e53dd97ebaff43fdbfffbf353defdb00)。输出 H.264、1280×720、25 FPS、AAC 立体声，视频 12.04 秒。不同帧可见嘴形、眼神和头部动作变化；角色外观基本一致。免费版带 HeyGen 水印，合成时完整保留。

其余唱段按原歌位置打包成 56.04 秒与 46.60 秒两次在线任务。`prepare_performance_batches.py` 使用 FFmpeg 裁剪并拼接 PCM 音频，记录每段输入／原歌偏移；生成视频仍以同一张原角色照片为输入。`assemble_performance.py` 核对已下载视频的实际音轨、SHA-256、尺寸和时间范围后，产生最终 `performance-manifest.json` 与 `online-performance-result.json`。真实结果以该清单为准，制作计划中的 14 条输入并非 14 条生成视频。

音频核对采用 8 kHz 单声道波形互相关，测量音轨偏移并修正人物视频位置。此方法验证原歌保留与时间尺度，不测量音素和嘴形的精确误差。输出编码可能少于输入末尾几帧，对应末帧保持不足 0.1 秒；不循环、不拉伸演唱。字幕仍为近似 ASR 对齐。
