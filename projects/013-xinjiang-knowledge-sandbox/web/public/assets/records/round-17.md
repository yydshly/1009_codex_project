# R17 · MiniMax 自然语音与完整故事（2026-10-11）

在 R16 已实现的五处选择与回应基础上，将30条旁白、19条可用人物对白接入 MiniMax speech-2.8-hd，采用9个系统声线，保持角色一致。主线六章30段，474秒（7:54），完整录像另外包含入口和结果停留。

已完成：49段语音与实际声窗核验通过；六章完整连续录像、30段镜头与自然结果、音量及全片解码通过。完整影片8分37秒，无黑屏或削波。旧音频完整保留在 source-before/public/assets/audio；R16 的十条分支截图与原生状态继续保留在 ../round-16/。R16 未保存的完整录像不作为成果证据，原因记录见 recording-recovery.json；上一轮已保存的 R15 完整电影仍在原位置。

- audio-source/work-orders.json：49句文本、实际调度窗口、角色声线和语速。
- audio-source/generated/：所有请求、原始输出、生成回执、候选 take、归一化成品、SHA256。
- source-before/：改造前真实运行源码和音频。
- scripts/：生成、连续性修正、视频编码和验收代码。
- after/：本轮实际浏览器截图。
- recordings/：保留真实连续 WebGL、字幕、声音 master，时间日志和完整 MP4。

语音为原创普通话AI合成，并非社区访谈、历史引语或真实人物克隆；环境与教学节奏是原创 Web Audio，不声称还原木卡姆作品。MiniMax 密钥仅在本地生成进程中使用，不写入网页、素材或回执。


[观看完整MiniMax有声影片](recordings/xinjiang-lived-story.mp4) · [完整母片](recordings/xinjiang-lived-story.webm) · [实际音画验收](recordings/media-verification.json) · [四幕前后对照](comparison-r17.jpg) · [音频验收](audio-verification.json) · [网页探索总结](../../web/public/explorations.html#guided-scenes)。

原始53个take、请求与回执、49段交付音频、改造前与录制时源码、原生交互证据、实际电影实帧和完整影片共同保留；最终素材索引为 materials.json，归档为 source-and-materials.zip，CRC及逐文件SHA256检查完成后生成索引。
