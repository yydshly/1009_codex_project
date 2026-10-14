import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildStoryThread,makeStoryThread} from '../public/story-thread.js';
import {observationRows} from '../public/lived-process.js';

const empty=buildStoryThread();
assert.equal(empty.observed,0);
assert.equal(empty.complete,0);
assert(empty.tokens.every(t=>t.choice===null&&t.variant==='pending'&&!t.observed));
assert(empty.links.every(l=>!l.observed));

const ledger={
 oasis:{plan:'field',replied:true,manual:true},
 market:{goods:2,deliveries:1,manual:false,choice:'craft'},
 people:{priority:'home',memory:'letter',progress:100,manual:true,choice:'home'},
 culture:{tradition:'dolan',beats:3,choice:'listen',manual:true},
 logistics:{plan:'habitat',green:48,coordinated:true,manual:false},
};
const saved=structuredClone(ledger),thread=buildStoryThread(ledger);
assert.equal(thread.observed,5);
assert.equal(thread.complete,5);
assert.deepEqual(thread.tokens.map(t=>t.variant),['field','craft','letter','listen','habitat']);
assert.deepEqual(thread.tokens.map(t=>t.origin),['你的选择','演示观察','你的选择','你的选择','演示观察']);
assert.equal(thread.tokens[2].choice,'home');
assert.equal(thread.tokens[3].tradition,'dolan');
assert.equal(thread.tokens[4].capacity,4);
assert.equal(thread.tokens[4].green,48);
assert(thread.links.every(l=>l.observed));
assert(thread.scope.includes('不是同一家庭'));
assert(thread.tokens[2].scope.includes('1764—1765'));
assert(thread.tokens[3].scope.includes('另一个社区'));
assert(thread.tokens[4].scope.includes('2023'));
assert.deepEqual(ledger,saved,'Building an exhibition must not alter the saved observations.');
assert.equal(buildStoryThread(ledger).signature,thread.signature,'A replay must leave the comparison unchanged.');

// A selected object is not evidence that its handover or response has finished.
const pending=buildStoryThread({
 oasis:{plan:'home',replied:false},market:{goods:0,deliveries:0},
 people:{priority:'water',memory:'tools',progress:45},culture:{choice:'join',beats:0},
});
assert.equal(pending.observed,4);
assert.equal(pending.complete,0);
assert.deepEqual(pending.tokens.slice(0,4).map(t=>t.variant),['home','cloth','tools','join']);
assert.equal(pending.tokens[4].variant,'pending');
assert.equal(pending.tokens[2].response,'远行与准备');

// Existing display rows preserve visible choices, but do not expose listen/join.
// The model must retain that uncertainty instead of inventing participation.
const rows=buildStoryThread(observationRows(ledger));
assert.deepEqual(rows.tokens.slice(0,3).map(t=>t.variant),['field','craft','letter']);
assert.equal(rows.tokens[3].choice,null);
assert.equal(rows.tokens[3].variant,'rhythm');
assert.equal(rows.tokens[3].beats,3);
assert.equal(rows.tokens[4].choice,'habitat');
const unrecognized=buildStoryThread([{stage:'market',observed:true,detail:'进入场景，留下自己的观察'}]);
assert.equal(unrecognized.tokens[1].choice,null);
assert.equal(unrecognized.tokens[1].complete,false);

const invalid=buildStoryThread({market:{goods:99,deliveries:-5},logistics:{plan:'unsupported',green:500,coordinated:false}});
assert.equal(invalid.tokens[1].choice,null);
assert.equal(invalid.tokens[1].deliveries,0);
assert.equal(invalid.tokens[4].choice,null);
assert.equal(invalid.tokens[4].capacity,0);
assert.equal(invalid.tokens[4].green,100);
assert.equal(invalid.tokens[4].complete,false);

// Verify the exhibition actually creates choice-specific 3D objects and keeps
// result bays apart. No browser or fake screenshot is involved in this check.
const sharedBox=new THREE.BoxGeometry(1,1,1),sharedBall=new THREE.SphereGeometry(1,8,6),sharedCylinder=new THREE.CylinderGeometry(1,1,1,8);
const materials=new Map();
function solid(parent,geometry,color,position=[0,0,0],scale=[1,1,1]){
 if(typeof color==='number'){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));color=materials.get(color);}
 const object=new THREE.Mesh(geometry,color);object.position.set(...position);object.scale.set(...scale);parent.add(object);return object;
}
const helpers={
 solid,box:(p,c,pos,size)=>solid(p,sharedBox,c,pos,size),ball:(p,c,pos,size)=>solid(p,sharedBall,c,pos,size),cylinder:(p,c,pos,size)=>solid(p,sharedCylinder,c,pos,size),
 subgroup(parent,position=[0,0,0]){const group=new THREE.Group();group.position.set(...position);parent.add(group);return group;},
 textSign(parent,title,subtitle,position,width){const object=solid(parent,new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial(),position);object.userData={title,subtitle};return object;},
};
const scene=new THREE.Scene(),exhibition=makeStoryThread(scene,helpers);
exhibition.update({observations:ledger,stage:'culture',clock:8});
assert.equal(exhibition.result.visible,false);
assert.equal(exhibition.group.getObjectByName('outgoing-culture').visible,true);
assert.equal(exhibition.group.getObjectByName('outgoing-market').visible,false);
assert.equal(exhibition.group.getObjectByName('incoming-people').visible,true);
assert.equal(exhibition.group.getObjectByName('outgoing-culture').userData.choice,'listen');
let before=0;exhibition.group.traverse(()=>before++);
exhibition.update({observations:ledger,stage:'culture',clock:9});
let after=0;exhibition.group.traverse(()=>after++);
assert.equal(after,before,'Steady playback must not continually add new objects.');
exhibition.update({observations:ledger,stage:'logistics',cue:'future-synthesis',clock:12,summary:true});
assert.equal(exhibition.result.visible,true);
assert.equal(exhibition.result.getObjectByName('result-market').userData.choice,'craft');
assert.equal(exhibition.result.getObjectByName('result-people').userData.choice,'home');
assert.equal(exhibition.result.getObjectByName('result-logistics').userData.choice,'habitat');
const bays=['oasis','market','people','culture','logistics'].map(stage=>exhibition.result.getObjectByName('result-'+stage));
assert.equal(new Set(bays.map(bay=>bay.position.x)).size,5,'Separate eras require separate display bays.');
const changed={...ledger,market:{goods:0,deliveries:1,manual:true,choice:'cloth'},people:{priority:'water',memory:'tools',progress:100,choice:'water'}};
exhibition.update({observations:changed,stage:'people',clock:13});
assert.equal(exhibition.group.getObjectByName('outgoing-market').userData.choice,'cloth');
assert.equal(exhibition.group.getObjectByName('outgoing-people').userData.choice,'water');
assert.equal(exhibition.model.tokens[2].variant,'tools');
exhibition.hide();assert.equal(exhibition.group.visible,false);
let sharedDisposed=false;sharedBox.addEventListener('dispose',()=>{sharedDisposed=true;});
exhibition.dispose();assert.equal(scene.children.length,0);assert.equal(sharedDisposed,false,'Disposing the thread must preserve scene-owned shared geometry.');

console.log('Story thread: five choices, unfinished responses, saved replay, era separation, row uncertainty and choice-specific 3D exhibition verified.');
