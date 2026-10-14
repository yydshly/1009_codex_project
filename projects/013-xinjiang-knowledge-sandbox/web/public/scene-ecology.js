import * as THREE from 'three';
import {surfaceMaterial} from './surface.js';

// Authored set dressing, in scene metres. Never applied to measured DEM meshes.
// Shared geometry and instancing keep detail independent of the recording history.
const stone=new THREE.IcosahedronGeometry(1,1);
const leaf=new THREE.BufferGeometry();
leaf.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.45,.015,.42,0,.04,1,.45,.015,.42],3));
leaf.setIndex([0,1,2,0,2,3]);leaf.computeVertexNormals();
const foliage=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,side:THREE.DoubleSide});
const rock=surfaceMaterial(0xffffff,{roughness:1},'soil');
const dummy=new THREE.Object3D(),tint=new THREE.Color();
function random(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function instances(parent,geometry,material,rows){
 const mesh=new THREE.InstancedMesh(geometry,material,rows.length);
 rows.forEach((r,i)=>{dummy.position.set(...r.p);dummy.rotation.set(...(r.r??[0,0,0]));dummy.scale.set(...r.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,tint.setHex(r.color));});
 mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function leafyCrown(parent,height=1.8,seed=1){
 const rng=random(seed),rows=[];
 for(let i=0;i<170;i++){
  const angle=rng()*Math.PI*2,rad=Math.sqrt(rng())*.60,y=height*(.57+rng()*.37);
  const length=.14+rng()*.13;
  rows.push({p:[Math.cos(angle)*rad,y,Math.sin(angle)*rad*.84],r:[(rng()-.5)*1.1,angle,(rng()-.5)*.7],s:[length*.66,1,length],color:[0x56734b,0x788b55,0x879965,0x9ca774][i%4]});
 }
 const crown=instances(parent,leaf,foliage,rows);crown.name='living-canopy';return crown;
}
export function decorateEcology(stage,g,a){
 if(g.userData.ecology)return;
 const {solid,box,cylinder,subgroup}=a,rng=random(47+stage.length*111),rows=[];
 // Irregular edge stones and small chips; leave walking and exchange lanes clear.
 for(let i=0;i<160;i++){
  const x=(rng()-.5)*13.7,z=(rng()-.5)*7.75;
  if(Math.abs(z)<2.8&&Math.abs(x)<5.9)continue;
  const size=.028+rng()*.073;
  rows.push({p:[x,.068,z],r:[rng(),rng()*6,rng()],s:[size*(.8+rng()),size*.4,size],color:[0x958772,0xb3a28a,0xcbbaa0][i%3]});
 }
 instances(g,stone,rock,rows);
 const crowns=[];g.traverse(o=>{if(o.name==='living-canopy')crowns.push(o);});
 g.userData.ecology={instances:rows.length,crowns};
 if(stage!=='oasis')return;
 // A varied dry-soil surface and worn path link the gate, courtyard and field.
 const ground=new THREE.PlaneGeometry(14.05,8.0,88,50);ground.rotateX(-Math.PI/2);
 const gp=ground.attributes.position;for(let i=0;i<gp.count;i++){const x=gp.getX(i),z=gp.getZ(i);gp.setY(i,.004*Math.sin(x*3.1+z*.9)*Math.sin(z*4.3));}ground.computeVertexNormals();
 g.getObjectByName('oasis-legacy-ground').visible=false;
 const soil=solid(g,ground,surfaceMaterial(0xbda882,{roughness:1},'soil'),[0,.047,0]);soil.castShadow=false;
 const grassRows=[];
 for(let i=0;i<300;i++){
  const x=2.02+rng()*3.04,z=-3.06+rng()*1.12;
  if(rng()<.18)continue;
  grassRows.push({p:[x,.09,z],r:[-1.05-rng()*.5,rng()*6,(rng()-.5)*.25],s:[.022,1,.075+rng()*.11],color:[0x78804d,0x8d975d,0xacac70][i%3]});
 }
 instances(g,leaf,foliage,grassRows);
 const pathRows=[];
 for(let i=0;i<54;i++){
  const t=i/53,x=-1.2+t*3.9,z=.85+Math.sin(t*Math.PI)*.5;
  pathRows.push({p:[x+(rng()-.5)*.38,.064,z+(rng()-.5)*.38],r:[0,rng()*6,0],s:[.11+rng()*.08,.022,.10+rng()*.08],color:[0x9e9179,0xb8a88b,0xcbba9c][i%3]});
 }
 instances(g,stone,rock,pathRows);
 const wood=surfaceMaterial(0x897052,{roughness:1},'wood'),clay=surfaceMaterial(0xa47958,{roughness:1},'clay');
 // Worn threshold, framed window, courtyard shade and a working shelf.
 box(g,wood,[3.9,.13,2.40],[2.70,.15,.15]);
 for(const x of [2.61,5.19])box(g,wood,[x,.87,2.42],[.11,1.64,.11]);
 box(g,wood,[3.9,1.69,2.42],[2.80,.12,.13]);
 box(g,wood,[3.9,.79,.708],[.90,.06,.03]);box(g,wood,[3.9,1.23,.708],[.90,.06,.03]);
 for(const x of [3.48,3.9,4.32])box(g,wood,[x,1.0,.715],[.035,.48,.04]);
 const shelf=subgroup(g,[4.93,.48,1.25]);box(shelf,wood,[0,0,0],[.38,.045,.56]);
 for(let i=0;i<3;i++)cylinder(shelf,clay,[0,.10,-.18+i*.18],[.058,.18,.058]);
 const basketGeo=new THREE.LatheGeometry([[.14,0],[.23,.05],[.26,.24],[.28,.27]].map(p=>new THREE.Vector2(...p)),24);
 solid(g,basketGeo,surfaceMaterial(0xb7a079,{roughness:1,side:THREE.DoubleSide},'basket'),[5.53,.055,2.60]);
 for(let i=0;i<7;i++)solid(g,stone,clay,[5.53+(rng()-.5)*.26,.27+rng()*.07,2.60+(rng()-.5)*.26],[.065,.052,.06]);
 // Thin, irregular stones along the visible canal banks; water remains legible.
 const banks=[];
 for(let i=0;i<45;i++)for(const side of [-1,1])banks.push({p:[-5.96+i*.108,.062,-.4+side*.23+(rng()-.5)*.035],r:[0,rng()*6,0],s:[.067,.038,.048],color:[0x96846b,0xaa987f,0xb9aa91][i%3]});
 instances(g,stone,rock,banks);
 g.userData.ecology.instances+=grassRows.length+pathRows.length+banks.length;
}
export function animateEcology(g,clock){g.userData.ecology?.crowns.forEach((c,i)=>{c.rotation.z=Math.sin(clock*.43+i*1.31)*.009;c.rotation.x=Math.sin(clock*.37+i*.9)*.005;});}
