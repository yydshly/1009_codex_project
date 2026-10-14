import test from 'node:test';
import assert from 'node:assert/strict';
import {globeFrame,eventMotion,eventMotionFrame} from '../public/exploration-motion.js';


test('globe travel stays outside Earth across long arcs, the dateline and opposite poles',()=>{
 const cases=[[[4,0,0],[-8,0,0]],[[0,4,0],[0,-4,0]],[[-3.99,0,.1],[-3.99,0,-.1]],[[2,3,4],[.5,4,.2]]];
 for(const [from,to]of cases){
  const oldTarget=from.map(v=>v/Math.hypot(...from)*3),target=to.map(v=>v/Math.hypot(...to)*3);
  assert.deepEqual(globeFrame(from,to,oldTarget,target,0),{position:from,target:oldTarget});
  assert.deepEqual(globeFrame(from,to,oldTarget,target,1),{position:to,target});
  let previous=from;
  for(let n=1;n<=200;n++){const f=globeFrame(from,to,oldTarget,target,n/200);assert(f.position.every(Number.isFinite));assert(Math.hypot(...f.position)>3.2);assert(Math.hypot(...f.position.map((v,i)=>v-previous[i]))<.5);previous=f.position;}
 }
});
test('history interpolation is reversible, restartable and reduced-motion safe',()=>{
 for(const [from,to]of [[0,1],[1,0],[.5,1],[.72,.5]]){
  const m=eventMotion(from,to);let prev=from;
  for(let i=0;i<600;i++){const f=eventMotionFrame(m,1/60);m.time=f.time;assert(f.progress>=Math.min(from,to)-1e-10&&f.progress<=Math.max(from,to)+1e-10);assert((f.progress-prev)*(to-from)>=-1e-10);prev=f.progress;if(f.done)break;}
  assert.equal(prev,to);
 }
 const halfway=eventMotionFrame(eventMotion(0,1),2.4).progress;
 assert.equal(halfway,.5);assert.equal(eventMotionFrame(eventMotion(halfway,0),0).progress,halfway);
 assert.deepEqual(eventMotionFrame(eventMotion(.5,0,true),0),{time:0,progress:0,done:true});
});
