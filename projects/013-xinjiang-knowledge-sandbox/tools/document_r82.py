from pathlib import Path
import json,os
p=Path(__file__).resolve().parents[1];r=p/'process/round-82';w=p/'web/public'
source='https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml'
doc='''## R82 · 察布查尔：按年代观察屯居与水利

默认锡伯导演的近景不再比较虚构的“先安顿/先引水”历史决策，而是可切换的三个阶段：1766年春以后安置与初期支流灌溉、19世纪初组织开挖新渠、1808年初大渠竣工放水。国家民委资料说明初期已有利用绰霍尔河等支流水源的灌溉与耕作；不得把农业出现整体推迟到1808年，也不得把新大渠提前到1766年。

3D模型保留右侧住处与初期田地，左侧新渠槽在施工阶段逐段延伸；放水阶段青色水流前进，新增田垄随后显现。人物是匿名的安置/劳动符号，不指定历史人物身份，不宣称同一家人在42年中容貌不变。人物服饰、房屋及渠线仍是关系示意，不是清代村庄或真实大渠布局复原，作物变化不是实测水文/即时生长。未将开工年硬写成1802年。

锡伯导演新增“1808放水”一幕；三路径合计43幕，张骞15、都护14、锡伯14。五段MiniMax近景旁白更新；导演素材总38份（含归档荒漠1份），有效历史导演37份，其中28份独立录音、9份复用历史旁白。旧录音在已有冻结轮次保留。新语音为speech-2.8-hd、Chinese (Mandarin)_Gentleman、32kHz单声道，-18 LUFS目标混音；字幕未做逐字对齐。

支持切换年代、重播阶段、暂停/继续、自由镜头、导演接管后继续当前变化和返回地图。切回早期会收回后建新渠及其阴影。原有生活情境有明确独立入口，修复“先安顿/先引水”按钮只转发到旧控件而未改变实际模型的问题。

史实依据：国家民委《锡伯族·历史沿革》 https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml ，黑龙江省人民政府（省民宗委资料） https://www.hlj.gov.cn/hlj/c108504/202503/c00_31820374.shtml ，核查于2026-10-14。过程见process/round-82/，使用process_store.py按SHA-256在round-81上增量保存；没有新增累计打包影片。
'''
for name in ['README.md','web/README.md']:
 q=p/name;s=q.read_text(encoding='utf-8');head,end=s.split('\n',1);q.write_text(head+'\n\n'+doc+'\n'+end.lstrip(),encoding='utf-8')
for name in ['research.md','web/public/ATTRIBUTION.md']:
 q=p/name;q.write_text(q.read_text(encoding='utf-8')+'\n\n'+doc,encoding='utf-8')
facts={'edition':'R82','reviewedAt':'2026-10-14','sources':[{'publisher':'国家民委','title':'锡伯族·历史沿革','url':source},{'publisher':'黑龙江省人民政府 / 省民宗委','title':'锡伯族','url':'https://www.hlj.gov.cn/hlj/c108504/202503/c00_31820374.shtml'}],'anchors':[{'date':'1766年春起','fact':'迁察布查尔安置，初期利用支流水源灌溉与耕作。'},{'date':'19世纪初','fact':'图伯特组织开挖新渠，引伊犁河水，工程历时六年。'},{'date':'1808年初','fact':'新渠竣工放水，支持扩大耕作。'}],'boundaries':['未精定开工年，未复原实际渠线、河道、村庄、服饰或历史人物。','初期灌溉保留；后建大渠与农业开始并非同一件事。','动画时长、来水比例、田地变绿不表示实测水文、年代比例或产量。','不同阶段人物为匿名关系符号；没有跨42年同一家庭的传记。']}
(w/'assets/settlement-chronology-sources.json').write_text(json.dumps(facts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(r/'sources.json').write_text(json.dumps(facts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(r/'README.md').write_text('''# R82 · 察布查尔屯居与水利的分期观察

这轮延续历史依据纠正，将锡伯路径的近景改为有史实锚点的年代变化。原家庭选择作为独立情境保留，张骞荒漠仍不接回历史导演。

- 1766年春后：住处与初期灌溉、耕作；没有后建大渠。
- 19世纪初：图伯特组织新渠建设；干渠槽逐段延伸，工人作业，初期灌溉保持。
- 1808年初：新渠放水，新增田地随后显现。
- 主动切换、重播、暂停、镜头缩放、自由接管、返回共同地图；五条MiniMax新录音与字幕同步。
- 模型为水系与屯居关系示意，不能据模型推断真实古村、服饰或渠线。

`sources.json`保存来源与表达边界；`audio/`保存五份原始母片、归一化交付、公开请求哈希与时间信息，不含凭据。`web-check.txt`保存107项检查与历史播放器检查。浏览器实际截图包括优化前、候选、年代对照、导演暂停、原选择入口、返回地图与交付画面。`director-pause-state.json`及`director-pause-after-camera.json`证明缩放前后暂停进度与耕地状态保持。没有重新生成整片影片；原影片按已有共享素材引用保留。

最终源码由process_store.py以round-81为基线保存source-recorded增量，保留旧素材与旧音频，后续不得直接编辑该冻结快照。
''',encoding='utf-8')
dest=w/'assets/records/round-82.md';dest.parent.mkdir(parents=True,exist_ok=True)
if not dest.exists():os.link(r/'README.md',dest)
q=w/'overview.html';s=q.read_text(encoding='utf-8')
s=s.replace('R81历史依据纠正与到访地域：','R82屯居与水利分期观察：').replace('R81 · 史书记载 / 出使经历与地域','R82 · 分清年代 / 屯居与水利')
s=s.replace('张骞补齐康居、大夏与返汉经历；未考定道路不连线，荒漠实验移出历史导演。','锡伯近景区分1766年安置、19世纪初开渠与1808年放水；字幕、旁白与渠槽、水流、耕地同步。')
old='<figure class="hero-figure"><img src="./assets/process/r81-recorded-regions.png" alt="R81实际网页：到访地域与史书记载对照，不连未考定道路"><figcaption><span>R81实际网页 / 出使经历与到访地域</span><a href="./?director=zhang">直接操作 ↗</a></figcaption></figure>'
new='<figure class="hero-figure"><img src="./assets/process/r82-chronology.png" alt="R82实际3D网页：可切换年代的初期灌溉、新渠与新增田地"><figcaption><span>R82实际网页 / 水系与屯居关系示意</span><a href="./?trail=migration&amp;learn=place&amp;learnPlace=qabqal&amp;learnModel=1&amp;learnScene=people&amp;settlement=flow">直接操作 ↗</a></figcaption></figure>'
assert old in s;s=s.replace(old,new)
section='''<section id="settlement-chronology" class="section"><div class="section-heading"><div><p class="eyebrow">R82 / SETTLEMENT THROUGH TIME</p><h2>安置与后来的开渠，分开看年代。</h2></div><a class="text-link" href="./?trail=migration&amp;learn=place&amp;learnPlace=qabqal&amp;learnModel=1&amp;learnScene=people&amp;settlement=settle">自己切换年代 ↗</a></div><p>1766年安置后的初期耕作，利用支流水源；19世纪初组织新渠建设；1808年初新渠放水后，耕作范围继续扩大。新大渠没有和最初安置同时完成。</p><div class="source-columns"><article><h3>保留初期的灌溉</h3><p>右侧住处、支渠与初期田地始终保留。切回早期时，左侧后来建造的新渠及新增田地收回。</p></article><article><h3>看建设与来水</h3><p>干渠槽逐段延伸，人物沿渠劳动；放水阶段青色水流沿新渠前进，新增田垄随后变绿。动画表达变化关系，不模拟真实产量。</p></article><article><h3>导演与自由操作相接</h3><p>五段新旁白对应地点、年代与画面，三阶段可选、可重播、可暂停。原“先安顿/先引水”生活选择另设入口继续保留。</p></article></div><p class="scope-note">人物、服饰、建筑和渠线为关系示意，未完成清代村庄与真实大渠布局复原。依据国家民委公开资料，不精定未核实的开工年。</p><p class="fine"><a href="https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml">国家民委 · 历史沿革 ↗</a> · <a href="./assets/settlement-chronology-sources.json">史实与模型边界 ↗</a> · <a href="./assets/records/round-82.md">实际验证与增量记录 ↗</a></p></section>
'''
s=s.replace('<section id="envoy-journey"',section+'<section id="envoy-journey"')
s=s.replace('R81 历史依据纠正与到访地域 · 三路径42幕','R82 屯居与水利分期观察 · 三路径43幕')
s=s.replace('察布查尔：比较安顿与引水，观察家人、灯火和渠水。','察布查尔：切换安置、开渠与放水的年代；原生活选择另设入口。')
s=s.replace('<h3>亲手选择，看画面回应</h3><p>进入家庭后等待选择。先安顿或先引水，会改变家人、灯火、渠水与田边劳作的先后。','<h3>分清年代，看画面变化</h3><p>默认近景按1766安置、19世纪初开渠与1808放水展开；原有生活情境可单独打开，比较安排次序。')
q.write_text(s,encoding='utf-8')
q=w/'exploration-director-paths.js';s=q.read_text(encoding='utf-8').replace("image:'./assets/atlas-r15-family.jpg'","image:'./assets/process/r82-chronology.png'");q.write_text(s,encoding='utf-8')
q=p.parents[1]/'projects.json';j=json.loads(q.read_text(encoding='utf-8'));ps=j['projects'] if isinstance(j,dict) else j;x=next(x for x in ps if x['id']=='013');x.update(summary='R82：连续地球、区域地图、历史与地点探索；锡伯近景分1766安置、19世纪初开渠、1808放水，渠槽、水流、耕地与旁白同步。三路径43幕有声导演；保留原生活选择、暂停、接管与返回，过程按SHA-256增量去重。',preview='assets/preview-r82.png',previewCaption='R82实际3D网页：初期灌溉、新渠放水与新增田地按年代对照；人物、建筑和渠线为关系示意。');q.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('R82 documentation and metadata updated')
