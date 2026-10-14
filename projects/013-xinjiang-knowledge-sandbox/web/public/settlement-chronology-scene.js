import {settlementFrame} from './settlement-chronology.js';
import * as THREE from 'three';
import {decoratePeriodSettlement,animatePeriodSettlement} from './settlement-period-detail.js';
import {surfaceMaterial} from './surface.js';
import {settlementStoryFrame} from './settlement-story.js';

// A reversible schematic, deliberately not an archaeological reconstruction.
export function decorateSettlement(g,helpers){
 const {box,ball,cylinder,subgroup,textSign}=helpers;
 const root=subgroup(g),trench=[],water=[],field=subgroup(root),ripple=[];
 const waterMaterial=surfaceMaterial(0x4b8f96,{roughness:.30,metalness:.05},'water');
 // Ili water source and the later main canal occupy a different strip from
 // the original right-hand tributary irrigation. All positions are schematic.
 let river;
 if(helpers.solid){const geometry=new THREE.BufferGeometry(),positions=[],indices=[];for(let i=0;i<=48;i++){const x=-6.8+i*13.6/48,z=-3.65+.10*Math.sin(x*.8)+.045*Math.sin(x*2.3),width=.30+.04*Math.sin(x*1.4);positions.push(x,.095,z-width,x,.095,z+width);if(i<48){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();river=helpers.solid(root,geometry,waterMaterial);}
 else river=box(root,waterMaterial,[-3,.09,-3.65],[7.6,.075,.65]);
 const route=[[-5.4,-3.4],[-5.4,-2.5],[-5,-1.6],[-4.3,-.8],[-3.3,.0],[-2.1,.6],[-.4,.6]];
 for(let k=1;k<route.length;k++){
  const [ax,az]=route[k-1],[bx,bz]=route[k],n=Math.ceil(Math.hypot(bx-ax,bz-az)/.21);
  for(let i=0;i<n;i++){
   const x=ax+(bx-ax)*(i+.5)/n,z=az+(bz-az)*(i+.5)/n,yaw=Math.atan2(bx-ax,bz-az),len=Math.hypot(bx-ax,bz-az)/n+.015;
   const cut=subgroup(root,[x,.06,z]);cut.rotation.y=yaw;
   box(cut,0x72573d,[0,.0,0],[.40,.025,len]);
   for(const side of [-1,1])box(cut,0xa68b60,[side*.245,.07,0],[.085,.13,len]);trench.push(cut);
   const stream=box(root,waterMaterial,[x,.09,z],[.36,.025,len]);stream.rotation.y=yaw;water.push(stream);
  }
 }
 const plants=[];for(let j=0;j<5;j++){
  box(field,0x947955,[-3.0+j*.5,.06,1.8],[.12,.035,1.75]);
  for(let i=0;i<6;i++){const p=subgroup(field,[-3+j*.5,.09,1.05+i*.28]);cylinder(p,0x819057,[0,.19,0],[.011,.38,.011]);ball(p,0xc0ad6c,[0,.40,0],[.025,.065,.025]);for(const side of [-1,1]){const leaf=box(p,0x89985e,[side*.032,.20,0],[.008,.15,.024]);leaf.rotation.z=-side*.43;}plants.push(p);}
 }
 const signs=[textSign(root,'伊犁河水源','伊犁河谷 · 地域参照',[-3,1.15,-3.65],2.5),textSign(root,'后建大渠','19世纪初开挖 · 1808放水',[-4.4,1.18,-.3],2.8),textSign(root,'新增耕地','新渠接田 · 耕作继续',[-2,1.0,2.7],2.7),textSign(root,'初期支流灌溉','支流参照 · 初期田地',[2.5,1.5,-1.1],3)];
 const branch=[],branchWater=[],wet=[],demand=subgroup(root);
 for(let i=0;i<15;i++){const z=.68+i*.135;branch.push(box(root,0x957a56,[-.65,.075,z],[.24,.085,.145]));branchWater.push(box(root,waterMaterial,[-.65,.126,z],[.15,.020,.146]));}
 const wetMaterial=surfaceMaterial(0x706a4a,{roughness:1},'soil');
 for(let x=0;x<6;x++)for(let z=0;z<5;z++)wet.push(box(root,wetMaterial,[-.98-x*.41,.058,1.04+z*.34],[.40,.018,.33]));
 for(const x of [-3.25,-.78])box(demand,0xb4a365,[x,.066,1.87],[.025,.016,2.03]);
 for(const z of [.86,2.87])box(demand,0xb4a365,[-2.01,.066,z],[2.48,.016,.025]);
 const demandSign=textSign(root,'等待接水的田区','扩耕空间 · 关系示意',[-3.75,1.3,1.8],2.7);demandSign.userData.keepSign=true;
 signs[2].position.set(-3.75,1.3,1.8);
 for(let i=0;i<7;i++)ripple.push(ball(root,0xceebdb,[0,.14,0],[.045,.014,.045]));
 signs.forEach(s=>s.userData.keepSign=true);root.visible=false;
 const period=decoratePeriodSettlement(root,helpers);
 return {root,river,trench,water,field,plants,signs,ripple,period,branch,branchWater,wet,demand,demandSign};
}
export function animateSettlement(g,selection,clock,camera,viewport){
 const d=g.userData,c=d.chronology;if(!c)return null;
 c.root.visible=!!selection;
 if(!selection){animatePeriodSettlement(g,null,clock,viewport);if(c.wasActive){d.pavilion.visible=d.official.root.visible=d.scroll.visible=d.entryArch.visible=true;d.workerTools.forEach(t=>t.visible=true);for(const key of ['chest','letter','tools','receiving','label'])if(d.social?.[key]?.isObject3D)d.social[key].visible=true;c.wasActive=false;viewport.dataset.settlementVisibleSignature='experiment';}return null;}c.wasActive=true;
 const f=settlementFrame(selection.phase,selection.progress),count=c.trench.length;viewport.dataset.settlementVisibleSignature=f.stage.id+'/'+Math.round(f.progress*60);
 const story=settlementStoryFrame(f.stage.id,f.progress);
 c.trench.forEach((m,i)=>m.visible=i/count<f.trench);c.water.forEach((m,i)=>m.visible=i/count<f.newWater);
 c.ripple.forEach((m,i)=>{const index=Math.floor(((clock*.12+i/7)%1)*count);m.visible=f.newWater>index/count&&f.newWater>0;m.position.copy(c.water[index].position);m.position.y=.13;});
 c.branch.forEach((m,i)=>m.visible=f.trench>0&&(f.stage.id==='flow'||f.trench>.75+i*.016));c.branchWater.forEach((m,i)=>m.visible=story.branch>i/c.branchWater.length);
 c.wet.forEach((m,i)=>m.visible=story.soil>Math.floor(i/5)/6);
 c.demand.visible=story.demand>0;c.field.visible=f.stage.id==='flow';c.plants.forEach((m,i)=>{m.visible=f.expansion>i/c.plants.length;m.scale.y=1;});
 const focus=c.period?.focus??'story';
 const look=focus==='story'?story.beat.focus:focus,host=viewport.querySelector?.('#canvas-host'),height=host?.clientHeight||600,hostRect=host?.getBoundingClientRect(),heading=viewport.querySelector?.(viewport.classList?.contains('director-active')?'.ed-heading':'.kg-heading h1')?.getBoundingClientRect();
 // Labels retain a readable screen size while the camera moves closer. Only
 // the current observation remains labelled; off-screen labels do not spill
 // over the subtitle or hide people working below them.
 const label=(s,visible)=>{const world=s.getWorldPosition(new THREE.Vector3()),projected=world.clone().project(camera),width=s.geometry.parameters?.width||2.7,worldScale=g.getWorldScale(new THREE.Vector3()).x;
  s.visible=visible&&projected.z<1&&projected.z>-1&&Math.abs(projected.x)<.90&&Math.abs(projected.y)<.76;
  const pixels=Math.min(178,height*.32),distance=camera.position.distanceTo(world);
  if(hostRect&&heading){const x=hostRect.left+(projected.x+1)*hostRect.width/2,y=hostRect.top+(1-projected.y)*height/2;if(x+pixels*.55>heading.left&&x-pixels*.55<heading.right&&y+pixels*.16>heading.top&&y-pixels*.16<heading.bottom)s.visible=false;}
  s.scale.setScalar(distance*2*Math.tan((camera.fov||44)*Math.PI/360)*pixels/height/width/worldScale);
  s.quaternion.copy(g.quaternion.clone().invert().multiply(camera.quaternion));};
 c.signs.forEach((s,i)=>label(s,(i===0||i===3||i===1&&f.trench>0||i===2&&f.expansion>.01)&&look!=='people'&&(look!=='home'||i===3)&&(look!=='water'||i<2)&&(look!=='field'||i===2)&&(look!=='initial'||i===3)));
 label(c.demandSign,story.demand>0&&story.soil<.01&&['overview','field'].includes(look));
 d.pavilion.visible=d.official.root.visible=d.scroll.visible=d.entryArch.visible=false;
 d.houses.forEach(h=>h.scale.y=.95);d.crops.forEach(p=>{p.visible=true;p.scale.y=1;});
 d.families.forEach(({group,rigs},i)=>{group.visible=i===0;group.position.set(3.1+.9*f.settled,0,3.5-1.3*f.settled);group.rotation.y=f.stage.id==='settle'&&f.settled<.95?-.6:0;rigs.forEach((a,j)=>a.pose(f.stage.id==='settle'&&f.settled<.95?'walk':f.stage.id==='settle'&&f.progress<.8?'greet':'watch',clock,j));});
 // Anonymous labour symbols across stages; not a claim that one family lived
 // unchanged across the 42-year interval.
 d.workers.forEach((a,i)=>{a.root.visible=f.working||f.stage.id==='flow';a.root.scale.setScalar(.78);a.root.position.set(f.working?-4.7+f.trench*2.5+i*.7:-2.8+i*1.3,0,f.working?-.15:1.45);a.root.rotation.y=f.working?-.7:1.2;a.pose(f.working&&f.trench>0?'work':'watch',clock,i);});
 d.workerTools.forEach(t=>t.visible=f.working);
 d.water.forEach((b,i)=>{b.visible=true;b.position.set(2.3,.12,-1-((clock*.2+i/6)%1)*1.9);});
 if(d.detail){d.detail.sluice.position.y=.47;d.detail.lamps.forEach(m=>m.material.emissiveIntensity=.4);d.detail.welcomer.pose('watch',clock);}
 const s=d.social;if(s){s.audioHandoff=0;viewport.dataset.memoryHandoff='0';for(const key of ['chest','letter','tools','receiving','label'])if(s[key]?.isObject3D)s[key].visible=false;}
 viewport.dataset.settlementChronology=f.stage.id;viewport.dataset.settlementYear=f.stage.year;viewport.dataset.settlementTrench=f.trench.toFixed(3);viewport.dataset.settlementNewWater=f.newWater.toFixed(3);viewport.dataset.settlementExpansion=f.expansion.toFixed(3);viewport.dataset.settlementInitialWater='1';viewport.dataset.settlementChronologyProgress=f.progress.toFixed(3);viewport.dataset.storyOutcome=f.stage.reply;
 animatePeriodSettlement(g,f,clock,viewport);
 viewport.dataset.settlementBranchWater=story.branch.toFixed(3);viewport.dataset.settlementSoil=story.soil.toFixed(3);viewport.dataset.settlementDemand=story.demand.toFixed(3);
 viewport.dataset.settlementStoryBeat=story.phaseKey;viewport.dataset.settlementVisibleSignature+='/'+Math.floor(clock*3)+'/'+focus;
 return f;
}
