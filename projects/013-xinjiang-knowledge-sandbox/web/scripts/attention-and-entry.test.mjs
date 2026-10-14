import test from 'node:test';
import assert from 'node:assert/strict';
import {presentationFrame} from '../public/scene-presentation.js';
import {entryInfluence} from '../public/choice-influence.js';
import {storyReceipts} from '../public/inquiry-spine.js';
test('one primary layer at a time: locating, choosing, acting, replying',()=>{
 for(const args of [{flight:true},{live:{decision:{choice:null}}},{live:{decision:{choice:'cloth',ready:false}}},{live:{dialogue:{id:'market-cloth'},decision:{choice:'cloth'}}}]){
  const p=presentationFrame(args);assert.equal([p.map,p.title,p.choice,p.status,p.dialogue].filter(Boolean).length,1);
  if(p.dialogue||p.choice)assert.equal(p.annotation,false);
 }
 assert.equal(presentationFrame({elapsed:0,live:{decision:{choice:'cloth',ready:true}}}).phase,'observe');
 assert.equal(presentationFrame({elapsed:0,live:{stage:'oasis',waterPlan:'field',waterAge:16}}).phase,'observe');
 assert.equal(presentationFrame({live:{stage:'oasis',mode:'choice',waterPlan:null}}).phase,'choice');
 assert.equal(presentationFrame({live:{dialogue:{id:'child'}},flight:true}).phase,'travel');
});
test('previous completed choices change attention without creating new outcomes',()=>{
 const a={oasis:{plan:'home',replied:true}},b={oasis:{plan:'field',replied:true}};
 assert.equal(entryInfluence('market',a).focus,'family');assert.equal(entryInfluence('market',b).focus,'traveller');
 assert.equal(entryInfluence('market',{oasis:{plan:'home',replied:false}}),null);
 assert.equal(storyReceipts(a).length,1);assert(!a.market);
 const family={market:{goods:0,deliveries:1}},tools={market:{goods:2,deliveries:1}};
 assert.equal(entryInfluence('people',family).focus,'family');assert.equal(entryInfluence('people',tools).focus,'channel');
 assert.equal(entryInfluence('culture',{people:{progress:100,memory:'letter'}}).focus,'teacher');
 assert.equal(entryInfluence('culture',{people:{progress:100,memory:'tools'}}).focus,'learner');
 assert.equal(entryInfluence('logistics',{culture:{choice:'listen',beats:1}}).focus,'resident');
 assert.equal(entryInfluence('logistics',{culture:{choice:'join',beats:1}}).focus,'worker');
 assert.equal(entryInfluence('culture',{}),null);
});
