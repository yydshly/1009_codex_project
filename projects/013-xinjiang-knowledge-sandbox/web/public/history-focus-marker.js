import * as THREE from 'three';

// One ground-attached locator reused across narration targets. No added scene,
// duplicate model or per-frame geometry allocation. Motion uses the story clock.
export function buildHistoryFocusMarker({root,groundPoint,addMarker,viewport}){
 const group=new THREE.Group();group.name='narration-ground-focus';root.add(group);
 const material=new THREE.MeshBasicMaterial({color:0xf1d699,transparent:true,opacity:.85,depthWrite:false});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.018,6,80),material);ring.rotation.x=Math.PI/2;group.add(ring);
 const inner=new THREE.Mesh(new THREE.TorusGeometry(1,.012,6,80),material.clone());inner.rotation.x=Math.PI/2;inner.scale.setScalar(.80);group.add(inner);
 const stem=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,.07,0)]),new THREE.LineBasicMaterial({color:0xe8d4a5,transparent:true,opacity:.65,depthWrite:false}));group.add(stem);
 const marker=addMarker({id:'narration-focus',name:'画面观察',role:'讲解当前对应的地图对象'},new THREE.Vector3());
 delete marker.button.dataset.kgEventDestination;marker.button.dataset.kgAction='event-focus';marker.button.classList.toggle('kg-narration-target',true);marker.priority=-2;
 let label='';
 return {update(attention,{position,clock=0,context=false,selected}={}){
  const active=!!attention&&!context&&(position||attention.anchor);group.visible=!!active;marker.visible=!!active;
  if(!active){viewport.dataset.narrationTarget='';return;}
  const p=position?.clone()??groundPoint(...attention.anchor,.003),normal=p.clone().normalize();
  group.position.copy(p);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
  const radius=attention.kind==='geography'?.058:attention.kind==='extent'?.15:attention.kind==='route'?.032:.065;
  const pulse=.98+.04*Math.sin(clock*1.7);ring.scale.setScalar(radius*pulse);inner.scale.setScalar(radius*.82);
  marker.position.copy(p).addScaledVector(normal,.07);
  const place=['kashgar','luntai','qabqal'].includes(attention.id),next=place&&selected===attention.id;
  const currentLabel=attention.label+(next?' · 点击进入':'');
  if(label!==currentLabel){label=currentLabel;marker.button.textContent=label+(next?' →':' ⌖');marker.button.setAttribute('aria-label',(next?'走进讲解地点 ':'靠近讲解对象 ')+attention.label);}
  if(place){marker.button.dataset.kgEventDestination=attention.id;delete marker.button.dataset.kgAction;}else{delete marker.button.dataset.kgEventDestination;marker.button.dataset.kgAction='event-focus';}
  viewport.dataset.narrationTarget=attention.id;viewport.dataset.narrationTargetPosition=JSON.stringify(p.toArray().map(n=>+n.toFixed(5)));
 }};
}
