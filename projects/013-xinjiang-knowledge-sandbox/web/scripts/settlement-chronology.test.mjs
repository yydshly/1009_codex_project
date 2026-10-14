import test from 'node:test';
import assert from 'node:assert/strict';
import {settlementFrame,settlementStages,settlementPanel,settlementSource} from '../public/settlement-chronology.js';
import {directorPaths} from '../public/exploration-director-paths.js';
import * as THREE from 'three';
import {decorateSettlement,animateSettlement} from '../public/settlement-chronology-scene.js';
test('initial irrigation is retained before the later main canal',()=>{
 const f=settlementFrame('settle',1);assert.equal(f.initialWater,1);assert.equal(f.initialFields,1);assert.equal(f.trench,0);assert.equal(f.newWater,0);assert.equal(f.expansion,0);
 assert.match(settlementStages[0].fact,/绰霍尔河/);assert.match(settlementSource,/neac\.gov\.cn/);
});
test('construction extends a dry canal before 1808 water and additional fields',()=>{
 for(const p of [0,.2,.5,1]){const f=settlementFrame('dig',p);assert.equal(f.newWater,0);assert.equal(f.expansion,0);assert.equal(f.initialWater,1);}
 assert(settlementFrame('dig',.7).trench>settlementFrame('dig',.2).trench);
 const early=settlementFrame('flow',.35),late=settlementFrame('flow',1);assert(early.newWater>0);assert.equal(early.expansion,0);assert.equal(late.newWater,1);assert.equal(late.expansion,1);
});
test('rewinding removes later construction and never changes the initial irrigation',()=>{
 const future=settlementFrame('flow',1),past=settlementFrame('settle',1);assert.equal(future.expansion,1);assert.equal(past.trench+past.expansion+past.newWater,0);assert.equal(future.initialWater,past.initialWater);
 for(const bad of [NaN,Infinity,-20,999])for(const phase of ['settle','dig','flow']){const f=settlementFrame(phase,bad);for(const key of ['settled','trench','newWater','expansion'])assert(f[key]>=0&&f[key]<=1);}
});
test('the historical director progresses through dates and retains the separate experiment',()=>{
 const models=directorPaths.xibe.shots.filter(s=>s.model);assert.deepEqual(models.map(s=>s.settlement),['settle','dig','flow']);assert(models.every(s=>s.choice===undefined&&s.speech&&s.audio));assert.equal(models[2].audio.beat,'irrigation');
 const html=settlementPanel('dig');assert.match(html,/data-settlement-experiment/);assert.match(html,/data-mt-stop="map"/);assert.match(html,/不是古村/);
});
test('rendered chronology reverses actual canal meshes and keeps a fixed geometry budget',()=>{
 const g=new THREE.Group(),primitive=new THREE.BoxGeometry(),material=new THREE.MeshBasicMaterial();
 const subgroup=(parent,pos=[0,0,0])=>{const child=new THREE.Group();child.position.set(...pos);parent.add(child);return child;};
 const mesh=(parent,color,pos,size)=>{const m=new THREE.Mesh(primitive,material);m.position.set(...pos);m.scale.set(...size);parent.add(m);return m;};
 const rig=()=>({root:new THREE.Group(),pose(){}}),object=()=>new THREE.Group();
 const d=g.userData={pavilion:object(),entryArch:object(),official:rig(),scroll:object(),houses:[object()],crops:[object()],families:[{group:object(),rigs:[rig(),rig(),rig()]}],workers:[rig(),rig()],workerTools:[object()],water:[object()]};
 d.chronology=decorateSettlement(g,{subgroup,box:mesh,ball:mesh,cylinder:mesh,textSign:(parent,title,sub,pos)=>mesh(parent,0,pos,[1,1,1])});
 const c=d.chronology,viewport={dataset:{}},camera=new THREE.PerspectiveCamera(),count=()=>{let n=0;g.traverse(()=>n++);return n;},budget=count();
 animateSettlement(g,{phase:'flow',progress:1},5,camera,viewport);assert(c.water.every(m=>m.visible));assert.equal(c.field.visible,true);assert.equal(viewport.dataset.settlementNewWater,'1.000');
 animateSettlement(g,{phase:'settle',progress:1},5,camera,viewport);assert(c.water.every(m=>!m.visible));assert(c.trench.every(m=>!m.visible));assert.equal(c.field.visible,false);assert.equal(d.water[0].visible,true);
 animateSettlement(g,{phase:'dig',progress:.5},5,camera,viewport);assert(c.trench.some(m=>m.visible));assert(c.trench.some(m=>!m.visible));assert(c.water.every(m=>!m.visible));
 for(let i=0;i<100;i++)animateSettlement(g,{phase:'flow',progress:i/100},5,camera,viewport);assert.equal(count(),budget);
 animateSettlement(g,null,5,camera,viewport);assert.equal(c.root.visible,false);assert.equal(d.entryArch.visible,true);assert.equal(d.workerTools[0].visible,true);
});
