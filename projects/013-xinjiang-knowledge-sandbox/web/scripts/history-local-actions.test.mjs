import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createHistoryVisualModels} from '../public/history-visual-models.js';
import {marketActionClock,marketActionStart} from '../public/spherical-history.js';
import {eventFrame} from '../public/history-process.js';

const models=createHistoryVisualModels(),reports=[];
function named(root,name){const out=[];root.traverse(o=>{if(o.name===name)out.push(o);});return out;}
function snapshot(root){root.updateWorldMatrix(true,true);const out=[];root.traverse(o=>out.push([o.name,o.visible,...o.matrixWorld.elements]));return out;}
function point(object){return object.getWorldPosition(new THREE.Vector3());}
function dispose(root){const mats=new Set(),geometries=new Set();root.traverse(o=>{if(o.material)mats.add(o.material);if(o.geometry)geometries.add(o.geometry);});for(const m of mats)m.dispose();for(const g of geometries)g.dispose();}
for(const kind of ['market','institution','settlement']){
 const model=models[kind](),root=model.root;
 root.position.set(.4,2.1,-2.3);root.rotation.set(.6,.5,.2);root.scale.setScalar(.65);
 const update=t=>{model.update(t);model.afterGround?.();};
 update(5);const first=snapshot(root);update(5);assert.deepEqual(snapshot(root),first,kind+' paused clock is deterministic');
 update(7);assert.notDeepEqual(snapshot(root),first,kind+' advances a specific action');update(5);assert.deepEqual(snapshot(root),first,kind+' rewind restores exact action');
 const geometry=new Set(),materials=new Set();let meshes=0;root.traverse(o=>{if(o.isMesh){geometry.add(o.geometry);materials.add(o.material);meshes++;}});
 for(let t=0;t<40;t+=.25){update(t);root.traverse(o=>{assert(o.position.toArray().every(Number.isFinite));if(o.isMesh){assert(geometry.has(o.geometry),'updates create no geometry');assert(materials.has(o.material),'updates create no materials');}});}
 const people=named(root,'history-person');assert(people.length>=2);
 for(const person of people){assert.equal(named(person,'history-elbow').length,2);assert.equal(named(person,'history-knee').length,2);assert.equal(named(person,'history-person-foot').length,2);assert(person.userData.groundContact,'people support terrain anchoring');}
 // Re-grounding after a terrain sample must reattach the held item in this frame.
 const actor=people[0];update(0);actor.position.y+=.015;model.afterGround();
 const item=root.getObjectByName({market:'history-market-exchange',institution:'history-institution-document',settlement:'history-family-care-parcel'}[kind]);
 assert(point(item).distanceTo(point(actor.getObjectByName('history-hand-right')))<1e-10,kind+' parcel remains attached after grounding');
 assert(!root.children.some(o=>o.isMesh&&o.geometry.type==='BoxGeometry'&&o.scale.x>.17&&o.scale.z>.17),'no rectangular solid plinth');
 reports.push({kind,people:people.length,meshes,geometries:geometry.size});dispose(root);
}

const market=models.market();
market.update(3.2);assert.equal(market.root.userData.parcelOwner,'seller');
market.update(5.1);assert.equal(market.root.userData.parcelOwner,'handoff');
const parcel=market.root.getObjectByName('history-market-exchange'),people=named(market.root,'history-person');
const seller=point(people[0].getObjectByName('history-hand-right')),buyer=point(people[3].getObjectByName('history-hand-right')),handoff=point(parcel),segment=buyer.clone().sub(seller);
assert(handoff.distanceTo(seller)>0&&handoff.distanceTo(buyer)>0,'handoff occurs between both hands');
assert(Math.abs(handoff.distanceTo(seller)+handoff.distanceTo(buyer)-segment.length())<1e-9);
market.update(7.2);assert.equal(market.root.userData.parcelOwner,'buyer');
assert(point(parcel).distanceTo(point(people[3].getObjectByName('history-hand-right')))<1e-10,'received goods follow buyer hand');
market.update(13.2);assert.equal(market.root.userData.parcelOwner,'stall');assert.equal(market.actionStage,'return');
market.update(5,.1);assert.equal(market.actionStage,'waiting','no completed exchange before the network is established');dispose(market.root);
const settlement=models.settlement();settlement.update(9,{settle:.1,water:0});assert.equal(settlement.actionStage,'waiting');settlement.update(9,{settle:1,water:0});assert.equal(settlement.root.userData.fieldAction,'prepare-land');settlement.update(9,{settle:1,water:1});assert.equal(settlement.root.userData.fieldAction,'later-water-and-tending');dispose(settlement.root);
assert(Math.abs(eventFrame('zhang',marketActionStart).network-.35)<1e-12,'local clock starts at the actual visibility gate');
assert.equal(marketActionClock(marketActionStart,61),0);assert.equal(marketActionClock(marketActionStart-1e-6,61),0);assert(marketActionClock(marketActionStart+1e-6,61)<.001);
assert(marketActionClock(.92,62)>marketActionClock(.92,61),'motion still advances actions at a fixed geographic progress');
const replay=models.market(),p=.90,seconds=61;replay.update(marketActionClock(p,seconds),eventFrame('zhang',p).network);const replayFrame=snapshot(replay.root);replay.update(marketActionClock(.99,70),eventFrame('zhang',.99).network);replay.update(marketActionClock(p,seconds),eventFrame('zhang',p).network);assert.deepEqual(snapshot(replay.root),replayFrame,'seek back reconstructs the same action without a captured first-seen time');
replay.update(marketActionClock(marketActionStart+.001,57),eventFrame('zhang',marketActionStart+.001).network);assert.equal(replay.actionStage,'approach','the first visible action is approach, not inspection');
replay.update(marketActionClock(1,72),1);assert.equal(replay.root.userData.parcelOwner,'stall','the full observation range includes delivery and setting goods down');
for(const invalid of [NaN,Infinity,-1])assert.equal(marketActionClock(invalid,55),0);
dispose(replay.root);
console.log('历史局部动作：分段交接、持物归属、接收回应、双段关节、暂停回拨、地表重采样后跟手及无分配更新通过 '+JSON.stringify(reports));
