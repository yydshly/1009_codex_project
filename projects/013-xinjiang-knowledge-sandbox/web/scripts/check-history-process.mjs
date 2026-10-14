import assert from 'node:assert/strict';
import {eventFrame,eventDuration,advanceEvent,phaseAt,phaseProgress,clampProgress} from '../public/history-process.js';
import {eventReadings,readingFor,placeReading} from '../public/event-reading.js';
import {historyEvents} from '../public/history-content.js';
// Scrubbing back must reproduce the same earlier state, with no accumulated growth.
for(const id of ['zhang','protectorate','xibe']){
 const before=eventFrame(id,.18);eventFrame(id,1);assert.deepEqual(eventFrame(id,.18),before);
 for(const p of [NaN,-1,0,.5,1,2]){const frame=eventFrame(id,p);for(const key of ['progress','route','travel','build','network','settle','water'])assert(frame[key]>=0&&frame[key]<=1);assert(frame.focus.every(Number.isFinite));}
}
assert.deepEqual(phaseProgress.map(phaseAt),[0,1,2]);
assert.equal(advanceEvent(.5,0,4),.5);assert.equal(advanceEvent(0,eventDuration),1);assert.equal(advanceEvent(.9,10,4),1);assert.equal(advanceEvent(.5,-10),.5);assert.equal(clampProgress(Infinity),0);
assert.equal(eventFrame('zhang',0).route,0);assert.equal(eventFrame('zhang',.5).network,0);assert.equal(eventFrame('zhang',1).network,1);
assert.equal(eventFrame('protectorate',0).build,0);assert(eventFrame('protectorate',.5).build>.5);assert.equal(eventFrame('protectorate',1).network,1);
assert.equal(eventFrame('xibe',.5).settle,0);assert.equal(eventFrame('xibe',.8).water,0);assert.equal(eventFrame('xibe',1).settle,1);assert.equal(eventFrame('xibe',1).water,1);
assert.notDeepEqual(eventFrame('zhang',.5),eventFrame('xibe',.5));
for(const event of historyEvents){
 assert.equal(eventReadings[event.id].stages.length,3);
 for(let phase=0;phase<3;phase++){const r=readingFor(event.id,phase),f=eventFrame(event.id,phaseProgress[phase]);assert.deepEqual(f.focus,r.focus);assert(Number.isFinite(f.distance)&&f.distance>0);assert(f.focusOffset===undefined||f.focusOffset.length===3&&f.focusOffset.every(Number.isFinite));assert(r.title&&r.look&&r.reason);}
 for(const node of event.nodes){const connection=placeReading(event.id,node.id);assert(connection?.why&&connection?.next);}
}
assert.notDeepEqual(eventFrame('xibe',0).focusOffset,eventFrame('xibe',1).focusOffset,'Global direction and region arrival must frame different objects.');
assert.match(placeReading('zhang','turpan').why,/延伸/,'Turpan must remain an extension, not an asserted historical stop.');
assert.match(readingFor('xibe',2).reason,/之后修渠/,'Later canal works must not be merged with arrival.');
console.log('R36：事件进度边界、暂停、倒退复现、阶段锚点与三条空间变化链通过。');
console.log('R40：阶段取景、地点探索问题及跨时期表达边界通过。');
