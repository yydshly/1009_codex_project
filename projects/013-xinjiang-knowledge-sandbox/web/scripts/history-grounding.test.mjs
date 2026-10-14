import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {buildSphericalHistory} from '../public/spherical-history.js';
import {eventById} from '../public/history-content.js';
import {regionalPosition,renderedRegionalPosition} from '../public/regional-surface-data.js';
import {surfaceCoordinates} from '../public/history-grounding.js';
import {sphericalVisualState} from '../public/spherical-history-data.js';
import {storyRange} from '../public/story-observation.js';
const dem=JSON.parse(readFileSync(new URL('../public/assets/xinjiang-dem.json',import.meta.url),'utf8'));
const ground=(lon,lat,lift=0)=>new THREE.Vector3(...renderedRegionalPosition(dem,lon,lat,lift));
function setup(id,modelsOnly=false){
 const root=new THREE.Group(),viewport={dataset:{}},view=buildSphericalHistory({root,event:eventById(id),modelsOnly,point:(a,b)=>new THREE.Vector3(...regionalPosition(dem,a,b,.012)),groundPoint:ground,viewport,addMarker:(n,position)=>({position,button:{dataset:{},classList:{toggle(){}},setAttribute(){}}})});
 return {root,viewport,view};
}
test('miniatures have soft ground surfaces and independent objects sit above the visible terrain',()=>{
 for(const [id,node]of [['zhang','kashgar'],['protectorate','luntai'],['xibe','qabqal']]){
  const {root,view}=setup(id);view.update(1,node,{motion:8});root.updateMatrixWorld(true);
  let contacts=0,patches=0;
  root.traverse(o=>{
   if(o.userData.groundContact){
    const p=o.getWorldPosition(new THREE.Vector3()),[lon,lat]=surfaceCoordinates(p),height=p.length()-ground(lon,lat).length();
    assert(height>-.0001,`${id} ${o.name} penetrates terrain ${height}`);contacts++;
   }
   if(o.name==='history-feathered-ground'){
    const a=o.geometry.attributes.position;
    for(let i=0;i<a.count;i+=17){const p=new THREE.Vector3().fromBufferAttribute(a,i),ll=surfaceCoordinates(p);assert(Math.abs(p.length()-ground(...ll,.0008).length())<1e-6);}
    assert.equal(o.material.depthWrite,false);patches++;
   }
  });assert(contacts>3);assert(patches>0);
  const anchor=root.getObjectByName('history-miniature-'+node),before=anchor.position.clone();view.update(1,null,{motion:8});view.update(1,node,{motion:8});assert(anchor.position.equals(before));
  const geometryIds=[];root.traverse(o=>{if(o.geometry)geometryIds.push(o.geometry.uuid);});
  for(let i=0;i<20;i++)view.update(i/19,node,{motion:i});
  const after=[];root.traverse(o=>{if(o.geometry)after.push(o.geometry.uuid);});assert.deepEqual(after,geometryIds,'grounding reuses meshes and buffers');
 }
});
test('map previews can seek their own visible handoff and response without restarting the historical clock',()=>{
 for(const [id,node,time,stage]of [['zhang','kashgar',6,'offer-and-receive'],['protectorate','luntai',9,'acknowledge'],['xibe','qabqal',7,'child-responds']]){
  const {view,viewport,root}=setup(id,true);view.update(1,node,{context:true,motion:100,actionTime:time});assert.equal(viewport.dataset.sphericalActionStage,stage);
  const transforms=()=>{const out=[];root.updateMatrixWorld(true);root.traverse(o=>out.push([...o.matrixWorld.elements]));return out;};
  const held=transforms();view.update(1,node,{context:true,motion:100,actionTime:time});assert.deepEqual(transforms(),held);
  view.update(1,node,{context:true,motion:100,actionTime:0});assert.notEqual(viewport.dataset.sphericalActionStage,stage);
  view.update(1,node,{context:true,motion:100,actionTime:time});assert.deepEqual(transforms(),held);
 }
});
test('foreground roads, fields and canals keep their triangle interiors above the display terrain',()=>{
 for(const [id,node]of [['zhang','kashgar'],['protectorate','luntai'],['xibe','qabqal']]){
  const {root,view}=setup(id);view.update(1,node,{motion:9});root.updateMatrixWorld(true);let count=0,triangles=0;
  root.traverse(o=>{
   if(!o.userData.groundSurface)return;count++;
   const attr=o.geometry.attributes.position,index=o.geometry.index;triangles+=index.count/3;
   for(let i=0;i<attr.count;i++){
    const p=new THREE.Vector3().fromBufferAttribute(attr,i);o.localToWorld(p);const ll=surfaceCoordinates(p);
    assert(p.length()>=ground(...ll).length()+.0007,'thin terrain-following vertices stay above visible triangle');
   }
   for(let i=0;i<index.count;i+=3){
    const a=new THREE.Vector3().fromBufferAttribute(attr,index.getX(i)),b=new THREE.Vector3().fromBufferAttribute(attr,index.getX(i+1)),c=new THREE.Vector3().fromBufferAttribute(attr,index.getX(i+2));
    for(const [u,v]of [[1/3,1/3],[.5,.25],[.25,.5]]){
     const p=a.clone().multiplyScalar(1-u-v).addScaledVector(b,u).addScaledVector(c,v);o.localToWorld(p);const ll=surfaceCoordinates(p),clearance=p.length()-ground(...ll).length();
     assert(clearance>-.00002,`${id} ${o.parent.name} triangle interior crosses displayed terrain: ${clearance}`);
    }
   }
  });assert(count>=1);assert(triangles<16000,'bounded surface tessellation prevents excessive geometry growth');
  const versions=[];root.traverse(o=>{if(o.userData.groundSurface)versions.push([o.geometry.uuid,o.geometry.attributes.position.version,o.geometry.attributes.normal.version]);});
  view.update(1,node,{motion:10});const next=[];root.traverse(o=>{if(o.userData.groundSurface)next.push([o.geometry.uuid,o.geometry.attributes.position.version,o.geometry.attributes.normal.version]);});
  assert.deepEqual(next,versions,'local character motion reuses unchanged surface buffers and normals');
 }
});
test('sphere phase, active places and spoken chapters use the same event-specific boundaries',()=>{
 for(const id of ['zhang','protectorate','xibe'])for(let i=0;i<3;i++){
  const [a,b]=storyRange(id,i);assert.equal(sphericalVisualState(id,(a+b)/2).phase,i);assert.equal(sphericalVisualState(id,b,i).phase,i,'paused endpoint can keep current chapter');
 }
 assert.deepEqual(sphericalVisualState('xibe',.12).active,['ili']);assert.deepEqual(sphericalVisualState('xibe',.65).active,['qabqal']);
});
