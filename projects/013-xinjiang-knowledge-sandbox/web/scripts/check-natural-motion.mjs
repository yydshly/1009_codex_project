import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createActor} from '../public/actor-rig.js';
import {footCycle,instrumentFrame} from '../public/actor-motion.js';
import {installTerrainArrival} from '../public/terrain-arrival.js';
import {terrainDimensions} from '../public/geo.js';
import {readFileSync} from 'node:fs';
const shapes={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,8,6),cylinder:new THREE.CylinderGeometry(1,1,1,8)};
const helpers={subgroup:(p,pos=[0,0,0])=>{const g=new THREE.Group();g.position.set(...pos);p.add(g);return g;}};
for(const k of Object.keys(shapes))helpers[k]=(p,c,pos,size)=>{const m=new THREE.Mesh(shapes[k],new THREE.MeshBasicMaterial());m.position.set(...pos);m.scale.set(...size);p.add(m);return m;};
let minSole=Infinity,maxStopBlend=0;
for(const scale of [.59,1]){
 const g=new THREE.Group(),a=createActor(g,0x527e79,scale,'string',helpers);
 for(let i=0;i<240;i++){
  a.root.position.z=i<120?i*.006:120*.006;a.beginFrame(1/60);a.pose('walk',i/60);a.applyPerformance({dt:1/60,time:i/60});g.updateMatrixWorld(true);
  for(const l of a.limbs){const bottom=new THREE.Box3().setFromObject(l.ankle).min.y;minSole=Math.min(minSole,bottom);assert(bottom>.034,'sole should not cut through the set floor');}
 }
 assert(a.performance().gaitBlend<.001,'stationary walker must finish its stride');maxStopBlend=Math.max(maxStopBlend,a.performance().gaitBlend);
}
for(let i=0;i<1000;i++){const f=footCycle(i/1000);assert(f.lift>=0&&f.lift<.07);assert(!f.stance||f.lift===0);}
for(const kind of ['string','drum'])assert(instrumentFrame(kind,1).left.every(Number.isFinite));
const repeated=createActor(new THREE.Group(),0x527e79,1,null,helpers);repeated.beginFrame(1/60);repeated.pose('thank',1);const final=repeated.limbs[0].arm.quaternion.clone();repeated.pose('walk',1);repeated.pose('thank',1);assert(final.equals(repeated.limbs[0].arm.quaternion),'scene layers should not damp the final action multiple times');
const dem=JSON.parse(readFileSync(new URL('../public/assets/xinjiang-dem.json',import.meta.url),'utf8'));
const geo=new THREE.PlaneGeometry(4,3,2,2);geo.rotateX(-Math.PI/2);
const destination=new THREE.Group(),surface=new THREE.Mesh(geo,new THREE.MeshStandardMaterial());destination.add(surface);const side=new THREE.Group();destination.add(side);
destination.userData={local:true,surface,dem:{bounds:[86.80,43.08,86.84,43.12],cols:3,rows:3}};
const map=new THREE.Group();map.userData={exaggeration:18,dimensions:terrainDimensions(dem),surface:new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshStandardMaterial())};
const before=geo.attributes.position.array.slice(),arrival=installTerrainArrival(dem);assert(arrival.prepare(destination,map));
for(const t of [0,.5,1]){arrival.unfold(t);assert(surface.morphTargetInfluences[0]>=0&&surface.morphTargetInfluences[0]<=1);assert(geo.morphAttributes.position[0].array.every(Number.isFinite));}
arrival.restore();assert.deepEqual(geo.attributes.position.array,before,'arrival must preserve the measured destination mesh');assert(side.visible);assert.equal(map.userData.surface.material.opacity,1);assert.equal(map.userData.surface.material.transparent,false);
console.log(JSON.stringify({pass:true,minSole,maxStopBlend,stanceSupport:true,terrainSamplesPreserved:true,terrainMorphRestored:true}));
