# 014 · 中文 Token 短片研究记录

## 第八版：完整摘要与远端发布准备

公网初次验收发现作者 video.twimg.com 媒体源无法内嵌播放。本轮从既有本地原片截取两个 12 秒的真实研究引用，原片时间分别为 00:24–00:36 和 03:44–03:56；等比至 1280×720、保留原声、画面和署名，文件哈希与原片时间记入 reference-source.json。无完整副本时网页使用研究引用，观看点以原时间减片段起点定位，完整作品仍走 DJ SHO 原帖；未公开上传 192 MB 完整研究副本。原引导图字节保持不变。

2026-10-12，用户要求全面汇总理解、部署网页并提交远端。沿用原 PNG／SVG 完整引导图，未重新生成或改写图内像素与日期；首页把图作为第一个内容模块，保留完整矢量阅读器、真实效果播放和图中文字来源。补充十项完整摘要、八模块输入输出及四类价值／扩展条件，数据与 projects.json 的 summarySections 对应。

新增 research-summary.json／summary.js，将定位、能力、模块、底层原理、真实数据、字幕价值、情绪、尝试结论、扩展和交付边界变成可读网页。保留全部旧版本和真实失败样片，未生成新视频、未更换歌曲。没有把语音边界、能量控制和波形核对写成精确口型或人声重音评分。元描述不再被播放器覆盖成简略演唱说明。

远端采用既有 GitHub Pages 编号子路径。因本地存在多个其他项目的工作，发布在 origin/main 最新状态的独立 worktree 中准备，目录编号保持 014；只增加本项目、对应目录元数据、索引和所需工作流检查。完整 192 MB 原片研究副本和本地导出不进入 Git。远端原片沿用作者公开媒体源；没有导出的部署环境会从总览播放入口打开本网页真实 Canvas 演唱播放器，避免空视频弹窗。部署与公网验证结果追加在本文件后续记录及 deployment-verification.json 中。

## 第七版：一图说明理解、底层与扩展能力

2026-10-10，按用户要求将研究整理为一张信息完整的图，接入首页 #overview，并提供 overview.html 放大阅读器。八部分分别说明四个制作环节、模型与工程依赖、真实分词和预测、七态字幕价值、情绪推进、已经实现的研究工程、三轮拒绝样片与待验证的扩展路线。没有继续消耗生成额度，没有下载本地音乐或视频生成模型。

三张证据图来自原片 00:28、03:48 与中文动态成片 00:30，完整保留画面与水印；抽象背景由内置 imagegen 生成并明确标作艺术示意。文字与流程由 Node 标准库构建可编辑 SVG，所有位图以 data URI 内嵌；现有 Chrome 导出 2880×6795 PNG。完整提示词、位图来源、SHA-256 与六项官方机制来源见 assets/overview-source.md 和 web/public/assets/overview/overview-provenance.json。

图中分词和概率从 song-model-data.json 实际读取。ID、参数权重、中间激活和注意力分开解释；图形连线不声称是实测注意力。MiniMax Music-3.0 架构引用官方资料；HeyGen Avatar V 报告仅作机制参考，未声称逐层核验照片驱动任务内部实现。原片具体口型流程未公开，工具名称和真实权重说法保留为作者说明。字幕重音控制仍来自词长和混音 RMS，唱词仍为近似 ASR 边界。

首页和阅读器可直接播放三处真实效果，主播放器、原片、测试与总览弹窗的有声媒体互斥。缺少 ignored 中文 MP4 时回到现有 Canvas 播放器；缺少本地原片时使用已记录的公开媒体地址。矢量图支持 100%–400% 缩放和全屏，首页附完整文字和可点击来源。

render_overview.mjs 检查 205 个真实文字字框，无重叠或超出图边界；check_overview_page.mjs 验证实际视频解码和时间前进、声音互斥、矢量放大、全屏、SVG MIME、缺少导出回退及 390／768 像素手机布局。既有研究页回归检查仍通过，三轮新场景 approvedForMV 均为 false，多场景完整 MV 仍未完成。

## 基线

- 原始演示：https://x.com/DJ_SHO974/status/2108569544151146742 。研究日期：2026-10-10。
- 原片没有公开源码工程和开源许可证；本地原创场景、声音和中文文本独立创作。后续按用户要求下载原片，单独用于网页研究对照，不混入中文原创成片。
- Windows，Node.js 22.15、Python 3.10、Chrome、FFmpeg 6.1.3。
- 模型：https://huggingface.co/Xenova/gpt2 。revision：bf2c7f02e0b826c60d03af341171bde20893da66。基础 GPT-2，MIT 许可，ONNX int8 转换。
- Python：numpy、edge-tts、tokenizers、onnxruntime；浏览器：Playwright。
- 旁白：zh-CN-XiaoxiaoNeural，rate -8%，pitch -2Hz。
- 配乐：NumPy 创作合成，78 BPM、D 小调、和弦、分解音及鼓。
- 三张场景图：内置 imagegen 独立生成，实际 1672×941，人物采用静帧运镜。

## 实现

scripts/prepare.py 生成中文旁白、配乐、时间线；模型下载至被忽略的 upstream/chinese-token-cinema，通过 onnxruntime CPU 实际前向计算连续中文文本的 logits。词组起点选用其之前的 logits，完整词表 softmax 得到下一片段 Top 3 和实际片段概率。model-data.json 保存结果、来源、revision 和文件 SHA-256。

web/public/film.js 用 Canvas 2D 合成背景运镜、点阵、字幕、弧线和预测面板。app.js 以 HTMLAudioElement.currentTime 为唯一播放时钟。scripts/render.mjs 使用同一确定性帧函数与 FFmpeg 导出 1280×720、24 FPS MP4。

## 数据与表达边界

词组字幕编号由每个词组独立运行 tokenizer 取得。中文词组可能有多个 token ID。预测使用连续中文全文的因果上下文，数值没有随机填充。GPT-2 以英文为主，中文预测质量有限；不能单独解码的片段标为片段编号。

字幕时间按字数编辑分配，未使用字级强制对齐。弧线明确属于视觉编排；点阵采样原创场景像素，位置不是权重或激活。小型波形是节奏艺术示意，未声称实际音频能量。故事与情感界面为原创虚构内容。

## 验证

web/scripts/check.mjs 检查数据、概率、时间线及资源。scripts/render.mjs 检查真实声音 currentTime 前进、暂停、章节跳转、图层开关、手机无横向溢出及 pageerror，结果保存在 assets/verification.json。桌面和手机截图分别为 preview.png、mobile.png。

执行根级 npm run index:sync、npm run check、npm run pages:build。pagesDir 为 web/public，Pages 不依赖本地模型和导出 MP4。MP4 位于被忽略的 web/public/exports，不提交构建产物。

## 第二版：连线多态与情绪配乐

根据用户对初版连线过于单一的反馈，对照原片 0:28、0:48、1:56、2:04、3:00、3:48。初版把整句平铺、所有前词汇入当前词、方点作末端，且全程固定字幕位置。原片的词块更大，常集中显示少量词块；短连接、跨词回指、橙色自我指代、预测词独立强调、大字与界面切换交替使用。

第二版保留初版对比，将词块增大、每次突出 3–4 块、真实多编号换行显示。箭头沿曲线切线绘制三角端点，增加链式、回指、分叉、断续、桥接、问句和回应七种状态；光点、入场、色彩和句意联动。连线没有被当成真实注意力数据。

scripts/emotion_score.py 使用原旁白和原创器乐，形成四段立体声编排：稀疏主题，悬置和声，主题完整复现和鼓层抬升，末尾问句撤下配乐、回答后温暖和声。播放切换保持原时间与播放状态，旁白内容与时间线未改变。音量轨迹由实际混音 RMS 计算。

此版为旁白器乐基线；后续演唱实现如下。

## 第三版：MiniMax 中文演唱

2026-10-10 在官方 https://www.minimax.cn/audio/music 使用 Music-3.0，用户完成登录后授权生成。歌词与曲风存于 assets/minimax-lyrics.txt、minimax-style.txt；生成凭证 assets/minimax-result.png。原始 MP3 保存在 web/public/assets/song.mp3，44.1 kHz、立体声、256 kbps，原始 AIGC 元数据保留。来源、SHA-256 和长度见 song-source.json。没有下载或运行歌曲生成模型。

最终音频解码为 135.59 秒，27 行唱词、19 个镜头。歌曲输出没有保证符合提示词的时长、78 BPM 或 D 小调；当前 librosa 节拍估值约 112.35 BPM，属于自动分析结果，未作乐理验证。

scripts/transcribe_song.py 使用已安装 faster-whisper 与小型多语言 base ASR 分析最终音轨，缓存放在 ignored upstream/chinese-token-cinema/analysis。ASR 来源 https://github.com/SYSTRAN/faster-whisper 与 https://huggingface.co/Systran/faster-whisper-base，模型 revision 为 ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66；仅作歌词识别，不产生演唱。原始识别和首尾复核见 assets/song-recognition.json。生成末尾有重复问句，字幕保留识别到的实际重复内容。

scripts/analyze_song.py 按识别字词边界对齐歌词。词内多字均分，漏字在识别锚点间插值；每个词块保存 timingSource 和 recognizedMatch。歌唱识别存在字词混淆与边界误差，不能把它称为字级精确强制对齐。重音系数来自词长和最终混音 RMS，是视觉控制指标，未测量独立人声重音。

librosa HPSS 提取打击成分用于节拍／起音检测；最终混音每秒 30 个 RMS 样本。song-score.json 保存真实分析数据及艺术编排的切镜、推拉和淡化。关键唱词入口和检测拍点共同决定切镜。film.js 的长音弧线、起音描边、拍点脉冲和词块尺寸由这些数据驱动。人物仍为五张生成静帧的代码运镜，没有连续表演或口型同步。

对实唱歌词重新运行既有 GPT-2 ONNX，song-model-data.json 保存实际分词与预测；GPT-2 与 MiniMax 演唱生成是两个独立步骤。网页通过版本选择加载各自的音轨、时间线与数据，保留旁白版。scripts/render.mjs --song 用同一渲染器导出 MP4，检测声音播放、音轨／时间线长度、镜头变化、版本切换与手机布局，结果 assets/song-verification.json。

## 第四版：真实线上人物演唱

2026-10-10，用户要求人物动态与中文演唱口型同步，明确禁止下载本地生成模型。先在 Higgsfield 上传原照片和原唱 WAV，实际 Kling Avatars 功能要求 Plus 订阅，未产生任务或购买。转为 HeyGen，用户自行登录后，实际完成三条 AI Studio / Avatar V 视频：12.06 秒输入样片、56.04 秒输入批次 A、46.60 秒输入批次 B。真实来源、输入与输出 SHA-256、实际视频长度见 assets/online-performance-result.json；任务完成凭证 heygen-completed-jobs.png。

三个输入均使用 chorus.png 中同一位虚构女性，保留外观和构图，Voice Mirroring 关闭，上传歌曲保留原录音。在线视频包含实际连续嘴形、眼神和头部动作，抽帧见 heygen-*-contact.jpg。自定义动作文本被付费弹窗阻止，未应用，不能把默认表演归因于提示词。输出为 1280×720、25 FPS、H.264 + AAC，免费水印保留；未下载或运行人物、歌曲生成模型，未购买订阅。

prepare_performance_batches.py 将剩余原唱段无改调／无变速拼接成两条不足一分钟的音频，记录其在批次和原歌中的起止。assemble_performance.py 核对下载结果与实际上传音轨，按八段映射回接到原歌，共 114.70 秒，覆盖全部 27 行唱词。其余 20.89 秒间奏和尾声仍为原场景图、点阵和代码转场，不声称五个背景全部生成了动态视频。

以 8 kHz 单声道互相关核对原录音，三条输出波形相关性为 0.99305、0.99624、0.99576，均检测到 0.023 秒音频编码延后。合成时相应增加视频定位偏移，原 135.59 秒完整歌曲作为唯一主时钟；视频静音，不循环口型或变速。输出端可能少于输入末尾几帧，末帧保持最大约 0.063 秒。波形核对验证歌曲保留和时间尺度，不测量音素与嘴形的精确误差；ASR 字词字幕仍为近似边界。

performance-video.js 管理实际 HTMLVideoElement 的加载、播放、暂停、拖动、片段切换和确定性帧定位。film.js 在人物演唱期间保留完整视频帧和水印区域，合成字幕、实测音量轨迹、拍点脉冲与多态弧线；间奏使用原静帧镜头。默认加载动态版，可切换静帧演唱与旁白基线。原始在线素材保存在 web/public/assets/motion/，推理缓存维持原数据与声明。

render.mjs --motion 先用已安装 FFmpeg 在忽略目录生成全关键帧渲染副本，避免逐帧反复解码长 GOP；只改编码，不改变尺寸、时间尺度或水印。实时播放、暂停、跳转与手机检查使用原视频，MP4 使用同一 Canvas 渲染器，结果为 1280×720、24 FPS。motion-verification.json 保存人物与歌曲实时偏移、暂停状态、八段解码、全部唱词覆盖、字幕／作品切换和无横向溢出检查。根级索引、检查和 Pages 汇总按总库约定执行。

最终 MP4 已完成：135.589002 秒、27,391,262 字节，H.264 1280×720 / 24 FPS、AAC 44.1 kHz 立体声。与原歌曲的波形相关性 0.99943，检测偏移为 0 秒，见 motion-export-audio-verification.json。六张实际成片抽帧见 motion-export-contact.jpg。项目检查、总库 index:sync / check 和 pages:build 均通过；本次保留其他项目与既有版本。

## 第五版准备：多场景与情绪分镜（未完成生成）

2026-10-10，用户要求改变单一场景、增加主歌／副歌／结尾的情绪差异，并保持原中文演唱口型同步。prepare_scene_performance.py 从原歌精确裁出机房主歌 39.3 秒与海岸结尾 13.2 秒，保留 WAV 采样率与完整原歌哈希，记录在 assets/scene-performance-plan.json。两场总计 52.5 秒，雨夜副歌沿用已完成的对应视频。

HeyGen 在原虚构角色组中实际添加 server.png 与 answer.png 两种 Looks；草稿 b5de22edbc264763b6811cd39fa78595 配置两个场景、分别上传原唱录音，Voice Mirroring 关闭。提交后明确提示本月免费视频次数已用完，证据 heygen-scene-quota.jpg。未产生新人物视频、未购买订阅。用户选择换用其他已有额度的线上工具，实际侧边页面为已登录的 ChatArt。

scene-plan.html 是独立分镜预览，不替换现有完整 MV。冷色机房中景、雨夜近景、暖色海岸近景及环境细节共编排 21 个镜头；机房与海岸以静帧运镜显示并明确标为口型待生成，雨夜使用实际完成的视频与原歌映射。完整原歌是唯一播放音轨。check_scene_plan.mjs 验证三类场景、待生成标记、原歌实际播放、段落跳转与手机无横向溢出，保存 scene-plan-verification.json；没有将分镜预览称为已完成多场景动态 MV。

ChatArt 的 AI MV 页面显示 Art MV 8，选择演唱模式与 Performance 演唱风格。WAV 被界面拒绝，8 秒 MP3 因小于最短 10 秒被拒绝；原歌 0–10.3 秒 MP3 被接受。2026/10/10 13:38 实际提交 server.png 机房开场样片，扣除 100 钻石。截至 13:53，视频作品列表仍显示生成中。输入计划、状态证据及边界见 chatart-performance-inputs.json、chatart-opening-generating.png、chatart-performance.md。当时尚未得到新口型视频，不以暂时网络报错或其他分类的列表空白判断任务失败。

随后任务实际完成，用户指出视觉效果差。下载 6ac9d6f83b542.mp4 并实际抽取 12 个时间点，视频 10.125651 秒、音轨 10 秒，1280×720、约 24 FPS。全画面显示约 4 秒与 8 秒出现切镜，人物从右侧移到居中，脸部观感、服装和构图改变，镜头没有保持要求的连续缓慢摄影。波形相关性 0.999576、检测偏移 0 秒，仅验证原音保留，不代表口型精度。样片标记 approvedForMV=false，未接入播放器；质量记录、实际全画面与脸部抽帧见 chatart-opening-quality-review.json、chatart-opening-contact.jpg、chatart-opening-face-contact.jpg。修订输入收窄为稳定单镜头表演，2026/10/10 14:36 在图生视频入口使用 Seedance 2.0、图片与原唱 WAV 参考实际提交 10 秒测试，扣除 120 钻石，当时尚未验证结果。原选 1080p 未保持，实际提交为 480p，已说明只作表演检查；记录见 seedance-single-shot-input.json。本次未继续批量生成。

scene-shot-plan.js 共用 21 镜头分镜；播放器只有读取到实际完成且经核对的 cinema-performance-manifest.json 才启用新多场景版本。assemble_scene_performance.py 要求实际完成的线上来源、画面复核 approvedForMV=true、对应输入与完整歌曲哈希、原唱相关性与时间尺度、全部 27 行唱词覆盖。render.mjs --cinema 预留独立成片输出，不覆盖原版。该接入流程已写好，但不能把待生成输入称为实际新人物镜头。

2026-10-10 15:20 复核 Seedance 修订样片：实际完成的 6ac9e4c46a6ab.mp4 为 864×496、24 FPS、视频 10.041667 秒／音轨 10.08 秒。12 个全画面和 40 个嘴形连续样本显示人物、服装、发夹和机房右侧构图稳定，无旧样片的突切；人物连续性改善。但输出与实际上传原唱 WAV 的波形相关性仅 0.105248，原音轨保留及时间尺度检查失败，不能用低相关性的峰值偏移作为嘴形校正。嘴形的约 4.0 秒再起及约 7.25 秒放松与原歌近似边界有疑点；未声明音素精度或听觉转录。approvedForMV=false，未生成剩余场景，原完整版继续保留；来源、文件哈希、实际抽帧与限制见 seedance-single-shot-quality-review.json。本轮仅复核已完成结果，没有再次提交生成。

2026-10-10 15:31 按用户要求改用 Art MV 8 专用演唱对口型模式，原歌开头 MP3、server.png、固定机位、720p／16:9，提交一次 UI 显示 10 秒的修复测试，余额 5800→5700。输入 MP3 与原歌解码 WAV 波形相关性 0.999991、偏移 0，说明输入录音与时间尺度保留；不代表输出嘴形已通过。截至 15:42 视频作品列表仍显示生成中，没有可下载输出，未批量生成。输入、提示词、提交与当前队列证据见 chatart-lipsync-repair-*.json／txt／png。列表刷新曾暂时显示空数据，切换视频分类恢复，未当作任务失败或再次提交。

2026-10-10 16:55 复核最后一条 Art MV 8 修复测试，用户仍反馈不佳。实际完成来源 6ac9f182cc4fe.mp4，1280×720／24 FPS，原唱相关性 0.999576、检测偏移 0；人物与机房单镜头改善。既有原歌第二句约 7.54 秒结束，下一句 10.74 秒才开始，抽帧在 8.5、9.0、9.75 秒仍显示嘴形开合，演唱表演未通过，approvedForMV=false。三条新场景测试全部未批准；本轮没有继续生成。不能把保留音轨等同于口型可靠，不能依据平台标签或长提示词保证精确表演。后续人声分轨与独立视频口型处理只是待验证路线，官方参考 https://sync.so/docs/models/lipsync ，不能据此断定 ChatArt 内部故障原因。来源、哈希、实际 12／40 帧及判断限制见 chatart-lipsync-repair-quality-review.json。

## 第六版：理解、效果与最终结论接入网页

2026-10-10，用户要求将完整理解、过程、相关尝试、效果和结论放进网页，并明确授权下载原片。用现有 yt-dlp 取得作者公开 MP4，未使用账号 Cookie 或破解限制。实际文件 1920×1080、30 FPS、H.264＋AAC，276.053333 秒，191,951,547 字节；来源、SHA-256 与六处观看点保存在 web/public/assets/research/reference-source.json。原片完整保留声音与画面，独立供研究，不进入中文原创成片。MP4 与原始下载 JSON 被 Git 忽略；缺少本地副本时网页尝试作者公开 video.twimg.com 地址，失败则显示提示并保留原帖。

抽取 0:03、0:28、0:48、1:56、2:04、3:00、3:48、4:20、4:33 的实际帧，确认权重式点阵、少量大词块、跨词回指、橙色自我指代、预测面板、遮蔽界面、全身与人群、海岸回应及结尾文字。作者关于工具与真实 GPT-2 权重的说法与我们独立可核验的数据分开说明，不依据画面推定每条线是实际注意力或每个数值都已验证。

新增可见研究区：参考原片；字幕、数据、音乐与风格价值；旁白／情绪／演唱／人物／多场景五阶段；实际三次约 10 秒结果；最终结论与未测试路线。把三条拒绝样片从已有下载打包到 assets/experiments/，哈希与原复核记录一致，附原始输入、实际分辨率、320 钻石扣费、波形检查、逐帧证据与质量 JSON。它们仅为研究展示，不加入 performance-manifest.json，不生成 cinema-performance-manifest.json。

结论：字幕与音乐编排可继续用于原创表达，生成表演素材是当前主要限制。原音保留与连续性的改善不保证中文发音、长音和情绪合格；整体偏移能剪辑修正，逐字错误和间奏开口不能用时间平移修好。之前高估了换模型标签与长提示词的效果。三轮均未通过、未继续批量生成；在线分離同一原歌的人声、稳定表演、独立口型、回接原完整歌曲仅为待验证路线。[Sync 模型官方说明](https://sync.so/docs/models/lipsync) 与 [素材建议](https://sync.so/docs/compatibility-and-tips/media-content-tips) 支持人声输入建议，不能据此推断 ChatArt 的内部故障原因，也不能承诺成功。

研究区原片与样片使用原生媒体控件，和主音轨互斥；保留版本与图层操作，原生视频／音频的键盘不会触发主片快捷键。服务器改为流式范围响应，避免每次原片请求把 192 MB 全量读入内存。check_research_page.mjs 实测原片和三条样片的播放、时间点、声音互斥、原唱输入、移动布局及缺少本地原片的回退；结果与真实截图见 assets/research-page-verification.json 和 research-*.png。
