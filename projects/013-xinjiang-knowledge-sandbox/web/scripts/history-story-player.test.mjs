import test from 'node:test';
import assert from 'node:assert/strict';
import {installHistoryStory} from '../public/history-story-player.js';
import {storyRange} from '../public/story-observation.js';

// Controller tests use explicit media/UI fakes; browser rendering is verified
// separately. Nothing fetches credentials, calls TTS, or starts audible playback.
const clips=['background','process','impact'].map(beat=>({event:'zhang',beat,file:`zhang-${beat}.mp3`,duration:20,subtitles:[]}));
const instances=[];
class FakeAudio extends EventTarget {
 constructor(){super();this.paused=true;this.currentTime=0;this.duration=NaN;this.src='';this.currentSrc='';this.ended=false;this.muted=false;this.playCalls=0;instances.push(this);}
 load(){this.currentSrc=this.src;this.currentTime=0;this.duration=this.src?20:NaN;}
 removeAttribute(name){if(name==='src')this.src='';}
 pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
 async play(){this.playCalls++;this.paused=false;return true;}
}
globalThis.Audio=FakeAudio;
globalThis.requestAnimationFrame=()=>1;
globalThis.cancelAnimationFrame=()=>{};
let releaseManifest;
globalThis.fetch=()=>new Promise(resolve=>{
 releaseManifest=()=>resolve({ok:true,json:async()=>({clips})});
});
const settle=()=>new Promise(setImmediate);

function harness({enterModel}={}){
 const listeners={};
 const canvas={addEventListener(){}};
 const root={addEventListener(type,callback){listeners[type]=callback;},querySelector(){return null;},querySelectorAll(){return [];}};
 const viewport={dataset:{},querySelector(){return canvas;}};
 globalThis.document={addEventListener(){},activeElement:null};
 const state={id:'zhang',trail:'zhang',stage:'history',progress:0,route:[],records:[]};
 const cameras=[],locations=[],entered=[];
 let freezes=0,moving=false;
 const player=installHistoryStory({root,viewport,context:()=>state,
  seek:value=>{state.progress=value;},
  focus:pose=>{cameras.push({...pose});moving=true;},
  history:()=>{state.stage='history';},locate(node){locations.push(node);},enterPlace(node){entered.push(node);},enterModel,commit(){},
  freezeCamera:()=>{freezes++;moving=false;}
 });
 const dispatch=dataset=>listeners.click({target:{closest:()=>({dataset,setAttribute(){}})}});
 return {player,viewport,state,cameras,locations,entered,audio:instances.at(-1),
  click:action=>dispatch({hsAction:action}),
  chapter:index=>dispatch({hsBeat:String(index)}),
  seek:value=>listeners.input({target:{value:String(value),hasAttribute:name=>name==='data-hs-seek'}}),
  get freezes(){return freezes;},get moving(){return moving;}
 };
}

test('the consolidated history action enters each chosen model once, only after an explicit request',()=>{
 for(const [id,node]of [['zhang','kashgar'],['protectorate','luntai'],['xibe','qabqal']]){
  const models=[],h=harness({enterModel:n=>models.push(n)});h.state.id=id;h.state.progress=1;
  h.state.destination={id:node,name:node};h.player.update(0);
  assert.deepEqual(models,[]);h.click('advance');
  assert.deepEqual(models,[node]);assert.deepEqual(h.locations,[]);assert.deepEqual(h.entered,[]);
  h.player.suspend();
 }
 const models=[],h=harness({enterModel:n=>models.push(n)});h.state.progress=1;h.state.destination={id:'turpan',name:'吐鲁番'};h.click('advance');assert.deepEqual(models,['turpan']);h.player.suspend();
});

test('the history ending honors a selected alternative destination rather than the default market',async()=>{
 const h=harness();h.state.destination={id:'turpan',name:'吐鲁番',question:'观察绿洲用水'};
 h.state.progress=1;h.click('advance');
 assert.deepEqual(h.locations,['turpan']);assert.deepEqual(h.entered,[]);
 h.state.node='turpan';h.click('advance');
 assert.deepEqual(h.entered,['turpan']);h.player.suspend();
});

test('inspect while the first narration is loading cancels its pending autoplay intent',async()=>{
 const h=harness();
 h.click('play');
 assert.equal(h.viewport.dataset.hsAudio,'loading');
 h.click('inspect');
 assert.equal(h.viewport.dataset.hsInspecting,'true');
 assert.equal(h.viewport.dataset.hsPlaying,'false');
 releaseManifest();await settle();h.player.update(.016);
 assert.equal(h.audio.playCalls,0,'a completed load must not overrule the user’s inspect/pause action');
 assert.equal(h.viewport.dataset.hsPlaying,'false');
 assert.equal(h.viewport.dataset.hsFollowing,'false');
 assert.equal(h.viewport.dataset.hsInspecting,'true');
 h.player.suspend();
});

test('on-canvas next moves one chapter while preserving a paused user-controlled state',async()=>{
 const h=harness();h.chapter(0);await settle();h.seek(30);h.click('advance');await settle();h.player.update(0);
 assert.equal(h.player.focus,'process');assert.equal(h.state.progress,storyRange('zhang',1)[0]);
 assert.equal(h.viewport.dataset.hsPlaying,'false');assert.deepEqual(h.locations,[]);
 assert.equal(h.viewport.dataset.hsPresentation,'1');h.player.suspend();
});

test('last on-canvas next locates a place only after the user requests it',async()=>{
 const h=harness();h.chapter(2);await settle();h.seek(100);h.player.update(0);
 assert.deepEqual(h.locations,[]);h.click('advance');assert.deepEqual(h.locations,['kashgar']);
 assert.equal(h.viewport.dataset.hsPlaying,'false');h.player.suspend();
});

test('a previously located place continues into the place introduction instead of locating again',async()=>{
 const h=harness();h.state.node='kashgar';h.chapter(2);await settle();h.seek(100);h.click('advance');
 assert.deepEqual(h.locations,[]);assert.deepEqual(h.entered,['kashgar']);h.player.suspend();
});

test('turning guided cameras off freezes an already running camera transition',async()=>{
 const h=harness();h.click('play');await settle();
 assert.equal(h.viewport.dataset.hsPlaying,'true');
 assert.equal(h.moving,true);
 const before=h.freezes;
 h.click('follow');
 assert.equal(h.viewport.dataset.hsFollowing,'false');
 assert(h.freezes>before,'the active transition must be cancelled when guidance is disabled');
 assert.equal(h.moving,false);
 assert.equal(h.viewport.dataset.hsPlaying,'true','free camera control does not stop narration');
 h.player.suspend();
});

test('resuming after a mid-transition pause reissues the current guided camera target',async()=>{
 const h=harness();h.click('play');await settle();
 assert.equal(h.moving,true);
 h.click('play');
 assert.equal(h.viewport.dataset.hsPlaying,'false');assert.equal(h.moving,false);
 const before=h.cameras.length;
 h.click('play');await settle();h.player.update(.016);
 assert.equal(h.viewport.dataset.hsPlaying,'true');
 assert.equal(h.viewport.dataset.hsFollowing,'true');
 assert(h.cameras.length>before,'resume must complete the cancelled current shot before waiting for the next cue');
 assert.equal(h.moving,true);
 h.player.suspend();
});

test('a paused chapter retains its narrative focus and geometry progress',async()=>{
 const h=harness();h.chapter(1);await settle();h.seek(50);
 assert.equal(h.player.focus,'process');
 h.click('play');await settle();h.player.update(.016);h.click('play');
 const progress=h.state.progress,motion=h.player.motion;
 for(let i=0;i<30;i++)h.player.update(.1);
 assert.equal(h.viewport.dataset.hsPlaying,'false');
 assert.equal(h.player.focus,'process');
 assert.equal(h.state.progress,progress);
 assert.equal(h.player.motion,motion);
 h.player.suspend();
});

test('100% of a paused chapter keeps its final shot until the next chapter is selected',async()=>{
 const h=harness();h.chapter(0);await settle();h.seek(100);h.player.update(0);
 assert.equal(h.state.progress,storyRange('zhang',0)[1]);
 assert.equal(h.viewport.dataset.hsBeat,'0');
 assert.equal(h.player.focus,'background');
 assert.equal(h.viewport.dataset.hsShot,'zhang:0:close','camera, emphasis and caption must remain in the same paused chapter');
 h.chapter(1);await settle();
 assert.equal(h.state.progress,storyRange('zhang',1)[0]);
 assert.equal(h.viewport.dataset.hsBeat,'1');assert.equal(h.player.focus,'process');
 assert.equal(h.viewport.dataset.hsShot,'zhang:1:wide');
 h.player.suspend();
});


test('spatial opening waits for each globe arrival and never starts speech or enters a model',async()=>{
 const h=harness();h.click('orient');assert.equal(h.viewport.dataset.hsOpening,'earth');
 assert.equal(h.cameras.at(-1).surface,0);assert.equal(h.audio.playCalls,0);
 h.cameras.at(-1).onArrive(true);assert.equal(h.viewport.dataset.hsOpening,'earth','the globe is held for reading');for(let i=0;i<21;i++)h.player.update(.1);assert.equal(h.viewport.dataset.hsOpening,'region');
 h.cameras.at(-1).onArrive(true);for(let i=0;i<16;i++)h.player.update(.1);assert.equal(h.viewport.dataset.hsOpening,'event');
 h.cameras.at(-1).onArrive(true);await settle();h.player.update(0);
 assert.equal(h.viewport.dataset.hsOpening,'');assert.equal(h.viewport.dataset.hsPlaying,'false');
 assert.equal(h.state.progress,0);assert.deepEqual(h.entered,[]);h.player.suspend();
});

test('dragging cancels a spatial opening and late arrival cannot resume the sequence',()=>{
 const h=harness();h.click('orient');const arrive=h.cameras.at(-1).onArrive;
 h.player.releaseCamera();const count=h.cameras.length;arrive(true);
 assert.equal(h.viewport.dataset.hsOpening,'');assert.equal(h.cameras.length,count);
 assert.equal(h.viewport.dataset.hsFollowing,'false');assert.equal(h.audio.playCalls,0);h.player.suspend();
});


test('leaving for a place and returning at the same progress preserves the miniature action clock',async()=>{
 const h=harness();h.chapter(2);await settle();h.seek(77);const motion=h.player.motion;
 h.player.suspend();h.state.stage='place';assert.equal(h.player.motion,motion);
 h.state.stage='history';assert.equal(h.player.motion,motion);
 h.state.progress=.92;assert.notEqual(h.player.motion,motion,'manual scrubbing selects a different frame');
});

test('starting from a map enters the event without replaying the global orientation',()=>{
 const h=harness();h.state.stage='map';h.click('start');
 assert.equal(h.state.stage,'history');assert.equal(h.cameras.length,1);
 assert.notEqual(h.viewport.dataset.hsOpening,'earth');assert.equal(h.viewport.dataset.hsActive,'true');h.player.suspend();
});


test('a director manifest cannot replace the historical player manifest cache',async()=>{
 const {createHistoryStoryAudio}=await import('../public/history-story-audio.js');
 const prior=globalThis.fetch;
 globalThis.fetch=async()=>({ok:true,json:async()=>({clips:[{event:'opening',beat:'earth',file:'opening-earth.mp3',duration:13,subtitles:[]}]})});
 try{
  const director=createHistoryStoryAudio({manifestURL:new URL('../public/assets/audio/director/manifest.json',import.meta.url)});
  const guided=await director.load('opening','earth');assert.equal(guided.available,true);assert.match(instances.at(-1).src,/director\/opening-earth.mp3$/);
  const original=createHistoryStoryAudio();const historical=await original.load('zhang',0);assert.equal(historical.available,true);assert.match(instances.at(-1).src,/history-story\/zhang-background.mp3$/);
  director.dispose();original.dispose();
 }finally{globalThis.fetch=prior;}
});
