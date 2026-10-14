import assert from 'node:assert/strict';
import * as THREE from 'three';
import {spatialPlan,flightTiming,flightCamera,arrivalPose,flightPhrases,advanceFlight} from '../public/spatial-motion.js';
import {cues} from '../public/journey.js';
import {contextFor} from '../public/spatial-spine.js';
const get=id=>cues.find(c=>c.id===id);
assert.equal(advanceFlight(2000,60,false,6200),2060,'长时间帧阻塞不能跳过地理过渡');
assert.equal(advanceFlight(2000,60,true,6200),2000,'手动暂停保持镜头进度');
assert.equal(advanceFlight(6190,.03,false,6200),6200,'镜头恰好抵达终点');
assert.equal(spatialPlan(get('region-ice'),get('water-mountains')).kind,'locate','同一坐标从区域到局部也需要镜头衔接');
assert.equal(spatialPlan(get('exchange-stops'),get('exchange-goods')).kind,'locate');
assert.equal(spatialPlan(get('modern-kashgar'),get('modern-rules')).kind,'locate');
assert.equal(spatialPlan(get('memory-arrival'),get('memory-muqam')).kind,'map-return');
assert.equal(spatialPlan(get('future-synthesis'),get('future-result')).kind,'globe-return');
assert.equal(spatialPlan(get('water-ice'),get('water-flow')),null,'同一地点的选择与回应应连续进行');
const from=[4,14,22],to=[2.5,6.5,9],a=[0,.5,0],b=[0,.2,0],pos=flightCamera(from,to,a,b,0),end=flightCamera(from,to,a,b,1);
for(const [actual,expected] of [[pos.position,from],[end.position,to],[pos.target,a],[end.target,b]])assert(actual.every((v,i)=>Math.abs(v-expected[i])<1e-10));
const local=[20,5,10],target=[20,.8,0],arrival=arrivalPose(local,target);
const camera=new THREE.PerspectiveCamera(43,16/9,.1,220);
for(const [position,focus] of [[to,b],[arrival.position,target],[local,target]]){camera.position.fromArray(position);camera.lookAt(new THREE.Vector3(...focus));camera.updateMatrixWorld();const projected=new THREE.Vector3(...focus).project(camera);assert(Math.abs(projected.x)<1e-10&&Math.abs(projected.y)<1e-10,'地图与局部交接必须保留居中的观察对象');}
const samples=Array.from({length:601},(_,i)=>flightCamera(from,to,a,b,i/600));
assert(samples.every(s=>[...s.position,...s.target].every(Number.isFinite)));
const step=(x,y)=>Math.hypot(...x.map((v,i)=>v-y[i]));assert(step(samples[0].position,samples[1].position)<1e-5&&step(samples.at(-1).position,samples.at(-2).position)<1e-5,'镜头起止速度应趋零');
for(let i=0;i<=1000;i++){const t=i/1000,f=flightTiming('locate',t);assert(f.approach>=0&&f.approach<=1&&f.handoff>=0&&f.handoff<=1);if(t<.54)assert.equal(f.handoff,0);if(t>.54)assert.equal(f.approach,1);}
assert(flightTiming('unfold',.32).globeOpacity===0,'区域展开前段完成地球渐隐，避免缩球穿透地形');
const flights=cues.flatMap((c,i)=>{const plan=spatialPlan(cues[i-1],c);if(!plan)return [];assert(flightPhrases[c.id],'空间进入需要具体引导');return [{cue:c.id,...plan,place:contextFor(c).place}];});
console.log(JSON.stringify({pass:true,flights:flights.length,exactCameraEndpoints:true,zeroEndpointVelocity:true,centeredMapToLocalFocus:true,sameCoordinateScaleHandoff:true,storyContinuityWithinPlace:true,flightsByCue:flights}));
