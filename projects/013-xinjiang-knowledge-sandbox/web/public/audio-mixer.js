import {pendingNarration} from './narration-revision.js';
import {ambientSamples,foleySamples,environmentFor,crossed} from './audio-design.js';
export function installSoundscape(button,viewport){
 let ctx,master,destination,speechBus,fxBus,reverbSend,enabled=true,playing=false,transportActive=false;
 let source,token=0,lastCue='',narrationEnd=0,narrationStartedAt=0,narrationOffset=0,environment='',lastFrame=null,variant=0;
 let dialogueSource,dialogueToken=0,activeDialogue='',dialogueManual=false,dialogueAnalyser,dialoguePanner,dialogueSamples;
 let dialoguePan=0,dialogueStartedAt=0,dialogueOffset=0,dialogueDuration=0,speechLevel=0,speechSampledAt=0;
 const cache=new Map(),beds=new Map(),foley=new Map(),events=[],quietPerformance=Object.freeze({id:'',level:0,speaking:false,elapsed:0,duration:0});
 const log=(kind,detail={})=>events.push({...detail,performanceMS:performance.now(),audioSecond:ctx?.currentTime??0,kind});
 function ensure(){
  if(ctx)return;
  ctx=new AudioContext({sampleRate:48000});master=ctx.createGain();master.gain.value=.88;
  const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-15;compressor.knee.value=10;compressor.ratio.value=2.2;compressor.attack.value=.006;compressor.release.value=.18;
  master.connect(compressor);compressor.connect(ctx.destination);destination=ctx.createMediaStreamDestination();compressor.connect(destination);
  speechBus=ctx.createGain();speechBus.gain.value=.98;speechBus.connect(master);fxBus=ctx.createGain();fxBus.gain.value=.8;fxBus.connect(master);
  const impulse=ctx.createBuffer(2,Math.round(ctx.sampleRate*.36),ctx.sampleRate);
  for(let c=0;c<2;c++)for(const [s,v] of [[.024,.35],[.057,.22],[.091,.12],[.147,.055]])impulse.getChannelData(c)[Math.round((s+c*.003)*ctx.sampleRate)]=v;
  const convolution=ctx.createConvolver();convolution.buffer=impulse;reverbSend=ctx.createGain();reverbSend.gain.value=0;speechBus.connect(convolution);convolution.connect(reverbSend);reverbSend.connect(master);
 }
 function ui(){const active=enabled&&ctx?.state==='running';button.textContent=active?'声音开':'开启声音';button.setAttribute('aria-pressed',String(active));viewport.dataset.sound=active?'running':enabled?'gesture-needed':'muted';}
 function ensureEnvironment(profile){
  if(beds.has(profile))return;
  const buffer=ctx.createBuffer(1,ctx.sampleRate*17,ctx.sampleRate);buffer.copyToChannel(ambientSamples(profile,ctx.sampleRate),0);
  const node=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner();node.buffer=buffer;node.loop=true;gain.gain.value=0;pan.pan.value=profile==='water'?-.2:profile==='gate'?.2:0;
  node.connect(gain);gain.connect(pan);pan.connect(master);node.start();beds.set(profile,{node,gain});
 }
 function blendEnvironment(profile,active){
  if(active&&profile!==environment){ensureEnvironment(profile);log('environment',{from:environment,to:profile,crossfadeSeconds:1.6});environment=profile;}
  const speaking=!!dialogueSource||!!source&&ctx.currentTime<narrationEnd,duck=speaking?.34:1;
  for(const [name,{gain}] of beds)gain.gain.setTargetAtTime(active&&name===environment?.45*duck:0,ctx.currentTime,.4);
  reverbSend.gain.setTargetAtTime(profile==='courtyard'?.075:0,ctx.currentTime,.3);
 }
 function stopVoice(){token++;try{source?.stop();}catch{}source=null;narrationEnd=0;}
 function releaseDialogueNodes(){try{dialogueSource?.disconnect();dialogueAnalyser?.disconnect();dialoguePanner?.disconnect();}catch{}dialogueSource=null;dialogueAnalyser=null;dialoguePanner=null;dialogueSamples=null;speechLevel=0;speechSampledAt=0;dialogueStartedAt=0;dialogueOffset=0;dialogueDuration=0;}
 function stopDialogue(){dialogueToken++;const old=dialogueSource;releaseDialogueNodes();activeDialogue='';dialogueManual=false;try{old?.stop();}catch{}viewport.dataset.dialogueAudio='';viewport.dataset.dialogueAudioState='idle';}
 function setDialoguePosition(pan=0){dialoguePan=Number.isFinite(pan)?Math.max(-.65,Math.min(.65,pan)):0;if(dialoguePanner)dialoguePanner.pan.setTargetAtTime(dialoguePan,ctx.currentTime,.12);}
 function performanceFrame(){
  if(!enabled||ctx?.state!=='running'||!dialogueSource||!dialogueAnalyser)return quietPerformance;
  const elapsed=Math.min(dialogueDuration,dialogueOffset+Math.max(0,ctx.currentTime-dialogueStartedAt));if(elapsed>=dialogueDuration)return quietPerformance;
  dialogueAnalyser.getFloatTimeDomainData(dialogueSamples);let energy=0;for(const value of dialogueSamples)energy+=value*value;
  const rms=Math.sqrt(energy/dialogueSamples.length),target=Math.max(0,Math.min(1,(rms-.0035)/.085));
  const dt=speechSampledAt?Math.min(.1,Math.max(0,ctx.currentTime-speechSampledAt)):1/60;speechLevel+=(target-speechLevel)*(1-Math.exp(-dt*(target>speechLevel?28:18)));speechSampledAt=ctx.currentTime;
  return {id:activeDialogue,level:speechLevel,speaking:rms>.004,elapsed,duration:dialogueDuration};
 }
 async function load(key){if(!cache.has(key))cache.set(key,fetch(`./assets/audio/${key}.mp3`).then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)));return cache.get(key);}
 async function say(id,manual=true,offset=0,pan){
  if(!enabled||!id)return;ensure();stopDialogue();stopVoice();if(pan!==undefined)setDialoguePosition(pan);
  activeDialogue=id;dialogueManual=manual;const stamp=dialogueToken,key='dialogue/'+id;viewport.dataset.dialogueAudioState='loading';
  try{
   await ctx.resume();if(stamp!==dialogueToken||!enabled||ctx.state!=='running')return;
   const b=await load(key);if(stamp!==dialogueToken||!enabled||ctx.state!=='running')return;
   const startOffset=Number.isFinite(offset)?Math.max(0,offset):0;if(startOffset>=b.duration){viewport.dataset.dialogueAudio='';viewport.dataset.dialogueAudioState='ended';return;}
   const current=ctx.createBufferSource(),gain=ctx.createGain();current.buffer=b;gain.gain.value=.95;dialogueSource=current;
   dialogueAnalyser=ctx.createAnalyser();dialogueAnalyser.fftSize=1024;dialogueAnalyser.smoothingTimeConstant=0;dialogueSamples=new Float32Array(dialogueAnalyser.fftSize);dialoguePanner=ctx.createStereoPanner();dialoguePanner.pan.value=dialoguePan;
   current.connect(gain);gain.connect(dialogueAnalyser);dialogueAnalyser.connect(dialoguePanner);dialoguePanner.connect(speechBus);
   dialogueStartedAt=ctx.currentTime;dialogueOffset=startOffset;dialogueDuration=b.duration;speechSampledAt=ctx.currentTime;
   current.onended=()=>{if(stamp!==dialogueToken||dialogueSource!==current)return;log('dialogue-ended',{id});releaseDialogueNodes();viewport.dataset.dialogueAudio='';viewport.dataset.dialogueAudioState='ended';};
   current.start(0,startOffset);log('dialogue',{id,offset:startOffset,duration:b.duration,pan:dialoguePan});viewport.dataset.dialogueAudio=id;viewport.dataset.dialogueAudioState='playing';
  }catch{if(stamp===dialogueToken){releaseDialogueNodes();viewport.dataset.dialogueAudio='unavailable';viewport.dataset.dialogueAudioState='unavailable';log('audio-error',{id});}cache.delete(key);}
 }
 async function voice(id,elapsed){
  stopVoice();const stamp=token;
  try{
   const b=await load(id);if(stamp!==token||!enabled||!playing||ctx.state!=='running'||elapsed>=b.duration)return;
   const current=ctx.createBufferSource(),gain=ctx.createGain();current.buffer=b;gain.gain.value=.95;current.connect(gain);gain.connect(speechBus);source=current;narrationEnd=ctx.currentTime+b.duration-elapsed;
   current.onended=()=>{if(source===current){source=null;narrationEnd=0;log('narration-ended',{id});}};
   narrationStartedAt=ctx.currentTime;narrationOffset=Math.max(0,elapsed);
   current.start(0,narrationOffset);log('narration',{id,offset:elapsed,duration:b.duration});viewport.dataset.narration=id;
  }catch{viewport.dataset.narration='unavailable';cache.delete(id);log('audio-error',{id});}
 }
 function sound(kind,stage,detail={}){
  if(!ctx||ctx.state!=='running'||!enabled)return;
  const material=detail.material??({step:'step',choice:'paper',response:'cloth',handoff:stage==='people'?'paper':'wood'})[kind]??kind;
  const key=material+'/'+(variant++%5);if(!foley.has(key)){const samples=foleySamples(material,ctx.sampleRate,variant%5),buffer=ctx.createBuffer(1,samples.length,ctx.sampleRate);buffer.copyToChannel(samples,0);foley.set(key,buffer);}
  const node=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner();node.buffer=foley.get(key);
  gain.gain.value=(material==='step'?.1:material==='drum'||material==='pluck'?.065:.14)*(detail.intensity??1);pan.pan.value=Math.max(-.75,Math.min(.75,detail.pan??0));
  node.connect(gain);gain.connect(pan);pan.connect(fxBus);node.onended=()=>{node.disconnect();gain.disconnect();pan.disconnect();};node.start();log('foley',{sound:material,stage,...detail});
 }
 function observe(frame){
  if(!frame)return;const previous=lastFrame?.cue===frame.cue?lastFrame:null;lastFrame=frame;
  if(!transportActive||!enabled||ctx?.state!=='running')return;
  for(const actor of frame.actors)for(const hit of actor.contacts)sound(hit.kind,frame.stage,{...hit,actor:actor.id,pan:actor.pan,intensity:actor.intensity,sync:'rendered-contact'});
  if(!previous)return;
  const emit=(soundName,field,threshold,material)=>{if(crossed(previous[field],frame[field],threshold))sound(soundName,frame.stage,{material,sync:'rendered-prop',value:frame[field],threshold});};
  if(frame.stage==='market'&&!frame.goodsPending)emit('handoff','goodsAge',3.8,['cloth','wood','clay'][frame.goods]);
  if(frame.stage==='people')emit('handoff','familyHandoff',.55,frame.memory==='tools'?'wood':'paper');
  if(frame.stage==='oasis'){emit('handoff','waterHome',.7,'clay');emit('latch','waterAge',.5,'wood');}
  if(frame.stage==='culture')emit('handoff','practiceHandoff',.55,'paper');
  if(frame.stage==='logistics'){emit('handoff','proposal',.95,'paper');emit('latch','barrier',.3,'latch');}
 }
 async function unlock(){ensure();enabled=true;try{await ctx.resume();}catch{}lastCue='';ui();}
 async function engage(){if(!enabled)return;ensure();try{await ctx.resume();}catch{}ui();}
 function pause(){playing=false;transportActive=false;stopVoice();stopDialogue();if(ctx)blendEnvironment(environment,false);lastCue='';lastFrame=null;}
 button.addEventListener('click',async()=>{if(enabled&&ctx?.state==='running'){enabled=false;pause();}else await unlock();ui();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 function update(cue,elapsed,isPlaying,dialogue,transport={active:isPlaying}){
  const wasPlaying=playing;playing=isPlaying;transportActive=transport.active;ui();if(!ctx||ctx.state!=='running'||!enabled)return;
  blendEnvironment(environmentFor(cue),transportActive);
  if(isPlaying&&!wasPlaying&&dialogueManual){stopDialogue();dialogueManual=false;}
  if(!isPlaying){if(!transportActive){if(source)stopVoice();if(!dialogueManual)stopDialogue();lastCue='';}return;}
  if(lastCue!==cue.id){lastCue=cue.id;if(!dialogueManual)stopDialogue();if(!pendingNarration.has(cue.id))voice(cue.id,elapsed);viewport.dataset.narration=pendingNarration.has(cue.id)?'script-only':'recorded';}
  if(dialogue?.id&&dialogue.id!==activeDialogue)say(dialogue.id,false,dialogue.offset??0,dialogue.pan);else if(!dialogue&&activeDialogue&&!dialogueManual)stopDialogue();
 }
 return {unlock,engage,pause,update,observe,event:sound,say,setDialoguePosition,get narration(){return source?{id:lastCue,elapsed:narrationOffset+Math.max(0,ctx.currentTime-narrationStartedAt)}:null;},get events(){return events;},get performance(){return performanceFrame();},get stream(){ensure();return destination.stream;},get enabled(){return enabled&&ctx?.state==='running';},get ready(){return ctx?.state==='running';}};
}
