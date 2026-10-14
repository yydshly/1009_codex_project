import * as THREE from 'three';
import {smoothFacing,smootherStep} from './performance-motion.js';
import {reactionFrame,expressionForRecipient} from './performance-presence.js';
const ease=v=>{v=THREE.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
const point=(actor,local)=>actor.root.localToWorld(new THREE.Vector3(...local));
const face=actor=>actor.head.getWorldPosition(new THREE.Vector3());
const placed=(prop,world)=>{prop.parent.updateWorldMatrix(true,false);prop.position.copy(prop.parent.worldToLocal(world.clone()));};

// Performance uses the playing PCM, while contact uses the same articulated
// hands in the live world and recording. Props are original teaching objects.
export function performCharacters({worlds,stage,actors,settings,decision,water,entry,clock,time,dt,audio,camera,viewport}){
 const g=worlds.get(stage);if(!g)return 0;g.updateWorldMatrix(true,true);
 const d=g.userData,s=d.social,targets=new Map(),expressions=new Map(),reactions=new Map();
 const pair=(a,b,expression='attentive')=>{if(!a||!b)return;targets.set(a,face(b));targets.set(b,face(a));expressions.set(a,expression);expressions.set(b,expression);};
 let speaker;
 if(stage==='oasis'){
  const w=d.waterStory;
  w.parent.root.rotation.y=smoothFacing(w.parent.root.rotation.y,Math.atan2(.45,.24),dt);w.child.root.rotation.y=smoothFacing(w.child.root.rotation.y,Math.atan2(-.45,-.24),dt);
  g.updateWorldMatrix(true,true);pair(w.parent,w.child,water?.home>.7?'warm':'thoughtful');
  const f=reactionFrame(water?.age??-1,{replyAt:9,pending:!water?.home});
  expressions.set(w.child,expressionForRecipient(f));
  if(f.hands>.35)targets.set(w.parent,w.cup.getWorldPosition(new THREE.Vector3()));
  targets.set(w.keeper,point(w.farmer,[0,.9,0]));targets.set(w.farmer,point(w.keeper,[0,.9,0]));
  if(audio?.id==='water-home')speaker=w.parent;if(audio?.id==='water-field')speaker=w.farmer;
  reactions.set(w.parent,f.acknowledge);reactions.set(w.farmer,reactionFrame(water?.age??-1,{replyAt:10}).acknowledge);
 }else if(stage==='market'){
  const recipient=d.detail.receivers[settings.goods],age=d.deliveryAt>=0?clock-d.deliveryAt:-1;
  const f=reactionFrame(age,{contactAt:.7,replyAt:4,pending:age<0});
  pair(recipient,d.carrier,expressionForRecipient(f));
  if(settings.goods===0&&age>1.5)pair(recipient,d.detail.child,f.phase==='reply'?'grateful':'warm');
  if(age>=0&&f.hands>.3)targets.set(recipient,d.receipts[settings.goods].getWorldPosition(new THREE.Vector3()));
  const facing=targets.get(recipient)?.clone().sub(recipient.root.getWorldPosition(new THREE.Vector3()));
  if(facing)recipient.root.rotation.y=smoothFacing(recipient.root.rotation.y,Math.atan2(facing.x,facing.z),dt);
  if(audio?.id?.startsWith('market-'))speaker=recipient;
  reactions.set(recipient,f.acknowledge);reactions.set(d.detail.child,reactionFrame(age,{replyAt:5}).acknowledge);
 }else if(stage==='people'){
  const adult=s.family.rigs[1],child=s.family.rigs[2];
  if(Number(viewport.dataset.familyProgress)>.78){adult.root.rotation.y=smoothFacing(adult.root.rotation.y,Math.atan2(-.28,.55),dt);child.root.rotation.y=smoothFacing(child.root.rotation.y,Math.atan2(.28,-.55),dt);}
  g.updateWorldMatrix(true,true);const f=reactionFrame(decision?.age??s.responseAge,{contactAt:5,replyAt:8,pending:decision?!decision.choice:Number(viewport.dataset.familyProgress)<=.78});pair(adult,child,expressionForRecipient(f));
  if(f.hands>.25&&Number(viewport.dataset.memoryHandoff)>.1){const prop=settings.memory==='tools'?s.tools:s.letter;targets.set(child,prop.getWorldPosition(new THREE.Vector3()));targets.set(adult,prop.getWorldPosition(new THREE.Vector3()));}
  if(['family-water','family-home','family-child'].includes(audio?.id))speaker=child;
  if(audio?.id==='family-memory')speaker=adult;
  reactions.set(child,f.acknowledge);reactions.set(adult,reactionFrame(decision?.age??s.responseAge,{replyAt:9,pending:decision?!decision.choice:false}).acknowledge);
 }else if(stage==='culture'){
  const f=reactionFrame(decision?.age??s.responseAge,{contactAt:3,replyAt:6,pending:decision?!decision.choice:false});
  pair(s.teacher,s.child,expressionForRecipient(f));
  if(decision?.choice&&decision.age<3.2)targets.set(s.child,s.teacher.worldHandPosition('right'));
  if(decision?.choice&&(decision.choice==='join'?decision.age<3.2:decision.age>=4&&decision.age<7.5))targets.set(s.child,g.localToWorld(new THREE.Vector3(-.48,.613,2.79)));
  if(audio?.id==='teacher')speaker=s.teacher;
  if(['culture-listen','culture-join','learner'].includes(audio?.id))speaker=s.child;
  reactions.set(s.teacher,f.acknowledge);reactions.set(s.child,reactionFrame(decision?.age??s.responseAge,{replyAt:7,pending:decision?!decision.choice:false}).acknowledge);
 }else if(stage==='logistics'){
  const role=audio?.id?.replace('civic-','');
  // The maintenance representative reads back the shared arrangement.
  // This does not claim that one policy choice resolves everybody's needs.
  speaker=s.actors[role]?.actor??(['balanced','freight','habitat'].includes(role)?s.actors.steward.actor:null);
  const active=speaker??s.actors[settings.civicVoice].actor;
  for(const [role,entry] of Object.entries(s.actors)){
   targets.set(entry.actor,entry.actor===active?point(s.actors.worker.actor,[0,.9,0]):face(active));
   const responds=settings.civicPlan==='balanced'||settings.civicPlan==='freight'&&role==='worker'||settings.civicPlan==='habitat'&&role!=='worker';
   const f=reactionFrame(decision?.age??s.responseAge,{replyAt:entry.actor===active?5:6,pending:decision?!decision.choice:false});
   expressions.set(entry.actor,(!decision||decision.choice)?(responds?expressionForRecipient(f):'concerned'):'attentive');
   reactions.set(entry.actor,f.acknowledge);
   if(decision?.choice&&decision.age>9&&!responds){const local=role==='worker'?[-5,.3,.7]:role==='resident'?[-.1,.3,-1.8]:[1,.3,-2.9];targets.set(entry.actor,g.localToWorld(new THREE.Vector3(...local)));}
  }
 }
 // Read the previous completed observation as a reason to look, not as a
 // choice already made in this case. Props and outcomes remain pending.
 if(entry&&!decision?.choice){
  if(stage==='market'){
   const recipient=d.detail.receivers[settings.goods];targets.set(recipient,entry.focus==='family'?face(d.detail.child):face(d.carrier));expressions.set(recipient,'thoughtful');
   if(entry.focus==='family')targets.set(d.detail.child,face(recipient));
  }else if(stage==='people'){
   const focus=entry.focus==='channel'?g.localToWorld(new THREE.Vector3(2.3,.2,-2)):s.letter.getWorldPosition(new THREE.Vector3());
   for(const a of s.family.rigs){a.pose('watch',clock);targets.set(a,focus);expressions.set(a,'attentive');}
  }else if(stage==='culture'){
   targets.set(s.child,s.teacher.worldHandPosition('right'));targets.set(s.teacher,face(s.child));
   if(entry.focus==='learner')s.child.reach(point(s.child,[.06,.7,.2]),{side:'right',weight:.45});
  }else if(stage==='logistics'){
   const first=s.actors[entry.focus]?.actor;if(first)for(const v of Object.values(s.actors))targets.set(v.actor,v.actor===first?g.localToWorld(new THREE.Vector3(-5,.3,.7)):face(first));
  }
  viewport.dataset.influenceApplied=entry.from+'>'+stage+':'+entry.focus;
 }else viewport.dataset.influenceApplied='';
 for(const actor of actors){
  if(!actor.root.visible)continue;
  actor.applyPerformance({dt,time,speechLevel:actor===speaker?audio?.level??0:0,speaking:actor===speaker&&audio?.speaking,target:targets.get(actor)??null,expression:expressions.get(actor)??'neutral',acknowledge:reactions.get(actor)??0});
 }
 g.updateWorldMatrix(true,true);
 if(stage==='people'&&Number(viewport.dataset.familyProgress)>.78){
  const amount=Number(viewport.dataset.memoryHandoff??0),adult=s.family.rigs[1],child=s.family.rigs[2];
  const meeting=s.family.group.localToWorld(new THREE.Vector3(.025,.58,.4));
  const start=point(adult,[-.07,.69,.24]),end=point(child,[.03,.72,.22]);
  const giving=start.clone().lerp(meeting,ease(amount/.45));
  const taking=meeting.clone().lerp(end,ease((amount-.65)/.35));
  adult.reach(giving,{side:'left',weight:1-ease((amount-.72)/.2)});
  child.reach(taking,{side:'right',weight:ease((amount-.18)/.22)});
  const owner=amount>.55?child:adult,hand=owner.worldHandPosition(amount>.55?'right':'left');
  const prop=settings.memory==='tools'?s.tools:s.letter;placed(prop,hand.add(new THREE.Vector3(0,.025,.015)));
  viewport.dataset.contactOwner=amount>.55?'child':'adult';
 }else if(stage==='oasis'&&water?.home>.7){
  const w=d.waterStory,drink=ease((water.age-6)/2),cupTarget=point(w.child,[-.08,.72+drink*.26,.2-drink*.09]);
  w.child.reach(cupTarget,{side:'left',weight:1});placed(w.cup,w.child.worldHandPosition('left').add(new THREE.Vector3(0,.035,0)));
  w.cup.rotation.z=-drink*.2;
 }else if(stage==='market'){
  const receiver=d.detail.receivers[settings.goods],exchange=d.exchangeState;
  if(exchange?.handover&&!exchange.pending){
   const carrier=d.carrier,from=carrier.root.getWorldPosition(new THREE.Vector3()),to=receiver.root.getWorldPosition(new THREE.Vector3()),side=to.x>from.x?'right':'left';
   const meeting=from.clone().lerp(to,.5);meeting.y=g.position.y+.64;d.receiptSide=side;
   carrier.reach(meeting,{side,weight:smootherStep((exchange.age-2.8)/.5)});
   receiver.reach(meeting,{side,weight:smootherStep((exchange.age-3.05)/.4)});
   const prop=d.carried.visible?d.carried:d.receipts[settings.goods];
   const hand=d.carried.visible?carrier.worldHandPosition(side):receiver.worldHandPosition(side);
   placed(prop,hand.add(new THREE.Vector3(0,.025,0)));
   viewport.dataset.contactOwner=d.carried.visible?'carrier':'receiver';
  }else{
  if(d.carried.visible){
   const target=point(d.carrier,[0,.72,.3]);
   d.carrier.reach(target.clone().add(new THREE.Vector3(.15,0,0)),{side:'right',weight:1});
   d.carrier.reach(target.clone().add(new THREE.Vector3(-.15,0,0)),{side:'left',weight:1});
   placed(d.carried,d.carrier.worldHandPosition('left').lerp(d.carrier.worldHandPosition('right'),.5));
   viewport.dataset.contactOwner='carrier';
  }
  const receipt=d.receipts[settings.goods];
  const age=d.deliveryAt>=0?clock-d.deliveryAt:-1;
  if(receipt.visible){
   const side=d.receiptSide??'right';
   if(settings.goods===0&&age>1.1){
    const child=d.detail.child,wear=ease((age-1.1)/2.1),cloth=point(child,[-.09,.72,.20]);
    receiver.reach(point(receiver,[.02,.77,.23]).lerp(cloth,wear),{side,weight:1-ease((age-4)/1.2)});
    placed(receipt,receiver.worldHandPosition(side).add(new THREE.Vector3(0,.035,0)));
    receipt.visible=wear<.98;
    viewport.dataset.contactOwner=wear>.95?'child':'receiver';
    if(age>3.2&&age<5.2)child.reach(point(child,[-.09,.70,.22]),{side:'left',weight:.7});
    viewport.dataset.objectUse=wear<.98?'cloth-reaches-child':'cloth-worn';
   }else if(settings.goods===2&&age>4){
    const table=g.localToWorld(new THREE.Vector3(3.7,.4,1.05)),put=ease((age-4)/1.4);
    receiver.reach(point(receiver,[.02,.77,.23]).lerp(table,put),{side,weight:1-put});
    placed(receipt,receiver.worldHandPosition(side).add(new THREE.Vector3(0,.035,0)).lerp(table,put));
    viewport.dataset.objectUse='craft-on-worktable';
   }else {receiver.reach(point(receiver,[.02,.77,.23]),{side,weight:1-ease((age-4)/2)});placed(receipt,receiver.worldHandPosition(side).add(new THREE.Vector3(0,.035,0)));if(settings.goods===1&&age>6){receipt.visible=false;viewport.dataset.objectUse='supplies-packed';}}
  }
  }
 }else if(stage==='culture'&&(!decision||decision.choice)){
  const child=s.child,age=decision?.age??s.responseAge,pickup=decision?ease((age-2.5)/1.5):s.audioHandoff,target=point(child,[-.1,1,.22]);
  child.reach(target,{side:'left',weight:pickup});
  const paperOrigin=g.localToWorld(new THREE.Vector3(-.31,.55,3.02));
  placed(s.record,paperOrigin.lerp(child.worldHandPosition('left').add(new THREE.Vector3(0,.025,0)),pickup));
  const replying=decision?(decision.choice==='join'?age<3.2:age>=4&&age<7.5):s.responseActive;
  const beat=((clock*1.25)%1+1)%1,lift=.065*Math.sin(Math.PI*beat)**2;
  const tap=g.localToWorld(new THREE.Vector3(-.48,.613,2.79));
  if(replying){
   child.reach(tap.clone().add(new THREE.Vector3(0,lift,0)),{side:'right',weight:.96});
  }else if(age<4){
   const gesture=point(s.teacher,[.10,.75,.30+Math.sin(clock*2.5)*.025]);
   s.teacher.reach(gesture,{side:'right',weight:.92});
  }
  if(s.practiceSkin)s.practiceSkin.scale.y=.009*(1-(replying?Math.exp(-beat*20)*.025:0));
  viewport.dataset.culturalAction=replying?'generic-rhythm-response':'observe-hand-demonstration';
 }else if(stage==='logistics'){
  for(const {actor,note} of Object.values(s.actors)){
   if(!note.visible)continue;
   actor.reach(point(actor,[.16,.68,.23]),{side:'right',weight:.9});
   placed(note,actor.worldHandPosition('right').add(new THREE.Vector3(0,.025,0)));
  }
  const active=s.actors[settings.civicVoice].actor;
  active.reach(g.localToWorld(new THREE.Vector3(-1.7,.76,.15)),{side:'left',weight:ease(s.audioHandoff??Number(viewport.dataset.civicProposal??0))*.75});
 }
 if(stage==='people')d.workers.forEach((actor,i)=>{
  if(!actor.root.visible)return;
  const tool=d.workerTools[i],stroke=.055*Math.sin(clock*1.8+i*2.2);
  tool.position.set(.20,.51+stroke,.30);tool.rotation.x=-.14+stroke;
  const grip=tool.getWorldPosition(new THREE.Vector3());actor.reach(grip,{side:'right',weight:.98});
  actor.reach(grip.clone().add(new THREE.Vector3(0,-.13,.012)),{side:'left',weight:.86});
 });
 let pan=0;
 if(speaker){const screen=face(speaker).project(camera);pan=THREE.MathUtils.clamp(screen.x*.5,-.65,.65);}
 viewport.dataset.speakingActor=speaker&&audio?.speaking?audio.id:'';
 viewport.dataset.speechEnvelope=(audio?.level??0).toFixed(3);
 viewport.dataset.characterPerformance='object-gaze-reaction-and-contact';
 return pan;
}
