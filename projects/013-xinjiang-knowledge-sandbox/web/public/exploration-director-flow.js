import {directorPaths} from './exploration-director-paths.js';
export const directorNarrated=shot=>shot.beat!==undefined||!!shot.audio;
export const directorShots=directorPaths.xibe.shots;

// Scheduling depends on arrival, narration and completed scene responses, not
// an interval of simulated button clicks. Tokens reject stale async results.
export function createDirectorFlow({enter,ready,frame,freeze,resume,leave,loadAudio,audio,changed=()=>{},shots=directorShots}){
 let active=false,playing=false,index=0,time=0,duration=8,waiting=true,loading=false,started=false,token=0,silent=false,complete=false;
 const snapshot=()=>({active,playing,index,time,duration,waiting,loading,silent,complete,shot:shots[index]});
 function emit(){changed(snapshot());}
 function jump(value,{play=playing}={}){
  const n=Math.max(0,Math.min(shots.length-1,Math.trunc(Number(value)||0)));
  ++token;audio.stop();freeze();index=n;active=true;playing=play;time=0;complete=false;waiting=true;started=false;silent=false;
  const shot=shots[index];duration=shot.duration;loading=directorNarrated(shot);enter(shot);emit();
  if(loading){const version=token;Promise.resolve().then(()=>loadAudio(shot)).then(result=>{if(version!==token)return;loading=false;silent=!result.available;duration=result.duration||duration;emit();}).catch(()=>{if(version===token){loading=false;silent=true;emit();}});}
 }
 function pause(){if(!active||!playing)return;playing=false;++token;loading=false;audio.pause();freeze();emit();}
 async function play(){
  if(!active)return jump(0,{play:true});if(complete)return jump(0,{play:true});
  playing=true;resume(shots[index]);
  // Reload after a pause during an unresolved load. Existing audio keeps time.
  if(directorNarrated(shots[index])&&!audio.available&&!silent){const version=++token;loading=true;emit();try{const result=await loadAudio(shots[index]);if(version!==token)return;duration=result.duration||duration;silent=!result.available;}catch{if(version!==token)return;silent=true;}loading=false;}
  if(directorNarrated(shots[index])&&audio.available)duration=audio.duration||duration;
  if(started&&!silent&&directorNarrated(shots[index])){const version=token;const ok=await audio.play();if(version!==token)return;if(!ok)silent=true;}
  emit();
 }
 function stop(){if(!active)return;active=false;playing=false;++token;audio.stop();freeze();leave();emit();}
 function update(dt){
  if(!active||!playing||loading)return;
  const shot=shots[index];
  if(waiting){if(!ready(shot))return;waiting=false;started=true;resume(shot);if(directorNarrated(shot)&&!silent){const version=token;loading=true;audio.play().then(ok=>{if(version!==token)return;silent=!ok;loading=false;emit();});return;}}
  time=directorNarrated(shot)&&!silent?audio.time:time+Math.min(.1,Math.max(0,dt));
  if(directorNarrated(shot)&&audio.state==='error')silent=true;
  const fraction=Math.min(1,time/duration);const done=frame(shot,fraction,time);
  if((time>=duration-.015||directorNarrated(shot)&&!silent&&audio.state==='ended')&&done!==false&&ready(shot)){
   if(index===shots.length-1){complete=true;playing=false;time=duration;freeze();emit();}
   else jump(index+1,{play:true});
  }else emit();
 }
 function setShots(next){if(!Array.isArray(next)||!next.length)throw new Error('Director needs a non-empty path');stop();++token;shots=next;index=0;time=0;duration=shots[0].duration;complete=false;emit();}
 return {setShots,jump,pause,play,stop,update,get state(){return snapshot();}};
}
