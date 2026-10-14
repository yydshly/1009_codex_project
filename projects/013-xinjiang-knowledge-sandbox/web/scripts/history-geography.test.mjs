import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {mapFeatures} from '../public/map-learning-content.js';
import {globePosition} from '../public/world-content.js';
import {buildHistoryGeography,historyGeographyPlan,historyGeographyStrength} from '../public/history-geography.js';

test('history geography reuses existing observation coordinates and limits each event to two relevant landmarks',()=>{
 for(const event of ['zhang','protectorate','xibe']){
  const plan=historyGeographyPlan(event);assert.equal(plan.length,2);
  for(const item of plan){const source=mapFeatures.find(f=>f.id===item.sourceId);assert(source);assert.deepEqual(item.anchor,source.anchor);assert.deepEqual(item.shape,source.shape??[]);assert.deepEqual(item.section,source.section);assert(item.title&&item.scope);}
 }
 assert.deepEqual(historyGeographyPlan('migration'),historyGeographyPlan('xibe'));
 assert.deepEqual(historyGeographyPlan('missing'),[]);
 assert.equal(historyGeographyPlan('zhang')[1].kind,'basin');
 assert.equal(historyGeographyPlan('xibe')[0].id,'ili-water');
});

test('geographic context follows the spherical surface, remains lighter than routes, and updates without rebuilding',()=>{
 const root=new THREE.Group(),viewport={dataset:{}},markers=[];
 const point=(lon,lat)=>new THREE.Vector3(...globePosition(lon,lat,3.2));
 const addMarker=(node,position)=>{const marker={position,button:{dataset:{kgEventDestination:node.id},classList:{add(){}},style:{},setAttribute(){}}};markers.push(marker);return marker;};
 const layer=buildHistoryGeography({root,event:{id:'zhang'},point,viewport,addMarker});
 const geometries=[],materials=[];root.traverse(o=>{if(o.geometry){geometries.push(o.geometry);const p=o.geometry.getAttribute('position');for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getY(i),p.getZ(i));assert(Math.abs(r-3.20065)<1e-6,'vertices stay at a tiny fixed surface offset');}}if(o.material){materials.push(o.material);assert.equal(o.material.depthWrite,false);assert.equal(o.material.depthTest,true);}});
 assert(markers.every(m=>m.priority===3&&m.visible&&m.title&&m.button.disabled));
 assert(markers.every(m=>!m.button.dataset.kgEventDestination));
 const background=materials.map(m=>m.opacity);layer.update(.5,{focus:'process'});assert(materials.every((m,i)=>m.opacity<background[i]));
 layer.update(1,{focus:'impact',context:true});assert(markers.every(m=>!m.visible));
 layer.update(0,{focus:'background'});assert.deepEqual(materials.map(m=>m.opacity),background);assert(markers.every(m=>m.visible));
 const after=[];root.traverse(o=>{if(o.geometry)after.push(o.geometry);});assert.deepEqual(after,geometries,'frame updates retain original geometry instances');
 assert.equal(viewport.dataset.historyGeographyFeatures,'tianshan,tarim');
 assert(historyGeographyStrength('background')>historyGeographyStrength('process'));
 assert(historyGeographyStrength('process')>historyGeographyStrength('impact'));
 for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
});
