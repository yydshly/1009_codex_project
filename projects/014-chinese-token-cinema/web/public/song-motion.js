// Values come from analysis of the generated recording and lyric alignment.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function lastBefore(items,t,key){
  let low=0,high=items.length-1,answer=-1;
  while(low<=high){const mid=(low+high)>>1;if((key?items[mid][key]:items[mid])<=t){answer=mid;low=mid+1;}else high=mid-1;}
  return answer;
}
export function songMotion(score,t,cue){
  const frame=Math.max(0,Math.min(score.rms.length-1,Math.floor(t*score.fps)));
  const bi=lastBefore(score.beats||[],t);
  const beat=bi>=0?Math.exp(-(t-score.beats[bi])*9):0;
  const oi=lastBefore(score.onsets||[],t);
  const onset=oi>=0?Math.exp(-(t-score.onsets[oi])*13):0;
  const active=cue?.timings.find(span=>t>=span.start&&t<span.end);
  const progress=active?clamp((t-active.start)/(active.end-active.start)):0;
  return {beat,onset,energy:clamp(score.rms[frame]*4),stress:active?.accent||0,
    progress,hold:active?clamp((active.end-active.start-.3)/1.2):0,beatIndex:bi};
}
export function shotAt(shots,t){
  const i=Math.max(0,lastBefore(shots,t,'start')),shot=shots[i];
  if(!shot)return null;
  const progress=clamp((t-shot.start)/Math.max(.1,shot.end-shot.start));
  return {...shot,index:i,progress,zoom:shot.zoomFrom+(shot.zoomTo-shot.zoomFrom)*progress,
    previous:i>0?shots[i-1]:null,transition:clamp((t-shot.start)/Math.max(.01,shot.dissolve||.01))};
}
