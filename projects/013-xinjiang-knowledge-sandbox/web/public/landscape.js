// Display-only occlusion from measured heights. No elevation is invented.
export function cavityShade(dem, row, col) {
  const height=dem.heights[row*dem.cols+col];
  const width=(dem.bounds[2]-dem.bounds[0])*Math.cos((dem.bounds[1]+dem.bounds[3])*Math.PI/360)*111320;
  const dx=width/(dem.cols-1),dz=(dem.bounds[3]-dem.bounds[1])*111320/(dem.rows-1);
  let occlusion=0;
  for(const [rx,rz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]) {
    let horizon=0;
    for(const step of [1,3,7,16]) {
      const r=Math.max(0,Math.min(dem.rows-1,row+rz*step)),c=Math.max(0,Math.min(dem.cols-1,col+rx*step));
      const distance=Math.hypot((c-col)*dx,(r-row)*dz);
      if(distance>0)horizon=Math.max(horizon,Math.atan2(dem.heights[r*dem.cols+c]-height,distance));
    }
    occlusion+=Math.sin(Math.max(0,horizon));
  }
  return 1-occlusion/8*.43;
}

const ramp=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Conceptual erosion: every point loses height or stays level as the phase advances.
export function erosionHeight(x,z,phase) {
  const t=Math.max(0,Math.min(1,phase/100));
  const initial=1.42+Math.sin(x*8+z*3)*Math.sin(z*7)*.022;
  const crest=.5+.5*Math.sin(z*2.15+Math.sin(x*.65)*.22);
  const ridge=ramp(.20+t*.24,.52+t*.25,crest);
  const islands=.5+.5*Math.sin(x*.74+Math.sin(z*.9)*.45);
  const breakup=ramp(.38,1,t)*(1-ramp(.14,.57,islands))*.95;
  const remaining=(1-Math.pow(t,.85)*(1-ridge))*(1-breakup);
  return .055+(initial-.055)*remaining;
}

export const erosionGLSL=`
float erosionHeightAt(vec2 p,float t){
  float initial=1.42+sin(p.x*8.+p.y*3.)*sin(p.y*7.)*.022;
  float crest=.5+.5*sin(p.y*2.15+sin(p.x*.65)*.22);
  float ridge=smoothstep(.20+t*.24,.52+t*.25,crest);
  float islands=.5+.5*sin(p.x*.74+sin(p.y*.9)*.45);
  float breakup=smoothstep(.38,1.,t)*(1.-smoothstep(.14,.57,islands))*.95;
  return .055+(initial-.055)*(1.-pow(t,.85)*(1.-ridge))*(1.-breakup);
}`;

export function animateErosionMaterial(material,phase,depth=false) {
  const prior=material.onBeforeCompile;
  material.onBeforeCompile=shader=>{
    prior(shader);
    shader.uniforms.erosionPhase=phase;
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nuniform float erosionPhase;attribute float erosionWeight;\n${erosionGLSL}`);
    if(!depth)shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
      float eh=erosionHeightAt(position.xz,erosionPhase);
      float ex=erosionHeightAt(position.xz+vec2(.025,0.),erosionPhase)-erosionHeightAt(position.xz-vec2(.025,0.),erosionPhase);
      float ez=erosionHeightAt(position.xz+vec2(0.,.025),erosionPhase)-erosionHeightAt(position.xz-vec2(0.,.025),erosionPhase);
      objectNormal=mix(objectNormal,normalize(vec3(-ex/.05,1.,-ez/.05)),step(.5,normal.y));`);
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      transformed.y=mix(position.y,erosionHeightAt(position.xz,erosionPhase),erosionWeight);`);
    if(!depth)shader.vertexShader=shader.vertexShader.replace('detailPosition=position;detailUp=normal;','detailPosition=transformed;detailUp=objectNormal;');
  };
  material.customProgramCacheKey=()=>`xinjiang-erosion-${depth?'depth':'surface'}-1`;
}
