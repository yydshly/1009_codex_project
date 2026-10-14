import * as THREE from 'three';
import {countryCatalog} from './world-country-data.js';
import {countryShapes,disputedLines} from './world-country-shapes.js';
import {countrySegments,unwrappedRing} from './world-country-geometry.js';

export const countryForAnchor=id=>countryCatalog.find(c=>c.id===id)??(id==='xinjiang'||['beijing','xian','urumqi','lanzhou'].includes(id)?countryCatalog.find(c=>c.id==='china'):null);

// Fixed geometry + a reusable 2K overlay: changing a country does not accumulate meshes/textures.
export function installCountryLayer(parent){
 const group=new THREE.Group();group.name='modern-country-ranges';parent.add(group);
 const geometry=paths=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(countrySegments(paths),3));return g;};
 const borders=new THREE.LineSegments(geometry(Object.values(countryShapes).flat(2)),new THREE.LineBasicMaterial({color:0xd4e6d5,transparent:true,opacity:.55,depthWrite:false}));group.add(borders);
 const disputed=new THREE.LineSegments(geometry(disputedLines),new THREE.LineDashedMaterial({color:0xeecb91,transparent:true,opacity:.95,depthWrite:false,dashSize:.014,gapSize:.012}));disputed.computeLineDistances();group.add(disputed);
 const highlight=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xffdf93,transparent:true,opacity:1,depthWrite:false}));group.add(highlight);
 const preview=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x9eeada,transparent:true,opacity:.98,depthWrite:false}));preview.visible=false;preview.renderOrder=5;group.add(preview);
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const fill=new THREE.Mesh(new THREE.SphereGeometry(3.211,128,96),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));fill.name='country-color-overlay';fill.renderOrder=1;group.add(fill);borders.renderOrder=2;highlight.renderOrder=3;disputed.renderOrder=4;
 const colors=['#789db7','#b7a77e','#91b5a2','#b49ba9','#b8b588','#829bab','#ae9a70'];
 const paths=new Map();for(const c of countryCatalog){const path=new Path2D();for(const polygon of countryShapes[c.id])for(const ring of polygon){const points=unwrappedRing(ring);for(const shift of [-360,0,360]){points.forEach(([lon,lat],i)=>{const x=(lon+shift+180)/360*2048,y=(90-lat)/180*1024;i?path.lineTo(x,y):path.moveTo(x,y);});path.closePath();}}paths.set(c.id,path);}
 let last='',previewId='',selectedId='';
 return {set(anchor,options){
  const c=countryForAnchor(anchor),id=options.regionTarget?'':c?.id??'',key=id+':'+options.tint+':'+options.relief;selectedId=id;
  preview.visible=false;previewId='';
  borders.visible=disputed.visible=highlight.visible=options.borders;
  fill.visible=options.tint||!!id;
  if(key===last)return;last=key;
  highlight.geometry.dispose();highlight.geometry=geometry(countryShapes[id]?.flat()??[]);
  ctx.clearRect(0,0,2048,1024);
  if(options.tint)for(const item of countryCatalog){if(item.code==='ATA')continue;ctx.globalAlpha=options.relief?.09:.17;ctx.fillStyle=colors[((item.color-1)%7+7)%7];ctx.fill(paths.get(item.id),'evenodd');}
  if(id){ctx.globalAlpha=options.relief?.12:.22;ctx.fillStyle='#dfb55b';ctx.fill(paths.get(id),'evenodd');}
  ctx.globalAlpha=1;texture.needsUpdate=true;
 },preview(id){
  const valid=countryShapes[id]&&id!==selectedId;
  preview.visible=!!valid;
  if(!valid||id===previewId)return;previewId=id;
  preview.geometry.dispose();preview.geometry=geometry(countryShapes[id].flat());
 },count:countryCatalog.length};
}
