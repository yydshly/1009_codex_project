import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createActor} from '../public/actor-rig.js';
function subgroup(parent,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;}
function solid(parent,color,pos=[0,0,0],size=[1,1,1]){const m=new THREE.Mesh(new THREE.BoxGeometry(),color?.isMaterial?color:new THREE.MeshBasicMaterial({color}));m.position.set(...pos);m.scale.set(...size);parent.add(m);return m;}
test('the actual rendered rig exposes foot support and performing instrument contacts',()=>{
 const world=new THREE.Group(),actor=createActor(world,0x577f79,1,'drum',{subgroup,box:solid,ball:solid,cylinder:solid});let steps=0,music=0;
 for(let i=0;i<180;i++){actor.beginFrame(1/60);actor.root.position.x=i*.007;actor.pose('walk',i/60);actor.applyPerformance({dt:1/60,time:i/60});steps+=actor.audioContacts.length;}
 assert(steps>=4,`Distance-driven gait emitted ${steps} footsteps`);
 for(let i=180;i<300;i++){actor.beginFrame(1/60);actor.pose('play',i/60);actor.applyPerformance({dt:1/60,time:i/60});music+=actor.audioContacts.length;}
 assert(music>=2,`Rendered drum emitted ${music} contacts`);
 for(let i=300;i<360;i++){actor.beginFrame(1/60);actor.pose('wait',i/60);actor.applyPerformance({dt:1/60,time:i/60});assert.deepEqual(actor.audioContacts,[]);}
});
