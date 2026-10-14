// A shared spatial reading sequence for free exploration and the director.
// These cues explain existing geography and models, not reconstructed journeys.
export const mapBridges = {
 zhang:{question:'山地之间的往来，怎样走进生活？',destination:'喀什 · 集市',titles:['找到盆地边缘的通道','跟随往来，连接沿途地点','停留与交换，进入生活'],next:'沿着这些地点，听出使与交流的故事',steps:[
  {label:'辨山地',feature:'tianshan',geography:true,text:'先看天山，再对照南侧的塔里木盆地：地域联系发生在这个山地与盆地空间中。'},
  {label:'连地点',feature:'tarim',text:'金线沿盆地边缘展开。敦煌是东侧参照，喀什是西缘案例；这些线不表示张骞逐站行程。'},
  {label:'看交换',feature:'all',preview:true,text:'集市在喀什原位显现，买家走近、接过货物，再带到摊位。先分清出使与长期交流，近景可以选择不同货物，比较人物回应。'}]},
 protectorate:{question:'新机构，怎样加入已有的地方？',destination:'轮台地区 · 空间结构',titles:['已有地方，先看地势','机构显现，找到入口','双向往来，连接周边'],next:'留在这片地方，听西域都护的故事',steps:[
  {label:'辨地势',feature:'tianshan',geography:true,text:'先找天山，再看南侧的塔里木盆地北缘；轮台是这里的现代地域参照。'},
  {label:'立机构',feature:'all',preview:true,text:'已有地方聚落继续保留，轮台地域的机构符号逐部显现。先找到入口，再看机构怎样加入地方空间。'},
  {label:'连地方',feature:'all',preview:true,text:'青色联络由中心向两侧展开，往来符号沿线双向移动。下一层沿城门、通道进入内部；连线不表示辖区边界。'}]},
 xibe:{question:'远行的终点，怎样成为生活的起点？',destination:'察布查尔 · 家庭',titles:['天山西部，找到伊犁','抵达河谷，辨认安置点','住房与田地，接住家庭需要'],next:'从河谷条件，听远行与安置的故事',steps:[
  {label:'辨山地',feature:'tianshan',geography:true,text:'先在新疆找到天山，沿山地转向西部的伊犁河谷。'},
  {label:'找河谷',feature:'ili-water',text:'青色河谷观察带与地点同时显现：伊犁是抵达地域，察布查尔连接后来的安置。'},
  {label:'看安置',feature:'all',preview:true,text:'察布查尔原位展开住房、田地与渠水，家人递出用品，孩子接住并回应。分清出发、抵达与安置，近景可以比较安顿和引水的先后。'}]}
};
const turpanBridge=(()=>{
 const bridge=mapBridges.zhang;
 return {...bridge,destination:'吐鲁番 · 坎儿井',titles:[...bridge.titles.slice(0,2),'从往来，转问绿洲用水'],steps:[bridge.steps[0],
  {...bridge.steps[1],text:'从盆地边缘的联系，转看东侧的吐鲁番绿洲。这里用来追问往来与生活所需的水，不是张骞逐站行程。'},
  {...bridge.steps[2],label:'看用水',text:'吐鲁番的绿洲符号突出显示。进入坎儿井剖面，改变供水或清理渠道，看水怎样传到下游；这是跨时期的机制延伸。'}]};
})();
export function mapBridgeFor(id,node){return id==='zhang'&&node==='turpan'?turpanBridge:mapBridges[id]??mapBridges.zhang;}
export function mapBridgeFrame(id,progress=0,node){
 const bridge=mapBridgeFor(id,node);
 const p=Math.max(0,Math.min(1,Number(progress)||0)),index=Math.min(2,Math.floor(p*3));
 const local=Math.min(1,p*3-index),step=bridge.steps[index];
 const institution=id==='protectorate';
 return {...step,index,progress:p,
  reveal:institution?(index<2?0:local):index===0?0:index===1?local:1,
  model:institution?(index===0?0:index===1?.16+.48*local:.64+.36*local):step.preview?Math.min(1,local/.28):0,
  actionTime:index<2?0:Math.max(0,(local-.28)/.72)*13,
  clock:p*18};
}
export function mapBridgeHTML(id,node){
 const b=mapBridgeFor(id,node);
 return `<section class="sr-bridge" aria-label="从地图到历史的连续引导"><small>地球定位 → 新疆地图 → 历史 → ${b.destination}</small><h3>${b.question}</h3><div class="sr-bridge-steps">${b.steps.map((s,i)=>`<button data-map-cue="${i}" aria-pressed="false"><small>0${i+1}</small>${s.label}</button>`).join('')}</div><p data-map-cue-caption>依次点选画面线索，或让地图带你看一遍。</p><div class="sr-bridge-actions"><button data-map-guide>播放地图引导</button><button data-sr-action="story">${b.next} →</button></div></section>`;
}
