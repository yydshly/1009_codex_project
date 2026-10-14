import test from 'node:test';
import assert from 'node:assert/strict';
import {institutionConnectionFrame,advanceInstitutionConnection,institutionConnectionDuration} from '../public/history-map-layer.js';

test('the connection marker passes through the open gate, enters the interior, and returns without a position jump',()=>{
 const state=p=>institutionConnectionFrame(p);
 assert.equal(state(0).state,'ready');assert.equal(state(.1).state,'entering');assert.equal(state(.5).state,'inside');assert.equal(state(.8).state,'returning');assert.equal(state(1).state,'complete');
 assert(state(0).position[2]>1.33,'start outside the front wall');assert(state(.4).position[2]<0,'reach the interior');assert(state(1).position[2]>1.33,'finish outside');
 for(let i=0;i<=100;i++){
  const p=state(i/100).position;assert(Math.abs(p[0])<.24,'pass through the open gate and central passage, not a wall');assert(p.every(Number.isFinite));
  if(i)assert(Math.hypot(...p.map((n,j)=>n-state((i-1)/100).position[j]))<.06,'no teleport at phase boundaries');
 }
 for(const boundary of [.4,.6])assert(Math.hypot(...state(boundary).position.map((n,j)=>n-state(boundary-1e-8).position[j]))<1e-6);
 assert.equal(state(1).entering,1);assert.equal(state(1).returning,1);
});

test('connection progress requires visible explicit playback, pauses exactly, and completes only after its duration',()=>{
 const active={playing:true,visible:true};
 assert.equal(advanceInstitutionConnection(.3,3),.3);
 assert.equal(advanceInstitutionConnection(.3,3,{playing:false,visible:true}),.3);
 assert.equal(advanceInstitutionConnection(.3,3,{playing:true,visible:false}),.3);
 for(const dt of [NaN,Infinity,-1])assert.equal(advanceInstitutionConnection(.3,dt,active),.3);
 assert.equal(advanceInstitutionConnection(0,institutionConnectionDuration,active),1);
 assert.equal(advanceInstitutionConnection(1,3,active),1);
 assert.equal(advanceInstitutionConnection(0,institutionConnectionDuration/2,active),.5);
 let p=0;for(let i=0;i<120;i++)p=advanceInstitutionConnection(p,.1,active);assert(Math.abs(p-1)<1e-12);
});
