import * as THREE from 'three';
import {footCycle,instrumentFrame} from './actor-motion.js';
import {surfaceMaterial} from './surface.js';
import {footContacts,instrumentContacts} from './audio-design.js';

// Original, deliberately simplified people. Clothing and gestures are not
// reconstructions of a particular community, historical person or repertoire.
let actorSerial=0;
const down=new THREE.Vector3(0,-1,0);
const clamp=THREE.MathUtils.clamp;
const damp=(current,target,rate,dt)=>THREE.MathUtils.damp(current,target,rate,dt);
const smooth=(value)=>{const x=clamp(value,0,1);return x*x*(3-2*x);};
const vector=(value)=>value?.isVector3?value.clone():Array.isArray(value)?new THREE.Vector3(...value):null;
const coatGeometry=new THREE.LatheGeometry([[0,-.87],[1.02,-.87],[.98,-.58],[.81,-.15],[.96,.14],[.90,.37],[.57,.51],[0,.51]].map(p=>new THREE.Vector2(...p)),24);

export function createActor(parent,color=0x577f79,scale=1,instrument,helpers){
 const {subgroup,box,ball,cylinder}=helpers;
 const serial=actorSerial++,seed=(serial*.61803398875)%1;
 const child=scale<.76,skin=child?0xdcb995:0xd5ac87;
 const skinMat=surfaceMaterial(skin,{roughness:.72},'skin');
 const root=subgroup(parent);root.scale.setScalar(scale);
 const coat=surfaceMaterial(color,{roughness:.95},'textile'),trousers=surfaceMaterial(0x394346,{roughness:.95},'textile');
 const hips=subgroup(root,[0,.49,0]);
 const torso=new THREE.Mesh(coatGeometry,coat);torso.position.set(0,.21,0);torso.scale.set(.21,.44,.16);torso.castShadow=true;torso.receiveShadow=true;hips.add(torso);
 cylinder(hips,skinMat,[0,.47,0],[.087,.083,.085]);
 cylinder(hips,coat,[0,.432,0],[.115,.038,.107]);
 const seam=surfaceMaterial(new THREE.Color(color).multiplyScalar(.82),{roughness:1},'textile');
 for(const side of [-1,1]){
  const lapel=box(hips,seam,[side*.04,.30,.146],[.029,.25,.018]);lapel.rotation.z=side*.19;
  box(hips,seam,[side*.124,.035,.132],[.075,.018,.019]);
 }
 for(let i=0;i<3;i++)ball(hips,0xc1ad87,[0,.30-i*.083,.153],[.009,.009,.006]);
 box(hips,seam,[0,.065,.136],[.325,.025,.027]);
 // The head joint stays compatible with older scene choreography and props.
 const head=subgroup(hips,[0,.62,0]);head.scale.setScalar(child?1.075:1);
 ball(head,skinMat,[0,-.008,0],[child?.149:.143,.177,.139]);
 const jaw=ball(head,skinMat,[0,-.105,.016],[.098,.077,.108]);
 const hairColor=[0x373332,0x4b3c33,0x302f2c][serial%3];
 ball(head,hairColor,[0,.097,-.023],[.148,.093,.132]);
 for(const side of [-1,1]){
  ball(head,hairColor,[side*.126,.041,-.028],[.025,.065,.088]);
  ball(head,skinMat,[side*.143,-.008,0],[.024,.039,.028]);
  ball(head,0xbb8c70,[side*.147,-.008,.017],[.011,.022,.012]);
 }
 // Small separated whites, irises and brows make eye contact legible without
 // turning the teaching figures into caricatures.
 const eyes=[],brows=[],cheeks=[];
 for(const side of [-1,1]){
  const eye=subgroup(head,[side*.052,.027,.128]);
  const white=ball(eye,0xe9e3d8,[0,0,0],[.021,.0118,.010]);
  const iris=ball(eye,0x3b332b,[0,0,.0085],[.009,.0094,.004]);
  const pupil=ball(eye,0x1e2424,[0,0,.011],[.0047,.0062,.0026]);
  const highlight=ball(eye,0xf4eadb,[-.0025,.003,.013],[.0018,.0018,.001]);
  const brow=box(head,hairColor,[side*.052,.057,.12],[.036,.006,.006]);
  brow.rotation.z=side*-.06;brows.push({mesh:brow,side});
  const cheek=ball(head,skinMat,[side*.071,-.035,.109],[.053,.034,.025]);cheeks.push(cheek);
  const upperLid=ball(eye,skinMat,[0,.012,.006],[.023,.003,.009]);
  const lowerLid=ball(eye,skinMat,[0,-.011,.006],[.022,.003,.008]);
  eyes.push({group:eye,white,iris,pupil,highlight,upperLid,lowerLid});
 }
 ball(head,0xc79a79,[0,-.013,.139],[.021,.03,.022]);
 ball(head,skinMat,[0,-.032,.145],[.018,.012,.016]);
 const mouth=subgroup(head,[0,-.066,.133]);
 const cavity=ball(mouth,0x573c38,[0,0,0],[.024,.0035,.006]);
 const upperLip=ball(mouth,0xa07262,[0,.004,.003],[.026,.0036,.003]);
 const lowerLip=ball(mouth,0xb07f6c,[0,-.004,.0035],[.025,.0038,.003]);
 const corners=[-1,1].map(side=>ball(mouth,0x8d6355,[side*.025,0,.001],[.003,.003,.002]));
 const limbs=[],hands={};
 for(const side of [-1,1]){
  const arm=subgroup(hips,[side*.23,.39,0]);
  cylinder(arm,coat,[0,-.145,0],[.066,.29,.065]);
  ball(arm,color,[0,-.012,0],[.067,.071,.062]);
  const elbow=subgroup(arm,[0,-.3,0]);
  cylinder(elbow,coat,[0,-.115,0],[.055,.23,.054]);
  ball(elbow,color,[0,-.009,0],[.057,.06,.054]);
  const hand=subgroup(elbow,[0,-.26,0]);
  ball(hand,skinMat,[0,0,.005],[.046,.055,.037]);
  const fingers=[];
  for(let i=0;i<4;i++){
   const finger=subgroup(hand,[-.027+i*.017,-.025,.015]);
   cylinder(finger,skinMat,[0,-.023,0],[.009,.045-(i===3?.009:0),.009]);
   ball(finger,skinMat,[0,-.044+(i===3?.009:0),0],[.009,.01,.009]);
   fingers.push(finger);
  }
  const thumb=subgroup(hand,[-side*.043,-.005,.025]);
  cylinder(thumb,skinMat,[0,-.015,0],[.012,.03,.012]);thumb.rotation.z=side*.47;
  const leg=subgroup(root,[side*.11,.49,0]);
  cylinder(leg,trousers,[0,-.105,0],[.075,.21,.075]);
  const knee=subgroup(leg,[0,-.22,0]);
  cylinder(knee,trousers,[0,-.085,0],[.065,.17,.065]);
  const ankle=subgroup(knee,[0,-.205,0]);
  box(ankle,0x273134,[0,-.005,.045],[.16,.095,.24]);
  const limb={arm,elbow,leg,knee,ankle,hand,fingers,thumb,side};
  limbs.push(limb);hands[side]=hand;hands[side===1?'right':'left']=hand;
 }
 let instrumentBody;
 if(instrument==='string'){
  const lute=subgroup(hips,[.04,.15,.24]);
  const wood=surfaceMaterial(0xb1864e,{roughness:.8},'wood');
  ball(lute,wood,[0,0,0],[.14,.21,.075]);
  box(lute,wood,[-.065,.29,0],[.048,.5,.05]);lute.rotation.z=.20;
  ball(lute,0x55452e,[0,.065,.077],[.027,.032,.004]);
  for(let i=0;i<2;i++)box(lute,0xe4c993,[-.006+i*.014,.18,.074],[.002,.59,.002]);
  for(let i=0;i<7;i++)box(lute,0xc6ab78,[-.067,.17+i*.047,.033],[.055,.005,.005]);
  instrumentBody=lute;
 }
 if(instrument==='drum'){
  cylinder(hips,0xbc8857,[0,.14,.25],[.2,.075,.2]).rotation.x=Math.PI/2;
  instrumentBody=cylinder(hips,0xe3d2aa,[0,.14,.297],[.188,.012,.188]);instrumentBody.rotation.x=Math.PI/2;
 }
 const state={dt:1/60,lastPoseTime:null,mode:'idle',time:0,offset:seed*Math.PI*2,
  lookTarget:null,gazeX:0,gazeY:0,baseHeadX:0,baseHeadY:0,
  expression:'neutral',smile:0,concern:0,mouthOpen:0,speaking:false,eyeLeadX:0,eyeLeadY:0,eyeDart:0,nextDart:1.2+seed*2,
  nextBlink:1.8+seed*2.6,blinkStart:-100,lastPerformanceTime:null,frame:0,framePose:null,reachRequests:new Map(),lastFootPosition:null,gaitPhase:seed,gaitSpeed:0,gaitBlend:0};
 const roleSide=(side)=>side==='left'||side===-1?-1:1;

 function pose(mode,t,offset=0){
  const previousPose=state.framePose;
  if(state.frame>0&&previousPose?.frame===state.frame&&previousPose.mode===mode&&previousPose.time===t&&previousPose.offset===offset)return actor;
  state.framePose={frame:state.frame,mode,time:t,offset};
  // Several scene layers may propose poses in one frame. Blend the final one
  // from the previous rendered pose, rather than accumulating every proposal.
  if(state.basePose)for(const {object,position,quaternion,scale} of state.basePose){object.position.copy(position);object.quaternion.copy(quaternion);object.scale.copy(scale);}
  const delta=state.lastPoseTime===null?state.dt:t-state.lastPoseTime;
  // Pose time may be rescaled by a scene. applyPerformance supplies the actual
  // frame delta once available; before then, infer it safely from this clock.
  const dt=clamp(state.performanceDt??(delta>0&&delta<.25?delta:state.dt),0,.1);
  state.dt=dt;state.lastPoseTime=t;state.time=t;state.mode=mode;
  state.reachRequests.clear();
  const phase=offset+state.offset,pulse=Math.sin(t*3.8+phase);
  const walk=mode==='walk'||mode==='carry',dance=mode==='dance';
  const perform=['play','learn','use','work'].includes(mode),carry=mode==='carry'||mode==='receive';
  const bob=mode==='sit'?-.22:walk?Math.abs(pulse)*.008:dance?Math.abs(pulse)*.015:.003*Math.sin(t*1.7+phase);
  hips.position.y=damp(hips.position.y,.5175+bob,9,dt);
  // A small lateral weight shift and shoulder breath keep waiting alive.
  hips.position.x=damp(hips.position.x,walk?Math.sin(t*3.8+phase)*.006:Math.sin(t*.43+phase)*.010,7,dt);
  hips.rotation.z=damp(hips.rotation.z,walk?pulse*.02:dance?Math.sin(t*1.9+phase)*.035:Math.sin(t*.58+phase)*.010,7,dt);
  torso.scale.x=damp(torso.scale.x,.21*(1+.009*Math.sin(t*1.6+phase)),7,dt);
  state.baseHeadX=mode==='thank'?.11+.035*Math.sin(t*2+phase):perform?.06:mode==='watch'?-.04:0;
  state.baseHeadY=mode==='wait'?Math.sin(t*.31+phase)*.075:0;
  head.rotation.x=damp(head.rotation.x,state.baseHeadX+state.gazeX,8,dt);
  head.rotation.y=damp(head.rotation.y,state.baseHeadY+state.gazeY,8,dt);
  for(const {arm,elbow,leg,knee,hand,fingers,side} of limbs){
   leg.rotation.x=damp(leg.rotation.x,mode==='sit'?-1.4:walk?pulse*side*.41:dance?pulse*side*.1:0,10,dt);
   knee.rotation.x=damp(knee.rotation.x,mode==='sit'?1.5:walk?Math.max(0,-pulse*side)*.54:0,10,dt);
   arm.rotation.y=damp(arm.rotation.y,0,10,dt);
   arm.rotation.z=damp(arm.rotation.z,dance?side*(-.62+Math.sin(t*1.9+phase)*.18):carry?side*.15:perform?-side*.21:mode==='thank'?-side*.14:side*.055,9,dt);
   arm.rotation.x=damp(arm.rotation.x,carry?-1.0:walk?-pulse*side*.32:perform?-.92+Math.sin(t*3.8+phase)*.055:mode==='greet'&&side===1?-1.08:mode==='thank'?-.38:0,9,dt);
   elbow.rotation.y=damp(elbow.rotation.y,0,9,dt);elbow.rotation.z=damp(elbow.rotation.z,0,9,dt);
   elbow.rotation.x=damp(elbow.rotation.x,carry?-.58:perform?-.55+Math.sin(t*3.8+phase+side)*.06:mode==='greet'?-.42:mode==='thank'?-.38:0,9,dt);
   hand.rotation.x=damp(hand.rotation.x,carry?-.15:perform?-.08:0,9,dt);
   hand.rotation.y=damp(hand.rotation.y,carry?side*.16:0,9,dt);
   for(const finger of fingers)finger.rotation.x=damp(finger.rotation.x,carry?-.72:perform?-.42:-.18,9,dt);
  }
 }

 function lookAt(target){state.lookTarget=vector(target);return actor;}

 function beginFrame(dt){
  state.frame++;state.dt=clamp(Number.isFinite(dt)?dt:1/60,0,.1);state.performanceDt=state.dt;
  state.basePose=[hips,head,torso,...limbs.flatMap(l=>[l.arm,l.elbow,l.leg,l.knee,l.hand,...l.fingers])].map(object=>({object,position:object.position.clone(),quaternion:object.quaternion.clone(),scale:object.scale.clone()}));
  return actor;
 }

 function solveReach(target,{side='right',weight=1}={}){
  const limb=limbs.find(l=>l.side===roleSide(side));
  const amount=clamp(weight,0,1);if(!limb||!target||amount<=0)return;
  root.updateWorldMatrix(true,true);
  // Solve in the shoulder parent's coordinates so scaled children, translated
  // families and rotating stages use the same physical arm lengths.
  const end=hips.worldToLocal(target.clone()),shoulder=limb.arm.position.clone();
  const delta=end.clone().sub(shoulder),length=delta.length();if(length<1e-7)return;
  const upper=.3,lower=.26,distance=clamp(length,.065,upper+lower-.004),axis=delta.divideScalar(length);
  const bend=new THREE.Vector3(limb.side*.23,0,1);
  bend.addScaledVector(axis,-bend.dot(axis));
  if(bend.lengthSq()<1e-6)bend.set(limb.side,0,0).addScaledVector(axis,-limb.side*axis.x);
  bend.normalize();
  const along=(upper*upper-lower*lower+distance*distance)/(2*distance);
  const height=Math.sqrt(Math.max(0,upper*upper-along*along));
  const elbowPoint=shoulder.clone().addScaledVector(axis,along).addScaledVector(bend,height);
  const armQ=new THREE.Quaternion().setFromUnitVectors(down,elbowPoint.clone().sub(shoulder).normalize());
  const foreDirection=shoulder.clone().addScaledVector(axis,distance).sub(elbowPoint).normalize();
  const foreLocal=foreDirection.applyQuaternion(armQ.clone().invert());
  const elbowQ=new THREE.Quaternion().setFromUnitVectors(down,foreLocal);
  // Choreography controls the reach weight. At one, contact is exact instead
  // of a lagging approximation that makes the parcel float outside the palm.
  limb.arm.quaternion.slerp(armQ,amount);limb.elbow.quaternion.slerp(elbowQ,amount);
  for(const finger of limb.fingers)finger.rotation.x=damp(finger.rotation.x,-.88,12,state.dt);
  limb.hand.rotation.x=damp(limb.hand.rotation.x,-.06,12,state.dt);
  root.updateWorldMatrix(true,true);
 }

 function reach(target,options={}){
  const point=vector(target);if(!point)return actor;
  const side=roleSide(options.side);state.reachRequests.set(side,{target:point,options:{...options,side}});
  solveReach(point,{...options,side});return actor;
 }

 function worldHandPosition(side='right',destination=new THREE.Vector3()){
  root.updateWorldMatrix(true,true);return hands[roleSide(side)].getWorldPosition(destination);
 }

 function groundFootwork(dt){
  root.updateWorldMatrix(true,true);
  const here=root.getWorldPosition(new THREE.Vector3()),worldScale=root.getWorldScale(new THREE.Vector3()).x;
  const distance=state.lastFootPosition?here.distanceTo(state.lastFootPosition)/Math.max(.01,worldScale):0;
  state.lastFootPosition=here.clone();
  const walking=['walk','carry'].includes(state.mode),speed=dt>0&&distance<.35?distance/dt:0;
  state.gaitSpeed=damp(state.gaitSpeed,walking?Math.min(speed,1.4):0,8,dt);
  state.gaitBlend=damp(state.gaitBlend,walking?clamp(state.gaitSpeed/.12,0,1):0,12,dt);
  const previous=state.gaitPhase;state.gaitPhase+=walking&&distance<.35?Math.min(distance,.035)/(root.userData.stride??.44):0;
  state.audioContacts=footContacts(previous,state.gaitPhase,state.gaitBlend,walking&&speed>.035);
  if(state.mode==='sit')return;
  for(const limb of limbs){
   const f=footCycle(state.gaitPhase+(limb.side===1?.5:0),.22),blend=state.gaitBlend;
   limb.leg.position.y=hips.position.y;limb.leg.position.x=limb.side*.11+hips.position.x*.65;
   const pitch=f.pitch*blend,sole=.0525*Math.cos(pitch)+.165*Math.abs(Math.sin(pitch));
   const target=new THREE.Vector3(limb.side*.11,.04/root.scale.x+sole+f.lift*blend,f.z*blend);
   const delta=target.sub(limb.leg.position),distance=clamp(delta.length(),.07,.423),axis=delta.normalize();
   // Positive-z knee bend, exact joint lengths, and a level sole during stance.
   const bend=new THREE.Vector3(0,0,1).addScaledVector(axis,-axis.z).normalize();
   const along=(.22*.22-.205*.205+distance*distance)/(2*distance),h=Math.sqrt(Math.max(0,.22*.22-along*along));
   const upper=axis.clone().multiplyScalar(along).addScaledVector(bend,h);
   const q=new THREE.Quaternion().setFromUnitVectors(down,upper.clone().normalize());
   const lower=axis.clone().multiplyScalar(distance).sub(upper).normalize().applyQuaternion(q.clone().invert());
   limb.leg.quaternion.copy(q);limb.knee.quaternion.setFromUnitVectors(down,lower);
   limb.ankle.rotation.x=-limb.leg.rotation.x-limb.knee.rotation.x+pitch;
  }
 }

 function applyPerformance({dt=state.dt,time=state.time,speechLevel=0,speaking=false,target,expression,acknowledge=0}={}){
  dt=clamp(Number.isFinite(dt)?dt:1/60,0,.1);state.dt=dt;state.performanceDt=dt;
  groundFootwork(dt);
  state.audioContacts.push(...instrumentContacts(state.instrumentTime??null,time,instrument,state.mode==='play'));
  state.instrumentTime=time;
  if(instrument&&state.mode==='play'){
   const f=instrumentFrame(instrument,time);
   reach(root.localToWorld(new THREE.Vector3(...f.left)),{side:'left',weight:.96});
   reach(root.localToWorld(new THREE.Vector3(...f.right)),{side:'right',weight:.96});
   if(instrument==='drum')instrumentBody.scale.x=.188*(1-f.pulse*.009);
  }
  if(target!==undefined)state.lookTarget=vector(target);
  if(expression)state.expression=expression;
  state.speaking=Boolean(speaking);
  const effectiveExpression=state.expression==='neutral'&&['thank','greet'].includes(state.mode)?'warm':state.expression;
  state.smile=damp(state.smile,['warm','happy','grateful','encouraging'].includes(effectiveExpression)?1:effectiveExpression==='attentive'?.2:0,6,dt);
  state.concern=damp(state.concern,['concerned','thoughtful'].includes(effectiveExpression)?1:0,6,dt);
  if(state.lookTarget){
   root.updateWorldMatrix(true,true);
   const local=hips.worldToLocal(state.lookTarget.clone()).sub(head.position);
   const yaw=clamp(Math.atan2(local.x,local.z),-.62,.62);
   const pitch=clamp(-Math.atan2(local.y,Math.hypot(local.x,local.z)),-.34,.34);
   // The eyes find the object first; the head follows with its slower damping.
   state.eyeLeadY=damp(state.eyeLeadY,yaw-state.baseHeadY-state.gazeY,18,dt);
   state.eyeLeadX=damp(state.eyeLeadX,pitch-state.baseHeadX-state.gazeX,18,dt);
   state.gazeY=damp(state.gazeY,yaw-state.baseHeadY,6.5,dt);
   state.gazeX=damp(state.gazeX,pitch-state.baseHeadX,6.5,dt);
  }else{
   state.gazeX=damp(state.gazeX,0,5,dt);state.gazeY=damp(state.gazeY,0,5,dt);
   state.eyeLeadX=damp(state.eyeLeadX,0,12,dt);state.eyeLeadY=damp(state.eyeLeadY,0,12,dt);
  }
  head.rotation.x=damp(head.rotation.x,state.baseHeadX+state.gazeX+clamp(acknowledge,0,1)*.11,9,dt);
  head.rotation.y=damp(head.rotation.y,state.baseHeadY+state.gazeY,9,dt);
  head.rotation.z=damp(head.rotation.z,(state.smile*.022-state.concern*.017)*(seed>.5?1:-1)+acknowledge*.025,7,dt);
  // speechLevel is the measured audio envelope supplied by the soundscape,
  // not a random speaking oscillation. This is amplitude sync, not phonemes.
  const measured=clamp(Number.isFinite(speechLevel)?speechLevel:0,0,1);
  const openness=speaking?smooth((measured-.018)/.65):0;
  state.mouthOpen=damp(state.mouthOpen,openness,openness>state.mouthOpen?25:17,dt);
  const open=state.mouthOpen,smile=state.smile;
  cavity.scale.set(.024*(1-.17*open)+.004*smile,.0035+.015*open,.006);
  cavity.position.y=-.004*open;
  upperLip.position.y=.004+.005*open;upperLip.scale.x=.026+.004*smile;upperLip.rotation.z=smile*(seed-.5)*.09;
  lowerLip.position.y=-.004-.016*open;lowerLip.scale.x=.025-.003*open+.003*smile;
  corners.forEach((corner,i)=>{corner.position.x=(i===0?-1:1)*(.025+.004*smile);corner.position.y=.0055*smile*(i===0?1:1.12)-.003*open;});
  jaw.position.y=-.105-open*.008;
  cheeks.forEach(cheek=>cheek.position.y=-.035+.005*smile);
  for(const {mesh,side} of brows){mesh.position.y=.057+.002*smile+.003*state.concern+(speaking?.0015*measured:0);mesh.rotation.z=side*(-.06-.19*state.concern);}
  // Staggered blink schedules keep adjacent people from blinking together.
  // A paused content clock naturally freezes a blink with the rest of the scene.
  if(state.lastPerformanceTime!==null&&(time<state.lastPerformanceTime-.1||time>state.lastPerformanceTime+1)){
   state.blinkStart=-100;state.nextBlink=time+1.8+seed*2.6;
   state.nextDart=time+1.2+seed*2;
  }
  state.lastPerformanceTime=time;
  if(time>=state.nextBlink){state.blinkStart=time;state.nextBlink=time+2.8+((seed+time*.137)%1)*2.6;}
  const age=time-state.blinkStart,blink=age>=0&&age<.2?Math.sin(age/.2*Math.PI):0;
  if(time>=state.nextDart){state.eyeDart=(Math.sin(time*2.1+seed*8))*.0008;state.nextDart=time+1.1+((seed+time*.21)%1)*2.4;}
  for(const eye of eyes){
   const lid=clamp(blink+smile*.09+state.concern*.055,0,1);
   eye.upperLid.position.y=.012-.006*lid;eye.upperLid.scale.y=.003+.010*lid;
   eye.lowerLid.position.y=-.011+.002*lid;eye.lowerLid.scale.y=.003+.002*lid;
   eye.white.scale.y=Math.max(.0007,.0118*(1-.90*blink));
   eye.iris.visible=eye.pupil.visible=eye.highlight.visible=blink<.9;
   const gazeX=clamp(state.gazeY*.004+state.eyeLeadY*.011+state.eyeDart,-.006,.006),gazeY=clamp(-state.gazeX*.005-state.eyeLeadX*.01,-.0035,.0035);
   eye.iris.position.set(gazeX,gazeY,.0085);eye.pupil.position.set(gazeX,gazeY,.011);eye.highlight.position.set(gazeX-.0025,gazeY+.003,.013);
  }
  for(const {target:point,options} of state.reachRequests.values())solveReach(point,options);
  return actor;
 }
 const actor={root,hips,head,limbs,hands,instrument,pose,lookAt,beginFrame,applyPerformance,reach,worldHandPosition,
  clothing:{torso,coat,trousers,trim:hips.children.filter(m=>m.isMesh&&m.material===seam)},
  face:{eyes,brows,mouth,cavity,upperLip,lowerLip},
  get audioContacts(){return state.audioContacts??[];},audioIdentity:serial,
  performance(){return {speaking:state.speaking,openness:state.mouthOpen,expression:state.expression,gazeX:state.gazeX,gazeY:state.gazeY,gaitBlend:state.gaitBlend,gaitPhase:state.gaitPhase};}};
 // Allow scene traversal to discover a rig without introducing a circular
 // enumerable userData field into Three.js exports or debugging snapshots.
 Object.defineProperty(root.userData,'actor',{value:actor,configurable:true});
 return actor;
}
