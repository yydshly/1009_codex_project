"""Record R85's interactive causal sample without duplicating old media."""
import json
from pathlib import Path

project = Path(__file__).resolve().parents[1]
public = project / 'web/public'
round_dir = project / 'process/round-85'
if (round_dir / 'retention.json').exists():
    raise SystemExit('R85 is frozen; record further work in a new incremental round.')
intro = '''## R85 · 从河谷条件，到人物行动的完整样板

本轮先完成锡伯路径的屯居与水利样板。迁移的政策背景与河谷的生产条件分别说明；初期灌溉保留，后建大渠和新增耕地按年代出现。1766年春起的住处、支流水源、步行和耕作相接；19世纪初先显示待接水的扩耕空间，再沿主渠推进施工，接向田边；1808年初先沿主渠来水，再进入田边支渠，展开湿润田区，居民随后走向田间观察和劳作。

每个年代有三个可点选节点和重播入口。镜头、当前标题、字幕和实际模型进度同步；标牌按屏幕大小约束并随观察对象收拢，详细形制与原生活实验折叠保留。滚轮缩放或转动只接管镜头，动画继续；主动暂停冻结动作，仍可观察。返回伊犁河谷地图带回已完成的阶段观察。自动导演的三个近景阶段沿用同一套模型状态，更新五段MiniMax旁白与字幕。

依据国家民委《锡伯族·历史沿革》和《锡伯族·风俗习惯》，2026-10-14复核。资料支持安置、初期支流灌溉、人口增长、图伯特组织开渠及1808年初竣工放水；没有精定开工年。服饰与建筑只参考传统形制，匿名人物、步行、工具动作、田块与渠线是解释性设计；不是同一家人跨42年的传记、实测灌溉或清代村落复原。

本轮聚焦锡伯样板；张骞、都护与全部旧场景保留，尚未统一到同等细节标准。截图、候选画面、五段声音母片、字幕时序、检查与源码以round-84为基线按SHA-256增量保存；没有新增整片录像或累计打包。当前记录见process/round-85/。

'''

for filename in [project / 'README.md', project / 'web/README.md', project / 'research.md']:
    text = filename.read_text(encoding='utf-8')
    if '## R85 ·' not in text:
        end = text.index('\n')
        text = text[:end] + '\n\n' + intro + text[end:].lstrip('\n')
    if filename.name == 'README.md' and filename.parent.name == 'web':
        text = text.replace('# 新疆3D知识平台 · R83形制与近景观察', '# 新疆3D知识平台 · R85河谷与人物行动')
    filename.write_text(text, encoding='utf-8')

page = public / 'overview.html'
text = page.read_text(encoding='utf-8')
text = text.replace('R83形制与近景观察：', 'R85河谷与人物行动：')
text = text.replace('R83 · 有依据的服饰与民居', 'R85 · 水与生活真正相接')
text = text.replace('锡伯近景增加斜顶民居与传统服饰形制参照；四种观察联动镜头、说明、字幕与动作，仍保留三个年代。', '锡伯样板按三个年代连起住处、耕作需求、施工、来水与人物回应；字幕、镜头和实际动作对应，随时接管或返回地图。')
text = text.replace('./assets/process/r83-courtyard.png', './assets/process/r85-field-response.png')
text = text.replace('R83实际3D网页：斜顶民居、庭院和传统服饰形制参照', 'R85实际3D网页：主渠与田边支渠相接，居民在新增田区观察与耕作')
text = text.replace('R83实际网页 / 形制参照与水系观察', 'R85实际网页 / 来水、田区与人物行动')
text = text.replace('settlement=flow&amp;settlementDetail=home', 'settlement=flow&amp;settlementDetail=story')
text = text.replace('R83 / WATCH AND EXPLORE', 'R85 / WATCH AND EXPLORE')
text = text.replace('R82 屯居与水利分期观察 · 三路径43幕', 'R85 河谷与人物行动 · 三路径43幕')
text = text.replace('导演先看屯居与初期耕作，再靠近后建大渠施工，最后放回水系全景观察1808年初放水。新旧灌溉分开。', '导演先看屯居与初期耕作，再沿新渠观察施工，最后跟随1808年初来水进入田边与人物回应。新旧灌溉分开。')
text = text.replace('锡伯路径本轮更新五段MiniMax旁白。', '锡伯路径R85更新五段MiniMax旁白，模型依次呈现初期耕作、扩耕需求、开渠、来水与人物转向田间。')
if 'id="causal-sample"' not in text:
    section = '''<section id="causal-sample" class="section"><div class="section-heading"><div><p class="eyebrow">R85 / WATER AND PEOPLE</p><h2>河谷里的水，怎样接到人的行动？</h2></div><a class="text-link" href="./?trail=migration&amp;learn=place&amp;learnPlace=qabqal&amp;learnModel=1&amp;learnScene=people&amp;settlement=settle&amp;settlementDetail=story">亲自探索屯居与水利 ↗</a></div><p>先在伊犁河谷理解地域，再走近住处、渠边与田地。每个年代都有三个可选择的观察节点；点击播放，镜头和字幕带你看当前真正发生的变化，也可以自由转动、暂停并返回地图。</p><div class="source-columns"><article><h3>1766年春起 · 住处与耕作</h3><p>保留支流灌溉。居民从庭院走向初期田地，一人观察渠边，另一人继续耕作。</p></article><article><h3>19世纪初 · 需求与施工</h3><p>新田区先等待接水。渠槽从水源方向延伸，劳动者握住工具沿渠作业，再接向田边。</p></article><article><h3>1808年初 · 来水与回应</h3><p>水先沿主渠前进，再进入田边支渠。田区变化随后展开，居民查看来水后转向田间。</p></article></div><p>自由镜头不会暂停变化；主动暂停后人物与工具保持位置。完成的阶段观察可以带回河谷地图。旧生活选择与形制近景仍可从更多观察中打开。</p><details class="scope-note"><summary>历史依据与模型表示范围</summary><p>迁移政策与生产条件分别理解。初期灌溉、新渠建设和竣工放水分期呈现，未精定开工年。匿名人物、田块与渠线解释关系；不是跨42年的同一家庭、实测渠网或逐件复原。</p><a href="https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml">国家民委 · 历史沿革 ↗</a> · <a href="./assets/settlement-story-sources.json">来源与表示范围 ↗</a> · <a href="./assets/records/round-85.md">实际验证与增量记录 ↗</a></details></section>
'''
    text = text.replace('<section id="period-details"', section + '<section id="period-details"')
page.write_text(text, encoding='utf-8')

sources = {
    'edition':'R85', 'reviewedAt':'2026-10-14',
    'sources':[
        {'publisher':'国家民委','title':'锡伯族·历史沿革','url':'https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml','supports':['迁居政策背景','1766年春起安置','初期绰霍尔河等支流灌溉与耕作','人口增长与扩耕','图伯特组织开渠历时六年','1808年初竣工放水']},
        {'publisher':'国家民委','title':'锡伯族·风俗习惯','url':'https://www.neac.gov.cn/seac/ztzl/xbz/fsxg.shtml','supports':['传统男子长袍、腰带、圆顶帽、长靴','土坯或木架斜顶房、庭院和低墙'],'limit':'不精定1766或1808年的具体服饰与房屋样本'}],
    'visualInterpretation':['每个年代三个观察节点的镜头、人物行动与字幕编排','主渠、田边支渠、新旧田块和步行线为示意布局','青色前进表示来水，湿润色与作物显现表示扩耕结果，不表示实测水文或即时生长','匿名人物检查水源与耕作，不命名为真实历史居民'],
    'boundaries':['安置政策与生产条件分别表达','初期灌溉不推迟到1808年','后建大渠不提前到1766年','不硬写1802开工年','不同年代人物不构成同一家庭的连续传记','张骞与都护其他近景本轮保留，未新增年代考据资产']}
(public / 'assets/settlement-story-sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(round_dir / 'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(round_dir / 'README.md').write_text('# R85 · 河谷条件、需求与人物行动\n\n'+intro,encoding='utf-8')

catalog_path = project.parents[1] / 'projects.json'
catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
entry = next(p for p in catalog['projects'] if p['id']=='013')
entry['summary']='R85：地球、地图、历史与地点探索；锡伯样板按年代连起初期耕作、扩耕需求、开渠来水与人物行动，镜头、字幕、五段新旁白同步。保留三路径43幕导演、自由操作与返回；过程按SHA-256增量去重。'
entry['preview']='assets/preview-r85.png'
entry['previewCaption']='R85实际3D网页：主渠、田边支渠与新增田区相接，居民观察和耕作；人物、田块与渠线属于解释模型，非历史村落复原。'
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('R85 documentation and webpage information recorded.')
