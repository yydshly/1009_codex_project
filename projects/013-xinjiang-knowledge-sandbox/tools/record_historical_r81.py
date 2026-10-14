"""Record factual correction, evidence and unchanged media before freezing R81."""
from pathlib import Path
import json
import os
import hashlib

PROJECT = Path(__file__).resolve().parents[1]
ROUND = PROJECT / 'process/round-81'
notes = '''# R81 · 纠正张骞荒漠情境的历史归属（2026-10-14）

用户指出R80荒漠场景缺少真实历史依据。本轮承认：沙丘、风沙、取水和随行者动作是原创，不能证明对应张骞第一次出使的某个路段。撤出历史导演并替换误导性的承接旁白。没有把荒漠换成另一种猜测景观，也不据此断言张骞从未经过荒漠。

## 史料与呈现

《史记·大宛列传》中文原文记载出陇西、扣留十余年，脱身后西走数十日到大宛，大宛发向导，抵康居，经康居至大月氏，从月氏至大夏；未取得希望的结盟结果，归途再次被扣留，后来返汉。中国国家博物馆出使介绍作交叉核对。未采用二手文章相互矛盾的脱身年份。没有依据唐代壁画还原汉代服饰。

- 《史记·大宛列传》 https://ctext.org/shiji/da-wan-lie-zhuan/zhs
- 中国国家博物馆 https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/
- 敦煌研究院 https://www.dha.ac.cn/info/1266/2524.htm
- 中科院地理所（现代地域释读） https://igsnrr.cas.cn/cbkx/kpyd/dlxj/202009/t20200910_5692662.html

六处点仅表示现代地域参照，不表示古国边界、古都坐标或道路。经历按钮表示时间顺序；扣留阶段没有位置标记；去除区域点之间的连续行进线。补齐康居、大夏及返汉经历。沙丘模型、相机、风沙和取水动画保留为独立动画实验；介绍和场景库不再称之为张骞出使。

## 声音与交互

重新生成一条MiniMax普通话旁白（38.412秒），原始音频、请求内容哈希、响应摘要和归一化交付保留在audio/；不包含凭据。旧荒漠录音保留但archiveOnly，不在任何历史导演播放。段落使用接口时序；段落内具体词句的时间用字数比例估计，未宣称逐字对齐。三路径共42幕，原有自由操作、暂停、接管、选幕及返回地图保留。

浏览器实际检查：扣留说明、大宛/康居/大夏地域选择及来源展开；返回历史地图；导演入口与十五幕列表；新旁白幕自然转到后续交流，已没有荒漠幕；暂停；独立实验的归属说明。检查范围没有扩写成三条全程或汉代场景复原验收。

截图与源码按SHA-256增量保存，以round-80为基底。五张过程中截图及最终交付截图保留；没有制作新影片，既有影片不改动。网页、项目索引共用截图硬链接；未新增累计压缩包。主检查日志见check-delivery.txt，先前缺少新记录链接的检查输出保留在check-final.txt。
'''
(ROUND / 'README.md').write_text(notes, encoding='utf-8')
target = PROJECT / 'web/public/assets/records/round-81.md'
if not target.exists():
    os.link(ROUND / 'README.md', target)
sources = {
 'round':'R81','reason':'Remove unsupported R80 desert reenactment from historical presentation.',
 'primary':{'url':'https://ctext.org/shiji/da-wan-lie-zhuan/zhs','basis':'Chinese original retrieved through indexed search; direct access returned 403.','supports':['出陇西','扣留十余年','大宛','康居转送','大月氏','从月氏至大夏','归途再次扣留后返汉'],'doesNotEstablish':['specific dune landscape','water-drinking gestures','exact roads','costume reconstruction']},
 'crossChecks':[
  {'url':'https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/','role':'Mission chronology and documented destinations'},
  {'url':'https://www.dha.ac.cn/info/1266/2524.htm','role':'Institutional account of mission; inconsistent escape year not adopted; Tang painting not used as Han costume evidence'},
  {'url':'https://igsnrr.cas.cn/cbkx/kpyd/dlxj/202009/t20200910_5692662.html','role':'Modern regional interpretation, not exact route or borders'}],
 'policy':'Documented regions without roads; unknown captivity not geolocated; original desert assets retained separately.'
}
(ROUND / 'sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
current = json.loads((PROJECT / 'web/public/assets/audio/director/manifest.json').read_text(encoding='utf-8'))
previous = json.loads((PROJECT / 'process/round-80/source-recorded/public/assets/audio/director/manifest.json').read_text(encoding='utf-8'))
changed = [c['id'] for c in current['clips'] if c['sha256']!=next(o['sha256'] for o in previous['clips'] if o['id']==c['id'])]
assert changed==['zhang-mission-route']
record = {'changedAudio':changed,'unchangedAudio':len(current['clips'])-len(changed),'archivedClip':'zhang-desert','archivedHashPreserved':True,'noNewMovie':True,'historicalDesertShotRemoved':True,'docLinkShared':os.path.samefile(ROUND/'README.md',target),'verificationScope':'Targeted historical correction; not full verification of all three historical paths.'}
(ROUND / 'browser-verification.json').write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('R81 evidence and unchanged-media comparison recorded.')
