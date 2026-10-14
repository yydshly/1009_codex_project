import {eventById} from './history-content.js';
import {sphericalEventPlan} from './spherical-history-data.js';
import {worldAnchor} from './world-content.js';
import {mapFeatures} from './map-learning-content.js';
import {relationGuide,relationLandforms} from './spatial-relations-geography.js';

// Spatial questions reuse the project's sourced events. These are geographic
// relations, not new claims about itineraries, borders or excavated buildings.
const city=id=>{const p=worldAnchor(id);return [p.lon,p.lat];};
export const spatialRelations={
 zhang:{id:'zhang',name:'出使与交流',type:'廊道与网络',color:0xf1c77b,period:'han',place:'kashgar',lens:'corridors',feature:'south-passage',
  question:'从东侧入口，到盆地西缘',
  context:'先把新疆放回更大的交流空间，再沿盆地边缘辨认地点。',
  region:'山地与盆地构成通行条件；敦煌、喀什和吐鲁番承担不同的观察任务。',
  close:'选择喀什看交换，或选择吐鲁番看用水。模型解释地点里的问题，不充当出使行程复原。',
  origin:{id:'xian',name:'长安方向',role:'今西安 · 东侧方位参照',anchor:city('xian')},
  contextLines:[[city('xian'),city('lanzhou'),[94.66,40.14]]],
  places:[{id:'kashgar',name:'喀什',role:'西缘绿洲 · 停留与交换',why:'交流不仅需要通道，也需要停留与交换的空间。到喀什，观察物品怎样被接收和使用。',model:'market',image:'./assets/atlas-r15-market.jpg'}, {id:'turpan',name:'吐鲁番',role:'绿洲延伸 · 用水条件',why:'从往来话题延伸到绿洲的生活条件。在吐鲁番，比较地下水路与用水安排。',model:'karez',image:'./assets/atlas-r15-water.jpg'}],
  poses:{context:{lon:93,lat:37,distance:6.5,surface:3.02},region:{lon:85,lat:40,distance:5.2,surface:3.03}},
  scope:'金线是跨时期交流与方位示意，不是张骞逐站行程；吐鲁番为机制延伸。'},
 protectorate:{id:'protectorate',name:'机构与地方',type:'中心与周边',color:0xa9d6c0,period:'han',place:'luntai',lens:'relief',feature:'tianshan',
  question:'把机构放回地方空间',
  context:'先辨认天山、塔里木盆地和轮台地区，再观察机构与周边的联系。',
  region:'轮台是现代地域参照。两侧聚落符号与联络线帮助理解机构怎样置于地方之间。',
  close:'到轮台地域参照处，再主动展开城门、通道和内部空间，观察内外如何连接。',
  contextLines:[],places:[{id:'luntai',name:'轮台地区',role:'定位参照 · 机构与地方',why:'先在天山南侧找到地域位置，再用结构模型观察城门、通道与内外往来。现代点位不等于乌垒遗址。',model:'structure',image:null}],
  poses:{context:{lon:84,lat:42,distance:5.65,surface:3.02},region:{lon:84.25,lat:41.78,distance:4.6,surface:3.05}},
  scope:'地方符号及连线为机制示意，不表示确切城址、辖境或真实建筑布局。'},
 xibe:{id:'xibe',name:'西迁与安置',type:'起讫与地方生活',color:0x8bd7dd,period:'qing',place:'qabqal',lens:'water',feature:'ili-water',
  question:'从跨区域远行，到河谷安置',
  context:'让盛京方向与伊犁同时出现在地球上，先看清迁移的起讫关系。',
  region:'到新疆西部辨认伊犁河谷；抵达伊犁与迁居察布查尔分开观察。',
  close:'地点连接到安顿与生活问题。进入家庭后，可比较安顿、引水与交接的先后。',
  contextLines:[],places:[{id:'qabqal',name:'察布查尔',role:'安置地域 · 家庭与生活',why:'从远行的目的地域走近生活需求。家庭场景让你观察居住、引水与物品交接，不复原某个历史家庭。',model:'people',image:'./assets/atlas-r15-family.jpg'}],
  poses:{context:{lon:102.3,lat:42,distance:7.35,surface:3.02},region:{lon:82.0,lat:43.9,distance:4.15,surface:3.06}},
  scope:'盛京—伊犁线只示起讫方向，不是考证行程；安置与后来的修渠分别讲解。'}
};
export const relationById=id=>spatialRelations[id]??spatialRelations.zhang;
export const relationPlace=(id,node)=>{const r=relationById(id);return r.places.find(p=>p.id===node)??r.places[0];};
export function relationPose(id,scope='context',node,aspect=1.4){
 const r=relationById(id),p=eventById(r.id).nodes.find(p=>p.id===relationPlace(id,node).id);
 const v=scope==='place'?{lon:p.lon,lat:p.lat,distance:3.88,surface:3.09}:r.poses[scope]??r.poses.context;
 return {...v,distance:3.2+(v.distance-3.2)*Math.max(1,.92/aspect),duration:2200};
}
export function relationGeometry(id,scope='context',node){
 const r=relationById(id),e=eventById(r.id),plan=sphericalEventPlan(e),selected=relationPlace(id,node);
 const nodes=plan.nodes.map(n=>({id:n.id,name:n.id==='ili'?'伊犁抵达地域':n.name.split(' · ')[0],role:n.id==='shengjing'?'起点 · 今沈阳参照':r.places.find(p=>p.id===n.id)?.role??(n.id==='ili'?'抵达地域 · 河谷入口':'东侧入口 · 地域参照'),anchor:[n.lon,n.lat],selectable:r.places.some(p=>p.id===n.id),selected:n.id===selected.id}));
 if(r.origin&&scope==='context')nodes.push(r.origin);
 let lines=[...(plan.route.length?[{points:plan.route,kind:'main'}]:[]),...plan.links.map(points=>({points,kind:'local'})),...(scope==='context'?r.contextLines.map(points=>({points,kind:'context'})):[])];
 if(id==='zhang'){const north=mapFeatures.find(f=>f.id==='south-passage').shape;lines=lines.filter(l=>l.kind!=='local');if(scope!=='context')lines.push({points:[[94.66,40.14],...north],kind:'local'});}
 if(id==='protectorate'){lines=lines.map((l,i)=>i===0?{...l,points:[...l.points].reverse()}:l);if(scope==='context')lines=[];}
 if(scope==='context'&&id==='zhang')lines=lines.filter(l=>l.kind==='context');
 if(id==='protectorate')for(const [i,anchor]of [[80.6,40.5],[87.2,42.1]].entries())nodes.push({id:'local-'+i,name:i?'东侧地方':'西侧地方',role:'聚落符号 · 非考证城址',anchor});
 return {nodes:nodes.filter(n=>(scope==='context'||!['shengjing','xian'].includes(n.id))&&!(id==='xibe'&&scope==='context'&&n.id==='qabqal')),lines:lines.filter(l=>scope==='context'||id!=='xibe'||l.kind==='local'),selected};
}
export const relationScopes=[['context','看整体联系','先认起点、方向与周边'],['region','靠近新疆','把联系放回山地与盆地'],['place','选择地点','带着问题，再进入模型']];
export function relationPanel(id,scope,node,{focus='all',geographyOnly=false}={}){
 const r=relationById(id),p=relationPlace(id,node),guide=relationGuide(id,scope),forms=relationLandforms(id,scope),selected=forms.find(f=>f.id===focus);
 return `<div class="sr-view-tabs"><button data-sr-mode="relations" aria-pressed="true">历史联系</button><button data-sr-mode="geography">山水格局</button><button data-sr-mode="places">地点图鉴</button></div><div class="sr-relations" role="group" aria-label="选择地图中的空间关系">${Object.values(spatialRelations).map(v=>`<button data-sr-relation="${v.id}" aria-pressed="${id===v.id}"><strong>${v.name}</strong><small>${v.type}</small></button>`).join('')}</div><section class="sr-reading"><small>${eventById(id).date} / ${['context','region','place'].indexOf(scope)+1} · 3</small><h2>${geographyOnly?"先辨山水与地点":guide.title}</h2><p>${geographyOnly?"金色轮廓标明新疆，地点继续保留。先对照山系、盆地与地点；叠加历史联系后再观察路线。":guide.look}</p></section><div class="sr-steps" aria-label="空间观察层级">${relationScopes.map(([key],i)=>`<button data-sr-scope="${key}" aria-current="${scope===key?'step':'false'}"><span>0${i+1}</span><div><b>${guide.steps[i]}</b></div></button>`).join('')}</div><section class="sr-geography"><small>点选地理条件，与地点和路线对照</small><div role="group" aria-label="突出周边地理">${[{id:'all',label:'全部关系'},...forms].map(f=>`<button data-sr-focus="${f.id}" aria-pressed="${focus===f.id}">${f.label.split(' · ')[0]}</button>`).join('')}</div><p aria-live="polite">${selected?selected.role:scope==='context'?'先建立位置感，再按下一步展开联系。':'地理条件仍留在原位；路线与地点在其上展开。'}</p></section>${scope==='place'?`<section class="sr-place"><div>${r.places.map(v=>`<button data-sr-node="${v.id}" aria-pressed="${v.id===p.id}">${v.name}</button>`).join('')}</div><p>${p.why}</p><button class="kg-primary" data-sr-action="place">进入${p.name}，选择模型 →</button></section>`:`<button class="sr-next kg-primary" data-sr-scope="${scope==='context'?'region':'place'}">${guide.next} →</button>`}<button class="sr-story" data-sr-action="story">展开事件 · 背景、过程与影响 →</button><details><summary>地图依据与示意范围</summary><p>${r.scope} 山系、盆地色带与河谷线为位置强调，不是范围测绘；动画进度不表示历史时间。</p><a href="${eventById(id).source.url}" target="_blank" rel="noopener noreferrer">${eventById(id).source.title} ↗</a><a href="https://zwfw.xinjiang.gov.cn/dmxj.html" target="_blank" rel="noopener noreferrer">新疆地理概况 ↗</a></details>`;
}
export function relationDock(id,scope,{geographyOnly=false,moving=true,focus='all',node}={}){
 const r=relationById(id),g=relationGuide(id,scope),p=relationPlace(id,node);
 return `<section class="sr-dock" aria-label="当前地图的关系图例"><div class="sr-legend"><b>${r.type}</b><span><i class="sr-key-range"></i>新疆范围</span><span><i class="sr-key-mountain"></i>山地 / 盆地</span>${id==='xibe'?'<span><i class="sr-key-valley"></i>河谷观察带</span>':''}${geographyOnly?'':`<span><i class="sr-key-route" style="color:#${r.color.toString(16)}"></i>${id==='xibe'?'起讫方向':'联系示意'}</span>`}</div><p class="sr-map-caption" aria-live="polite">${geographyOnly?'仅看地理条件：对照山地、盆地与地点位置。':g.look}</p><div class="sr-map-tools">${scope!=='context'?`<button class="sr-enter-place" data-sr-action="place">走进${p.name} · 动手观察 →</button>`:''}<button data-sr-action="compare" aria-pressed="${geographyOnly}">${geographyOnly?'叠加历史联系':'对照：只看地理'}</button><button data-sr-action="motion">${moving?'暂停地图变化':'重看地图变化'}</button><button data-sr-scope="context">返回完整联系</button><button data-sr-action="analysis">地形分析 ↗</button></div><small>可拖动与缩放 · 点地理标记看关系 · 色带和连线均为示意</small></section>`;
}
