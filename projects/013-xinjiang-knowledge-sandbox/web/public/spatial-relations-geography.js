import {mapFeatures} from './map-learning-content.js';

const feature=id=>mapFeatures.find(f=>f.id===id);
// These bands explain relative positions. They are deliberately not boundaries,
// surveyed rivers, historical jurisdictions, or reconstructed travel itineraries.
export const relationGeography={
 zhang:[{id:'tianshan',label:'天山 · 北侧山地',role:'与盆地边缘的往来地点对照',kind:'ridge'},
  {id:'tarim',label:'塔里木盆地',role:'观察边缘地点，不穿越内部连直线',kind:'basin'},
  {id:'kunlun',label:'昆仑山 · 南侧山地',role:'和天山一起界定盆地方位',kind:'ridge'}],
 protectorate:[{id:'tianshan',label:'天山',role:'轮台地域参照在山系南侧',kind:'ridge'},
  {id:'tarim',label:'塔里木盆地',role:'轮台位于盆地北缘方向',kind:'basin'}],
 xibe:[{id:'tianshan',label:'天山',role:'先辨新疆中部山系',kind:'ridge'},
  {id:'ili-water',label:'伊犁河谷',role:'抵达地域；继续看南侧的安置地点',kind:'valley'}]
};
export const relationGuidance={
 zhang:{context:{title:'先辨山地与盆地，再找东侧入口',look:'天山与昆仑山夹着塔里木盆地；长安方向—敦煌建立东侧方位。',next:'展开盆地边缘的联系',steps:['山地与入口','沿边缘联系','绿洲与交换']},region:{title:'地点沿盆地边缘联系起来',look:'金色与青色联系线沿盆地两侧展开，地点圈提示停留与交换。',next:'到绿洲，看停留需要什么'},place:{title:'把区域往来，落到地点里的需求',look:'选中的地点保留来向连线；模型在这个位置显现，再由你进入。'}},
 protectorate:{context:{title:'先有地方空间，再理解机构',look:'天山、塔里木盆地与地方聚落同时保留；轮台只作现代地域参照。',next:'展开机构与地方的联系',steps:['地方与地势','机构与联络','城门与往来']},region:{title:'机构出现，向两侧地方建立联系',look:'中心结构逐步显现，两侧联络线由中心展开；这是联系机制，不是管辖范围。',next:'到轮台，观察内外怎样连接'},place:{title:'沿联络线，走近机构的入口',look:'城门与周边来向同时可见。下一步打开结构模型，比较通道与内部空间。'}},
 xibe:{context:{title:'先看跨区域远行的起讫',look:'盛京方向与伊犁同处一颗地球；亮点只演示联系方向，不表示中途站点。',next:'抵达新疆，辨认伊犁河谷',steps:['远行起讫','抵达河谷','安置与生活']},region:{title:'从远行的终点，转向河谷条件',look:'跨区域线退到背景，伊犁河谷观察带显现；辨认抵达地域与南侧安置地点。',next:'到察布查尔，看安置与生活'},place:{title:'抵达之后，还要安置与生活',look:'察布查尔保留河谷参照，住房与田地符号出现；后来的引水问题另行观察。'}}
};
export function relationGuide(id,scope='context'){
 const all=relationGuidance[id]??relationGuidance.zhang;
 return {...(all[scope]??all.context),steps:all.context.steps};
}
export function relationLandforms(id,scope='context'){
 return (relationGeography[id]??relationGeography.zhang).filter(f=>!(id==='xibe'&&scope==='place'&&f.id==='tianshan')).map(f=>({...feature(f.id),...f}));
}
export function relationFocus(id,value){return value==='all'||relationGeography[id]?.some(f=>f.id===value)?value:'all';}
export function relationVisualFrame(id,scope,progress=1,geographyOnly=false){
 const p=Math.max(0,Math.min(1,Number(progress)||0));
 return {progress:p,route:geographyOnly?0:p,
  model:geographyOnly?0:scope==='place'?p:scope==='region'&&id==='protectorate'?.67*p:0,
  region:scope!=='context',
  // A directed origin/destination illustration is distinct from two-way exchange.
  direction:id==='xibe'?'one-way':'two-way'};
}
