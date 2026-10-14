import * as THREE from 'three';
import {surfaceMaterial} from './surface.js';
import {softBoxGeometry} from './soft-box.js';

// Original teaching sets. All extra relief is inside the authored set, never
// on the measured landscape. Geometry/materials are shared across cached scenes.
const pebble=new THREE.IcosahedronGeometry(1,1),tile=softBoxGeometry();
const leaf=new THREE.BufferGeometry();
leaf.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.48,.025,.45,0,.07,1,.48,.025,.45],3));
leaf.setIndex([0,1,2,0,2,3]);leaf.computeVertexNormals();
const foliage=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,side:THREE.DoubleSide});
const paving=surfaceMaterial(0xffffff,{roughness:1},'soil');
const wood=surfaceMaterial(0x84694b,{roughness:.96},'wood');
const clay=surfaceMaterial(0xaa805c,{roughness:.96},'clay');
const wicker=surfaceMaterial(0xb4a17a,{roughness:1,side:THREE.DoubleSide},'basket');
const vesselGeo=new THREE.LatheGeometry([[.05,0],[.13,.025],[.16,.16],[.13,.28],[.065,.31],[.07,.36]].map(p=>new THREE.Vector2(...p)),20);
const basketGeo=new THREE.LatheGeometry([[.14,0],[.21,.04],[.24,.21],[.25,.23]].map(p=>new THREE.Vector2(...p)),20);
const sackGeo=new THREE.LatheGeometry([[.10,0],[.19,.06],[.22,.22],[.17,.36],[.065,.42],[.08,.46]].map(p=>new THREE.Vector2(...p)),18);
const dummy=new THREE.Object3D(),color=new THREE.Color();
const clamp=THREE.MathUtils.clamp;
function random(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function scatter(parent,geometry,material,rows,name){
 if(!rows.length)return null;
 const mesh=new THREE.InstancedMesh(geometry,material,rows.length);mesh.name=name;
 rows.forEach((r,i)=>{dummy.position.set(...r.p);dummy.rotation.set(...(r.r??[0,0,0]));dummy.scale.set(...r.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color.setHex(r.color));});
 mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function decorateNeighborhood(stage,g,a){
 if(!['market','people','culture','logistics'].includes(stage)||g.userData.neighborhood)return;
 const {solid,subgroup,box,ball,cylinder}=a,rng=random(928+stage.length*877);
 const state={stage,clothProps:[],growth:null,vines:null,instances:0};g.userData.neighborhood=state;
 const layer=g.getObjectByName('living-ground');
 const floor=new THREE.PlaneGeometry(14.25,8.4,60,36);floor.rotateX(-Math.PI/2);
 const positions=floor.attributes.position;
 for(let i=0;i<positions.count;i++)positions.setY(i,.003*Math.sin(positions.getX(i)*2.8)*Math.sin(positions.getZ(i)*3.4));
 floor.computeVertexNormals();layer.geometry=floor;layer.scale.setScalar(1);layer.position.set(0,.034,0);layer.castShadow=false;
 layer.material=surfaceMaterial({market:0xb8a584,people:0xb2ac85,culture:0xb2a084,logistics:0xb0b3a0}[stage],{roughness:1},'soil');
 const pot=(parent,pos,size=1)=>solid(parent,vesselGeo,clay,pos,[size,size,size]);
 const basket=(parent,pos,size=1)=>solid(parent,basketGeo,wicker,pos,[size,size,size]);
 const sack=(parent,pos,size=1,tone=0xbba781)=>{
  const s=subgroup(parent,pos);solid(s,sackGeo,surfaceMaterial(tone,{roughness:1},'textile'),[0,0,0],[size,size,size]);
  cylinder(s,wood,[0,.415*size,0],[.071*size,.018*size,.071*size]);return s;
 };
 const pavingRows=[];
 if(stage==='market'||stage==='culture'){
  // Slightly uneven, staggered paving gives a human scale without covering rugs.
  for(let row=0;row<10;row++)for(let col=0;col<23;col++){
   const x=-6.45+col*.57+(row%2)*.22,z=-2.9+row*.56;
   if(x>6.5||stage==='market'&&Math.abs(z-2.15)<.27)continue;
   pavingRows.push({p:[x+(rng()-.5)*.018,.046+(rng()-.5)*.004,z+(rng()-.5)*.024],r:[0,(rng()-.5)*.018,0],s:[.535+rng()*.018,.018,.51+rng()*.018],color:[0xb6a187,0xbeab8e,0xc5b398,0xac987c][(row+col)%4]});
  }
  scatter(g,tile,paving,pavingRows,'worn-paving');
 }
 if(stage==='market'){
  for(const [i,x]of [-3.7,0,3.7].entries()){
   // Counter panels, shaded shelves and real-shaped storage beside each stall.
   for(let j=0;j<8;j++)box(g,wood,[x-.88+j*.25,.43,-.455],[.026,.72,.025]);
   box(g,wood,[x,.85,-.47],[2.08,.055,.04]);
   box(g,wood,[x+.83,.48,-1.1],[.38,.045,.47]);
   for(let j=0;j<3;j++)pot(g,[x+.81,.51,-1.28+j*.16],.37);
   basket(g,[x-.85,.065,-.08],.84);
   if(i===1){
    for(let j=0;j<11;j++)ball(g,[0xb87d42,0x9ca35b,0xceab64][j%3],[x-.85+(rng()-.5)*.2,.26+rng()*.07,-.08+(rng()-.5)*.2],[.052,.046,.054]);
    sack(g,[x+.93,.06,-.02],.9);sack(g,[x+1.25,.06,-.13],.72,0x9da588);
   }else if(i===2){pot(g,[x+1.2,.06,-.12],1.12);pot(g,[x+1.5,.06,-.24],.66);}
   else{sack(g,[x+.97,.06,-.11],.74,0x9b8e79);}
  }
  // A loaded handcart marks the pickup area, away from the exchange lane.
  const cart=subgroup(g,[-5.4,.05,.04]);cart.rotation.y=-.12;
  box(cart,wood,[0,.3,0],[.83,.06,.63]);
  for(const side of [-1,1]){
   box(cart,wood,[0,.49,side*.3],[.84,.25,.055]);
   const wheel=solid(cart,new THREE.TorusGeometry(.19,.026,6,24),wood,[side*.46,.21,0]);wheel.rotation.y=Math.PI/2;
   box(cart,wood,[side*.32,.25,.75],[.035,.045,.95]);
  }
  sack(cart,[-.19,.34,-.1],.72);basket(cart,[.18,.34,.09],.73);
  // Thin straps connect the original camel packs to their saddles.
  for(const c of g.userData.caravans)for(const side of [-1,1]){
   box(c.root,wood,[0,1.1,side*.43],[.035,.45,.022]);
   const rope=new THREE.CatmullRomCurve3([[.68,1.33,side*.115],[.47,1.12,side*.22],[.24,.92,side*.29]].map(p=>new THREE.Vector3(...p)));
   solid(c.root,new THREE.TubeGeometry(rope,15,.012,5,false),wood);
  }
 }else if(stage==='people'){
  // Domestic detail follows the growing houses instead of floating above them.
  g.userData.houses.forEach((h,i)=>{
   box(h,wood,[-.52,.32,.84],[.58,.05,.33]);
   for(const side of [-1,1])box(h,wood,[-.52+side*.22,.15,.84],[.045,.3,.23]);
   pot(h,[.67,.04,.86],.57);basket(h,[-.65,.36,.84],.48);
   sack(h,[.84,.04,.34],.55,i%2?0xb3a27e:0xa29f7d);
   box(h,wood,[.0,.24,-.644],[1.3,.04,.033]);
  });
  const room=g.userData.detail.home;
  box(room,wood,[.59,.7,-.699],[.94,.044,.16]);
  for(let i=0;i<4;i++)pot(room,[.25+i*.22,.726,-.67],.25+i*.028);
  box(room,wood,[-1.3,.38,.63],[.08,.64,.08]);box(room,wood,[1.3,.38,.63],[.08,.64,.08]);
  // A folded mat and kitchen tools stay beside the family, leaving the doorway open.
  const roll=cylinder(room,surfaceMaterial(0x8e7864,{roughness:1},'textile'),[-.88,.22,.52],[.08,.48,.08]);roll.rotation.z=Math.PI/2;
  pot(room,[.99,.14,.39],.55);basket(g,[5.97,.06,3.38],.87);
  const clothes=subgroup(g,[4.55,0,2.1]);clothes.name='household-laundry';
  for(const x of [-1.1,1.1])box(clothes,wood,[x,1.63,-.58],[.036,.34,.036]);
  const line=new THREE.CatmullRomCurve3([[-1.1,1.72,-.58],[0,1.61,-.58],[1.1,1.72,-.58]].map(p=>new THREE.Vector3(...p)));
  solid(clothes,new THREE.TubeGeometry(line,24,.006,4,false),wood);
  state.clothes=clothes;
  const growth=subgroup(g),blades=[];
  for(let i=0;i<290;i++){
   const x=1.18+rng()*3.2,z=-3.35+rng()*1.36;
   if(Math.abs(x-2.3)<.21)continue;
   blades.push({p:[x,.075,z],r:[-1.18-rng()*.28,rng()*6,0],s:[.022,1,.1+rng()*.13],color:[0x6b8050,0x909865,0xaba671][i%3]});
  }
  scatter(growth,leaf,foliage,blades,'garden-blades');state.growth=growth;state.instances+=blades.length;
  // Rounded canal stones and a forked track make the water/settlement choice spatial.
  const rows=[];
  for(let i=0;i<50;i++)for(const side of [-1,1])rows.push({p:[i*.123,.07,-1+side*.25+(rng()-.5)*.02],r:[0,rng()*6,0],s:[.075,.028,.065],color:0x9d9479});
  for(let i=0;i<36;i++){const p=g.userData.path.getPoint(i/35);rows.push({p:[p.x+(rng()-.5)*.28,.07,p.z+(rng()-.5)*.20],r:[0,rng()*6,0],s:[.09,.018,.11],color:i%2?0xb6a184:0xc7b697});}
  scatter(g,pebble,paving,rows,'canal-and-footpath');state.instances+=rows.length;
 }else if(stage==='culture'){
  // Thin leaves and branched tendrils replace the old repeated oval vine leaves.
  g.userData.detail.foliage.forEach(o=>o.visible=false);
  const vines=subgroup(g),leaves=[],fruit=[];
  for(let strand=0;strand<4;strand++){
   const z=-1.7+strand*.88,points=[];
   for(let i=0;i<8;i++)points.push(new THREE.Vector3(-5.25+i*1.5,3.11+.032*Math.sin(i*2+strand),z+.11*Math.sin(i)));
   const curve=new THREE.CatmullRomCurve3(points);solid(vines,new THREE.TubeGeometry(curve,45,.015,5,false),wood);
   for(let i=0;i<75;i++){
    const p=curve.getPoint(rng()),size=.14+rng()*.09;
    leaves.push({p:[p.x+(rng()-.5)*.28,p.y-.06+rng()*.11,p.z+(rng()-.5)*.32],r:[-.65+rng()*.95,rng()*6,(rng()-.5)*.35],s:[size*.8,1,size],color:[0x5c774b,0x82955c,0x97a46d][i%3]});
   }
   for(let bunch=0;bunch<5;bunch++){
    const p=curve.getPoint(.12+bunch*.17);
    for(let j=0;j<9;j++)fruit.push({p:[p.x+(rng()-.5)*.07,p.y-.12-j*.014,p.z+(rng()-.5)*.075],s:[.028,.034,.028],color:strand%2?0x839568:0x9d9970});
   }
  }
  scatter(vines,leaf,foliage,leaves,'vine-leaves');scatter(vines,pebble,paving,fruit,'vine-fruit');state.vines=vines;state.instances+=leaves.length+fruit.length;
  for(const x of [-5.52,5.52]){
   pot(g,[x,.06,.72],.95);basket(g,[x-.23,.065,1.8],.76);
   box(g,wood,[x,.48,-.9],[.38,.08,1.7]);
   for(let i=0;i<6;i++)box(g,wood,[x,.70+i*.12,-.9],[.035,.035,1.5]);
  }
  // Shelved pottery and a folded cushion give the courtyard occupied edges.
  const shelf=subgroup(g,[4.66,.7,-2.9]);box(shelf,wood,[0,0,0],[1.3,.06,.25]);
  for(let i=0;i<5;i++)pot(shelf,[-.52+i*.25,.033,0],.31);
  const cushion=solid(g,sackGeo,surfaceMaterial(0x9c7a64,{roughness:1},'textile'),[-4.55,.13,1.12],[.9,.32,1.1]);cushion.rotation.z=-.12;
 }else{
  // Lane joints, safe footway and inspection tools at a contemporary service set.
  for(let i=0;i<17;i++)box(g,0x71817a,[-6.6+i*.80,.077,1.11],[.69,.07,.18]);
  for(let i=0;i<7;i++){
   box(g,0xa9b2a1,[-2.7+i*.78,.075,-.62],[.016,.012,2.5]);
   box(g,0xc8c6a8,[3.16+i*.075,.07,2.70],[.045,.014,.27]);
  }
  const awning=subgroup(g,[-1.7,0,.15]);state.waitingShade=awning;
  for(const x of [-1.12,1.12])for(const z of [-.74,.74])cylinder(awning,wood,[x,1.09,z],[.024,2.12,.024]);
  const rail=subgroup(g,[-5.33,0,-.55]);
  for(let i=0;i<8;i++)box(rail,wood,[-.72+i*.2,.87,0],[.025,.035,1.0]);
  for(const x of [-.77,.77])box(rail,wood,[x,.51,0],[.03,1,.035]);
  const desk=g.userData.social.consultation;
  for(let i=0;i<4;i++)box(desk,0xe1dac0,[.29,.715+i*.009,-.07],[.31,.009,.22]);
  const tray=box(desk,wood,[-.40,.708,-.14],[.28,.015,.27]);
  for(const x of [-.53,-.28])box(desk,wood,[x,.735,-.14],[.018,.045,.27]);
  cylinder(desk,wood,[.54,.735,-.17],[.032,.08,.032]);
  box(desk,0x384f4c,[.54,.79,-.17],[.14,.025,.03]);
  for(const x of [-5.95,-4.4]){basket(g,[x,.09,-.30],.76);box(g,wood,[x,.15,-.62],[.47,.25,.31]);}
  // A plant buffer grows with the actual selected spatial tradeoff.
  const growth=subgroup(g),blades=[];
  for(let i=0;i<130;i++)blades.push({p:[-.25+rng()*2.8,.25,.52+rng()*.35],r:[-1.15,rng()*6,0],s:[.021,1,.09+rng()*.14],color:[0x69834e,0x8d9f65][i%2]});
  scatter(growth,leaf,foliage,blades,'service-buffer-grass');state.growth=growth;state.instances+=blades.length;
  state.tray=tray;
 }
 state.instances+=pavingRows.length;
}
export function animateNeighborhood(g,{clock,settings,viewport}){
 const s=g.userData.neighborhood;if(!s)return;
 if(s.stage==='people'){
  const arrived=Number(viewport.dataset.familyProgress)>.78;
  s.clothes.visible=arrived;
  s.growth.scale.y=.45+.55*Number(viewport.dataset.waterOutcome??0);
 }else if(s.stage==='culture')s.vines.rotation.z=Math.sin(clock*.33)*.0015;
 else if(s.stage==='logistics'){
  const extent=clamp(g.userData.social.bufferValue,0,1);
  s.growth.scale.x=Math.max(.02,extent);s.growth.visible=extent>.1;
 }
 viewport.dataset.neighborhood=s.stage;viewport.dataset.detailInstances=String(s.instances);
}
