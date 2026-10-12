import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { STAGE_TEMPLATES, createTemplateStage } from '../src/stage-templates.js';
import { STAGE_LIBRARY_KEY, readStageLibrary, readStageSelection, selectStageReference, saveStageProject } from '../src/stage-projects.js';
import { saveStage, STAGE_STORAGE_KEY, validateStage } from '../src/stage-definition.js';
import { stageFrame } from '../src/stage-framing.js';
import { StageLayout } from '../src/stage-layout.js';
import { LaunchContent } from '../src/launch-content.js';
import { syncLaunchShows } from '../src/launch-plan.js';
import { syncStageShows } from '../src/stage-plan.js';
import { parseProgram } from '../src/program-loader.js';
const storage = () => { const values=new Map(); return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}; };
const persist = (s,stage,id,extra={})=>saveStageProject(s,stage,{id,now:100,...extra});

test('五套模板有不同空间布局，符合旧协议，创建返回独立副本',()=>{
  assert.equal(STAGE_TEMPLATES.length,5); const signatures=new Set();
  for(const template of STAGE_TEMPLATES){
    const stage=createTemplateStage(template.id);assert.deepEqual(validateStage(stage),stage);
    assert.ok(stage.objects.some(x=>x.type==='slot'));assert.ok(stage.objects.some(x=>x.type==='screen'));
    signatures.add(JSON.stringify(stage.objects.filter(x=>x.type==='platform').map(x=>[x.position,x.size,x.shape])));
    stage.objects[0].size[0]=30;assert.notEqual(createTemplateStage(template.id).objects[0].size[0],30);
  }
  assert.equal(signatures.size,5);assert.throws(()=>createTemplateStage('invalid'));
});
test('已有单舞台迁移成独立项目，第一次保存保留旧数据与项目',()=>{
  const s=storage(), old=createTemplateStage('aurora-island');saveStage(s,old);const raw=s.getItem(STAGE_STORAGE_KEY);
  assert.equal(readStageSelection(s).projectId,'project-legacy');
  persist(s,createTemplateStage('runway'),'project-runway');
  assert.deepEqual(readStageLibrary(s).projects.find(x=>x.id==='project-legacy').stage,old);
  assert.equal(s.getItem(STAGE_STORAGE_KEY),raw);
});
test('模板另存、项目再另存和更新版本分别维护独立资产，原模板与原项目不变',()=>{
  const s=storage(), stage=createTemplateStage('runway'), original=structuredClone(stage);
  const first=persist(s,stage,'project-a',{templateId:'runway'});stage.objects[0].size[0]=22;
  const second=persist(s,stage,'project-b',{templateId:'runway'});
  const library=readStageLibrary(s);assert.equal(library.projects.length,2);assert.notEqual(first.ref,second.ref);
  assert.deepEqual(library.projects[0].stage,original);assert.deepEqual(createTemplateStage('runway'),original);
  const modified=structuredClone(second.stage);modified.name='客户方案';modified.objects[1].size[0]=4.8;
  const updated=persist(s,modified,'unused',{projectId:second.projectId});assert.equal(updated.revision,2);
  assert.equal(readStageLibrary(s).projects.length,2);assert.deepEqual(readStageLibrary(s).projects[0].stage,original);
});
test('项目选择跨读取方共享并保持配置与版本，模板选择不会改写项目',()=>{
  const s=storage();const a=persist(s,createTemplateStage('studio'),'project-a');const b=persist(s,createTemplateStage('exhibition'),'project-b');
  selectStageReference(s,a.ref);assert.deepEqual(readStageSelection(s).stage,a.stage);
  const music=readStageSelection(s),launch=readStageSelection(s);assert.deepEqual(music,launch);
  music.stage.objects[0].position[0]=25;assert.deepEqual(readStageSelection(s).stage,a.stage);
  selectStageReference(s,'template:grand-launch');assert.equal(readStageSelection(s).revision,0);
  assert.deepEqual(readStageLibrary(s).projects[1].stage,b.stage);assert.throws(()=>selectStageReference(s,'project:missing'));
});
test('损坏项目库、重复 ID、非法配置和存储失败不覆盖原资产或伪报保存成功',()=>{
  const s=storage();persist(s,createTemplateStage('studio'),'project-a');const before=s.getItem(STAGE_LIBRARY_KEY);
  const invalid=createTemplateStage('studio');invalid.objects[0].position[0]=NaN;
  assert.throws(()=>persist(s,invalid,'project-b'));assert.equal(s.getItem(STAGE_LIBRARY_KEY),before);
  assert.throws(()=>persist(s,createTemplateStage('studio'),'project-a'));assert.equal(s.getItem(STAGE_LIBRARY_KEY),before);
  assert.throws(()=>saveStageProject({getItem:()=>null,setItem:()=>{throw Error('quota');}},createTemplateStage('studio')),/quota/);
  s.setItem(STAGE_LIBRARY_KEY,'{broken');assert.ok(readStageSelection(s).warning);
  assert.throws(()=>persist(s,createTemplateStage('studio'),'project-b'));assert.equal(s.getItem(STAGE_LIBRARY_KEY),'{broken');
});
test('镜头拟合包含旋转台面全部角点，T 台前端与展厅两侧都在范围内',()=>{
  for(const template of STAGE_TEMPLATES){
    const stage=createTemplateStage(template.id),frame=stageFrame(stage);assert.ok(frame.extent>=12&&Number.isFinite(frame.extent));
    for(const platform of stage.objects.filter(x=>x.type==='platform'))for(const sx of [-1,1])for(const sz of [-1,1]){
      const a=platform.rotationY*Math.PI/180,dx=sx*platform.size[0]/2,dz=sz*platform.size[2]/2;
      const x=platform.position[0]+dx*Math.cos(a)+dz*Math.sin(a),z=platform.position[2]-dx*Math.sin(a)+dz*Math.cos(a);
      assert.ok(Math.abs(x-frame.center[0])<=frame.extent/2+1e-9);assert.ok(Math.abs(z-frame.center[2])<=frame.extent/2+1e-9);
    }
  }
});
test('五套项目的两种真实装配使用相同构件变换，业务节目和内容各自独立',async()=>{
  const assets=new Map();for(const id of ['corners','light-flower','orbits','lab-mark']){
    const bytes=await readFile(new URL(`../public/shows/${id}.ild`,import.meta.url));assets.set(id,parseProgram(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
  }
  for(const template of STAGE_TEMPLATES){
    const s=storage();persist(s,createTemplateStage(template.id),'project-test');
    const music=new StageLayout(new THREE.Scene(),null,{showSlots:false}),launch=new StageLayout(new THREE.Scene(),null,{showSlots:false});
    music.build(readStageSelection(s).stage);launch.build(readStageSelection(s).stage);const content=new LaunchContent(launch);
    try{
      syncStageShows(music.shows,assets,35);syncLaunchShows(launch.shows,assets,12);
      for(const [id,record]of music.records){const other=launch.records.get(id);assert.deepEqual(record.element,other.element);assert.deepEqual(record.root.position.toArray(),other.root.position.toArray());assert.equal(record.root.rotation.y,other.root.rotation.y);if(record.show){assert.equal(record.show.pointRate,other.show.pointRate);assert.ok(record.show.scanner.samples>0&&other.show.scanner.samples>0);}}
      const slot=readStageSelection(s).stage.objects.find(x=>x.type==='slot');assert.equal(content.productRoot.parent,launch.records.get(slot.id).root);
    }finally{content.dispose();music.dispose();launch.dispose();}
  }
});
