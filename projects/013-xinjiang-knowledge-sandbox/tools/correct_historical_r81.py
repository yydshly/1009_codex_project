"""Correct live R80 historical claims, without altering frozen evidence."""
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
WEB = PROJECT / 'web/public'

def edit(file, old, new):
    p = WEB / file
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise ValueError(f'Missing edit target: {file}: {old[:60]}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')

p = WEB / 'exploration-director-paths.js'
lines = p.read_text(encoding='utf-8').splitlines()
for i, line in enumerate(lines):
    if "{id:'mission-route'" in line:
        lines[i] = " {id:'mission-route',label:'记载与地域',journey:'map',title:'依据记载，认识第一次出使',where:'出陇西 · 大宛、康居、大月氏、大夏（地域参照）',why:'先看史书记载的经历；地点间的具体道路未考定，不复原沙丘行进。',next:'回到地图，区分外交结果与此后的长期往来。',duration:60,speech:envoyNarration['mission-route'],audio:{event:'zhang',beat:'mission-route'}},"
    if "{id:'desert'" in line:
        lines[i] = " narration('zhang',1,'通道展开'),"
p.write_text('\n'.join(lines)+'\n', encoding='utf-8')
edit('exploration-director-paths.js', "image:'./assets/process/r80-envoy.png'", "image:'./assets/process/r81-recorded-regions.png'")
edit('exploration-director-paths.js', "['跟随第一次远行','地域方向、十余年中断，再走进荒漠使团']", "['依据史书记载','出陇西、长期扣留与中亚到访地域；不复原未考定道路']")
edit('knowledge-guide.js', '<b>跟随第一次出使 →</b><span>在地图看旅程中断，再走进荒漠使团</span>', '<b>认识第一次出使 →</b><span>看记载的经历与到访地域，不复原未考定道路</span>')
edit('knowledge-guide.js', "if(params.has('journey'))openJourney", "if(params.has('journey')&&!params.has('director'))openJourney")
edit('exploration-director.js', "viewport.dataset.envoyPhase==='detention'?1:viewport.dataset.envoyPhase==='arrival'?2:0", "viewport.dataset.envoyPhase==='return'?2:viewport.dataset.envoyProgress>=.42?1:0")
edit('exploration-director.js', "['外交任务出发','扣留与继续西行','抵达与环境观察']", "['出发与扣留','到访地域','外交结果']")
edit('workbench.js', "{id:'journey',name:'荒漠里的使团',group:'历史与生活',tag:'可控制的远行',hint:'跟随张骞第一次出使的地域方向，走近荒漠；控制风沙、取水与行进。'}", "{id:'journey',name:'独立荒漠动画实验',group:'自然与地理',tag:'原创动画实验',hint:'观察原创行走、风沙与取水动画。无张骞出使路段依据，不纳入历史导演。'}")
p = WEB / 'lessons.js'
lines = p.read_text(encoding='utf-8').splitlines()
for i, line in enumerate(lines):
    if line.lstrip().startswith('journey:'):
        lines[i] = "  journey:{title:'独立荒漠动画实验',kicker:'ANIMATION EXPERIMENT',scale:'原创动画',subtitle:'此模型没有张骞出使路段的历史依据',kind:'独立实验',heading:'观察动画与环境',body:'保留行走、风沙、取水与驮载的原创动画实验；人物、地貌及动作均不归属于张骞出使。',caption:'已移出历史导演 · 无历史行程归属',next:'返回地图',source:'本地原创动画素材，没有对应历史路段的依据。R80误将其接入张骞导演，R81已纠正。',links:[]},"
p.write_text('\n'.join(lines)+'\n', encoding='utf-8')
edit('story.js', "journey:{category:'model',short:'荒漠使团',note:'原创历史环境情境 · 地域方向非考定行程'}", "journey:{category:'model',short:'独立荒漠实验',note:'原创动画 · 无历史行程归属 · 已移出历史导演'}")
edit('story.js', "label:'跟随使团',heading:'荒漠里的远行'", "label:'独立动画',heading:'原创荒漠动画实验'")
edit('envoy-desert.js', "label:'使者 · 持节引路'", "label:'原创行旅人物 · 动画实验'")
edit('envoy-journey-data.js', "envoyChapterProgress=[.02,.30,.49,.60,.72,.84]", "envoyChapterProgress=[.96,.02,.49,.60,.72,.84]")
edit('envoy-journey-data.js', "index=chapter===6?0:chapter", "index=chapter===6?0:chapter===0?1:chapter")
edit('envoy-journey.js', "progress=[...envoyChapterProgress,.96][Number(chapter.dataset.envoyChapter)]", "progress=[.02,.30,.49,.60,.72,.84,.96][Number(chapter.dataset.envoyChapter)]")
edit('envoy-journey.js', 'const routeRoot=new THREE.Group();', 'const routeRoot=new THREE.Group();')
p = WEB / 'envoy-journey.css'
p.write_text(p.read_text(encoding='utf-8')+'''\n/* R81: evidence status stays visible even while the director hides controls. */
.envoy-evidence-note{border-left:3px solid #ddbd86;background:#40382777;padding:8px 10px!important;color:#f4dfad;font-size:12px!important}
.envoy-events button{font-size:11px;padding:6px 8px}.envoy-events button[aria-current=true]{background:#ddbd86;color:#14231b;border-color:#ffe4b5}
.envoy-mini .envoy-events{gap:5px;margin:5px 0 8px}.envoy-journey[data-mode=near] .envoy-mini{display:none}
''', encoding='utf-8')
print('R81 live historical correction applied.')
