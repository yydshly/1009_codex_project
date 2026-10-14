import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {countryCatalog} from '../public/world-country-data.js';
import {countryShapes,disputedLines} from '../public/world-country-shapes.js';
import {countrySegments,unwrappedRing,countryLabelEligible,countryLabelBudget,worldHandoffFrame} from '../public/world-country-geometry.js';
import {worldAnchor} from '../public/world-content.js';

test('country ranges resolve all eight neighbors and every searchable anchor',()=>{
 assert.equal(countryCatalog.length,242);assert.equal(new Set(countryCatalog.map(c=>c.id)).size,242);
 for(const c of countryCatalog){assert(countryShapes[c.id]?.length);assert.equal(worldAnchor(c.id).id,c.id);assert(c.name&&Number.isFinite(c.lon)&&Number.isFinite(c.lat));}
 for(const id of ['china','russia','mongolia','kazakhstan','kyrgyzstan','tajikistan','afghanistan','pakistan','india'])assert(countryShapes[id].length);
 const source=JSON.parse(readFileSync(new URL('../public/assets/world-countries-source.json',import.meta.url)));
 assert.equal(source.features,242);assert.equal(source.license,'Public domain');assert.match(source.sha256,/^[a-f0-9]{64}$/);assert(disputedLines.length>0);
});
test('borders cross the date line by the short arc and remain above the globe',()=>{
 const points=countrySegments([[[179,12],[-179,12]]]);
 assert(points.length<=5*6);
 for(let i=0;i<points.length;i+=6){const a=points.slice(i,i+3),b=points.slice(i+3,i+6),mid=a.map((v,j)=>(v+b[j])/2);assert(Math.hypot(...mid)>3.24);assert(a[0]<0&&b[0]<0);}
 assert.equal(countrySegments([[[0,0],[1,0]],[[1,0],[0,0]]]).length,countrySegments([[[0,0],[1,0]]]).length);
 const ring=unwrappedRing([[179,5],[-179,5],[-178,7],[179,5]]);assert(Math.max(...ring.map(p=>p[0]))-Math.min(...ring.map(p=>p[0]))<4);
});
test('prepared global border geometry stays finite, surface-bound and within a fixed budget',()=>{
 const points=countrySegments(Object.values(countryShapes).flat(2));assert(points.length<800000);
 for(let i=0;i<points.length;i+=3){assert(points.slice(i,i+3).every(Number.isFinite));assert(Math.abs(Math.hypot(...points.slice(i,i+3))-3.242)<1e-9);}
});
test('country labels reveal detail at close range and always keep the selection',()=>{
 const small={id:'country-test',rank:5,minLabel:4.5};
 assert(!countryLabelEligible(small,{distance:14,width:900,topic:'position',selected:'china'}));
 assert(countryLabelEligible(small,{distance:5,width:900,topic:'position',selected:'china'}));
 assert(countryLabelEligible(small,{distance:14,width:390,topic:'position',selected:small.id}));
 assert(countryLabelEligible({id:'tajikistan',rank:4},{distance:14,width:390,topic:'neighbors'}));
});
test('short canvases remain readable even when their viewport is relatively wide',()=>{
 assert.equal(countryLabelBudget(660,385),10);
 assert.equal(countryLabelBudget(390,360),10);
 assert.equal(countryLabelBudget(980,736),22);
 assert(countryLabelBudget(980,736,{topic:'relief'})<countryLabelBudget(980,736));
 for(const [w,h] of [[390,360],[660,385],[980,736],[1620,850]]){
  const compact=countryLabelBudget(w,h),detail=countryLabelBudget(w,h,{detail:true});
  assert(detail>compact&&detail<=36);
 }
});
test('globe handoff fades annotations before extents without a discontinuous cut',()=>{
 assert.deepEqual(worldHandoffFrame(0),{labels:1,surface:1});
 let previous=worldHandoffFrame(0);
 for(let t=.05;t<=2;t+=.05){const f=worldHandoffFrame(t);assert(f.labels>=0&&f.labels<=previous.labels);assert(f.surface>=0&&f.surface<=previous.surface);assert(f.labels<=f.surface);previous=f;}
 assert.equal(worldHandoffFrame(.7).labels,0);assert(worldHandoffFrame(.7).surface>.5);
 assert.deepEqual(worldHandoffFrame(1.9),{labels:0,surface:0});
});
