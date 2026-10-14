// Links explain changes of scale, not a continuous journey by one historical person.
export const eventPlaces={
 zhang:[{place:'turpan',node:'turpan',label:'吐鲁番 · 停留的用水条件',why:'先问往来需要怎样的停留条件，再用水路比较绿洲机制；不把工程年代归于出使。'},{place:'kashgar',node:'kashgar',label:'喀什 · 交换与补给',why:'换一个地点，把区域往来转成一次可参与的交换；不是同一商队的连续行程。'}],
 xibe:[{place:'qabqal',node:'qabqal',label:'察布查尔 · 抵达后的家庭',why:'把跨大陆远行缩小到安顿、引水和记忆交接。'}],
 protectorate:[{place:'luntai',node:'luntai',label:'轮台地区 · 空间结构',why:'从地域定位走近抽象机构结构，观察城门、通道与内部空间。'}],
};
export function matchingLearningEvent(period,preferred){const available=period.event?[period.event,period.secondEvent].filter(Boolean):[];return available.includes(preferred)?preferred:available[0]??null;}
export function scaleLink({stage,world,feature,period,event,place,modelOpen,from}){
 if(stage==='world')return {from:'地球上的新疆',why:'先认识大陆位置，再换到能看清山地、盆地和聚落的尺度。',next:world==='climate'?'下一层看伊犁河谷与山地来水':world==='exchange'?'下一层看通道与绿洲的地理条件':'下一层看新疆整体地形'};
 if(stage==='map')return {from:from==='world'?'从地球，来到新疆全域':'新疆全域 / 自主观察',why:from==='world'?(world==='exchange'?'球面上先看联系方向，这里用地形比较通道、绿洲与补给。':world==='climate'?'把球面上的来流方向，转为河谷、山地和低地的区域观察。':'位置已经建立；接下来放大山地、盆地与聚落的地理条件。'):'选一个地理对象，图形、镜头与下一步会一起变化。',next:feature.history};
 if(stage==='history')return {from:from==='map'&&feature.period===period.id?'从'+feature.name+'，进入'+period.label:'历史观察 / '+period.label,why:event?'从地理条件转向有年代的事件；分开看背景、过程和后来的影响。':period.question,next:event?'背景 → 过程 → 影响，再选择地点':period.linkLabel};
 return {from:modelOpen?'从'+place.name+'的地图，走进模型':from==='history'?'从历史问题，走近'+place.name:'地点观察 / '+place.name,why:place.why,next:modelOpen?place.see:'先读位置与地势，再用模型观察具体机制'};
}
