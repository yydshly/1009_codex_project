// Review-only storyboard: pending scenes stay explicitly labelled as still art.
import {createFilm} from './film.js';
import {cinemaShots as shots} from './scene-shot-plan.js';
const audio=document.getElementById('audio'),status=document.getElementById('status');
let film,renderTime=null;
try{
  const [timeline,model,score,baseline]=await Promise.all(['song-timeline','song-model-data','song-score','performance-manifest'].map(async name=>{
    const response=await fetch('./assets/'+name+'.json');if(!response.ok)throw new Error('分镜数据加载失败：'+name);return response.json();
  }));
  score.shots=shots;
  // Only completed rain footage is shown. Pending server/shore passages are stills.
  timeline.performanceClips=baseline.clips.filter(c=>c.start>=26.5&&c.end<=75.2||c.start>=95.8&&c.end<=113.2);
  film=await createFilm(document.getElementById('film'),timeline,model,score,()=>draw());
  await document.fonts.ready;
  window.scenePlanAt=async t=>{renderTime=t;await film.prepareFrame(t);return draw();};
  window.scenePlanReady=true;
  draw();
  function tick(){if(!audio.paused&&renderTime===null&&!document.hidden)draw();requestAnimationFrame(tick);}requestAnimationFrame(tick);
}catch(error){document.getElementById('error').textContent=error.message;document.getElementById('error').hidden=false;status.textContent='分镜加载失败';}
function draw(){
  if(!film)return;
  const t=renderTime??audio.currentTime;
  if(renderTime===null)film.syncMedia(t,!audio.paused);
  const state=film.draw(t);
  status.textContent=state.performanceFrame?'雨夜演唱 · 已生成口型':t>=115.8?'海岸结尾 · 静帧分镜 / 口型待生成':t<25.6||t>=75.2&&t<92.2?'机房主歌 · 静帧分镜 / 口型待生成':'环境转场 · 静帧运镜';
  return {...state,label:status.textContent};
}
audio.addEventListener('play',()=>{renderTime=null;draw();});
audio.addEventListener('pause',draw);audio.addEventListener('seeked',()=>{renderTime=null;draw();});
document.querySelector('nav').addEventListener('click',event=>{const button=event.target.closest('button[data-time]');if(button){renderTime=null;audio.currentTime=Number(button.dataset.time);draw();}});
