import * as THREE from 'three';
import {sampleElevation,terrainPoint} from './geo.js';
import {surfaceMaterial} from './surface.js';
// A geographic context window surrounds an ORIGINAL teaching set. The sample
// grid and texture are regional; this is not surveyed architecture or new DEM.
export function installPlaceLandscape(scene,dem,texture){
 const group=new THREE.Group();group.name='geographic-context-window';scene.add(group);
 const material=surfaceMaterial(0xc6c5b5,{map:texture,roughness:1,side:THREE.DoubleSide},'regional-context');
 let mesh,finalPositions,regionalPositions,world,original,signature='',center,ready=false,foundations=[];
 function prepare(c,localWorld,dimensions,exaggeration,{opening=[6.98,3.96],floor=.033}={}){
  restore();for(const [m,wasVisible]of foundations)m.visible=wasVisible;foundations=[];group.visible=false;ready=false;world=null;original=null;
  if(!localWorld||c.lon>100||c.lon<dem.bounds[0]||c.lon>dem.bounds[2]||c.lat<dem.bounds[1]||c.lat>dem.bounds[3])return false;
  world=localWorld;foundations=world.children.filter(c=>c.userData.displayFoundation||c.name==='oasis-regional-relief').map(c=>[c,c.visible]);
  original={position:world.position.clone(),scale:world.scale.clone()};
  const key=c.lon+'/'+c.lat+'/'+world.position.x+'/'+opening.join('/')+'/'+floor;
  if(key!==signature){
   signature=key;mesh?.geometry.dispose();if(mesh)group.remove(mesh);
   const nx=80,nz=58,width=36,depth=26,positions=[],uv=[],indices=[],from=[],blendValues=[],edgeValues=[];
   const lonSpan=5.4,latSpan=4.05,mid=sampleElevation(dem,c.lon,c.lat);
   for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++){
    const px=(x/nx-.5)*width,pz=(z/nz-.5)*depth;
    const lon=Math.max(dem.bounds[0],Math.min(dem.bounds[2],c.lon+(x/nx-.5)*lonSpan));
    const lat=Math.max(dem.bounds[1],Math.min(dem.bounds[3],c.lat+(.5-z/nz)*latSpan));
    const distance=Math.max(Math.abs(px)/(opening[0]+.75),Math.abs(pz)/(opening[1]+.8)),blend=THREE.MathUtils.smoothstep(distance,1,2.4);
    const y=floor+(sampleElevation(dem,lon,lat)-mid)/1800*blend;
    positions.push(px+original.position.x,y,pz);
    blendValues.push(THREE.MathUtils.smoothstep(distance,1.01,1.68));
    edgeValues.push(THREE.MathUtils.smoothstep(Math.min(x/nx,1-x/nx,z/nz,1-z/nz),0,.09));
    uv.push((lon-dem.bounds[0])/(dem.bounds[2]-dem.bounds[0]),(lat-dem.bounds[1])/(dem.bounds[3]-dem.bounds[1]));
    from.push(...terrainPoint(dem,lon,lat,exaggeration,dimensions));
   }
   for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){
    const px=((x+.5)/nx-.5)*width,pz=((z+.5)/nz-.5)*depth;
    if(Math.abs(px)<opening[0]&&Math.abs(pz)<opening[1])continue;
    const a=z*(nx+1)+x,b=a+nx+1;indices.push(a,b,a+1,a+1,b,b+1);
   }
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('contextBlend',new THREE.Float32BufferAttribute(blendValues,1));geo.setAttribute('contextEdge',new THREE.Float32BufferAttribute(edgeValues,1));geo.setIndex(indices);geo.computeVertexNormals();
   finalPositions=Float32Array.from(positions);regionalPositions=Float32Array.from(from);mesh=new THREE.Mesh(geo,material);mesh.receiveShadow=true;mesh.frustumCulled=false;group.add(mesh);
  }
  center=new THREE.Vector3(...terrainPoint(dem,c.lon,c.lat,exaggeration,dimensions));
  ready=true;return true;
 }
 function restore(){if(world&&original){world.position.copy(original.position);world.scale.copy(original.scale);}if(mesh&&finalPositions){mesh.geometry.attributes.position.array.set(finalPositions);mesh.geometry.attributes.position.needsUpdate=true;mesh.geometry.computeVertexNormals();}}
 return {prepare,get visible(){return group.visible;},show(value){group.visible=value&&ready;for(const [m,wasVisible]of foundations)m.visible=value&&ready?false:wasVisible;},restore,
  unfold(t){if(!ready)return;group.visible=true;const u=THREE.MathUtils.smoothstep(t,0,1),s=.12+(1-.12)*u;
   for(const [m]of foundations)m.visible=false;world.scale.copy(original.scale).multiplyScalar(s);world.position.lerpVectors(center,original.position,u);world.position.y=THREE.MathUtils.lerp(center.y+.015,original.position.y,u);
   const p=mesh.geometry.attributes.position;for(let i=0;i<p.array.length;i++)p.array[i]=regionalPositions[i]+(finalPositions[i]-regionalPositions[i])*u;p.needsUpdate=true;mesh.geometry.computeVertexNormals();
  },hide(){restore();for(const [m,wasVisible]of foundations)m.visible=wasVisible;foundations=[];group.visible=false;world=null;original=null;ready=false;}};
}
