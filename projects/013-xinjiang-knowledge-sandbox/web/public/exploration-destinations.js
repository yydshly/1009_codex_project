// Each destination is an existing interactive scene. These are learning
// questions, not reconstructions of a historical person's choices.
export const explorationDestinations={
 kashgar:{id:'kashgar',event:'zhang',name:'喀什',model:'market',title:'让一次交换发生',question:'通道把人带来，物品怎样进入生活？',steps:['选一件货物','看搬运与接收','看接收者继续生活'],back:'带回地图：绿洲为什么是停留与交换的节点。'},
 turpan:{id:'turpan',event:'zhang',name:'吐鲁番',model:'karez',title:'沿水走进绿洲',question:'往来与停留，需要什么生活条件？',steps:['沿剖面找到水源','改变来水或清理渠道','对照下游响应并记录'],back:'带回地图：水的条件怎样支持绿洲生活。坎儿井是跨时期延伸，不作为汉代设施复原。'},
 luntai:{id:'luntai',event:'protectorate',name:'轮台地区',model:'structure',title:'走通外部与内部',question:'一处机构怎样与周边建立联系？',steps:['展开屋盖','沿入口和通道向内','看往来返回外部'],back:'带回地图：入口、通道与内部空间如何组织联系。现代轮台仅作地域参照。'},
 qabqal:{id:'qabqal',event:'xibe',name:'察布查尔',model:'people',title:'让抵达变成生活',question:'远行结束后，安顿需要哪些条件？',steps:['选择安顿或引水','看门前与田边的先后','看家人交接与回应'],back:'带回地图：居住与用水怎样共同支持地方生活。家庭情境不复原历史决策。'}
};
export function explorationDestination(id,node){return Object.values(explorationDestinations).find(d=>d.event===id&&d.id===node)??Object.values(explorationDestinations).find(d=>d.event===id)??explorationDestinations.kashgar;}
export function destinationHTML(id,node){
 const d=explorationDestination(id,node),choices=Object.values(explorationDestinations).filter(v=>v.event===d.event);
 return `<section class="sr-destination" aria-label="把地图问题带入地点"><small>下一层 / 在这里动手观察</small>${choices.length>1?`<div class="sr-destination-tabs" aria-label="选择探索目的地">${choices.map(v=>`<button data-sr-node="${v.id}" aria-pressed="${v.id===d.id}">${v.name}</button>`).join('')}</div>`:''}<h3>${d.name} · ${d.title}</h3><p>${d.question}</p><ol>${d.steps.map(v=>`<li>${v}</li>`).join('')}</ol><button class="kg-primary" data-sr-action="place">进入${d.name}，准备动手观察 →</button><small>${d.back}</small></section>`;
}
// In-session map snapshots and observations belong to their event and place.
// Switching a path must never borrow another path's camera or result.
export function createExplorationMemory(){
 const maps=new Map(),observations=new Map();
 return {
  rememberMap(id,state){maps.set(id,structuredClone(state));},
  map(id){const v=maps.get(id);return v?structuredClone(v):null;},
  rememberObservation(id,node,records){if(!records?.length)return;observations.set(id+':'+node,structuredClone(records));},
  hasObservation(id,node){return observations.has(id+':'+node);},
  observations(id,node){return structuredClone(observations.get(id+':'+node)??[]);}
 };
}
