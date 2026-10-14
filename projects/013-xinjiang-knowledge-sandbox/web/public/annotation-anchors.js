import * as THREE from 'three';
import {terrainPoint} from './geo.js';
const point=(g,p)=>g.localToWorld(new THREE.Vector3(...p));
const location=o=>o?.getWorldPosition(new THREE.Vector3());
const face=a=>location(a?.head);
export function sceneAnnotationAnchors({group:g,stage,active,key,goods=1,memory='letter',voice='resident',tradition='twelve'}){
 if(!g)return naturalAnchors(active,key);
 g.updateWorldMatrix(true,true);const d=g.userData,s=d.social,p=v=>point(g,v);
 if(stage==='oasis'){
  const w=d.waterStory;return {parent:face(w.parent),farmer:face(w.farmer),homeGate:location(w.gates.home.gate),fieldGate:location(w.gates.field.gate),homeFlow:p(w.streams.find(c=>c.key==='home').curve.getPoint(.58).toArray()),fieldFlow:p(w.streams.find(c=>c.key==='field').curve.getPoint(.58).toArray()),home:face(w.child),traveller:face(w.traveller),shafts:location(w.shaft),waterway:p([-4,.18,-.5]),pond:location(w.basin),basket:location(w.emptyBasket),cloth:location(w.foldedCloth)};
 }
 if(stage==='market')return {caravan:location(d.caravans[0].root)?.add(new THREE.Vector3(0,1,0)),stall:p([[-3.7,0,3.7][Number(goods)],1,-.82]),parcel:location(d.carried.visible?d.carried:d.receipts[Number(goods)]),receipt:location(d.receipts[Number(goods)]),receiver:face(d.detail.receivers[Number(goods)])};
 if(stage==='people')return {official:face(d.official),scroll:location(d.scroll),family:face(s.family.rigs[1]),child:face(s.family.rigs[2]),memory:location(memory==='tools'?s.tools:s.letter),familyGate:location(d.detail.sluice),home:location(d.detail.home)?.add(new THREE.Vector3(0,.5,0)),homeLamp:location(d.detail.lamps[0])};
 if(stage==='culture')return {archive:location(s.board),teacher:face(s.teacher),learner:face(s.child),record:location(s.record),practice:location(s.practiceDrum)};
 if(stage==='logistics')return {voice:face(s.actors[voice]?.actor??s.actors.resident.actor),steward:face(s.actors.steward.actor),council:location(s.proposal),buffer:location(s.beds[3])?.add(new THREE.Vector3(0,.25,0)),waiting:p([-5,.25,.64]),truck:location(d.trucks[0])?.add(new THREE.Vector3(0,.5,0)),hoist:location(d.hoist),information:location(d.infoLines[1].bead),exhibition:new THREE.Vector3(10,.8,10.2)};
 return {mountains:p([-.6,1,-.8]),nodes:p([2,.24,2.6]),path:p([6.8,.16,2.15])};
}
function naturalAnchors(g,key){
 if(!g)return {};g.updateWorldMatrix(true,true);const d=g.userData,p=v=>point(g,v);
 const terrain=(lon,lat)=>{const v=terrainPoint(d.dem,lon,lat,d.exaggeration,d.dimensions);v[1]+=.16;return p(v);};
 if(key==='terrain'||key==='history')return {mountains:terrain(85.2,43.2),basin:terrain(82.5,40.3),nodes:terrain(75.99,39.47),ice:terrain(86.817,43.10),culture:terrain(93.51,42.82),family:terrain(81.15,43.84),gate:terrain(80.42,44.21),urumqi:terrain(87.62,43.82),path:terrain(80,38)};
 if(key==='glacier')return {ice:terrain(86.826,43.103),valley:terrain(86.82,43.098),ghost:terrain(86.821,43.096)};
 if(key==='local'){
  d.lake?.geometry.computeBoundingBox();const lake=d.lake?.geometry.boundingBox?.getCenter(new THREE.Vector3());
  return {lake:lake?d.lake.localToWorld(lake):p([0,.8,0]),valley:terrain((d.dem.bounds[0]+d.dem.bounds[2])/2,(d.dem.bounds[1]+d.dem.bounds[3])/2)};
 }
 if(key==='yardang')return {ridge:p([.2,1.35,.4]),wind:p([-4,.7,1.5])};
 if(key==='earth'||key==='migration'){const a=84*Math.PI/180,b=43*Math.PI/180,r=3.35;return {basin:p([r*Math.cos(b)*Math.cos(a),r*Math.sin(b),-r*Math.cos(b)*Math.sin(a)]),family:p([r*Math.cos(41.8*Math.PI/180)*Math.cos(123.43*Math.PI/180),r*Math.sin(41.8*Math.PI/180),-r*Math.cos(41.8*Math.PI/180)*Math.sin(123.43*Math.PI/180)])};}
 if(key==='karez')return {shafts:p([-1.2,2,.43]),waterway:d.channel?point(g,d.channel.getPoint(.52).toArray()):p([0,.2,.43]),pond:location(d.pond)??p([7.3,.32,.44])};
 return {};
}
