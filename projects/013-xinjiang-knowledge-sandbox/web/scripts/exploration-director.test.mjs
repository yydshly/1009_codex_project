import test from 'node:test';
import assert from 'node:assert/strict';
import {createDirectorFlow,directorShots} from '../public/exploration-director-flow.js';
import {directorPaths} from '../public/exploration-director-paths.js';
import {historyTrails} from '../public/history-trails.js';
import {relationFocus} from '../public/spatial-relations-geography.js';
import {directorGeographyCue,directorStage} from '../public/director-spatial-sequence.js';
import {createDirectorView} from '../public/director-view.js';

function setup(extra={}){
 const seen=[];const audio={available:true,state:'idle',time:0,stop(){this.state='idle';this.time=0;},pause(){this.state='paused';},async play(){this.state='playing';return true;}};
 const flow=createDirectorFlow({enter:s=>seen.push(s.id),ready:()=>true,frame:()=>true,freeze:()=>{},resume:()=>{},leave:()=>seen.push('left'),loadAudio:async()=>({available:true,duration:2}),audio,...extra});return {flow,audio,seen};
}
const shot=id=>directorShots.findIndex(s=>s.id===id);
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('director waits for camera arrival before advancing narration',async()=>{let arrived=false;const {flow,audio}=setup({ready:()=>arrived});flow.jump(0,{play:true});await flush();for(let i=0;i<100;i++)flow.update(.1);assert.equal(flow.state.time,0);assert.equal(audio.state,'idle');arrived=true;flow.update(.1);await flush();audio.time=.1;flow.update(.1);assert.equal(flow.state.time,.1);});
test('pause retains narrated opening progress and does not resume automatically',async()=>{const {flow,audio}=setup();flow.jump(0,{play:true});await flush();flow.update(.1);await flush();audio.time=.1;flow.update(.1);flow.pause();for(let i=0;i<500;i++)flow.update(.1);assert.equal(flow.state.time,.1);assert.equal(flow.state.playing,false);assert.equal(audio.state,'paused');});
test('adjusting or restoring the camera keeps narration and real-response scheduling running',async()=>{
 let responded=false,interrupted=0,restored=0;
 const {flow,audio}=setup({frame:()=>responded});
 const view=createDirectorView({interrupt:()=>interrupted++,restore:()=>restored++});
 flow.jump(shot('home'),{play:true});await flush();flow.update(.1);await flush();
 audio.time=.6;flow.update(.1);view.inspect();
 assert.equal(view.manual,true);assert.equal(flow.state.playing,true);assert.equal(audio.state,'playing');assert.equal(flow.state.time,.6);
 audio.time=2;audio.state='ended';flow.update(.1);assert.equal(flow.state.shot.id,'home');
 view.follow(flow.state.shot);assert.equal(restored,1);assert.equal(interrupted,1);assert.equal(view.manual,false);assert.equal(flow.state.time,2);
 responded=true;flow.update(.1);assert.equal(flow.state.shot.id,'water');
});
test('camera gestures and recovery cannot resume an explicitly paused director',async()=>{
 const {flow,audio}=setup();flow.jump(0,{play:true});await flush();flow.update(.1);await flush();audio.time=.5;flow.update(.1);flow.pause();
 const view=createDirectorView({interrupt:()=>{},restore:()=>{}});view.inspect();view.follow(flow.state.shot);flow.update(.1);
 assert.equal(flow.state.playing,false);assert.equal(audio.state,'paused');assert.equal(flow.state.time,.5);
});
test('a new chapter resets manual framing without changing the previous narration state',()=>{
 let changes=[];const view=createDirectorView({interrupt:()=>{},restore:()=>{},changed:manual=>changes.push(manual)});
 view.inspect();view.reset();assert.equal(view.manual,false);assert.deepEqual(changes,[true,false]);
});
test('family shot waits for real completion rather than a duration alone',async()=>{let responded=false;const {flow,audio}=setup({frame:()=>responded});flow.jump(shot('home'),{play:true});await flush();flow.update(.1);await flush();audio.time=2;audio.state='ended';for(let i=0;i<180;i++)flow.update(.1);assert.equal(flow.state.shot.id,'home');responded=true;flow.update(.1);assert.equal(flow.state.shot.id,'water');});
test('stale narration loads cannot resurrect a skipped shot',async()=>{let resolve;const {flow}=setup({loadAudio:s=>s.beat!==undefined?new Promise(r=>resolve=r):Promise.resolve({available:false,duration:s.duration})});flow.jump(shot('departure'),{play:true});await flush();flow.jump(shot('regional'),{play:false});resolve({available:true,duration:500});await flush();assert.equal(flow.state.shot.id,'regional');assert.equal(flow.state.duration,18);assert.equal(flow.state.playing,false);});
test('narrated shots use audio time and can fall back to subtitles',async()=>{const {flow,audio}=setup();flow.jump(shot('departure'),{play:true});await flush();flow.update(.1);await flush();audio.time=1;flow.update(.1);assert.equal(flow.state.time,1);audio.state='error';flow.update(.1);flow.update(.1);assert.equal(flow.state.silent,true);assert.ok(flow.state.time>1);});
test('completion holds the map; taking over cancels the scheduler',async()=>{const {flow,audio,seen}=setup();flow.jump(directorShots.length-1,{play:true});await flush();flow.update(.1);await flush();audio.time=2;audio.state='ended';for(let i=0;i<110;i++)flow.update(.1);assert.equal(flow.state.complete,true);assert.equal(flow.state.playing,false);flow.stop();for(let i=0;i<100;i++)flow.update(.1);assert.equal(flow.state.active,false);assert.equal(seen.at(-1),'left');});

test('each director path binds all three narration beats to its own geography and usable model',()=>{
 for(const [id,p]of Object.entries(directorPaths).filter(([,p])=>p.kind!=='nature')){
  assert.equal(p.shots[0].id,'earth');assert.equal(p.shots.at(-1).id,'return');
  assert.deepEqual(p.shots.filter(s=>s.beat!==undefined).map(s=>s.beat),[0,1,2]);
  assert.ok(p.shots.every(s=>s.event===id));assert.ok(p.shots.filter(s=>s.model).every(s=>s.model===p.model));
  assert.equal(new Set(p.shots.map(s=>s.id)).size,p.shots.length);
  for(const f of p.features)assert.equal(relationFocus(id,f),f);
  if(historyTrails[id]){assert.equal(historyTrails[id].place,p.place);assert.equal(historyTrails[id].model,p.model);}
 }
 assert.deepEqual(directorPaths.zhang.shots.filter(s=>s.goods!==undefined).map(s=>s.goods),[0,1,2]);
 assert.ok(directorPaths.protectorate.shots.some(s=>s.connection&&s.open));
});
test('changing paths cancels pending narration and cannot overwrite the next path duration',async()=>{
 let resolve;const {flow}=setup({loadAudio:s=>s.beat!==undefined?new Promise(r=>resolve=r):Promise.resolve({available:false,duration:s.duration})});
 flow.jump(shot('departure'),{play:true});await flush();flow.setShots(directorPaths.protectorate.shots);flow.jump(directorPaths.protectorate.shots.findIndex(s=>s.id==='regional'),{play:false});
 resolve({available:true,duration:999});await flush();
 assert.equal(flow.state.shot.event,'protectorate');assert.equal(flow.state.shot.id,'regional');assert.equal(flow.state.duration,18);assert.equal(flow.state.playing,false);
});
test('all paths run in order and hold their own final map even when audio is unavailable',async()=>{
 for(const path of Object.values(directorPaths)){
  const {flow,seen}=setup({shots:path.shots,loadAudio:async()=>({available:false,duration:.2})});flow.jump(0,{play:true});
  for(let i=0;i<2400&&!flow.state.complete;i++){flow.update(.1);if(flow.state.loading)await flush();}
  assert.equal(flow.state.complete,true,path.id);assert.deepEqual(seen,path.shots.map(s=>s.id));assert.equal(flow.state.shot.event,path.id);
 }
});
test('structure and market shots wait for their real response and stop while paused',async()=>{
 for(const path of [directorPaths.zhang,directorPaths.protectorate]){
  let response=false;const shotIndex=path.shots.findIndex(s=>s.goods===0||s.connection);
  const {flow,audio}=setup({shots:path.shots,frame:()=>response});flow.jump(shotIndex,{play:true});await flush();flow.update(.1);await flush();audio.time=2;audio.state='ended';
  for(let i=0;i<200;i++)flow.update(.1);assert.equal(flow.state.index,shotIndex);
  flow.pause();response=true;flow.update(.1);assert.equal(flow.state.index,shotIndex);await flow.play();audio.state='ended';flow.update(.1);assert.equal(flow.state.index,shotIndex+1);
 }
});

test('opening establishes scales before contiguous historical beats and model outcomes',()=>{
 for(const path of Object.values(directorPaths).filter(p=>p.kind!=='nature')){
  assert.deepEqual(path.shots.slice(0,4).map(s=>s.id),['earth','china','landforms','regional']);
  assert.deepEqual(path.shots.slice(0,3).map(s=>s.anchor),['xinjiang','china','xinjiang']);
  assert.deepEqual(path.shots.filter(s=>s.beat!==undefined).map(s=>s.beat),[0,1,2]);
  assert(path.shots.slice(0,6).every(s=>s.model===undefined&&s.beat===undefined));
  assert.deepEqual(path.shots.slice(3,6).map(s=>s.geography),[0,1,2]);assert.equal(directorStage(path.shots[3]),'map');assert.ok(path.shots.slice(0,6).every(s=>s.audio&&s.speech&&s.targets.length));
  assert.equal(directorStage(path.shots[6]),'history');
  assert.equal(directorStage(path.shots.at(-1)),'return');
 }
 assert.equal(directorGeographyCue('xibe',.5).feature,'ili-water');
 assert.equal(directorGeographyCue('protectorate',.5).feature,'tarim');
 assert.equal(directorGeographyCue('zhang',1).index,2);
});

test('a finished shot waits for its final camera arrival before moving to another layer',()=>{
 let settled=true;
 const {flow}=setup({ready:()=>settled,shots:[{id:'first',duration:.2},{id:'second',duration:1}]});
 flow.jump(0,{play:true});flow.update(.1);settled=false;
 for(let i=0;i<20;i++)flow.update(.1);
 assert.equal(flow.state.shot.id,'first');
 flow.pause();settled=true;flow.update(.1);assert.equal(flow.state.shot.id,'first');
 flow.play();flow.update(.1);assert.equal(flow.state.shot.id,'second');
});

test('common opening and path geography recordings use their own speech clocks',async()=>{
 for(const p of Object.values(directorPaths).filter(p=>p.kind!=='nature'))for(let index=0;index<6;index++){
  const {flow,audio}=setup({shots:p.shots});flow.jump(index,{play:true});await flush();flow.update(.1);await flush();audio.time=.65;flow.update(.1);assert.equal(flow.state.time,.65);flow.pause();audio.time=.8;flow.update(.1);assert.equal(flow.state.time,.65);await flow.play();flow.update(.1);assert.equal(flow.state.time,.8);flow.stop();
 }
});
