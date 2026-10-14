import assert from 'node:assert/strict';
import * as THREE from 'three';
import {globeLift} from '../public/spatial-navigation.js';
import {cues} from '../public/journey.js';
import {contextFor,changesPlace,spatialCameras} from '../public/spatial-spine.js';
const sphere=(lon,lat,r)=>{const a=lon*Math.PI/180,b=lat*Math.PI/180;return new THREE.Vector3(r*Math.cos(b)*Math.cos(a),r*Math.sin(b),-r*Math.cos(b)*Math.sin(a));};
const dem={cols:3,rows:3,bounds:[80,40,90,45]},geo=new THREE.PlaneGeometry(16,10,2,2);geo.rotateX(-Math.PI/2);
const original=geo.attributes.position.array.slice(),mat=new THREE.MeshStandardMaterial(),surface=new THREE.Mesh(geo,mat),lift=globeLift({userData:{surface,dem}},sphere);
lift.update(0);
for(let i=0;i<9;i++){const expected=sphere(80+5*(i%3),45-2.5*Math.floor(i/3),3.25),actual=new THREE.Vector3().fromBufferAttribute(lift.patch.geometry.attributes.position,i);assert(actual.distanceTo(expected)<1e-6,'球面顶点必须保持对应经纬度');}
for(const t of [0,.1,.3,.5,.8,1]){lift.update(t);assert([...lift.patch.geometry.attributes.position.array,...lift.patch.geometry.attributes.normal.array].every(Number.isFinite));}
assert(lift.patch.geometry.attributes.position.array.every((v,i)=>Math.abs(v-original[i])<1e-6),'区域端点必须保持同一个DEM的顶点位置');
assert.deepEqual(geo.attributes.position.array,original,'显示变换不能改写原地形');lift.dispose();geo.dispose();mat.dispose();
assert(cues.every(c=>contextFor(c).scale));
assert.deepEqual(cues.slice(0,5).map(c=>contextFor(c).scale),['planet','continent','region','region','place']);
assert.equal(cues.at(-2).key,'terrain');assert.equal(cues.at(-1).key,'earth');
for(const id of ['exchange-network','exchange-stops','memory-journey','memory-muqam','modern-hubs','modern-kashgar','future-synthesis'])assert.equal(cues.find(c=>c.id===id).stage,undefined,'地理镜头不能被生活布景替代');
assert(changesPlace(contextFor(cues.find(c=>c.id==='exchange-city')),contextFor(cues.find(c=>c.id==='exchange-question'))));
assert.equal(changesPlace(contextFor(cues.find(c=>c.id==='water-ice')),contextFor(cues.find(c=>c.id==='water-flow'))),false);
assert.equal(spatialCameras['memory-journey'].migration,0,'西迁应展示完整方向');assert.equal(spatialCameras['exchange-network'].endRoute,100,'廊道要在地图上完整展开');
console.log(JSON.stringify({pass:true,globeVertexRegistration:9,morphEndpoints:true,finiteNormals:true,originalDEMUnchanged:true,spatialCueContexts:cues.length,wholeToPointOpening:true,geographyRestored:true,returnToEarth:true}));
