import * as THREE from 'three';

// A display footprint, not a new terrain measurement. Every vertex samples the
// existing geographic surface; soft edges leave the satellite image visible.
export function surfaceCoordinates(position){
 const r=position.length();
 return [Math.atan2(-position.z,position.x)*180/Math.PI,Math.asin(Math.max(-1,Math.min(1,position.y/r)))*180/Math.PI];
}

export function groundHistoryObjects(model,groundPoint){
 const grounded=[],surfaces=[],worldScale=new THREE.Vector3();model.updateWorldMatrix(true,true);model.traverse(object=>{
  if(object.userData.groundContact)grounded.push({object,baseY:object.position.y});
  if(object.userData.groundSurface&&object.geometry){
   const originalGeometry=object.geometry;originalGeometry.computeBoundingBox();
   if(originalGeometry.type==='BoxGeometry'){
    const size=originalGeometry.boundingBox.getSize(new THREE.Vector3()),center=originalGeometry.boundingBox.getCenter(new THREE.Vector3());object.getWorldScale(worldScale);
    // Corner-only boxes bridge several DEM cells. Keep horizontal spans below
    // two thousandths of globe radius, including the selected 1.3x display size.
    // Thin surfaces need one vertical segment only. The bounded topology is
    // created once and reused while progress or selection changes.
    const segments=(size,scale)=>Math.max(1,Math.min(96,Math.ceil(Math.abs(size*scale)*1.3/.002)));
    object.geometry=new THREE.BoxGeometry(size.x,size.y,size.z,segments(size.x,worldScale.x),1,segments(size.z,worldScale.z));object.geometry.translate(center.x,center.y,center.z);
   }else object.geometry=originalGeometry.clone();
   object.geometry.computeBoundingBox();
   surfaces.push({object,original:new Float32Array(object.geometry.attributes.position.array),minY:object.geometry.boundingBox.min.y,matrix:null});
  }
 });
 const local=new THREE.Vector3();
 return ()=>{
  model.updateWorldMatrix(true,true);
  for(const {object,baseY}of grounded){
   const parent=object.parent;if(!parent)continue;
   const m=parent.matrixWorld.elements,scaleY=Math.hypot(m[4],m[5],m[6]);if(scaleY<.008)continue;
   local.set(object.position.x,0,object.position.z);parent.localToWorld(local);
   const [lon,lat]=surfaceCoordinates(local),surface=groundPoint(lon,lat,.001);
   parent.worldToLocal(surface);object.position.y=surface.y+baseY;object.updateWorldMatrix(false,true);
  }
  for(const entry of surfaces){
   const {object,original,minY}=entry;
   object.updateWorldMatrix(true,false);const m=object.matrixWorld.elements,scaleY=Math.hypot(m[4],m[5],m[6]);if(scaleY<1e-5)continue;
   if(entry.matrix&&m.every((value,index)=>value===entry.matrix[index]))continue;
   entry.matrix=Array.from(m);
   const positions=object.geometry.attributes.position;
   for(let i=0;i<positions.count;i++){
    local.set(original[i*3],0,original[i*3+2]);object.localToWorld(local);
    const [lon,lat]=surfaceCoordinates(local),p=groundPoint(lon,lat,.0009+(original[i*3+1]-minY)*scaleY);object.worldToLocal(p);positions.setXYZ(i,p.x,p.y,p.z);
   }
   positions.needsUpdate=true;object.geometry.computeVertexNormals();object.geometry.computeBoundingSphere();
  }
 };
}

export function buildHistoryGrounding({parent,anchor,groundPoint,kind='market'}){
 const group=new THREE.Group();group.name='history-ground-contact';parent.add(group);
 const entries=[],origin=anchor.position.clone(),rotation=anchor.quaternion.clone();
 const places={
  market:{color:0xa18c6d,patch:[0,0,.18,.18],shadows:[[-.079,-.035,.056,.04],[.079,-.035,.056,.04],[0,-.088,.05,.04],[0,.096,.049,.028]]},
  institution:{color:0xa39376,patch:[0,0,.18,.16],shadows:[[-.09,0,.038,.12],[.09,0,.038,.12],[0,-.086,.11,.037],[0,.084,.06,.026]]},
  settlement:{color:0x819072,patch:[0,.02,.17,.16],shadows:[[-.06,-.03,.049,.04],[.031,-.041,.05,.039]]},
  village:{color:0x889078,patch:[0,0,.14,.11],shadows:[[-.05,-.02,.035,.03],[.034,-.023,.04,.03]]},
  oasis:{color:0x849176,patch:[0,.025,.13,.14],shadows:[[0,0,.052,.047],[-.055,.045,.026,.028]]}
 };
 const spec=places[kind]??places.market;
 function patch(rect,color,opacity,shadow=false){
  const columns=shadow?10:28,geometry=new THREE.PlaneGeometry(2,2,columns,columns),uv=geometry.attributes.uv;
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
   uniforms:{tint:{value:new THREE.Color(color)},opacity:{value:opacity},visibility:{value:0},shadow:{value:shadow?1:0}},
   vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader:`uniform vec3 tint;uniform float opacity;uniform float visibility;uniform float shadow;varying vec2 vUv;
    void main(){vec2 q=vUv*2.0-1.0;float r=length(q);float edge=1.0-smoothstep(.30,1.0,r);
    float grain=.95+.05*sin(q.x*45.0+sin(q.y*23.0))*sin(q.y*37.0);
    float a=edge*edge*opacity*visibility; if(a<.001)discard;gl_FragColor=vec4(tint*mix(grain,1.0,shadow),a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }
   `});
  const mesh=new THREE.Mesh(geometry,material);mesh.name=shadow?'history-contact-shadow':'history-feathered-ground';mesh.renderOrder=shadow?4:3;group.add(mesh);entries.push({mesh,rect,uv,shadow});
 }
 patch(spec.patch,spec.color,.72);
 for(const rect of spec.shadows)patch(rect,0x302d22,.32,true);
 const temp=new THREE.Vector3();let lastScale=NaN;
 function update(scale=1,amount=1){
  group.visible=amount>.001;
  for(const entry of entries)entry.mesh.material.uniforms.visibility.value=amount;
  if(scale===lastScale)return;
  lastScale=scale;
  for(const {mesh,rect,uv,shadow}of entries){
   const position=mesh.geometry.attributes.position;
   for(let i=0;i<position.count;i++){
    temp.set((rect[0]+(uv.getX(i)*2-1)*rect[2])*scale,0,(rect[1]+(uv.getY(i)*2-1)*rect[3])*scale).applyQuaternion(rotation).add(origin);
    const [lon,lat]=surfaceCoordinates(temp),p=groundPoint(lon,lat,shadow?.0011:.0008);
    position.setXYZ(i,p.x,p.y,p.z);
   }
   position.needsUpdate=true;mesh.geometry.computeBoundingSphere();
  }
 }
 update(anchor.scale.x,0);
 return {group,update};
}
