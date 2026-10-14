import test from 'node:test';
import assert from 'node:assert/strict';
import {historyPresentation,historyMapIntroduction} from '../public/history-presentation.js';
import {timedStorySubtitle} from '../public/story-observation.js';
import {readFileSync} from 'node:fs';

test('all three histories explain each chapter and keep place meaning tied to that chapter',()=>{
 for(const id of ['zhang','protectorate','xibe']){
  for(let i=0;i<3;i++){const p=historyPresentation(id,i);assert.equal(p.phase,i);assert.equal(p.steps.length,3);assert.equal(p.legend.length,2);assert(p.intro.length<90);}
  const node={zhang:'kashgar',protectorate:'luntai',xibe:'qabqal'}[id];
  assert.notEqual(historyMapIntroduction(id,0,node).meaning,historyMapIntroduction(id,2,node).meaning);
 }
 assert.equal(historyPresentation('unknown'),null);
});
test('long narration blocks display short sentences without spilling across timed block boundaries',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/assets/audio/history-story/manifest.json',import.meta.url),'utf8'));
 for(const clip of manifest.clips)for(const cue of clip.subtitles){
  const sentences=new Set();
  for(let f=0;f<1;f+=.01){const line=timedStorySubtitle([cue],cue.time_begin+f*(cue.time_end-cue.time_begin));assert(line.length<=48);assert(cue.text.includes(line));sentences.add(line);}
  assert.equal([...sentences].join(''),cue.text,'sentence splitting preserves all transcript text');
  assert.equal(timedStorySubtitle([cue],cue.time_begin-1),'');assert.equal(timedStorySubtitle([cue],cue.time_end),'');
 }
});


test('a long question keeps short dependent clauses attached to their context',()=>{
 const text='现在把视线移到盆地西侧的喀什，用一个跨时期集市情境继续追问：谁需要这些货物，接手之后，生活发生了什么变化？';
 const cue={text,time_begin:0,time_end:10000};
 for(let t=0;t<10000;t+=100){const line=timedStorySubtitle([cue],t);if(line.includes('接手之后'))assert(line.includes('谁需要')||line.includes('生活发生'));}
});
