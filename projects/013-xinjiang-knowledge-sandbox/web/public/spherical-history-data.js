import {comparisonArc} from './world-content.js';
import {eventFrame} from './history-process.js';
import {storyRange} from './story-observation.js';

// Contemporary geographic references. Lines describe mechanisms/directions,
// never an excavated itinerary, exact border, jurisdiction or travel speed.
export const migrationOrigin={id:'shengjing',name:'盛京方向 · 今沈阳参照',lon:123.43,lat:41.8,role:'1764年出发地的现代地域参照'};
export function sphericalRoute(points,segments=160){
 if(points.length<2)return [];
 const result=[];
 for(let i=0;i<segments+1;i++){
  const t=i/segments*(points.length-1),j=Math.min(points.length-2,Math.floor(t)),k=t-j;
  const a={lon:points[j][0],lat:points[j][1]},b={lon:points[j+1][0],lat:points[j+1][1]},v=comparisonArc(a,b,k,1,0);
  result.push([Math.atan2(-v[2],v[0])*180/Math.PI,Math.asin(Math.max(-1,Math.min(1,v[1])))*180/Math.PI]);
 }
 return result;
}
export function sphericalEventPlan(event){
 if(event.id==='xibe')return {nodes:[migrationOrigin,...event.nodes],route:[[123.43,41.8],[81.32,43.92]],links:[[[81.32,43.92],[81.14,43.84]]],scope:'盛京至伊犁只表示起讫方向，不表示考证行程；安置与后来修渠分开观察。'};
 if(event.id==='protectorate')return {nodes:event.nodes,route:[],links:[[[80.6,40.5],[84.25,41.78]],[[84.25,41.78],[87.2,42.1]]],scope:'轮台为现代地域参照；地方符号与联系线是机构机制示意，不画管辖边界。'};
 return {nodes:event.nodes,route:event.corridor,links:[[[75.99,39.47],[81.2,41.3],[89.19,42.95]],[[89.19,42.95],[94.66,40.14]]],scope:event.lineLabel??'金线为地域往来教学线，不是张骞出使行程；吐鲁番用水是机制延伸。'};
}
const readings={
 zhang:[
  {title:'先认地势与东、西两侧的入口',look:'地点留在地球上：敦煌与喀什作现代地域参照，淡线提示山地、盆地间的往来问题。',reason:'为何从地图进入出使？地理条件帮助理解远行与联系，不能据此推定具体行程。'},
  {title:'联系沿地表展开，往来符号随线移动',look:'金线逐段显现，移动的交接符号对应观察进程。拖动地球、暂停或回拨，查看各地点之间的空间关系。',reason:'先看区域联系，再选择绿洲；动画是往来机制的教学表达。'},
  {title:'从单条联系转向多个地点的交换',look:'喀什交换符号与吐鲁番停留符号显现，青色联系支线展开。点地点可定位，再主动打开用水或集市场景。',reason:'外交出使与长期丝路网络分别理解；具体场景解释机制，不复原同一支商队。'},
 ],
 protectorate:[
  {title:'山地、盆地之间，地方聚落先存在',look:'轮台地区和周边的灰色聚落符号仍贴在地表；尚未出现机构结构。',reason:'先理解地方空间，再观察公元前60年设立机构带来的变化。'},
  {title:'轮台地域参照旁，机构符号逐步显现',look:'城门、围墙与内部院落从地表升起；地方符号仍保留，机构与地方可以同时观察。',reason:'乌垒城址仍在考证；这里的现代坐标和机构积木不能当作遗址复原。'},
  {title:'把机构与地方之间的联系表现出来',look:'联络线展开，往来符号沿线移动。选轮台定位，再决定是否打开结构分析。',reason:'变化指向机构与地方的联系，不把示意线画成准确管辖范围。'},
 ],
 xibe:[
  {title:'在同一个地球上，认出盛京与伊犁',look:'今沈阳与伊犁作起讫地域参照；两点之间的淡线只提示远行方向。',reason:'1764年出发、1765年抵伊犁、1766年安置察布查尔，三个时间节点分开理解。'},
  {title:'方向线推进，家属与官兵的远行缩到河谷',look:'金线从盛京方向向伊犁推进，队列符号随进程移动；点击伊犁或察布查尔即可靠近，地球空间继续保留。',reason:'这里表现起讫联系，不补画资料没有证实的中途路线。'},
  {title:'安置先出现，再观察后来的引水与开垦',look:'察布查尔的住房、田垄与后来的渠水符号依次出现。选择地点后，可主动进入原创家庭场景。',reason:'把迁移、安置与后来修渠分开；家庭动作和渠线不表示1766年的真实街区或工程复原。'},
 ],
};
export const sphericalReading=(id,phase)=>readings[id][phase];
export function sphericalEventPose(id,phase,{overview=false}={}){
 if(id==='xibe'&&(overview||phase<2))return {lon:102,lat:42,distance:7.6,surface:2.6};
 if(overview)return {lon:84.6,lat:41.8,distance:5.45,surface:3};
 const anchor=id==='protectorate'?[84.25,41.78]:id==='xibe'?[81.23,43.88]:phase===2?[81.6,41.4]:[85.5,40.3];
 return {lon:anchor[0],lat:anchor[1],distance:id==='protectorate'||id==='xibe'?4.25:5.1,surface:3};
}
export function sphericalVisualState(id,progress,phaseOverride){
 const f=eventFrame(id,progress);
 const phase=Number.isInteger(phaseOverride)&&phaseOverride>=0&&phaseOverride<3?phaseOverride:f.progress<storyRange(id,0)[1]?0:f.progress<storyRange(id,1)[1]?1:2;
 const active=id==='xibe'?[[],['ili'],['qabqal']][phase]:id==='zhang'?[['dunhuang'],['dunhuang','kashgar'],['kashgar','turpan']][phase]:['luntai'];
 return {...f,phase,active,institution:f.build,exchange:f.network,settlement:f.settle,laterCanal:f.water};
}
