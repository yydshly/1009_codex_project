# R13 · 让选择成为生活中的变化与回应

2026-10-10，Windows / Node.js 22.15.0 / Three.js 0.186.1。沿既有六章故事和五处空间继续完善，不要求复制原应用的镜头和美术。用户的视觉接受不代为确认。

[交互成品](http://127.0.0.1:4313/1009_codex_project/013-xinjiang-knowledge-sandbox/?demo=1) · [完整有声演示](recordings/xinjiang-lived-story.mp4) · [网页探索手记](../../web/public/explorations.html#outcomes)

## 画面、动作与声音

| 空间 | 需求与选择 | 可见变化与人物回应 |
| --- | --- | --- |
| 山水 | 观察冰雪、沟谷、绿洲及来水条件 | 原始高程与卫星纹理持续使用；区域显示平滑，微缩水线流向下一处叙事空间 |
| 集市 | 织物、补给、器物对应家人、远行者与手艺人的需求 | 搬运、接手、使用和点头；孩子披裹、补给食物、器物工作台随所选货物出现 |
| 家庭 | 跟随准备、远行和抵达，选择先引水或先安顿 | 水闸与田地、居室与灯依次变化；迎接、整理物件、孩子坐下接到生活回应 |
| 庭院 | 从共同实践进入传习，可参与一拍 | 示范、停顿、学习者看向双手并接拍、同伴回应；棚架、地毯、茶具围出日常空间 |
| 关口 | 分别办理或协同办理，改变绿地保留 | 信息屏、服务人员、闸杆和同一辆车连续回应；部分车辆进入等待区 |

人物增加头部、肘膝与动作阻尼，统一土墙和地面材质，调整近景避免树木、道具和招牌遮挡。主线仍为六章、30段、420秒，单段按动作安排为10—20秒；结尾20秒沿线回看五处空间，再回到地球和结果。

30条中文旁白为本地 Microsoft Huihui Desktop / System.Speech 合成，讲稿独立编写。过滤噪声、简洁音色、脚步、交接和回应声由 Web Audio 原创生成；环境声与旁白同时送入扬声器和录像音轨。没有使用真人或原视频音频，没有复原木卡姆音乐或舞蹈。首次原生点击开启声音，自动播放需点击“开启声音”。

## 证据和过程保留

| 路径 | 内容 |
| --- | --- |
| `source-before/`、`before/` | 实际 R12 顶层文件、前一轮审核截图与旧入口预览 |
| `source-recorded/` | 录制前实际 R13 顶层源码，核心播放器文件与最终交付逐字节核对 |
| `source-v1/`、`recordings/v1/` | 第一次完整有声录制及对应源码、解码检查；家庭近景修正后独立保留，未当作最终版 |
| `after/` | 本轮原生页面、回应、连续播放、窄屏、结果和交付截图 |
| `verification-interactions.json` | 织物回应、两种家庭顺序、参与一拍、协同办理与绿地、结果恢复的原生操作记录 |
| `audio-source/` | 30条原始WAV、原始时长；MP3及哈希在网页audio/manifest.json中 |
| `recordings/visual-sound-check*` | 先行画面与音轨联测原片及实际字幕时刻，保留未作为最终版的素材 |
| `recordings/xinjiang-lived-story.*` | 从入口连续录制的最终WebM母片及H.264/AAC成片 |
| `recordings/xinjiang-journey-cues.json` | 开场、30段与自然结束的真实录制时刻 |
| `video-frames/` | 从完整成片解码的章节、各生活段、动作与镜头画面 |
| `implement-*.py`、`render-narration.ps1` | 实际开发与声音制作脚本，不重复执行非幂等变换 |
| `render-recording.py`、`update-docs.py`、`update-journal.py` | 编码检查、文档和网页探索记录步骤 |

`02-market-needs.png` 和 `03-cloth-response-v1.png` 保留了首版交接道具过大和树木遮挡的问题；修正后重新载入、连续录制。`06-courtyard.png` 保留了首版地面遮住地毯的问题；铺石高度已修正。`07-gate-v1.png` 为关口招牌调整前画面。这些过程帧不当作最终效果。

第一轮完整录制后，近景操作复核发现孩子被居室侧墙遮挡；家庭安顿的目标位置改到门前，选择与结果恢复自动重新取景，再从入口连续录制。`21-final-home-first.png` 为遮挡修正前；`22-final-visible-family.png` 为点击中断进入镜头后停在建筑背面的检查帧，选择后的自动取景已修正。`23-final-family-at-door.png` 才是门前人物完整可见的最终近景。`25-final-entry.png` 为加载过程帧，不作为成品入口；`26-final-ready-entry.png` 为准备完成后的入口。`15-final-courtyard.png.png` 实际拍到关口，保留原文件名和实际像素，网页按关口正确使用。

[四处生活空间修改前后](before-after.jpg) 使用实际截图，构图与操作时刻不同，不能据此量化同一镜头画质。`comparison-frames.json` 记录准确文件。最终播放器25个文件、静态构建文件和30条旁白分别见 [录制源码核对](source-recorded/runtime-equality.json)、[构建核对](build-verification.json)、[声音核对](audio-verification.json)。

声音联测确认VP9/Opus双轨，前25秒音频平均-30.9dB、峰值-5.7dB。旁白逐条校验讲稿、字节数、哈希和时长；`future-evidence`原始WAV10.492秒，MP3以1.12× tempo压到本段10秒内，原始WAV不改。语音录制原理无需摄像头或麦克风权限。

最终媒体参数、完整解码、音量和实际时长见 [媒体验证](recordings/media-verification.json)。主线录制不拖动进度、不暂停、不改变视口或源码、不调整速度，仅结尾停留裁为8秒；各段真实录像时刻不等于内容秒数。

## 数据与表达范围

真实DEM、NASA和Sentinel-2影像的原始文件及哈希保留。区域显示使用193×129邻点加权网格，源为769×513网格，默认高度显示22×；不是提高真实分辨率。天池、冰谷窗口和日期继续沿用已有观测。

微缩水线、舞台距离、家庭房屋、棚架、服饰和道具为概括教学创作，未复原特定建筑或民族样式。各年代与社区分别说明，不把西迁家庭与另一社区的木卡姆实践当作同一人群的经历。家庭顺序、拍点、服务时长、车流和绿地参数没有真实测量标定。原应用源码、模型和完整课程仍未取得。

R1—R12素材和旧冻结档案继续保留，未覆盖。

[本轮冻结清单](../checkpoints/2026-10-10-lived-outcomes/materials.json) · [本轮源码与素材 ZIP](../checkpoints/2026-10-10-lived-outcomes/source-and-materials.zip)。冻结包含当前网页、声音与本轮全部过程；此前轮次仍在原目录和独立冻结档案中。

## 最终实际交付记录

完整MP4 435.467秒（内容进度420秒，含实际进入、帧时序和结尾8秒停留），1280×720、30fps、H.264/AAC双轨，78576499字节。六章30段与开场、自然结束顺序完整，8个媒体章节。全音画解码通过，黑屏检测无片段；平均音量-31.8dB、峰值-5.6dB。SHA-256：a3d0aaf36abb3a1621bdbc6df89e170b7ea3e5867f18b21ecdc9b2fa921afdc9。原始母片461.947秒独立保留，未改变主线速度。

最终原生操作核对了织物使用与回应、先安顿后引水的顺序、传习参与、协同办理与45%绿地，以及四项个人观察和家庭选择恢复。390×844家庭与探索手记无横向溢出，新截图均加载完成。浏览器全程没有警告或错误。详见verification-final-interactions.json、verification-mobile.json、verification-journal.json及recordings/browser-logs.json。
