import assert from 'node:assert/strict';
import {storyRange,storyProgress,storySubtitle,observationMeaning,modelNarrative} from '../public/story-observation.js';

const expectedRanges={zhang:[[0,.12],[.12,.7],[.7,1]],protectorate:[[0,.16],[.16,.64],[.64,1]],xibe:[[0,.08],[.08,.58],[.58,1]]};
for(const [id,ranges]of Object.entries(expectedRanges)){
 for(const [beat,[start,end]]of ranges.entries()){
  assert.deepEqual(storyRange(id,beat),[start,end]);
  assert.equal(storyProgress(id,beat,0),start);
  assert.equal(storyProgress(id,beat,1),end);
  assert.equal(storyProgress(id,beat,-2),start);
  assert.equal(storyProgress(id,beat,3),end);
  assert.equal(storyProgress(id,beat,.5),(start+end)/2);
  for(const value of [NaN,Infinity,-Infinity,undefined,null,'invalid']){
   const progress=storyProgress(id,beat,value);
   assert(Number.isFinite(progress)&&progress>=start&&progress<=end,'invalid input must remain inside the current chapter');
  }
  const samples=Array.from({length:21},(_,i)=>storyProgress(id,beat,i/20));
  assert(samples.every((v,i)=>i===0||v>=samples[i-1]),'progress is monotonic inside a chapter');
  if(beat<2)assert.equal(storyProgress(id,beat,1),storyProgress(id,beat+1,0),'adjacent chapters must meet without jumps');
 }
 assert.equal(storyProgress(id,0,0),0);assert.equal(storyProgress(id,2,1),1);
}
assert.deepEqual(storyRange('missing',5),[0,1]);
assert.equal(storyProgress('missing',5,.5),.5);

const narration='先看山地。再看通道！最后进入地点？';
assert.equal(storySubtitle(narration,0),'先看山地。');
assert.equal(storySubtitle(narration,.5),'再看通道！');
assert.equal(storySubtitle(narration,1),'最后进入地点？');
assert.equal(storySubtitle(narration,-1),'先看山地。');
assert.equal(storySubtitle(narration,Infinity),'最后进入地点？');
assert.equal(storySubtitle(narration,NaN),'先看山地。');
assert.equal(storySubtitle('没有标点的完整讲解',.9),'没有标点的完整讲解');
for(const value of ['',undefined,null,42,'   '])assert.equal(storySubtitle(value,.5),'','missing subtitle degrades to an empty line');
const longNarration='这里的山地和盆地共同构成往来与停留的地理背景，先在地球表面观察它们的相对位置，再看地点与历史事件之间的联系，最后由用户选择进入具体模型。';
assert(storySubtitle(longNarration,0).endsWith('，'));
assert(storySubtitle(longNarration,1).endsWith('。'));

for(const id of ['zhang','protectorate','xibe']){
 assert.equal(observationMeaning(id),null);
 assert.equal(observationMeaning(id,[{priority:'invalid'}]),null,'an invalid record is not a completed observation');
 assert.equal(observationMeaning(id,null),null);
 assert(modelNarrative(id,{}).text.length>0);
 assert(modelNarrative(id,null).text.length>0);
}
assert.equal(observationMeaning('unknown',[{priority:'0'}]),null,'an unknown path must not become the protectorate');
assert.equal(modelNarrative('unknown',{}).title,'先选择一条历史路径');

// Records below use the priorities emitted only after the existing models finish their responses.
const marketRecords=['0','1','2'].map(priority=>({priority}));
assert.match(observationMeaning('zhang',[marketRecords[0]]).text,/织物/);
assert.match(observationMeaning('zhang',[marketRecords[1]]).text,/补给/);
assert.match(observationMeaning('zhang',[marketRecords[2]]).text,/制作/);
const marketMeaning=observationMeaning('zhang',marketRecords);
assert.equal(marketMeaning.node,'kashgar');
assert.match(marketMeaning.scope,/不是张骞/);
assert.equal(modelNarrative('zhang',{marketUse:'waiting-for-choice'},marketRecords).title,'交流怎样进入生活？','a new selection should show its initial cue despite past observations');
assert.equal(modelNarrative('zhang',{marketUse:'receiving-and-using'},marketRecords).title,'交换正在发生');
for(const state of ['family-continues','traveller-departs','craft-work-continues'])assert.deepEqual(modelNarrative('zhang',{marketUse:state},marketRecords),marketMeaning);
assert.notEqual(modelNarrative('zhang',{marketUse:'family-continues'},[]).title,marketMeaning.title,'a dataset state alone cannot fabricate a receipt');

const familyRecords=[{priority:'home'},{priority:'water'}],familyMeaning=observationMeaning('xibe',familyRecords);
assert.equal(familyMeaning.node,'qabqal');
assert.equal(modelNarrative('xibe',{householdPriority:'home',homeOutcome:'0.4',waterOutcome:'0',settlementReply:'0'},[]).title,'先让家门有灯');
assert.equal(modelNarrative('xibe',{householdPriority:'water',homeOutcome:'0',waterOutcome:'0.4',settlementReply:'0'},[]).title,'先让田边有水');
assert.deepEqual(modelNarrative('xibe',{householdPriority:'water',homeOutcome:'1',waterOutcome:'1',settlementReply:'1'},familyRecords),familyMeaning);
assert.notEqual(modelNarrative('xibe',{homeOutcome:'1',waterOutcome:'1',settlementReply:'1'},[]).title,familyMeaning.title);

const structureRecords=[{priority:'0'},{priority:'3'}],structureMeaning=observationMeaning('protectorate',structureRecords);
assert.equal(structureMeaning.node,'luntai');
assert.match(structureMeaning.scope,/不能证明/);
assert.deepEqual(modelNarrative('protectorate',{historyStructure:'true',structurePart:'space',structureRoofLift:'1.1'},structureRecords),structureMeaning);
assert.notEqual(modelNarrative('protectorate',{historyStructure:'true',structurePart:'space',structureRoofLift:'1.1'},[]).title,structureMeaning.title);

console.log('故事观察：三路径三幕连续进度、字幕降级、模型实际回应与观察记录对应通过');
