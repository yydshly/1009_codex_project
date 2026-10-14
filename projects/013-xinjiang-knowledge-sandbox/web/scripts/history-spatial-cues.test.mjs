import test from 'node:test';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {narrativeMapProgress,spatialAttention,narrationCueCuts} from '../public/history-spatial-cues.js';
import {storyRange} from '../public/story-observation.js';
import {eventById} from '../public/history-content.js';
import {buildSphericalHistory} from '../public/spherical-history.js';
import {globePosition} from '../public/world-content.js';

test('narrated map time remains continuous, reversible and within its historical chapter',()=>{
 for(const id of ['zhang','protectorate','xibe']){
  let last=-1;
  for(let i=0;i<=1000;i++){
   const p=i/1000,v=narrativeMapProgress(id,p);assert(v>=last&&v>=0&&v<=1);last=v;
   const beat=p<storyRange(id,0)[1]?0:p<storyRange(id,1)[1]?1:2;
   const [a,b]=storyRange(id,beat);assert(v>=a&&v<=b);
   assert.equal(narrativeMapProgress(id,p),v);
  }
 }
});

test('focus follows the rendered route front and place models respond to the same narration time',()=>{
 const markers=[],root=new THREE.Group(),viewport={dataset:{}};
 const groundPoint=(lon,lat,lift=0)=>new THREE.Vector3(...globePosition(lon,lat,3.2+lift));
 const view=buildSphericalHistory({root,event:eventById('zhang'),point:groundPoint,groundPoint,viewport,
  addMarker:(n,position)=>{const m={position,button:{dataset:{},classList:{toggle(){}},setAttribute(){}}};markers.push(m);return m;}});
 const attention=spatialAttention('zhang',1,1);
 const first=view.update(.25,null,{guided:true,attention,focus:'process',motion:28});
 const before=JSON.parse(viewport.dataset.narrationTargetPosition);
 const second=view.update(.6,null,{guided:true,attention,focus:'process',motion:40});
 const after=JSON.parse(viewport.dataset.narrationTargetPosition);
 assert(second.route>first.route);assert.notDeepEqual(before,after);assert.equal(viewport.dataset.narrationTarget,'route');
 view.update(.25,null,{guided:true,attention,focus:'process',motion:28});assert.deepEqual(JSON.parse(viewport.dataset.narrationTargetPosition),before);
 const focus=spatialAttention('zhang',2,2);
 view.update(.99,'kashgar',{guided:true,attention:focus,focus:'impact',motion:66});
 const market=root.getObjectByName('history-miniature-kashgar');assert(market.visible);
 assert.equal(viewport.dataset.narrationTarget,'kashgar');assert(Number(viewport.dataset.eventNetwork)>.98);
 assert(markers.some(m=>m.button.dataset.kgEventDestination==='kashgar'&&m.button.textContent?.includes('点击进入')));
 view.update(.99,'kashgar',{context:true,attention:focus,focus:'impact',motion:66});
 assert.equal(root.getObjectByName('narration-ground-focus').visible,false,'place handoff removes the narration locator');
});


test('camera subject cuts stay aligned with the retained narration and subtitle blocks',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/assets/audio/history-story/manifest.json',import.meta.url),'utf8'));
 const phrases={zhang:[['先把目光','要建立联系'],['此后','画面用金线'],['现在把视线','谁需要']],protectorate:[['这里已经','先看清聚落'],['画面中的机构','乌垒的准确'],['青色线条','下一步靠近']],xibe:[['对官兵与家属','抵达以后'],['跟随方向线','再靠近'],['察布查尔的住房','后来的修渠']]};
 for(const clip of manifest.clips){const beat=['background','process','impact'].indexOf(clip.beat);
  phrases[clip.event][beat].forEach((phrase,i)=>{
   const cue=clip.subtitles.find(s=>s.text.includes(phrase));assert(cue);
   const expected=(cue.time_begin+(cue.time_end-cue.time_begin)*cue.text.indexOf(phrase)/cue.text.length)/1000/clip.duration;
   assert(Math.abs(expected-narrationCueCuts[clip.event][beat][i])<.0001);
  });
 }
});
