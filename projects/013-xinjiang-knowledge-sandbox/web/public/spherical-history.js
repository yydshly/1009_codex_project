import {historyMapIntroduction} from './history-presentation.js';
import * as THREE from 'three';
import {sphericalEventPlan,sphericalRoute,sphericalVisualState} from './spherical-history-data.js';
import {createHistoryVisualModels} from './history-visual-models.js';
import {buildHistoryGrounding,groundHistoryObjects,surfaceCoordinates} from './history-grounding.js';
import {buildHistoryFocusMarker} from './history-focus-marker.js';
import {narrativeMapProgress} from './history-spatial-cues.js';

// The market begins acting when the exchange space is visible (network > .35).
// Invert the .65..1 smoothstep without storing a first-seen time: seeking and
// paused replay therefore reconstruct the same action, even after a map return.
export const marketActionStart=.65+.35*(.5-Math.sin(Math.asin(1-2*.35)/3));
export function marketActionClock(progress,motion){
 const p=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0,seconds=Number.isFinite(motion)?Math.max(0,motion):0;
 return seconds*Math.max(0,(p-marketActionStart)/Math.max(p,1e-6));
}

export function buildSphericalHistory({root,event,point,groundPoint=point,addMarker,viewport,modelsOnly=false,symbolScale=.5}){
 const plan=sphericalEventPlan(event),paths=[],symbols=[],nodes=[],visuals=createHistoryVisualModels();
 const gold=0xd6b47a,teal=0x87bfae,baseScale=symbolScale,material=visuals.material;
 const span=(value,start,end)=>{const t=Math.max(0,Math.min(1,(value-start)/(end-start)));return t*t*(3-2*t);};
 function radial(lon,lat){const g=new THREE.Group(),p=groundPoint(lon,lat,.001);g.position.copy(p);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p.clone().normalize());root.add(g);return g;}
 function symbol(lon,lat,node,kind,model){const g=radial(lon,lat);g.name='history-miniature-'+(node??'local');g.scale.setScalar(baseScale);g.add(model.root);const groundKind={kashgar:'market',luntai:'institution',qabqal:'settlement',turpan:'oasis'}[node]??'village',contact=buildHistoryGrounding({parent:root,anchor:g,groundPoint,kind:groundKind}),seat=groundHistoryObjects(model.root,groundPoint);symbols.push({g,node,kind,model,contact,seat});return {g,model};}
 function path(coords,color,{moving=false,kind='link',phase=0}={}){
  const ll=sphericalRoute(coords),ps=ll.map(p=>groundPoint(...p,.0025));if(!ps.length)return null;
  const muted=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ps),new THREE.LineBasicMaterial({color,transparent:true,opacity:.23,depthWrite:false}));root.add(muted);
  const curve=new THREE.CatmullRomCurve3(ps),geometry=new THREE.TubeGeometry(curve,160,kind==='route'?.0020:.0014,5,false);
  const line=new THREE.Mesh(geometry,material(color));root.add(line);
  const mover=new THREE.Group();mover.name=kind==='route'?'history-travelling-party':'history-regional-cargo';root.add(mover);mover.visible=moving;
  const actors=moving?visuals.caravan(kind==='route'?event.id:'cargo'):[];
  for(const actor of actors){actor.unitScale=actor.root.scale.clone();mover.add(actor.root);}
  const marker=moving?addMarker({id:'motion',name:kind==='link'?'地方往来 · 教学符号':event.id==='xibe'?'家庭与行装 · 远行示意':'商旅往来 · 跨时期示意',role:kind==='route'&&event.id==='zhang'?'商旅展示交流机制，不代表张骞使团或考证行程':'随观察进程移动的教学符号，非历史队伍复原'},ps[0].clone()):null;
  if(marker){delete marker.button.dataset.kgEventDestination;marker.button.dataset.kgAction='event-focus';marker.visible=false;marker.priority=0;}
  const obj={line,muted,mover,actors,curve,moving,marker,kind,phase,length:curve.getLength()};paths.push(obj);return obj;
 }
 for(const n of modelsOnly?[]:plan.nodes){
  const g=radial(n.lon,n.lat),ring=new THREE.Mesh(new THREE.TorusGeometry(.025,.003,5,24),material(gold));ring.rotation.x=Math.PI/2;ring.position.y=.002;g.add(ring);
  const observedRing=new THREE.Mesh(new THREE.TorusGeometry(.037,.0016,5,32),material(teal));observedRing.rotation.x=Math.PI/2;observedRing.position.y=.003;observedRing.visible=false;g.add(observedRing);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.008,8,6),material(gold));dot.position.y=.014;g.add(dot);
  // Lift the place label above the miniature so doors and people stay visible.
  const marker=addMarker(n,point(n.lon,n.lat).multiplyScalar(1.035));nodes.push({n,ring,observedRing,dot,marker});
 }
 const main=path(modelsOnly?[]:plan.route,gold,{moving:true,kind:'route'});
 const links=(modelsOnly?[]:plan.links).map((coords,i)=>path(coords,teal,{moving:event.id!=='xibe',phase:i}));
 const focusMarker=buildHistoryFocusMarker({root,groundPoint,addMarker,viewport});
 let center=null,exchange=null,settlement=null,institutionParts=[];
 if(event.id==='protectorate'){
  for(const [lon,lat]of [[80.6,40.5],[87.2,42.1]])symbol(lon,lat,null,'background',visuals.village());
  center=symbol(84.25,41.78,'luntai','process',visuals.institution());institutionParts=center.model.parts;
 }else if(event.id==='zhang'){
  exchange=symbol(75.99,39.47,'kashgar','impact',visuals.market());
  center=symbol(89.19,42.95,'turpan','impact',visuals.oasis());
 }else settlement=symbol(81.14,43.84,'qabqal','impact',visuals.settlement());
 let meshes=0;root.traverse(o=>{if(o.isMesh)meshes++;});
 viewport.dataset.sphericalEventBuilds=String(Number(viewport.dataset.sphericalEventBuilds||0)+1);viewport.dataset.sphericalEventMeshes=String(meshes);viewport.dataset.sphericalSymbolScale=String(baseScale);viewport.dataset.sphericalCaravanActors=String(paths.reduce((sum,p)=>sum+p.actors.length,0));
 function grow(g,v){if(!g)return;g.visible=v>.001;g.scale.y=Math.max(.001,v);}
 function emphasis(g,strength){g.traverse(o=>{const m=o.material;if(!m?.userData.baseColor||m.userData.localLight)return;m.color.copy(m.userData.baseColor).multiplyScalar(strength);m.emissiveIntensity=.035+.05*strength;});}
 const basis=new THREE.Matrix4(),up=new THREE.Vector3(),forward=new THREE.Vector3(),side=new THREE.Vector3();
 function reveal(obj,v,travel,clock){
  if(!obj)return;obj.line.geometry.setDrawRange(0,Math.floor(v*160)*5*6);
  obj.mover.visible=obj.moving&&v>.001;if(obj.marker)obj.marker.visible=obj.mover.visible;if(!obj.mover.visible)return;
  // Progress places the convoy. A separate, pausable clock articulates legs and cargo.
  const circulating=obj.kind==='link'&&v>=.999,arrivalBuffer=obj.kind==='route'&&event.id==='zhang'?Math.min(.2,.11/Math.max(.001,obj.length)):0;
  const head=circulating?(clock*.055+obj.phase*.39)%1:Math.max(0,Math.min(v,travel))*(1-arrivalBuffer);
  const gap=Math.min(.15,.047/Math.max(.001,obj.length)),walking=obj.kind==='route'&&travel>=.999?0:1;
  for(const [i,actor]of obj.actors.entries()){
   const t=head-i*gap;actor.root.visible=t>=0;if(t<0)continue;
   const routePoint=obj.curve.getPointAt(Math.max(0,Math.min(1,t))),coords=surfaceCoordinates(routePoint),p=groundPoint(...coords,.001);up.copy(p).normalize();forward.copy(obj.curve.getTangentAt(Math.max(0,Math.min(1,t))));forward.addScaledVector(up,-forward.dot(up));
   if(forward.lengthSq()<1e-10)forward.set(0,1,0).cross(up);forward.normalize();side.crossVectors(up,forward).normalize();basis.makeBasis(side,up,forward);
   const entryExit=circulating?Math.max(.001,span(t,0,.09)*(1-span(t,.92,1))):1;
   actor.root.position.copy(p);actor.root.quaternion.setFromRotationMatrix(basis);actor.root.scale.copy(actor.unitScale).multiplyScalar((obj.kind==='route'?.50:.56)*entryExit);
   actor.update(clock+i*.3,{walk:walking});
  }
  obj.marker?.position.copy(obj.curve.getPointAt(Math.max(0,Math.min(1,head)))).multiplyScalar(1.022);
 }
 let previousFrame=null;
 return {update(progress,selected,{context=false,focus=null,observed=false,motion,actionTime,attention=null,guided=false}={}){
  const f=sphericalVisualState(event.id,guided?narrativeMapProgress(event.id,progress):progress,['background','process','impact'].indexOf(focus)),clock=typeof motion==='number'&&Number.isFinite(motion)?Math.max(0,motion):f.progress*24;
  const readingFocus=['background','process','impact'].includes(focus)?focus:['background','process','impact'][f.phase];
  const localClock=modelsOnly&&Number.isFinite(actionTime)?Math.max(0,actionTime):clock;
  const frameKey=[f.progress,selected,context,readingFocus,observed,clock,localClock,attention?.id,attention?.label].join('|');if(frameKey===previousFrame)return f;previousFrame=frameKey;
  reveal(main,f.route,f.travel,clock);links.forEach(p=>reveal(p,event.id==='xibe'?f.settle:f.network,f.network,clock));
  if(institutionParts.length){center.model.root.visible=f.build>.001;institutionParts.forEach((part,i)=>grow(part,span(f.build,[0,.14,.32,.58][i],[.24,.64,.84,1][i])));center.model.update(localClock);}
  else if(center){grow(center.model.root,f.network);center.model.update?.(clock);}
  if(exchange){grow(exchange.model.root,f.network);exchange.model.update(modelsOnly&&Number.isFinite(actionTime)?localClock:marketActionClock(f.progress,clock),f.network);}
  if(settlement){const s=settlement.model;grow(s.root,f.settle);grow(s.homes,span(f.settle,0,.7));grow(s.family,span(f.settle,.15,.9));grow(s.fields,span(f.settle,.25,1));grow(s.water,f.water);grow(s.crops,span(f.water,.16,1));s.update(localClock,{settle:f.settle,water:f.water});}
  for(const {g,node,kind,model,contact,seat}of symbols){const chosen=!!node&&node===selected,spoken=attention?.id===node||!node&&attention?.id==='village';g.scale.setScalar(baseScale*(chosen?1.3:1));emphasis(g,chosen||spoken?1.18:context?.56:attention?.kind==='model'?.55:kind===readingFocus?1:readingFocus==='impact'&&kind==='process'?.9:.76);const amount=kind==='background'?1:kind==='process'?f.build:node==='qabqal'?f.settle:f.network;contact.update(g.scale.x,amount*(context?.55:1));if(model.root.visible){seat();model.afterGround?.();}}
  for(const p of paths){const primary=p.kind==='route'?readingFocus==='process':readingFocus==='impact';emphasis(p.line,context?.5:primary?1:.72);p.muted.material.opacity=context?.12:readingFocus==='background'?.27:.14;if(p.marker&&readingFocus==='impact')p.marker.visible=false;if(context){p.mover.visible=false;if(p.marker)p.marker.visible=false;}}
  for(const {n,ring,observedRing,dot,marker}of nodes){
   const active=f.active.includes(n.id)||event.id==='xibe'&&n.id==='shengjing'&&f.phase<2,chosen=n.id===selected;
   dot.material.color.set(active?teal:gold).multiplyScalar(context&&!chosen?.68:1);ring.scale.setScalar(chosen?1.3:1);ring.material.color.set(chosen?teal:gold).multiplyScalar(context&&!chosen?.62:1);ring.material.emissiveIntensity=chosen?.35:.16;observedRing.visible=!!observed&&chosen;observedRing.material.emissiveIntensity=.3;
   const introduction=historyMapIntroduction(event.id,f.phase,n.id);if(introduction){const html='<b>'+introduction.name+'</b><small>'+introduction.meaning+'</small>';if(marker.button.innerHTML!==html)marker.button.innerHTML=html;marker.button.classList.toggle('kg-history-explainer',true);marker.button.dataset.introPhase=String(f.phase);marker.button.setAttribute('aria-description',introduction.meaning);}
   marker.priority=chosen?0:active?1:3;marker.button.classList.toggle('kg-context-selected',context&&chosen);marker.button.classList.toggle('kg-observed-place',!!observed&&chosen);marker.button.setAttribute('aria-pressed',String(chosen));marker.button.dataset.active=String(active);
   marker.visible=attention?.id!==n.id;
  }
  const movingPoint=attention?.kind==='route'&&main?main.curve.getPointAt(Math.min(.999,f.route)):attention?.kind==='network'?(event.id==='protectorate'?groundPoint(84.25,41.78,.004):groundPoint(81.2,41.3,.004)):null;
  focusMarker.update(attention,{position:movingPoint,clock,context,selected});
  viewport.dataset.historyGroundedSites=String(symbols.length);viewport.dataset.historyContactSurface='rendered-terrain';const activeModel=event.id==='zhang'?exchange?.model:event.id==='xibe'?settlement?.model:center?.model;viewport.dataset.sphericalAction=readingFocus==='background'?'':readingFocus==='process'&&event.id!=='protectorate'?'沿地形前行，靠近沿途停留处':activeModel?.action??'';viewport.dataset.sphericalActionStage=activeModel?.actionStage??'';viewport.dataset.eventRoute=f.route.toFixed(4);viewport.dataset.eventBuild=f.build.toFixed(4);viewport.dataset.eventNetwork=f.network.toFixed(4);viewport.dataset.eventSettlement=f.settle.toFixed(4);viewport.dataset.eventWater=f.water.toFixed(4);viewport.dataset.eventReadingStage=['background','process','impact'][f.phase];viewport.dataset.eventVisualState=JSON.stringify({space:'sphere',route:f.route,institution:f.build,exchange:f.network,settlement:f.settle,laterCanal:f.water,moving:paths.filter(p=>p.mover.visible).length});viewport.dataset.historyStructure='false';viewport.dataset.sphericalFocus=readingFocus;viewport.dataset.sphericalObserved=String(!!observed&&nodes.some(n=>n.n.id===selected));viewport.dataset.sphericalInstitutionParts=String(institutionParts.filter(p=>p.visible).length);viewport.dataset.sphericalMotion=clock.toFixed(3);return f;
 }};
}

