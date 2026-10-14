import assert from 'node:assert/strict';
import * as THREE from 'three';
import {cues} from '../public/journey.js';
import {annotationSpecs,layoutAnnotations} from '../public/story-annotations.js';
import {smoothFacing,responseCamera,responseEnvelope} from '../public/performance-motion.js';
import {bridgeFrame} from '../public/continuity.js';
import {createActor} from '../public/actor-rig.js';
import {performCharacters} from '../public/character-performance.js';

for(const c of cues)assert(annotationSpecs(c.id).length>0,`${c.id} needs a scene marker`);
const chosen=(id,choice,phase='回应',extra={})=>annotationSpecs(id,{decision:{choice,phase,age:9},...extra});
assert.equal(chosen('water-ice',null,'回应',{waterPlan:'field',outcome:{label:'回应'}})[0].anchor,'fieldGate');
assert(chosen('exchange-goods','cloth','回应',{goods:0})[1].title.includes('家人'));
assert(chosen('exchange-goods','supplies','回应',{goods:1})[1].title.includes('远行者'));
assert(chosen('memory-arrival','home')[0].title.includes('家书'));
assert(chosen('memory-arrival','water')[0].title.includes('工具'));
assert.equal(annotationSpecs('memory-practice',{decision:{choice:'join',phase:'变化',age:2}})[0].anchor,'practice');
assert.equal(annotationSpecs('memory-practice',{decision:{choice:'join',phase:'变化',age:4}})[0].anchor,'teacher');
assert.equal(annotationSpecs('memory-practice',{decision:{choice:'listen',phase:'变化',age:2}})[0].anchor,'teacher');
assert.equal(annotationSpecs('memory-practice',{decision:{choice:'listen',phase:'变化',age:4}})[0].anchor,'practice');
const receivedBeforeVoice=chosen('exchange-goods','supplies','变化',{goods:1,deliveries:1});assert.equal(receivedBeforeVoice[0].anchor,'receipt');assert(!receivedBeforeVoice[1].title.includes('等待'));
assert.equal(chosen('memory-practice','join')[0].anchor,'record');
assert(chosen('modern-limit','habitat')[0].title.includes('绿带'));
assert.equal(chosen('modern-limit','freight')[0].anchor,'truck');
let layouts=0;
for(const [w,h] of [[1280,720],[1024,768],[690,876],[390,844]])for(const dialogue of [false,true]){
 const points=[{x:w*.47,y:h*.35,z:.9,title:'交接',detail:'对应实际物件'},{x:w*.60,y:h*.4,z:.9,title:'回应',detail:'对应实际人物'}];
 const notes=layoutAnnotations(points,w,h,{dialogue});assert(notes.length>0);assert(notes.length<=(w<701?1:2));
 for(const n of notes){assert(n.x>=0&&n.x+n.w<=w);assert(n.y>=0&&n.y+n.h<h);assert(Number.isFinite(n.anchorX+n.anchorY+n.endX+n.endY));}
 if(notes.length===2){const [a,b]=notes;assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'Labels cannot overlap');}
 layouts++;
}
assert.equal(layoutAnnotations([{x:5,y:200,z:2}],1280,720).length,0,'Behind-camera anchors must hide');
assert(Math.abs(smoothFacing(Math.PI-.01,-Math.PI+.01,.1)-(Math.PI-.01))<.02,'Use the short turn across pi');
const start=[0,4,7],end=[20,4,7],look=[0,1,0],next=[20,1,0];
assert.deepEqual(bridgeFrame(start,end,look,next,0).position,start);
assert.deepEqual(bridgeFrame(start,end,look,next,1).position,end);
assert(bridgeFrame(start,end,look,next,.001).position[1]-4<1e-7,'Vertical lift must start without a sudden velocity');
for(const stage of ['market','people','culture','logistics']){
 const p={position:[4,3,7],target:[1,.8,0]},early=responseCamera(stage,p,0),late=responseCamera(stage,p,12);
 assert.deepEqual(p.position,[4,3,7]);assert.deepEqual(early.position,p.position);assert(late.position[2]>0,'Keep the camera on the action side');
 assert(responseEnvelope(8)>0&&responseEnvelope(20)===0,'Acknowledgement has a single bounded gesture');
}
const geometry=new THREE.SphereGeometry(1,8,6),material=new THREE.MeshBasicMaterial();
const subgroup=(p,v=[0,0,0])=>{const g=new THREE.Group();g.position.set(...v);p.add(g);return g;};
const shape=(p,c,v=[0,0,0],s=[1,1,1])=>{const m=new THREE.Mesh(geometry,material);m.position.set(...v);m.scale.set(...s);p.add(m);return m;};
const helpers={subgroup,ball:shape,box:shape,cylinder:shape};
for(const goods of [0,1,2]){
const world=new THREE.Group(),carrier=createActor(world,0,.99,null,helpers),receiver=createActor(world,0,.88,null,helpers);
carrier.root.position.set([-3.7,0,3.7][goods],0,-.04);receiver.root.position.set([-3.6,-.3,3.45][goods],0,.7);receiver.root.rotation.y=Math.PI;
const parcel=shape(carrier.root,0,[0,.63,.39],[.4,.3,.27]),receipt=shape(world,0,[0,0,0],[.4,.3,.27]);
world.userData={carrier,carried:parcel,receipts:[receipt,receipt,receipt],detail:{receivers:[receiver,receiver,receiver],child:receiver},exchangeState:{age:3.79,handover:true,pending:false},deliveryAt:-1};
const camera=new THREE.PerspectiveCamera(43,16/9,.1,100);camera.position.set(2,3,7);camera.lookAt(0,.7,0);
for(const age of [3.79,3.81,4.2]){
 world.userData.exchangeState.age=age;parcel.visible=age<3.8;receipt.visible=!parcel.visible;
 for(const a of [carrier,receiver]){a.beginFrame(1/60);a.pose('receive',age);}
 const viewport={dataset:{}};
 performCharacters({worlds:new Map([['market',world]]),stage:'market',actors:[carrier,receiver],settings:{goods},clock:age,time:age,dt:1/60,audio:{},camera,viewport});
 const side=goods===0?'right':'left';
 assert(carrier.worldHandPosition(side).distanceTo(receiver.worldHandPosition(side))<1e-6,'Shared handoff point must join both palms');
 assert.equal(viewport.dataset.contactOwner,age<3.8?'carrier':'receiver');
 const prop=age<3.8?parcel:receipt,hand=age<3.8?carrier.worldHandPosition(side):receiver.worldHandPosition(side);
 assert(prop.getWorldPosition(new THREE.Vector3()).distanceTo(hand.clone().add(new THREE.Vector3(0,.025,0)))<1e-6,'The object stays at the owning palm');
}
}
console.log(JSON.stringify({pass:true,cuesWithSceneMarkers:cues.length,branchMarkers:true,responsiveLayouts:layouts,shortTurn:true,smoothBridge:true,sharedMarketContact:true,propOwnership:true}));
