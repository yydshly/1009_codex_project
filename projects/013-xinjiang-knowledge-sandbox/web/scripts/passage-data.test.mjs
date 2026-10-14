import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {elevationProfile,geographicDistance,passageRoutes,reliefSection,turpanSection} from '../public/passage-data.js';
test('profile retains signed physical metres and geographic endpoints',()=>{
 const dem={bounds:[0,0,2,2],cols:3,rows:3,heights:[-100,-100,-100,-100,-100,-100,-100,-100,-100]};
 const p=elevationProfile(dem,[[0,1],[1,1],[2,1]],11);
 assert.equal(p.min,-100);assert.equal(p.max,-100);assert.equal(p.samples.length,11);
 assert.deepEqual([p.samples[0].lon,p.samples[0].lat],[0,1]);
 assert.deepEqual([p.samples.at(-1).lon,p.samples.at(-1).lat],[2,1]);
 assert(Math.abs(p.distance-222.6)<1,'distance is measured in km');
 assert(p.samples.every((s,i)=>i===0||s.km>=p.samples[i-1].km));
});
test('unmeasured terrain cannot silently become a clamped profile',()=>{
 const dem={bounds:[0,0,2,2],cols:2,rows:2,heights:[0,0,0,0]};
 assert.throws(()=>elevationProfile(dem,[[0,0],[3,1]]),/coverage/);
 assert.throws(()=>elevationProfile(dem,[[0,0],[1,1]],1));
 assert.equal(geographicDistance([0,0],[0,0]),0);
});
test('live comparison uses measured DEM; illustrative routes are labelled',async()=>{
 const dem=JSON.parse(await fs.readFile(new URL('../public/assets/xinjiang-dem.json',import.meta.url),'utf8'));
 for(const points of [passageRoutes.direct.points,passageRoutes.oasis.points,reliefSection,turpanSection]){
  const p=elevationProfile(dem,points);assert(p.samples.every(s=>Number.isFinite(s.height)&&s.height>=dem.min&&s.height<=dem.max));
 }
 assert(elevationProfile(dem,passageRoutes.oasis.points).distance>elevationProfile(dem,passageRoutes.direct.points).distance);
 assert(passageRoutes.oasis.scope.includes('不是张骞逐站行程'));
});
