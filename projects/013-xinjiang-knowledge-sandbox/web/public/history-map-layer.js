import * as THREE from 'three';
import {surfaceMaterial} from './surface.js';
import {terrainPoint,terrainDimensions} from './geo.js';
import {buildEventObjects} from './history-event-objects.js';
import {buildRegionAtlas} from './region-atlas-map.js';

// An abstract inside/outside observation, not an archaeological or administrative
// reconstruction. The marker stays inside the model's open central passage.
export const institutionConnectionDuration=12;
export function institutionConnectionFrame(value){
 const progress=Number.isFinite(Number(value))?Math.max(0,Math.min(1,Number(value))):0;
 const entering=Math.min(1,progress/.4),returning=Math.max(0,(progress-.6)/.4);
 const state=progress===0?'ready':progress<.4?'entering':progress<.6?'inside':progress<1?'returning':'complete';
 const x=progress<.4?-.07:progress<.6?-.07+.14*(progress-.4)/.2:.07;
 const z=progress<.4?1.9-2.05*entering:progress<.6?-.15:-.15+2.05*returning;
 return {progress,state,position:[x,.32,z],entering,returning};
}
export function advanceInstitutionConnection(progress,dt,{playing=false,visible=false}={}){
 const start=institutionConnectionFrame(progress).progress;
 return playing&&visible&&Number.isFinite(dt)&&dt>0?Math.min(1,start+dt/institutionConnectionDuration):start;
}
export function installHistoryMapLayer({scene,viewport,dem,onVisit,onPart,onFocus,earthTexture,elevationScale=()=>18}){
 const root=new THREE.Group();root.name='historical-orientation';root.visible=false;scene.add(root);
 const labels=document.createElement('div');labels.className='hp-map-pins';labels.setAttribute('aria-label','历史事件地图地点');viewport.append(labels);
 const connectors=document.createElementNS('http://www.w3.org/2000/svg','svg');connectors.classList.add('hp-pin-connectors');connectors.setAttribute('aria-hidden','true');labels.append(connectors);
 const legend=document.createElement('div');legend.className='hp-map-legend';viewport.append(legend);
 let eventObjects=null;
 let lastHeight=elevationScale(),current=null,signature='',markers=[],city=null,cityVisible=false,exploded=false,part=-1,roofHeight=0;
 let connectionProgress=0,connectionPlaying=false,structureMotion=true;
 const dimensions=terrainDimensions(dem),point=(lon,lat)=>{const p=new THREE.Vector3(...terrainPoint(dem,lon,lat,elevationScale(),dimensions));p.y+=.16;return p;};
 function release(){root.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});root.clear();connectors.replaceChildren();labels.replaceChildren(connectors);markers=[];city=null;}
 function block(parent,w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),surfaceMaterial(color,{roughness:.98},'clay'));m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function buildConnection(parent){
  const group=new THREE.Group();group.name='abstract-inside-outside-connection';parent.add(group);
  const segments=80;
  const path=(start,end,color,opacity)=>{
   const points=Array.from({length:segments+1},(_,i)=>{const p=institutionConnectionFrame(start+(end-start)*i/segments).position;return new THREE.Vector3(p[0],.23,p[2]);});
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity}));group.add(line);return line;
  };
  path(0,1,0x8fa399,.24);
  const incoming=path(0,.4,0xf0cd8b,.95),outgoing=path(.6,1,0x8bd7c4,.95);
  const marker=new THREE.Mesh(new THREE.ConeGeometry(.085,.18,4),new THREE.MeshBasicMaterial({color:0xf0cd8b}));marker.rotation.x=Math.PI/2;group.add(marker);
  const arrows=[];for(const z of [1.55,.9,.35,-.12]){const arrow=new THREE.Mesh(new THREE.ConeGeometry(.055,.12,3),new THREE.MeshBasicMaterial({color:0xf0cd8b,transparent:true,opacity:.6}));arrow.rotation.x=-Math.PI/2;arrow.position.set(-.07,.255,z);group.add(arrow);arrows.push(arrow);}
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.12,.011,6,32),new THREE.MeshBasicMaterial({color:0xf0cd8b,transparent:true,opacity:.75}));ring.rotation.x=Math.PI/2;group.add(ring);
  return {group,incoming,outgoing,marker,ring,segments,arrows};
 }
 function connectionState(){const frame=institutionConnectionFrame(connectionProgress);return {progress:frame.progress,state:frame.state,playing:connectionPlaying,paused:!connectionPlaying&&frame.progress>0&&frame.progress<1};}
 function syncConnection(){
  const frame=institutionConnectionFrame(connectionProgress),visible=!!current?.visible&&cityVisible,visual=city?.connection;
  if(visual){
   visual.group.visible=visible;visual.marker.position.fromArray(frame.position);
   visual.incoming.geometry.setDrawRange(0,Math.floor(frame.entering*visual.segments)+1);visual.incoming.visible=frame.entering>0;
   visual.outgoing.geometry.setDrawRange(0,Math.floor(frame.returning*visual.segments)+1);visual.outgoing.visible=frame.returning>0;
   const color=frame.progress>=.6?0x8bd7c4:0xf0cd8b;visual.marker.rotation.x=frame.progress>=.6?Math.PI/2:-Math.PI/2;visual.marker.material.color.set(color);visual.arrows.forEach((a,i)=>{a.visible=frame.progress>0;a.rotation.x=frame.progress>=.6?Math.PI/2:-Math.PI/2;a.material.color.setHex(color);a.material.opacity=frame.progress>=.6?.65:.30+.45*Math.max(0,Math.min(1,frame.entering*4-i));});visual.ring.material.color.set(color);
   visual.ring.position.copy(visual.marker.position);visual.ring.position.y=.235;visual.ring.scale.setScalar(frame.state==='inside'?1.15+.1*Math.sin(frame.progress*50):1);
  }
  const value=connectionState();viewport.dataset.structureConnectionProgress=value.progress.toFixed(4);viewport.dataset.structureConnectionState=value.state;viewport.dataset.structureConnectionPlaying=String(value.playing);viewport.dataset.structureConnectionPaused=String(value.paused);
  return value;
 }
 function playConnection({playing,reset=false}={}){
  if(reset){connectionProgress=0;connectionPlaying=false;}
  if(typeof playing==='boolean')connectionPlaying=playing&&!!current?.visible&&cityVisible&&connectionProgress<1;
  return syncConnection();
 }
 function cityModel(){
  const g=new THREE.Group();g.position.copy(point(84.25,41.78));g.position.y+=.1;root.add(g);
  block(g,3,.16,2.7,0x917c56,0,0,0);
  const groups=Array.from({length:4},(_,i)=>{const p=new THREE.Group();p.userData.part=i;g.add(p);return p;});
  const matColor=0xb89a65;block(groups[0],.48,.7,.5,matColor,-.48,.16,1.08);block(groups[0],.48,.7,.5,matColor,.48,.16,1.08);block(groups[0],1.48,.2,.5,0xd4bc88,0,.88,1.08);
  block(groups[1],.35,.025,2.3,0xc3b181,0,.17,0);
  for(const x of [-1.3,1.3])block(groups[2],.16,.56,2.35,matColor,x,.16,0);
  block(groups[2],2.72,.56,.16,matColor,0,.16,-1.15);
  for(const x of [-1.25,1.25])for(const z of [-1.08,1.08])block(groups[2],.3,.72,.3,0xc5aa74,x,.16,z);
  const roofs=[];
  for(const [x,z,w,d] of [[-.7,-.1,.65,1.05],[.7,-.1,.65,1.05],[0,-.78,1.5,.48]]){
   block(groups[3],w,.36,d,0xa4865c,x,.16,z);const roof=block(groups[3],w+.07,.09,d+.07,0x6d7665,x,.52,z);roof.userData.baseY=roof.position.y;roofs.push(roof);
  }
  block(groups[3],.72,.03,.62,0xc5b98f,0,.17,-.12);
  for(const p of groups)p.traverse(o=>{if(o.material)o.userData.original=o.material.color.clone();if(o.isMesh)o.userData.hpPart=p.userData.part;});
  const partLabels=['城门','通道','围墙','内部空间'];
  for(let i=0;i<4;i++){const b=document.createElement('button');b.textContent=partLabels[i];b.dataset.hpPart=i;b.addEventListener('click',()=>onPart(i));labels.append(b);markers.push({button:b,local:new THREE.Vector3(...[[0,1.15,1.05],[0,.35,.25],[-1.3,.95,0],[.65,.7,-.15]][i]),city:true});}
  return {group:g,parts:groups,roofs,connection:buildConnection(g)};
 }
 function build(e){release();buildRegionAtlas({root,labels,point,dem,filter:"base",onVisit,markers,event:e});for(const [i,n] of e.nodes.entries()){
  const p=point(n.lon,n.lat),g=new THREE.Group();g.position.copy(p);root.add(g);
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(.08,12,8),new THREE.MeshBasicMaterial({color:0xf4d49b}));g.add(sphere);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.25,.012,6,42),new THREE.MeshBasicMaterial({color:0xd3bb83,transparent:true,opacity:.8}));ring.rotation.x=Math.PI/2;g.add(ring);
  const stem=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,.35,0)]),new THREE.LineBasicMaterial({color:0xc4b585}));g.add(stem);
  const b=document.createElement('button');b.dataset.hpMapPlace=n.id;b.innerHTML=`${n.name}<small>${n.role}</small>`;b.addEventListener('click',()=>onVisit(n.id));labels.append(b);markers.push({button:b,position:p.clone().add(new THREE.Vector3(0,e.id==='protectorate'?1.05:.65,0)),node:n.id,index:i,sphere,ring});
 }
 if(e.id==='protectorate')city=cityModel();
 eventObjects=buildEventObjects({root,event:e,point,earthTexture,city,labels,onVisit,onFocus,markers});viewport.dataset.eventGeometryBuilds=String(Number(viewport.dataset.eventGeometryBuilds||0)+1);let meshes=0;root.traverse(o=>{if(o.isMesh)meshes++;});viewport.dataset.eventMeshCount=meshes;
 }
 function buildOverview(filter,event){
  release();eventObjects=null;
  viewport.dataset.eventMeshCount=buildRegionAtlas({root,labels,point,dem,filter,onVisit,markers,event});
  viewport.dataset.eventGeometryBuilds=String(Number(viewport.dataset.eventGeometryBuilds||0)+1);
 }
 function set({visible,event,nodeId,phase,progress=phase/2,structure,overview=null,observed=[],geometryKey=null,fade=1,labelsVisible=true}){
  if(!visible){root.visible=false;labels.hidden=true;legend.hidden=true;cityVisible=false;current=null;connectionPlaying=false;syncConnection();return;}
  const key=overview?'overview-'+overview+(overview==='history'?'-'+event.id:''):event.id+(geometryKey?':'+geometryKey:'');
  labels.setAttribute('aria-label',overview?'地图探索入口':'历史事件地图地点');
  if(signature!==key){overview?buildOverview(overview,event):build(event);signature=key;exploded=false;part=-1;roofHeight=0;connectionProgress=0;connectionPlaying=false;}
  current={visible,event,nodeId,phase,progress,structure,overview,observed,geometryKey,fade,labelsVisible};root.visible=visible;labels.hidden=!visible||!labelsVisible;legend.hidden=!visible;cityVisible=!!structure;
  if(!cityVisible)connectionPlaying=false;syncConnection();
  if(overview){legend.hidden=true;for(const m of markers){m.button.dataset.visited=String(observed.includes(m.observationKey??m.hub)||m.hub?.startsWith('event:')&&observed.some(id=>id.startsWith('place:'+m.hub.slice(6)+':')));m.button.setAttribute('aria-pressed',String(m.hub===nodeId));}return;}
  const frame=eventObjects.update(progress,structure);const mats=new Set();root.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});for(const m of mats){m.userData.guideBase??={opacity:m.opacity,transparent:m.transparent};m.opacity=m.userData.guideBase.opacity*fade;const transparent=fade<1||m.userData.guideBase.transparent;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}}
  viewport.dataset.eventRoute=frame.route.toFixed(4);viewport.dataset.eventBuild=frame.build.toFixed(4);viewport.dataset.eventNetwork=frame.network.toFixed(4);viewport.dataset.eventSettlement=frame.settle.toFixed(4);viewport.dataset.eventWater=frame.water.toFixed(4);viewport.dataset.eventVisualState=JSON.stringify(frame.visualState);viewport.dataset.eventReadingStage=['background','process','impact'][frame.phase];viewport.dataset.eventObjects=event.id==='zhang'?'gateway caravan market links':event.id==='protectorate'?'foundation gate walls offices couriers':'globe direction families homes fields canal';
  legend.textContent=frame.action+' ｜ 图标化模型 · 非等比例／非遗址复原';
  for(const m of markers){if(m.node){m.button.dataset.visited=String(observed.includes('place:'+event.id+':'+m.node));m.button.setAttribute('aria-pressed',String(m.node===nodeId));const phaseNode=event.id==='xibe'?(phase===1?'ili':phase===2?'qabqal':null):event.nodes[Math.min(phase,event.nodes.length-1)]?.id;m.button.dataset.active=String(frame.active.includes(m.node));m.sphere.material.color.set(frame.active.includes(m.node)?0xc1efa9:0xa99a7e);m.ring.scale.setScalar(m.node===(nodeId??phaseNode)?1.4:1);m.ring.material.opacity=m.node===nodeId?1:.6;}}
  viewport.dataset.historyStructure=String(cityVisible);
 }
 function selectPart(index){part=index;if(city)for(const [i,p] of city.parts.entries())p.traverse(o=>{if(o.material)o.material.color.copy(i===part?new THREE.Color(0xdfcd86):o.userData.original);});viewport.dataset.structurePart=['gate','passage','wall','space'][index];}
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;
 const host=viewport.querySelector('#canvas-host');host.addEventListener('pointerdown',ev=>{down=[ev.clientX,ev.clientY];});host.addEventListener('pointerup',ev=>{if(!current?.visible||!cityVisible||!city||!down||Math.hypot(ev.clientX-down[0],ev.clientY-down[1])>5)return;const box=host.getBoundingClientRect();mouse.set((ev.clientX-box.left)/box.width*2-1,-(ev.clientY-box.top)/box.height*2+1);if(!lastCamera)return;ray.setFromCamera(mouse,lastCamera);const hit=ray.intersectObject(city.group,true).find(h=>h.object.userData.hpPart!==undefined);if(hit)onPart(hit.object.userData.hpPart);});
 let lastCamera=null;
 function update(camera,dt,markersVisible){lastCamera=camera;if(!current?.visible)return;if(lastHeight!==elevationScale()){lastHeight=elevationScale();const settings=current;settings.overview?buildOverview(settings.overview,settings.event):build(settings.event);set(settings);if(part>=0)selectPart(part);}const w=host.clientWidth,h=host.clientHeight;const occupied=[];roofHeight=THREE.MathUtils.damp(roofHeight,exploded?1.1:0,5,structureMotion?dt:0);if(city)for(const roof of city.roofs)roof.position.y=roof.userData.baseY+roofHeight;viewport.dataset.structureRoofLift=roofHeight.toFixed(4);
  connectionProgress=advanceInstitutionConnection(connectionProgress,dt,{playing:connectionPlaying,visible:cityVisible});if(connectionProgress>=1)connectionPlaying=false;syncConnection();
  connectors.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const entry=current.overview&&viewport.classList.contains('ra-entry'),journey=viewport.classList.contains('ej-active');
  const maxY=entry?h-168:h-65;
  const reserved=entry?[{left:0,right:w<700?180:290,top:0,bottom:w<700?110:360},{left:w-(w<700?195:260),right:w,top:75,bottom:360},{left:0,right:w,top:h-195,bottom:h}]:(journey?[{left:w-344,right:w,top:60,bottom:h},{left:0,right:282,top:h-245,bottom:h},{left:0,right:w,top:0,bottom:75}]:[{left:10,right:Math.min(w-12,245),top:5,bottom:116},...(!current.overview?[{left:16,right:Math.min(w-12,390),top:114,bottom:155}]:[])]);
  if(viewport.classList.contains('kg-active')&&viewport.dataset.learnStage==='history'){const hostRect=host.getBoundingClientRect();for(const el of viewport.querySelectorAll('.kg-heading,.kg-event-caption')){const b=el.getBoundingClientRect();reserved.push({left:b.left-hostRect.left,right:b.right-hostRect.left,top:b.top-hostRect.top,bottom:b.bottom-hostRect.top});}}
  const overlaps=(a,b)=>a.left<b.right+7&&a.right>b.left-7&&a.top<b.bottom+7&&a.bottom>b.top-7;
  for(const m of markers){
   if(!m.connector){m.connector=document.createElementNS('http://www.w3.org/2000/svg','line');connectors.append(m.connector);}
   const display=markersVisible&&m.sceneVisible!==false&&(cityVisible?m.city:!m.city);if(!display){m.button.hidden=true;m.connector.setAttribute('visibility','hidden');continue;}
   const p=m.city?city.group.localToWorld(m.local.clone()):m.position.clone();p.project(camera);const px=(p.x+1)*w/2,py=(1-p.y)*h/2;
   m.button.hidden=p.z>1||p.z< -1||px<12||px>w-12||py<70||py>(entry?h-162:h-65);
   m.connector.setAttribute('visibility','hidden');if(m.button.hidden)continue;
   const width=m.button.offsetWidth||140,height=m.button.offsetHeight||40;
   if(m.quiet){m.button.style.left=px+'px';m.button.style.top=py+'px';occupied.push({left:px-width/2,right:px+width/2,top:py-height,bottom:py});continue;}
   const candidates=[];
   for(const dx of [0,-150,150,-280,280])for(const dy of [0,-65,65,-130,130,195])candidates.push([px+dx,py+dy]);
   for(const x of [width/2+12,w/2,w-width/2-12])for(let y=150;y<h-80;y+=65)candidates.push([x,y]);
   let best=null,bestScore=Infinity;
   for(let [x,y] of candidates){x=Math.max(width/2+12,Math.min(w-width/2-12,x));y=Math.max(height+90,Math.min(maxY,y));const box={left:x-width/2,right:x+width/2,top:y-height,bottom:y};const collisions=[...reserved,...occupied].filter(prior=>overlaps(box,prior)).length;const score=collisions*1000000+(x-px)**2+(y-py)**2;if(score<bestScore){best={x,y,box};bestScore=score;}}
   occupied.push(best.box);m.button.style.left=best.x+'px';m.button.style.top=best.y+'px';
   if(Math.hypot(best.x-px,best.y-py)>18){m.connector.setAttribute('x1',px);m.connector.setAttribute('y1',py);m.connector.setAttribute('x2',Math.max(best.box.left,Math.min(best.box.right,px)));m.connector.setAttribute('y2',best.y-height/2);m.connector.setAttribute('visibility','visible');}
  }
 }
 return {set,update,selectPart,playConnection,connectionState,partPoint(index){city?.group.updateWorldMatrix(true,false);return city&&index>=0&&index<4?city.group.localToWorld(new THREE.Vector3(...[[0,1.15,1.05],[0,.35,.25],[-1.3,.95,0],[.65,.7,-.15]][index])).toArray():null;},readingAnchor(index){return current?.visible&&!current.overview?eventObjects?.readingAnchor(index):null;},holdStructure(value){structureMotion=!value;},explode(value){exploded=value;structureMotion=true;viewport.dataset.structureExploded=String(value);},hide(){root.visible=false;labels.hidden=true;legend.hidden=true;current=null;connectionPlaying=false;syncConnection();},get structureVisible(){return cityVisible&&!!current?.visible;}};
}
