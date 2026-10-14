import * as THREE from 'three';
import {traditions,civicPlans,civicVoices} from './social-model.js';

// These are original story props and gestures, not historic objects, ethnic dress,
// authentic Muqam choreography, or a measured policy simulation.
export const SOCIAL_FOCUS={
 people:{position:[6.35,1.85,6.55],target:[4.58,.82,3.35]},
 culture:{position:[-2.4,1.95,6.1],target:[-1.15,.79,2.9]},
 logistics:{position:[-4.0,1.95,4.75],target:[-1.65,.83,.4]},
};

const clamp=v=>THREE.MathUtils.clamp(v,0,1);
const ease=v=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a,b,t)=>THREE.MathUtils.lerp(a,b,t);
const toward=(a,b)=>Math.atan2(b[0]-a[0],b[2]-a[2]);
const ownMaterial=color=>new THREE.MeshStandardMaterial({color,roughness:.85});

export function decorateSocial(stage,g,helpers){
 const {box,ball,cylinder,solid,subgroup,human,tree,textSign}=helpers;
 if(!['people','culture','logistics'].includes(stage))return null;
 const state={stage,previous:{},times:{},helpers};
 g.userData.social=state;
 const identity=(mesh,name)=>{mesh.name=name;return mesh;};
 const paper=(parent,position=[0,0,0])=>{
  const p=subgroup(parent,position);box(p,0xe8d9b4,[0,0,0],[.29,.012,.2]);
  // Plain folds deliberately contain no fabricated language or historic signature.
  const fold=new THREE.BufferGeometry().setFromPoints([
   new THREE.Vector3(-.14,.011,-.095),new THREE.Vector3(0,.011,.02),new THREE.Vector3(.14,.011,-.095),
  ]);
  p.add(new THREE.Line(fold,new THREE.LineBasicMaterial({color:0xa09274})));
  return p;
 };
 const toolBundle=parent=>{
  const p=subgroup(parent);box(p,0x826d4a,[0,0,0],[.3,.08,.18]);
  for(const x of [-.08,.08])cylinder(p,0xbba371,[x,.02,0],[.012,.47,.012]).rotation.x=Math.PI/2;
  box(p,0x617575,[-.08,.03,-.2],[.13,.035,.08]);box(p,0x617575,[.08,.03,-.2],[.08,.04,.1]);
  box(p,0x738b77,[0,.045,0],[.045,.015,.22]);return p;
 };
 const desk=(parent,position,width=1.5,depth=.75)=>{
  const p=subgroup(parent,position);box(p,0x987753,[0,.61,0],[width,.1,depth]);
  for(const x of [-1,1])for(const z of [-1,1])box(p,0x78684d,[x*(width/2-.1),.3,z*(depth/2-.1)],[.085,.6,.085]);
  box(p,0x77684c,[0,.19,0],[width-.16,.07,depth-.12]);return p;
 };
 const ring=(parent,position,color,radius=.25)=>{
  const p=solid(parent,new THREE.TorusGeometry(radius,.019,6,36),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.65}),position);
  p.rotation.x=-Math.PI/2;return p;
 };

 if(stage==='people'){
  const family=g.userData.families[0];
  const chest=identity(subgroup(g,[5.48,0,3.17]),'social-travel-chest');
  box(chest,0x816748,[0,.22,0],[.72,.4,.47]);
  box(chest,0x5b5140,[0,.422,0],[.63,.015,.38]);
  for(const x of [-.24,.24])box(chest,0x66634d,[x,.23,.24],[.045,.36,.018]);
  for(const x of [-.34,.34])box(chest,0x66634d,[x,.04,0],[.035,.09,.47]);
  box(chest,0xc1b17f,[0,.27,.25],[.085,.12,.018]);
  const lid=subgroup(chest,[0,.43,-.23]);box(lid,0x987753,[0,.035,.23],[.74,.07,.48]);
  for(const x of [-.24,.24])box(lid,0x6b654b,[x,.074,.23],[.045,.009,.46]);
  const contents=subgroup(chest,[0,.46,0]);
  box(contents,0x82968c,[-.11,.01,.02],[.29,.09,.28]);
  box(contents,0xab906a,[.16,.015,-.02],[.14,.13,.25]);
  const label=textSign(g,'行装 · 记忆','原创道具示意',[6.13,.76,3.17],1.25,'#4d6258');
  const letter=identity(paper(family.group),'social-family-letter');
  const tools=identity(toolBundle(family.group),'social-family-tools');
  const receiving=ring(g,[4.4,.075,3.7],0xdcc695,.28);receiving.visible=false;
  Object.assign(state,{family,chest,lid,contents,label,letter,tools,receiving});
 }else if(stage==='culture'){
  const board=identity(subgroup(g,[0,0,0]),'social-tradition-board'),cards=[];
  for(const [i,t] of traditions.entries()){
   const x=-3.8+i*2.15;
   box(board,0x8f7b59,[x,1.51,-2.35],[2.06,.73,.06]);
   const mat=ownMaterial(0x708e80);
   const selection=box(board,mat,[x,1.14,-2.305],[2.02,.055,.03]);
   const sign=textSign(board,t.name,'同一文化中的不同传统',[x,1.52,-2.305],1.97,'#405b54');
   cards.push({id:t.id,selection,selectionScale:selection.scale.clone(),sign,mat});
  }
  const learningDesk=identity(desk(g,[-.65,0,2.88],1.38,.68),'social-learning-desk');
  learningDesk.position.z=2.7;learningDesk.scale.y=.78;
  box(learningDesk,0xe4d8b7,[.14,.676,0],[.43,.019,.29]);
  // Archive sheets stand for a documented learning resource, not musical notation.
  for(let i=0;i<3;i++)box(learningDesk,[0x6f8d82,0xb7a476,0x8e7664][i],[.39,.69+i*.035,-.06],[.27,.028,.34]);
  const archive=subgroup(learningDesk,[-.39,.7,-.04]);
  box(archive,0x596f69,[0,0,0],[.3,.13,.22]);box(archive,0xa8baa2,[0,.055,.112],[.2,.025,.01]);
  for(const x of [-.09,.09])cylinder(archive,0xd4c5a1,[x,.045,.115],[.016,.009,.016]).rotation.x=Math.PI/2;
  const teacher=human(g,0x7f8260,.84),child=human(g,0x799499,.59);
  teacher.root.position.set(-1.94,0,2.65);teacher.root.rotation.y=toward(teacher.root.position.toArray(),[.54,0,3.07]);
  child.root.position.set(-.18,0,3.18);child.root.rotation.y=toward(child.root.position.toArray(),[-1.94,0,2.65]);
  const record=identity(paper(g,[-.65,.73,2.87]),'social-learning-record');
  const teacherRing=ring(g,[-1.94,.07,2.65],0xa5c7b6,.29),childRing=ring(g,[-.18,.07,3.18],0xd8bf88,.23);
  const title=textSign(learningDesk,'资料与传习','原创学习互动',[0,1.06,-.26],1.26,'#536758');
  Object.assign(state,{board,cards,learningDesk,archive,teacher,child,record,teacherRing,childRing,title});
 }else{
  const council=identity(subgroup(g),'social-council');
  const consultation=desk(council,[-1.7,0,.15],1.42,.7);
  box(consultation,0xd6d5b4,[0,.67,0],[1.11,.015,.49]);
  for(let i=0;i<3;i++)box(consultation,[0xa97761,0x627f88,0x799664][i],[-.32+i*.32,.695,.15],[.24,.015,.13]);
  const actors={};
  const actorData=[['resident',[-2.85,0,.28],0xa97761],['worker',[-1.28,0,.94],0x627f88],['steward',[-.48,0,.05],0x799664]];
  for(const [role,position,color] of actorData){
   const actor=human(council,color,.81);actor.root.position.set(...position);actor.root.rotation.y=toward(position,[-1.7,0,.15]);
   const glow=ring(council,[position[0],.075,position[2]],color,.31);
   const sign=textSign(council,civicVoices[role].name,'原创角色 · 需求协商',[position[0],1.36,position[2]-.12],1.42,'#475e57');
   const note=paper(actor.root,[.18,.68,.19]);note.rotation.z=.12;
   if(role==='worker'){
    // An original modern work helmet, independent from community identity.
    solid(actor.head,new THREE.SphereGeometry(.161,16,10,0,Math.PI*2,0,Math.PI/2),0xc2a771,[0,.085,0]);
    box(actor.head,0xc2a771,[0,.086,.02],[.34,.026,.31]);
   }
   if(role==='steward'){
    const pail=subgroup(actor.root,[.26,.3,.18]);cylinder(pail,0x8ca28a,[0,0,0],[.075,.16,.075]);
    const handle=solid(pail,new THREE.TorusGeometry(.065,.009,5,16,Math.PI),0x566c59,[0,.085,0]);handle.rotation.z=.06;
   }
   actors[role]={actor,glow,sign,note,position,color};
  }
  const proposal=identity(cylinder(council,ownMaterial(0xd0bd85),[-1.7,.72,.15],[.12,.028,.12]),'social-proposal-token');
  const planMarkers={};
  for(const [i,id] of ['freight','balanced','habitat'].entries()){
   const p=subgroup(consultation,[-.34+i*.34,.74,-.12]);
   const disk=cylinder(p,ownMaterial([0xbb9b65,0x79978a,0x719352][i]),[0,0,0],[.082,.035,.082]);
   const pointer=solid(p,new THREE.ConeGeometry(.04,.13,10),0xe9dfbc,[0,.115,0]);pointer.visible=false;
   planMarkers[id]={disk,diskScale:disk.scale.clone(),pointer};
  }
  // Low planted pockets protect a margin without covering the same truck route.
  const buffer=identity(subgroup(g),'social-planted-buffer'),beds=[];
  for(let i=0;i<6;i++){
   const x=.18+i*.4,p=subgroup(buffer,[x,0,.64]);
   box(p,0x7a8b68,[0,.12,0],[.34,.2,.39]);box(p,0x63864f,[0,.227,0],[.3,.018,.34]);
   for(let j=0;j<3;j++)ball(p,[0x708b53,0x8ba267,0x93a976][j],[(j-1)*.075,.34,.02*(j%2)],[.08,.14,.11]);
   if(i%2===0)tree(p,0,0,.65).scale.setScalar(.45);beds.push(p);
  }
  // These marks surround the existing parking row; the parent controls all vehicles.
  const waitingBay=identity(subgroup(g),'social-waiting-bay'),slots=[];
  for(let i=0;i<5;i++){
   const x=-6.08+i*.63;
   const line=box(waitingBay,ownMaterial(0xd4ca9b),[x,.086,1.01],[.5,.018,.04]);
   box(waitingBay,0x89936f,[x-.27,.085,.64],[.026,.015,.74]);slots.push(line);
  }
  for(const x of [-6.42,-3.03]){
   const bollard=subgroup(waitingBay,[x,0,1.05]);cylinder(bollard,0xd0b872,[0,.18,0],[.035,.36,.035]);
   box(bollard,0x6e786b,[0,.24,0],[.075,.09,.075]);
  }
  const baySign=textSign(waitingBay,'临时等候','同一车队 · 等候继续记录',[-5.06,1.18,.98],2.02,'#526354');
  Object.assign(state,{council,consultation,actors,proposal,planMarkers,buffer,beds,waitingBay,slots,baySign,bufferValue:.65});
 }
 return state;
}

export function animateSocial(stage,g,{clock,elapsed,duration,playing,settings,viewport,cue,decision,beatHit=-100}){
 const s=g.userData.social;if(!s)return null;
 const changed=(key,value)=>{
  if(s.previous[key]!==value||clock<(s.times[key]??0)){s.previous[key]=value;s.times[key]=clock;return true;}
  return false;
 };
 if(stage==='people'){
  const memory=settings.memory==='tools'?'tools':'letter';changed('memory',memory);
  const progress=Number(viewport?.dataset.familyProgress??0),arrived=progress>.78;
  const age=decision?(decision.choice?Math.max(0,decision.age-4):0):playing&&cue?.id==='memory-arrival'&&elapsed>0?Math.max(0,elapsed-11):Math.max(0,clock-s.times.memory);
  s.responseAge=age;
  const handoff=arrived?ease((age-1)/4):0;
  s.audioHandoff=handoff;
  s.chest.visible=s.label.visible=arrived;s.lid.rotation.x=-1.18*ease(age/2);
  s.contents.visible=arrived;s.receiving.visible=arrived&&handoff>.5;
  s.receiving.material.opacity=handoff>.95?.32:.7;s.receiving.scale.setScalar(1+Math.sin(clock*1.4)*.035);
  s.letter.visible=memory==='letter';s.tools.visible=memory==='tools';
  const active=memory==='letter'?s.letter:s.tools;
  active.position.set(mix(.24,.03,handoff),mix(.73,.43,handoff)+Math.sin(handoff*Math.PI)*.11,mix(.32,.81,handoff));
  active.rotation.set(mix(-.18,.12,handoff),mix(.25,0,handoff),mix(.12,-.04,handoff));
  if(arrived){
   const adult=s.family.rigs[1],child=s.family.rigs[2];
   adult.pose(handoff>.95?(age<8?'thank':'watch'):'receive',clock*.7);child.pose(decision?.choice&&decision.age>=8?(decision.age<11?'thank':'use'):handoff>.5?'receive':'watch',clock*.7);
   adult.head.rotation.x=mix(.08,.18,handoff);adult.head.rotation.y=-.12;
   child.head.rotation.x=handoff>.6?.12:-.12;child.head.rotation.y=.2;
  }
  if(viewport){viewport.dataset.memoryChoice=memory;viewport.dataset.memoryHandoff=handoff.toFixed(3);}
  return {phrase:arrived?(handoff>.95?(memory==='letter'?'家书交到孩子手中，来时的故事在新家继续讲述。':'工具交到孩子手中，日常技能成为共同学习的事情。'):'家人打开行装，孩子等待接过一件带来的物品。'):memory==='letter'?'家人把一封原创家书道具带在身边，沿路保留记忆。':'家人带着生活工具，准备在抵达后继续劳动与学习。',handoff,memory};
 }
 if(stage==='culture'){
  const tradition=traditions.find(t=>t.id===settings.tradition)??traditions[0];changed('tradition',tradition.id);
  for(const card of s.cards){
   const selected=card.id===tradition.id;card.mat.color.setHex(selected?0xe2c995:0x708e80);
   card.selection.scale.copy(card.selectionScale);card.selection.scale.y*=selected?2:1;
   card.sign.material.opacity=selected?1:.64;card.sign.material.transparent=true;
  }
  // Exchange a resource and acknowledge an answer, without fabricating regional music.
  const participation=clock-beatHit,recent=participation>=0&&participation<2.5&&settings.culture==='learning';
  const phase=decision?(decision.choice?Math.min(7.1,decision.age+(decision.choice==='join'?4:0)):0):recent?(participation<.45?2.4+participation:3.6+participation-.45):clock%8,reply=decision?!!decision.choice&&(decision.choice==='join'?decision.age<3.2:decision.age>=4):phase>3.4&&phase<6.8;
  s.responseAge=phase;s.responseActive=reply;
  s.teacher.pose(decision&&!decision.choice?'watch':recent&&participation>1.5?'thank':reply?'watch':'use',clock*.65);s.child.pose(decision?.choice&&decision.age>=6?(decision.age<9?'thank':'watch'):recent&&participation>1.7?'thank':reply?'learn':'watch',clock*.65);
  s.teacher.head.rotation.y=.12;s.child.head.rotation.y=-.1;
  const passing=ease((phase-2.3)/1.3),returning=ease((phase-6.8)/1.2),amount=passing*(1-returning);
  s.audioHandoff=amount;
  s.record.position.set(mix(-.65,.49,amount),mix(.73,.43,amount)+Math.sin(amount*Math.PI)*.11,mix(2.87,2.86,amount));
  s.record.rotation.y=mix(0,-.12,amount);
  s.teacherRing.material.opacity=reply?.25:.65;s.childRing.material.opacity=reply?.8:.3;
  s.teacherRing.scale.setScalar(1+(reply?0:Math.sin(clock*1.3)*.035));s.childRing.scale.setScalar(1+(reply?Math.sin(clock*1.3)*.045:0));
  if(phase>6.35&&phase<7.3)s.teacher.pose('thank',clock*.65);
  if(viewport){viewport.dataset.tradition=tradition.id;viewport.dataset.socialLearning=reply?'回应':'观察';}
  return {phrase:`${tradition.name}资料卡被选中；示范者与孩子轮流观察、回应，共同整理学习记录。`,tradition:tradition.id};
 }
 const voice=civicVoices[settings.civicVoice]?settings.civicVoice:'resident';
 const plan=civicPlans[settings.civicPlan]?settings.civicPlan:'balanced',definition=civicPlans[plan];
 changed('voice',voice);changed('plan',plan);
 s.responseAge=Math.max(0,clock-s.times.plan);
 const age=Math.max(0,clock-s.times.voice),handoff=ease(age/1.6),speaker=s.actors[voice];
 const start=[speaker.position[0]+.12,.61,speaker.position[2]+.12],end=[-1.7,.735,.15];
 s.proposal.position.set(mix(start[0],end[0],handoff),mix(start[1],end[1],handoff)+Math.sin(handoff*Math.PI)*.23,mix(start[2],end[2],handoff));
 s.proposal.material.color.setHex(speaker.color);
 for(const [id,entry] of Object.entries(s.actors)){
  const active=id===voice,planAge=clock-s.times.plan,responds=plan==='balanced'||plan==='freight'&&id==='worker'||plan==='habitat'&&id!=='worker';
  entry.actor.pose(decision&&!decision.choice?'watch':planAge>2.5?(responds&&planAge<6?'thank':'watch'):active?'greet':'watch',clock*.65);
  entry.actor.head.rotation.y=active?.08:0;entry.glow.material.opacity=active?.9:.24;
  entry.glow.scale.setScalar(active?1+Math.sin(clock*1.15)*.04:1);
  entry.sign.material.transparent=true;entry.sign.material.opacity=active?1:.72;entry.note.visible=!active||handoff<.95;
 }
 for(const [id,marker] of Object.entries(s.planMarkers)){
  marker.pointer.visible=(!decision||!!decision.choice)&&id===plan;marker.disk.scale.copy(marker.diskScale).multiplyScalar(id===plan?1.16:1);
 }
 const bufferDt=Math.min(.1,Math.max(0,clock-(s.lastBufferClock??clock)));s.lastBufferClock=clock;
 s.bufferValue=mix(s.bufferValue,definition.buffer,1-Math.exp(-4*bufferDt));
 s.beds.forEach((bed,i)=>{
  const extent=clamp(s.bufferValue*6-i);bed.visible=extent>.015;bed.scale.setScalar(Math.max(.02,extent));
 });
 const waiting=Number(viewport?.dataset.waitingTrucks??9-definition.capacity);
 s.slots.forEach((line,i)=>line.material.color.setHex(i<waiting?0xe3d09a:0x939d80));
 s.baySign.material.transparent=true;s.baySign.material.opacity=waiting>0?1:.6;
 if(viewport){viewport.dataset.civicVoice=voice;viewport.dataset.civicPlan=plan;viewport.dataset.civicBuffer=s.bufferValue.toFixed(3);viewport.dataset.civicProposal=handoff.toFixed(3);}
 const remaining=plan==='freight'?'交接继续，生活与维护需求仍需协调':plan==='balanced'?'保留缓冲、轮换交接，仍有等待': '绿带扩大，货运交接需要继续安排';
 return {phrase:`${civicVoices[voice].name}提出需求；${definition.name}：${remaining}。`,voice,plan,buffer:s.bufferValue,proposal:handoff};
}
