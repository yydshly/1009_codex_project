import * as THREE from 'three';
import {ease,settlementFrame,recipientFrame,outcomeFrame,needs} from './story-outcomes.js';
import {marketUse} from './early-chain.js';
import {surfaceMaterial} from './surface.js';

// Original miniature sets and gestures, not reconstructions of specific buildings or dress.
export function decorateWorld(stage,g,a){
 const {box,ball,cylinder,subgroup,solid,human,tree,rug}=a;
 const detail={stage,receivers:[],benefits:[],lamps:[],water:[],workers:[],foliage:[]};g.userData.detail=detail;
 const pot=(parent,x,z,size=.2)=>{
  const points=[[0,0],[.08,.02],[.15,.1],[.17,.22],[.09,.31],[.1,.35]].map(([r,y])=>new THREE.Vector2(r,y));
  const p=solid(parent,new THREE.LatheGeometry(points,20),0xb08059,[x,.035,z],[size*3,size*3,size*3]);return p;
 };
 const lamp=(parent,x,z)=>{
  const group=subgroup(parent,[x,0,z]);cylinder(group,0x735b41,[0,.35,0],[.025,.7,.025]);
  box(group,0xdec896,[0,.8,0],[.18,.25,.18]);const glow=ball(group,new THREE.MeshStandardMaterial({color:0xffcf7c,emissive:0xfbb954,emissiveIntensity:.5,roughness:.7}),[0,.8,.1],[.085,.11,.015]);detail.lamps.push(glow);return group;
 };
 const bench=(parent,x,z)=>{box(parent,0x88734f,[x,.24,z],[1.1,.1,.38]);for(const side of [-1,1])box(parent,0x695b42,[x+side*.4,.12,z],[.08,.24,.29]);};
 // Shared earthen edges, stones and planted margins give the worlds a coherent scale.
 for(let i=0;i<32;i++){
  const x=-6.8+(i%16)*.86,z=i<16?-3.85:3.9;
  solid(g,new THREE.DodecahedronGeometry(.085,0),[0xa18d6d,0xc5b18c,0x9c9d7d][i%3],[x,.055,z],[1.3,.6,.8]);
 }
 // Worn paving is instanced in scene-neighborhood.js, shared by both sets.
 if(stage==='nature'){
  const curve=new THREE.CatmullRomCurve3([[-5,.18,2.5],[-2,.16,2.7],[1,.14,2.55],[6.8,.13,2.15]].map(p=>new THREE.Vector3(...p)));
  solid(g,new THREE.TubeGeometry(curve,48,.045,8,false),new THREE.MeshStandardMaterial({color:0x82b3aa,roughness:.45}));
  for(let i=0;i<7;i++){const b=ball(g,new THREE.MeshBasicMaterial({color:0xc5e8cc}),[0,0,0],[.04,.015,.04]);detail.water.push({b,curve,offset:i/7});}
  for(let i=0;i<5;i++)tree(g,2.5+i*.7,-3.4,1.0);
 }else if(stage==='market'){
  // A narrow street, shade sails and small work objects; the market is lived in.
  for(const x of [-5.7,5.6]){
   for(const z of [-1.8,1.5])cylinder(g,0x6d583d,[x,1.28,z],[.035,2.55,.035]);
   const sail=solid(g,new THREE.PlaneGeometry(2.4,3.2,3,3),new THREE.MeshStandardMaterial({color:x<0?0xccad76:0x9eb7a0,side:THREE.DoubleSide,roughness:1}),[x,2.5,-.1]);sail.name='legacy-market-shade';sail.rotation.x=-Math.PI/2;sail.rotation.z=x<0?.08:-.08;
  }
  for(let i=0;i<9;i++){pot(g,-5.8+i*.31,-2.6,.12);}
  bench(g,-.35,1.1);lamp(g,-4.7,-1.7);lamp(g,4.8,-1.7);
  const tones=[0xb47455,0x9a9c72,0x608b91];
  for(let i=0;i<3;i++){
   const receiver=human(g,tones[i],.88);receiver.root.position.set([-3.6,-.3,3.45][i],0,.7);receiver.root.rotation.y=Math.PI;detail.receivers.push(receiver);
  }
  const child=human(g,0xa39470,.57);child.root.position.set(-2.7,0,1.03);detail.child=child;
  const wrap=solid(child.hips,new THREE.CylinderGeometry(.205,.24,1,24,5,true,-Math.PI*.63,Math.PI*1.26),surfaceMaterial(0x4f8e93,{roughness:1,side:THREE.DoubleSide},'textile'),[0,.12,.015],[1,.45,1]);wrap.visible=false;detail.benefits.push(wrap);
  const food=subgroup(g,[-.25,.34,1.08]);for(let i=0;i<4;i++)ball(food,0xd1a468,[i*.1-.15,.04,0],[.065,.032,.06]);food.visible=false;detail.benefits.push(food);
  const craft=pot(g,3.4,.9,.3);craft.visible=false;detail.benefits.push(craft);
  const sip=pot(detail.receivers[1].root,.24,.18,.11);detail.sip=sip;
  detail.travelPack=box(detail.receivers[1].root,0xb1956c,[0,.56,-.21],[.34,.4,.19]);detail.travelPack.visible=false;
  detail.craftTool=box(detail.receivers[2].root,0x74563e,[.22,.54,.23],[.035,.31,.035]);detail.craftTool.visible=false;
  box(g,0x9b7651,[3.7,.3,1.05],[1.05,.09,.6]);bench(g,3.7,1.55);
  const bowl=pot(g,-1.2,1.06,.18);detail.bowl=bowl;
  for(const x of [-6.25,6.25]){tree(g,x,2.85,1.6);pot(g,x-.25,2.75,.16);}
 }else if(stage==='people'){
  // An open household room can be read from the camera, with a threshold and daily objects.
  const room=subgroup(g,[4.55,0,2.1]);box(room,0xa98864,[0,.08,0],[2.6,.13,1.65]);
  box(room,0xc9b18b,[0,.61,-.78],[2.7,1.08,.12]);for(const side of [-1,1])box(room,0xc9b18b,[side*1.3,.44,-.12],[.12,.78,1.5]);
  rug(room,0,.15,2.2,1.1);bench(room,-.5,-.35);pot(room,.75,.4,.22);lamp(room,.8,-.55);
  const blanket=box(room,0x947253,[-.68,.2,.35],[.85,.18,.5]);detail.blanket=blanket;
  const hearth=subgroup(g,[5.95,0,.7]);solid(hearth,new THREE.SphereGeometry(.4,20,12,0,Math.PI*2,0,Math.PI/2),0xc1a17c,[0,0,0]);pot(hearth,0,-.05,.25);
  detail.home=room;detail.hearth=hearth;
  const basin=box(g,0x758f84,[1.1,.1,-.5],[.8,.18,.66]);box(g,0x7cb9ba,[1.1,.2,-.5],[.65,.035,.5]);detail.basin=basin;
  const gate=subgroup(g,[2.3,.12,-1]);box(gate,0x826848,[0,.21,0],[.34,.41,.08]);detail.sluice=gate;
  const welcomer=human(g,0x929263,.88);welcomer.root.position.set(4.2,0,1.22);detail.welcomer=welcomer;
  for(let i=0;i<12;i++){const leaf=solid(g,new THREE.ConeGeometry(.14,.45,6),0x819a53,[.9+(i%4)*.6,.2,-3.35+Math.floor(i/4)*.18]);detail.foliage.push(leaf);}
  for(let i=0;i<9;i++)pot(g,5.85,-1.35+i*.12,.1);
 }else if(stage==='culture'){
  // Slatted shade, vine and domestic edges make the teaching courtyard an everyday place.
  for(const x of [-5.3,5.3])for(const z of [-2,2.2])cylinder(g,0x826a45,[x,1.55,z],[.055,3.1,.055]);
  for(const z of [-2,2.2])box(g,0x826a45,[0,3.06,z],[10.8,.12,.14]);
  for(let i=0;i<14;i++)box(g,0x8b7450,[-5.3+i*.81,3.08,.12],[.06,.08,4.6]);
  for(let i=0;i<20;i++){
   const leaf=solid(g,new THREE.IcosahedronGeometry(.2,1),[0x627d46,0x80934e,0x95a56a][i%3],[-5.1+i*.52,3.12+Math.sin(i)*.07,-1.45],[1,.28,1.4]);detail.foliage.push(leaf);
  }
  for(const x of [-5.3,5.3]){bench(g,x,1);pot(g,x,2,.28);lamp(g,x,-2.15);}
  const tea=subgroup(g,[3.7,.25,1.8]);box(tea,0x94734f,[0,-.02,0],[.8,.12,.56]);pot(tea,0,0,.14);for(const x of [-.24,.24])pot(tea,x,.1,.07);
  for(const x of [-5.8,5.8])for(let j=0;j<5;j++)box(g,0x9b7152,[x,.45+j*.25,-1.3],[.07,.055,.72]);
 }else if(stage==='logistics'){
  // Service staff, a desk, a waiting bay and a planted margin make the tradeoff visible.
  const hut=subgroup(g,[3.4,0,.75]);box(hut,0x738a82,[0,.35,0],[1.15,.7,.7]);box(hut,0xb6c3aa,[0,.85,-.25],[1.2,.07,1]);
  const screen=box(hut,new THREE.MeshStandardMaterial({color:0xa5d0bd,emissive:0x619c89,emissiveIntensity:.45}),[0,.52,.38],[.42,.23,.025]);detail.screen=screen;
  const clerk=human(g,0x7c8f8a,.8);clerk.root.position.set(3.45,0,.15);clerk.root.rotation.y=.3;detail.workers.push(clerk);
  const handler=human(g,0xb49962,.85);handler.root.position.set(-3.8,0,.6);detail.workers.push(handler);
  const deskPaper=box(g,0xd8d4b4,[3.5,.73,.78],[.36,.015,.25]);detail.deskPaper=deskPaper;
  for(let i=0;i<7;i++)box(g,0xc5c7a4,[-6+i*1.07,.07,.6],[.9,.014,.04]);
  for(let i=0;i<4;i++){box(g,0x8a956e,[.3+i*.65,.14,-2.9],[.55,.24,.48]);tree(g,.3+i*.65,-2.9,.85);}
  lamp(g,2.65,.9);lamp(g,-2.7,1.05);
 }
 return detail;
}

export function animateOutcome(stage,g,{clock,elapsed,duration,playing,settings,deliveryAt,choiceAt,learnt,beatHit,viewport,decision}){
 const d=g.userData,detail=d.detail;if(!detail)return;
 const sequence=outcomeFrame(elapsed,duration);let phase=sequence.phase,phrase=needs[stage][phase];
 if(stage==='nature'){detail.water.forEach(({b,curve,offset})=>b.position.copy(curve.getPoint((clock*.14+offset)%1)));}
 else if(stage==='market'){
  const age=clock-deliveryAt,f=recipientFrame(age),received=deliveryAt>=0;
  const use=marketUse(received?age:-1,settings.goods);
  detail.receivers.forEach((a,i)=>{
   const chosen=i===settings.goods;a.pose(chosen&&received?(age>6?'use':f.thanks>.2?'thank':f.use>.1?'use':'receive'):'wait',clock,i);
   a.root.position.set([-3.6,-.3,3.45][i],0,.7);
   if(chosen&&received&&i===1){a.root.position.x+=use.continue*1.65;a.root.position.z+=use.continue*1.3;a.root.rotation.y=.65;a.pose(use.continue>.02&&use.continue<.99?'walk':'use',clock);}
   if(chosen&&received&&i===2){a.root.rotation.y=.35;a.pose(age>5?'work':'receive',clock);}
   if(chosen&&received&&i===0){a.root.position.z+=use.continue*.52;a.root.rotation.y=-.1;a.pose(age>6?'watch':'receive',clock);}
   a.hips.rotation.y=chosen&&received?Math.sin(clock*.65)*.04:0;
   detail.benefits[i].visible=chosen&&received&&f.use>.1;
  });
  const cloth=received&&settings.goods===0,wear=ease((age-1.1)/2.1);
  detail.child.root.position.x=-2.7-(cloth?.25*wear:0);detail.child.root.position.z=1.03+(cloth?.52*use.continue:0);
  detail.child.pose(cloth?(age<3.2||use.continue>.02&&use.continue<.99?'walk':age<5?'thank':'use'):'wait',clock);
  detail.benefits[0].visible=cloth&&wear>.15;
  detail.benefits[0].scale.y=.45*(.25+.75*wear);
  detail.sip.rotation.x=settings.goods===1&&received?-f.use*.6:0;
  detail.travelPack.visible=settings.goods===1&&received&&age>3;detail.craftTool.visible=settings.goods===2&&received&&age>4;
  viewport.dataset.goods=String(settings.goods);viewport.dataset.marketUse=received?(use.continue>.9?['family-continues','traveller-departs','craft-work-continues'][settings.goods]:'receiving-and-using'):'waiting-for-choice';
  viewport.dataset.marketWaiting=use.waiting.join(' ');
  viewport.dataset.marketActors=JSON.stringify(detail.receivers.map(a=>a.root.position.toArray()));
  if(received){phase=f.thanks>.6?3:2;phrase=settings.goods===0?'织物成为孩子的披裹，家人点头致意。':settings.goods===1?'远行者补充食物与水，重新整理行装。':'器物放上工作台，手艺人在交换后继续制作。';}
  else {phase=1;phrase=['家人需要一块织物。','远行者需要食物与水。','手艺人需要器物与材料。'][settings.goods];}
 }else if(stage==='people'){
  const p=Number(viewport.dataset.familyProgress),arrived=p>.78;
  const f=settlementFrame(decision?(decision.choice?decision.age:0):playing?Math.max(0,elapsed-2):clock-choiceAt,settings.priority);
  detail.sluice.position.y=.12+(arrived?f.water*.35:0);detail.home.visible=detail.hearth.visible=arrived;
  detail.lamps.forEach(m=>m.material.emissiveIntensity=arrived?.1+f.home*.9:.05);
  detail.foliage.forEach((m,i)=>m.scale.y=arrived?.45+f.water*.6:.3);
  d.water.forEach(b=>b.visible=arrived&&f.water>.25);d.workers.forEach(a=>{a.root.visible=arrived&&f.water>.3;a.pose('work',clock*.6);});
  detail.welcomer.root.visible=arrived;detail.welcomer.pose(f.reply>.4?'thank':'greet',clock);
  if(arrived){
   const family=d.families[0];family.group.position.lerp(new THREE.Vector3(4.35,0,3.05),f.home);family.group.rotation.y*=1-f.home;
   family.rigs.forEach((a,j)=>a.pose(f.home>.65?(j===2?'sit':'use'):'wait',clock,j));
   phase=f.reply>.3?3:2;phrase=settings.priority==='water'?'先打开水闸：渠水到田，再在门前安顿。':'先在门前安顿：灯亮起来，再把水引向田地。';
  }else {phase=p<.3?0:1;phrase=p<.3?'启程前，家人整理行装，孩子留在身边。':'一家人带着行装继续前行，脚步连接下一处生活。';}
  viewport.dataset.settlementReply=(arrived?f.reply:0).toFixed(3);viewport.dataset.settlementAge=String(decision?(decision.choice?decision.age:0):playing?Math.max(0,elapsed-2):Math.max(0,clock-choiceAt));
  viewport.dataset.householdPriority=settings.priority;viewport.dataset.waterOutcome=(arrived?f.water:0).toFixed(2);viewport.dataset.homeOutcome=(arrived?f.home:0).toFixed(2);
 }else if(stage==='culture'){
  const learner=d.learner,responding=viewport.dataset.callTurn==='回应';
  learner.pose(responding?'learn':'watch',clock*.8);learner.hips.rotation.y=responding?Math.sin(clock*1.8)*.12:0;
  d.actors[0].root.rotation.y=.14;d.actors[0].hips.rotation.y=responding?-.15:0;
  if(settings.culture==='learning'){
   phase=responding?2:1;phrase=responding?'学习者接上示范，动作得到同伴的回应。':'示范者留出停顿，学习者看向双手。';
   if(decision?decision.choice&&decision.age>=6:learnt>0&&clock-beatHit>1.5){phase=3;phrase='这一拍已经传过去：同伴点头，下一次实践开始。';d.actors.slice(4,7).forEach((a,i)=>a.pose('thank',clock,i));}
  }
 }else if(stage==='logistics'){
  const open=d.barrier.rotation.z<-.4;
  detail.workers[0].pose(open?'greet':'work',clock*.6);detail.workers[1].pose('work',clock*.7);
  detail.screen.material.emissiveIntensity=settings.coordination?.8:.06;detail.deskPaper.rotation.z=Math.sin(clock*.7)*.05;
  phrase=settings.coordination?'工作人员接到信息、抬杆接应，车辆继续驶向下一处。':'车辆到达服务处，工作人员逐项处理，后车等待。';phase=settings.coordination?2:1;
  if(settings.green>=35){phase=3;phrase='绿地留下更多空间，部分车辆停入等待区：使用与保留一起进入选择。';}
 }
 viewport.dataset.storyPhase=String(phase);viewport.dataset.storyOutcome=phrase;
 return {phase,label:['需求','选择','变化','回应'][phase],phrase};
}
