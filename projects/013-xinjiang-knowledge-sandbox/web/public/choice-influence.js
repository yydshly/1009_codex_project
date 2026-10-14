import {carryFor} from './journey-memory.js';
import {storyReceipts} from './inquiry-spine.js';
// Completed observations affect attention in the next independent case.
// Preview never creates a choice, delivery, historical outcome or policy.
export function entryInfluence(stage,ledger={}){
 const completed=Object.fromEntries(storyReceipts(ledger).filter(r=>r.complete).map(r=>[r.stage,ledger[r.stage]]));
 const carry=carryFor(stage,completed);if(!carry)return null;
 const focus=stage==='market'?({cloth:'family',supplies:'traveller',craft:'craft'})[carry.default]:stage==='people'?carry.default==='home'?'family':'channel':stage==='culture'?carry.default==='listen'?'teacher':'learner':completed.culture?.choice==='listen'?'resident':'worker';
 const poses={
  family:stage==='market'?{position:[-1.7,2.1,5.7],target:[-3.55,.85,.5]}:{position:[6.6,2.3,7.1],target:[4.45,.85,3.15]},
  traveller:{position:[2.2,2.1,5.7],target:[.15,.85,.5]},craft:{position:[5.9,2.1,5.7],target:[3.85,.85,.5]},
  channel:{position:[5.6,2.9,4.3],target:[3.3,.45,-1.4]},
  teacher:{position:[-3.7,2.2,6.2],target:[-2.0,.9,2.35]},learner:{position:[-1.1,2.0,6.1],target:[-.3,.75,2.7]},
  resident:{position:[-5.2,2.2,5.5],target:[-2.6,.9,.3]},worker:{position:[-3.4,2.2,5.5],target:[-1.3,.9,.8]},
 };
 return {...carry,focus,pose:poses[focus],kind:'attention-from-completed-observation'};
}
