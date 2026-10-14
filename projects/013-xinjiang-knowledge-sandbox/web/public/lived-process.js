import {civicPlans,traditions} from './social-model.js';
// Original scene choreography, not measured historical or economic timing.
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
export function exchangeFrame(seconds,goods){
 const t=Math.max(0,seconds)%6.8,destination=[-3.7,0,3.7][goods],pickup=-5.3;
 const outbound=t<3,handover=t>=3&&t<4.5;
 const along=outbound?ease(t/3):handover?1:1-ease((t-4.5)/2.3);
 return {x:pickup+(destination-pickup)*along,z:.35-.39*along,carrying:t<3.8,handover,returning:t>=4.5,cycle:Math.floor(Math.max(0,seconds)/6.8),phase:outbound?'搬运中':handover?'交接中':'返回取货'};
}
export function caravanPose(position){
 const p=((position%1)+1)%1;
 if(p<.4)return {x:-5.6+p/.4*11.2,z:1.25,yaw:0};
 if(p<.5){const a=-Math.PI/2+(p-.4)/.1*Math.PI;return {x:5.6+Math.cos(a)*.75,z:2+Math.sin(a)*.75,yaw:-(a+Math.PI/2)};}
 if(p<.9)return {x:5.6-(p-.5)/.4*11.2,z:2.75,yaw:-Math.PI};
 const a=Math.PI/2+(p-.9)/.1*Math.PI;return {x:-5.6+Math.cos(a)*.75,z:2+Math.sin(a)*.75,yaw:-(a+Math.PI/2)};
}
export function cultureFrame(seconds,lastParticipation=-100){
 const recent=seconds-lastParticipation,interactive=recent>=0&&recent<2;
 const phase=interactive?(recent<.45?'示范':'回应'):seconds%8<3.2?'示范':seconds%8<4?'传递':seconds%8<7.2?'回应':'相接';
 return {phase,teacher:phase==='示范',learner:phase==='回应',interactive,beat:1+Math.floor((seconds%3.2)/.8)};
}
export function initialCargo(position=0){
 const p=clamp(position);return {position:p,mode:p<.58?'approach':'depart',elapsed:p<.58?p/.58*12:(p-.58)/.42*12,cycles:0};
}
export function advanceCargo(state,dt,coordinated){
 const next={...state};let remaining=Math.max(0,Math.min(2,dt));
 // Carry time across boundaries; changing services never recomputes vehicle phase.
 for(let step=0;remaining>1e-9&&step<6;step++){
  const duration=next.mode==='service'?(coordinated?2:7):12;
  const used=Math.min(remaining,Math.max(0,duration-next.elapsed));next.elapsed+=used;remaining-=used;
  if(next.mode==='approach')next.position=next.elapsed/12*.58;
  else if(next.mode==='service')next.position=.58;
  else next.position=.58+next.elapsed/12*.42;
  if(next.elapsed>=duration-1e-9){next.elapsed=0;next.mode=next.mode==='approach'?'service':next.mode==='service'?'depart':'approach';if(next.mode==='approach'){next.position=0;next.cycles++;}}
 }
 return {...next,waiting:next.mode==='service'};
}
export const observationCases=[
 {stage:'oasis',title:'第一道水',cue:'water-ice'},
 {stage:'market',title:'集市交接',cue:'exchange-goods'},
 {stage:'people',title:'家庭与生活',cue:'memory-arrival'},
 {stage:'culture',title:'庭院传习',cue:'memory-practice'},
 {stage:'logistics',title:'关口与空间',cue:'modern-limit'},
];
export function observationRows(ledger){
 return observationCases.map(c=>{const value=ledger[c.stage];let detail='进入场景，留下自己的观察';
  if(value){detail=c.stage==='oasis'?`${value.plan==='field'?'先送到田里':'先送到家里'} · 已观察到${value.replied?'人物回应':'支渠变化'}`:c.stage==='market'?`${['织物','补给','工艺'][value.goods]} · 已完成 ${value.deliveries||0} 次交接`:c.stage==='people'?`跟随家庭 ${value.progress}% · ${value.progress>=78?'抵达后的生活 · '+(value.priority==='home'?'先安顿':'先引水'):'行进与准备'} · ${value.memory==='tools'?'工具与日常':'家书与记忆'}`:c.stage==='culture'?`${traditions.find(t=>t.id===value.tradition)?.name??'社区传习'} · 参与 ${value.beats} 拍`:`${civicPlans[value.plan]?.name??'协作安排'} · ${value.coordinated?'协同办理':'分别办理'} · 绿地 ${value.green}%`;}
  if(value&&value.manual!==undefined)detail=(value.manual?'你的选择':'演示观察')+' · '+detail;
  return {...c,detail,observed:!!value};
 });
}
