from pathlib import Path
p=Path(__file__).resolve().parents[1]/'web'
def change(file,old,new,n=1):
 q=p/file;s=q.read_text(encoding='utf-8');assert s.count(old)==n,(file,old[:80],s.count(old));q.write_text(s.replace(old,new),encoding='utf-8')

change('public/lived-scenes.js',"import * as THREE from 'three';","import * as THREE from 'three';\nimport {decorateSettlement,animateSettlement} from './settlement-chronology-scene.js';")
change('public/lived-scenes.js','let settings={goods:0',"let settlementChronology=null;\n let settings={goods:0")
change('public/lived-scenes.js','g.userData={families,houses,crops,official,scroll,furrows,path,workers,workerTools,water};','g.userData={families,houses,crops,official,scroll,pavilion,furrows,path,workers,workerTools,water};g.userData.chronology=decorateSettlement(g,helpers);')
change('public/lived-scenes.js',"if(decision){outcome={phase:['需求'", "if(config.stage==='people'){const chronological=animateSettlement(g,settlementChronology,clock,camera,viewport);if(chronological){dialogue=null;speech.hidden=true;outcome={label:chronological.stage.year,phrase:chronological.stage.reply};}}\n  if(decision){outcome={phase:['需求'")
change('public/lived-scenes.js','},choosePriority,setCue,update,audioFrame,workspaceState',"},setSettlementChronology(value){settlementChronology=value?{phase:value.phase,progress:value.progress??1}:null;viewport.dataset.settlementChronology=value?.phase??'';if(value){manualProgress=1;settlementApproach=null;manualDialogue=null;}else for(const key of ['settlementYear','settlementTrench','settlementNewWater','settlementExpansion','settlementChronologyProgress','settlementInitialWater'])delete viewport.dataset[key];},choosePriority,setCue,update,audioFrame,workspaceState")
change('public/lived-scenes.js','hide(){thread.hide();','hide(){settlementChronology=null;viewport.dataset.settlementChronology=\'\';thread.hide();')
change('public/sandbox.js','familyChoice:priority=>lived?.choosePriority(priority,{record:false}),',"familyChoice:priority=>lived?.choosePriority(priority,{record:false}),settlementTime:value=>lived?.setSettlementChronology(value),")

change('public/knowledge-guide.js',"import {installEnvoyJourney}","import {settlementPanel,settlementStages} from './settlement-chronology.js';\nimport {installEnvoyJourney}")
change('public/knowledge-guide.js','let director=null,directorCue=null',"let settlementPhase=['settle','dig','flow','experiment'].includes(new URL(location.href).searchParams.get('settlement'))?new URL(location.href).searchParams.get('settlement'):'settle',settlementReplay=null;\n let director=null,directorCue=null")
# Only the migration exploration defaults to chronology. The independent
# original people scene remains available through an explicit experiment.
change('public/knowledge-guide.js',"if(step==='family')content=`<section", "if(step==='family'&&settlementPhase!=='experiment')content=settlementPanel(settlementPhase);\n  if(step==='family'&&settlementPhase==='experiment')content=`<button data-settlement-phase=\"settle\">← 返回有年代的历史变化</button><section")
change('public/knowledge-guide.js','${c.title}</h2><p class="mt-why">${c.why}', '${step===\'family\'&&settlementPhase!==\'experiment\'?\'从安置到开渠，分开看时间\':c.title}</h2><p class="mt-why">${step===\'family\'&&settlementPhase!==\'experiment\'?\'切换年代，比较原有灌溉、新渠施工与后来放水；看右侧初期田地与左侧新增田地。\':c.why}')
change('public/knowledge-guide.js',"if(step!=='family')return;", "if(step!=='family'||settlementPhase!=='experiment')return;")
change('public/knowledge-guide.js',"if(trail&&modelScene==='people')for", "if(trail&&modelScene==='people'&&settlementPhase==='experiment')for")
change('public/knowledge-guide.js',"migrationStops.find(s=>s.id===migrationStep(stage,modelOpen)).title:title", "(modelOpen&&modelScene==='people'&&settlementPhase!=='experiment'?settlementStages.find(x=>x.id===settlementPhase).year+' · '+settlementStages.find(x=>x.id===settlementPhase).title:migrationStops.find(s=>s.id===migrationStep(stage,modelOpen)).title):title")
change('public/knowledge-guide.js',"if(id==='karez')adapter.karez({enabled:true,stop:karezStop,...(karezSaved?{restore:karezSaved}:{})});render();build();writeURL();adapter.resize();}","if(id==='karez')adapter.karez({enabled:true,stop:karezStop,...(karezSaved?{restore:karezSaved}:{})});if(id==='people'&&trail==='migration'&&settlementPhase!=='experiment'){adapter.settlementTime({phase:settlementPhase,progress:1});adapter.modelOverview();}render();build();writeURL();adapter.resize();}")
# The delegated click handler has a single button variable b.
change('public/knowledge-guide.js',"if(b.dataset.htAction){", "if(b.dataset.settlementPhase||b.hasAttribute('data-settlement-experiment')||b.hasAttribute('data-settlement-replay')){\n   if(b.hasAttribute('data-settlement-replay')){settlementReplay=0;adapter.model({playing:true});adapter.settlementTime({phase:settlementPhase,progress:0});}\n   else {settlementPhase=b.dataset.settlementPhase??'experiment';settlementReplay=null;adapter.settlementTime(settlementPhase==='experiment'?null:{phase:settlementPhase,progress:1});render();build();adapter.modelOverview();}\n   const address=new URL(location.href);address.searchParams.set('settlement',settlementPhase);history.replaceState(null,'',address);return;\n  }\n  if(b.dataset.htAction){")
change('public/knowledge-guide.js',"if(shot.model==='people')adapter.familyChoice(shot.choice);", "if(shot.settlement){settlementPhase=shot.settlement;settlementReplay=null;adapter.settlementTime({phase:shot.settlement,progress:0});}else if(shot.model==='people')adapter.familyChoice(shot.choice);")
change('public/knowledge-guide.js',"if(shot.model==='people'){\n    if(Number(d.settlementAge)","if(shot.settlement){adapter.settlementTime({phase:shot.settlement,progress:fraction});const s=settlementStages.find(x=>x.id===shot.settlement);if(fraction>=.99)record={priority:shot.settlement,label:s.year+' · '+s.title,sequence:s.look,reply:s.reply};}\n   else if(shot.model==='people'){\n    if(Number(d.settlementAge)")
change('public/knowledge-guide.js',"director?.update(dt);if(!active)return;", "director?.update(dt);if(!active)return;if(settlementReplay!==null&&modelOpen&&modelScene==='people'&&adapter.running()&&!director?.active){settlementReplay=Math.min(1,settlementReplay+dt/9);adapter.settlementTime({phase:settlementPhase,progress:settlementReplay});if(settlementReplay>=1)settlementReplay=null;}")
change('public/knowledge-guide.js','走进家庭，比较两种安排 →','走进屯居，按年代观察水系 →')
change('public/knowledge-guide.js','接下来可以操作灯火、引水的先后与物品交接','接下来切换1766年安置、19世纪初开渠与1808年放水')
change('public/knowledge-guide.js','从安置地域，走到生活需求','从安置地域，继续观察后来的水利建设')

change('public/exploration-director-paths.js',"{id:'home',label:'先安顿'", "{id:'home',label:'1766屯居'")
start=" {id:'home',label:'1766屯居'"
q=p/'public/exploration-director-paths.js';s=q.read_text(encoding='utf-8');a=s.index(start);b=s.index("\n {id:'return'",a)
s=s[:a]+""" {id:'home',label:'1766屯居',model:'people',settlement:'settle',title:'安置后已有初期灌溉与耕作',where:'1766年春起 · 察布查尔',why:'先看右侧住处、初期耕地与支渠；后来大渠尚未出现。',next:'跨过几十年，观察新水利需求怎样带来建设。',duration:18},
 {id:'water',label:'开挖新渠',model:'people',settlement:'dig',title:'原有耕作之外，组织开挖新大渠',where:'19世纪初 · 图伯特组织开渠',why:'左侧渠槽延伸，劳动者沿干渠作业，原有右侧耕地保留。',next:'到1808年初，看新渠放水与耕地扩展。',duration:18},
 {id:'irrigation',label:'1808放水',model:'people',settlement:'flow',title:'新渠来水，支持扩大耕作',where:'1808年初 · 大渠竣工放水',why:'沿青色新渠看水到新增田地，田垄随后显现；不是1766年同时建成。',next:'回到河谷地图，把安置和后续发展放回不同年代。',duration:18},"""+s[b:];q.write_text(s,encoding='utf-8')
change('public/exploration-director-paths.js','导演将依次示范两种安排；也可以随时接管。','导演依次展开三个历史阶段；可随时接管切换年代。')
change('public/exploration-director-paths.js','下一层比较“怎样安顿”。','下一层区分“初期屯居”与“后来的开渠”。')
change('public/exploration-director-paths.js','接下来是原创家庭情境。比较居住与用水的安排次序，不把模型当作历史村庄复原。','接下来按三个年代看水系与屯居。人物、建筑和渠线是关系示意，具体布局不作复原。')
change('public/exploration-director-paths.js','走进家庭，再回到地图\',\'比较安顿与引水，观察人物回应','走进屯居，再回到地图\',\'1766安置、19世纪初开渠、1808放水，分期看画面变化')
change('public/exploration-director-paths.js','演示结束后，自己改变安排，或切换另外两条历史路径。','演示结束后，自己切换年代，或比较另外两条历史路径。')
change('public/exploration-director-paths.js','示范结果只记录动画回应，不推断真实历史决策。','安置与开渠相隔几十年，具体布局只作关系示意。')

# Scope out the original contemporary-looking life-choice UI during chronology.
q=p/'public/sandbox.css';q.write_text(q.read_text(encoding='utf-8')+'''\n/* R82 chronological reading has its own controls; retain the old experiment. */
#viewport[data-settlement-chronology="settle"] #lived-controls,#viewport[data-settlement-chronology="dig"] #lived-controls,#viewport[data-settlement-chronology="flow"] #lived-controls,#viewport[data-settlement-chronology="settle"] .scene-reading,#viewport[data-settlement-chronology="dig"] .scene-reading,#viewport[data-settlement-chronology="flow"] .scene-reading{display:none!important}
.settlement-tabs{display:grid;gap:7px;margin:14px 0}.settlement-tabs button{display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;padding:10px}.settlement-tabs strong{color:#f5d997}.settlement-tabs span{font-size:12px}.settlement-tabs [aria-pressed="true"]{border-color:#66c6cd;background:#315958}.settlement-look{padding:10px;border-left:3px solid #69c7ce;background:#263d39}.settlement-panel>button,.settlement-panel>a{display:block;margin:10px 0;width:100%}
''',encoding='utf-8')
print('R82 chronology scene and exploration connected')
