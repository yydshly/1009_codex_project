import * as THREE from 'three';
import {surfaceMaterial} from './surface.js';

// Original domestic craft details. Patterns and rhythm exercises are authored;
// neither architecture nor clothing is an ethnographic reconstruction.
export function decorateAtmosphere(stage,g,a){
 const {solid,subgroup,box,cylinder,ball}=a;
 const wood=surfaceMaterial(0x806043,{roughness:.9},'wood'),clay=surfaceMaterial(0xa87952,{roughness:.9},'clay');
 const state={cloth:[],vines:[]};g.userData.atmosphere=state;
 const lattice=(x,y,z,w,h)=>{
  const frame=subgroup(g,[x,y,z]);
  box(frame,wood,[0,0,-.025],[w+.08,h+.08,.07]);box(frame,0x293c37,[0,0,.016],[w,h,.025]);
  for(let i=0;i<6;i++)box(frame,wood,[-w/2+i*w/5,0,.055],[.026,h,.025]);
  for(let i=0;i<5;i++)box(frame,wood,[0,-h/2+i*h/4,.058],[w,.025,.025]);
 };
 const cloth=(parent,pos,w,d,color)=>{
  const geo=new THREE.PlaneGeometry(w,d,24,12);geo.rotateX(-Math.PI/2);
  const p=geo.attributes.position;
  const sag=Math.min(.12,w*.045,d*.055);
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,-sag*(1-(x/(w/2))**2)+Math.min(.014,sag*.3)*Math.sin(z*11));}
  geo.computeVertexNormals();const m=solid(parent,geo,surfaceMaterial(color,{roughness:1,side:THREE.DoubleSide},'textile'),pos);
  state.cloth.push({m,base:p.array.slice()});return m;
 };
 const vessel=(parent,pos,s=.23)=>{
  const geo=new THREE.LatheGeometry([[.04,0],[.12,.02],[.17,.14],[.15,.26],[.075,.32],[.075,.37],[.085,.38]].map(p=>new THREE.Vector2(...p)),24);
  return solid(parent,geo,clay,pos,[s*3,s*3,s*3]);
 };
 if(stage==='oasis'){
  cloth(g,[4.88,1.75,1.47],.72,1.7,0xbaa681);
  const folded=cloth(g,[4.77,.45,2.59],.55,.48,0x809086);folded.rotation.y=.13;
  vessel(g,[5.09,.065,2.68],.18);vessel(g,[2.92,.065,1.07],.13);
 }else if(stage==='market'){
  g.traverse(o=>{if(['legacy-market-shade','legacy-stall-roof'].includes(o.name))o.visible=false;});
  for(const x of [-3.7,0,3.7])lattice(x+.48,1.06,-2.08,.45,.57);
  for(const [i,x]of [-3.7,0,3.7].entries()){
   cloth(g,[x,1.91,-.82],2.25,1.1,[0xac7455,0x507c7d,0x8c9066][i]);
   for(const side of [-1,1])box(g,wood,[x+side*.99,1.91,-.82],[.025,.025,1.16]);
  }
  const counter=subgroup(g,[-3.65,.88,-.6]);
  for(let i=0;i<3;i++){
   const fold=cloth(counter,[-.5+i*.47,.09+i*.023,.03],.42,.47,[0xb38161,0x547b7b,0x9d9567][i]);
   fold.rotation.y=i*.08;box(counter,0xc2ac83,[-.5+i*.47,.075+i*.02,.03],[.4,.08,.44]);
  }
  for(const x of [-5.7,5.6])cloth(g,[x,2.49,-.1],2.4,3.2,x<0?0xc8ae82:0x92ab9a);
  vessel(g,[3.35,.865,-.61],.23);vessel(g,[3.88,.87,-.61],.16);
 }else if(stage==='people'){
  lattice(4.88,.88,1.335,.72,.49);
  const sewing=subgroup(g,[5.37,.285,2.58]);
  cloth(sewing,[0,.09,0],.68,.42,0x74897e);
  const spool=cylinder(sewing,wood,[-.21,.12,.05],[.043,.15,.043]);spool.rotation.z=Math.PI/2;
  cylinder(sewing,0xcbb998,[.22,.08,-.1],[.025,.085,.025]);
  for(let i=0;i<5;i++)box(sewing,0xcfbc8e,[.24,.08+i*.008,-.1],[.07,.004,.01]);
  vessel(g,[5.84,.045,2.99],.20);
  // Hanging linen sways from its top edge rather than scaling as a rigid block.
  for(let i=0;i<3;i++){
   const m=cloth(g,[3.93+i*.55,1.4,1.52],.39,.55,[0xc1b496,0x8a9b90,0x9f8971][i]);m.rotation.x=Math.PI/2;
   state.householdCloth??=[];state.householdCloth.push(m);
  }
 }else if(stage==='culture'){
  for(const x of [-4.7,4.7])lattice(x,1.45,-3.065,1.1,.68);
  const vine=new THREE.CatmullRomCurve3([[-5.3,0,1.9],[-5.24,1.4,1.6],[-5.1,3.05,1.2],[-2.8,3.17,.75],[0,3.11,.6],[3.4,3.14,.9],[5.3,3.02,1.2]].map(p=>new THREE.Vector3(...p)));
  solid(g,new THREE.TubeGeometry(vine,72,.025,7,false),wood);
  // Four branching rows of thin leaves are instanced by scene-neighborhood.js.
  const practice=subgroup(g,[-.48,.57,2.79]);practice.name='original-rhythm-practice';
  cylinder(practice,wood,[0,0,0],[.14,.036,.14]);
  const skin=cylinder(practice,surfaceMaterial(0xd9cba5,{roughness:.94},'textile'),[0,.022,0],[.13,.009,.13]);
  g.userData.social.practiceDrum=practice;g.userData.social.practiceSkin=skin;
  cloth(g,[3.7,.325,1.8],.72,.50,0x9f7462);
  vessel(g,[3.7,.41,1.77],.15);
 }else if(stage==='logistics'){
  cloth(g,[-1.7,2.17,.15],2.38,1.58,0xa0b1a0);
  for(const x of [-2.82,-.58])box(g,wood,[x,2.17,.15],[.025,.028,1.57]);
  cloth(g,[3.4,1.42,.63],1.25,.97,0xb1bca5);
 }
 return state;
}
export function animateAtmosphere(g,clock){
 const s=g.userData.atmosphere;if(!s)return;
 s.cloth.forEach(({m,base})=>{const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=base[i*3],z=base[i*3+2];p.setY(i,base[i*3+1]+Math.sin(clock*.8+x*2+z*3)*.004);}p.needsUpdate=true;});
 s.vines.forEach(({leaf,base},i)=>leaf.rotation.z=base+Math.sin(clock*.65+i*.7)*.028);
 if(s.householdCloth){const visible=g.userData.detail.home.visible;s.householdCloth.forEach(m=>m.visible=visible);}
}
