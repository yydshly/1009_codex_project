"""Update R80 live descriptions, using one shared actual screenshot."""
from pathlib import Path
import json
import os

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT.parents[1]
WEB = PROJECT / 'web/public'
EVIDENCE = PROJECT / 'process/round-80'

for dest in [WEB / 'assets/process/r80-envoy.png', PROJECT / 'assets/preview-r80.png']:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        os.link(EVIDENCE / '07-desert-low-follow.png', dest)
old = EVIDENCE / '04-free-wind-final.png'
if old.exists():
    old.rename(EVIDENCE / '04-occlusion-matrix-attempt.png')

intro = '''## R80 · 张骞远行从地图走进荒漠

第一次出使新增地域方向图：长安、陇西方向、大宛和大月氏为地域参照，标记在十余年扣留阶段停止；不把第一次出使画成后来的长期交流网络。从同一入口进入原创荒漠近景，五位随行者、驮马、旌节、行装、足迹与风沙随进程运动；迎风缩短步幅、抬手护脸，补给时停下并取水。可以切换风沙、主动停留、拖动进度、旋转缩放、重新跟随和返回历史地图。

张骞自动导演在背景之后接上“第一次远行”“走进荒漠”，再返回外交结果、长期交流和喀什集市。新增两条MiniMax旁白与同步字幕；三条导演共43幕、37份独立录音，旧音频继续复用。15个模型场景含新增远行场景，原有操作保留。镜头自动避开通道上的沙丘遮挡。

地域方向不表示考证逐站行程；地貌、人物动作和服饰为原创情境，未作具体地点或汉代服装的考古复原。新增环境声由WebAudio合成，不是实地录音。主检查102项与故事播放器14项通过；浏览器检查新增两幕的自然衔接、暂停、接管、返回、风沙、补给及390×844窄屏，未将局部验证写成三条全片重新验收。实际截图、音频源素材与源码按round-79基底增量保存，见process/round-80/。

'''
for doc in [PROJECT / 'README.md', PROJECT / 'web/README.md']:
    heading, body = doc.read_text(encoding='utf-8').split('\n', 1)
    if doc.parent.name == 'web':
        heading = '# 新疆3D知识平台 · R80地图远行与荒漠使团'
    doc.write_text(heading + '\n\n' + intro + body.lstrip('\n'), encoding='utf-8')

research = '''

## R80 · 第一次出使与远行情境（2026-10-14）

依据中国国家博物馆“中华史诗”展览与敦煌研究院《张骞出使西域图：凿空丝路的图像记忆》，采纳公元前138年出发、十余年被扣留、后经大宛与康居至大月氏、结盟目的未达成的叙述。未为拘留地点编造坐标，未采用资料中相互矛盾的脱身年份。现代地域参照点和区域连线不表示精确道路。

- 中国国家博物馆：https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/
- 敦煌研究院：https://www.dha.ac.cn/info/1266/2524.htm
- UNESCO长期交流网络：https://whc.unesco.org/en/list/1442/

荒漠地形、沙纹、随行者、驮马、旌节、水囊、动作、足迹和环境声均为本地原创。服饰未完成汉代考据，形象不定义民族身份；近景不是张骞亲历的具体停留或测绘地貌。旌节按持节叙述概括表达，未作器物复原；敦煌唐代壁画不作为汉代服装复原依据。

两条原创中文旁白使用MiniMax speech-2.8-hd和既有系统普通话声线，32kHz单声道128kbpsMP3，响度目标−18LUFS、真峰值−1.5dBTP。没有声音克隆或民族口音模仿。字幕优先采用接口时序，缺失时按文字长度分配；第二条字幕下载失败后保留已成功生成的音频，没有再次请求合成。母片、请求内容哈希、响应摘要和交付哈希留档，凭据不入档。
'''
for doc in [PROJECT / 'research.md', WEB / 'ATTRIBUTION.md']:
    doc.write_text(doc.read_text(encoding='utf-8') + research, encoding='utf-8')

doc = WEB / 'overview.html'
s = doc.read_text(encoding='utf-8')
s = s.replace('R78直接选幕与独立镜头控制：', 'R80地图远行与荒漠使团：', 1)
s = s.replace('R78 · 三条有声导演 / 下方直接选幕、自由缩放', 'R80 · 地图远行 / 走进荒漠使团', 1)
s = s.replace('观看时可缩放、转动，旁白与动作继续；可主动暂停、选幕与接管。', '张骞新增地域方向、旅程中断与荒漠近景；可暂停、切换风沙、取水、选幕与接管。', 1)
s = s.replace('./assets/process/r78-director-controls.png', './assets/process/r80-envoy.png', 1)
s = s.replace('width="1280" height="720" alt="R78实际网页：下方直接显示幕次，观看时可自由调整镜头，旁白与人物动作继续"', 'width="1058" height="871" alt="R80实际3D网页：使团迎风行走，旌节、驮载与可控旅程同屏"', 1)
s = s.replace('R78实际网页 / 直接选幕、独立调整镜头', 'R80实际网页 / 荒漠远行、风沙与补给', 1)
s = s.replace('<strong>14 <small>场景</small></strong>', '<strong>15 <small>场景</small></strong>', 1)
block = '''<section id="envoy-journey" class="section"><div class="section-heading"><div><p class="eyebrow">R80 / A JOURNEY YOU CAN ENTER</p><h2>地图上的远行，走进荒漠里的使团。</h2></div><a class="text-link" href="./?scene=earth&amp;learn=history&amp;learnEvent=zhang&amp;journey=map">从地域方向开始 ↗</a></div><p>第一次出使沿长安、陇西方向、大宛和大月氏的地域参照推进。十余年扣留让标记停下；这段旅程与后来的长期交流网络分别呈现。</p><div class="source-columns"><article><h3>方向与中断</h3><p>点选地图标记或拖动进度，看清出发、中断与抵达，再选择进入荒漠。</p><a href="./?scene=earth&amp;learn=history&amp;learnEvent=zhang&amp;journey=map">操作地域路线 ↗</a></article><article><h3>让远行发生在画面里</h3><p>随行者、驮马、旌节和行装在沙丘间移动并留下足迹。迎风护脸减速，停下取水、互相照应；可以环视、缩放、回拨与重新跟随。</p><a href="./?scene=journey&amp;learn=history&amp;learnEvent=zhang&amp;journey=near">走进荒漠使团 ↗</a></article><article><h3>接回完整故事</h3><p>导演新增“第一次远行”“走进荒漠”，讲解与场景同步，再回到外交结果、长期交流和喀什集市。</p><a href="./?director=zhang">打开张骞自动导演 ▷</a></article></div><p class="fine">地域线为方向示意，不是考证逐站行程。地貌、动作和服饰为原创情境，未作考古复原。<a href="./assets/records/round-80.md">实际检查与增量记录 ↗</a></p></section>
'''
s = s.replace('<section id="cartographic-reading"', block + '<section id="cartographic-reading"', 1)
s = s.replace('R78 / WATCH AND EXPLORE', 'R80 / WATCH AND EXPLORE', 1)
s = s.replace('R52 连续球面与按需分析 · 八种地球图层与八段历史 · 原场景14个 · 历史影片R31 · 2026.10.13', 'R80 地图远行与荒漠使团 · 三路径43幕 · 15个场景 · 历史影片R31 · 2026.10.14', 1)
doc.write_text(s, encoding='utf-8')

doc = ROOT / 'projects.json'
catalog = json.loads(doc.read_text(encoding='utf-8-sig'))
row = next(r for r in catalog['projects'] if r['id'] == '013')
row.update(summary='R80：地球、新疆地图、三条历史路径与地点联动；张骞新增第一次出使方向与荒漠使团，风沙、足迹和补给可控制。43幕有声导演，暂停、选幕、缩放、接管与返回保留；过程按SHA-256增量去重。', preview='assets/preview-r80.png', previewCaption='R80实际本地3D网页：使团迎风行走，旌节、驮载与可控旅程同屏；原创情境，非考古复原。')
doc.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('R80总览、文档、元数据与共享预览已更新。')
