import * as THREE from 'three';
import {stageOrigins} from './continuity.js';
import {storyReceipts} from './inquiry-spine.js';
import {civicPlans,traditions} from './social-model.js';

// Original comparison objects: these are neither excavated artefacts nor a claim
// that the historical family, courtyard community and contemporary gate are one family.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const cases=[
 {stage:'oasis',name:'水',question:'先回应谁的需要',scope:'原创绿洲生活示意',color:0x84c7c4},
 {stage:'market',name:'停留',question:'货物怎样进入日常',scope:'绿洲集市创作案例',color:0xd6b77d},
 {stage:'people',name:'生活',question:'劳动、照护与记忆',scope:'1764—1765 西迁家庭历史案例',color:0xcba682},
 {stage:'culture',name:'传习',question:'让下一位接上',scope:'另一个社区的传习示意',color:0xaec49a},
 {stage:'logistics',name:'协作',question:'同时容纳不同需要',scope:'依据 2023 方案的当代关口示意',color:0x9ab8cb},
];
const goods=['cloth','supplies','craft'];
const goodsNames=['织物','补给','器物'];
const origin=value=>value?.manual===true?'你的选择':value?.manual===false?'演示观察':'观察记录';

// Read structured ledger data first. The existing public observation rows are
// supported too, without guessing a choice when their text does not identify it.
function rowValue(row){
 if(!row?.observed)return null;
 if(row.value&&typeof row.value==='object')return {...row.value};
 if(row.data&&typeof row.data==='object')return {...row.data};
 const text=String(row.detail??''),manual=text.startsWith('你的选择')?true:text.startsWith('演示观察')?false:undefined;
 const value={manual};
 if(row.stage==='oasis'){
  value.plan=text.includes('先送到田里')?'field':text.includes('先送到家里')?'home':null;
  value.replied=text.includes('人物回应');
 }else if(row.stage==='market'){
  value.goods=text.includes('织物')?0:text.includes('补给')?1:text.includes('工艺')||text.includes('器物')?2:null;
  value.deliveries=Number(text.match(/已完成\s*(\d+)\s*次交接/)?.[1]??0);
 }else if(row.stage==='people'){
  value.priority=text.includes('先安顿')?'home':text.includes('先引水')?'water':null;
  value.memory=text.includes('工具与日常')?'tools':text.includes('家书与记忆')?'letter':null;
  value.progress=Number(text.match(/跟随家庭\s*(\d+(?:\.\d+)?)%/)?.[1]??0);
 }else if(row.stage==='culture'){
  value.tradition=traditions.find(t=>text.includes(t.name))?.id??null;
  value.beats=Number(text.match(/参与\s*(\d+)\s*拍/)?.[1]??0);
  // A count cannot tell us whether the user first watched or immediately joined.
  value.choice=null;
 }else if(row.stage==='logistics'){
  value.plan=Object.entries(civicPlans).find(([,p])=>text.includes(p.name))?.[0]??null;
  value.coordinated=text.includes('协同办理')?true:text.includes('分别办理')?false:undefined;
  value.green=Number(text.match(/绿地\s*(\d+(?:\.\d+)?)%/)?.[1]??NaN);
 }
 return value;
}

export function buildStoryThread(observations={}){
 const ledger=Array.isArray(observations)?Object.fromEntries(observations.map(row=>[row.stage,rowValue(row)])):observations??{};
 const tokens=cases.map(info=>{
  const value=ledger[info.stage],observed=!!value,receipt=storyReceipts(ledger).find(r=>r.stage===info.stage);
  const token={...info,open:receipt?.open??'先留下自己的观察',observed,origin:observed?origin(value):'尚未记录',variant:'pending',choice:null,complete:false};
  if(!observed)return token;
  if(info.stage==='oasis'){
   token.choice=['home','field'].includes(value.plan)?value.plan:null;
   token.variant=token.choice??'pending';token.complete=!!token.choice&&value.replied===true;
   token.label=token.choice==='field'?'先到田里':token.choice==='home'?'先到家里':'水路观察';
   token.response=token.complete?'接水的人已经回应':'水路变化仍在观察';
  }else if(info.stage==='market'){
   const index=goods.indexOf(value.choice)>=0?goods.indexOf(value.choice):Number.isInteger(value.goods)&&value.goods>=0&&value.goods<3?value.goods:-1;
   token.choice=goods[index]??null;token.variant=token.choice??'pending';token.deliveries=Math.max(0,Math.floor(finite(value.deliveries)));
   token.complete=!!token.choice&&token.deliveries>0;token.label=index>=0?goodsNames[index]:'货物观察';
   token.response=token.complete?'物品已交到需要的人手中':'交接仍在发生';
  }else if(info.stage==='people'){
   token.choice=['home','water'].includes(value.choice)?value.choice:['home','water'].includes(value.priority)?value.priority:null;
   token.memory=['letter','tools'].includes(value.memory)?value.memory:null;
   token.variant=token.memory??'pending';token.progress=clamp(finite(value.progress),0,100);token.complete=token.progress>=78;
   token.label=token.memory==='tools'?'工具与日常':token.memory==='letter'?'家书与记忆':'家庭观察';
   token.response=token.complete?(token.choice==='home'?'先安顿，再引水':'先引水，再安顿'):'远行与准备';
  }else if(info.stage==='culture'){
   token.choice=['listen','join'].includes(value.choice)?value.choice:null;
   token.variant=token.choice??'rhythm';token.beats=Math.max(0,Math.floor(finite(value.beats)));
   token.tradition=traditions.find(t=>t.id===value.tradition)?.id??null;token.complete=token.beats>0;
   token.label=token.choice==='listen'?'观察后回应':token.choice==='join'?'主动接上一拍':'传习与回应';
   token.response=token.complete?'学习者留下了自己的回应':'给学习者留出停顿';
  }else if(info.stage==='logistics'){
   token.choice=Object.hasOwn(civicPlans,value.plan)?value.plan:null;token.variant=token.choice??'pending';
   const plan=civicPlans[token.choice];token.green=clamp(finite(value.green,plan?.green??0),0,100);
   token.coordinated=value.coordinated===true;token.capacity=plan?.capacity??0;token.complete=!!token.choice;
   token.label=plan?.name??'空间观察';token.response=plan?.summary??'不同需要仍需协商';
  }
  return token;
 });
 const links=tokens.slice(0,-1).map((from,i)=>{
  const to=tokens[i+1];
  return {from:from.stage,to:to.stage,observed:from.observed&&to.observed,
   comparison:i>=1, // The market, historical family and contemporary cases are distinct.
   label:['水支撑停留','从物品需要，看劳动与照护','从生活记忆，对照社区传习','从相互回应，追问空间协作'][i]};
 });
 return {title:'水 → 停留 → 生活 → 传习 → 协作',tokens,links,
  observed:tokens.filter(t=>t.observed).length,complete:tokens.filter(t=>t.complete).length,
  scope:'不同年代与社区的主题比较；不是同一家庭、同一物件或同一实测路线的延续。',
  signature:tokens.map(t=>[t.stage,t.observed,t.choice,t.variant,t.origin,t.complete,t.green,t.coordinated,t.beats,t.deliveries].join(':')).join('|')};
}

export function makeStoryThread(scene,helpers,{placements={},resultPosition=[10,.08,10.2],resultScale=1}={}){
 const {box,ball,cylinder,subgroup,solid,textSign}=helpers;
 const group=new THREE.Group();group.name='choice-thread';scene.add(group);
 group.userData.scope='Original teaching objects; comparison across separate eras and communities.';
 const result=subgroup(group,resultPosition);result.name='choice-specific-result';result.scale.setScalar(resultScale);
 const resultTitle=textSign(result,'水 · 停留 · 生活 · 传习 · 协作','不同年代与社区，回看各自的选择',[0,3.55,-.8],5.8);
 resultTitle.userData.keepSign=true;resultTitle.visible=true;
 resultTitle.rotation.x=-.1;
 const material=new THREE.MeshStandardMaterial({color:0x294448,roughness:.7,metalness:.18});
 const ceramic=new THREE.MeshStandardMaterial({color:0xd4bd98,roughness:.76});
 const water=new THREE.MeshStandardMaterial({color:0x75bdc8,roughness:.24,metalness:.18,transparent:true,opacity:.86});
 const glow=new THREE.MeshBasicMaterial({color:0xbfe1d4,transparent:true,opacity:.48});
 const lathe=new THREE.LatheGeometry([[.07,0],[.1,.035],[.18,.12],[.25,.2],[.27,.24]].map(p=>new THREE.Vector2(...p)),20);
 const potGeo=new THREE.LatheGeometry([[.09,0],[.14,.02],[.22,.16],[.21,.27],[.13,.33],[.125,.39]].map(p=>new THREE.Vector2(...p)),20);
 const ringGeo=new THREE.TorusGeometry(.2,.018,6,24),lineMaterials=new Map();
 const ownedGeometries=new Set([lathe,potGeo,ringGeo]),ownedSigns=new Set([resultTitle]);
 const stationDefaults={oasis:[-34,.1,3.3],market:[6,.1,3.25],people:[26,.1,3.25],culture:[46,.1,3.25],logistics:[66,.1,3.25]};
 const stations=[],incoming=[],resultStations=[],routes=[];

 function createObject(parent,token,small=false){
  const g=subgroup(parent);g.scale.setScalar(small?.63:1);
  const motion=[];
  box(g,material,[0,.035,0],[1.25,.1,1.02]);
  const neutral=token.variant==='pending';
  if(token.stage==='oasis'){
   solid(g,lathe,ceramic,[0,.12,0],[1,1,1]);
   cylinder(g,water,[0,.305,0],[.235,.012,.235]).visible=!neutral;
   const branch=subgroup(g,token.choice==='field'?[.39,0,.12]:[-.39,0,.12]);
   if(token.choice==='field'){
    for(let i=0;i<4;i++){
     cylinder(branch,0x89915a,[-.06+i*.065,.24,.05],[.012,.32,.012]);
     ball(branch,0xd9be76,[-.06+i*.065,.38,.05],[.032,.072,.025]);
    }
    box(g,water,[.34,.09,.1],[.43,.018,.075]);
   }else if(token.choice==='home'){
    for(let i=0;i<2;i++){const cup=solid(branch,lathe,ceramic,[i*.17,.11,.08],[.4,.5,.4]);motion.push({mesh:cup,type:'water'});}
    box(g,water,[-.34,.09,.1],[.43,.018,.075]);
   }
  }else if(token.stage==='market'){
   box(g,0x887453,[0,.13,0],[.84,.13,.66]);
   if(token.variant==='cloth')for(let i=0;i<3;i++){const roll=cylinder(g,[0x96635c,0xb7a685,0x708c8a][i],[0,.26+i*.08,-.17+i*.15],[.105,.6,.105]);roll.rotation.z=Math.PI/2;}
   else if(token.variant==='supplies'){
    const sack=ball(g,0xc6b28b,[-.12,.39,0],[.25,.29,.23]);motion.push({mesh:sack,type:'parcel'});
    cylinder(g,0x877b58,[-.12,.67,0],[.08,.06,.08]);
    ball(g,0x8f9771,[.29,.24,.14],[.105,.08,.1]);ball(g,0xb9975e,[.27,.25,-.09],[.1,.08,.1]);
   }else if(token.variant==='craft'){
    solid(g,potGeo,ceramic,[0,.2,0],[.95,.95,.95]);
    const handle=solid(g,ringGeo,ceramic,[.19,.46,0],[.48,.55,.48]);handle.rotation.y=Math.PI/2;
    box(g,0x765b42,[.34,.25,.15],[.065,.035,.37]);
   }else box(g,0x71817b,[0,.27,0],[.57,.15,.4]);
  }else if(token.stage==='people'){
   box(g,0xad9673,[0,.19,-.14],[.74,.27,.43]);box(g,0xd8c199,[0,.34,-.14],[.79,.055,.46]);
   if(token.variant==='tools'){
    const tools=subgroup(g,[0,.4,.14]);tools.rotation.z=-.17;
    for(let i=0;i<2;i++){cylinder(tools,0x8d6d48,[-.17+i*.27,.13,0],[.025,.43,.025]);box(tools,0x63726e,[-.17+i*.27,.3,0],[.15,.11,.04]);}
    box(g,water,[.46,.14,-.1],[.07,.018,.55]);
   }else if(token.variant==='letter'){
    box(g,0xefdfbd,[0,.39,.12],[.42,.025,.29]);const folded=box(g,0xe7d8b6,[.085,.43,.12],[.24,.022,.29]);folded.rotation.z=-.28;
    box(g,0x976746,[-.17,.41,.12],[.018,.013,.27]);
    const lamp=subgroup(g,[-.42,.13,-.2]);cylinder(lamp,0x6b5b43,[0,.14,0],[.035,.29,.035]);ball(lamp,0xe2ba6c,[0,.3,0],[.08,.09,.075]);
   }
  }else if(token.stage==='culture'){
   for(let i=0;i<4;i++){
    const pad=cylinder(g,i%2?0x9ab591:0xcdb786,[-.37+i*.25,.17,.08],[.09,.07,.09]);motion.push({mesh:pad,type:'beat',offset:i});
   }
   const teacher=solid(g,ringGeo,0xbac9a6,[-.25,.42,-.2],[.7,.7,.7]),learner=solid(g,ringGeo,0xe1c699,[.25,.42,-.2],[.7,.7,.7]);
   motion.push({mesh:teacher,type:'teacher'},{mesh:learner,type:'learner'});
   box(g,0xe2d3ac,[0,.12,-.34],[.28,.015,.15]);
  }else if(token.stage==='logistics'){
   const greens=subgroup(g,[-.32,.13,-.05]);
   box(g,0x8a9b6c,[0,0,0],[.29,.05,.71]);
   for(let i=0;i<3;i++){cylinder(greens,0x716948,[0,.14,-.22+i*.22],[.017,.2,.017]);ball(greens,0x829b68,[0,.27,-.22+i*.22],[.12,.16,.12]);}
   greens.scale.x=neutral?.18:clamp(token.green/48,.2,1.1);
   box(g,0x879899,[.19,.12,0],[.39,.04,.78]);
   for(let i=0;i<3;i++){
    const truck=subgroup(g,[.2,.17,-.22+i*.23]);box(truck,0xc4b390,[0,.06,0],[.21,.12,.14]);box(truck,0x60878b,[.12,.03,0],[.09,.09,.14]);
    truck.visible=!neutral&&i<(token.capacity>=6?3:2);motion.push({mesh:truck,type:'vehicle',offset:i,home:truck.position.clone()});
   }
   const table=box(g,0xbdab88,[.05,.5,.37],[token.coordinated?.53:.26,.05,.18]);
   for(let i=0;i<3;i++){const person=ball(g,[0x96b9ad,0xc7aa85,0xb1bd91][i],[-.15+i*.18,.62,.37],[.045,.065,.045]);motion.push({mesh:person,type:'respond',offset:i});}
   if(!token.coordinated){box(g,0xbdab88,[-.22,.46,.37],[.15,.05,.18]);box(g,0xbdab88,[.32,.46,.37],[.15,.05,.18]);table.position.y=.46;}
  }
  g.userData.motion=motion;g.userData.variant=token.variant;
  return g;
 }

 function station(parent,stage,position,index,kind){
  const g=subgroup(parent,position);g.name=kind+'-'+stage;
  const width=kind==='result'?2.9:1.45;
  box(g,0x3b504e,[0,-.12,0],[width,.16,kind==='result'?1.8:1.25]);
  const shape=subgroup(g);shape.scale.setScalar(kind==='result'?1.48:.8);
  const geometry=new THREE.TorusGeometry(kind==='result'?.71:.39,.018,6,36);ownedGeometries.add(geometry);
  const ring=solid(g,geometry,glow,[0,.1,0]);ring.rotation.x=Math.PI/2;
  const sign=textSign(g,cases[index].name,kind==='incoming'?'主题回声':'选择留下的变化',[0,kind==='result'?1.42:.8,-.36],kind==='result'?2.15:1.35);
  if(kind==='result'){sign.userData.keepSign=true;sign.visible=true;}
  ownedSigns.add(sign);
  const need=kind==='result'?textSign(g,'下一步 · 仍需回应','先留下自己的观察',[0,2.25,-.36],2.65,'#344a45'):null;if(need){ownedSigns.add(need);need.userData.keepSign=true;need.visible=true;}
  const record={group:g,shape,ring,sign,need,stage,index,kind,object:null,variantKey:'',labelKey:''};
  if(kind==='result'){
   const era=index===2?'1764—1765 历史案例':index===3?'另一个社区的传习':index===4?'2023 方案主题示意':'独立的创作案例';
   const tag=textSign(g,era,'各案例独立，不表示同一家人',[0,.18,.86],2.35,'#344a45');tag.rotation.x=-Math.PI/2;ownedSigns.add(tag);
   tag.userData.keepSign=true;tag.visible=true;
  }
  return record;
 }
 for(const [index,info]of cases.entries()){
  const position=placements[info.stage]??stationDefaults[info.stage];stations.push(station(group,info.stage,position,index,'outgoing'));
  resultStations.push(station(result,info.stage,[(index-2)*3.45,0,0],index,'result'));
  if(index){
   const from=cases[index-1];
   const entering=[stageOrigins[info.stage]-6,.1,3.3];incoming.push(station(group,from.stage,entering,index-1,'incoming'));
   const start=new THREE.Vector3(...(placements[from.stage]??stationDefaults[from.stage])).add(new THREE.Vector3(0,.15,0));
   const end=new THREE.Vector3(...entering).add(new THREE.Vector3(0,.15,0));
   const curve=new THREE.CatmullRomCurve3([start,start.clone().lerp(end,.35).add(new THREE.Vector3(0,.35,-.7)),start.clone().lerp(end,.7).add(new THREE.Vector3(0,.25,-.6)),end]);
   const m=new THREE.MeshBasicMaterial({color:from.color,transparent:true,opacity:.2});lineMaterials.set(from.stage,m);
   const geometry=new THREE.TubeGeometry(curve,40,.014,5,false);ownedGeometries.add(geometry);
   const route=new THREE.Group();group.add(route);route.add(new THREE.Mesh(geometry,m));
   const points=Array.from({length:3},()=>ball(route,glow,[0,0,0],[.04,.04,.04]));
   routes.push({group:route,from:from.stage,to:info.stage,curve,points,material:m});
  }
 }
 // The final table is a comparative exhibition; the five object bays stay apart.
 box(result,0x213d40,[0,-.22,0],[17.7,.21,2.45]);
 for(let i=0;i<4;i++)box(result,0xa6b59d,[(i-1.5)*3.45,-.065,0],[.035,.012,1.92]);

 function applyToken(record,token){
  const key=[token.observed,token.variant,token.green,token.coordinated,token.capacity].join(':');
  if(key!==record.variantKey){
   if(record.object){record.shape.remove(record.object);record.object=null;}
   record.object=createObject(record.shape,token,record.kind==='incoming');record.variantKey=key;
  }
  record.ring.visible=token.observed;
  record.group.userData.choice=token.choice;record.group.userData.origin=token.origin;record.group.userData.scope=token.scope;
  const label=token.observed?(record.kind==='incoming'?'主题回声 · ':'')+token.origin+' · '+(token.label??token.name):'尚未记录';
  if(label!==record.labelKey){
   const image=record.sign.material?.map?.image,context=image?.getContext?.('2d');
   if(context){
    context.fillStyle='#0e3b40';context.fillRect(0,0,image.width,image.height);context.strokeStyle='#b3d0b0';context.strokeRect(7,7,image.width-14,image.height-14);
    context.textAlign='center';context.fillStyle='#edf1d7';context.font='42px "Microsoft YaHei"';context.fillText(token.name,image.width/2,69);
    context.fillStyle='#b6c8b7';context.font='24px "Microsoft YaHei"';context.fillText(label,image.width/2,118,image.width-30);record.sign.material.map.needsUpdate=true;
   }
   if(record.need){const img=record.need.material.map.image,c=img.getContext('2d');c.fillStyle='#344a45';c.fillRect(0,0,img.width,img.height);c.textAlign='center';c.fillStyle='#e1c894';c.font='32px Microsoft YaHei';c.fillText('下一步 · 仍需回应',img.width/2,65);c.fillStyle='#d5dfc9';c.font='24px Microsoft YaHei';c.fillText(token.open,img.width/2,113,img.width-30);record.need.material.map.needsUpdate=true;}
   record.labelKey=label;
  }
  // Object position is grounded, rather than a levitating reward symbol.
  record.object.visible=token.observed||record.kind==='result';
 }
 let model=buildStoryThread(),lastClock=0;
 const resultFocus={position:[resultPosition[0],9.5,resultPosition[2]+19],target:[resultPosition[0],1.1,resultPosition[2]]};
 return {group,result,resultFocus,
  update({observations={},stage=null,cue=null,clock=0,summary=false,dt=0}={}){
   model=buildStoryThread(observations);const closing=summary||cue==='future-synthesis'||cue?.id==='future-synthesis';
   group.visible=closing||!!stage;result.visible=closing;
   const now=Number.isFinite(clock)?clock:lastClock+Math.max(0,dt);lastClock=now;
   group.userData.observed=model.observed;group.userData.complete=model.complete;group.userData.signature=model.signature;
   for(const record of [...stations,...incoming,...resultStations]){
    const token=model.tokens[record.index];applyToken(record,token);
    const active=record.kind==='result'?closing:record.kind==='incoming'?stage===cases[record.index+1]?.stage:closing||stage===record.stage;
    record.group.visible=active&&(token.observed||record.kind==='result');
    record.ring.scale.setScalar(1+Math.sin(now*1.8+record.index)*.04);
    for(const part of record.object.userData.motion){
     if(part.type==='beat'){const activeBeat=token.complete&&Math.floor(now*1.35)%4===part.offset;part.mesh.scale.y=activeBeat?1.4:1;}
     else if(part.type==='teacher'||part.type==='learner'){
      const learnerFirst=token.choice==='join',first=part.type==='learner'?learnerFirst:!learnerFirst;
      part.mesh.rotation.z=token.complete?Math.sin(now*2.7+(first?0:Math.PI))*.065:0;
     }else if(part.type==='vehicle')part.mesh.position.x=part.home.x+(token.coordinated?Math.sin(now*.65+part.offset)*.045:0);
     else if(part.type==='respond')part.mesh.scale.y=1+Math.sin(now*1.2+part.offset*.9)*.025;
    }
   }
   for(const route of routes){
    const from=model.tokens.find(t=>t.stage===route.from),to=model.tokens.find(t=>t.stage===route.to);
    route.group.visible=from.observed&&(closing||stage===route.from||stage===route.to);
    route.material.opacity=to.observed?.27:.12;
    route.points.forEach((bead,i)=>{bead.position.copy(route.curve.getPoint(((now*.11+i/3)%1+1)%1));bead.visible=from.complete&&to.observed;});
   }
   return model;
  },
  get model(){return model;},
  hide(){group.visible=false;},
  dispose(){scene.remove(group);for(const geometry of ownedGeometries)geometry.dispose();for(const sign of ownedSigns){sign.geometry?.dispose();sign.material?.map?.dispose();sign.material?.dispose();}for(const m of [material,ceramic,water,glow,...lineMaterials.values()])m.dispose();},
 };
}
