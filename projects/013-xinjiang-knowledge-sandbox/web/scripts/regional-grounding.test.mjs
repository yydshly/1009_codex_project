import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {regionalPosition,regionalMeshData,renderedRegionalPosition} from '../public/regional-surface-data.js';

const dem=JSON.parse(readFileSync(new URL('../public/assets/xinjiang-dem.json',import.meta.url),'utf8'));
const data=regionalMeshData(dem),positions=new Float32Array(data.positions),vector=i=>new THREE.Vector3(...positions.subarray(i*3,i*3+3));
function nearTriangles(lon,lat){
 const [w,s,e,n]=dem.bounds,cols=data.cols,rows=data.rows,x=Math.floor((lon-w)/(e-w)*(cols-1)),y=Math.floor((n-lat)/(n-s)*(rows-1)),triangles=[];
 for(let j=y-1;j<=y+1;j++)for(let i=x-1;i<=x+1;i++)if(i>=0&&i<cols-1&&j>=0&&j<rows-1){const a=j*cols+i,b=a+1,c=a+cols,d=c+1;triangles.push(new THREE.Triangle(vector(a),vector(b),vector(c)),new THREE.Triangle(vector(b),vector(d),vector(c)));}
 return triangles;
}
function coordinate(p){const radius=Math.hypot(...p);return [Math.atan2(-p[2],p[0])*180/Math.PI,Math.asin(p[1]/radius)*180/Math.PI];}

test('history ground contact follows the rendered Float32 triangles instead of the denser source DEM',()=>{
 let maxRawDifference=0;
 for(const [lon,lat]of [[75.99,39.47],[84.25,41.78],[81.14,43.84],[89.19,42.95]])for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++){
  const lo=lon+x*.15,la=lat+y*.14,p=renderedRegionalPosition(dem,lo,la,0),v=new THREE.Vector3(...p),nearest=new THREE.Vector3();
  const distance=Math.min(...nearTriangles(lo,la).map(t=>t.closestPointToPoint(v,nearest).distanceTo(v)));
  assert(distance<3e-7,'contact lies on a visible display triangle: '+distance);
  maxRawDifference=Math.max(maxRawDifference,Math.abs(Math.hypot(...regionalPosition(dem,lo,la))-v.length()));
  const [actualLon,actualLat]=coordinate(p);assert(Math.abs(actualLon-lo)<1e-10);assert(Math.abs(actualLat-la)<1e-10);
  const lifted=renderedRegionalPosition(dem,lo,la,.0012);assert(Math.abs(Math.hypot(...lifted)-v.length()-.0012)<1e-10);
 }
 assert(maxRawDifference>.001,'test samples expose the old sub-display terrain penetration risk');
});

test('rendered grounding is deterministic, finite on edges, and retains source behaviour beyond DEM coverage',()=>{
 const [w,s,e,n]=dem.bounds;
 for(const [lon,lat]of [[w,n],[e,n],[w,s],[e,s],[w,42],[e,42],[84,n],[84,s],[w+.0000001,n-.0000001],[e-.0000001,s+.0000001]]){
  const first=renderedRegionalPosition(dem,lon,lat);assert(first.every(Number.isFinite));assert.deepEqual(renderedRegionalPosition(dem,lon,lat),first);
  const [lo,la]=coordinate(first);assert(Math.abs(lo-lon)<1e-10);assert(Math.abs(la-lat)<1e-10);
 }
 for(const [lon,lat]of [[123.43,41.8],[0,0],[-75,-39],[96.001,49.001]])assert.deepEqual(renderedRegionalPosition(dem,lon,lat,.002),regionalPosition(dem,lon,lat,.002));
});

test('optional display resolution uses its own triangles and does not mutate source elevations',()=>{
 const small={bounds:[73,35,96,49],cols:3,rows:3,heights:[100,3500,200,1800,600,2200,30,1100,80]},before=[...small.heights],mesh=regionalMeshData(small,5,4),float=new Float32Array(mesh.positions),v=i=>new THREE.Vector3(...float.subarray(i*3,i*3+3));
 const p=new THREE.Vector3(...renderedRegionalPosition(small,84.2,41.9,0,5,4)),closest=new THREE.Vector3();let best=Infinity;
 for(let i=0;i<mesh.indices.length;i+=3){const triangle=new THREE.Triangle(...mesh.indices.slice(i,i+3).map(v));best=Math.min(best,triangle.closestPointToPoint(p,closest).distanceTo(p));}
 assert(best<1e-8);assert.deepEqual(small.heights,before);
});
