import {worldMapEntry} from './entry-policy.js';
import {localObservationFrame,localSceneMatches,localSnapshot} from './local-observation.js';
import {settlementStoryFrame,settlementBeatProgress} from './settlement-story.js';
import {settlementDetails} from './settlement-period-detail.js';
import {settlementPanel,settlementStages} from './settlement-chronology.js';
import {installEnvoyJourney} from './envoy-journey.js';
import {explorationDestination,destinationHTML,createExplorationMemory} from './exploration-destinations.js';
import {mapBridgeFrame,mapBridgeHTML,mapBridgeFor} from './exploration-bridge.js';
import {countryCatalog} from './world-country-data.js';
import {directorPaths} from './exploration-director-paths.js';
import {zhangSpaceFrame} from './zhang-spatial-reading.js';
import {buildZhangSpatialLayer} from './zhang-spatial-layer.js';
import {createSpatialContextMap} from './spatial-context-map.js';
import {directorGeographyCue} from './director-spatial-sequence.js';
import {installExplorationDirector} from './exploration-director.js';
import {storyProgress,observationMeaning} from './story-observation.js';
import {visualCue} from './history-visual-direction.js';
import {buildHistoryGeography} from './history-geography.js';
import {installHistoryStory} from './history-story-player.js';
import * as THREE from 'three';
import {eventMotion,eventMotionFrame} from './exploration-motion.js';
import {historyTrails,focusedStep,trailChoices,historyProgressHTML,historyTrailBody,marketObservation,structureParts,structureObservation} from './history-trails.js';
import {migrationStops,migrationStep,settlementObservation,trailRecordsHTML,trailProgressHTML} from './migration-trail.js';
import {terrainPoint,terrainDimensions} from './geo.js';
import {regionBoundary} from './region-boundary.js';
import {elevationProfile} from './passage-data.js';
import {knowledgeScenes} from './knowledge-scenes.js';
import {knowledgeSources,knowledgeStages,worldLessons,mapLessons,historicalPeriods,referenceCities,learningPlaces,selectedKnowledge} from './knowledge-content.js';
import {installWorldAtlas} from './world-atlas.js';
import {earthChapters,earthFlows,flowPhase} from './world-intro-content.js';
import {worldAnchors,worldAnchor,comparisonCities,surfaceDistance} from './world-content.js';
import {mapItems,mapDefaults,selectedMapFeature} from './map-learning-content.js';
import {buildLearningMap} from './map-learning-layer.js';
import {eventById} from './history-content.js';
import {eventFrame,phaseProgress,phaseAt} from './history-process.js';
import {readingFor} from './event-reading.js';
import {eventPlaces,matchingLearningEvent,scaleLink} from './learning-links.js';
import {cleanGuideState,guideForObservation,directorForContext} from './exploration-entry.js';
import {glacierDirectorFrame} from './glacier-director.js';
import {karezStops,restoredKarez} from './karez-inquiry.js';
import {installRegionalSurface} from './regional-surface.js';
import {regionalPose} from './regional-surface-data.js';
import {buildSphericalHistory} from './spherical-history.js';
import {sphericalEventPlan,sphericalEventPose,sphericalReading,sphericalRoute} from './spherical-history-data.js';
import {relationById,relationPlace,relationPose,relationPanel,relationDock} from './spatial-relations.js';
import {buildSpatialRelations} from './spatial-relations-layer.js';
import {relationFocus,relationLandforms} from './spatial-relations-geography.js';

const sceneSteps={
 market:{labels:['选择货物','搬运交接','接收与使用'],hint:'先选织物、补给或工艺，再看交到谁手中、怎样使用。'},
 people:{labels:['抵达门前','安顿与引水','交接与回应'],hint:'选择先安顿或先引水，看灯、渠水与劳作；打开行囊看家人接过物品。'},
 culture:{labels:['观察示范','轮到学习者','动作回应'],hint:'观察双方的手，再参与一拍；庭院练习为原创教学动作。'},
 logistics:{labels:['提出需求','安排空间','交接与等候'],hint:'切换协作方案，看车队、绿带和三位参与者怎样回应。'},
};

export function installKnowledgeGuide({scene,viewport,dem,adapter,defaultEntry=false}){
 const shell=viewport.querySelector('.workbench'),root=document.createElement('section');
 root.className='knowledge-guide';root.hidden=true;root.setAttribute('aria-label','认识新疆 · 地球地图历史地点');shell.append(root);
 const pins=document.createElement('div');pins.className='kg-pins';pins.hidden=true;shell.append(pins);
 const layer=new THREE.Group();layer.name='knowledge-context';layer.visible=false;scene.add(layer);
 const dimensions=terrainDimensions(dem),projected=new THREE.Vector3();
 let active=false,stage='world',world='position',lens='relief',period='early',place='turpan',modelOpen=false,modelScene=null,markers=[],mapView=null,height=adapter.height(),profile=null,traveller=null,cursor=0,tracing=false,approaching=null;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let worldPick='xinjiang',worldDestination='beijing',worldZoom='planet',worldMoving=!reducedMotion,pendingWorld=null;
 const worldProgress={climate:.08,exchange:.08};
 const mapPicks={...mapDefaults};let regionView=null,mapGallery=false,eventFromKnowledge=false;
 let mapSurface='globe',globeRegionView=null,historySurface='globe',eventGlobeView=null,eventTerrainView=null,sphericalEvent=null,historyGeography=null,eventNode=null;
 let guideEventId='zhang',eventTween=null,eventTarget=null,eventView=null,fromStage=null,placeOrigin=null,leavingEvent=null;const eventProgress={zhang:0,protectorate:0,xibe:0};
 let mapMode='relations',relationId='zhang',relationScope='context',relationNode='kashgar',relationReturn=false;
 let relationLayer=null,relationPreview=null,zhangTerrain=null,relationFeature='all',relationOnlyGeography=false,relationMoving=!reducedMotion,relationElapsed=0,relationProgress=reducedMotion?1:0;
 const contextMap=createSpatialContextMap();
 const relationsActive=()=>stage==='map'&&mapMode==='relations'&&!trail&&onSphere();
 const mapGuide={active:false,playing:false,progress:0,index:-1};const explorationMemory=createExplorationMemory();
 const trailMemory={};let trail=false,trailReview=false,trailPending=null,trailPrimed=false,trailFamily=null,trailRecords=[];
 let karezStop='source',karezSaved=null,karezTrials=[],comparisonFrom=null;
 const currentEvent=()=>matchingLearningEvent(periodItem(),guideEventId);
 const mapItem=()=>selectedMapFeature(lens,mapPicks[lens],referenceCities);
 const worldAtlas=installWorldAtlas({viewport,planet:adapter.planet,onSelect:selectWorldAnchor});
 const regionalSurface=installRegionalSurface({viewport,dem,planet:adapter.planet,texture:adapter.regionalTexture});
 const selectedSurface=()=>stage==='history'?historySurface:mapSurface;
 const onSphere=()=>selectedSurface()==='globe'&&!modelOpen&&['map','history','place'].includes(stage);
 const eventReading=(id,phase)=>onSphere()?sphericalReading(id,phase):readingFor(id,phase);
 const eventScope=(e,phase)=>onSphere()?e.phases[phase].text.replace('小地球呈现','同一地球呈现').replace('底座表示背景','地方聚落符号表示背景'):e.phases[phase].text;
 function globePose(options={}){const host=viewport.querySelector('#canvas-host');adapter.worldView(regionalPose({...options,aspect:host.clientWidth/host.clientHeight}));}
 const controlHomes=['scene-controls','lived-controls','glacier-station'].map(id=>{const element=document.getElementById(id);return {element,parent:element.parentNode};});
 function restoreControls(){for(const {element,parent}of controlHomes)if(root.contains(element))parent.append(element);}
 function mountControls(){const slot=root.querySelector('.kg-live-slot');if(!slot||modelScene==='structure')return;const ids=['oasis','market','people','culture','logistics'].includes(modelScene)?['lived-controls']:modelScene==='glacier'?['scene-controls','glacier-station']:['scene-controls'];for(const {element}of controlHomes)if(ids.includes(element.id))slot.append(element);}
 const periodItem=()=>selectedKnowledge(historicalPeriods,period),placeItem=()=>selectedKnowledge(learningPlaces,place);
 let journeyReturn=null;
 const envoy=installEnvoyJourney({scene,viewport,adapter,enter:enterJourney,back:()=>{go('history',{restore:true});}});
 let settlementDetail=settlementDetails[new URL(location.href).searchParams.get('settlementDetail')]?new URL(location.href).searchParams.get('settlementDetail'):'story';
 let localFollow=true,localCameraKey=null,localHostSize=null,localStory={active:false,playing:false,phase:'gate',elapsed:0};
 let settlementFollow=true,settlementBeatKey=null,settlementHostSize=null;
 let settlementPhase=['settle','dig','flow','experiment'].includes(new URL(location.href).searchParams.get('settlement'))?new URL(location.href).searchParams.get('settlement'):'settle',settlementReplay=Math.max(0,Math.min(1,Number(new URL(location.href).searchParams.get('settlementProgress'))||0));
 let director=null,directorCue=null,directorTime=0,directorChoice=null,directorPrimed=false,directorReceipts=[],directorLastFeature=null,directorPath=directorPaths.xibe,directorHeldView=null;
 const historyStoryPlayer=installHistoryStory({root,viewport,
  context:()=>({id:currentEvent()??placeOrigin?.event,trail,stage,node:eventNode,destination:explorationDestination(currentEvent(),eventNode??place),fromMap:relationReturn,model:modelOpen,progress:eventProgress[currentEvent()]??0,route:currentEvent()?guideEventData().corridor:[],records:historyTrails[trail]?memory().records:trail==='migration'?trailRecords:[]}),
  seek:value=>{const id=currentEvent();if(id){eventTarget=null;eventTween=null;eventProgress[id]=value;}},
  focus:pose=>{if(onSphere()){const host=viewport.querySelector('#canvas-host');adapter.worldView({...pose,distance:3.2+(pose.distance-3.2)*Math.max(1,.9/(host.clientWidth/host.clientHeight)),duration:pose.duration??2400});}else{focusGuideEvent();pose.onArrive?.(true);}},
  history:()=>go('history',{restore:true}),locate:node=>visitEventPlace(node),enterPlace:node=>enterEventPlace(node),enterModel:node=>{enterEventPlace(node);if(active&&stage==='place')openModel(placeItem().model);},commit:writeURL,freezeCamera:()=>adapter.cancel(),prepareSpatial:()=>{if(historySurface!=='globe')changeSurface('globe');}
 });
 const inside=(lon,lat)=>lon>=dem.bounds[0]&&lon<=dem.bounds[2]&&lat>=dem.bounds[1]&&lat<=dem.bounds[3];
 const point=(lon,lat)=>{if(onSphere())return regionalSurface.point(lon,lat);const p=new THREE.Vector3(...terrainPoint(dem,lon,lat,adapter.height(),dimensions));p.y=inside(lon,lat)?p.y+.12:.02;return p;};
 function release(){relationLayer=null;relationPreview=null;zhangTerrain=null;sphericalEvent=null;historyGeography=null;const geometries=new Set(),materials=new Set();layer.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());layer.clear();pins.replaceChildren();markers=[];traveller=null;}
 function line(points,color,opacity=.8){const path=onSphere()?sphericalRoute(points,Math.max(64,points.length*4)):points;const o=new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.map(p=>onSphere()?regionalSurface.groundPoint(...p,.0015):point(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthTest:onSphere(),depthWrite:false}));o.renderOrder=4;layer.add(o);}
 function displayBoundary(){if(!onSphere())line([...regionBoundary,regionBoundary[0]],0xe7d8a9,.8);}
 function pin(label,lon,lat,{placeId,quiet=false,featureId,selected=false}={}){const p=point(lon,lat),b=document.createElement('button');b.textContent=label.split(' · ')[0]+(placeId?' ↗':'');b.title=label;b.className=quiet?'kg-relief-pin':placeId?'kg-place-pin':'';if(featureId){b.dataset.kgMapFeature=featureId;b.classList.add('kg-feature-pin');b.setAttribute('aria-pressed',String(selected));}else if(placeId)b.dataset.kgPlace=placeId;else b.dataset.kgFocus=JSON.stringify([lon,lat]);b.setAttribute('aria-label',featureId?'观察地图对象 '+label:placeId?'探索地点 '+label:'在地图定位 '+label);pins.append(b);const m=new THREE.Mesh(new THREE.SphereGeometry((placeId?.064:.035)*(onSphere()?.10:1),10,8),new THREE.MeshBasicMaterial({color:selected?0xf6d793:placeId?0xe8c489:stage==='history'?0xe6c27f:0xadd9c6,depthTest:onSphere()}));m.position.copy(p);m.renderOrder=5;layer.add(m);markers.push({position:p,button:b,quiet,priority:selected?0:featureId?1:2});}
 function context(){if(stage==='map'){const f=mapItem();return {points:[[f.name,...f.anchor]],lines:f.shape?[f.shape]:[]};}if(stage==='history')return periodItem();if(stage==='place'){const c=knowledgeScenes[place];return {points:c.section,lines:[c.section.map(p=>p.slice(1))]};}return {points:[],lines:[]};}
 function build(){release();delete viewport.dataset.placeEventContext;height=adapter.height();layer.visible=active&&stage!=='world';pins.hidden=!layer.visible;if(!layer.visible)return;
  if(modelOpen){if(modelScene==='glacier')for(const anchor of adapter.glacierAnchors()){const b=document.createElement('button');b.className='kg-glacier-pin';b.textContent=anchor.label;b.dataset.kgModelFocus=JSON.stringify(anchor.point);b.dataset.glacierAnchor=anchor.id;b.setAttribute('aria-label','观察冰谷 '+anchor.label);pins.append(b);markers.push({position:new THREE.Vector3(...anchor.point),button:b,priority:anchor.id==='surface'?0:1});}if(historyTrails[trail]&&modelScene==='market')for(const [i,label]of ['家庭 · 等待织物','远行者 · 等待补给','手艺人 · 等待器物'].entries()){const b=document.createElement('button');b.textContent=label;b.dataset.htRecipient=i;b.dataset.kgModelFocus=JSON.stringify([[-3.6,1.5,.7],[-.3,1.5,.7],[3.45,1.5,.7]][i]);pins.append(b);markers.push({position:new THREE.Vector3(...[[-3.6,1.5,.7],[-.3,1.5,.7],[3.45,1.5,.7]][i]),button:b,recipient:i,priority:0});}if(modelScene==='structure')for(const [i,p]of structureParts.entries()){const xyz=adapter.structurePoint(i);if(!xyz)continue;const b=document.createElement('button');b.textContent=p.name;b.dataset.htPart=i;pins.append(b);markers.push({position:new THREE.Vector3(...xyz),button:b,priority:0});}if(trail&&modelScene==='people'&&settlementPhase==='experiment')for(const [key,label,xyz]of [['homeOutcome','门前 · 安顿',[24.35,1.0,3.05]],['waterOutcome','水闸 · 引水',[22.3,.5,-1]]]){const b=document.createElement('button');b.textContent=label;b.dataset.mtPin=key;b.dataset.kgModelFocus=JSON.stringify(xyz);b.setAttribute('aria-label','观察'+label);pins.append(b);markers.push({position:new THREE.Vector3(...xyz),button:b,priority:0});}if(modelScene==='karez')for(const stop of karezStops){const b=document.createElement('button');b.textContent=stop.label+' ↗';b.dataset.kgKarezStop=stop.id;b.setAttribute('aria-label','观察结构 '+stop.label);b.setAttribute('aria-pressed',String(stop.id===karezStop));pins.append(b);markers.push({position:new THREE.Vector3(...stop.point),button:b,channel:['source','channel'].includes(stop.id)});}return;}
  if(onSphere()&&(relationsActive()||stage==='history')&&(stage==='history'?currentEvent():relationId)==='zhang')zhangTerrain=buildZhangSpatialLayer({root:layer,point:(lon,lat,lift)=>regionalSurface.groundPoint(lon,lat,lift)});
  if(stage==='map'||stage==='place'&&relationReturn){
   if(relationsActive()||stage==='place'&&relationReturn){
    displayBoundary();
    const addLabel=(n,position)=>{const b=document.createElement('button');b.className='sr-pin sr-pin-'+n.kind;b.innerHTML=`<strong>${n.name}${n.selectable?' ↗':''}</strong><small>${n.role}</small>`;b.dataset.srAnchor=JSON.stringify(n.anchor);if(n.feature){b.dataset.srFocus=n.feature;b.setAttribute('aria-pressed',String(n.selected));}if(n.selectable){b.dataset.srNode=n.id;b.classList.toggle('sr-observed',explorationMemory.hasObservation(relationId,n.id));}b.setAttribute('aria-label',n.selectable?'定位 '+n.name+'，观察关联问题':'地图参照 '+n.name);if(n.selectable)b.setAttribute('aria-pressed',String(n.selected));if(director?.active&&director.shot.id==='return'&&n.id===directorPath.place&&directorReceipts.length){b.querySelector('small').textContent='已观察 '+directorReceipts.length+' 项用途 · 可走回场景';b.classList.add('ed-reading');}const reading=director?.active&&(JSON.parse(viewport.dataset.directorTargets||'[]')).includes(n.id);b.classList.toggle('ed-reading',reading);pins.append(b);markers.push({button:b,position,priority:reading?-1:n.kind==='selected'?0:n.kind==='place'?1:3,quiet:n.kind==='surrounding'});return markers.at(-1);};
    const geometry=relationLayer=buildSpatialRelations({root:layer,id:relationId,scope:relationScope,node:relationNode,focus:relationFeature,geographyOnly:relationOnlyGeography,point:(lon,lat,offset)=>regionalSurface.groundPoint(lon,lat,offset),addLabel});viewport.dataset.relationLines=geometry.lineCount;viewport.dataset.relationNodes=geometry.nodeCount;viewport.dataset.relationActors=geometry.actorCount;viewport.dataset.relationMovement=geometry.movement;viewport.dataset.relationGeography=geometry.features.join(',');geometry.update(relationProgress,relationElapsed);
    if(!relationOnlyGeography&&(director?.active&&director.shot.id==='return'||relationScope==='place'||stage==='place'&&relationReturn||relationId==='protectorate'||mapGuide.active&&mapGuide.index===2)){
     const preview=relationPreview=buildSphericalHistory({root:layer,event:eventById(relationId),modelsOnly:true,symbolScale:relationScope==='place'?.4:mapGuide.active?.32:.22,point,groundPoint:(lon,lat,lift)=>regionalSurface.groundPoint(lon,lat,lift),viewport,addMarker:(n,position)=>({button:document.createElement('button'),position})});
     preview.update(mapGuide.active?mapBridgeFrame(relationId,mapGuide.progress,relationNode).model:geometry.update(relationProgress,relationElapsed).model,relationNode,{context:true,motion:relationElapsed,actionTime:mapGuide.active?mapBridgeFrame(relationId,mapGuide.progress,relationNode).actionTime:undefined});viewport.dataset.relationPreview=relationPlace(relationId,relationNode).model;
    }else delete viewport.dataset.relationPreview;
    return;
   }
   if(onSphere())for(const id of ['kazakhstan','kyrgyzstan','mongolia']){const a=worldAnchor(id);pin(a.name,a.lon,a.lat,{quiet:true});markers.at(-1).button.dataset.kgSurrounding='true';}
   displayBoundary();const selected=mapItem();
   buildLearningMap({root:layer,dem,point,lens,selected,cities:referenceCities,spherical:onSphere()});
   for(const f of mapItems(lens,referenceCities))pin(f.name,...f.anchor,{featureId:f.id,quiet:lens==='relief',selected:f.id===selected.id});
   for(const p of learningPlaces.filter(p=>mapGallery||p.id===selected.place))pin(p.name,p.lon,p.lat,{placeId:p.id});
   profile=selected.section?elevationProfile(dem,selected.section):null;
   if(profile&&!onSphere()){line(profile.samples.map(s=>[s.lon,s.lat]),0xf2e8d0,.6);traveller=new THREE.Mesh(new THREE.SphereGeometry(onSphere()?.0065:.065,12,8),new THREE.MeshBasicMaterial({color:0xfbf0cf,depthTest:false}));traveller.renderOrder=6;layer.add(traveller);updateTrace();}
   return;
  }
  if((stage==='history'||stage==='place'&&placeOrigin?.event===currentEvent())&&currentEvent()){
   displayBoundary();
   if(onSphere()){const addMarker=(n,position)=>{const b=document.createElement('button');b.textContent=n.name+' ⌖';b.title=n.role;b.dataset.kgEventDestination=n.id;b.setAttribute('aria-label','定位事件地点 '+n.name);b.className='kg-event-pin';pins.append(b);const marker={button:b,position,priority:1};markers.push(marker);return marker;};historyGeography=buildHistoryGeography({root:layer,event:guideEventData(),point,viewport,addMarker});sphericalEvent=buildSphericalHistory({root:layer,event:guideEventData(),point,groundPoint:(lon,lat,lift=.001)=>regionalSurface.groundPoint(lon,lat,lift),viewport,addMarker});}
   else pins.hidden=true;
   if(stage==='place'){const node=eventPlaces[currentEvent()]?.find(p=>p.place===place)?.node;sphericalEvent?.update(relationReturn?1:eventProgress[currentEvent()],node,{context:true,motion:historyStoryPlayer.motion,guided:!!trail});historyGeography?.update(eventProgress[currentEvent()],{context:true,focus:'impact'});viewport.dataset.placeEventContext=currentEvent();}else syncGuideEvent();return;
  }
  // Complete display outline is preserved. Out-of-DEM areas have no inferred height.
  if(stage==='history'&&regionView&&period===mapItem().period)buildLearningMap({root:layer,dem,point,lens,selected:mapItem(),cities:referenceCities,spherical:onSphere()});
  displayBoundary();const c=context();if(stage!=='place')for(const l of c.lines??[])line(l,stage==='history'?0xe6c27f:0x86ced6);for(const p of c.points??[])pin(...p,{quiet:stage==='map'&&lens==='relief'});
  if(stage==='map')for(const p of learningPlaces)pin(p.name,p.lon,p.lat,{placeId:p.id});
  if(stage==='place'&&!onSphere()){profile=elevationProfile(dem,c.lines[0]);line(profile.samples.map(s=>[s.lon,s.lat]),0xc4e7df);traveller=new THREE.Mesh(new THREE.SphereGeometry(onSphere()?.0062:.062,12,8),new THREE.MeshBasicMaterial({color:0xfaf1c9,depthTest:false}));traveller.renderOrder=6;layer.add(traveller);updateTrace();}
 }
 function sources(keys){return `<details class="kg-sources"><summary>资料依据与表现说明</summary>${keys.map(k=>`<a href="${knowledgeSources[k].url}" target="_blank" rel="noopener noreferrer">${knowledgeSources[k].title} ↗</a>`).join('')}<p>资料为认识线索；地域点采用现代近似坐标。教学模型、路线与史实分别说明。</p></details>`;}

 function focusRelation(){const host=viewport.querySelector('#canvas-host');adapter.worldView(relationPose(relationId,relationScope,relationNode,host.clientWidth/host.clientHeight));}
 function openRelations(id=relationId,{scope='region',node,restore=false,geography=false,guide=false}={}){historyStoryPlayer.suspend();saveTrailModel();trail=false;relationId=relationById(id).id;relationNode=relationPlace(relationId,node??relationNode).id;eventNode=relationNode;place=relationNode;relationScope=['context','region','place'].includes(scope)?scope:'context';mapMode='relations';mapSurface='globe';mapGallery=false;period=relationById(relationId).period;guideEventId=relationId;placeOrigin=null;relationReturn=false;if(!restore){globeRegionView=null;relationFeature='all';relationOnlyGeography=geography;relationProgress=reducedMotion||!guide?1:0;relationElapsed=0;relationMoving=guide&&!geography&&!reducedMotion;}go('map',{restore,guide});}
 function selectRelationScope(scope,node){relationFeature='all';relationOnlyGeography=false;relationProgress=reducedMotion?1:0;relationElapsed=0;relationMoving=!reducedMotion;relationScope=['context','region','place'].includes(scope)?scope:'context';relationNode=relationPlace(relationId,node??relationNode).id;place=relationNode;eventNode=relationNode;adapter.cancel();render();build();focusRelation();writeURL();}
 function syncMapGuide(){
  if(!relationsActive()){viewport.dataset.mapGuideActive='false';viewport.dataset.mapGuidePlaying='false';return;}
  const cue=mapBridgeFrame(relationId,mapGuide.progress,relationNode);viewport.dataset.mapGuideActive=String(mapGuide.active);viewport.dataset.mapGuidePlaying=String(mapGuide.playing);viewport.dataset.mapGuideStep=String(mapGuide.index);viewport.dataset.mapGuideProgress=mapGuide.progress.toFixed(3);
  for(const b of root.querySelectorAll('[data-map-cue]'))b.setAttribute('aria-pressed',String(mapGuide.active&&Number(b.dataset.mapCue)===cue.index));
  const play=root.querySelector('[data-map-guide]');if(play)play.textContent=mapGuide.playing?'暂停地图引导':mapGuide.active&&mapGuide.progress>=1?'重看地图引导':mapGuide.active?'继续地图引导':'播放地图引导';
  root.dataset.mapStep=String(cue.index);root.classList.toggle('map-reading-active',mapGuide.active);if(mapGuide.active){const h=root.querySelector('.kg-heading h1');if(h)h.textContent=mapBridgeFor(relationId,relationNode).titles[cue.index];}
  if(mapGuide.active)for(const el of root.querySelectorAll('[data-map-cue-caption],.sr-map-caption'))if(el.textContent!==cue.text)el.textContent=cue.text;
 }
 function applyMapGuide(progress,{focus=true}={}){
  const first=!mapGuide.active,cue=mapBridgeFrame(relationId,progress,relationNode),changed=first||mapGuide.index!==cue.index;
  mapGuide.active=true;mapGuide.progress=cue.progress;mapGuide.index=cue.index;relationMoving=false;relationElapsed=cue.clock;relationFeature=cue.feature;relationOnlyGeography=!!cue.geography;relationProgress=cue.reveal;
  if(changed){relationScope='region';render();build();if(focus&&cue.index===2){const host=viewport.querySelector('#canvas-host');adapter.worldView({...relationPose(relationId,'place',relationNode,host.clientWidth/host.clientHeight),tilt:36,bearing:-25});}else if(focus)focusRelation();}
  syncMapGuide();
 }
 function rememberRelationMap(){
  if(stage!=='map'&&explorationMemory.map(relationId))return;
  explorationMemory.rememberMap(relationId,{id:relationId,scope:relationScope,node:relationNode,feature:relationFeature,geography:relationOnlyGeography,progress:relationProgress,elapsed:relationElapsed,guide:mapGuide.active?mapGuide.progress:null,view:adapter.read()});
 }
 function startRelationStory(){
  const c=directorPaths[relationId];rememberRelationMap();
  mapGuide.playing=false;trail=c.trail;relationReturn=false;guideEventId=c.id;period=c.period;place=relationNode;eventNode=null;eventProgress[c.id]=0;eventGlobeView=null;mapSurface=historySurface='globe';placeOrigin=null;trailReview=false;
  go('history');historyStoryPlayer.begin(0,{play:true});
 }
 function captureMapObservation(){
  if(modelScene==='karez'){explorationMemory.rememberObservation('zhang','turpan',karezTrials.map(r=>({label:r.label+' / 来水 '+r.source,reply:'下游响应 '+r.downstream+'（模型状态）',priority:'water'})));return;}
  const c=historyTrails[trail];
  if(c)explorationMemory.rememberObservation(c.event,c.place,memory().records);
  else if(trail==='migration')explorationMemory.rememberObservation('xibe','qabqal',trailRecords);
 }
 function mapObservationHTML(){
  const records=explorationMemory.observations(relationId,relationNode);if(!records.length)return '';
  const meaning=relationNode==='turpan'?{text:'渠道状态与来水共同影响下游。把剖面的结果放回绿洲位置，理解生活与停留所需的条件。',scope:'数值为教学模型状态，不代表实测水量。'}:observationMeaning(relationId,records);
  return '<section class="sr-observation" role="status"><small>从'+relationPlace(relationId,relationNode).name+'带回地图的观察</small>'+records.map(r=>'<p><b>'+r.label+'</b> · '+r.reply+'</p>').join('')+(meaning?'<p>'+meaning.text+'</p><small>'+meaning.scope+'</small>':'')+'</section>';
 }
 function returnStoryMap(){
  captureMapObservation();const id=placeOrigin?.event??currentEvent()??relationId,saved=explorationMemory.map(id);
  mapGuide.active=false;mapGuide.playing=false;
  if(!saved){openRelations(id,{scope:'region',node:place});return;}
  globeRegionView=saved.view;mapView=null;
  openRelations(saved.id,{scope:saved.scope,node:saved.node,restore:true});
  relationFeature=saved.feature;relationOnlyGeography=saved.geography;relationProgress=saved.progress;relationElapsed=saved.elapsed;relationMoving=false;if(saved.guide!==null)applyMapGuide(saved.guide,{focus:false});else{render();build();}writeURL();
 }
 function relationAction(button){
  if(button.hasAttribute?.('data-map-guide')||button.dataset.mapGuide!==undefined){if(mapGuide.playing)mapGuide.playing=false;else{if(!mapGuide.active||mapGuide.progress>=1)applyMapGuide(0);mapGuide.playing=true;}syncMapGuide();return true;}
  if(button.dataset.mapCue!==undefined){mapGuide.playing=false;applyMapGuide((Number(button.dataset.mapCue)+.98)/3);writeURL();return true;}
  if(button.dataset.srAction==='story-return'){returnStoryMap();return true;}
  if(button.dataset.srAction==='place')rememberRelationMap();
  if(button.dataset.srAction!=='story'&&!button.dataset.srNode&&Object.keys(button.dataset).some(k=>k.startsWith('sr'))){mapGuide.active=false;mapGuide.playing=false;}

  if(button.dataset.srFocus){relationFeature=relationFocus(relationId,button.dataset.srFocus);render();build();writeURL();return true;}
  if(button.dataset.srAction==='compare'){relationOnlyGeography=!relationOnlyGeography;render();build();writeURL();return true;}
  if(button.dataset.srAction==='motion'){if(relationMoving)relationMoving=false;else{relationMoving=true;relationElapsed=0;relationProgress=0;}render();writeURL();return true;}

  if(button.dataset.srRelation){openRelations(button.dataset.srRelation);return true;}
  if(button.dataset.srScope){selectRelationScope(button.dataset.srScope);return true;}
  if(button.dataset.srNode){const guide=mapGuide.active;selectRelationScope('place',button.dataset.srNode);if(guide){mapGuide.index=-1;applyMapGuide(.9933);writeURL();}return true;}
  if(button.dataset.srMode){if(button.dataset.srMode==='relations'){openRelations();return true;}mapMode='geography';trail=false;globeRegionView=null;mapGallery=button.dataset.srMode==='places';mapSurface='globe';go('map');return true;}
  if(button.dataset.srAction==='analysis'){mapMode='geography';const r=relationById(relationId);lens=r.lens;mapPicks[lens]=r.feature;changeSurface('terrain');return true;}
  if(button.dataset.srAction==='story'){startRelationStory();return true;}
  if(button.dataset.srAction==='place'){globeRegionView=adapter.read();mapView=globeRegionView;const p=relationPlace(relationId,relationNode),c=directorPaths[relationId];trail=p.id===c.place?c.trail:false;trailReview=false;relationReturn=true;guideEventId=relationId;period=c.period;place=p.id;eventNode=p.id;placeOrigin={event:relationId,why:p.why};go('place',{restore:true});openModel(placeItem().model);return true;}
  if(button.dataset.srAction==='return'){openRelations(relationId,{scope:relationScope,node:relationNode,restore:true});return true;}
  return false;
 }

 function trailEntry(){return `<section class="mt-entry"><small>完整探索 / 可随时返回与自由操作</small><b>带着一个历史问题，从地球开始</b><p>地球定位 → 新疆地图 → 事件变化 → 地点 → 动手观察</p>${trailChoices(null)}</section>`;}
 function trailBody(){
  if(historyTrails[trail]){const c=historyTrails[trail],m=memory(),step=focusedStep(stage,modelOpen);return historyTrailBody({c,step,phase:phaseAt(eventProgress[c.event]),progress:eventProgress[c.event],playing:eventTarget!==null,running:adapter.running(),reading:eventReading(c.event,phaseAt(eventProgress[c.event])),locator:eventLocator(),surface:surfaceSelector(),records:m.records,review:trailReview,recordHTML:trailRecordsHTML,image:knowledgeScenes[c.place].image,part:m.part,open:m.open,connection:adapter.structureConnection?.()})+sources(eventById(c.event).id==='zhang'?['silk']:['archaeologyHan']);}
  const step=migrationStep(stage,modelOpen),c=migrationStops.find(s=>s.id===step),phase=phaseAt(eventProgress.xibe);
  let content='';
  if(step==='world')content=`<div class="mt-fact"><b>先建立位置感</b><p>拖动地球，观察新疆与欧亚大陆的关系。下一层沿地球表面靠近，不抽出一块模型。</p></div><div class="wa-world-actions"><button class="kg-primary" data-mt-stop="map">靠近新疆，找伊犁河谷 →</button></div><button data-kg-action="world-reset">重新定位新疆 ⌖</button>`;
  if(step==='map')content=`<div class="mt-fact"><b>先看地势，再问历史</b><p>伊犁河谷位于新疆西部。青线是地域关系示意；山地、谷地和聚落需要放在一起理解。</p></div><div class="mt-actions"><button data-mt-action="valley">靠近伊犁河谷 ⌖</button><button data-kg-action="map-fit">新疆全景</button></div><button class="kg-primary" data-mt-stop="history">谁来到这里？观察1764—1766年 →</button>${surfaceSelector()}`;
  if(step==='history')content=`${trailReview?`<section class="mt-review"><small>带着你的观察，回到历史空间</small><h3>远行与安顿，是不同尺度的问题</h3>${trailRecordsHTML(trailRecords)}<p>你改变的是教学场景中的安排顺序。两种安排都需要居住与用水，不能据此推断当年的真实决策。</p><p>地图上的西迁、抵达和安置有各自年代；后续水利发展另作理解。</p><button data-mt-stop="family">回到家庭，继续比较 →</button><button data-mt-stop="map">返回刚才的新疆地图</button></section>`:''}<div class="mt-timeline" aria-label="西迁的三个时间锚点"><button data-kg-event-phase="0" aria-pressed="${phase===0}"><b>1764</b><span>从盛京出发</span></button><button data-kg-event-phase="1" aria-pressed="${phase===1}"><b>1764—65</b><span>远行与抵达</span></button><button data-kg-event-phase="2" aria-pressed="${phase===2}"><b>1766起</b><span>安置与发展</span></button></div><p class="mt-time-note">年份是史实锚点；进度条是分段教学动画，不是按比例计时。后续渠网不等于1766年已建成。</p><article class="kg-event-reading"><h3 data-kg-event-title>${eventReading('xibe',phase).title}</h3><p data-kg-event-look>${eventReading('xibe',phase).look}</p><div class="kg-event-meaning"><small>这一步怎样理解</small><p data-kg-event-reason>${eventReading('xibe',phase).reason}</p></div><label class="kg-event-progress">观察进程<input type="range" data-kg-event-progress aria-label="历史观察进程" min="0" max="100" value="${Math.round(eventProgress.xibe*100)}"></label><div class="kg-inline"><button data-kg-action="event-play">${eventTarget!==null?'暂停变化':'继续观察'}</button><button data-kg-action="event-focus">靠近当前变化 ⌖</button></div><button class="kg-primary kg-event-next" data-kg-action="event-next">${phase<2?'展开下一阶段，看3D变化 →':'定位察布查尔，选择生活问题 →'}</button></article>${eventLocator()}<button data-kg-event-destination="qabqal">直接定位察布查尔 ⌖</button><details class="kg-detail"><summary>切换分析视图与事件依据</summary>${surfaceSelector()}<p>${sphericalEventPlan(eventById('xibe')).scope}</p>${sources(['xibe'])}</details>`;
  if(step==='place')content=`<article class="kg-place-opening"><div class="mt-fact"><b>从安置地域，继续观察后来的水利建设</b><p>地图点是现代地域参照。家庭、房屋、人物和动作是原创教学表达，不是1766年村庄复原。</p></div><button class="kg-primary" data-kg-model="people">走进屯居，按年代观察水系 →</button></article><figure class="kg-scene-preview"><img src="${knowledgeScenes.qabqal.image}" alt="已有家庭教学场景预览"><figcaption>接下来切换1766年安置、19世纪初开渠与1808年放水</figcaption></figure><button data-mt-stop="history">← 返回刚才的西迁地图</button>`;
  if(step==='family'&&settlementPhase!=='experiment')return settlementPanel(settlementPhase,settlementDetail);
  if(step==='family'&&settlementPhase==='experiment')content=`<button data-settlement-phase="settle">← 返回有年代的历史变化</button><section class="kg-hands-on mt-family"><div><b>比较安排，看人物回应</b><button data-kg-action="run">${adapter.running()?'暂停场景动作':'启动场景动作'}</button></div><p class="mt-time-note">这是安顿需求的情境比较。家人、渠水和灯火的先后会随选择变化。</p><div class="mt-priority" role="group" aria-label="选择家庭安顿的先后"><button data-mt-priority="home">先安顿<small>先看门前与灯火</small></button><button data-mt-priority="water">先引水<small>先看水闸与田边</small></button></div><div class="mt-response" role="status"><b data-mt-response-title>先选一种安排</b><p data-mt-response>看门前的家人、灯火、水闸和田边的人。</p><div class="mt-meters"><span>门前安顿<progress data-mt-meter="homeOutcome" max="1"></progress></span><span>田边来水<progress data-mt-meter="waterOutcome" max="1"></progress></span></div><small>刻度仅表示动画状态，不表示生活质量或用水量。</small></div><div class="kg-live-slot"></div><div data-mt-records>${trailRecordsHTML(trailRecords)}</div><button data-mt-action="review" class="kg-primary">带着观察，返回西迁地图 →</button><p class="kg-live-response" hidden></p></section>`;
  if(step==='map'&&trailRecords.some(r=>r.source==='chronology'))content+=`<section class="sg-observations"><b>带回河谷地图的观察</b><ol>${trailRecords.filter(r=>r.source==='chronology').map(r=>`<li><strong>${r.label}</strong><small>${r.sequence}</small></li>`).join('')}</ol><p>近景解释水系与屯居关系；地图继续保留伊犁、察布查尔与天山的地域参照。</p></section>`;
  return `${trailChoices('migration')}<div class="mt-topline"><span>从远行，到安顿</span><button data-mt-action="exit">自由探索 ↗</button></div><h2 class="mt-question">${step==='family'&&settlementPhase!=='experiment'?'从安置到开渠，分开看时间':c.title}</h2><p class="mt-why">${step==='family'&&settlementPhase!=='experiment'?'切换年代，比较原有灌溉、新渠施工与后来放水；看右侧初期田地与左侧新增田地。':c.why}</p>${content}<details class="mt-scope"><summary>地理、史实与教学情境的区别</summary><p>球面使用已有NASA影像与有限区域高程；金线只表示起讫方向。历史年代沿用国家民委与新疆档案资料；家庭选择不对应真实历史人物。所有旧场景、声音和事件可从“自由探索”继续访问。</p><a href="https://www.neac.gov.cn/seac/ztzl/201806/1067551.shtml" target="_blank" rel="noopener noreferrer">国家民委 · 锡伯族资料 ↗</a></details>`;
 }
 function updateSettlementReading(){
  if(!modelOpen||modelScene!=='people'||trail!=='migration'||settlementPhase==='experiment')return;
  const c=settlementStages.find(x=>x.id===settlementPhase);if(!c)return;
  const progress=Number(viewport.dataset.settlementChronologyProgress??settlementReplay??0),f=settlementStoryFrame(settlementPhase,progress),detail=settlementDetails[settlementDetail]??settlementDetails.story,isStory=settlementDetail==='story';
  const host=viewport.querySelector('#canvas-host'),size=host.clientWidth+'/'+host.clientHeight;if(size!==settlementHostSize){settlementHostSize=size;if(settlementFollow)settlementBeatKey=null;}
  const put=(selector,text)=>{const e=root.querySelector(selector);if(e&&e.textContent!==text)e.textContent=text;};
  put('[data-settlement-detail-reading]',detail.text);put('[data-settlement-story-title]',f.beat.title);
  put('.kg-heading h1',c.year+' · '+(isStory?f.beat.title:detail.title));
  put('[data-hs-caption-era]',c.year+' / 察布查尔 · 关系示意');put('[data-hs-caption-title]',isStory?f.beat.label:detail.title);put('[data-hs-caption-text]',isStory?f.beat.look:detail.text);put('[data-hs-caption-look]','可暂停、自由转动与返回地图。');
  for(const b of root.querySelectorAll('[data-settlement-beat]'))b.setAttribute('aria-current',Number(b.dataset.settlementBeat)===f.index?'step':'false');
  put('[data-kg-action=run]',adapter.running()?'暂停变化':'继续变化');
  if(isStory&&!director?.active&&progress>=.99&&!trailRecords.some(r=>r.source==='chronology'&&r.priority===settlementPhase)&&(settlementPhase!=='flow'||Number(viewport.dataset.settlementResidentResponse)>=.99&&Number(viewport.dataset.settlementBranchWater)>=.99)){trailRecords=trailRecords.filter(r=>r.priority!==settlementPhase);trailRecords.push({priority:settlementPhase,label:c.year+' · '+c.title,sequence:f.story.steps.map(b=>b.label).join(' → '),reply:c.reply,source:'chronology'});}
  const follow=root.querySelector('[data-settlement-follow]');if(follow)follow.hidden=settlementFollow||!isStory;
  if(isStory&&settlementFollow&&!director?.manualView&&settlementBeatKey!==f.phaseKey){settlementBeatKey=f.phaseKey;adapter.settlementLook?.(f.beat.focus);viewport.dataset.settlementCameraBeat=f.phaseKey;}
 }
 function localStructurePlay(start=false){
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
 function trailNavigate(next){
  if(!migrationStops.some(s=>s.id===next))return;
  if(modelOpen&&modelScene==='people')trailFamily={...adapter.read(),playing:adapter.running()};
  trail='migration';trailReview=false;period='qing';guideEventId='xibe';mapSurface=historySurface='globe';lens='water';mapPicks.water='ili-water';
  if(next==='world'){world='position';worldMoving=false;worldPick='xinjiang';go('world');}
  if(next==='map')go('map');
  if(next==='history')go('history',{restore:true});
  if(next==='place'){place='qabqal';placeOrigin={event:'xibe',why:eventPlaces.xibe[0].why};go('place');}
  if(next==='family'){place='qabqal';placeOrigin={event:'xibe',why:eventPlaces.xibe[0].why};if(stage!=='place'||modelOpen)go('place',{restore:true});openModel('people');}
 }
 function updateTrail(){
  if(historyTrails[trail]){updateHistoryTrail();return;}if(!trail)return;const d=viewport.dataset,step=migrationStep(stage,modelOpen);d.migrationTrail=step;d.migrationRecords=JSON.stringify(trailRecords);d.trailRecords=JSON.stringify(trailRecords);
  if(step!=='family'||settlementPhase!=='experiment')return;
  if(trailPending&&Number(d.settlementAge)<1)trailPrimed=true;
  const receipt=trailPrimed&&settlementObservation(d,trailPending);
  if(receipt){trailRecords=trailRecords.filter(r=>r.priority!==receipt.priority);trailRecords.push(receipt);trailPending=null;trailPrimed=false;const box=root.querySelector('[data-mt-records]');if(box)box.innerHTML=trailRecordsHTML(trailRecords);d.migrationRecords=JSON.stringify(trailRecords);d.trailRecords=JSON.stringify(trailRecords);}
  for(const b of root.querySelectorAll('[data-mt-priority]'))b.setAttribute('aria-pressed',String(b.dataset.mtPriority===d.householdPriority&&(!!trailPending||!!trailRecords.length)));
  for(const m of markers.filter(m=>m.button.dataset.mtPin)){const key=m.button.dataset.mtPin,value=Number(d[key])||0,text=key==='homeOutcome'?(value<.1?'门前 · 等待安顿':value<.95?'门前 · 灯火亮起':'门前 · 家人安顿'):(value<.1?'水闸 · 尚未开启':value<.95?'水闸 · 渠水流入':'田边 · 来水接上');if(m.button.textContent!==text)m.button.textContent=text;}
  for(const meter of root.querySelectorAll('[data-mt-meter]'))meter.value=Number(d[meter.dataset.mtMeter])||0;
  const waiting=trailPending&&!adapter.running(),complete=!trailPending&&trailRecords.length;
  const title=waiting?'已暂停 · 选择保留':trailPending?(trailPending==='home'?'正在观察：先安顿':'正在观察：先引水'):complete?'已经看到回应，可以换一种安排':'先选一种安排';
  const reply=waiting?'启动场景动作后继续观察。':trailPending?Number(d.homeOutcome)<.7&&Number(d.waterOutcome)<.7?'家人走向门前；留意灯火和水闸，哪一处先变化。':Number(d.settlementReply)>.4?'迎接者向家人致意，两项生活安排已经接续。':d.householdPriority==='home'?'灯火先亮起，家人开始门前生活，随后渠水到田。':'水闸先打开，田边开始劳作，随后家人到门前安顿。':complete?'两项安排都需要发生。比较的是先后顺序，不是历史上的正确答案。':'点“先安顿”或“先引水”，观察约10秒，回应发生后自动记录。';
  for(const [selector,text]of [['[data-mt-response-title]',title],['[data-mt-response]',reply]]){const e=root.querySelector(selector);if(e&&e.textContent!==text)e.textContent=text;}
  const back=root.querySelector('[data-mt-action="review"]');if(back){back.disabled=!trailRecords.length;back.textContent=trailRecords.length?'带着'+trailRecords.length+'项观察，返回西迁地图 →':'等回应完成，再带回地图';}
 }
 function memory(){return trailMemory[trail]??= {records:[],saved:null,pending:null,primed:false,part:-1,open:false};}
 function saveTrailModel(){const c=historyTrails[trail];if(!c||!modelOpen||modelScene!==c.model)return;const saved=localSnapshot(modelScene,adapter.read());if(saved)memory().saved={...saved,playing:adapter.running()};}
 function normalizeTrail(){if(trail==='migration'){period='qing';guideEventId='xibe';place='qabqal';lens='water';mapPicks.water='ili-water';}else{const c=historyTrails[trail];period=c.period;guideEventId=c.event;place=c.place;lens=c.lens;mapPicks[lens]=c.feature;}relationId=guideEventId;relationNode=place;relationFeature=relationFocus(relationId,relationFeature);}
 function switchTrail(id){captureMapObservation();relationReturn=false;historyStoryPlayer.suspend();if(!['migration','zhang','protectorate'].includes(id))return;const next=stage==='world'?'world':'history';saveTrailModel();if(trail==='migration'&&modelOpen&&modelScene==='people')trailFamily={...adapter.read(),playing:adapter.running()};if(trail){const m=memory();m.eventView=stage==='history'?adapter.read():eventGlobeView;m.mapView=stage==='map'?adapter.read():globeRegionView;m.node=eventNode;}
  adapter.cancel();eventTarget=null;eventTween=null;trail=id;trailReview=false;normalizeTrail();const m=memory();eventGlobeView=m.eventView??null;globeRegionView=m.mapView??null;eventTerrainView=null;regionView=null;mapView=null;eventNode=m.node??null;mapSurface=historySurface='globe';placeOrigin=null;fromStage=null;world='position';worldMoving=false;active=false;modelOpen=false;modelScene=null;stage='world';go(next,{restore:true});}
 function historyTrailNavigate(next){if(trail==='zhang'&&place==='turpan'&&['place','model'].includes(next)){enterEventPlace('turpan');if(next==='model')openModel('karez');return;}const c=historyTrails[trail];if(!c||!['world','map','history','place','model'].includes(next))return;saveTrailModel();trailReview=false;normalizeTrail();mapSurface=historySurface='globe';if(next==='world'){world='position';worldMoving=false;go('world');}if(next==='map')go('map');if(next==='history')go('history',{restore:true});if(next==='place'||next==='model'){if(stage==='history')rememberEventView();placeOrigin={event:c.event,why:eventPlaces[c.event].find(p=>p.node===c.node).why};if(stage!=='place'||modelOpen)go('place',{restore:next==='model'});if(next==='model')openModel(c.model);}}
 function selectStructurePart(index){if(!modelOpen||modelScene!=='structure'||!structureParts[index])return;viewport.dataset.structureObservationOwner='user';localStory.active=false;localFollow=false;const m=memory();m.part=index;adapter.structure({part:index});const p=adapter.structurePoint(index);if(p)adapter.structureFocus(p);render();}
 function updateHistoryTrail(){const c=historyTrails[trail],m=memory(),d=viewport.dataset;d.explorationTrail=trail;d.explorationStep=focusedStep(stage,modelOpen);d.trailRecords=JSON.stringify(m.records);if(!modelOpen)return;
  let receipt=null;
  if(c.model==='market'){const run=root.querySelector('[data-kg-action=run]');if(run)run.disabled=m.pending===null&&m.records.length===0;const positions=JSON.parse(d.marketActors??'[]');for(const marker of markers.filter(p=>p.recipient!==undefined)){const i=marker.recipient,xyz=positions[i];if(xyz){marker.position.set(xyz[0],xyz[1]+1.55,xyz[2]);marker.button.dataset.kgModelFocus=JSON.stringify(marker.position.toArray());}marker.button.textContent=['家庭','远行者','手艺人'][i]+' · '+(i===Number(d.goods)&&d.marketUse!=='waiting-for-choice'?(d.marketUse==='receiving-and-using'?'接收与使用':['披上织物','补给后出发','继续制作'][i]):['等待织物','等待补给','等待器物'][i]);}if(m.pending!==null&&d.marketUse==='waiting-for-choice')m.primed=true;receipt=m.primed?marketObservation(d,m.pending):null;for(const b of root.querySelectorAll('[data-ht-good]'))b.setAttribute('aria-pressed',String((m.pending!==null||m.records.length>0)&&Number(b.dataset.htGood)===Number(d.goods)));const title=root.querySelector('[data-ht-response-title]'),text=root.querySelector('[data-ht-response]');if(title)title.textContent=m.pending!==null?(adapter.running()?'正在交接与使用':'已暂停 · 选择保留'):m.records.length?'已经看到回应，可以换一种货物':'先选一种货物';if(text)text.textContent=m.pending!==null?(d.marketUse==='waiting-for-choice'?'货物正在搬运，留意谁在等待接收。':d.marketUse==='receiving-and-using'?'接收者正在使用货物，等待后续动作发生。':'完整交接已发生。'):'观察搬运、接收与使用；完成后再带回地图。';}
  if(c.model==='structure'){
   receipt=d.structureObservationOwner==='director'?null:structureObservation(d,m.part,m.open);const flow=adapter.structureConnection();
   const button=root.querySelector('[data-ht-action=connection]');if(button){button.textContent=flow.playing?'暂停联系演示':flow.state==='complete'?'重新演示内外联系':flow.progress>0?'继续联系演示':'演示内外联系';button.setAttribute('aria-pressed',String(flow.playing));}
   const status=root.querySelector('[data-ht-connection-status]');if(status)status.textContent=({ready:'从外侧开始，观察入口如何连接内部。',entering:'往来经过入口，沿通道向内。',inside:'抵达内部空间，留意它与入口的关系。',returning:'沿通道返回外侧，内外联系由此闭合。',complete:'已看完整个联系：外侧 → 入口 → 通道 → 内部 → 外侧。'})[flow.state]+(flow.paused?' 已暂停。':'');
   if(d.structureObservationOwner!=='director'&&flow.state==='complete'&&flow.progress===1&&!m.records.some(r=>r.priority==='connection'))receipt={priority:'connection',label:'内外联系',sequence:'外侧 → 城门 → 通道 → 内部 → 外侧',reply:'模型中的往来路径把入口、通道与内部空间连接起来。'};
  }
  if(receipt){const previous=m.records.find(r=>r.priority===receipt.priority);if(!previous){m.records.push(receipt);const el=root.querySelector('[data-ht-records]');if(el)el.innerHTML=trailRecordsHTML(m.records);}m.pending=null;m.primed=false;d.trailRecords=JSON.stringify(m.records);}
  const back=root.querySelector('[data-ht-action="review"]');if(back){back.disabled=!m.records.length;back.textContent=m.records.length?'带着'+m.records.length+'项观察，返回事件地图 →':'完成观察后，带回事件地图';}
 }
 function enterStructure(){const m=memory();approaching=null;restoreControls();tracing=false;modelOpen=true;modelScene='structure';regionalSurface.set(false);adapter.environment(null);render();adapter.scene('terrain',localSnapshot('structure',m.saved)?{restore:m.saved}:{structure:true,focus:[84.25,41.78],distance:7,scaleHandoff:true});adapter.structure({show:true,open:m.open,part:m.part});localCameraKey=null;render();build();writeURL();adapter.resize();}
 function countryControls(){const o=worldAtlas.settings;return `<section class="wa-country-controls" aria-label="国家与地区图层"><label>当前定位<select data-world-country aria-label="定位国家或地区"><option value="xinjiang" ${worldPick==='xinjiang'?'selected':''}>新疆 · 中国西北</option>${[...countryCatalog].sort((a,b)=>a.name.localeCompare(b.name,'zh-CN')).map(c=>`<option value="${c.id}" ${worldPick===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label><div class="wa-country-switches">${[['borders','国家边界'],['names','国家名称'],['tint','分区着色']].map(([id,label])=>`<button data-world-layer="${id}" aria-pressed="${o[id]}">${label}</button>`).join('')}</div><div class="wa-density-row"><button data-world-layer="detail" aria-pressed="${o.detail}">${o.detail?'恢复精选标注':'显示更多标注'}</button><button data-world-home>重新定位新疆 ⌖</button></div><p>金色是已选范围，青色是名称预览。<br>拖动旋转 · 滚轮拉近 · 点击名称定位</p></section>`;}
 function worldTopics(){return `<details class="wa-more-topics" ${!['position','neighbors','relief','scale'].includes(world)?'open':''}><summary>更多观察 · 经纬、水汽、交流与距离</summary><div class="kg-choices wa-topic-list" role="group" aria-label="地球上的认识与探索图层">${worldLessons.map(t=>`<button data-kg-world="${t.id}" aria-pressed="${world===t.id}">${t.label}<small>${earthChapters.find(c=>c.topic===t.id)?.question??t.task}</small></button>`).join('')}</div></details>`;}

 function countryView(p){const neighbor=p.kind==='neighbor',host=viewport.querySelector('#canvas-host'),distance=3.2+5.8*Math.max(1,.9/(host.clientWidth/host.clientHeight));return {lon:neighbor?(84+p.lon)/2:p.lon,lat:neighbor?(43+p.lat)/2:p.lat,distance,surface:1.8};}
 function worldBody(){
  const w=selectedKnowledge(worldLessons,world),selectedCountry=countryCatalog.find(c=>c.id===worldPick),p=worldAnchor(worldPick),dest=worldAnchor(worldDestination),km=Math.round(surfaceDistance(worldAnchor('urumqi'),dest));
  const extras=earthFlows[world]?`<section class="wa-flow-control" aria-label="可控制的球面演示"><div><button data-kg-action="world-motion">${worldMoving?'暂停球面演示':'继续球面演示'}</button><button data-kg-action="world-replay">从头观察 ↺</button></div><label>观察进程<input type="range" data-world-progress aria-label="球面演示进程" min="0" max="100" step="1" value="${Math.round(worldProgress[world]*100)}"></label><output data-world-phase>${earthFlows[world].frames[flowPhase(worldProgress[world])].title}</output><p data-world-explanation>${earthFlows[world].frames[flowPhase(worldProgress[world])].text}</p><small>${world==='climate'?'青线 / 概念方向 · 不表示实际气团或天气时刻':'金线 / 地域联系 · 不表示考证路线、年代或流量'}</small></section>`:world==='neighbors'?`<div class="wa-neighbor-list" role="group" aria-label="选择周边国家">${worldAnchors.filter(p=>p.kind==='neighbor').map(p=>`<button data-world-pick="${p.id}" aria-pressed="${worldPick===p.id}">${p.name}</button>`).join('')}</div>`:world==='connections'?`<label class="wa-distance-select">比较城市<select data-world-distance aria-label="地球距离比较城市">${comparisonCities.map(id=>`<option value="${id}" ${worldDestination===id?'selected':''}>${worldAnchor(id).name}</option>`).join('')}</select></label><div class="wa-distance"><span>乌鲁木齐 ↔ ${dest.name}</span><strong>≈ ${km.toLocaleString('zh-CN')} <small>km</small></strong><small>按半径6371.0088 km的球面估算 · 非出行里程</small></div><button data-kg-action="world-motion">${worldMoving?'暂停比较线动态':'继续比较线动态'}</button>`:world==='scale'?`<div class="wa-scale-options" role="group" aria-label="选择地球观察尺度">${[['planet','01 地球全景'],['eurasia','02 欧亚大陆'],['regional','03 靠近新疆']].map(([id,label])=>`<button data-world-zoom="${id}" aria-pressed="${worldZoom===id}">${label}</button>`).join('')}</div>`:world==='coordinates'?'<div class="wa-coordinate-key"><span>金色 / 赤道与43.82° N纬线</span><span>青色 / 87.62° E经线</span><span>淡金带 / 35°—49° N观察带</span></div>':'';
  return `<p class="kg-date">01 / 地球与方位</p><h2>${selectedCountry?selectedCountry.name+' · 范围与方位':w.title}</h2><p>${selectedCountry?'金色范围对应当前选择。继续转动或缩放，再重新定位新疆。':w.text}</p><div class="wa-entry-scale" role="group" aria-label="地球认识尺度">${[['position','大陆方位'],['neighbors','中国与周边'],['relief','新疆山河']].map(([id,label])=>`<button data-world-chapter="${id}" aria-pressed="${world===id}">${label}</button>`).join('')}</div>${extras}<div class="wa-world-actions"><button data-kg-stage="map" class="kg-primary">进入新疆全域地图 →</button></div><p class="kg-scale-next">下一层先看完整新疆的山地与盆地，再选择历史或地点。拖动与缩放始终可用。</p><details class="kg-detail"><summary>国家范围、定位与图层</summary>${countryControls()}<button data-kg-action="world-reset">回到欧亚视角 ⌖</button></details>${worldTopics()}<details class="kg-detail"><summary>历史路径与地球专题</summary>${worldPaths()}${worldNextButton()}${trailEntry()}</details><details class="kg-detail"><summary>底图与表示范围</summary><p>沿用NASA Blue Marble全球影像与Natural Earth现代国家参照。国家范围不表示历史疆域；正式政区请对照官方标准地图。</p><a href="./assets/world-countries-source.json">数据来源与处理记录 ↗</a></details>${sources(w.sources)}`;
 }

 function worldChapterHeading(){const i=earthChapters.findIndex(c=>c.topic===world);return `<p class="wa-chapter-index">${i>=0?'认识路径 / 0'+(i+1)+' · '+earthChapters[i].short:'自由探索 / '+selectedKnowledge(worldLessons,world).label}</p>`;}
 function worldNextButton(){const i=earthChapters.findIndex(c=>c.topic===world);return i>=0&&i<earthChapters.length-1?`<button data-world-chapter="${earthChapters[i+1].topic}" class="wa-next-chapter">下一问 · ${earthChapters[i+1].question} →</button>`:'';}
 function worldPaths(){const c=directorPaths[relationId];return `<section class="wa-path-choices" aria-label="选择接下来的探索问题"><small>先选择一个问题，地图和地点随之连接</small><div>${Object.values(directorPaths).filter(p=>p.kind!=='nature').map(p=>`<button data-world-path="${p.id}" aria-pressed="${p.id===relationId}" style="--path-color:#${relationById(p.id).color.toString(16).padStart(6,'0')}"><b>${p.name}</b><span>${p.title}</span></button>`).join('')}</div><p>${c.question}</p><span class="wa-path-destination">下一层：${mapBridgeFor(relationId,relationNode).destination} · ${mapBridgeFor(relationId,relationNode).steps[0].label}</span></section>`;}
 function chooseWorldPath(id){const c=directorPaths[id];if(!c)return;cancelWorldApproach();historyStoryPlayer.suspend();trail=false;relationReturn=false;placeOrigin=null;guideEventId=relationId=c.id;relationNode=place=eventNode=c.place;period=c.period;relationScope='region';relationFeature='all';relationOnlyGeography=false;relationProgress=0;relationElapsed=0;relationMoving=!reducedMotion;mapMode='relations';mapSurface=historySurface='globe';worldPick='xinjiang';render();worldView();writeURL();}
 function worldDock(){const b=mapBridgeFor(relationId,relationNode);return `<section class="wa-intro-dock wa-scale-path" aria-label="从地球到新疆的空间路径"><div class="wa-intro-label"><span>${directorPaths[relationId].name} · 地球定位 → 新疆地图 → 历史 → ${b.destination}</span><b>先辨位置，下一层${b.steps[0].label}</b></div><div class="wa-intro-chapters">${[['position','地球全景','大陆与国家'],['neighbors','中国与周边','新疆与八个邻国'],['relief','新疆山河','山地与盆地']].map(([id,label,why],i)=>`<button data-world-chapter="${id}" aria-current="${world===id?'step':'false'}"><small>0${i+1}</small><b>${label}</b><span>${why}</span></button>`).join('')}<button data-kg-stage="map" class="wa-enter-map"><small>04</small><b>进入新疆 →</b><span>${b.titles[0]}</span></button></div></section>`;}

 function chooseWorld(topic){cancelWorldApproach();world=topic;worldPick=world==='coordinates'?'urumqi':'xinjiang';worldMoving=!reducedMotion;render();worldView();writeURL();}
 function updateWorldFlow(){if(!earthFlows[world])return;const value=worldProgress[world],frame=earthFlows[world].frames[flowPhase(value)],slider=root.querySelector('[data-world-progress]'),label=root.querySelector('[data-world-phase]'),copy=root.querySelector('[data-world-explanation]');if(slider&&document.activeElement!==slider)slider.value=String(Math.round(value*100));if(label&&label.textContent!==frame.title)label.textContent=frame.title;if(copy&&copy.textContent!==frame.text)copy.textContent=frame.text;worldAtlas.setProgress(value);}
 function worldView(){
  regionalSurface.set(false);
  let view={lon:78,lat:30,distance:10.7,fit:true};
  if(world==='climate')view={lon:42,lat:32,distance:10.7,fit:true};
  if(world==='exchange')view={lon:72,lat:29,distance:10.7,fit:true};
  if(world==='neighbors')view={lon:91,lat:39,distance:8.6,surface:1.8};
  if(world==='relief'||world==='scale'&&worldZoom==='regional')view={lon:84,lat:42,distance:7.3,surface:2.6};
  if(world==='coordinates')view={lon:85,lat:30,distance:10.7,fit:true};
  if(world==='connections'){const p=worldAnchor(worldDestination);view={lon:(87.62+p.lon)/2,lat:(43.82+p.lat)/2-5,distance:12.2,fit:true};}
  if(world==='scale'&&worldZoom==='eurasia')view={lon:75,lat:36,distance:10.5,fit:true};
  if(view.surface){const host=viewport.querySelector('#canvas-host');view.distance=3.2+(view.distance-3.2)*Math.max(1,.9/(host.clientWidth/host.clientHeight));}
  if(worldPick!=='xinjiang'&&countryCatalog.some(c=>c.id===worldPick))view=countryView(worldAnchor(worldPick));
  worldAtlas.set(world,world==='connections'?worldDestination:world==='coordinates'?'urumqi':worldPick);worldAtlas.setRunning(worldMoving);updateWorldFlow();adapter.worldView(view);
 }
 function selectWorldAnchor(id){
  if(id.startsWith('map-relief:')){trail=false;mapMode='geography';mapGuide.active=false;mapGuide.playing=false;lens='relief';mapPicks.relief=selectedMapFeature('relief',id.split(':')[1],referenceCities).id;go('map');return;}
  if(id.includes(':')){const [topic,index]=id.split(':');if(earthFlows[topic]){cancelWorldApproach();world=topic;worldMoving=false;worldProgress[topic]=(topic==='climate'?[.12,.52,1]:[.05,.2,.45,.74,1])[Number(index)]??0;render();worldAtlas.set(topic,'xinjiang');worldAtlas.setRunning(false);updateWorldFlow();writeURL();return;}}
  if(['climate','exchange','coordinates'].includes(id)){chooseWorld(id);return;}
  if(id==='xinjiang'||id==='map-relief'){if(id==='map-relief')lens='relief';go('map');return;}
  const p=worldAnchor(id);if(countryCatalog.some(c=>c.id===id)&&['connections','coordinates'].includes(world))world='position';worldPick=p.id;if(world==='connections'&&comparisonCities.includes(id))worldDestination=id;
  render();worldAtlas.set(world,world==='connections'?worldDestination:worldPick);writeURL();
  adapter.worldView(countryCatalog.some(c=>c.id===id)?countryView(p):{lon:p.lon,lat:p.lat,distance:12,fit:true});
 }
 function miniMap(){
  const x=lon=>18+(lon-73)/24*324,y=lat=>15+(50-lat)/17*218,coords=points=>points.map((p,i)=>(i?'L':'M')+x(p[0]).toFixed(1)+','+y(p[1]).toFixed(1)).join(' '),c=context();
  return `<figure class="kg-map"><svg viewBox="0 0 360 250" role="img" aria-label="新疆全域定位示意，北向朝上，主要城市与当前关注地点"><path class="kg-outline" d="${coords(regionBoundary)}Z"/>${(c.lines??[]).map(l=>`<path class="kg-map-line" d="${coords(l)}"/>`).join('')}${referenceCities.map(([name,lon,lat])=>`<circle cx="${x(lon)}" cy="${y(lat)}" r="1.7"><title>${name}</title></circle>`).join('')}${(c.points??[]).map(([name,lon,lat])=>`<circle class="kg-map-selected" cx="${x(lon)}" cy="${y(lat)}" r="4"><title>${name}</title></circle>`).join('')}<path class="kg-north" d="M330 35V14M325 21L330 14L335 21"/><text x="325" y="10">N</text></svg><figcaption>全域定位示意 · 北向朝上 · 非政区图<br>3D高程覆盖部分边缘不足，小图保留完整显示轮廓。</figcaption></figure>`;
 }
 const choices=(items,current,key)=>`<div class="kg-choices" role="group" aria-label="${key==='period'?'选择历史阶段':key==='place'?'选择探索地点':'选择认识主题'}">${items.map(i=>`<button data-kg-${key}="${i.id}" aria-pressed="${current===i.id}">${i.label??i.name??i.title}${i.date?`<small>${i.date}</small>`:''}</button>`).join('')}</div>`;
 function mapPathChoices(){return `<section class="kg-next-lines"><h3>用历史理解地方</h3><p>先选一个事件，地点与地域联系随之变化。</p><div class="sr-relations" role="group" aria-label="选择历史问题">${Object.values(directorPaths).filter(c=>c.kind!=='nature').map(c=>`<button data-sr-relation="${c.id}"><b>${c.name}</b><small>${c.title}</small></button>`).join('')}</div><details class="kg-detail"><summary>其他年代与历史线索</summary>${choices(historicalPeriods,period,'period')}</details></section>`;}
 function mapTools(){return `<details class="kg-detail"><summary>地图工具与分析视图</summary><button data-kg-action="map-fit">新疆全景 ⌖</button><button data-kg-action="map-surroundings">看周边</button>${surfaceSelector()}${traceHTML()}<button data-kg-action="map-gallery">${mapGallery?'收起地点目录':'打开地点目录'}</button></details>`;}
 function mapBody(){
  if(relationsActive()){
   const r=relationById(relationId),p=relationPlace(relationId,relationNode),box=document.createElement('div');box.innerHTML=relationPanel(relationId,relationScope,relationNode,{focus:relationFeature,geographyOnly:relationOnlyGeography});
   const tabs=box.querySelector('.sr-view-tabs'),paths=box.querySelector('.sr-relations');tabs.remove();paths.remove();box.querySelector('.sr-reading')?.remove();box.querySelector('.sr-next')?.remove();box.querySelector('.sr-story')?.remove();
   return `${tabs.outerHTML}${paths.outerHTML}<p class="kg-date">历史问题 / ${eventById(relationId).date}</p><h2>${r.name}</h2><p>${r.question??directorPaths[relationId].question}</p><p>${p.why}</p><button class="kg-primary kg-history-start" data-sr-action="story">进入${directorPaths[relationId].name}的历史 →</button>${mapObservationHTML()}<details class="kg-detail"><summary>地点、路线与地图观察</summary>${mapBridgeHTML(relationId,relationNode)}${destinationHTML(relationId,relationNode)}${box.innerHTML}</details>${mapTools()}`;
  }
  const f=mapItem(),items=mapItems(lens,referenceCities),h=selectedKnowledge(historicalPeriods,f.period);
  return `<p class="kg-date">02 / 新疆全域</p><h2>${mapGallery?'全部探索线索':'先读完整新疆，再选择一条线索'}</h2><p>阿尔泰山、天山、昆仑山与准噶尔、塔里木两大盆地共同构成地域骨架。地图保留周边；点选对象后再靠近。</p><div class="sr-view-tabs"><button data-sr-mode="geography" aria-pressed="true">地理格局</button><button data-sr-mode="relations">历史联系</button><button data-sr-mode="places">地点与场景</button></div>${choices(mapLessons,lens,'lens')}<div class="kg-map-objects ${lens==='cities'?'kg-city-objects':''}" role="group" aria-label="选择地图对象">${items.map(i=>`<button data-kg-map-feature="${i.id}" aria-pressed="${f.id===i.id}"><span>${i.name}</span><small>${i.kind}</small></button>`).join('')}</div><article class="kg-map-reading"><h3>${f.name}</h3><p>${f.text}</p></article>${mapPathChoices()}${f.place?`<section class="kg-map-next"><h3>走进相关地点</h3><p>${f.observe}</p><button data-kg-place="${f.place}" class="kg-primary">${f.placeLabel} →</button></section>`:''}<details class="kg-detail"><summary>当前地理线索相关的历史</summary><button data-kg-history="${f.period}">${h.label} · ${f.history} →</button></details>${mapTools()}<details class="kg-detail"><summary>完整定位与资料依据</summary>${miniMap()}<a href="${knowledgeSources.standard.url}" target="_blank" rel="noopener noreferrer">官方标准行政地图 ↗</a><p>山系、流域与通道为位置或机制示意；白线是DEM取样。</p>${sources(f.sources)}</details>`;
 }

 function surfaceSelector(){const surface=selectedSurface(),history=stage==='history';return `<section class="kg-surface-selector" aria-label="选择地理空间或分析视图"><div><button data-kg-surface="globe" aria-pressed="${surface==='globe'}">连续地理空间</button><button data-kg-surface="terrain" aria-pressed="${surface==='terrain'}">${history?'事件分析':'地形分析'}</button></div><p>${surface==='globe'?(history?'事件仍在同一个地球上。选地点后，再决定是否进入近景或结构。':'新疆仍在地球表面，周边空间连续保留。'):'主动展开区域进行分析；返回时保留事件进程与球面视角。'}</p></section>`;}
 function rememberEventView(){eventView=adapter.read();if(onSphere())eventGlobeView=eventView;else eventTerrainView=eventView;}
 function mapDock(){return `<div class="kg-map-dock kg-map-key" aria-label="地图图例"><span>新疆范围</span><span>${mapMode==='relations'?'地域联系示意':'山地 / 盆地 / 地点参照'}</span><span>${onSphere()?'球面地图 · 周边保留':'地形分析视图'}</span></div>`;}

 function selectMapFeature(id){if(trail&&id!==(historyTrails[trail]?.feature??'ili-water'))trail=false;placeOrigin=null;const f=selectedMapFeature(lens,id,referenceCities);mapPicks[lens]=f.id;cursor=.5;tracing=false;render();build();writeURL();if(onSphere()){globePose({anchor:f.anchor,near:true});return;}const host=viewport.querySelector('#canvas-host'),distance=(lens==='relief'?21:lens==='corridors'?19:lens==='water'?14:12)*Math.max(1,host.clientHeight/host.clientWidth*.9);adapter.scene('terrain',{focus:f.anchor,distance});adapter.hideMap();}
 function changeSurface(value){historyStoryPlayer.suspend();
  if(!['globe','terrain'].includes(value)||value===selectedSurface())return;
  const history=stage==='history';
  if(history){rememberEventView();historySurface=value;}else {if(onSphere())globeRegionView=adapter.read();else regionView=adapter.read();mapSurface=value;}
  adapter.cancel();adapter.hideMap();regionalSurface.set(false);render();
  const saved=history?(onSphere()?eventGlobeView:eventTerrainView):(onSphere()?globeRegionView:regionView);
  if(onSphere()){adapter.scene('earth',saved?{restore:saved}:{overview:false});regionalSurface.set(true);if(saved)adapter.worldRestore(saved);else if(history&&currentEvent())focusGuideEvent();else globePose();}
  else adapter.scene('terrain',saved?{restore:saved}:{overview:true,scaleHandoff:true});
  build();if(history)syncGuideEvent();writeURL();adapter.resize();
 }
 function historyBody(){const h=periodItem(),id=currentEvent();return `${surfaceSelector()}${eventLocator()}${id?`<details class="kg-period-index"><summary>${h.label} · ${h.date} / 切换时代</summary>${choices(historicalPeriods,period,'period')}</details>`:choices(historicalPeriods,period,'period')}${id?eventBody(id):`<article><p class="kg-date">${h.date}</p><h2>${h.title}</h2><p>${h.question}</p><p class="kg-scope">本阶段提供时代与地域线索；可操作的事件过程目前集中在秦汉与清代三个事件。</p></article><button data-kg-place="${h.place}" class="kg-primary">${h.linkLabel} →</button>`}<details class="kg-history-reading"><summary>时代背景、变化与影响</summary><h3>背景</h3><p>${h.background}</p><h3>变化</h3><p>${h.change}</p><h3>影响</h3><p>${h.impact}</p><button data-kg-action="next-period">下一历史阶段 →</button></details>${sources(h.sources)}`;}
 function eventBody(id){const e=eventById(id),phase=phaseAt(eventProgress[id]),r=eventReading(id,phase),options=[periodItem().event,periodItem().secondEvent].filter(Boolean);return `<div class="kg-event-options" role="group" aria-label="选择本时代的事件">${options.map(key=>`<button data-kg-inline-event="${key}" aria-pressed="${key===id}">${eventById(key).short}</button>`).join('')}</div><article class="kg-event-reading"><p class="kg-date">${e.date}</p><h2>${e.title}</h2><div class="kg-event-phases" role="group" aria-label="观察背景过程影响">${e.phases.map((p,i)=>`<button data-kg-event-phase="${i}" aria-pressed="${phase===i}">${p.label}</button>`).join('')}</div><h3 data-kg-event-title>${r.title}</h3><p data-kg-event-look>${r.look}</p><label class="kg-event-progress">观察进程<input type="range" data-kg-event-progress aria-label="历史观察进程" min="0" max="100" value="${Math.round(eventProgress[id]*100)}"></label><div class="kg-inline"><button data-kg-action="event-play">${eventTarget!==null?'暂停变化':'继续观察'}</button><button data-kg-action="event-focus">靠近当前变化 ⌖</button></div><button class="kg-primary kg-event-next" data-kg-action="event-next">${phase<2?'展开'+e.phases[phase+1].label+'，看3D变化 →':'定位'+(historyTrails[trail]?.steps[3][0]??eventPlaces[id][0].label)+'，选择下一层 →'}</button></article><section class="kg-event-destinations"><b>选一个地点，先看它在地图中的位置</b>${sphericalEventPlan(e).nodes.map(n=>({node:n.id,label:n.name,why:n.role})).map(p=>`<button data-kg-event-destination="${p.node}"><strong>${p.label} →</strong><small>${p.why}</small></button>`).join('')}</section><details><summary>事件依据与完整操作</summary><p data-kg-event-scope>${eventScope(e,phase)}</p><p>${e.id==='zhang'&&mapItem().id==='south-passage'?'金线沿上一层的现代地域参照展开，解释往来机制；不是出使行程。':e.source.scope}</p><button data-kg-event="${id}">打开原事件完整工具 →</button></details>`;}
 function guideEventData(){const id=currentEvent(),e=eventById(id),f=mapItem();return id==='zhang'&&f.id==='south-passage'?{...e,corridor:f.shape,guideSites:[f.shape[0],f.shape[3],f.shape.at(-1)],guideFocus:f.anchor,lineLabel:'沿现代地域参照的往来教学线 · 非出使行程'}:e;}
 function syncGuideEvent(){const id=currentEvent();if(!active||stage!=='history'||!id)return;const phase=onSphere()?['background','process','impact'].indexOf((director?.active&&directorCue?['background','process','impact'][directorCue.beat]:historyStoryPlayer.focus)):phaseAt(eventProgress[id]);if(onSphere()){adapter.hideMap();sphericalEvent?.update(eventProgress[id],eventNode,{focus:(director?.active&&directorCue?['background','process','impact'][directorCue.beat]:historyStoryPlayer.focus),motion:(director?.active?directorTime:historyStoryPlayer.motion),observed:historyStoryPlayer.observed&&eventNode===historyStoryPlayer.observationNode,attention:trail?(director?.active?directorCue?.attention:historyStoryPlayer.attention):null,guided:!!trail});historyGeography?.update(eventProgress[id],{focus:(director?.active&&directorCue?['background','process','impact'][directorCue.beat]:historyStoryPlayer.focus)??(eventProgress[id]<.12?'background':eventProgress[id]<.7?'process':'impact'),attention:trail?(director?.active?directorCue?.attention:historyStoryPlayer.attention):null});}else adapter.guideEvent({event:guideEventData(),geometryKey:mapItem().id,phase,progress:eventProgress[id],nodeId:eventNode});viewport.dataset.learnEvent=id;viewport.dataset.learnEventProgress=eventProgress[id].toFixed(3);viewport.dataset.learnEventPlaying=String(eventTarget!==null);viewport.dataset.eventTransition=eventTarget===null?'settled':eventTarget<eventProgress[id]?'reverse':'forward';viewport.dataset.historyEvent=id;viewport.dataset.historyPhase=String(phase);viewport.dataset.historyProgress=eventProgress[id].toFixed(4);viewport.dataset.historySpace=onSphere()?'sphere':'analysis';viewport.dataset.historySelectedNode=eventNode??'';}
 function eventLocator(){const id=currentEvent(),n=id?sphericalEventPlan(eventById(id)).nodes.find(n=>n.id===eventNode):null;if(!n)return '';const entry=eventPlaces[id]?.find(p=>p.node===n.id);return `<section class="kg-event-locator" aria-label="当前选择的事件地点"><small>你选中的地点 / 地理定位</small><h3>${n.name}</h3><p>${n.role}</p><p>${entry?.why??'这个点帮助认识事件的空间背景。先观察它与其他地点的关系。'}</p>${entry?`<button class="kg-primary" data-kg-event-enter="${n.id}">${entry.legacy?'打开机构分析工具':'进入'+learningPlaces.find(p=>p.id===entry.place).name+'的地点观察'} →</button>`:''}<button data-kg-action="event-overview">回事件全景 ⌖</button><small>${sphericalEventPlan(eventById(id)).scope}</small></section>`;}
 function focusGuideEvent(phase=phaseAt(eventProgress[currentEvent()]),overview=false,duration=1900){if(!currentEvent()){globePose();return;}if(onSphere()){const host=viewport.querySelector('#canvas-host'),pose=sphericalEventPose(currentEvent(),phase,{overview});pose.distance=3.2+(pose.distance-3.2)*Math.max(1,.9/(host.clientWidth/host.clientHeight));adapter.worldView({...pose,duration});syncGuideEvent();return;}const f=eventFrame(currentEvent(),phaseProgress[phase]),e=guideEventData();if(e.guideFocus&&phase<2){f.focus=e.guideFocus;f.distance=22;}const host=viewport.querySelector('#canvas-host');f.distance*=Math.max(1,host.clientHeight/host.clientWidth*.9);adapter.scene('terrain',{focus:f.focus,focusOffset:f.focusOffset,distance:f.distance});syncGuideEvent();}
 function seekEventPhase(phase){historyStoryPlayer.suspend();const id=currentEvent();if(!id)return;eventTween=eventMotion(eventProgress[id],phaseProgress[phase],reducedMotion);eventTarget=eventTween.to;focusGuideEvent(phase,false,eventTween.duration*1000);updateGuideEvent(0);writeURL();}
 function visitEventPlace(node){historyStoryPlayer.suspend();const id=currentEvent(),n=id?sphericalEventPlan(eventById(id)).nodes.find(n=>n.id===node):null;if(!n)return;if(stage==='place'){go('history',{restore:true});}eventTarget=null;eventTween=null;eventNode=node;if(!onSphere()&&!inside(n.lon,n.lat))changeSurface('globe');render();if(onSphere())globePose({anchor:[n.lon,n.lat],near:true});else adapter.scene('terrain',{focus:[n.lon,n.lat],distance:10});syncGuideEvent();writeURL();}
 function enterEventPlace(node){const id=currentEvent(),entry=eventPlaces[id]?.find(p=>p.node===node);if(!entry)return;if(historyTrails[trail]&&entry.place!==historyTrails[trail].place){saveTrailModel();trail=false;}eventTarget=null;eventTween=null;rememberEventView();if(entry.legacy){eventFromKnowledge=true;stop(false);adapter.event(id,{progress:eventProgress[id]});adapter.eventPlace(entry.legacy);return;}placeOrigin={event:id,why:entry.why};place=entry.place;mapSurface='globe';go('place');}
 function updateGuideEvent(dt){const id=currentEvent();if(stage!=='history'||!id)return;if(eventTarget!==null){eventTween??=eventMotion(eventProgress[id],eventTarget,reducedMotion);const f=eventMotionFrame(eventTween,Math.min(.1,dt));eventTween.time=f.time;eventProgress[id]=f.progress;if(f.done){eventTarget=null;eventTween=null;writeURL();}}syncGuideEvent();const e=eventById(id),phase=phaseAt(eventProgress[id]),r=eventReading(id,phase);for(const [selector,text]of [['[data-kg-event-title]',r.title],['[data-kg-event-look]',r.look],['[data-kg-event-reason]',r.reason],['[data-kg-event-scope]',eventScope(e,phase)],['.kg-event-caption strong',r.title],['.kg-event-caption p',r.reason]]){const el=root.querySelector(selector);if(el&&el.textContent!==text)el.textContent=text;}for(const b of root.querySelectorAll('[data-kg-event-phase]'))b.setAttribute('aria-pressed',String(Number(b.dataset.kgEventPhase)===phase));const slider=root.querySelector('[data-kg-event-progress]');if(slider&&document.activeElement!==slider)slider.value=String(Math.round(eventProgress[id]*100));const run=root.querySelector('[data-kg-action="event-play"]');if(run)run.textContent=eventTarget!==null?'暂停变化':eventProgress[id]>=1?'回看背景变化':'继续观察';const next=root.querySelector('[data-kg-action="event-next"]');if(next)next.textContent=eventTarget!==null?'变化正在展开 · 可暂停':phase<2?'展开'+e.phases[phase+1].label+'，看3D变化 →':'定位'+(historyTrails[trail]?.steps[3][0]??eventPlaces[id][0].label)+'，选择下一层 →';if(next)next.disabled=eventTarget!==null;}
 function layerContext(){const e=currentEvent(),link=scaleLink({stage,world,feature:mapItem(),period:periodItem(),event:e?eventById(e):null,place:placeItem(),modelOpen,from:fromStage});return `<div class="kg-layer-context"><small>${link.from}</small><p>${stage==='place'&&comparisonFrom?comparisonFrom:stage==='place'&&placeOrigin?placeOrigin.why:link.why}</p></div>`;}
 function eventCaption(){const id=currentEvent();if(!id)return '';const r=eventReading(id,phaseAt(eventProgress[id]));return `<div class="kg-event-mobile-controls"><button data-kg-action="map-fit">新疆全景 ⌖</button><button data-kg-action="event-focus">当前变化 ⌖</button></div><aside class="kg-event-caption"><small>画面线索 / 与当前进程同步</small><strong>${r.title}</strong><p>${r.reason}</p><span>图标与联系线为教学表达，非遗址或行程复原</span></aside>`;}
 function sceneBeats(){const s=sceneSteps[modelScene];return s?`<p class="kg-action-hint">${s.hint}</p><ol class="kg-scene-beats" aria-label="场景中可以观察的过程">${s.labels.map((label,i)=>`<li data-kg-beat="${i}">${label}</li>`).join('')}</ol>`:'';}
 function updateBeats(){
  if(!sceneSteps[modelScene])return;const d=viewport.dataset;
  const beat=modelScene==='market'?(d.exchangePhase==='搬运中'?0:d.exchangePhase==='交接中'?1:2):modelScene==='people'?(Number(d.familyProgress)<.92?0:Number(d.memoryHandoff)<.95?1:2):modelScene==='culture'?(d.socialLearning==='回应'?2:d.callTurn==='传递'?1:0):Number(d.civicProposal)<.95?0:Number(d.movingTrucks)>0?2:1;
  for(const item of root.querySelectorAll('[data-kg-beat]')){const current=Number(item.dataset.kgBeat)===beat;if(item.getAttribute('aria-current')!==(current?'step':'false'))item.setAttribute('aria-current',current?'step':'false');}
 }
 function sceneRail(){return `<section class="kg-scene-rail" aria-label="已有3D场景入口"><div><b>${stage==='map'?'地图上的地点，可以走进去':'换一个地点，继续探索'}</b><span>真实地表 / 原创可操作情境</span></div><div class="kg-scene-cards">${learningPlaces.map(p=>`<button data-kg-place="${p.id}" aria-label="探索${p.name} · ${p.title}" aria-pressed="${stage==='place'&&place===p.id}"><img src="${knowledgeScenes[p.id].image}" alt="" loading="lazy"><span><b>${p.name}</b><small>${knowledgeScenes[p.id].tag}</small></span></button>`).join('')}</div></section>`;}
 function traceHTML(){if(!profile)return '';const lo=Math.min(0,Math.floor(profile.min/1000)*1000),hi=Math.max(lo+1000,Math.ceil(profile.max/1000)*1000),path=profile.samples.map((s,i)=>(i?'L':'M')+(12+s.km/profile.distance*266).toFixed(1)+','+(64-(s.height-lo)/(hi-lo)*48).toFixed(1)).join(' ');return `<section class="kg-section"><div><b>${stage==='map'?'白线对应的高程剖面':'从地形读地点'}</b><button data-kg-action="trace">${tracing?'暂停取样观察':'沿线观察高程'}</button></div><svg viewBox="0 0 290 82" role="img" aria-label="地理比较线的高程剖面，约${Math.round(profile.distance)}公里"><path class="kg-profile-area" d="${path} L278 64 L12 64Z"/><path class="kg-profile-line" d="${path}"/><line class="kg-profile-cursor" x1="12" x2="12" y1="8" y2="68"/><text x="12" y="9">高程 / m</text><text x="218" y="9">${Math.round(profile.max)} m</text><text x="12" y="80">0 km</text><text x="232" y="80">${Math.round(profile.distance)} km</text></svg><label>取样位置 <input data-kg-cursor type="range" min="0" max="100" value="${Math.round(cursor*100)}" aria-label="地形取样位置"></label><output class="kg-sample" aria-label="当前地形取样读数"></output><small>白点是高程取样位置；线为地理比较示意，不表示河道、供水路径或历史行程。</small></section>`;}
 function updateTrace(){if(!profile)return;const s=profile.samples[Math.min(profile.samples.length-1,Math.round(cursor*(profile.samples.length-1)))];traveller?.position.copy(point(s.lon,s.lat));const mark=root.querySelector('.kg-profile-cursor');if(mark){mark.setAttribute('x1',12+cursor*266);mark.setAttribute('x2',12+cursor*266);}viewport.dataset.mapSampleKm=s.km.toFixed(2);viewport.dataset.mapSampleHeight=s.height.toFixed(1);viewport.dataset.mapTraceRunning=String(tracing);const output=root.querySelector('.kg-sample');if(output)output.textContent='距起点 '+Math.round(s.km)+' km · 高程约 '+Math.round(s.height)+' m';const range=root.querySelector('[data-kg-cursor]');if(range)range.value=Math.round(cursor*100);}
 function karezBody(){const r=adapter.karez()?.reading,stop=karezStops.find(s=>s.id===karezStop);return `<section class="kg-karez-lab" aria-label="水路观察与对照"><div class="kg-karez-stops" role="group" aria-label="选择水路结构">${karezStops.map(s=>`<button data-kg-karez-stop="${s.id}" aria-pressed="${karezStop===s.id}">${s.label}</button>`).join('')}</div><h3>${stop.title}</h3><p>${stop.text}</p><div class="kg-karez-care" role="group" aria-label="改变通道维护条件"><button data-kg-karez-care="open">通畅</button><button data-kg-karez-care="blocked">加入淤积</button><button data-kg-karez-care="clear">清理竖井 ↗</button></div><div class="kg-karez-levels"><span>来水<progress data-karez-meter="source" max="1"></progress></span><span>通畅<progress data-karez-meter="capacity" max="1"></progress></span><span>下游<progress data-karez-meter="reservoir" max="1"></progress></span></div><p class="kg-karez-result" role="status" data-karez-result>${r?.reply??'调整条件，看下游的变化。'}</p><div class="kg-inline"><button data-kg-action="karez-record">记录这次观察</button><button data-kg-action="karez-view">水路全景 ⌖</button></div><div data-karez-trials>${trialHTML()}</div><small>刻度为教学显示强度；动画时间、堵塞比例、人物和田垄不代表实测水文、真实产量或某个年代。</small><details><summary>结构和历史依据</summary><p>四个组成部分与竖井清理功能据公开遗产资料；用水支撑聚落与往来据丝路廊道说明。工程原理与历史事件分开理解，不确定某口井的年代。</p><a href="https://icid-ciid.org/award/his_details/205" target="_blank" rel="noopener noreferrer">ICID · 吐鲁番坎儿井 ↗</a><a href="https://whc.unesco.org/en/list/1442/" target="_blank" rel="noopener noreferrer">UNESCO · 水管理与廊道聚落 ↗</a></details></section>`;}
 function trialHTML(){return karezTrials.length?`<table class="kg-karez-trials"><caption>本次探索 / 条件与结果对照</caption><thead><tr><th>条件</th><th>来水</th><th>下游</th></tr></thead><tbody>${karezTrials.map(t=>`<tr><th>${t.label}</th><td>${t.source}</td><td>${t.downstream}</td></tr>`).join('')}</tbody></table>`:'<p class="kg-trial-empty">变化稳定后记录一次，再改变一项条件进行比较。</p>';}
 function updateKarez(){if(modelScene!=='karez')return;const v=adapter.karez();if(!v)return;const r=v.reading;for(const key of ['source','capacity','reservoir']){const el=root.querySelector(`[data-karez-meter="${key}"]`);if(el)el.value=key==='reservoir'?v.frame.reservoir:r[key];}for(const b of root.querySelectorAll('[data-kg-karez-care]'))b.setAttribute('aria-pressed',String(b.dataset.kgKarezCare===v.care));const text=(adapter.running()?r.phase:r.stable?'已暂停 · 状态保留':'已暂停 · 启动动作后继续下游响应')+'。'+r.reply;const note=root.querySelector('[data-karez-result]');if(note&&note.textContent!==text)note.textContent=text;const record=root.querySelector('[data-kg-action="karez-record"]');if(record)record.disabled=!r.stable;karezSaved={supply:v.supply,care:v.care,frame:{...v.frame},playing:adapter.running()};}
 function selectKarezStop(id){karezStop=karezStops.find(s=>s.id===id)?.id??'source';adapter.karez({stop:karezStop});render();build();adapter.modelFocus(karezStops.find(s=>s.id===karezStop).point);writeURL();}
 function comparisonBody(){return modelScene==='karez'?`<section class="kg-comparison-next"><b>水路的终点，也是生活的起点</b><p>在同一个教学地点，看家门和田垄怎样分先后用水。</p><button data-kg-model="oasis">从结构，走到绿洲用水 →</button></section>`:modelScene==='oasis'?`<section class="kg-comparison-next"><b>在两个地点，比较同一个问题</b><p>吐鲁番看用水，喀什看停留与交换。沿地图重新定位，比较绿洲怎样支持生活和往来。</p><button data-kg-action="compare-kashgar">回地图，比较喀什的停留与交换 →</button><small>两个独立案例；不表示同一条水路、商队或真实货物流。</small></section>`:`<section class="kg-comparison-next"><b>补给条件与交换活动，可以来回比较</b><p>观察货物被谁接过、怎样使用，再回吐鲁番比较用水条件。</p><button data-kg-action="compare-turpan">回地图，比较吐鲁番用水 →</button></section>`;}
 function placeBody(){const p=placeItem(),c=knowledgeScenes[place],related=historicalPeriods.filter(h=>h.place===place);return `<label class="kg-place-select">当前地点<select data-kg-place-select aria-label="选择探索地点">${learningPlaces.map(i=>`<option value="${i.id}" ${place===i.id?'selected':''}>${i.name}</option>`).join('')}</select></label><article class="kg-place-opening"><p class="kg-date">${c.tag}</p><h2>${p.title}</h2>${modelOpen&&modelScene==='karez'?'':`<p>${p.see}</p>`}</article>${modelOpen?'':`<p class="kg-surface-note">${onSphere()?'先沿地球表面找到地点，再主动打开下方模型。':'当前为区域地形分析；下方模型回答具体的结构与生活问题。'}</p><figure class="kg-scene-preview"><img src="${c.image}" alt="${p.name}关联的已有3D场景预览"><figcaption>${c.caption}<small>已有教学场景画面</small></figcaption></figure>`}<div class="kg-model-options" role="group" aria-label="选择地点关联的3D场景">${c.models.map(([id,title])=>`<button data-kg-model="${id}" aria-pressed="${modelOpen&&modelScene===id}">${title} <span>↗</span></button>`).join('')}</div>${modelOpen?`<section class="kg-hands-on"><div><b>动手试一试</b><button data-kg-action="run">${adapter.running()?'暂停场景动作':'启动场景动作'}</button></div><p class="kg-model-caption">${['glacier','yardang'].includes(modelScene)?p.scope:'原创教学情境 · 周边区域地形作背景，比例与建筑不作实景复原。'}</p>${sceneBeats()}${modelScene==='karez'?karezBody():modelScene==='structure'?`<div class="ht-parts">${structureParts.map((p,i)=>`<button data-ht-part="${i}">${p.name}</button>`).join('')}</div><button data-ht-action="roof">展开 / 合上屋盖</button>`:''}<div class="kg-live-slot"></div>${['karez','oasis','market'].includes(modelScene)?comparisonBody():''}<p class="kg-live-response" role="status"></p></section><button data-kg-action="return-map" class="kg-primary">← 返回刚才的地点地图</button>`:(onSphere()?'':traceHTML())+`<div class="kg-inline"><button data-kg-action="place-fit">地理全景</button><button data-kg-action="place-near">走近地点</button></div>`}<details class="kg-detail"><summary>这个地点怎样连接地理、历史与生活？</summary><h3>接下来观察什么</h3><p>${p.see}</p><h3>模型与史实的关系</h3><p>${p.scope}</p>${related.length?`<div class="kg-related">${related.map(h=>`<button data-kg-history="${h.id}">${h.label} · ${h.linkLabel} ↗</button>`).join('')}</div>`:''}${miniMap()}</details><div class="kg-inline"><button data-kg-stage="map">回到新疆全域</button><button data-kg-stage="history">返回历史索引</button></div>${sources(p.sources)}`;}
 function relationPlaceBody(){const r=relationById(relationId),p=relationPlace(relationId,relationNode),c=knowledgeScenes[place];return `<article class="sr-place-arrival"><p class="sr-eyebrow">${r.name} → ${p.name} → 动手观察</p><h2>${p.role}</h2><p>${p.why}</p><figure class="kg-scene-preview"><img src="${c.image}" alt="${p.name}已有教学场景预览"><figcaption>下一步由你决定：走进场景，自由操作。</figcaption></figure><div class="kg-model-options" role="group" aria-label="选择地点关联的3D场景">${c.models.map(([id,title])=>`<button data-kg-model="${id}">${title} →</button>`).join('')}</div><section class="kg-place-opening"><small>地图与模型之间保留当前位置。点击上方按钮后，再靠近并进入场景。</small></section><button class="sr-story" data-sr-action="story">先听事件讲解 →</button><details><summary>模型与真实地点的关系</summary><p>${placeItem().scope}</p></details></article>`;}
 function organizeBody(body){
  const box=document.createElement('div');box.innerHTML=body;
  if(stage==='place')for(const row of box.querySelectorAll('.kg-inline'))if(row.querySelector('[data-kg-stage]'))row.remove();
  if(stage==='history'&&box.querySelector('.hs-story')){
   const main=box.querySelector('.hs-story'),result=box.querySelector('.hs-result'),envoyButton=box.querySelector('.envoy-entry');
   main.remove();result?.remove();envoyButton?.remove();box.querySelector('.sr-story-return')?.remove();
   const details=document.createElement('details');details.className='kg-detail';details.innerHTML='<summary>其他路径、地点与地图操作</summary>';
   while(box.firstChild)details.append(box.firstChild);
   details.insertAdjacentHTML('beforeend',choices(historicalPeriods,period,'period'));
   box.append(main);if(envoyButton){envoyButton.classList.add('kg-inline-entry');main.append(envoyButton);}if(result)box.append(result);box.append(details);
  }
  if(stage==='place'&&!modelOpen){
   box.querySelector('.sr-story-return')?.remove();box.querySelector('.mt-topline')?.remove();box.querySelector('.ht-route-picker')?.remove();box.querySelector('.mt-why')?.remove();
   const bridge=box.querySelector('.kg-scale-link');if(bridge){const note=document.createElement('details');note.className='kg-detail';note.innerHTML='<summary>来时的历史与地图</summary>';bridge.replaceWith(note);note.append(bridge);}
   box.querySelector('.kg-scene-preview')?.remove();for(const row of box.querySelectorAll('.kg-inline'))if(row.querySelector('[data-kg-stage]'))row.remove();for(const button of box.querySelectorAll('[data-ht-stop=history],[data-mt-stop=history]'))button.remove();
  }
  if(stage==='place'&&modelOpen){const actions=document.createElement('div');actions.className='kg-observation-actions';actions.innerHTML=(['market','structure','people','glacier'].includes(modelScene)?'<button data-kg-action="narrate-place">讲解当前地点 ▷</button>':'')+'<button data-kg-action="save-observation">保存这次观察</button>';box.prepend(actions);}
  return box.innerHTML;
 }
 function snapshot(){return active?cleanGuideState({version:1,stage,place,model:modelScene,modelOpen,event:guideEventId,progress:eventProgress[guideEventId],period,trail,lens,mapPick:mapPicks[lens],mapMode,mapSurface,historySurface,world,worldPick,settlement:settlementPhase,settlementProgress:settlementReplay??Number(viewport.dataset.settlementChronologyProgress),records:historyTrails[trail]?memory().records:trail==='migration'?trailRecords:[]}):null;}
 function resumeObservation(record){
  const s=guideForObservation(record);if(!s)return false;
  director?.stop();historyStoryPlayer.suspend();envoy.close();mapGuide.active=false;mapGuide.playing=false;relationMoving=false;relationReturn=false;localStory.active=false;trailReview=false;placeOrigin=null;
  guideEventId=s.event;eventProgress[s.event]=s.progress;period=s.period;place=s.place;trail=s.trail;lens=s.lens;mapPicks[lens]=s.mapPick;mapMode=s.mapMode;mapSurface=s.mapSurface;historySurface=s.historySurface;world=s.world;worldPick=s.worldPick;settlementPhase=s.settlement;settlementReplay=s.settlementProgress;
  relationId=relationById(s.event).id;relationNode=s.place;eventNode=s.place;globeRegionView=null;eventGlobeView=null;eventTerrainView=null;mapView=null;
  if(historyTrails[trail]){memory().records=s.records;memory().saved={...record.workspace,playing:false};memory().open=record.navigation.structureExploded;memory().part=record.navigation.structurePart;}
  if(trail==='migration'){trailFamily={...record.workspace,playing:false};trailRecords=s.records;}
  if(s.stage==='place'&&trail&&eventPlaces[s.event]?.some(p=>p.place===place))placeOrigin={event:s.event,why:eventPlaces[s.event].find(p=>p.place===place).why};
  go(s.stage);if(s.modelOpen)openModel(s.model,{direct:true});
  if(s.modelOpen){adapter.restore(record.workspace);adapter.model({playing:false});localFollow=false;settlementFollow=false;localCameraKey=null;if(s.model==='people'&&s.settlement!=='experiment')adapter.settlementTime({phase:s.settlement,progress:s.settlementProgress});if(s.model==='structure')adapter.structure({show:true,open:record.navigation.structureExploded,part:record.navigation.structurePart,motion:false});}
  else if(s.stage===record.workspace.guide?.stage)adapter.restore(record.workspace);
  render();build();writeURL();viewport.dataset.observationRestored=record.id;adapter.resize();return true;
 }
 function playPlaceNarration(){
  const topic=directorForContext(snapshot(),adapter.read()),path=directorPaths[topic];if(!path)return;
  let index=path.shots.findIndex(s=>s.model===modelScene);
  if(topic==='glacier')index=path.shots.findIndex(s=>s.glacierMode===(adapter.read().parameters?.glacierMode??'observation'));
  if(index<0)index=0;director.playPath(topic,index);
 }
 function enterWholeMap(){
  historyStoryPlayer.suspend();const entry=worldMapEntry(world);mapMode=entry.mode;lens=entry.lens;mapGallery=false;trail=false;relationMoving=false;relationReturn=false;mapGuide.active=false;mapGuide.playing=false;mapSurface='globe';globeRegionView=null;go('map',{guide:entry.guide});
 }
 function selectPeriod(id){
  historyStoryPlayer.suspend();eventTarget=null;eventTween=null;eventNode=null;eventGlobeView=null;eventTerrainView=null;placeOrigin=null;period=selectedKnowledge(historicalPeriods,id).id;
  guideEventId=matchingLearningEvent(periodItem(),guideEventId)??guideEventId;const event=matchingLearningEvent(periodItem(),guideEventId);
  trail=event==='xibe'?'migration':['zhang','protectorate'].includes(event)?event:false;if(trail)normalizeTrail();go('history');syncGuideEvent();writeURL();
 }
 function openAllTopics(){director?.stop();mapMode='geography';mapGallery=true;trail=false;relationReturn=false;mapGuide.active=false;mapGuide.playing=false;mapSurface='globe';go('map',{guide:false});}
 function render(){
  viewport.classList.add('organized-entry');
  viewport.classList.toggle('local-narrative-active',modelOpen&&!!historyTrails[trail]&&['market','structure'].includes(modelScene));
  viewport.classList.toggle('settlement-narrative-active',modelOpen&&modelScene==='people'&&trail==='migration'&&settlementPhase!=='experiment');restoreControls();viewport.dataset.spatialRelations=String(relationsActive());viewport.dataset.relationId=relationId;viewport.dataset.relationScope=relationScope;viewport.dataset.relationNode=relationNode;viewport.dataset.relationReturn=String(relationReturn);viewport.dataset.relationFocus=relationFeature;viewport.dataset.relationGeographyOnly=String(relationOnlyGeography);if(stage!=='history')for(const key of ['learnEvent','learnEventProgress','learnEventPlaying'])delete viewport.dataset[key];const s=selectedKnowledge(knowledgeStages,stage);if(stage==='map')profile=mapItem().section?elevationProfile(dem,mapItem().section):null;viewport.dataset.mapFeature=mapPicks[lens];viewport.dataset.mapTraceRunning=String(tracing);viewport.dataset.learnStage=stage;viewport.dataset.learnWorld=world;viewport.dataset.learnPeriod=period;viewport.dataset.learnLens=lens;viewport.dataset.learnPlace=place;viewport.dataset.learnModel=String(modelOpen);viewport.dataset.learnScene=modelScene??'';viewport.dataset.mapSurface=onSphere()?'globe':modelOpen?'model':stage==='history'?'history':stage==='world'?'world':'terrain';
  let body='';
  if(stage==='world')body=worldBody();
  if(stage==='map')body=mapBody();
  if(stage==='history')body=historyBody();
  if(stage==='place')body=relationReturn&&!modelOpen?relationPlaceBody():placeBody();
  if(trail&&stage!=='world'&&stage!=='map')body=trailBody();
  if((trail||placeOrigin)&&stage!=='world'&&stage!=='map'&&!(modelOpen&&historyTrails[trail]))body='<button class="sr-story-return" data-sr-action="story-return">← 返回来时的新疆联系地图</button>'+body;
  if(stage==='place'&&placeOrigin&&!relationReturn&&!(modelOpen&&historyTrails[trail])){const event=eventById(placeOrigin.event),p=placeItem(),step=modelOpen?'模型中的问题':'接下来观察什么';
   const bridge=document.createElement('section');bridge.className='kg-scale-link';bridge.setAttribute('aria-label','事件地点与模型的关系');
   bridge.innerHTML=`<div><span>${event.title}</span><i>→</i><strong>${p.name}</strong><i>→</i><span>${knowledgeScenes[place].models.find(m=>m[0]===(modelScene??p.model))?.[1]??'模型'}</span></div><small>${step}</small><p>${placeOrigin.why}</p>${modelOpen?'<button data-kg-action="return-map">← 返回刚才的地点地图</button>':'<p class="kg-context-note">'+(relationReturn?'地图保留刚才的空间联系与模型预览':'地图保留刚才的事件进度与联系')+'；地点采用现代地域参照。模型由你主动打开。</p>'}`;
   const box=document.createElement('div');box.innerHTML=body;if(trail&&!modelOpen){const fact=box.querySelector('.kg-place-opening .mt-fact');if(fact){bridge.querySelector('p').textContent=fact.querySelector('p').textContent;fact.remove();}}if(modelOpen){const detail=document.createElement('details');detail.innerHTML='<summary>为何从事件走进这个模型？</summary>';detail.append(bridge.querySelector('small'),bridge.querySelector('p'));bridge.querySelector('div').after(detail);}const anchor=box.querySelector('.mt-why')??box.querySelector('.kg-place-opening');if(anchor)anchor.after(bridge);else box.prepend(bridge);body=box.innerHTML;
  }
  if(relationReturn&&stage==='place'&&!placeOrigin)body='<button class="sr-return" data-sr-action="return">← 返回刚才的联系地图</button>'+body;body=historyStoryPlayer.decorate(body);if(modelOpen&&modelScene==='people'&&trail==='migration'&&settlementPhase!=='experiment'){const compact=document.createElement('div');compact.innerHTML=body;compact.querySelector('.sr-story-return')?.remove();const bridge=compact.querySelector('.kg-scale-link'),timeline=compact.querySelector('.settlement-panel');if(bridge&&timeline){bridge.querySelector('details')?.removeAttribute('open');timeline.after(bridge);}body=compact.innerHTML;}
  body=organizeBody(body);
  const selectedWorldCountry=stage==='world'?countryCatalog.find(c=>c.id===worldPick):null;
  const title=stage==='map'?(relationsActive()?(relationScope==='context'?'在联系中，认识新疆':relationScope==='region'?'靠近新疆，看清地理条件':'地点，连接到具体问题'):'新疆 · 山河与人'):stage==='place'?placeItem().name+' / '+(modelOpen?knowledgeScenes[place].models.find(m=>m[0]===modelScene)?.[1]: '地形与生活'):stage==='history'?(currentEvent()?eventById(currentEvent()).title:periodItem().label+' / '+s.title):stage==='world'?(selectedWorldCountry?selectedWorldCountry.name+' · 地球上的范围':({position:'从地球，找到中国西北',neighbors:'新疆，连接着哪些国家？',relief:'沿山河，认识新疆'})[world]??earthChapters.find(c=>c.topic===world)?.question??s.title):s.title;
  if(stage==='history'&&currentEvent()==='zhang')body='<button class="envoy-entry" data-kg-action="envoy"><b>认识第一次出使 →</b><span>看记载的经历与到访地域，不复原未考定道路</span></button>'+body;
  root.innerHTML=`<nav class="kg-nav" aria-label="认识新疆的四个尺度">${knowledgeStages.map((s,i)=>`<button data-kg-stage="${s.id}" aria-current="${stage===s.id?'step':'false'}"><small>0${i+1}</small>${s.label}</button>`).join('')}</nav><header class="kg-heading"><p>认识新疆 / ${s.label}</p><h1>${historyTrails[trail]?historyTrails[trail].steps[['world','map','history','place','model'].indexOf(focusedStep(stage,modelOpen))][1]:trail?(modelOpen&&modelScene==='people'&&settlementPhase!=='experiment'?settlementStages.find(x=>x.id===settlementPhase).year+' · '+settlementStages.find(x=>x.id===settlementPhase).title:migrationStops.find(s=>s.id===migrationStep(stage,modelOpen)).title):title}</h1><span>${stage==='place'?knowledgeScenes[place].caption:stage==='world'?(selectedWorldCountry?'金色区域对应当前选择。拖动与缩放，观察它和周边的关系。':earthChapters.find(c=>c.topic===world)?.caption??selectedKnowledge(worldLessons,world).task):stage==='history'&&currentEvent()?eventById(currentEvent()).question:s.question}</span></header><aside class="kg-panel" aria-label="当前尺度的认识与探索引导">${stage==='place'&&!modelOpen&&!placeOrigin?layerContext():''}${body}</aside>${stage==='history'?eventCaption():''}${stage==='map'?mapDock()+'<div class="kg-compass" aria-label="随地图视角变化的北向"><i>↑</i><b>N</b><small>北</small></div>':''}${stage==='map'&&mapGallery&&!modelOpen&&!relationReturn?sceneRail():''}${historyStoryPlayer.overlay()}<div class="kg-help">${stage==='world'?'拖动地球 · 点球面标记 · 切换图层观察':onSphere()?'拖动地球表面 · 滚轮靠近 · 点选地点':'拖动环视 · 滚轮缩放 · 点击地点走进场景'}</div>`;
  viewport.dataset.zhangScene=String(trail==='zhang'&&modelOpen&&modelScene==='market');
  if(viewport.dataset.zhangScene==='true'&&!root.querySelector('.lp-panel')){
   const panel=root.querySelector('.kg-panel'),market=panel.querySelector('.mt-market');
   if(market){
    const compact=document.createElement('section');compact.className='zhang-context';
    compact.innerHTML='<small>张骞出使 · 后续交流 → 喀什</small><h2>谁需要货物，接过后怎样使用？</h2><figure><canvas width="264" height="155" aria-label="喀什与盆地边缘的位置参照"></canvas><figcaption>位置保留 · 地域联系示意</figcaption></figure><p>先选货物，再跟随搬运者。人物使用后，观察才会留下记录。</p>';
    const extras=document.createElement('details');extras.innerHTML='<summary>事件说明与其他路径</summary>';
    for(const child of [...panel.children])if(child!==market)extras.append(child);
    panel.prepend(compact);panel.append(extras);
    const controls=market.querySelector('.kg-live-slot');if(controls){const more=document.createElement('details');more.innerHTML='<summary>场景的其他操作</summary>';more.append(controls);market.append(more);}
   }
  }
  viewport.dataset.migrationTrail=trail==='migration'?migrationStep(stage,modelOpen):'';viewport.dataset.explorationTrail=trail||'';viewport.dataset.explorationStep=focusedStep(stage,modelOpen);root.classList.toggle('mt-active',!!trail);
  for(const button of root.querySelectorAll('[data-kg-stage]'))button.setAttribute('aria-current',stage===button.dataset.kgStage?'step':'false');mountControls();updateTrace();historyStoryPlayer.update(0);updateSettlementReading();updateLocalReading(0);syncMapGuide();
  viewport.dataset.learnApproaching=String(!!approaching);
  if(pendingWorld){const note=document.createElement('div');note.className='wa-approach';note.innerHTML='<p role="status">沿地球表面靠近新疆，周边继续保留。</p><button data-kg-action="world-cancel">取消，留在地球</button>';root.querySelector('.wa-world-actions').append(note);for(const b of root.querySelectorAll('[data-kg-stage=map]'))b.disabled=true;}
  if(approaching){const note=document.createElement('div');note.className='kg-arrival';note.innerHTML=`<p role="status">先看清${placeItem().name}的位置，再走进${knowledgeScenes[place].models.find(m=>m[0]===approaching)[1].replace(/^走进/,'')}。</p><button data-kg-action="cancel-arrival">取消，留在地图</button>`;root.querySelector('.kg-place-opening').append(note);for(const b of root.querySelectorAll('[data-kg-model]'))b.disabled=true;}
 }
 function writeURL(){const u=new URL(location.href);if(modelOpen&&modelScene==='people'&&trail==='migration'){u.searchParams.set('settlementDetail',settlementDetail);u.searchParams.set('settlementProgress',Number(settlementReplay??viewport.dataset.settlementChronologyProgress??0).toFixed(3));}else u.searchParams.delete('settlementProgress');if(modelOpen&&modelScene==='people'&&trail==='migration')u.searchParams.set('settlement',settlementPhase);else u.searchParams.delete('settlement');if(active&&relationsActive()&&mapGuide.active)u.searchParams.set('mapRead',mapGuide.progress.toFixed(3));else u.searchParams.delete('mapRead');if(worldAtlas.settings.detail)u.searchParams.set('worldDetail','1');else u.searchParams.delete('worldDetail');for(const [key,param]of [['borders','worldBorders'],['names','worldNames'],['tint','worldTint']]){if(worldAtlas.settings[key])u.searchParams.delete(param);else u.searchParams.set(param,'0');}for(const k of ['learn','learnWorld','learnLens','learnPeriod','learnPlace','learnModel','learnScene','worldPick','worldDistance','worldZoom','mapPick','worldFlow','worldMotion','learnEvent','learnProgress','learnFrom','learnOrigin','waterSupply','waterCare','waterStop','learnCompare','mapSurface','historySurface','eventNode','trail','mapMode','relation','relationScope','relationNode','relationReturn','relationFocus','relationCompare','relationMotion'])u.searchParams.delete(k);if(active){u.searchParams.set('mapMode',mapMode);u.searchParams.set('relation',relationId);u.searchParams.set('relationScope',relationScope);u.searchParams.set('relationNode',relationNode);u.searchParams.set('relationFocus',relationFeature);u.searchParams.set('relationCompare',relationOnlyGeography?'geography':'combined');u.searchParams.set('relationMotion',relationMoving?'1':'0');if(relationReturn)u.searchParams.set('relationReturn','1');if(trail)u.searchParams.set('trail',trail);u.searchParams.set('learn',stage);u.searchParams.set('learnWorld',world);if(stage==='world'){u.searchParams.set('worldPick',worldPick);u.searchParams.set('worldDistance',worldDestination);u.searchParams.set('worldZoom',worldZoom);u.searchParams.set('worldMotion',worldMoving?'1':'0');if(earthFlows[world])u.searchParams.set('worldFlow',worldProgress[world].toFixed(3));}u.searchParams.set('mapSurface',mapSurface);u.searchParams.set('historySurface',historySurface);if(eventNode)u.searchParams.set('eventNode',eventNode);u.searchParams.set('learnLens',lens);u.searchParams.set('mapPick',mapPicks[lens]);u.searchParams.set('learnPeriod',period);u.searchParams.set('learnPlace',place);if(fromStage)u.searchParams.set('learnFrom',fromStage);if(currentEvent()){u.searchParams.set('event',currentEvent());u.searchParams.set('phase',String(phaseAt(eventProgress[currentEvent()])));u.searchParams.set('learnEvent',currentEvent());u.searchParams.set('learnProgress',eventProgress[currentEvent()].toFixed(3));}if(placeOrigin)u.searchParams.set('learnOrigin',placeOrigin.event);if(comparisonFrom)u.searchParams.set('learnCompare',place==='kashgar'?'from-water':'from-exchange');if(modelOpen){u.searchParams.set('learnModel','1');u.searchParams.set('learnScene',modelScene);}}if(active&&modelOpen&&modelScene==='karez'){const v=adapter.karez();u.searchParams.set('waterSupply',String(v?.supply??65));u.searchParams.set('waterCare',v?.care==='blocked'?'blocked':'open');u.searchParams.set('waterStop',karezStop);}history.replaceState(null,'',u);}
 function activate(){adapter.stopPassage();active=true;root.hidden=false;viewport.classList.add('gx-active','kg-active');}
 function placePose(){const points=knowledgeScenes[place].section,lon=points.reduce((n,p)=>n+p[1],0)/points.length,lat=points.reduce((n,p)=>n+p[2],0)/points.length;return {focus:[lon,lat],distance:11};}
 function cancelWorldApproach(){pendingWorld=null;adapter.cancel();regionalSurface.set(false);worldAtlas.set(world,world==='connections'?worldDestination:worldPick);worldAtlas.setRunning(worldMoving);}
 function go(next,{restore=false,fromGlobe=false,guide=true}={}){
  if(envoy.active)envoy.close();
  const enteredFromWorld=active&&stage==='world';
  if(next!=='map'){mapGuide.active=false;mapGuide.playing=false;root.classList.remove('map-reading-active');}
  if(next!=='place')relationReturn=false;historyStoryPlayer.suspend();
  saveTrailModel();if(trail&&modelOpen&&modelScene==='people')trailFamily={...adapter.read(),playing:adapter.running()};
  if(next!=='place')comparisonFrom=null;
  if(modelOpen&&modelScene==='karez'){updateKarez();adapter.karez({enabled:false});}
  if(active&&stage==='world'&&next==='map'&&!fromGlobe&&!reducedMotion){
   if(pendingWorld)return;const ticket={};pendingWorld=ticket;mapSurface='globe';render();worldAtlas.beginApproach();regionalSurface.set(true);
   const host=viewport.querySelector('#canvas-host');adapter.worldView({...(!trail&&mapMode==='relations'&&!(director?.active&&director.shot.geography!==undefined)?relationPose(relationId,relationScope,relationNode,host.clientWidth/host.clientHeight):regionalPose({aspect:host.clientWidth/host.clientHeight})),onArrive:arrived=>{if(pendingWorld!==ticket)return;pendingWorld=null;if(arrived)go(next,{fromGlobe:true,guide});else{cancelWorldApproach();render();}}});return;
  }
  if(active&&stage==='world'&&next==='map'){mapSurface='globe';if(world==='climate'){lens='water';mapPicks.water='ili-water';}if(world==='exchange'){lens='corridors';mapPicks.corridors='south-passage';}}
  leavingEvent=active&&!onSphere()&&stage==='history'&&next==='place'&&currentEvent()&&!reducedMotion?{event:guideEventData(),geometryKey:mapItem().id,progress:eventProgress[currentEvent()],time:0}:null;
  if(!leavingEvent)delete viewport.dataset.learnHandoff;
  eventFromKnowledge=false;const old=stage,wasGlobe=adapter.read().scene==='earth';
  if(active&&old!==next){fromStage=old;if(old==='history')rememberEventView();}
  eventTarget=null;eventTween=null;guideEventId=matchingLearningEvent(periodItem(),guideEventId)??guideEventId;
  if(active&&old==='map'&&next!=='map'){if(onSphere())globeRegionView=adapter.read();else regionView=adapter.read();}
  pendingWorld=null;approaching=null;worldAtlas.hide();restoreControls();activate();adapter.cancel();stage=next;modelOpen=false;modelScene=null;if(relationsActive()){const r=relationById(relationId);period=r.period;guideEventId=r.id;lens=r.lens;mapPicks[lens]=r.feature;}tracing=stage==='place'&&!reducedMotion&&!onSphere();cursor=stage==='map'?.5:0;profile=stage==='place'?elevationProfile(dem,knowledgeScenes[place].section.map(p=>p.slice(1))):null;adapter.hideMap();render();
  if(stage==='world'){regionalSurface.set(false);adapter.scene('earth',{overview:true});worldView();}
  else if(onSphere()){
   const saved=stage==='history'&&(old==='place'||restore)?eventGlobeView:restore&&mapView?.scene==='earth'?mapView:stage==='map'&&old!=='world'?globeRegionView:null;
   if(old==='world'&&fromGlobe){regionalSurface.set(true);}
   else {adapter.scene('earth',saved&&!wasGlobe?{restore:saved}:{overview:false,keepCamera:wasGlobe});regionalSurface.set(true);if(saved)adapter.worldRestore(saved,{animate:wasGlobe});else if(stage==='history'&&currentEvent())focusGuideEvent();else if(relationsActive())focusRelation();else globePose(stage==='place'?{anchor:[placeItem().lon,placeItem().lat],near:true}:{});}
   if(leavingEvent){leavingEvent=null;adapter.hideMap();}
  }
  else if(stage==='place')adapter.scene('terrain',restore&&mapView?.scene==='terrain'?{restore:mapView}:old==='history'?{focus:[placeItem().lon,placeItem().lat],distance:9}:placePose());
  else if(stage==='history'&&(old==='place'||restore)&&eventTerrainView)adapter.scene('terrain',{restore:eventTerrainView});
  else adapter.scene('terrain',regionView?{restore:regionView}:{overview:true,bridge:old==='world'});
  if(!onSphere())regionalSurface.set(false);adapter.hideMap();build();if(stage==='history')syncGuideEvent();if(enteredFromWorld&&stage==='map'&&!director?.active){mapGuide.active=false;mapGuide.playing=false;relationMoving=false;}writeURL();adapter.resize();
 }
 function stop(navigate=true){viewport.dataset.localNarrative='';localStory.playing=false;viewport.classList.remove('local-narrative-active');envoy.close();director?.stop();historyStoryPlayer.suspend();if(!active)return;saveTrailModel();trail=false;viewport.dataset.explorationTrail='';viewport.dataset.migrationTrail='';if(modelScene==='karez')adapter.karez({enabled:false});leavingEvent=null;delete viewport.dataset.learnHandoff;eventTarget=null;eventTween=null;adapter.hideMap();pendingWorld=null;worldAtlas.hide();regionalSurface.set(false);restoreControls();active=false;tracing=false;adapter.cancel();adapter.environment(null);release();layer.visible=false;pins.hidden=true;root.hidden=true;viewport.classList.remove('gx-active','kg-active','organized-entry');viewport.querySelector('.wb-camera').style.bottom='';for(const k of ['learnStage','learnPeriod','learnLens','learnPlace','learnModel','learnScene','learnEvent','learnEventProgress','learnEventPlaying'])delete viewport.dataset[k];writeURL();if(navigate)adapter.exit();adapter.resize();}
 function enterModel(id){if(id==='structure'){enterStructure();return;}if(modelScene==='karez'){updateKarez();adapter.karez({enabled:false});}leavingEvent=null;delete viewport.dataset.learnHandoff;const p=placeItem();approaching=null;restoreControls();tracing=false;modelOpen=true;modelScene=id;render();adapter.scene(id,historyTrails[trail]&&id==='market'&&localSnapshot(id,memory().saved)?{restore:memory().saved}:trail&&id==='people'&&localSnapshot(id,trailFamily)?{restore:trailFamily}:{overview:true,scaleHandoff:true,detailEntry:true});regionalSurface.set(false);adapter.environment(p);adapter.hideMap();adapter.model(id==='karez'?{cutaway:true,flow:karezSaved?.supply??65,playing:karezSaved?.playing??!reducedMotion}:{playing:historyTrails[trail]&&id==='market'?(memory().saved?.playing??false):trail&&id==='people'?(trailFamily?.playing??false):!reducedMotion});if(id==='karez')adapter.karez({enabled:true,stop:karezStop,...(karezSaved?{restore:karezSaved}:{})});if(id==='people'&&trail==='migration'&&settlementPhase!=='experiment'){adapter.settlementTime({phase:settlementPhase,progress:director?.active&&director.shot?.settlement?0:settlementReplay??1});adapter.settlementView?.(settlementDetail);settlementBeatKey=null;}localCameraKey=null;render();build();writeURL();adapter.resize();}
 function openModel(id=placeItem().model,{direct=false}={}){
  if(!knowledgeScenes[place].models.some(m=>m[0]===id))return;
  adapter.cancel();if(!modelOpen)mapView=adapter.read();
  if(modelOpen||direct||reducedMotion){enterModel(id);return;}
  const p=placeItem();approaching=id;tracing=false;render();
  const arrive=arrived=>{
   if(approaching!==id)return;approaching=null;render();
   if(arrived&&active&&stage==='place')enterModel(id);
  };if(onSphere()){const host=viewport.querySelector('#canvas-host');adapter.worldView({...regionalPose({anchor:[p.lon,p.lat],near:true,aspect:host.clientWidth/host.clientHeight}),distance:relationReturn?3.68:4.0,onArrive:arrive});}else adapter.scene('terrain',{focus:[p.lon,p.lat],distance:4.7,onArrive:arrive});adapter.hideMap();
 }
 root.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.kgAction==='narrate-place'){playPlaceNarration();return;}if(b.dataset.kgAction==='save-observation'){adapter.record();let note=root.querySelector('.kg-record-status');if(!note){note=document.createElement('p');note.className='kg-record-status';note.setAttribute('role','status');b.parentElement.after(note);}note.textContent='已保存到我的探索 · 镜头、参数与主题保留';return;}if(b.dataset.kgAction==='envoy'){openJourney('map');return;}if(relationAction(b))return;
  if(b.dataset.lpStory){localStructurePlay(b.dataset.lpStory==='start');return;}
  if(b.hasAttribute('data-lp-follow')){localFollow=true;localCameraKey=null;updateLocalReading(0);return;}
  if(b.dataset.htRoute){switchTrail(b.dataset.htRoute);return;}
  if(b.dataset.htStop){historyTrailNavigate(b.dataset.htStop);return;}
  if(b.dataset.htGood!==undefined){localFollow=true;localCameraKey=null;root.querySelector(`[data-good="${b.dataset.htGood}"]`)?.click();return;}
  if(historyTrails[trail]&&b.dataset.good!==undefined){memory().pending=Number(b.dataset.good);memory().primed=false;adapter.model({playing:true});return;}
  if(b.dataset.htPart!==undefined){selectStructurePart(Number(b.dataset.htPart));return;}
  if(b.dataset.settlementBeat!==undefined){settlementReplay=settlementBeatProgress(settlementPhase,Number(b.dataset.settlementBeat));settlementDetail='story';settlementFollow=true;settlementBeatKey=null;adapter.settlementTime({phase:settlementPhase,progress:settlementReplay});adapter.settlementView?.('story');render();build();writeURL();return;}
  if(b.hasAttribute('data-settlement-follow')){settlementFollow=true;settlementBeatKey=null;updateSettlementReading();return;}
  if(b.dataset.settlementDetail){settlementDetail=b.dataset.settlementDetail;settlementFollow=settlementDetail==='story';settlementBeatKey=null;adapter.settlementView?.(settlementDetail);render();build();const address=new URL(location.href);address.searchParams.set('settlementDetail',settlementDetail);history.replaceState(null,'',address);return;}
  if(b.dataset.settlementPhase||b.hasAttribute('data-settlement-experiment')||b.hasAttribute('data-settlement-replay')){
   if(b.hasAttribute('data-settlement-replay')){settlementReplay=0;settlementDetail='story';settlementFollow=true;settlementBeatKey=null;adapter.model({playing:true});adapter.settlementTime({phase:settlementPhase,progress:0});adapter.settlementView?.('story');render();build();}
   else {settlementPhase=b.dataset.settlementPhase??'experiment';settlementReplay=0;settlementDetail='story';settlementFollow=true;settlementBeatKey=null;adapter.model({playing:false});adapter.settlementTime(settlementPhase==='experiment'?null:{phase:settlementPhase,progress:0});render();build();if(settlementPhase==='experiment')adapter.modelOverview();else adapter.settlementView?.(settlementDetail);}
   const address=new URL(location.href);address.searchParams.set('settlement',settlementPhase);address.searchParams.set('settlementDetail',settlementDetail);address.searchParams.set('settlementProgress','0.000');history.replaceState(null,'',address);return;
  }
  if(b.dataset.htAction){if(['roof','connection','connection-reset'].includes(b.dataset.htAction))localStory.active=false;if(b.dataset.htAction==='model-fit'){localFollow=false;adapter.cancel();}if(['connection','connection-reset','roof'].includes(b.dataset.htAction))viewport.dataset.structureObservationOwner='user';const m=memory(),c=historyTrails[trail];if(b.dataset.htAction==='connection'){const f=adapter.structureConnection();adapter.structureConnection({playing:!f.playing,reset:f.state==='complete'});}if(b.dataset.htAction==='connection-reset')adapter.structureConnection({playing:false,reset:true});if(b.dataset.htAction==='feature')selectMapFeature(c.feature);if(b.dataset.htAction==='roof'){m.open=!m.open;adapter.structure({open:m.open});render();}if(b.dataset.htAction==='model-fit'){if(modelScene==='structure')adapter.structureFocus(null);else adapter.modelOverview();}if(b.dataset.htAction==='review'){saveTrailModel();trailReview=true;eventNode=historyStoryPlayer.observationNode??eventNode;go('history',{restore:true});}return;}
  if(b.dataset.mtStop){trailNavigate(b.dataset.mtStop);return;}
  if(b.dataset.mtAction==='start'){eventProgress.xibe=0;eventNode=null;eventGlobeView=null;eventTerrainView=null;trailNavigate('world');return;}
  if(b.dataset.mtAction==='exit'){trail=false;trailReview=false;render();build();writeURL();return;}
  if(b.dataset.mtPriority){trailPending=b.dataset.mtPriority;trailPrimed=false;adapter.familyChoice(b.dataset.mtPriority);adapter.model({playing:true});updateTrail();return;}
  if(b.dataset.mtAction==='valley'){selectMapFeature('ili-water');return;}
  if(b.dataset.mtAction==='review'){trailFamily={...adapter.read(),playing:adapter.running()};trailReview=true;eventNode=historyStoryPlayer.observationNode??eventNode;go('history',{restore:true});return;}
  if(trail&&b.dataset.priority){trailPending=b.dataset.priority;trailPrimed=false;adapter.model({playing:true});updateTrail();return;}
  if(b.dataset.kgSurface){changeSurface(b.dataset.kgSurface);return;}
  if(b.dataset.kgKarezStop){selectKarezStop(b.dataset.kgKarezStop);return;}
  if(b.dataset.kgKarezCare){adapter.karez({care:b.dataset.kgKarezCare});if(b.dataset.kgKarezCare==='clear')adapter.model({playing:true});updateKarez();writeURL();return;}
  if(b.dataset.kgAction==='cancel-arrival'){approaching=null;adapter.cancel();render();return;}
  if(b.dataset.kgEventEnter){enterEventPlace(b.dataset.kgEventEnter);return;}
  if(b.dataset.kgInlineEvent){historyStoryPlayer.suspend();eventNode=null;eventGlobeView=null;eventTerrainView=null;guideEventId=b.dataset.kgInlineEvent;eventTarget=null;eventTween=null;render();build();focusGuideEvent();writeURL();return;}
  if(b.dataset.kgEventPhase!==undefined){seekEventPhase(Number(b.dataset.kgEventPhase));return;}
  if(b.dataset.kgEventDestination){visitEventPlace(b.dataset.kgEventDestination);return;}
  if(b.dataset.worldPath){chooseWorldPath(b.dataset.worldPath);return;}
  if(b.dataset.kgStage){if(b.dataset.kgStage==='history'&&!trail){selectPeriod(period);return;}if(b.dataset.kgStage==='map'){if(stage==='world')enterWholeMap();else if((trail||placeOrigin||relationReturn)&&['history','place'].includes(stage))returnStoryMap();else{mapMode='geography';trail=false;go('map',{restore:true,guide:false});}}else{if(b.dataset.kgStage==='world'){trail=false;world='position';worldZoom='planet';worldPick='xinjiang';}go(b.dataset.kgStage,{restore:b.dataset.kgStage==='history'&&stage==='place'});}return;}
  if(b.dataset.worldChapter){chooseWorld(b.dataset.worldChapter);return;}
  if(b.dataset.kgWorld){cancelWorldApproach();world=b.dataset.kgWorld;if(world==='connections'&&comparisonCities.includes(worldPick))worldDestination=worldPick;worldPick=world==='coordinates'?'urumqi':'xinjiang';render();worldView();writeURL();return;}
  if(b.dataset.worldHome!==undefined){cancelWorldApproach();worldPick='xinjiang';render();worldView();writeURL();return;}
  if(b.dataset.worldLayer){worldAtlas.configure(b.dataset.worldLayer);render();writeURL();return;}
  if(b.dataset.worldPick){selectWorldAnchor(b.dataset.worldPick);return;}
  if(b.dataset.worldZoom){world='scale';worldZoom=b.dataset.worldZoom;render();worldView();writeURL();return;}
  if(b.dataset.kgLens){lens=b.dataset.kgLens;cursor=.5;tracing=false;mapGallery=false;if(onSphere())globePose();else adapter.scene('terrain',{overview:true});adapter.hideMap();render();build();writeURL();return;}
  if(b.dataset.kgMapFeature){selectMapFeature(b.dataset.kgMapFeature);return;}
  if(b.dataset.kgPeriod){selectPeriod(b.dataset.kgPeriod);return;}
  if(b.dataset.kgPlace){relationReturn=false;if(trail&&b.dataset.kgPlace!==(historyTrails[trail]?.place??'qabqal'))trail=false;comparisonFrom=null;if(stage==='place')fromStage='place';if(stage==='history'&&currentEvent())placeOrigin={event:currentEvent(),why:eventPlaces[currentEvent()]?.find(p=>p.place===b.dataset.kgPlace)?.why??'从时代问题转向地点机制，模型与史实分别理解。'};else placeOrigin=null;place=b.dataset.kgPlace;go('place');return;}
  if(b.dataset.kgModel){openModel(b.dataset.kgModel);return;}
  if(b.dataset.kgHistory){selectPeriod(b.dataset.kgHistory);return;}
  if(b.dataset.kgEvent){const id=b.dataset.kgEvent;rememberEventView();eventFromKnowledge=true;stop(false);adapter.event(id,{progress:eventProgress[id]??0});return;}
  if(b.dataset.kgFocus){adapter.scene('terrain',{focus:JSON.parse(b.dataset.kgFocus),distance:8});adapter.hideMap();return;}
  const a=b.dataset.kgAction;
  if(a==='run'&&modelOpen&&modelScene==='people'&&settlementPhase!=='experiment'){adapter.model({playing:!adapter.running()});settlementReplay=Number(viewport.dataset.settlementChronologyProgress)||0;updateSettlementReading();writeURL();return;}
  if(a==='karez-record'){const v=adapter.karez();if(!v?.reading.stable)return;const label=v.frame.obstruction>.5?'淤积':v.care==='clear'?'清理后':'通畅',item={label,source:Math.round(v.supply),downstream:Math.round(v.frame.reservoir*100)},key=label+'/'+item.source;const old=karezTrials.findIndex(t=>t.key===key);if(old>=0)karezTrials[old]={...item,key};else {karezTrials.push({...item,key});if(karezTrials.length>4)karezTrials.shift();}root.querySelector('[data-karez-trials]').innerHTML=trialHTML();return;}
  if(a==='karez-view'){adapter.modelOverview();return;}
  if(a==='compare-kashgar'||a==='compare-turpan'){comparisonFrom=a==='compare-kashgar'?'从吐鲁番用水，换到喀什比较停留与交换。两个地点独立观察，不沿同一条水路。':'从喀什交换，换到吐鲁番比较用水怎样支持生活与停留。';placeOrigin=null;place=a==='compare-kashgar'?'kashgar':'turpan';go('place');return;}

  if(a==='event-overview'){eventNode=null;render();focusGuideEvent(undefined,true);syncGuideEvent();writeURL();return;}
  if(a==='event-focus'){focusGuideEvent();return;}
  if(a==='event-play'||a==='event-next'){const id=currentEvent();if(!id)return;if(eventTarget!==null){eventTarget=null;eventTween=null;adapter.cancel();}else if(a==='event-next'&&phaseAt(eventProgress[id])===2){visitEventPlace((historyTrails[trail]?.node??eventPlaces[id][0].node));return;}else{if(eventProgress[id]>=1){seekEventPhase(0);return;}const next=Math.min(2,phaseAt(eventProgress[id])+1);seekEventPhase(next);}updateGuideEvent(0);writeURL();return;}
  if(a==='world-reset'){cancelWorldApproach();world='position';worldZoom='planet';worldPick='xinjiang';render();worldView();writeURL();return;}
  if(a==='world-replay'){worldProgress[world]=0;worldMoving=!reducedMotion;worldAtlas.setRunning(worldMoving);render();updateWorldFlow();return;}
  if(a==='world-motion'){if(earthFlows[world]&&worldProgress[world]>=1)worldProgress[world]=0;worldMoving=!worldMoving;worldAtlas.setRunning(worldMoving);render();writeURL();return;}
  if(a==='world-cancel'){cancelWorldApproach();render();return;}
  if(a==='map-surroundings'){globePose({surroundings:true});return;}if(a==='map-fit'){if(stage==='history'&&onSphere())focusGuideEvent(undefined,true);else if(onSphere())globePose();else adapter.scene('terrain',{overview:true});adapter.hideMap();return;}if(a==='map-gallery'){mapGallery=!mapGallery;render();build();return;}
  if(a==='exit')stop();if(a==='locate')adapter.locate();if(a==='top'||a==='side')adapter.pose(a);if(a==='model')openModel();if(a==='return-map')go('place',{restore:true});if(a==='run')adapter.model({playing:!adapter.running()});if(a==='place-fit'){if(onSphere())globePose();else adapter.scene('terrain',placePose());adapter.hideMap();}if(a==='place-near'){const p=placeItem();if(onSphere())globePose({anchor:[p.lon,p.lat],near:true});else adapter.scene('terrain',{focus:[p.lon,p.lat],distance:7});adapter.hideMap();}if(a==='trace'){if(cursor>=1)cursor=0;tracing=!tracing;render();}if(a==='next-period')selectPeriod(historicalPeriods[(historicalPeriods.findIndex(h=>h.id===period)+1)%historicalPeriods.length].id);
 });
 root.addEventListener('change',ev=>{if(ev.target.hasAttribute('data-world-country')){if(ev.target.value==='xinjiang'){worldPick='xinjiang';render();worldView();writeURL();}else selectWorldAnchor(ev.target.value);return;}if(ev.target.hasAttribute('data-world-distance')){worldDestination=ev.target.value;render();worldView();writeURL();return;}if(ev.target.hasAttribute('data-kg-place-select')){relationReturn=false;comparisonFrom=null;placeOrigin=null;fromStage='place';place=selectedKnowledge(learningPlaces,ev.target.value).id;go('place');}});
 root.addEventListener('input',ev=>{if(ev.target.id==='flow-range'&&modelScene==='karez'){adapter.karez({supply:Number(ev.target.value)});updateKarez();writeURL();return;}if(ev.target.hasAttribute('data-kg-event-progress')){historyStoryPlayer.suspend();adapter.cancel();eventTarget=null;eventTween=null;eventProgress[currentEvent()]=Number(ev.target.value)/100;updateGuideEvent(0);writeURL();return;}if(ev.target.hasAttribute('data-world-progress')){worldProgress[world]=Number(ev.target.value)/100;worldMoving=false;worldAtlas.setRunning(false);updateWorldFlow();root.querySelector('[data-kg-action=world-motion]').textContent='继续球面演示';writeURL();return;}if(ev.target.hasAttribute('data-kg-cursor')){cursor=Number(ev.target.value)/100;tracing=false;updateTrace();root.querySelector('[data-kg-action=trace]').textContent='沿线观察高程';}});
 pins.addEventListener('click',ev=>{const b=ev.target.closest('button');if(b&&(relationsActive()||relationReturn&&!modelOpen)){if(relationReturn&&b.dataset.srNode){openRelations(relationId,{scope:'place',node:b.dataset.srNode});return;}if(relationAction(b))return;if(b.dataset.srAnchor){const anchor=JSON.parse(b.dataset.srAnchor);globePose({anchor,near:true});return;}}if(b?.dataset.htPart!==undefined){selectStructurePart(Number(b.dataset.htPart));}else if(b?.dataset.kgAction==='event-focus'){if(trail)historyStoryPlayer.inspect();else focusGuideEvent();}else if(b?.dataset.kgEventDestination){if(b.classList.contains('kg-narration-target')&&eventNode===b.dataset.kgEventDestination)enterEventPlace(eventNode);else visitEventPlace(b.dataset.kgEventDestination);}else if(b?.dataset.kgSurrounding){globePose({surroundings:true});}else if(b?.dataset.kgMapFeature){selectMapFeature(b.dataset.kgMapFeature);}else if(b?.dataset.kgPlace){relationReturn=false;if(trail&&b.dataset.kgPlace!==(historyTrails[trail]?.place??'qabqal'))trail=false;placeOrigin=null;place=b.dataset.kgPlace;go('place');}else if(b?.dataset.kgKarezStop){selectKarezStop(b.dataset.kgKarezStop);}else if(b?.dataset.kgModelFocus){adapter.modelFocus(JSON.parse(b.dataset.kgModelFocus));}else if(b?.dataset.kgFocus){if(onSphere())globePose({anchor:JSON.parse(b.dataset.kgFocus),near:true});else adapter.scene('terrain',{focus:JSON.parse(b.dataset.kgFocus),distance:8});adapter.hideMap();}});
 const header=document.createElement('button');header.id='kg-open';header.textContent='全部线索';shell.querySelector('.wb-header nav').prepend(header);for(const [id,label]of [['wb-scenes-open','场景'],['wb-inspector-open','工具']]){const b=shell.querySelector('#'+id);if(b)b.textContent=label;}
 shell.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(active&&onSphere()&&b.dataset.wbView){ev.preventDefault();ev.stopImmediatePropagation();adapter.cancel();if(relationsActive())focusRelation();else if(stage==='history')focusGuideEvent(undefined,b.dataset.wbView!=='near');else globePose(stage==='place'?{anchor:[placeItem().lon,placeItem().lat],near:b.dataset.wbView==='near'}:{});return;}if(eventFromKnowledge&&(b.dataset.ejStage==='region'||b.dataset.hpStage==='region'||b.dataset.hpCrumb==='region'||b.dataset.hpAction==='region'||b.id==='hp-return')){ev.preventDefault();ev.stopImmediatePropagation();eventFromKnowledge=false;go('history',{restore:true});return;}if(b.id==='hp-world'){ev.preventDefault();ev.stopImmediatePropagation();world='position';worldZoom='planet';worldPick='xinjiang';go('world');return;}if(b.id==='kg-open'){ev.preventDefault();ev.stopImmediatePropagation();openAllTopics();return;}if(!active&&(b.dataset.raLayer==='history'||b.dataset.raTheme==='history'||b.dataset.raPreview||b.dataset.hpStage==='region'||b.dataset.hpCrumb==='region')){ev.preventDefault();ev.stopImmediatePropagation();openRelations(b.dataset.raPreview??relationId);return;}if(active&&(b.id==='gx-open'||b.dataset.raAction==='sample'||b.id==='hp-world'||b.dataset.wbScene||b.dataset.hpStage||b.dataset.hpEvent||b.dataset.hpResume))stop(false);},{capture:true});

 function enterJourney(mode){
  historyStoryPlayer.suspend();activate();adapter.cancel();period='han';guideEventId='zhang';stage='history';modelOpen=false;modelScene=null;historySurface='globe';eventNode=null;worldAtlas.hide();adapter.hideMap();restoreControls();render();layer.visible=false;pins.hidden=true;
  adapter.scene(mode==='map'?'earth':'journey',{overview:false,keepCamera:mode==='map',scaleHandoff:true});regionalSurface.set(mode==='map');
  if(mode==='map')adapter.worldView({lon:89,lat:38,distance:6.4,surface:2.7,duration:1800});else{adapter.environment(null);adapter.envoyFocus();}
  adapter.resize();const u=new URL(location.href);u.searchParams.set('journey',mode);history.replaceState(null,'',u);
 }
 function openJourney(mode='map',{director=false}={}){if(!envoy.active){journeyReturn=adapter.read();if(journeyReturn.scene==='earth')eventGlobeView=journeyReturn;}envoy.open(mode,{director});}
 function directorCamera(pose){if(director?.manualView)return;const host=viewport.querySelector('#canvas-host');adapter.worldView({...pose,distance:3.2+((directorPath.id==='zhang'&&director?.shot.beat!==undefined?Math.max(4.25,pose.distance):pose.distance)-3.2)*Math.max(1,.85/(host.clientWidth/host.clientHeight)),duration:2400});}
 function restoreDirectorView(shot){
  if(modelOpen&&modelScene===shot.model&&['market','structure'].includes(modelScene)){localFollow=true;localCameraKey=null;updateLocalReading(0);return;}
  if(shot.journey){envoy.focus();return;}
  directorHeldView=null;
  if(shot.world)directorCamera(shot.pose);
  else if(shot.beat!==undefined&&directorCue)directorCamera(directorCue.pose);
  else if(shot.geography!==undefined){const host=viewport.querySelector('#canvas-host');adapter.worldView(shot.geography===0?regionalPose({aspect:host.clientWidth/host.clientHeight}):{...relationPose(directorPath.id,'region',directorPath.place,host.clientWidth/host.clientHeight),duration:1900});}
  else if(shot.id==='return')focusRelation();
  else if(shot.model==='structure')adapter.structureFocus(null);
  else if(shot.settlement)adapter.settlementView?.(shot.detail??'overview');
  else if(shot.model)adapter.modelOverview();
  else globePose({anchor:[placeItem().lon,placeItem().lat],near:true});
 }
 function directorPrepare(shot){
  envoy.close();
  const c=directorPath;localFollow=true;localCameraKey=null;localStory.active=false;adapter.structure({motion:true});if(shot.settlement){settlementPhase=shot.settlement;settlementDetail=shot.detail??'story';settlementReplay=null;settlementFollow=true;settlementBeatKey=null;}directorHeldView=null;viewport.dataset.directorTargets=JSON.stringify(shot.targets??[]);
  historyStoryPlayer.suspend();directorCue=null;directorTime=0;directorLastFeature=null;mapGuide.active=false;mapGuide.playing=false;delete viewport.dataset.directorSpatialCaption;directorChoice=null;directorPrimed=false;adapter.cancel();adapter.model({playing:false});adapter.structureConnection({playing:false});
  eventTarget=null;eventTween=null;eventNode=null;guideEventId=c.id;period=c.period;mapSurface=historySurface='globe';place=c.place;relationNode=c.place;
  if(c.kind==='nature'){trail=false;relationReturn=false;mapMode='geography';mapGallery=false;lens='relief';mapPicks.relief='tianshan';placeOrigin=null;globeRegionView=null;}
  else{relationId=c.id;lens=relationById(c.id).lens;mapPicks[lens]=relationById(c.id).feature;}
  if(shot.natureRegion||shot.natureReturn){go('map',{guide:false});if(!pendingWorld)globePose();}
  else if(shot.naturePlace){go('place');}
  else if(shot.journey){openJourney(shot.journey,{director:true});}
  else if(shot.world){eventProgress[c.id]=0;trail=c.trail;relationReturn=false;world=shot.world;worldMoving=false;worldPick=shot.anchor;worldZoom='planet';go('world');directorCamera(shot.pose);}
  else if(shot.beat!==undefined){trail=c.trail;relationReturn=false;eventProgress[c.id]=storyProgress(c.id,shot.beat,0);eventGlobeView=null;go('history');directorCue=visualCue(c.id,eventProgress[c.id],guideEventData().corridor);if(c.id==='xibe'&&shot.beat===0){directorCue.pose={lon:102,lat:42,distance:7.6,surface:3.12,tilt:0};directorCue.key='xibe:background:context';}directorCamera(directorCue.pose);}
  else if(shot.geography!==undefined){
   openRelations(c.id,{scope:'region',node:c.place,geography:true});relationProgress=0;relationElapsed=0;relationMoving=false;relationFeature=shot.feature;
   viewport.dataset.directorSpatialCaption=shot.speech;viewport.dataset.directorSpatialPhase=shot.title;render();build();
   if(!pendingWorld){const host=viewport.querySelector('#canvas-host');adapter.worldView(shot.geography===0?regionalPose({aspect:host.clientWidth/host.clientHeight}):{...relationPose(c.id,'region',c.place,host.clientWidth/host.clientHeight),duration:2400});}
  }
  else if(['regional','valley','geography','return'].includes(shot.id)){openRelations(c.id,{scope:'region',node:c.place});relationProgress=1;relationMoving=false;relationFeature='all';relationOnlyGeography=shot.id!=='return'&&c.id!=='zhang';render();build();if(!pendingWorld)focusRelation();}
  else if(shot.id==='place'){openRelations(c.id,{scope:'place',node:c.place});relationProgress=1;relationMoving=false;relationAction({dataset:{srAction:'place'}});}
  else if(shot.model){
   if(!(stage==='place'&&modelOpen&&modelScene===c.model)){
    trail=c.trail;relationReturn=false;trailFamily=null;eventProgress[c.id]=1;eventNode=c.place;placeOrigin=c.kind==='nature'?null:{event:c.id,why:eventPlaces[c.id].find(p=>p.place===c.place)?.why};go('place');openModel(c.model);
   }else if(c.model!=='structure'){if(shot.settlement){adapter.settlementTime({phase:shot.settlement,progress:0});adapter.settlementView?.(settlementDetail);}else adapter.modelOverview();}
  }
  writeURL();
 }
 function directorReady(shot){
  if(shot.journey)return envoy.active&&envoy.mode===shot.journey&&viewport.dataset.scene===(shot.journey==='map'?'earth':'journey')&&viewport.dataset.camera!=='moving'&&viewport.dataset.blend!=='moving';
  const expected=shot.model||shot.naturePlace?'place':shot.beat!==undefined?'history':shot.world?'world':shot.id==='place'?'place':'map';
  return stage===expected&&viewport.dataset.camera!=='moving'&&viewport.dataset.blend!=='moving'&&!approaching&&!pendingWorld&&(!shot.model||modelOpen&&modelScene===shot.model&&localSceneMatches(shot.model,adapter.read().scene));
 }
 function directorResume(shot){
  adapter.structure({motion:true});
  if(shot.journey){envoy.resume();return;}
  if(shot.glacierMode){if(!modelOpen||modelScene!=='glacier'){if(!approaching)openModel('glacier');return;}if(directorChoice!==shot.id){adapter.glacier(glacierDirectorFrame(shot,0));if(!director.manualView)adapter.modelOverview();directorChoice=shot.id;}adapter.model({playing:true});return;}
  if((shot.geography!==undefined||shot.id==='return')&&stage==='world'&&!pendingWorld){directorHeldView=null;go('map');return;}
  if(directorHeldView){adapter.worldRestore(directorHeldView,{animate:true});directorHeldView=null;}
  if(shot.model){
   if(!modelOpen||modelScene!==shot.model){if(!approaching)openModel(shot.model);return;}
   if(directorChoice===null&&directorReady(shot)){
    if(shot.settlement){settlementPhase=shot.settlement;settlementReplay=null;adapter.settlementTime({phase:shot.settlement,progress:0});}else if(shot.model==='people')adapter.familyChoice(shot.choice);
    if(shot.model==='market')adapter.marketChoice(shot.goods);
    if(shot.model==='structure'){
     viewport.dataset.structureObservationOwner='director';adapter.structure({open:shot.open,part:shot.part});
     adapter.structureFocus(null);
     adapter.structureConnection({playing:false,reset:true});
    }
    directorChoice=shot.id;directorPrimed=false;if(shot.settlement)writeURL();
   }
   if(shot.connection)adapter.structureConnection({playing:true});
   adapter.model({playing:true});return;
  }
  if(directorReady(shot))return;
  if(shot.beat!==undefined&&directorCue)directorCamera(directorCue.pose);
 }
 function directorReceipt(record){if(!record)return;directorReceipts=directorReceipts.filter(r=>r.priority!==record.priority);directorReceipts.push({...record,source:'director',event:directorPath.id});viewport.dataset.directorRecords=JSON.stringify(directorReceipts);}
 function directorFrame(shot,fraction,time){
  if(shot.journey){envoy.frame(fraction);return true;}
  const c=directorPath,d=viewport.dataset;directorTime=time+(shot.beat??0)*24;
  if(shot.glacierMode){const frame=glacierDirectorFrame(shot,fraction);adapter.glacier(frame);d.directorGlacierMode=frame.mode;d.directorGlacierRetreat=String(frame.retreat);d.directorGlacierTargets=JSON.stringify(frame.targets);for(const m of markers.filter(m=>m.button.dataset.glacierAnchor)){const key=m.button.dataset.glacierAnchor,selected=frame.mode==='observation'?key==='surface':frame.mode==='flow'?key===(fraction<.5?'upstream':'downstream'):key==='surface';m.button.classList.toggle('ed-reading',selected);m.priority=selected?-1:1;}if(fraction>.96)directorReceipt({priority:shot.id,label:shot.label,sequence:shot.where,reply:shot.title});return frame.mode===d.glacierMode&&Number(d.directorGlacierRetreat)===frame.retreat;}
  if(shot.beat!==undefined){
   const p=storyProgress(c.id,shot.beat,Math.min(.999999,fraction));eventProgress[c.id]=p;
   const cue=visualCue(c.id,p,guideEventData().corridor);
   if(c.id==='xibe'&&shot.beat===0){cue.pose={lon:102,lat:42,distance:7.6,surface:3.12,tilt:0};cue.key='xibe:background:context';}
   if(directorCue?.key!==cue.key)directorCamera(cue.pose);directorCue=cue;eventNode=cue.targetNode??null;syncGuideEvent();
  }
  if(shot.geography!==undefined){d.directorSpatialCaption=shot.speech;d.directorSpatialPhase=shot.title;}
  if(['valley','geography'].includes(shot.id)){
   const feature=c.features[fraction<.32?0:fraction<.65?1:2];
   if(feature!==directorLastFeature){directorLastFeature=feature;relationFeature=relationFocus(c.id,feature);build();}
  }
  if(shot.model){
   if(directorChoice===null)directorResume(shot);
   let record=null;
   if(shot.settlement){adapter.settlementTime({phase:shot.settlement,progress:fraction});const s=settlementStages.find(x=>x.id===shot.settlement);if(fraction>=.99&&d.settlementChronology===shot.settlement&&Number(d.settlementChronologyProgress)>=.99&&(shot.settlement!=='flow'||Number(d.settlementResidentResponse)>=.99&&Number(d.settlementBranchWater)>=.99))record={priority:shot.settlement,label:s.year+' · '+s.title,sequence:s.look,reply:s.reply};}
   else if(shot.model==='people'){
    if(Number(d.settlementAge)<1)directorPrimed=true;
    record=directorPrimed&&settlementObservation(d,shot.choice);
   }else if(shot.model==='market'){
    if(d.marketUse==='waiting-for-choice')directorPrimed=true;
    record=directorPrimed&&marketObservation(d,shot.goods);
    const positions=JSON.parse(d.marketActors??'[]');
    for(const m of markers.filter(p=>p.recipient!==undefined)){const i=m.recipient,xyz=positions[i];if(xyz)m.position.set(xyz[0],xyz[1]+1.55,xyz[2]);m.button.textContent=['家庭','远行者','手艺人'][i]+' · '+(i===shot.goods?(d.marketUse==='receiving-and-using'?'接收与使用':record?['披上织物','补给后出发','继续制作'][i]:'等待交接'):['等待织物','等待补给','等待器物'][i]);}
   }else if(shot.model==='structure'){
    if(shot.connection){const f=adapter.structureConnection();if(f.progress<.1)directorPrimed=true;if(directorPrimed&&f.state==='complete')record={priority:'connection',label:'内外往来',sequence:'外侧 → 城门 → 通道 → 内部 → 返回外侧',reply:'金色进入与青色返回均已完成'};}
    else if(shot.open)record=structureObservation(d,shot.part,true);
    else return d.historyStructure==='true'&&d.structurePart==='gate';
   }
   directorReceipt(record);return !!record;
  }
  return true;
 }
 director=installExplorationDirector({viewport,shell,enter:directorPrepare,ready:directorReady,frame:directorFrame,
  activate:path=>{directorPath=path;historyStoryPlayer.suspend();directorReceipts=[];viewport.dataset.directorRecords='[]';},
  freeze:()=>{envoy.freeze();if(onSphere()&&viewport.dataset.camera==='moving')directorHeldView=adapter.read();adapter.cancel();adapter.model({playing:false});adapter.structure({motion:false});adapter.structureConnection({playing:false});relationMoving=false;worldMoving=false;},
  resume:directorResume,adjustView:()=>{directorHeldView=null;adapter.interruptView();},restoreView:restoreDirectorView,
  leave:()=>{if(modelOpen&&modelScene==='glacier')adapter.glacier({mode:adapter.read().parameters.glacierMode,reveal:1});if(modelOpen&&modelScene==='people'&&settlementPhase!=='experiment')settlementReplay=Number(viewport.dataset.settlementChronologyProgress)||0;envoy.releaseDirector();directorCue=null;directorChoice=null;directorPrimed=false;directorHeldView=null;delete viewport.dataset.directorTargets;if(modelOpen&&modelScene==='structure'){const m=memory();m.open=viewport.dataset.structureExploded==='true';m.part=structureParts.findIndex(p=>p.key===viewport.dataset.structurePart);}render();build();if(envoy.active){layer.visible=false;pins.hidden=true;}writeURL();},
  resize:()=>adapter.resize(),returnMap:path=>{if(path.kind==='nature'){trail=false;mapMode='geography';mapSurface='globe';lens='relief';mapPicks.relief='tianshan';place='glacier';globeRegionView=null;go('map',{guide:false});}else openRelations(path.id,{scope:'region',node:path.place,guide:false});},currentPath:()=>directorForContext(snapshot(),adapter.read())
 });
 for(const type of ['pointerdown','wheel'])viewport.querySelector('#canvas-host').addEventListener(type,()=>{if(mapGuide.playing){mapGuide.playing=false;syncMapGuide();}},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&mapGuide.playing){mapGuide.playing=false;syncMapGuide();}});
 const params=new URL(location.href).searchParams;mapMode=params.get('mapMode')==='geography'||params.get('mapSurface')==='terrain'?'geography':params.get('mapMode')==='relations'||params.has('relation')||params.has('trail')?'relations':'geography';relationId=relationById(params.get('relation')??params.get('event')).id;relationScope=['context','region','place'].includes(params.get('relationScope'))?params.get('relationScope'):'context';relationNode=relationPlace(relationId,params.get('relationNode')).id;relationReturn=params.get('relationReturn')==='1';relationFeature=relationFocus(relationId,params.get('relationFocus'));relationOnlyGeography=params.get('relationCompare')==='geography';relationMoving=params.get('relationMotion')!=='0'&&!reducedMotion;if(!relationMoving)relationProgress=1;trail=['migration','zhang','protectorate'].includes(params.get('trail'))?params.get('trail'):false;historySurface=params.get('historySurface')==='terrain'?'terrain':'globe';eventNode=params.get('eventNode');mapSurface=params.get('mapSurface')==='terrain'?'terrain':'globe';if(params.get('learnCompare')==='from-water')comparisonFrom='从吐鲁番用水，换到喀什比较停留与交换。两个地点独立观察，不沿同一条水路。';if(params.get('learnCompare')==='from-exchange')comparisonFrom='从喀什交换，换到吐鲁番比较用水怎样支持生活与停留。';if(params.has('waterSupply'))karezSaved=restoredKarez({supply:params.get('waterSupply'),care:params.get('waterCare')});if(karezStops.some(s=>s.id===params.get('waterStop')))karezStop=params.get('waterStop');if(knowledgeStages.some(s=>s.id===params.get('learn'))){fromStage=['world','map','history','place'].includes(params.get('learnFrom'))?params.get('learnFrom'):null;guideEventId=params.get('learnEvent')??'zhang';if(['zhang','protectorate','xibe'].includes(guideEventId))eventProgress[guideEventId]=Math.max(0,Math.min(1,Number(params.get('learnProgress'))||0));world=selectedKnowledge(worldLessons,params.get('learnWorld')).id;worldMoving=params.get('worldMotion')==='0'?false:!reducedMotion;if(earthFlows[world]&&params.has('worldFlow')){const value=Number(params.get('worldFlow'));if(Number.isFinite(value))worldProgress[world]=Math.max(0,Math.min(1,value));}worldPick=worldAnchor(params.get('worldPick')).id;worldDestination=comparisonCities.includes(params.get('worldDistance'))?params.get('worldDistance'):'beijing';worldZoom=['planet','eurasia','regional'].includes(params.get('worldZoom'))?params.get('worldZoom'):'planet';lens=selectedKnowledge(mapLessons,params.get('learnLens')).id;mapPicks[lens]=selectedMapFeature(lens,params.get('mapPick'),referenceCities).id;period=selectedKnowledge(historicalPeriods,params.get('learnPeriod')).id;place=selectedKnowledge(learningPlaces,params.get('learnPlace')).id;const origin=params.get('learnOrigin');if(Array.isArray(eventPlaces[origin])&&eventPlaces[origin].some(p=>p.place===place))placeOrigin={event:origin,why:eventPlaces[origin].find(p=>p.place===place).why};if(trail){normalizeTrail();if(trail==='zhang'&&params.get('learnPlace')==='turpan'&&params.get('learn')==='history')place='turpan';if(params.get('learn')==='world'){world='position';worldMoving=false;}}go(params.get('learn'));if(stage==='place'&&params.get('learnModel')==='1')openModel(knowledgeScenes[place].models.some(m=>m[0]===params.get('learnScene'))?params.get('learnScene'):placeItem().model,{direct:true});}else if(trail){if(historyTrails[trail])historyTrailNavigate('world');else trailNavigate('world');}else if(params.get('stage')==='region'&&!params.has('explore')&&!params.has('config'))openRelations(params.get('event'));else if(defaultEntry)go('world');
 if(relationsActive()&&params.has('mapRead')){applyMapGuide(Number(params.get('mapRead')));writeURL();}
 if(params.has('journey')&&!params.has('director'))openJourney(params.get('journey')==='near'?'near':'map');
 if(!params.has('learn')&&params.get('stage')==='model'){const saved=adapter.read();resumeObservation({id:'legacy-location',navigation:saved.navigation,workspace:saved});}
 return {snapshot,resumeObservation,openJourney,get journeyActive(){return envoy.active;},adjustDirectorView:()=>{if(director?.inspectView())return true;if(modelOpen&&historyTrails[trail]&&['market','structure'].includes(modelScene)){localFollow=false;adapter.cancel();return true;}if(modelOpen&&modelScene==='people'&&settlementPhase!=='experiment'){settlementFollow=false;adapter.cancel();return true;}return false;},get active(){return active;},get structureActive(){return active&&modelOpen&&modelScene==='structure';},selectStructurePart,get surfaceActive(){return active&&(onSphere()||!!pendingWorld);},get eventActive(){return active&&stage==='history'&&!!currentEvent();},seekEventPhase,visitEventPlace,stop,update(camera,dt,showMarkers=true){director?.update(dt);if(!active)return;if(settlementReplay!==null&&modelOpen&&modelScene==='people'&&adapter.running()&&!director?.active){settlementReplay=Math.min(1,settlementReplay+dt/24);adapter.settlementTime({phase:settlementPhase,progress:settlementReplay});if(settlementReplay>=1)settlementReplay=1;}if(envoy.active){envoy.update(camera,dt);return;}if(height!==adapter.height())build();const host=viewport.querySelector('#canvas-host'),w=host.clientWidth,h=host.clientHeight,panel=(director?.active?shell.querySelector('.ed-card'):root.querySelector('.kg-panel')).getBoundingClientRect(),heading=(director?.active?shell.querySelector('.ed-heading'):root.querySelector('.kg-nav')).getBoundingClientRect();
  if(zhangTerrain){const shot=director?.active?director.shot:stage==='history'?{beat:phaseAt(eventProgress.zhang)}:{geography:relationOnlyGeography?1:2};zhangTerrain.update(zhangSpaceFrame(shot,director?.active?Number(viewport.dataset.directorFraction)||0:1));}
  if(modelOpen&&historyTrails[trail])contextMap.update(root.querySelector('.lp-context canvas'),{path:trail,selected:place,kind:modelScene,records:director?.active?directorReceipts:memory().records});
  if(modelOpen&&trail==='zhang')contextMap.update(root.querySelector('.zhang-context canvas'),{path:'zhang',selected:'kashgar',kind:'market',records:director?.active?directorReceipts:memory().records});
  if(stage==='world'){if(earthFlows[world]&&worldMoving&&!pendingWorld){worldProgress[world]=Math.min(1,worldProgress[world]+Math.min(.1,dt)/18);if(worldProgress[world]>=1){worldMoving=false;worldAtlas.setRunning(false);const b=root.querySelector('[data-kg-action=world-motion]');if(b)b.textContent='继续球面演示';writeURL();}}updateWorldFlow();worldAtlas.update(camera,dt,showMarkers&&viewport.dataset.blend!=='moving');}
  if(leavingEvent){leavingEvent.time+=Math.min(.1,dt);if(leavingEvent.time<.65){adapter.guideEvent({...leavingEvent,phase:phaseAt(leavingEvent.progress),fade:1-leavingEvent.time/.65,labelsVisible:false});viewport.dataset.learnHandoff='history-place';}else{leavingEvent=null;adapter.hideMap();delete viewport.dataset.learnHandoff;}}
  historyStoryPlayer.update(dt);updateSettlementReading();updateLocalReading(dt);
  if(stage==='history')updateGuideEvent(dt);
  if(stage==='map'){layer.visible=(relationsActive()||viewport.dataset.camera!=='moving')&&viewport.dataset.blend!=='moving';pins.hidden=!layer.visible;const compass=root.querySelector('.kg-compass');compass.hidden=!layer.visible;const center=(onSphere()?point(...mapItem().anchor):new THREE.Vector3(0,0,0)).project(camera),north=(onSphere()?point(mapItem().anchor[0],mapItem().anchor[1]+1):new THREE.Vector3(0,0,-1)).project(camera),angle=Math.atan2((north.x-center.x)*w,-(center.y-north.y)*h)*180/Math.PI;compass.style.setProperty('--north-angle',angle+'deg');viewport.dataset.mapNorthAngle=angle.toFixed(1);}
  if(tracing&&!modelOpen&&(stage==='place'||stage==='map')){cursor=Math.min(1,cursor+dt/12);if(cursor>=1){tracing=false;const b=root.querySelector('[data-kg-action=trace]');if(b)b.textContent='沿线观察高程';}updateTrace();}
  if(relationLayer&&!modelOpen&&(relationsActive()||relationReturn)){
   if(mapGuide.active&&mapGuide.playing&&!director?.active&&viewport.dataset.camera!=='moving'){applyMapGuide(Math.min(1,mapGuide.progress+Math.min(.1,dt)/15));if(mapGuide.progress>=1){mapGuide.playing=false;syncMapGuide();writeURL();}}
   if(relationMoving&&viewport.dataset.camera!=='moving'&&layer.visible){relationElapsed+=Math.min(.1,dt);relationProgress=Math.min(1,relationProgress+Math.min(.1,dt)/3.8);}
   const frame=relationLayer.update(relationProgress,relationElapsed);const modelReveal=mapGuide.active?mapBridgeFrame(relationId,mapGuide.progress,relationNode).model:frame.model;relationPreview?.update(modelReveal,relationNode,{context:true,motion:relationElapsed,actionTime:mapGuide.active?mapBridgeFrame(relationId,mapGuide.progress,relationNode).actionTime:undefined,observed:explorationMemory.hasObservation(relationId,relationNode)});
   viewport.dataset.relationReveal=relationProgress.toFixed(3);viewport.dataset.relationModelReveal=modelReveal.toFixed(3);viewport.dataset.relationMotion=String(relationMoving);
  }
  if(!director?.active)updateTrail();else if(modelOpen&&modelScene==='people')for(const m of markers.filter(m=>m.button.dataset.mtPin)){const key=m.button.dataset.mtPin,v=Number(viewport.dataset[key])||0;m.button.textContent=key==='homeOutcome'?(v<.1?'门前 · 等待安顿':v<.95?'门前 · 灯火亮起':'门前 · 家人安顿'):(v<.1?'水闸 · 等待引水':v<.95?'水闸 · 渠水流入':'田边 · 来水接上');}
  if(modelOpen){updateKarez();const run=root.querySelector('[data-kg-action=run]');if(run)run.textContent=adapter.running()?'暂停变化':(modelScene==='people'&&settlementPhase!=='experiment'||historyTrails[trail])?'继续变化':'启动场景动作';const response=root.querySelector('.kg-live-response'),text=adapter.response();if(response&&response.textContent!==text)response.textContent=text;updateBeats();}
  const rail=(director?.active?shell.querySelector('.ed-bottom'):(root.querySelector('.sr-dock')??root.querySelector('.kg-scene-rail')))?.getBoundingClientRect(),bottom=Math.min(host.getBoundingClientRect().bottom-8,rail?rail.top-12:Infinity),occupied=['.hs-caption','.hs-director'].map(q=>root.querySelector(q)?.getBoundingClientRect()).filter(Boolean);
  for(const m of [...markers].sort((a,b)=>(a.priority??2)-(b.priority??2)||Number(!!a.quiet)-Number(!!b.quiet))){
   projected.copy(m.position).project(camera);const x=(projected.x+1)/2*w,y=(1-projected.y)/2*h+host.getBoundingClientRect().top;
   m.button.hidden=!(m.visible!==false&&showMarkers&&viewport.dataset.blend!=='moving'&&(!onSphere()||m.position.clone().normalize().dot(camera.position.clone().normalize())>3.2/camera.position.length())&&(!m.channel||adapter.modelState().cutaway)&&projected.z>-1&&projected.z<1&&x>30&&x<w-30&&y>host.getBoundingClientRect().top+28&&y<bottom);
   if(m.button.hidden)continue;
   const width=m.button.offsetWidth,bh=m.button.offsetHeight;let layout=null;
   const candidates=(relationsActive()||relationReturn)?[[0,60],[0,0],[-125,40],[125,40],[0,120],[-145,100],[145,100],[0,-45]]:stage==='history'&&onSphere()?[[0,w<700?40:75],[0,0],[0,105],[-125,40],[125,40],[-145,0],[145,0],[-155,-60],[155,-60]]:[[0,0],[0,28],[0,55],[0,85],[-110,28],[110,28]];
   for(const [dx,offset] of candidates){
    const labelX=Math.max(width/2+12,Math.min(w-width/2-12,x+dx));
    const b={left:labelX-width/2,right:labelX+width/2,top:y-offset-bh,bottom:y-offset};
    if(b.left<12||b.right>w-12||b.top<host.getBoundingClientRect().top+12||b.bottom>bottom||(director?.active?b.left<panel.right+10&&b.right>panel.left-10&&b.top<panel.bottom+10&&b.bottom>panel.top-10:b.right>panel.left-15&&b.bottom>panel.top-25)||b.left<heading.right+15&&b.top<heading.bottom+15)continue;
    if(occupied.some(r=>b.left<r.right+5&&b.right>r.left-5&&b.top<r.bottom+4&&b.bottom>r.top-4))continue;
    layout={...b,offset,labelX};break;
   }
   if(!layout){m.button.hidden=true;continue;}const labelX=layout.labelX;occupied.push(layout);m.button.style.left=labelX+'px';m.button.style.top=(y-layout.offset)+'px';m.button.style.setProperty('--kg-leader',Math.hypot(x-labelX,layout.offset)+'px');m.button.style.setProperty('--kg-leader-angle',(-Math.atan2(x-labelX,layout.offset)*180/Math.PI)+'deg');
  }
  viewport.dataset.mapLabelCount=String(markers.filter(m=>!m.button.hidden).length);
 }};
}
