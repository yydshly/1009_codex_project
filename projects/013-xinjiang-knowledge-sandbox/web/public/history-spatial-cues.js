import {storyRange} from './story-observation.js';
import {mapFeatures} from './map-learning-content.js';

// Derived from the existing MiniMax paragraph time blocks. Within each block,
// phrase positions use the same proportional estimate as the visible subtitles.
export const narrationCueCuts={zhang:[[.3305,.641],[.3563,.6548],[.5246,.7886]],protectorate:[[.2619,.836],[.2118,.6902],[.1646,.4248]],xibe:[[.5735,.7156],[.2883,.4649],[.2343,.3374]]};

// Geographic coordinates are existing modern references. These targets explain
// the schematic; they do not add historical routes, sites or building evidence.
const point=(id,label,anchor,kind='place')=>({id,label,anchor,kind});
const geographic=(id,label)=>point(id,label,mapFeatures.find(f=>f.id===id).anchor,'geography');
const mountain=geographic('tianshan','天山 · 先辨山地');
const basin=geographic('tarim','塔里木盆地 · 看山地南侧');
const valley=geographic('ili-water','伊犁河谷 · 抵达的环境');
const kashgar=point('kashgar','喀什 · 看货物交接',[75.99,39.47],'model');
const luntai=point('luntai','轮台地区 · 看入口与内部',[84.25,41.78],'model');
const qabqal=point('qabqal','察布查尔 · 看安顿与用水',[81.14,43.84],'model');
const route=point('route','联系正在展开 · 跟随队伍',null,'route');
const network=point('network','从一条联系，到多个地点',null,'network');
const targets={
 zhang:[[mountain,basin,point('dunhuang','敦煌 · 东侧方位参照',[94.66,40.14])],[route,route,route],[network,kashgar,kashgar]],
 protectorate:[[mountain,point('village','已有聚落 · 地方生活',[80.6,40.5],'model'),point('village','先看已有生活，再看机构',[80.6,40.5],'model')],[luntai,luntai,luntai],[network,network,luntai]],
 xibe:[[point('endpoints','盛京 → 伊犁 · 同一地球上的两端',[102,42],'extent'),point('shengjing','盛京方向 · 1764年出发',[123.43,41.8]),valley],[route,route,point('ili','伊犁 · 抵达之后，还要安置',[81.32,43.92])],[valley,qabqal,qabqal]]
};
export function spatialAttention(id,beat,shot){
 const t=targets[id==='migration'?'xibe':id]?.[beat]?.[shot];
 return t?{...t,anchor:t.anchor&&[...t.anchor]}:null;
}

// A user-requested, cancellable camera journey; all three poses use the same
// globe. No detached terrain model or automatic model entry is involved.
export const spatialOpening=[
 {id:'earth',title:'先在地球上找到新疆',text:'新疆位于欧亚大陆内部。先建立大陆与区域的位置关系，再沿同一地表靠近。',pose:{lon:83,lat:35,distance:10.8,surface:0,fit:true,duration:2600}},
 {id:'region',title:'靠近新疆，辨认山地与盆地',text:'地球仍在原处。边界、天山和盆地逐渐清晰，历史地点接下来会落在这片地理空间里。',pose:{lon:84.6,lat:41.8,distance:6.3,surface:3.12,tilt:8,bearing:165,duration:3200}},
 {id:'event',title:'把历史问题放回地图',text:'先看背景，再让路线、地点与活动随讲解逐步变化。你可以随时拖动地图接管镜头。',pose:null}
];

// Remap narration progress onto existing schematic geometry. Breakpoints are
// tied to the existing narration's subject changes, not physical travel speed.
const clamp=v=>Math.max(0,Math.min(1,v));
const interpolate=(t,knots)=>{
 for(let i=1;i<knots.length;i++)if(t<=knots[i][0]){const [a,x]=knots[i-1],[b,y]=knots[i];return x+(y-x)*clamp((t-a)/(b-a));}
 return knots.at(-1)[1];
};
export function narrativeMapProgress(id,progress){
 const p=clamp(progress),beat=p<storyRange(id,0)[1]?0:p<storyRange(id,1)[1]?1:2;
 const [a,b]=storyRange(id,beat),t=(p-a)/(b-a);
 if(!beat)return p;
 const knots=id==='zhang'?(beat===1?[[0,0],[.3563,.02],[.6548,.78],[1,1]]:[[0,0],[.5246,.4],[.7886,.82],[1,1]])
 :id==='protectorate'?(beat===1?[[0,0],[.2118,.05],[.6902,.96],[1,1]]:[[0,0],[.1646,.08],[.4248,.8],[1,1]])
 :(beat===1?[[0,0],[.2883,.42],[.4649,.96],[1,1]]:[[0,0],[.2343,.45],[.3374,.67],[.64,.96],[1,1]]);
 return a+(b-a)*interpolate(t,knots);
}
