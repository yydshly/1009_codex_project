from pathlib import Path

project=Path(__file__).resolve().parents[1]
if (project/'process/round-86/retention.json').exists():
    raise SystemExit('R86 is frozen; use a new incremental round.')
root=project/'web/public'
if 'function localStructurePlay(' in (root/'knowledge-guide.js').read_text(encoding='utf-8'):
    raise SystemExit('R86 integration is already installed; edit the live source for further changes.')
def edit(name,pairs):
    path=root/name
    text=path.read_text(encoding='utf-8')
    for old,new in pairs:
        if new in text:
            continue
        if text.count(old)!=1:
            raise RuntimeError(f'{name}: expected one occurrence of {old[:70]!r}, got {text.count(old)}')
        text=text.replace(old,new)
    path.write_text(text,encoding='utf-8')

edit('history-trails.js',[
 ('// Focused questions',"import {localModelPanel} from './local-observation.js';\n// Focused questions"),
 (" const i=trailStepIds.indexOf(step)"," if(step==='model')return localModelPanel(c,{running,records,part,open,connection,recordHTML});\n const i=trailStepIds.indexOf(step)")
])
edit('lived-scenes.js',[
 ("import * as THREE from 'three';","import * as THREE from 'three';\nimport {decorateMarketLinkage,updateMarketLinkage} from './market-linkage.js';"),
 ("g.userData={actors,caravans,cargo,carrier,carried,receipts};", "g.userData={actors,caravans,cargo,carrier,carried,receipts,linkage:decorateMarketLinkage(g)};"),
 ("d.deliveryAt=deliveryAt;viewport.dataset.goods", "d.deliveryAt=deliveryAt;viewport.dataset.marketCarrier=JSON.stringify(d.carrier.root.position.toArray());viewport.dataset.goods"),
 ("  if(detail?.phrase)","  if(config.stage==='market')updateMarketLinkage(d.linkage,viewport.dataset,viewport.dataset.localNarrative==='market',viewport.dataset.localObservationSelected==='true');\n  if(detail?.phrase)")
])
edit('history-map-layer.js',[
 ("import * as THREE from 'three';", "import * as THREE from 'three';\nimport {surfaceMaterial} from './surface.js';"),
 ("let connectionProgress=0,connectionPlaying=false;", "let connectionProgress=0,connectionPlaying=false,structureMotion=true;"),
 ("new THREE.MeshStandardMaterial({color,roughness:.85})", "surfaceMaterial(color,{roughness:.98},'clay')"),
 ("const marker=new THREE.Mesh(new THREE.SphereGeometry(.07,16,10),", "const marker=new THREE.Mesh(new THREE.ConeGeometry(.085,.18,4),"),
 ("group.add(marker);\n  const ring", "marker.rotation.x=Math.PI/2;group.add(marker);\n  const arrows=[];for(const z of [1.55,.9,.35,-.12]){const arrow=new THREE.Mesh(new THREE.ConeGeometry(.055,.12,3),new THREE.MeshBasicMaterial({color:0xf0cd8b,transparent:true,opacity:.6}));arrow.rotation.x=-Math.PI/2;arrow.position.set(-.07,.255,z);group.add(arrow);arrows.push(arrow);}\n  const ring"),
 ("return {group,incoming,outgoing,marker,ring,segments};", "return {group,incoming,outgoing,marker,ring,segments,arrows};"),
 ("visual.marker.material.color.set(color);", "visual.marker.rotation.x=frame.progress>=.6?-Math.PI/2:Math.PI/2;visual.marker.material.color.set(color);visual.arrows.forEach((a,i)=>{a.visible=frame.progress>0;a.rotation.x=frame.progress>=.6?-Math.PI/2:Math.PI/2;a.material.color.setHex(color);a.material.opacity=frame.progress>=.6?.65:.30+.45*Math.min(1,frame.entering*4-i);});"),
 ("roofHeight=THREE.MathUtils.damp(roofHeight,exploded?1.1:0,5,dt);", "roofHeight=THREE.MathUtils.damp(roofHeight,exploded?1.1:0,5,structureMotion?dt:0);"),
 ("explode(value){exploded=value;", "holdStructure(value){structureMotion=!value;},explode(value){exploded=value;structureMotion=true;")
])
edit('sandbox.js',[
 ("import {stageOrigins}","import {marketObservationPose} from './local-observation.js';\nimport {stageOrigins}"),
 ("structure:({show=false,open,part}={})", "structure:({show=false,open,part,motion}={})"),
 ("if(part!==undefined&&part>=0)historyMapLayer.selectPart(part);renderer.shadowMap", "if(part!==undefined&&part>=0)historyMapLayer.selectPart(part);if(motion!==undefined)historyMapLayer.holdStructure(!motion);renderer.shadowMap"),
 ("      settlementLook:focus=>", "      localLook:({model,frame})=>{const host=$('canvas-host');let target,direction,distance;if(model==='market'){if(lived?.stage!=='market')return false;const spec=marketObservationPose(frame,JSON.parse(viewport.dataset.marketActors||'[]'),host.clientWidth/host.clientHeight,camera.fov);target=new THREE.Vector3(...spec.target);direction=new THREE.Vector3(...spec.direction).normalize();distance=spec.distance;}else{if(!historyMapLayer.structureVisible)return false;const index={gate:0,passage:1,inside:3,overview:1}[frame.focus]??1;target=new THREE.Vector3(...historyMapLayer.partPoint(index));if(index===0)target.y-=.6;direction=new THREE.Vector3(.32,.90,1).normalize();distance=Math.max(4.6,4.8/(2*Math.tan(camera.fov*Math.PI/360)*Math.max(.35,host.clientWidth/host.clientHeight)*.88));}cancelPlatformArrival();transition={from:camera.position.clone(),to:target.clone().addScaledVector(direction,distance),oldTarget:orbit.target.clone(),target,start:performance.now(),duration:reducedMotion?1:1500};orbit.minDistance=2.5;orbit.maxDistance=180;orbit.enablePan=true;orbit.maxPolarAngle=Math.PI*.49;return true;},\n      settlementLook:focus=>")
])
edit('exploration-director.js',[
 ("import {settlementStoryFrame}", "import {localObservationFrame} from './local-observation.js';\nimport {settlementStoryFrame}"),
 ("const reading=settlementReading?", "const localReading=['market','structure'].includes(s.shot.model)?localObservationFrame(s.shot.model,viewport.dataset,true):null;\n  const reading=localReading?{kind:localReading.kind,index:localReading.index,steps:localReading.steps,look:localReading.text}:settlementReading?")
])
edit('knowledge-guide.js',[
 ("import {settlementStoryFrame,", "import {localObservationFrame} from './local-observation.js';\nimport {settlementStoryFrame,"),
 (" let settlementFollow=true", " let localFollow=true,localCameraKey=null,localHostSize=null,localStory={active:false,playing:false,phase:'gate',elapsed:0};\n let settlementFollow=true"),
 (" function render(){", " function render(){\n  viewport.classList.toggle('local-narrative-active',modelOpen&&!!historyTrails[trail]&&['market','structure'].includes(modelScene));"),
 ("if((trail||placeOrigin)&&stage!=='world'&&stage!=='map')", "if((trail||placeOrigin)&&stage!=='world'&&stage!=='map'&&!(modelOpen&&historyTrails[trail]))"),
 ("if(stage==='place'&&placeOrigin&&!relationReturn){", "if(stage==='place'&&placeOrigin&&!relationReturn&&!(modelOpen&&historyTrails[trail])){"),
 ("if(viewport.dataset.zhangScene==='true'){", "if(viewport.dataset.zhangScene==='true'&&!root.querySelector('.lp-panel')){"),
 ("historyStoryPlayer.update(0);updateSettlementReading();", "historyStoryPlayer.update(0);updateSettlementReading();updateLocalReading(0);"),
 ("historyStoryPlayer.update(dt);updateSettlementReading();", "historyStoryPlayer.update(dt);updateSettlementReading();updateLocalReading(dt);"),
 ("if(modelOpen&&trail==='zhang')contextMap.update", "if(modelOpen&&historyTrails[trail])contextMap.update(root.querySelector('.lp-context canvas'),{path:trail,selected:place,kind:modelScene,records:director?.active?directorReceipts:memory().records});\n  if(modelOpen&&trail==='zhang')contextMap.update"),
 ("adapter.structure({show:true,open:m.open,part:m.part});render();", "adapter.structure({show:true,open:m.open,part:m.part});localCameraKey=null;render();"),
 (";settlementBeatKey=null;}render();build();writeURL();adapter.resize();}", ";settlementBeatKey=null;}localCameraKey=null;render();build();writeURL();adapter.resize();}"),
 ("viewport.dataset.structureObservationOwner='user';const m=memory();m.part=index;", "viewport.dataset.structureObservationOwner='user';localStory.active=false;localFollow=false;const m=memory();m.part=index;"),
 ("if(b.dataset.htGood!==undefined){root.querySelector(`[data-good=", "if(b.dataset.htGood!==undefined){localFollow=true;localCameraKey=null;root.querySelector(`[data-good="),
 ("if(b.dataset.htAction){if(", "if(b.dataset.htAction){if(['roof','connection','connection-reset'].includes(b.dataset.htAction))localStory.active=false;if(b.dataset.htAction==='model-fit'){localFollow=false;adapter.cancel();}if("),
 ("const c=directorPath;if(shot.settlement)", "const c=directorPath;localFollow=true;localCameraKey=null;localStory.active=false;adapter.structure({motion:true});if(shot.settlement)"),
 ("adapter.model({playing:false});adapter.structureConnection({playing:false});relationMoving=false;worldMoving=false;},", "adapter.model({playing:false});adapter.structure({motion:false});adapter.structureConnection({playing:false});relationMoving=false;worldMoving=false;},"),
 (" function directorResume(shot){", " function directorResume(shot){\n  adapter.structure({motion:true});"),
 ("if(director?.inspectView())return true;if(modelOpen&&modelScene==='people'", "if(director?.inspectView())return true;if(modelOpen&&historyTrails[trail]&&['market','structure'].includes(modelScene)){localFollow=false;adapter.cancel();return true;}if(modelOpen&&modelScene==='people'")
])
path=root/'knowledge-guide.js'
text=path.read_text(encoding='utf-8')
at=text.index(' function trailNavigate(')
code=''' function localStructurePlay(start=false){
  if(!modelOpen||modelScene!=='structure')return;
  viewport.dataset.structureObservationOwner='user';const m=memory();
  if(start){localStory={active:true,playing:true,phase:'gate',elapsed:0};m.open=false;m.part=0;adapter.structure({open:false,part:0,motion:true});adapter.structureConnection({playing:false,reset:true});localFollow=true;localCameraKey=null;adapter.model({playing:true});render();build();return;}
  if(!localStory.active||localStory.phase==='complete')return;
  localStory.playing=!localStory.playing;adapter.model({playing:localStory.playing});adapter.structure({motion:localStory.playing});adapter.structureConnection({playing:localStory.playing&&localStory.phase==='connection'});updateLocalReading(0);
 }
 function updateLocalReading(dt=0){
  if(!modelOpen||!historyTrails[trail]||!['market','structure'].includes(modelScene)){viewport.dataset.localNarrative='';return;}
  const d=viewport.dataset,m=memory(),c=historyTrails[trail];d.localNarrative=modelScene;
  if(modelScene==='structure'&&!director?.active&&localStory.active&&localStory.playing){
   if(localStory.phase==='gate'){localStory.elapsed+=Math.max(0,Math.min(.1,dt));if(localStory.elapsed>=2){localStory.phase='roof';m.open=true;m.part=1;adapter.structure({open:true,part:1,motion:true});}}
   else if(localStory.phase==='roof'&&Number(d.structureRoofLift)>=1.04){localStory.phase='connection';m.part=3;adapter.structure({part:3,motion:true});adapter.structureConnection({reset:true,playing:true});}
   else if(localStory.phase==='connection'&&d.structureConnectionState==='complete'){localStory.phase='complete';localStory.playing=false;adapter.model({playing:false});}
  }
  const selected=modelScene==='market'&&(director?.active?directorChoice!==null&&Number(d.goods)===director.shot.goods:m.pending!==null||m.records.some(r=>r.priority===d.goods));d.localObservationSelected=String(selected);
  const f=localObservationFrame(modelScene,d,selected);d.localObservationPhase=f.index;d.localObservationCue=f.key;
  const put=(s,t)=>{const e=root.querySelector(s);if(e&&e.textContent!==t)e.textContent=t;};
  put('[data-lp-title]',f.title);put('[data-lp-text]',f.text);put('.kg-heading h1',f.title);
  put('[data-hs-caption-era]',modelScene==='market'?'喀什 / 长期交流 · 原创情境':'轮台地域参照 / 空间观察');put('[data-hs-caption-title]',f.steps[f.index]);put('[data-hs-caption-text]',f.text);
  for(const e of root.querySelectorAll('[data-lp-step]'))e.setAttribute('aria-current',Number(e.dataset.lpStep)===f.index?'step':'false');
  if(modelScene==='market')for(const marker of markers.filter(p=>p.recipient!==undefined)){marker.button.dataset.lpSelected=String(selected&&marker.recipient===f.good);marker.priority=selected&&marker.recipient===f.good?0:2;}
  const toggle=root.querySelector('[data-lp-story=toggle]');if(toggle){toggle.disabled=!localStory.active||localStory.phase==='complete';toggle.textContent=localStory.phase==='complete'?'变化已完成':localStory.playing?'暂停变化':'继续变化';}
  const follow=root.querySelector('[data-lp-follow]');if(follow)follow.hidden=localFollow;
  const host=viewport.querySelector('#canvas-host'),size=host.clientWidth+'/'+host.clientHeight;if(size!==localHostSize){localHostSize=size;if(localFollow)localCameraKey=null;}
  if(localFollow&&!director?.manualView&&localCameraKey!==f.key&&adapter.localLook?.({model:modelScene,frame:f})!==false)localCameraKey=f.key;
 }
'''
text=text[:at]+code+text[at:]
at=text.index("  if(b.dataset.htRoute)")
text=text[:at]+'''  if(b.dataset.lpStory){localStructurePlay(b.dataset.lpStory==='start');return;}
  if(b.hasAttribute('data-lp-follow')){localFollow=true;localCameraKey=null;updateLocalReading(0);return;}
'''+text[at:]
path.write_text(text,encoding='utf-8')
edit('index.html',[("</head>",'<link rel="stylesheet" href="./local-observation.css">\n</head>')])
print('R86 compact local observation, state-following cameras and visible links installed.')
