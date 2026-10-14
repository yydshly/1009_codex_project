from pathlib import Path
P=Path(__file__).resolve().parents[1]/'web/public'
def edit(name,old,new):
 p=P/name;s=p.read_text('utf-8');assert old in s,(name,old[:80]);p.write_text(s.replace(old,new,1),'utf-8')
edit('envoy-desert.js',"a.applyPerformance(time,{dt:delta,expression:","a.applyPerformance({time,dt:delta,expression:")
edit('envoy-desert.js',"const arm=a.limbs.find(l=>l.type==='arm');if(arm)arm.pivot.rotation.x=-.65;","a.limbs[1].arm.rotation.x=-.9;a.limbs[1].elbow.rotation.x=-1.2;")
edit('lessons.js','export const lessons = {',"""export const lessons = {
  journey:{title:'荒漠里的远行',kicker:'ENVOY / DESERT',scale:'远行情境',subtitle:'从地域方向，走近使团的脚步',kind:'历史与环境',heading:'远行，需要怎样前进？',body:'使者、随从与驮载在荒漠中行进。观察风沙、行装与取水照应，再回到历史地图。',caption:'原创远行情境 · 非精确行程复原',next:'返回历史地图',source:'出使、十余年扣留、大宛与大月氏据中国国家博物馆。人物、服饰、荒漠与行进细节为原创环境情境。',links:[['中国国家博物馆 · 出使经历','https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/']]},""")
edit('story.js','export const catalog = {',"export const catalog = {\n  journey:{category:'model',short:'荒漠使团',note:'原创历史环境情境 · 地域方向非考定行程'},")
p=P/'story.js';p.write_text(p.read_text('utf-8')+"\nstories.journey=[{label:'跟随使团',title:'荒漠里的远行',text:'行走、风沙与停留',camera:[-18,8,17],target:[-25,1,0],framing:'close'}];\n",'utf-8')
edit('workbench.js','export const workspaceScenes = [',"export const workspaceScenes = [\n {id:'journey',name:'荒漠里的使团',group:'历史与生活',tag:'可控制的远行',hint:'跟随张骞第一次出使的地域方向，走近荒漠；控制风沙、取水与行进。'},")
edit('workbench.js','14 个可操作场景','15 个可操作场景')
edit('sandbox.js',"import {installPlaceLandscape}","import {createEnvoyDesert} from './envoy-desert.js';\nimport {installPlaceLandscape}")
edit('sandbox.js',"else if (key === 'history') group = createHistory();","else if (key === 'history') group = createHistory();\n    else if (key === 'journey') group = createEnvoyDesert();")
edit('sandbox.js',"if(backgrounds.has(key))return backgrounds.get(key);","if(backgrounds.has(key))return backgrounds.get(key);\n  if(key==='journey'){const c=document.createElement('canvas');c.width=4;c.height=128;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#7d9da4');g.addColorStop(.6,'#d3c6a5');g.addColorStop(1,'#d8b885');x.fillStyle=g;x.fillRect(0,0,4,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;backgrounds.set(key,t);return t;}")
edit('sandbox.js',"const host=$('canvas-host'),tan=", "const host=$('canvas-host'),tan=") if False else None
edit('sandbox.js',"function workspaceHome() {", """function workspaceHome() {
 if(state.key==='journey'){const p=new THREE.Vector3(...(active.userData.follow??[-30,0,0]));p.y+=1.2;return {position:p.clone().add(new THREE.Vector3(6,5,13)),target:p,min:2.5,max:85};}""")
edit('sandbox.js',"if(key==='glacier'){sun.intensity=1.5;","if(key==='journey'){scene.fog=new THREE.FogExp2(0xd7bd96,.012);sun.color.set(0xffdfaf);sun.intensity=2.4;skyLight.intensity=1.15;fillLight.intensity=.55;renderer.toneMappingExposure=1.08;}\n  if(key==='glacier'){sun.intensity=1.5;")
edit('sandbox.js',"modelFocus:p=>{cancelPlatformArrival();", """envoyFrame:(p,options)=>groups.get('journey')?.userData.update(p,options),envoyAnchors:()=>groups.get('journey')?.userData.anchors()??[],
      envoyFocus:(phase='walk')=>{if(state.key!=='journey')return;cancelPlatformArrival();const p=new THREE.Vector3(...(active.userData.follow??[-30,0,0]));p.y+=1.25;const host=$('canvas-host'),aspect=host.clientWidth/host.clientHeight,scale=Math.max(1,1.15/aspect);const offset=phase==='rest'?new THREE.Vector3(5,3.7,9):phase==='wind'?new THREE.Vector3(5,4.2,11):new THREE.Vector3(8,5,15);offset.multiplyScalar(scale);transition={from:camera.position.clone(),to:p.clone().add(offset),oldTarget:orbit.target.clone(),target:p,start:performance.now(),duration:reducedMotion?1:1500};orbit.minDistance=2.5;orbit.maxDistance=85;orbit.minPolarAngle=.05;orbit.maxPolarAngle=Math.PI*.49;},
      modelFocus:p=>{cancelPlatformArrival();""")
edit('sandbox.js',"if(!platformSelecting)historyPlatform?.sceneChanged(id);","if(!platformSelecting)historyPlatform?.sceneChanged(id);\n  if(id==='journey'&&!platformSelecting&&knowledgeGuide&&!knowledgeGuide.journeyActive)knowledgeGuide.openJourney('near');")
edit('knowledge-guide.js',"import {explorationDestination", "import {installEnvoyJourney} from './envoy-journey.js';\nimport {explorationDestination")
edit('knowledge-guide.js',"let director=null,directorCue", "let journeyReturn=null;\n const envoy=installEnvoyJourney({scene,viewport,adapter,enter:enterJourney,back:()=>{go('history',{restore:true});}});\n let director=null,directorCue")
edit('knowledge-guide.js',"function go(next,{restore=false,fromGlobe=false,guide=true}={}){", "function go(next,{restore=false,fromGlobe=false,guide=true}={}){\n  if(envoy.active)envoy.close();")
edit('knowledge-guide.js',"function stop(navigate=true){director?.stop();", "function stop(navigate=true){envoy.close();director?.stop();")
edit('knowledge-guide.js',"function directorCamera(pose){", """function enterJourney(mode){
  historyStoryPlayer.suspend();activate();adapter.cancel();period='han';guideEventId='zhang';stage='history';modelOpen=false;modelScene=null;historySurface='globe';eventNode=null;worldAtlas.hide();adapter.hideMap();restoreControls();render();layer.visible=false;pins.hidden=true;
  adapter.scene(mode==='map'?'earth':'journey',{overview:false,keepCamera:mode==='map',scaleHandoff:true});regionalSurface.set(mode==='map');
  if(mode==='map')adapter.worldView({lon:89,lat:38,distance:6.4,surface:2.7,duration:1800});else{adapter.environment(null);adapter.envoyFocus();}
  adapter.resize();const u=new URL(location.href);u.searchParams.set('journey',mode);history.replaceState(null,'',u);
 }
 function openJourney(mode='map',{director=false}={}){if(!envoy.active){journeyReturn=adapter.read();if(journeyReturn.scene==='earth')eventGlobeView=journeyReturn;}envoy.open(mode,{director});}
 function directorCamera(pose){""")
edit('knowledge-guide.js',"function restoreDirectorView(shot){", "function restoreDirectorView(shot){\n  if(shot.journey){envoy.focus();return;}")
edit('knowledge-guide.js',"function directorPrepare(shot){", "function directorPrepare(shot){\n  envoy.close();")
edit('knowledge-guide.js',"if(shot.world){eventProgress[c.id]=0;", "if(shot.journey){openJourney(shot.journey,{director:true});}\n  else if(shot.world){eventProgress[c.id]=0;")
edit('knowledge-guide.js',"function directorReady(shot){", "function directorReady(shot){\n  if(shot.journey)return envoy.active&&envoy.mode===shot.journey&&viewport.dataset.scene===(shot.journey==='map'?'earth':'journey')&&viewport.dataset.camera!=='moving'&&viewport.dataset.blend!=='moving';")
edit('knowledge-guide.js',"function directorResume(shot){", "function directorResume(shot){\n  if(shot.journey){envoy.resume();return;}")
edit('knowledge-guide.js',"function directorFrame(shot,fraction,time){", "function directorFrame(shot,fraction,time){\n  if(shot.journey){envoy.frame(fraction);return true;}")
edit('knowledge-guide.js',"freeze:()=>{if(onSphere()", "freeze:()=>{envoy.freeze();if(onSphere()")
edit('knowledge-guide.js',"leave:()=>{directorCue=null;", "leave:()=>{envoy.releaseDirector();directorCue=null;")
edit('knowledge-guide.js',"return {adjustDirectorView:", "if(params.has('journey'))openJourney(params.get('journey')==='near'?'near':'map');\n return {openJourney,get journeyActive(){return envoy.active;},adjustDirectorView:")
edit('knowledge-guide.js',"director?.update(dt);if(!active)return;", "director?.update(dt);if(!active)return;if(envoy.active){envoy.update(camera,dt);return;}")
# Add a genuine near-scene entrance to the existing historical map, not just the director.
edit('knowledge-guide.js',"root.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;", "root.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.kgAction==='envoy'){openJourney('map');return;}")
edit('knowledge-guide.js',"root.innerHTML=`<nav class=\"kg-nav\"", "if(stage==='history'&&currentEvent()==='zhang')body='<button class=\"envoy-entry\" data-kg-action=\"envoy\"><b>跟随第一次出使 →</b><span>在地图看旅程中断，再走进荒漠使团</span></button>'+body;\n  root.innerHTML=`<nav class=\"kg-nav\"")
edit('envoy-journey.js',"frame:(fraction)=>", "releaseDirector:()=>{directed=false;playing=false;},\n  frame:(fraction)=>")
edit('envoy-journey.js',"function close(){active=false;", "function close(){const u=new URL(location.href);u.searchParams.delete('journey');history.replaceState(null,'',u);active=false;")
# A story-specific action path, with two new narrated shots between purpose and result.
edit('exploration-director-paths.js',"import {historyStories}","import {envoyNarration} from './envoy-journey-data.js';\nimport {historyStories}")
edit('exploration-director-paths.js',"narration('zhang',0,'出使背景'),", """narration('zhang',0,'出使背景'),
 {id:'mission-route',label:'第一次远行',journey:'map',title:'让旅程在地图上发生',where:'长安 → 陇西方向 → 大宛 → 大月氏',why:'区分第一次出使与后来的交流网络；十余年扣留让旅程中断。',next:'从地域方向走近荒漠行进，观察环境困难。',duration:40,speech:envoyNarration['mission-route'],audio:{event:'zhang',beat:'mission-route'}},
 {id:'desert',label:'走进荒漠',journey:'near',title:'荒漠里的使团：行走、风沙与取水',where:'第一次出使 · 原创远行情境',why:'把远行的困难变成脚步、驮载与互相照应，不把情境当成某一天的史实。',next:'带着环境困难回到地图，再理解外交结果和后续往来。',duration:40,speech:envoyNarration.desert,audio:{event:'zhang',beat:'desert'}},""")
edit('director-spatial-sequence.js',"if(shot.world)return 'world';", "if(shot.journey)return 'history';\n if(shot.world)return 'world';")
edit('exploration-director.js',"if(path.id==='zhang')put('[data-ed-look]',reading.look);", "if(path.id==='zhang')put('[data-ed-look]',s.shot.journey?viewport.dataset.envoyResponse:reading.look);")
edit('index.html','</head>', '<link rel="stylesheet" href="./envoy-journey.css">\n</head>')
