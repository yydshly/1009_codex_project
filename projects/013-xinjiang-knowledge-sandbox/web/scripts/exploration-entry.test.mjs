import test from 'node:test';
import assert from 'node:assert/strict';
import {guideForObservation,cleanGuideState,directorForContext} from '../public/exploration-entry.js';
import {cleanMemory,cleanWorkspace,appendObservation} from '../public/exploration-memory.js';
import {glacierDirectorFrame} from '../public/glacier-director.js';
import {directorPaths} from '../public/exploration-director-paths.js';
import {directorStage} from '../public/director-spatial-sequence.js';

test('four legacy records restore their own topic without rewriting the stored scene',()=>{
 for(const [event,place,model,scene,topic] of [['zhang','kashgar','market','market','zhang'],['protectorate','luntai','structure','terrain','protectorate'],['xibe','qabqal','people','people','xibe'],['zhang',null,'glacier','glacier','glacier']]){
  const record={navigation:{version:3,stage:'model',eventId:event,placeId:place,modelId:model,landform:model==='glacier'?'glacier':null,progress:1},workspace:{version:1,scene,camera:[8,4,2],target:[0,1,0],time:43000,parameters:{retreat:31},lived:{settings:{goods:2}}}};
  const before=JSON.stringify(record),g=guideForObservation(record);
  assert.equal(directorForContext(g,record.workspace),topic);assert.equal(g.model,model);assert.equal(g.modelOpen,true);assert.equal(JSON.stringify(record),before);
  if(topic==='xibe')assert.equal(g.settlement,'experiment','old family choices are not reinterpreted as a dated canal scene');
  if(topic==='glacier'){assert.equal(g.trail,false);assert.equal(g.period,'early');assert.equal(g.mapMode,'geography');}
 }
});
test('modern observations round-trip guide context, chronology and parameters through the bounded store',()=>{
 const guide=cleanGuideState({version:1,stage:'place',place:'qabqal',model:'people',modelOpen:true,event:'xibe',period:'qing',trail:'migration',settlement:'flow',settlementProgress:.67,records:[{priority:'flow',label:'放水',reply:'水接到田区'}]});
 const workspace={version:1,scene:'people',guide,camera:[3,8,6],target:[0,1,0],parameters:{flow:52},lived:{clock:5500}};
 const memory=cleanMemory({observations:[{id:'dated',navigation:{version:3,stage:'free',eventId:'xibe'},workspace}]});
 const restored=guideForObservation(JSON.parse(JSON.stringify(memory)).observations[0]);
 assert.equal(restored.settlement,'flow');assert.equal(restored.settlementProgress,.67);assert.equal(restored.records[0].reply,'水接到田区');
 assert.equal(cleanWorkspace(workspace).parameters.flow,52);assert.deepEqual(cleanWorkspace(workspace).camera,[3,8,6]);
 assert.equal(cleanGuideState({version:99,stage:'place'}),null);
});
test('glacier context overrides unrelated old history state; invalid model context does not win',()=>{
 assert.equal(directorForContext(null,{scene:'glacier',navigation:{eventId:'zhang'}}),'glacier');
 const g=guideForObservation({navigation:{stage:'model',landform:'glacier',modelId:'glacier',eventId:'zhang'},workspace:{scene:'glacier',guide:{version:1,stage:'place',place:'kashgar',model:'market',modelOpen:true,event:'zhang'}}});
 assert.equal(g.place,'glacier');assert.equal(directorForContext(g),'glacier');
});
test('glacier director has geography, measured surface and separate teaching modes with reversible frames',()=>{
 const p=directorPaths.glacier;
 assert.equal(p.kind,'nature');assert.equal(p.shots.length,9);assert.equal(new Set(p.shots.map(s=>s.id)).size,9);
 assert.equal(directorStage(p.shots[3]),'map');assert.equal(directorStage(p.shots.at(-1)),'return');assert.equal(p.shots.some(s=>s.beat!==undefined),false);
 assert.deepEqual(p.shots.filter(s=>s.model).map(s=>s.glacierMode),['observation','flow','experiment']);
 assert(p.shots.every(s=>s.audio&&s.speech));
 const experiment=p.shots.find(s=>s.id==='experiment'),end=glacierDirectorFrame(experiment,1),start=glacierDirectorFrame(experiment,0);
 assert.equal(start.retreat,0);assert.equal(end.retreat,42);assert(end.ablation>end.accumulation);assert.equal(glacierDirectorFrame(experiment,0).retreat,0,'replaying restores the initial comparison');
 assert.equal(glacierDirectorFrame(p.shots.find(s=>s.id==='surface'),1).mode,'observation');
});

test('saving an unchanged legacy glacier in the modern guide updates one record instead of duplicating it',()=>{
 const workspace={version:1,scene:'glacier',parameters:{retreat:31},layers:{ghost:true}};
 const old={version:3,stage:'model',modelId:'glacier',landform:'glacier',eventId:'zhang',progress:1};
 let memory=appendObservation(cleanMemory(null),old,workspace,'old');
 const modern={...workspace,guide:cleanGuideState({version:1,stage:'place',place:'glacier',model:'glacier',modelOpen:true,event:'glacier',progress:0})};
 memory=appendObservation(memory,{version:3,stage:'free',eventId:'zhang'},modern,'modern');
 assert.equal(memory.observations.length,1);assert.equal(memory.observations[0].id,'modern');assert.equal(memory.observations[0].workspace.parameters.retreat,31);
});

test('returning to a natural map or choosing another place keeps the director tied to the displayed place',()=>{
 assert.equal(directorForContext({stage:'map',place:'glacier',mapMode:'geography',event:'zhang'}),'glacier');
 assert.equal(directorForContext({stage:'place',place:'luntai',event:'xibe'}),'protectorate');
 assert.equal(directorForContext({stage:'place',place:'qabqal',event:'zhang'}),'xibe');
});
