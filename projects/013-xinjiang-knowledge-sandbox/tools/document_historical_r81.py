"""Document R81 correction and share one screenshot without duplicating media."""
from pathlib import Path
import json
import os
import re

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT.parents[1]
WEB = PROJECT / 'web/public'
ROUND = PROJECT / 'process/round-81'
for target in [WEB / 'assets/process/r81-recorded-regions.png', PROJECT / 'assets/preview-r81.png']:
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        os.link(ROUND / '03-recorded-regions.png', target)

intro = '''## R81 · 历史依据纠正

R80的沙丘、风沙、取水与人物行进没有对应张骞第一次出使路段的依据，不能作为历史复原。已将荒漠近景与旧旁白移出默认历史导演；已有模型保留为独立动画实验，入口、标签与介绍均明确无历史行程归属。下面的R80记录是已被本轮纠正的探索过程，不能当作当前历史实现依据。

依据《史记·大宛列传》及中国国家博物馆的出使介绍，地图依次展示出陇西、长期扣留、到大宛、经康居到大月氏、至大夏及归途再被扣留后返汉。补齐康居、大夏；拘留地点不定点，地域之间不连未经本项目考定的道路。现代地域参照不是古国边界或古都坐标。

本轮重新生成一条MiniMax旁白，逐段突出相应地域；字幕与视觉提示采用接口段落时间，段落内语句位置按文字长度估计，尚非逐字对齐。三条历史导演共42幕，37份已有录音保留，其中旧荒漠录音仅归档；现用导演录音36份，跨路径实际独立新增录音27份。暂停、接管、缩放及返回地图保留。汉代人物服饰与沿途景观尚未完成考据，不将独立实验视为汉代复原。

来源：《史记·大宛列传》 https://ctext.org/shiji/da-wan-lie-zhuan/zhs ；中国国家博物馆 https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/ 。来源复核、实际截图、音频母片、请求与交付哈希、检查及源码增量记录见process/round-81/。

'''
for doc in [PROJECT / 'README.md', PROJECT / 'web/README.md']:
    heading, body = doc.read_text(encoding='utf-8').split('\n', 1)
    if doc.parent.name == 'web':
        heading = '# 新疆3D知识平台 · R81依据史书记载定位地域'
    doc.write_text(heading+'\n\n'+intro+body.lstrip('\n'), encoding='utf-8')
for doc in [PROJECT / 'research.md', WEB / 'ATTRIBUTION.md']:
    doc.write_text(doc.read_text(encoding='utf-8')+'\n\n'+intro, encoding='utf-8')

doc = WEB / 'overview.html'
s = doc.read_text(encoding='utf-8')
s = s.replace('R80地图远行与荒漠使团：', 'R81历史依据纠正与到访地域：')
s = s.replace('R80 · 地图远行 / 走进荒漠使团', 'R81 · 史书记载 / 出使经历与地域')
s = s.replace('张骞新增地域方向、旅程中断与荒漠近景；可暂停、切换风沙、取水、选幕与接管。', '张骞补齐康居、大夏与返汉经历；未考定道路不连线，荒漠实验移出历史导演。')
s = s.replace('./assets/process/r80-envoy.png', './assets/process/r81-recorded-regions.png')
s = s.replace('width="1058" height="871" alt="R80实际3D网页：使团迎风行走，旌节、驮载与可控旅程同屏"', 'alt="R81实际网页：到访地域与史书记载对照，不连未考定道路"')
s = s.replace('R80实际网页 / 荒漠远行、风沙与补给', 'R81实际网页 / 出使经历与到访地域')
block = '''<section id="envoy-journey" class="section"><div class="section-heading"><div><p class="eyebrow">R81 / HISTORICAL EVIDENCE</p><h2>先看记载，再看地域。</h2></div><a class="text-link" href="./?scene=earth&amp;learn=history&amp;learnEvent=zhang&amp;journey=map">查看出使经历与地域 ↗</a></div><p>《史记·大宛列传》记载出陇西、被扣留十余年，脱身后到大宛，经康居到大月氏，并到过大夏；归途中又被扣留，后来返汉。地图对应这些经历，不复原未经考定的行走道路。</p><div class="source-columns"><article><h3>有依据的经历</h3><p>点选七段经历或六处地域参照。拘留地点不编造坐标，地域点不表示古国边界或古都坐标。</p><a href="./?journey=map&amp;learn=history&amp;learnEvent=zhang">自己对照地图 ↗</a></article><article><h3>纠正上一轮的荒漠情境</h3><p>沙丘、风沙和取水动作没有对应张骞路段的依据，已撤出历史导演。原模型仅保留为独立动画实验，旧素材按增量留档。</p><a href="./?journey=near&amp;scene=journey">查看独立动画实验（无历史归属） ↗</a></article><article><h3>区分出使和长期交流</h3><p>新旁白与地域提示对应，再回看外交结果及此后的往来。喀什集市仍是跨时期的原创交换情境，不表示张骞在此停留或汉代集市复原。</p><a href="./?director=zhang">打开修正后的导演 ▷</a></article></div><p class="fine"><a href="https://ctext.org/shiji/da-wan-lie-zhuan/zhs">《史记·大宛列传》原文 ↗</a> · <a href="https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/">中国国家博物馆 ↗</a> · <a href="./assets/records/round-81.md">纠正与增量记录 ↗</a></p></section>'''
s = re.sub(r'<section id="envoy-journey".*?</section>', block, s, count=1, flags=re.S)
s = s.replace('R80 / WATCH AND EXPLORE', 'R81 / WATCH AND EXPLORE')
s = s.replace('R80 地图远行与荒漠使团 · 三路径43幕', 'R81 历史依据纠正与到访地域 · 三路径42幕')
doc.write_text(s, encoding='utf-8')

catalog = json.loads((ROOT / 'projects.json').read_text(encoding='utf-8-sig'))
row = next(r for r in catalog['projects'] if r['id']=='013')
row.update(summary='R81：地球、新疆地图、三条历史路径与地点联动；张骞依据史书记载补齐康居、大夏及返汉，未考定道路不连线，无依据荒漠情境移出历史导演。42幕有声导演；自由操作、暂停、接管与返回保留，过程按SHA-256增量去重。', preview='assets/preview-r81.png', previewCaption='R81实际本地3D网页：史书记载与到访地域对应；现代地域参照，不复原未考定道路或古国边界。')
(ROOT / 'projects.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('R81 descriptions and shared preview updated.')
