// Original synthesized wind and sand contacts, never represented as field recordings.
// One reusable buffer/context; gesture permission, pause and mute share the scene clock.
export function createEnvoySound(){
 let context=null,wind=null,noise=null,enabled=true,walkClock=0,lastStep=0;
 function engage(){if(context){context.resume().catch(()=>{});return;}const Audio=window.AudioContext??window.webkitAudioContext;if(!Audio)return;
  context=new Audio();noise=context.createBuffer(1,context.sampleRate*3,context.sampleRate);const data=noise.getChannelData(0);let seed=90487;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
  const source=context.createBufferSource();source.buffer=noise;source.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=950;wind=context.createGain();wind.gain.value=0;source.connect(filter).connect(wind).connect(context.destination);source.start();context.resume().catch(()=>{});
 }
 function update(frame,dt,{running=false,muted=false}={}){if(!context)return;const live=enabled&&running&&!muted&&!document.hidden,t=context.currentTime;wind.gain.setTargetAtTime(live?.012+frame.wind*.024:0,t,.15);
  if(live&&frame.walk>0){walkClock+=Math.max(0,Math.min(.1,dt))*frame.walk;const step=Math.floor(walkClock/.48);if(step!==lastStep){lastStep=step;const contact=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();contact.buffer=noise;filter.type='lowpass';filter.frequency.value=step%2?1200:1050;gain.gain.setValueAtTime(.04,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.14);contact.connect(filter).connect(gain).connect(context.destination);contact.start(t,(step*.131)%2);contact.stop(t+.15);contact.onended=()=>{contact.disconnect();filter.disconnect();gain.disconnect();};}}
 }
 return {engage,update,setEnabled:value=>enabled=value,stop:()=>{if(wind)wind.gain.setTargetAtTime(0,context.currentTime,.1);}};
}
