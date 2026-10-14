import * as THREE from 'three';
import {mapFeatures,densifyMapLine} from './map-learning-content.js';
// These are emphasis on existing geographic observations. Tubes represent
// positions, not surveyed mountain ridges, rivers or historical routes.
export function buildZhangSpatialLayer({root,point}){
 const group=new THREE.Group();group.name='zhang-geographic-conditions';root.add(group);
 const objects=[];
 function tube(id,key,color,width){
  const f=mapFeatures.find(f=>f.id===id),samples=densifyMapLine(f.shape,.1);
  const curve=new THREE.CatmullRomCurve3(samples.map(p=>point(...p,.009)));
  const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false});
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(80,samples.length),width,5,false),material);mesh.renderOrder=7;group.add(mesh);objects.push({mesh,key,opacity:.68});
 }
 tube('tianshan','mountains',0xc1e2bd,.0038);tube('kunlun','mountains',0xd9dfbd,.0038);tube('tarim-water','water',0x62ced7,.0042);
 for(const [lon,lat]of [[75.99,39.47],[89.19,42.95]]){
  const pos=point(lon,lat,.012),material=new THREE.MeshBasicMaterial({color:0x8cddb0,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(new THREE.RingGeometry(.018,.035,48),material);mesh.position.copy(pos);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),pos.clone().normalize());mesh.renderOrder=7;group.add(mesh);objects.push({mesh,key:'oases',opacity:.88});
 }
 const positions=[],uvs=[],indices=[],cols=32,rows=16;
 for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){positions.push(...point(80.5+x/cols*7,37.6+y/rows*2.25,.007).toArray());uvs.push(x/cols,y/rows);}
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+1,c=a+cols+1;indices.push(a,b,c,b,c+1,c);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);
 const material=new THREE.ShaderMaterial({uniforms:{opacity:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;uniform float opacity;void main(){float fade=1.0-smoothstep(.4,1.0,length((vUv-.5)*2.0));gl_FragColor=vec4(.847,.651,.349,opacity*fade);}',transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const basin=new THREE.Mesh(geo,material);basin.renderOrder=6;group.add(basin);objects.push({mesh:basin,key:'basin',opacity:.14});
 return {update(frame){for(const o of objects){const level=Math.max(0,Math.min(1,frame[o.key]??0));o.mesh.visible=level>.001;if(o.mesh.material.uniforms)o.mesh.material.uniforms.opacity.value=o.opacity*level;else o.mesh.material.opacity=o.opacity*level;}},features:['mountains','basin','water','oases']};
}
