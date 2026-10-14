import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createActor} from '../public/actor-rig.js';

// These tests exercise coordinate transformations and playing/stopped audio
// state. They do not claim that amplitude animation is phoneme lip sync.
const geometry={
 ball:new THREE.SphereGeometry(1,8,6),
 box:new THREE.BoxGeometry(1,1,1),
 cylinder:new THREE.CylinderGeometry(1,1,1,8)
};
const material=new THREE.MeshBasicMaterial({color:0xffffff});
const subgroup=(parent,position=[0,0,0])=>{
 const group=new THREE.Group();group.position.set(...position);parent.add(group);return group;
};
const mesh=kind=>(parent,color,position,scale)=>{
 const item=new THREE.Mesh(geometry[kind],material);item.position.set(...position);item.scale.set(...scale);parent.add(item);return item;
};
const helpers={subgroup,box:mesh('box'),ball:mesh('ball'),cylinder:mesh('cylinder')};
const scene=new THREE.Scene();
let maximumContactError=0,contactCases=0;
for(const scale of [.59,.62,.94,1]){
 for(const rotation of [-1.1,.4,1.7]){
  const parent=subgroup(scene,[4,.2,-3]);parent.rotation.y=-.4;parent.scale.setScalar(1.3);
  const actor=createActor(parent,0x527e79,scale,null,helpers);
  actor.root.position.set(1,.05,2);actor.root.rotation.y=rotation;
  for(const side of ['left','right']){
   actor.beginFrame(1/30);actor.pose('receive',0);
   scene.updateMatrixWorld(true);
   const sign=side==='right'?1:-1;
   const target=actor.root.localToWorld(new THREE.Vector3(sign*.23,.62,.32)),original=target.clone();
   actor.reach(target,{side,weight:1});
   const error=actor.worldHandPosition(side).distanceTo(target);
   maximumContactError=Math.max(maximumContactError,error);contactCases++;
   assert(error<1e-6,`${scale}/${rotation}/${side}: contact error ${error}`);
   assert(target.equals(original),'reaching must not mutate its world target');
  }
  const farTarget=actor.root.localToWorld(new THREE.Vector3(.23,-2,5));
  actor.reach(farTarget,{side:'right',weight:1});
  const shoulder=actor.limbs.find(l=>l.side===1).arm.getWorldPosition(new THREE.Vector3());
  assert(actor.worldHandPosition('right').distanceTo(shoulder)<.561*scale*1.3,'unreachable target must respect arm length');
  assert.doesNotThrow(()=>JSON.stringify(actor.root.toJSON()),'rig lookup must not introduce enumerable circular userData');
  scene.remove(parent);
 }
}

const actor=createActor(scene,0x527e79,.62,'string',helpers);
actor.beginFrame(1/30);actor.pose('receive',.4);
const arm=actor.limbs[0].arm,onePose=arm.quaternion.clone();
actor.pose('receive',.4);
assert(onePose.equals(arm.quaternion),'the same pose repeated in one frame must not damp twice');
actor.pose('thank',.4);
assert(!onePose.equals(arm.quaternion),'a later distinct scene pose must remain available');

const gazeTarget=new THREE.Vector3(.2,1,.6),gazeCopy=gazeTarget.clone();
for(let frame=0;frame<30;frame++){
 actor.beginFrame(1/60);actor.pose('receive',frame/60);
 actor.applyPerformance({dt:1/60,time:frame/60,speaking:true,speechLevel:.7,target:gazeTarget,expression:'grateful'});
}
assert(actor.performance().openness>.98,'playing audible speech must open the mouth');
assert.equal(actor.performance().expression,'grateful');
assert(gazeTarget.equals(gazeCopy),'gaze must not mutate its world target');
assert(Number.isFinite(actor.head.rotation.x)&&Number.isFinite(actor.head.rotation.y));
assert(Math.abs(actor.head.rotation.y)<=.63,'head yaw must stay within its natural limit');
const audibleOpen=actor.performance().openness;
for(let frame=30;frame<90;frame++)actor.applyPerformance({dt:1/60,time:frame/60,speaking:false,speechLevel:1});
assert(actor.performance().openness<1e-5,'stopped audio closes the mouth even if the last envelope was loud');
for(let frame=90;frame<150;frame++)actor.applyPerformance({dt:1/60,time:frame/60,speaking:true,speechLevel:0});
assert(actor.performance().openness<1e-5,'silent audio must not invent mouth animation');

actor.beginFrame(1/30);actor.pose('walk',10);actor.applyPerformance({dt:1/30,time:10});
actor.beginFrame(1/30);actor.pose('walk',0);actor.applyPerformance({dt:1/30,time:0});
assert(Number.isFinite(actor.worldHandPosition().x),'seeking backwards must keep the rig finite');
for(const shape of Object.values(geometry))shape.dispose();material.dispose();
console.log(JSON.stringify({pass:true,contactCases,maximumContactError,audibleOpen,stoppedOpenness:actor.performance().openness,sameFramePoseDeduplicated:true,serializable:true},null,2));
