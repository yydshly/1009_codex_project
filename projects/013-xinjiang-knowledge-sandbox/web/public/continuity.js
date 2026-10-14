// A spatial stage connects questions; these offsets are not geographic coordinates.
import {smoothStep} from './motion.js';
import {smootherStep} from './performance-motion.js';
export const stageOrigins={oasis:-40,nature:-20,market:0,people:20,culture:40,logistics:60};
export const stageOrder=Object.keys(stageOrigins);
export const bridges={
 'exchange-network':{title:'水路留下绿洲，绿洲连接道路。',from:'山水',to:'停留'},
 'exchange-stops':{title:'沿着道路，走近一次停留。',from:'自然地形',to:'绿洲集市'},
 'exchange-question':{title:'商旅会离开；迁来的家庭怎样留下？',from:'喀什 · 交流主题',to:'伊犁 · 转入1764年历史案例'},
 'memory-muqam':{title:'生活安顿之后，下一代怎样接上？',from:'锡伯西迁历史案例',to:'回到地图 · 哈密另一社区的传习'},
 'modern-hubs':{title:'从给下一位留出停顿，追问给彼此留出空间。',from:'哈密 · 文化案例',to:'当代 · 公共空间的多种需要'},
 'future-landscape':{title:'选择已经发生，下一步需要仍在画面里。',from:'关口 · 选择与回应',to:'同一处 · 未尽的需要'},
 'future-synthesis':{title:'把回应与未尽的需要，带回新疆整体。',from:'五处实际观察',to:'回答最初的问题'},
};
export function worldPose(pose,stage){
 const shift=p=>p.map((v,i)=>v+(i===0?stageOrigins[stage]:0));
 if(pose.overview)return {...pose,position:[10,38,92],target:[10,.7,0]};
 return {...pose,...(pose.position?{position:shift(pose.position)}:{camera:shift(pose.camera)}),target:shift(pose.target)};
}
export function isConnected(from,to){return stageOrder.indexOf(to)===stageOrder.indexOf(from)+1&&stageOrder.includes(from);}
export function bridgeFrame(from,to,oldTarget,target,progress){
 const t=smootherStep(progress),arc=Math.sin(Math.PI*t)**2,mix=(a,b)=>a+(b-a)*t;
 return {position:from.map((v,i)=>mix(v,to[i])+arc*(i===1?3:i===2?2.5:0)),target:oldTarget.map((v,i)=>mix(v,target[i])+(i===1?arc*.3:0))};
}
