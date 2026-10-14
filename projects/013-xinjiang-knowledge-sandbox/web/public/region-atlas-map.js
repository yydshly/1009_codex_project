import * as THREE from 'three';
import {regionBoundary} from './region-boundary.js';
import {atlasEntries,reliefNames,waterRelations} from './region-atlas-content.js';
import {routeCoordinates} from './exploration-journey.js';

// Rebuilt only when map view or height changes, using the existing DEM.
export function buildRegionAtlas({root,labels,point,dem,filter,onVisit,markers,event}){
 const within=([lon,lat])=>lon>=dem.bounds[0]&&lon<=dem.bounds[2]&&lat>=dem.bounds[1]&&lat<=dem.bounds[3];
 const outline=[];const unknown=[];
 for(let i=1;i<regionBoundary.length;i++){
  const a=regionBoundary[i-1],b=regionBoundary[i],steps=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.06));
  for(let j=0;j<steps;j++){const x=[a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps],y=[a[0]+(b[0]-a[0])*(j+1)/steps,a[1]+(b[1]-a[1])*(j+1)/steps];const p=point(...x),q=point(...y);p.y-=.11;q.y-=.11;if(within(x)&&within(y))outline.push(p,q);else{p.y=q.y=.08;unknown.push(p,q);}}
 }
 root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(outline),new THREE.LineBasicMaterial({color:0xf4e4b9,transparent:true,opacity:.9})));
 const dashed=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(unknown),new THREE.LineDashedMaterial({color:0xadb6ac,dashSize:.08,gapSize:.07,transparent:true,opacity:.65}));dashed.computeLineDistances();root.add(dashed);
 const addLabel=(title,sub,lon,lat,id,kind='geography',quiet=false)=>{
  const p=point(lon,lat),b=document.createElement('button');b.dataset.hpHub=id;b.dataset.kind=kind;b.classList.toggle('ra-relief-name',quiet);b.innerHTML=title+(sub?`<small>${sub}</small>`:'');b.addEventListener('click',()=>onVisit(id));labels.append(b);
  if(!quiet){const dot=new THREE.Mesh(new THREE.SphereGeometry(.07,10,6),new THREE.MeshBasicMaterial({color:kind==='history'?0xe3c786:kind==='water'?0x8fe0e0:0xbbe9c4}));dot.position.copy(p);root.add(dot);const ring=new THREE.Mesh(new THREE.TorusGeometry(.15,.012,5,24),new THREE.MeshBasicMaterial({color:dot.material.color}));ring.rotation.x=Math.PI/2;ring.position.copy(p);root.add(ring);}
  const entry=atlasEntries.find(e=>'atlas:'+e.id===id);markers.push({button:b,position:p.clone().add(new THREE.Vector3(0,quiet?.05:.25)),hub:id,quiet,observationKey:entry?.geo?'geo:'+entry.geo:entry?.event&&entry.place?'place:'+entry.event+':'+entry.place:id});
 };
 function path(coords,color){const vertices=[];for(let i=1;i<coords.length;i++){const a=coords[i-1],b=coords[i],steps=30;for(let j=0;j<steps;j++)vertices.push(point(a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps));}vertices.push(point(...coords.at(-1)));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices),new THREE.LineBasicMaterial({color,transparent:true,opacity:.95}));root.add(line);}
 if(filter==='geography'){
  for(const [name,lon,lat,kind]of reliefNames)addLabel(name,kind,lon,lat,'relief:'+name,'geography',true);
  for(const e of atlasEntries.filter(e=>e.kind==='nature'))addLabel(e.name,'走近观察 →',e.lon,e.lat,'atlas:'+e.id);
 }
 if(filter==='water'){
  for(const w of waterRelations){path(w.points,0x7dd5df);const p=w.points[Math.floor(w.points.length/2)];addLabel(w.name,'流域方向示意',...p,'basin:'+(w.name.startsWith('塔')?'tarim':'ili'),'water',true);}
  for(const e of atlasEntries.filter(e=>['glacier','turpan','ili'].includes(e.id)))addLabel(e.name,'地形与生活 →',e.lon,e.lat,'atlas:'+e.id,'water');
 }
 if(filter==='history'){
  const coords=routeCoordinates(event);if(coords.length>1)path(coords,event.id==='xibe'?0x9ed7cb:0xe5c77f);
  for(const n of event.nodes){const e=atlasEntries.find(e=>e.id===n.id);if(e)addLabel(e.name,n.id==='turpan'?'生活与工程延伸':event.short+' · 地点参照',e.lon,e.lat,'atlas:'+e.id,'history');}

 }

 if(filter==='all')for(const e of atlasEntries)addLabel(e.name,'查看地点 →',e.lon,e.lat,'atlas:'+e.id,e.kind==='history'?'history':e.kind==='water'?'water':'geography');
 let meshes=0;root.traverse(o=>{if(o.isMesh)meshes++;});return meshes;
}
