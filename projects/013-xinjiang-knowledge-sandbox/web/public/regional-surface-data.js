import {sampleElevation} from './geo.js';
import {globePosition} from './world-content.js';

export const earthRadius=3.2,earthMetres=6371008.8;
export const regionalSurfaceExaggeration=6;
export function covered(dem,lon,lat){const [w,s,e,n]=dem.bounds;return lon>=w&&lon<=e&&lat>=s&&lat<=n;}
// The entire Earth remains present. Missing DEM coverage stays on the sphere;
// it is never clamped to a neighbouring height sample or closed with a rock wall.
export function regionalPosition(dem,lon,lat,offset=0){
 const height=covered(dem,lon,lat)?sampleElevation(dem,lon,lat):0;
 return globePosition(lon,lat,earthRadius+.002+height/earthMetres*earthRadius*regionalSurfaceExaggeration+offset);
}
export function regionalMeshData(dem,cols=193,rows=129){
 const [w,s,e,n]=dem.bounds,positions=[],uvs=[],indices=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  positions.push(...regionalPosition(dem,w+(e-w)*x/(cols-1),n+(s-n)*y/(rows-1)));
  uvs.push(x/(cols-1),1-y/(rows-1));
 }
 for(let y=0;y<rows-1;y++)for(let x=0;x<cols-1;x++){const a=y*cols+x,b=a+1,c=a+cols,d=c+1;indices.push(a,b,c,b,d,c);}
 return {positions,uvs,indices,cols,rows};
}

// Contact points must use the surface that is actually drawn. The source DEM
// is denser than the display mesh; sampling it directly can bury a small model
// beneath an interpolated display triangle. Cache only the display vertices,
// with the same Float32 precision used by the BufferGeometry. Weak keys let an
// unused DEM and its contact grid be collected together.
const contactGrids=new WeakMap();
function contactGrid(dem,cols,rows){
 let grids=contactGrids.get(dem);if(!grids){grids=new Map();contactGrids.set(dem,grids);}
 const key=cols+':'+rows;if(grids.has(key))return grids.get(key);
 const [w,s,e,n]=dem.bounds,positions=new Float32Array(cols*rows*3);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)positions.set(regionalPosition(dem,w+(e-w)*x/(cols-1),n+(s-n)*y/(rows-1)),(y*cols+x)*3);
 grids.set(key,positions);return positions;
}
const contactSub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const contactDot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const contactCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function rayTriangleRadius(direction,a,b,c){
 const ab=contactSub(b,a),ac=contactSub(c,a),p=contactCross(direction,ac),det=contactDot(ab,p);
 if(Math.abs(det)<1e-14)return null;
 const inverse=1/det,from=[-a[0],-a[1],-a[2]],u=contactDot(from,p)*inverse,q=contactCross(from,ab),v=contactDot(direction,q)*inverse;
 // Float32 globe vertices introduce tiny edge errors. This tolerance is a
 // fraction of one display cell, not an offset to the geographic anchor.
 if(u<-.0001||v<-.0001||u+v>1.0001)return null;
 const radius=contactDot(ac,q)*inverse;return radius>0?radius:null;
}
export function renderedRegionalPosition(dem,lon,lat,offset=.001,cols=193,rows=129){
 if(!covered(dem,lon,lat))return regionalPosition(dem,lon,lat,offset);
 const [w,s,e,n]=dem.bounds,positions=contactGrid(dem,cols,rows),direction=globePosition(lon,lat,1);
 const x=Math.max(0,Math.min(cols-2,Math.floor((lon-w)/(e-w)*(cols-1)))),y=Math.max(0,Math.min(rows-2,Math.floor((n-lat)/(n-s)*(rows-1))));
 const at=(i,j)=>Array.from(positions.subarray((j*cols+i)*3,(j*cols+i)*3+3));
 // Constant-latitude rows become short straight edges in the rendered mesh.
 // Close to one of those edges, the exact radial ray may hit a neighbouring
 // cell. Test that cell as well instead of shifting longitude or latitude.
 const cells=[[x,y],[x,y-1],[x,y+1],[x-1,y],[x+1,y],[x-1,y-1],[x+1,y-1],[x-1,y+1],[x+1,y+1]];
 for(const [i,j]of cells){
  if(i<0||j<0||i>=cols-1||j>=rows-1)continue;
  const a=at(i,j),b=at(i+1,j),c=at(i,j+1),d=at(i+1,j+1);
  const radius=rayTriangleRadius(direction,a,b,c)??rayTriangleRadius(direction,b,d,c);
  if(radius!==null)return direction.map(value=>value*(radius+offset));
 }
 // At the outer raster corners a quantized triangle may miss the radial ray;
 // preserve the original coordinate and its finite DEM height in that case.
 return regionalPosition(dem,lon,lat,offset);
}
export function regionalPose({anchor=[84.6,41.8],surroundings=false,near=false,aspect=1.4}={}){
 // Camera and focus share a geographic radial axis, keeping the flight outside
 // the Earth. This is a finite regional mesh, not a global terrain streaming engine.
 const altitude=(surroundings?3.1:near?1.18:1.85)*Math.max(1,.9/aspect);
 return {lon:anchor[0],lat:anchor[1],distance:earthRadius+altitude,surface:earthRadius-.20};
}
