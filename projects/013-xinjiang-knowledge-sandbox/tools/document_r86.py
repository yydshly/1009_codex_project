"""Publish live R86 notes and share screenshots; never rewrite a frozen round."""
from pathlib import Path
import json
import os

P=Path(__file__).resolve().parents[1]
R=P/'process/round-86'
W=P/'web/public'
assert not (R/'retention.json').exists(), 'R86 is frozen'

intro='''## R86 · 三条路径，用实际模型变化接回地图

张骞路径进入喀什的跨时期交换情境后，选择织物、补给或器物，画面依次突出需要、搬运交接、使用与不同人物回应。金色联系线跟随真实搬运位置，完成使用后变为青色；镜头、当前标题、步骤与字幕读取实际模型状态。未选的需要保留，完成的观察带回交流地图。

都护路径以现代轮台地域作定位参照，进入抽象结构后，点击一次即可依次观察入口、屋盖展开、标记通过通道进入再返回。方向箭头随进入和返回改变，屋盖与往来均可暂停，仍可自由缩放；完成后带回机构与地方地图。旧部件、单独屋盖和联系操作折叠保留，锡伯的按年代屯居与水利样板继续沿用。

导演近景的观察步骤也由真实模型状态推进。修正跨路径切换时错误保存/恢复其他模型视角的问题；进入场景必须核对实际工作台场景，不能只因引导文字已切换就开始讲解。保留三路径43幕、37份有效旁白、下方选幕、自由接管、暂停与返回地图；本轮复用已有声音，没有新增影片或音频副本。

历史依据与机制情境分开：张骞出使不等于后来的整个交流网络，集市不作汉代喀什或张骞停留的复原；结构不是乌垒城实测布局或真实行政程序。现有近景仍为解释模型，人物与建筑资产尚未达到写实历史复原。本轮只改善联动、观察与交互，没有宣称三条路径已同等完成。

截图、早期裁切和错误切换候选、检查、依据与最终源码以round-85为基底按SHA-256增量保存，旧影片与声音继续共享。'''

for path in [P/'README.md',P/'research.md',P/'web/README.md']:
    text=path.read_text(encoding='utf-8')
    if '## R86 ·' not in text:
        head,tail=text.split('\n',1)
        path.write_text(head+'\n\n'+intro+'\n\n'+tail.lstrip(),encoding='utf-8')

notes='# R86 · 从实际模型观察，带回地域联系\n\n'+intro+'\n\n'
notes+='''实际浏览器检查：集市三种使用结果；器物观察带回喀什地图；都护的入口、展开与完整内外往来；暂停后滚轮不改变屋盖1.1000和往来进度0.4285；恢复后到达1.0000并停止。360×800检查结构、字幕、操作与返回入口。导演选幕复核都护往来及张骞补给，跨路径错误切换的候选与修正画面均保留；详细状态见browser-verification.json。

验证范围：自动检查覆盖配置、全部声音资源与纯状态逻辑；本轮浏览器针对新增近景与跨路径切换验证，没有重新录制或声称逐秒复看三条完整导演。01、02为改前，03为顶部裁切候选，11为跨路径错留地形的候选；07、08、12为修正画面，04、05、06为实际选择与返回。

当前局限：都护仍是抽象城门/通道结构，不能据此推断制度运作；市场是跨时期生活机制，不是特定古代集市复原。地图与模型的尺度切换是引导镜头与画面衔接，尚未实现全球连续高精度地形加载。
'''
(R/'README.md').write_text(notes,encoding='utf-8')

sources={
 'round':'86','reviewed':'2026-10-14','newHistoricalClaims':False,
 'sources':[
  {'url':'https://whc.unesco.org/en/list/1442/','role':'长期多区域交流、停留与聚落的背景；不证明此集市、人物服饰或张骞行程'},
  {'url':'https://wlt.xinjiang.gov.cn/wlt/mtbd/202303/2c41806b10f84069bbbe1adb542db056.shtml','role':'西域都护及乌垒相关考古研究背景；现代轮台仅作地域参照，不确定该结构布局'},
  {'url':'https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml','role':'沿用R85分期与安置、水利依据，未修改年代'}
 ],
 'scope':{'market':'原创跨时期机制情境，不作汉代喀什或张骞某次停留复原','structure':'抽象空间观察，不作古城实测布局、辖区或行政程序','routes':'沿用历史依据与地域联系示意，不新增未考定道路'},
 'audio':'复用37份有效导演语音与字幕，本轮不新增音频或影片',
 'storage':'round-85基线，SHA-256增量对象存储；原媒体继续共享'
}
for path in [R/'sources.json',W/'assets/local-observation-sources.json']:
 path.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def share(source,target):
 target.parent.mkdir(parents=True,exist_ok=True)
 if not target.exists():os.link(source,target)
 else:assert os.path.samefile(source,target), target
share(R/'README.md',W/'assets/records/round-86.md')
share(R/'04-cloth-response.png',W/'assets/process/r86-market-response.png')
share(R/'07-structure-complete.png',W/'assets/process/r86-structure-observation.png')
share(R/'04-cloth-response.png',P/'assets/preview-r86.png')

page=W/'overview.html'
s=page.read_text(encoding='utf-8')
s=s.replace('content="R85河谷与人物行动：','content="R86三路径的模型观察与地图回应：',1)
s=s.replace('R85 · 水与生活真正相接','R86 · 地点、变化与回应相接',1)
s=s.replace('锡伯样板按三个年代连起住处、耕作需求、施工、来水与人物回应；字幕、镜头和实际动作对应，随时接管或返回地图。','喀什交换、轮台结构与河谷水利各有实际变化，镜头和字幕跟随当前观察；完成后把结果带回地图。',1)
s=s.replace('src="./assets/process/r85-field-response.png" alt="R85实际3D网页：主渠与田边支渠相接，居民在新增田区观察与耕作"','src="./assets/process/r86-market-response.png" alt="R86实际3D网页：选择织物后，家人使用与回应，当前步骤和字幕同步"',1)
s=s.replace('R85实际网页 / 来水、田区与人物行动','R86实际网页 / 需要、交接与人物回应',1)
s=s.replace('<a href="./?trail=migration&amp;learn=place&amp;learnPlace=qabqal&amp;learnModel=1&amp;learnScene=people&amp;settlement=flow&amp;settlementDetail=story">直接操作 ↗</a>','<a href="./?edition=r86&amp;trail=zhang&amp;learn=place&amp;learnPlace=kashgar&amp;learnModel=1&amp;learnScene=market">直接操作 ↗</a>',1)
section='''<section id="local-observations" class="section"><div class="section-heading"><div><p class="eyebrow">R86 / FOLLOW WHAT CHANGES</p><h2>走进地点，让变化在画面里发生。</h2></div><a class="text-link" href="./?edition=r86&amp;director=zhang">选择完整导演路径 ▷</a></div><p>地球建立方位，地图提出历史问题；走进地点以后，让实际对象接着回答。当前标题、镜头、标记与字幕跟随模型状态，完成的观察可以带回地图。自由缩放只接管镜头，主动暂停才停止变化。</p><div class="source-columns"><article><h3>喀什 · 从需要到使用</h3><p>选择织物、补给或器物。金色线随搬运者前进，交接后看家庭使用、远行者出发或手艺人制作；未选的需要仍留在原处。</p><a href="./?edition=r86&amp;trail=zhang&amp;learn=place&amp;learnPlace=kashgar&amp;learnModel=1&amp;learnScene=market">自己选择交换 ↗</a></article><article><h3>轮台地域 · 从入口到内外往来</h3><p>找到门，展开屋盖，再跟随金色标记进入、青色标记返回。暂停后仍可自由观察，部件与原操作保留。</p><a href="./?edition=r86&amp;trail=protectorate&amp;learn=place&amp;learnPlace=luntai&amp;learnModel=1&amp;learnScene=structure">播放并操作空间观察 ↗</a></article><article><h3>伊犁河谷 · 从安置到后期水利</h3><p>沿用按年代的屯居、初期耕作、新渠建设和来水回应；三个阶段分别观察，完成后回到河谷。</p><a href="./?trail=migration&amp;learn=place&amp;learnPlace=qabqal&amp;learnModel=1&amp;learnScene=people&amp;settlement=settle&amp;settlementDetail=story">观察屯居与水利 ↗</a></article></div><details class="scope-note"><summary>历史与模型怎样区分？</summary><p>张骞出使与后来的长期交流分开理解；喀什集市是跨时期机制情境。轮台仅作现代地域参照，结构不证明乌垒布局或行政程序。近景仍是解释模型，人物、服饰和建筑尚未达到写实历史复原。</p><a href="./assets/local-observation-sources.json">来源与表示范围 ↗</a> · <a href="./assets/records/round-86.md">实际检查与增量记录 ↗</a></details></section>
'''
if 'id="local-observations"' not in s:s=s.replace('<section id="causal-sample"',section+'<section id="causal-sample"',1)
s=s.replace('R85 / WATCH AND EXPLORE','R86 / WATCH AND EXPLORE',1)
s=s.replace('R85 河谷与人物行动 · 三路径43幕','R86 地点变化与地图回应 · 三路径43幕',1)
page.write_text(s,encoding='utf-8')

catalog=P.parents[1]/'projects.json'
d=json.loads(catalog.read_text(encoding='utf-8-sig'))
entry=next(x for x in d['projects'] if x['id']=='013')
entry.update(summary='R86：地球、地图、历史与地点探索；喀什交换、轮台结构和河谷水利由实际模型变化驱动镜头、标记、字幕与返回观察。修正导演跨路径场景恢复；保留三路径43幕、自由操作和已有旁白，过程按SHA-256增量去重。',preview='assets/preview-r86.png',previewCaption='R86实际3D网页：选择织物后，人物使用与回应、镜头和观察步骤同步；集市为跨时期机制情境，非汉代喀什复原。')
catalog.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('R86 live notes, overview, metadata and shared previews updated')
