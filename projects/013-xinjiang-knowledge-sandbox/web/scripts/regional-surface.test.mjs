import test from 'node:test';
import assert from 'node:assert/strict';
import {earthRadius,earthMetres,regionalPosition,regionalMeshData,regionalPose,covered} from '../public/regional-surface-data.js';
import {cameraFrame} from '../public/motion.js';
import {globePosition} from '../public/world-content.js';
const dem={bounds:[73,35,96,49],cols:2,rows:2,heights:[1000,2000,-150,500]};
const radius=p=>Math.hypot(...p);
test('regional surface keeps north-up raster edges and physical DEM heights on the same Earth',()=>{
 const original=[...dem.heights],data=regionalMeshData(dem,3,3);
 assert.deepEqual(data.uvs.slice(0,2),[0,1]);assert.deepEqual(data.uvs.slice(-2),[1,0]);
 assert.deepEqual(data.positions.slice(0,3),regionalPosition(dem,73,49));
 assert.deepEqual(data.positions.slice(-3),regionalPosition(dem,96,35));
 assert.ok(Math.abs(radius(regionalPosition(dem,73,35))-(earthRadius+.002-150/earthMetres*earthRadius*6))<1e-12);
 assert.deepEqual(dem.heights,original);
 assert.equal(data.indices.length/3,8);assert.equal(data.positions.length/3,9);
 // Every index refers to the surface grid; no vertical perimeter or slab vertices.
 assert.ok(data.indices.every(i=>i>=0&&i<9));
});
test('outside regional DEM coverage remains geographic sphere rather than extrapolated edge heights',()=>{
 assert.equal(covered(dem,78,34.4),false);assert.equal(covered(dem,96.4,42),false);
 assert.ok(Math.abs(radius(regionalPosition(dem,78,34.4))-(earthRadius+.002))<1e-12);
 assert.equal(covered(dem,96,49),true);
});
test('Earth approach follows one exterior camera path and retains a wider surrounding view',()=>{
 for(const [lon,lat]of [[78,30],[84,42],[42,32],[72,29],[82,38]]){
  const pose=regionalPose(),from=globePosition(lon,lat,10.7),to=globePosition(pose.lon,pose.lat,pose.distance),target=globePosition(pose.lon,pose.lat,pose.surface);
  for(let t=0;t<=1;t+=.01){const f=cameraFrame(from,to,[0,0,0],target,t);assert.ok(radius(f.position)>earthRadius+.1);assert.ok(f.position.every(Number.isFinite));}
 }
 assert.ok(regionalPose({surroundings:true}).distance>regionalPose().distance);
 assert.ok(regionalPose({near:true}).distance<regionalPose().distance);
 assert.ok(regionalPose({aspect:.5}).distance>regionalPose({aspect:1.4}).distance);
});
