import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createActor} from '../public/actor-rig.js';
import {frameDelta,frameHold} from '../public/playback-clock.js';
const geometry=new THREE.SphereGeometry(1,8,6),material=new THREE.MeshBasicMaterial();
const subgroup=(p,pos=[0,0,0])=>{const g=new THREE.Group();g.position.set(...pos);p.add(g);return g;};
const shape=(p,c,pos=[0,0,0],size=[1,1,1])=>{const m=new THREE.Mesh(geometry,material);m.position.set(...pos);m.scale.set(...size);p.add(m);return m;};
const a={subgroup,ball:shape,box:shape,cylinder:shape};
const world=new THREE.Group(),family=subgroup(world,[24.35,0,3.05]);
const adult=createActor(family,0x444444,.94,null,a),child=createActor(family,0x888888,.62,null,a);
adult.root.position.set(.31,0,.07);child.root.position.set(.03,0,.62);
adult.root.rotation.y=Math.atan2(-.28,.55);child.root.rotation.y=Math.atan2(.28,-.55);
const meeting=family.localToWorld(new THREE.Vector3(.025,.58,.4));
adult.reach(meeting,{side:'left',weight:1});child.reach(meeting,{side:'right',weight:1});
assert(adult.worldHandPosition('left').distanceTo(meeting)<1e-8);
assert(child.worldHandPosition('right').distanceTo(meeting)<1e-8);
assert(adult.worldHandPosition('left').distanceTo(child.worldHandPosition('right'))<1e-8,'Ownership transfers at a shared point');
for(const fps of [12,18,30,60,120]){
 let t=1000,elapsed=0;for(let i=0;i<fps*10;i++){const next=t+1000/fps;elapsed+=frameDelta(next,t).story;t=next;}
 assert(Math.abs(elapsed-10)<1e-8,'Story time must be independent of render FPS');
}
assert.deepEqual(frameDelta(1200,1000,true),{story:0,animation:0});
assert.deepEqual(frameDelta(1000,0),{story:0,animation:0});
assert.equal(frameDelta(1200,1000).animation,.06);
assert.equal(frameDelta(1200,1000).story,.2,'Normal slow rendering still follows wall time');
assert(Math.abs(frameDelta(5000,1000).story-.06)<1e-9,'A blocked render must not skip into a new reply');
assert.equal(frameHold(5000,1000),3.94,'Record the actual held interval');
assert.equal(frameHold(5000,1000,true),0,'Hidden time is not a foreground blocking interval');
console.log('Performance story: shared family contact, scale/rotation, 12–120 FPS clock, hidden clock and animation cap passed.');
