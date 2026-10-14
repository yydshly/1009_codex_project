import * as THREE from 'three';
import {createActor} from './actor-rig.js';
import {envoyDesertFrame} from './envoy-journey-data.js';

// Original live landscape. The silhouettes suggest travellers, not an excavated
// Han costume reconstruction. One shared terrain and instanced detail per visit.
export function desertHeight(x,z){
 const laneZ=2.1*Math.sin(x*.065);
 const lane=Math.exp(-Math.pow((z-laneZ)/12,2));
 const dunes=1.5+2.9*Math.sin(x*.044+z*.071)+1.8*Math.sin(z*.14-x*.025)+.65*Math.sin(x*.13+z*.036);
 return dunes*(1-lane*.84)+.22*Math.sin(x*.10)+.3;
}
export const desertRoute=f=>{const x=-30+60*Math.max(0,Math.min(1,f)),z=2.1*Math.sin(x*.065);return new THREE.Vector3(x,desertHeight(x,z),z);};
export function desertCameraPose(point,phase='walk',aspect=1.4){
 const target=point.clone().add(new THREE.Vector3(0,1.25,0)),offset=phase==='rest'?new THREE.Vector3(5,3.5,11):phase==='wind'?new THREE.Vector3(6,3.8,14):new THREE.Vector3(8,4,16);
 offset.multiplyScalar(Math.max(1,1.15/Math.max(.35,aspect)));
 // Keep the line of sight above intervening dunes, not just above the party.
 for(let i=1;i<=16;i++){const t=i/17,x=target.x+offset.x*t,z=target.z+offset.z*t,need=(desertHeight(x,z)+.55-target.y)/t;offset.y=Math.max(offset.y,need);}
 return {position:target.clone().add(offset),target};
}
export function createEnvoyDesert(){
 const root=new THREE.Group();root.name='envoy-desert';
 let seed=80621;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const materials=new Map(),geometry=new Map();
 const mat=c=>c?.isMaterial?c:materials.get(c)??(materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.93})),materials.get(c));
 const geo=(k,make)=>geometry.get(k)??(geometry.set(k,make()),geometry.get(k));
 const group=(parent,position=[0,0,0])=>{const g=new THREE.Group();g.position.fromArray(position);parent?.add(g);return g;};
 function mesh(parent,geo,c,p,s){const m=new THREE.Mesh(geo,mat(c));m.position.fromArray(p);m.scale.fromArray(s);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 const box=(g,c,p,s)=>mesh(g,geo('box',()=>new THREE.BoxGeometry(1,1,1)),c,p,s);
 const ball=(g,c,p,s)=>mesh(g,geo('ball',()=>new THREE.SphereGeometry(1,14,10)),c,p,s);
 const cylinder=(g,c,p,s)=>mesh(g,geo('cylinder',()=>new THREE.CylinderGeometry(1,1,1,14)),c,p,s);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(256,256);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,n=(random()-.5)*22,r=Math.sin(x*.25+Math.sin(y*.045)*4)*7;pixels.data[i]=187+n+r;pixels.data[i+1]=146+n+r;pixels.data[i+2]=94+n+r;pixels.data[i+3]=255;}
 ctx.putImageData(pixels,0,0);const grain=new THREE.CanvasTexture(canvas);grain.colorSpace=THREE.SRGBColorSpace;grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(45,45);
 const sand=new THREE.MeshStandardMaterial({color:0xe5be85,map:grain,bumpMap:grain,bumpScale:.07,roughness:.99});
 const surface=new THREE.PlaneGeometry(220,220,190,190);surface.rotateX(-Math.PI/2);const pos=surface.attributes.position;
 const colors=[];for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),h=desertHeight(x,z);pos.setY(i,h);const color=new THREE.Color(0xffffff).multiplyScalar(.86+.14*Math.sin(x*.038+z*.052));colors.push(color.r,color.g,color.b);}
 surface.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));surface.computeVertexNormals();sand.vertexColors=true;
 const ground=new THREE.Mesh(surface,sand);ground.receiveShadow=true;root.add(ground);
 // Rounded stones, dry plants and a low distant escarpment break a sterile plane.
 const rocks=new THREE.InstancedMesh(geo('stone',()=>new THREE.IcosahedronGeometry(1,1)),mat(0x8c7455),300),dummy=new THREE.Object3D();
 for(let i=0;i<300;i++){const x=(random()-.5)*175,z=(random()-.5)*165,s=(.08+random()*.32)*(Math.abs(z-2.1*Math.sin(x*.065))<14?.18:1);dummy.position.set(x,desertHeight(x,z)+s*.25,z);dummy.scale.set(s*1.3,s*.45,s);dummy.rotation.set(random(),random()*6,random());dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}rocks.castShadow=rocks.receiveShadow=true;root.add(rocks);
 const plants=new THREE.InstancedMesh(geo('twig',()=>new THREE.ConeGeometry(1,1,4)),mat(0x847953),210);
 for(let i=0;i<210;i++){const x=(random()-.5)*150,z=(random()-.5)*140;dummy.position.set(x,desertHeight(x,z)+.19,z);dummy.scale.set(.07,.38,.07);dummy.rotation.set(0,random()*6,(random()-.5)*.55);dummy.updateMatrix();plants.setMatrixAt(i,dummy.matrix);}root.add(plants);
 for(let i=0;i<18;i++){const x=-85+i*10,z=-75+random()*12;const ridge=mesh(root,geo('ridge',()=>new THREE.IcosahedronGeometry(1,1)),0x998266,[x,4+random()*3,z],[8+random()*7,7+random()*6,7]);ridge.rotation.y=random()*4;}
 const party=group(root),people=[],cloaks=[],skins=[];party.name='envoy-party';
 const robeGeometry=geo('robe',()=>new THREE.LatheGeometry([[.08,-.47],[.19,-.41],[.21,-.2],[.16,.22],[.1,.40]].map(p=>new THREE.Vector2(...p)),18));
 for(let i=0;i<5;i++){
  const actor=createActor(party,[0x795b42,0x967752,0x6b7668,0x8c6b50,0x806f59][i],1.75,undefined,{subgroup:group,box,ball,cylinder});
  // Wrap robe, tied belt, soft cap and travel cloak cover contemporary buttons.
  const robe=new THREE.Mesh(robeGeometry,mat([0x8e7052,0xa28c68,0x667366,0x927d61,0x826e5d][i]));robe.position.y=.17;actor.hips.add(robe);robe.castShadow=true;
  box(actor.hips,0x4d4235,[0,.08,.03],[.40,.065,.36]);
  const lapel=box(actor.hips,0xc4b193,[.015,.29,.20],[.026,.24,.018]);lapel.rotation.z=-.52;
  const cap=ball(actor.head,0x484539,[0,.15,-.018],[.15,.09,.14]);cap.scale.z=.12;
  const cloak=box(actor.hips,0x9d8970,[0,.15,-.20],[.42,.58,.025]);cloak.rotation.x=.12;cloaks.push(cloak);
  const pack=box(actor.hips,0x5b5140,[0,.20,-.26],[.22,.27,.13]);pack.rotation.z=.08;
  const skin=ball(actor.hips,0x775136,[.25,-.1,.03],[.055,.09,.055]);skins.push(skin);
  people.push(actor);
 }
 const staff=group(people[0].hands.right,[0,-.12,0]);cylinder(staff,0x654a30,[0,.12,.08],[.014,.95,.014]);
 const tassels=[];for(let i=0;i<3;i++){const tuft=box(staff,0xaa6042,[.02,.46-i*.12,.08],[.13,.035,.014]);tassels.push(tuft);}
 const horse=group(party),horseBody=group(horse),horseLegs=[];
 ball(horseBody,0x8e7051,[0,1.05,0],[.36,.35,.80]);ball(horseBody,0x896c4e,[0,1.32,.52],[.22,.57,.26]);
 ball(horseBody,0x977c58,[0,1.72,.74],[.18,.23,.40]);ball(horseBody,0x6d5540,[0,1.60,1.03],[.17,.14,.18]);
 for(const x of [-.12,.12]){const ear=cylinder(horseBody,0x6f5842,[x,2.01,.65],[.04,.25,.04]);ear.rotation.z=x>0?-.17:.17;ball(horseBody,0x29281f,[x*1.38,1.80,.88],[.023,.026,.024]);}
 box(horseBody,0x433c32,[0,1.54,.53],[.045,.69,.12]);box(horseBody,0x705d48,[0,1.38,-.02],[.74,.10,.9]);
 for(const x of [-.49,.49])box(horseBody,0xb1a17c,[x,.98,-.10],[.31,.47,.59]);
 cylinder(horseBody,0x674d34,[0,1.48,-.22],[.16,.45,.16]).rotation.z=Math.PI/2;
 for(const [i,[x,z]]of [[-.24,-.51],[.24,-.51],[-.24,.49],[.24,.49]].entries()){
  const leg=group(horse,[x,1,z]),knee=group(leg,[0,-.48,0]);cylinder(leg,0x907552,[0,-.24,0],[.065,.48,.065]);cylinder(knee,0x796346,[0,-.22,0],[.044,.44,.044]);box(knee,0x3d372d,[0,-.45,.03],[.11,.09,.14]);horseLegs.push({leg,knee,i});
 }
 const tail=cylinder(horseBody,0x403b30,[0,.89,-.86],[.045,.62,.045]);tail.rotation.x=.3;
 const tracks=new THREE.InstancedMesh(geo('track',()=>new THREE.PlaneGeometry(.12,.26)),new THREE.MeshBasicMaterial({color:0x896b43,transparent:true,opacity:.36,depthWrite:false}),460);tracks.count=0;tracks.frustumCulled=false;root.add(tracks);
 for(let i=0;i<460;i++){const f=i/460,p=desertRoute(f);dummy.position.set(p.x-.35+(i%2)*.58,p.y+.035,p.z);dummy.rotation.set(-Math.PI/2,0,-Math.PI/2);dummy.scale.setScalar(1);dummy.updateMatrix();tracks.setMatrixAt(i,dummy.matrix);}
 const grains=[];for(let i=0;i<650;i++)grains.push((random()-.5)*90,random()*5+.15,(random()-.5)*50);
 const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(grains,3));
 const dustMat=new THREE.PointsMaterial({color:0xf3cc8f,size:.045,transparent:true,opacity:.4,depthWrite:false});const dust=new THREE.Points(dustGeo,dustMat);root.add(dust);
 const parcel=ball(root,0x806041,[0,0,0],[.10,.19,.11]);parcel.visible=false;
 const temp=new THREE.Vector3();let lastFraction=0,walkTime=0,time=0;
 root.userData.update=(fraction,options={})=>{
  const frame=envoyDesertFrame(fraction,options),delta=Math.max(0,Math.min(.1,options.dt??1/60));time+=delta;
  if(fraction<lastFraction-.03){walkTime=0;time=0;}lastFraction=fraction;
  if(options.running!==false)walkTime+=delta*frame.walk;
  const restProgress=options.rest?(time%8)/8:Math.max(0,Math.min(1,(fraction-.64)/.15));
  const lead=desertRoute(frame.distance);party.position.copy(lead);party.rotation.y=Math.PI/2;
  people.forEach((a,i)=>{const x=i%2?.75:-.65,z=-i*1.45;temp.set(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),party.rotation.y).add(lead);a.root.position.set(x,desertHeight(temp.x,temp.z)-lead.y,z);
   a.beginFrame(delta);a.pose(frame.rest?(i===3?'carry':i===0?'watch':'wait'):'walk',walkTime,i*.37);a.root.rotation.y=frame.rest&&i===0?-.8:0;
   if(frame.rest&&i===3){const mouth=a.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(.1,-.09,.12));a.reach(mouth,{side:'right',weight:Math.sin(restProgress*Math.PI)*.96});}
   if(frame.wind>.7&&!frame.rest){const face=a.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(.13,.05,.02));a.reach(face,{side:'left',weight:.96});}
   a.applyPerformance({time,dt:delta,expression:frame.wind>.7?'concerned':frame.rest?'attentive':'neutral'});
   if(frame.wind>.7&&!frame.rest)a.head.rotation.x=.18;
   cloaks[i].rotation.x=.12+frame.wind*.12*Math.sin(time*3+i);skins[i].visible=!(frame.rest&&i===3);
  });
  horse.position.set(-2.2,desertHeight(lead.x-5,lead.z+2.2)-lead.y,-5);horseBody.position.y=Math.sin(walkTime*6)*.025*frame.walk;
  horseLegs.forEach(({leg,knee,i})=>{const phase=walkTime*4.3+(i===0||i===3?0:Math.PI);leg.rotation.x=Math.sin(phase)*.30*frame.walk;knee.rotation.x=-Math.max(0,Math.cos(phase))*.42*frame.walk;});tail.rotation.z=Math.sin(time*1.8)*.10;
  tassels.forEach((t,i)=>t.rotation.y=Math.sin(time*4+i)*frame.wind*.5);
  tracks.count=Math.floor(frame.distance*460);
  const attr=dustGeo.attributes.position;for(let i=0;i<attr.count;i++){const x=((grains[i*3]+time*(.8+frame.wind*5)+45)%90)-45;attr.setXYZ(i,x,grains[i*3+1]+Math.sin(time+i)*.08,grains[i*3+2]);}attr.needsUpdate=true;dustMat.opacity=.1+frame.wind*.38;
  parcel.visible=frame.rest;if(frame.rest){people[3].worldHandPosition('right',temp);parcel.position.copy(temp);parcel.rotation.z=-.6*Math.sin(restProgress*Math.PI);people[3].head.getWorldPosition(temp);people[4].lookAt(temp);people[0].lookAt(temp);}else people.forEach(a=>a.lookAt(null));
  // Seeking while paused moves the party without changing local poses. Refresh
  // every child matrix before projected labels query individual ancestors.
  root.updateMatrixWorld(true);
  root.userData.frame=frame;root.userData.follow=lead.toArray();root.userData.visibility={party:party.visible,head:people[0].head.getWorldPosition(new THREE.Vector3()).toArray(),ground:lead.y};return frame;
 };
 root.userData.anchors=()=>[
  {id:'leader',label:'原创行旅人物 · 动画实验',point:people[0].head.getWorldPosition(new THREE.Vector3())},
  {id:'supplies',label:root.userData.frame?.rest?'水囊 · 停下来照应':'驮载 · 下一段行程的补给',point:horse.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,2.3,0))}
 ];
 root.userData.update(0);return root;
}
