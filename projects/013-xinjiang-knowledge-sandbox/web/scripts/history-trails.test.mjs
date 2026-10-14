import test from 'node:test';
import assert from 'node:assert/strict';
import {historyTrails,focusedStep,marketObservation,structureObservation,structureParts} from '../public/history-trails.js';
import {historyEvents} from '../public/history-content.js';
import {knowledgeScenes} from '../public/knowledge-scenes.js';
import {learningPlaces} from '../public/knowledge-content.js';
import {mapFeatures} from '../public/map-learning-content.js';
test('each focused history trail resolves its own event, map feature, place and usable model',()=>{
 for(const c of Object.values(historyTrails)){
  assert.equal(c.steps.length,5);assert.equal(c.times.length,3);
  assert(historyEvents.find(e=>e.id===c.event).nodes.some(n=>n.id===c.node));
  assert(mapFeatures.some(f=>f.id===c.feature&&f.lens===c.lens));
  assert(learningPlaces.some(p=>p.id===c.place&&p.model===c.model));
  assert(knowledgeScenes[c.place].models.some(([id])=>id===c.model));
 }
 assert.notEqual(historyTrails.zhang.model,historyTrails.protectorate.model);
 assert.equal(focusedStep('place',false),'place');assert.equal(focusedStep('place',true),'model');
});
test('a market choice requires the matching actual completed recipient use, not a click or delivery alone',()=>{
 const states=['family-continues','traveller-departs','craft-work-continues'];
 for(let i=0;i<3;i++){
  const d={goods:String(i),deliveryCount:'1',marketUse:states[i]};assert(marketObservation(d,i));
  assert.equal(marketObservation({...d,marketUse:'receiving-and-using'},i),null);
  assert.equal(marketObservation({...d,deliveryCount:'0'},i),null);
  assert.equal(marketObservation({...d,deliveryCount:undefined},i),null);
  assert.equal(marketObservation(d,(i+1)%3),null);
 }
 assert.equal(marketObservation({},null),null);
});
test('structure observation requires the rendered part and settled raised roofs',()=>{
 for(const [i,p]of structureParts.entries()){
  const d={historyStructure:'true',structurePart:p.key,structureRoofLift:'1.099'};
  assert(structureObservation(d,i,true));
  assert.equal(structureObservation(d,i,false),null);
  assert.equal(structureObservation({...d,structureRoofLift:'.5'},i,true),null);
  assert.equal(structureObservation({...d,structureRoofLift:undefined},i,true),null);
  assert.equal(structureObservation({...d,structurePart:'missing'},i,true),null);
 }
});
