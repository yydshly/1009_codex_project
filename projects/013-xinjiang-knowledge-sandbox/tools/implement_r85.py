"""Connect the causal settlement story to the existing live platform."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'web/public'
def edit(name,changes):
 p=root/name;s=p.read_text(encoding='utf-8')
 for before,after in changes:
  assert s.count(before)==1,(name,before[:80],s.count(before))
  s=s.replace(before,after)
 p.write_text(s,encoding='utf-8')

edit('knowledge-guide.js',[
 ("import {settlementDetails}","import {settlementStoryFrame,settlementBeatProgress} from './settlement-story.js';\nimport {settlementDetails}"),
 (":'overview';\n let settlementPhase=",":'story';\n let settlementFollow=true,settlementBeatKey=null;\n let settlementPhase="),
 ("settlementReplay=null;\n", "settlementReplay=Math.max(0,Math.min(1,Number(new URL(location.href).searchParams.get('settlementProgress'))||0));\n"),
 ("if(step==='family'&&settlementPhase!=='experiment')content=settlementPanel(settlementPhase,settlementDetail);", "if(step==='family'&&settlementPhase!=='experiment')return settlementPanel(settlementPhase,settlementDetail);"),
 ("function render(){", "function render(){\n  viewport.classList.toggle('settlement-narrative-active',modelOpen&&modelScene==='people'&&trail==='migration'&&settlementPhase!=='experiment');"),
 ("progress:director?.active&&director.shot?.settlement?0:1", "progress:director?.active&&director.shot?.settlement?0:settlementReplay??1"),
 ("if(b.dataset.settlementDetail){", "if(b.dataset.settlementBeat!==undefined){settlementReplay=settlementBeatProgress(settlementPhase,Number(b.dataset.settlementBeat));settlementDetail='story';settlementFollow=true;settlementBeatKey=null;adapter.settlementTime({phase:settlementPhase,progress:settlementReplay});adapter.settlementView?.('story');render();build();writeURL();return;}\n  if(b.hasAttribute('data-settlement-follow')){settlementFollow=true;settlementBeatKey=null;updateSettlementReading();return;}\n  if(b.dataset.settlementDetail){"),
 ("if(b.hasAttribute('data-settlement-replay')){settlementReplay=0;adapter.model({playing:true});adapter.settlementTime({phase:settlementPhase,progress:0});}", "if(b.hasAttribute('data-settlement-replay')){settlementReplay=0;settlementDetail='story';settlementFollow=true;settlementBeatKey=null;adapter.model({playing:true});adapter.settlementTime({phase:settlementPhase,progress:0});adapter.settlementView?.('story');render();build();}"),
 ("settlementPhase=b.dataset.settlementPhase??'experiment';settlementReplay=null;adapter.settlementTime(settlementPhase==='experiment'?null:{phase:settlementPhase,progress:1});", "settlementPhase=b.dataset.settlementPhase??'experiment';settlementReplay=0;settlementDetail='story';settlementFollow=true;settlementBeatKey=null;adapter.model({playing:false});adapter.settlementTime(settlementPhase==='experiment'?null:{phase:settlementPhase,progress:0});"),
 ("if(shot.settlement){settlementPhase=shot.settlement;settlementDetail=shot.detail??'overview';settlementReplay=null;}", "if(shot.settlement){settlementPhase=shot.settlement;settlementDetail=shot.detail??'story';settlementReplay=null;settlementFollow=true;settlementBeatKey=null;}"),
 ("if(fraction>=.99&&d.settlementChronology===shot.settlement&&Number(d.settlementChronologyProgress)>=.99)record=", "if(fraction>=.99&&d.settlementChronology===shot.settlement&&Number(d.settlementChronologyProgress)>=.99&&(shot.settlement!=='flow'||Number(d.settlementResidentResponse)>=.99&&Number(d.settlementBranchWater)>=.99))record="),
 ("if(modelOpen){if(historyTrails[trail]&&modelScene==='market')", "if(modelOpen){if(historyTrails[trail]&&modelScene==='market')"),
 ("adjustDirectorView:()=>director?.inspectView()??false", "adjustDirectorView:()=>{if(director?.inspectView())return true;if(modelOpen&&modelScene==='people'&&settlementPhase!=='experiment'){settlementFollow=false;adapter.cancel();return true;}return false;}"),
 ("settlementReplay+dt/9", "settlementReplay+dt/24"),
 ("if(settlementReplay>=1)settlementReplay=null;", "if(settlementReplay>=1)settlementReplay=1;"),
 ("function writeURL(){const u=new URL(location.href);", "function writeURL(){const u=new URL(location.href);if(modelOpen&&modelScene==='people'&&trail==='migration'){u.searchParams.set('settlementDetail',settlementDetail);u.searchParams.set('settlementProgress',Number(settlementReplay??viewport.dataset.settlementChronologyProgress??0).toFixed(3));}else u.searchParams.delete('settlementProgress');"),
])
p=root/'knowledge-guide.js';s=p.read_text(encoding='utf-8');start=s.index(' function updateSettlementReading(){');end=s.index(' function trailNavigate(',start)
s=s[:start]+''' function updateSettlementReading(){
  if(!modelOpen||modelScene!=='people'||trail!=='migration'||settlementPhase==='experiment')return;
  const c=settlementStages.find(x=>x.id===settlementPhase);if(!c)return;
  const progress=Number(viewport.dataset.settlementChronologyProgress??settlementReplay??0),f=settlementStoryFrame(settlementPhase,progress),detail=settlementDetails[settlementDetail]??settlementDetails.story,isStory=settlementDetail==='story';
  const put=(selector,text)=>{const e=root.querySelector(selector);if(e&&e.textContent!==text)e.textContent=text;};
  put('[data-settlement-detail-reading]',detail.text);put('[data-settlement-story-title]',f.beat.title);
  put('.kg-heading h1',c.year+' · '+(isStory?f.beat.title:detail.title));
  put('[data-hs-caption-era]',c.year+' / 察布查尔 · 关系示意');put('[data-hs-caption-title]',isStory?f.beat.label:detail.title);put('[data-hs-caption-text]',isStory?f.beat.look:detail.text);put('[data-hs-caption-look]','可暂停、自由转动与返回地图。');
  for(const b of root.querySelectorAll('[data-settlement-beat]'))b.setAttribute('aria-current',Number(b.dataset.settlementBeat)===f.index?'step':'false');
  put('[data-kg-action=run]',adapter.running()?'暂停变化':'继续变化');
  const follow=root.querySelector('[data-settlement-follow]');if(follow)follow.hidden=settlementFollow||!isStory;
  if(isStory&&settlementFollow&&!director?.manualView&&settlementBeatKey!==f.phaseKey){settlementBeatKey=f.phaseKey;adapter.settlementLook?.(f.beat.focus);viewport.dataset.settlementCameraBeat=f.phaseKey;}
 }
''' +s[end:];p.write_text(s,encoding='utf-8')
edit('sandbox.js',[
 ("import {settlementCameraPose", "import {settlementStory} from './settlement-story.js';\nimport {settlementCameraPose"),
 ("const host=$('canvas-host'),p=settlementCameraPose(focus,stageOrigins.people,host.clientWidth/host.clientHeight,camera.fov);", "const host=$('canvas-host'),look=focus==='story'?(settlementStory[viewport.dataset.settlementChronology]?.steps[0].focus??'overview'):focus,p=settlementCameraPose(look,stageOrigins.people,host.clientWidth/host.clientHeight,camera.fov);"),
 ("      model:options=>{", "      settlementLook:focus=>{if(lived?.stage!=='people')return;cancelPlatformArrival();const host=$('canvas-host'),p=settlementCameraPose(focus,stageOrigins.people,host.clientWidth/host.clientHeight,camera.fov);transition={from:camera.position.clone(),to:p.position,oldTarget:orbit.target.clone(),target:p.target,start:performance.now(),duration:reducedMotion?1:1800};orbit.minDistance=p.min;orbit.maxDistance=p.max;orbit.enablePan=true;orbit.maxPolarAngle=Math.PI*.49;},\n      model:options=>{"),
])
edit('exploration-director-paths.js',[
 ("settlement:'settle',detail:'home'","settlement:'settle',detail:'story'"),
 ("settlement:'dig',detail:'water'","settlement:'dig',detail:'story'"),
 ("settlement:'flow',detail:'overview'","settlement:'flow',detail:'story'"),
 ("next:'从安置地域，走近一个家庭的具体需要。'", "next:'把安置后的生产需求，带到住处、水系与耕地的关系模型。'"),
])
edit('exploration-director.js',[
 ("import {settlementStages}", "import {settlementStoryFrame} from './settlement-story.js';\nimport {settlementStages}"),
 ("const reading=s.shot.settlement?{kind:'chronology',look:settlementStages.find(x=>x.id===s.shot.settlement).look,index:settlementStages.findIndex(x=>x.id===s.shot.settlement),steps:settlementStages.map(x=>x.year+' · '+x.title)}", "const settlementReading=s.shot.settlement?settlementStoryFrame(s.shot.settlement,Number(viewport.dataset.settlementChronologyProgress)||0):null;\n  const reading=settlementReading?{kind:'chronology',look:settlementReading.beat.look,index:settlementReading.index,steps:settlementReading.story.steps.map(x=>x.label)}"),
])
edit('index.html',[("</head>",'<link rel="stylesheet" href="./settlement-story.css">\n</head>')])
print('R85 causal story guide, camera following and director integration installed.')
