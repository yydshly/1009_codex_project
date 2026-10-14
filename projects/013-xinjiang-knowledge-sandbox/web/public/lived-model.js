// These are explicit creative mechanisms, not measured historical or policy outcomes.
export const stagedCues={
 'water-ice':{stage:'oasis',mode:'choice',camera:[-7,6.2,12],target:[.1,.65,.3]},
 'water-flow':{stage:'oasis',mode:'response',camera:[5.8,4.6,10],target:[2.1,.7,.1]},
 'oasis-use':{stage:'oasis',mode:'maintenance',camera:[-5.6,3.4,6.8],target:[-3.1,.55,-.2]},
 'water-valley':{stage:'oasis',mode:'continue',camera:[-3,7.2,15],target:[.7,.5,.2]},
 'exchange-goods':{stage:'market',mode:'exchange',camera:[-4.5,3.9,10],target:[-.8,.8,.25]},
 'exchange-city':{stage:'market',mode:'meeting',camera:[5,5,10],target:[1,1,-.4]},
 'memory-departure':{stage:'people',mode:'departure',from:.04,to:.27,camera:[-8,6,14],target:[-2,1,0]},
 'memory-arrival':{stage:'people',mode:'settlement',from:.78,to:1,camera:[6.7,3.8,9.5],target:[3.3,.65,1.15]},
 'memory-practice':{stage:'culture',mode:'learning',camera:[-5.5,3.8,9],target:[-.5,.9,.1]},
 'modern-urumqi':{stage:'logistics',mode:'manufacturing',camera:[-8,7,13],target:[-2,1,0]},
 'modern-rules':{stage:'logistics',mode:'service',camera:[6.5,5.2,12],target:[2,.8,1]},
 'future-landscape':{stage:'logistics',mode:'aftermath',retain:true,camera:[-9,7,14],target:[0,.8,0]},
 'future-budget':{stage:'logistics',mode:'aftermath',retain:true,camera:[-5.5,5.8,11],target:[.5,.8,.5]},
 'future-evidence':{stage:'logistics',mode:'recap',retain:true,recap:true,camera:[10,9.5,29.2],target:[10,1.1,10.2]},
 'modern-limit':{stage:'logistics',mode:'ecology',camera:[-9,10,17],target:[0,1,0]},
};
export const sceneInfo={
 oasis:{title:'第一道水，先送到哪里？',source:'karez',scope:'原创绿洲与人物。两条支渠展示工作先后，不是实际水量分配、真实村落或同一条实测水系。'},
 nature:{title:'山水，通往生活的前提',source:'terrain',scope:'真实区域高程与 NASA 影像的微缩展示；连接路径组织故事，各生活案例有独立的年代与依据。'},
 market:{title:'一座供往来者停留的绿洲集市',source:'silk',scope:'创作集市与商队；呈现停留、补给和交换关系。'},
 people:{title:'从调遣、家庭到抵达后的生活',source:'xibe',scope:'历史依据：1764—1765 西迁及后续屯垦。聚落、人物与衣着为创作示意。'},
 culture:{title:'在共同实践中，看、学、回应',source:'muqam',scope:'木卡姆包含歌、舞、音乐。此处用原创动作解释合奏与传习，没有复原具体曲式。'},
 logistics:{title:'货物、设施、服务与空间选择',source:'policy',scope:'依据2023方案组织主题。办理时长、车辆和空间参数为教学设置，不代表实际成效。'},
};
export function migrationProgress(config,elapsed,duration=14){
 const t=Math.max(0,Math.min(1,elapsed/duration)),smooth=t*t*(3-2*t);
 return config.from+(config.to-config.from)*smooth;
}
// A continuous piecewise journey: travel → visible service queue → travel.
// No phase jumps when the vehicle enters or leaves the gate.
export function cargoFrame(seconds,index,coordinated=true,capacity=8){
 capacity=Math.max(3,Math.min(9,Math.round(capacity)));
 if(index>=capacity)return {position:0,waiting:true,parked:true};
 const hold=coordinated?2:7,period=24+hold;
 const t=((Math.max(0,seconds)+index*period/capacity)%period);
 const position=t<12?t/12*.58:t<12+hold?.58:.58+(t-12-hold)/12*.42;
 return {position,waiting:t>=12&&t<12+hold,parked:false};
}
export function cargoPose(position){
 const p=Math.max(0,Math.min(1,position));
 if(p<=.73)return {x:-6.3+p/.73*12.5,z:2.05,yaw:0};
 if(p<=.78){const a=-Math.PI/2+(p-.73)/.05*Math.PI;return {x:6.2+Math.cos(a)*.65,z:2.7+Math.sin(a)*.65,yaw:-(a+Math.PI/2)};}
 if(p<=.95)return {x:6.2-(p-.78)/.17*12.5,z:3.35,yaw:-Math.PI};
 const a=Math.PI/2+(p-.95)/.05*Math.PI;return {x:-6.3+Math.cos(a)*.65,z:2.7+Math.sin(a)*.65,yaw:-(a+Math.PI/2)};
}
