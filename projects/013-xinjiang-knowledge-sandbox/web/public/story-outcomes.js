// Authored teaching choreography. Durations and choices do not model measured outcomes.
export const clamp=t=>Math.max(0,Math.min(1,t));
export const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
export const cueDurations=[8,10,16,14,12,12,12,16,16,12,12,14,26,12,12,18,18,28,22,26,12,14,12,26,28,10,14,10,20,12];
export const needs={
 oasis:['家里与田里都在等水','安排先后，打开支渠','水进入生活与生产','人接过水，回应这次选择'],
 nature:['水从山地来','沿水路寻找停留','绿洲与道路相接','生活有了前提'],
 market:['远行者缺少补给','把货物送到需要的人手中','物品进入日常用途','接过货物，回应来者'],
 people:['抵达之后，怎样生活？','先引水，或先安顿','渠水到田，家中亮起灯','一家人开始新的日常'],
 culture:['学习者还没有接上节奏','看示范，再参与一拍','动作从一个人传给另一个人','学习者回应，众人相接'],
 logistics:['货物到达，车辆等待','协作办理，保留绿地','信息相接，车队继续前行','工作人员接应，空间留下余地'],
};
export function outcomeFrame(seconds,duration=16){
 const t=clamp(seconds/duration),phase=t<.18?0:t<.4?1:t<.76?2:3;
 return {phase,t,action:ease((t-.18)/.45),reply:ease((t-.7)/.2)};
}
export function settlementFrame(seconds,priority='water'){
 const t=Math.max(0,seconds),first=ease((t-1)/3),second=ease((t-5)/3);
 return {water:priority==='water'?first:second,home:priority==='home'?first:second,reply:ease((t-8)/2)};
}
export function recipientFrame(seconds){
 const t=Math.max(0,seconds);return {receive:ease(t/1.1),use:ease((t-1.1)/1.8),thanks:ease((t-3)/1.2)};
}
// A derived display grid averages observed neighbours; the source DEM is untouched.
export function displayTerrain(source,step=4){
 const cols=Math.floor((source.cols-1)/step)+1,rows=Math.floor((source.rows-1)/step)+1,heights=[];
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const x=Math.round(c*(source.cols-1)/(cols-1)),y=Math.round(r*(source.rows-1)/(rows-1));let h=0,w=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const weight=(dx===0?2:1)*(dy===0?2:1),ix=Math.max(0,Math.min(source.cols-1,x+dx)),iy=Math.max(0,Math.min(source.rows-1,y+dy));h+=source.heights[iy*source.cols+ix]*weight;w+=weight;
  }heights.push(h/w);
 }
 return {...source,name:source.name+'-display',cols,rows,heights,sourceGrid:[source.cols,source.rows],displayOnly:true};
}
export function closingPose(elapsed){
 const travel=ease(elapsed/10),x=-40+100*travel,wide=ease((elapsed-10)/4);
 const mix=(a,b)=>a+(b-a)*wide;
 return {position:[mix(x-5,10),mix(6.6,9.5),mix(16,29.2)],target:[mix(x,10),mix(.7,1.1,wide),mix(0,10.2,wide)]};
}
