import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildSpatialRelations} from '../public/spatial-relations-layer.js';
const point=(lon,lat,lift=0)=>{const a=lon*Math.PI/180,b=lat*Math.PI/180,r=3.2+lift;return new THREE.Vector3(r*Math.cos(b)*Math.cos(a),r*Math.sin(b),-r*Math.cos(b)*Math.sin(a));};
const snapshot=root=>{root.updateWorldMatrix(true,true);const out=[];root.traverse(o=>out.push([o.name,o.visible,...o.matrixWorld.elements]));return out;};
function dispose(root){const gs=new Set(),ms=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}
test('moving map parties stay on the globe, pause deterministically and reuse their geometry',()=>{
 const movements=new Set();
 for(const id of ['zhang','protectorate','xibe']){
  const root=new THREE.Group(),layer=buildSpatialRelations({root,id,scope:'region',point,addLabel:()=>null});movements.add(layer.movement);assert(layer.actorCount>0);
  layer.update(1,4);const first=snapshot(root),gs=new Set(),ms=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});
  layer.update(1,4);assert.deepEqual(snapshot(root),first);
  layer.update(1,8);assert.notDeepEqual(snapshot(root),first);
  for(let t=0;t<20;t+=.5){layer.update(1,t);root.traverse(o=>{if(o.geometry)assert(gs.has(o.geometry));if(o.material)assert(ms.has(o.material));if(o.parent?.name.startsWith('map-')&&o.visible){assert(Math.abs(o.position.length()-3.202)<1e-5);assert(o.quaternion.toArray().every(Number.isFinite));}});}
  layer.update(.3,5);for(const party of root.children.filter(o=>o.name.startsWith('map-'))){if(party.visible)for(const actor of party.children.filter(o=>o.visible))assert(actor.position.length()>3.2);}
  dispose(root);
 }
 assert.equal(movements.size,3);
});
test('geography comparison hides all travelling parties and all connection lines',()=>{
 const root=new THREE.Group(),layer=buildSpatialRelations({root,id:'xibe',scope:'region',geographyOnly:true,point,addLabel:()=>null});assert.equal(layer.update(1,5).route,0);assert.equal(layer.actorCount,0);assert.equal(layer.lineCount,0);
 assert(root.children.filter(o=>o.name.startsWith('map-')).every(o=>!o.visible));dispose(root);
});
