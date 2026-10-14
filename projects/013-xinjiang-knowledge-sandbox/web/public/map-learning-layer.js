import * as THREE from 'three';
import {densifyMapLine,mapItems} from './map-learning-content.js';

// A lightweight annotation layer on the existing measured landscape.
// Its symbols are reference objects, not actual cities or historical reconstructions.
export function buildLearningMap({root,dem,point,lens,selected,cities,spherical=false}){
 const scale=spherical?.075:1;
 const within=([lon,lat])=>lon>=dem.bounds[0]&&lon<=dem.bounds[2]&&lat>=dem.bounds[1]&&lat<=dem.bounds[3];
 function path(coords,color,opacity=.65,selected=false){
  const positions=densifyMapLine(coords).filter(within).map(p=>point(...p));if(positions.length<2)return;
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(positions),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));line.renderOrder=3;root.add(line);
  if(selected){const curve=new THREE.CatmullRomCurve3(positions);const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,positions.length,.035*scale,4,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.78,depthWrite:false,depthTest:!spherical}));tube.renderOrder=3;root.add(tube);}
 }
 for(const item of mapItems(lens,cities)){
  const chosen=item.id===selected.id;
  if(item.shape)path(item.shape,item.color,chosen?.95:.28,chosen);
  if(chosen){const center=point(...item.anchor),coords=[];for(let i=0;i<=64;i++){const t=i/64*Math.PI*2;coords.push(spherical?point(item.anchor[0]+Math.cos(t)*.7,item.anchor[1]+Math.sin(t)*.5):new THREE.Vector3(center.x+Math.cos(t)*.28,center.y+.055,center.z+Math.sin(t)*.28));}const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(coords),new THREE.LineDashedMaterial({color:item.color,dashSize:.04*scale,gapSize:.028*scale,transparent:true,opacity:.9,depthWrite:false}));ring.computeLineDistances();root.add(ring);}
 }
 if(lens==='cities'||lens==='corridors'){
  const box=new THREE.BoxGeometry(.055*scale,.10*scale,.055*scale),mat=new THREE.MeshStandardMaterial({color:0xd6d8bd,roughness:.85});
  const visible=lens==='cities'?cities:cities.filter(c=>selected.section.some(p=>Math.abs(p[0]-c[1])<.03&&Math.abs(p[1]-c[2])<.03));
  const cityBlocks=new THREE.InstancedMesh(box,mat,visible.length*3),dummy=new THREE.Object3D();let i=0;
  for(const [,lon,lat]of visible){const p=point(lon,lat);dummy.quaternion.identity();if(spherical)dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p.clone().normalize());for(let j=0;j<3;j++){const offset=new THREE.Vector3((j-1)*.065*scale,.035*scale,(j%2)*.05*scale).applyQuaternion(dummy.quaternion);dummy.position.copy(p).add(offset);dummy.scale.set(1,1+(j%2)*.4,1);dummy.updateMatrix();cityBlocks.setMatrixAt(i++,dummy.matrix);}}
  cityBlocks.instanceMatrix.needsUpdate=true;root.add(cityBlocks);
 }
}
