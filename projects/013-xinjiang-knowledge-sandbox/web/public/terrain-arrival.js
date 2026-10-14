import * as THREE from 'three';
import {terrainPoint} from './geo.js';
// GPU interpolation between two coordinate displays of the same observed local
// height samples. No height/detail is generated; temporary morphs are restored.
export function installTerrainArrival(regionalDEM){
 let local,map,geometry,children,materialState,priorMorph,priorNormals;
 function restore(){
  if(!local)return;
  if(priorMorph)geometry.morphAttributes.position=priorMorph;else delete geometry.morphAttributes.position;
  if(priorNormals)geometry.morphAttributes.normal=priorNormals;else delete geometry.morphAttributes.normal;
  local.userData.surface.updateMorphTargets();
  local.userData.surface.material.needsUpdate=true;
  for(const [child,visible] of children)child.visible=visible;
  const material=map.userData.surface.material;Object.assign(material,materialState);material.needsUpdate=true;
  local=null;
 }
 return {prepare(destination,regionalMap){
  restore();const d=destination?.userData;if(!d?.local||!d.dem||!regionalMap)return false;
  local=destination;map=regionalMap;geometry=d.surface.geometry;
  children=local.children.map(child=>[child,child.visible]);priorMorph=geometry.morphAttributes.position;priorNormals=geometry.morphAttributes.normal;
  const [w,s,e,n]=d.dem.bounds,p=geometry.attributes.position,from=[];
  for(let i=0;i<p.count;i++){
   const row=Math.floor(i/d.dem.cols),col=i%d.dem.cols;
   from.push(...terrainPoint(regionalDEM,w+(e-w)*col/(d.dem.cols-1),n+(s-n)*row/(d.dem.rows-1),map.userData.exaggeration,map.userData.dimensions));
  }
  const origin=geometry.clone();origin.setAttribute('position',new THREE.Float32BufferAttribute(from,3));origin.computeVertexNormals();
  geometry.morphAttributes.position=[origin.attributes.position];geometry.morphAttributes.normal=[origin.attributes.normal];origin.dispose();
  d.surface.updateMorphTargets();d.surface.frustumCulled=false;d.surface.material.needsUpdate=true;
  const mat=map.userData.surface.material;materialState={opacity:mat.opacity,transparent:mat.transparent,depthWrite:mat.depthWrite};
  return true;
 },unfold(t){
  if(!local)return;const u=THREE.MathUtils.smootherstep(t,0,1);
  local.visible=true;local.children.forEach(child=>child.visible=child===local.userData.surface);
  local.userData.surface.morphTargetInfluences[0]=1-u;
  map.visible=u<.38;const m=map.userData.surface.material;
  if(!m.transparent){m.transparent=true;m.depthWrite=false;m.needsUpdate=true;}
  m.opacity=1-THREE.MathUtils.smoothstep(u,0,.38);
 },restore,get active(){return !!local;}};
}
