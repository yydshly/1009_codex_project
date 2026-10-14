import test from 'node:test';
import assert from 'node:assert/strict';
import {eventPlaces,matchingLearningEvent,scaleLink} from '../public/learning-links.js';
import {historicalPeriods,learningPlaces} from '../public/knowledge-content.js';
import {historyEvents} from '../public/history-content.js';
import {mapFeatures} from '../public/map-learning-content.js';

test('historical handoffs preserve valid event nodes and supported place/model routes',()=>{
 for(const [id,links]of Object.entries(eventPlaces)){
  const e=historyEvents.find(e=>e.id===id);assert(e);
  for(const link of links){assert(e.nodes.some(n=>n.id===link.node));if(link.place)assert(learningPlaces.some(p=>p.id===link.place));if(link.legacy)assert(e.nodes.some(n=>n.id===link.legacy));assert(link.why.length>10);}
 }
 assert.equal(matchingLearningEvent(historicalPeriods.find(p=>p.id==='han'),'protectorate'),'protectorate');
 assert.equal(matchingLearningEvent(historicalPeriods.find(p=>p.id==='qing'),'zhang'),'xibe');
 assert.equal(matchingLearningEvent(historicalPeriods.find(p=>p.id==='tang'),'zhang'),null);
});
test('scale introductions distinguish context and model mechanisms',()=>{
 const inputs={world:'exchange',feature:mapFeatures.find(p=>p.id==='south-passage'),period:historicalPeriods.find(p=>p.id==='han'),event:historyEvents[0],place:learningPlaces.find(p=>p.id==='kashgar')};
 for(const stage of ['world','map','history','place']){const link=scaleLink({...inputs,stage,from:'map'});for(const key of ['from','why','next'])assert(link[key]?.length>4);}
 assert(scaleLink({...inputs,stage:'place',modelOpen:true}).from.includes('模型'));
 assert(!scaleLink({...inputs,stage:'history',period:historicalPeriods.find(p=>p.id==='qing'),from:'map'}).from.includes(inputs.feature.name),'free period changes do not invent the same geographic origin');
});
