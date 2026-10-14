// Locate regions mentioned in the historical record, never reconstruct roads.
export const envoyEvidence={primary:'https://ctext.org/shiji/da-wan-lie-zhuan/zhs',museum:'https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/',interpretation:'https://igsnrr.cas.cn/cbkx/kpyd/dlxj/202009/t20200910_5692662.html'};
export const envoyStops=[
 {id:'changan',name:'长安',anchor:[108.94,34.26],note:'出发与归汉的地域参照；不绘制往返的未知道路'},
 {id:'longxi',name:'陇西地域',anchor:[104.6,35.0],note:'史书记载出陇西；此处不是拘留地点'},
 {id:'dayuan',name:'大宛地域',anchor:[71.5,40.4],note:'脱身后抵达 · 费尔干纳一带的现代参照'},
 {id:'kangju',name:'康居地域',anchor:[69.2,41.5],note:'经康居转送大月氏；点位仅示中亚方位，不定位古都或疆域'},
 {id:'yuezhi',name:'大月氏地域',anchor:[66.9,37.5],note:'到达并尝试联络；未取得原先希望的结盟结果'},
 {id:'daxia',name:'大夏地域',anchor:[66.9,36.7],note:'史书记载从月氏至大夏；阿姆河以南一带的现代参照'}
];
export const envoyScope='地图定位史书记载涉及的地域；现代参照点不是古国疆界、古都坐标或考定道路。具体行走线路与拘留地点未确定，不绘制使团沿未知路段行走。荒漠动画没有张骞出使路段的依据，已移出历史导演，仅保留为独立实验素材。';
export const envoyChapterProgress=[.96,.02,.49,.60,.72,.84];
const clamp=p=>Math.max(0,Math.min(1,Number(p)||0));
const lerp=(p,knots)=>{for(let i=1;i<knots.length;i++){const [a,x]=knots[i-1],[b,y]=knots[i];if(p<=b)return x+(y-x)*clamp((p-a)/(b-a));}return knots.at(-1)[1];};
export function envoyMapFrame(value){
 const p=clamp(value),chapter=p<.18?0:p<.42?1:p<.55?2:p<.66?3:p<.78?4:p<.91?5:6,held=chapter===1,index=chapter===6?0:chapter===0?1:chapter;
 const facts=[
  ['出陇西，前往联络大月氏','出发地点与陇西为地域参照，具体道路没有在图上复原。'],
  ['被匈奴扣留十余年','记录的是长期扣留；地图不为拘留地点编造坐标，也不显示在沙漠中匀速行进。'],
  ['脱身后，到达大宛','《史记》记载西走数十日到大宛。具体路段及沿途景观尚未考定，画面只突出到访地域。'],
  ['大宛提供向导，经康居转送','大宛与康居的引导、转送有文字记载；两处之间的道路与人物具体动作不作复原。'],
  ['到达大月氏，结盟目的未达成','按记载说明联络的结果；地图突出大月氏的现代地域参照，不构造谈判现场。'],
  ['从大月氏至大夏，获得见闻','《史记》记载从月氏至大夏及当地见闻；大夏与大月氏是相邻地域参照，不画精确边界。'],
  ['归途中再次被扣留，后来返汉','归途再次被扣留；之后脱身返汉。回到出发地域理解结果，未知返程道路仍不连线。']
 ];
 return {progress:p,distance:p,held,index,chapter,locate:!held,title:facts[chapter][0],caption:facts[chapter][1]};
}
export function envoyDesertFrame(value,{wind=true,rest=false}={}){
 const p=clamp(value),atRest=rest||p>=.64&&p<.79,arrived=p>=.975;
 const distance=lerp(p,[[0,0],[.34,.36],[.64,.68],[.79,.68],[1,1]]);
 const gust=wind&&p>=.30&&p<.64;
 return {progress:p,distance,walk:atRest?0:arrived?0:gust?.56:1,wind:gust?1:wind?.22:.06,rest:atRest,
  phase:arrived?'arrival':atRest?'rest':gust?'wind':'walk',
  title:arrived?'动画实验结束':atRest?'动画实验：停下与取水':gust?'动画实验：迎风与护脸':'动画实验：行走、驮载与足迹',
  response:arrived?'此实验没有历史行程归属，不作为张骞出使的展示。':atRest?'原创动作演示；没有证据证明张骞在此地点以这样的动作取水。':gust?'原创风沙与人物动作，没有对应出使路段的历史依据。':'仅观察原创行走动画和地面接触；人物不是经考证的张骞及其随从。'};
}
export const envoyNarration={
 'mission-route':'先依据史书记载，认识第一次出使涉及的地域。张骞出陇西，途中被匈奴扣留十余年。拘留地点没有在图上定位。脱身后，他到达大宛，经康居到达大月氏，并到过大夏。最初希望的结盟目的没有达成，归途中又被扣留，后来才返回汉朝。画面逐一突出这些地域参照，不绘制未经考定的行走道路。沙丘、风沙和取水动作没有对应路段的依据，不纳入这段历史演示。接下来回到地图，区分外交结果和此后的长期往来。',
 desert:'现在从地域方向走近荒漠里的远行。使者与随从向前行走，驮载的行装随步伐摆动，身后留下足迹。风沙迎面时，他们放慢脚步，护住脸和行装。队伍停下，取出水囊，照应同行者，再继续出发。这是理解远行困难的原创情境，并不复原张骞某一天的行动。回到地图，我们再看任务的结果与后续往来。'
};
