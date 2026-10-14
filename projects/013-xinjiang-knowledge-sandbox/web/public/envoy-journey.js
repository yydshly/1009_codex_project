import * as THREE from 'three';
import {createEnvoySound} from './envoy-sound.js';
import {envoyStops,envoyScope,envoyEvidence,envoyChapterProgress,envoyMapFrame,envoyDesertFrame} from './envoy-journey-data.js';

export function installEnvoyJourney({scene,viewport,adapter,enter,back}){
 const sound=createEnvoySound();document.addEventListener('pointerdown',sound.engage,{once:true});
 const shell=viewport.querySelector('.workbench'),panel=document.createElement('section');panel.className='envoy-journey';panel.hidden=true;shell.append(panel);
 const routeRoot=new THREE.Group();routeRoot.name='first-envoy-route';routeRoot.visible=false;scene.add(routeRoot);
 const spherical=([lon,lat],r=3.235)=>new THREE.Vector3(r*Math.cos(lat*Math.PI/180)*Math.cos(lon*Math.PI/180),r*Math.sin(lat*Math.PI/180),-r*Math.cos(lat*Math.PI/180)*Math.sin(lon*Math.PI/180));
 const points=envoyStops.map(n=>spherical(n.anchor));
 // No route geometry: the sources do not establish the roads between regions.
 const bead=new THREE.Mesh(new THREE.SphereGeometry(.031,14,10),new THREE.MeshBasicMaterial({color:0xffe4b4}));routeRoot.add(bead);
 const labels=[];for(const [i,n]of envoyStops.entries()){
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.012,12,8),new THREE.MeshBasicMaterial({color:i?0xe8c28a:0xd6ead2}));dot.position.copy(points[i]);routeRoot.add(dot);
  const label=document.createElement('button');label.className='envoy-label';label.dataset.envoyStop=n.id;label.innerHTML=`<b>${n.name}</b><small>${n.note}</small>`;label.addEventListener('click',()=>{progress=envoyChapterProgress[i];playing=false;sync();});shell.append(label);label.hidden=true;labels.push({label,dot,position:points[i]});
 }
 const actorLabels=[];for(let i=0;i<2;i++){const label=document.createElement('span');label.className='envoy-label envoy-person-label';label.hidden=true;shell.append(label);actorLabels.push(label);}
 let active=false,mode='map',progress=0,playing=false,wind=true,rest=false,lastStage='',elapsed=0,directed=false,follow=true;
 let narrationCues=[];
 fetch(new URL('./assets/audio/director/manifest.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Narration manifest unavailable');return r.json();}).then(m=>{narrationCues=m.clips.find(c=>c.id==='zhang-mission-route')?.visualCues??[];}).catch(()=>{});
 function render(){
  panel.dataset.mode=mode;panel.setAttribute('aria-label',mode==='map'?'张骞第一次出使 · 史书记载节点':'独立荒漠动画实验 · 无历史路段依据');
  panel.innerHTML=`<header><small>${mode==='map'?'张骞第一次出使 / 依据史书记载':'独立动画实验 / 不归属于张骞行程'}</small><h2 data-envoy-title></h2><p data-envoy-caption></p></header><p class="envoy-evidence-note">${mode==='map'?'只定位涉及地域；未考定的道路不连线，拘留地点不定点。':'没有证据支持此沙丘、风沙及取水动作对应张骞出使。此模型已移出历史导演。'}</p><div class="envoy-mini"><nav class="envoy-events" aria-label="史书记载的出使经历">${['出陇西','长期扣留','大宛','康居转送','大月氏','大夏见闻','归途中再被扣留 · 返汉'].map((n,i)=>`<button data-envoy-chapter="${i}">${n}</button>`).join('')}</nav><span>经历顺序 · 不是地图道路或行走距离</span></div><nav aria-label="观察视图">${mode==='near'?'<button data-envoy="map">史书记载节点</button>':''}<button data-envoy="back">返回历史地图</button></nav><div class="envoy-choices"><button data-envoy="wind" aria-pressed="${wind}">风沙 ${wind?'开':'关'}</button><button data-envoy="rest" aria-pressed="${rest}">停下来取水</button><button data-envoy="follow">跟随人物</button></div><div class="envoy-clock"><button data-envoy="play">继续播放</button><label>${mode==='map'?'阅读进度':'实验进度'} <output data-envoy-output></output><input aria-label="${mode==='map'?'出使经历阅读进度':'荒漠动画实验进度'}" data-envoy-progress type="range" min="0" max="100" step="0.1" value="${progress*100}"></label></div><p class="envoy-response" data-envoy-response></p><details><summary>史料与地图依据</summary><p>${envoyScope}</p><a href="${envoyEvidence.primary}" target="_blank" rel="noopener">《史记·大宛列传》原文</a><br><a href="${envoyEvidence.museum}" target="_blank" rel="noopener">中国国家博物馆 · 出使经历</a><br><a href="${envoyEvidence.interpretation}" target="_blank" rel="noopener">中科院地理所 · 现代地域参照</a></details>`;
  panel.querySelector('[data-envoy-progress]').addEventListener('input',e=>{progress=Number(e.target.value)/100;playing=false;rest=false;sync();});sync();
 }
 function sync(){
  const f=mode==='map'?envoyMapFrame(progress):envoyDesertFrame(progress,{wind,rest});
  const put=(q,t)=>{const e=panel.querySelector(q);if(e&&e.textContent!==t)e.textContent=t;};
  put('[data-envoy-title]',f.title);put('[data-envoy-caption]',mode==='map'?f.caption:'仅用于观察原创动画，无历史行程归属。');
  put('[data-envoy-response]',mode==='map'?'地点有记载，之间的行走道路未考定。可点选经历或地域，返回历史地图理解后续影响。':f.response);
  put('[data-envoy-output]',Math.round(progress*100)+'%');put('[data-envoy=play]',playing?'暂停播放':'继续播放');
  const input=panel.querySelector('[data-envoy-progress]');if(input&&document.activeElement!==input)input.value=progress*100;
  const reading=envoyMapFrame(progress);panel.querySelectorAll('[data-envoy-chapter]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.envoyChapter)===reading.chapter)));
  bead.visible=mode==='map'&&reading.locate;bead.position.copy(points[reading.index]);labels.forEach((n,index)=>{const current=reading.locate&&index===reading.index;n.label.setAttribute('aria-current',String(current));n.dot.scale.setScalar(current?1.6:1);});
  panel.querySelector('.envoy-choices').hidden=mode!=='near';
  viewport.dataset.envoyMode=mode;viewport.dataset.envoyProgress=progress.toFixed(3);viewport.dataset.envoyDistance=f.distance.toFixed(3);viewport.dataset.envoyPhase=mode==='map'?f.held?'detention':f.chapter===6?'return':'documented-region':f.phase;viewport.dataset.envoyPlaying=String(playing);viewport.dataset.envoyResponse=f.title;viewport.dataset.envoyRoutePolicy='documented-regions-no-road';viewport.dataset.envoySceneEvidence=mode==='map'?'recorded-region':'unsupported-animation-experiment';
  return f;
 }
 function switchMode(next){mode=next;routeRoot.visible=mode==='map';enter(mode);lastStage='';render();}
 function open(next='map',{director=false,reset=true}={}){active=true;directed=director;follow=true;panel.hidden=false;viewport.classList.add('journey-active');if(reset){progress=0;elapsed=0;rest=false;wind=true;}playing=!director;switchMode(next);}
 function close(){sound.stop();const u=new URL(location.href);u.searchParams.delete('journey');history.replaceState(null,'',u);active=false;playing=false;panel.hidden=true;routeRoot.visible=false;viewport.classList.remove('journey-active');labels.forEach(n=>n.label.hidden=true);actorLabels.forEach(n=>n.hidden=true);}
 panel.addEventListener('click',e=>{const chapter=e.target.closest('[data-envoy-chapter]');if(chapter){progress=[.02,.30,.49,.60,.72,.84,.96][Number(chapter.dataset.envoyChapter)];playing=false;sync();return;}const b=e.target.closest('[data-envoy]');if(!b)return;const action=b.dataset.envoy;
  if(action==='back'){close();back();return;}if(action==='map'||action==='near'){switchMode(action);return;}if(action==='play'){if(progress>=1)progress=0;playing=!playing;}
  if(action==='wind'){wind=!wind;b.setAttribute('aria-pressed',String(wind));b.textContent='风沙 '+(wind?'开':'关');}
  if(action==='rest'){rest=!rest;b.setAttribute('aria-pressed',String(rest));b.textContent=rest?'照应后继续出发':'停下来取水';}
  if(action==='follow'){follow=true;focus();}sync();
 });
 function focus(){if(mode==='map')adapter.worldView({lon:89,lat:38,distance:6.4,surface:2.7,duration:1800});else adapter.envoyFocus();}
 function positionLabel(element,position,camera,w,h,offset=[0,0]){const p=position.clone().project(camera);const front=mode!=='map'||position.dot(camera.position.clone().sub(position))>0;element.hidden=p.z>1||p.z< -1||!front||p.x<-.95||p.x>.95||p.y<-.8||p.y>.8;if(!element.hidden){element.style.left=Math.max(120,Math.min(w-120,(p.x*.5+.5)*w+offset[0]))+'px';element.style.top=Math.max(110,Math.min(h-90,(-p.y*.5+.5)*h+offset[1]))+'px';}}
 for(const type of ['pointerdown','wheel'])viewport.querySelector('#canvas-host').addEventListener(type,()=>{if(active&&!directed)follow=false;},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)sound.stop();});
 return {get active(){return active;},get mode(){return mode;},open,close,focus,freeze:()=>{playing=false;sound.stop();},resume:()=>playing=true,
  releaseDirector:()=>{directed=false;playing=false;},
  frame:(fraction)=>{progress=mode==='map'&&narrationCues.length?(narrationCues.findLast(c=>c.fraction<=fraction)??narrationCues[0]).progress:Math.min(1,fraction);sync();},
  update(camera,dt){if(!active)return;const running=directed?viewport.dataset.directorActive==='true'&&viewport.dataset.directorPlaying==='true'&&viewport.dataset.directorWaiting==='false':playing;
   if(!directed&&running&&!rest){progress=Math.min(1,progress+Math.min(dt,.1)/(mode==='map'?32:45));if(progress>=1)playing=false;}
   if(running)elapsed+=Math.min(dt,.1);const f=sync();sound.update(f,dt,{running:running&&mode==='near',muted:directed&&shell.querySelector('[data-ed=mute]')?.getAttribute('aria-pressed')==='false'});
   if(mode==='near'){adapter.envoyFrame(progress,{wind,rest,dt:running?dt:0,running,follow:directed?viewport.dataset.directorView!=='manual':follow});if(directed&&lastStage!==f.phase&&viewport.dataset.directorView!=='manual'){lastStage=f.phase;adapter.envoyFocus(f.phase);}}
   const host=viewport.querySelector('#canvas-host'),w=host.clientWidth,h=host.clientHeight;
   labels.forEach((n,i)=>{if(mode==='map')positionLabel(n.label,n.position,camera,w,h,[[45,32],[-65,-50],[80,-15],[-30,-60],[-65,15],[35,60]][i]);else n.label.hidden=true;});
   const anchors=mode==='near'?adapter.envoyAnchors():[];actorLabels.forEach((label,i)=>{if(!anchors[i])label.hidden=true;else{label.textContent=anchors[i].label;positionLabel(label,anchors[i].point,camera,w,h,w<700?(i?[0,-48]:[10,0]):[0,0]);}});
  }};
}
