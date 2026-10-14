// Read actual scene states. Speech time cannot complete a model observation.
export const goodsNames=['织物','补给','器物'];
export const recipientNames=['家庭','远行者','手艺人'];
export function localSceneMatches(model,scene){return scene===(model==='structure'?'terrain':model);}
export function localSnapshot(model,saved){return saved&&localSceneMatches(model,saved.scene)?saved:null;}
const completed=['family-continues','traveller-departs','craft-work-continues'];
const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
export function localObservationFrame(model,d={},selected=false){
 if(model==='market'){
  const good=[0,1,2].includes(Number(d.goods))?Number(d.goods):0;
  const deliveries=Number(d.deliveryCount),received=selected&&Number.isFinite(deliveries)&&deliveries>0&&d.marketUse!=='waiting-for-choice';
  const done=received&&d.marketUse===completed[good],index=done?2:received?1:0;
  const steps=['看谁需要','跟随交接与使用','看到人物回应'];
  const title=!selected?'先选择一种需要':index===0?`${recipientNames[good]}等待${goodsNames[good]}`:index===1?`${goodsNames[good]}已交到手中，继续看用途`:['织物进入家庭生活','补给支持继续远行','器物接到地方制作'][good];
  const text=!selected?'点选织物、补给或器物。画面会突出接收者，并沿搬运、接手和使用跟随。':index===0?`金色线连接货台与${recipientNames[good]}。跟随搬运者；另外两种需要仍然保留。`:index===1?['看孩子披上织物和家人致意，交接以后还有使用。','看远行者补充食物与水，接着整理行装。','看器物从接收者手中进入工作台，接着继续制作。'][good]:['家人继续生活，另两位仍在等自己的货物。','远行者带着行装出发，停留与下一段远行相接。','手艺人继续作业，交换与地方生产相接。'][good];
  return {kind:'market',good,selected,index,steps,title,text,key:`market-${selected?good:'none'}-${index}`,complete:done,focus:index===0?'need':index===1?'handoff':'response'};
 }
 const progress=clamp(d.structureConnectionProgress),roof=Number(d.structureRoofLift)||0,state=d.structureConnectionState??'ready';
 const index=progress>0?2:roof>.03?1:0;
 return {kind:'structure',index,steps:['找到内外入口','展开被遮住的内部','通过通道，再返回'],key:`structure-${index}-${state}`,complete:state==='complete'&&progress===1,focus:index===0?'gate':index===1?'inside':state==='entering'?'passage':state==='inside'?'inside':state==='returning'?'gate':'overview',title:index===0?'先对照外侧、围墙与城门':index===1?'屋盖抬起，通道与两侧空间显现':({entering:'金色标记通过城门，向内部移动',inside:'抵达内部，入口与通道仍然保留',returning:'青色标记沿通道返回外侧',complete:'内外往来已在同一个结构里闭合'})[state]??'从入口向内观察',text:index===0?'入口把外侧空地与内部相接。先看门的位置，再展开屋盖。':index===1?'房屋留在原位，抬起的是屋盖。把门、中央通道与两侧空间一起看。':({entering:'跟随金色标记；箭头显示进入方向，标记实际穿过开放的门洞。',inside:'停留在内部空地，接下来沿同一通道返回。',returning:'返回方向变为青色；进入和返回在同一片空间发生。',complete:'把外侧、城门、通道和内部的观察带回地图，再对照机构与周边地方。'})[state]??'路径是空间观察，不代表真实行政程序。'};
}
export function localModelPanel(c,{running=false,records=[],part=-1,open=false,connection={},recordHTML=()=>''}={}){
 const market=c.model==='market';
 return `<section class="lp-panel"><p class="lp-location">${market?'喀什 / 盆地西缘':'轮台地域参照 / 入口与内部'}<span>${market?'跨时期交换情境':'抽象空间观察'}</span></p><h2>${market?'一次交换，怎样接到不同人的生活？':'入口、通道与内部，怎样连起来？'}</h2><p class="lp-need">${market?'先选一种需要，跟随货物，看交接以后发生什么。':'先找到门，再展开屋盖，让往来实际通过通道。'}</p>${market?`<div class="ht-goods lp-goods" role="group" aria-label="选择交换的货物">${goodsNames.map((name,i)=>`<button data-ht-good="${i}" aria-pressed="false">${name}<small>${recipientNames[i]}</small></button>`).join('')}</div><div class="lp-transport"><button data-kg-action="run">${running?'暂停变化':'继续变化'}</button><button data-ht-action="model-fit">集市全景</button></div>`:`<div class="lp-transport"><button data-lp-story="start" class="lp-primary">演示入口、展开与往来 ▷</button><button data-lp-story="toggle">继续变化</button></div>`}<ol class="lp-steps" aria-label="当前画面中的三个观察步骤">${(market?['看谁需要','跟随交接与使用','看到人物回应']:['找到内外入口','展开被遮住的内部','通过通道，再返回']).map((s,i)=>`<li data-lp-step="${i}"><small>0${i+1}</small><span>${s}</span></li>`).join('')}</ol><div class="lp-current" role="status"><b data-lp-title>${market?'先选择一种需要':'先对照内外入口'}</b><p data-lp-text></p></div><button data-lp-follow hidden>恢复引导镜头</button><button data-sr-action="story-return" class="lp-return">← 返回${market?'交流':'机构与地方'}地图</button><details class="lp-more"><summary>地点关系、已有操作与资料</summary><figure class="lp-context"><canvas width="264" height="155" aria-label="当前地点与新疆地理的位置参照"></canvas><figcaption>地域联系示意 · 近景不是等比例地图</figcaption></figure><p>${c.steps[3][2]}</p>${market?'<div class="kg-live-slot"></div>':`<div class="ht-parts" role="group" aria-label="选择空间结构">${['城门','通道','围墙','内部空间'].map((p,i)=>`<button data-ht-part="${i}" aria-pressed="${part===i}">${p}</button>`).join('')}</div><button data-ht-action="roof">${open?'合上屋盖':'单独展开屋盖'}</button><button data-ht-action="connection">${connection.playing?'暂停联系演示':'单独演示内外联系'}</button><button data-ht-action="model-fit">结构全景</button><p data-ht-connection-status></p>`}<div data-ht-records>${records.length?recordHTML(records):'<p>完成实际交接或结构观察后，记录才会出现。</p>'}</div><p>${c.scope}</p><div class="lp-route-links"><button data-ht-stop="world">回地球定位</button><button data-ht-stop="history">回历史背景</button></div></details></section>`;
}
export function marketObservationPose(frame,actors=[],aspect=1,fov=44){
 const good=frame.good??0,recipient=actors[good]??[[-3.6,0,.7],[-.3,0,.7],[3.45,0,.7]][good];
 const overview=!frame.selected,target=overview?[0,.8,.3]:frame.index===0?[(-5.3+[-3.7,0,3.7][good])/2,.7,.1]:[recipient[0]+(good===0?.35:0),.75,recipient[2]+.25];
 const span=overview?14:frame.index===0?Math.max(5.8,Math.abs(-5.3-[-3.7,0,3.7][good])+2):good===0?5.0:4.5;
 const distance=Math.max(overview?13:6.8,span/(2*Math.tan(fov*Math.PI/360)*Math.max(.35,aspect)*.88));
 return {target,distance,direction:[.08,.58,1]};
}
