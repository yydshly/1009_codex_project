import * as THREE from 'three';

// Each caption has an object in the rendered scene. No measurements are inferred
// from these editorial pointers. Live view and the recorded movie share layout.
const item=(anchor,title,detail,tone='condition')=>({anchor,title,detail,tone});
const fixed={
 'earth-arrival':[item('basin','新疆 · 中国西北','从地球建立位置')],
 'region-structure':[item('mountains','天山 · 中部骨架','三山分隔两大盆地'),item('basin','塔里木盆地','先整体，再看山前地点')],
 'region-ice':[item('ice','下一站 · 一号冰川','在区域图锁定局部窗口')],
 'water-inland':[item('basin','大陆腹地 · 新疆','离海距离与山脉共同影响环境')],
 'water-mountains':[item('ice','01 冰谷观测','冰雪、裸岩与沟谷 · 真实影像'),item('valley','02 顺谷而下','下一幕追问人的用水')],
 'water-valley':[item('basket','补给从哪里来？','水已经接上，行装旁的篮子还空着','condition'),item('traveller','带着新的需要看集市','换到喀什，比较物品如何进入生活','action')],
 'oasis-dry':[item('basin','01 回到盆地边缘','供水让人留下，物品与补给引出道路'),item('nodes','02 可以停留的节点','把刚才的生活需要带回区域图')],
 'oasis-wind':[item('mountains','01 山前廊道','寻找水、食物与连续的停留节点'),item('nodes','02 向西走近喀什','接下来让物品进入人的生活')],
 'oasis-engineering':[item('shafts','01 竖井','向下连接施工与维护'),item('waterway','02 暗渠','沿坡降输水到地表','action')],
 'oasis-use':[item('shafts','来水以后，维护还在继续','维护者回到竖井工作','action'),item('pond','两方都开始工作','家中接水，田间引水入垄','response')],
 'oasis-nodes':[item('nodes','01 绿洲节点','停留、补给与道路相接'),item('mountains','02 山前通道','地形组织联系的条件')],
 'exchange-network':[item('nodes','01 山水与节点','先看停留的条件'),item('path','02 走向集市','镜头沿线进入人的活动','action')],
 'exchange-stops':[item('nodes','喀什 · 盆地西缘','道路交汇之后，再进入集市')],
 'exchange-city':[item('receipt','01 货物已送达','物品留在接收者手里','action'),item('receiver','02 相遇与回应','交换完成，人的活动继续','response')],
 'exchange-question':[item('family','伊犁 · 长期安顿的问题','下一幕回到1764年，观察国家调遣'),item('nodes','先定位，再转换年代','贸易与国家调遣有不同背景')],
 'memory-departure':[item('scroll','01 调遣与文书','1764 年 · 文书为创作道具'),item('family','02 家庭与行装','决定进入具体人的生活')],
 'memory-journey':[item('family','1764 · 盛京一带','启程地点'),item('basin','1765 · 抵达伊犁','弧线为方向示意')],
 'memory-muqam':[item('culture','哈密 · 区域风格之一','地图定位之后，走进庭院')],
 'modern-hubs':[item('urumqi','乌鲁木齐','片区分工 · 2023 方案'),item('gate','霍尔果斯','从区域走到关口')],
 'modern-urumqi':[item('hoist','01 装载与转运','吊机与车辆共同完成交接','action'),item('information','02 信息协作','设施与组织让货物继续走')],
 'modern-kashgar':[item('gate','霍尔果斯 · 伊犁谷地','下一幕进入协商情境')],
 'future-landscape':[item('lake','01 湖泊与山地','真实影像与高程'),item('valley','02 使用与保护','把人的安排带回自然条件')],
 'future-budget':[item('ice','01 示意冰体','消融强于积累，覆盖收缩','action'),item('ghost','02 初始边缘','对照教学叠层 · 不预测年份')],
 'future-evidence':[item('ice','01 同一天的观测','回到真实影像，核对解释'),item('valley','02 谷地与裸岩','动画提出问题，资料检验变化')],
 'future-synthesis':[item('nodes','喀什 · 交流节点','把故事放回地点'),item('gate','霍尔果斯 · 当代联系','从点重新看整体')],
 'future-result':[item('basin','01 回到最初的问题','自然条件与人的选择一起回看')],
};
export function annotationSpecs(cue,live={}){
 if(['future-landscape','future-budget'].includes(cue)){const r=live.inquiry?.rows.find(r=>r.stage==='logistics'),plan=live.civicPlan;return [item(plan==='freight'?'buffer':'waiting','01 尚未满足的需要',r?.open??'先完成关口选择，再回看约束','condition'),item(plan==='habitat'?'buffer':'truck','02 已经得到的回应',r?.answer??'选择后的空间变化','response')];}
 const d=live.decision,phase=d?.phase??live.outcome?.label??'需求';
 if(['water-ice','water-flow'].includes(cue)){
  const chosen=live.waterPlan,home=chosen==='home',responded=phase==='回应';
  if(!chosen)return [item('parent','01 家里在等水','接水的需要就在家门口'),item('farmer','02 田地也在等','选择哪条支渠先打开')];
  const age=live.waterAge??0;
  if(age>=3.8&&age<9.2)return [item(home?'parent':'farmer',home?'家人开始接水':'田边开始引水','第一处得到水，工作开始了','response'),item(home?'farmer':'parent',home?'田边还在等待':'家里还在等待','另一条支渠暂未打开','condition')];
  if(age>=9.2&&age<15.4)return [item(home?'fieldFlow':'homeFlow','另一条支渠打开了',home?'田垄逐渐湿润，田边开始工作':'水到家门，家人和孩子接过水','action'),item(home?'farmer':'parent','轮到另一方开始工作','先后不同，两方的工作依次接上','response')];
  if(age>=15.4)return [item('parent','家中的日常接上了','孩子接水，家人继续照应','response'),item('farmer','田里的工作也在继续','水入田垄，维护仍需要人承担','response')];
  return [item(home?'homeGate':'fieldGate','01 '+(home?'家门支渠':'田间支渠'),home?'先送到家里，再接上田地':'先送到田里，再接上家门','action'),item(responded?(home?'parent':'farmer'):(home?'homeFlow':'fieldFlow'),'02 '+(responded?'人物回应':'水正在抵达'),responded?'收到水的人，接着打开另一条支渠':'水闸抬起，水线沿所选支渠延伸',responded?'response':'action')];
 }
 if(cue==='exchange-goods'){
  const good=['织物','补给','器物'][Number(live.goods??1)],who=['家人','远行者','手艺人'][Number(live.goods??1)];
  const delivered=Number(live.deliveries??0)>0;
  return !d?.choice?[item('receiver','01 '+who+'的需要','选择货物，让交换有一个去处'),item('stall','02 对应的货物',good+'等待被送达')]:[item(delivered?'receipt':'parcel','01 '+good+(delivered?'已接到手里':'正在交接'),delivered?'物品已由搬运者转交给接收者':'跟随这件物品，看双方手掌的接触','action'),item('receiver','02 '+who+(phase==='回应'?'开口回应':delivered?'收到并开始使用':'等待接收'),phase==='回应'?'使用物品、点头，再继续自己的活动':delivered?'交接完成，接下来听见人物回应':'物品朝向这位需要它的人',phase==='回应'?'response':'condition')];
 }
 if(cue==='memory-arrival'){
  const home=d?.choice==='home'||live.priority==='home',object=home?'家书':'工具';
  if(!d?.choice)return [item('home','01 安顿与照护','门前的家人等待你的安排'),item('familyGate','02 引水与劳动','水闸连接田地的需要')];
  const handoff=Number(live.memoryHandoff??0),handoffTitle=handoff>.55?object+'已经交到孩子手中':handoff>0?'正在递出'+object:'准备交接'+object;
  return [item(d.age<4?(home?'homeLamp':'familyGate'):'memory','01 '+(d.age<4?(home?'灯先亮起来':'水先引到田里'):handoffTitle),d.age<4?'另一项工作随后接上':'看清伸手、接物、收回双手的过程','action'),item('child','02 '+(phase==='回应'?'孩子回应':'孩子等待接续'),phase==='回应'?(home?'坐下来，接着讲述来时的路':'拿起工具，一起学着做'):'一家人的劳动与照护同时在场',phase==='回应'?'response':'condition')];
 }
 if(cue==='memory-practice'){
  const join=d?.choice==='join',reply=phase==='回应';
  if(d?.choice&&(join?d.age<3.2:d.age>=4&&d.age<7.5))return [item('practice','01 接上这一拍','右手回应示范 · 原创节奏练习','action'),item('learner','02 看向双手，再回应','观察与实践之间留出停顿','response')];
  const learner=!!d?.choice&&(join?d.age<3.2:d.age>=4);
  return [reply?item('record','01 学习记录已经接过','这一拍从观察变成自己的实践','action'):item(learner?'learner':'teacher','01 '+(!d?.choice?'留出学习的停顿':learner?'轮到学习者接上':join?'示范者回听，再接续':'示范者再做一次'),!d?.choice?'看双手与两人之间的距离':learner?'这一拍交给学习者发起':'先观察，再把轮次交给学习者','action'),item(reply?'learner':'record','02 '+(reply?'学习者回应':'学习记录'),reply?'开口确认，同伴点头，下一次实践开始':'纸张与拍点把观察接到实践',reply?'response':'condition')];
 }
 if(cue==='modern-rules')return [item('voice','01 当前表达需要的人',live.civicVoice==='worker'?'货运交接与等待':live.civicVoice==='steward'?'连续绿带与维护空间':'生活安全与缓冲空间'),item('council','02 同一张协商桌','三种需要进入同一个空间')];
 if(cue==='modern-limit'){
  const plan=d?.choice??live.civicPlan,reply=phase==='回应';
  if(!d?.choice)return [item('buffer','01 连续绿带','生活与生境需要缓冲'),item('waiting','02 等候中的车队','交接需要空间与安排')];
  return [item(plan==='freight'?'truck':'buffer','01 '+(plan==='freight'?'交接继续走':plan==='habitat'?'绿带扩大':'通行与缓冲轮换'),plan==='freight'?'货运先得到回应':plan==='habitat'?'更多空间留给维护':'分时交接，保留缓冲','action'),item(reply?'steward':'waiting','02 '+(reply?'回应，也记录未满足的需要':'等待继续保留'),reply?'安排有取舍，三方还需要继续协调':'看同一车队的等待变化',reply?'response':'condition')];
 }
 return fixed[cue]??[];
}
const overlaps=(a,b)=>a.x<b.x+b.w+9&&a.x+a.w+9>b.x&&a.y<b.y+b.h+9&&a.y+a.h+9>b.y;
export function layoutAnnotations(points,width,height,{dialogue=false,bridge=false,protectedAreas=[],responseFocus=false}={}){
 const scale=Math.min(width/1280,height/720),narrow=width<701;
 const labelW=Math.min(218* Math.max(.8,scale),width-32),labelH=68*Math.max(.85,scale);
 const bounds={left:16,right:narrow?width-16:width-310*scale,top:bridge?150*scale:132*scale,bottom:narrow?height*.56:height-(responseFocus?170:238)*scale};
 const reserved=[...protectedAreas,...(dialogue&&!narrow?[{x:24*scale,y:230*scale,w:240*scale,h:118*scale}]:[])];
 const result=[];
 for(const p of points){
  if(!Number.isFinite(p.x+p.y+p.z)||p.z< -1||p.z>1||p.x<0||p.x>width||p.y<62*scale||p.y>height-170*scale)continue;
  let best;
  for(const [dx,dy] of [[22,-74],[-labelW-22,-74],[28,20],[-labelW-28,20],[0,-145],[0,82],[-labelW-60,-12],[80,-12]]){
   const r={x:Math.max(bounds.left,Math.min(bounds.right-labelW,p.x+dx)),y:Math.max(bounds.top,Math.min(bounds.bottom-labelH,p.y+dy)),w:labelW,h:labelH};
   if(r.y+r.h>bounds.bottom||reserved.some(o=>overlaps(r,o))||result.some(o=>overlaps(r,o)))continue;
   const end={x:Math.max(r.x,Math.min(r.x+r.w,p.x)),y:Math.max(r.y,Math.min(r.y+r.h,p.y))};
   const score=Math.hypot(end.x-p.x,end.y-p.y);
   if(!best||score<best.score)best={...p,...r,anchorX:p.x,anchorY:p.y,endX:end.x,endY:end.y,score};
  }
  if(best){result.push(best);if(result.length>=(narrow?1:2))break;}
 }
 return result;
}
export function installAnnotations({viewport,scene}){
 const host=document.createElement('div');host.id='spatial-annotations';host.setAttribute('aria-label','场景讲解标记');host.setAttribute('role','list');document.getElementById('demo-player').append(host);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');host.append(svg);
 const rings=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.TorusGeometry(.21,.017,6,36),new THREE.MeshBasicMaterial({color:0xcde5bf,transparent:true,opacity:.7,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);return m;});
 let frame=[],signature='';
 return {get frame(){return frame;},update({cue,live,anchors,camera,visible,dialogue,bridge,time,elapsed=0,actorGroup}){
  const all=visible?annotationSpecs(cue,live):[];
  const phaseAge=live.decision?.age??elapsed;
  const index=all.length>1&&Math.floor(phaseAge/4.5)%2?1:0;
  const specs=all.length?[all[index]]:[];
  const points=[];rings.forEach(r=>r.visible=false);
  for(const [i,s] of specs.entries()){
   const world=anchors[s.anchor];if(!world)continue;
   const projected=world.clone().project(camera);
   points.push({...s,x:(projected.x*.5+.5)*viewport.clientWidth,y:(-.5*projected.y+.5)*viewport.clientHeight,z:projected.z});
   if(i<2&&projected.z>=-1&&projected.z<=1){const r=rings[i];r.position.copy(world);if(['parent','farmer','traveller','receiver','official','family','child','teacher','learner','voice','steward'].includes(s.anchor))r.position.y=.085;r.scale.setScalar(1+.045*Math.sin(time*1.4));r.material.color.set(s.tone==='action'?0xe6c78b:s.tone==='response'?0xb5dfac:0x8acfcf);r.visible=true;}
  }
  // Keep explanation marks near the action without covering a person's face.
  const protectedAreas=[];
  actorGroup?.traverse(o=>{const a=o.userData.actor;if(!a||!a.root.visible)return;
   const face=a.head.getWorldPosition(new THREE.Vector3()),scale=a.root.getWorldScale(new THREE.Vector3()).x;
   const p=face.clone().project(camera);if(p.z< -1||p.z>1)return;
   const radius=Math.max(11,.23*scale*viewport.clientHeight/(2*Math.tan(camera.fov*Math.PI/360)*camera.position.distanceTo(face)));
   protectedAreas.push({x:(p.x*.5+.5)*viewport.clientWidth-radius,y:(-.5*p.y+.5)*viewport.clientHeight-radius*1.15,w:radius*2,h:radius*2.3});
  });
  frame=layoutAnnotations(points,viewport.clientWidth,viewport.clientHeight,{dialogue,bridge,protectedAreas,responseFocus:live.responseFocus});host.hidden=!frame.length;
  const key=frame.map(p=>[p.anchor,p.title,p.detail,p.tone].join('|')).join('/');
  if(key!==signature){signature=key;host.querySelectorAll('.spatial-note').forEach(e=>e.remove());svg.replaceChildren();for(const p of frame){
   const card=document.createElement('div');card.className='spatial-note';card.setAttribute('role','listitem');card.dataset.tone=p.tone;
   const title=document.createElement('strong'),detail=document.createElement('span');title.textContent=p.title;detail.textContent=p.detail;card.append(title,detail);host.append(card);
   const line=document.createElementNS(svg.namespaceURI,'line'),dot=document.createElementNS(svg.namespaceURI,'circle');dot.setAttribute('r','5');svg.append(line,dot);
  }}
  host.querySelectorAll('.spatial-note').forEach((card,i)=>{const p=frame[i];card.style.transform=`translate(${p.x}px,${p.y}px)`;card.style.width=p.w+'px';});
  [...svg.children].forEach((e,i)=>{const p=frame[Math.floor(i/2)];if(i%2===0){e.setAttribute('x1',p.anchorX);e.setAttribute('y1',p.anchorY);e.setAttribute('x2',p.endX);e.setAttribute('y2',p.endY);}else{e.setAttribute('cx',p.anchorX);e.setAttribute('cy',p.anchorY);}});
  viewport.dataset.annotationCount=String(frame.length);viewport.dataset.annotationTargets=frame.map(p=>p.anchor).join(' ');
 },hide(){frame=[];host.hidden=true;rings.forEach(r=>r.visible=false);}};
}
export function drawAnnotationFilm(ctx,notes,width,height){
 if(!notes?.length)return;
 ctx.save();ctx.shadowBlur=0;ctx.font='12px "Microsoft YaHei", sans-serif';ctx.textBaseline='top';
 for(const p of notes){
  ctx.strokeStyle=p.tone==='action'?'#e6c78b':p.tone==='response'?'#b5dfac':'#8acfcf';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(p.anchorX,p.anchorY);ctx.lineTo(p.endX,p.endY);ctx.stroke();
  ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(p.anchorX,p.anchorY,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#132b27ee';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle=ctx.strokeStyle;ctx.fillRect(p.x,p.y,3,p.h);
  ctx.fillStyle='#eff2dd';ctx.font='13px "Microsoft YaHei", sans-serif';ctx.fillText(p.title,p.x+12,p.y+9,p.w-20);
  ctx.fillStyle='#c2d1bd';ctx.font='10px "Microsoft YaHei", sans-serif';let line='',row=0;for(const c of p.detail){if(ctx.measureText(line+c).width>p.w-23){ctx.fillText(line,p.x+12,p.y+31+row*15);line='';row++;if(row===2)break;}line+=c;}if(row<2)ctx.fillText(line,p.x+12,p.y+31+row*15);
 }
 ctx.restore();
}
