import * as THREE from 'three';
import {surfaceMaterial} from './surface.js';
import {settlementStoryFrame,storyEase} from './settlement-story.js';

// NEAC describes traditional forms, not a surveyed house or a dated garment.
// The authored courtyard is a comparison model; no historical family is named.
export const periodReference='https://www.neac.gov.cn/seac/ztzl/xbz/fsxg.shtml';
export const settlementDetails={
 story:{title:'跟随水与生活',text:'沿住处、渠边与田地观察需求、行动和变化。河谷水源解释生产条件，迁移原因仍需结合历史安排理解。',anchor:[0,.6,.25],span:14.8},
 overview:{title:'屯居、水系与年代',text:'先看住处和初期灌溉，再对照后来开渠与放水。具体院落和渠线是比较模型。',anchor:[0,.6,.25],span:14.8},
 home:{title:'斜顶房与庭院',text:'传统形制资料记有土坯或木架斜顶房、低墙庭院。这里按这些特征建模，不认定某座1766年的房屋或院落。',anchor:[3.8,.6,1.2],span:8.5},
 people:{title:'长袍、腰带与圆顶帽',text:'男子长袍、腰带、圆顶帽与长靴参考传统服饰记述；颜色、裁片和人物身份为模型设计，不复原具体文物。',anchor:[4.65,.65,2.60],span:3.5},
 initial:{title:'支流灌溉与初期田地',text:'安置后已有利用支流水源的灌溉和耕作。查看渠边，再看居民在初期田垄旁劳作。',anchor:[2.0,.65,-1.65],span:5.7},
 field:{title:'水到田边，耕作继续',text:'主渠经田边支渠接向新增耕作空间。来水、田区变化与居民转向田间在同一处发生。',anchor:[-1.55,.60,1.75],span:5.8},
 water:{title:'劳动怎样接到来水',text:'看工具实际落到渠边，再看新渠来水接到耕地。施工动作是解释性编排，不是工程现场或真实劳动流程的复原。',anchor:[-3.4,.6,.25],span:6.3}
};
const stoneGeo=new THREE.IcosahedronGeometry(1,1),leafGeo=new THREE.BufferGeometry();
leafGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,-.50,0,-.37,-.15,.035,-.42,.12,.03,0,.50,0,.42,.12,.03,.37,-.15,.035,0,0,.05],3));
leafGeo.setIndex([6,0,1,6,1,2,6,2,3,6,3,4,6,4,5,6,5,0]);leafGeo.computeVertexNormals();
const dummy=new THREE.Object3D(),tint=new THREE.Color();
const palette=[0x344a54,0x64533f,0x4d5750,0x465564];
function random(seed){let v=seed;return()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296;};}
function gableGeometry(width,depth,rise){
 const x=width/2,z=depth/2,geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute([-x,0,-z,x,0,-z,0,rise,-z,-x,0,z,x,0,z,0,rise,z],3));
 geometry.setIndex([0,1,2,5,4,3,0,2,5,0,5,3,2,1,4,2,4,5]);geometry.computeVertexNormals();return geometry;
}
function dress(a,tone,{solid,box,ball,cylinder,subgroup}){
 const coat=surfaceMaterial(tone,{roughness:.98,side:THREE.DoubleSide},'textile'),trim=surfaceMaterial(0x282e2a,{roughness:1},'textile');
 a.clothing.torso.visible=false;a.clothing.trim.forEach(m=>m.visible=false);
 a.clothing.coat.color.setHex(tone);a.clothing.trousers.color.setHex(0x343b35);
 a.head.scale.setScalar(.62);
 const garment=subgroup(a.hips);garment.name='traditional-form-robe';
 const profile=[[.202,-.31],[.192,-.16],[.169,.04],[.178,.22],[.206,.36],[.115,.455]].map(p=>new THREE.Vector2(...p));
 for(const front of [0,1])solid(garment,new THREE.LatheGeometry(profile,24,-Math.PI/2+.035+front*Math.PI,Math.PI-.07),coat);
 const seam=box(garment,trim,[.055,.27,.171],[.014,.27,.014]);seam.rotation.z=-.40;
 for(let i=0;i<3;i++)ball(garment,0x8f886d,[.086,.335-i*.062,.170],[.009,.007,.008]);
 solid(garment,new THREE.CylinderGeometry(.172,.172,.035,32,1,true),trim,[0,.055,0],[1,1,.82]);
 cylinder(garment,trim,[0,.435,0],[.114,.037,.105]);
 const cap=subgroup(a.head);ball(cap,trim,[0,.098,-.016],[.157,.095,.143]);
 solid(cap,new THREE.CylinderGeometry(.151,.153,.035,32),trim,[0,.079,-.012],[1,1,.91]);
 for(const limb of a.limbs){
  cylinder(limb.knee,trim,[0,-.098,0],[.080,.193,.077]);
  const boot=box(limb.ankle,trim,[0,-.001,.05],[.15,.09,.235]);boot.name='long-boot-foot';
  cylinder(limb.elbow,trim,[0,-.197,0],[.056,.048,.056]);
 }
 a.root.userData.periodClothing='traditional-form-reference';
 a.root.userData.stride=.70;
 return a;
}
export function decoratePeriodSettlement(parent,a){
 if(!a.solid||!a.human)return null;
 const {solid,box,ball,cylinder,subgroup}=a,root=subgroup(parent),rng=random(8303);
 root.name='period-courtyard-reference';
 const earth=surfaceMaterial(0xbba481,{roughness:1},'clay'),roof=surfaceMaterial(0x776849,{roughness:1},'soil'),wood=surfaceMaterial(0x6e5137,{roughness:1},'wood');
 const houses=[];
 for(const [x,z] of [[4.85,-1.85],[4.85,1.25]]){
  const house=subgroup(root,[x,0,z]);house.name='sloping-roof-house';
  box(house,earth,[0,.65,0],[2.2,1.28,1.52]);
  solid(house,gableGeometry(2.2,1.52,.49),earth,[0,1.27,0]);
  for(const side of [-1,1]){
   const slope=box(house,roof,[side*.60,1.51,0],[1.34,.075,1.79]);slope.rotation.z=-side*.41;
   box(house,wood,[side*1.20,1.23,0],[.07,.07,1.88]);
  }
  box(house,wood,[0,1.78,0],[.10,.06,1.88]);
  box(house,wood,[0,.48,.778],[.46,.91,.035]);
  for(let i=0;i<5;i++)box(house,wood,[-.20+i*.10,.48,.801],[.015,.86,.018]);
  for(const x of [-.73,.73]){
   box(house,0x29352e,[x,.81,.772],[.39,.42,.025]);
   for(let j=0;j<3;j++)box(house,wood,[x-.17+j*.17,.81,.796],[.017,.45,.025]);
   for(let j=0;j<3;j++)box(house,wood,[x,.62+j*.19,.798],[.39,.016,.025]);
  }
  box(house,earth,[0,.055,.90],[.73,.07,.37]);
  for(let i=0;i<9;i++)box(house,0xad9677,[-1.02+i*.25,.13+(i%2)*.025,.773],[.21,.027,.013]);
  houses.push(house);
 }
 // The low wall encloses a courtyard; it does not depict a whole niulu fort.
 for(const x of [3.42,6.25])box(root,earth,[x,.30,2.66],[.16,.55,2.9]);
 const foreground=[];
 for(const x of [3.82,5.76])foreground.push(box(root,earth,[x,.30,4.0],[.85,.55,.16]));
 for(const x of [4.35,5.17])foreground.push(cylinder(root,wood,[x,.52,4.0],[.055,1.03,.055]));
 const door=subgroup(root,[4.76,.05,4.0]);for(const side of [-1,1]){const hinge=subgroup(door,[side*.35,0,0]);box(hinge,wood,[-side*.18,.38,0],[.34,.71,.045]);hinge.rotation.y=-side*1.25;}
 const potGeo=new THREE.LatheGeometry([[.06,0],[.17,.05],[.19,.23],[.11,.36],[.12,.40]].map(p=>new THREE.Vector2(...p)),20),clay=surfaceMaterial(0x9f7658,{roughness:.95},'clay');
 for(const [x,z]of [[5.82,2.31],[5.62,2.4],[3.77,.32]])solid(root,potGeo,clay,[x,.05,z],[.8,.8,.8]);
 const cart=subgroup(root,[6.3,.05,-.25]);cart.rotation.y=.20;
 box(cart,wood,[0,.31,0],[.62,.07,.9]);for(const side of [-1,1]){
  const wheel=solid(cart,new THREE.TorusGeometry(.25,.025,6,24),wood,[side*.38,.24,0]);wheel.rotation.y=Math.PI/2;
  for(let i=0;i<8;i++){const spoke=box(cart,wood,[side*.38,.24,0],[.019,.46,.020]);spoke.rotation.x=i*Math.PI/4;}
  box(cart,wood,[side*.20,.27,.7],[.03,.04,.95]);
 }
 const groundGeo=new THREE.PlaneGeometry(14.2,9.10,65,40);groundGeo.rotateX(-Math.PI/2);
 const v=groundGeo.attributes.position;for(let i=0;i<v.count;i++){const x=v.getX(i),z=v.getZ(i);v.setY(i,.038+.009*Math.sin(x*3.7)*Math.sin(z*4.1));}groundGeo.computeVertexNormals();
 solid(root,groundGeo,surfaceMaterial(0xb6a383,{roughness:1},'soil')).castShadow=false;
 const pebbles=new THREE.InstancedMesh(stoneGeo,surfaceMaterial(0xb4a389,{roughness:1},'soil'),105);pebbles.name='courtyard-and-river-stones';
 for(let i=0;i<105;i++){const x=i<70?-6.6+rng()*6.3:3.45+rng()*2.65,z=i<70?-3.35+(rng()-.5)*.30:2.55+rng()*1.2;dummy.position.set(x,.065,z);dummy.rotation.set(rng(),rng()*6,rng());dummy.scale.set(.032+rng()*.040,.018+rng()*.025,.028+rng()*.045);dummy.updateMatrix();pebbles.setMatrixAt(i,dummy.matrix);pebbles.setColorAt(i,tint.setHex([0xa68f70,0xc3b496,0x958f76][i%3]));}pebbles.receiveShadow=true;root.add(pebbles);
 const leaves=new THREE.InstancedMesh(leafGeo,new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,side:THREE.DoubleSide}),280);leaves.name='poplar-foliage';let index=0;
 for(const [x,z,h]of [[6.55,-2.95,2.45],[3.48,3.65,1.95],[6.55,3.48,2.1],[-6.7,-3.35,1.8]]){
  cylinder(root,wood,[x,h*.38,z],[.048,h*.76,.048]);
  for(let j=0;j<5;j++){const branch=cylinder(root,wood,[x+Math.sin(j*2.4)*.10,h*(.56+j*.05),z+Math.cos(j*2.4)*.10],[.015,h*.25,.015]);branch.rotation.set(Math.cos(j)*.55,0,Math.sin(j)*.55);}
  for(let j=0;j<70;j++){const angle=rng()*6.28,radius=Math.sqrt(rng())*.37;dummy.position.set(x+Math.cos(angle)*radius,h*.65+rng()*h*.38,z+Math.sin(angle)*radius);dummy.rotation.set(rng()*2,rng()*6,0);dummy.scale.set(.13,.20,1);dummy.updateMatrix();leaves.setMatrixAt(index,dummy.matrix);leaves.setColorAt(index++,tint.setHex([0x6b7d4b,0x819057,0x9a9e65][j%3]));}
 }leaves.castShadow=true;root.add(leaves);
 const initial=subgroup(root),cropMaterial=surfaceMaterial(0x829058,{roughness:1},'textile');
 for(let row=0;row<5;row++){
  box(initial,0x8b7655,[1.25+row*.4,.063,-2.16],[.10,.03,1.50]);
  for(let k=0;k<8;k++){const p=subgroup(initial,[1.25+row*.4,.07,-2.78+k*.17]);cylinder(p,cropMaterial,[0,.14,0],[.011,.28,.011]);ball(p,0xbaac6b,[0,.29,0],[.028,.065,.025]);}
 }
 const channelMaterial=surfaceMaterial(0x507f81,{roughness:.30,metalness:.05},'water');
 box(initial,0x8c7554,[2.95,.09,-1.97],[.34,.09,2.8]);const initialWater=box(initial,channelMaterial,[2.95,.139,-1.97],[.22,.022,2.82]);
 const residents=[0,1].map(i=>dress(a.human(root,palette[i],.94),palette[i],a));
 const workers=[0,1].map(i=>dress(a.human(root,palette[2+i],.94),palette[2+i],a));
 const tools=workers.map(actor=>{const t=subgroup(root);cylinder(t,wood,[0,0,0],[.022,1.05,.022]);box(t,0x4e5148,[0,-.53,.03],[.17,.045,.18]);return t;});
 const residentTool=subgroup(root);cylinder(residentTool,wood,[0,0,0],[.017,.94,.017]);box(residentTool,0x4e5148,[0,-.47,.035],[.13,.025,.13]);residentTool.visible=false;
 const curve=points=>new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.055,z)));
 const walk=curve([[4.27,2.65],[4.76,3.35],[4.76,4.17],[3.03,4.10],[3.05,1.0],[1.9,.25],[1.8,-1.35]]);
 const visit=curve([[4.27,2.65],[4.76,3.5],[4.76,4.17],[1.1,3.8],[.25,2.5],[.20,1.12]]);
 const toField=curve([[.20,1.12],[.24,2.85],[-1.45,2.94],[-1.45,2.30]]);
 const trace=solid(root,new THREE.TubeGeometry(walk,64,.013,4,false),new THREE.MeshBasicMaterial({color:0xcdb987,transparent:true,opacity:.45}));trace.visible=false;
 return {root,houses,door,foreground,initialWater,leaves,residents,workers,tools,residentTool,walk,visit,toField,trace,legacy:null,lastClock:null,focus:'story',highlight:null};
}
export function periodWorkerFrame(clock,index=0){
 const phase=((clock*.23+index*.37)%1+1)%1;
 return {phase,lower:.20+.62*Math.sin(phase*Math.PI)**2,lean:.07+.13*Math.sin(phase*Math.PI)**2,contact:phase>.45&&phase<.58};
}
export function settlementCameraPose(focus,origin,aspect=1,fov=44){
 const detail=settlementDetails[focus]??settlementDetails.overview,target=new THREE.Vector3(...detail.anchor);target.x+=origin;
 const distance=Math.max(['overview','story'].includes(focus)?18:focus==='home'?7.8:4.4,detail.span/(2*Math.tan(fov*Math.PI/360)*Math.max(.35,aspect)*.86));
 const direction=new THREE.Vector3(focus==='people'?.43:.12,['overview','story'].includes(focus)?.94:focus==='people'?.43:.55,1).normalize();
 return {target,position:target.clone().addScaledVector(direction,distance),min:2.5,max:180};
}
export function setPeriodFocus(period,focus='overview'){
 if(!period)return;
 period.focus=settlementDetails[focus]?focus:'overview';
 if(!period.highlight){
  const points=Array.from({length:64},(_,i)=>new THREE.Vector3(Math.cos(i/64*Math.PI*2),0,Math.sin(i/64*Math.PI*2)));
  period.highlight=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xe4c584,transparent:true,opacity:.85}));period.root.add(period.highlight);
 }
 const d=settlementDetails[period.focus];period.highlight.visible=!['overview','story'].includes(focus);period.highlight.position.set(d.anchor[0],.09,d.anchor[2]);period.highlight.scale.setScalar(focus==='home'?1.7:focus==='water'?1.15:.95);
}
export function animatePeriodSettlement(g,f,clock,viewport){
 const c=g.userData.chronology,p=c?.period;if(!p)return;
 if(!f){if(p.legacy){for(const [object,visible]of p.legacy)object.visible=visible;p.legacy=null;}p.root.visible=false;for(const key of ['settlementPeriodDetail','settlementRoof','settlementClothing','settlementWorkerContact'])delete viewport.dataset[key];return;}
 p.root.visible=true;
 if(!p.legacy)p.legacy=new Map(g.children.filter(m=>m!==c.root).map(m=>[m,m.visible]));
 // Legacy generic clothing and flat-roof houses remain in the original experiment.
 for(const object of p.legacy.keys())object.visible=false;
 const story=settlementStoryFrame(f.stage.id,f.progress),stateKey=f.stage.id+'/'+f.progress.toFixed(4)+'/'+p.focus;
 if(p.lastClock===clock&&p.lastStateKey===stateKey)return;
 const dt=p.lastClock===null?0:Math.max(0,Math.min(.06,clock-p.lastClock));p.lastClock=clock;p.lastStateKey=stateKey;
 const inspecting=p.focus==='people';p.foreground.forEach(m=>m.visible=!inspecting);p.door.visible=!inspecting;
 p.trace.visible=!inspecting&&f.stage.id==='settle'&&f.progress>.24;
 p.residentTool.visible=false;
 p.residents.forEach((actor,i)=>{
  let path=p.walk,position,walking=false,working=false,amount=0;
  if(inspecting||f.stage.id==='dig'){position=new THREE.Vector3(4.27+i*.67,0,2.65);}
  else if(f.stage.id==='settle'){amount=story.residentWalk;position=path.getPoint(amount);position.y=0;position.x+=i*.25+story.initialWork*(i===0?.50:-.45);walking=amount>.001&&amount<.999;working=story.initialWork>.15;}
  else{path=story.response>0?p.toField:p.visit;amount=story.response>0?story.response:storyEase(f.progress,0,.32);position=path.getPoint(amount);position.y=0;position.x+=i*.30+story.response*(i===0?.55:-.90);position.z+=story.response*(.25+i*.15);walking=amount>.001&&amount<.999;working=story.response>=.99;}
  actor.root.position.copy(position);
  const tangent=path.getTangent(Math.min(.999,amount));actor.root.rotation.y=walking?Math.atan2(tangent.x,tangent.z):working?.20:-.35+i*.50;
  actor.pose(walking?'walk':working?'work':'watch',clock,i*.45);actor.hips.rotation.x=working?.15:0;
  if(inspecting){actor.hips.rotation.x=0;for(const limb of actor.limbs){limb.arm.rotation.set(0,0,limb.side*.055);limb.elbow.rotation.set(0,0,0);limb.hand.rotation.set(0,0,0);}actor.head.rotation.set(0,0,0);}
  const target=position.clone().add(working?new THREE.Vector3(0,.22,.38):walking?tangent.clone().multiplyScalar(.6).add(new THREE.Vector3(0,.8,0)):new THREE.Vector3(i===0?.5:-.5,.85,0));
  actor.applyPerformance({dt,time:clock,target:g.localToWorld(target),expression:working?'focused':'attentive',acknowledge:f.stage.id==='flow'&&story.response>.001&&story.response<.1?.7:0});
  if(working&&i===1){const w=periodWorkerFrame(clock,3),lift=(.82-w.lower)/.62,tool=p.residentTool;tool.visible=true;tool.position.set(position.x-.07,.52+.24*lift,position.z+.35);tool.rotation.set(.18+lift*.40,0,0);actor.hips.rotation.x=w.lean;for(const [side,y]of [['left',.16],['right',-.04]])actor.reach(tool.localToWorld(new THREE.Vector3(0,y,0)),{side,weight:1});}
  else if(working){actor.hips.rotation.x=.18;actor.reach(g.localToWorld(position.clone().add(new THREE.Vector3(.10,.44,.27))),{side:'right',weight:.8});}
 });
 p.workers.forEach((actor,i)=>{
  actor.root.visible=f.stage.id!=='settle';p.tools[i].visible=f.working&&f.trench>0;
  const cut=c.trench[Math.max(0,Math.min(c.trench.length-1,Math.floor(f.trench*(c.trench.length-1))-i*5))],yaw=cut.rotation.y;
  const nx=Math.cos(yaw),nz=-Math.sin(yaw),x=cut.position.x,z=cut.position.z;
  const cultivating=!f.working&&story.response>=.99;
  actor.root.position.set(f.working?x+.50*nx:-2.70+i*.85,0,f.working?z+.50*nz:1.10+story.response*.86);actor.root.rotation.y=f.working?yaw-Math.PI/2:.12;
  actor.pose(f.working||cultivating?'work':story.response>0&&story.response<.99?'walk':'watch',clock,i*.6);
  const w=periodWorkerFrame(clock,i),tool=p.tools[i];
  // A world-space handle stays between both hands, and its blade reaches the soil.
  const lift=(.82-w.lower)/.62;
  tool.position.set(x+.12*nx,.59+.28*lift,z+.12*nz);tool.rotation.set(.18+lift*.50,yaw-Math.PI/2,0);
  actor.hips.rotation.x=f.working||cultivating?w.lean:0;
  if(cultivating){tool.visible=true;tool.position.set(actor.root.position.x-.12,.59+.28*lift,actor.root.position.z+.40);tool.rotation.set(.18+lift*.50,0,0);}
  actor.applyPerformance({dt,time:clock,target:g.localToWorld(new THREE.Vector3(f.working?x:-2.0,.14,f.working?z:1.8)),expression:f.working?'focused':'attentive'});
  if(f.working&&f.trench>0||cultivating){
   for(const [side,y]of [['left',.22],['right',.03]])actor.reach(tool.localToWorld(new THREE.Vector3(0,y,0)),{side,weight:1});
  }
 });
 viewport.dataset.settlementPeriodDetail='traditional-form-reference';viewport.dataset.settlementWorkerContact=String(f.working&&p.workers.some((a,i)=>periodWorkerFrame(clock,i).contact));
 viewport.dataset.settlementRoof='sloping';viewport.dataset.settlementClothing='robe-belt-round-cap-boots';
 viewport.dataset.settlementStoryBeat=story.phaseKey;viewport.dataset.settlementResidentResponse=story.response.toFixed(3);viewport.dataset.settlementInitialWork=story.initialWork.toFixed(3);
}
