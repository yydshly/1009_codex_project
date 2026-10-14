import * as THREE from 'three';
import {ease} from './story-outcomes.js';
import {surfaceMaterial} from './surface.js';
import {waterSequence} from './early-chain.js';

// A fictional oasis and two orders of work. This is a spatial story, not a
// calibrated water-allocation model or a reconstruction of a named village.
export const waterPlans={
 home:{name:'先送到家里',first:'生活用水',second:'田地灌溉',reply:'家人接过水，孩子端起杯子；田边的人随后打开支渠。'},
 field:{name:'先送到田里',first:'田地灌溉',second:'生活用水',reply:'田边的人引水入垄、放下工具；家人随后接过水。'},
};
export function createWaterStory(g,a,terrainSource){
 const {box,ball,cylinder,solid,subgroup,human,tree,textSign}=a;
 const d={actors:[],streams:[],plants:[],furrows:[],fieldRills:[],gates:{},selected:null,at:0};
 g.userData.waterStory=d;
 // The observed regional relief becomes a quiet backdrop. It does not claim
 // the fictional house and field have real coordinates within that DEM.
 const relief=subgroup(g,[-1.4,-.02,-3.8]);relief.name='oasis-regional-relief';relief.scale.set(.5,.52,.42);
 for(const child of terrainSource().children)if(child.isMesh)relief.add(child.clone(true));
 const earth=surfaceMaterial(0xb89f76,{roughness:1},'plaster');
 const ground=solid(g,new THREE.PlaneGeometry(13.9,7.8,14,8),earth,[0,.045,0]);ground.rotation.x=-Math.PI/2;ground.name='oasis-legacy-ground';
 const channel=(points,key)=>{
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const ribbon=(width,lift)=>{const vertices=[],indices=[];for(let i=0;i<=64;i++){const p=curve.getPoint(i/64),t=curve.getTangent(i/64),n=new THREE.Vector3(-t.z,0,t.x).normalize();for(const side of [-1,1])vertices.push(p.x+n.x*width*side,p.y+lift,p.z+n.z*width*side);if(i<64){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;};
  solid(g,ribbon(.19,-.065),0x85765e);
  for(const side of [-1,1]){const rim=new THREE.CatmullRomCurve3(Array.from({length:65},(_,i)=>{const p=curve.getPoint(i/64),t=curve.getTangent(i/64);return p.add(new THREE.Vector3(-t.z,0,t.x).normalize().multiplyScalar(.19*side));}));solid(g,new THREE.TubeGeometry(rim,64,.035,6,false),0x988369);}
  const flow=solid(g,ribbon(.145,-.038),surfaceMaterial(0x66afa9,{roughness:.26,metalness:.08,side:THREE.DoubleSide},'water'));
  const beads=Array.from({length:8},()=>ball(g,new THREE.MeshBasicMaterial({color:0xd5f1e3}),[0,0,0],[.04,.018,.07]));
  d.streams.push({key,curve,flow,beads});
 };
 channel([[-6,.14,-.4],[-3.8,.15,-.6],[-1.1,.16,-.5]],'source');
 channel([[-1.1,.16,-.5],[.2,.15,.4],[1.3,.14,1.4],[2.5,.14,1.45]],'home');
 channel([[-1.1,.16,-.5],[.3,.14,-1.1],[2,.13,-1.6],[4.6,.12,-1.65]],'field');
 for(const [key,x,z] of [['home',-.55,-.05],['field',-.1,-.85]]){
  const frame=subgroup(g,[x,.03,z]);
  for(const side of [-1,1])box(frame,0x786247,[side*.25,.38,0],[.07,.76,.09]);
  box(frame,0xa49168,[0,.78,0],[.65,.06,.14]);
  const gate=box(frame,0x775f40,[0,.23,0],[.43,.4,.07]);
  const wheel=solid(frame,new THREE.TorusGeometry(.13,.025,8,24),0xb9a274,[0,.99,0]);
  cylinder(frame,0x89744e,[0,.71,0],[.025,.49,.025]);d.gates[key]={gate,wheel};
 }
 const house=subgroup(g,[3.9,0,1.55]);
 box(house,0xd1bc93,[0,.09,0],[2.8,.15,1.8]);
 box(house,0xc3a984,[0,.8,-.86],[2.8,1.5,.15]);
 for(const side of [-1,1])box(house,0xc3a984,[side*1.37,.65,-.15],[.14,1.2,1.45]);
 for(let i=0;i<7;i++)box(house,0x877356,[-1.35+i*.45,1.72,-.18],[.065,.09,1.85]);
 box(house,0x66817a,[0,.85,-.772],[.72,.55,.025]);
 const table=box(house,0x92754e,[-.3,.52,.28],[.9,.08,.58]);
 for(const x of [-.62,.02])box(house,0x786447,[x,.25,.28],[.07,.5,.4]);
 const cup=solid(g,new THREE.CylinderGeometry(.065,.057,.13,16),0xe2d3af,[3.22,.9,2.11]);d.cup=cup;
 const basin=subgroup(g,[2.35,.1,1.5]);cylinder(basin,0xa09174,[0,.11,0],[.32,.22,.32]);
 d.basin=solid(basin,new THREE.CylinderGeometry(.27,.27,.015,24),new THREE.MeshStandardMaterial({color:0x72bdb5,roughness:.26}),[0,.23,0]);
 for(let r=0;r<4;r++)for(let c=0;c<6;c++){
  const x=2+c*.5,z=-2.2-r*.28;d.furrows.push(box(g,0x827854,[x,.06,z],[.43,.09,.24]));
  const plant=subgroup(g,[x,.08,z]);
  cylinder(plant,0x819156,[0,.2,0],[.018,.4,.018]);
  for(const side of [-1,1])solid(plant,new THREE.SphereGeometry(.08,10,8),0x98a861,[side*.07,.2,.01],[1,.32,1.4]);
  ball(plant,0xc3b377,[0,.4,0],[.045,.09,.03]);d.plants.push(plant);
 }
 const actor=(name,color,position,scale=1)=>{const rig=human(g,color,scale);rig.root.position.set(...position);d.actors.push(rig);d[name]=rig;return rig;};
 actor('keeper',0x7a8c80,[-1.45,0,.15]);
 actor('parent',0xb08b6b,[2.8,0,2.08],.92);
 actor('child',0x879b98,[3.25,0,2.32],.6);
 actor('farmer',0x94975f,[5.55,0,-1.9],.94);
 actor('traveller',0x6d8585,[-4.3,0,1.63],.9);
 d.hoe=box(d.farmer.root,0x746549,[.24,.5,.13],[.025,.86,.035]);d.hoe.rotation.z=-.23;
 box(d.traveller.root,0xb39365,[0,.57,-.2],[.32,.39,.18]);
 // A visible outlet, maintenance shaft and unfinished packing connect the
 // engineering observation to daily work and the next case's material needs.
 for(let r=0;r<4;r++){
  const points=[[4.6,.13,-1.65],[4.55,.13,-2.2-r*.28],[2.1,.13,-2.2-r*.28]].map(p=>new THREE.Vector3(...p));
  d.fieldRills.push(solid(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.024,6,false),0x69aba5));
 }
 const shaft=subgroup(g,[-4.75,.08,-.6]);cylinder(shaft,0x948568,[0,.12,0],[.38,.24,.38]);cylinder(shaft,0x3b4943,[0,.247,0],[.27,.012,.27]);
 d.shaft=shaft;box(g,0x837457,[-4.35,.09,-.25],[.42,.045,.6]);
 const packing=subgroup(g,[-4.1,.2,1.5]);box(packing,0x927453,[0,0,0],[1.15,.1,.64]);
 for(const x of [-.46,.46])box(packing,0x7e684b,[x,-.09,0],[.055,.25,.49]);
 d.emptyBasket=subgroup(packing,[.22,.1,0]);
 for(const x of [-.22,.22])box(d.emptyBasket,0xa79069,[x,.11,0],[.04,.22,.36]);
 for(const z of [-.18,.18])box(d.emptyBasket,0xa79069,[0,.11,z],[.44,.22,.04]);
 box(d.emptyBasket,0xa79069,[0,.015,0],[.44,.025,.36]);
 d.waterskin=ball(g,0x708b87,[-4.43,.45,1.55],[.13,.23,.1]);
 d.foldedCloth=box(g,0xc4ac80,[3.9,.63,1.88],[.42,.04,.3]);
 tree(g,5.8,2.95,2);tree(g,-5.9,2.3,1.5);tree(g,5.9,-2.9,1.25);
 textSign(g,'家里等着水','生活',[3.75,2.18,1.15],1.7,'#4e685f');
 textSign(g,'田地也需要水','生产',[3.6,1.14,-2.5],1.9,'#68744f');
 return d;
}
export function animateWaterStory(g,{clock,plan,selectedAt,auto,elapsed,mode,viewport}){
 const d=g.userData.waterStory;
 const chosen=plan==='home'||plan==='field';
 const age=chosen?Math.max(0,clock-selectedAt):0;
 const sequence=waterSequence(age,plan),{home,field}=sequence;
 for(const {key,curve,flow,beads} of d.streams){
  const level=key==='source'?1:key==='home'?home:field;flow.visible=level>.015;
  flow.geometry.setDrawRange(0,Math.floor(level*64)*6);
  beads.forEach((b,i)=>{const t=(clock*.19+i/8)%1;b.visible=level>.05&&t<level;b.position.copy(curve.getPoint(t));b.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),curve.getTangent(t));});
 }
 for(const [key,level] of [['home',home],['field',field]]){d.gates[key].gate.position.y=.23+level*.39;d.gates[key].wheel.rotation.z=level*Math.PI*1.4;}
 // Water darkens the existing furrows; crops do not magically grow on choice.
 d.plants.forEach(p=>p.scale.y=1);
 d.furrows.forEach(p=>p.material.color.set(field>.7?0x68634c:0x827854));
 d.fieldRills.forEach((p,i)=>{p.visible=field>.7;p.scale.x=1;});
 d.basin.scale.y=.2+home*.8;
 const maintaining=mode==='maintenance',repair=ease((elapsed-1)/4);
 d.keeper.root.position.set(-1.45+(maintaining?-3.1*repair:0),0,.15+(maintaining?-.57*repair:0));
 d.keeper.root.rotation.y=maintaining?-1.6:plan==='field'?2.5:1.1;d.keeper.pose(maintaining?(repair<.98?'walk':'work'):!chosen?'watch':age<4?'work':'watch',clock);
 d.parent.pose(home>.7?(age>12?'watch':age>9?'thank':'receive'):'wait',clock);
 d.child.pose(home>.7?'use':'watch',clock);
 d.cup.position.set(3.25,home>.7?.77:.54,2.43);d.cup.rotation.z=home>.7?Math.sin(clock*.6)*.12:0;
 d.farmer.pose(field>.7?(age>9&&age<12?'thank':'work'):'wait',clock);d.farmer.root.rotation.y=-1.1;
 const packing=mode==='continue',pack=ease((elapsed-.6)/3),waterReceived=home>.7||field>.7;
 d.traveller.root.position.set(-4.3+(packing?.3*pack:0),0,1.63);
 d.traveller.root.rotation.y=packing?-.15:.7;d.traveller.pose(packing?'use':'wait',clock);
 d.waterskin.scale.y=waterReceived?.23:.14;
 const phase=!chosen?0:age<1?1:age<9?2:3;
 const phrase=!chosen?'家里等着水，田边的人也在等。你来安排先后。':age<9.2?`水先抵达${plan==='home'?'家门':'田垄'}，另一方还在等待。`:age<12.4?'再打开另一条支渠，让另一方开始工作。':packing?'水已经接上，行装旁的篮子还空着。物品与补给从哪里来？':maintaining?'来水以后，维护者回到竖井继续工作。':waterPlans[plan].reply;
 viewport.dataset.waterChoice=chosen?plan:'pending';viewport.dataset.waterHome=home.toFixed(3);viewport.dataset.waterField=field.toFixed(3);
 viewport.dataset.waterReply=chosen&&age>=9?'responded':'waiting';viewport.dataset.waterAge=age.toFixed(2);viewport.dataset.actorCount='5';
 viewport.dataset.waterSequence=sequence.phase;viewport.dataset.waitingUser=sequence.waiting??'';viewport.dataset.nextNeed=packing?'material-and-supplies':'';
 viewport.dataset.waterActors=JSON.stringify({keeper:d.keeper.root.position.toArray(),parent:d.parent.root.position.toArray(),farmer:d.farmer.root.position.toArray(),traveller:d.traveller.root.position.toArray()});
 return {phase,label:['需求','选择','变化','回应'][phase],phrase,age,home,field,sequence};
}
