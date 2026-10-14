import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createHistoryVisualModels} from '../public/history-visual-models.js';
import {buildSphericalHistory} from '../public/spherical-history.js';
import {eventById} from '../public/history-content.js';
import {globePosition} from '../public/world-content.js';

function setup(id){
 const root=new THREE.Group(),viewport={dataset:{}},markers=[];
 const view=buildSphericalHistory({root,event:eventById(id),point:(lon,lat)=>new THREE.Vector3(...globePosition(lon,lat,3.2)),viewport,addMarker:(n,position)=>{const marker={position,button:{dataset:{},classList:{toggle(){}},setAttribute(){}}};markers.push(marker);return marker;}});
 return {root,viewport,view,markers};
}
function visibleState(root){root.updateMatrixWorld(true);const state=[];root.traverseVisible(o=>state.push([o.name,...o.matrixWorld.elements]));return state;}
function named(root,name){const objects=[];root.traverse(o=>{if(o.name===name)objects.push(o);});return objects;}
const reports=[];
for(const id of ['zhang','protectorate','xibe']){
 const {root,viewport,view}=setup(id),node={zhang:'kashgar',protectorate:'luntai',xibe:'qabqal'}[id];
 assert(Number(viewport.dataset.sphericalEventMeshes)<350);
 const geometries=new Set();let meshes=0;root.traverse(o=>{if(o.isMesh){meshes++;geometries.add(o.geometry);}});
 assert(geometries.size<meshes/2,'micro models reuse primitive geometry');
 for(const p of [0,.15,.4,.65,.82,1,.4,0]){
  view.update(p,node,{motion:p*20});root.updateMatrixWorld(true);
  root.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite),id+' '+o.name);assert(o.scale.toArray().every(Number.isFinite));});
 }
 for(const bad of [NaN,Infinity,-Infinity,undefined]){view.update(bad,node,{motion:bad});root.updateMatrixWorld(true);root.traverse(o=>assert(o.matrixWorld.elements.every(Number.isFinite),'invalid time has safe fallback'));}
 view.update(.5,node,{motion:2});const paused=visibleState(root);view.update(.5,node,{motion:2});assert.deepEqual(visibleState(root),paused,'same paused clock yields the same frame');
 view.update(.5,node,{motion:2.3});assert.notDeepEqual(visibleState(root),paused,'limbs or model responses change when local motion advances');
 const anchor=root.getObjectByName('history-miniature-'+node),location=anchor.position.clone();view.update(1,null,{motion:3});const originalScale=anchor.scale.x;view.update(1,node,{motion:3});assert.equal(anchor.scale.x,originalScale*1.3);assert(anchor.position.equals(location),'selection scales model around its unchanged geographic anchor');
 const historical={route:viewport.dataset.eventRoute,build:viewport.dataset.eventBuild,network:viewport.dataset.eventNetwork,water:viewport.dataset.eventWater};
 view.update(1,node,{motion:12,observed:true});assert.deepEqual({route:viewport.dataset.eventRoute,build:viewport.dataset.eventBuild,network:viewport.dataset.eventNetwork,water:viewport.dataset.eventWater},historical,'local actions and observation highlights cannot rewrite history');
 view.update(1,node,{motion:12,context:true});assert(named(root,'history-travelling-party').every(g=>!g.visible));assert(named(root,'history-regional-cargo').every(g=>!g.visible));
 if(id==='zhang'){
  assert.equal(named(root,'history-camel').length,3);assert.equal(named(root,'history-market-stall').length,3);assert(named(root,'history-open-arch').length>=1);
  view.update(.35,node,{motion:4});const actor=root.getObjectByName('history-travelling-party').children[0],before=actor.position.clone();view.update(.55,node,{motion:4});assert(actor.position.distanceTo(before)>.03,'convoy moves along the revealed geographic curve');assert(actor.position.length()>3.19);const radial=actor.position.clone().normalize(),actorUp=new THREE.Vector3(0,1,0).applyQuaternion(actor.quaternion);assert(actorUp.dot(radial)>.999,'travellers stand on the local sphere normal');
 }
 if(id==='protectorate'){view.update(0,node,{motion:0});assert.equal(viewport.dataset.sphericalInstitutionParts,'0');view.update(.32,node,{motion:3});assert(Number(viewport.dataset.sphericalInstitutionParts)>0&&Number(viewport.dataset.sphericalInstitutionParts)<4);view.update(1,node,{motion:5});assert.equal(viewport.dataset.sphericalInstitutionParts,'4');assert(named(root,'history-open-arch').length>=1);}
 if(id==='xibe'){view.update(.78,node,{motion:4});assert.equal(root.getObjectByName('settlement-water').visible,false,'later canal must remain absent during initial settlement');view.update(1,node,{motion:5});assert.equal(root.getObjectByName('settlement-water').visible,true);assert(named(root,'history-house-window').some(w=>w.material.emissiveIntensity>.4));view.update(0,node,{motion:0});assert.equal(root.getObjectByName('history-family-settlement').visible,false);}
 reports.push({id,meshes,geometries:geometries.size,actors:Number(viewport.dataset.sphericalCaravanActors)});
}
const visuals=createHistoryVisualModels(),market=visuals.market();market.update(4);const first=visibleState(market.root);market.update(4);assert.deepEqual(visibleState(market.root),first);market.update(5);assert.notDeepEqual(visibleState(market.root),first);
console.log('历史微缩模型：形体、曲线队列、球面朝向、暂停确定性、局部动作、选中定位、分期与复用通过 '+JSON.stringify(reports));
