import {learningPlaces, historicalPeriods, worldLessons, mapLessons} from './knowledge-content.js';
import {knowledgeScenes} from './knowledge-scenes.js';

const ids=list=>list.map(x=>x.id), pick=(value,allowed,fallback)=>allowed.includes(value)?value:fallback;
const events=['zhang','protectorate','xibe','glacier'], scenes=Object.values(knowledgeScenes).flatMap(p=>p.models.map(m=>m[0]));
const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
export function cleanGuideState(value){
 if(value?.version!==1||!['world','map','history','place'].includes(value.stage))return null;
 const place=pick(value.place,ids(learningPlaces),'turpan'), model=pick(value.model,knowledgeScenes[place].models.map(m=>m[0]),null);
 return {version:1,stage:value.stage,place,model,modelOpen:value.stage==='place'&&!!model&&value.modelOpen===true,
  event:model==='glacier'?'glacier':pick(value.event,events,'zhang'),progress:clamp(value.progress),period:pick(value.period,ids(historicalPeriods),'early'),
  trail:pick(value.trail,['zhang','protectorate','migration'],false),lens:pick(value.lens,ids(mapLessons),'relief'),
  mapPick:typeof value.mapPick==='string'?value.mapPick.slice(0,60):'tianshan',mapMode:pick(value.mapMode,['geography','relations'],'geography'),
  mapSurface:pick(value.mapSurface,['globe','terrain'],'globe'),historySurface:pick(value.historySurface,['globe','terrain'],'globe'),
  world:pick(value.world,ids(worldLessons),'position'),worldPick:typeof value.worldPick==='string'?value.worldPick.slice(0,60):'xinjiang',
  settlement:pick(value.settlement,['settle','dig','flow','experiment'],'experiment'),settlementProgress:clamp(value.settlementProgress),
  records:Array.isArray(value.records)?value.records.slice(-12).map(r=>({priority:String(r.priority??'').slice(0,40),label:String(r.label??'').slice(0,80),sequence:String(r.sequence??'').slice(0,180),reply:String(r.reply??'').slice(0,240)})):[]};
}
// Old records remain readable. A modern guide snapshot takes priority when valid.
export function guideForObservation(record){
 const workspace=record?.workspace,n=record?.navigation;if(!workspace||!n)return null;
 const saved=cleanGuideState(workspace.guide);
 if(saved&&(!saved.modelOpen||workspace.scene===(saved.model==='structure'?'terrain':saved.model)))return saved;
 const natural=n.landform==='glacier'||workspace.scene==='glacier'?'glacier':n.landform==='yardang'||workspace.scene==='yardang'?'yardang':null;
 const event=pick(n.eventId,events,'zhang'),place=natural??pick(n.placeId,ids(learningPlaces),{zhang:'kashgar',protectorate:'luntai',xibe:'qabqal'}[event]);
 const model=pick(n.modelId??workspace.scene,knowledgeScenes[place].models.map(m=>m[0]),null);
 if(!natural&&!['model','place','event','region','planet'].includes(n.stage)&&!scenes.includes(workspace.scene))return null;
 return cleanGuideState({version:1,stage:n.stage==='planet'?'world':n.stage==='region'?'map':n.stage==='event'?'history':'place',place,model,modelOpen:n.stage==='model'||!!natural||n.stage==='free'&&!!model,event,progress:n.progress,
  period:natural?'early':event==='xibe'?'qing':'han',trail:natural?false:event==='xibe'?'migration':event,
  lens:natural?'relief':event==='xibe'?'water':event==='zhang'?'corridors':'relief',mapPick:natural?'tianshan':event==='xibe'?'ili-water':event==='zhang'?'south-passage':'tianshan',mapMode:natural?'geography':'relations',settlement:'experiment'});
}
export function directorForContext(guide,workspace){
 if(guide?.stage==='place'||guide?.stage==='map'&&guide.mapMode==='geography'){const topic={glacier:'glacier',kashgar:'zhang',luntai:'protectorate',qabqal:'xibe'}[guide.place];if(topic)return topic;}
 if(guide?.event&&events.includes(guide.event))return guide.event;
 if(workspace?.scene==='glacier'||workspace?.navigation?.landform==='glacier')return 'glacier';
 return pick(workspace?.navigation?.eventId,events,'zhang');
}
