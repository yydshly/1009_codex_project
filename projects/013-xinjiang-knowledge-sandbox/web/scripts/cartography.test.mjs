import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {cartographicScale,atlasLabelPriority,atlasLabelEligible} from '../public/cartographic-labels.js';
import {createXinjiangRange} from '../public/xinjiang-range.js';
import {regionBoundary} from '../public/region-boundary.js';
import {globePosition} from '../public/world-content.js';
import {relationPanel,relationDock} from '../public/spatial-relations.js';

test('cartography retains macro context at global scale and reveals local detail after approach',()=>{
 const options={selected:'xinjiang',scale:'planet',topic:'position'};
 assert(atlasLabelPriority({id:'asia',kind:'continent'},options)>atlasLabelPriority({id:'china',kind:'boundary-country'},options));
 assert(!atlasLabelEligible({id:'beijing',kind:'city'},options));
 assert(atlasLabelEligible({id:'beijing',kind:'city'},{...options,scale:'region'}));
 assert(atlasLabelEligible({id:'beijing',kind:'city'},{...options,selected:'beijing'}));
 assert(!atlasLabelEligible({id:'asia',kind:'continent'},{...options,scale:'region'}));
 assert(atlasLabelEligible({id:'country-test',kind:'boundary-country',rank:6},{...options,selected:'country-test'}));
 assert.equal(cartographicScale(7.3,1.4),'region');
 assert.equal(cartographicScale(8.6,1.4),'continent');
 assert.equal(cartographicScale(14,1.4),'planet');
 for(const aspect of [.45,.7,1,1.8])for(const distance of [7.3,8.6,14])assert.equal(cartographicScale(3.2+(distance-3.2)*Math.max(1,.9/aspect),aspect),cartographicScale(distance,1.4));
});
test('shared Xinjiang range remains geographic, follows its supplied surface, and reuses geometry',()=>{
 const ground=(lon,lat,lift)=>new THREE.Vector3(...globePosition(lon,lat,3.2+lift));
 const range=createXinjiangRange(ground),fill=range.children[0].geometry.attributes.position;
 assert(range.userData.triangles>1000&&range.userData.triangles<35000);
 const extent={lon:[Math.min(...regionBoundary.map(p=>p[0])),Math.max(...regionBoundary.map(p=>p[0]))],lat:[Math.min(...regionBoundary.map(p=>p[1])),Math.max(...regionBoundary.map(p=>p[1]))]};
 for(let i=0;i<fill.count;i++){
  const v=new THREE.Vector3().fromBufferAttribute(fill,i),lon=Math.atan2(-v.z,v.x)*180/Math.PI,lat=Math.asin(v.y/v.length())*180/Math.PI;
  assert(Math.abs(v.length()-3.203)<1e-6);
  assert(lon>=extent.lon[0]-1e-4&&lon<=extent.lon[1]+1e-4&&lat>=extent.lat[0]-1e-4&&lat<=extent.lat[1]+1e-4);
 }
 const geometry=range.children.map(o=>o.geometry);for(let i=0;i<20;i++){range.visible=i%2===0;assert.deepEqual(range.children.map(o=>o.geometry),geometry);}
 for(const o of range.children){assert(o.material.depthTest);o.geometry.dispose();o.material.dispose();}
});
test('geography comparison explains the visible state and omits a route legend',()=>{
 for(const id of ['zhang','protectorate','xibe']){
  const p=relationPanel(id,'region',undefined,{geographyOnly:true}),d=relationDock(id,'region',{geographyOnly:true});
  assert(p.includes('叠加历史联系后再观察路线'));assert(d.includes('新疆范围'));assert(!d.includes('sr-key-route'));
  assert(relationDock(id,'region').includes('sr-key-route'));
 }
});
