import test from 'node:test';
import assert from 'node:assert/strict';
import {mapBridges,mapBridgeFrame,mapBridgeFor} from '../public/exploration-bridge.js';
import {explorationDestination,createExplorationMemory} from '../public/exploration-destinations.js';
import {directorPaths} from '../public/exploration-director-paths.js';
import {relationFocus} from '../public/spatial-relations-geography.js';

test('map explanation starts with geography and ends with its place model',()=>{
 for(const id of Object.keys(mapBridges)){
  for(const p of [0,.15,.3]){const c=mapBridgeFrame(id,p);assert.equal(c.geography,true);assert.equal(c.reveal,0);assert.equal(c.model,0);}
  assert.ok(mapBridgeFrame(id,.9).model>0);
  assert.equal(mapBridgeFrame(id,1).model,1);
  for(const s of mapBridges[id].steps)assert.equal(relationFocus(id,s.feature),s.feature);
 }
});
test('the institution appears before its links; exchange and migration follow their corridors first',()=>{
 for(const id of ['zhang','xibe']){
  assert.ok(mapBridgeFrame(id,.6).reveal>mapBridgeFrame(id,.4).reveal);
  assert.equal(mapBridgeFrame(id,.6).model,0);
 }
 const build=mapBridgeFrame('protectorate',.6),connect=mapBridgeFrame('protectorate',.9);
 assert.equal(build.reveal,0);assert.ok(build.model>.16&&build.model<.64);
 assert.ok(connect.reveal>0);assert.ok(connect.model>build.model);
 assert.equal(mapBridgeFrame('protectorate',2/3).model,.64);
 for(const id of Object.keys(mapBridges)){assert.ok(mapBridgeFrame(id,.9).clock>mapBridgeFrame(id,.6).clock);assert.equal(mapBridgeFrame(id,.6).clock,mapBridgeFrame(id,.6).clock);}
});
test('every automatic path establishes the regional setting after world scales and before history',()=>{
 for(const p of Object.values(directorPaths)){
  const regional=p.shots.findIndex(s=>s.id==='regional');
  assert.equal(p.shots[0].id,'earth');assert(p.shots.slice(0,regional).every(s=>s.world));
  if(p.kind==='nature'){assert.ok(p.shots.findIndex(s=>s.model)>regional);assert.equal(p.shots.some(s=>s.beat!==undefined),false);}
  else{assert.ok(p.shots.findIndex(s=>s.beat!==undefined)>regional);assert.ok(p.shots.findIndex(s=>s.id==='place')>p.shots.findIndex(s=>s.beat===2));}
 }
});
test('map cue seeking clamps endpoints and preserves path-specific geography',()=>{
 assert.equal(mapBridgeFrame('xibe',.5).feature,'ili-water');
 assert.equal(mapBridgeFrame('zhang',.5).feature,'tarim');
 assert.equal(mapBridgeFrame('protectorate',-10).index,0);
 assert.equal(mapBridgeFrame('xibe',10).index,2);
 assert.equal(mapBridgeFrame('zhang',NaN).progress,0);
});

test('the selected place changes both the explanation and the model destination',()=>{
 assert.equal(explorationDestination('zhang','turpan').model,'karez');
 assert.equal(explorationDestination('zhang','kashgar').model,'market');
 assert.equal(explorationDestination('protectorate','kashgar').id,'luntai');
 assert.equal(explorationDestination('xibe','qabqal').model,'people');
 assert.match(mapBridgeFor('zhang','turpan').destination,/吐鲁番/);
 assert.match(mapBridgeFrame('zhang',1,'turpan').text,/坎儿井/);
 assert.match(mapBridgeFrame('zhang',1,'kashgar').text,/集市/);
});

test('return cameras and observed results are isolated by event and place',()=>{
 const memory=createExplorationMemory(),view={node:'turpan',view:{position:[1,2,3]},guide:.993};
 memory.rememberMap('zhang',view);view.view.position[0]=99;
 memory.rememberMap('xibe',{node:'qabqal',view:{position:[4,5,6]}});
 assert.deepEqual(memory.map('zhang').view.position,[1,2,3]);
 assert.equal(memory.map('protectorate'),null);
 const first=[{priority:'0',reply:'received'}];memory.rememberObservation('zhang','kashgar',first);first[0].reply='changed';
 memory.rememberObservation('zhang','turpan',[{priority:'water',reply:'flowed'}]);
 memory.rememberObservation('xibe','qabqal',[{priority:'home',reply:'settled'}]);
 memory.rememberObservation('zhang','kashgar',[]);
 assert.equal(memory.observations('zhang','kashgar')[0].reply,'received');
 assert.equal(memory.observations('zhang','turpan')[0].reply,'flowed');
 assert.equal(memory.observations('xibe','qabqal')[0].reply,'settled');
 assert.deepEqual(memory.observations('protectorate','luntai'),[]);
});
