import * as THREE from 'three';
import {regionBoundary} from './region-boundary.js';

// The same credited display outline is draped on both globe and regional DEM.
// Geometry is fixed; toggles and camera changes never allocate another range.
export function createXinjiangRange(point,{fillOpacity=.10}={}){
 const root=new THREE.Group();root.name='xinjiang-display-range';
 const material=(color,opacity)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
 const flat=new THREE.ShapeGeometry(new THREE.Shape(regionBoundary.map(p=>new THREE.Vector2(...p))));
 const vertices=flat.attributes.position,positions=[];
 function triangle(a,b,c){
  const edges=[[a,b,c],[b,c,a],[c,a,b]].sort((u,v)=>v[0].distanceToSquared(v[1])-u[0].distanceToSquared(u[1]));
  const [u,v,w]=edges[0];
  if(u.distanceToSquared(v)>.22**2){const mid=u.clone().add(v).multiplyScalar(.5);triangle(u,mid,w);triangle(mid,v,w);}
  else for(const p of [a,b,c])positions.push(...point(p.x,p.y,.003).toArray());
 }
 for(let i=0;i<flat.index.count;i+=3)triangle(...[0,1,2].map(j=>{const n=flat.index.getX(i+j);return new THREE.Vector2(vertices.getX(n),vertices.getY(n));}));
 flat.dispose();
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const fill=new THREE.Mesh(geo,material(0xffd590,fillOpacity));fill.name='xinjiang-range-fill';fill.renderOrder=4;root.add(fill);
 const samples=[];
 for(let i=1;i<regionBoundary.length;i++){
  const a=regionBoundary[i-1],b=regionBoundary[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.07));
  for(let j=0;j<n;j++)samples.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);
 }
 for(const [width,color,opacity]of [[.15,0x8c682d,.28],[.045,0xffdfa0,.98]]){
  const coords=[],indices=[];
  for(let i=0;i<samples.length;i++){
   const a=samples[(i+samples.length-1)%samples.length],b=samples[(i+1)%samples.length],s=samples[i],cos=Math.cos(s[1]*Math.PI/180),dx=(b[0]-a[0])*cos,dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
   for(const sign of [-1,1])coords.push(...point(s[0]-dy/len/cos*width*sign,s[1]+dx/len*width*sign,.009).toArray());
   const k=i*2,n=(i+1)%samples.length*2;indices.push(k,n,k+1,n,n+1,k+1);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geometry.setIndex(indices);
  const border=new THREE.Mesh(geometry,material(color,opacity));border.name='xinjiang-range-outline';border.renderOrder=5;root.add(border);
 }
 // A one-pixel core stays legible at global scale where the geographic ribbon
 // is thinner than a pixel; its depth test still hides the far hemisphere.
 const core=new THREE.Line(new THREE.BufferGeometry().setFromPoints([...samples,samples[0]].map(p=>point(...p,.011))),new THREE.LineBasicMaterial({color:0xffdfa0,transparent:true,opacity:1,depthWrite:false}));core.name='xinjiang-range-core';core.renderOrder=5;root.add(core);
 root.userData.triangles=positions.length/9;
 return root;
}
