import test from 'node:test';
import assert from 'node:assert/strict';
import {spatialRelations,relationGeometry,relationPose,relationById,relationPlace} from '../public/spatial-relations.js';
import {learningPlaces} from '../public/knowledge-content.js';
import {knowledgeScenes} from '../public/knowledge-scenes.js';
import {eventById} from '../public/history-content.js';

test('Each spatial path opens an existing geographic place and a permitted model',()=>{
 for(const r of Object.values(spatialRelations))for(const p of r.places){
  assert(learningPlaces.some(v=>v.id===p.id));
  assert(eventById(r.id).nodes.some(v=>v.id===p.id));
  assert(knowledgeScenes[p.id].models.some(([id])=>id===p.model));
 }
});
test('Migration overview retains the external origin; regional view never clamps it into Xinjiang',()=>{
 const wide=relationGeometry('xibe'),regional=relationGeometry('xibe','region');
 assert(wide.nodes.some(n=>n.id==='shengjing'&&n.anchor[0]>120));
 assert(wide.lines.some(l=>l.points[0][0]>120&&l.points.at(-1)[0]<90));
 assert(!regional.nodes.some(n=>n.id==='shengjing'));
 assert(regional.lines.every(l=>l.points.every(p=>p[0]<90)));
});
test('Three themes have different connection structures, without inventing a protectorate route',()=>{
 const exchange=relationGeometry('zhang'),institution=relationGeometry('protectorate'),migration=relationGeometry('xibe');
 assert(exchange.lines.some(l=>l.kind==='context'));
 assert(institution.lines.every(l=>l.kind==='local'));
 assert(institution.nodes.some(n=>n.id==='local-0'));
 assert.notDeepEqual(exchange.lines,migration.lines);
});
test('All scales keep the camera outside Earth and have valid endpoint coordinates',()=>{
 for(const r of Object.values(spatialRelations))for(const scope of ['context','region','place'])for(const aspect of [.45,1,2]){
  const pose=relationPose(r.id,scope,r.place,aspect);
  assert(pose.distance>3.2&&pose.surface<3.2);
  const g=relationGeometry(r.id,scope);
  for(const p of [...g.nodes.map(n=>n.anchor),...g.lines.flatMap(l=>l.points)])assert(p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90);
 }
 assert.equal(relationById('invalid').id,'zhang');
 assert.equal(relationPlace('xibe','kashgar').id,'qabqal');
});

import {relationLandforms,relationGuide,relationFocus,relationVisualFrame} from '../public/spatial-relations-geography.js';
test('Each path changes visible geographic relations between overview and regional exploration',()=>{
 assert.equal(relationGeometry('protectorate','context').lines.length,0);
 assert.equal(relationGeometry('protectorate','region').lines.length,2);
 const first=relationGeometry('zhang','context'),regional=relationGeometry('zhang','region');
 assert(first.lines.every(l=>l.kind==='context'));
 assert(regional.lines.some(l=>l.kind==='main')&&regional.lines.some(l=>l.kind==='local'));
 assert(regional.lines.find(l=>l.kind==='local').points.some(p=>p[0]===80.26&&p[1]===41.17));
 assert(relationLandforms('xibe','region').some(f=>f.kind==='valley'));
 assert(!relationLandforms('protectorate').some(f=>f.kind==='valley'));
 assert(relationLandforms('zhang').some(f=>f.id==='kunlun'));
});
test('Replay and geographic comparison reconstruct a reversible visual state',()=>{
 for(const id of ['zhang','protectorate','xibe'])for(const scope of ['context','region','place']){
  const a=relationVisualFrame(id,scope,1),b=relationVisualFrame(id,scope,0),compare=relationVisualFrame(id,scope,1,true);
  assert.equal(b.route,0);assert.equal(b.model,0);assert.equal(a.route,1);
  assert.equal(compare.route,0);assert.equal(compare.model,0);
  assert.equal(relationVisualFrame(id,scope,1).model,a.model);
  assert.equal(relationGuide(id,scope).steps.length,3);
 }
 assert.equal(relationVisualFrame('protectorate','context',1).model,0);
 assert(relationVisualFrame('protectorate','region',1).model>0);
 assert.equal(relationVisualFrame('xibe','context',1).direction,'one-way');
 assert.equal(relationVisualFrame('zhang','region',1).direction,'two-way');
 assert.equal(relationFocus('xibe','tarim'),'all');
 assert.equal(relationFocus('xibe','ili-water'),'ili-water');
});
