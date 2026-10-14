import test from 'node:test';
import assert from 'node:assert/strict';
import {settlementObservation,migrationStep} from '../public/migration-trail.js';
test('a choice is recorded only after the actual matching scene response finishes',()=>{
 const d={householdPriority:'home',familyProgress:'1',homeOutcome:'1',waterOutcome:'1',settlementReply:'1'};
 assert.equal(settlementObservation({...d,settlementReply:'.2'},'home'),null);
 assert.equal(settlementObservation({...d,waterOutcome:'.5'},'home'),null);
 assert.equal(settlementObservation({...d,familyProgress:'.7'},'home'),null);
 assert.equal(settlementObservation({...d,homeOutcome:'NaN'},'home'),null);
 assert.equal(settlementObservation(d,'water'),null);
 assert.equal(settlementObservation(d,'other'),null);
 assert.match(settlementObservation(d,'home').sequence,/家人.*灯火.*渠水/);
 assert.match(settlementObservation({...d,householdPriority:'water'},'water').sequence,/水闸.*渠水.*家人/);
});
test('returning to the place map is distinct from entering the family model',()=>{
 assert.equal(migrationStep('place',true),'family');
 assert.equal(migrationStep('place',false),'place');
 assert.equal(migrationStep('history',false),'history');
});
