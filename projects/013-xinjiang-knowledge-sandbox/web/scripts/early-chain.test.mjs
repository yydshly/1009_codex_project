import test from 'node:test';
import assert from 'node:assert/strict';
import {waterSequence,waterCamera,marketUse,earlyBearing} from '../public/early-chain.js';
import {cues} from '../public/journey.js';
import {spatialPlan} from '../public/spatial-motion.js';
test('both choices visibly preserve the other need before the second arrival',()=>{
 for(const plan of ['home','field']){
  const other=plan==='home'?'field':'home';
  assert.equal(waterSequence(8,plan)[other],0);
  assert.equal(waterSequence(8,plan)[plan],1);
  assert.equal(waterSequence(8,plan).waiting,other);
  assert(waterSequence(10.8,plan)[other]>.2);
  assert.equal(waterSequence(12.5,plan)[other],1);
  let previous=waterCamera(plan,0,'choice');
  for(let age=.01;age<22;age+=.01){
   const next=waterCamera(plan,age,'choice');
   assert(next.position.concat(next.target).every(Number.isFinite));
   assert(Math.hypot(...next.position.map((v,i)=>v-previous.position[i]))<.08,'No camera cut between beneficiary and waiting party');
   previous=next;
  }
 }
 assert.equal(waterSequence(100,null).home,0);
 assert.equal(waterSequence(100,null).field,0);
});
test('maintenance and departure remain in the same place; approach follows the road overview',()=>{
 const get=id=>cues.find(c=>c.id===id);
 assert.equal(get('water-ice').duration,28);
 assert.equal(get('oasis-use').stage,'oasis');
 assert.equal(spatialPlan(get('water-flow'),get('oasis-use')),null);
 assert.equal(spatialPlan(get('oasis-use'),get('water-valley')),null);
 assert(get('exchange-network').index<get('oasis-nodes').index);
 const ledger={oasis:{plan:'field',replied:true}},prior=JSON.stringify(ledger);
 assert(earlyBearing('exchange-goods',ledger).includes('生产与补给'));
 assert.equal(JSON.stringify(ledger),prior);
 assert.equal(marketUse(-1,0).received,false);
 for(let goods=0;goods<3;goods++){assert.equal(marketUse(12,goods).continue,1);assert.deepEqual(marketUse(12,goods).waiting,[0,1,2].filter(i=>i!==goods));}
});
