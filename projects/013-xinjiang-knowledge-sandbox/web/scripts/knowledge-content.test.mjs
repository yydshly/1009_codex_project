import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalPeriods,learningPlaces,knowledgeSources,mapLessons} from '../public/knowledge-content.js';
import {historyEvents} from '../public/history-content.js';
import {workspaceScenes} from '../public/workbench.js';
import {knowledgeScenes} from '../public/knowledge-scenes.js';
import {elevationProfile} from '../public/passage-data.js';
import fs from 'node:fs';

test('history reading links resolve to real events, places and sources',()=>{
 for(const p of historicalPeriods){
  assert.ok(learningPlaces.some(place=>place.id===p.place),p.id+' place');
  for(const id of [p.event,p.secondEvent].filter(Boolean))assert.ok(historyEvents.some(e=>e.id===id),p.id+' event');
  for(const id of p.sources)assert.ok(knowledgeSources[id]?.url.startsWith('https://'),p.id+' source');
  for(const [name,lon,lat]of p.points)assert.ok(name&&Number.isFinite(lon)&&Number.isFinite(lat)&&lon>=73&&lon<=97&&lat>=34&&lat<=50);
 }
});
test('every place has a supported model and distinct learning/representation scope',()=>{
 for(const p of learningPlaces){assert.ok(p.model==='structure'||workspaceScenes.some(s=>s.id===p.model),p.model);for(const k of ['why','see','scope','action'])assert.ok(p[k]?.length>4,p.id+' '+k);}
 assert.equal(new Set(learningPlaces.map(p=>p.id)).size,learningPlaces.length);
});
test('geographic reading includes official-map access and resolves its evidence',()=>{
 assert.deepEqual(mapLessons.map(m=>m.id),['relief','water','cities','corridors']);
 assert.ok(mapLessons.find(m=>m.id==='cities').sources.includes('standard'));
 for(const item of [...mapLessons,...learningPlaces])for(const id of item.sources)assert.ok(knowledgeSources[id]);
});
test('scene entries resolve existing assets and models, with measurable DEM sections',()=>{
 const dem=JSON.parse(fs.readFileSync(new URL('../public/assets/xinjiang-dem.json',import.meta.url),'utf8'));
 for(const place of learningPlaces){
  const scene=knowledgeScenes[place.id];assert.ok(scene);assert.ok(fs.existsSync(new URL('../public/'+scene.image.slice(2),import.meta.url)));
  for(const [model]of scene.models)assert.ok(model==='structure'||workspaceScenes.some(s=>s.id===model));
  const section=elevationProfile(dem,scene.section.map(p=>p.slice(1)));assert.ok(section.samples.every(s=>Number.isFinite(s.height)));assert.ok(section.distance>0);
  assert.deepEqual(scene.section.at(-1).slice(1),[place.lon,place.lat],'comparison must end at its selected place');
 }
});
