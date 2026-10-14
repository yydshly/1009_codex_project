import test from 'node:test';
import assert from 'node:assert/strict';
import {worldAnchors,worldAnchor,globePosition,surfaceDistance,comparisonArc,comparisonCities} from '../public/world-content.js';
const near=(a,b,tol=1e-9)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
test('world anchors use the rendered globe longitude/latitude convention',()=>{
 near(globePosition(0,0,1)[0],1);near(globePosition(90,0,1)[2],-1);near(globePosition(0,90,1)[1],1);
 assert.equal(new Set(worldAnchors.map(p=>p.id)).size,worldAnchors.length);
 for(const p of worldAnchors){assert(Math.abs(p.lon)<=180&&Math.abs(p.lat)<=90);for(const x of globePosition(p.lon,p.lat))assert(Number.isFinite(x));}
 assert.equal(worldAnchors.filter(p=>p.kind==='neighbor').length,8);
});
test('sphere distance handles coincident points, poles, quarter circle and dateline',()=>{
 const p=(lon,lat)=>({lon,lat});near(surfaceDistance(p(0,0),p(0,0)),0);
 near(surfaceDistance(p(0,90),p(120,90)),0);
 near(surfaceDistance(p(0,0),p(90,0)),6371.0088*Math.PI/2);
 assert(surfaceDistance(p(179,0),p(-179,0))<223);
 const u=worldAnchor('urumqi');assert(surfaceDistance(u,worldAnchor('almaty'))<surfaceDistance(u,worldAnchor('beijing')));
 // Approximate city anchors are about 29 degrees apart in longitude at 42 N.
 // Use a broad sanity range; axis/pole/dateline cases above test exact geometry.
 assert(surfaceDistance(u,worldAnchor('beijing'))>2200&&surfaceDistance(u,worldAnchor('beijing'))<2600);
});
test('comparison arcs end at labelled cities and remain above the sphere',()=>{
 const u=worldAnchor('urumqi');for(const id of comparisonCities){const v=worldAnchor(id);
  comparisonArc(u,v,0).forEach((n,i)=>near(n,globePosition(u.lon,u.lat,3.25)[i]));
  comparisonArc(u,v,1).forEach((n,i)=>near(n,globePosition(v.lon,v.lat,3.25)[i]));
  for(let i=0;i<=80;i++){const p=comparisonArc(u,v,i/80);assert(p.every(Number.isFinite));assert(Math.hypot(...p)>=3.249999);}
 }
});
