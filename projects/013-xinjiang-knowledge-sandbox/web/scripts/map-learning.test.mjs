import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mapFeatures,mapDefaults,mapItems,selectedMapFeature,densifyMapLine} from '../public/map-learning-content.js';
import {mapLessons,referenceCities,historicalPeriods,learningPlaces,knowledgeSources} from '../public/knowledge-content.js';
import {elevationProfile} from '../public/passage-data.js';
const dem=JSON.parse(fs.readFileSync(new URL('../public/assets/xinjiang-dem.json',import.meta.url),'utf8'));
test('map observations stay inside measured coverage and resolve history and place links',()=>{
 assert.equal(new Set(mapFeatures.map(f=>f.id)).size,mapFeatures.length);
 for(const lens of mapLessons.map(l=>l.id)){
  const items=mapItems(lens,referenceCities);assert.ok(items.length);
  assert.equal(selectedMapFeature(lens,'invalid',referenceCities).id,mapDefaults[lens]);
  for(const f of items){
   assert.ok(historicalPeriods.some(h=>h.id===f.period));
   if(f.place)assert.ok(learningPlaces.some(p=>p.id===f.place));
   for(const source of f.sources)assert.ok(knowledgeSources[source]?.url);
   if(f.section){const p=elevationProfile(dem,f.section);assert.ok(p.distance>0);assert.ok(p.samples.every(s=>Number.isFinite(s.height)));
    assert.deepEqual(densifyMapLine(f.section)[0],f.section[0]);assert.deepEqual(densifyMapLine(f.section).at(-1),f.section.at(-1));}
  }
 }
 assert.equal(mapItems('cities',referenceCities).length,14);
});
test('geographic densification has bounded spacing without losing turns or endpoints',()=>{
 const p=densifyMapLine([[0,0],[.3,.4],[.6,.4]],.07);assert.deepEqual(p[0],[0,0]);assert.deepEqual(p.at(-1),[.6,.4]);assert.ok(p.some(([x,y])=>x===.3&&y===.4));
 for(let i=1;i<p.length;i++)assert.ok(Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1])<=.07+1e-10);
 assert.deepEqual(densifyMapLine([]),[]);assert.deepEqual(densifyMapLine([[2,3]]),[[2,3]]);
});
