import test from 'node:test';
import assert from 'node:assert/strict';
import {visualCue,globeViewVectors,visualObservationFraction} from '../public/history-visual-direction.js';
import {storyRange} from '../public/story-observation.js';
import {historyEvents} from '../public/history-content.js';

const magnitude = v => Math.hypot(...v);
const epsilon = (a,b,e=1e-10) => assert(Math.abs(a-b)<e,`${a} != ${b}`);
const sphere = (lon,lat,r) => {const a=lon*Math.PI/180,b=lat*Math.PI/180;return [r*Math.cos(b)*Math.cos(a),r*Math.sin(b),-r*Math.cos(b)*Math.sin(a)];};

test('nine observation targets follow the narration ranges, including exact boundaries',()=>{
 for(const id of ['zhang','protectorate','xibe']){
  const keys=new Set();
  for(let beat=0;beat<3;beat++){
   const [a,b]=storyRange(id,beat);
   for(const [index,shot] of ['wide','medium','close'].entries()){
    const cue=visualCue(id,a+(b-a)*visualObservationFraction(id,beat,index)); keys.add(cue.key);
    assert.equal(cue.beat,beat);assert.equal(cue.shot,shot);assert(cue.title&&cue.detail);
    assert.equal(cue.pose.surface,3.12);
    assert(cue.pose.tilt>=0&&cue.pose.tilt<=42);
    assert(cue.pose.bearing>=0&&cue.pose.bearing<=360);
    if(shot==='wide')assert(cue.pose.distance>=4.8);
    if(shot==='close')assert(cue.pose.distance>=3.75&&cue.pose.distance<=4.05);
    assert(cue.inspectPose.distance>=3.5&&cue.inspectPose.distance<=3.75);
    assert.equal(cue.inspectPose.tilt,40);
   }
   if(beat<2){assert.equal(visualCue(id,b-1e-8).beat,beat);assert.equal(visualCue(id,b).beat,beat+1);}
  }
  assert.equal(keys.size,9);
 }
 assert.equal(visualCue('zhang',1).targetNode,'kashgar');
 assert.equal(visualCue('protectorate',1).targetNode,'luntai');
 assert.equal(visualCue('xibe',1).targetNode,'qabqal');
});

test('migration keeps both endpoints visible during the opening scale explanation',()=>{
 assert.equal(visualCue('xibe',storyRange('xibe',0)[1]*.56).shot,'wide');
 assert.equal(visualCue('xibe',storyRange('xibe',0)[1]*.58).shot,'medium');
});

test('dense forward and reverse scrubbing returns identical, finite targets without mutating input',()=>{
 const route=[[94,40],[86,38],[76,39]],original=structuredClone(route);
 for(const id of ['zhang','protectorate','xibe']){
  const forward=Array.from({length:1001},(_,i)=>visualCue(id,i/1000,route));
  for(let i=1000;i>=0;i--){
   const cue=visualCue(id,i/1000,route);assert.deepEqual(cue,forward[i]);
   for(const pose of [cue.pose,cue.inspectPose]){
    assert(Object.values(pose).every(Number.isFinite));
    const vectors=globeViewVectors(pose);assert(magnitude(vectors.position)>3.2);
   }
  }
 }
 assert.deepEqual(route,original);
});

test('Zhang process targets use the supplied spherical corridor and fall back only for absent or invalid input',()=>{
 const [a,b]=storyRange('zhang',1),route=[[0,0],[90,0]];
 const longitudes=[0,1,2].map(i=>visualCue('zhang',a+(b-a)*visualObservationFraction('zhang',1,i),route).pose.lon);
 assert(longitudes[0]<5,'the camera starts with the unrevealed eastern route');
 assert(longitudes[1]>25&&longitudes[1]<60,'the intermediate camera sees the advancing contact');
 assert(longitudes[2]>80,'the final route target reaches the western end');
 assert(longitudes.every((v,i)=>!i||v>longitudes[i-1]));
 const polar=visualCue('zhang',a+(b-a)*visualObservationFraction('zhang',1,1),[[170,70],[-170,70]]);
 assert(Math.abs(polar.pose.lon)>170);assert(polar.pose.lat>70);
 const fallback=historyEvents.find(e=>e.id==='zhang').corridor;
 assert.deepEqual(visualCue('zhang',.4),visualCue('zhang',.4,fallback));
 for(const invalid of [null,{},[],[[0,0]],[[NaN,0],[90,0]],[[0,100],[90,0]]])assert.deepEqual(visualCue('zhang',.4,invalid),visualCue('zhang',.4));
 assert(Number.isFinite(visualCue('zhang',.4,[[0,0],[180,0]]).pose.lon));
 assert(Number.isFinite(visualCue('zhang',.4,[[0,0],[0,0]]).pose.lon));
});

test('radial camera poses are unchanged and surface zero keeps the globe center target',()=>{
 for(const [lon,lat,distance,surface] of [[0,0,4,3.12],[84.25,41.78,3.8,3.12],[-170,89,7.6,0],[123.43,41.8,5,3]]){
  const vectors=globeViewVectors({lon,lat,distance,surface,tilt:0,bearing:87});
  assert.deepEqual(vectors.position,sphere(lon,lat,distance));
  assert.deepEqual(vectors.target,surface?sphere(lon,lat,surface):[0,0,0]);
 }
 assert.deepEqual(globeViewVectors({lon:84,lat:43,distance:8,surface:0,tilt:42,bearing:220}),globeViewVectors({lon:84,lat:43,distance:8,surface:0}));
});

test('tilt and bearing use the north/east tangent frame continuously and remain outside Earth',()=>{
 const north=globeViewVectors({lon:0,lat:0,distance:3.6,surface:3.12,tilt:40,bearing:0});
 const east=globeViewVectors({lon:0,lat:0,distance:3.6,surface:3.12,tilt:40,bearing:90});
 assert(north.position[1]>0);epsilon(north.position[2],0);
 assert(east.position[2]<0);epsilon(east.position[1],0);
 for(const lon of [-180,-90,0,84,180])for(const lat of [-90,-45,0,45,90])for(const surface of [0,2.6,3.12,3.2]){
  let previous;
  for(let tilt=0;tilt<=42;tilt+=.5){
   const v=globeViewVectors({lon,lat,distance:3.55,surface,tilt,bearing:123});
   assert(v.position.every(Number.isFinite));assert(magnitude(v.position)>3.2);
   if(previous)assert(magnitude(v.position.map((n,i)=>n-previous[i]))<.04);
   previous=v.position;
  }
 }
});

test('invalid inputs are bounded and unknown events do not silently tell a different story',()=>{
 assert.equal(visualCue('missing',.5),null);
 assert.deepEqual(visualCue('migration',.75),visualCue('xibe',.75));
 for(const value of [undefined,NaN,Infinity,-Infinity,'bad',Symbol('bad')])assert.deepEqual(visualCue('zhang',value),visualCue('zhang',0));
 assert.deepEqual(visualCue('zhang',-9),visualCue('zhang',0));assert.deepEqual(visualCue('zhang',2),visualCue('zhang',1));
 for(const options of [undefined,null,{lon:NaN,lat:Infinity,distance:-7,surface:Infinity,tilt:999,bearing:-720},{lon:Symbol('bad'),lat:-999,distance:0,surface:99,tilt:42,bearing:Infinity}]){
  const v=globeViewVectors(options);assert([...v.position,...v.target].every(Number.isFinite));assert(magnitude(v.position)>3.2);
 }
});
