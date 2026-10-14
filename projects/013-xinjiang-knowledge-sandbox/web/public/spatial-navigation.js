import * as THREE from 'three';
import {terrainPoint,locatingFootprint} from './geo.js';
import {contextFor,scaleNames,regionLandmarks} from './spatial-spine.js';
import {atlasPlaces,itineraryFrame,placeFor} from './journey-memory.js';
const mapImage=typeof Image==='undefined'?null:new Image();if(mapImage)mapImage.src='./assets/xinjiang-blue-marble.jpg';
export function installSpatialNavigation({viewport,onEarth,onRegion,onVisit=()=>{}}){
 const root=document.createElement('aside');root.id='spatial-navigation';root.setAttribute('aria-label','当前空间尺度与位置');
 root.innerHTML='<nav><button data-spatial="earth">地球</button><span>›</span><button data-spatial="region">新疆 · 探索地图</button><span>›</span><b></b></nav><div class="spatial-position"><div class="journey-locator"><canvas width="264" height="140" aria-label="地点与旅程影像地图"></canvas><div class="journey-map-buttons"></div></div><div><small></small><strong></strong><p></p></div></div><div class="journey-receipt" aria-live="polite"></div><p class="spatial-leg" aria-label="这一次空间引导"></p>';
 viewport.append(root);root.querySelector('[data-spatial=earth]').addEventListener('click',onEarth);root.querySelector('[data-spatial=region]').addEventListener('click',onRegion);
 const labels=document.createElement('div');labels.id='spatial-landmarks';viewport.append(labels);
 const marks=regionLandmarks.map(([name,lon,lat])=>{const label=document.createElement('span');label.textContent=name;labels.append(label);return {name,lon,lat,label};});
 const buttons=atlasPlaces.map(p=>{const b=document.createElement('button');b.textContent=p.name;b.setAttribute('aria-label','旅程地图：'+p.name);b.addEventListener('click',()=>onVisit(p));root.querySelector('.journey-map-buttons').append(b);return {p,b};});
 let signature='',frame;const visited=new Set();
 return {get frame(){return frame;},reset(){visited.clear();signature='';},update({cue,group,camera,visible,entry,flight,notes=[],ledger={}}){
  root.hidden=!visible||entry;labels.hidden=!visible||entry||!['terrain','history'].includes(cue.key)||!!cue.stage||flight;
  const c=contextFor(cue),place=placeFor(c);if(visible&&!entry&&!flight&&place)visited.add(place.id);
  const journey=itineraryFrame(c,ledger,visited),phase=flight?.phase,leg=flight?{from:flight.origin.region,to:c.region,phase,phrase:flight.phrase}:null;frame={...c,journey,scale:flight?(flight.planetary?'continent':phase==='arrive'?c.scale:'region'):c.scale,landmarks:[],leg};viewport.dataset.spatialScale=frame.scale;viewport.dataset.spatialPlace=c.place;
  viewport.dataset.journeyPlaces=journey.visited.join(' ');viewport.dataset.journeyRecords=String(journey.records.length);
  const next=cue.id+'/'+(phase??'settled')+'/'+journey.records.map(r=>r.label).join('/')+'/'+journey.visited.join('/');
  if(next!==signature){signature=next;root.querySelector('nav b').textContent=flight?({establish:'建立位置',approach:'沿地形靠近',arrive:'走进当地',unfold:'展开新疆',return:'回看整体'}[phase]):scaleNames[c.scale];root.querySelector('small').textContent=c.region+' / '+scaleNames[c.scale];root.querySelector('strong').textContent=c.place;root.querySelector('.spatial-position p').textContent=`${c.lat.toFixed(2)}°N · ${c.lon.toFixed(2)}°E`;root.querySelector('.spatial-leg').hidden=!flight;root.querySelector('.spatial-leg').textContent=flight?.phrase??'';
   const ctx=root.querySelector('canvas').getContext('2d');drawLocator(ctx,frame,264,140);
   root.querySelector('.spatial-position p').textContent=place?place.era:`${c.lat.toFixed(2)}°N · ${c.lon.toFixed(2)}°E`;
   for(const {p,b}of buttons){const [x,y]=locatorXY(p.lon,p.lat,c,264,140),[dx,dy]=({gate:[-20,-16],family:[19,15],ice:[-15,-15],water:[15,13],culture:[16,-8]})[p.id]??[0,0];b.style.left=(x+dx)/264*100+'%';b.style.top=(y+dy)/140*100+'%';b.hidden=c.lon>100;b.setAttribute('aria-current',String(place?.id===p.id));b.dataset.visited=String(visited.has(p.id));}
   const record=journey.records.find(r=>r.id===place?.id),receipt=root.querySelector('.journey-receipt');
   const last=journey.records.at(-1);receipt.textContent=record?(record.manual?'你的选择 · ':'演示观察 · ')+record.label:last?'上一处留下 · '+last.name+' / '+last.label:'点选地点，沿地图继续探索';
   root.title=journey.scope;
   const result=document.getElementById('journey-result'),resultCanvas=result.querySelector('canvas');drawLocator(resultCanvas.getContext('2d'),{...frame,lon:84,lat:43},360,180);
   result.querySelector('.journey-result-records').replaceChildren(...journey.records.map(r=>{const b=document.createElement('button');b.setAttribute('aria-label','回到旅程地点：'+r.name);const name=document.createElement('strong'),choice=document.createElement('span'),era=document.createElement('small');name.textContent=r.name+' · '+r.question;choice.textContent=(r.manual?'你的选择':'演示观察')+' / '+r.label;era.textContent=r.era;b.append(name,choice,era);b.addEventListener('click',()=>onVisit(r));return b;}));
   if(!journey.records.length)result.querySelector('.journey-result-records').textContent='从地图走进一处，选择之后再回来看看。';
  }
  if(group?.userData.dem&&!labels.hidden)for(const m of marks){const p=new THREE.Vector3(...terrainPoint(group.userData.dem,m.lon,m.lat,group.userData.exaggeration,group.userData.dimensions));p.y+=.12;p.project(camera);const x=(p.x+1)*viewport.clientWidth/2,y=(1-p.y)*viewport.clientHeight/2;const blocked=notes.some(n=>x+48>n.x-10&&x-48<n.x+n.w+10&&y+13>n.y-10&&y-13<n.y+n.h+10);m.label.hidden=blocked||p.z>1||x<30||x>viewport.clientWidth-270||y<135||y>viewport.clientHeight-270;m.label.style.left=x+'px';m.label.style.top=y+'px';if(!m.label.hidden)frame.landmarks.push({name:m.name,x,y});}
 }};
}
export function locatorXY(lon,lat,c,w,h){const b=c.lon>100?[65,30,135,55]:[70,32,101,52];return [(lon-b[0])/(b[2]-b[0])*w,(b[3]-lat)/(b[3]-b[1])*h];}
export function drawLocator(ctx,c,w,h){
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#112524';ctx.fillRect(0,0,w,h);
 const outside=c.lon>100,xy=([lon,lat])=>locatorXY(lon,lat,c,w,h);
 if(!outside&&mapImage?.complete&&mapImage.naturalWidth){ctx.globalAlpha=.58;ctx.drawImage(mapImage,...xy([73,49]),23/31*w,14/20*h);ctx.globalAlpha=1;}
 ctx.strokeStyle='#b0c4a1';ctx.lineWidth=.8;ctx.fillStyle='#183a2630';ctx.beginPath();locatingFootprint.forEach((p,i)=>{const [x,y]=xy(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fill();ctx.stroke();
 if(!outside){const travelled=(c.journey?.visited??[]).map(id=>atlasPlaces.find(p=>p.id===id)).filter(Boolean);ctx.strokeStyle='#dfc489';ctx.lineWidth=1.1;ctx.setLineDash([2,4]);ctx.beginPath();travelled.forEach((p,i)=>{const v=xy([p.lon,p.lat]);i?ctx.lineTo(...v):ctx.moveTo(...v);});ctx.stroke();ctx.setLineDash([]);
  for(const p of atlasPlaces){const [x,y]=xy([p.lon,p.lat]);ctx.fillStyle=c.journey?.visited.includes(p.id)?'#f1d9a1':'#829e8b';ctx.beginPath();ctx.arc(x,y,2.3,0,Math.PI*2);ctx.fill();}
 }
 if(outside){ctx.strokeStyle='#e5bd77';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(...xy([123.43,41.8]));ctx.lineTo(...xy([81.15,43.84]));ctx.stroke();ctx.setLineDash([]);}
 const [x,y]=xy([c.lon,c.lat]);ctx.strokeStyle='#efdba6';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff0bf';ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#d0d4b9';ctx.font='9px Microsoft YaHei';ctx.fillText(outside?'西迁方向示意':'影像地图 · 虚线为浏览顺序',8,h-8);
}
// Lift the same geographically registered DEM out of the globe. The two
// endpoints use each vertex's lon/lat; this is a display transformation.
export function globeLift(terrain,spherePoint){
 const original=terrain.userData.surface,geo=original.geometry.clone(),target=geo.attributes.position.array.slice(),curved=new Float32Array(target.length),dem=terrain.userData.dem,[w,s,e,n]=dem.bounds;
 for(let i=0;i<geo.attributes.position.count;i++){const lon=w+(e-w)*(i%dem.cols)/(dem.cols-1),lat=n+(s-n)*Math.floor(i/dem.cols)/(dem.rows-1);spherePoint(lon,lat,3.25).toArray(curved,i*3);}
 const mat=new THREE.MeshStandardMaterial({map:original.material.map,side:THREE.DoubleSide,roughness:.95}),patch=new THREE.Mesh(geo,mat);patch.frustumCulled=false;
 return {patch,update(t){const p=geo.attributes.position;for(let i=0;i<target.length;i++)p.array[i]=curved[i]+(target[i]-curved[i])*t;p.needsUpdate=true;geo.computeVertexNormals();},dispose(){geo.dispose();mat.dispose();}};
}
