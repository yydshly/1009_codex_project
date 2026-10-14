import test from 'node:test';
import assert from 'node:assert/strict';
import {cues} from '../public/journey.js';
import {carryFor} from '../public/journey-memory.js';
import {inquiryFrame,storyReceipts,openingQuestion} from '../public/inquiry-spine.js';
import {stagedCues} from '../public/lived-model.js';
import {contextFor} from '../public/spatial-spine.js';
test('water engineering precedes the choice; departure returns to regional geography',()=>{
 const pos=id=>cues.findIndex(c=>c.id===id);
 assert(pos('oasis-engineering')<pos('water-ice'));
 assert(pos('water-flow')<pos('water-valley'));
 assert(pos('water-valley')<pos('oasis-dry'));
 for(const id of ['oasis-dry','oasis-wind'])assert.equal(cues[pos(id)].key,'terrain');
 assert.equal(contextFor(cues[pos('exchange-question')]).region,'伊犁');
 assert.equal(stagedCues['exchange-question'],undefined,'name the era before dispatching the family');
});
test('public collaboration reads the courtyard and all preceding observations',()=>{
 const a={market:{goods:2},people:{memory:'tools'},culture:{choice:'listen',beats:1}};
 const carried=carryFor('logistics',a);
 assert.equal(carried.from,'culture');assert.equal(carried.observations.length,3);
 assert.match(carried.text,/观察时间/);assert.match(carried.scope,/文化选择不决定政策/);
 const b=carryFor('logistics',{...a,culture:{choice:'join',beats:1}});
 assert.notEqual(carried.text,b.text);assert.equal(b.default,'balanced');
});
test('each actual civic branch retains its own visible unresolved need',()=>{
 const needs=new Set();
 for(const plan of ['balanced','freight','habitat']){
  const ledger={logistics:{plan,green:36,coordinated:true}};
  const row=storyReceipts(ledger)[0];assert(row.complete);needs.add(row.open);
  assert.equal(inquiryFrame('future-budget',ledger).receipt.open,row.open);
 }
 assert.equal(needs.size,3);
 assert.equal(storyReceipts({}).length,0,'unvisited cases cannot fabricate outcomes');
 for(const id of ['future-landscape','future-budget'])assert.equal(stagedCues[id].retain,true);
 assert.equal(stagedCues['future-evidence'].recap,true);
 assert.equal(inquiryFrame('future-result').question,openingQuestion);
});
