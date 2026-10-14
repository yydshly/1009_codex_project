import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {localObservationFrame,marketObservationPose,localSnapshot,localSceneMatches} from '../public/local-observation.js';
import {decorateMarketLinkage,updateMarketLinkage} from '../public/market-linkage.js';

test('cross-path snapshots cannot restore another scene while claiming the requested model is ready',()=>{
 const structure={scene:'terrain',camera:[1,2,3]},market={scene:'market',camera:[4,5,6]};
 assert.equal(localSnapshot('market',structure),null);
 assert.equal(localSnapshot('structure',market),null);
 assert.equal(localSnapshot('market',market),market);
 assert.equal(localSnapshot('structure',structure),structure);
 assert.equal(localSceneMatches('market','terrain'),false);
});

test('market observations require a selected recipient and actual use, never just narration or delivery',()=>{
 const data={goods:'0',deliveryCount:'1',marketUse:'family-continues'};
 assert.equal(localObservationFrame('market',data,false).complete,false);
 assert.equal(localObservationFrame('market',{...data,deliveryCount:'0'},true).index,0);
 assert.equal(localObservationFrame('market',{...data,marketUse:'receiving-and-using'},true).index,1);
 assert.equal(localObservationFrame('market',{...data,marketUse:'craft-work-continues'},true).complete,false);
 assert.equal(localObservationFrame('market',data,true).index,2);
});
test('three actual market outcomes explain different recipients and camera targets',()=>{
 for(const [i,state]of ['family-continues','traveller-departs','craft-work-continues'].entries()){
  const f=localObservationFrame('market',{goods:String(i),deliveryCount:'1',marketUse:state},true);
  assert.equal(f.good,i);assert(f.complete);assert.equal(f.index,2);
  const pose=marketObservationPose(f,[[-3.6,0,1.22],[1.35,0,2],[3.45,0,.7]],1.8);
  assert(pose.target.every(Number.isFinite));assert(pose.distance>=6.8);
 }
 const f=localObservationFrame('market',{goods:'2'},true);
 assert(marketObservationPose(f,[],.55).distance>marketObservationPose(f,[],1.8).distance);
});
test('inside/outside progress and roof reveal remain reversible and cannot be completed by text',()=>{
 assert.equal(localObservationFrame('structure',{}).index,0);
 assert.equal(localObservationFrame('structure',{structureRoofLift:'.5'}).index,1);
 assert.equal(localObservationFrame('structure',{structureConnectionProgress:'.8',structureConnectionState:'returning'}).index,2);
 assert.equal(localObservationFrame('structure',{structureConnectionProgress:'.8',structureConnectionState:'complete'}).complete,false);
 assert(localObservationFrame('structure',{structureConnectionProgress:'1',structureConnectionState:'complete'}).complete);
 assert.equal(localObservationFrame('structure',{structureRoofLift:'0',structureConnectionProgress:'0',structureConnectionState:'ready'}).index,0);
});
test('market links use the actual carrier and recipient positions, preserving unchosen needs',()=>{
 const root=new THREE.Group(),visual=decorateMarketLinkage(root);
 const d={goods:'1',marketCarrier:'[-2,0,0.15]',marketActors:'[[-3.6,0,0.7],[1.35,0,2],[3.45,0,0.7]]',marketUse:'waiting-for-choice',deliveryCount:'0'};
 updateMarketLinkage(visual,d,true,true);
 assert.equal(visual.path.geometry.drawRange.count,2);
 assert.equal(visual.path.geometry.attributes.position.getX(1),-2);
 assert.equal(visual.rings[1].position.x,1.35);assert(visual.rings[1].material.opacity>visual.rings[0].material.opacity);
 updateMarketLinkage(visual,{...d,marketUse:'traveller-departs',deliveryCount:'1'},true,true);
 assert.equal(visual.path.geometry.drawRange.count,5);
 assert.equal(visual.path.geometry.attributes.position.getZ(4),2);
 assert.equal(visual.path.material.color.getHex(),0x8bd7b7);
});
test('frame updates reuse geometry and hiding the scene cannot leave route cues visible',()=>{
 const visual=decorateMarketLinkage(new THREE.Group()),geometry=visual.path.geometry,material=visual.path.material;
 for(let i=0;i<200;i++)updateMarketLinkage(visual,{goods:String(i%3),marketActors:'[]'},true,true);
 assert.equal(visual.path.geometry,geometry);assert.equal(visual.path.material,material);
 updateMarketLinkage(visual,{goods:'0'},true,false);assert.equal(visual.path.visible,false);
 updateMarketLinkage(visual,{},false,false);assert.equal(visual.root.visible,false);
});
