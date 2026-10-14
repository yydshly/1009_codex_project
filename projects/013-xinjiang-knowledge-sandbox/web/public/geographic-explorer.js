import * as THREE from 'three';
import {terrainPoint,terrainDimensions} from './geo.js';
import {regionBoundary} from './region-boundary.js';
import {reliefNames} from './region-atlas-content.js';
import {passageRoutes,passageStops,passageSteps,reliefSection,turpanSection,elevationProfile} from './passage-data.js';

export function installGeographicExplorer({scene,viewport,dem,adapter}){
 const shell=viewport.querySelector('.workbench'),root=document.createElement('section');
 root.className='geographic-explorer';root.hidden=true;root.setAttribute('aria-label','山河与通道交互探索');shell.append(root);
 const pins=document.createElement('div');pins.className='gx-pins';shell.append(pins);
 const layer=new THREE.Group();layer.name='geographic-question';layer.visible=false;scene.add(layer);
 const dimensions=terrainDimensions(dem),projected=new THREE.Vector3();
 let active=false,step=0,route='oasis',cursor=.0,tracing=false,markers=[],traceLine=null,traveller=null,profile=null,height=adapter.height(),arrival=null,mapView=null,cutaway=true,flow=65;
 const profiles={direct:elevationProfile(dem,passageRoutes.direct.points),oasis:elevationProfile(dem,passageRoutes.oasis.points),relief:elevationProfile(dem,reliefSection),place:elevationProfile(dem,turpanSection)};
 const point=(lon,lat,lift=.06)=>{const p=new THREE.Vector3(...terrainPoint(dem,lon,lat,adapter.height(),dimensions));p.y+=lift;return p;};
 function release(){const mats=new Set(),geos=new Set();layer.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());layer.clear();pins.replaceChildren();markers=[];traceLine=null;traveller=null;}
 function line(samples,color,opacity=1){const pts=samples.map(s=>point(s.lon,s.lat));const g=new THREE.BufferGeometry().setFromPoints(pts);const m=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthTest:false,depthWrite:false});const o=new THREE.Line(g,m);o.renderOrder=4;layer.add(o);return o;}
 function pin(name,lon,lat,action,color=0xb8e1d5,quiet=false){
  const position=point(lon,lat,.13),b=document.createElement('button');b.textContent=name;b.className=quiet?'gx-label':'gx-place-pin';b.dataset.gxPin=action;b.setAttribute('aria-label',quiet?'观察'+name:'靠近'+name);pins.append(b);
  if(!quiet){const dot=new THREE.Mesh(new THREE.SphereGeometry(.048,12,8),new THREE.MeshBasicMaterial({color,transparent:true,depthTest:false,depthWrite:false}));dot.position.copy(position);dot.renderOrder=5;layer.add(dot);}
  markers.push({button:b,position});
 }
 function build(){
  release();height=adapter.height();layer.visible=active&&step>0;pins.hidden=!layer.visible;if(!layer.visible)return;
  if(step===4){for(const [name,p,key]of [['竖井 · 开挖与维护',[-4.35,3,.43],'shaft'],['暗渠 · 地下输水',[-.8,.5,.63],'channel'],['出口 · 接入地表',[5.5,.3,.63],'outlet']]){if(key==='channel'&&!cutaway)continue;const b=document.createElement('button');b.className='gx-place-pin';b.dataset.gxModelPin=key;b.textContent=name;b.setAttribute('aria-label','观察'+name);pins.append(b);markers.push({button:b,position:new THREE.Vector3(...p)});}return;}
  const boundary=[],[w,s,e,n]=dem.bounds,inside=p=>p[0]>=w&&p[0]<=e&&p[1]>=s&&p[1]<=n;
  for(let i=1;i<regionBoundary.length;i++)if(inside(regionBoundary[i-1])&&inside(regionBoundary[i]))boundary.push(point(...regionBoundary[i-1]),point(...regionBoundary[i]));
  const outline=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(boundary),new THREE.LineBasicMaterial({color:0xcbd6c5,transparent:true,opacity:.55,depthTest:false,depthWrite:false}));outline.renderOrder=2;layer.add(outline);
  if(step===1){for(const [name,lon,lat]of reliefNames)pin(name,lon,lat,'relief',0xb8e1d5,true);profile=profiles.relief;line(profile.samples,0xe9eee7);pin('取样起点 · 南',87.5,36.2,'relief');pin('取样终点 · 北',87.5,48.5,'relief');}
  if(step===2){line(profiles[route==='direct'?'oasis':'direct'].samples,0x94a0a3,.27);profile=profiles[route];traceLine=line(profile.samples,route==='direct'?0xe5e3cc:0xe6bc79);for(const p of passageStops)pin(p.name,p.lon,p.lat,p.name==='喀什'?'kashgar':'passage',0xe6bc79);pin('吐鲁番 · 水与聚落',89.19,42.95,'place',0x8edbd9);traveller=new THREE.Mesh(new THREE.SphereGeometry(.07,16,8),new THREE.MeshBasicMaterial({color:0xfef2cc,transparent:true,depthTest:false,depthWrite:false}));traveller.renderOrder=6;layer.add(traveller);}
  if(step===3){profile=profiles.place;line(profile.samples,0x91dddf);pin('天山侧 · 取样起点',88.2,44,'mountain',0x91dddf);pin('吐鲁番 · 进入水路模型',89.19,42.95,'model',0x91dddf);}
  updateTrace();
 }
 function profileHTML(p){
  const lo=Math.min(0,Math.floor(p.min/1000)*1000),hi=Math.max(lo+1000,Math.ceil(p.max/1000)*1000),x=s=>16+s.km/p.distance*308,y=s=>80-(s.height-lo)/(hi-lo)*64;
  const path=p.samples.map((s,i)=>(i?'L':'M')+x(s).toFixed(1)+','+y(s).toFixed(1)).join(' ');
  return `<div class="gx-profile"><div><b>沿地图取样线的高程</b><span>约 ${Math.round(p.distance)} km · 上限 ${hi.toLocaleString()} m</span></div><svg viewBox="0 0 340 102" role="img" aria-label="高程剖面，最低约${Math.round(p.min)}米，最高约${Math.round(p.max)}米"><path class="gx-profile-grid" d="M16 16H324 M16 80H324"/><path class="gx-profile-area" d="${path} L324 80 L16 80Z"/><path class="gx-profile-line" d="${path}"/><line class="gx-profile-cursor" x1="16" x2="16" y1="12" y2="83"/><text x="16" y="98">0 km</text><text x="278" y="98">${Math.round(p.distance)} km</text></svg><small>公开区域 DEM 取样；线为教学几何，高程不等于可通行性。</small></div>`;
 }
 function modelResponse(){return `${flow===0?'来水为零，水流标记停止。':adapter.running()?'水流标记正在沿暗渠向出口移动。':'动画已暂停，可静看当前结构。'}${cutaway?'地下剖面已展开。':'地表覆盖暗渠。'}`;}
 function render(){
  const s=passageSteps[step];viewport.dataset.exploreStep=s.id;viewport.dataset.exploreRoute=route;viewport.dataset.exploreTrace=String(tracing);
  root.innerHTML=`<nav class="gx-steps" aria-label="山河与通道探索步骤">${passageSteps.map((s,i)=>`<button data-gx-step="${i}" aria-current="${step===i?'step':'false'}"><span>0${i+1}</span>${s.label}</button>`).join('')}<button data-gx-action="exit" class="gx-exit">全部主题 ↗</button></nav><div class="gx-heading"><p>新疆 · 山河与通道</p><h1>${s.title}</h1><span>${step===0?'欧亚大陆 / 中国西北':step===4?'吐鲁番 / 通用工程结构':'区域高程 × 历史地理'}</span></div><section class="gx-question"><div class="gx-copy"><p class="gx-kicker">0${step+1} / ${s.label}</p><h2>${s.actionTitle}</h2><p>${s.copy}</p>${step===2?`<div class="gx-choices" role="group" aria-label="比较教学通道"><button data-gx-route="direct" aria-pressed="${route==='direct'}">直线跨盆地</button><button data-gx-route="oasis" aria-pressed="${route==='oasis'}">沿盆地边缘</button></div><p class="gx-observation" role="status">${route==='direct'?'直线缩短几何距离；无法单凭长度判断补给与通行。':'边缘线串起地域参照，长度增加；需要继续看水与聚落怎样支持联系。'}</p><button class="gx-event-open" data-gx-action="event">展开张骞出使事件 ↗</button>`:''}${step===4?`<div class="gx-model-controls"><label><input data-gx-cut type="checkbox" ${cutaway?'checked':''}> 展开地下剖面</label><label>来水强度 <output aria-label="当前来水强度">${flow}%</output><input data-gx-flow type="range" min="0" max="100" step="1" value="${flow}" aria-label="探索模型来水强度"></label><button data-gx-action="water">${adapter.running()?'暂停':'启动'}水路动画</button><p role="status" class="gx-model-response">${modelResponse()}</p></div>`:''}</div>${step>0&&step<4?profileHTML(profile):`<div class="gx-world-note"><b>${step===0?'从整体到地点':'回到地图，把结构放回地理'}</b><p>${step===0?'地球 → 三山两盆 → 历史通道 → 吐鲁番 → 水路结构':'这次观察把山地、通道、聚落和用水工程连起来。可以返回任一步，也可以继续原有事件与场景。'}</p></div>`}<div class="gx-actions">${step===0?'<button data-gx-action="locate">定位新疆 ⌖</button>':''}${step===1?'<button data-gx-action="side">侧看地形</button><button data-gx-action="top">俯看格局</button>':''}${step===2?`<button data-gx-action="trace">${tracing?'暂停沿线观察':'沿线观察'}</button><label class="gx-trace-range">观察位置 <input aria-label="通道观察位置" data-gx-cursor type="range" min="0" max="100" value="${Math.round(cursor*100)}"></label><output class="gx-trace-readout" aria-label="取样位置高程"></output>`:''}${step===3?'<button data-gx-action="near">靠近吐鲁番</button>':''}${step===4?'<button data-gx-step="3">← 返回地点地图</button>':''}<button class="gx-primary" data-gx-action="next">${s.next} →</button><details class="gx-sources"><summary>依据与地图说明</summary><p>地形来自区域公开DEM与NASA 2004年6月500米影像；显示高度夸张，近景使用同一份区域数据。路线和取样线为教学示意。吐鲁番模型解释工程原理，不指定建造年代，也不当作张骞停驻或建造的证据。</p><a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/" target="_blank" rel="noopener noreferrer">NASA · 地形影像 ↗</a><a href="https://whc.unesco.org/en/list/1442/" target="_blank" rel="noopener noreferrer">UNESCO · 长安—天山廊道 ↗</a><a href="https://whc.unesco.org/en/tentativelists/5347/" target="_blank" rel="noopener noreferrer">UNESCO · 坎儿井 ↗</a></details></div></section><span class="gx-help">随时拖动环视 · 滚轮缩放 · 点上方步骤返回</span>`;
  updateTrace();
 }
 function url(){const u=new URL(location.href);if(active){u.searchParams.set('explore','passage');u.searchParams.set('exploreStep',passageSteps[step].id);u.searchParams.set('exploreRoute',route);}else for(const k of ['explore','exploreStep','exploreRoute'])u.searchParams.delete(k);history.replaceState(null,'',u);}
 function go(index,{restore=false}={}){
  const old=step;if(active&&old===2)mapView=adapter.read();arrival=null;adapter.cancel();tracing=false;step=Math.max(0,Math.min(4,index));active=true;root.hidden=false;viewport.classList.add('gx-active');
  // Layout must be active before camera fitting and before projected labels update.
  build();const completed=()=>{arrival=null;viewport.dataset.exploreMotion='settled';};
  viewport.dataset.exploreMotion='moving';
  if(step===0)adapter.scene('earth',{overview:true,onArrive:completed});
  else if(step===1)adapter.scene('terrain',{overview:true,onArrive:completed,bridge:old===0});
  else if(step===2)adapter.scene('terrain',restore&&mapView?{restore:mapView,onArrive:completed}:{overview:true,onArrive:completed});
  else if(step===3){arrival=completed;adapter.scene('terrain',{focus:[89.19,42.95],distance:6,onArrive:completed});}
  else{adapter.scene('karez',{overview:true,scaleHandoff:old===3,onArrive:completed});adapter.model({cutaway,flow,playing:true});}
  adapter.hideMap();render();url();adapter.resize();
 }
 function enter(){go(0);}
 function stop(navigate=true){if(!active)return;active=false;arrival=null;tracing=false;adapter.cancel();adapter.model({playing:false});release();layer.visible=false;pins.hidden=true;root.hidden=true;viewport.classList.remove('gx-active');viewport.querySelector('.wb-camera').style.bottom='';delete viewport.dataset.exploreStep;delete viewport.dataset.exploreRoute;delete viewport.dataset.exploreMotion;delete viewport.dataset.exploreTrace;delete viewport.dataset.exploreSample;url();if(navigate)adapter.exit();adapter.resize();}
 function updateTrace(){
  if(step!==2||!profile)return;const idx=Math.min(profile.samples.length-1,Math.round(cursor*(profile.samples.length-1))),s=profile.samples[idx];
  if(traveller)traveller.position.copy(point(s.lon,s.lat,.16));
  const mark=root.querySelector('.gx-profile-cursor');if(mark){mark.setAttribute('x1',16+cursor*308);mark.setAttribute('x2',16+cursor*308);}
  const slider=root.querySelector('[data-gx-cursor]');if(slider)slider.value=Math.round(cursor*100);viewport.dataset.exploreSample=Math.round(s.height)+'m';
  const readout=root.querySelector('.gx-trace-readout');if(readout)readout.textContent='距起点 '+Math.round(s.km)+' km · 高程约 '+Math.round(s.height)+' m';
 }
 root.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;
  if(b.dataset.gxStep!==undefined){go(Number(b.dataset.gxStep),{restore:Number(b.dataset.gxStep)===2});return;}
  if(b.dataset.gxRoute){route=b.dataset.gxRoute;cursor=0;tracing=false;build();render();url();return;}
  const a=b.dataset.gxAction;if(a==='exit')stop();if(a==='event'){stop(false);adapter.event();}if(a==='locate')adapter.locate();if(a==='side')adapter.pose('side');if(a==='top')adapter.pose('top');if(a==='near')adapter.scene('terrain',{focus:[89.19,42.95],distance:6});
  if(a==='next'){if(step===0){adapter.locate(ok=>{if(ok&&active&&step===0)go(1);});}else go(step===4?2:step+1,{restore:step===4});}
  if(a==='trace'){if(cursor>=1)cursor=0;tracing=!tracing;render();}if(a==='water'){adapter.model({playing:!adapter.running()});render();}
 });
 root.addEventListener('input',ev=>{if(ev.target.hasAttribute('data-gx-cursor')){cursor=Number(ev.target.value)/100;tracing=false;updateTrace();const b=root.querySelector('[data-gx-action=trace]');if(b)b.textContent='沿线观察';viewport.dataset.exploreTrace='false';}if(ev.target.hasAttribute('data-gx-flow')){flow=Number(ev.target.value);adapter.model({flow});root.querySelector('.gx-model-controls output').textContent=flow+'%';}});
 root.addEventListener('change',ev=>{if(ev.target.hasAttribute('data-gx-cut')){cutaway=ev.target.checked;adapter.model({cutaway});build();render();}});
 pins.addEventListener('click',ev=>{const b=ev.target.closest('button'),a=b?.dataset.gxPin;if(b?.dataset.gxModelPin){const m=markers.find(m=>m.button===b);adapter.modelFocus(m.position.toArray());}if(a==='place')go(3);else if(a==='model')go(4);else if(a==='mountain')adapter.scene('terrain',{focus:[88.2,44],distance:7});else if(a==='kashgar')adapter.scene('terrain',{focus:[75.99,39.47],distance:7});else if(a==='relief')adapter.pose('side');});
 shell.addEventListener('click',ev=>{const target=ev.target.closest('button');if(!target)return;if(target.dataset.raAction==='sample'||target.id==='gx-open'){enter();return;}if(active&&(target.id==='hp-world'||target.dataset.wbScene||target.dataset.hpStage||target.dataset.hpEvent||target.dataset.hpResume))stop(false);},{capture:true});
 const entry=shell.querySelector('.ra-intro'),cta=document.createElement('button');cta.className='gx-entry-cta';cta.dataset.raAction='sample';cta.innerHTML='<small>推荐探索 · 地理与历史</small><strong>山河如何成为通道 <span>→</span></strong>';entry.append(cta);
 const header=document.createElement('button');header.id='gx-open';header.textContent='山河与通道';shell.querySelector('.wb-header nav').prepend(header);
 const params=new URL(location.href).searchParams;
 if(params.get('explore')==='passage'){route=params.get('exploreRoute')==='direct'?'direct':'oasis';const i=passageSteps.findIndex(s=>s.id===params.get('exploreStep'));go(Math.max(0,i));}
 return {get active(){return active;},enter,stop,update(camera,dt,showMarkers=true){
  if(!active)return;if(step===4){const m=adapter.modelState();if(m.cutaway!==cutaway||m.flow!==flow){cutaway=m.cutaway;flow=m.flow;build();render();}const button=root.querySelector('[data-gx-action=water]');if(button)button.textContent=(m.playing?'暂停':'启动')+'水路动画';const status=root.querySelector('.gx-model-response'),message=modelResponse();if(status&&status.textContent!==message)status.textContent=message;}if(height!==adapter.height())build();if(tracing){cursor=Math.min(1,cursor+dt/14);if(cursor>=1){tracing=false;render();}updateTrace();}
  const host=viewport.querySelector('#canvas-host'),w=host.clientWidth,h=host.clientHeight,heading=root.querySelector('.gx-heading').getBoundingClientRect(),question=root.querySelector('.gx-question').getBoundingClientRect();
  const controls=viewport.querySelector('.wb-camera'),bottom=Math.ceil(h+64-question.top+12)+'px';if(controls.style.bottom!==bottom)controls.style.bottom=bottom;
  for(const m of markers){projected.copy(m.position).project(camera);const x=(projected.x+1)/2*w,y=(1-projected.y)/2*h+64;const visible=showMarkers&&projected.z>-1&&projected.z<1&&x>40&&x<w-40&&y>150&&y<question.top-20&&!(x<heading.right+15&&y<heading.bottom+15);m.button.hidden=!visible;if(visible){m.button.style.left=x+'px';m.button.style.top=y+'px';}}
 }};
}
