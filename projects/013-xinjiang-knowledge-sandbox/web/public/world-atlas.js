import * as THREE from 'three';
import {worldAnchors,worldAnchor,comparisonCities,mountainBands,globePosition,comparisonArc} from './world-content.js';
import {countryCatalog} from './world-country-data.js';
import {installCountryLayer,countryForAnchor} from './world-country-layer.js';
import {countryLabelEligible,countryLabelBudget,worldHandoffFrame} from './world-country-geometry.js';
import {earthFlows,flowSamples,latitudeBelt} from './world-intro-content.js';
import {cartographicScale,atlasLabelPriority,atlasLabelEligible,scaleReading} from './cartographic-labels.js';
import {createXinjiangRange} from './xinjiang-range.js';
import {regionBoundary} from './region-boundary.js';

// This layer is built once and reused. Labels follow sphere depth and camera;
// rotating to the far hemisphere hides its labels rather than showing through it.
export function installWorldAtlas({viewport,planet,onSelect}){
 const root=new THREE.Group();root.name='world-knowledge-atlas';root.visible=false;
 const host=document.createElement('div');host.className='world-atlas-labels';host.hidden=true;host.setAttribute('aria-label','地球上的可探索方位与地理参照');viewport.querySelector('.workbench').append(host);
 const leader=document.createElementNS('http://www.w3.org/2000/svg','svg');leader.classList.add('wa-leaders');leader.setAttribute('aria-hidden','true');host.append(leader);
 const countryLayer=installCountryLayer(root),countryOptions={borders:new URL(location.href).searchParams.get('worldBorders')!=='0',names:new URL(location.href).searchParams.get('worldNames')!=='0',tint:new URL(location.href).searchParams.get('worldTint')!=='0',detail:new URL(location.href).searchParams.get('worldDetail')==='1'};
 const key=document.createElement('div');key.className='wa-country-key';host.append(key);
 const pinGeo=new THREE.SphereGeometry(.034,10,8),pinMat=new THREE.MeshBasicMaterial({color:0xb3d7d0});
 const range=createXinjiangRange((lon,lat,lift)=>new THREE.Vector3(...globePosition(lon,lat,3.225+lift)),{fillOpacity:.18});root.add(range);
 const tags=[],groups=new Map(),routes=[],flowObjects=[],fading=new Map();let sortedTags=[],selectedCountryId='',approach=null,lastScale='';const eyeNormal=new THREE.Vector3();let topic='position',selected='xinjiang',running=true,time=0,progress=.08,earth,savedGrid,savedFill,savedOutline,savedRing,surface,savedSurface;
 const g=name=>{const child=new THREE.Group();root.add(child);groups.set(name,child);return child;};
 const position=g('position'),neighbors=g('neighbors'),relief=g('relief'),coordinates=g('coordinates'),connections=g('connections'),climate=g('climate'),exchange=g('exchange'),grid=g('overview-grid');
 const polyline=(points,color,parent,opacity=.65)=>{const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(line);return line;};
 for(const lat of [-60,-30,0,30,60])polyline(Array.from({length:181},(_,i)=>globePosition(i*2-180,lat,3.235)),0x86b7c0,grid,.18);
 for(let lon=-180;lon<180;lon+=30)polyline(Array.from({length:91},(_,i)=>globePosition(lon,i*2-90,3.235)),0x86b7c0,grid,.12);
 const tag=(item,modes,{quiet=false,action=item.id}={})=>{
  const p=new THREE.Vector3(...globePosition(item.lon,item.lat,3.26)),button=document.createElement('button');button.className='wa-label wa-'+item.kind+(quiet?' wa-quiet':'');button.textContent=item.name+(item.id==='xinjiang'?' ↗':'');button.setAttribute('aria-label','地球参照：'+item.name);button.dataset.waAnchor=action;host.append(button);
  if(item.kind==='continent'){button.dataset.waContinent=item.id;const english={asia:'ASIA',europe:'EUROPE',africa:'AFRICA',northAmerica:'NORTH AMERICA',southAmerica:'SOUTH AMERICA',oceania:'OCEANIA',eurasia:'EURASIA'};button.innerHTML='<span>'+item.name+'</span><small>'+english[item.id]+'</small>';}
  if(item.id==='xinjiang')button.innerHTML='<span>新疆 ↗</span><small>中国西北 · 目标范围</small>';
  const lead=document.createElementNS('http://www.w3.org/2000/svg','line');leader.append(lead);
  const dot=['boundary-country','continent','ocean','subregion'].includes(item.kind)?null:new THREE.Mesh(pinGeo,pinMat);if(dot){dot.position.copy(p);root.add(dot);}tags.push({item,p,normal:p.clone().normalize(),button,lead,dot,modes,quiet,offset:null});
 };
 for(const item of worldAnchors){
  if(['country','neighbor'].includes(item.kind))continue;
  const modes=['region','continent','ocean','subregion'].includes(item.kind)?['position','neighbors','relief','coordinates','connections','scale','climate','exchange']:['beijing','xian','lanzhou','urumqi'].includes(item.id)?['position','connections','coordinates','scale']:comparisonCities.includes(item.id)?['connections']:[];
  if(modes.length)tag(item,modes,{quiet:['continent','ocean'].includes(item.kind)});
 }
 for(const item of countryCatalog)tag({...item,kind:'boundary-country'},['position','neighbors','relief','coordinates','connections','scale','climate','exchange']);
 for(const band of mountainBands){
  const pts=[];for(let i=0;i<band.points.length-1;i++)for(let j=0;j<15;j++){const t=j/15;pts.push(globePosition(THREE.MathUtils.lerp(band.points[i][0],band.points[i+1][0],t),THREE.MathUtils.lerp(band.points[i][1],band.points[i+1][1],t),3.255));}
  pts.push(globePosition(...band.points.at(-1),3.255));polyline(pts,0xcab792,relief,.9);polyline(pts,0xcab792,climate,.7);
  const p=band.points[Math.floor(band.points.length/2)];tag({...band,lon:p[0],lat:p[1],kind:'mountain'},['relief'],{action:'map-relief:'+band.id});
 }
 for(const item of [{id:'junggar',name:'准噶尔盆地',lon:86.2,lat:45.4},{id:'tarim',name:'塔里木盆地',lon:82.7,lat:39.3}])tag({...item,kind:'basin'},['relief'],{action:'map-relief:'+item.id});
 // Denser grid and one selected city's coordinate lines share the same sphere.
 for(let lat=-60;lat<=60;lat+=15)polyline(Array.from({length:181},(_,i)=>globePosition(i*2-180,lat,3.236)),lat===0?0xc6b287:0x7aabae,coordinates,lat===0?.55:.21);
 for(let lon=-180;lon<180;lon+=15)polyline(Array.from({length:91},(_,i)=>globePosition(lon,i*2-90,3.237)),0x7aabae,coordinates,.2);
 const u=worldAnchor('urumqi');
 const beltGeo=new THREE.BufferGeometry();beltGeo.setAttribute('position',new THREE.Float32BufferAttribute(latitudeBelt(),3));coordinates.add(new THREE.Mesh(beltGeo,new THREE.MeshBasicMaterial({color:0xb19c6a,transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide})));
 polyline(Array.from({length:181},(_,i)=>globePosition(i*2-180,0,3.25)),0xe6c896,coordinates,.65);
 tag({id:'equator',name:'赤道 · 0°',lon:65,lat:0,kind:'coordinate'},['coordinates'],{action:'coordinates'});
 tag({id:'midlatitude',name:'北半球 · 中纬度',lon:44,lat:37,kind:'coordinate'},['coordinates'],{action:'coordinates'});
 polyline(Array.from({length:181},(_,i)=>globePosition(i*2-180,u.lat,3.26)),0xe4c790,coordinates,.82);
 polyline(Array.from({length:91},(_,i)=>globePosition(u.lon,i*2-90,3.262)),0x9cdbd3,coordinates,.82);
 for(const item of [{id:'latitude',name:'43.82° N · 纬线',lon:49,lat:u.lat},{id:'longitude',name:'87.62° E · 经线',lon:u.lon,lat:8}])tag({...item,kind:'coordinate'},['coordinates'],{action:'urumqi'});
 for(const id of comparisonCities){const dest=worldAnchor(id),pts=Array.from({length:81},(_,i)=>comparisonArc(u,dest,i/80)),line=polyline(pts,0xcbbda0,connections,.28),dot=new THREE.Mesh(pinGeo,new THREE.MeshBasicMaterial({color:0xf2d295}));connections.add(dot);routes.push({id,line,dot,dest});}
 const trailGeo=new THREE.SphereGeometry(.024,8,6),arrowGeo=new THREE.ConeGeometry(.045,.14,8);
 for(const [id,config]of Object.entries(earthFlows)){
  const parent=groups.get(id),paths=[];
  for(const spec of id==='climate'?[-2,0,2].map(offset=>({points:config.points,offset})): [{points:config.points,offset:0},...(config.branches??[]).map(points=>({points,offset:0,branch:true}))]){
   const pts=flowSamples(spec.points,180,spec.offset),vectors=pts.map(p=>new THREE.Vector3(...p));
   polyline(pts,config.color,parent,.16);
   const curve=new THREE.CatmullRomCurve3(vectors),geometry=new THREE.TubeGeometry(curve,180,id==='climate'?.018:.022,6,false),material=new THREE.MeshBasicMaterial({color:config.color,transparent:true,opacity:id==='climate'?.72:.9,toneMapped:false});
   const ribbon=new THREE.Mesh(geometry,material);parent.add(ribbon);
   const beads=Array.from({length:16},()=>{const dot=new THREE.Mesh(trailGeo,new THREE.MeshBasicMaterial({color:config.color,transparent:true,opacity:.9}));parent.add(dot);return dot;});
   const arrow=new THREE.Mesh(arrowGeo,new THREE.MeshBasicMaterial({color:config.color}));parent.add(arrow);paths.push({vectors,ribbon,beads,arrow,branch:spec.branch});
  }
  for(const [index,[name,lon,lat]]of config.labels.entries())tag({id:id+'-'+name,name,lon,lat,kind:id==='climate'?'air':'exchange'},[id],{action:id+':'+index});
  flowObjects.push({id,paths});
 }
 const locator=new THREE.Mesh(new THREE.TorusGeometry(.12,.009,8,64),new THREE.MeshBasicMaterial({color:0xf3d6a2,transparent:true,opacity:.7}));locator.position.fromArray(globePosition(84,43,3.27));locator.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),locator.position.clone().normalize());root.add(locator);
 host.addEventListener('click',e=>{const b=e.target.closest('button');if(b)onSelect(b.dataset.waAnchor);});
 function previewCountry(id){const c=countryCatalog.find(c=>c.id===id);countryLayer.preview(c?.id);viewport.dataset.worldPreview=c?.id??'';key.querySelector('strong').textContent=c?'预览 / '+c.name+' · 点击定位':key.dataset.selection;}
 host.addEventListener('pointerover',e=>{const b=e.target.closest('.wa-boundary-country');if(b&&approach===null)previewCountry(b.dataset.waAnchor);});
 host.addEventListener('pointerout',e=>{if(e.target.closest('.wa-boundary-country')&&!e.relatedTarget?.closest?.('.wa-boundary-country'))previewCountry(null);});
 host.addEventListener('focusin',e=>{const b=e.target.closest('.wa-boundary-country');if(b&&approach===null)previewCountry(b.dataset.waAnchor);});
 host.addEventListener('focusout',()=>previewCountry(null));
 function resetFade(){approach=null;host.style.opacity='1';host.style.pointerEvents='';host.classList.remove('wa-approaching');for(const [m,s]of fading){m.opacity=s.opacity;m.transparent=s.transparent;m.needsUpdate=true;}fading.clear();delete viewport.dataset.worldHandoff;}
 function beginApproach(){resetFade();previewCountry(null);approach=0;host.classList.add('wa-approaching');root.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){if(fading.has(m))continue;fading.set(m,{opacity:m.opacity,transparent:m.transparent});m.transparent=true;m.needsUpdate=true;}});}
 const projected=new THREE.Vector3(),eye=new THREE.Vector3(),extentProjection=new THREE.Vector3(),rangePoints=regionBoundary.map(p=>new THREE.Vector3(...globePosition(...p,3.234)));
 function set(next,anchor='xinjiang'){
  resetFade();topic=next;selected=anchor;lastScale='';countryLayer.set(anchor,{...countryOptions,relief:topic==='relief',regionTarget:anchor==='xinjiang'});const selectedCountry=countryForAnchor(anchor);selectedCountryId=anchor==='xinjiang'?'':selectedCountry?.id??'';key.innerHTML='<b data-wa-scale></b><span>金边 · 当前范围　浅线 · 国家参照</span><strong>'+(anchor==='xinjiang'?'正在观察 / 新疆 · 中国西北':selectedCountry?'正在观察 / '+selectedCountry.name:'大洲与海洋 · 点名称定位')+'</strong><small>洲名分色 · 青色预览 · 虚线为未定段</small>';key.dataset.selection=key.querySelector('strong').textContent;viewport.dataset.worldPreview='';viewport.dataset.worldDetail=String(countryOptions.detail);viewport.dataset.worldCountry=selectedCountry?.id??'';viewport.dataset.worldCountryCount=String(countryLayer.count);viewport.dataset.worldBorders=String(countryOptions.borders);viewport.dataset.worldNames=String(countryOptions.names);viewport.dataset.worldTint=String(countryOptions.tint);earth=planet();if(!earth)return;
  if(root.parent!==earth){savedGrid=earth.userData.grid.visible;savedFill=earth.userData.footprint?.visible;savedOutline=earth.userData.footprintOutline?.visible;savedRing=earth.userData.locatingRing?.visible;surface=earth.children.find(o=>o.material?.map&&o.geometry?.type==='SphereGeometry')?.material;if(surface)savedSurface={emissive:surface.emissive.clone(),map:surface.emissiveMap,intensity:surface.emissiveIntensity};earth.add(root);}earth.userData.grid.visible=false;
  if(surface){surface.emissiveMap=surface.map;surface.emissive.setHex(0xa9b1b5);surface.emissiveIntensity=.35;surface.needsUpdate=true;}
  if(earth.userData.footprint)earth.userData.footprint.visible=false;
  if(earth.userData.footprintOutline)earth.userData.footprintOutline.visible=false;
  range.visible=anchor==='xinjiang';locator.visible=anchor==='xinjiang';viewport.dataset.xinjiangRange=String(range.visible);
  if(earth.userData.locatingRing)earth.userData.locatingRing.visible=false;
  earth.userData.worldAtlasActive=true;earth.userData.atlasRangeRestore={fill:savedFill,outline:savedOutline};root.visible=true;host.hidden=false;viewport.dataset.worldTopic=topic;viewport.dataset.worldAnchor=selected;viewport.dataset.worldArcPhase=String(time);
  for(const [name,group]of groups)group.visible=name===topic||(topic==='scale'&&name==='position')||(name==='overview-grid'&&topic!=='coordinates');
  for(const t of tags){if(t.dot){t.dot.visible=t.modes.includes(topic);t.dot.scale.setScalar(t.item.id===selected||t.item.id==='xinjiang'?1.2:['mountain','basin'].includes(t.item.kind)?.55:.75);}t.button.hidden=true;t.lead.style.display='none';t.offset=null;t.button.classList.toggle('wa-selected',t.item.id===selected);if(t.item.id==='xinjiang'){t.button.classList.toggle('wa-reference',selected!=='xinjiang');t.button.querySelector('small').textContent=selected==='xinjiang'?'中国西北 · 目标范围':'中国西北 · 方位参照';}}sortedTags=tags.filter(t=>t.modes.includes(topic));
  for(const r of routes){const active=r.id===selected;r.line.material.opacity=active?.95:.19;r.line.material.color.setHex(active?0xe7c88c:0x839e9d);r.dot.visible=active;}
 }
 return {set,beginApproach,settings:countryOptions,configure(key){if(key in countryOptions){countryOptions[key]=!countryOptions[key];set(topic,selected);}},setProgress(value){progress=Math.max(0,Math.min(1,value));},setRunning(value){running=value;},hide(){resetFade();root.visible=false;host.hidden=true;if(earth){earth.userData.worldAtlasActive=false;earth.userData.grid.visible=savedGrid??true;if(earth.userData.footprint)earth.userData.footprint.visible=savedFill??true;if(earth.userData.footprintOutline)earth.userData.footprintOutline.visible=savedOutline??true;if(earth.userData.locatingRing)earth.userData.locatingRing.visible=savedRing??true;}if(surface&&savedSurface){surface.emissive.copy(savedSurface.emissive);surface.emissiveMap=savedSurface.map;surface.emissiveIntensity=savedSurface.intensity;surface.needsUpdate=true;}for(const key of ['worldScale','xinjiangRange','worldTopic','worldLabelCount','worldAnchor','worldComparison','worldRunning','worldFlowProgress','worldCountry','worldCountryCount','worldBorders','worldNames','worldTint','worldCountryLabels','worldLabelBudget','worldDetail','worldPreview'])delete viewport.dataset[key];},update(camera,dt,showMarkers=true){
  if(!root.visible)return;if(running)time+=Math.min(.1,dt);if(approach!==null){approach+=Math.min(.1,dt);const fade=worldHandoffFrame(approach);host.style.opacity=String(fade.labels);for(const [m,s]of fading)m.opacity=s.opacity*fade.surface;viewport.dataset.worldHandoff=fade.surface.toFixed(3);}
  for(const r of routes)if(r.dot.visible)r.dot.position.fromArray(comparisonArc(worldAnchor('urumqi'),r.dest,(time*.08)%1));
  locator.scale.setScalar(1+(running?Math.sin(time*1.6)*.11:0));
  for(const flow of flowObjects)if(flow.id===topic)for(const path of flow.paths){
   const phase=path.branch?Math.max(0,Math.min(1,(progress-.3)/.7)):progress,index=Math.min(180,Math.floor(phase*180));path.ribbon.geometry.setDrawRange(0,index*36);
   for(let i=0;i<path.beads.length;i++){const t=Math.max(0,phase-i*.006),j=Math.min(180,Math.floor(t*180));path.beads[i].visible=t>0;path.beads[i].position.copy(path.vectors[j]);path.beads[i].scale.setScalar(1.8-i*.06);}
   path.arrow.visible=index>1;path.arrow.position.copy(path.vectors[index]);const tangent=path.vectors[index].clone().sub(path.vectors[Math.max(0,index-1)]).normalize();path.arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent);
  }
  viewport.dataset.worldFlowProgress=progress.toFixed(3);
  const canvas=viewport.querySelector('#canvas-host'),w=canvas.clientWidth,h=canvas.clientHeight;
  host.style.top=(canvas.getBoundingClientRect().top-viewport.querySelector('.workbench').getBoundingClientRect().top)+'px';host.style.width=w+'px';host.style.height=h+'px';leader.setAttribute('viewBox',`0 0 ${w} ${h}`);
  earth.updateWorldMatrix(true,false);eye.copy(camera.position);earth.worldToLocal(eye);eyeNormal.copy(eye).normalize();
  const scale=cartographicScale(eye.length(),w/h);viewport.dataset.worldScale=scale;
  if(scale!==lastScale){lastScale=scale;host.dataset.scale=scale;key.querySelector('[data-wa-scale]').textContent=scaleReading[scale];for(const t of tags)t.offset=null;sortedTags.sort((a,b)=>atlasLabelPriority(b.item,{selected,scale})-atlasLabelPriority(a.item,{selected,scale}));}
  const rangeBox={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
  if(selected==='xinjiang')for(const p of rangePoints){extentProjection.copy(p);earth.localToWorld(extentProjection);extentProjection.project(camera);const x=(extentProjection.x+1)*w/2,y=(1-extentProjection.y)*h/2;rangeBox.left=Math.min(rangeBox.left,x);rangeBox.right=Math.max(rangeBox.right,x);rangeBox.top=Math.min(rangeBox.top,y);rangeBox.bottom=Math.max(rangeBox.bottom,y);}
  const director=viewport.classList.contains('director-active'),reading=director?JSON.parse(viewport.dataset.directorTargets||'[]'):[],canvasRect=canvas.getBoundingClientRect(),selectedCountry=selectedCountryId;
  const blocked=[director?'.ed-heading':'.kg-heading',director?'.ed-bottom':'.wa-intro-dock',director?'.ed-card':'.kg-nav','.wa-country-key','.wb-camera'].map(selector=>viewport.querySelector(selector)?.getBoundingClientRect()).filter(r=>r?.width&&r.height).map(r=>({x:r.left-canvasRect.left+r.width/2,y:r.top-canvasRect.top+r.height/2,w:r.width,h:r.height}));
  const speechTime=Number(viewport.dataset.directorTime)||0;range.children.find(o=>o.name==='xinjiang-range-fill').material.opacity=director&&selected==='xinjiang'?.28+.025*Math.sin(speechTime*1.5):.18;
  sortedTags.sort((a,b)=>(director?Number(reading.includes(b.item.id))-Number(reading.includes(a.item.id)):0)||atlasLabelPriority(b.item,{selected,scale})-atlasLabelPriority(a.item,{selected,scale}));
  for(const t of tags)t.button.classList.toggle('ed-reading',reading.includes(t.item.id));
  const occupied=[],budget=Math.min(countryLabelBudget(w,h,{detail:countryOptions.detail,topic}),scale==='planet'&&!countryOptions.detail?6:36);let count=0,countryCount=0;viewport.dataset.worldLabelBudget=String(budget);
  for(const t of sortedTags){
   projected.copy(t.p);earth.localToWorld(projected);projected.project(camera);
   const x=(projected.x+1)/2*w,y=(1-projected.y)/2*h,front=t.normal.dot(eyeNormal)>3.20/eye.length();
   const country=t.item.kind==='boundary-country',eligible=atlasLabelEligible(t.item,{selected,scale,topic,detail:countryOptions.detail})&&(!country||countryOptions.names&&countryLabelEligible(t.item,{distance:eye.length(),width:w,selected:selectedCountry,topic}));
   let visible=eligible&&(!country||countryCount<budget)&&showMarkers&&t.modes.includes(topic)&&front&&projected.z>-1&&projected.z<1&&x>10&&x<w-10&&y>35&&y<h-55,chosen;
   t.button.hidden=!visible;if(t.dot)t.dot.visible=visible;t.button.classList.toggle('wa-selected',t.item.id===(country?selectedCountry:selected));
   if(visible){
    const bw=t.button.offsetWidth,bh=t.button.offsetHeight;
    const target=t.item.id==='xinjiang'&&selected==='xinjiang';
    const offsets=target?[[0,rangeBox.top-y-bh/2-13],[rangeBox.right-x+bw/2+13,0],[rangeBox.left-x-bw/2-13,0],[0,rangeBox.bottom-y+bh/2+13]]:country?[[0,0],[0,22],[0,-22],[-55,0],[55,0],[-75,30],[75,30],[-55,-34],[55,-34],[-115,-20],[-120,25],[-100,65],[100,-65],[-50,85]]:t.quiet?[[0,-12],[0,14],[0,-35]]:[[0,-18],[0,20],[-65,-8],[65,-8],[-90,28],[90,28],[-70,-48],[70,-48],[0,58]];
    for(const [dx,dy]of !target&&t.offset?[t.offset,...offsets]:offsets){const xx=Math.min(w-bw/2-12,Math.max(bw/2+12,x+dx)),yy=y+dy,rect={x:xx,y:yy,w:bw,h:bh};if(target&&xx+bw/2>rangeBox.left-6&&xx-bw/2<rangeBox.right+6&&yy+bh/2>rangeBox.top-6&&yy-bh/2<rangeBox.bottom+6)continue;if(yy-bh/2<48||yy+bh/2>h-22||blocked.some(r=>Math.abs(xx-r.x)<(bw+r.w)/2+7&&Math.abs(yy-r.y)<(bh+r.h)/2+7))continue;if(!occupied.some(r=>Math.abs(xx-r.x)<(bw+r.w)/2+5&&Math.abs(yy-r.y)<(bh+r.h)/2+5)){chosen=rect;t.offset=[dx,dy];break;}}
    visible=!!chosen;if(chosen){occupied.push(chosen);t.button.style.left=chosen.x+'px';t.button.style.top=chosen.y+'px';for(const [key,value]of Object.entries({x1:x,y1:y,x2:chosen.x,y2:chosen.y}))t.lead.setAttribute(key,value);count++;if(country)countryCount++;}
   }
   t.button.hidden=!visible;t.lead.style.display=visible&&!t.quiet&&(!country||Math.hypot(chosen.x-x,chosen.y-y)>14)?'':'none';
  }
  viewport.dataset.worldCountryLabels=String(countryCount);viewport.dataset.worldLabelCount=String(count);viewport.dataset.worldRunning=String(running);viewport.dataset.worldComparison=topic==='connections'?selected:'';viewport.dataset.worldArcPhase=time.toFixed(3);
 }};
}
