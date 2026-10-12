# 上游代码与本地修改

来源：https://github.com/ledbetterljoshua/functional-emotions-video
固定提交：b34c20a4f8f64ee87079a2ae2fdedf2cf1990a49。
许可：MIT，Copyright (c) 2026 Joshua Ledbetter；原文保留于 LICENSE。

## 引入范围

- js/paint.js：原 WebGL2 笔触渲染器。
- js/lib.js：原时间轴、动画、绘图与镜头工具；词时间查询改为数字标识查询。
- js/cast.js：原共享人物与场景组件。
- js/ch/c1.js 至 c8.js：原八个章节，静态词时间查询和口型时间标记改为对应数字标识。
- js/data.js：保留原数字音频特征，TIMING_CUES 储存数字标识对应的时间点；LYRICS 为空，无歌词句子。

main.js 的帧组装用于本地 public/player/renderer.js，并保留来源，包括镜头间笔触参数渐变。本地 public/app.js 提供完整画面、章节定位、精选循环、笔触调节、原曲联网播放和本地音频同步。人物、场景与笔触绘制算法保持原实现。

数字标识由规范化词的 32 位 FNV-1a 值生成，导入时检查碰撞；时间点和查询阈值沿用上游，保持镜头和口型节奏。此转换排除完整歌词文本，不构成对歌曲的重新授权。

没有复制歌曲、assets/ 音频、完整歌词、转写结果、旧歌词视频或完整导出程序。八张静帧来自同一提交的完整原项目，由本机另行渲染。

完整歌曲和歌词不属于上游声明的 MIT 范围；页面保留作者有声成片与原音频来源链接。点击播放后，浏览器从固定上游提交的 raw.githubusercontent.com 地址读取原曲，构建产物不包含音频副本。用户选择的本地音频通过 Object URL 播放，不上传、不持久化；刷新后需重新选择。
