"""Document evidence, bounds and current-entry changes for the R83 live model."""
import json
from pathlib import Path
project=Path(__file__).resolve().parents[1]
public=project/'web/public'
record=project/'process/round-83'
sources={
 'edition':'R83','reviewedAt':'2026-10-14',
 'sources':[
  {'publisher':'国家民委','title':'锡伯族·风俗习惯','url':'https://www.neac.gov.cn/seac/ztzl/xbz/fsxg.shtml','scope':'传统形制与生活环境；未逐件考定1766年或1808年的具体样本'},
  {'publisher':'国家民委','title':'锡伯族·历史沿革','url':'https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml','scope':'迁居、初期灌溉、后建大渠与1808年初竣工放水'}],
 'implementedReferences':[
  {'object':'男子服饰','basis':'资料列有长袍、腰带、圆顶帽与长靴等传统特征。','model':'按形制组合；没有使用某件服饰文物的测绘、材质或纹样。'},
  {'object':'民居与庭院','basis':'资料描述土坯或木架斜顶房、庭院及低墙。','model':'斜顶土墙房、木构门窗和低墙庭院；不是1766年某户的户型复原。'},
  {'object':'生活环境','basis':'资料记有园艺、榆杨等树木种植与传统畜力交通。','model':'树木、陶器和木车是环境参照；不把具体摆放和数量写成史实。'}],
 'authoredDetails':['服装颜色、裁片、面容、人物身份、院落位置与门窗比例','土壤、叶片和河面使用程序材质；不是新采集的历史环境数据','双手握柄与渠边施工动作是解释性编排；不复原真实工具文物或工程步骤'],
 'chronology':['1766年春起安置与初期支流灌溉','19世纪初组织开挖后建大渠','1808年初新渠竣工放水'],
 'boundaries':['传统形制资料不是每个历史年份的图像证据；不声称所有细节已考证。','匿名人物不作为跨42年的同一家庭传记。','旧模型与生活选择保留在独立入口；不把原创实验接成历史决策。','渠线、河面弯曲和地面细节为关系示意；不表示真实测绘形状。']}
(public/'assets/settlement-period-sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(record/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
notes='''## R83 · 服饰、斜顶民居与渠边劳动的形制观察

本轮重点更新锡伯路径近景。依据国家民委《锡伯族·风俗习惯》的传统形制记述，增建斜顶土墙房、木门窗、低墙庭院，男子长袍、腰带、圆顶帽和长靴；改善人物头身比例、双手握柄、工具落地、河面和叶形。资料不能证明某座1766年民居或某套1808年服装；面容、颜色、裁片、数量与布局属于原创模型设计，不作逐件历史复原。

“全景、民居、服饰、劳动与渠水”四种观察将镜头、对象标记、介绍和字幕连在一起。锡伯自动导演的安置幕观察右侧屯居与初期灌溉，开渠幕靠近劳动现场，放水幕恢复水系全景；用户可缩放、暂停、自由接管与返回来时地图。旧家庭选择和原人物建筑模型继续保留为独立情境。原五段R82 MiniMax旁白与已有环境音继续复用，没有新生成语音或整片影片。

传统形制来源：https://www.neac.gov.cn/seac/ztzl/xbz/fsxg.shtml 。年代来源：https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml 。核查于2026-10-14，表示范围见assets/settlement-period-sources.json。当前仍是有依据的可操作示意模型，未达到完整写实复原；张骞和都护的其他近景资产没有在本轮统一改成经过考证的古代场景。

'''
for name in ['README.md','web/README.md']:
 p=project/name;text=p.read_text(encoding='utf-8');first,rest=text.split('\n',1)
 if name=='web/README.md':first='# 新疆3D知识平台 · R83形制与近景观察'
 p.write_text(first+'\n\n'+notes+rest.lstrip(),encoding='utf-8')
for name in ['research.md','web/public/ATTRIBUTION.md']:
 p=project/name
 with p.open('a',encoding='utf-8') as f:f.write('\n'+notes)
(record/'README.md').write_text('# R83 · 传统形制与近景联动\n\n'+notes.split('\n\n',1)[1]+'''截图保留候选、服饰、庭院、施工、暂停缩放、导演与返回地图。四项新增检查验证模型分离与恢复、暂停姿态保持、握柄与工具落地、镜头边界及固定节点复用。完整检查结果见web-check.txt；浏览器实际观察范围见verification.json。

使用process_store.py save以round-82为基线按SHA-256保存源码和证据。旧声音、影片与地形资产共享；本轮没有整片新录像。冻结记录不可直接修改。
''',encoding='utf-8')
page=public/'overview.html';text=page.read_text(encoding='utf-8')
text=text.replace('R82屯居与水利分期观察：','R83形制与近景观察：',1)
text=text.replace('R82 · 分清年代 / 屯居与水利','R83 · 有依据的服饰与民居',1)
text=text.replace('锡伯近景区分1766年安置、19世纪初开渠与1808年放水；字幕、旁白与渠槽、水流、耕地同步。','锡伯近景增加斜顶民居与传统服饰形制参照；四种观察联动镜头、说明、字幕与动作，仍保留三个年代。',1)
text=text.replace('./assets/process/r82-chronology.png','./assets/process/r83-courtyard.png',1)
text=text.replace('R82实际3D网页：可切换年代的初期灌溉、新渠与新增田地','R83实际3D网页：斜顶民居、庭院和传统服饰形制参照',1)
text=text.replace('R82实际网页 / 水系与屯居关系示意','R83实际网页 / 形制参照与水系观察',1)
text=text.replace('learnScene=people&amp;settlement=flow">直接操作','learnScene=people&amp;settlement=flow&amp;settlementDetail=home">直接操作',1)
section='''<section id="period-details" class="section"><div class="section-heading"><div><p class="eyebrow">R83 / DETAILS WITH EVIDENCE</p><h2>走近人物、民居与劳动，看细节怎样相接。</h2></div><a class="text-link" href="./?trail=migration&amp;learn=place&amp;learnPlace=qabqal&amp;learnModel=1&amp;learnScene=people&amp;settlement=flow&amp;settlementDetail=people">观察服饰近景 ↗</a></div><p>男子长袍、腰带、圆顶帽和长靴，以及土坯或木架斜顶房、低墙庭院，参考国家民委的传统形制记述。人物比例、土墙木构、河面与叶形一并调整；劳动人物双手握住工具，刃部到达渠边地面。</p><div class="source-columns"><article><h3>镜头与介绍看同一处</h3><p>全景、民居、服饰与劳动四种入口定位不同对象。相关介绍与字幕同步，近景收拢远处标注。</p></article><article><h3>不同年代，观察不同变化</h3><p>导演先看屯居与初期耕作，再靠近后建大渠施工，最后放回水系全景观察1808年初放水。新旧灌溉分开。</p></article><article><h3>动作能停，也能自己观察</h3><p>暂停保持人物和工具位置；仍能缩放与转动。原家庭选择独立保留，观察后可返回来时地图。</p></article></div><p class="scope-note">形制依据不等于具体年份的逐件复原：服装颜色、裁片、人物身份与院落布局未精定；匿名人物、施工动作与渠线为原创解释模型。</p><p class="fine"><a href="https://www.neac.gov.cn/seac/ztzl/xbz/fsxg.shtml">国家民委 · 形制资料 ↗</a> · <a href="./assets/settlement-period-sources.json">来源与表示范围 ↗</a> · <a href="./assets/records/round-83.md">实际验证与增量记录 ↗</a></p></section>
'''
text=text.replace('<section id="settlement-chronology"',section+'<section id="settlement-chronology"',1)
text=text.replace('R82 / WATCH AND EXPLORE','R83 / WATCH AND EXPLORE',1)
page.write_text(text,encoding='utf-8')
metadata=project.parents[1]/'projects.json';data=json.loads(metadata.read_text(encoding='utf-8-sig'))
item=next(p for p in data['projects'] if p['id']=='013')
item['summary']='R83：连续地球、地图、历史与地点探索；锡伯近景增加传统服饰和斜顶民居形制参照、握柄施工与四种近景观察，镜头、字幕和年代变化相接。保留三路径43幕导演、自由操作与返回，过程按SHA-256增量去重。'
item['preview']='assets/preview-r83.png';item['previewCaption']='R83实际3D网页：斜顶民居、低墙庭院与传统服饰形制参照；具体人物、衣色及院落布局未作历史复原。'
metadata.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('R83 source boundaries, project documentation and overview updated.')
