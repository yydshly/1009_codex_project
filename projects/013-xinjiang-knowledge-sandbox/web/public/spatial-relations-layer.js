import * as THREE from 'three';
import {relationById,relationGeometry} from './spatial-relations.js';
import {sphericalRoute} from './spherical-history-data.js';
import {worldAnchor} from './world-content.js';
import {relationLandforms,relationVisualFrame} from './spatial-relations-geography.js';
import {densifyMapLine} from './map-learning-content.js';
import {createHistoryVisualModels} from './history-visual-models.js';
import {surfaceCoordinates} from './history-grounding.js';

export function buildSpatialRelations({root,id,scope,node,point,addLabel,focus='all',geographyOnly=false}){
 const r=relationById(id),g=relationGeometry(id,scope,node),radius=scope==='context'?.006:scope==='region'?.0035:.0018;
 const routes=[],forms=[],halos=[],arrows=[],labels=[],visuals=createHistoryVisualModels();
 const basis=new THREE.Matrix4(),up=new THREE.Vector3(),forward=new THREE.Vector3(),side=new THREE.Vector3();
 const mat=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
 function route(points,color,width,opacity,kind){
  const curve=new THREE.CatmullRomCurve3(sphericalRoute(points,150).map(p=>point(...p,.008)));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,150,width,5,false),mat(color,opacity));root.add(mesh);routes.push({mesh,opacity});
  // Direction cues illustrate connections; speed is not historical travel time.
  for(let i=0;i<(id==='xibe'?1:2);i++){
   const marker=new THREE.Mesh(new THREE.ConeGeometry(width*2.7,width*9,3),mat(0xfff3ce));root.add(marker);
   const party=new THREE.Group();party.name='map-'+id+'-'+(id==='protectorate'?'local-contact':id==='xibe'?'arriving-family':'exchange-caravan');root.add(party);
   const actors=visuals.caravan(id==='protectorate'?'cargo':id);for(const actor of actors){actor.baseScale=actor.root.scale.clone();party.add(actor.root);}
   arrows.push({marker,party,actors,curve,reverse:i===1,phase:kind==='local'?.28:.05,length:curve.getLength()});
  }
 }
 function band(f){
  const color=f.kind==='valley'?0x74dcd8:f.kind==='basin'?0xd4a36a:0xd5e1ba;
  const group=new THREE.Group();group.name='relationship-geography-'+f.id;root.add(group);
  // Broad feathered observation bands hug the existing rendered ground surface.
  const coords=f.kind==='basin'?[[f.anchor[0]-2.7,f.anchor[1]],[f.anchor[0]+2.7,f.anchor[1]]]:f.shape;
  const samples=densifyMapLine(coords,.12),base=f.kind==='basin'?.95:f.kind==='valley'?.24:.18;
  for(let ring=0;ring<4;ring++){
   const width=base*(1+ring*.65),positions=[],indices=[],cross=12;
   for(let i=0;i<samples.length;i++){
    const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],s=samples[i],cos=Math.cos(s[1]*Math.PI/180),dx=(b[0]-a[0])*cos,dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
    const end=Math.sin(Math.PI*i/(samples.length-1))*.8+.2;
    for(let k=0;k<=cross;k++){const sign=k/cross*2-1;positions.push(...point(s[0]-dy/len/cos*width*sign*end,s[1]+dx/len*width*sign*end,.005+ring*.0001).toArray());}
    if(i)for(let k=0;k<cross;k++){const j=i*(cross+1)+k,a=j-cross-1;indices.push(a,a+1,j,a+1,j+1,j);}
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
   const opacity=ring===0?(f.kind==='valley'?.44:.28):.05,material=mat(color,opacity);group.add(new THREE.Mesh(geometry,material));forms.push({id:f.id,material,opacity});
  }
  if(f.kind!=='basin'){
   const material=new THREE.LineBasicMaterial({color,transparent:true,opacity:.8,depthWrite:false});
   group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(samples.map(p=>point(...p,.006))),material));forms.push({id:f.id,material,opacity:.8});
  }
  const anchor=f.kind==='valley'?[82.8,43.65]:f.anchor;
  const m=addLabel({id:f.id,name:f.label,role:f.role,anchor,kind:'landform',feature:f.id,selected:focus===f.id},point(...anchor,.01));
  if(m)labels.push({marker:m,feature:f.id});
 }
 for(const f of relationLandforms(id,scope))band(f);
 if(!geographyOnly)for(const l of g.lines)route(l.points,l.kind==='local'&&id!=='protectorate'?0xa7d6ba:r.color,radius,l.kind==='context'?.65:.92,l.kind);
 if(scope==='context'){
  for(const key of id==='xibe'?['mongolia']:['kyrgyzstan']){const a=worldAnchor(key);addLabel({id:key,name:a.name,role:'周边方位参照',anchor:[a.lon,a.lat],kind:'surrounding'},point(a.lon,a.lat,.01));}
 }
 for(const n of g.nodes){
  const pos=point(...n.anchor,.011),dot=new THREE.Mesh(new THREE.SphereGeometry(radius*(n.selected?3.2:2.3),12,8),mat(n.selected?0xffe6a4:r.color));dot.position.copy(pos);root.add(dot);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(radius*(n.selected?7:4.5),radius*.5,6,40),mat(n.selected?0xffe6a4:r.color,.9));ring.position.copy(pos);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),pos.clone().normalize());root.add(ring);halos.push({ring,selected:n.selected});
  const label=addLabel({...n,kind:n.selected?'selected':'place'},pos);if(label)labels.push({marker:label,node:true});
 }
 function update(progress,elapsed=0){
  const frame=relationVisualFrame(id,scope,progress,geographyOnly),highlight=focus!=='all';
  for(const {mesh,opacity}of routes){mesh.geometry.setDrawRange(0,Math.floor(frame.route*150)*30);mesh.material.opacity=opacity*(highlight?.24:1);mesh.visible=frame.route>0;}
  for(const {material,opacity,id:feature}of forms)material.opacity=Math.min(.95,opacity*(highlight?(feature===focus?2.3:.15):1));
  for(const a of arrows){
   const t=(elapsed*.045+a.phase)%1,head=frame.route<.999?frame.route*(a.reverse?.74:.94):t,q=a.reverse?1-head:head;
   a.party.visible=!geographyOnly&&frame.route>.02&&(!a.reverse||frame.route>=.999);
   a.marker.visible=a.party.visible&&!highlight;a.marker.position.copy(a.curve.getPoint(q));a.marker.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),a.curve.getTangent(q).multiplyScalar(a.reverse?-1:1).normalize());
   const gap=Math.min(.1,.018/Math.max(.001,a.length));
   for(const [i,actor]of a.actors.entries()){
    const at=q+(a.reverse?1:-1)*gap*(i+1);actor.root.visible=at>=0&&at<=1;if(!actor.root.visible)continue;
    const pathPoint=a.curve.getPoint(at),coords=surfaceCoordinates(pathPoint),ground=point(...coords,.002);up.copy(ground).normalize();forward.copy(a.curve.getTangent(at)).multiplyScalar(a.reverse?-1:1);forward.addScaledVector(up,-forward.dot(up));
    if(forward.lengthSq()<1e-10)forward.set(0,1,0).cross(up);forward.normalize();side.crossVectors(up,forward).normalize();basis.makeBasis(side,up,forward);
    const fade=Math.min(1,Math.max(0,at)/.035,Math.max(0,1-at)/.035);
    actor.root.position.copy(ground);actor.root.quaternion.setFromRotationMatrix(basis);actor.root.scale.copy(actor.baseScale).multiplyScalar((scope==='context'?.72:.65)*Math.max(.001,fade));actor.update(elapsed+i*.35,{walk:1});
   }
  }
  for(const h of halos){h.ring.scale.setScalar(h.selected?1+.1*Math.sin(elapsed*2):1);h.ring.material.opacity=highlight?.45:.9;}
  for(const {marker,feature,node:placeNode}of labels){marker.priority=feature===focus?0:placeNode?1:2;marker.button?.classList.toggle('sr-pin-muted',highlight&&!placeNode&&feature!==focus);}
  return frame;
 }
 // The regional raster is transparent and sorts around its object origin.
 // Draw thematic geometry after that raster while retaining Earth depth tests.
 root.traverse(o=>{if(o.isMesh||o.isLine)o.renderOrder=6;});
 update(0);
 return {lineCount:geographyOnly?0:g.lines.length,nodeCount:g.nodes.length,actorCount:arrows.reduce((n,a)=>n+a.actors.length,0),movement:id==='protectorate'?'center-and-two-way':id==='xibe'?'arrival-to-settlement':'caravan-and-exchange',features:relationLandforms(id,scope).map(f=>f.id),update};
}
