import {historyEvents, geographyStops, eventById, nodeById} from './history-content.js';
import {clampProgress, phaseAt, phaseProgress} from './history-process.js';
import {atlasEntries} from './region-atlas-content.js';
import {workspaceScenes} from './workbench.js';
import {cleanGuideState,guideForObservation} from './exploration-entry.js';

export const observationLimit = 12;
const vector = v => Array.isArray(v) && v.length === 3 && v.every(n => Number.isFinite(n) && Math.abs(n) < 1000);
// Whitelist bounded JSON; never retain navigation recursively or binary/media payloads.
function smallJSON(value, depth = 0) {
 if (depth > 6) return null;
 if (typeof value === 'number') return Number.isFinite(value) ? Math.max(-100000, Math.min(100000, value)) : 0;
 if (typeof value === 'boolean' || value === null) return value;
 if (typeof value === 'string') return value.slice(0, 80);
 if (Array.isArray(value)) return value.slice(0, 16).map(v => smallJSON(v, depth + 1));
 if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([k]) => !['__proto__', 'constructor', 'prototype', 'navigation'].includes(k)).slice(0, 32).map(([k,v]) => [k.slice(0, 40), smallJSON(v, depth + 1)]));
 return null;
}
export function cleanWorkspace(value) {
 if (value?.version !== 1 || !workspaceScenes.some(s => s.id === value.scene)) return null;
 const s = {version:1, scene:value.scene, time:Math.max(0, Math.min(100000, Number(value.time)||0)), speed:[.5,1,2,4].includes(value.speed)?value.speed:1, light:Math.max(0, Math.min(360, Number(value.light)||0)), wire:!!value.wire, markers:value.markers!==false};
 if (vector(value.camera) && vector(value.target)) {s.camera=[...value.camera];s.target=[...value.target];}
 s.guide=cleanGuideState(value.guide);
 s.parameters={};
 for(const [key,min,max] of [['exaggeration',1,70],['localExaggeration',1,4],['flow',0,100],['route',0,100],['erosion',0,100],['retreat',0,100],['accumulation',0,100],['ablation',0,100],['migration',0,100]])if(Number.isFinite(value.parameters?.[key]))s.parameters[key]=Math.max(min,Math.min(max,value.parameters[key]));
 for(const key of ['cutaway','labels'])if(typeof value.parameters?.[key]==='boolean')s.parameters[key]=value.parameters[key];
 if(['observation','flow','experiment'].includes(value.parameters?.glacierMode))s.parameters.glacierMode=value.parameters.glacierMode;
 for (const k of ['layers','lived']) s[k]=smallJSON(value[k]);
 if (Number.isFinite(value.flowTime)) s.flowTime=Math.max(0,Math.min(100000,value.flowTime));
 return s;
}
export function cleanNavigation(value, allowOrigin=true) {
 if (!value || ![1,2,3].includes(value.version)) return null;
 const eventId=eventById(value.eventId).id, e=eventById(eventId);
 let stage=['planet','region','event','place','model','free'].includes(value.stage)?value.stage:'region';
 let landform=geographyStops.find(g=>g.id===value.landform)?.id??null;
 let placeId=landform||['planet','region','free'].includes(stage)?null:nodeById(e,value.placeId)?.id??null;
 let modelId=stage==='model'?(landform?geographyStops.find(g=>g.id===landform)?.scene===value.modelId:nodeById(e,placeId)?.models.some(m=>m[0]===value.modelId))?value.modelId:null:null;
 if (stage==='model'&&!modelId) stage=landform?'region':placeId?'place':'event';
 if (stage==='place'&&!placeId) stage='event';
 if (!['region','model'].includes(stage)) landform=null;
 const phase=Math.max(0,Math.min(2,Number(value.phase)||0));
 const progress=value.version===1?(value.stage==='model'&&value.modelId==='structure'?Math.max(.5,phaseProgress[phase]):phaseProgress[phase]):clampProgress(value.progress);
 const mapBookmark=cleanWorkspace(value.mapBookmark);
 const rc=value.regionContext,returnWorkspace=cleanWorkspace(rc?.workspace);
 const regionContext=rc&&['geography','water','history','all'].includes(rc.layer)?{layer:rc.layer,entry:atlasEntries.some(e=>e.id===rc.entry)?rc.entry:null,eventId:eventById(rc.eventId).id,workspace:returnWorkspace?.scene==='terrain'?returnWorkspace:null}:null;
 let origin=null;
 if(allowOrigin&&stage==='free'&&value.origin){const navigation=cleanNavigation(value.origin.navigation,false),workspace=cleanWorkspace(value.origin.workspace);if(navigation&&workspace){const expected=navigation.stage==='model'?(navigation.modelId==='structure'?'terrain':navigation.modelId):navigation.stage==='free'?workspace.scene:navigation.stage==='planet'?'earth':'terrain';if(workspace.scene===expected)origin={navigation,workspace,label:typeof value.origin.label==='string'?value.origin.label.slice(0,80):'原来的观察'};}}
 return {version:3,stage,eventId,placeId,landform,modelId,progress,phase:phaseAt(progress),speed:[.5,1,2,4].includes(value.speed)?value.speed:1,modelLinked:value.version===1?value.stage!=='model':value.modelLinked!==false,mapBookmark:mapBookmark?.scene==='terrain'?mapBookmark:null,modelBookmark:cleanWorkspace(value.modelBookmark),regionContext,structureExploded:!!value.structureExploded,structurePart:Number.isInteger(value.structurePart)&&value.structurePart>=0&&value.structurePart<4?value.structurePart:-1,origin,mapLayer:['geography','water','history','all'].includes(value.mapLayer)?value.mapLayer:'geography',atlasEntry:stage==='region'&&atlasEntries.some(e=>e.id===value.atlasEntry)?value.atlasEntry:null};
}
export function cleanMemory(value) {
 const sessions={};
 for (const e of historyEvents) {
  const v=value?.sessions?.[e.id];if(!v)continue;
  const map=cleanWorkspace(v.mapBookmark);
  sessions[e.id]={progress:clampProgress(v.progress),speed:[.5,1,2,4].includes(v.speed)?v.speed:1,mapBookmark:map?.scene==='terrain'?map:null};
 }
 const observations=[];
 for (const r of (Array.isArray(value?.observations)?value.observations:[]).slice(-observationLimit)) {
  const navigation=cleanNavigation(r.navigation), workspace=cleanWorkspace(r.workspace);
  if(!navigation||!workspace||!['region','event','place','model','free'].includes(navigation.stage))continue;
  // Reject a mismatched imported model/view instead of showing contradictory context.
  const expected=navigation.stage==='model'?(navigation.modelId==='structure'?'terrain':navigation.modelId):navigation.stage==='free'?workspace.scene:'terrain';
  if(workspace.scene!==expected)continue;
  observations.push({id:typeof r.id==='string'?r.id.slice(0,40):'observation-'+observations.length,navigation,workspace,response:typeof r.response==='string'?r.response.slice(0,400):''});
 }
 return {version:1,sessions,observations};
}
export function appendObservation(memory, navigation, workspace, id, response='') {
 const record=cleanMemory({observations:[{id,navigation,workspace,response}]}).observations[0];
 if(!record)return memory;
 const key=r=>{const g=guideForObservation(r);return JSON.stringify([g?[g.stage,g.place,g.model,g.place==='glacier'||g.place==='yardang'?null:g.event,g.place==='glacier'||g.place==='yardang'?null:Math.round(g.progress*100),g.model==='people'?g.settlement:null]:[r.navigation.stage,r.navigation.eventId,r.navigation.placeId,r.navigation.modelId],r.navigation.mapLayer,r.navigation.atlasEntry,g?.model==='structure'?r.navigation.structureExploded:null,g?.model==='structure'?r.navigation.structurePart:null,r.workspace.parameters,r.workspace.lived]);};
 return {...memory,observations:[...memory.observations.filter(r=>key(r)!==key(record)),record].slice(-observationLimit)};
}
