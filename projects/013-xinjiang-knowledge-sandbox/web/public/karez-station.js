import * as THREE from 'three';
import {surfaceMaterial} from './surface.js';
import {createActor} from './actor-rig.js';
import {advanceKarez,karezReading,restoredKarez,karezStops} from './karez-inquiry.js';

// An added observation layer; ordinary legacy scene and film keep their old controls.
export function installKarezStation({group,channel,pond,reservoir,field,water,viewport,surfaceHeight}){
 const root=new THREE.Group();root.name='karez-observation';root.visible=false;group.add(root);
 const geometries={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,14,10),cylinder:new THREE.CylinderGeometry(1,1,1,16)};
 const materials=new Map();
 const solid=(parent,geo,color,pos,size)=>{const mat=typeof color==='number'?(materials.get(color)??surfaceMaterial(color)):color;if(typeof color==='number')materials.set(color,mat);const m=new THREE.Mesh(geo,mat);m.position.fromArray(pos);m.scale.fromArray(size);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const helpers={subgroup:(p,pos=[0,0,0])=>{const g=new THREE.Group();g.position.fromArray(pos);p.add(g);return g;},box:(p,c,pos,size)=>solid(p,geometries.box,c,pos,size),ball:(p,c,pos,size)=>solid(p,geometries.ball,c,pos,size),cylinder:(p,c,pos,size)=>solid(p,geometries.cylinder,c,pos,size)};
 const gravel=new THREE.Group();root.add(gravel);
 for(let i=0;i<14;i++){const m=solid(gravel,geometries.ball,0x927350,[-1.95+(i%5-.5)*.085,.38+(i%3)*.04,.69+(i%2)*.025],[.095,.067,.065]);m.rotation.z=i*.7;}
 const top=surfaceHeight(-1.95),hoist=helpers.subgroup(root,[-1.95,top,.43]);
 for(const side of [-1,1])solid(hoist,geometries.box,0x85674a,[side*.37,.58,0],[.065,1.16,.08]);
 solid(hoist,geometries.box,0x85674a,[0,1.16,0],[.89,.075,.09]);
 const rope=solid(hoist,geometries.cylinder,0xa49a77,[0,.25,.04],[.018,.9,.018]);
 const bucket=solid(hoist,geometries.cylinder,0x73664e,[0,0,.04],[.12,.2,.12]);
 const worker=createActor(root,0x778b7e,.62,null,helpers);worker.root.position.set(-2.54,top,-.15);worker.root.rotation.y=Math.PI*.35;
 const receiver=createActor(root,0xb08a65,.72,null,helpers);receiver.root.position.set(7.6,.08,1.45);receiver.root.rotation.y=Math.PI;
 const child=createActor(root,0x779ba0,.5,null,helpers);child.root.position.set(6.55,.1,1.6);child.root.rotation.y=Math.PI*.7;
 const vessel=solid(root,geometries.cylinder,0xb19a77,[7.25,.16,1.24],[.13,.25,.13]);
 const fill=solid(root,geometries.cylinder,0x70c8cf,[7.25,.29,1.24],[.111,.01,.111]);
 const irrigation=[];
 // Authored planting detail, fixed in time: changing water never predicts yield.
 const blade=new THREE.BufferGeometry();blade.setAttribute('position',new THREE.Float32BufferAttribute([-.025,0,0,.025,0,0,.019,.16,.02,-.012,.16,.02,.015,.3,.055],3));blade.setIndex([0,1,2,0,2,3,3,2,4]);blade.computeVertexNormals();
 const plants=new THREE.InstancedMesh(blade,surfaceMaterial(0x82946a,{side:THREE.DoubleSide}),196);plants.castShadow=true;root.add(plants);const dummy=new THREE.Object3D();
 for(let i=0;i<196;i++){const tuft=Math.floor(i/4),row=Math.floor(tuft/7),col=tuft%7;dummy.position.set(4.59+col*.3+Math.sin(tuft*7)*.026,.46,-1.68+row*.44);dummy.rotation.y=i*2.399;dummy.scale.setScalar(.78+(Math.sin(tuft*11)+1)*.16);dummy.updateMatrix();plants.setMatrixAt(i,dummy.matrix);}plants.instanceMatrix.needsUpdate=true;
 for(let i=0;i<5;i++)irrigation.push(solid(root,geometries.box,0x6bc2c6,[5.42,.447,-1.58+i*.49],[1.72,.018,.025]));
 const openWater=solid(root,geometries.box,0x6bc2c6,[6.3,.135,.43],[1.6,.045,.12]);
 const stream=(a,b)=>{const start=channel.getPoint(a).add(new THREE.Vector3(0,0,.20)),end=channel.getPoint(b).add(new THREE.Vector3(0,0,.20));const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(start,end),24,.053,8,false),surfaceMaterial(0x75cecf,{emissive:0x327d80,emissiveIntensity:.22}));root.add(m);return m;};
 const upstream=stream(0,.39),downstream=stream(.39,1);
 const poolLine=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-.73,0,-.53],[.73,0,-.53],[.73,0,.53],[-.73,0,.53]].map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color:0xe2d5ab}));poolLine.position.set(7.3,.43,.44);root.add(poolLine);
 solid(root,geometries.box,0xaa9878,[7.3,-.12,.44],[1.6,.05,1.2]);
 for(const side of [-1,1]){solid(root,geometries.box,0xc4b38e,[7.3+side*.78,.12,.44],[.07,.5,1.25]);solid(root,geometries.box,0xc4b38e,[7.3,.12,.44+side*.59],[1.6,.5,.07]);}
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.35,.017,8,40),new THREE.MeshBasicMaterial({color:0xffd790,depthTest:false}));halo.rotation.x=-Math.PI/2;halo.renderOrder=6;root.add(halo);
 const oldFieldColor=field.material.color.clone();
 let enabled=false,selected='source',care='open',frame=restoredKarez().frame,supply=65;
 function set(options={}){enabled=options.enabled??enabled;root.visible=enabled;if(options.stop)selected=karezStops.some(s=>s.id===options.stop)?options.stop:'source';if(options.restore){const r=restoredKarez(options.restore);supply=r.supply;care=r.care;frame=r.frame;}if(options.care){care=options.care;if(care==='blocked')frame.obstruction=1;if(care==='open')frame.obstruction=0;}if(Number.isFinite(options.supply))supply=options.supply;if(Object.keys(options).some(k=>k!=='supply'))draw(0);}
 function draw(dt){
  field.children.forEach(p=>p.visible=!enabled);reservoir.visible=!enabled;
  if(!enabled){water.visible=true;pond.position.y=.22;field.material.color.copy(oldFieldColor);return null;}
  frame=advanceKarez(frame,dt,{supply,care});const r=karezReading(frame,supply,care);
  gravel.scale.setScalar(frame.obstruction);gravel.visible=frame.obstruction>.002;
  const clearing=care==='clear'&&frame.obstruction>0;
  const lift=clearing?(1-frame.obstruction)*.92:1;
  bucket.position.y=-(top-.5)*(1-lift)+.82*lift;
  rope.scale.y=Math.max(.12,1.12-bucket.position.y);rope.position.y=(1.13+bucket.position.y)/2;
  worker.beginFrame(dt);worker.pose(clearing?'receive':'idle',frame.clock,0);worker.lookAt(bucket.getWorldPosition(new THREE.Vector3()));
  receiver.beginFrame(dt);receiver.pose('idle',frame.clock,1);receiver.lookAt(vessel.getWorldPosition(new THREE.Vector3()));
  child.beginFrame(dt);child.pose('idle',frame.clock,2);child.lookAt(receiver.root.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.6,0)));
  fill.visible=frame.reservoir>.15;fill.position.y=.13+.16*frame.reservoir;
  receiver.reach(vessel.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.1,0)),{side:'right',weight:frame.reservoir>.15?.82:0});
  receiver.applyPerformance({dt,time:frame.clock,expression:frame.reservoir>.42?'warm':'concerned',acknowledge:frame.reservoir>.42?.5:0});worker.applyPerformance({dt,time:frame.clock});child.applyPerformance({dt,time:frame.clock,expression:frame.reservoir>.42?'warm':'neutral'});
  water.visible=false;upstream.visible=supply>0;downstream.visible=frame.outlet>.015;upstream.scale.y=.25+.75*r.source;downstream.scale.y=.12+.88*frame.outlet;
  pond.scale.y=.12+frame.reservoir*1.55;pond.position.y=-.08+.11*pond.scale.y;openWater.scale.x=Math.max(.01,frame.outlet);openWater.visible=frame.outlet>.015;
  irrigation.forEach((m,i)=>{m.visible=frame.reservoir>(i+1)*.12;m.scale.x=Math.max(.04,frame.reservoir)*1.72;});
  field.material.color.copy(oldFieldColor).multiplyScalar(.7+frame.reservoir*.4);
  const stop=karezStops.find(s=>s.id===selected);halo.position.fromArray(stop.point);halo.position.y+=.16;halo.visible=selected!=='channel'||viewport.dataset.karezCutaway==='true';
  for(const [k,v]of Object.entries({karezCare:care,karezObstruction:frame.obstruction.toFixed(3),karezOutlet:frame.outlet.toFixed(3),karezReservoir:frame.reservoir.toFixed(3),karezPhase:r.phase,karezStable:String(r.stable),karezReply:r.reply,karezStop:selected}))viewport.dataset[k]=v;
  return r;
 }
 return {set,update:draw,get enabled(){return enabled;},state:()=>({supply,care,frame:{...frame}}),reading:()=>karezReading(frame,supply,care),particleVisible:(t,offset)=>supply>offset*100&&(t<.39||frame.outlet>offset),};
}
