import * as THREE from 'three';

// Procedural shading only: no displacement is added to measured terrain.
const clock={value:0},regionalPresentation={value:0};
export function setRegionalPresentation(enabled){regionalPresentation.value=enabled?1:0;}
export function updateSurfaceTime(seconds) {clock.value=seconds;}
const noise=`
float rockHash(vec3 p){p=fract(p*.3183099+vec3(.11,.23,.37));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float rockNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(rockHash(i),rockHash(i+vec3(1,0,0)),f.x),mix(rockHash(i+vec3(0,1,0)),rockHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(rockHash(i+vec3(0,0,1)),rockHash(i+vec3(1,0,1)),f.x),mix(rockHash(i+vec3(0,1,1)),rockHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float rockFbm(vec3 p){return .57*rockNoise(p)+.28*rockNoise(p*2.03)+.15*rockNoise(p*4.13);}
vec3 detailNormal(vec3 n,float h){vec3 dx=-dFdx(vViewPosition),dy=-dFdy(vViewPosition);vec3 r1=cross(dy,n),r2=cross(n,dx);float det=dot(dx,r1);return normalize(abs(det)*n-sign(det)*(dFdx(h)*r1+dFdy(h)*r2));}
float sedimentCrack(vec2 p){vec2 cell=floor(p),f=fract(p);float a=8.,b=8.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 n=vec2(float(x),float(y));vec2 jitter=vec2(rockHash(vec3(cell+n,1.)),rockHash(vec3(cell+n,7.)));float d=length(n+jitter-f);if(d<a){b=a;a=d;}else b=min(b,d);}return 1.-smoothstep(.015,.06,b-a);}
`;
export function surfaceMaterial(color,options={},kind='rock') {
  const material=new THREE.MeshStandardMaterial({color,roughness:.9,...options});
  if(kind==='regional'||kind==='regional-context')material.transparent=true;
  material.onBeforeCompile=shader=>{
    shader.uniforms.surfaceClock=clock;shader.uniforms.regionalPresentation=regionalPresentation;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 detailPosition; varying vec3 detailUp;').replace('#include <begin_vertex>','#include <begin_vertex>\ndetailPosition=position;detailUp=normal;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 detailPosition; varying vec3 detailUp; uniform float surfaceClock;\n${noise}`);
    if(kind==='regional') {
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float regionFocus;varying float focusTint;').replace('#include <begin_vertex>','#include <begin_vertex>\nfocusTint=regionFocus;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float focusTint;uniform float regionalPresentation;');
    }
    if(kind==='regional-context'){
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float contextBlend;attribute float contextEdge;varying float sceneBlend;varying float sceneEdge;').replace('#include <begin_vertex>','#include <begin_vertex>\nsceneBlend=contextBlend;sceneEdge=contextEdge;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float sceneBlend;varying float sceneEdge;');
    }
    let albedo='',bump='',roughness='';
    if(kind==='skin'){
      // Broad warm/cool skin variation; avoid putting rock grains on faces.
      albedo='float skinWarm=exp(-pow((detailPosition.y+.025)*7.,2.));diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.035,.976,.958),skinWarm*.32);';
      roughness='roughnessFactor=clamp(roughnessFactor,.64,.82);';
    }
    else if(kind==='regional'){
      // The 500 m NASA image already contains relief shading. Preserve its
      // observed ridges rather than covering it with generated strata or grain.
      albedo='float gray=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(vec3(gray*mix(.78,.24,regionalPresentation)),diffuseColor.rgb,focusTint);';
    }
    else if(kind==='soil'){
      albedo='float soilPatch=rockFbm(detailPosition*1.3);float soilGrain=rockFbm(detailPosition*48.);diffuseColor.rgb*=.86+soilPatch*.24+soilGrain*.07;';
      bump='float soilFilter=1.-smoothstep(.6,2.,max(length(dFdx(detailPosition*48.)),length(dFdy(detailPosition*48.))));normal=detailNormal(normal,rockFbm(detailPosition*48.)*.0013*soilFilter);';
    }
    else if(kind==='basket'){
      albedo='float woven=sin(detailPosition.y*130.)*sin(atan(detailPosition.z,detailPosition.x)*36.);diffuseColor.rgb*=.92+woven*.05;';bump='normal=detailNormal(normal,sin(detailPosition.y*130.)*.0005);';
    }
    else if(kind==='plaster'){albedo='diffuseColor.rgb*=.96+rockFbm(detailPosition*24.)*.08;';bump='normal=detailNormal(normal,rockFbm(detailPosition*30.)*.0004);';}
    else if(kind==='wood'){
      albedo='float grain=rockFbm(vec3(detailPosition.x*65.,detailPosition.y*4.,detailPosition.z*13.));diffuseColor.rgb*=.87+grain*.22;';
      bump='normal=detailNormal(normal,rockFbm(vec3(detailPosition.x*65.,detailPosition.y*4.,detailPosition.z*13.))*.0008);';
    }else if(kind==='textile'){
      // Filter fine weave by footprint so distant fabric does not flicker.
      albedo='vec2 weaveUv=(abs(detailUp.y)>.5?detailPosition.xz:detailPosition.xy)*210.;float weaveFilter=1.-smoothstep(.8,2.5,max(length(dFdx(weaveUv)),length(dFdy(weaveUv))));float weave=sin(weaveUv.x)*sin(weaveUv.y)*weaveFilter;diffuseColor.rgb*=.96+weave*.025+rockNoise(detailPosition*35.)*.05;';
      bump='normal=detailNormal(normal,rockNoise(detailPosition*38.)*.00035);';
    }else if(kind==='clay'){
      albedo='diffuseColor.rgb*=.93+rockFbm(detailPosition*28.)*.10+sin(detailPosition.y*95.)*.013;';
      bump='normal=detailNormal(normal,rockFbm(detailPosition*30.)*.0009);';
    }
    else if(kind==='water') {
      albedo='float rip=sin(detailPosition.x*32.+surfaceClock*1.6+sin(detailPosition.z*13.))*sin(detailPosition.z*28.-surfaceClock);diffuseColor.rgb*=.93+rip*.07;';
      bump='normal=detailNormal(normal,sin(detailPosition.x*32.+surfaceClock*1.6)*sin(detailPosition.z*28.-surfaceClock)*.0015);';
    } else if(kind==='ice') {
      albedo='float vein=abs(sin(detailPosition.x*18.+rockFbm(detailPosition*3.)*6.+detailPosition.z*3.));float fissure=1.-smoothstep(.012,.065,vein);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.27,.53,.59),fissure*.47);diffuseColor.rgb*=.89+rockFbm(detailPosition*22.)*.18;';
      bump='float iceFootprint=max(length(dFdx(detailPosition*24.)),length(dFdy(detailPosition*24.)));float iceDetail=1.-smoothstep(.5,2.,iceFootprint);normal=detailNormal(normal,(rockFbm(detailPosition*24.)-.5)*.004*iceDetail);';
      roughness='roughnessFactor=clamp(.42+rockFbm(detailPosition*4.)*.15,.4,.62);';
    } else if(kind==='imagery'||kind==='glacier-imagery'||kind==='regional-context') {
      // Keep observed land-cover colours. Only a subtle display-normal detail;
      // no generated rock bands, snow line, foliage or displacement over photos.
      bump='float terrainFootprint=max(length(dFdx(detailPosition*35.)),length(dFdy(detailPosition*35.)));float terrainDetail=1.-smoothstep(.6,2.,terrainFootprint);normal=detailNormal(normal,(rockFbm(detailPosition*35.)-.5)*.0012*terrainDetail);';
      if(kind!=='regional-context'){
       bump+='\n#ifdef USE_MAP\nfloat observedTone=dot(texture2D(map,vMapUv).rgb,vec3(.2126,.7152,.0722));normal=detailNormal(normal,observedTone*.0012);\n#endif\n';
       // Display roughness follows image tone. This is not a land-cover label,
       // a reconstructed crack map, or higher-resolution elevation data.
       roughness='\n#ifdef USE_MAP\nfloat displayTone=dot(texture2D(map,vMapUv).rgb,vec3(.2126,.7152,.0722));roughnessFactor=mix(.86,.98,smoothstep(.5,.83,displayTone));\n#endif\n';
      }
      else albedo='vec3 setSoil=vec3(.51,.40,.25)*(.91+rockFbm(detailPosition*1.3)*.19);diffuseColor.rgb=mix(setSoil,diffuseColor.rgb,sceneBlend);';
    } else {
      albedo='float grain=rockFbm(detailPosition*13.);float band=sin(detailPosition.y*19.+rockNoise(detailPosition*1.6)*.8);float cliff=1.-abs(normalize(detailUp).y);diffuseColor.rgb*=.88+grain*.19+band*.035*cliff;';
      if(kind==='sediment')albedo+='diffuseColor.rgb*=1.-sedimentCrack(detailPosition.xz*2.8)*.28*(1.-cliff);';
      if(kind==='sediment')albedo+='diffuseColor.rgb*=1.+band*.075*cliff;';
      bump='normal=detailNormal(normal,rockFbm(detailPosition*35.)*.0025);';
    }
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\n${albedo}`).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>\n${bump}`);
    if(roughness)shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>\n${roughness}`);
    if(kind==='regional')shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`outgoingLight=mix(diffuseColor.rgb,outgoingLight,.32);
      #ifdef USE_MAP
      // Fade the sampled rectangle into the canvas; no elevation is invented outside coverage.
      float edgeDistance=min(min(vMapUv.x,1.-vMapUv.x),min(vMapUv.y,1.-vMapUv.y));
      diffuseColor.a*=mix(1.,smoothstep(0.,.052,edgeDistance),regionalPresentation);
      #endif
      #include <opaque_fragment>`);
    if(kind==='imagery'||kind==='glacier-imagery')shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`// TCI is an already shaded display image, not unlit surface reflectance.
      // Preserve its observed colours and use restrained additional relief lighting.
      outgoingLight=mix(diffuseColor.rgb*1.05,outgoingLight,.72);
      outgoingLight=pow(max(outgoingLight,vec3(0.)),vec3(.94));
      #include <opaque_fragment>`);
    if(kind==='regional-context')shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a*=sceneEdge;\n#include <opaque_fragment>');
  };
  material.customProgramCacheKey=()=>`xinjiang-surface-${kind}-13`;
  return material;
}
