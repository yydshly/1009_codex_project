# 中文 Token 短片播放器

## 一图总览与矢量阅读器

2026-10-12 整理版：原图移到首个内容模块，以完整图引导；首页显示上部预览，点击进入完整八模块阅读器。新增 #capabilities 的十项完整摘要、#module-map 的八模块输入输出、#extension-values 的四类扩展及条件。数据来自 assets/research/research-summary.json，与根 projects.json 摘要对应。原图 PNG／SVG 保持字节不变。

GitHub Pages 不含 ignored 完整导出。总览中的中文播放入口在主页面直接调用现有 Canvas 播放器；独立图阅读器返回 ?version=motion&start=30#stage，保留原歌曲和真实线上视频，可点击开始。原片缺少本地副本时继续使用已记录的作者公开媒体地址，并有原帖回退。

首页 #overview 将效果、机制、字幕与情绪价值、真实数据、已实现能力、三轮拒绝样片与扩展路线整理成一张图。overview.html 提供 100%–400% 矢量放大、容器滚动和全屏阅读；两页都有原片／中文实际效果播放器和高清下载。SVG 包含所有位图，不依赖外部图片。图中文字与来源另存于 assets/overview/overview-content.json，首页可展开读取。

图内两张原片帧和一张中文成片帧保持完整画面；抽象背景是明确标注的 imagegen 示意。来源与完整提示词见 [overview-source.md](../assets/overview-source.md)。没有用生成图冒充视频结果，也没有把架构参考当成本次平台内部核验。

修改图中文字和布局：编辑 ../scripts/build_overview.mjs，然后运行 node ../scripts/build_overview.mjs、node ../scripts/render_overview.mjs。渲染脚本使用现有 Playwright 与 Chrome 导出 2880×6795 PNG，检查所有文字的重叠和裁切；不下载生成模型。PNG 和自包含 SVG 位于 public/assets/overview/，可纳入 Pages 静态站。

运行 node ../scripts/check_overview_page.mjs，检查真实视频播放、声音互斥、矢量缩放、全屏、资源 MIME、手机布局及缺少 ignored 导出时的回退。报告与实际截图位于 ../assets/overview-page-verification.json、overview-preview.png、overview-mobile.png、overview-viewer-preview.png。

纯 HTML、CSS、ES modules 和 Canvas 2D，无网页或根级依赖。所有素材、声音和实际推理缓存均保存在 public/assets。

在本目录执行 npm run dev，打开 http://127.0.0.1:4324/1009_codex_project/014-chinese-token-cinema/ 。检查：npm run check。

本地资源使用相对路径，支持编号子路径；原片缺失时使用作者公开媒体地址。GitHub Pages 的 pagesDir 为 web/public，无需构建。

## 再生成声音与数据

需要 Python 3.10+，numpy、edge-tts、tokenizers、onnxruntime，以及 PATH 中的 FFmpeg。执行 python ../scripts/prepare.py。可分别传 --audio-only、--model-only。指定 revision 的模型和中间音频保存至被忽略的 upstream/chinese-token-cinema。首次生成声音及下载模型需要网络，不需要 API 密钥。

场景由内置 imagegen 生成并保存三张 PNG，提示词见 ../assets/prompts.md。

## 导出与验证

保持 npm run dev 运行，另开终端执行 npm run render。需要 Chrome、Playwright 和 FFmpeg。PLAYWRIGHT_MODULE 可设为本地 playwright/index.mjs 的绝对路径；FFMPEG_PATH 可覆盖 FFmpeg。脚本默认使用本工作区预装 Playwright。

MP4 情绪版保存到 public/exports/wo-hai-zai-zhe-li-v2.mp4，页面自动出现下载入口，输出目录已忽略。初版 MP4 保留。只验证和截图可执行 node ../scripts/render.mjs --stills-only。

默认成片是 135.59 秒动态中文演唱，保留静帧演唱和旁白版本。全部唱词使用 HeyGen 在线生成的表演，原歌为唯一播放时钟；间奏使用原场景。播放器创作说明包含数据和艺术表达的边界。

## 研究区与参考播放器

首页 #research 汇总理解、过程、结果、三轮未通过测试、最终结论与待验证路线；#reference 可直接观看原片，#experiments 对照原唱输入和实际平台输出。播放器互斥，原片不自动播放；原有主播放器和版本切换保留。

assets/reference/dj-sho-slopcore.mp4 为用户授权下载的原片研究副本，1920×1080、30 FPS、276.053333 秒，191,951,547 字节，作者 DJ SHO，未发现开源授权。该 MP4 与 .info.json 已忽略；不作为中文原创片素材。assets/research/reference-source.json 保存来源与哈希，缺少本地副本时尝试作者的公开视频地址；远端失效时页面显示错误并保留原帖入口。

重新获取本地研究副本可以使用已安装的 yt-dlp（不传账号或 Cookie）：

```powershell
yt-dlp --no-playlist --no-progress --no-cache-dir -f "best[ext=mp4][height<=1080]/best[ext=mp4]/best" -o "public/assets/reference/dj-sho-slopcore.%(ext)s" --write-info-json "https://x.com/DJ_SHO974/status/2108569544151146742"
```

既有输入和结果仍在 ignored upstream/ 时，python ../scripts/prepare_research_assets.py 可重新打包三条实验视频、封面和记录，不生成新视频、不下载模型。实际已打包的视频位于 assets/experiments/，源文件哈希与复核记录一致。该脚本需要现有 cv2，仅作抽帧。

检查网页：node ../scripts/check_research_page.mjs。检查原片与三条样片的实际播放、定位、播放器声音互斥、原唱输入、缺少本地原片时的回退、键盘控制和手机布局；结果位于 ../assets/research-page-verification.json。本地服务器使用流式范围响应，不将完整 192 MB 原片读入内存。静态资源检查 npm run check 包含拒绝状态和媒体哈希。

## 第二版配乐与字幕

执行 python ../scripts/emotion_score.py 可使用现有旁白 WAV 重生成情绪版器乐与旁白混音，不调用歌唱生成工具。原始 WAV 位于被忽略的 upstream/chinese-token-cinema；其他环境先执行 prepare.py --audio-only。

页面可比较多态字幕和初版字幕、四段情绪配乐与初版配乐。emotion-score.json 的 RMS 来自实际合成声音，驱动细小亮度变化和音量轨迹。连线包含链式、回指、分叉、断续、桥接、问句和回应，均为视觉编排。

## 演唱版

实际歌曲由用户授权在 MiniMax Music-3.0 官方网页在线生成，原 MP3 与来源记录分别为 public/assets/song.mp3、song-source.json。无需在本地下载歌曲生成模型，网页播放也不需要任何模型。

歌词识别：python ../scripts/transcribe_song.py；首尾复核追加 --review。此步骤使用小型 ASR 缓存，仅分析已生成音轨。然后执行 python ../scripts/analyze_song.py，提取近似唱词时间、拍点／起音／RMS 与镜头；python ../scripts/prepare.py --song-model 重算歌词 GPT-2 缓存。识别结果和插值边界需审阅，不能把自动结果视为录音室级精确对齐。

node ../scripts/render.mjs --song 导出演唱版 public/exports/wo-hai-zai-zhe-li-song.mp4；附加 --stills-only 只验证与截图。默认旧导出命令继续渲染旁白版，互不覆盖。135.59 秒、1280×720、24 FPS、H.264＋AAC 立体声。演唱版截图和验证分别为 ../assets/song-preview.png、song-mobile.png、song-verification.json。

歌词与制作方向见 [song-version.md](../assets/song-version.md)。时间线、节奏和推理缓存分别为 song-timeline.json、song-score.json、song-model-data.json。

## 动态人物演唱

在线生成来源和 SHA-256 保存在 public/assets/performance-manifest.json，三条原始视频位于 public/assets/motion/。仅使用线上 HeyGen，没有下载或运行本地人物模型。制作过程见 [online-performance.md](../assets/online-performance.md)。生成视频静音，按清单 start、end、offset 对应原歌；原音轨互相关测出的约 23 毫秒偏移已修正。水印完整保留。全部 27 行唱词覆盖，共八段 114.70 秒表演；并非全片所有背景都为动态视频。

node ../scripts/render.mjs --motion 导出 public/exports/wo-hai-zai-zhe-li-motion.mp4。附加 --stills-only 验证播放器。脚本先以已有 FFmpeg 生成被忽略的全关键帧渲染副本，加快定位，随后用同一 Canvas 合成器逐帧渲染；实时网页仍使用原始线上视频。渲染副本位于 public/exports/render-media/，不是模型。导出使用 H.264、1280×720、24 FPS 和原歌 AAC 立体声，不覆盖之前版本。

motion-verification.json 记录声音前进、人物视频实时偏移、暂停、八段视频解码、唱词覆盖、章节跳转、字幕切换、作品切换和手机布局。音轨相关性不能代替音素口型精度评价；字幕仍为近似 ASR 边界。线上输出末尾编码可能缺少几帧，仅保持末帧不足 0.1 秒，不循环或拉伸演唱。
