import {settlementStory} from './settlement-story.js';
import {settlementCameraPose,setPeriodFocus} from './settlement-period-detail.js';
import {createEnvoyDesert,desertCameraPose} from './envoy-desert.js';
import {installPlaceLandscape} from './place-landscape.js';
import {installWorkbench,workspaceScenes} from './workbench.js';
import {installHistoryPlatform} from './history-platform.js';
import {installHistoryMapLayer} from './history-map-layer.js';
import {eventById} from './history-content.js';
import {installGeographicExplorer} from './geographic-explorer.js';
import {installKnowledgeGuide} from './knowledge-guide.js';
import {installKarezStation} from './karez-station.js';
import {marketObservationPose} from './local-observation.js';
import {stageOrigins} from './continuity.js';
import {installTerrainArrival} from './terrain-arrival.js';
import {atlasPlaces,choiceLabel} from './journey-memory.js';
import {spatialPlan,flightTiming,flightCamera,arrivalPose,flightPhrases,advanceFlight} from './spatial-motion.js';
import {contextFor,changesPlace,spatialCameras} from './spatial-spine.js';
import {installSpatialNavigation,globeLift} from './spatial-navigation.js';
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import {regionBoundary} from './region-boundary.js';
import { sampleElevation, terrainDimensions, terrainPoint, locatingFootprint, inLocatingFootprint } from './geo.js';
import { lessons, order, places, routeStops } from './lessons.js';
import { catalog, stories, phaseLabel, erosionHeight } from './story.js';
import { surfaceMaterial, updateSurfaceTime, setRegionalPresentation } from './surface.js';
import { cameraFrame, smoothStep, phaseFrame } from './motion.js';
import {globeFrame} from './exploration-motion.js';
import {globeViewVectors} from './history-visual-direction.js';
import { cavityShade, animateErosionMaterial } from './landscape.js';
import { installCapture } from './capture.js';
import { chapters, cues, journeyDuration, formatTime, locateTime, journeyTime } from './journey.js';
import { sources, mapPoints } from './connections.js';
import { installNarrativeUI } from './narrative-ui.js';
import { installLivedScenes } from './lived-scenes.js';
import {frameDelta,frameHold} from './playback-clock.js';
import {installAnnotations} from './story-annotations.js';
import {sceneAnnotationAnchors} from './annotation-anchors.js';
import { stagedCues, sceneInfo } from './lived-model.js';
import {inquiryFrame,installInquiryUI} from './inquiry-spine.js';
import {presentationFrame,installSceneReading} from './scene-presentation.js';
import {installLiveCaptions} from './film-reading.js';
import {earlyBearing} from './early-chain.js';
import {bridges,isConnected,bridgeFrame} from './continuity.js';
import {displayTerrain,closingPose} from './story-outcomes.js';
import {installSoundscape} from './soundscape.js';
import {installAtlas,atlasScenes} from './atlas.js';
import { focusGlacierDEM, textureWindow, glacierBranches, glacierStationMarkup, budgetCaption, experimentStep, iceHalfWidth } from './glacier.js';

const $ = id => document.getElementById(id);
const viewport = $('viewport');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gold = 0xe6bd75, mint = 0x8dc9c5;
const state = { key: 'terrain', exaggeration: 18, localExaggeration: 1.35, route: 0, playing: false, flow: 65, flowing: true, cutaway: true, labels: true, shot: 0, storyPlaying: false, touring: false, elapsed: 0, voice: false, category: 'all', erosion: 0, eroding: false, retreat: 0, glacierMode:'observation', experiment:false, accumulation:40, ablation:80, migration: 0, migrating: false };
const demo = { active:false, started:false, ended:false, seeking:false, cue:0, summaryOpen:false };
const entryParams=new URLSearchParams(location.search);
const workbenchMode=!entryParams.has('demo')&&!entryParams.has('cue');
if(!workbenchMode)document.title='历史引导演示 · 山河之间';
if(workbenchMode){viewport.classList.add('workbench-mode');state.flowing=false;}
else if(!entryParams.has('scene')||entryParams.has('demo')){viewport.classList.add('demo-mode');viewport.dataset.demo='ready';$('demo-player').hidden=false;$('demo-start').disabled=true;$('atlas-film').disabled=true;$('atlas-home').hidden=true;}
let workbench,selectingWorkspace=false;
let historyPlatform,historyMapLayer,geographicExplorer,knowledgeGuide,platformSelecting=false;
const platformSceneCache=new Map();
let platformArrival=null;
function cancelPlatformArrival(){const callback=platformArrival;platformArrival=null;callback?.(false);}
const work={scene:'terrain',playing:false,speed:1,time:0,pending:0,wire:false,markers:true,light:315};
let demoCaptionSignature = '';
const groups = new Map();
const pins = [];
const scratch = new THREE.Vector3();
let renderer, scene, camera, orbit, active, transition, terrainDEM, localDEM, glacierDEM, earthTexture, regionalTexture, localTexture, glacierTexture, glacierFocusTexture, lastTime = 0;
let sceneFade, stars, sun, skyLight, fillLight, captureFrame, resizeViewport,frameWindowStart=0,frameWindowCount=0;
const backgrounds=new Map();
let regionalGeometry,regionalMaterial,unloading=false,resumeAfterRestore=false;
let stationSignature='';
let spatialNavigation,placeLandscape,terrainArrival,spatialFlight=null,entryScale='planet',atlasBookmark=null;
let lived,lastLivedShadow=0,soundscape,regionalDisplayDEM,annotations;
const visual = { erosion: 0, retreat: 0, route: 0, migration: 0 };
let routeLine, traveler, routePoints = [], lastStop = -1, flowParticles = [], cutMaterials = [], cutFaces = [], pond, globeGrid, windGroup;

const spherePoint = (lon, lat, radius) => {
  const a = lon * Math.PI / 180, b = lat * Math.PI / 180;
  return new THREE.Vector3(radius * Math.cos(b) * Math.cos(a), radius * Math.sin(b), -radius * Math.cos(b) * Math.sin(a));
};
const material = (color, props = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...props });
function mesh(geometry, mat, parent, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
function line(points, color, parent, opacity = 1) {
  const object = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
  parent.add(object);
  return object;
}
function rod(a, b, radius, color, parent) {
  const direction = b.clone().sub(a);
  const cylinder = mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 12), material(color), parent);
  cylinder.position.copy(a).add(b).multiplyScalar(0.5);
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return cylinder;
}

function addPin(group, data, position, className = '') {
  const button = document.createElement('button');
  button.className = `pin ${className}`;
  button.textContent = data.name;
  button.setAttribute('aria-label', `查看${data.name}`);
  button.addEventListener('click', () => {
    if(workbenchMode&&historyPlatform?.mapPin(data))return;
    if(state.key==='glacier')pauseStory();
    if (data.action === 'terrain') { if(demo.active)showSpatialEntry('region');else switchScene('terrain'); return; }
    if (data.routeIndex !== undefined) {
      state.playing = false;
      state.route = data.routeIndex / (routeStops.length - 1) * 100;
      updateRoute();
    }
    showPlace(data, button);
  });
  $('pins').append(button);
  const pin = { group, data, position, button };
  pins.push(pin);
  if (group.userData.pinMarkers !== false) {
    const marker = mesh(new THREE.SphereGeometry(data.landscape ? 0.045 : 0.063, 12, 8), new THREE.MeshBasicMaterial({ color: data.landscape ? 0xc4d4b4 : gold }), group);
    marker.castShadow = false;
    pin.marker = marker;
  }
  return pin;
}

function showPlace(data, button) {
  $('selection').hidden = false;
  $('selection').dataset.lastAction = 'place-open';
  $('source-panel').hidden = true;
  $('data-button').setAttribute('aria-expanded', 'false');
  $('place-kind').textContent = data.kind || '丝路廊道 · 教学节点';
  $('place-title').textContent = data.name;
  $('place-description').textContent = data.description;
  let coordinates = data.lon !== undefined ? `${data.lat.toFixed(2)}°N / ${data.lon.toFixed(2)}°E` : '结构、比例与水流均为教学示意';
    if (data.lon !== undefined && !['earth', 'migration'].includes(state.key)) {
    const dem = state.key === 'local' ? localDEM : state.key === 'glacier' ? active.userData.dem : terrainDEM;
    coordinates += ` · DEM ≈ ${Math.round(sampleElevation(dem, data.lon, data.lat))} m`;
  }
  $('place-coordinate').textContent = coordinates;
  $('place-action').hidden = data.action !== 'local';
  if(workbenchMode){
    const destinations={'天山天池':['local','打开天池真实地形'],'吐鲁番':['oasis','打开绿洲用水情境'],'喀什':['market','打开集市主题情境'],'伊宁':['people','打开家庭与聚落情境']};
    const destination=destinations[data.name];let b=$('wb-place-enter');if(b)b.remove();
    if(destination){b=document.createElement('button');b.id='wb-place-enter';b.textContent=destination[1]+' →';b.addEventListener('click',()=>selectWorkspace(destination[0]));$('selection').append(b);$('place-action').hidden=true;}
  }
  pins.forEach(pin => pin.button.classList.toggle('selected', pin.button === button));
}

function createEarth() {
  const group = new THREE.Group();
  const earth = mesh(new THREE.SphereGeometry(3.2, 96, 64), new THREE.MeshPhongMaterial({ map: earthTexture, shininess: 6, specular: 0x223f4d }), group);
  earth.castShadow = false;
  const atmosphere = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0x6fb7d8) },fade:{value:1} },
    vertexShader: 'varying vec3 n; varying vec3 eye; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader: 'uniform vec3 glowColor; uniform float fade; varying vec3 n; varying vec3 eye; void main(){float f=pow(1.0-abs(dot(normalize(n),normalize(eye))),3.2);gl_FragColor=vec4(glowColor,f*0.34*fade);}',
    transparent: true, side: THREE.BackSide, depthWrite: false,
  });
  mesh(new THREE.SphereGeometry(3.33, 72, 48), atmosphere, group).castShadow = false;
  globeGrid = new THREE.Group(); group.add(globeGrid);
  for (const lat of [-60, -30, 0, 30, 45, 60]) {
    const points = Array.from({ length: 181 }, (_, i) => spherePoint(i * 2 - 180, lat, 3.215));
    line(points, lat === 45 ? gold : 0x86bdca, globeGrid, lat === 45 ? 0.65 : 0.15);
  }
  for (let lon = -180; lon < 180; lon += 30) line(Array.from({ length: 91 }, (_, i) => spherePoint(lon, i * 2 - 90, 3.216)), 0x86bdca, globeGrid, 0.13);
  // Public simplified outline is used for positioning, not survey-grade boundaries.
  const footprint = regionBoundary;
  const shape = new THREE.Shape(footprint.map(([lon,lat]) => new THREE.Vector2(lon,lat)));
  const flat = new THREE.ShapeGeometry(shape), vertices = flat.attributes.position, positions = [];
  const subdivide = (a,b,c,depth) => {
    if (depth > 0) {
      const ab = a.clone().add(b).multiplyScalar(.5), bc = b.clone().add(c).multiplyScalar(.5), ca = c.clone().add(a).multiplyScalar(.5);
      subdivide(a,ab,ca,depth-1); subdivide(ab,b,bc,depth-1); subdivide(ca,bc,c,depth-1); subdivide(ab,bc,ca,depth-1);
    } else for (const p of [a,b,c]) positions.push(...spherePoint(p.x,p.y,3.228).toArray());
  };
  const indices = flat.index.array;
  for (let i=0;i<indices.length;i+=3) subdivide(...[indices[i],indices[i+1],indices[i+2]].map(n=>new THREE.Vector2(vertices.getX(n),vertices.getY(n))),3);
  const fillGeo = new THREE.BufferGeometry(); fillGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  const footprintMesh=mesh(fillGeo,new THREE.MeshBasicMaterial({color:0xf28e80,transparent:true,opacity:.53,depthWrite:false,side:THREE.DoubleSide}),group);footprintMesh.castShadow=false;
  const footprintOutline=line([...footprint,footprint[0]].flatMap(([lon,lat],i,array)=>{
    if(i===array.length-1)return [spherePoint(lon,lat,3.24)];
    const next=array[i+1]; return Array.from({length:12},(_,j)=>spherePoint(THREE.MathUtils.lerp(lon,next[0],j/12),THREE.MathUtils.lerp(lat,next[1],j/12),3.24));
  }),0xffc1a1,group,.8);
  flat.dispose();
  // An annotated locating ring, not an administrative boundary.
  const center = spherePoint(84, 43, 3.235);
  const ring = mesh(new THREE.TorusGeometry(0.29, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: gold }), group);
  ring.position.copy(center);
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), center.clone().normalize());
  addPin(group, { name: '新疆 · 进入沙盘 →', lon: 84, lat: 43, action: 'terrain' }, () => spherePoint(84, 43, 3.46), 'large');
  windGroup = new THREE.Group(); group.add(windGroup); windGroup.visible = false;
  for (const lon of [25, 45, 65, 85, 105]) {
    const from = spherePoint(lon, 39, 3.28), to = spherePoint(lon + 12, 39, 3.28);
    const arrow = new THREE.ArrowHelper(to.clone().sub(from).normalize(), from, from.distanceTo(to), 0x99d2cf, 0.13, 0.09);
    windGroup.add(arrow);
  }
  const windGeometry = new THREE.BufferGeometry(); windGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(160*3),3));
  windGroup.add(new THREE.Points(windGeometry,new THREE.PointsMaterial({color:0xa9eee2,size:.034,transparent:true,opacity:.8,depthWrite:false})));
  const connections = new THREE.Group(); group.add(connections); connections.visible=false;
  for(const lat of [34,40]) line(Array.from({length:100},(_,i)=>spherePoint(25+i*.9,lat+Math.sin(i/99*Math.PI)*6,3.32)),gold,connections,.8);
  group.userData = {grid:globeGrid,wind:windGroup,windGeometry,connections,footprint:footprintMesh,footprintOutline,locatingRing:ring};
  return group;
}

function waterCurve(dem,lon,lat,exaggeration,dimensions,lakeHeight) {
  const points=[];
  const shoreLon=lon>88.13?88.132:88.128,shoreLat=lat>43.89?43.903:43.878;
  for(let i=0;i<=48;i++){
    const t=i/48,bend=Math.sin(t*Math.PI)*Math.sin(t*Math.PI*3)*.0013;
    const p=new THREE.Vector3(...terrainPoint(dem,THREE.MathUtils.lerp(lon,shoreLon,t)+bend,THREE.MathUtils.lerp(lat,shoreLat,t),exaggeration,dimensions));
    p.y+=.075;if(t>.88)p.y=THREE.MathUtils.lerp(p.y,lakeHeight+.04,smoothStep((t-.88)/.12));points.push(p);
  }
  return new THREE.CatmullRomCurve3(points,false,'centripetal');
}

function createTerrain(dem, local = false, withLake = local, exaggeration = local ? state.localExaggeration : state.exaggeration) {
  const group = new THREE.Group();
  if(!local&&regionalDisplayDEM)dem=regionalDisplayDEM;
  const dimensions = terrainDimensions(dem);
  const reused=!local&&!!regionalGeometry;
  const geo = reused?regionalGeometry:new THREE.PlaneGeometry(dimensions.width, dimensions.depth, dem.cols - 1, dem.rows - 1);
  if(!reused)geo.rotateX(-Math.PI / 2);
  const colors = reused?null:new Float32Array(dem.heights.length * 3);
  for (let i = 0; !reused&&i < dem.heights.length; i++) {
    const row=Math.floor(i/dem.cols),col=i%dem.cols;
    // Multi-scale sky occlusion uses actual DEM neighbours, independent of exaggeration.
    const shade=cavityShade(dem,row,col);
    new THREE.Color(shade,shade,shade).toArray(colors,i*3);
  }
  if(!reused)geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  if(!local&&!reused) {
    const [w,s,e,n]=dem.bounds,focus=new Float32Array(dem.heights.length);
    // Scanline the public outline once per row; do not ray-test millions of vertices.
    for(let row=0;row<dem.rows;row++){const lat=n+(s-n)*row/(dem.rows-1),crossings=[];for(let i=0,j=regionBoundary.length-1;i<regionBoundary.length;j=i++){const a=regionBoundary[i],b=regionBoundary[j];if((a[1]>lat)!==(b[1]>lat))crossings.push((b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0]);}crossings.sort((a,b)=>a-b);let k=0;for(let col=0;col<dem.cols;col++){const lon=w+(e-w)*col/(dem.cols-1);while(k<crossings.length&&lon>crossings[k])k++;focus[row*dem.cols+col]=k%2;}}
    geo.setAttribute('regionFocus',new THREE.BufferAttribute(focus,1));
  }
  const texture=local?(dem.name==='glacier-focus'?glacierFocusTexture:dem===glacierDEM?glacierTexture:localTexture):regionalTexture;
  const mat=!local&&regionalMaterial?regionalMaterial:surfaceMaterial(0xffffff, { vertexColors: true, map: texture, side: THREE.DoubleSide },dem.name==='glacier-focus'?'glacier-imagery':local?'imagery':'regional');
  const surface = mesh(geo, mat, group);
  if(!local){regionalGeometry=geo;regionalMaterial=mat;}
  group.userData = { dem, dimensions, surface, local, exaggeration };
  // Close the DEM sides with a rock cut. The slab is a display support, not data.
  const perimeter = [];
  for (let col = 0; col < dem.cols; col++) perimeter.push(col);
  for (let row = 1; row < dem.rows; row++) perimeter.push(row * dem.cols + dem.cols - 1);
  for (let col = dem.cols - 2; col >= 0; col--) perimeter.push((dem.rows - 1) * dem.cols + col);
  for (let row = dem.rows - 2; row > 0; row--) perimeter.push(row * dem.cols);
  const sideGeo = new THREE.BufferGeometry();
  sideGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(perimeter.length * 6 * 3), 3));
  group.userData.perimeter = perimeter;
  group.userData.sides = mesh(sideGeo, surfaceMaterial(local ? 0x83775d : 0x82745a), group);
  group.userData.foundation=mesh(new THREE.BoxGeometry(dimensions.width + 0.04, 0.12, dimensions.depth + 0.04), surfaceMaterial(0x554b3b), group, [0, -0.60, 0]);
  if(!local){
   const outline=locatingFootprint.map(([lon,lat])=>{const p=new THREE.Vector3(...terrainPoint(dem,lon,lat,exaggeration,dimensions));p.y+=.045;return p;});outline.push(outline[0].clone());
   group.userData.storyOutline=line(outline,0xd7c187,group,.85);group.userData.storyOutline.visible=false;
  }
  // Leave the landscape floating in space, as in the reference presentation.
  if (withLake) {
    const shape = new THREE.Shape();
    // Recognisable teaching footprint, deliberately independent of measured shoreline.
    [[-.14, -.7], [.12, -.59], [.25, -.32], [.18, -.03], [.30, .16], [.13, .64], [-.03, .76], [-.18, .48], [-.2, .13], [-.28, -.3]].forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const lake = mesh(new THREE.ShapeGeometry(shape), surfaceMaterial(0x247f91, { metalness: 0.25, roughness: 0.20, side: THREE.DoubleSide },'water'), group);
    lake.rotation.x = -Math.PI / 2;
    lake.scale.setScalar(38000 / dimensions.widthMetres);
    group.userData.lake = lake;
    lake.visible=false;
    const waterPaths = new THREE.Group(); group.add(waterPaths); waterPaths.visible=false;
    const flows=[];
    for(const [lon,lat] of [[88.17,43.84],[88.09,43.84],[88.16,43.92],[88.09,43.92]]) {
      const curve=waterCurve(dem,lon,lat,group.userData.exaggeration,dimensions,(1910-dem.min)/dimensions.widthMetres*16*group.userData.exaggeration+.035);
      const pathLine=mesh(new THREE.TubeGeometry(curve,96,.018,6,false),surfaceMaterial(0x61c3cf,{roughness:.35},'water'),waterPaths);
      const beads=[];
      for(let i=0;i<5;i++){const bead=mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:0xb5ffff}),waterPaths);bead.scale.z=2.2;beads.push(bead);}
      flows.push({curve,beads,pathLine,lon,lat});
    }
    group.userData.waterPaths=waterPaths; group.userData.flows=flows;
    addPin(group, { name: '天山天池', lon: 88.124, lat: 43.889, kind: '真实影像 · 2024.09.04', description: '湖水、林地和裸岩来自 Sentinel-2 的 10 米真彩色观测，按经纬度贴到真实高程。汇流示意可单独开启；影像是固定日期，不能用于读取水深或实时水位。' }, () => {
      const p = new THREE.Vector3(...terrainPoint(dem, 88.124, 43.889, group.userData.exaggeration, dimensions));
      p.y += .22;
      return p;
    }, 'large');
    addPin(group, { name: '山地与沟谷', lon: 88.177, lat: 43.85, kind: '地形观察', description: '旋转沙盘观察山脊与沟谷。该网格经过抽样和高度夸张；局部形态不等于原始 DEM 的完整分辨率。' }, () => {
      const p = new THREE.Vector3(...terrainPoint(dem, 88.177, 43.85, group.userData.exaggeration, dimensions)); p.y += 0.2; return p;
    }, 'landscape');
  }
  updateTerrain(group);
  return group;
}

function updateTerrain(group) {
  const { dem, dimensions, surface, perimeter, sides, lake, exaggeration } = group.userData;
  const position = surface.geometry.attributes.position;
  for (let i = 0; i < dem.heights.length; i++) position.setY(i, (dem.heights[i] - dimensions.origin) / dimensions.widthMetres * dimensions.width * exaggeration);
  position.needsUpdate = true;
  surface.geometry.computeVertexNormals();surface.geometry.computeBoundingSphere();surface.geometry.computeBoundingBox();
  delete group.userData.shotPoses;
  const positions = sides.geometry.attributes.position;
  let cursor = 0;
  for (let i = 0; i < perimeter.length; i++) {
    const a = perimeter[i], b = perimeter[(i + 1) % perimeter.length];
    for (const [index, floor] of [[a, false], [a, true], [b, false], [b, false], [a, true], [b, true]]) {
      positions.setXYZ(cursor++, position.getX(index), floor ? -0.54 : position.getY(index), position.getZ(index));
    }
  }
  positions.needsUpdate = true;
  sides.geometry.computeVertexNormals(); sides.geometry.computeBoundingSphere();
  if (lake) {
    lake.position.set(...terrainPoint(dem, 88.13, 43.89, exaggeration, dimensions));
    lake.position.y = (1910 - dimensions.origin) / dimensions.widthMetres * dimensions.width * exaggeration + 0.035;
    for(const flow of group.userData.flows||[]) {
      flow.curve=waterCurve(dem,flow.lon,flow.lat,exaggeration,dimensions,lake.position.y);
      flow.pathLine.geometry.dispose();flow.pathLine.geometry=new THREE.TubeGeometry(flow.curve,96,.018,6,false);
    }
  }
  if (renderer) renderer.shadowMap.needsUpdate = true;
}

function addRegionalPins(group) {
  for (const data of places) addPin(group, data, () => {
    const p = new THREE.Vector3(...terrainPoint(terrainDEM, data.lon, data.lat, group.userData.exaggeration, group.userData.dimensions)); p.y += data.landscape ? 0.12 : 0.27; return p;
  }, data.landscape ? 'landscape' : '');
}

function createHistory() {
  const group = createTerrain(terrainDEM,false,false,22);
  group.userData.pinMarkers = true;
  for (const [i, stop] of routeStops.entries()) addPin(group, { ...stop, routeIndex: i }, () => {
    const p = new THREE.Vector3(...terrainPoint(terrainDEM, stop.lon, stop.lat, group.userData.exaggeration)); p.y += 0.22; return p;
  });
  routePoints = [];
  for (let segment = 0; segment < routeStops.length - 1; segment++) {
    const a = routeStops[segment], b = routeStops[segment + 1];
    for (let j = 0; j < 60; j++) {
      const t = j / 60, lon = THREE.MathUtils.lerp(a.lon, b.lon, t), lat = THREE.MathUtils.lerp(a.lat, b.lat, t);
      const point = new THREE.Vector3(...terrainPoint(terrainDEM, lon, lat, group.userData.exaggeration));
      point.y += 0.11; routePoints.push(point);
    }
  }
  const stop = routeStops.at(-1);
  const end = new THREE.Vector3(...terrainPoint(terrainDEM, stop.lon, stop.lat, group.userData.exaggeration)); end.y += 0.11; routePoints.push(end);
  line(routePoints, 0x877751, group, 0.48);
  routeLine = line(routePoints, 0xffd692, group);
  traveler = mesh(new THREE.SphereGeometry(0.10, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe5b5 }), group);
  const halo = mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.14, depthWrite: false }), traveler);
  halo.castShadow = false;
  return group;
}

function updateRoute(showDetails = false,phase=visual.route) {
  if (!routeLine) return;
  const fraction = phase / 100;
  const index = Math.min(routePoints.length - 1, fraction * (routePoints.length - 1));
  const low = Math.floor(index), high = Math.min(low + 1, routePoints.length - 1);
  routeLine.geometry.setDrawRange(0, low + 1);
  traveler.position.copy(routePoints[low]).lerp(routePoints[high], index - low);
  $('route-progress')?.setAttribute('aria-valuetext', `行程 ${Math.round(state.route)}%`);
  if ($('route-progress')) $('route-progress').value = state.route;
  if ($('route-output')) $('route-output').textContent = `${Math.round(state.route)}%`;
  if ($('route-play')) $('route-play').textContent = state.playing ? 'Ⅱ 暂停行程' : state.route >= 100 ? '↺ 重播行程' : '▷ 播放行程';
  const stopIndex = Math.min(routeStops.length - 1, Math.floor((showDetails?state.route/100:fraction) * (routeStops.length - 1) + 0.025));
  if (stopIndex !== lastStop) {
    lastStop = stopIndex;
    const stop = routeStops[stopIndex];
    if ($('route-station')) $('route-station').textContent = `${String(stopIndex + 1).padStart(2, '0')} / ${stop.name}`;
    if (state.playing || showDetails || (state.route>=100&&stopIndex===routeStops.length-1)) {
      const pin = pins.find(pin => pin.group === active && pin.data.name === stop.name);
      showPlace(stop, pin?.button);
    }
  }
}

function createKarez() {
  const group = new THREE.Group(); group.userData.pinMarkers = false;
  const clipping = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const profile = [[-7.5, 4.07], [-3, 3.08], [4.5, .28], [7.5, .1]];
  const surfaceHeight = x => {
    let i = 0; while (i < profile.length - 2 && x > profile[i + 1][0]) i++;
    const [a, b] = [profile[i], profile[i + 1]];
    return THREE.MathUtils.lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0]));
  };
  const groundShape = (bottomOffset, topOffset) => {
    const shape = new THREE.Shape();
    const bottom = profile.map(([x, y]) => [x, bottomOffset === null ? -1.4 : y + bottomOffset]);
    bottom.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    [...profile].reverse().forEach(([x, y]) => shape.lineTo(x, y + topOffset)); shape.closePath();
    return shape;
  };
  for (const [bottom, offset, color] of [[null, -1.16, 0x68716a], [-1.16, -.48, 0xa59170], [-.48, 0, 0xc6b28c]]) {
    const mat = surfaceMaterial(color, { clippingPlanes: [clipping], clipShadows: true, side: THREE.DoubleSide },'sediment'); cutMaterials.push(mat);
    const shape = groundShape(bottom, offset);
    mesh(new THREE.ExtrudeGeometry(shape, { depth: 5, bevelEnabled: false }), mat, group, [0, 0, -2.5]);
    cutFaces.push(mesh(new THREE.ShapeGeometry(shape), surfaceMaterial(color, { side: THREE.DoubleSide },'sediment'), group, [0, 0, .02]));
  }
  const soilTop = surfaceMaterial(0xb7a580, { clippingPlanes: [clipping], clipShadows: true }); cutMaterials.push(soilTop);
  for (let i = 0; i < 4; i++) {
    const x = -6.3 + i * 0.6;
    mesh(new THREE.ConeGeometry(0.8 - i * 0.12, 1.6 - i * 0.1, 6), soilTop, group, [x, 4.1 + (1.6 - i * 0.1) / 2, -1.4]);
  }
  const aquifer = mesh(new THREE.BoxGeometry(3.3, 0.34, 0.18), material(0x477c83, { transparent: true, opacity: 0.75 }), group, [-5.8, 0.55, 0.32]);
  aquifer.castShadow = false;
  const start = new THREE.Vector3(-6.75, 0.66, 0.43), end = new THREE.Vector3(5.5, 0.1, 0.43);
  const channel = new THREE.LineCurve3(start, end);
  mesh(new THREE.TubeGeometry(channel, 40, 0.16, 10, false), material(0x233d49), group);
  const water = mesh(new THREE.TubeGeometry(channel, 40, 0.05, 8, false), material(0x72d9d2, { emissive: 0x3a9da0, emissiveIntensity: 0.35 }), group);
  water.position.z = .20;
  for (const x of [-6.75, -4.35, -1.95, 0.45, 2.85, 5.25]) {
    const t = (x + 6.75) / 12.25, bottom = 0.66 - t * 0.56;
    const top = surfaceHeight(x) + .03;
    mesh(new THREE.CylinderGeometry(.17,.15,top-bottom,24,1,true),surfaceMaterial(0x66553e,{side:THREE.DoubleSide}),group,[x,(top+bottom)/2,.43]);
    const lip = mesh(new THREE.TorusGeometry(.21, .07, 10, 32), surfaceMaterial(0xb8a076), group, [x, top, .43]); lip.rotation.x = Math.PI / 2;
    const dark=mesh(new THREE.CircleGeometry(.15,24),material(0x171810),group,[x,top-.08,.43]);dark.rotation.x=-Math.PI/2;
  }
  const field = mesh(new THREE.BoxGeometry(2.2, .10, 3.6), material(0x6a9371), group, [5.5, .38, -0.2]);
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) mesh(new THREE.ConeGeometry(.06, .18, 5), material(col % 2 ? 0x9ab576 : 0x86aa65), field, [-.91 + col * .3, .12, -1.48 + row * .44]);
  }
  // Schematic open channel and reservoir at the daylight point.
  rod(new THREE.Vector3(5.5, .1, .43), new THREE.Vector3(7.5, .1, .43), .13, 0x4cacb3, group);
  const reservoir=mesh(new THREE.BoxGeometry(1.6, .5, 1.2), material(0xd4c29a), group, [7.3, -.07, .44]);
  pond = mesh(new THREE.BoxGeometry(1.42, .22, 1.03), surfaceMaterial(0x3b9fab, { roughness: .22 },'water'), group, [7.3, .22, .44]);
  mesh(new THREE.BoxGeometry(15.3, .30, 5.3), surfaceMaterial(0x534a3b), group, [0, -1.55, 0]);
  for (let i = 0; i < 36; i++) {
    const particle = mesh(new THREE.SphereGeometry(.065, 8, 6), new THREE.MeshBasicMaterial({ color: 0xb8ffff }), group);
    particle.userData.offset = i / 36; particle.castShadow = false; flowParticles.push(particle);
  }
  const details = [
    ['母井', [-6.75, 4.5, .43], '取水端', '连接地下含水层。这里的来水与井深是结构示意，未对应某座真实坎儿井。'],
    ['竖井', [-1.95, 3.1, .43], '施工与维护', '竖井连接地面与暗渠，为施工、通风和清理提供通道。'],
    ['暗渠', [-.5, .9, .65], '地下水路', '地下通道依靠坡降输水，并减少水流暴露在地表的时间。'],
    ['明渠与蓄水池', [7.2, .95, .45], '地面利用', '水到达地面后进入明渠与蓄水池。模型为便于观察简化了地表出口的细节。'],
  ];
  for (const [name, position, kind, description] of details) addPin(group, { name, kind, description }, () => new THREE.Vector3(...position));
  group.userData.channel = channel;
  group.userData.clipping = clipping;
  group.userData.station=installKarezStation({group,channel,pond,reservoir,field,water,viewport,surfaceHeight});
  return group;
}

function createEcology() {
  const group=createTerrain(terrainDEM,false,false,22); group.userData.rings=[];
  const sites=[
    {name:'喀纳斯 · 森林与冰湖',lon:87.02,lat:48.70,description:'阿尔泰山地的保护地点，观察森林、湖泊、山谷与高山冰雪的空间关系。绿色光圈是定位提示。'},
    {name:'托木尔峰 · 高山冰雪',lon:80.18,lat:41.80,description:'天山西段高山地区的观察入口。定位为近似坐标，光圈不表示保护区边界。'},
    {name:'卡拉麦里 · 荒漠生境',lon:89.1,lat:45.4,description:'准噶尔盆地东部的荒漠生态观察点。沙盘未加载植被实测或野生动物分布数据。'},
  ];
  for(const data of sites) {
    const p=new THREE.Vector3(...terrainPoint(terrainDEM,data.lon,data.lat,group.userData.exaggeration));
    const ring=mesh(new THREE.TorusGeometry(.4,.017,8,64),new THREE.MeshBasicMaterial({color:0x98eac3,transparent:true,opacity:.85}),group,p.clone().add(new THREE.Vector3(0,.16,0)).toArray()); ring.rotation.x=-Math.PI/2;
    group.userData.rings.push(ring);
    addPin(group,{...data,kind:'生态观察 · 近似定位'},()=>p.clone().add(new THREE.Vector3(0,.25,0)));
  }
  return group;
}

function createYardang() {
  const group=new THREE.Group();group.userData.pinMarkers=false;
  const geometry=new THREE.PlaneGeometry(16,10,200,128);geometry.rotateX(-Math.PI/2);
  const mat=surfaceMaterial(0xc0a77c,{roughness:1,side:THREE.DoubleSide},'sediment');
  const erosionPhase={value:0};animateErosionMaterial(mat,erosionPhase);
  const initialPositions=geometry.attributes.position;
  for(let i=0;i<initialPositions.count;i++)initialPositions.setY(i,erosionHeight(initialPositions.getX(i),initialPositions.getZ(i),0));
  geometry.setAttribute('erosionWeight',new THREE.Float32BufferAttribute(new Float32Array(initialPositions.count).fill(1),1));
  geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const surface=mesh(geometry,mat,group);
  surface.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
  animateErosionMaterial(surface.customDepthMaterial,erosionPhase,true);
  // Keep the eroding surface joined to its cut sides throughout the GPU morph.
  const rim=[];
  for(let x=-8;x<=8;x+=.08)rim.push([x,-5]);
  for(let z=-4.92;z<=5;z+=.08)rim.push([8,z]);
  for(let x=7.92;x>=-8;x-=.08)rim.push([x,5]);
  for(let z=4.92;z>=-5;z-=.08)rim.push([-8,z]);
  const sidePositions=[],sideWeights=[];
  for(let i=0;i<rim.length;i++){
    const a=rim[i],b=rim[(i+1)%rim.length];
    for(const [point,weight] of [[a,1],[a,0],[b,1],[b,1],[a,0],[b,0]]){sidePositions.push(point[0],weight?erosionHeight(...point,0):-.39,point[1]);sideWeights.push(weight);}
  }
  const skirtGeometry=new THREE.BufferGeometry();skirtGeometry.setAttribute('position',new THREE.Float32BufferAttribute(sidePositions,3));skirtGeometry.setAttribute('erosionWeight',new THREE.Float32BufferAttribute(sideWeights,1));skirtGeometry.computeVertexNormals();
  const skirt=mesh(skirtGeometry,mat,group);skirt.customDepthMaterial=surface.customDepthMaterial;
  mesh(new THREE.BoxGeometry(16,.25,10),material(0x635844),group,[0,-.49,0]);
  const wind=new THREE.BufferGeometry();wind.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(200*3),3));
  group.add(new THREE.Points(wind,new THREE.PointsMaterial({color:0xe6c596,size:.04,transparent:true,opacity:.65,depthWrite:false})));
  group.userData={surface,wind,erosionPhase,pinMarkers:false};updateYardang(group);
  addPin(group,{name:'风向 →',kind:'风沙示意',description:'粒子沿模型的主风向移动。模型没有输入真实风速、降水或地层抗侵蚀参数。'},()=>new THREE.Vector3(-5,2.4,0),'large');
  addPin(group,{name:'土垄与沟槽',kind:'地貌形态',description:'拖动演变阶段，对比连续地表与分离土台。阶段不是实际年代，演变函数不是物理侵蚀方程。'},()=>new THREE.Vector3(3,2.2,1));
  return group;
}
function updateYardang(group,phase=visual.erosion) {
  group.userData.erosionPhase.value=phase/100;
  $('erosion-output')?.replaceChildren(document.createTextNode(phaseLabel(state.erosion)));
  if($('erosion-range'))$('erosion-range').value=state.erosion;
  if($('erosion-play'))$('erosion-play').textContent=state.eroding?'Ⅱ 暂停演变':'▷ 演变动画';
  renderer.shadowMap.needsUpdate=true;
}
function createMigration() {
  const group=createEarth();group.userData.wind.visible=false;group.userData.connections.visible=false;
  const anchors=[[123.43,41.8],[113,47],[96.85,47.75],[88,47],[81.2,44.0]],points=[];
  for(let s=0;s<anchors.length-1;s++)for(let i=0;i<50;i++) {
    const t=i/50;points.push(spherePoint(THREE.MathUtils.lerp(anchors[s][0],anchors[s+1][0],t),THREE.MathUtils.lerp(anchors[s][1],anchors[s+1][1],t),3.29));
  }
  points.push(spherePoint(81.2,44,3.29));
  line(points,0x997a65,group,.5);
  group.userData.migrationLine=line(points,0xffd39e,group);
  group.userData.migrationPoints=points;
  group.userData.migrationTraveler=mesh(new THREE.SphereGeometry(.07,16,12),new THREE.MeshBasicMaterial({color:0xffe7b8}),group);
  for(const [name,lon,lat,description] of [['盛京 · 1764',123.43,41.8,'近似定位到今天的沈阳一带。1764 年启程的年代依据国家民委历史沿革。'],['伊犁 · 1765',81.2,44,'近似定位到伊犁一带。1765 年抵达；这条连接曲线只表示迁移方向。']])addPin(group,{name,lon,lat,kind:'迁移历史',description},()=>spherePoint(lon,lat,3.5));
  updateMigration(group);return group;
}
function updateMigration(group=active,phase=visual.migration) {
  const points=group.userData.migrationPoints;
  if(!points)return;
  const index=Math.min(points.length-1,phase/100*(points.length-1)),low=Math.floor(index);
  group.userData.migrationLine.geometry.setDrawRange(0,low+1);
  group.userData.migrationTraveler.position.copy(points[low]).lerp(points[Math.min(low+1,points.length-1)],index-low);
  if($('migration-range'))$('migration-range').value=state.migration;
  if($('migration-output'))$('migration-output').textContent=`${Math.round(state.migration)}%`;
  if($('migration-play'))$('migration-play').textContent=state.migrating?'Ⅱ 暂停西行':'▷ 播放西行';
}
function createGlacier() {
  const dem=focusGlacierDEM(glacierDEM),window=textureWindow(glacierDEM.bounds,dem.bounds);
  glacierFocusTexture=glacierTexture.clone();glacierFocusTexture.offset.fromArray(window.offset);glacierFocusTexture.repeat.fromArray(window.repeat);glacierFocusTexture.needsUpdate=true;
  const group=createTerrain(dem,true,false);group.userData.exaggeration=1.25;updateTerrain(group);
  const {surface}=group.userData,source=surface.geometry.attributes.position;
  // Conceptual branches near the annotated glacier, not a measured outline.
  const iceWidth=.75;
  const branches=glacierBranches.map(path=>new THREE.CatmullRomCurve3(path.map(([lon,lat])=>{const p=new THREE.Vector3(...terrainPoint(dem,lon,lat,group.userData.exaggeration));p.y=0;return p;})));
  const paths=branches.map(c=>c.getPoints(90)),metrics=[];
  for(let i=0;i<source.count;i++) {
    let distanceSquared=Infinity,along=0;
    const x=source.getX(i),z=source.getZ(i);
    for(const path of paths)for(let n=0;n<path.length;n++) {const dx=x-path[n].x,dz=z-path[n].z,d=dx*dx+dz*dz;if(d<distanceSquared){distanceSquared=d;along=n/(path.length-1);}}
    metrics.push({distance:Math.sqrt(distanceSquared),along});
  }
  const iceGeo=surface.geometry.clone(),icePosition=iceGeo.attributes.position;
  for(let i=0;i<icePosition.count;i++)icePosition.setY(i,source.getY(i)+.13);
  iceGeo.computeVertexNormals();
  iceGeo.setAttribute('iceMetric',new THREE.Float32BufferAttribute(metrics.flatMap(m=>[m.distance,m.along]),2));
  const icePhase={value:0}, iceMaterial=surfaceMaterial(0xd9edf0,{roughness:.46,metalness:.05,side:THREE.DoubleSide},'ice');
  const applyMask=(shader,depth=false)=>{
    shader.uniforms.icePhase=icePhase;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 iceMetric;varying vec2 iceCoords;uniform float icePhase;').replace('#include <begin_vertex>','#include <begin_vertex>\niceCoords=iceMetric;transformed.y-=icePhase*.045;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 iceCoords;uniform float icePhase;');
    const mask=`float width=.75*(.38+.62*pow(max(0.,sin(3.14159265*clamp(iceCoords.y+.08,0.,1.))),.45))*(1.-icePhase*.36);float edge=min((width-iceCoords.x)*22.,(1.-icePhase*.46-iceCoords.y)*35.);if(edge<0.)discard;`;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>\n${mask}`);
    if(!depth)shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(vec3(.34,.56,.59),diffuseColor.rgb,smoothstep(0.,1.,edge));');
  };
  const detailCompile=iceMaterial.onBeforeCompile;
  iceMaterial.onBeforeCompile=shader=>{detailCompile(shader);applyMask(shader);};
  iceMaterial.customProgramCacheKey=()=> 'xinjiang-retreat-ice-2';
  const ice=mesh(iceGeo,iceMaterial,group);
  ice.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
  ice.customDepthMaterial.onBeforeCompile=shader=>applyMask(shader,true);
  ice.customDepthMaterial.customProgramCacheKey=()=> 'xinjiang-retreat-depth-2';
  group.userData.icePhase=icePhase;
  group.userData.ice=ice;group.userData.iceMetrics=metrics;group.userData.allIceTriangles=Array.from(surface.geometry.index.array);
  const initial=[];
  for(let i=0;i<group.userData.allIceTriangles.length;i+=3){const tri=group.userData.allIceTriangles.slice(i,i+3);if(tri.every(n=>metrics[n].distance<iceHalfWidth(metrics[n].along)&&metrics[n].along<1))initial.push(...tri);}
  const edges=new Map();
  for(let i=0;i<initial.length;i+=3)for(const [a,b] of [[initial[i],initial[i+1]],[initial[i+1],initial[i+2]],[initial[i+2],initial[i]]]){const id=[Math.min(a,b),Math.max(a,b)].join(',');edges.set(id,(edges.get(id)||0)+1);}
  const outline=[];
  for(const [id,count] of edges)if(count===1)for(const n of id.split(',').map(Number))outline.push(icePosition.getX(n),icePosition.getY(n)+.03,icePosition.getZ(n));
  const outlineGeo=new THREE.BufferGeometry();outlineGeo.setAttribute('position',new THREE.Float32BufferAttribute(outline,3));
  const ghost=new THREE.LineSegments(outlineGeo,new THREE.LineBasicMaterial({color:0x9dc8cb,transparent:true,opacity:.55,depthWrite:false}));group.add(ghost);group.userData.ghost=ghost;
  const flowGroup=new THREE.Group();group.add(flowGroup);flowGroup.visible=false;
  const flows=branches.map(branch=>{
    const sampled=branch.getPoints(80).map(p=>{const [w,s,e,n]=dem.bounds,{width,depth}=group.userData.dimensions;const lon=w+(p.x+width/2)/width*(e-w),lat=n-(p.z+depth/2)/depth*(n-s);p.y=terrainPoint(dem,lon,lat,group.userData.exaggeration)[1]+.24;return p;});
    const curve=new THREE.CatmullRomCurve3(sampled,false,'centripetal');
    line(sampled,0x96e1dd,flowGroup,.6);
    const arrows=[];
    for(let j=0;j<6;j++){const arrow=mesh(new THREE.ConeGeometry(.065,.23,7),new THREE.MeshBasicMaterial({color:0xc4ffef}),flowGroup);arrow.castShadow=false;arrows.push(arrow);}
    return {curve,arrows};
  });
  const snowGeo=new THREE.BufferGeometry();snowGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(72*3),3));
  const snow=new THREE.Points(snowGeo,new THREE.PointsMaterial({color:0xf0fbff,size:.038,transparent:true,opacity:.7,depthWrite:false}));group.add(snow);snow.visible=false;
  group.userData.flowGroup=flowGroup;group.userData.flows=flows;group.userData.snow=snow;
  group.userData.showGhost=true;
  group.userData.teaching=false;
  updateGlacier(group);
  addPin(group,{name:'乌鲁木齐一号冰川',lon:86.817,lat:43.10,kind:'真实影像 · 2023.08.31',description:'冰雪、裸岩和冰碛地表来自 Sentinel-2 真彩色观测，地形来自真实高程。可叠加独立教学冰体观察退缩原理；底图固定在拍摄日期，动画不代表历年遥感变化。'},()=>{const p=new THREE.Vector3(...terrainPoint(dem,86.817,43.10,group.userData.exaggeration));p.y+=.25;return p;},'large');
  for(const [name,lon,lat,description] of [
    ['上游冰雪 · 观察',86.804,43.103,'白色地表来自观测。这里的标签帮助定位观察，积累区与平衡线需要独立的实测数据。'],
    ['下游方向 · 示意',86.811,43.114,'教学路径由较高处通向较低处。实际流向与速度需要多期影像或现场观测。']
  ])addPin(group,{name,lon,lat,kind:'空间阅读',description},()=>{const p=new THREE.Vector3(...terrainPoint(dem,lon,lat,group.userData.exaggeration));p.y+=.28;return p;});
  return group;
}
function updateGlacier(group=active,phase=visual.retreat) {
  const {ice,icePhase}=group.userData;if(!ice)return;
  icePhase.value=phase/100;
  if($('retreat-range'))$('retreat-range').value=state.retreat;
  if($('retreat-output'))$('retreat-output').textContent=`${Math.round(state.retreat)}%`;
  renderer.shadowMap.needsUpdate=true;
}

function setTeachingLayers(enabled) {
  active.userData.teaching=enabled;
  if(state.key==='local') {
    active.userData.lake.visible=enabled;
    active.userData.waterPaths.visible=enabled;
  } else if(state.key==='glacier') {
    active.userData.ice.visible=enabled;
    active.userData.ghost.visible=enabled&&active.userData.showGhost;
    $('ghost-toggle').disabled=!enabled;
    if(!enabled) {state.glacierPlaying=false;state.experiment=false;}
    active.userData.flowGroup.visible=enabled&&state.glacierMode!=='observation';
    active.userData.snow.visible=enabled&&state.glacierMode==='experiment';
  }
  if($('teaching-toggle'))$('teaching-toggle').checked=enabled;
  viewport.dataset.layer=enabled?'imagery-and-teaching':'imagery';
  $('model-note').textContent=enabled?`${catalog[state.key].note} · 已叠加教学示意`:catalog[state.key].note;
  renderer.shadowMap.needsUpdate=true;
}

function setGlacierMode(mode) {
  state.glacierMode=mode;
  setTeachingLayers(mode!=='observation');
  viewport.dataset.glacierMode=mode;
  document.querySelectorAll('#scene-controls [data-glacier-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.glacierMode===mode)));
  $('budget-lab').hidden=mode!=='experiment';
  $('glacier-locator').hidden=state.shot>0||mode!=='observation';
  $('retreat-range').disabled=mode==='observation';
}
function updateGlacierStation() {
  const signature=[state.shot,state.glacierMode,state.experiment,state.storyPlaying,state.accumulation,state.ablation,Math.round(state.retreat)].join('/');
  if(signature===stationSignature)return;stationSignature=signature;
  const mode=state.glacierMode;
  $('station-title').textContent=mode==='experiment'?'冰雪收支试验':mode==='flow'?'观察冰体与流动':'冰谷观察站';
  $('station-copy').textContent=mode==='experiment'?'试一试让积累更强，或让消融更强。参数只控制教学冰体的显示响应。':mode==='flow'?'青色路径与移动光点是方向示意。初始轮廓保留，真实底图固定。':state.shot===0?'地球 → 新疆 → 天山 → 冰谷。右图只表示位置，完整地形在主视野中展开。':'沿山脊、冰雪和冰碛观察空间关系。拖动接管镜头，点击地点查看高程。';
  $('station-boundary').textContent=mode==='observation'?'真实观测 · 地形高度显示 1.25×':'教学冰体 / 流动 / 试验 · 无年份与速率标定';
  $('retreat-output').textContent=`${Math.round(state.retreat)}%`;
  if(mode==='experiment'){
    for(const field of ['accumulation','ablation']){$(`${field}-range`).value=state[field];$(`${field}-output`).textContent=state[field];$(`${field}-bar`).style.width=`${state[field]}%`;}
    $('budget-caption').textContent=budgetCaption(state.accumulation,state.ablation);
    $('experiment-play').textContent=state.experiment?'Ⅱ 暂停试验':'▷ 运行试验';$('experiment-play').setAttribute('aria-pressed',String(state.experiment));
    if(!state.storyPlaying){$('lesson-title').textContent='把收支条件交给你。';$('lesson-body').textContent=`${budgetCaption(state.accumulation,state.ablation)}。调整两个强度，运行或暂停试验。滑块无物理单位，显示响应不代表真实冰川预测。`;$('journey-caption').textContent='改变条件，观察教学冰体的响应。';}
  }
}

function controlsMarkup(key) {
  if (key === 'earth') return '<div class="control-copy"><b>真实影像 · 立体球体</b><small>NASA Blue Marble / 2004.06</small></div><label class="toggle-control"><input id="grid-toggle" type="checkbox" checked> 经纬参考线</label><label class="toggle-control"><input id="wind-toggle" type="checkbox"> 西风示意</label><button class="detail-button" id="enter-region">走进新疆 →</button>';
  if (key === 'terrain' || key === 'local') {
    const local = key === 'local', value = local ? state.localExaggeration : state.exaggeration;
    const dem=local?localDEM:terrainDEM;
    return `<div class="control-copy"><b>${local ? 'Sentinel-2 · 真实纹理' : '真实影像 × 高程'}</b><small>${local ? '2024.09.04 / 原始 10 m' : `${dem.cols} × ${dem.rows} 高程采样`}</small></div><label class="range-control"><span class="range-heading">高度夸张 <output id="height-output">${value}×</output></span><input id="height-range" aria-label="高度夸张" type="range" min="1" max="${local ? 4 : 70}" step="${local ? .1 : 1}" value="${value}"></label><label class="toggle-control"><input id="labels-toggle" type="checkbox" ${state.labels ? 'checked' : ''}> 地点标记</label>${local ? '<label class="toggle-control"><input id="teaching-toggle" type="checkbox"> 湖面与汇流示意</label>' : ''}`;
  }
  if (key === 'history') return '<div class="control-copy"><b>丝路南缘廊道 · 示意</b><small id="route-station">01 / 敦煌</small></div><button class="play-button" id="route-play">▷ 播放行程</button><label class="range-control"><span class="range-heading">行程进度 <output id="route-output">0%</output></span><input id="route-progress" aria-label="行程进度" type="range" min="0" max="100" step="0.1" value="0"></label>';
  if(key==='ecology')return '<div class="control-copy"><b>山地与生境</b><small>定位提示 · 无保护区边界</small></div><label class="toggle-control"><input id="ecology-toggle" type="checkbox" checked> 保护地点光圈</label><button class="detail-button" id="ecology-observe">观察喀纳斯 →</button>';
  if(key==='yardang')return `<div class="control-copy"><b>风与水的刻画</b><small>程序地貌 · 无年代标定</small></div><label class="range-control"><span class="range-heading">演变阶段 <output id="erosion-output">${phaseLabel(state.erosion)}</output></span><input id="erosion-range" aria-label="雅丹演变阶段" type="range" min="0" max="100" value="${state.erosion}"></label><button class="play-button" id="erosion-play">▷ 演变动画</button>`;
  if(key==='migration')return `<div class="control-copy"><b>1764 → 1765</b><small>迁移方向 · 教学弧线</small></div><button class="play-button" id="migration-play">▷ 播放西行</button><label class="range-control"><span class="range-heading">叙事进度 <output id="migration-output">${Math.round(state.migration)}%</output></span><input id="migration-range" aria-label="西迁叙事进度" type="range" min="0" max="100" value="${state.migration}"></label>`;
  if(key==='glacier')return `<div class="glacier-views" role="group" aria-label="冰谷观察模式"><button data-glacier-mode="observation">真实地表</button><button data-glacier-mode="flow">流动示意</button><button data-glacier-mode="experiment">变化试验</button></div><label class="range-control"><span class="range-heading">示意收缩 <output id="retreat-output">0%</output></span><input id="retreat-range" aria-label="冰川退缩阶段" type="range" min="0" max="100" value="${state.retreat}"></label><label class="toggle-control"><input id="ghost-toggle" type="checkbox" checked> 初始轮廓</label><button class="detail-button" id="glacier-evidence">选景与依据 ↗</button>`;
  return `<div class="control-copy"><b>坎儿井 · 结构示意</b><small>动画模型 / 非水文模拟</small></div><label class="toggle-control"><input id="cutaway-toggle" type="checkbox" ${state.cutaway ? 'checked' : ''}> 打开剖面</label><label class="range-control"><span class="range-heading">来水强度 <output id="flow-output">${state.flow}%</output></span><input id="flow-range" aria-label="来水强度" type="range" min="0" max="100" step="1" value="${state.flow}"></label><button class="play-button" id="flow-play">Ⅱ 暂停水流</button>`;
}

function bindControls(key) {
  if(key==='local')$('teaching-toggle').addEventListener('change',event=>{pauseStory();setTeachingLayers(event.target.checked);describePhase(event.target.checked?state.retreat:-1);});
  if (key === 'earth') {
    $('grid-toggle').addEventListener('change', event => { active.userData.grid.visible = event.target.checked; });
    $('wind-toggle').addEventListener('change', event => { active.userData.wind.visible = event.target.checked; });
    $('enter-region').addEventListener('click', () => historyPlatform?historyPlatform.region():switchScene('terrain'));
  }
  if (key === 'terrain' || key === 'local') {
    $('height-range').addEventListener('input', event => {
      pauseStory();transition=null;
      const value = Number(event.target.value);
      if (key === 'local') state.localExaggeration = value; else state.exaggeration = value;
      active.userData.exaggeration = value;
      $('height-output').textContent = `${value}×`;
      updateTerrain(active);
    });
    $('labels-toggle').addEventListener('change', event => { state.labels = event.target.checked; });
  }
  if (key === 'history') {
    lastStop = -1; updateRoute();
    $('route-play').addEventListener('click', () => {
      pauseStory();
      if (state.route >= 100) { state.route = 0; lastStop = -1; }
      state.playing = !state.playing;
      if (state.playing) {
        const index = Math.min(4, Math.floor(state.route / 25)), stop = routeStops[index];
        showPlace(stop, pins.find(pin => pin.group === active && pin.data.name === stop.name)?.button);
      }
      updateRoute();
    });
    $('route-progress').addEventListener('input', event => { pauseStory();state.playing = false; state.route = Number(event.target.value); lastStop = -1; updateRoute(true); });
  }
  if (key === 'karez') {
    setCutaway();
    $('cutaway-toggle').addEventListener('change', event => { state.cutaway = event.target.checked; setCutaway(); });
    $('flow-range').addEventListener('input', event => { state.flow = Number(event.target.value); $('flow-output').textContent = `${state.flow}%`; });
    $('flow-play').textContent = state.flowing ? 'Ⅱ 暂停水流' : '▷ 播放水流';
    $('flow-play').addEventListener('click', () => { state.flowing = !state.flowing; $('flow-play').dataset.manual = 'true'; $('flow-play').textContent = state.flowing ? 'Ⅱ 暂停水流' : '▷ 播放水流'; });
  }
  if(key==='ecology') {
    $('ecology-toggle').checked=active.userData.rings.every(r=>r.visible);
    $('ecology-toggle').addEventListener('change',event=>active.userData.rings.forEach(r=>r.visible=event.target.checked));
    $('ecology-observe').addEventListener('click',()=>setShot(1));
  }
  if(key==='yardang') {
    $('erosion-range').addEventListener('input',event=>{pauseStory();state.eroding=false;state.erosion=Number(event.target.value);describePhase(state.erosion);updateYardang(active);});
    $('erosion-play').addEventListener('click',()=>{pauseStory();if(state.erosion>=100)state.erosion=0;state.eroding=!state.eroding;updateYardang(active);});
  }
  if(key==='migration') {
    $('migration-range').addEventListener('input',event=>{pauseStory();state.migrating=false;state.migration=Number(event.target.value);updateMigration();});
    $('migration-play').addEventListener('click',()=>{pauseStory();if(state.migration>=100)state.migration=0;state.migrating=!state.migrating;updateMigration();});
  }
  if(key==='glacier') {
    stationSignature='';
    $('glacier-station').innerHTML=glacierStationMarkup();
    document.querySelectorAll('#scene-controls [data-glacier-mode]').forEach(button=>button.addEventListener('click',()=>{pauseStory();const phase=state.retreat;if(workbenchMode)setGlacierMode(button.dataset.glacierMode);else setShot({observation:1,flow:2,experiment:3}[button.dataset.glacierMode]);state.retreat=phase;updateGlacierStation();}));
    $('retreat-range').addEventListener('input',event=>{pauseStory();state.experiment=false;if(state.glacierMode==='observation')setGlacierMode('flow');state.retreat=Number(event.target.value);updateGlacier();updateGlacierStation();});
    $('ghost-toggle').checked=active.userData.showGhost;
    $('ghost-toggle').addEventListener('change',event=>{active.userData.showGhost=event.target.checked;active.userData.ghost.visible=event.target.checked&&active.userData.teaching;});
    for(const [id,field] of [['accumulation-range','accumulation'],['ablation-range','ablation']])$(id).addEventListener('input',event=>{pauseStory();state[field]=Number(event.target.value);updateGlacierStation();});
    $('experiment-play').addEventListener('click',()=>{pauseStory();state.experiment=!state.experiment;updateGlacierStation();});
    $('experiment-reset').addEventListener('click',()=>{pauseStory();state.experiment=false;state.accumulation=40;state.ablation=80;state.retreat=0;updateGlacierStation();});
    $('glacier-evidence').addEventListener('click',()=>{pauseStory();location.href='./explorations.html#imagery';});
  }
}

function setCutaway() {
  if(state.key!=='karez')return;
  active.userData.cutTarget=state.cutaway?0:2.55;
  cutMaterials.forEach(mat=>{mat.clippingPlanes=[active.userData.clipping];mat.needsUpdate=true;});
  if($('cutaway-toggle'))$('cutaway-toggle').checked=state.cutaway;
  renderer.shadowMap.needsUpdate=true;
}

function sceneBackground(key) {
  if(['earth','migration'].includes(key))return new THREE.Color(0x04080d);
  if(backgrounds.has(key))return backgrounds.get(key);
  if(key==='journey'){const c=document.createElement('canvas');c.width=4;c.height=128;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#7d9da4');g.addColorStop(.6,'#d3c6a5');g.addColorStop(1,'#d8b885');x.fillStyle=g;x.fillRect(0,0,4,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;backgrounds.set(key,t);return t;}
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=144;
  const context=canvas.getContext('2d'),teaching=['yardang','karez'].includes(key);
  const gradient=context.createLinearGradient(0,0,0,144);
  gradient.addColorStop(0,teaching?'#292d2b':'#17212b');gradient.addColorStop(.58,teaching?'#77705e':'#4b514b');gradient.addColorStop(1,teaching?'#a79b81':'#666154');
  context.fillStyle=gradient;context.fillRect(0,0,256,144);
  if(!teaching){
    const texture=key==='local'?localTexture:key==='glacier'?glacierTexture:regionalTexture;
    // Reuse the credited observation only as a blurred atmospheric backdrop.
    context.filter='blur(18px) saturate(.35)';context.globalAlpha=.20;
    context.drawImage(texture.image,-24,-24,304,192);context.filter='none';context.globalAlpha=1;
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;
  backgrounds.set(key,texture);return texture;
}

function cameraHome(key) {
  if(workbenchMode)return workspaceHome();
  if(demo.active&&!demo.started&&key==='terrain'){const narrow=viewport.clientWidth<701,tall=viewport.clientWidth<1050;const target=new THREE.Vector3(0,.5,0),direction=new THREE.Vector3(.48,.73,.65).normalize(),aspect=viewport.clientWidth/viewport.clientHeight,tan=Math.tan(camera.fov*Math.PI/360);const distance=Math.max(25,17/(2*tan*aspect*(narrow?.90:tall?.60:.57)),13/(2*tan*(narrow?.32:tall?.43:.54)));return {position:target.clone().addScaledVector(direction,distance*(tall&&!narrow?1.30:1)),target,min:12,max:100};}
  const narrow=viewport.clientWidth<701,shot=demo.active&&demo.started?currentCue():stories[key][state.shot];
  if(demo.active&&!demo.started&&key==='earth')return {position:spherePoint(104,30,narrow?16.5:12.4),target:new THREE.Vector3(),min:6.4,max:38};
  if(shot.focus){const target=new THREE.Vector3(...terrainPoint(terrainDEM,...shot.focus,state.exaggeration,active.userData.dimensions));return {position:target.clone().add(new THREE.Vector3(2,shot.distance*.72,shot.distance)),target,min:4,max:85};}
  
  if(demo.active&&demo.started&&lived?.active){const pose=lived.pose,target=new THREE.Vector3(...pose.target),position=new THREE.Vector3(...(pose.position??pose.camera));const factor=narrow?(pose.overview?2:2.1):viewport.clientWidth<1050?1.23:1;if(factor>1)position.sub(target).multiplyScalar(factor).add(target);return {position,target,min:3,max:narrow?200:125};}
  if(shot.globe)return {position:spherePoint(shot.globe[0],shot.globe[1],narrow?shot.globe[2]*1.9:shot.globe[2]),target:new THREE.Vector3(0,0,0),min:6.4,max:38};
  const poseKey=`${state.shot}/${viewport.clientWidth}/${viewport.clientHeight}/${active?.userData.exaggeration}/${viewport.className}`;
  const poses=active.userData.shotPoses??=new Map();
  if(poses.has(poseKey))return poses.get(poseKey);
  const target=new THREE.Vector3(...shot.target),position=new THREE.Vector3(...shot.camera);
  if((shot.framing==='wide'||(narrow&&state.shot===0))&&active) {
    const bounds=new THREE.Box3().setFromObject(active),direction=position.clone().sub(target).normalize();
    const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize();
    const tan=Math.tan(camera.fov*Math.PI/360),aspect=viewport.clientWidth/viewport.clientHeight;
    const coverageX=narrow?.88:.75,coverageY=narrow?Math.max(.29,(viewport.clientHeight-465)/viewport.clientHeight):.68;
    const corners=[];
    if(active.userData.dem){
      const points=active.userData.surface.geometry.attributes.position,step=Math.max(1,Math.floor(points.count/2048));
      for(let i=0;i<points.count;i+=step)corners.push(new THREE.Vector3().fromBufferAttribute(points,i));
      for(const i of active.userData.perimeter)if(i%8===0)corners.push(new THREE.Vector3(points.getX(i),-.66,points.getZ(i)));
    } else for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])corners.push(new THREE.Vector3(x,y,z));
    let distance=position.distanceTo(target);
    for(const sample of corners) {
      const corner=sample.sub(target),depth=corner.dot(direction);
      distance=Math.max(distance,Math.abs(corner.dot(right))/(tan*aspect*coverageX)+depth,Math.abs(corner.dot(up))/(tan*coverageY)+depth);
    }
    position.copy(target).addScaledVector(direction,distance*1.035);
  } else if(narrow)position.sub(target).multiplyScalar(1.75).add(target);
  const pose={position,target,min:key==='karez'?4.5:7,max:narrow?130:85};poses.set(poseKey,pose);return pose;
}

function resetView(immediate = false) {
  demo.framingHeld=false;
  const home = cameraHome(state.key);
  orbit.minDistance = home.min; orbit.maxDistance = home.max;
  orbit.minPolarAngle = ['earth','migration'].includes(state.key) ? .05 : .12;
  orbit.maxPolarAngle = ['earth','migration'].includes(state.key) ? Math.PI - .05 : Math.PI / 2 - .03;
  if (immediate || reducedMotion) { camera.position.copy(home.position); orbit.target.copy(home.target); transition = null; }
  else transition = { start: performance.now(), duration:2600, from: camera.position.clone(), to: home.position, oldTarget: orbit.target.clone(), target: home.target, lift:['earth','migration'].includes(state.key)?.015:.06 };
  viewport.dataset.camera=transition?'moving':'settled';
  orbit.update();
}

function switchScene(key, immediate = false, keepPlayback = false) {
  if(workbench&&work.scene!==key&&!selectingWorkspace){selectWorkspace(key);return;}
  if (!lessons[key]) return;
  const previousKey=state.key,changed=!!active&&key!==previousKey;
  if(changed&&!immediate&&!reducedMotion) {
    // Freeze the actual outgoing WebGL frame and dissolve it over the incoming view.
    renderer.render(scene,camera);
    const frozen=$('transition-frame');frozen.width=viewport.clientWidth;frozen.height=viewport.clientHeight;
    frozen.getContext('2d').drawImage(renderer.domElement,0,0,frozen.width,frozen.height);
    frozen.style.opacity='1';frozen.style.display='block';
  }
  if(!keepPlayback)pauseStory();
  document.querySelector('.story-panel').scrollTop=0;
  state.playing=false;state.eroding=false;state.migrating=false;state.glacierPlaying=false;state.experiment=false;state.key=key;state.shot=0;state.elapsed=0;
  $('selection').hidden = true; $('selection').dataset.lastAction = 'scene-change'; $('source-panel').hidden = true; $('data-button').setAttribute('aria-expanded', 'false');
  pins.forEach(pin => pin.button.classList.remove('selected'));
  if (!groups.has(key)) {
    let group;
    if (key === 'earth') group = createEarth();
    else if (key === 'karez') group = createKarez();
    else if (key === 'history') group = createHistory();
    else if (key === 'journey') group = createEnvoyDesert();
    else if (key === 'ecology') group = createEcology();
    else if (key === 'yardang') group = createYardang();
    else if (key === 'migration') group = createMigration();
    else if (key === 'glacier') group = createGlacier();
    else { group = createTerrain(key === 'local' ? localDEM : terrainDEM, key === 'local'); if (key === 'terrain') addRegionalPins(group); }
    groups.set(key, group); scene.add(group);
  }
  groups.forEach((group, name) => { group.visible = name === key; });
  active = groups.get(key);
  resizeViewport?.();
  const planetary=['earth','migration'].includes(key);
  scene.fog=planetary?null:new THREE.FogExp2(0x171e20,.007);
  scene.background=sceneBackground(key);
  stars.visible=planetary;
  sun.color.set(planetary?0xfff2db:0xf5f5ef);sun.intensity=planetary?2.1:1.7;
  skyLight.intensity=planetary?1.1:1.55;fillLight.intensity=planetary?.45:.75;
  renderer.toneMappingExposure=planetary?1.08:1.12;
  $('glacier-station').hidden=key!=='glacier';
  if(key==='journey'){scene.fog=new THREE.FogExp2(0xd7bd96,.012);sun.color.set(0xffdfaf);sun.intensity=2.4;skyLight.intensity=1.15;fillLight.intensity=.55;renderer.toneMappingExposure=1.08;}
  if(key==='glacier'){sun.intensity=1.5;skyLight.intensity=1.35;renderer.toneMappingExposure=1.08;}
  if (['terrain','history','ecology'].includes(key)) { active.userData.exaggeration = key==='terrain'?state.exaggeration:22; updateTerrain(active); }
  document.querySelectorAll('.chapter-list [data-scene]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scene === key)));
  const lesson = lessons[key], index = order.indexOf(key);
  for (const [id, value] of Object.entries({ 'scene-title': lesson.title, 'top-scene': lesson.title, 'scene-kicker': lesson.kicker, 'scene-subtitle': lesson.subtitle, 'scale-badge': lesson.scale, 'lesson-kind': lesson.kind, 'lesson-title': lesson.heading, 'lesson-body': lesson.body, 'journey-caption': lesson.caption, 'source-text': lesson.source })) $(id).textContent = value;
  $('scene-kicker').textContent=`${String(index+1).padStart(2,'0')} / ${lesson.kicker.split('/').at(-1).trim()}`;
  $('lesson-kind').textContent=`${String(index+1).padStart(2,'0')} · ${lesson.scale}`;
  $('journey-step').textContent=`${String(index+1).padStart(2,'0')} / 09`;
  $('model-note').textContent=catalog[key].note;
  $('source-links').replaceChildren(...[...lesson.links, ['完整数据与代码致谢', './ATTRIBUTION.md']].map(([text, href]) => {
    const link = document.createElement('a'); link.textContent = text; link.href = href;
    link.target = '_blank'; link.rel = 'noopener noreferrer'; return link;
  }));
  $('scene-controls').innerHTML = controlsMarkup(key); bindControls(key);
  $('legend').hidden = !['terrain','local','history','ecology','glacier'].includes(key);
  const currentDEM=key==='local'?localDEM:key==='glacier'?active.userData.dem:terrainDEM;
  $('height-max').textContent=String(currentDEM.max);$('height-min').textContent=String(currentDEM.min);
  $('height-mid').textContent=String(Math.round((currentDEM.min+currentDEM.max)/2));
  viewport.dataset.scene = key;
  viewport.dataset.imagery=key==='local'?'tianchi-sentinel-20240904.jpg':key==='glacier'?'glacier-sentinel-20230831.jpg':'regional-or-global';
  delete viewport.dataset.layer;
  viewport.dataset.model = ['terrain','local','history','ecology','glacier'].includes(key)?'real-dem':['earth','migration'].includes(key)?'real-imagery':'procedural';
  renderShots();if(workbenchMode)resetView(immediate);else setShot(0,immediate);
  for(const field of Object.keys(visual))visual[field]=state[field];
  if(changed&&!immediate&&!reducedMotion) {
    // Enter from just outside the new view, never from the previous model's coordinates.
    const home=cameraHome(key),offset=home.position.clone().sub(home.target);
    camera.position.copy(home.target).add(offset.multiplyScalar(1.15));orbit.target.copy(home.target);
    resetView();sceneFade={start:performance.now(),duration:1050};renderer.domElement.style.opacity='0';viewport.dataset.blend='moving';
  } else {
    sceneFade=null;renderer.domElement.style.opacity='1';$('transition-frame').style.display='none';viewport.dataset.blend='settled';
  }
  renderer.shadowMap.needsUpdate = true;
  if(sceneFade){
    // Prepare the first GPU frame under the frozen image before starting the clock.
    // Cold shader compilation must not consume the entire dissolve interval.
    renderer.render(scene,camera);
    const ready=performance.now();sceneFade.start=ready;if(transition)transition.start=ready;
  }
}

function renderChapters() {
  $('chapter-list').replaceChildren(...order.map((key,index)=>{
    const button=document.createElement('button');button.dataset.scene=key;button.dataset.category=catalog[key].category;
    button.setAttribute('aria-label',`${String(index+1).padStart(2,'0')} ${catalog[key].short}`);
    button.setAttribute('aria-pressed',String(state.key===key));
    button.innerHTML=`<span class="chapter-number">${String(index+1).padStart(2,'0')}</span><span class="thumb ${key}" aria-hidden="true"></span><b>${catalog[key].short}</b>`;
    button.addEventListener('click',()=>switchScene(key));return button;
  }));
}
function renderShots() {
  $('shot-list').replaceChildren(...stories[state.key].map((shot,index)=>{
    const button=document.createElement('button');button.setAttribute('aria-pressed',String(index===state.shot));button.dataset.shot=index;
    button.innerHTML=`<strong>${String(index+1).padStart(2,'0')}</strong><span>${shot.label}</span><i>›</i>`;
    button.addEventListener('click',()=>{pauseStory();setShot(index);});return button;
  }));
}
function describePhase(value) {
  const index=state.key==='local'?(value<0?0:2):state.key==='glacier'?(value<0?3:value<60?1:2):value<25?0:value<60?1:value<90?2:3,shot=stories[state.key][index];state.shot=index;
  $('lesson-title').textContent=shot.heading;$('lesson-body').textContent=shot.text;$('journey-caption').textContent=shot.heading;
  $('shot-count').textContent=`${index+1} / ${stories[state.key].length}`;
  document.querySelectorAll('#shot-list button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  viewport.dataset.shot=String(index);viewport.dataset.shotLabel=shot.label;
}
function speakShot() {
  if(!state.voice||!('speechSynthesis' in window))return;
  speechSynthesis.cancel();
  const shot=demo.active&&demo.started?currentCue():stories[state.key][state.shot],utterance=new SpeechSynthesisUtterance(`${shot.heading} ${shot.text}`);
  utterance.lang='zh-CN';utterance.rate=1.05;
  const chinese=speechSynthesis.getVoices().find(v=>v.lang.startsWith('zh'));if(chinese)utterance.voice=chinese;
  const token=demo.speechToken=(demo.speechToken??0)+1;
  if(demo.active)demo.speaking=true;
  utterance.onend=()=>{if(token===demo.speechToken)demo.speaking=false;};
  utterance.onerror=event=>{if(token!==demo.speechToken)return;demo.speaking=false;if(!['canceled','interrupted'].includes(event.error)){$('play-status').textContent='语音不可用 · 阅读字幕';$('demo-voice').textContent='朗读不可用';state.voice=false;$('demo-voice').setAttribute('aria-pressed','false');}};
  speechSynthesis.speak(utterance);
}
function setShot(index,immediate=false) {
  state.shot=Math.max(0,Math.min(stories[state.key].length-1,index));state.elapsed=0;
  const shot=stories[state.key][state.shot];
  $('lesson-title').textContent=shot.heading;$('lesson-body').textContent=shot.text;$('journey-caption').textContent=shot.heading;
  $('shot-count').textContent=`${state.shot+1} / ${stories[state.key].length}`;
  document.querySelectorAll('#shot-list button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===state.shot)));
  viewport.dataset.shot=String(state.shot);viewport.dataset.shotLabel=shot.label;
  if(state.key==='earth') {
    active.userData.wind.visible=shot.layer==='wind';active.userData.connections.visible=shot.layer==='connections';active.userData.grid.visible=true;
    $('wind-toggle').checked=active.userData.wind.visible;$('grid-toggle').checked=true;
  }
  if(state.key==='history'){state.route=shot.route;lastStop=-1;updateRoute();}
  if(state.key==='local')setTeachingLayers(!!shot.water);
  if(state.key==='karez'){state.cutaway=shot.cut;setCutaway();}
  if(state.key==='yardang'){state.erosion=shot.erosion;updateYardang(active);}
  if(state.key==='migration'){state.migration=shot.migration;updateMigration();}
  if(state.key==='glacier'){state.experiment=false;if(shot.mode==='experiment'&&state.storyPlaying){state.accumulation=40;state.ablation=80;}setGlacierMode(shot.mode);state.retreat=shot.retreat;updateGlacier();updateGlacierStation();}
  resetView(immediate);updateStoryUI();speakShot();
}
function updateStoryUI() {
  const ended=state.shot===stories[state.key].length-1&&state.elapsed>=shotDurationForUI();
  $('story-play').textContent=state.storyPlaying?'Ⅱ 暂停讲解':ended?'↺ 重播讲解':state.elapsed>0?'▷ 继续讲解':'▷ 连续讲解';
  $('story-play').setAttribute('aria-pressed',String(state.storyPlaying));$('tour-play').setAttribute('aria-pressed',String(state.touring));
  $('play-status').textContent=state.storyPlaying?(state.touring?'完整导览':'镜头讲解'):ended?'本段讲解结束':state.elapsed>0?'已暂停':'自由探索';
  viewport.dataset.playback=state.storyPlaying?'playing':'paused';
}
function pauseStory() {
  if(spatialFlight&&spatialFlight.pausedAt===undefined)spatialFlight.pausedAt=performance.now();
  soundscape?.pause();
  state.storyPlaying=false;state.touring=false;
  demo.speaking=false;
  demo.speechToken=(demo.speechToken??0)+1;
  if('speechSynthesis' in window)speechSynthesis.cancel();
  updateStoryUI();
}
// Inserted into sandbox.js; preserved as the R9 narrative runtime edit.
let narrativeUI, liveCaptions, demoMap=[],atlas,atlasMarkers,captionHoldUntil=0,cueVoiceDelay=0,storyHoldSeconds=0,scenePreparationSeconds=0;
const currentCue=()=>cues[demo.cue];
const demoTime=()=>journeyTime(demo.cue,state.elapsed);
let inquiryUI,sceneReading;
function filmFrame(){
 if(!demo.active)return null;
 if(!demo.started)return {entryScale,atlas:true,key:'opening',id:'opening',shot:-1,ready:true,kicker:'XINJIANG / A LAND OF CONNECTIONS',heading:'从地球出发，来到新疆。',text:'沿一条水路进入绿洲，看家人、田边的人与往来者怎样回应。选择一个主题，也可以跟随完整故事。',credit:'6 条主题线 · 6 处叙事空间 · 真实影像与高程 / 原创教学场景',clock:`0:00 / ${formatTime(journeyDuration)}`,progress:0};
 const cue=currentCue(),chapter=chapters[cue.chapter],seconds=demoTime();
 const live=lived?.active?{...lived.stats(),goods:viewport.dataset.goods,priority:viewport.dataset.householdPriority,memoryHandoff:Number(viewport.dataset.memoryHandoff??0)}:null;
 const presentation=presentationFrame({elapsed:state.elapsed,live,flight:!!spatialFlight,ended:demo.ended,captionsReady:!spatialFlight&&performance.now()>=captionHoldUntil});
 return {...cue,bearing:earlyBearing(cue.id,lived?.ledger),work:{plan:viewport.dataset.waterChoice,phase:viewport.dataset.waterSequence,home:Number(viewport.dataset.waterHome??0),field:Number(viewport.dataset.waterField??0),waiting:viewport.dataset.waitingUser,nextNeed:viewport.dataset.nextNeed,waterActors:viewport.dataset.waterActors,marketUse:viewport.dataset.marketUse,marketWaiting:viewport.dataset.marketWaiting,marketActors:viewport.dataset.marketActors},spokenCaption:$('spoken-caption')?.hidden?null:$('spoken-caption')?.textContent,elapsed:state.elapsed,presentation,kicker:`${String(cue.chapter+1).padStart(2,'0')} / ${chapter.short} · ${cue.part+1}/${cue.partCount}`,credit:cue.credit,clock:`${formatTime(seconds)} / ${formatTime(journeyDuration)}`,progress:seconds/journeyDuration,spatial:stagedCues[cue.id]?.recap?null:spatialNavigation?.frame,motion:spatialFlight?{kind:spatialFlight.kind,geographicWindow:!!spatialFlight.window,terrainWindow:!!spatialFlight.terrainWindow,phase:spatialFlight.phase,progress:spatialFlight.progress,position:camera.position.toArray(),target:orbit.target.toArray(),overlayOpacity:Number($('transition-frame').style.opacity),globeScale:groups.get('earth').scale.x}:null,captionsReady:!spatialFlight&&performance.now()>=captionHoldUntil,playbackHeldSeconds:storyHoldSeconds+scenePreparationSeconds,observations:lived?.observations,ended:demo.ended,question:inquiryFrame(cue,lived?.ledger).question,inquiry:inquiryFrame(cue,lived?.ledger),evidence:sources[cue.source].title,live:lived?.active?{...lived.stats(),goods:viewport.dataset.goods,priority:viewport.dataset.householdPriority,memoryHandoff:Number(viewport.dataset.memoryHandoff??0)}:null,annotations:annotations?.frame??[],bridge:!spatialFlight&&state.storyPlaying&&state.elapsed<4.4&&cue.stage?bridges[cue.id]:null};
}
function renderDemoMap(cue){
 for(const group of groups.values())for(const layer of Object.values(group.userData.narrativeLayers??{}))layer.visible=false;
 $('story-map-pins').replaceChildren();demoMap=[];
 if(!cue.map||state.key!=='terrain')return;
 const locations=mapPoints[cue.map],layers=active.userData.narrativeLayers??={},color=cue.map==='modern'?0xcce49b:0xdcb9db;
 let layer=layers[cue.map];
 const point=p=>{const v=new THREE.Vector3(...terrainPoint(terrainDEM,p.lon,p.lat,active.userData.exaggeration,active.userData.dimensions));v.y+=.17;return v;};
 if(!layer){
  layer=new THREE.Group();layer.userData.paths=[];layers[cue.map]=layer;active.add(layer);
  for(const place of locations){const v=point(place),ring=mesh(new THREE.TorusGeometry(.18,.012,8,48),new THREE.MeshBasicMaterial({color}),layer,v.toArray());ring.rotation.x=-Math.PI/2;mesh(new THREE.SphereGeometry(.055,10,8),new THREE.MeshBasicMaterial({color}),layer,v.clone().add(new THREE.Vector3(0,.15,0)).toArray());}
  if(cue.map==='modern')for(const to of locations.slice(1)){
   const from=locations[0],vertices=Array.from({length:65},(_,i)=>{const t=i/64,v=point({lon:THREE.MathUtils.lerp(from.lon,to.lon,t),lat:THREE.MathUtils.lerp(from.lat,to.lat,t)});v.y+=Math.sin(t*Math.PI)*.75;return v;}),curve=new THREE.CatmullRomCurve3(vertices);
   line(curve.getPoints(120),color,layer,.5);const bead=mesh(new THREE.SphereGeometry(.046,8,6),new THREE.MeshBasicMaterial({color:0xf0ffb7}),layer);layer.userData.paths.push({curve,bead});
  }
 }
 layer.visible=true;
 for(const place of locations){const button=document.createElement('button');button.append(document.createTextNode(place.name));const small=document.createElement('small');small.textContent=place.note;button.append(small);button.setAttribute('aria-label',`故事地点：${place.name}`);button.setAttribute('aria-current',String(place.cue===cue.id));button.addEventListener('click',()=>seekDemo(cues.find(c=>c.id===place.cue).start,false));$('story-map-pins').append(button);demoMap.push({position:point(place).add(new THREE.Vector3(0,.24,0)),button,layer});}
}
function updateDemoMap(time){
 for(const pin of demoMap){
  const visible=demo.active&&demo.started&&!demo.summaryOpen&&pin.layer.visible;
  scratch.copy(pin.position).project(camera);const x=(scratch.x*.5+.5)*viewport.clientWidth,y=(-scratch.y*.5+.5)*viewport.clientHeight;
  pin.button.hidden=!visible||scratch.z>1||x<20||x>viewport.clientWidth-20||y<80||y>viewport.clientHeight-270;
  pin.button.style.left=`${x}px`;pin.button.style.top=`${y}px`;
 }
 const layer=demoMap[0]?.layer;if(layer)for(const [i,path] of layer.userData.paths.entries())path.bead.position.copy(path.curve.getPoint((time/16000+i*.37)%1));
}
function initAtlasMarkers(){
 const group=groups.get('terrain');if(!group||!atlas)return;
 if(!atlasMarkers){atlasMarkers=new THREE.Group();atlasMarkers.userData.items=[];group.add(atlasMarkers);
  for(const {item,button} of atlas.pinButtons){const v=new THREE.Vector3(...terrainPoint(terrainDEM,item.lon,item.lat,state.exaggeration,group.userData.dimensions));v.y+=.1;
   const ring=mesh(new THREE.TorusGeometry(.095,.012,8,36),new THREE.MeshBasicMaterial({color:0xe3d7ae}),atlasMarkers,v.toArray());ring.rotation.x=-Math.PI/2;
   atlasMarkers.userData.items.push({item,button,position:v.clone().add(new THREE.Vector3(0,.19,0)),ring});
  }
 }
}
function updateAtlasMarkers(){
 if(!atlasMarkers)return;atlasMarkers.visible=demo.active&&!demo.started;
 const ledger=lived?.ledger??{},visited=spatialNavigation?.frame?.journey?.visited??[],routeKey=visited.join('/');
 if(atlasMarkers.visible&&atlasMarkers.userData.routeKey!==routeKey){
  atlasMarkers.userData.routeKey=routeKey;const old=atlasMarkers.userData.trail;if(old){old.removeFromParent();old.geometry.dispose();old.material.dispose();}
  const points=visited.map(id=>atlasPlaces.find(p=>p.id===id)).filter(Boolean).map(p=>{const v=new THREE.Vector3(...terrainPoint(terrainDEM,p.lon,p.lat,state.exaggeration,groups.get('terrain').userData.dimensions));v.y+=.13;return v;});
  if(points.length>1){const path=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:0xead29c,dashSize:.12,gapSize:.07,transparent:true,opacity:.75}));path.computeLineDistances();atlasMarkers.add(path);atlasMarkers.userData.trail=path;}
 }
 const narrow=viewport.clientWidth<701,occupied=[];
 for(const p of atlasMarkers.userData.items){const visible=atlasMarkers.visible&&(atlas.group==='all'||atlas.group===p.item.group);p.ring.visible=visible;
  const site=atlasPlaces.find(s=>s.id===p.item.id),record=ledger[site?.stage],label=record?choiceLabel(site.stage,record):p.item.type;p.ring.material.color.set(record?0xf5ca83:0xe3d7ae);p.button.querySelector('small').textContent=label;
  const card=document.querySelector(`[data-atlas-scene="${p.item.id}"]`);if(card){card.dataset.observed=String(!!record);card.querySelector('small').textContent=record?'留下选择 · '+label:p.item.type;}
  const v=p.position.clone().project(camera),x=(v.x*.5+.5)*viewport.clientWidth,y=(-v.y*.5+.5)*viewport.clientHeight;
  const reserve=narrow?25:viewport.clientWidth<1050?330:390,bottom=narrow?viewport.clientHeight-270:viewport.clientHeight<760?viewport.clientHeight-224:viewport.clientHeight-300;
  let show=visible&&v.z<1&&x>(narrow?25:reserve)&&x<viewport.clientWidth-30&&y>(narrow?270:95)&&y<bottom;
  if(show&&occupied.some(([px,py])=>Math.abs(px-x)<110&&Math.abs(py-y)<44))show=false;if(show)occupied.push([x,y]);
  p.button.hidden=!show;p.button.style.left=x+'px';p.button.style.top=y+'px';
 }
}
function updateDemoUI(){
 if(!demo.active)return;
 viewport.dataset.transitionText=performance.now()<captionHoldUntil?'waiting':'ready';
 $('atlas-pins').hidden=demo.started||demo.summaryOpen||entryScale==='planet';
 $('atlas-home').hidden=!demo.started;
 $('atlas-resume').hidden=demo.started||!atlasBookmark;
 if(atlasBookmark)$('atlas-resume').textContent='回到刚才的地点 · '+formatTime(atlasBookmark.seconds)+' ↗';
 $('demo-explore').textContent=state.storyPlaying?'暂停探索':demo.started?'继续故事':'场景探索';
 const cue=currentCue(),frame=filmFrame(),seconds=demo.started?demoTime():0;
 $('demo-cover').hidden=demo.started||demo.summaryOpen;$('demo-caption').hidden=!demo.started||demo.summaryOpen;$('demo-end').hidden=!demo.summaryOpen;$('story-context').hidden=!demo.started||demo.summaryOpen||!!lived?.active;
 viewport.classList.toggle('lived-scene',demo.started&&!!lived?.active);
 if(demo.summaryOpen)narrativeUI?.refreshObservations();
 const bridge=frame.bridge;$('story-bridge').hidden=!bridge||!demo.started||demo.summaryOpen;
 if(bridge){$('story-bridge').querySelector('span').textContent=`${bridge.from} → ${bridge.to}`;$('story-bridge').querySelector('p').textContent=bridge.title;}
 $('demo-clock').textContent=`${formatTime(seconds)} / ${formatTime(journeyDuration)}`;
 if(!demo.seeking)$('demo-seek').value=seconds;
 $('demo-seek').setAttribute('aria-valuetext',`${formatTime(seconds)}，${chapters[cue.chapter].short}`);
 $('demo-toggle').textContent=state.storyPlaying?'Ⅱ':demo.ended?'↺':'▷';$('demo-toggle').setAttribute('aria-label',state.storyPlaying?'暂停完整演示':demo.ended?'重播完整演示':demo.started?'继续完整演示':'播放完整演示');
 $('demo-status').textContent=demo.ended?'故事已结束':demo.choicePending?'等你回应场景需求':demo.summaryOpen?'查看关系':state.storyPlaying?'演示中':demo.takenOver?'操作场景中':demo.started?'已暂停':'准备出发';
 if(demo.started&&cue.id!==demoCaptionSignature){
  for(const field of ['kicker','heading','text','credit'])$(`demo-${field}`).textContent=frame[field];
  narrativeUI?.update(cue);renderDemoMap(cue);demoCaptionSignature=cue.id;
  const nav=$('demo-chapters'),button=nav.querySelector(`[data-demo-chapter="${cue.chapter}"]`);
  if(button&&nav.scrollWidth>nav.clientWidth)nav.scrollTo({left:nav.scrollLeft+button.getBoundingClientRect().left-nav.getBoundingClientRect().left-(nav.clientWidth-button.clientWidth)/2,behavior:reducedMotion?'instant':'smooth'});
 }
 document.querySelectorAll('#demo-chapters button').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.demoChapter)===cue.chapter)));
 viewport.dataset.demo=demo.ended?'ended':!demo.started?'ready':state.storyPlaying?'playing':'paused';viewport.dataset.demoTime=seconds.toFixed(2);viewport.dataset.cue=demo.started?cue.id:'opening';viewport.dataset.domains=cue.domains.join(' ');
}
function setDemoMode(enabled){
 const entering=enabled&&!demo.active;
 pauseStory();demo.active=enabled;demo.summaryOpen=false;viewport.classList.toggle('demo-mode',enabled);viewport.classList.remove('focus-mode');document.body.classList.remove('view-focused');$('fullscreen').setAttribute('aria-pressed','false');$('demo-player').hidden=!enabled;orbit.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');
 for(const group of groups.values())for(const layer of Object.values(group.userData.narrativeLayers??{}))layer.visible=false;
 demoMap=[];$('story-map-pins').replaceChildren();
 lived?.hide();viewport.classList.remove('lived-scene');
 if(enabled){viewport.dataset.entryScale=entryScale;if(!demo.started&&state.key!==(entryScale==='planet'?'earth':'terrain'))switchScene(entryScale==='planet'?'earth':'terrain',true,true);if(entering){state.voice=false;$('voice').setAttribute('aria-pressed','false');$('demo-voice').setAttribute('aria-pressed','false');$('demo-voice').textContent='朗读关';}demoCaptionSignature='';}else {demo.ended=false;delete viewport.dataset.demo;delete viewport.dataset.cue;delete viewport.dataset.domains;}
 resizeViewport?.();resetView(true);if(enabled&&!demo.started&&entryScale==='region')scene.background=new THREE.Color(0x24342e);updateDemoUI();
}
function freezeSpatialView(){
 renderer.render(scene,camera);const frozen=$('transition-frame');frozen.width=viewport.clientWidth;frozen.height=viewport.clientHeight;frozen.getContext('2d').drawImage(renderer.domElement,0,0,frozen.width,frozen.height);frozen.style.opacity='1';frozen.style.display='block';
}
function fadeSpatialGlobe(value){
 const globe=groups.get('earth');if(!globe)return;
 globe.traverse(object=>{for(const m of [object.material].flat().filter(Boolean)){
  const base=m.userData.spatialBase??={opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite};
  if(m.uniforms?.fade)m.uniforms.fade.value=value;
  const transparent=base.transparent||value<1;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}
  m.opacity=base.opacity*value;m.depthWrite=value<1?false:base.depthWrite;
 }});
}
function cancelSpatialFlight(){
 if(!spatialFlight)return;const f=spatialFlight;
 if(f.lift){scene.remove(f.lift.patch);f.lift.dispose();fadeSpatialGlobe(1);groups.get('earth').visible=state.key==='earth';}
 f.marker?.removeFromParent();f.marker?.geometry.dispose();f.marker?.material.dispose();f.map.visible=false;active.visible=!lived?.active;if(lived?.active)lived.group.visible=true;
 terrainArrival?.restore();placeLandscape?.restore();placeLandscape?.show(!!lived?.active);
 if(f.window&&f.map.userData.surface){Object.assign(f.map.userData.surface.material,f.mapState);f.map.userData.surface.material.needsUpdate=true;}
 spatialFlight=null;viewport.dataset.spatialFlight='false';viewport.dataset.spatialPhase='settled';$('transition-frame').style.display='none';renderer.domElement.style.opacity='1';
}
function showSpatialEntry(scale){
 if(demo.started)atlasBookmark={seconds:demoTime(),interactive:demo.interactive};
 cancelSpatialFlight();placeLandscape?.hide();
 entryScale=scale;viewport.dataset.entryScale=scale;demo.started=false;demo.ended=false;demo.choicePending=false;setDemoMode(true);
 switchScene(scale==='planet'?'earth':'terrain',true,true);initAtlasMarkers();
 const copy=$('demo-cover').querySelector('h1');copy.innerHTML=scale==='planet'?'从地球出发<span>来到新疆，再走进一个地点。</span>':'新疆<span>三山两盆之间，选择下一站。</span>';
 $('demo-cover').querySelector('.demo-cover-copy>p:not(.demo-eyebrow)').innerHTML=scale==='planet'?'先看它在世界的哪里。<br>沿山系、盆地与通道逐级靠近，<br>让山水与人的故事在地点中展开。':'真实高程展开山系与盆地。<br>从地图或场景卡选点，<br>沿引导镜头走进当地故事。';updateDemoUI();
}
function beginSpatialFlight(cue,previousCue,plan,from,oldTarget,background){
 if(!groups.has('terrain')){const g=createTerrain(terrainDEM);addRegionalPins(g);groups.set('terrain',g);scene.add(g);}
 const destination=contextFor(cue),origin=previousCue?contextFor(previousCue):destination;
 if(lived?.active&&destination.lon<=100)placeLandscape.prepare(destination,lived.group,groups.get('terrain').userData.dimensions,state.exaggeration);
 const planetary=plan.kind==='globe-return'||destination.lon>100,map=groups.get(planetary?'earth':'terrain');
 active.visible=false;placeLandscape?.show(false);if(lived?.active)lived.group.visible=false;map.visible=true;transition=null;sceneFade=null;renderer.domElement.style.opacity='1';$('transition-frame').style.display=plan.kind==='unfold'?'none':'block';
 const marker=new THREE.Mesh(new THREE.TorusGeometry(planetary?.12:.28,.014,8,64),new THREE.MeshBasicMaterial({color:gold}));
 const point=c=>planetary?spherePoint(c.lon,c.lat,3.27):new THREE.Vector3(...terrainPoint(terrainDEM,c.lon,c.lat,state.exaggeration,map.userData.dimensions));
 marker.position.copy(point(destination));if(!planetary)marker.position.y+=.1;
 if(planetary)marker.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),marker.position.clone().normalize());else marker.rotation.x=-Math.PI/2;map.add(marker);
 const home=cameraHome(state.key),localStart=arrivalPose(home.position.toArray(),home.target.toArray());
 const sameMap=previousCue&&!previousCue.stage&&['terrain','history'].includes(previousCue.key),lift=plan.kind==='unfold'?globeLift(map,spherePoint):null;
 let startPosition,startTarget,endPosition,endTarget;
 if(lift){map.visible=false;groups.get('earth').visible=true;scene.add(lift.patch);lift.update(0);startPosition=from;startTarget=oldTarget;endPosition=home.position;endTarget=home.target;$('transition-frame').style.display='none';}
 else if(plan.kind==='map-return'){startTarget=point(origin);startPosition=startTarget.clone().add(new THREE.Vector3(2.5,7,11));endPosition=home.position;endTarget=home.target;}
 else if(plan.kind==='globe-return'){startPosition=spherePoint(destination.lon,destination.lat,7.2);startTarget=new THREE.Vector3();endPosition=home.position;endTarget=home.target;}
 else{startPosition=sameMap?from:planetary?spherePoint(destination.lon,destination.lat,13):new THREE.Vector3(4,14,22);startTarget=sameMap?oldTarget:planetary?new THREE.Vector3():new THREE.Vector3(0,.5,0);endTarget=planetary?new THREE.Vector3():point(destination);endPosition=planetary?spherePoint(destination.lon,destination.lat,7.6):endTarget.clone().add(new THREE.Vector3(2.5,6.5,9));}
 const terrainWindow=plan.kind==='locate'&&!lived?.active&&terrainArrival.prepare(active,map);
 spatialFlight={...plan,marker,map,lift,from:startPosition.clone(),to:endPosition.clone(),oldTarget:startTarget.clone(),target:endTarget.clone(),home,localStart,background,planetary,origin,destination,mapState:{opacity:map.userData.surface?.material.opacity??1,transparent:map.userData.surface?.material.transparent??false,depthWrite:map.userData.surface?.material.depthWrite??true},start:performance.now(),elapsedMS:0,handedOff:false,terrainWindow,window:plan.kind==='locate'&&!!lived?.active&&destination.lon<=100,phrase:flightPhrases[cue.id]??'先在地图上建立位置，再走进当地故事。',phase:'establish',progress:0};
 scene.background=lift||planetary?new THREE.Color(0x04080d):new THREE.Color(0x162a25);scene.fog=null;stars.visible=!!lift||planetary;
 viewport.dataset.spatialFlight='true';viewport.dataset.spatialPhase='establish';
 camera.position.copy(startPosition);orbit.target.copy(startTarget);camera.lookAt(orbit.target);
}
function updateSpatialFlight(time,animationDelta){
 const f=spatialFlight;if(!f)return;f.elapsedMS=advanceFlight(f.elapsedMS,animationDelta,f.pausedAt!==undefined,f.duration);const t=f.elapsedMS/f.duration,timing=flightTiming(f.kind,t);
 f.phase=timing.phase;f.progress=t;viewport.dataset.spatialPhase=f.phase;f.marker.scale.setScalar(1+Math.sin(t*Math.PI*2)*.08);
 let pose;
 if(f.kind==='locate'&&timing.handoff>0&&f.terrainWindow){
  const u=timing.handoff;f.handedOff=true;terrainArrival.unfold(u);
  if(f.marker.parent!==scene){f.marker.getWorldPosition(f.marker.position);scene.add(f.marker);}
  const d=active.userData,localPoint=new THREE.Vector3(...terrainPoint(d.dem,f.destination.lon,f.destination.lat,d.exaggeration,d.dimensions));localPoint.y+=.09;
  f.marker.position.lerpVectors(f.target,localPoint,smoothStep(u));f.marker.scale.setScalar(1+smoothStep(u)*.8);
  $('transition-frame').style.display='none';pose=flightCamera(f.to.toArray(),f.home.position.toArray(),f.target.toArray(),f.home.target.toArray(),u);
  scene.background.lerpColors(new THREE.Color(0x162a25),sceneBackground(state.key),smoothStep(u));
 }else if(f.kind==='locate'&&timing.handoff>0&&f.window){
  const u=timing.handoff;f.handedOff=true;f.map.visible=u<.56;lived.group.visible=true;placeLandscape.unfold(u);
  const material=f.map.userData.surface.material;if(!material.transparent){material.transparent=true;material.depthWrite=false;material.needsUpdate=true;}material.opacity=f.mapState.opacity*(1-smoothStep(Math.min(1,u/.56)));
  if(f.marker.parent!==scene){f.marker.getWorldPosition(f.marker.position);scene.add(f.marker);}f.marker.position.lerpVectors(f.target,lived.group.position,smoothStep(u));f.marker.position.y+=.09;f.marker.material.transparent=true;f.marker.material.opacity=1-smoothStep(Math.max(0,(u-.7)/.3));
  $('transition-frame').style.display='none';pose=flightCamera(f.to.toArray(),f.home.position.toArray(),f.target.toArray(),f.home.target.toArray(),u);
  scene.background.lerpColors(new THREE.Color(0x162a25),new THREE.Color(0x202a23),smoothStep(u));
 }else if(f.kind==='locate'&&timing.handoff>0){
  if(!f.handedOff){
   // Capture the exact map endpoint, then match its centered place with the
   // local set's focal point. Both are visible during the camera handoff.
   camera.position.copy(f.to);orbit.target.copy(f.target);camera.lookAt(orbit.target);freezeSpatialView();f.map.visible=false;active.visible=!lived?.active;if(lived?.active)lived.group.visible=true;f.handedOff=true;
   scene.background=lived?.active?new THREE.Color(0x202a23):sceneBackground(state.key);scene.fog=new THREE.FogExp2(0x171e20,.007);stars.visible=false;
  }
  pose=flightCamera(f.localStart.position,f.home.position.toArray(),f.localStart.target,f.home.target.toArray(),timing.handoff);
  $('transition-frame').style.opacity=String(1-smoothStep(timing.handoff));
 }else{
  pose=flightCamera(f.from.toArray(),f.to.toArray(),f.oldTarget.toArray(),f.target.toArray(),timing.approach);
  if(!f.lift)$('transition-frame').style.opacity=String(timing.outgoing);
 }
 camera.position.fromArray(pose.position);orbit.target.fromArray(pose.target);camera.lookAt(orbit.target);
 if(f.lift){f.lift.update(smoothStep(t));fadeSpatialGlobe(timing.globeOpacity);groups.get('earth').visible=timing.globeOpacity>.001;scene.background.lerpColors(new THREE.Color(0x04080d),new THREE.Color(0x162a25),smoothStep(t));}
 if(t<1)return;
 if(f.lift){scene.remove(f.lift.patch);f.lift.dispose();fadeSpatialGlobe(1);groups.get('earth').visible=state.key==='earth';}
 f.map.visible=f.map===active&&!lived?.active;active.visible=!lived?.active;if(lived?.active)lived.group.visible=true;
 terrainArrival?.restore();placeLandscape?.restore();placeLandscape?.show(!!lived?.active);
 const planetary=['earth','migration'].includes(state.key)&&!lived?.active;stars.visible=planetary;scene.background=lived?.active?new THREE.Color(0x202a23):sceneBackground(state.key);scene.fog=planetary?null:new THREE.FogExp2(0x171e20,.007);
 f.marker.removeFromParent();f.marker.geometry.dispose();f.marker.material.dispose();if(f.window&&f.map.userData.surface){Object.assign(f.map.userData.surface.material,f.mapState);f.map.userData.surface.material.needsUpdate=true;}
 spatialFlight=null;viewport.dataset.spatialFlight='false';viewport.dataset.spatialPhase='settled';$('transition-frame').style.display='none';renderer.domElement.style.opacity='1';
 // No reset/restart at arrival. The next content frame keeps this exact pose.
 camera.position.copy(f.home.position);orbit.target.copy(f.home.target);camera.lookAt(orbit.target);transition=null;captionHoldUntil=time+cueVoiceDelay*1000;
}

function setDemoCue(index,immediate=false,sequence=false){
 cancelSpatialFlight();placeLandscape?.hide();const preparationStarted=performance.now();
 const cue=cues[index],previousStage=lived?.stage,nextStage=stagedCues[cue.id]?.stage;
 const previousCue=demo.started?cues[demo.cue]:null;
 const plan=!immediate&&!reducedMotion?spatialPlan(previousCue,cue):null,geographicMove=!!plan;
 const travel=false; // Separate geographic places are reached through the atlas.
 const changed=previousStage!==nextStage||(!nextStage&&cue.key!==state.key)||!!stagedCues[cue.id]?.recap;
 const dissolve=changed&&!travel&&!geographicMove&&!immediate&&!reducedMotion;
 const previousPosition=camera.position.clone(),previousTarget=orbit.target.clone(),previousBackground=scene.background.clone();
 if(geographicMove&&plan.kind!=='unfold')freezeSpatialView();
 if(dissolve){renderer.render(scene,camera);const frozen=$('transition-frame');frozen.width=viewport.clientWidth;frozen.height=viewport.clientHeight;frozen.getContext('2d').drawImage(renderer.domElement,0,0,frozen.width,frozen.height);frozen.style.opacity='1';frozen.style.display='block';}
 cueVoiceDelay=travel?2.4:dissolve?.7:0;captionHoldUntil=performance.now()+cueVoiceDelay*1000;
 demo.cue=index;demo.summaryOpen=false;demo.takenOver=false;demoCaptionSignature='';
 if(cue.key!==state.key)switchScene(cue.key,true,true);
 const staged=lived?.setCue(cue,{connect:travel});active.visible=!staged;
 if(staged&&!stagedCues[cue.id]?.recap&&!groups.has('terrain')){const g=createTerrain(terrainDEM);g.visible=false;addRegionalPins(g);groups.set('terrain',g);scene.add(g);}
 if(staged&&!stagedCues[cue.id]?.recap){const map=groups.get('terrain');if(map&&placeLandscape.prepare(contextFor(cue),lived.group,map.userData.dimensions,state.exaggeration))placeLandscape.show(true);}
 viewport.dataset.placeLandscape=String(!!staged&&placeLandscape.visible);
 if(staged){scene.background=new THREE.Color(0x202a23);scene.fog=new THREE.FogExp2(0x17262b,.007);stars.visible=false;sun.color.set(0xffedcf);sun.intensity=2.05;skyLight.intensity=1.55;fillLight.intensity=.82;renderer.toneMappingExposure=1.12;}else{const planetary=['earth','migration'].includes(state.key);scene.background=sceneBackground(state.key);scene.fog=planetary?null:new THREE.FogExp2(0x171e20,.007);stars.visible=planetary;sun.color.set(planetary?0xfff2db:0xf5f5ef);sun.intensity=planetary?2.1:state.key==='glacier'?1.5:1.7;skyLight.intensity=planetary?1.1:state.key==='glacier'?1.35:1.55;fillLight.intensity=planetary?.45:.75;renderer.toneMappingExposure=planetary||state.key==='glacier'?1.08:1.12;}
 viewport.classList.toggle('lived-scene',!!staged);
 if(travel||!changed||(!previousStage&&!nextStage&&['terrain','history'].includes(cue.key))){camera.position.copy(previousPosition);orbit.target.copy(previousTarget);}
 else if(dissolve){const home=cameraHome(state.key),radius=home.position.distanceTo(home.target),direction=previousPosition.clone().sub(previousTarget).normalize();direction.y=Math.max(.25,direction.y);direction.normalize();camera.position.copy(home.target).addScaledVector(direction,radius*1.1);orbit.target.copy(home.target);}
 resizeViewport?.();setShot(cue.shot,immediate);updateDemoUI();
 if(travel&&transition){transition.kind='stage-travel';transition.duration=4400;transition.backgroundFrom=previousBackground;transition.backgroundTo=scene.background.clone();scene.background.copy(previousBackground);}
 renderer.shadowMap.needsUpdate=true;
 if(travel){sceneFade=null;renderer.domElement.style.opacity='1';$('transition-frame').style.display='none';renderer.render(scene,camera);if(transition)transition.start=performance.now();}
 else if(dissolve){
   // An immediate model switch hides the overlay; restore the outgoing pixels
   // after that switch so the next view dissolves without an empty frame.
   const frozen=$('transition-frame');frozen.style.display='block';frozen.style.opacity='1';
   renderer.render(scene,camera);const ready=performance.now();if(transition)transition.start=ready;sceneFade={start:ready,duration:1200};renderer.domElement.style.opacity='0';viewport.dataset.blend='moving';
 }
 else if(immediate){sceneFade=null;renderer.domElement.style.opacity='1';$('transition-frame').style.display='none';}
 // Building geometry or warming a shader must not advance a new scene into
 // the middle of its narration. Begin its fade and caption delay after ready.
 if(geographicMove)beginSpatialFlight(cue,previousCue,plan,previousPosition,previousTarget,previousBackground);
 const prepared=performance.now();if(spatialFlight){spatialFlight.start=prepared;if(!state.storyPlaying)spatialFlight.pausedAt=prepared;}scenePreparationSeconds+=(prepared-preparationStarted)/1000;
 captionHoldUntil=prepared+(cueVoiceDelay+(spatialFlight?spatialFlight.duration/1000:0))*1000;lastTime=prepared;
}
function startDemo(interactive=false){atlasBookmark=null;spatialNavigation?.reset();storyHoldSeconds=0;scenePreparationSeconds=0;demo.interactive=interactive===true;demo.choicePending=false;soundscape?.engage();setDemoMode(true);lived?.reset();setCategory('all');demo.started=true;demo.ended=false;state.touring=true;state.storyPlaying=true;setDemoCue(0,true);updateDemoUI();}
function toggleDemo(){
 if(!demo.started||demo.ended){startDemo();return;}
 if(demo.interactive&&lived?.decisionActive&&(lived.decisionSelected||demo.choicePending)){if(!lived.decisionReady)return;lived.continueDecision();return;}
 if(demo.interactive&&currentCue().id==='water-ice'&&lived?.waterSelected){if(lived.waterReady)$('water-continue').click();return;}
 if(demo.choicePending&&!lived?.waterSelected)return;
 if(state.storyPlaying){pauseStory();if(transition?.kind==='stage-travel')transition.pausedAt=performance.now();else transition=null;}
 else {soundscape?.engage();demo.summaryOpen=false;demo.takenOver=false;lived?.resume();state.storyPlaying=true;state.touring=true;if(spatialFlight?.pausedAt!==undefined){spatialFlight.start+=performance.now()-spatialFlight.pausedAt;captionHoldUntil+=performance.now()-spatialFlight.pausedAt;delete spatialFlight.pausedAt;}else if(transition?.pausedAt!==undefined){transition.start+=performance.now()-transition.pausedAt;delete transition.pausedAt;}else resetView();updateStoryUI();speakShot();}updateDemoUI();
}
function seekDemo(seconds,play=state.storyPlaying,immediate=false){
 pauseStory();demo.choicePending=false;demo.started=true;demo.ended=seconds>=journeyDuration;
 const cue=locateTime(seconds);state.storyPlaying=play&&!demo.ended;state.touring=state.storyPlaying;setDemoCue(cue.index,immediate);state.elapsed=cue.elapsed;
 const next=cues[cue.index+1]?.key===cue.key?cues[cue.index+1]:cue,fraction=Math.max(0,Math.min(1,(cue.elapsed/cue.duration-.24)/.58)),field={history:'route',migration:'migration',yardang:'erosion',glacier:'retreat'}[state.key];
 if(field&&(state.key!=='glacier'||cue.mode==='experiment'))state[field]=phaseFrame(cue[field],next[field],fraction);
 for(const key of Object.keys(visual))visual[key]=state[key];
 if(state.key==='history')updateRoute();if(state.key==='migration')updateMigration();if(state.key==='yardang')updateYardang(active);if(state.key==='glacier')updateGlacier();
 if(cue.id==='future-synthesis')resetView(true);
 if(demo.ended){demo.summaryOpen=true;narrativeUI?.reset();}updateStoryUI();updateDemoUI();
}
function bindDemo(){
 narrativeUI=installNarrativeUI({readObservations:()=>lived?.observations??[],onSeek:seconds=>seekDemo(seconds,true),onExplore:(key,shot,cue,observation)=>{if(cue?.stage){seekDemo(cue.start,false);demo.takenOver=true;if(observation)lived.restoreObservation(observation);updateDemoUI();}else{setDemoMode(false);switchScene(key);setShot(shot);}},onClose:()=>{demo.summaryOpen=false;updateDemoUI();}});
 $('demo-seek').max=journeyDuration;$('demo-duration').textContent=`${Math.floor(journeyDuration/60)} 分 ${journeyDuration%60?journeyDuration%60+' 秒':''}`;
 $('demo-chapters').replaceChildren(...chapters.map(item=>{const button=document.createElement('button');button.dataset.demoChapter=item.chapter;button.setAttribute('aria-label',`演示第${item.chapter+1}章 ${item.short}`);button.innerHTML=`<span>${String(item.chapter+1).padStart(2,'0')} / ${formatTime(item.start)}</span>${item.short}`;button.addEventListener('click',()=>seekDemo(item.start));return button;}));
 atlas=installAtlas({onEnter:item=>{soundscape?.engage();demo.interactive=true;seekDemo(cues.find(c=>c.id===item.cue).start,true);demo.takenOver=false;if(item.id==='water'){lived.clearWater();}updateDemoUI();},onHome:()=>showSpatialEntry('planet'),onRegion:()=>showSpatialEntry('region'),onStart:()=>startDemo(true),onFilm:()=>startDemo(false),onGroup:()=>{}});initAtlasMarkers();
 $('atlas-resume').addEventListener('click',()=>{if(!atlasBookmark)return;const b=atlasBookmark;demo.interactive=b.interactive;seekDemo(b.seconds,false);if(lived?.active)lived.restoreObservation(lived.stage);updateDemoUI();});
 $('journey-map-open').addEventListener('click',()=>showSpatialEntry('region'));
 $('demo-replay').addEventListener('click',()=>startDemo(false));$('demo-toggle').addEventListener('click',toggleDemo);
 $('demo-voice').addEventListener('click',()=>{if(!('speechSynthesis' in window)){$('demo-voice').textContent='本机无朗读';return;}state.voice=!state.voice;$('demo-voice').textContent=state.voice?'朗读开':'朗读关';$('demo-voice').setAttribute('aria-pressed',String(state.voice));if(state.voice&&state.storyPlaying)speakShot();else{speechSynthesis.cancel();demo.speaking=false;}});
 $('demo-seek').addEventListener('change',()=>{demo.seeking=false;seekDemo(Number($('demo-seek').value));});$('demo-seek').addEventListener('input',()=>{demo.seeking=true;$('demo-clock').textContent=`${formatTime(Number($('demo-seek').value))} / ${formatTime(journeyDuration)}`;});
 $('demo-prev').addEventListener('click',()=>seekDemo(chapters[Math.max(0,currentCue().chapter-1)].start));$('demo-next').addEventListener('click',()=>seekDemo(chapters[Math.min(chapters.length-1,currentCue().chapter+1)].start));
 $('demo-explore').addEventListener('click',()=>{if(demo.started&&!state.storyPlaying){toggleDemo();return;}pauseStory();demo.takenOver=true;updateDemoUI();});$('demo-end-explore').addEventListener('click',()=>{setDemoMode(false);switchScene('glacier');setShot(3);});
 $('demo-relations').addEventListener('click',()=>{pauseStory();demo.summaryOpen=!demo.summaryOpen;updateDemoUI();});$('demo-data').addEventListener('click',()=>{const info=sceneInfo[lived?.stage];$('source-text').textContent=info?`${info.title}。${info.scope}`:lessons[state.key].source;const links=info?[[sources[info.source].title,sources[info.source].url],['原创场景与数据致谢','./ATTRIBUTION.md']]:lessons[state.key].links;$('source-links').replaceChildren(...links.map(([title,href])=>{const a=document.createElement('a');a.textContent=title;a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;}));$('source-panel').hidden=!$('source-panel').hidden;});
 document.addEventListener('keydown',event=>{if(!demo.active||event.target.matches('input,textarea,select'))return;if(event.code==='Space'&&!event.target.closest('button,a')){event.preventDefault();toggleDemo();}if(event.key==='ArrowRight'){event.preventDefault();seekDemo(demoTime()+10);}if(event.key==='ArrowLeft'){event.preventDefault();seekDemo(demoTime()-10);}if(event.key==='Escape'&&demo.summaryOpen){demo.summaryOpen=false;updateDemoUI();}});
}

const shotDurationForUI=()=>demo.active&&demo.started?currentCue().duration:state.voice?23:stories[state.key][state.shot].duration;
function advanceScene(direction=1) {
  const visible=order.filter(key=>state.category==='all'||catalog[key].category===state.category),index=visible.indexOf(state.key);
  switchScene(visible[(index+direction+visible.length)%visible.length]);
}
function setCategory(category) {
  state.category=category;
  document.querySelectorAll('[data-category]').forEach(button=>{
    if(button.dataset.scene)button.hidden=category!=='all'&&button.dataset.category!==category;
    else button.setAttribute('aria-pressed',String(button.dataset.category===category));
  });
  if(category!=='all'&&catalog[state.key].category!==category)switchScene(order.find(key=>catalog[key].category===category));
}

function workspaceHome() {
 if(state.key==='journey')return {...desertCameraPose(new THREE.Vector3(...(active.userData.follow??[-30,0,0])),'walk',camera.aspect),min:2.5,max:85};
  const host=$('canvas-host'),aspect=Math.max(.35,host.clientWidth/host.clientHeight),tan=Math.tan(camera.fov*Math.PI/360);
  let target,span;
  if(lived?.active){target=new THREE.Vector3(stageOrigins[lived.stage],.7,0);span=new THREE.Vector3(17,5,13);}
  else if(['earth','migration'].includes(state.key)){return {position:spherePoint(85,36,Math.max(10.2,4.4/(tan*aspect))),target:new THREE.Vector3(),min:4.2,max:120};}
  else {const object=active?.userData.surface??active;object?.geometry?.computeBoundingBox();const box=new THREE.Box3().setFromObject(object);target=box.getCenter(new THREE.Vector3());span=box.getSize(new THREE.Vector3());target.y=Math.max(.4,target.y);}
  const distance=Math.max(11,span.x/(2*tan*aspect*.76),Math.max(span.y,span.z*.7)/(2*tan*.68))+span.z*.3;
  if(lived?.stage==='people'&&viewport.dataset.settlementChronology){const d=Math.max(18,14.8/(2*tan*aspect*.92));target.y=.45;target.z=.3;return {position:target.clone().addScaledVector(new THREE.Vector3(.12,.94,1).normalize(),d),target,min:3,max:180};}
  if(lived?.active&&viewport.classList.contains('kg-active')){const d=Math.max(20,span.x/(2*tan*aspect*.93),span.z*.72/(2*tan));target.y=1;target.z=.3;return {position:target.clone().addScaledVector(new THREE.Vector3(.18,.54,1).normalize(),d),target,min:3,max:180};}
  if((viewport.classList.contains('ra-entry')||viewport.classList.contains('ej-active'))&&state.key==='terrain'){const guided=viewport.classList.contains('gx-active'),readingMap=viewport.classList.contains('kg-active')&&viewport.dataset.learnStage==='map',dir=new THREE.Vector3(0,1.1,1).normalize(),base=readingMap?21:guided?23:host.clientWidth>1050?20:22,d=Math.max(base,16/(2*tan*aspect*.9));if(guided){target.z+=readingMap?-1.2:.8;if(host.clientWidth>1050)target.x-=1.0;}return {position:target.clone().addScaledVector(dir,d),target,min:3,max:180};}
  if(viewport.classList.contains('gx-active')&&state.key==='karez'&&!lived?.active){target=new THREE.Vector3(host.clientWidth>1050?-1.7:0,-1.5,0);const d=Math.max(host.clientWidth>1050?26:33,span.x/(2*tan*aspect*.82));return {position:target.clone().addScaledVector(new THREE.Vector3(.25,.55,1).normalize(),d),target,min:4.5,max:180};}
  const direction=new THREE.Vector3(.45,.7,1).normalize();return {position:target.clone().addScaledVector(direction,distance),target,min:2.5,max:180};
}
function workspaceView(kind='fit',entryPose=null) {
  cancelPlatformArrival();
  const home=workspaceHome();let position=home.position.clone(),target=home.target.clone(),distance=position.distanceTo(target);
  if(kind==='top')position.copy(target).add(new THREE.Vector3(.001,distance,0));
  if(kind==='front')position.copy(target).add(new THREE.Vector3(0,distance*.1,distance));
  if(kind==='near'){if(lived?.active){const pose=entryPose??lived.pose;target.fromArray(pose.target);position.fromArray(pose.position??pose.camera);}else position.sub(target).multiplyScalar(.57).add(target);}
  if(kind==='near'&&lived?.active&&viewport.classList.contains('kg-active')){const span={oasis:5.2,market:4.5,people:4.4,culture:5.5,logistics:5.7}[lived.stage]??6,min=Math.max(span/(2*Math.tan(camera.fov*Math.PI/360)*camera.aspect),(lived.stage==='market'?3.8:3.2)/(2*Math.tan(camera.fov*Math.PI/360))),d=position.distanceTo(target);if(d<min)position.sub(target).multiplyScalar(min/d).add(target);}
  transition={from:camera.position.clone(),to:position,oldTarget:orbit.target.clone(),target,start:performance.now(),duration:900};
  orbit.minDistance=home.min;orbit.maxDistance=home.max;orbit.enablePan=true;orbit.minPolarAngle=.015;orbit.maxPolarAngle=['earth','migration'].includes(state.key)?Math.PI-.05:Math.PI*.49;
}
function workspaceLayer(key,value) {
  if(key==='rotate'){orbit.autoRotate=value;return;}
  if(key==='markers'){work.markers=value;state.labels=value;viewport.classList.toggle('wb-no-markers',!value);if($('labels-toggle'))$('labels-toggle').checked=value;return;}
  if(key==='wire'){work.wire=value;for(const group of [...groups.values(),lived?.group].filter(Boolean))group.traverse(object=>{if(object.isMesh)for(const mat of Array.isArray(object.material)?object.material:[object.material])if('wireframe' in mat)mat.wireframe=value;});renderer.shadowMap.needsUpdate=true;}
}
function selectWorkspace(id,{reset=false}={}) {
  const item=workspaceScenes.find(s=>s.id===id);if(!item)return;
  work.scene=id;work.playing=false;work.time=0;work.pending=0;state.elapsed=0;state.storyPlaying=false;state.touring=false;state.playing=false;state.eroding=false;state.migrating=false;state.experiment=false;state.flowing=false;
  cancelSpatialFlight();placeLandscape?.hide();viewport.dataset.placeLandscape='false';lived?.hide();orbit.autoRotate=false;if($('wb-rotate'))$('wb-rotate').setAttribute('aria-pressed','false');
  if(reset){if(item.cue)lived.resetWorkspace(id);else {const defaults={terrain:{exaggeration:18},local:{localExaggeration:1.35},history:{route:0},migration:{migration:0},yardang:{erosion:0},karez:{flow:65,cutaway:true},glacier:{retreat:0,accumulation:40,ablation:80}};Object.assign(state,defaults[id]??{});if(id==='karez')flowTime=0;if(id in {history:1,migration:1,yardang:1,glacier:1})visual[{history:'route',migration:'migration',yardang:'erosion',glacier:'retreat'}[id]]=0;}}
  selectingWorkspace=true;switchScene(item.cue?cues.find(c=>c.id===item.cue).key:id,true);selectingWorkspace=false;
  if(item.cue){const cue=cues.find(c=>c.id===item.cue);demo.cue=cue.index;lived.setCue(cue,{workbench:true});active.visible=false;scene.background=sceneBackground('karez');scene.fog=null;stars.visible=false;renderer.toneMappingExposure=1.08;}
  if(id==='glacier'){setGlacierMode('observation');stationSignature='';updateGlacierStation();}
  $('selection').hidden=true;workbench?.select(id);workspaceLayer('wire',work.wire);workspaceLayer('markers',work.markers);resizeViewport();resetView(true);orbit.enablePan=true;orbit.minPolarAngle=.015;orbit.maxPolarAngle=['earth','migration'].includes(state.key)?Math.PI-.05:Math.PI*.49;renderer.shadowMap.needsUpdate=true;
  const url=new URL(location.href);url.searchParams.set('scene',id);url.searchParams.delete('autoplay');history.replaceState(null,'',url);
  if(!platformSelecting)historyPlatform?.sceneChanged(id);
  if(id==='journey'&&!platformSelecting&&knowledgeGuide&&!knowledgeGuide.journeyActive)knowledgeGuide.openJourney('near');
}
function workspaceState() {
 return {version:1,scene:work.scene,camera:camera.position.toArray(),target:orbit.target.toArray(),time:work.time,speed:work.speed,flowTime,light:work.light,wire:work.wire,markers:work.markers,parameters:Object.fromEntries(['exaggeration','localExaggeration','flow','cutaway','labels','route','erosion','retreat','glacierMode','accumulation','ablation','migration'].map(k=>[k,state[k]])),layers:{grid:active?.userData.grid?.visible,wind:active?.userData.wind?.visible,water:active?.userData.waterPaths?.visible,ghost:active?.userData.showGhost,ecology:active?.userData.rings?.every(r=>r.visible)},lived:lived?.active?lived.workspaceState():null,guide:knowledgeGuide?.snapshot(),navigation:historyPlatform?.snapshot()};
}
function restoreWorkspace(saved,{restoreNavigation=true}={}) {
 if(saved?.version!==1||!workspaceScenes.some(s=>s.id===saved.scene))return;
 const p=saved.parameters??{};
 for(const [key,min,max]of [['exaggeration',1,70],['localExaggeration',1,4],['flow',0,100],['route',0,100],['erosion',0,100],['retreat',0,100],['accumulation',0,100],['ablation',0,100],['migration',0,100]])if(Number.isFinite(p[key]))state[key]=THREE.MathUtils.clamp(p[key],min,max);
 for(const key of ['cutaway','labels'])if(typeof p[key]==='boolean')state[key]=p[key];
 selectWorkspace(saved.scene);work.time=THREE.MathUtils.clamp(Number(saved.time)||0,0,100000);work.speed=[.5,1,2,4].includes(saved.speed)?saved.speed:1;work.light=THREE.MathUtils.clamp(Number(saved.light)||0,0,360);
  if(Number.isFinite(saved.flowTime))flowTime=saved.flowTime;
 if(saved.scene==='glacier'){setGlacierMode(['flow','experiment'].includes(p.glacierMode)?p.glacierMode:'observation');state.retreat=p.retreat??0;stationSignature='';updateGlacierStation();}
 if(lived?.active&&saved.lived)lived.restoreWorkspace(saved.lived);
 const layers=saved.layers??{};if(active?.userData.grid&&typeof layers.grid==='boolean'){active.userData.grid.visible=layers.grid;if($('grid-toggle'))$('grid-toggle').checked=layers.grid;}if(active?.userData.wind&&typeof layers.wind==='boolean'){active.userData.wind.visible=layers.wind;if($('wind-toggle'))$('wind-toggle').checked=layers.wind;}if(saved.scene==='local'&&typeof layers.water==='boolean'){setTeachingLayers(layers.water);$('teaching-toggle').checked=layers.water;}if(saved.scene==='glacier'&&typeof layers.ghost==='boolean'){active.userData.showGhost=layers.ghost;active.userData.ghost.visible=layers.ghost&&active.userData.teaching;$('ghost-toggle').checked=layers.ghost;}if(saved.scene==='ecology'&&typeof layers.ecology==='boolean'){active.userData.rings.forEach(r=>r.visible=layers.ecology);$('ecology-toggle').checked=layers.ecology;}
 for(const field of ['route','erosion','retreat','migration'])visual[field]=state[field];if(state.key==='yardang')updateYardang(active);if(state.key==='history')updateRoute();if(state.key==='migration')updateMigration();if(state.key==='glacier')updateGlacier();
 const finiteVector=v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<1000);
 if(finiteVector(saved.camera)&&finiteVector(saved.target)){transition=null;camera.position.fromArray(saved.camera);orbit.target.fromArray(saved.target);orbit.update();}
 workspaceLayer('wire',!!saved.wire);workspaceLayer('markers',saved.markers!==false);
 if(restoreNavigation&&saved.navigation)historyPlatform?.restore(saved.navigation);
}
function platformLocate(onComplete){
 cancelPlatformArrival();platformArrival=onComplete??null;
 const home=workspaceHome(),radius=Math.max(9.4,home.position.length()*.9);
 transition={from:camera.position.clone(),to:spherePoint(84,43,radius),oldTarget:orbit.target.clone(),target:new THREE.Vector3(),start:performance.now(),duration:reducedMotion?1:1400};
 viewport.dataset.platformMotion='locating';
}
function platformNavigate(id,{restore,focus,worldFocus,focusOffset,distance,overview=false,structure=false,locate=false,bridge=false,onArrive,scaleHandoff=false,detailEntry=false,keepCamera=false}={}){
 cancelPlatformArrival();
 if(!workspaceScenes.some(s=>s.id===id))return;
 const oldId=work.scene,prior=workspaceState();delete prior.navigation;
 if(oldId)platformSceneCache.set(oldId,prior);
 let captured=false;
 if((oldId!==id||scaleHandoff)&&!reducedMotion){const c=$('transition-frame'),host=$('canvas-host');renderer.render(scene,camera);c.width=host.clientWidth;c.height=host.clientHeight;c.getContext('2d').drawImage(renderer.domElement,0,0,c.width,c.height);captured=true;}
 platformSelecting=true;
 const cached=restore??(!keepCamera&&!overview&&!focus&&!worldFocus&&!structure?platformSceneCache.get(id):null);
 if(cached)restoreWorkspace(cached,{restoreNavigation:false});else if(oldId!==id||overview)selectWorkspace(id);
 platformSelecting=false;
 if(focus||worldFocus){const target=worldFocus?new THREE.Vector3(...worldFocus):new THREE.Vector3(...terrainPoint(terrainDEM,focus[0],focus[1],state.exaggeration));if(!worldFocus)target.y+=structure?.85:.25;if(focusOffset)target.add(new THREE.Vector3(...focusOffset));const dir=camera.position.clone().sub(orbit.target).normalize();dir.y=Math.max(.5,dir.y);dir.normalize();const position=target.clone().addScaledVector(dir,distance??12);transition={from:camera.position.clone(),to:position,oldTarget:orbit.target.clone(),target,start:performance.now(),duration:reducedMotion?1:1500};}
 else if(overview){workspaceView(detailEntry&&lived?.active?'near':'fit',detailEntry?lived?.entryPose:null);if(detailEntry&&transition)transition.duration=reducedMotion?1:1550;}
 else if(locate){platformLocate();}
 if(captured){const c=$('transition-frame');c.style.display='block';c.style.opacity='1';renderer.domElement.style.opacity='0';sceneFade={start:performance.now(),duration:bridge?1500:scaleHandoff?1250:900,handoff:scaleHandoff};c.style.transformOrigin="45% 52%";if(!transition&&!cached){const to=camera.position.clone();camera.position.sub(orbit.target).multiplyScalar(1.15).add(orbit.target);transition={from:camera.position.clone(),to,oldTarget:orbit.target.clone(),target:orbit.target.clone(),start:performance.now(),duration:1200};}}
 if(onArrive){if(transition)platformArrival=onArrive;else onArrive(true);}
 viewport.dataset.platformMotion=focus?'approaching':captured?'scale-change':'settled';
}

function workspaceResponse() {
 if(historyMapLayer?.structureVisible)return `结构示意 · ${viewport.dataset.structureExploded==='true'?'屋盖已展开':'可展开屋盖'} · 非遗址复原`;
 if(lived?.active)return $('lived-story-state')?.textContent||$('lived-observation')?.textContent;
 return {terrain:`显示高度 ${state.exaggeration}× · 原始高程不变`,local:`显示高度 ${state.localExaggeration}× · 2024-09-04 观测影像`,glacier:state.glacierMode==='experiment'?`${budgetCaption(state.accumulation,state.ablation)} · 收缩 ${Math.round(state.retreat)}%`:state.glacierMode==='flow'?'方向与冰体为教学叠层':'2023-08-31 真实影像 × 高程',yardang:`${phaseLabel(state.erosion)} · ${Math.round(state.erosion)}%`,history:`行程 ${Math.round(state.route)}% · 教学路线`,migration:`西迁方向 ${Math.round(state.migration)}% · 历史主题示意`,karez:`${state.cutaway?'剖面已展开':'地表观察'} · 来水强度 ${state.flow}%`}[state.key]||'拖动环视，点选标记查看地点。';
}
function updatePins() {
  const width = workbenchMode?$('canvas-host').clientWidth:viewport.clientWidth, height = workbenchMode?$('canvas-host').clientHeight:viewport.clientHeight;
  const occupied = [];
  for (const pin of pins) {
    let visible = pin.group === active && active.visible && (!workbenchMode||work.markers) && (state.labels || !['terrain', 'local'].includes(state.key));
    if(knowledgeGuide?.active&&['earth','terrain'].includes(state.key))visible=false;
    if((viewport.classList.contains('ra-entry')||viewport.classList.contains('ej-active'))&&state.key==='terrain')visible=false;
    if(historyPlatform&&['region','event','place'].includes(historyPlatform.frame.stage)&&state.key==='terrain'&&!pin.data.landscape)visible=false;
    if(historyMapLayer?.structureVisible)visible=false;
    const point = pin.position();
    if (pin.marker) { pin.marker.position.copy(point); pin.marker.visible = visible; }
    if (visible && ['earth','migration'].includes(state.key)) visible = point.clone().normalize().dot(camera.position.clone().normalize()) > .26;
    scratch.copy(point).project(camera);
    visible &&= scratch.z >= -1 && scratch.z <= 1 && Math.abs(scratch.x) < .97 && Math.abs(scratch.y) < .93;
    // Keep projected labels clear of the narrative panel and the playback dock.
    const screenX=(scratch.x+1)/2*width,screenY=(1-scratch.y)/2*height;
    if(!workbenchMode&&!viewport.classList.contains('focus-mode'))visible&&=width<701?(screenY>270&&screenY<height-216):(screenX>290&&screenY<height-210);
    if(!workbenchMode&&state.key==='glacier'){const panel=$('glacier-station').getBoundingClientRect();visible&&=!(screenX>panel.left-35&&screenY>panel.top-12&&screenY<panel.bottom+15);}
    pin.button.hidden = !visible;
    if (visible) {
      const px = (scratch.x + 1) / 2 * width, py = (1 - scratch.y) / 2 * height - 7;
      const w = pin.button.offsetWidth, h = pin.button.offsetHeight;
      let labelX = px, labelY = py;
      for (const [dx, dy] of [[0, 0], [0, -28], [0, 28], [40, -14], [-40, 14], [0, -54], [0, 54]]) {
        labelX = THREE.MathUtils.clamp(px + dx, w / 2 + 8, width - w / 2 - 8); labelY = py + dy;
        const rect = { left: labelX - w / 2 - 4, right: labelX + w / 2 + 4, top: labelY - h - 3, bottom: labelY + 3 };
        if (!occupied.some(other => rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top)) { occupied.push(rect); break; }
      }
      pin.button.style.left = `${labelX}px`; pin.button.style.top = `${labelY}px`;
    }
  }
  // Project geographic north to keep the compass meaningful as the camera turns.
  const origin = new THREE.Vector3(0, 0, 0).project(camera), north = new THREE.Vector3(0, 0, -1).project(camera);
  const angle = Math.atan2(north.x - origin.x, north.y - origin.y) * 180 / Math.PI;
  document.querySelector('.north i').style.transform = `rotate(${angle}deg)`;
  document.querySelector('.north').hidden = ['earth','migration','karez','yardang'].includes(state.key);
}

document.addEventListener('visibilitychange',()=>{lastTime=performance.now();});
let flowTime = 0;
function render(time) {
  frameWindowCount++;if(time-frameWindowStart>=2000){viewport.dataset.renderFps=(frameWindowCount*1000/(time-frameWindowStart)).toFixed(1);frameWindowStart=time;frameWindowCount=0;}
  if(state.storyPlaying)storyHoldSeconds+=frameHold(time,lastTime,document.hidden);
  const delta=frameDelta(time,lastTime,document.hidden),dt=delta.animation;lastTime=time;
  historyPlatform?.tick(dt);const eventTransport=historyPlatform?.transport;
  const simDt=eventTransport?0:workbenchMode?(document.hidden?0:work.playing?dt*work.speed:work.pending):dt;
  if(workbenchMode){work.pending=0;work.time+=simDt;state.elapsed=eventTransport?eventTransport.time:work.time;}
  const simTime=eventTransport?eventTransport.time*1000:workbenchMode?work.time*1000:time;
  orbit.update();
  if(spatialFlight){storyHoldSeconds+=delta.story;updateSpatialFlight(time,dt);}
  if (transition) {
    const t = Math.max(0,Math.min(1, ((transition.pausedAt??time) - transition.start) / transition.duration));
    const frame=transition.kind==='stage-travel'?bridgeFrame(transition.from.toArray(),transition.to.toArray(),transition.oldTarget.toArray(),transition.target.toArray(),t):transition.kind==='globe'?globeFrame(transition.from.toArray(),transition.to.toArray(),transition.oldTarget.toArray(),transition.target.toArray(),t):cameraFrame(transition.from.toArray(),transition.to.toArray(),transition.oldTarget.toArray(),transition.target.toArray(),t,transition.lift);
    camera.position.fromArray(frame.position);orbit.target.fromArray(frame.target);camera.lookAt(orbit.target);
    if(transition.kind==='stage-travel')scene.background.lerpColors(transition.backgroundFrom,transition.backgroundTo,smoothStep(t));
    if (t >= 1){transition=null;const arrival=platformArrival;platformArrival=null;arrival?.(true);}
  }
  if(sceneFade){const t=Math.min(1,(time-sceneFade.start)/sceneFade.duration),blend=smoothStep(t);renderer.domElement.style.opacity=String(blend);$('transition-frame').style.opacity=String(1-blend);$('transition-frame').style.transform='none';if(t===1){sceneFade=null;$('transition-frame').style.display='none';$('transition-frame').width=0;$('transition-frame').height=0;$('transition-frame').style.transform='none';}}
  viewport.dataset.blend=sceneFade||spatialFlight?'moving':'settled';
  if(!workbenchMode&&!spatialFlight&&!transition&&(state.storyPlaying||lived?.decisionSelected&&!lived.decisionReady&&!demo.framingHeld)&&!reducedMotion&&!orbit.autoRotate){
    const home=cameraHome(state.key),hold=smoothStep(Math.max(0,(state.elapsed-2.6)/(shotDurationForUI()-2.6)));
    const offset=home.position.clone().sub(home.target).multiplyScalar(1-hold*(lived?.active?.07:.035));
    offset.applyAxisAngle(new THREE.Vector3(0,1,0),hold*.032);
    camera.position.copy(home.target).add(offset);orbit.target.copy(home.target);
    
    camera.lookAt(orbit.target);
  }
  viewport.dataset.camera=spatialFlight?.pausedAt!==undefined||transition?.pausedAt!==undefined?'held':spatialFlight||transition?'moving':'settled';
  updateSurfaceTime(simTime/1000);
  if(state.storyPlaying&&!spatialFlight) {
    const duration=shotDurationForUI();state.elapsed+=delta.story;
    const shots=stories[state.key],shot=demo.active&&demo.started?currentCue():shots[state.shot],next=demo.active&&demo.started?(cues[demo.cue+1]?.key===state.key?cues[demo.cue+1]:shot):shots[Math.min(state.shot+1,shots.length-1)],fraction=Math.max(0,Math.min(1,(state.elapsed/duration-.24)/.58));
    if(state.key==='history')state.route=phaseFrame(shot.route,shot.endRoute??next.route,fraction);
    if(state.key==='migration')state.migration=phaseFrame(shot.migration,next.migration,fraction);
    if(state.key==='yardang')state.erosion=phaseFrame(shot.erosion,next.erosion,fraction);
    if(state.key==='glacier'&&shot.mode==='experiment')state.retreat=phaseFrame(shot.retreat,next.retreat,fraction);
    if(demo.active&&state.voice&&demo.speaking&&state.elapsed>=duration)state.elapsed=duration-.01;
    if(demo.active&&demo.interactive&&currentCue().id==='water-ice'&&state.elapsed>=10&&!lived.waterSelected){pauseStory();demo.choicePending=true;lived.clearWater();updateDemoUI();}
    if(demo.active&&demo.interactive&&lived.decisionActive&&!lived.decisionSelected&&state.elapsed>=lived.decisionCheckpoint){pauseStory();demo.choicePending=true;updateDemoUI();}
    if(state.elapsed>=duration) {
      if(demo.active&&demo.started){if(demo.cue<cues.length-1){const overflow=state.elapsed-duration;setDemoCue(demo.cue+1,false,true);state.elapsed=overflow;}else{pauseStory();demo.ended=true;demo.summaryOpen=false;state.elapsed=duration;narrativeUI.reset();}}
      else if(state.shot<shots.length-1)setShot(state.shot+1);
      else if(state.touring&&order.indexOf(state.key)<order.length-1)switchScene(order[order.indexOf(state.key)+1],false,true);
      else {pauseStory();if(demo.active){demo.ended=true;state.elapsed=duration;}}
    }
  }
  const shotDuration=shotDurationForUI();
  $('story-progress-fill').style.width=`${(state.shot+Math.min(1,state.elapsed/shotDuration))/stories[state.key].length*100}%`;
  if (state.key === 'history' && (workbenchMode?simDt>0&&!lived?.active:state.playing)) { state.route = Math.min(100, state.route + simDt * 6); updateRoute(); if (state.route >= 100) { state.playing = false;if(workbenchMode)work.playing=false;updateRoute(); } }
  if (state.key === 'karez') {
    const station=active.userData.station;
    viewport.dataset.karezCutaway=String(state.cutaway);
    if(station?.enabled){station.set({supply:state.flow});station.update(simDt);if(simDt>0)renderer.shadowMap.needsUpdate=true;}
    const clip=active.userData.clipping,target=active.userData.cutTarget??0;
    clip.constant=reducedMotion?target:THREE.MathUtils.damp(clip.constant,target,5,dt);
    if(Math.abs(clip.constant-target)<.002)clip.constant=target;
    cutFaces.forEach(face=>{face.visible=clip.constant<2.54;face.position.z=clip.constant+.02;});
    if(Math.abs(clip.constant-target)>.002)renderer.shadowMap.needsUpdate=true;
    if ((workbenchMode?simDt>0:state.flowing && (!reducedMotion || $('flow-play').dataset.manual === 'true'))) flowTime += simDt * (.07 + state.flow / 100 * .13);
    flowParticles.forEach((particle, i) => {
      const along=(flowTime + particle.userData.offset) % 1;
      particle.visible = station?.enabled?station.particleVisible(along,i/flowParticles.length):state.flow > i / flowParticles.length * 100;
      particle.position.copy(active.userData.channel.getPoint(along));
      particle.position.z += .24;
    });
    if(!station?.enabled)pond.scale.y = .3 + state.flow / 100 * .9;
  }
  if(['earth','migration'].includes(state.key)&&active.userData.wind.visible) {
    const position=active.userData.windGeometry.attributes.position;
    for(let i=0;i<position.count;i++){const p=spherePoint(20+((i*.57+simTime*.007)%100),34+(i%8)*2,3.29);position.setXYZ(i,p.x,p.y,p.z);}position.needsUpdate=true;
  }
  if(state.key==='local'&&active.userData.waterPaths.visible)active.userData.flows.forEach(({curve,beads},i)=>beads.forEach((bead,j)=>{const t=(simTime*.00014+i*.19+j/5)%1;bead.position.copy(curve.getPoint(t));bead.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),curve.getTangent(t).normalize());}));
  if(state.key==='ecology')active.userData.rings.forEach((ring,i)=>ring.scale.setScalar(1+Math.sin(simTime*.0015+i)*.1));
  if(state.key==='yardang') {
    if(workbenchMode?simDt>0:state.eroding){state.erosion=Math.min(100,state.erosion+simDt*7);if(state.erosion>=100){state.eroding=false;if(workbenchMode)work.playing=false;}}
    const position=active.userData.wind.attributes.position;
    for(let i=0;i<position.count;i++)position.setXYZ(i,-9+((i*.91+simTime*.003)%18),.6+(i%13)/13*2.2,-4.7+(i%29)/29*9.4);
    position.needsUpdate=true;
  }
  if(state.key==='migration'&&(workbenchMode?simDt>0&&!lived?.active:state.migrating)){state.migration=Math.min(100,state.migration+simDt*7);if(state.migration>=100){state.migrating=false;if(workbenchMode)work.playing=false;}updateMigration();}
  if(state.key==='glacier') {
    if(workbenchMode?simDt>0&&state.glacierMode==='experiment':state.experiment){const prior=state.retreat;state.retreat=experimentStep(state.retreat,state.accumulation,state.ablation,simDt);if(state.retreat===0&&prior>0||state.retreat===100&&prior<100){state.experiment=false;if(workbenchMode)work.playing=false;}}
    const {flows,flowGroup,snow}=active.userData;
    if(flowGroup.visible)flows.forEach(({curve,arrows},i)=>arrows.forEach((arrow,j)=>{const t=(j/6+simTime*.000045+i*.07)%1;arrow.visible=t<1-visual.retreat*.0046;arrow.position.copy(curve.getPoint(t));arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),curve.getTangent(t).normalize());}));
    if(snow.visible){const position=snow.geometry.attributes.position;for(let i=0;i<position.count;i++){const curve=flows[i%flows.length].curve,p=curve.getPoint((i*.137)% .36);const falling=(i*.37+simTime*.0002)%1;position.setXYZ(i,p.x+Math.sin(i*2.3)*.65,p.y+.15+(1-falling)*1.7,p.z+Math.cos(i*1.7)*.65);}position.needsUpdate=true;snow.material.opacity=state.accumulation/100*.7;}
    updateGlacierStation();
  }
  let morphing=false;
  for(const [key,field,update] of [['yardang','erosion',()=>updateYardang(active)],['glacier','retreat',()=>updateGlacier()],['history','route',()=>updateRoute()],['migration','migration',()=>updateMigration()]])if(state.key===key){
    const gap=state[field]-visual[field];
    if(Math.abs(gap)>.025){visual[field]=reducedMotion?state[field]:THREE.MathUtils.damp(visual[field],state[field],5,dt);morphing=true;update();}
    else if(gap!==0){visual[field]=state[field];update();}
    viewport.dataset.phase=visual[field].toFixed(2);
  }
  viewport.dataset.animation=morphing?'moving':'settled';
  const travelProgress=transition?.kind==='stage-travel'?Math.max(0,Math.min(1,((transition.pausedAt??time)-transition.start)/transition.duration)):1;
  lived?.update(simTime,workbenchMode?simDt:spatialFlight?0:delta.story,state.elapsed,state.storyPlaying&&!spatialFlight,demo.summaryOpen,camera,travelProgress,historyPlatform?.linked?dt:0);
  if(lived?.stage==='people'&&viewport.dataset.settlementVisibleSignature!==viewport.dataset.settlementShadowDrawn){viewport.dataset.settlementShadowDrawn=viewport.dataset.settlementVisibleSignature;renderer.shadowMap.needsUpdate=true;}
  if(demo.active&&demo.started)soundscape?.update(currentCue(),Math.max(0,state.elapsed-cueVoiceDelay),state.storyPlaying&&!spatialFlight&&!document.hidden&&performance.now()>=captionHoldUntil,lived?.stats()?.dialogue,{active:state.storyPlaying&&!document.hidden,travelling:!!spatialFlight});else soundscape?.pause();
  lived?.perform(simTime/1000,historyPlatform?.linked?dt:workbenchMode?simDt:dt,soundscape?.performance,camera);
  soundscape?.observe(lived?.audioFrame(camera));
  soundscape?.setDialoguePosition(lived?.speechPan??0);
  const focusX=lived?.active?(workbenchMode?stageOrigins[lived.stage]:orbit.target.x):0,span=lived?.active&&lived.pose.overview?54:transition?.kind==='stage-travel'?26:16;
  if(workbenchMode){const a=work.light*Math.PI/180;sun.position.set(focusX+Math.sin(a)*14,13,Math.cos(a)*14);sun.target.position.set(focusX,0,0);}else {sun.position.x=focusX-10;sun.target.position.x=focusX;}
  fillLight.position.x=focusX+9;fillLight.target.position.x=focusX;
  if(sun.shadow.camera.right!==span){Object.assign(sun.shadow.camera,{left:-span,right:span,top:span,bottom:-span});sun.shadow.camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;}
  viewport.dataset.continuity=transition?.kind==='stage-travel'?'flight':sceneFade?'dissolve':'settled';
  spatialNavigation?.update({cue:currentCue(),group:active,camera,visible:demo.active&&!demo.summaryOpen&&!stagedCues[currentCue().id]?.recap,entry:!demo.started,flight:spatialFlight,notes:annotations?.frame??[],ledger:lived?.ledger??{}});
  for(const g of groups.values())if(g.userData.dem&&!g.userData.local){
   if(g.userData.sides)g.userData.sides.visible=!demo.active&&!viewport.classList.contains('ra-entry')&&!(viewport.classList.contains('ej-active')&&state.key==='terrain');
   if(g.userData.foundation)g.userData.foundation.visible=!demo.active&&!viewport.classList.contains('ra-entry')&&!(viewport.classList.contains('ej-active')&&state.key==='terrain');
   if(g.userData.storyOutline)g.userData.storyOutline.visible=demo.active;
  }
  // Local surface orbit must never put the camera inside the Earth.
  if(knowledgeGuide?.surfaceActive&&camera.position.length()<3.3){camera.position.normalize().multiplyScalar(3.3);camera.lookAt(orbit.target);camera.updateMatrixWorld();}
  const marking=!spatialFlight&&demo.active&&demo.started&&!demo.summaryOpen&&performance.now()>=captionHoldUntil&&!transition&&!sceneFade;
  const inquiry=inquiryFrame(currentCue(),lived?.ledger);inquiryUI??=installInquiryUI(viewport);inquiryUI.update(inquiry,demo.active&&demo.started&&!demo.summaryOpen&&!spatialFlight);
  const live={...lived?.stats(),inquiry,goods:viewport.dataset.goods,priority:viewport.dataset.householdPriority,memoryHandoff:Number(viewport.dataset.memoryHandoff??0)};
  const presentation=presentationFrame({elapsed:state.elapsed,live:lived?.active?live:null,flight:!!spatialFlight,ended:demo.ended,captionsReady:marking});
  sceneReading??=installSceneReading(viewport,{onPause(){if(state.storyPlaying)pauseStory();updateDemoUI();}});if(demo.active&&demo.started)sceneReading.update({...filmFrame(),presentation});
  liveCaptions??=installLiveCaptions(viewport);
  const spoken=soundscape?.narration;
  liveCaptions.update({id:currentCue().id,elapsed:spoken?.id===currentCue().id?spoken.elapsed:Math.max(0,state.elapsed-cueVoiceDelay),ready:demo.active&&demo.started&&!demo.summaryOpen&&marking,dialogue:live?.dialogue});
  annotations?.update({cue:currentCue().id,live,actorGroup:lived?.group,anchors:sceneAnnotationAnchors({group:lived?.active?lived.group:null,stage:lived?.stage,active,key:state.key,goods:viewport.dataset.goods,memory:viewport.dataset.memoryChoice,voice:live.civicVoice}),camera,visible:marking&&presentation.annotation,dialogue:!!live.dialogue,bridge:!!bridges[currentCue().id]&&state.elapsed<4.4,time:time/1000,elapsed:state.elapsed});
  if(lived?.active&&(!workbenchMode||simDt>0)&&time-lastLivedShadow>100){renderer.shadowMap.needsUpdate=true;lastLivedShadow=time;}
  if(historyPlatform){viewport.dataset.gpuGeometries=renderer.info.memory.geometries;viewport.dataset.gpuTextures=renderer.info.memory.textures;viewport.dataset.platformMotion=transition?'moving':'settled';viewport.dataset.cameraPosition=JSON.stringify(camera.position.toArray().map(v=>Math.round(v*1000)/1000));viewport.dataset.cameraTarget=JSON.stringify(orbit.target.toArray().map(v=>Math.round(v*1000)/1000));}
  updatePins();historyMapLayer?.update(camera,viewport.dataset.directorActive==='true'&&viewport.dataset.directorPlaying==='false'?0:dt,work.markers);geographicExplorer?.update(camera,dt,work.markers);knowledgeGuide?.update(camera,dt,work.markers);updateDemoMap(time);updateAtlasMarkers();updateDemoUI();renderer.render(scene,camera);captureFrame?.();
  if(workbench)workbench.update({...work,response:workspaceResponse(),...eventTransport});
  if (active) viewport.dataset.rendered = 'true';
}

function showFatal(error) {
  $('loading').hidden = true;
  $('fatal').hidden = false;
  $('fatal').replaceChildren(document.createTextNode('三维场景暂时无法加载。请检查浏览器的 WebGL 2 支持与本地资源，然后刷新。 '));
  const link = document.createElement('a'); link.href = './research.html'; link.textContent = '阅读能力研究 →'; $('fatal').append(link);
  viewport.dataset.rendered = 'error';
  console.error('Xinjiang sandbox:', error);
}

async function start() {
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0x05080c, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
    renderer.localClippingEnabled = true;
    renderer.domElement.setAttribute('aria-label', '三维场景：拖动旋转、滚轮缩放，使用上方场景按钮与地点标记探索');
    renderer.domElement.setAttribute('role', 'img');
    $('canvas-host').append(renderer.domElement);
    scene = new THREE.Scene();
    skyLight=new THREE.HemisphereLight(0xd1dfe7,0x6e665b,1.55);scene.add(skyLight);
    sun = new THREE.DirectionalLight(0xffead0, 2.8); sun.position.set(-10, 13, -7); sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536); sun.shadow.camera.left = -16; sun.shadow.camera.right = 16; sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16; sun.shadow.normalBias=.025; sun.shadow.bias = -.0003; scene.add(sun,sun.target);
    fillLight = new THREE.DirectionalLight(0xc1d6df,.75);fillLight.position.set(9,5,8);scene.add(fillLight,fillLight.target);
    const starPositions = new Float32Array(260 * 3);
    let seed = 137;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < starPositions.length; i++) starPositions[i] = (random() - .5) * 170;
    const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    stars=new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xc4d9e9, size: .15, transparent: true, opacity: .7, depthWrite: false }));scene.add(stars);
    camera = new THREE.PerspectiveCamera(43, 1, .1, 220);
    orbit = new OrbitControls(camera, renderer.domElement); orbit.enableDamping = true; orbit.dampingFactor = .07; orbit.enablePan = false; orbit.autoRotateSpeed = .5;
    orbit.addEventListener('start', () => { if(knowledgeGuide?.adjustDirectorView())return;cancelPlatformArrival();transition = null;demo.framingHeld=true;pauseStory(); });
    let lastNarrow,lastAtlasSize;
    const resize = () => {
      const width = workbenchMode?$('canvas-host').clientWidth:viewport.clientWidth, height = workbenchMode?$('canvas-host').clientHeight:viewport.clientHeight;
      renderer.setSize(width,height);camera.aspect=width/height;
      if(workbenchMode||viewport.classList.contains('focus-mode'))camera.clearViewOffset();
      else {const home=demo.active&&!demo.started,live=demo.active&&lived?.active;camera.setViewOffset(width,height,width<701?0:width*(home?(width>=701&&width<1050?-.10:-.19):live?.035:demo.active?-.015:state.key==='glacier'?-.025:-.11),height*(home?(width<701?-.035:height<760?.06:.02):demo.active?(width<701&&live?.24:.11):width<701?.02:.085),width,height);}
      if(workbenchMode){const entry=viewport.classList.contains('ra-entry')&&state.key==='terrain',flow=viewport.classList.contains('ej-active');if((entry||flow)&&!viewport.classList.contains('wb-clean')&&width>700)camera.setViewOffset(width,height,width*(flow?.10:0),height*(entry?.15:state.key==='terrain'?.04:0),width,height);else camera.clearViewOffset();}camera.updateProjectionMatrix();
      const narrow=width<701;
      const atlasSize=width+'/'+height;
      const atlasResized=demo.active&&!demo.started&&lastAtlasSize!==undefined&&atlasSize!==lastAtlasSize;
      if(active&&!workbenchMode&&((lastNarrow!==undefined&&narrow!==lastNarrow)||atlasResized))resetView(true);
      lastNarrow=narrow;lastAtlasSize=atlasSize;
    };
    resizeViewport=resize;new ResizeObserver(resize).observe(workbenchMode?$('canvas-host'):viewport);window.addEventListener('resize',resize);resize();
    const fetchDEM = async name => { const response = await fetch(`./assets/${name}-dem.json`); if (!response.ok) throw new Error(`DEM ${name}: ${response.status}`); return response.json(); };
    [earthTexture,regionalTexture,localTexture,glacierTexture,terrainDEM,localDEM,glacierDEM]=await Promise.all([new THREE.TextureLoader().loadAsync('./assets/earth-blue-marble.jpg'),new THREE.TextureLoader().loadAsync('./assets/xinjiang-blue-marble-500m.jpg'),new THREE.TextureLoader().loadAsync('./assets/tianchi-sentinel-20240904.jpg'),new THREE.TextureLoader().loadAsync('./assets/glacier-sentinel-20230831.jpg'),fetchDEM('xinjiang'),fetchDEM('tianchi'),fetchDEM('glacier')]);
    for(const texture of [earthTexture,regionalTexture,localTexture,glacierTexture]) {texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
    placeLandscape=installPlaceLandscape(scene,terrainDEM,regionalTexture);
    terrainArrival=installTerrainArrival(terrainDEM);
    regionalDisplayDEM=displayTerrain(terrainDEM,3);soundscape=installSoundscape($('demo-sound'),viewport);
    lived=installLivedScenes(scene,{viewport,needsWaterChoice:()=>demo.interactive,onStoryChoice:()=>{demo.choicePending=false;updateDemoUI();},onStoryContinue:id=>{if(workbenchMode)return;demo.choicePending=false;demo.takenOver=false;state.storyPlaying=true;state.touring=true;setDemoCue(cues.findIndex(c=>c.id===id),false,true);updateDemoUI();},onSound:(kind,stage)=>{if(!workbenchMode)soundscape.event(kind,stage);},onDialogue:id=>{if(!workbenchMode)soundscape.say(id);},onWaterChoice:()=>{demo.choicePending=false;updateDemoUI();},onWaterContinue:()=>{if(workbenchMode)return;demo.choicePending=false;demo.takenOver=false;state.storyPlaying=true;state.touring=true;setDemoCue(cues.findIndex(c=>c.id==='water-valley'));updateDemoUI();},terrainSource:()=>{if(!groups.has('history')){const group=createHistory();group.visible=false;groups.set('history',group);scene.add(group);}return groups.get('history');},onTakeControl:()=>{if(workbenchMode){historyPlatform?.takeControl();work.playing=true;return;}demo.interactive=true;pauseStory();soundscape?.engage();transition=null;demo.takenOver=true;updateDemoUI();},onFocus:()=>{if(workbenchMode&&knowledgeGuide?.active)workspaceView('near');else if(!workbenchMode)resetView();}});
    annotations=installAnnotations({viewport,scene});
    captureFrame=installCapture(renderer,$('capture'),$('capture-status'),filmFrame,()=>{soundscape.unlock();return soundscape.stream;},()=>soundscape.events);
    const params=new URLSearchParams(location.search),requestedScene=params.get('scene');
    renderChapters();switchScene(order.includes(requestedScene)?requestedScene:'earth',true);bindDemo();spatialNavigation=installSpatialNavigation({viewport,onEarth:()=>showSpatialEntry('planet'),onRegion:()=>showSpatialEntry('region'),onVisit:p=>{demo.interactive=true;seekDemo(cues.find(c=>c.id===p.cue).start,true);}});viewport.dataset.entryScale=entryScale;
    if(!workbenchMode&&(!requestedScene||params.has('demo')))setDemoMode(true);
    if(workbenchMode){
      workbench=installWorkbench({viewport,select:selectWorkspace,view:workspaceView,layer:workspaceLayer,lighting:value=>{work.light=value;renderer.shadowMap.needsUpdate=true;},read:workspaceState,restore:restoreWorkspace,reset:()=>{if(!historyPlatform?.clock('reset'))selectWorkspace(work.scene,{reset:true});},clock:(action,value)=>{if(historyPlatform?.clock(action,value))return;if(work.scene==='terrain'&&['toggle','step'].includes(action))return;if(action==='toggle')work.playing=!work.playing;if(action==='step'){work.playing=false;work.pending+=1;}if(action==='speed')work.speed=value;},capture:()=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`xinjiang-${work.scene}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);workbench.notify('已导出当前三维模型截图。');},'image/png');},source:item=>{if(item.cue){const info=sceneInfo[item.id],entry=sources[info.source];return {description:item.hint,text:info.scope,links:[[entry.title,entry.url]]};}const lesson=lessons[item.id];return {description:lesson.body,text:lesson.source,links:lesson.links};}});
      selectWorkspace(workspaceScenes.some(s=>s.id===requestedScene)?requestedScene:'earth');
      historyMapLayer=installHistoryMapLayer({scene,viewport,dem:terrainDEM,earthTexture,elevationScale:()=>state.exaggeration,onVisit:id=>knowledgeGuide?.eventActive?knowledgeGuide.visitEventPlace(id):historyPlatform?.visit(id),onPart:index=>knowledgeGuide?.structureActive?knowledgeGuide.selectStructurePart(index):historyPlatform?.selectPart(index),onFocus:index=>knowledgeGuide?.eventActive?knowledgeGuide.seekEventPhase(index):historyPlatform?.focusReading(index)});
      historyPlatform=installHistoryPlatform({viewport,adapter:{read:()=>{const s=workspaceState();if(transition?.to){s.camera=transition.to.toArray();s.target=transition.target.toArray();}return s;},navigate:platformNavigate,resumeGuide:record=>knowledgeGuide?.resumeObservation(record),feedback:workspaceResponse,resize:()=>resizeViewport?.(),presentation:entry=>{setRegionalPresentation(entry);if(entry&&state.key==='terrain')scene.background=new THREE.Color(0x101619);if(active?.userData.sides&&!active.userData.local){active.userData.sides.visible=!entry;active.userData.foundation.visible=!entry;}},pause:()=>{work.playing=false;},locate:platformLocate,approachRegion:platformLocate,cancelArrival:cancelPlatformArrival,stopApproach:()=>{cancelPlatformArrival();transition=null;},eventAnchor:index=>historyMapLayer.readingAnchor(index),focusModel:()=>workspaceView('near'),eventProgress:(id,f)=>{if(id==='history'){state.route=f.route*100;updateRoute();}if(id==='migration'){state.migration=f.travel*100;updateMigration();}if(id==='karez'){state.flow=(f.water||f.network)*100;flowTime=f.progress*3;if($('flow-range'))$('flow-range').value=state.flow;if($('flow-output'))$('flow-output').textContent=Math.round(state.flow)+'%';}lived?.historyProgress(f);},setMapLayer:config=>{historyMapLayer.set({...config,visible:config.visible&&!geographicExplorer?.active&&!knowledgeGuide?.active});renderer.shadowMap.needsUpdate=true;},structurePart:index=>historyMapLayer.selectPart(index),structureExplode:value=>historyMapLayer.explode(value)}});
    }
    if(workbenchMode){const explorationAdapter={
      height:()=>state.exaggeration,restore:saved=>{platformSelecting=true;try{restoreWorkspace(saved,{restoreNavigation:false});}finally{platformSelecting=false;}},record:()=>historyPlatform.recordObservation(),glacierAnchors:()=>state.key==='glacier'?[['surface','一号冰川 · 真实地表',86.817,43.10],['upstream','上游冰雪 · 观察',86.804,43.103],['downstream','下游方向 · 示意',86.811,43.114]].map(([id,label,lon,lat])=>{const point=terrainPoint(active.userData.dem,lon,lat,active.userData.exaggeration);point[1]+=.4;return {id,label,point};}):[],glacier:options=>{if(state.key!=='glacier')return;if(options.mode)setGlacierMode(options.mode);if(options.reveal!==undefined){active.userData.flowGroup.visible=options.mode!=='observation';active.userData.flowGroup.scale.setScalar(Math.max(.001,options.reveal));}for(const key of ['retreat','accumulation','ablation'])if(options[key]!==undefined)state[key]=options[key];active.userData.showGhost=true;state.experiment=false;updateGlacier(active,state.retreat);stationSignature='';updateGlacierStation();},read:()=>{const s=workspaceState();if(transition?.to){s.camera=transition.to.toArray();s.target=transition.target.toArray();}return s;},resize:resizeViewport,scene:(id,options)=>{historyPlatform.exploreScene(id,options);if(id==='karez'){scene.background=new THREE.Color(0x101619);if(scene.fog)scene.fog.color.set(0x101619);}},
      structure:({show=false,open,part,motion}={})=>{if(show)historyMapLayer.set({visible:true,event:eventById('protectorate'),nodeId:'luntai',phase:2,progress:1,structure:true,labelsVisible:false});if(open!==undefined)historyMapLayer.explode(open);if(part!==undefined&&part>=0)historyMapLayer.selectPart(part);if(motion!==undefined)historyMapLayer.holdStructure(!motion);renderer.shadowMap.needsUpdate=true;},structurePoint:index=>historyMapLayer.partPoint(index),structureFocus:p=>{if(p){platformNavigate('terrain',{structure:true,worldFocus:p,distance:5});}else platformNavigate('terrain',{structure:true,focus:[84.25,41.78],distance:7});},structureConnection:options=>options===undefined?historyMapLayer.connectionState():historyMapLayer.playConnection(options),
      guideEvent:config=>{historyMapLayer.set({...config,visible:true,overview:null,structure:false});renderer.shadowMap.needsUpdate=true;},hideMap:()=>historyMapLayer.hide(),cancel:()=>{cancelPlatformArrival();transition=null;},locate:platformLocate,
      interruptView:()=>{for(let i=0;i<3&&(transition||platformArrival);i++){if(transition){camera.position.copy(transition.to);orbit.target.copy(transition.target);transition=null;}const arrive=platformArrival;platformArrival=null;arrive?.(true);}orbit.autoRotate=false;orbit.update();},
      planet:()=>groups.get('earth'),regionalTexture:()=>regionalTexture,worldView:({lon=78,lat=30,distance=12,fit=false,surface=0,tilt=0,bearing=0,onArrive,duration=1900}={})=>{
       cancelPlatformArrival();orbit.autoRotate=false;
       const host=$('canvas-host'),aspect=Math.max(.35,host.clientWidth/host.clientHeight),tan=Math.tan(camera.fov*Math.PI/360),radius=fit?Math.max(distance,3.9/(tan*Math.min(aspect,1.3))):distance;
       const view=globeViewVectors({lon,lat,distance:radius,surface,tilt,bearing});viewport.dataset.worldViewTilt=String(tilt);
       transition={kind:'globe',from:camera.position.clone(),to:new THREE.Vector3(...view.position),oldTarget:orbit.target.clone(),target:new THREE.Vector3(...view.target),start:performance.now(),duration:reducedMotion?1:duration};
       if(onArrive)platformArrival=onArrive;orbit.minDistance=surface?.18:2.1;orbit.maxDistance=38;orbit.minPolarAngle=.015;orbit.maxPolarAngle=Math.PI-.015;
      },
      worldRestore:(saved,{animate=false}={})=>{cancelPlatformArrival();transition=null;orbit.autoRotate=false;orbit.minDistance=.18;orbit.maxDistance=38;orbit.minPolarAngle=.015;orbit.maxPolarAngle=Math.PI-.015;if(animate&&!reducedMotion)transition={kind:'globe',from:camera.position.clone(),to:new THREE.Vector3(...saved.camera),oldTarget:orbit.target.clone(),target:new THREE.Vector3(...saved.target),start:performance.now(),duration:1900};else{camera.position.fromArray(saved.camera);orbit.target.fromArray(saved.target);orbit.update();}},
      exit:()=>historyPlatform.region({overview:true,located:true}),event:(id='zhang',options={})=>historyPlatform.openEvent(id,{fresh:true,fromEntry:true,...options}),eventPlace:id=>historyPlatform.visit(id),running:()=>work.playing,modelState:()=>({cutaway:state.cutaway,flow:state.flow,playing:work.playing}),
      stopPassage:()=>geographicExplorer?.stop(false),response:()=>lived?.active?[workspaceResponse(),$('lived-observation')?.textContent].filter(Boolean).join(' '):workspaceResponse(),
      environment:p=>{placeLandscape.hide();if(!p){viewport.dataset.placeLandscape='false';return;}const world=lived?.active?lived.group:work.scene==='karez'?active:null;if(!world)return;const settings=work.scene==='karez'?{opening:[8.4,3.3],floor:-1.73}:{};if(placeLandscape.prepare(p,world,terrainDimensions(terrainDEM),state.exaggeration,settings)){placeLandscape.show(true);viewport.dataset.placeLandscape='true';scene.background=new THREE.Color(0x273630);scene.fog=new THREE.FogExp2(0x273630,.013);if(lived?.active){sun.color.set(0xffead0);sun.intensity=2.05;skyLight.intensity=1.25;fillLight.intensity=.62;}renderer.shadowMap.needsUpdate=true;}},
      envoyFrame:(p,options)=>{const g=groups.get('journey');if(!g)return;const before=new THREE.Vector3(...g.userData.follow),f=g.userData.update(p,options);viewport.dataset.envoyGeometry=JSON.stringify({...g.userData.visibility,visible:g.visible});if(options.follow){const delta=new THREE.Vector3(...g.userData.follow).sub(before);camera.position.add(delta);orbit.target.add(delta);if(transition){transition.from.add(delta);transition.to.add(delta);transition.oldTarget.add(delta);transition.target.add(delta);}}return f;},envoyAnchors:()=>groups.get('journey')?.userData.anchors()??[],
      envoyFocus:(phase='walk')=>{if(state.key!=='journey')return;cancelPlatformArrival();const p=new THREE.Vector3(...(active.userData.follow??[-30,0,0]));p.y+=1.25;const host=$('canvas-host'),aspect=host.clientWidth/host.clientHeight;const pose=desertCameraPose(new THREE.Vector3(...active.userData.follow),phase,aspect),offset=pose.position.clone().sub(p);transition={from:camera.position.clone(),to:p.clone().add(offset),oldTarget:orbit.target.clone(),target:p,start:performance.now(),duration:reducedMotion?1:1500};orbit.minDistance=2.5;orbit.maxDistance=85;orbit.minPolarAngle=.05;orbit.maxPolarAngle=Math.PI*.49;},
      modelFocus:p=>{cancelPlatformArrival();const target=new THREE.Vector3(...p),dir=camera.position.clone().sub(orbit.target).normalize();dir.y=Math.max(.5,dir.y);dir.normalize();transition={from:camera.position.clone(),to:target.clone().addScaledVector(dir,12),oldTarget:orbit.target.clone(),target,start:performance.now(),duration:reducedMotion?1:1200};},modelOverview:()=>workspaceView('fit'),
      karez:options=>{const station=groups.get('karez')?.userData.station;if(options)station?.set(options);return station?.enabled?{...station.state(),reading:station.reading()}:null;},
      pose:kind=>{if(kind==='top'){workspaceView('top');return;}const target=new THREE.Vector3(0,.5,0),position=new THREE.Vector3(0,5.8,18);transition={from:camera.position.clone(),to:position,oldTarget:orbit.target.clone(),target,start:performance.now(),duration:reducedMotion?1:1100};},
      marketChoice:goods=>lived?.chooseMarket(goods,{record:false}),
      familyChoice:priority=>lived?.choosePriority(priority,{record:false}),settlementTime:value=>lived?.setSettlementChronology(value),
      settlementView:focus=>{if(lived?.stage!=='people')return;cancelPlatformArrival();setPeriodFocus(lived.group?.userData.chronology?.period,focus);viewport.dataset.settlementDetailFocus=focus;const host=$('canvas-host'),look=focus==='story'?(settlementStory[viewport.dataset.settlementChronology]?.steps[0].focus??'overview'):focus,p=settlementCameraPose(look,stageOrigins.people,host.clientWidth/host.clientHeight,camera.fov);transition={from:camera.position.clone(),to:p.position,oldTarget:orbit.target.clone(),target:p.target,start:performance.now(),duration:reducedMotion?1:1200};orbit.minDistance=p.min;orbit.maxDistance=p.max;orbit.enablePan=true;orbit.maxPolarAngle=Math.PI*.49;},
      localLook:({model,frame})=>{const host=$('canvas-host');let target,direction,distance;if(model==='market'){if(lived?.stage!=='market')return false;const spec=marketObservationPose(frame,JSON.parse(viewport.dataset.marketActors||'[]'),host.clientWidth/host.clientHeight,camera.fov);target=new THREE.Vector3(...spec.target);direction=new THREE.Vector3(...spec.direction).normalize();distance=spec.distance;}else{if(!historyMapLayer.structureVisible)return false;const index={gate:0,passage:1,inside:3,overview:1}[frame.focus]??1;target=new THREE.Vector3(...historyMapLayer.partPoint(index));if(index===0)target.y-=.6;else if(index===1)target.y+=.35;direction=new THREE.Vector3(.32,.90,1).normalize();distance=Math.max(frame.index===0?5.2:6.8,5.8/(2*Math.tan(camera.fov*Math.PI/360)*Math.max(.35,host.clientWidth/host.clientHeight)*.88));}cancelPlatformArrival();transition={from:camera.position.clone(),to:target.clone().addScaledVector(direction,distance),oldTarget:orbit.target.clone(),target,start:performance.now(),duration:reducedMotion?1:1500};orbit.minDistance=2.5;orbit.maxDistance=180;orbit.enablePan=true;orbit.maxPolarAngle=Math.PI*.49;return true;},
      settlementLook:focus=>{if(lived?.stage!=='people')return;cancelPlatformArrival();const host=$('canvas-host'),p=settlementCameraPose(focus,stageOrigins.people,host.clientWidth/host.clientHeight,camera.fov);transition={from:camera.position.clone(),to:p.position,oldTarget:orbit.target.clone(),target:p.target,start:performance.now(),duration:reducedMotion?1:1800};orbit.minDistance=p.min;orbit.maxDistance=p.max;orbit.enablePan=true;orbit.maxPolarAngle=Math.PI*.49;},
      model:options=>{if(typeof options.playing==='boolean')work.playing=options.playing;if(typeof options.flow==='number'){state.flow=options.flow;if($('flow-range'))$('flow-range').value=state.flow;if($('flow-output'))$('flow-output').textContent=state.flow+'%';}if(typeof options.cutaway==='boolean'){state.cutaway=options.cutaway;if($('cutaway-toggle'))$('cutaway-toggle').checked=state.cutaway;setCutaway();}}
    };
    geographicExplorer=installGeographicExplorer({scene,viewport,dem:terrainDEM,adapter:explorationAdapter});
    knowledgeGuide=installKnowledgeGuide({scene,viewport,dem:terrainDEM,adapter:explorationAdapter,defaultEntry:entryParams.size===0||(!entryParams.has('learn')&&!entryParams.has('explore')&&!entryParams.has('demo')&&!entryParams.has('cue')&&!entryParams.has('config')&&(entryParams.get('stage')==='planet'||entryParams.get('scene')==='earth'&&!entryParams.has('stage')))});}
    const requestedCue=cues.find(c=>c.id===params.get('cue'));
    if(requestedCue){setDemoMode(true);demo.interactive=true;seekDemo(requestedCue.start,false,true);}
    else if(params.get('autoplay')==='1')startDemo();
    atlas.setReady(true);$('loading').hidden=true;
    $('next-scene').addEventListener('click',()=>advanceScene(1));$('previous-scene').addEventListener('click',()=>advanceScene(-1));
    document.querySelectorAll('.mode-nav [data-category]').forEach(button=>button.addEventListener('click',()=>{pauseStory();setCategory(button.dataset.category);}));
    $('story-play').addEventListener('click',()=>{
      if(state.storyPlaying){pauseStory();transition=null;return;}
      state.touring=false;state.storyPlaying=true;if(state.elapsed>=shotDurationForUI())setShot(0);updateStoryUI();speakShot();
      if(state.key==='glacier'&&state.glacierMode==='experiment'){state.experiment=false;state.accumulation=40;state.ablation=80;$('lesson-title').textContent=stories.glacier[state.shot].heading;$('lesson-body').textContent=stories.glacier[state.shot].text;$('journey-caption').textContent=stories.glacier[state.shot].heading;}
    });
    $('tour-play').addEventListener('click',()=>{
      startDemo();
    });
    $('voice').addEventListener('click',()=>{
      if(!('speechSynthesis' in window)){$('play-status').textContent='语音不可用 · 阅读字幕';return;}
      state.voice=!state.voice;$('voice').setAttribute('aria-pressed',String(state.voice));if(state.voice)speakShot();else speechSynthesis.cancel();
    });
    $('reset-view').addEventListener('click', () => resetView());
    $('rotate').addEventListener('click', () => { orbit.autoRotate = !orbit.autoRotate; $('rotate').setAttribute('aria-pressed', String(orbit.autoRotate)); });
    const setFocusMode = enabled => {
      viewport.classList.toggle('focus-mode', enabled); document.body.classList.toggle('view-focused', enabled);
      $('fullscreen').title = enabled ? '退出全屏' : '全屏观看';
      $('fullscreen').setAttribute('aria-pressed', String(enabled));
      resize();
    };
    // Keep the complete scene inside the page in browsers and embedded webviews.
    $('fullscreen').addEventListener('click', () => setFocusMode(!viewport.classList.contains('focus-mode')));
    $('close-selection').addEventListener('click', () => { $('selection').hidden = true; $('selection').dataset.lastAction = 'close-button'; pins.forEach(pin => pin.button.classList.remove('selected')); });
    $('place-action').addEventListener('click', () => switchScene('local'));
    const closeSources = () => { $('source-panel').hidden = true; $('data-button').setAttribute('aria-expanded', 'false'); };
    $('data-button').addEventListener('click', () => { const open = $('source-panel').hidden; $('source-panel').hidden = !open; $('data-button').setAttribute('aria-expanded', String(open)); if (open) { $('selection').hidden = true; $('selection').dataset.lastAction = 'sources-open'; } });
    $('close-sources').addEventListener('click', closeSources);
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeSources(); $('selection').hidden = true; $('selection').dataset.lastAction = 'escape-key'; setFocusMode(false); } });
    renderer.domElement.addEventListener('webglcontextlost',event=>{
      event.preventDefault();if(unloading)return;
      resumeAfterRestore=state.storyPlaying;pauseStory();renderer.setAnimationLoop(null);
      viewport.dataset.renderer='recovering';$('loading').hidden=false;$('loading').textContent='正在恢复画面，讲解已暂停。';
    });
    renderer.domElement.addEventListener('webglcontextrestored',()=>{
      if(unloading)return;renderer.resetState();renderer.shadowMap.needsUpdate=true;
      sceneFade=null;transition=null;$('transition-frame').style.display='none';renderer.domElement.style.opacity='1';lastTime=performance.now();
      state.storyPlaying=resumeAfterRestore;state.touring=demo.active&&resumeAfterRestore;updateStoryUI();updateDemoUI();
      viewport.dataset.renderer='ready';$('loading').hidden=true;renderer.setAnimationLoop(render);if(state.storyPlaying)speakShot();
    });
    window.addEventListener('pagehide',()=>{unloading=true;renderer.setAnimationLoop(null);orbit.dispose();renderer.dispose();renderer.forceContextLoss();});
    viewport.dataset.renderer='ready';
    renderer.setAnimationLoop(render);
  } catch (error) { showFatal(error); }
}
start();
