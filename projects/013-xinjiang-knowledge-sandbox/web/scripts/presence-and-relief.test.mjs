import test from 'node:test';
import assert from 'node:assert/strict';
import {reactionFrame} from '../public/performance-presence.js';
import {responseCamera} from '../public/performance-motion.js';
import {cavityShade} from '../public/landscape.js';
import {layoutAnnotations} from '../public/story-annotations.js';

test('a pending choice never invents a reaction; a reply returns to daily activity',()=>{
 assert.equal(reactionFrame(100,{pending:true}).phase,'waiting');
 assert.equal(reactionFrame(9,{replyAt:8}).phase,'reply');
 assert(reactionFrame(8.65,{replyAt:8}).acknowledge>.9);
 assert.equal(reactionFrame(25,{replyAt:8}).acknowledge,0);
 assert.equal(reactionFrame(25,{replyAt:8}).settled,1);
});
test('the response camera stays on the same side and releases without a cut',()=>{
 const pose={position:[-2.9,1.75,5.75],target:[-1.02,.79,2.9]};
 let last=responseCamera('culture',pose,0);
 for(let age=.02;age<=22;age+=.02){
  const next=responseCamera('culture',pose,age);
  assert(next.position[0]<next.target[0]&&next.position[2]>next.target[2]);
  assert(Math.hypot(...next.position.map((v,i)=>v-last.position[i]))<.012);
  last=next;
 }
 assert.deepEqual(pose.position,[-2.9,1.75,5.75]);
});
test('valley relief comes from observed neighbours and does not change elevations',()=>{
 const cols=35,rows=35;
 const dem={bounds:[86.8,43.08,86.81,43.09],cols,rows,heights:Array.from({length:cols*rows},(_,i)=>3000+Math.hypot(i%cols-17,Math.floor(i/cols)-17)*8)};
 const before=[...dem.heights];
 assert(cavityShade(dem,17,17)<cavityShade(dem,0,0));
 assert.deepEqual(dem.heights,before);
 assert.equal(cavityShade({...dem,heights:Array(cols*rows).fill(3000)},17,17),1);
});
test('an explanation marker leaves the projected face visible',()=>{
 const face={x:455,y:220,w:100,h:100};
 const notes=layoutAnnotations([{x:505,y:280,z:.5,title:'回应'}],1280,720,{protectedAreas:[face],responseFocus:true});
 assert.equal(notes.length,1);
 const n=notes[0];
 assert(!(n.x<face.x+face.w&&n.x+n.w>face.x&&n.y<face.y+face.h&&n.y+n.h>face.y));
});
