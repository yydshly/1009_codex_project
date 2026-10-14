import * as THREE from 'three';
import {eventFrame} from './history-process.js';
import {readingFor} from './event-reading.js';
// Exaggerated teaching icons. No building or route is presented as an excavated reconstruction.
export function buildEventObjects({root,event,point,earthTexture,city,labels,onVisit,onFocus,markers}){
 const box=(g,w,h,d,c,x=0,y=0,z=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:.85}));m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 const at=(lon,lat)=>{const g=new THREE.Group();g.position.copy(point(lon,lat));root.add(g);return g;};
 function human(g,x,z,c=0xcdae7b){const p=new THREE.Group();p.position.set(x,0,z);g.add(p);box(p,.09,.20,.07,c,0,.10);const head=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),new THREE.MeshStandardMaterial({color:0xd1ab83}));head.position.y=.36;p.add(head);const legs=[-.028,.028].map(v=>box(p,.025,.13,.035,0x43564f,v));return {g:p,legs};}
 const walk=(h,t)=>h.legs.forEach((l,i)=>{l.rotation.x=Math.sin(t*26+i*Math.PI)*.32;});
 function road(coords,color=0xeac581,radius=.035){const samples=[];for(let i=1;i<coords.length;i++){const a=coords[i-1],b=coords[i];for(let j=0;j<22;j++)samples.push(point(THREE.MathUtils.lerp(a[0],b[0],j/22),THREE.MathUtils.lerp(a[1],b[1],j/22)).add(new THREE.Vector3(0,.1,0)));}samples.push(point(...coords.at(-1)).add(new THREE.Vector3(0,.1,0)));const curve=new THREE.CatmullRomCurve3(samples),mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,140,radius,6,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));root.add(mesh);return {curve,mesh};}
 function reveal(r,t){r.mesh.visible=t>.001;r.mesh.geometry.setDrawRange(0,Math.floor(t*140)*36);}
 function house(g,x,z){const p=new THREE.Group();p.position.set(x,0,z);g.add(p);box(p,.42,.28,.42,0xc5ab7b);box(p,.48,.05,.48,0x717e69,0,.28);box(p,.10,.16,.01,0x374a43,0,0,.216);return p;}
 const sceneMarkers=[];
 for(let i=0;i<3;i++){
  const r=readingFor(event.id,i),position=point(...(event.guideFocus&&i<2?event.guideFocus:r.focus)).add(new THREE.Vector3(...(r.focusOffset??[0,0,0])));
  const b=document.createElement('button');b.className='hp-scene-reading';b.dataset.hpScenePart=['background','process','impact'][i];b.innerHTML='<strong>'+r.title+'</strong><small>'+r.look.split('；')[0]+'</small>';b.addEventListener('click',()=>onFocus?.(i));labels.append(b);
  const m={button:b,position:position.clone().add(new THREE.Vector3(0,event.id==='xibe'&&i===0?.85:.8,0)),story:true,sceneVisible:i===0};markers.push(m);sceneMarkers.push(m);
 }
 function supplySite(lon,lat){
  const g=at(lon,lat);box(g,.65,.025,.48,0x506c4b);
  for(const [x,z] of [[-.2,-.12],[.16,.1]]){box(g,.04,.18,.04,0x8d7859,x,.025,z);const crown=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),new THREE.MeshStandardMaterial({color:0x83a56c,roughness:1}));crown.position.set(x,.25,z);g.add(crown);}
  box(g,.22,.10,.17,0xb6a176,.03,.025,-.1);return g;
 }
 let visualState={};
 let update;
 if(event.id==='zhang'){
  const conditions=road(event.corridor,0x8e9480,.018);conditions.mesh.material.opacity=.4;
  const sites=(event.guideSites??[[94.66,40.14],[79.92,37.12],[75.99,39.47]]).map(p=>supplySite(...p));
  const gate=at(...event.corridor[0]);box(gate,.15,.45,.25,0xc4a778,-.22);box(gate,.15,.45,.25,0xc4a778,.22);box(gate,.65,.10,.28,0xa48251,0,.45);
  const route=road(event.corridor),caravan=new THREE.Group();caravan.scale.setScalar(2.25);root.add(caravan);const walkers=[human(caravan,-.15,0),human(caravan,-.15,.3,0x95b397),human(caravan,-.15,.60,0xa395c3)];
  const pack=new THREE.Group();pack.position.set(.13,0,.3);caravan.add(pack);box(pack,.15,.17,.30,0xb59a75,0,.20);box(pack,.06,.27,.07,0xb59a75,0,.27,-.13);box(pack,.09,.07,.14,0xb59a75,0,.49,-.17);box(pack,.2,.11,.15,0xc0a567,0,.37,.04);
  const packLegs=[[-.055,-.1],[.055,-.1],[-.055,.11],[.055,.11]].map(([x,z])=>box(pack,.03,.23,.035,0x8b7359,x,0,z));
  const market=at(75.99,39.47);for(const [x,z,c]of [[-.28,.18,0xa87d70],[.28,.18,0x7b9b82],[-.28,-.25,0xa79b6f]]){const s=new THREE.Group();s.position.set(x,0,z);market.add(s);box(s,.36,.12,.25,0xa38965);box(s,.42,.03,.31,c,0,.32);for(const v of [-.16,.16])box(s,.02,.28,.02,0x725f48,v,.04,.12);}const trader=human(market,.20,-.25,0x89a28b);
  const links=[road([[75.99,39.47],[80.1,42.1],[89.19,42.95]],0x9bceb4,.024),road([[89.19,42.95],[94.66,40.14]],0x9bceb4,.024)];
  const crates=[0,1,2].map(i=>box(market,.08,.07,.08,0xddb26d,-.22+i*.18,.16,.18));
  const receiver=human(market,-.2,-.18,0xb39a80);
  update=f=>{reveal(route,f.route);caravan.visible=f.route>0&&f.route<1;caravan.position.copy(route.curve.getPointAt(Math.max(.001,f.route)));const t=route.curve.getTangentAt(Math.max(.001,f.route));caravan.rotation.y=Math.atan2(t.x,t.z);for(const h of walkers)walk(h,f.progress);packLegs.forEach((l,i)=>l.rotation.x=Math.sin(f.progress*45+i*Math.PI)*.3);sceneMarkers[1].position.copy(caravan.position).y+=1.3;market.visible=f.network>.001;market.scale.setScalar(Math.max(.001,f.network));trader.g.position.z=.3-f.network*.48;receiver.g.position.x=-.4+f.network*.18;walk(trader,f.progress);for(const [i,c] of crates.entries()){c.position.x=-.22+i*.18+f.network*.13;c.position.z=.18-f.network*.2;}for(const l of links)reveal(l,f.network);visualState={backgroundSites:sites.length,cargo:crates.length,packAnimal:1,exchange:f.network,traveller:f.route};};
 }else if(event.id==='protectorate'){
  const locals=[house(at(80.6,40.5),0,0),house(at(87.2,42.1),0,0)];for(const local of locals){local.scale.setScalar(.7);local.traverse(o=>{if(o.material)o.material.color.set(0x969b89);});}
  const priorLinks=[road([[84.25,41.78],[80.6,40.5]],0x939581,.015),road([[84.25,41.78],[87.2,42.1]],0x939581,.015)];for(const l of priorLinks)l.mesh.material.opacity=.35;
  const links=[road([[84.25,41.78],[80.6,40.5]],0x9dceb2),road([[84.25,41.78],[87.2,42.1]],0x9dceb2)];const couriers=links.map(()=>{const g=new THREE.Group();root.add(g);human(g,0,0,0xd0b986);return g;});
  const packets=couriers.map(g=>box(g,.08,.08,.09,0xd6b888,.08,.15,.02));
  update=(f,structure)=>{city.group.visible=true;city.group.scale.setScalar(structure?1:.48);for(const [i,g]of city.parts.entries()){g.visible=i===1||f.build>.001;g.scale.y=i===1?1:Math.max(.001,f.build);}for(const [i,l]of links.entries()){reveal(l,f.network);couriers[i].visible=f.network>.001;couriers[i].position.copy(l.curve.getPointAt(Math.max(.001,f.network)));const t=l.curve.getTangentAt(Math.max(.001,f.network));couriers[i].rotation.y=Math.atan2(t.x,t.z);}visualState={backgroundSites:locals.length,agency:f.build,connections:f.network,cargo:packets.length};};
 }else{
  const destination=point(81.32,43.92),earth=new THREE.Group();earth.position.copy(destination).add(new THREE.Vector3(-1.85,1.35,-.15));root.add(earth);earth.add(new THREE.Mesh(new THREE.SphereGeometry(.68,48,32),new THREE.MeshBasicMaterial({map:earthTexture})));
  const spherical=(lon,lat,r)=>{const a=THREE.MathUtils.degToRad(lon),b=THREE.MathUtils.degToRad(lat);return new THREE.Vector3(r*Math.cos(b)*Math.cos(a),r*Math.sin(b),-r*Math.cos(b)*Math.sin(a));};const start=spherical(123.43,41.8,.71),end=spherical(81.32,43.92,.71),middle=start.clone().add(end).normalize().multiplyScalar(.96),curve=new THREE.QuadraticBezierCurve3(start,middle,end),globalRoute=new THREE.Mesh(new THREE.TubeGeometry(curve,100,.012,6,false),new THREE.MeshBasicMaterial({color:0xf1d09c}));earth.add(globalRoute);const bead=new THREE.Mesh(new THREE.SphereGeometry(.028,12,8),new THREE.MeshBasicMaterial({color:0xffffdb}));earth.add(bead);
  for(const [v,c]of [[start,0xe8b581],[end,0xb0e6af]]){const m=new THREE.Mesh(new THREE.SphereGeometry(.033,12,8),new THREE.MeshBasicMaterial({color:c}));m.position.copy(v);earth.add(m);}earth.rotation.y=THREE.MathUtils.degToRad(195);earth.rotation.z=-.16;
  const b=document.createElement('button');b.textContent='盛京 → 伊犁 · 全球方向';b.dataset.hpGlobe='xibe';b.addEventListener('click',()=>onVisit('ili'));labels.append(b);markers.push({button:b,position:earth.position.clone().add(new THREE.Vector3(0,-.7,0)),global:true});
  const regionalRoute=road([[81.32,43.92],[81.14,43.84]],0xb1d6a4,.027),settlement=at(81.14,43.84);settlement.position.x+=.55;settlement.position.z+=.4;settlement.position.y+=.6;const anchor=new THREE.Line(new THREE.BufferGeometry().setFromPoints([point(81.14,43.84),settlement.position.clone()]),new THREE.LineBasicMaterial({color:0x9fc4a1}));root.add(anchor);const homes=[house(settlement,-.4,-.22),house(settlement,.25,-.22),house(settlement,-.4,.43)];box(settlement,1.6,.03,1.25,0x9d9168,0,-.06,.05);const family=[human(settlement,-.10,.35),human(settlement,.10,.45,0x92aebe)];
  const field=new THREE.Group();field.position.set(.40,0,.42);settlement.add(field);box(field,.63,.025,.46,0x796e4d);for(let i=0;i<6;i++)for(let j=0;j<3;j++)box(field,.018,.12,.018,0xa1b578,-.25+i*.09,.025,-.13+j*.12);const canal=box(settlement,.07,.02,1.20,0x78c2bb,.04,.01,.05),worker=human(settlement,.18,.2,0xc8a46a);
  const waterBead=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),new THREE.MeshBasicMaterial({color:0xd9f5ed}));settlement.add(waterBead);
  update=f=>{globalRoute.geometry.setDrawRange(0,Math.floor(f.travel*100)*36);bead.position.copy(curve.getPoint(f.travel));reveal(regionalRoute,f.settle);for(const [i,h]of homes.entries()){const growth=THREE.MathUtils.clamp(f.settle*1.5-i*.2,0,1);h.visible=growth>.001;h.scale.y=Math.max(.001,growth);}settlement.visible=f.progress>.4;for(const [i,h]of family.entries()){h.g.position.z=.85-f.settle*.55+i*.1;walk(h,f.progress);h.g.rotation.y=f.settle*1.1;}field.visible=f.settle>.8;field.scale.y=Math.max(.05,f.settle);canal.visible=f.water>.001;canal.scale.z=Math.max(.001,f.water);waterBead.visible=f.water>.001;waterBead.position.set(.04,.055,.65-f.water*1.2);worker.g.visible=f.water>.001;worker.g.rotation.z=Math.sin(f.water*8)*.14;visualState={homes:homes.filter(h=>h.visible).length,family:family.length,settlement:f.settle,laterCanal:f.water,arrival:f.travel};};
 }
 return {readingAnchor(index){const p=sceneMarkers[index]?.position.clone();if(!p)return null;p.y-=event.id==='xibe'&&index===0?.85:event.id==='zhang'&&index===1?.7:.4;return p.toArray();},update(value,structure){const f=eventFrame(event.id,value);update(f,structure);for(const [i,m] of sceneMarkers.entries())m.sceneVisible=i===f.phase;return {...f,visualState};}};
}
