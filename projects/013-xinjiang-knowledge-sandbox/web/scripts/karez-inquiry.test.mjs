import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceKarez,karezTargets,karezReading,restoredKarez,karezStops} from '../public/karez-inquiry.js';

const run=(state,condition,seconds=12)=>{for(let i=0;i<seconds*10;i++)state=advanceKarez(state,.1,condition);return state;};
test('maintenance and source changes have distinct, delayed downstream responses',()=>{
 const initial=restoredKarez({supply:65}).frame;
 const blocked={...initial,obstruction:1};
 const early=advanceKarez(blocked,.1,{supply:65,care:'blocked'});
 assert(early.reservoir>karezTargets(65,1).outlet,'reservoir responds after the channel, not an immediate bar change');
 const dry=run(blocked,{supply:65,care:'blocked'});assert(dry.reservoir<.13);assert(dry.obstruction===1);
 const clear=run(dry,{supply:65,care:'clear'},18);assert.equal(clear.obstruction,0);assert(clear.reservoir>.64);assert(karezReading(clear,65,'clear').stable);
 const reduced=run(initial,{supply:20,care:'open'});assert(Math.abs(reduced.reservoir-.2)<.01);
 const zero=run(initial,{supply:0,care:'open'});assert(zero.reservoir<.001);
 assert.deepEqual(advanceKarez(blocked,0,{supply:65,care:'clear'}),blocked,'pause freezes maintenance, response and content time');
});
test('saved experiments restore the response, while URL defaults retain only conditions',()=>{
 const progressing=run({...restoredKarez().frame,obstruction:1},{supply:65,care:'clear'},1);
 assert.deepEqual(restoredKarez({supply:65,care:'clear',frame:progressing}).frame,progressing);
 assert.equal(restoredKarez({supply:120,care:'unknown'}).supply,100);
 assert.equal(restoredKarez({supply:20,care:'blocked'}).frame.obstruction,1);
 assert.equal(new Set(karezStops.map(s=>s.id)).size,4);
 for(const s of karezStops)assert(s.point.every(Number.isFinite));
});
