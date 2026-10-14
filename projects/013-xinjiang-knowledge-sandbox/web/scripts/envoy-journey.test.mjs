import test from 'node:test';
import assert from 'node:assert/strict';
import {envoyMapFrame,envoyDesertFrame,envoyStops,envoyChapterProgress} from '../public/envoy-journey-data.js';
import {directorPaths} from '../public/exploration-director-paths.js';
import {desertRoute,desertHeight,desertCameraPose} from '../public/envoy-desert.js';

test('documented regions include Kangju and Daxia without inventing a captivity coordinate',()=>{
 assert.deepEqual(envoyStops.map(n=>n.id),['changan','longxi','dayuan','kangju','yuezhi','daxia']);
 assert(envoyMapFrame(.3).held);assert.equal(envoyMapFrame(.3).locate,false);
 assert(envoyMapFrame(.3).caption.includes('不为拘留地点编造坐标'));
 assert.equal(envoyMapFrame(1).index,0);assert(envoyMapFrame(1).title.includes('再次被扣留'));
 for(const [index,p]of envoyChapterProgress.entries()){assert.equal(envoyMapFrame(p).index,index);assert(envoyMapFrame(p).locate);}
});
test('wind changes the actual walk pace, rest stops progress, and all frames can be replayed',()=>{
 const gust=envoyDesertFrame(.5),clear=envoyDesertFrame(.5,{wind:false});assert(gust.walk<clear.walk);assert(gust.wind>clear.wind);
 assert.equal(envoyDesertFrame(.70).walk,0);assert.equal(envoyDesertFrame(.66).distance,envoyDesertFrame(.77).distance);
 assert.equal(envoyDesertFrame(.15,{rest:true}).walk,0);
 for(const p of [0,.4,.72,1])assert.deepEqual(envoyDesertFrame(p),envoyDesertFrame(p));
 let distance=0;for(let i=0;i<=100;i++){const f=envoyDesertFrame(i/100);assert(Number.isFinite(f.distance));assert(f.distance>=distance);distance=f.distance;}
});
test('unsupported desert reenactment and its audio stay out of every historical director',()=>{
 const shots=directorPaths.zhang.shots,route=shots.findIndex(s=>s.id==='mission-route'),process=shots.findIndex(s=>s.beat===1);
 assert(route>shots.findIndex(s=>s.beat===0));assert.equal(process,route+1);
 assert.equal(shots[route].journey,'map');assert(shots[route].speech.includes('不绘制未经考定的行走道路'));
 for(const path of Object.values(directorPaths)){assert(!path.shots.some(s=>s.journey==='near'||s.id==='desert'||s.audio?.beat==='desert'));}
 assert(!directorPaths.protectorate.shots.some(s=>s.journey));assert(!directorPaths.xibe.shots.some(s=>s.journey));
});
test('follow cameras retain sight of the party across the terrain instead of hiding it behind a dune',()=>{
 for(const phase of ['walk','wind','rest'])for(const aspect of [.46,1.4])for(let i=0;i<=100;i++){
  const p=desertRoute(i/100),pose=desertCameraPose(p,phase,aspect);
  for(let j=1;j<=16;j++){const t=j/17,ray=pose.target.clone().lerp(pose.position,t);assert(ray.y>desertHeight(ray.x,ray.z)+.50,`${phase}/${aspect}/${i}/${j}`);}
 }
});
