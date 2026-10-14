// Display experiment only: no measured discharge, crop yield or historical date.
const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
export const karezStops=[
 {id:'source',label:'取水端',point:[-6.2,.8,.43],title:'先找到地下来水',text:'山前地下水进入暗渠。蓝色层表示取水关系，不是实测地下水位。'},
 {id:'shaft',label:'竖井与维护',point:[-1.95,1.6,.43],title:'竖井为什么通到地面？',text:'竖井服务施工与清理。试着加入淤积，再看清理动作与下游回应。'},
 {id:'channel',label:'暗渠与坡降',point:[1,.4,.43],title:'水沿地下通道来到出口',text:'暗渠靠坡降输水。打开剖面看方向；这里没有模拟水压、渗漏和实际流速。'},
 {id:'reservoir',label:'出口与蓄水',point:[7.3,.6,.44],title:'从地下水路，接到地面生活',text:'明渠与蓄水池连接用水。观察池面、田垄和取水者；再比较其他地点的停留与交换。'}
];
export function karezTargets(supply,obstruction){const source=clamp(supply/100),capacity=1-clamp(obstruction)*.82;return {source,capacity,outlet:source*capacity};}
export function advanceKarez(frame,dt,{supply,care}){
 const seconds=Math.max(0,Math.min(.1,Number(dt)||0));
 const obstruction=care==='clear'?Math.max(0,frame.obstruction-seconds/3.5):frame.obstruction;
 const target=karezTargets(supply,obstruction),mix=(a,b,s)=>a+(b-a)*(1-Math.exp(-seconds*s));
 const outlet=mix(frame.outlet,target.outlet,1.8),reservoir=mix(frame.reservoir,outlet,1.1);
 return {obstruction,outlet,reservoir,clock:frame.clock+seconds};
}
export function karezReading(frame,supply,care){
 const t=karezTargets(supply,frame.obstruction),stable=Math.abs(t.outlet-frame.outlet)<.008&&Math.abs(frame.outlet-frame.reservoir)<.008&&!(care==='clear'&&frame.obstruction>0);
 const phase=care==='clear'&&frame.obstruction>0?'清理中':!stable?'下游响应中':'变化已稳定';
 const reply=frame.reservoir<.15?'取水者仍在等候，池边水线很低。':frame.reservoir<.42?'取水者俯身接水，田垄中的蓝线较少。':'取水者接满容器，田垄水线展开。';
 return {...t,stable,phase,reply,summary:'来水 '+Math.round(t.source*100)+' / 通畅 '+Math.round(t.capacity*100)+' / 下游 '+Math.round(frame.reservoir*100)};
}
export function restoredKarez({supply=65,care='open',frame}={}){
 supply=Math.max(0,Math.min(100,Number(supply)||0));care=['open','blocked','clear'].includes(care)?care:'open';
 const obstruction=frame?clamp(frame.obstruction):care==='blocked'?1:0;
 const outlet=karezTargets(supply,obstruction).outlet;
 return {supply,care,frame:frame?{obstruction,outlet:clamp(frame.outlet),reservoir:clamp(frame.reservoir),clock:Math.max(0,Number(frame.clock)||0)}:{obstruction,outlet,reservoir:outlet,clock:0}};
}
