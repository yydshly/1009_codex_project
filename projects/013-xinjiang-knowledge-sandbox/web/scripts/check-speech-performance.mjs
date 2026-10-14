// Deterministic WebAudio lifecycle tests; no paid generation and no synthetic audio installed.
import assert from 'node:assert/strict';
import {installSoundscape} from '../public/soundscape.js';

class Param {
 constructor(value=0){this.value=value;}
 setValueAtTime(value){this.value=value;}
 exponentialRampToValueAtTime(value){this.value=value;}
 setTargetAtTime(value){this.value=value;}
}
class AudioNode {
 constructor(){this.outputs=[];}
 connect(node){this.outputs.push(node);return node;}
 disconnect(){this.outputs=[];}
}
class Source extends AudioNode {
 constructor(context){super();this.context=context;this.started=false;this.stopped=false;this.loop=false;}
 start(when=0,offset=0){this.started=true;this.offset=offset;this.context.started.push(this);}
 stop(){this.stopped=true;this.onended?.();}
 end(){this.onended?.();}
}
class Context {
 constructor(){this.state='suspended';this.currentTime=1;this.sampleRate=100;this.destination=new AudioNode();this.started=[];this.analysers=[];this.panners=[];Context.last=this;}
 async resume(){if(this.resumeWait)await this.resumeWait;this.state='running';}
 createGain(){const node=new AudioNode();node.gain=new Param();return node;}
 createMediaStreamDestination(){const node=new AudioNode();node.stream={id:'recording-stream'};return node;}
 createBuffer(channels,size){const data=new Float32Array(size);return {getChannelData:()=>data};}
 createBufferSource(){return new Source(this);}
 createBiquadFilter(){const node=new AudioNode();node.frequency=new Param();return node;}
 createOscillator(){const node=new Source(this);node.frequency=new Param();return node;}
 createAnalyser(){const node=new AudioNode();node.sample=0;node.getFloatTimeDomainData=data=>data.fill(node.sample);this.analysers.push(node);return node;}
 createStereoPanner(){const node=new AudioNode();node.pan=new Param();this.panners.push(node);return node;}
 async decodeAudioData(bytes){return {duration:new Uint8Array(bytes)[0]};}
}
const listeners=new Map(),documentListeners=new Map(),pending=new Map();
globalThis.AudioContext=Context;
globalThis.document={hidden:false,addEventListener:(event,handler)=>documentListeners.set(event,handler)};
globalThis.fetch=async url=>{
 if(pending.has(url))await pending.get(url).wait;
 return {ok:true,arrayBuffer:async()=>new Uint8Array([8]).buffer};
};
const button={setAttribute(){},addEventListener:(event,handler)=>listeners.set(event,handler)};
const viewport={dataset:{}},sound=installSoundscape(button,viewport);
const cue={id:'test-narrator',stage:'people',key:'migration'};
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const sources=()=>Context.last.started.filter(item=>item.buffer?.duration);
const counts=()=>sources().length;
const quiet=()=>assert.deepEqual(sound.performance,{id:'',level:0,speaking:false,elapsed:0,duration:0});
function block(url){let release;const wait=new Promise(resolve=>{release=resolve;});pending.set(url,{wait});return ()=>{pending.delete(url);release();};}

quiet();await sound.unlock();assert.equal(sound.stream.id,'recording-stream');
sound.update(cue,0,true);await flush();assert.equal(counts(),1,'narration starts');quiet();
await sound.say('family-water',false,1.25,-.4);
assert.equal(sources().at(-1).offset,1.25,'decode preserves an already elapsed reply offset');
assert.equal(Context.last.panners.at(-1).pan.value,-.4);
const analyser=Context.last.analysers.at(-1);
assert.equal(sound.performance.speaking,false,'silence must not invent voice activity');
analyser.sample=.06;Context.last.currentTime+=.08;
let frame=sound.performance;
assert.equal(frame.id,'family-water');assert.equal(frame.speaking,true);assert(frame.level>.4&&frame.level<1);assert.equal(frame.duration,8);
assert(Math.abs(frame.elapsed-1.33)<1e-9);
analyser.sample=0;Context.last.currentTime+=.1;
assert.equal(sound.performance.speaking,false,'speech silence closes the speaking flag');
sound.setDialoguePosition(3);assert.equal(Context.last.panners.at(-1).pan.value,.65,'pan remains restrained');
sound.setDialoguePosition(NaN);assert.equal(Context.last.panners.at(-1).pan.value,0);

const finished=sources().at(-1),beforeEnd=counts();finished.end();quiet();
assert.equal(viewport.dataset.dialogueAudioState,'ended');assert.equal(viewport.dataset.dialogueAudio,'');
sound.update(cue,3,true,{id:'family-water',offset:3});await flush();
assert.equal(counts(),beforeEnd,'a naturally ended line is not restarted by repeated frames');
sound.update(cue,3.1,true,null);await flush();
sound.update(cue,3.2,true,{id:'family-water',offset:2});await flush();
assert.equal(counts(),beforeEnd+1,'leaving and explicitly revisiting a line permits playback');
sound.update(cue,3.3,false,null);quiet();assert(sources().at(-1).stopped,'automatic dialogue stops when the main story pauses');

await sound.say('culture-join',true);Context.last.analysers.at(-1).sample=.06;
sound.update(cue,3.3,false,{id:'culture-join'});
assert.equal(sound.performance.id,'culture-join','manual reply continues while the main timeline is paused');
sound.update(cue,3.4,true,null);quiet();assert(sources().at(-1).stopped,'resuming the main timeline cancels the prior manual reply');

const releaseSlow=block('./assets/audio/dialogue/slow.mp3');
const slow=sound.say('slow',true);await flush();sound.pause();const beforeCancelled=counts();releaseSlow();await slow;
assert.equal(counts(),beforeCancelled,'seek/pause invalidates pending decode');quiet();
const releaseOld=block('./assets/audio/dialogue/old.mp3');
const old=sound.say('old',true);await flush();await sound.say('new',true);
const fresh=counts();releaseOld();await old;
assert.equal(counts(),fresh,'an older fetch cannot replace the current speaker');assert.equal(sound.performance.id,'new');

let releaseResume;Context.last.resumeWait=new Promise(resolve=>{releaseResume=resolve;});
const waiting=sound.say('resume-wait',true);await flush();sound.pause();const beforeResume=counts();releaseResume();await waiting;Context.last.resumeWait=null;
assert.equal(counts(),beforeResume,'cancellation during AudioContext.resume cannot resurrect a line');quiet();
const releaseMuted=block('./assets/audio/dialogue/mute-wait.mp3');
const muted=sound.say('mute-wait',true);await flush();await listeners.get('click')();
const beforeMute=counts();releaseMuted();await muted;assert.equal(counts(),beforeMute);quiet();assert.equal(viewport.dataset.sound,'muted');
await sound.unlock();await sound.say('finished-offset',false,20);quiet();assert.equal(viewport.dataset.dialogueAudioState,'ended');
await sound.say('visibility',true);document.hidden=true;documentListeners.get('visibilitychange')();quiet();
assert.equal(viewport.dataset.dialogueAudioState,'idle');
console.log('speech performance: 18 lifecycle/PCM/stereo checks passed');
