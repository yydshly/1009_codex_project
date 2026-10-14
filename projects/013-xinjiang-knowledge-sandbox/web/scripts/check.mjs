import './settlement-chronology.test.mjs';
import './settlement-period-detail.test.mjs';
import './settlement-story.test.mjs';
import './local-observation.test.mjs';
import './entry-policy.test.mjs';
import './exploration-entry.test.mjs';
import './envoy-journey.test.mjs';
import './exploration-bridge.test.mjs';
import './world-countries.test.mjs';
import './cartography.test.mjs';
import './history-story.test.mjs';
import './exploration-director.test.mjs';
import './spatial-relations.test.mjs';
import './spatial-relations-layer.test.mjs';
import './history-presentation.test.mjs';
import './history-spatial-cues.test.mjs';
import './history-visual-direction.test.mjs';
import './history-visual-models.test.mjs';
import './history-geography.test.mjs';
import './history-materials.test.mjs';
import './history-local-actions.test.mjs';
import './regional-grounding.test.mjs';
import './history-grounding.test.mjs';
import './story-observation.test.mjs';
import './institution-flow.test.mjs';
import './exploration-motion.test.mjs';
import './check-history-process.mjs';
import './check-exploration-memory.mjs';
import './passage-data.test.mjs';
import './knowledge-content.test.mjs';
import './world-content.test.mjs';
import './world-intro.test.mjs';
import './learning-links.test.mjs';
import './karez-inquiry.test.mjs';
import './regional-surface.test.mjs';
import './spherical-history.test.mjs';
import './migration-trail.test.mjs';
import './history-trails.test.mjs';
import './director-audio-assets.test.mjs';
import './zhang-spatial-reading.test.mjs';
import './map-learning.test.mjs';
import {pendingNarration} from '../public/narration-revision.js';
import {cuePlaces,contextFor,changesPlace} from '../public/spatial-spine.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { capabilities, models, scales } from '../public/data.js';
import { sampleElevation, terrainDimensions, terrainPoint } from '../public/geo.js';
import { order, lessons, routeStops } from '../public/lessons.js';
import { stories, catalog, erosionHeight } from '../public/story.js';
import { cameraFrame, smoothStep, phaseFrame } from '../public/motion.js';
import { cavityShade } from '../public/landscape.js';
import { focusGlacierDEM, textureWindow, glacierBranches, experimentStep, iceHalfWidth } from '../public/glacier.js';
import { createHash } from 'node:crypto';
import { chapters, cues, journeyDuration, formatTime, locateTime, journeyTime } from '../public/journey.js';
import { domains, relations, sources, mapPoints, questions } from '../public/connections.js';
import { stagedCues, migrationProgress, cargoFrame, cargoPose } from '../public/lived-model.js';
import {exchangeFrame,caravanPose,cultureFrame,initialCargo,advanceCargo,observationRows} from '../public/lived-process.js';
import {cueDurations,settlementFrame,recipientFrame,displayTerrain,closingPose} from '../public/story-outcomes.js';
import {stageOrigins,stageOrder,worldPose,isConnected,bridgeFrame,bridges} from '../public/continuity.js';
import {decisionScenes,decisionFrame} from '../public/scene-decisions.js';
import {historyEvents,geographyStops,eventById,nodeById} from '../public/history-content.js';
import {workspaceScenes} from '../public/workbench.js';
import {socialDialogue} from '../public/social-model.js';
import {routeCoordinates,locatorHTML} from '../public/exploration-journey.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
process.stdout.write(execFileSync(process.execPath,['--test',path.join(root,'../scripts/history-story-player.test.mjs')],{encoding:'utf8'}));
for(const filename of ['spherical-history.js','spherical-history-data.js','regional-surface.js','regional-surface-data.js','learning-links.js','history-platform.js','history-map-layer.js','history-event-objects.js','sandbox.js','world-intro-content.js','map-learning-content.js','map-learning-layer.js','world-content.js','world-atlas.js','knowledge-guide.js','scene-neighborhood.js','scene-ecology.js','lived-atmosphere.js','place-landscape.js'])execFileSync(process.execPath,['--check',path.join(root,filename)]);
execFileSync(process.execPath,['--check',path.join(root,'exploration-journey.js')]);
assert.deepEqual(routeCoordinates(eventById('zhang')),eventById('zhang').corridor);
assert.deepEqual(routeCoordinates(eventById('protectorate')),[]);
assert.deepEqual(routeCoordinates(eventById('xibe')),eventById('xibe').nodes.map(n=>[n.lon,n.lat]));
for(const e of historyEvents)for(const n of e.nodes)assert(locatorHTML(e,n.id).includes('data-ej-place="'+n.id+'"'),'locator keeps the canonical event nodes');
const audioManifest=JSON.parse(await fs.readFile(path.join(root,'assets/audio/manifest.json'),'utf8'));
const audioScript=JSON.parse(await fs.readFile(path.join(root,'assets/audio-script.json'),'utf8'));
const dialogueManifest=JSON.parse(await fs.readFile(path.join(root,'assets/audio/dialogue/manifest.json'),'utf8'));
const dialogueScript=JSON.parse(await fs.readFile(path.join(root,'assets/audio/dialogue/script.json'),'utf8'));
assert.equal(dialogueManifest.clips.length,19);
assert.equal(audioManifest.clips.length,33);assert.equal(pendingNarration.size,0);
assert.deepEqual(audioManifest.clips.map(c=>c.file.replace(/\.mp3$/,'')).filter(id=>!pendingNarration.has(id)).sort(),cues.filter(c=>!pendingNarration.has(c.id)).map(c=>c.id).sort());
for(const cue of cues){
 assert(cuePlaces[cue.id]);assert(Number.isFinite(contextFor(cue).lon));if(pendingNarration.has(cue.id)){assert(audioScript[cue.id]?.length>10);continue;}
 const clip=audioManifest.clips.find(c=>c.file===`${cue.id}.mp3`),bytes=await fs.readFile(path.join(root,'assets/audio',clip.file));
 assert(audioScript[cue.id]?.length>10);
 assert.equal(bytes.length,clip.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),clip.sha256);
 assert(clip.sourceWaveDuration/clip.tempo<cue.duration-.3,`${cue.id} 旁白超出段落时长`);
 const previous=cues[cue.index-1],delay=previous?(false?2.4:previous.key!==cue.key||previous.stage!==cue.stage?.7:0):0;
 const firstDialogue=Math.min(cue.duration,...dialogueScript.clips.filter(d=>d.cue===cue.id).map(d=>d.start));
 assert((clip.encodedDuration??clip.sourceWaveDuration/clip.tempo)+delay<firstDialogue,`${cue.id} 转场后旁白覆盖角色回应`);
}
for(const clip of dialogueManifest.clips){
 const data=await fs.readFile(path.join(root,'assets/audio/dialogue',clip.file));assert.equal(data.length,clip.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),clip.sha256);
 const speech=dialogueScript.clips.find(d=>d.id+'.mp3'===clip.file);assert(speech&&speech.text.length>5);assert(clip.encodedDuration<=speech.duration);assert(speech.start+clip.encodedDuration<=cues.find(c=>c.id===speech.cue).duration);
}
for (const filename of ['audio-mixer.js','audio-design.js','actor-rig.js','app.js', 'data.js', 'sandbox.js', 'geo.js', 'lessons.js', 'story.js','surface.js','motion.js','landscape.js','capture.js','glacier.js','explorations.js','journey.js','film.js','connections.js','narrative-ui.js','lived-scenes.js','lived-model.js','lived-process.js','continuity.js','story-outcomes.js','lived-detail.js','soundscape.js','social-depth.js','social-model.js','social-controls.js','atlas.js','water-story.js','soft-box.js','scene-decisions.js','spatial-spine.js','spatial-navigation.js','narration-revision.js']) execFileSync(process.execPath, ['--check', path.join(root, filename)]);
for (const filename of ['film-reading.js', 'overview.js','workbench.js','platform-blueprint.js','history-content.js','history-platform.js','history-map-layer.js','history-process.js','history-event-objects.js','event-reading.js','exploration-journey.js','exploration-memory.js','region-boundary.js','region-atlas-content.js','region-atlas.js','region-atlas-map.js','passage-data.js','geographic-explorer.js','knowledge-content.js','knowledge-scenes.js','knowledge-guide.js','karez-inquiry.js','karez-station.js']) execFileSync(process.execPath, ['--check', path.join(root, filename)]);
for (const page of ['index.html', 'research.html','explorations.html','overview.html']) {
const html = await fs.readFile(path.join(root, page), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'HTML ID 重复');
for (const link of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(link[1]), `无效锚点 ${link[1]}`);
for (const resource of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) await fs.access(path.join(root, resource[1].split('?')[0]||'index.html'));
}
assert.equal(capabilities.length, 10);
assert.deepEqual([...new Set(capabilities.map(item => item.level))].sort(), ['observed', 'stated', 'unknown']);
assert.equal(Object.keys(scales).length, 4);
assert.equal(Object.keys(models).length, 3);
assert((await fs.readFile(path.join(root, 'research.html'), 'utf8')).includes('尚未找到对应仓库'));
assert.equal(order.length, 9);
assert.deepEqual(Object.keys(lessons).sort(), [...order,'journey'].sort());
assert.deepEqual(Object.keys(stories).sort(), [...order,'journey'].sort());
assert.deepEqual(Object.keys(catalog).sort(), [...order,'journey'].sort());
assert.equal(Object.values(stories).flat().length, 39);
assert.equal(journeyDuration,524);assert.equal(formatTime(journeyDuration),'8:44');assert.deepEqual(cues.slice(0,5).map(c=>c.key),['earth','earth','terrain','terrain','glacier']);
for(const [id,def]of Object.entries(decisionScenes)){
 const cue=cues.find(c=>c.id===id),next=cues.find(c=>c.id===def.next);
 assert(cue&&next&&next.index>cue.index,'场景选择必须接入后续时间轴');
 assert(def.pauseAt+def.readyAt<cue.duration,'人物回应必须在转场之前完整发生');
 const narration=audioManifest.clips.find(c=>c.file===id+'.mp3');
 assert(narration.encodedDuration<def.pauseAt,'旁白未说完不能暂停等选择');
 const pending={def,choice:null,at:100,manual:true};
 assert.equal(decisionFrame(pending,1000).ready,false,'等待多久都不能自动替用户选择');
 for(const choice of def.choices){
  const selected={...pending,choice:choice.id};
  assert.equal(decisionFrame(selected,101).phase,'选择');
  assert.equal(decisionFrame(selected,100+def.replyAt-.01).dialogue,null);
  assert.equal(decisionFrame(selected,100+def.replyAt).dialogue.id,choice.voice);
  assert.equal(decisionFrame(selected,100+def.replyAt+3).dialogue.offset,3,'暂停后应从当前对白位置续听');
  assert.equal(decisionFrame(selected,100+def.readyAt-.01).ready,false);
  assert.equal(decisionFrame(selected,100+def.readyAt).ready,true);
  const voice=dialogueManifest.clips.find(c=>c.file===choice.voice+'.mp3');
  assert(voice&&voice.encodedDuration<def.readyAt-def.replyAt,'继续按钮必须等待对白完整播放');
 }
}
assert.equal(chapters.length,6);assert.equal(cues.length,33);
// Resuming a request must continue that speaker, then reset only at the next turn.
const consultation={id:'modern-rules'},consultationSettings={civicPlan:'balanced'};
assert.equal(socialDialogue(consultation,9.75,consultationSettings),null);
for(const [start,id,length]of [[10,'civic-resident',5],[15,'civic-worker',5],[20,'civic-steward',6]]){
 for(const offset of [0,2.25,length-.25]){
  const resumed=socialDialogue(consultation,start+offset,consultationSettings);
  assert.equal(resumed.id,id,'暂停恢复后必须继续当前发言者');
  assert.equal(resumed.offset,offset,'暂停恢复后不得从头重播人物请求');
 }
}
assert.equal(new Set(cues.map(c=>c.id)).size,cues.length);
assert.equal(locateTime(-10).time,0);assert.equal(locateTime(1000).time,journeyDuration);
for(const [index,cue] of cues.entries()){
  assert.equal(cue.start,index?cues[index-1].end:0,'全程时间轴存在空隙');
  const entered=locateTime(cue.start);assert.equal(entered.key,cue.key);assert.equal(entered.shot,cue.shot);
  assert.equal(entered.elapsed,0);assert.equal(journeyTime(cue.index,cue.duration/2),cue.start+cue.duration/2);
  assert.equal(entered.id,cue.id);assert(stories[cue.key][cue.shot]);assert(sources[cue.source]);
  assert(cue.connection.includes('→'));assert(cue.domains.length>=2);
  if(index<cues.length-1){assert.equal(locateTime(cue.end-.001).shot,cue.shot);assert.equal(locateTime(cue.end).start,cues[index+1].start);}
}
for(const chapter of chapters)assert.equal(locateTime(chapter.start).key,chapter.key);
assert.deepEqual([...new Set(cues.flatMap(c=>c.domains))].sort(),domains.map(d=>d.id).sort());
// Revisited physical poses need their own editorial identity and absolute time.
const repeats=cues.filter(c=>c.key==='terrain'&&c.shot===0);assert(repeats.length>3);assert.equal(new Set(repeats.map(c=>journeyTime(c.index,0))).size,repeats.length);
for(const d of domains){assert(cues.some(c=>c.id===d.cue));assert(sources[d.source]);assert(d.x>0&&d.x<100&&d.y>0&&d.y<90);}
for(const [a,b] of relations)assert([a,b].every(id=>domains.some(d=>d.id===id)));
for(const q of questions){assert(cues.some(c=>c.id===q.cue));assert(sources[q.source]);assert(stories[q.explore[0]][q.explore[1]]);}
for(const points of Object.values(mapPoints))for(const p of points){assert(cues.some(c=>c.id===p.cue));assert([p.lon,p.lat].every(Number.isFinite));}
assert.equal(Object.keys(stagedCues).length,15);
// Each adjacent stage occupies a distinct place; the camera flight has exact, finite endpoints.
for(const stage of stageOrder){
 const local={camera:[1,6,13],target:[0,.5,0]},world=worldPose(local,stage);
 assert.equal(world.camera[0]-local.camera[0],stageOrigins[stage]);
 assert.deepEqual(world.camera.map((v,i)=>v-world.target[i]),local.camera.map((v,i)=>v-local.target[i]));
}
for(let i=0;i<stageOrder.length-1;i++){
 assert(isConnected(stageOrder[i],stageOrder[i+1]));assert(!isConnected(stageOrder[i+1],stageOrder[i]));
 const a=worldPose({camera:[-8,7,17],target:[0,1,0]},stageOrder[i]);
 const b=worldPose({camera:[5,7,14],target:[0,.5,0]},stageOrder[i+1]);
 for(const [t,p,target] of [[0,a.camera,a.target],[1,b.camera,b.target]]){
  const f=bridgeFrame(a.camera,b.camera,a.target,b.target,t);assert.deepEqual(f.position,p);assert.deepEqual(f.target,target);
 }
 let prior=a.camera;
 for(let t=0;t<=1;t+=.01){const f=bridgeFrame(a.camera,b.camera,a.target,b.target,t);assert([...f.position,...f.target].every(Number.isFinite));assert(f.position[1]>=6);assert(Math.hypot(...f.position.map((v,j)=>v-f.target[j]))>10);assert(Math.hypot(...f.position.map((v,j)=>v-prior[j]))<1);prior=f.position;}
}
assert(!isConnected('nature','culture'));assert(!isConnected(undefined,'nature'));
assert.deepEqual(worldPose({overview:true},'logistics').target,[10,.7,0]);
for(const id of Object.keys(bridges))assert(cues.some(c=>c.id===id&&c.bridge?.title===bridges[id].title));
// A parcel reaches a recipient, then returns without duplicating the carried item.
for(let goods=0;goods<3;goods++){
 const before=exchangeFrame(3.5,goods),after=exchangeFrame(4.1,goods),returned=exchangeFrame(6.799,goods);
 assert(before.handover&&before.carrying);assert(after.handover&&!after.carrying);assert(returned.returning&&!returned.carrying);
 assert(Math.abs(after.x-[-3.7,0,3.7][goods])<1e-8);assert(Math.abs(returned.x+5.3)<.001);
}
for(const t of [.4,.5,.9,1]){const a=caravanPose(t-1e-7),b=caravanPose(t+1e-7);assert(Math.hypot(a.x-b.x,a.z-b.z)<.0001,'商队跨段跳跃');}
assert(cultureFrame(.1,0).teacher);assert(cultureFrame(.8,0).learner);assert(!cultureFrame(2,-100).learner);assert(cultureFrame(5,-100).learner);
// Service changes affect the remaining wait, never the already travelled position.
let arriving=initialCargo(.58);arriving={...arriving,mode:'service',elapsed:3};
const separate=advanceCargo(arriving,.1,false),shared=advanceCargo(arriving,.1,true);
assert.equal(separate.position,.58);assert(shared.position>.58&&shared.position<.59);
let small=initialCargo(.2),large=initialCargo(.2);for(let i=0;i<100;i++)small=advanceCargo(small,.01,true);large=advanceCargo(large,1,true);assert(Math.abs(small.position-large.position)<1e-9);
let fleet=initialCargo(0);for(let i=0;i<3500;i++)fleet=advanceCargo(fleet,.01,i%2===0);assert(fleet.position>=0&&fleet.position<=1&&fleet.cycles>=1);
assert(observationRows({}).every(r=>!r.observed));const remembered=observationRows({market:{goods:2,deliveries:1},culture:{beats:3},oasis:{plan:'field',replied:true}});assert(remembered.find(r=>r.stage==='market').detail.includes('工艺'));assert(remembered.find(r=>r.stage==='culture').detail.includes('3 拍'));assert(!remembered.find(r=>r.stage==='people').observed);assert(remembered.find(r=>r.stage==='oasis').detail.includes('人物回应'));
assert.deepEqual([...new Set(Object.values(stagedCues).map(c=>c.stage))].sort(),['culture','logistics','market','oasis','people']);
for(const [id,stage] of Object.entries(stagedCues)){assert(cues.some(c=>c.id===id&&c.stage===stage.stage));assert([...stage.camera,...stage.target].every(Number.isFinite));}
assert.equal(cueDurations.reduce((a,b)=>a+b,0),474);assert(new Set(cueDurations).size>3);
for(const sec of [0,2,4,7,10]){const water=settlementFrame(sec,'water'),home=settlementFrame(sec,'home');assert.equal(water.water,home.home);assert.equal(water.home,home.water);assert(water.water>=water.home);}
assert(settlementFrame(4,'water').water>.9&&settlementFrame(4,'home').water===0);assert(settlementFrame(10,'water').home===1);
const constant={name:'fixture',cols:9,rows:9,bounds:[0,0,1,1],heights:Array(81).fill(123)};const derived=displayTerrain(constant,4);assert.equal(derived.heights.length,9);assert(derived.heights.every(h=>h===123));assert(constant.heights.every(h=>h===123));
for(let t=0;t<=20;t+=.1)assert([...closingPose(t).position,...closingPose(t).target].every(Number.isFinite));assert(recipientFrame(5).thanks===1);
const west={from:.27,to:.78};assert.equal(migrationProgress(west,0),west.from);assert.equal(migrationProgress(west,14),west.to);
let previous=west.from;for(let t=0;t<=14;t+=.1){const p=migrationProgress(west,t);assert(p>=previous-1e-10&&p<=west.to);previous=p;}
// The same arrival reaches a different visible state when service duration changes.
assert.equal(cargoFrame(16,0,true,8).waiting,false);assert.equal(cargoFrame(16,0,false,8).waiting,true);
for(const collaborative of [false,true])for(const boundary of [12,12+(collaborative?2:7)])assert(Math.abs(cargoFrame(boundary-.00001,0,collaborative).position-cargoFrame(boundary+.00001,0,collaborative).position)<.0001,'服务关口的车辆跳变');
for(let t=0;t<120;t+=.13)for(let i=0;i<9;i++){const p=cargoFrame(t,i,true,5);assert(p.position>=0&&p.position<=1);assert.equal(p.parked,i>=5);}
for(const edge of [.73,.78,.95]){const a=cargoPose(edge-.000001),b=cargoPose(edge+.000001);assert(Math.hypot(a.x-b.x,a.z-b.z)<.001,'货车转弯出现跳变');}
assert(Math.hypot(cargoPose(0).x-cargoPose(1).x,cargoPose(0).z-cargoPose(1).z)<1e-10,'货车循环首尾不闭合');
// Narrative poses and phase geometry must remain finite at all supported settings.
for(const shots of Object.values(stories))for(const shot of shots) {
  assert(shot.heading && shot.text && shot.label);
  assert((shot.globe || [...shot.camera,...shot.target]).every(Number.isFinite));
  assert(shot.duration>=8&&shot.duration<=14);
}
for(const phase of [0,35,75,100])for(const x of [-8,-2,0,8])for(const z of [-5,0,5])assert(Number.isFinite(erosionHeight(x,z,phase))&&erosionHeight(x,z,phase)>0);
// Erosion must remove material continuously; it must never grow a ridge upward.
for(let x=-8;x<=8;x+=.5)for(let z=-5;z<=5;z+=.5){
  let prior=erosionHeight(x,z,0);
  for(let phase=1;phase<=100;phase++){const next=erosionHeight(x,z,phase);assert(next<=prior+1e-10,'侵蚀阶段出现地形向上生长');assert(prior-next<.06,'侵蚀阶段不连续');prior=next;}
}
const flat={bounds:[88,43,88.12,43.12],cols:5,rows:5,heights:Array(25).fill(1000)};
assert.equal(cavityShade(flat,2,2),1);
const hollow={...flat,heights:flat.heights.map((h,i)=>i===12?500:h)};
assert(cavityShade(hollow,2,2)<1&&cavityShade(hollow,2,2)>=.7);
assert.equal(hollow.heights[12],500,'显示明暗改写了真实高程');
assert.equal(routeStops.length, 5);
const manifest = JSON.parse(await fs.readFile(path.join(root, 'assets/data-sources.json'), 'utf8'));
assert.deepEqual(manifest.elevation.datasets.map(d=>d.grid),[[769,513],[321,289],[321,321]]);
assert(manifest.elevation.datasets[1].minMetres>500,'天池来源含异常低值');
assert(manifest.elevation.datasets[2].minMetres>2000,'冰川来源含异常低值');
assert.equal(manifest.elevation.datasets.length,3);
for(const record of [manifest.imagery,manifest.regionalImagery,...Object.values(manifest.localImagery)]) {
  const body=await fs.readFile(path.join(root,'assets',record.file));
  assert.equal(createHash('sha256').update(body).digest('hex'),record.sha256,'影像哈希不一致');
}
assert.deepEqual(manifest.regionalImagery.bounds,manifest.elevation.datasets[0].bounds,'影像和区域高程范围不一致');
assert.equal(manifest.regionalImagery.sourceResolutionMetres,500);
assert.deepEqual(manifest.regionalImagery.outputSize,[5520,3360]);
const [rx,rsx,rx0,rsy,ry,ry0]=manifest.regionalImagery.outputTransform;
assert.equal(rsx,0);assert.equal(rsy,0);assert(ry<0);
assert(Math.abs(rx0+5520*rx-96)<1e-10&&Math.abs(ry0+3360*ry-35)<1e-10,'新区域影像像素边缘未对齐DEM');
assert.deepEqual(manifest.regionalImagery.sources.map(s=>s.tile),['C1','D1']);
assert.equal(manifest.regionalImagery.sources.reduce((sum,s)=>sum+s.cropPixels[2]-s.cropPixels[0],0),5520);
for(const [name,index] of [['tianchi',1],['glacier',2]]) {
  const record=manifest.localImagery[name];
  assert.deepEqual(record.bounds,manifest.elevation.datasets[index].bounds,'局部影像和高程未对齐');
  assert.equal(record.outputCRS,'EPSG:4326');assert.equal(record.sourceResolutionMetres,10);
  assert.equal(record.cropCloudPercent,0,'局部影像存在 SCL 云类');
  assert(!record.cropSCLPercent['0'],'局部影像缺少源像素');
  assert(record.validRGBFraction>.999);
  assert(record.licenseURL&&record.credit.includes(record.acquiredAt.slice(0,4)));
  const stacBody=await fs.readFile(path.join(root,'assets',record.stacFile));
  assert.equal(createHash('sha256').update(stacBody).digest('hex'),record.stacSHA256);
  const item=JSON.parse(stacBody);assert.equal(item.id,record.itemId);assert.equal(item.properties.datetime,record.acquiredAt);
  // Raster edges and DEM vertices must agree; north-up rows must point south.
  const [w,s,e,n]=record.bounds,[width,height]=record.outputSize,[dx,skewX,x0,skewY,dy,y0]=record.outputTransform;
  assert.equal(skewX,0);assert.equal(skewY,0);assert(dy<0);
  assert(Math.abs(x0-w)<1e-10&&Math.abs(y0-n)<1e-10);
  assert(Math.abs(x0+width*dx-e)<1e-10&&Math.abs(y0+height*dy-s)<1e-10);
  const asset=record.assets.find(a=>a.key==='visual');
  assert.equal(asset.url,item.assets.visual.href);
  assert(asset.transport.verifiedRanges.length>1&&asset.transport.downloadedBytes<asset.transport.fullObjectBytes);
}
for (const record of manifest.elevation.datasets) {
  const body = await fs.readFile(path.join(root, 'assets', record.file));
  assert.equal(createHash('sha256').update(body).digest('hex'), record.sha256, '高程文件哈希与来源记录不一致');
  const dem = JSON.parse(body);
  assert.equal(dem.heights.length, dem.cols * dem.rows);
  assert(dem.heights.every(Number.isFinite), '高程网格含无效值');
  assert.equal(dem.heights.reduce((a,b)=>Math.min(a,b),Infinity), dem.min);
  assert.equal(dem.heights.reduce((a,b)=>Math.max(a,b),-Infinity), dem.max);
  const [west, south, east, north] = dem.bounds;
  assert.equal(sampleElevation(dem, west, north), dem.heights[0]);
  assert.equal(sampleElevation(dem, east, south), dem.heights.at(-1));
  // Exaggeration must change displayed relief, never the physical data.
  const lon = (west + east) / 2, lat = (north + south) / 2;
  const dimensions = terrainDimensions(dem);
  const a = terrainPoint(dem, lon, lat, 1), b = terrainPoint(dem, lon, lat, 3);
  assert.equal(a[0], b[0]); assert.equal(a[2], b[2]);
  assert(Math.abs(b[1] - a[1] * 3) < 1e-9);
  assert(Math.abs(a[1] / dimensions.width * dimensions.widthMetres + dimensions.origin - sampleElevation(dem, lon, lat)) < 1e-7);
}
// Independent 2×2 fixture catches row direction, bilinear mixing and negative heights.
const fixture = { bounds: [10, 20, 12, 22], cols: 2, rows: 2, min: -100, heights: [-100, 100, 300, 500] };
assert.equal(sampleElevation(fixture, 11, 21), 200);
assert.equal(sampleElevation(fixture, 10.5, 21.5), 50);
assert.equal(sampleElevation(fixture, 9, 23), -100);
// A 180-degree scene change must stay outside the subject, with exact endpoints.
const from=[0,4,10],to=[0,4,-10],focus=[0,1,0];
assert.deepEqual(cameraFrame(from,to,focus,focus,0).target,focus);
for(let step=0;step<=100;step++) {
  const frame=cameraFrame(from,to,focus,focus,step/100);
  assert(frame.position.every(Number.isFinite));
  assert(Math.hypot(...frame.position.map((v,i)=>v-focus[i]))>=10,'相机穿过模型');
}
for(const [t,expected] of [[0,from],[1,to]])assert(cameraFrame(from,to,focus,focus,t).position.every((v,i)=>Math.abs(v-expected[i])<1e-9));
assert.equal(smoothStep(0),0);assert.equal(smoothStep(1),1);
assert.equal(phaseFrame(20,80,.5),50);
// Focused imagery must align to the exact source samples, with north-up UV edges.
const glacierSource=JSON.parse(await fs.readFile(path.join(root,'assets/glacier-dem.json'),'utf8'));
const focused=focusGlacierDEM(glacierSource),uv=textureWindow(glacierSource.bounds,focused.bounds);
assert.equal(focused.heights.length,173*131);
assert.equal(focused.heights[0],glacierSource.heights[108*321+55]);
assert.equal(focused.heights.at(-1),glacierSource.heights[238*321+227]);
for(const lon of [focused.bounds[0],focused.bounds[2]])for(const lat of [focused.bounds[1],focused.bounds[3]])assert(Math.abs(sampleElevation(focused,lon,lat)-sampleElevation(glacierSource,lon,lat))<1e-7);
assert(Math.abs(uv.offset[0]+uv.repeat[0]-(focused.bounds[2]-glacierSource.bounds[0])/.13)<1e-10);
assert(Math.abs(uv.offset[1]+uv.repeat[1]-(focused.bounds[3]-glacierSource.bounds[1])/.13)<1e-10);
for(const branch of glacierBranches)assert(sampleElevation(focused,...branch[0])>sampleElevation(focused,...branch.at(-1)),'教学流向整体未向低处');
assert.equal(experimentStep(50,50,50,10),50);
assert(experimentStep(50,80,20,10)<50);
assert(experimentStep(50,20,80,10)>50);
assert.equal(experimentStep(99,0,100,10),100);assert.equal(experimentStep(1,100,0,10),0);
for(let along=0;along<=1;along+=.01){let width=iceHalfWidth(along);assert(Number.isFinite(width)&&width>0);for(let phase=0;phase<=1;phase+=.01){const next=iceHalfWidth(along,phase);assert(next<=width+1e-10);width=next;}}
for (const resource of ['vendor/three.module.js', 'vendor/three.core.js', 'vendor/OrbitControls.js', 'vendor/THREE-LICENSE.txt', 'assets/earth-blue-marble.jpg']) await fs.access(path.join(root, resource));
console.log('013 校验通过：六章33段524秒；地球入口、区域地形、地图定位和人的尺度；14段生活与回望场景，33条导览与19条人物语音完整，动作接触音与分场环境声已接入；开场与四幕需求、选择、变化和回应接入本页观察，连续飞越、交接与返回、传习回应、车辆状态连续；九场景38镜头及真实DEM、影像来源与投影对齐完整。');

// Event references must stay navigable and distinguish teaching scenes from facts.
assert.equal(workspaceScenes.length,15);
assert.equal(historyEvents.length,3);
assert.equal(new Set(historyEvents.map(e=>e.id)).size,historyEvents.length);
for(const event of historyEvents){
 assert.equal(eventById(event.id),event);assert.match(event.source.url,/^https:/);
 assert.equal(event.phases.length,3);assert(event.source.scope.length>8);
 assert.equal(new Set(event.nodes.map(n=>n.id)).size,event.nodes.length);
 for(const node of event.nodes){
  assert.equal(nodeById(event,node.id),node);assert(Number.isFinite(node.lon)&&node.lon>=-180&&node.lon<=180);assert(Number.isFinite(node.lat)&&node.lat>=-90&&node.lat<=90);
  for(const [id,label,nature] of node.models){assert(workspaceScenes.some(s=>s.id===id)||id==='structure');assert(label&&nature);}
 }
}
for(const geo of geographyStops)if(geo.scene)assert(workspaceScenes.some(s=>s.id===geo.scene));
console.log('历史事件、地点定位、模型入口与依据检查通过。');
