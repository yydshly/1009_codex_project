import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ambientSamples,foleySamples,environmentProfiles,environmentFor,footContacts,instrumentContacts,crossed} from '../public/audio-design.js';
test('footfalls follow alternating rendered support, not elapsed timers',()=>{
 assert.deepEqual(footContacts(.48,.52,1,true).map(h=>h.foot),['right']);
 assert.deepEqual(footContacts(.98,1.02,1,true).map(h=>h.foot),['left']);
 for(const [a,b,blend,moving] of [[0,0,1,true],[0,.1,0,true],[0,1,1,true],[0,.1,1,false],[1,.1,1,true]])assert.deepEqual(footContacts(a,b,blend,moving),[]);
});
test('instrument contacts stop in the observation turn and do not burst on seek',()=>{
 assert.equal(instrumentContacts(.79,.81,'drum',true)[0].kind,'drum');
 assert.deepEqual(instrumentContacts(.79,.81,'drum',false),[]);
 assert.deepEqual(instrumentContacts(0,8,'drum',true),[]);
 assert.deepEqual(instrumentContacts(null,.81,'drum',true),[]);
 assert(crossed(.54,.57,.55));assert(!crossed(.57,.58,.55));
});
test('all scene beds and material Foley remain finite, bounded and distinct',()=>{
 const fingerprints=new Set();
 for(const profile of environmentProfiles){const a=ambientSamples(profile,8000,1);let sum=0;for(const x of a){assert(Number.isFinite(x)&&Math.abs(x)<=.35);sum+=x*x;}assert(sum>0);fingerprints.add(sum.toFixed(7));}
 assert.equal(fingerprints.size,environmentProfiles.length);
 for(const kind of ['step','wood','clay','cloth','paper','latch','pluck','drum'])for(const x of foleySamples(kind,8000))assert(Number.isFinite(x)&&Math.abs(x)<=.85);
 assert.equal(environmentFor({stage:'market'}),'market');assert.equal(environmentFor({key:'glacier'}),'mountain');
});
