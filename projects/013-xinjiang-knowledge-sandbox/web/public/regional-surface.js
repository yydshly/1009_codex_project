import * as THREE from 'three';
import {regionalMeshData,regionalPosition,renderedRegionalPosition} from './regional-surface-data.js';
import {createXinjiangRange} from './xinjiang-range.js';

// One cached, georeferenced overlay reuses the credited 2004 regional imagery.
// Feathered raster edges reveal the original global sphere, never a floating slab.
export function installRegionalSurface({dem,planet,texture,viewport}){
 let earth,mesh,enabled=false,saved;const root=new THREE.Group();root.name='earth-regional-surface';
 function present(){
  earth.userData.grid.visible=false;earth.userData.footprint.visible=false;if(earth.userData.footprintOutline)earth.userData.footprintOutline.visible=false;earth.userData.locatingRing.visible=false;viewport.dataset.xinjiangRange='true';
  const surface=saved?.surface;if(surface){surface.emissiveMap=surface.map;surface.emissive.setHex(0xa9b1b5);surface.emissiveIntensity=.35;surface.needsUpdate=true;}
 }
 function set(value){
  // The globe introduction also owns these original locating objects. Reapply
  // when its hide() restores them during a same-scene arrival.
  if(value===enabled){if(value&&earth)present();return;}enabled=value;
  if(value){
   earth=planet();if(!earth){enabled=false;return;}
   if(!mesh){
    const data=regionalMeshData(dem),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(data.uvs,2));geo.setIndex(data.indices);geo.computeVertexNormals();
    // The regional image and global image have different exposure. A broad,
    // separable fade also softens corners, while transparent texels leave depth untouched.
    const material=new THREE.MeshBasicMaterial({map:texture(),transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide});
    material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>','#include <alphamap_fragment>\nvec2 regionalFade=smoothstep(vec2(0.0),vec2(0.12),vMapUv)*smoothstep(vec2(0.0),vec2(0.12),vec2(1.0)-vMapUv);\ndiffuseColor.a *= regionalFade.x*regionalFade.y;');};material.customProgramCacheKey=()=> 'regional-surface-feather-v2';
    mesh=new THREE.Mesh(geo,material);mesh.castShadow=false;root.add(mesh);root.add(createXinjiangRange((lon,lat,lift)=>new THREE.Vector3(...renderedRegionalPosition(dem,lon,lat,lift))));earth.add(root);
    viewport.dataset.regionalSurfaceTriangles=String(data.indices.length/3);
   }
   const surface=earth.children.find(o=>o.material?.map&&o.geometry?.type==='SphereGeometry')?.material;
   const rangeRestore=earth.userData.worldAtlasActive?earth.userData.atlasRangeRestore:null;
   saved={surface,grid:earth.userData.grid.visible,fill:rangeRestore?.fill??earth.userData.footprint.visible,outline:rangeRestore?.outline??earth.userData.footprintOutline?.visible,ring:earth.userData.locatingRing.visible};
   if(surface){saved.emissive=surface.emissive.clone();saved.emissiveMap=surface.emissiveMap;saved.intensity=surface.emissiveIntensity;surface.emissiveMap=surface.map;surface.emissive.setHex(0xa9b1b5);surface.emissiveIntensity=.35;surface.needsUpdate=true;}
   present();
  }else if(earth&&saved){
   if(!earth.userData.worldAtlasActive){earth.userData.grid.visible=saved.grid;earth.userData.footprint.visible=saved.fill;if(earth.userData.footprintOutline)earth.userData.footprintOutline.visible=saved.outline??true;earth.userData.locatingRing.visible=saved.ring;}delete viewport.dataset.xinjiangRange;
   if(saved.surface){saved.surface.emissive.copy(saved.emissive);saved.surface.emissiveMap=saved.emissiveMap;saved.surface.emissiveIntensity=saved.intensity;saved.surface.needsUpdate=true;}
  }
  root.visible=value;viewport.dataset.regionalSurface=String(value);
 }
 return {set,point:(lon,lat,offset=.012)=>new THREE.Vector3(...regionalPosition(dem,lon,lat,offset)),groundPoint:(lon,lat,offset=.001)=>new THREE.Vector3(...renderedRegionalPosition(dem,lon,lat,offset))};
}
