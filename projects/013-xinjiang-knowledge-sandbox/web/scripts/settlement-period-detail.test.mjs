import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createActor} from '../public/actor-rig.js';
import {settlementFrame} from '../public/settlement-chronology.js';
import {decorateSettlement,animateSettlement} from '../public/settlement-chronology-scene.js';
import {settlementCameraPose,setPeriodFocus,settlementDetails} from '../public/settlement-period-detail.js';

function fixture(){
 const g=new THREE.Group(),actors=[],geo=new THREE.BoxGeometry(),sphere=new THREE.SphereGeometry(1,16,12),cyl=new THREE.CylinderGeometry(1,1,1,16);
 const subgroup=(parent,pos=[0,0,0])=>{const child=new THREE.Group();child.position.set(...pos);parent.add(child);return child;};
 const solid=(parent,geometry,color,pos=[0,0,0],size=[1,1,1])=>{const m=new THREE.Mesh(geometry,typeof color==='number'?new THREE.MeshStandardMaterial({color}):color);m.position.set(...pos);m.scale.set(...size);parent.add(m);return m;};
 const a={solid,subgroup,box:(p,c,pos,size)=>solid(p,geo,c,pos,size),ball:(p,c,pos,size)=>solid(p,sphere,c,pos,size),cylinder:(p,c,pos,size)=>solid(p,cyl,c,pos,size),textSign:(p,t,s,pos)=>solid(p,geo,0,pos)};
 a.human=(parent,color,scale)=>{const actor=createActor(parent,color,scale,null,a);actors.push(actor);return actor;};
 const object=()=>subgroup(g),rig=()=>({root:object(),pose(){}});
 const d=g.userData={pavilion:object(),entryArch:object(),official:rig(),scroll:object(),houses:[object()],crops:[object()],families:[{group:object(),rigs:[rig()]}],workers:[rig(),rig()],workerTools:[object()],water:[object()]};
 d.chronology=decorateSettlement(g,a);
 const viewport={dataset:{}},camera=new THREE.PerspectiveCamera(),advance=(phase,p,time)=>{for(const actor of actors)actor.beginFrame(1/60);animateSettlement(g,{phase,progress:p},time,camera,viewport);};
 return {g,d,actors,advance,viewport};
}
const transforms=root=>{const rows=[];root.traverse(o=>rows.push([o.id,o.visible,...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()]));return rows;};
test('the period set has its own dress and houses, while the original experiment can return',()=>{
 const f=fixture(),p=f.d.chronology.period;f.advance('settle',1,0);
 assert.equal(f.d.houses[0].visible,false);assert(p.houses.every(h=>h.name==='sloping-roof-house'));
 assert(p.residents.every(a=>a.root.userData.periodClothing==='traditional-form-reference'&&!a.clothing.torso.visible));
 assert.equal(p.initialWater.visible,true);
 animateSettlement(f.g,null,0,new THREE.PerspectiveCamera(),f.viewport);assert.equal(f.d.houses[0].visible,true);assert.equal(p.root.visible,false);
});
test('a paused clock freezes faces, working limbs and tools rather than continuing damping',()=>{
 const f=fixture();f.advance('dig',1,2);const before=transforms(f.d.chronology.period.root);
 for(let i=0;i<60;i++)f.advance('dig',1,2);
 assert.deepEqual(transforms(f.d.chronology.period.root),before);
 f.advance('dig',1,2.1);assert.notDeepEqual(transforms(f.d.chronology.period.root),before);
});
test('both hands contact the tool and the blade reaches the canal bank at the low point',()=>{
 const f=fixture();f.advance('dig',1,.5/.23);const p=f.d.chronology.period;
 f.g.updateMatrixWorld(true);
 const tool=p.tools[0],worker=p.workers[0];
 for(const [side,y]of [['left',.22],['right',.03]]){
  const target=tool.localToWorld(new THREE.Vector3(0,y,0));
  assert(worker.worldHandPosition(side).distanceTo(target)<.035,side+' hand must grip the handle');
 }
 const blade=tool.children[1],bounds=new THREE.Box3().setFromObject(blade);assert(bounds.min.y<.08&&bounds.min.y>-.03,'blade should reach the authored ground');
});
test('detail cameras remain usable at narrow and wide canvas sizes, with bounded mesh reuse',()=>{
 const f=fixture(),p=f.d.chronology.period;setPeriodFocus(p,'people');const budget=transforms(p.root).length;
 for(const focus of Object.keys(settlementDetails))for(const aspect of [.4,.9,1.8]){const pose=settlementCameraPose(focus,52,aspect);assert(pose.position.toArray().every(Number.isFinite));assert(pose.target.x>44);assert(pose.position.distanceTo(pose.target)>=4.4);}
 for(let i=0;i<60;i++){setPeriodFocus(p,i%2?'people':'home');f.advance(i%3?'flow':'settle',i/60,i/60);}
 assert.equal(transforms(p.root).length,budget);f.advance('settle',1,2);assert.equal(p.initialWater.visible,true);assert.equal(f.d.chronology.field.visible,false);
});
test('the actual scene connects branch water, wet plots and residents who move to farm',()=>{
 const f=fixture(),c=f.d.chronology,p=c.period;
 f.advance('flow',.35,1);const initial=p.residents.map(a=>a.root.position.clone());
 assert(c.branchWater.every(m=>!m.visible));assert(c.wet.every(m=>!m.visible));
 f.advance('flow',.65,2);assert(c.branchWater.some(m=>m.visible));assert(c.wet.every(m=>!m.visible));
 f.advance('flow',1,3);assert(c.branchWater.every(m=>m.visible));assert(c.wet.every(m=>m.visible));
 assert(p.residents.every((a,i)=>a.root.position.distanceTo(initial[i])>1));assert.equal(f.viewport.dataset.settlementResidentResponse,'1.000');
 f.advance('settle',1,3);assert(c.branchWater.every(m=>!m.visible));assert(c.wet.every(m=>!m.visible));assert(p.residents.every(a=>a.root.position.z<0));
});
test('clothing inspection reveals the foreground and does not build new figures',()=>{
 const f=fixture(),p=f.d.chronology.period;setPeriodFocus(p,'people');f.advance('flow',1,2);
 assert(p.foreground.every(m=>!m.visible));assert.equal(p.door.visible,false);assert(p.residents.every(a=>a.root.position.z>2));
 setPeriodFocus(p,'story');f.advance('flow',1,2);assert(p.foreground.every(m=>m.visible));assert.equal(p.door.visible,true);assert(p.residents.every(a=>a.root.position.x<0));assert.equal(f.actors.length,4);
});
