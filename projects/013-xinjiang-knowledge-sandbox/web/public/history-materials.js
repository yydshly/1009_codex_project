import * as THREE from 'three';

// Small, seamless teaching materials. These are procedural surface cues, not
// scanned historical materials. No canvas, network, or renderer is needed.
const surfaces={
 plaster:{roughness:1,bump:.00024,contrast:.105,grain:.016},
 cloth:{roughness:1,bump:.00011,contrast:.075,grain:.008},
 wood:{roughness:.98,bump:.00016,contrast:.13,grain:.010},
 earth:{roughness:1,bump:.00031,contrast:.11,grain:.018},
 stone:{roughness:1,bump:.00023,contrast:.09,grain:.014},
 skin:{roughness:.98,bump:.000018,contrast:.016,grain:.002},
 fur:{roughness:1,bump:.00007,contrast:.045,grain:.006},
 foliage:{roughness:.98,bump:.00004,contrast:.04,grain:.004},
 water:{roughness:.45,bump:.000025,contrast:.025,grain:0},
 plain:{roughness:.86,bump:0,contrast:0,grain:0}
};
const automatic=new Map([
 ...[0xb59b74,0xcbb58c,0xc0ae88].map(c=>[c,'plaster']),
 ...[0x81644b,0x574e3d].map(c=>[c,'wood']),
 ...[0xbb7754,0x79b8ad,0xe4bc71,0xa28b64].map(c=>[c,'cloth']),
 ...[0x778263,0x917b5d,0xa79a79,0x96856a,0x8a775c].map(c=>[c,'earth']),
 [0xd8b88d,'skin'],[0xc89c66,'fur'],[0xa57e56,'fur'],[0x92a775,'foliage'],[0x798367,'earth']
]);
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const smooth=n=>n*n*(3-2*n);
function hash(x,y,seed){let h=Math.imul(x+seed,374761393)^Math.imul(y+seed*3,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;}
function noise(u,v,cells,seed){
 const x=u*cells,y=v*cells,ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy);
 const a=hash(ix%cells,iy%cells,seed),b=hash((ix+1)%cells,iy%cells,seed),c=hash(ix%cells,(iy+1)%cells,seed),d=hash((ix+1)%cells,(iy+1)%cells,seed);
 return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;
}
function relief(kind,u,v){
 const broad=noise(u,v,4,17),grain=noise(u,v,16,43),a=Math.PI*2;
 if(kind==='cloth')return .5+.18*Math.sin(u*a*16)*Math.sin(v*a*16)+.20*(broad-.5);
 if(kind==='wood')return .5+.27*Math.sin(u*a*12+Math.sin(v*a*2)*.7+Math.sin(v*a*5)*.22)+.2*(broad-.5);
 if(kind==='fur')return .5+.15*Math.sin(u*a*18+Math.sin(v*a*4)*.45)+.18*(broad-.5);
 if(kind==='water')return .5+.25*Math.sin(u*a*3+Math.sin(v*a*2))+.1*Math.sin(v*a*5);
 if(kind==='stone')return .68*broad+.32*grain;
 if(kind==='skin'||kind==='foliage')return .7*broad+.3*grain;
 return .57*broad+.43*grain;
}
function texture(data,size,{color=false,name}={}){
 const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat,THREE.UnsignedByteType);
 t.name=name;t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;
 t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=2;t.needsUpdate=true;
 return t;
}
function makeSurface(kind){
 const settings=surfaces[kind],size=kind==='skin'||kind==='foliage'?64:128,albedo=new Uint8Array(size*size*4),detail=new Uint8Array(64*64*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,h=relief(kind,u,v),fine=noise(u,v,32,71),i=(y*size+x)*4;
  // Near-white modulation preserves the chosen pigment and natural lighting.
  // Mipmaps suppress the weave/grain at regional-map viewing distances.
  const value=Math.round(255*clamp(.965+(h-.5)*settings.contrast+(fine-.5)*settings.grain));
  albedo[i]=albedo[i+1]=albedo[i+2]=value;albedo[i+3]=255;
 }
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const h=relief(kind,x/64,y/64),i=(y*64+x)*4;
  detail[i]=Math.round(clamp(h)*255); // Bump reads R; roughness reads G.
  detail[i+1]=Math.round(clamp(.93+(h-.5)*.1)*255);detail[i+2]=0;detail[i+3]=255;
 }
 return {map:texture(albedo,size,{color:true,name:'history-'+kind+'-pigment'}),detail:texture(detail,64,{name:'history-'+kind+'-surface'}),users:0,bytes:albedo.byteLength+detail.byteLength};
}

export function createHistoryMaterials(){
 const shared=new Map(),active=new Set();let closed=false;
 function release(kind,entry){
  entry.users--;if(entry.users)return;
  entry.map.dispose();entry.detail.dispose();shared.delete(kind);
 }
 function material(color,{lit=false,surface}={}){
  if(closed)throw new Error('History material factory has been disposed');
  const pigment=new THREE.Color(color),kind=surface??(lit?'plain':automatic.get(pigment.getHex())??'plain');
  if(!Object.hasOwn(surfaces,kind))throw new TypeError('Unknown history surface: '+kind);
  const settings=surfaces[kind];let entry=null;
  if(kind!=='plain'){
   if(!shared.has(kind))shared.set(kind,makeSurface(kind));entry=shared.get(kind);entry.users++;
  }
  // Colors and emissive values remain independent: selection emphasis on one
  // miniature must never alter another miniature that shares its textures.
  const m=new THREE.MeshStandardMaterial({color:pigment,roughness:settings.roughness,metalness:0,
   emissive:pigment,emissiveIntensity:lit?.65:.045,
   map:entry?.map??null,emissiveMap:entry?.map??null,roughnessMap:entry?.detail??null,
   bumpMap:settings.bump?entry?.detail??null:null,bumpScale:settings.bump});
  m.userData.baseColor=pigment.clone();m.userData.localLight=lit;m.userData.historySurface=kind;
  active.add(m);
  const onDispose=()=>{if(!active.delete(m))return;m.removeEventListener('dispose',onDispose);if(entry)release(kind,entry);};
  m.addEventListener('dispose',onDispose);
  return m;
 }
 return {material,
  // Existing owner traversal can simply call each material.dispose(). Shared
  // textures are freed only after their final user, including duplicate calls.
  dispose(){if(closed)return;closed=true;for(const m of [...active])m.dispose();},
  stats(){return {materials:active.size,surfaces:shared.size,textures:shared.size*2,bytes:[...shared.values()].reduce((n,e)=>n+e.bytes,0)};}
 };
}
