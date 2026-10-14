import {globePosition,comparisonArc} from './world-content.js';

// Authored explanatory paths, not reanalysis trajectories or surveyed trade routes.
export const earthChapters=[
 {topic:'position',short:'找到新疆',question:'它在世界的哪里？',caption:'从海洋与大陆，找到欧亚内陆和中国西北。'},
 {topic:'coordinates',short:'确定位置',question:'旋转后，位置还在吗？',caption:'经纬网固定在球面上；金色纬线和青色经线交于乌鲁木齐。'},
 {topic:'climate',short:'理解环境',question:'内陆的水汽从哪里来？',caption:'观察偏西气流的方向，再看山地如何参与局地水汽与降水过程。'},
 {topic:'exchange',short:'连接历史',question:'内陆为何也有交流？',caption:'大陆并不隔绝往来。城镇、补给和多条通道共同构成交流网络。'},
 {topic:'relief',short:'走近山河',question:'下一层要看什么？',caption:'进入新疆地图，沿山系、盆地与绿洲寻找具体的探索地点。'},
];
export const earthFlows={
 climate:{color:0x53d8ef,points:[[-24,46],[-3,49],[22,49],[45,48],[65,46],[78,44],[86,44]],labels:[['偏西气流',12,50],['大陆内部',56,47],['天山与河谷',81,43]],frames:[
  {title:'01 / 从西侧看方向',text:'青色带表示偏西气流的概念方向；先认识海洋与大陆的相对位置。'},
  {title:'02 / 经过大陆内部',text:'内陆来水并非只有一个源地或路径；天气系统与季节会改变水汽输送。'},
  {title:'03 / 山地参与局地过程',text:'靠近新疆看山地与河谷；转入地图继续观察天山、伊犁河谷和低地。'},
 ]},
 exchange:{color:0xe4c68b,points:[[108.94,34.34],[103.83,36.06],[94.66,40.14],[93.51,42.82],[89.19,42.95],[82.96,41.72],[75.99,39.47],[62,40],[45,39],[30,36]],labels:[['西安 · 今名参照',108.94,34.34],['河西走廊',101,38],['绿洲与城镇',87,42],['中亚方向',62,40],['大陆西部',30,36]],frames:[
  {title:'01 / 从东侧建立联系',text:'金线连接现代地域参照，帮助认识大陆东西联系；它不是张骞出使的逐站行程。'},
  {title:'02 / 经过绿洲与城镇',text:'画面逐段连起多个节点：往来需要补给与交换，丝路是多条线路组成的网络。'},
  {title:'03 / 带着问题进入历史',text:'在新疆地图看地形与绿洲，再进入汉代出使和长期交流；事件与网络分别理解。'},
 ]},
};
export const flowPhase=value=>Math.min(2,Math.floor(Math.max(0,Math.min(1,value))*3));
// A second modern-reference comparison makes the network idea visible.
// No branch is attributed to a named traveller or a historical period.
earthFlows.exchange.branches=[[[89.19,42.95],[87.62,43.82],[81.32,43.92],[76.89,43.24],[62,40]]];
export function flowSamples(points,count=180,offset=0){
 const result=[];
 for(let i=0;i<=count;i++){
  const t=i/count*(points.length-1),index=Math.min(points.length-2,Math.floor(t)),f=t-index;
  const a={lon:points[index][0],lat:points[index][1]+offset},b={lon:points[index+1][0],lat:points[index+1][1]+offset};
  result.push(comparisonArc(a,b,f,3.28,.025));
 }
 return result;
}
export function latitudeBelt(south=35,north=49){
 const vertices=[];
 for(let lon=-180;lon<180;lon+=2){const a=globePosition(lon,south,3.245),b=globePosition(lon+2,south,3.245),c=globePosition(lon,north,3.245),d=globePosition(lon+2,north,3.245);vertices.push(...a,...b,...c,...b,...d,...c);}
 return vertices;
}
