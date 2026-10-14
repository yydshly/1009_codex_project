import * as THREE from 'three';
import {createHistoryMaterials} from './history-materials.js';

// Readable teaching miniatures, not measured historical reconstructions.
// Geometry is shared within one event build; the owning layer disposes it.
export function createHistoryVisualModels(){
 const surfaces=createHistoryMaterials();
 const geometries=new Map();
 const geometry=(key,make)=>{if(!geometries.has(key))geometries.set(key,make());return geometries.get(key);};
 const boxGeometry=()=>geometry('box',()=>new THREE.BoxGeometry(1,1,1));
 const sphereGeometry=()=>geometry('sphere',()=>new THREE.SphereGeometry(1,8,6));
 const cylinderGeometry=()=>geometry('cylinder',()=>new THREE.CylinderGeometry(1,1,1,8));
 const roofGeometry=()=>geometry('roof',()=>new THREE.ConeGeometry(1,1,4));
 const wheelGeometry=()=>geometry('wheel',()=>new THREE.TorusGeometry(1,.19,5,12));
 const palette={sand:0xb59b74,wall:0xcbb58c,roof:0x81644b,tan:0xc89c66,cloth:0xbb7754,teal:0x79b8ad,gold:0xe4bc71,dark:0x574e3d,green:0x92a775};
 function group(parent,name){const g=new THREE.Group();if(name)g.name=name;if(parent)parent.add(g);return g;}
 function material(color,options={}){return surfaces.material(color,options);}
 function mesh(parent,geo,color,x,y,z,sx,sy,sz,{name,lit=false,surface,groundSurface=false}={}){const m=new THREE.Mesh(geo,material(color,{lit,surface}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);if(name)m.name=name;if(groundSurface)m.userData.groundSurface=true;parent.add(m);return m;}
 const box=(g,c,x,y,z,w,h,d,options)=>mesh(g,boxGeometry(),c,x,y,z,w,h,d,options);
 const ball=(g,c,x,y,z,w,h,d,options)=>mesh(g,sphereGeometry(),c,x,y,z,w,h,d,options);
 const pole=(g,c,x,y,z,r,h,options)=>mesh(g,cylinderGeometry(),c,x,y,z,r,h,r,options);
 function link(g,c,from,to,r){const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a),m=pole(g,c,...a.clone().add(b).multiplyScalar(.5).toArray(),r,delta.length());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
 function hipRoof(g,x,y,z,w,h,d){const m=mesh(g,roofGeometry(),palette.roof,x,y,z,w*.71,h,d*.71);m.rotation.y=Math.PI/4;return m;}
 function archGeometry(){return geometry('arch',()=>{const s=new THREE.Shape(),r=.5,inner=.29,spring=.48;s.moveTo(-r,0);s.lineTo(-r,spring);s.absarc(0,spring,r,Math.PI,0,true);s.lineTo(r,0);s.lineTo(inner,0);s.lineTo(inner,spring);s.absarc(0,spring,inner,0,Math.PI,false);s.lineTo(-inner,0);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.19,bevelEnabled:false,curveSegments:8});});}
 function arch(g,x,y,z,w,h,c=palette.wall){const a=mesh(g,archGeometry(),c,x,y,z,w,h,w,{name:'history-open-arch',surface:'plaster'});a.userData.groundContact=true;return a;}
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{const p=clamp(v);return p*p*(3-2*p);};
 const span=(p,a,b)=>ease((p-a)/(b-a));
 const clock=t=>Number.isFinite(t)?Math.max(0,t):0;
 const cycle=(t,d)=>clock(t)%d/d;
 const mix=(a,b,t)=>a+(b-a)*t;
 function human({color=palette.teal,carrying=false,child=false}={}){
  const root=group(null,'history-person'),body=group(root,'history-person-body'),head=group(body,'history-person-head'),arms=[],legs=[];
  pole(body,color,0,.040,0,.011,.027,{surface:'cloth'});head.position.set(0,.063,0);
  ball(head,0xd8b88d,0,0,0,.0085,.010,.008,{surface:'skin'});pole(head,color,0,.009,0,.0095,.003,{surface:'cloth'});
  ball(head,0xc19a76,0,-.001,.008,.002,.002,.002,{surface:'skin'});
  for(const side of [-1,1]){
   const shoulder=group(body,'history-shoulder'),elbow=group(shoulder,'history-elbow');shoulder.position.set(side*.013,.052,0);elbow.position.y=-.013;
   pole(shoulder,color,0,-.0065,0,.0032,.013,{surface:'cloth'});pole(elbow,color,0,-.0065,0,.0028,.013,{surface:'cloth'});
   const hand=ball(elbow,0xd8b88d,0,-.014,0,.0032,.0038,.0032,{name:side<0?'history-hand-left':'history-hand-right',surface:'skin'});arms.push({shoulder,elbow,hand});
   const hip=group(body,'history-hip'),knee=group(hip,'history-knee');hip.position.set(side*.0055,.027,0);knee.position.y=-.013;
   pole(hip,palette.dark,0,-.0065,0,.0038,.013,{surface:'cloth'});pole(knee,palette.dark,0,-.0055,0,.0034,.011,{surface:'cloth'});
   box(knee,palette.dark,0,-.012,.0025,.006,.004,.010,{name:'history-person-foot',surface:'wood'});legs.push({hip,knee});
  }
  const cargo=carrying?box(body,palette.gold,0,.043,.025,.024,.017,.018,{name:'history-person-cargo',surface:'cloth'}):null;
  if(child)root.scale.setScalar(.66);
  return {root,body,head,hands:arms.map(a=>a.hand),update(t,{walk=1,gesture=0,reach=gesture,hold=carrying?1:0,bend=0,nod=0,look=0}={}){
   const phase=cycle(t,1.18);walk=clamp(walk);const lift=Math.abs(phase*2-1);
   body.position.y=walk*.0015*(1-lift);body.rotation.x=bend*.30;body.rotation.z=walk*.016*Math.sin(phase*Math.PI*2);
   head.rotation.x=nod*.22-bend*.12;head.rotation.y=look*.28;
   for(let i=0;i<2;i++){
    const p=(phase+i*.5)%1,swing=p<.5?mix(-.40,.43,ease(p*2)):mix(.43,-.40,ease((p-.5)*2));
    legs[i].hip.rotation.x=swing*walk;legs[i].knee.rotation.x=-Math.max(0,Math.sin(p*Math.PI*2))*.64*walk;
    arms[i].shoulder.rotation.x=-swing*.64*walk-reach*(i===1?.83:.62)-hold*.63;
    arms[i].elbow.rotation.x=-.10-reach*.70-hold*.67;arms[i].shoulder.rotation.z=(i===0?1:-1)*(.09+reach*.08);
   }
   if(cargo){cargo.rotation.z=body.rotation.z*.45;cargo.rotation.x=-bend*.12;}
  }};
 }
 // Local action clocks use staged actions (approach, offer, receive, use),
 // rather than free-running random swaying. Replaying a clock restores a frame.
 function handLocal(scene,actor,target,index=1){scene.updateWorldMatrix(true,true);actor.hands[index].getWorldPosition(target);return scene.worldToLocal(target);}
 function betweenParcel(scene,parcel,from,to,progress,a,b){handLocal(scene,from,a);handLocal(scene,to,b);parcel.position.copy(a).lerp(b,progress);parcel.rotation.set(0,mix(from.root.rotation.y,to.root.rotation.y,progress),0);}
 function jar(parent,x,z,size=1){const g=group(parent,'history-market-jar');g.position.set(x,0,z);g.scale.setScalar(size);g.userData.groundContact=true;ball(g,0xb16f4c,0,.011,0,.009,.012,.009,{surface:'earth'});pole(g,0x8c593f,0,.023,0,.0045,.005,{surface:'earth'});return g;}
 function tree(parent,x,z,size=1){const g=group(parent,'history-local-tree');g.position.set(x,0,z);g.scale.setScalar(size);g.userData.groundContact=true;pole(g,palette.roof,0,.026,0,.003,.052,{surface:'wood'});ball(g,0x728e61,-.008,.054,0,.021,.027,.019,{surface:'foliage'});ball(g,0x91a779,.012,.060,.006,.017,.022,.016,{surface:'foliage'});return g;}
 function basket(parent,x,z,color=palette.gold){const g=group(parent,'history-market-basket');g.position.set(x,0,z);g.userData.groundContact=true;pole(g,0xa48350,0,.006,0,.009,.012,{surface:'wood'});ball(g,color,0,.012,0,.007,.006,.007,{surface:'cloth'});return g;}
 function camel(index=0){
  const root=group(null,'history-camel'),body=group(root),legs=[],packs=group(body,'history-camel-packs');
  ball(body,palette.tan,0,.042,0,.019,.019,.038);
  for(const z of [-.016,.013])ball(body,palette.tan,0,.06,z,.012,.014,.012);
  link(body,palette.tan,[0,.047,.026],[0,.081,.042],.008);
  ball(body,palette.tan,0,.083,.049,.009,.010,.016);ball(body,0xa57e56,0,.079,.062,.008,.006,.012);
  for(const x of [-.007,.007])ball(body,palette.tan,x,.095,.044,.003,.006,.003);
  for(const [x,z]of [[-.013,-.024],[.013,-.024],[-.013,.022],[.013,.022]]){const pivot=group(root);pivot.position.set(x,.03,z);pole(pivot,palette.tan,0,-.015,0,.0032,.03);legs.push(pivot);}
  box(packs,[palette.cloth,palette.teal,palette.gold][index%3],0,.061,0,.039,.005,.043);
  for(const x of [-.025,.025])box(packs,0xa28b64,x,.039,-.008,.017,.025,.024);
  link(body,palette.dark,[0,.043,-.035],[0,.025,-.045],.0018);
  return {root,update(t,{walk=1}={}){const phase=t*4.7+index*1.7;body.position.y=Math.sin(phase*2)*.0018*walk;legs.forEach((p,i)=>p.rotation.x=Math.sin(phase+(i===0||i===3?0:Math.PI))*.42*walk);packs.rotation.z=Math.sin(phase)*.065*walk;}};
 }
 function cart(){
  const root=group(null,'history-luggage-cart'),wheels=[];
  box(root,palette.roof,0,.022,0,.036,.008,.044);
  for(const x of [-.025,.025]){const pivot=group(root);pivot.position.set(x,.014,0);pivot.rotation.y=Math.PI/2;const wheel=mesh(pivot,wheelGeometry(),palette.dark,0,0,0,.012,.012,.012);wheels.push(wheel);}
  for(const x of [-.021,.021])box(root,palette.roof,x,.034,0,.006,.023,.046);
  box(root,palette.gold,-.005,.039,-.008,.022,.027,.02);ball(root,palette.cloth,.01,.043,.013,.014,.013,.015);
  for(const x of [-.013,.013])box(root,palette.roof,x,.023,.045,.003,.003,.055);
  return {root,update(t,{walk=1}={}){wheels.forEach(w=>w.rotation.z=-t*5*walk);}};
 }
 function caravan(kind='zhang'){
  const actors=kind==='zhang'?[human(),camel(0),camel(1),camel(2),human({color:palette.cloth,carrying:true})]:kind==='xibe'?[human({color:palette.cloth,carrying:true}),cart(),human({color:palette.teal}),human({color:palette.gold,child:true})]:[human({color:palette.teal,carrying:true}),cart()];
  actors.forEach((actor,i)=>actor.root.userData.processActor=i);
  return actors;
 }
 function house(parent,x,z,{size=1,light=false}={}){
  const root=group(parent,'history-house');root.position.set(x,0,z);root.scale.setScalar(size);root.userData.groundContact=true;
  box(root,palette.wall,0,.03,0,.068,.06,.052);hipRoof(root,0,.071,0,.085,.034,.072);
  box(root,palette.dark,0,.022,.027,.019,.043,.002);
  const window=box(root,light?palette.gold:palette.dark,.023,.04,.027,.009,.012,.002,{name:'history-house-window',lit:light});
  return {root,window};
 }
 function village(){const root=group(null,'history-local-settlement');house(root,-.051,-.02,{size:.75});house(root,.034,-.023,{size:.9});house(root,.061,.043,{size:.48});box(root,0xa79a79,-.005,.001,.005,.017,.001,.125,{surface:'earth',groundSurface:true});tree(root,-.083,.035,.8);jar(root,.044,.029,.7);return {root};}
 function canopyGeometry(){return geometry('canopy',()=>{const vertices=[],indices=[];for(let j=0;j<3;j++)for(let i=0;i<5;i++)vertices.push(i/4-.5,-Math.sin(i/4*Math.PI)*.08,j/2-.5);for(let j=0;j<2;j++)for(let i=0;i<4;i++){const a=j*5+i;indices.push(a,a+5,a+1,a+1,a+5,a+6);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;});}
 function market(){
  const root=group(null,'history-market'),stalls=[],people=[];
  arch(root,0,0,.113,.068,.078);tree(root,-.102,.081,1.05);tree(root,.111,-.07,.82);
  for(const [i,[x,z,c]]of [[-.079,-.035,palette.cloth],[.079,-.035,palette.teal],[0,-.088,palette.gold]].entries()){
   const stall=group(root,'history-market-stall');stall.position.set(x,0,z);stall.userData.groundContact=true;
   for(const px of [-.026,.026])for(const pz of [-.018,.018])pole(stall,palette.roof,px,.042,pz,.0025,.084);
   const awning=mesh(stall,canopyGeometry(),c,0,.091,0,.070,.055,.051,{surface:'cloth'});awning.material.side=THREE.DoubleSide;
   box(stall,palette.roof,0,.024,0,.06,.008,.035);
   for(let k=0;k<3;k++)box(stall,[palette.gold,palette.teal,palette.cloth][k],-.019+k*.019,.034,0,.014,.012,.021);
   stalls.push(awning);
   // Faces and the handoff remain outside every canopy footprint.
   const person=human({color:c}),spots=[[.012,-.125],[.056,-.008],[0,-.055]];person.root.position.set(spots[i][0],0,spots[i][1]);if(i===0)person.root.rotation.y=Math.PI/2;person.root.scale.setScalar(.75);person.root.userData.groundContact=true;root.add(person.root);people.push(person);
  }
  const buyer=human({color:palette.gold});buyer.root.scale.setScalar(.8);buyer.root.userData.groundContact=true;root.add(buyer.root);people.push(buyer);
  for(const [x,z,s]of [[-.11,-.015,.9],[-.056,-.070,.7],[.095,.010,.8]])jar(root,x,z,s);
  basket(root,-.081,.010);basket(root,.084,-.078,palette.cloth);
  const parcel=box(root,palette.cloth,0,0,0,.015,.010,.013,{name:'history-market-exchange',surface:'cloth'}),a=new THREE.Vector3(),b=new THREE.Vector3(),tray=new THREE.Vector3(.082,.038,-.050);
  let frame=0,active=false;
  function placeParcel(){const p=frame,handoff=span(p,.27,.40),place=span(p,.70,.79);
   if(p<.40){betweenParcel(root,parcel,people[0],buyer,handoff,a,b);root.userData.parcelOwner=p<.27?'seller':'handoff';}
   else if(p<.79){handLocal(root,buyer,a);parcel.position.copy(a).lerp(tray,place);parcel.rotation.set(0,buyer.root.rotation.y*(1-place),0);root.userData.parcelOwner=p<.7?'buyer':'placing';}
   else{parcel.position.copy(tray);parcel.rotation.set(0,0,0);root.userData.parcelOwner='stall';}
   parcel.scale.set(.015,.010,.013).multiplyScalar(1-span(p,.94,.99));
  }
  return {root,afterGround:placeParcel,get actionStage(){return active?root.userData.storyAction:'waiting';},get action(){return active?{'approach':'买家走近摊位','offer-and-receive':'伸手递出 · 接住货物','inspect':'低头查看收到的货物','carry-to-stall':'带到摊位 · 放下货物','return':'货物留在摊位 · 买家返回'}[root.userData.storyAction]:'等待地方往来形成';},update(t,amount=1){
   active=amount>.35;t=active?clock(t):0;
   const p=cycle(t,16),approach=span(p,0,.18),depart=span(p,.53,.70),place=span(p,.70,.79),back=span(p,.82,1);
   const reach=span(p,.16,.26)*(1-span(p,.40,.53));people[0].update(t,{walk:0,reach,nod:span(p,.40,.45)*(1-span(p,.48,.54))});
   people[1].update(t+1,{walk:0,reach:span(p,.63,.74)*(1-span(p,.77,.86)),bend:.14});people[2].update(t+2,{walk:0,reach:span(cycle(t+4,12),.2,.4)*(1-span(cycle(t+4,12),.6,.8)),look:.5});
   // The default camera approaches from +X / -Z. Keep the handoff in that
   // open foreground, in front of every canopy, rather than behind the blue stall.
   let x=mix(.136,.055,approach),z=mix(-.160,-.145,approach),turn=-Math.PI/2;
   if(p>=.53){x=mix(.055,.082,depart);z=mix(-.145,-.080,depart);turn=mix(-Math.PI/2,0,span(p,.53,.62));}
   if(p>=.82){x=mix(.082,.136,back)+Math.sin(back*Math.PI)*.026;z=mix(-.080,-.160,back);turn=mix(0,2.55,span(p,.82,.88))+2.1624*span(p,.94,1);}
   buyer.root.position.x=x;buyer.root.position.z=z;buyer.root.rotation.y=turn;
   const walking=(p<.18||p>.53&&p<.70||p>.82)?1:0,holding=span(p,.27,.4)*(1-span(p,.70,.79));
   buyer.update(t,{walk:walking,reach:reach*.85+place*(1-back)*.45,hold:holding*.65,nod:span(p,.41,.46)*(1-span(p,.49,.52)),look:holding*.3});
   frame=p;placeParcel();
   stalls.forEach((s,i)=>s.rotation.z=Math.sin(clock(t)*1.1+i)*.012*amount);
   root.userData.storyAction=p<.18?'approach':p<.40?'offer-and-receive':p<.53?'inspect':p<.79?'carry-to-stall':'return';root.userData.actionPhase=p;
  }};
 }
 function oasis(){const root=group(null,'history-oasis-stop');house(root,0,0,{size:.8});house(root,-.055,.045,{size:.48});tree(root,.066,-.026,.9);jar(root,.041,.043,.9);box(root,0x798367,.052,.001,.012,.036,.002,.12,{surface:'earth',groundSurface:true});box(root,palette.teal,.039,.003,0,.007,.002,.13,{surface:'water',groundSurface:true});const traveller=human({carrying:true});traveller.root.position.set(.035,0,.072);traveller.root.scale.setScalar(.75);traveller.root.userData.groundContact=true;root.add(traveller.root);return {root,update(t){const p=cycle(t,12);traveller.update(t,{walk:0,bend:span(p,.2,.35)*(1-span(p,.6,.8)),nod:span(p,.3,.4)*(1-span(p,.6,.7))});}};}
 function institution(){
  const root=group(null,'history-institution'),floor=group(root,'institution-floor'),walls=group(root,'institution-walls'),gate=group(root,'institution-gate'),inside=group(root,'institution-interior');
  // Only the worn entry path is solid. The parent blends the open court into DEM.
  box(floor,0xc0ae88,0,.001,.015,.026,.002,.190,{surface:'earth',groundSurface:true});
  function standing(parent,name,x,z){const g=group(parent,name);g.position.set(x,0,z);g.userData.groundContact=true;return g;}
  for(const x of [-.102,.102])box(standing(walls,'institution-wall',x,0),palette.wall,0,.043,0,.018,.078,.18);box(standing(walls,'institution-wall',0,-.086),palette.wall,0,.043,0,.21,.078,.018);
  for(const x of [-.092,.092])for(const z of [-.078,.078]){const tower=standing(walls,'institution-tower',x,z);box(tower,palette.sand,0,.055,0,.035,.108,.034);hipRoof(tower,0,.119,0,.045,.028,.046);}
  const gateway=standing(gate,'institution-gateway',0,.084),opening=arch(gateway,0,0,0,.075,.098);delete opening.userData.groundContact;hipRoof(gateway,0,.11,.002,.095,.027,.041);
  for(const x of [-.067,.067])box(standing(gate,'institution-gate-wall',x,.084),palette.wall,0,.043,0,.05,.078,.018);
  house(inside,-.046,-.038,{size:.75});house(inside,.046,-.038,{size:.75});
  tree(inside,-.068,.03,.65);jar(inside,.064,.032,.8);
  const clerk=human({color:palette.cloth});clerk.root.position.set(-.010,0,.009);clerk.root.scale.setScalar(.7);clerk.root.userData.groundContact=true;inside.add(clerk.root);
  const visitor=human({color:palette.teal});visitor.root.scale.setScalar(.74);visitor.root.userData.groundContact=true;inside.add(visitor.root);
  box(inside,palette.roof,-.040,.024,.025,.036,.006,.023,{surface:'wood'});
  const parcel=box(inside,palette.gold,0,0,0,.019,.006,.010,{name:'history-institution-document',surface:'cloth'}),a=new THREE.Vector3(),b=new THREE.Vector3();
  let frame=0,active=false;
  function placeDocument(){betweenParcel(inside,parcel,clerk,visitor,span(frame,.36,.47),a,b);parcel.scale.set(.019,.006,.010).multiplyScalar(1-span(frame,.96,1));}
  return {root,parts:[floor,walls,gate,inside],afterGround:placeDocument,get actionStage(){return active?root.userData.storyAction:'waiting';},get action(){return active?{'enter-gate':'来访者穿过门口','receive-document':'递交文书 · 门前接待','acknowledge':'接收后点头回应','leave-with-document':'携文书离开院落'}[root.userData.storyAction]:'机构空间逐步建立';},update(t){
   active=inside.scale.y>.2;t=active?clock(t):0;
   const p=cycle(t,18),approach=span(p,0,.29),receive=span(p,.36,.47),leave=span(p,.64,.96),reach=span(p,.27,.36)*(1-span(p,.47,.6));
   visitor.root.position.x=.008;visitor.root.position.z=p<.64?mix(.126,.054,approach):mix(.054,.126,leave);visitor.root.rotation.y=p<.64?Math.PI:mix(Math.PI,Math.PI*2,span(p,.61,.70))+Math.PI*span(p,.94,1);
   clerk.update(t,{walk:0,reach,nod:span(p,.46,.50)*(1-span(p,.53,.61)),look:-.2});
   visitor.update(t,{walk:p<.29||p>.66&&p<.96?1:0,reach:reach*.85,hold:receive*.4,nod:span(p,.49,.54)*(1-span(p,.56,.62))});
   frame=p;placeDocument();
   root.userData.storyAction=p<.29?'enter-gate':p<.47?'receive-document':p<.64?'acknowledge':'leave-with-document';root.userData.actionPhase=p;
  }};
 }
 function settlement(){
  const root=group(null,'history-family-settlement'),homes=group(root,'settlement-homes'),fields=group(root,'settlement-fields'),water=group(root,'settlement-water'),crops=group(root,'settlement-crops'),family=group(root,'settlement-family'),lamps=[],people=[];
  for(const [x,z,s]of [[-.06,-.03,.85],[.031,-.041,.8]]){const h=house(homes,x,z,{size:s,light:true});lamps.push(h.window);}
  for(let i=0;i<4;i++){box(fields,0x8a775c,.022,.002,.04+i*.018,.145,.004,.013,{surface:'earth',groundSurface:true});for(let j=0;j<3;j++)box(crops,palette.green,-.025+j*.041,.007,.04+i*.018,.029,.010,.005,{surface:'foliage',groundSurface:true});}
  box(fields,palette.dark,-.077,.001,.057,.015,.002,.133,{surface:'earth',groundSurface:true});box(water,palette.teal,-.077,.004,.057,.010,.003,.133,{surface:'water',groundSurface:true});box(water,palette.teal,-.02,.004,.103,.118,.003,.007,{surface:'water',groundSurface:true});
  for(const [x,z,c,child]of [[-.040,.013,palette.cloth,false],[.061,.08,palette.teal,false],[-.025,.040,palette.gold,true]]){const p=human({color:c,child});p.root.position.set(x,0,z);if(!child)p.root.scale.setScalar(.75);p.root.userData.groundContact=true;family.add(p.root);people.push(p);}
  const luggage=cart();luggage.root.position.set(-.097,0,-.005);luggage.root.scale.setScalar(.75);luggage.root.userData.groundContact=true;family.add(luggage.root);
  tree(homes,-.095,-.043,.78);basket(family,-.055,.037);jar(homes,.055,-.006,.8);
  const care=box(family,palette.cloth,0,0,0,.013,.008,.010,{name:'history-family-care-parcel',surface:'cloth'}),a=new THREE.Vector3(),b=new THREE.Vector3();
  const tool=group(people[1].hands[1],'history-field-tool');pole(tool,palette.roof,0,-.010,.010,.0015,.040,{surface:'wood'});box(tool,palette.dark,0,-.031,.010,.016,.003,.006,{surface:'stone'});
  const glints=[];for(let i=0;i<3;i++){const glint=box(water,0xb4e1c1,-.077,.013,.057,.006,.003,.009);glint.userData.groundContact=true;glints.push(glint);}
  let frame=0,active=false;
  function placeCare(){betweenParcel(family,care,people[0],people[2],span(frame,.25,.38),a,b);care.scale.set(.013,.008,.010).multiplyScalar(1-span(frame,.77,.83));}
  return {root,homes,fields,water,crops,family,afterGround:placeCare,get actionStage(){return active?root.userData.storyAction:'waiting';},get action(){return active?{'offer-supplies':'俯身照看 · 递出用品','family-receives':'孩子伸手接住用品','child-responds':'接收后抬头回应','carry-home':root.userData.fieldAction==='later-water-and-tending'?'带回住处 · 田边劳作与后期渠水':'带回住处 · 整理田地'}[root.userData.storyAction]:'等待抵达与安置';},update(t,{settle=1,water:amount=1}={}){
   active=settle>.3;t=active?clock(t):0;
   const p=cycle(t,15),offer=span(p,.10,.25),receive=span(p,.25,.38),travel=span(p,.60,.78)*(1-span(p,.84,1)),bend=offer*(1-span(p,.40,.55));
   const child=people[2];child.root.rotation.y=Math.PI*(1-span(p,.79,.86)+span(p,.94,1));child.root.position.x=mix(-.025,-.019,travel);child.root.position.z=mix(.040,-.006,travel);
   people[0].update(t,{walk:0,reach:bend,bend:bend*.7,nod:span(p,.4,.46)*(1-span(p,.51,.57))});
   child.update(t,{walk:p>.60&&p<.78||p>.84?1:0,reach:bend,hold:receive*.58*(1-span(p,.77,.83)),nod:span(p,.41,.49)*(1-span(p,.53,.61))});
   // Caring for a family and tending land are mechanisms, not literal historical people.
   const work=cycle(t+2,4.8),stroke=span(work,.05,.3)*(1-span(work,.52,.8));people[1].root.rotation.y=-Math.PI/2;people[1].update(t,{walk:0,reach:.28+stroke*.48,bend:stroke*.72,nod:stroke*.2});
   frame=p;placeCare();
   lamps.forEach(w=>{w.material.emissiveIntensity=settle*.55;w.material.color.setHex(settle>.5?palette.gold:palette.dark);});
   glints.forEach((g,i)=>{g.position.z=-.008+((clock(t)*.018+i*.044)%.133);g.position.y=.007;g.visible=amount>.05;});
   root.userData.storyAction=p<.25?'offer-supplies':p<.40?'family-receives':p<.62?'child-responds':'carry-home';root.userData.actionPhase=p;root.userData.fieldAction=amount>.05?'later-water-and-tending':'prepare-land';
  }};
 }
 return {caravan,market,institution,settlement,village,oasis,material};
}
