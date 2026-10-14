// A readable common thread for live geography, the director and free choices.
// Progress in the market is derived from scene state, never from narration time.
export function zhangReading(shot={},fraction=0,d={}){
 const p=Math.max(0,Math.min(1,Number(fraction)||0));
 if(shot.world)return {kind:'position',index:['earth','china','landforms'].indexOf(shot.id),steps:['欧亚大陆','中国西北','新疆山河'],look:'在同一个地球上，逐层建立位置。'};
 if(shot.geography!==undefined)return {kind:'geography',index:shot.geography,steps:['山地与盆地','边缘绿洲','往来问题'],look:['山地围合盆地；先对照天山与昆仑山。','蓝色流域参照与绿色地点圈显现，观察绿洲的位置。','保留地理条件，再问外交出使怎样带来后续联系。'][shot.geography]};
 if(shot.beat!==undefined)return {kind:'history',index:shot.beat,steps:['外交任务','后续往来','长期交流'],look:['先看出发目的，再辨认远行面临的地理条件。','金线逐步连起地域；移动符号表达往来。','青色支线形成网络；焦点转到喀什的交换需要。'][shot.beat]};
 if(shot.model==='market'){
  const completed=['family-continues','traveller-departs','craft-work-continues'][shot.goods];
  const matched=Number(d.goods)===shot.goods;
  const phase=matched&&Number(d.deliveryCount)>0?(d.marketUse===completed?2:1):0;
  return {kind:'market',index:phase,steps:['具体需要','交接与使用','人物回应'],look:phase===0?['家庭等待织物：跟随搬运者。','远行者等待补给：看食物与水。','手艺人等待器物：关注工作台。'][shot.goods]:phase===1?'交接已经发生，观察接收者怎样使用物品。':['孩子披上织物，家人继续生活。','远行者整理行装，带着补给出发。','手艺人接过器物，继续制作。'][shot.goods]};
 }
 if(shot.id==='return')return {kind:'return',index:2,steps:['通道带来往来','绿洲支持停留','用途延续交换'],look:'把人物回应放回喀什，再读盆地边缘的联系。'};
 return {kind:'place',index:1,steps:['盆地西缘','喀什定位','集市观察'],look:'来路仍留在位置图中，沿喀什进入具体的交换。'};
}
export function zhangSpaceFrame(shot={},fraction=0){
 const p=Math.max(0,Math.min(1,Number(fraction)||0));
 if(shot.world)return {mountains:0,basin:0,water:0,oases:0};
 if(shot.geography===0)return {mountains:1,basin:Math.min(1,p*3),water:0,oases:0};
 if(shot.geography!==undefined)return {mountains:.6,basin:.6,water:Math.min(1,p*2+.2),oases:1};
 return {mountains:.35,basin:.3,water:.45,oases:1};
}
export function directorLocation(shot,dataset,fallback){return shot.beat!==undefined?dataset.historySelectedNode||fallback:fallback;}
