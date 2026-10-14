import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {createHistoryMaterials} from '../public/history-materials.js';

const factory=createHistoryMaterials(),a=factory.material(0xcbb58c),b=factory.material(0xb59b74);
assert.notEqual(a,b,'selection needs independent material instances');
assert.equal(a.map,b.map,'same surface shares its pixel data');
assert.equal(a.bumpMap,b.bumpMap);
assert.equal(a.bumpMap,a.roughnessMap,'height and roughness occupy separate channels of one texture');
assert.equal(a.map.colorSpace,THREE.SRGBColorSpace);
assert.equal(a.bumpMap.colorSpace,THREE.NoColorSpace);
assert.equal(a.map.minFilter,THREE.LinearMipmapLinearFilter,'weave must filter smoothly as camera recedes');
assert.equal(a.map.generateMipmaps,true);
const bColor=b.color.clone(),base=a.userData.baseColor.clone();a.color.multiplyScalar(.3);a.emissiveIntensity=.01;
assert(a.userData.baseColor.equals(base),'emphasis cannot damage its saved pigment');
assert(b.color.equals(bColor),'emphasis cannot leak through shared texture users');
assert(a.emissiveIntensity!==b.emissiveIntensity);
let albedoDisposals=0,detailDisposals=0;
a.map.addEventListener('dispose',()=>albedoDisposals++);a.bumpMap.addEventListener('dispose',()=>detailDisposals++);
a.dispose();assert.equal(albedoDisposals,0,'surviving material still owns the shared texture');
a.dispose();assert.equal(albedoDisposals,0,'duplicate owner cleanup must be safe');
b.dispose();assert.equal(albedoDisposals,1);assert.equal(detailDisposals,1);
assert.deepEqual(factory.stats(),{materials:0,surfaces:0,textures:0,bytes:0});

const names=['plaster','cloth','wood','earth','stone','skin','fur','foliage','water'],materials=names.map(surface=>factory.material(0xb59b74,{surface}));
const signatures=[];
for(const m of materials){
 assert(m.map.image.width===64||m.map.image.width===128);
 assert.equal(m.map.wrapS,THREE.RepeatWrapping);assert.equal(m.map.wrapT,THREE.RepeatWrapping);
 let low=255,high=0;const data=m.map.image.data;
 for(let i=0;i<data.length;i+=4){low=Math.min(low,data[i]);high=Math.max(high,data[i]);assert.equal(data[i],data[i+1]);assert.equal(data[i],data[i+2]);assert.equal(data[i+3],255);}
 assert(high>low,'material must include visible but subtle surface variation');
 assert(low>=228&&high<=255,'pigment modulation must stay quiet rather than noisy');
 assert(m.bumpScale<=.00031&&m.bumpScale>0,'relief is small relative to the miniature');
 assert(m.emissiveIntensity<.1,'ordinary surfaces retain directional light shading');
 signatures.push(createHash('sha256').update(data).digest('hex'));
}
assert.equal(new Set(signatures).size,names.length,'the surfaces have distinct structures');
assert(factory.stats().bytes<650000,'all nine texture types fit within 650 KB of source pixel data');
const second=createHistoryMaterials(),same=second.material(0xb59b74,{surface:'wood'});
assert.deepEqual(same.map.image.data,materials[2].map.image.data,'no random flicker or different surface on rebuild');
second.dispose();assert.equal(second.stats().textures,0);
const lamp=factory.material(0xe4bc71,{lit:true});assert.equal(lamp.userData.localLight,true);assert.equal(lamp.map,null,'local lights keep a smooth glow');assert.equal(lamp.emissiveIntensity,.65);
assert.throws(()=>factory.material(0xffffff,{surface:'unknown'}),/Unknown history surface/);
factory.dispose();factory.dispose();assert.deepEqual(factory.stats(),{materials:0,surfaces:0,textures:0,bytes:0});
assert.throws(()=>factory.material(0xffffff),/has been disposed/);

// Mimic repeated history/place changes using the existing parent traversal's
// material.dispose() calls instead of relying on a new owner cleanup API.
const cycling=createHistoryMaterials();let released=0;
for(let turn=0;turn<30;turn++){
 const walls=cycling.material(0xcbb58c),gate=cycling.material(0xcbb58c);
 walls.map.addEventListener('dispose',()=>released++);walls.dispose();gate.dispose();
 assert.equal(cycling.stats().bytes,0,'rebuild must not accumulate textures');
}
assert.equal(released,30);
console.log('历史近景材质：独立强调、确定性表面、mipmap、650 KB 像素预算、共享纹理与反复切换释放通过');
