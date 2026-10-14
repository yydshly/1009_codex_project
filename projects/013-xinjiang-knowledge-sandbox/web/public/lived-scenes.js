import * as THREE from 'three';
import {decorateMarketLinkage,updateMarketLinkage} from './market-linkage.js';
import {decorateSettlement,animateSettlement} from './settlement-chronology-scene.js';
import {carryFor} from './journey-memory.js';
import {entryInfluence} from './choice-influence.js';
import {waterCamera} from './early-chain.js';
import {createActor} from './actor-rig.js';
import {performCharacters} from './character-performance.js';
import {makeStoryThread} from './story-thread.js';
import {responseCamera} from './performance-motion.js';
import {surfaceMaterial} from './surface.js';
import {decorateAtmosphere,animateAtmosphere} from './lived-atmosphere.js';
import {decorateEcology,animateEcology,leafyCrown} from './scene-ecology.js';
import {decorateNeighborhood,animateNeighborhood} from './scene-neighborhood.js';
import {softBoxGeometry} from './soft-box.js';
import {createWaterStory,animateWaterStory,waterPlans} from './water-story.js';
import { stagedCues, sceneInfo, migrationProgress, cargoPose } from './lived-model.js';
import { sources } from './connections.js';
import { exchangeFrame,caravanPose,cultureFrame,initialCargo,advanceCargo,observationRows } from './lived-process.js';
import {stageOrigins,stageOrder,worldPose} from './continuity.js';
import {decorateWorld,animateOutcome} from './lived-detail.js';
import {decorateSocial,animateSocial,SOCIAL_FOCUS} from './social-depth.js';
import {socialDialogue,civicAutoFrame,civicPlans,dialogueClips} from './social-model.js';
import {mountSocialControls,refreshSocialControls} from './social-controls.js';
import {decisionScenes,decisionFrame,mountDecisionUI,updateDecisionUI} from './scene-decisions.js';

// Original small stage worlds. The same articulated models are used in play and capture.
export function installLivedScenes(scene,{onTakeControl,onFocus,viewport,terrainSource,onSound=()=>{},onDialogue=()=>{},onWaterChoice=()=>{},onWaterContinue=()=>{},needsWaterChoice=()=>false,onStoryChoice=()=>{},onStoryContinue=()=>{}}){
 const boxGeo=softBoxGeometry(),ballGeo=new THREE.SphereGeometry(1,28,20),leafGeo=new THREE.IcosahedronGeometry(1,2);
 const cylinderGeo=new THREE.CylinderGeometry(1,1,1,18),materials=new Map(),worlds=new Map();let treeSerial=0;
 const actors=[],editorialSigns=[],workspaceInitialized=new Set();let speechPan=0;
 const panel=document.getElementById('lived-controls'),pinHost=document.getElementById('lived-pins');
 let current,config,focused,clock=0,manualProgress=null,settlementApproach=null,beatHit=-100,learnt=0,isWorkbench=false;
 let settlementChronology=null;
 let settings={goods:0,culture:'ensemble',coordination:true,green:20,priority:'water',memory:'letter',tradition:'twelve',civicPlan:'balanced',civicVoice:'resident'};
 let dialogue=null,manualDialogue=null,lastElapsed=0,lastPlaying=false;
 let decision=null,decisionUI=null,decisionOutcome=null,incomingAttention=null;
 let waterPlan=null,waterSelectedAt=0,waterManual=false,waterSpoken=false,waterOutcome=null,manualCivic=false,manualTradition=false,manualCulture=false;
 const speech=document.createElement('div');speech.className='social-dialogue';speech.hidden=true;speech.setAttribute('role','status');viewport.append(speech);
 let projectedPins=[],signature='',previousStage='';
 const ledger={};let transferStart=0,transferSerial=0,lastDelivery='',transferManual=false,transferRecorded=true,transferDeliveries=0;
 let deliveryAt=-1,choiceAt=0,outcome=null;let connecting=null;const links=new Map();
 const mat=(color,roughness=.85)=>{const key=`${color}/${roughness}`;if(!materials.has(key))materials.set(key,surfaceMaterial(color,{roughness},'plaster'));return materials.get(key);};
 const solid=(parent,geometry,color,position=[0,0,0],scale=[1,1,1])=>{const m=new THREE.Mesh(geometry,typeof color==='number'?mat(color):color);m.position.set(...position);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const box=(p,c,pos,size)=>solid(p,boxGeo,c,pos,size);
 const ball=(p,c,pos,size)=>solid(p,ballGeo,c,pos,size);
 const cylinder=(p,c,pos,size)=>solid(p,cylinderGeo,c,pos,size);
 const subgroup=(parent,pos=[0,0,0])=>{const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;};
 function textSign(parent,title,subtitle,position,width=2.6,color='#0e3b40'){
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=160;
  const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,640,160);ctx.strokeStyle='#b3d0b0';ctx.strokeRect(7,7,626,146);
  ctx.textAlign='center';ctx.fillStyle='#edf1d7';ctx.font=(/伊犁河水源|后建大渠|新增耕地|初期支流灌溉/.test(title)?'60px':'42px')+' "Microsoft YaHei"';ctx.fillText(title,320,69);
  ctx.fillStyle='#b6c8b7';ctx.font='24px "Microsoft YaHei"';ctx.fillText(subtitle,320,118);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));m.position.set(...position);parent.add(m);m.userData.editorialSign=true;m.userData.keepSign=['织物','补给','工艺'].includes(title);editorialSigns.push(m);m.visible=m.userData.keepSign;if(m.visible){m.scale.setScalar(.68);m.position.y-=.42;}return m;
 }
 function base(name,color=0xd6bd91){
  const g=new THREE.Group();g.visible=false;g.position.x=stageOrigins[name];scene.add(g);worlds.set(name,g);
  box(g,0x263a3c,[0,-.23,0],[14.4,.35,8.5]).userData.displayFoundation=true;box(g,color,[0,-.015,0],[14.25,.08,8.4]).name='living-ground';
  for(let i=0;i<19;i++)box(g,0x826d58,[-6.9+i*.77,-.13,4.22],[.04,.21,.018]).userData.displayFoundation=true;
  return g;
 }
 function tree(parent,x,z,height=1.8){
  const g=subgroup(parent,[x,0,z]),wood=surfaceMaterial(0x735537,{roughness:1},'wood');
  cylinder(g,wood,[0,height*.36,0],[.065,height*.72,.065]);
  for(let i=0;i<5;i++){const angle=i*2.4,branch=cylinder(g,wood,[Math.sin(angle)*.16,height*(.56+i*.047),Math.cos(angle)*.16],[.022,.56,.022]);branch.rotation.set(Math.cos(angle)*.68,0,-Math.sin(angle)*.68);}
  leafyCrown(g,height,++treeSerial*701);return g;
 }
 function house(parent,x,z,color=0xcbb287,scale=1){
  const g=subgroup(parent,[x,0,z]);g.scale.setScalar(scale);
  box(g,color,[0,.66,0],[1.55,1.32,1.24]);box(g,0xead6b3,[0,1.36,0],[1.7,.14,1.4]);
  box(g,0x36514b,[0,.42,.63],[.39,.84,.02]);box(g,0x192e30,[-.5,.8,.63],[.28,.37,.02]);box(g,0x192e30,[.5,.8,.63],[.28,.37,.02]);
  for(let i=0;i<5;i++)box(g,0x856b49,[-.72+i*.36,1.5,0],[.1,.19,1.25]);
  const wood=surfaceMaterial(0x856b49,{roughness:1},'wood');
  for(const side of [-1,1]){
   box(g,wood,[side*.22,.43,.65],[.043,.86,.045]);
   for(const x of [-.5,.5])box(g,wood,[x+side*.15,.8,.653],[.024,.41,.027]);
   box(g,0xa7906b,[side*.64,.14,.648],[.29,.13,.042]);
  }
  box(g,wood,[0,.875,.65],[.48,.04,.045]);box(g,0xbda580,[0,.057,.79],[.62,.07,.34]);
  for(const x of [-.5,.5])for(const y of [.60,.8,1])box(g,wood,[x,y,.653],[.31,.022,.027]);
  box(g,0x7d765d,[0,.17,.64],[1.54,.045,.03]);return g;
 }
 function arch(parent,x,z,width=2.1){
  const g=subgroup(parent,[x,0,z]);box(g,0xc09c70,[-width*.45,1.1,0],[.32,2.2,.32]);box(g,0xc09c70,[width*.45,1.1,0],[.32,2.2,.32]);
  const curve=new THREE.EllipseCurve(0,1.9,width*.45,.65,0,Math.PI,false,0),points=curve.getPoints(32).map(p=>new THREE.Vector3(p.x,p.y,0));
  solid(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.16,8,false),0xd5b487);
  for(let i=0;i<7;i++)box(g,0x477e80,[-width*.39+i*width*.13,2.48,0],[width*.11,.08,.36]);return g;
 }
 function rug(parent,x,z,width=2.5,depth=1.5){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#6a3737';c.fillRect(0,0,256,128);
  for(let i=0;i<7;i++){c.strokeStyle=i%2?'#b87a58':'#d8bd83';c.strokeRect(8+i*3,8+i*3,240-i*6,112-i*6);}
  for(let x0=48;x0<230;x0+=48){c.fillStyle='#294e54';c.beginPath();c.moveTo(x0,35);c.lineTo(x0+20,64);c.lineTo(x0,93);c.lineTo(x0-20,64);c.fill();}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  box(parent,new THREE.MeshStandardMaterial({map:texture,roughness:1}),[x,.05,z],[width,.015,depth]);
 }
 function human(parent,color=0x577f79,scale=1,instrument){const actor=createActor(parent,color,scale,instrument,{subgroup,box,ball,cylinder});actors.push(actor);return actor;}
 function camel(parent){
  const g=subgroup(parent);ball(g,0xa77c48,[0,.73,0],[.66,.32,.27]);ball(g,0xb08450,[-.19,1.03,0],[.2,.28,.23]);ball(g,0xb08450,[.2,1.03,0],[.2,.28,.23]);
  cylinder(g,0xa77c48,[.53,1.04,0],[.11,.7,.1]).rotation.z=-.35;ball(g,0xb48a53,[.72,1.38,0],[.26,.13,.11]);
  ball(g,0x29302a,[.79,1.43,.09],[.018,.018,.018]);box(g,0x42716a,[-.04,1.22,0],[.67,.1,.53]);
  for(const side of [-1,1])box(g,0xb4663e,[0,.99,side*.31],[.49,.38,.2]);
  const legs=[];for(const x of [-.43,.4])for(const z of [-.19,.19]){const leg=subgroup(g,[x,.65,z]);cylinder(leg,0x785a38,[0,-.3,0],[.045,.6,.045]);legs.push(leg);}return {root:g,legs};
 }
 function packets(parent,x,z,color,count=6){const g=subgroup(parent,[x,.03,z]);for(let i=0;i<count;i++)box(g,color,[i%3*.27-.27,Math.floor(i/3)*.19+.1,0],[.24,.18,.32]);return g;}
 function channel(parent,from,to){
  const delta=new THREE.Vector3(...to).sub(new THREE.Vector3(...from)),length=delta.length(),g=subgroup(parent,new THREE.Vector3(...from).add(new THREE.Vector3(...to)).multiplyScalar(.5).toArray());
  g.rotation.y=Math.atan2(delta.x,delta.z);box(g,0x597d79,[0,.045,0],[.38,.075,length]);box(g,0x72aaa4,[0,.09,0],[.25,.018,length]);
 }
 function makeMarket(){
  const g=base('market');const actors=[],caravans=[],cargo=[],receipts=[];
  box(g,0xb9a079,[0,.028,.6],[12.2,.04,2.4]);channel(g,[-6,.06,2.15],[6,.06,2.15]);
  for(const [i,x] of [-3.7,0,3.7].entries()){
   house(g,x,-2.8,[0xcbb287,0xc4a575,0xb89b79][i],1.2);arch(g,x,-1.45,2.3);
   const stall=subgroup(g,[x,0,-.82]);box(stall,0x9a7050,[0,.41,0],[2,.82,.7]);
   for(const side of [-1,1])cylinder(stall,0x6d5842,[side*.99,1.18,0],[.042,1.6,.042]);
   box(stall,[0xb06443,0x3e7c81,0x7c8152][i],[0,1.83,0],[2.25,.07,1.1]).name='legacy-stall-roof';
   if(i===0)for(let j=0;j<5;j++)cylinder(stall,[0xcf9d58,0x346a72,0xb7674e][j%3],[-.76+j*.38,.9,0],[.13,.43,.13]).rotation.z=Math.PI/2;
   if(i===1)for(let j=0;j<14;j++)ball(stall,[0xc88c3b,0x799b4d,0xb45031][j%3],[-.8+(j%7)*.25,.89+Math.floor(j/7)*.09,0],[.09,.095,.09]);
   if(i===2)for(let j=0;j<5;j++)ball(stall,0xbb8060,[-.75+j*.36,1,0],[.12,.22,.12]);
   const vendor=human(g,[0x817c50,0x627b76,0xa07565][i]);vendor.root.position.set(x,0,-1.3);actors.push(vendor);textSign(g,['织物','补给','工艺'][i],'绿洲集市 · 创作场景',[x,2.77,-1.5],2.35);
   const batch=packets(g,x+.53,.15,[0xb87455,0xa7ac5d,0x528f98][i]);cargo.push(batch);
   const received=box(g,[0xb87455,0xa7ac5d,0x528f98][i],[x,.95,-.67],[.4,.3,.27]);received.visible=false;receipts.push(received);
  }
  for(let i=0;i<3;i++){const c=camel(g);c.root.scale.setScalar(.77);caravans.push(c);const person=human(g,0x506c79,.9);actors.push(person);}
  for(let i=0;i<4;i++){const a=human(g,[0xae8061,0x688687,0x6d7351,0x7c677b][i],.92);a.root.position.set(-1.6+i*1.05,0,.2+(i%2)*.48);actors.push(a);}
  tree(g,-6,-2);tree(g,6,-2);rug(g,0,0,2.4,1.2);
  const carrier=human(g,0x627c72);const carried=box(carrier.root,0xc79957,[0,.63,.39],[.4,.3,.27]);actors.push(carrier);
  for(let i=0;i<24;i++)box(g,0x998b71,[-5.6+(i%12),.02,-.25+Math.floor(i/12)*.75],[.014,.015,.58]);
  g.userData={actors,caravans,cargo,carrier,carried,receipts,linkage:decorateMarketLinkage(g)};decorateWorld('market',g,helpers);decorateAtmosphere('market',g,helpers);return g;
 }
 function makePeople(){
  const g=base('people',0xb6c09b),families=[],houses=[],crops=[],workers=[],workerTools=[],water=[];
  box(g,0xcdb98d,[0,.03,1.6],[13,.055,1.55]);channel(g,[0,.06,-1],[6.2,.06,-1]);
  const pavilion=subgroup(g,[-5.1,0,-1.3]);box(pavilion,0xa4967d,[0,.5,0],[2,1,1.5]);box(pavilion,0x665748,[0,1.2,0],[2.5,.28,2]);const entryArch=arch(g,-4.3,.2,1.7);
  const official=human(g,0x536475);official.root.position.set(-5,0,.55);
  const scroll=subgroup(g,[-4.2,1.05,.65]);box(scroll,0xefe0b9,[0,0,0],[.73,.035,.44]);cylinder(scroll,0xaa4141,[0,.029,0],[.09,.02,.09]);
  textSign(g,'1764 · 调遣与启程','盛京一带 → 伊犁方向',[-4.45,2.88,-.1],3.1);
  for(let i=0;i<3;i++){
   const family=subgroup(g),rigs=[human(family,[0x667d77,0x84705b,0x637182][i]),human(family,[0xb18066,0x79905e,0x997679][i],.94),human(family,0x648e98,.62)];
   rigs[0].root.position.set(-.31,0,0);rigs[1].root.position.set(.31,0,.07);rigs[2].root.position.set(.03,0,.62);
   box(family,0xb89767,[-.35,.72,-.17],[.35,.42,.17]);families.push({group:family,rigs,index:i});
  }
  for(const [x,z] of [[3.4,-2.5],[5.5,-2.15],[4.8,.2]])houses.push(house(g,x,z,0xc9b58b,.95));
  for(let i=0;i<20;i++){const plant=subgroup(g,[1.5+(i%5)*.47,0,-2.35+Math.floor(i/5)*.33]);cylinder(plant,0x779345,[0,.18,0],[.025,.36,.025]);ball(plant,0xb8b56c,[0,.36,0],[.075,.11,.04]);crops.push(plant);}
  tree(g,6.25,-3,2);tree(g,1.35,-3.3,2);textSign(g,'抵达 · 聚落与生产','1765抵达伊犁，后续生活继续展开',[4.5,2.75,-1.8],3.65);
  const furrows=[];for(let i=0;i<5;i++)furrows.push(box(g,0x7e7953,[1.45+i*.47,.02,-1.85],[.1,.028,1.4]));
  const path=new THREE.CatmullRomCurve3([[-4.6,0,.8],[-2.4,0,1.1],[0,0,.45],[1.8,0,.8],[2.8,0,3.1],[4.35,0,3.05]].map(p=>new THREE.Vector3(...p)));
  for(let i=0;i<28;i++){const p=path.getPoint(i/27);for(const side of [-1,1]){const step=box(g,0x8e8f6f,[p.x,.064,p.z+side*.11],[.09,.015,.15]);step.rotation.y=.4;}}
  channel(g,[2.3,.06,-1],[2.3,.06,-2.9]);
  for(let i=0;i<6;i++){const bead=ball(g,new THREE.MeshBasicMaterial({color:0xc7e8d7}),[0,0,0],[.037,.012,.037]);water.push(bead);}
  for(let i=0;i<2;i++){const a=human(g,[0x7b8161,0xa57b60][i],.78);workers.push(a);const tool=subgroup(a.root,[.20,.51,.30]);box(tool,0x776a4f,[0,-.17,0],[.025,.68,.035]);box(tool,0x657477,[0,-.5,0],[.17,.035,.09]);tool.rotation.z=-.16;workerTools.push(tool);}
  g.userData={families,houses,crops,official,scroll,pavilion,entryArch,furrows,path,workers,workerTools,water};g.userData.chronology=decorateSettlement(g,helpers);decorateWorld('people',g,helpers);decorateSocial('people',g,helpers);decorateAtmosphere('people',g,helpers);return g;
 }
 function makeCulture(){
  const g=base('culture',0xc2aa85),actors=[],rings=[];
  box(g,0xc5aa84,[0,.025,0],[10.8,.025,6.6]);
  for(const x of [-4.8,-2.4,0,2.4,4.8])arch(g,x,-2.6,2.15);
  box(g,0xccb08b,[0,1.1,-3.25],[12.4,2.2,.32]);
  for(const x of [-5.9,5.9])box(g,0xd1b88f,[x,.85,-.65],[.22,1.7,5]);
  for(let i=0;i<15;i++)box(g,0x397078,[-5.4+i*.77,2.4,-3.05],[.47,.17,.04]);
  rug(g,-2,-.9,4,2.1);rug(g,2,-.9,3,2.1);tree(g,4.6,1.8,2.25);tree(g,-4.7,1.5,1.9);
  const locations=[[-2.8,-.75,'string'],[-1.35,-.75,'drum'],[.25,-.8,'string'],[2,-.7,null],[-1.2,1.05,null],[.3,1.4,null],[1.7,1.05,null]];
  for(const [i,[x,z,instrument]] of locations.entries()){
   const actor=human(g,[0xa76854,0x678c85,0x76754e,0x526f80,0xb87c62,0x648e79,0xa58e5d][i],i>3?.94:1,instrument);actor.root.position.set(x,0,z);actors.push(actor);
   const ring=solid(g,new THREE.TorusGeometry(.34,.018,6,32),new THREE.MeshBasicMaterial({color:i>3?0xe1b86b:0x99dad1}),[x,.07,z]);ring.rotation.x=-Math.PI/2;rings.push(ring);
  }
  const learner=human(g,0xb0a463,.73,'string');learner.root.position.set(-3.5,0,1.4);actors.push(learner);
  const learnerRing=solid(g,new THREE.TorusGeometry(.27,.018,6,32),new THREE.MeshBasicMaterial({color:0xe1b86b}),[-3.5,.07,1.4]);learnerRing.rotation.x=-Math.PI/2;rings.push(learnerRing);
  const pulseGeo=new THREE.TorusGeometry(.1,.018,6,32),waves=[];
  for(let i=0;i<4;i++){const wave=solid(g,pulseGeo,new THREE.MeshBasicMaterial({color:0xbfe0c5,transparent:true,opacity:.7,depthWrite:false}),[-1.3,1.3,-.7]);waves.push(wave);}
  textSign(g,'歌 · 舞 · 音乐','木卡姆主题的原创传习庭院',[0,3.08,-2.6],4.2);
  g.userData={actors,rings,waves,learner};decorateWorld('culture',g,helpers);decorateSocial('culture',g,helpers);decorateAtmosphere('culture',g,helpers);return g;
 }
 function container(parent,color,position,scale=1){
  const g=subgroup(parent,position);g.scale.setScalar(scale);box(g,color,[0,.24,0],[.84,.48,.46]);
  for(let i=0;i<6;i++)box(g,0x263c3e,[-.35+i*.14,.24,.235],[.014,.43,.009]);return g;
 }
 function truck(parent,index){
  const g=subgroup(parent);box(g,0x384e51,[0,.26,0],[.98,.09,.43]);box(g,[0x5c9191,0xaeb98a,0xc39562][index%3],[.39,.47,0],[.3,.35,.46]);box(g,0x163a44,[.48,.57,.237],[.14,.13,.012]);
  container(g,[0x986c50,0x42717a,0x869057][index%3],[-.19,.3,0],.9);
  for(const x of [-.37,.39])for(const z of [-.25,.25]){const wheel=cylinder(g,0x203235,[x,.19,z],[.11,.07,.11]);wheel.rotation.x=Math.PI/2;}
  return g;
 }
 function factory(parent,x,z,color=0xb7b9a8){
  const g=subgroup(parent,[x,0,z]);box(g,color,[0,.75,0],[2.55,1.5,1.5]);
  for(const side of [-1,1])box(g,0x3d6570,[side*.68,1.63,0],[1.48,.11,1.75]).rotation.z=side*-.21;
  for(let i=0;i<4;i++)box(g,0x213f49,[-.89+i*.59,1,.76],[.38,.35,.015]);
  box(g,0x4a5550,[0,.37,.76],[.64,.74,.02]);return g;
 }
 function makeLogistics(){
  const g=base('logistics',0xc2c9b8),trucks=[],greenTrees=[],conveyor=[];
  box(g,0x4c6262,[0,.036,2.05],[13.7,.05,1.65]);for(let i=0;i<24;i++)box(g,0xc8d4bd,[-6.6+i*.57,.069,2.08],[.28,.012,.032]);
  for(const x of [-4.8,0,4.8])box(g,0x799492,[x,.06,-.65],[3.5,.08,3.9]);
  factory(g,-4.8,-1.55);factory(g,0,-1.35,0xcec4a6);
  const crane=subgroup(g,[4.9,0,-.55]);for(const side of [-1,1])box(crane,0xc4a869,[side*1.16,1.5,0],[.12,3,.17]);box(crane,0xc4a869,[0,3.05,0],[2.64,.16,.23]);
  const hoist=subgroup(crane,[0,2.82,0]);box(hoist,0x45595c,[0,0,0],[.31,.16,.32]);box(hoist,0x76877f,[0,-.67,0],[.018,1.2,.018]);container(hoist,0x839467,[0,-1.5,0]);
  for(let i=0;i<9;i++)container(g,[0x547f87,0x927353,0x8c9463][i%3],[3.6+(i%3)*.83,.14+Math.floor(i/3)*.49,-1.8]);
  for(let i=0;i<5;i++)container(g,0xa3a274,[-5.8+i*.56,.16,.08],.65);
  for(let i=0;i<9;i++)trucks.push(truck(g,i));
  const barrier=subgroup(g,[3.75,.68,2]);box(barrier,0xdac989,[-.55,.07,0],[1.12,.08,.1]);box(g,0x899c8b,[3.75,.32,2],[.12,.64,.12]);
  const green=box(g,0x769358,[0,.09,-3.45],[13,.035,1.25]);for(let i=0;i<12;i++)greenTrees.push(tree(g,-6+i*1.06,-3.38,1.2+(i%3)*.1));
  const infoLines=[];for(const x of [-4.8,0,4.8]){
   const points=[new THREE.Vector3(x,1.1,-1.7),new THREE.Vector3(x,3.2,0),new THREE.Vector3(2.5,1.4,1.9)];
   const curve=new THREE.CatmullRomCurve3(points),line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),new THREE.LineBasicMaterial({color:0xa6e1d6,transparent:true,opacity:.65}));g.add(line);
   const bead=ball(g,new THREE.MeshBasicMaterial({color:0xc6f5d8}),[0,0,0],[.055,.055,.055]);infoLines.push({line,bead,curve});
  }
  textSign(g,'乌鲁木齐','贸易 / 物流 / 制造',[-4.8,2.85,-1.25],3.3);
  textSign(g,'喀什','加工 / 集散 / 电商',[0,2.85,-1.25],3.3);
  textSign(g,'霍尔果斯','跨境物流 / 服务',[4.8,3.6,-.6],3.3);
  const serviceSign=textSign(g,'服务关口','信息协作的教学试验',[4.9,1.7,1.1],1.8);
  box(g,0x405c58,[-4.65,.37,.05],[2.6,.12,.5]);for(let i=0;i<8;i++)cylinder(g,0x9aaa8e,[-5.75+i*.31,.41,.05],[.028,.48,.028]).rotation.x=Math.PI/2;
  for(let i=0;i<3;i++)conveyor.push(box(g,0xba986d,[0,.58,.05],[.27,.24,.27]));
  g.userData={trucks,barrier,hoist,green,greenTrees,infoLines,serviceSign,conveyor};decorateWorld('logistics',g,helpers);decorateSocial('logistics',g,helpers);decorateAtmosphere('logistics',g,helpers);return g;
 }
 const helpers={box,ball,cylinder,subgroup,solid,human,tree,rug,textSign};
 const thread=makeStoryThread(scene,helpers);
 function makeNature(){
  const g=base('nature',0xa6aa86),source=terrainSource(),land=subgroup(g,[0,.09,0]);land.scale.setScalar(.65);
  const copies=source.children.map(child=>{const copy=child.clone(true);land.add(copy);return {source:child,copy};});
  textSign(g,'山水 · 绿洲 · 道路','真实区域地形，进入生活的线索',[0,3,-2.5],4.5);
  g.userData={copies};decorateWorld('nature',g,helpers);return g;
 }
 function makeLink(from,to){
  const start=stageOrigins[from]+7.2,end=stageOrigins[to]-7.2,g=new THREE.Group();scene.add(g);
  box(g,0x293e3e,[(start+end)/2,-.36,0],[end-start,.65,8.5]);box(g,0xadae8b,[(start+end)/2,-.015,0],[end-start,.08,8.4]);
  const color=from==='nature'?0x8cd6cd:from==='market'?0xd9c194:from==='people'?0xd8bc83:0x9fd4c6;
  const curve=new THREE.CatmullRomCurve3([[start,.13,2.15],[(start+end)/2,.2,1.7],[end,.13,1.6]].map(p=>new THREE.Vector3(...p)));
  solid(g,new THREE.TubeGeometry(curve,40,.035,6,false),new THREE.MeshBasicMaterial({color}));
  const beads=Array.from({length:5},()=>ball(g,new THREE.MeshBasicMaterial({color:0xe8edcc}),[0,0,0],[.06,.04,.06]));
  for(let i=0;i<18;i++){const p=curve.getPoint(i/17);for(const side of [-1,1])box(g,color,[p.x,.07,p.z+side*.18],[.1,.015,.16]);}
  g.visible=false;const link={g,curve,beads,from,to};links.set(from,link);return link;
 }
 function animateNeighbor(name,t){
  const d=worlds.get(name).userData;
  if(name==='oasis')animateWaterStory(worlds.get('oasis'),{clock:t,plan:waterPlan??'home',selectedAt:waterSelectedAt,viewport});
  if(name==='nature')for(const {source,copy} of d.copies){copy.position.copy(source.position);copy.quaternion.copy(source.quaternion);copy.visible=source.visible;}
  if(name==='market'){d.actors.forEach((a,i)=>a.pose('idle',t,i));for(const [i,c] of d.caravans.entries()){const p=caravanPose(t/45+i/3);c.root.position.set(p.x,0,p.z);c.root.rotation.y=p.yaw;c.legs.forEach((leg,j)=>leg.rotation.z=Math.sin(t*3+j*Math.PI/2)*.28);const guide=d.actors[3+i];guide.root.position.set(p.x-.95*Math.cos(p.yaw),0,p.z+.95*Math.sin(p.yaw));guide.root.rotation.y=p.yaw+Math.PI/2;guide.pose('walk',t,i);}}
  if(name==='people'){
   d.families.forEach(({group,rigs,index})=>{if(config.overview){group.position.set(4.35,0,3.05+index*.55);group.rotation.y=0;}rigs.forEach(a=>a.pose('greet',t));});
   if(config.overview){d.houses.forEach(h=>h.scale.y=.95);d.crops.forEach(c=>c.scale.y=1);d.workers.forEach((a,i)=>{a.root.visible=true;a.root.scale.setScalar(.78);a.root.position.set(1.3+i*2,0,-2.6);});d.water.forEach(b=>b.visible=true);}
   d.workers.forEach((a,i)=>a.pose('play',t*.45,i));d.water.forEach((b,i)=>b.position.z=-1-((t*.32+i/6)%1)*1.9);
  }
  if(name==='culture'){d.actors.forEach((a,i)=>a.pose(i<4?'play':i<7?'dance':'idle',t,i*.25));d.rings.forEach((r,i)=>r.scale.setScalar(1+(Math.sin(t*7.85-i*.3)+1)*.1));}
 }
 function updateDeparting(dt){
  if(!connecting)return;connecting.clock+=dt;animateNeighbor(connecting.from,connecting.clock);
 }
 function makeOasis(){const g=base('oasis',0xbda882);createWaterStory(g,helpers,terrainSource);decorateAtmosphere('oasis',g,helpers);return g;}
 const builders=Object.fromEntries(Object.entries({oasis:makeOasis,nature:makeNature,market:makeMarket,people:makePeople,culture:makeCulture,logistics:makeLogistics}).map(([name,build])=>[name,()=>{const g=build();decorateEcology(name,g,helpers);decorateNeighborhood(name,g,helpers);return g;}]));
 const focusPoses={market:{position:[-2.35,2.4,6.4],target:[-.2,.80,-.05]},people:{position:[6.35,2.6,7.9],target:[4.3,.75,2.1]},culture:{position:[-3.8,2.7,6.7],target:[-1.25,.85,1.7]},logistics:{position:[-4.3,2.75,6.1],target:[-1.4,.72,.8]}};
 focusPoses.oasis={position:[4.65,1.9,5.55],target:[3.06,.8,2.22]};
 const waterFocus=()=>waterPlan==='field'?{position:[6.7,2.05,2.1],target:[4.4,.9,-1.6]}:focusPoses.oasis;
 focusPoses.nature={position:[-4,5,12],target:[1,.5,1]};
 // Arrive with all three market stalls visible; a choice then moves closer to
 // its recipient. The wider landing is distinct from the object interaction.
 const entryPoses={...focusPoses,market:{position:[.6,3.25,9.3],target:[0,.78,-.35]}};
 function activateControl(){onTakeControl();focused=null;}
 function socialPose(){
  if(config.stage==='oasis')return waterCamera(waterPlan,waterOutcome?.age??0,config.mode,lastElapsed);
  if(decision?.choice&&!config.overview){const near=focused??SOCIAL_FOCUS[config.stage]??focusPoses[config.stage];return responseCamera(config.stage,near,decisionOutcome?.age??0);}
  if(config.stage==='oasis'&&waterPlan)return responseCamera('oasis',waterFocus(),waterOutcome?.age??0);
  if(focused||(!lastPlaying&&!decision)||config.overview)return focused??config;
  if(incomingAttention&&decision&&!decision.choice){const near=incomingAttention.pose,t=THREE.MathUtils.smootherstep(lastElapsed,1.5,7);return {...config,camera:config.camera.map((v,i)=>THREE.MathUtils.lerp(v,near.position[i],t)),target:config.target.map((v,i)=>THREE.MathUtils.lerp(v,near.target[i],t))};}
  const near=config.stage==='oasis'&&waterPlan?waterFocus():decision?SOCIAL_FOCUS[config.stage]??focusPoses[config.stage]:current.id==='memory-arrival'?SOCIAL_FOCUS.people:current.id==='memory-practice'?SOCIAL_FOCUS.culture:current.id==='modern-rules'?SOCIAL_FOCUS.logistics:null;
  if(!near)return config;
  const start=config.stage==='oasis'?5:current.id==='modern-rules'?5:current.id==='memory-practice'?4:8;
  const t=THREE.MathUtils.smoothstep(lastElapsed,start,start+5);
  return {...config,camera:config.camera.map((v,i)=>THREE.MathUtils.lerp(v,near.position[i],t)),target:config.target.map((v,i)=>THREE.MathUtils.lerp(v,near.target[i],t))};
 }
 function recordObservation(){
  const prior=ledger[config.stage];
  if(config.stage==='oasis')ledger.oasis={plan:waterPlan??'home',replied:waterOutcome?.age>=9};
  else if(config.stage==='people')ledger.people={progress:Math.round((manualProgress??0)*100),priority:settings.priority,memory:settings.memory};
  else if(config.stage==='culture')ledger.culture={beats:learnt,tradition:settings.tradition};
  else if(config.stage==='logistics')ledger.logistics={coordinated:settings.coordination,green:settings.green,plan:settings.civicPlan,voice:settings.civicVoice};
  if(prior?.choice&&ledger[config.stage]){ledger[config.stage].choice=prior.choice;ledger[config.stage].manual=decision?.manual??true;}
 }
 function chooseGoods(value,manual=true,record=true){transferRecorded=record;transferDeliveries=0;deliveryAt=-1;worlds.get('market')?.userData.receipts.forEach(m=>m.visible=false);settings.goods=value;onSound('choice','market');transferStart=clock;transferSerial++;lastDelivery='';transferManual=manual;if(manual){if(record)ledger.market={goods:value,deliveries:0};const destination=[-3.7,0,3.7][value];focused={position:[destination+.7,3.4,4.4],target:[destination+.1,.95,.5]};onFocus();}refreshControls();}
 function chooseStory(id,manual=false,replayed=false){
  if(!decision)return;const choice=decision.def.choices.find(c=>c.id===id);if(!choice)return;
  if(manual||replayed)activateControl();decision.choice=id;decision.at=clock;decision.manual=manual;decision.replayed=replayed;decision.spoken=false;decision.counted=false;choiceAt=clock;
  if(config.stage==='market'){chooseGoods(choice.goods,false);transferManual=!replayed;ledger.market={goods:choice.goods,deliveries:0};const destination=[-3.7,0,3.7][choice.goods];focused={position:[destination+.7,3.4,4.4],target:[destination+.1,.95,.5]};onFocus();}
  else if(config.stage==='people'){settings.priority=choice.priority;settings.memory=choice.memory;manualProgress=1;const s=worlds.get('people').userData.social;s.previous.memory=choice.memory;s.times.memory=clock;}
  else if(config.stage==='culture'){settings.culture='learning';manualCulture=true;beatHit=clock;}
  else {const p=civicPlans[id];settings.civicPlan=id;settings.green=p.green;settings.coordination=p.coordination;manualCivic=true;const s=worlds.get('logistics').userData.social;s.previous.plan=id;s.times.plan=clock;}
  if(config.stage!=='market'){focused=SOCIAL_FOCUS[config.stage];onFocus();onSound('choice',config.stage);recordObservation();}
  if(ledger[config.stage]){ledger[config.stage].manual=manual;ledger[config.stage].choice=id;}refreshControls();onStoryChoice();
 }
 function continueDecision(){const f=decisionFrame(decision,clock);if(!f?.ready)return false;onStoryContinue(f.next);return true;}
 function restoreObservation(stage){
  const saved=ledger[stage];if(!saved||config?.stage!==stage)return;
  if(decision){const choice=decision.def.choices.find(c=>c.id===saved.choice||(stage==='market'?c.goods===saved.goods:stage==='people'?c.priority===saved.priority:false));if(choice){const retained={...saved};chooseStory(choice.id,saved.manual!==false,true);ledger[stage]=retained;}return;}
  if(stage==='oasis'){waterPlan=saved.plan;waterSelectedAt=clock;waterManual=true;waterSpoken=false;focused=waterFocus();onFocus();}
  else if(stage==='market'){chooseGoods(saved.goods,false);const destination=[-3.7,0,3.7][saved.goods];focused={position:[destination+.7,3.4,4.4],target:[destination+.1,.95,.5]};onFocus();}
  else if(stage==='people'){manualProgress=saved.progress/100;settings.priority=saved.priority??'water';settings.memory=saved.memory??'letter';choiceAt=clock;focused=focusPoses.people;onFocus();}
  else if(stage==='culture'){settings.culture='learning';learnt=saved.beats;settings.tradition=saved.tradition??'twelve';focused=SOCIAL_FOCUS.culture;onFocus();}
  else {settings.coordination=saved.coordinated;settings.green=saved.green;settings.civicPlan=saved.plan??'balanced';settings.civicVoice=saved.voice??'resident';focused=SOCIAL_FOCUS.logistics;onFocus();}
  refreshControls();
 }
 function mount(){
  panel.classList.remove('guided-scene');panel.classList.toggle('water-choice',config.stage==='oasis');decisionUI=null;
  const info=sceneInfo[config.stage],source=sources[info.source];
  panel.innerHTML=`<p class="demo-eyebrow">让故事在场景中发生</p><h2>${info.title}</h2><p id="lived-story-state" class="story-state" role="status"></p><div id="lived-inputs"></div><p id="lived-observation" role="status"></p><small>${info.scope}</small><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title} ↗</a>`;
  const inputs=panel.querySelector('#lived-inputs');
  if(config.stage==='oasis'){
   inputs.innerHTML='<div class="lived-button-row intro-choice"><button data-water-plan="home">先送到家里<small>看家人接水与孩子回应</small></button><button data-water-plan="field">先送到田里<small>看引水入垄与劳作回应</small></button></div><div class="water-progress"><span>家门前<meter id="water-home-meter" min="0" max="1" value="0">等待</meter></span><span>田垄间<meter id="water-field-meter" min="0" max="1" value="0">等待</meter></span></div><button id="water-continue" class="water-continue" disabled>看见回应后，沿水路继续 ↗</button><button id="lived-focus" hidden>走近第一道水</button>';
   inputs.querySelectorAll('[data-water-plan]').forEach(b=>b.addEventListener('click',()=>{activateControl();waterPlan=b.dataset.waterPlan;waterSelectedAt=clock;waterManual=true;waterSpoken=false;recordObservation();focused=waterFocus();onFocus();onSound('choice','oasis');onWaterChoice(waterPlan);refreshControls();}));
   inputs.querySelector('#water-continue').addEventListener('click',onWaterContinue);
  }else if(config.stage==='nature'){
   inputs.innerHTML='<p class="nature-thread">从山脊读来水，从绿洲读停留。接着沿线进入集市。</p><button id="lived-focus">沿道路走近 ↗</button>';
  }else if(config.stage==='market'){
   inputs.innerHTML='<div class="lived-button-row"><button data-good="0">织物</button><button data-good="1">补给</button><button data-good="2">工艺</button></div><button id="lived-focus">走近一次交换 ↗</button>';
   inputs.querySelectorAll('[data-good]').forEach(b=>b.addEventListener('click',()=>{activateControl();chooseGoods(Number(b.dataset.good));}));
  }else if(config.stage==='people'){
   inputs.innerHTML='<label>跟随家庭的进程 <output id="migration-live-value"></output><input id="migration-live" type="range" min="0" max="100" value="0" aria-label="家庭迁移与聚落进程"></label><div class="lived-button-row"><button id="dispatch-live">回看调遣与启程</button><button id="settle-live">看抵达后的生活</button></div><div class="lived-button-row"><button data-priority="water">先引水</button><button data-priority="home">先安顿</button></div><button id="lived-focus">走进聚落 ↗</button>';
   inputs.querySelectorAll('[data-priority]').forEach(b=>b.addEventListener('click',()=>choosePriority(b.dataset.priority)));
   inputs.querySelector('#migration-live').addEventListener('input',e=>{activateControl();settlementApproach=null;manualProgress=Number(e.target.value)/100;recordObservation();});
   inputs.querySelector('#dispatch-live').addEventListener('click',()=>{activateControl();settlementApproach=null;manualProgress=.04;recordObservation();refreshControls();});
   inputs.querySelector('#settle-live').addEventListener('click',()=>{activateControl();settlementApproach={from:manualProgress??Number(viewport.dataset.familyProgress??.84),at:clock};recordObservation();refreshControls();});
  }else if(config.stage==='culture'){
   inputs.innerHTML='<div class="lived-button-row"><button data-practice="ensemble">看合奏</button><button data-practice="learning">看传习</button></div><button id="join-beat">参与一拍 · 看学习者回应</button><button id="lived-focus">走近表演者 ↗</button>';
   inputs.querySelectorAll('[data-practice]').forEach(b=>b.addEventListener('click',()=>{activateControl();settings.culture=b.dataset.practice;manualCulture=true;refreshControls();}));
   inputs.querySelector('#join-beat').addEventListener('click',()=>{activateControl();settings.culture='learning';manualCulture=true;beatHit=clock;learnt++;focused=SOCIAL_FOCUS.culture;onFocus();onSound('response','culture');recordObservation();refreshControls();});
  }else{
   inputs.innerHTML='<label class="lived-switch"><input type="checkbox" id="service-live" checked>协同办理 · 看信息与车队变化</label><label>绿地保留 <output id="green-live-value"></output><input type="range" id="green-live" min="15" max="50" value="20" aria-label="物流场景绿地保留"></label><button id="lived-focus">观察服务关口 ↗</button>';
   inputs.querySelector('#service-live').addEventListener('change',e=>{activateControl();settings.coordination=e.target.checked;manualCivic=true;onSound('choice','logistics');recordObservation();refreshControls();});
   inputs.querySelector('#green-live').addEventListener('input',e=>{activateControl();settings.green=Number(e.target.value);manualCivic=true;recordObservation();refreshControls();});
  }
  if(['people','culture','logistics'].includes(config.stage))mountSocialControls(config.stage,inputs,{settings,choose(key,value){activateControl();settings[key]=value;if(['civicPlan','civicVoice'].includes(key))manualCivic=true;if(key==='tradition')manualTradition=true;if(key==='memory'){settlementApproach={from:manualProgress??Number(viewport.dataset.familyProgress??.84),at:clock};choiceAt=clock;}if(key==='civicPlan'){const plan=civicPlans[value];settings.green=plan.green;settings.coordination=plan.coordination;}focused=SOCIAL_FOCUS[config.stage];onFocus();onSound('choice',config.stage);recordObservation();refreshControls();},say(id){manualDialogue={id,at:clock};onDialogue(id);}});
  inputs.querySelector('#lived-focus').addEventListener('click',()=>{activateControl();focused=focusPoses[config.stage];onFocus();});
  pinHost.replaceChildren();projectedPins=[];
  const pinData={oasis:[],nature:[],market:[['商队与补给',[-4,1.6,1.2],()=>{settings.goods=1;}],['货物交换',[0,1.9,-.7],()=>{settings.goods=(settings.goods+1)%3;}]],people:[['跟随家庭',[0,1.5,1.2],()=>{manualProgress=.5;}],['抵达后的聚落',[4.5,2.4,-.8],()=>{manualProgress=1;}]],culture:[['合奏与歌舞',[.2,2.1,-.5],()=>{settings.culture='ensemble';}],['传习与回应',[-3,1.8,1.1],()=>{settings.culture='learning';beatHit=clock;learnt++;}]],logistics:[['信息协作',[0,3.7,-1],()=>{settings.coordination=!settings.coordination;}],['空间利用',[4.4,2,-2.7],()=>{settings.green=settings.green<35?45:20;}]]}[config.stage];
  for(const [title,position,action] of pinData){const b=document.createElement('button');b.textContent=title+' ↗';b.setAttribute('aria-label','场景互动：'+title);b.addEventListener('click',()=>{activateControl();action();if(config.stage==='market')chooseGoods(settings.goods);else recordObservation();refreshControls();});pinHost.append(b);projectedPins.push({position:new THREE.Vector3(...position),button:b});}
  if(decision){decisionUI=mountDecisionUI(panel,decision,{choose:chooseStory,continueStory:continueDecision});pinHost.replaceChildren();projectedPins=[];}
  refreshControls();
 }
 function refreshControls(){
  if(!config)return;
  refreshSocialControls(panel,config.stage,settings);
  panel.querySelectorAll('[data-water-plan]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.waterPlan===waterPlan)));
  panel.querySelectorAll('[data-priority]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.priority===settings.priority)));
  panel.querySelectorAll('[data-good]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.good)===settings.goods)));
  panel.querySelectorAll('[data-practice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.practice===settings.culture)));
  const coordination=panel.querySelector('#service-live');if(coordination)coordination.checked=settings.coordination;
  const green=panel.querySelector('#green-live');if(green)green.value=settings.green;
  const output=panel.querySelector('#green-live-value');if(output)output.textContent=settings.green+'% · 教学参数';
  if(manualProgress!==null&&panel.querySelector('#migration-live'))panel.querySelector('#migration-live').value=Math.round(manualProgress*100);
 }
 function setCue(cue,{connect=false,workbench=false}={}){
  isWorkbench=workbench;
  const departed=previousStage,departedClock=clock;connecting=null;for(const link of links.values())link.g.visible=false;
  decision=null;decisionOutcome=null;decisionUI=null;for(const name of ['decisionStage','decisionPhase','decisionChoice','decisionAge','decisionReady'])delete viewport.dataset[name];
  config=stagedCues[cue.id];current=cue;focused=null;manualProgress=null;settlementApproach=null;signature='';manualDialogue=null;dialogue=null;lastElapsed=0;lastPlaying=false;speech.hidden=true;incomingAttention=config&&!workbench?entryInfluence(config.stage,ledger):null;
  if(workbench){manualCivic=true;manualTradition=true;manualCulture=true;}
  if(workbench&&config&&!workspaceInitialized.has(config.stage)){resetWorkspace(config.stage);workspaceInitialized.add(config.stage);}
  for(const name of ['memoryChoice','memoryHandoff','tradition','socialLearning','civicVoice','civicPlan','civicBuffer','civicProposal','socialDetail'])delete viewport.dataset[name];
  for(const g of worlds.values())g.visible=false;projectedPins=[];pinHost.replaceChildren();
  if(!config){thread.hide();panel.hidden=true;delete viewport.dataset.stage;delete viewport.dataset.actorCount;viewport.dataset.visibleStages='';viewport.dataset.stageTransition='settled';previousStage='';return false;}
  if(!worlds.has(config.stage))builders[config.stage]();
  if(config.stage==='culture'&&!manualTradition)settings.tradition='hami';
  worlds.get(config.stage).visible=true;if(!manualCulture)settings.culture=config.mode==='learning'?'learning':'ensemble';if(!manualCivic){settings.coordination=config.mode!=='service';settings.green=['ecology','commons'].includes(config.mode)?45:20;}
  if(config.stage==='logistics'&&!manualCivic&&!config.retain){const auto=civicAutoFrame(cue,0);settings.civicVoice=auto.voice;settings.civicPlan=auto.plan;settings.green=civicPlans[auto.plan].green;settings.coordination=civicPlans[auto.plan].coordination;}
  if(connect){worlds.get(departed).visible=true;connecting={from:departed,to:config.stage,clock:departedClock};(links.get(departed)??makeLink(departed,config.stage)).g.visible=true;}
  if(config.overview){for(const name of stageOrder){if(!worlds.has(name))builders[name]();worlds.get(name).visible=true;}for(let i=0;i<stageOrder.length-1;i++)(links.get(stageOrder[i])??makeLink(stageOrder[i],stageOrder[i+1])).g.visible=true;}
  if(previousStage!==config.stage){clock=0;if(config.stage==='oasis'){waterSelectedAt=0;if(waterPlan)waterSelectedAt=-10;}if(config.stage==='logistics')worlds.get('logistics').userData.trucks.forEach((t,i)=>{t.userData.journey=initialCargo(i/9);t.userData.positioned=false;});}
  if(departed!==config.stage||cue.id==='exchange-goods'){transferStart=clock;transferManual=false;lastDelivery='';deliveryAt=-1;}
  choiceAt=clock;if(config.stage==='market'&&config.mode==='exchange')settings.goods=ledger.market?.goods??1;
  if(decisionScenes[cue.id]&&!workbench){
   const carry=carryFor(config.stage,ledger),baseDef=decisionScenes[cue.id];
   const choices=carry?[...baseDef.choices].sort((a,b)=>Number(b.id===carry.default)-Number(a.id===carry.default)):baseDef.choices;
   decision={def:{...baseDef,choices,default:carry?.default??baseDef.default,carry},choice:null,at:clock,manual:false,spoken:false};
   if(config.stage==='market')settings.goods=choices.find(c=>c.id===decision.def.default).goods;
   viewport.dataset.carriedFrom=carry?.from??'';viewport.dataset.carriedChoice=carry?.label??'';
   viewport.dataset.incomingFocus=incomingAttention?.focus??'';
   if(config.stage==='people')manualProgress=1;
   if(config.stage==='culture'){settings.culture='learning';beatHit=-100;}
   if(config.stage==='market')worlds.get('market').userData.receipts.forEach(m=>m.visible=false);
  }
  if(config.retain&&ledger.logistics){settings.civicPlan=ledger.logistics.plan;settings.green=ledger.logistics.green;settings.coordination=ledger.logistics.coordinated;}
  if(config.recap)for(const g of worlds.values())g.visible=false;
  previousStage=config.stage;mount();viewport.dataset.stage=config.stage;return true;
 }
 function audioFrame(camera){
  if(!config||config.recap)return null;const world=worlds.get(config.stage),d=world.userData;
  const activeActors=actors.filter(a=>{let n=a.root;while(n&&n!==world){if(!n.visible)return false;n=n.parent;}return n===world;});
  viewport.dataset.audioActors=String(activeActors.length);
  viewport.dataset.audioContacts=String(activeActors.reduce((n,a)=>n+a.audioContacts.length,0));
  viewport.dataset.audioGait=String(Math.max(0,...activeActors.map(a=>a.performance().gaitBlend)));
  viewport.dataset.audioUniqueActors=String(new Set(activeActors.map(a=>a.audioIdentity)).size);
  viewport.dataset.audioContactTotal=String(Number(viewport.dataset.audioContactTotal??0)+activeActors.reduce((n,a)=>n+a.audioContacts.length,0));
  viewport.dataset.audioRigPhases=activeActors.map(a=>`${a.audioIdentity}:${a.performance().gaitPhase.toFixed(3)}:${a.audioContacts.length}:${a.instrument??''}`).join(' ');
  return {cue:current.id,stage:config.stage,clock,actors:activeActors.map(a=>{
   const position=a.root.getWorldPosition(new THREE.Vector3()),distance=position.distanceTo(camera.position),screen=position.clone().project(camera);
   return {id:a.audioIdentity,contacts:a.audioContacts,pan:THREE.MathUtils.clamp(screen.x*.4,-.65,.65),intensity:THREE.MathUtils.clamp(8/Math.max(8,distance),.15,.85)};
  }),goods:settings.goods,goodsAge:d.exchangeState?.age,goodsPending:d.exchangeState?.pending,
   familyHandoff:d.social?.audioHandoff,memory:settings.memory,waterHome:waterOutcome?.home,waterAge:waterOutcome?.age,
   practiceHandoff:d.social?.audioHandoff,proposal:Number(viewport.dataset.civicProposal),barrier:Math.abs(d.barrier?.rotation.z??0)};
 }
 function update(time,dt,elapsed,playing,summary,camera,travelProgress=1,previewDt=0){
  viewport.dataset.decisionActive=String(!!decision);
  if(!config)return;
  if(config.recap){panel.hidden=true;pinHost.hidden=true;speech.hidden=true;dialogue=null;thread.update({observations:ledger,clock,summary:true,dt});return;}
  for(const actor of actors)actor.beginFrame(Math.min(previewDt||dt,.06));lastElapsed=elapsed;lastPlaying=playing;const held=!playing&&(decision?.choice&&!decision.manual&&!decision.replayed||config.stage==='oasis'&&waterPlan&&!waterManual);if(!held)clock+=dt;panel.hidden=summary||!!connecting||!!config.overview;pinHost.hidden=summary||!!config.overview;
  if(decision&&playing&&!decision.choice&&elapsed>=decision.def.pauseAt&&!needsWaterChoice())chooseStory(decision.def.default,false);
  decisionOutcome=decisionFrame(decision,clock);
  viewport.dataset.responseFocus=String(!!decisionOutcome?.choice||config.stage==='oasis'&&!!waterPlan);
  const g=worlds.get(config.stage),d=g.userData;let text='';
  if(connecting){updateDeparting(dt);if(travelProgress>=1){worlds.get(connecting.from).visible=false;links.get(connecting.from).g.visible=false;connecting=null;}}
  if(config.overview)for(const name of stageOrder)if(name!==config.stage)animateNeighbor(name,clock);
  for(const link of links.values())if(link.g.visible)link.beads.forEach((b,i)=>b.position.copy(link.curve.getPoint((time*.0002+i/5)%1)));
  viewport.dataset.stageTransition=connecting?'travelling':'settled';viewport.dataset.visibleStages=[...worlds].filter(([,g])=>g.visible).map(([name])=>name).join(' ');
  if(config.stage==='oasis'){
   if(config.mode==='choice'&&playing&&!waterPlan&&elapsed>=10&&!needsWaterChoice()){waterPlan='home';waterSelectedAt=clock;waterManual=false;ledger.oasis={plan:waterPlan,replied:false,manual:false};refreshControls();}
   waterOutcome=animateWaterStory(g,{clock,plan:waterPlan,selectedAt:waterSelectedAt,auto:!waterManual,elapsed,mode:config.mode,viewport});
   text=waterPlan?(waterManual?'你的选择':'演示选择')+' · '+waterPlans[waterPlan].name:'选择一条支渠，让水先抵达一处需要。';
   if(waterPlan)ledger.oasis={plan:waterPlan,replied:waterOutcome.age>=9,manual:waterManual};
   if(waterManual&&waterOutcome.age>=9&&!waterSpoken){waterSpoken=true;onDialogue('water-'+waterPlan);}
   const next=panel.querySelector('#water-continue');next.disabled=!waterPlan||waterOutcome.age<15;next.textContent=waterOutcome.age>=15?'沿水路继续故事 ↗':'看见回应后，沿水路继续 ↗';
   panel.querySelector('#water-home-meter').value=waterOutcome.home;panel.querySelector('#water-field-meter').value=waterOutcome.field;
  }else if(config.stage==='nature'){
   for(const {source,copy} of d.copies){copy.position.copy(source.position);copy.quaternion.copy(source.quaternion);copy.visible=source.visible;}
   text='山水提供条件，水路与绿洲让远行有地方停留。';viewport.dataset.actorCount='0';
  }else if(config.stage==='market'){
   
   d.caravanClearance=THREE.MathUtils.damp(d.caravanClearance??0,decision?.choice||deliveryAt>=0?1:0,2,dt);
   for(const [i,c] of d.caravans.entries()){const p=caravanPose(clock/45+i/3);p.z=THREE.MathUtils.lerp(p.z,3.02+(i%2)*.52,d.caravanClearance);c.root.position.set(p.x,0,p.z);c.root.rotation.y=p.yaw;c.legs.forEach((leg,j)=>leg.rotation.z=Math.sin(clock*3+j*Math.PI/2)*.28);const guide=d.actors[3+i];guide.root.position.set(p.x-.95*Math.cos(p.yaw),0,p.z+.95*Math.sin(p.yaw));guide.root.rotation.y=p.yaw+Math.PI/2;guide.pose('walk',clock,i);}
   const pending=decision&&!decision.choice,done=deliveryAt>=0&&clock-transferStart>=6.8;const age=pending?0:Math.min(clock-transferStart,6.799),frame=exchangeFrame(age,settings.goods);d.exchangeState={...frame,age,pending};if(pending){frame.carrying=false;frame.phase='等候选择';}if(done)frame.phase='交接完成';d.carrier.root.position.set(frame.x,0,frame.z);d.carrier.pose(pending||done?'wait':frame.carrying?'carry':frame.handover?'receive':'walk',Math.abs(frame.x+5.3)*1.55+(frame.returning?9:0));const yaw=frame.handover?0:frame.returning?-Math.PI/2:Math.PI/2;d.carrier.root.rotation.y+=Math.atan2(Math.sin(yaw-d.carrier.root.rotation.y),Math.cos(yaw-d.carrier.root.rotation.y))*(1-Math.exp(-(previewDt||dt)*7));d.carried.visible=frame.carrying;
   d.actors.slice(0,3).forEach((a,i)=>a.pose(i===settings.goods&&frame.handover?'play':'idle',clock,i));d.actors.slice(6,10).forEach((a,i)=>{a.root.position.z=.2+(i%2)*.48-d.caravanClearance*1.5;a.pose(d.caravanClearance<.95?'walk':'watch',clock,i);});
   if(!pending&&!frame.carrying){d.receipts[settings.goods].visible=true;const identity=transferSerial+'/'+frame.cycle;if(identity!==lastDelivery){lastDelivery=identity;if(deliveryAt<0){deliveryAt=clock;onSound('handoff','market');}transferDeliveries++;if(transferRecorded&&ledger.market&&!decision?.replayed)ledger.market.deliveries++;}}
   d.receipts.forEach((m,i)=>m.scale.set(.4,.3,.27).multiplyScalar(i===settings.goods&&frame.handover?1.04:1));d.cargo.forEach((c,i)=>c.scale.setScalar(i===settings.goods?1:.7));text=`${['织物','补给','工艺'][settings.goods]} · ${frame.phase}；货物到达后，摊主接手。`;viewport.dataset.exchangePhase=frame.phase;viewport.dataset.deliveryCount=String(transferRecorded?(ledger.market?.deliveries??0):transferDeliveries);
   d.deliveryAt=deliveryAt;viewport.dataset.marketCarrier=JSON.stringify(d.carrier.root.position.toArray());viewport.dataset.goods=String(settings.goods);viewport.dataset.actorCount=String(d.actors.length+3);
  }else if(config.stage==='people'){
   if(settlementApproach){const t=THREE.MathUtils.smootherstep(clock-settlementApproach.at,0,2.4);manualProgress=THREE.MathUtils.lerp(settlementApproach.from,1,t);if(t>=1){settlementApproach=null;recordObservation();}}
   const p=manualProgress??(isWorkbench&&config.mode==='settlement'?.84:migrationProgress(config,elapsed,current.duration));viewport.dataset.familyProgress=p.toFixed(3);
   d.choiceAge=Math.max(0,clock-choiceAt);
   d.families.forEach(({group,rigs,index})=>{
    const along=THREE.MathUtils.clamp(p-.06*index,0,1),position=d.path.getPoint(along),tangent=d.path.getTangent(along),settled=THREE.MathUtils.smoothstep(p,.78,.97);
    if(index>0)position.lerp(new THREE.Vector3(index===1?-.9:.85,0,index===1?2.8:3.1),settled);
    group.position.copy(position);group.position.z+=index*.20*(1-settled);group.scale.setScalar(1);group.visible=true;
    const facing=Math.atan2(tangent.x,tangent.z),turn=THREE.MathUtils.smoothstep(p,.84,.98);
    group.rotation.y=facing+Math.atan2(Math.sin(-facing),Math.cos(-facing))*turn;
    rigs.forEach((a,j)=>a.pose(p>.92?(j===0&&clock-choiceAt<2.4+index*.6?'greet':'watch'):'walk',p>.92?clock:along*15.5,index+j*.7));
   });
   const build=THREE.MathUtils.smoothstep(p,.54,.96);d.houses.forEach((h,i)=>h.scale.y=Math.max(.02,THREE.MathUtils.clamp(build*1.5-i*.15,0,.95)));d.crops.forEach((c,i)=>c.scale.y=Math.max(.03,THREE.MathUtils.smoothstep(p,.7+i*.007,1)));
   d.scroll.rotation.z=Math.sin(clock*.65)*.08;d.official.pose('greet',clock);d.scroll.position.x=-4.2+Math.max(0,.25-p)*2;
   const settled=THREE.MathUtils.smoothstep(p,.76,.98);d.workers.forEach((a,i)=>{a.root.visible=p>.76;a.root.scale.setScalar(.78*settled);a.root.position.set(1.3+i*2+.2*Math.sin(clock*.6),0,-2.6+.2*Math.sin(clock*.7+i));a.pose('play',clock*.45,i);});d.water.forEach((b,i)=>{const t=(clock*.32+i/6)%1;b.visible=p>.72;b.position.set(2.3,.11,-1-t*1.9);});
   const input=panel.querySelector('#migration-live');if(document.activeElement!==input)input.value=Math.round(p*100);panel.querySelector('#migration-live-value').textContent=Math.round(p*100)+'% · 叙事进程';
   text=p<.2?'调遣与准备：官兵及家属一同进入西迁故事。':p<.78?'沿脚步跟随家庭，让远行成为具体的经历。':'抵达后的生活：渠水到田，劳动与聚落延续日常。';viewport.dataset.actorCount=String(p>.76?12:10);viewport.dataset.irrigation=String(p>.72);
  }else if(config.stage==='culture'){
   if(playing&&!manualTradition&&current.id==='memory-muqam'){settings.tradition=['twelve','dolan','turpan','hami'][Math.min(3,Math.floor(elapsed/5.5))];refreshControls();}
   const learning=settings.culture==='learning',hit=Math.max(0,1-(clock-beatHit)/1.2),turn=cultureFrame(clock,beatHit);
   if(decision){const f=decisionOutcome;turn.teacher=!!f.choice&&(f.choice==='listen'?f.age<3.2:f.age>=3.2&&f.age<6);turn.learner=!!f.choice&&(f.choice==='listen'?f.age>=4:f.age<3.2);turn.phase=!f.choice?'等待':turn.teacher?'示范':turn.learner?'回应':'相接';if(f.choice&&!decision.counted&&f.age>=(f.choice==='listen'?4:.45)){decision.counted=true;if(!decision.replayed){learnt++;recordObservation();ledger.culture.manual=decision.manual;ledger.culture.choice=decision.choice;}}}
   d.actors.forEach((a,i)=>{const active=i<4?turn.teacher:turn.learner;a.pose(!learning?(i<4?'play':i===7?'idle':'dance'):active?'play':'idle',clock,i*.25);if(i>3&&i<7)a.root.rotation.y=learning?-.35:Math.sin(clock*.55+i)*.3;});
   d.rings.forEach((r,i)=>{const active=!learning||(i<4?turn.teacher:turn.learner),pulse=active?(Math.sin(clock*7.85-i*.3)+1)/2:0;r.scale.setScalar(1+pulse*.2+hit*(i===0||i===7?.35:0));r.material.color.setHex(learning&&i>3?0xe5c47f:active?0x9ac9b5:0x4c6254);});
   d.waves.forEach((w,i)=>{const phase=(clock*.65+i/4)%1;w.position.set(THREE.MathUtils.lerp(-2.8,-3.5,phase),1.12,THREE.MathUtils.lerp(-.75,1.4,phase));w.scale.setScalar(.4+phase*1.8);w.material.opacity=(learning&&(!decision||decision.choice)?1:0)*(1-phase)*.7;});
   d.learner.root.rotation.y=learning?.6:0;d.learner.root.scale.setScalar(.73);text=learning?`${turn.phase==='示范'?'表演者示范，学习者观察':turn.phase==='回应'?'轮到学习者，动作回应示范':'光波连接示范与回应'}${learnt?'；已参与 '+learnt+' 拍':''}。`:'弦乐、手鼓、歌者与舞者共处一个庭院。';viewport.dataset.callTurn=turn.phase;viewport.dataset.practice=settings.culture;viewport.dataset.responses=String(learnt);viewport.dataset.actorCount='8';
  }else{
   if(playing&&!manualCivic&&!config.overview&&!config.retain&&!decision){const auto=civicAutoFrame(current,elapsed);settings.civicVoice=auto.voice;settings.civicPlan=auto.plan;const plan=civicPlans[auto.plan];settings.coordination=plan.coordination;settings.green=plan.green;refreshControls();}
   const plan=civicPlans[settings.civicPlan],capacity=settings.green===plan.green?plan.capacity:Math.max(3,Math.min(9,Math.floor((100-settings.green)/10))),coordinated=settings.coordination;let moving=0,waiting=0,open=false;
   let queueIndex=0;
   d.trucks.forEach((truck,i)=>{const pending=decision&&!decision.choice,parked=pending||i>=capacity,slotOpen=settings.civicPlan!=='balanced'||truck.userData.journey.mode!=='service'||i%2===Math.floor(clock/6)%2;truck.userData.journey=parked||!slotOpen?truck.userData.journey:advanceCargo(truck.userData.journey,(held?0:dt)*plan.dispatch,coordinated);const frame={...truck.userData.journey,parked,waiting:parked||truck.userData.journey.waiting},p=frame.position,pose=cargoPose(p);
    const target=frame.parked?new THREE.Vector3(-6+(pending?i:i-capacity)*.65,.03,.58):new THREE.Vector3(frame.waiting?3.55-queueIndex++*1.15:pose.x,.03,pose.z);
    if(!truck.userData.positioned){truck.position.copy(target);truck.userData.positioned=true;}else truck.position.lerp(target,1-Math.exp(-dt*5));
    truck.rotation.y=frame.parked?0:pose.yaw;
    if(frame.waiting)waiting++;else moving++;open||=!frame.parked&&!frame.waiting&&p>.5&&p<.69;
   });
   d.barrier.rotation.z=THREE.MathUtils.damp(d.barrier.rotation.z,open?-1.3:0,4,dt);
   d.hoist.position.x=Math.sin(clock*.4)*.65;d.hoist.position.y=2.66+Math.sin(clock*.6)*.13;
   d.conveyor.forEach((m,i)=>m.position.x=-5.75+((clock*.24+i/3)%1)*2.35);
   d.infoLines.forEach(({line,bead,curve},i)=>{line.visible=bead.visible=coordinated;bead.position.copy(curve.getPoint((clock*.2+i*.3)%1));});
   d.green.scale.z=settings.green/20;d.green.position.z=-4+settings.green/20*.625;d.greenTrees.forEach((tree,i)=>tree.scale.setScalar(i<settings.green/4?1:.02));
   text=`${coordinated?'信息协同':'分别办理'} · 场景中 ${moving} 辆移动、${waiting} 辆等待；保留绿地改变可用场地。`;
   viewport.dataset.coordination=String(coordinated);viewport.dataset.green=String(settings.green);viewport.dataset.movingTrucks=String(moving);viewport.dataset.waitingTrucks=String(waiting);viewport.dataset.actorCount='9';
  }
  if(text!==signature){panel.querySelector('#lived-observation').textContent=text;signature=text;}
  outcome=config.stage==='oasis'?waterOutcome:animateOutcome(config.stage,g,{clock,elapsed,duration:current.duration,playing:playing&&manualProgress===null&&!decision,settings,deliveryAt,choiceAt,learnt,beatHit,viewport,decision:decisionOutcome});
  const detail=animateSocial(config.stage,g,{clock,elapsed,duration:current.duration,playing,settings,viewport,cue:current,decision:decisionOutcome,beatHit});
  animateAtmosphere(g,clock);
  animateEcology(g,clock);
  animateNeighborhood(g,{clock,settings,viewport});
  dialogue=config.stage==='oasis'&&waterOutcome?.age>=9&&waterOutcome.age<15?{id:'water-'+waterPlan,role:waterPlan==='home'?'家人':'田边的人',text:waterPlan==='home'?'水接到了。我们再帮田边打开支渠。':'田垄接上水了。再把另一条支渠打开吧。',offset:waterOutcome.age-9}:playing?socialDialogue(current,elapsed,settings):manualDialogue&&clock-manualDialogue.at<9?dialogueClips.find(d=>d.id===manualDialogue.id):null;
  if(decision){dialogue=decisionOutcome.dialogue;if((decision.manual||decision.replayed)&&dialogue&&!decision.spoken){decision.spoken=true;onDialogue(dialogue.id);}updateDecisionUI(decisionUI,decisionOutcome,viewport);}
  speech.hidden=summary||!!connecting||!dialogue;
  if(dialogue){const content=dialogue.role+' · 创作对白\n'+dialogue.text;if(speech.textContent!==content)speech.textContent=content;}
  if(config.stage==='market')updateMarketLinkage(d.linkage,viewport.dataset,viewport.dataset.localNarrative==='market',viewport.dataset.localObservationSelected==='true');
  if(detail?.phrase){outcome={...outcome,phrase:detail.phrase};viewport.dataset.storyOutcome=detail.phrase;}
  for(const sign of editorialSigns)if(!sign.userData.keepSign)sign.visible=false;
  if(config.stage==='people'){const chronological=animateSettlement(g,settlementChronology,clock,camera,viewport);if(chronological){dialogue=null;speech.hidden=true;outcome={label:chronological.stage.year,phrase:chronological.stage.reply};}}
  if(decision){outcome={phase:['需求','选择','变化','回应'].indexOf(decisionOutcome.phase),label:decisionOutcome.phase,phrase:decisionOutcome.phrase};viewport.dataset.storyPhase=String(outcome.phase);viewport.dataset.storyOutcome=outcome.phrase;}
  const stateLine=panel.querySelector('#lived-story-state');if(stateLine&&outcome){const content=(isWorkbench?'场景状态':outcome.label)+' · '+outcome.phrase;if(stateLine.textContent!==content)stateLine.textContent=content;}
  viewport.dataset.observations=String(Object.keys(ledger).length);
  thread.update({observations:ledger,stage:config.stage,cue:current.id,clock,summary:summary||config.overview,dt:Math.min(dt,.06)});
  viewport.dataset.storyThread=thread.model.tokens.filter(n=>n.observed).map(n=>n.stage).join(' ');
  const area=isWorkbench?document.getElementById('canvas-host'):viewport;
  for(const {position,button} of projectedPins){const v=position.clone().add(g.position).project(camera),x=(v.x*.5+.5)*area.clientWidth,y=(-v.y*.5+.5)*area.clientHeight;button.hidden=summary||!!connecting||v.z>1||v.z< -1||(isWorkbench?(x<15||x>area.clientWidth-15||y<90||y>area.clientHeight-65):viewport.clientWidth<701||x<40||x>viewport.clientWidth-300||y<100||y>viewport.clientHeight-270);button.style.left=x+'px';button.style.top=y+'px';}
 }
 function choosePriority(priority,{record=true}={}){
  if(config?.stage!=='people'||!['home','water'].includes(priority))return false;
  activateControl();settings.priority=priority;settlementApproach={from:manualProgress??Number(viewport.dataset.familyProgress??.84),at:clock};choiceAt=clock;focused=focusPoses.people;onFocus();onSound('choice','people');if(record)recordObservation();refreshControls();return true;
 }
 function workspaceState(){const d=worlds.get(config.stage).userData;return {settings:{...settings},clock,manualProgress,settlementApproach:settlementApproach?{...settlementApproach}:null,manualDialogue:manualDialogue?{...manualDialogue}:null,beatHit,learnt,waterPlan,waterSelectedAt,waterManual,waterSpoken,transferStart,deliveryAt,choiceAt,marketTransfer:config.stage==='market'?{serial:transferSerial,lastDelivery,deliveries:ledger.market?.deliveries??0,receipts:d.receipts.map(m=>m.visible)}:null,caravanClearance:d.caravanClearance??0,trucks:d.trucks?.map(t=>({journey:{...t.userData.journey,waiting:!!t.userData.journey.waiting},position:t.position.toArray(),yaw:t.rotation.y})),barrier:d.barrier?.rotation.z};}
 function resetWorkspace(stage){
  clock=0;manualProgress=null;settlementApproach=null;manualDialogue=null;choiceAt=0;deliveryAt=-1;transferStart=0;lastDelivery='';delete ledger[stage];
  if(stage==='oasis'){waterPlan=null;waterSelectedAt=0;waterManual=false;waterSpoken=false;}
  if(stage==='market'){settings.goods=1;}
  if(stage==='people'){settings.priority='water';settings.memory='letter';}
  if(stage==='culture'){settings.culture='learning';settings.tradition='hami';beatHit=-100;learnt=0;}
  if(stage==='logistics'){settings.coordination=true;settings.green=36;settings.civicPlan='balanced';settings.civicVoice='resident';}
 }
 function restoreWorkspace(value){
  if(!value||typeof value!=='object')return;
  for(const [key,options]of Object.entries({culture:['ensemble','learning'],priority:['water','home'],memory:['letter','tools','song'],tradition:['twelve','dolan','turpan','hami'],civicPlan:['freight','balanced','habitat'],civicVoice:['resident','worker','steward']}))if(options.includes(value.settings?.[key]))settings[key]=value.settings[key];
  for(const [key,min,max]of [['goods',0,2],['green',15,50]])if(Number.isFinite(value.settings?.[key]))settings[key]=THREE.MathUtils.clamp(value.settings[key],min,max);
  if(typeof value.settings?.coordination==='boolean')settings.coordination=value.settings.coordination;
  const number=(key,fallback=0)=>Number.isFinite(value[key])?THREE.MathUtils.clamp(value[key],-100,100000):fallback;
  settlementApproach=value.settlementApproach&&Number.isFinite(value.settlementApproach.from)&&Number.isFinite(value.settlementApproach.at)?{from:THREE.MathUtils.clamp(value.settlementApproach.from,0,1),at:Math.max(0,value.settlementApproach.at)}:null;clock=Math.max(0,number('clock'));manualProgress=value.manualProgress===null?null:THREE.MathUtils.clamp(number('manualProgress'),0,1);beatHit=number('beatHit',-100);learnt=Math.round(Math.max(0,number('learnt')));waterPlan=['home','field'].includes(value.waterPlan)?value.waterPlan:null;waterSelectedAt=number('waterSelectedAt');waterManual=!!value.waterManual;waterSpoken=!!value.waterSpoken;transferStart=number('transferStart');deliveryAt=number('deliveryAt',-1);choiceAt=number('choiceAt');manualCivic=true;manualTradition=true;manualCulture=true;recordObservation();refreshControls();
  const d=worlds.get(config.stage).userData;
  if(config.stage==='market'){
   const saved=value.marketTransfer;transferSerial=Number.isFinite(saved?.serial)?Math.max(0,Math.floor(saved.serial)):0;
   const frame=exchangeFrame(Math.min(Math.max(0,clock-transferStart),6.799),settings.goods);
   lastDelivery=typeof saved?.lastDelivery==='string'&&/^\d+\/\d+$/.test(saved.lastDelivery)?saved.lastDelivery:deliveryAt>=0?transferSerial+'/'+frame.cycle:'';
   ledger.market={goods:settings.goods,deliveries:Number.isFinite(saved?.deliveries)?Math.max(0,Math.floor(saved.deliveries)):deliveryAt>=0?1:0};
   d.receipts.forEach((m,i)=>m.visible=Array.isArray(saved?.receipts)?saved.receipts[i]===true:i===settings.goods&&(deliveryAt>=0||clock-transferStart>=3.8));
  }
  d.caravanClearance=THREE.MathUtils.clamp(number('caravanClearance'),0,1);
  if(dialogueClips.some(clip=>clip.id===value.manualDialogue?.id)&&Number.isFinite(value.manualDialogue?.at))manualDialogue={id:value.manualDialogue.id,at:value.manualDialogue.at};
  if(d.trucks&&Array.isArray(value.trucks))for(const [i,t]of d.trucks.entries()){const saved=value.trucks[i],j=saved?.journey;if(!j||!['approach','depart','service'].includes(j.mode)||!Number.isFinite(j.position))continue;t.userData.journey={position:THREE.MathUtils.clamp(j.position,0,1),mode:j.mode,elapsed:Number.isFinite(j.elapsed)?THREE.MathUtils.clamp(j.elapsed,0,12):0,cycles:Number.isFinite(j.cycles)?Math.max(0,Math.floor(j.cycles)):0,waiting:!!j.waiting};if(saved.position?.length===3&&saved.position.every(v=>Number.isFinite(v)&&Math.abs(v)<100)){t.position.fromArray(saved.position);t.userData.positioned=true;}if(Number.isFinite(saved.yaw))t.rotation.y=saved.yaw;}
  if(d.barrier&&Number.isFinite(value.barrier))d.barrier.rotation.z=value.barrier;
 }
 return {historyProgress(f){if(!config)return;clock=f.progress*36;manualDialogue=null;
  if(config.stage==='people')manualProgress=THREE.MathUtils.clamp((f.progress-.25)/.75,0,1);
  if(config.stage==='market'){clock=f.network*6.8;transferStart=0;deliveryAt=f.network>=1?0:-1;worlds.get('market').userData.receipts.forEach((m,i)=>m.visible=i===settings.goods&&f.network*6.8>=3.8);}
  if(config.stage==='oasis'){waterPlan=f.network>.1?'field':null;waterSelectedAt=0;waterManual=false;waterSpoken=true;}
 },chooseMarket(value,{record=true}={}){if(config?.stage!=='market'||![0,1,2].includes(value))return false;activateControl();chooseGoods(value,true,record);return true;},setSettlementChronology(value){settlementChronology=value?{phase:value.phase,progress:value.progress??1}:null;viewport.dataset.settlementChronology=value?.phase??'';if(value){manualProgress=1;settlementApproach=null;manualDialogue=null;}else for(const key of ['settlementYear','settlementTrench','settlementNewWater','settlementExpansion','settlementChronologyProgress','settlementInitialWater'])delete viewport.dataset[key];},choosePriority,setCue,update,audioFrame,workspaceState,restoreWorkspace,resetWorkspace,perform(time,dt,audio,camera){if(config&&!config.recap&&!settlementChronology)speechPan=performCharacters({worlds,stage:config.stage,actors,settings,decision:decisionOutcome,water:waterOutcome,entry:incomingAttention,clock,time,dt,audio,camera,viewport});},get speechPan(){return speechPan;},get thread(){return thread.model;},restoreObservation,continueDecision,get decisionActive(){return !!decision;},get decisionCheckpoint(){return decision?.def.pauseAt??Infinity;},get decisionSelected(){return !!decision?.choice;},get decisionReady(){return decisionFrame(decision,clock)?.ready??false;},reset(){for(const key of Object.keys(ledger))delete ledger[key];decision=null;decisionOutcome=null;decisionUI=null;waterPlan=null;waterSelectedAt=0;waterManual=false;waterSpoken=false;manualCivic=false;manualTradition=false;manualCulture=false;learnt=ledger.culture?.beats??0;clock=0;beatHit=-100;settings.goods=0;settings.memory='letter';settings.tradition='twelve';settings.civicPlan='balanced';settings.civicVoice='resident';manualProgress=null;deliveryAt=-1;choiceAt=0;},resume(){focused=null;transferManual=false;if(!manualCulture)settings.culture=config?.mode==='learning'?'learning':'ensemble';if(!manualCivic)settings.green=['ecology','commons'].includes(config?.mode)?45:20;refreshControls();},clearWater(){waterPlan=null;waterManual=false;waterSpoken=false;waterSelectedAt=clock;refreshControls();},get waterSelected(){return !!waterPlan;},get waterReady(){return !!waterPlan&&clock-waterSelectedAt>=15;},get ledger(){return Object.fromEntries(Object.entries(ledger).map(([k,v])=>[k,{...v}]));},get observations(){return observationRows(ledger);},get active(){return !!config;},get group(){return config?worlds.get(config.stage):null;},get pose(){return config.recap?thread.resultFocus:worldPose(socialPose(),config.stage);},get entryPose(){return config?worldPose(entryPoses[config.stage],config.stage):null;},get stage(){return config?.stage;},hide(){settlementChronology=null;viewport.dataset.settlementChronology='';for(const key of ['settlementYear','settlementTrench','settlementNewWater','settlementExpansion','settlementChronologyProgress','settlementInitialWater'])delete viewport.dataset[key];thread.hide();for(const g of worlds.values())g.visible=false;for(const link of links.values())link.g.visible=false;connecting=null;config=null;decision=null;decisionOutcome=null;speech.hidden=true;panel.hidden=true;pinHost.hidden=true;previousStage='';delete viewport.dataset.stage;},stats(){return config?{stage:config.stage,mode:config.mode,recap:!!config.recap,influence:incomingAttention,responseFocus:viewport.dataset.responseFocus==='true',actors:viewport.dataset.actorCount,outcome,dialogue,decision:decisionOutcome,waterPlan,waterAge:waterOutcome?.age??0,memory:settings.memory,tradition:settings.tradition,civicVoice:settings.civicVoice,civicPlan:settings.civicPlan,...(config.stage==='market'?{phase:viewport.dataset.exchangePhase,deliveries:ledger.market?.deliveries??0}:config.stage==='culture'?{practice:settings.culture,responses:learnt,turn:viewport.dataset.callTurn}:config.stage==='logistics'?{coordination:String(settings.coordination),moving:viewport.dataset.movingTrucks,waiting:viewport.dataset.waitingTrucks}:{})}:null;}};
}


