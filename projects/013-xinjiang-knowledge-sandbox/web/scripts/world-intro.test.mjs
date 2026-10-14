import test from 'node:test';
import assert from 'node:assert/strict';
import {earthChapters,earthFlows,flowSamples,flowPhase,latitudeBelt} from '../public/world-intro-content.js';
import {worldLessons,knowledgeSources} from '../public/knowledge-content.js';
import {globePosition} from '../public/world-content.js';

test('earth questions use supported topics and primary evidence',()=>{
 assert.equal(new Set(earthChapters.map(c=>c.topic)).size,5);
 for(const c of earthChapters)assert(worldLessons.some(w=>w.id===c.topic));
 for(const id of Object.keys(earthFlows)){const w=worldLessons.find(w=>w.id===id);assert(w.sources.length);for(const k of w.sources)assert(knowledgeSources[k]?.url);}
});
test('explanatory flow geometry remains on the globe at both endpoints and all steps',()=>{
 for(const config of Object.values(earthFlows))for(const flow of [config,...(config.branches??[]).map(points=>({points}))])for(const offset of [-2,0,2]){
  const samples=flowSamples(flow.points,180,offset);assert.equal(samples.length,181);
  for(const point of samples){assert(point.every(Number.isFinite));assert(Math.hypot(...point)>=3.279999);}
  for(const [index,anchor]of [[0,flow.points[0]],[180,flow.points.at(-1)]])globePosition(anchor[0],anchor[1]+offset,3.28).forEach((v,i)=>assert(Math.abs(v-samples[index][i])<1e-9));
 }
 assert.equal(flowPhase(0),0);assert.equal(flowPhase(.5),1);assert.equal(flowPhase(1),2);
 const belt=latitudeBelt();assert.equal(belt.length%9,0);assert(belt.every(Number.isFinite));
});
