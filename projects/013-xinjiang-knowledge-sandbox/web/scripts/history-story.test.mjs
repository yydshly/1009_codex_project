import test from 'node:test';
import assert from 'node:assert/strict';
import {historyStories,historyStorySources,historyStory,storyBeat} from '../public/history-story.js';
import {phaseAt} from '../public/history-process.js';
import {historyEvents} from '../public/history-content.js';
import {learningPlaces} from '../public/knowledge-content.js';
import {knowledgeScenes} from '../public/knowledge-scenes.js';

test('story phases remain synchronized with map phases, including reverse scrubbing and exact boundaries',()=>{
 for(const p of [0,.279999,.28,.5,.719999,.72,1,.5,0])assert.equal(storyBeat(p),phaseAt(p));
 assert.equal(storyBeat('0.72'),2);
 for(const p of [undefined,NaN,Infinity,-Infinity,'not-a-progress'])assert.equal(storyBeat(p),0);
 assert.equal(storyBeat(-1),0);assert.equal(storyBeat(2),2);
});

test('each narrated story connects an existing event to an actionable place and model with resolvable evidence',()=>{
 for(const [id,s] of Object.entries(historyStories)){
  assert(historyEvents.some(e=>e.id===id));
  assert.deepEqual(s.beats.map(b=>b.id),['background','process','impact']);
  assert(s.sources.length>0);for(const source of s.sources)assert.match(historyStorySources[source].url,/^https:\/\//);
  const place=learningPlaces.find(p=>p.id===s.place.id);assert(place);assert.equal(place.model,s.model.id);
  assert(knowledgeScenes[place.id].models.some(([model])=>model===s.model.id));
  for(const beat of s.beats){
   assert(beat.paragraph.length>=80&&beat.paragraph.length<=110,`${id}/${beat.id} narration length: ${beat.paragraph.length}`);
   assert(beat.question&&beat.visible&&beat.meaning&&beat.next);
   assert(beat.visible.length<35,'the in-scene visual cue stays short');
   assert(Number.isFinite(beat.focus.lon)&&Number.isFinite(beat.focus.lat));assert(beat.focus.distance>3.2);
  }
  assert(s.place.why&&s.place.bridge&&s.model.context&&s.model.summary);
  assert(s.model.tasks.length>=2);assert.equal(new Set(s.model.tasks.map(t=>t.id)).size,s.model.tasks.length);
  for(const task of s.model.tasks)assert(task.action&&task.observe&&task.meaning);
 }
 assert.equal(historyStory('migration'),historyStories.xibe);assert.equal(historyStory('missing'),null);
});

test('teaching scenes retain their historical limits at the place and model boundary',()=>{
 assert.match(historyStories.zhang.scope,/精确行程/);assert.match(historyStories.zhang.scope,/跨时期/);
 assert.match(historyStories.protectorate.scope,/乌垒遗址仍在研究/);assert.match(historyStories.protectorate.model.context,/建筑外形不能代替历史解释/);
 assert.match(historyStories.xibe.scope,/1764年出发、1765年抵达伊犁、1766年春/);
 assert.match(historyStories.xibe.scope,/后来的修渠/);
});
