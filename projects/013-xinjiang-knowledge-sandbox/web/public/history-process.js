import {readingFor} from './event-reading.js';
// A reversible observation clock, not a reconstruction of historical travel speed.
export const eventDuration=36;
export const clampProgress=v=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
const span=(p,a,b)=>{const t=clampProgress((p-a)/(b-a));return t*t*(3-2*t);};
export const phaseProgress=[0,.5,1];
export const phaseAt=p=>p<.28?0:p<.72?1:2;
function baseFrame(id,value){
 const p=clampProgress(value),phase=phaseAt(p);
 if(id==='protectorate')return {progress:p,phase,route:span(p,.55,.95),build:span(p,.16,.66),network:span(p,.64,1),travel:span(p,.35,.95),settle:0,water:0,active:['luntai'],focus:[84.25,41.78],distance:7,action:['地方城镇与山地背景','机构空间逐步显现','联络节点与往来展开'][phase]};
 if(id==='xibe')return {progress:p,phase,route:span(p,.08,.58),travel:span(p,.08,.58),build:0,network:0,settle:span(p,.57,.87),water:span(p,.82,1),active:phase===0?[]:phase===1?['ili']:['qabqal'],focus:[81.23,43.88],distance:7,action:['地球上看盛京与伊犁方向','迁移方向推进，抵达河谷','安顿、开垦，再看后来的修渠'][phase]};
 return {progress:p,phase,route:span(p,.12,.70),travel:span(p,.12,.70),build:0,network:span(p,.65,1),settle:0,water:0,active:phase===0?['dunhuang']:phase===1?['dunhuang','kashgar']:['kashgar','turpan'],focus:phase===0?[94.66,40.14]:phase===1?[85.5,38.8]:[75.99,39.47],distance:phase===1?20:9,action:['东侧入口与山地、盆地背景','廊道延伸，队伍沿线移动','多地点连接，交换空间出现'][phase]};
}
export function eventFrame(id,value){const f=baseFrame(id,value),r=readingFor(id,f.phase);return {...f,focus:r.focus,focusOffset:r.focusOffset,distance:r.distance};}
export function advanceEvent(progress,seconds,speed=1){return clampProgress(clampProgress(progress)+Math.max(0,Number(seconds)||0)*Math.max(0,Number(speed)||0)/eventDuration);}
