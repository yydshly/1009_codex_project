import test from 'node:test';
import assert from 'node:assert/strict';
import {settlementStoryFrame,settlementBeatProgress} from '../public/settlement-story.js';
import {settlementFrame} from '../public/settlement-chronology.js';
test('new water reaches the branch before the soil and farming response can unfold',()=>{
 for(let i=0;i<=100;i++){
  const p=i/100,s=settlementStoryFrame('flow',p),f=settlementFrame('flow',p);
  if(s.branch>0)assert.equal(f.newWater,1);
  if(s.soil>0)assert.equal(s.branch,1);
  if(s.response>0)assert.equal(s.branch,1);
  if(f.expansion>0)assert(s.soil>0);
 }
});
test('returning to earlier dates removes future effects without removing initial cultivation',()=>{
 for(const phase of ['settle','dig'])for(const p of [0,.4,.8,1]){
  const s=settlementStoryFrame(phase,p),f=settlementFrame(phase,p);
  assert.equal(s.branch+s.soil+s.response,0);assert.equal(f.newWater,0);assert.equal(f.initialFields,1);assert.equal(f.initialWater,1);
 }
});
test('each selectable beat resolves to its own observation and safe bounded progress',()=>{
 for(const phase of ['settle','dig','flow'])for(const index of [0,1,2])assert.equal(settlementStoryFrame(phase,settlementBeatProgress(phase,index)).index,index);
 for(const p of [NaN,Infinity,-30,20]){const f=settlementStoryFrame('flow',p);for(const key of ['progress','branch','soil','response'])assert(f[key]>=0&&f[key]<=1);}
});
