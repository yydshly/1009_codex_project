# 原创演示素材

《光种的旅行》，2026-10-09。音乐乐谱、合成代码、六镜头故事和场景代码由本次助手编写，未采样上游歌曲或其他音频。油画笔触使用上游 MIT 渲染器，许可证保留于 web/vendor/functional-emotions/LICENSE。

- seed-journey.wav：32 秒原创程序合成器乐，22050 Hz、16 位立体声 PCM。
- score.json：音乐参数、音符事件、48 拍时间点及六镜头分镜。
- shot-1.jpg 至 shot-6.jpg、seed-journey-poster.jpg：新场景代码实际渲染静帧，1920×1080，非占位图。

音乐由 scripts/generate-demo-music.mjs 可重复生成；静帧由 scripts/render-demo.mjs 渲染。可选 MP4 为离线产物，保存于被忽略的 upstream/functional-emotions-video-review/out/original-demo/，不提交到源码。
