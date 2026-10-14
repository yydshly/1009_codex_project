import {atlasThemes,atlasEntries,atlasReferences,reliefDescriptions,modelImages} from './region-atlas-content.js';
import {historyEvents} from './history-content.js';
import {workspaceScenes} from './workbench.js';

export function installRegionAtlas({shell,onLayer,onRegion,onLocate,onEntry,onOpen,onEvent,onFree,onFeature,onPreview}){
 const root=document.createElement('section');root.className='region-atlas';root.setAttribute('aria-label','新疆探索入口');shell.append(root);
 root.innerHTML=`<div class="ra-intro"><p class="ra-kicker">EURASIA / CHINA / XINJIANG</p><h1>新疆<span>XINJIANG</span></h1><p class="ra-lead">从一片山河，读懂相遇的地方。</p><p class="ra-description"></p><div class="ra-facts"><span><b>三山两盆</b>空间骨架</span><span><b>地理 × 历史</b>探索线索</span></div><div class="ra-earth-actions"><button data-ra-action="locate">定位新疆 ⌖</button><button class="ra-primary" data-ra-action="region">进入新疆 →</button></div></div>
 <div class="ra-layer-bar" role="group" aria-label="新疆地图视角">${[['geography','地形格局'],['water','水与绿洲'],['history','历史路线'],['all','地点图鉴']].map(([id,label])=>`<button data-ra-layer="${id}">${label}</button>`).join('')}</div>
 <div class="ra-guide" aria-live="polite"></div>
 <nav class="ra-themes" aria-label="选择新疆探索主题">${atlasThemes.map((t,i)=>`<button data-ra-theme="${t.id}" style="--ra-image:url('${t.image}')"><span class="ra-card-number">0${i+1} / ${t.sub}</span><strong>${t.title}</strong><span class="ra-card-copy">${t.copy}</span><i>探索 →</i></button>`).join('')}<div class="ra-catalog-buttons"><button data-ra-catalog="places"><span>⌖</span><strong>地点图鉴</strong><small>11 个入口参照 ↗</small></button><button data-ra-catalog="models"><span>◈</span><strong>模型与情境</strong><small>14 个原有场景 ↗</small></button></div></nav>
 <div class="ra-map-footer"><span>拖动旋转 · 滚轮缩放 · 右键平移</span><details><summary>地图与示意说明</summary><p>公开DEM与NASA区域影像；显示高度可夸张。轮廓来自DataV公开GeoJSON并简化。虚线部分超出现有DEM覆盖，只表示定位。</p><p>河流与历史廊道采用关系示意；原创人物模型不表示遗址复原或特定群体的完整生活。</p>${atlasReferences.map(r=>`<a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title} ↗</a>`).join('')}</details></div>
 <section class="ra-catalog" aria-label="探索图鉴" hidden></section>`;
 let state={stage:'planet',layer:'geography'},selected=null,catalog=null,relief=null;
 const guide=root.querySelector('.ra-guide'),drawer=root.querySelector('.ra-catalog');
 const entryText=e=>e.kind==='nature'?'自然观察':e.kind==='water'?'绿洲与工程':e.kind==='culture'?'文化与生活':'历史地理';
 function drawGuide(){
  const t=atlasThemes.find(t=>t.id===state.layer)??atlasThemes[0];
  if(state.stage==='planet'){guide.innerHTML='<p class="ra-kicker">01 / 找到新疆</p><h2>欧亚大陆的内陆</h2><p>转动地球建立方位。定位后进入新疆全貌，选择地理、绿洲或历史方向。</p><small>NASA全球影像 · 简化公开轮廓定位</small>';return;}
  if(relief&&state.stage==='region'){const water=relief.endsWith('流域');guide.innerHTML='<button data-ra-action="clear" class="ra-back">← 区域全貌</button><p class="ra-kicker">'+(water?'流域方向':'三山两盆')+' / 区域定位</p><h2>'+relief+'</h2><p>'+reliefDescriptions[relief]+'</p><button data-ra-theme="'+(water?'history':'water')+'">'+(water?'继续看历史与地方':'对照水与绿洲')+' →</button><small>拖动地图观察起伏；关系线为概括示意。</small>';return;}
  if(selected){const e=atlasEntries.find(e=>e.id===selected);guide.innerHTML=`<button data-ra-action="clear" class="ra-back">← 区域全貌</button><p class="ra-kicker">${entryText(e)} / 地点入口</p><h2>${e.name}</h2><p>${e.text}</p>${e.model?`<button class="ra-primary" data-ra-open="${e.id}">进入${e.kind==='nature'?'地点模型':'关联模型'} →</button>`:`<button class="ra-primary" data-ra-event="${e.event}" data-ra-place="${e.place}">进入历史地点 →</button>`}${e.event?`<button data-ra-event="${e.event}">打开关联事件 ↗</button>`:''}<small>返回地图后，可以继续切换地点。</small>`;return;}
  if(state.layer==='history'){
   const e=historyEvents.find(e=>e.id===state.eventId)??historyEvents[0];
   guide.innerHTML='<p class="ra-kicker">03 / 用事件打开地图</p><h2>'+e.title+'</h2><p>'+e.question+'</p><div class="ra-events ra-event-picker">'+historyEvents.map(v=>'<button data-ra-preview="'+v.id+'" aria-pressed="'+(v.id===e.id)+'"><small>'+v.date+'</small><strong>'+v.short+'</strong></button>').join('')+'</div><p class="ra-event-intent">'+e.phases[0].text+'</p><div class="ra-route-stops">'+e.nodes.map(n=>'<button data-ra-entry="'+n.id+'">'+n.name.split(' · ')[0]+' ⌖</button>').join('')+'</div><button class="ra-primary" data-ra-fresh="true" data-ra-event="'+e.id+'">展开背景、过程与影响 →</button><small>'+e.lineLabel+'；地点标记与所选事件同步。</small>';return;
  }
  if(state.layer==='all'){guide.innerHTML='<p class="ra-kicker">地点图鉴 / 11个入口参照</p><h2>地点，是线索的交汇处。</h2><p>点地图标记，或打开图鉴，选择自然、历史与生活场景。先定位，再进入模型。</p><button data-ra-catalog="places">打开地点图鉴 →</button>';return;}
  guide.innerHTML=`<p class="ra-kicker">02 / ${t.sub}</p><h2>${t.question}</h2><p>${t.copy}</p>${state.layer==='history'?`<div class="ra-events">${historyEvents.map(e=>`<button data-ra-event="${e.id}"><small>${e.date}</small><strong>${e.short} →</strong></button>`).join('')}</div>`:state.layer==='water'?'<button data-ra-entry="turpan">定位吐鲁番，观察工程 →</button><button data-ra-entry="glacier">走近冰川，观察来水 →</button>':'<div class="ra-relief-links"><button data-ra-feature="mountains">山地与盆地 ⌖</button><button data-ra-entry="tianchi">天池 →</button><button data-ra-entry="glacier">冰川 →</button><button data-ra-entry="yardang">雅丹 →</button></div>'}<small>${t.legend}</small>`;
 }
 function showCatalog(kind){catalog=kind;drawer.hidden=!kind;if(!kind)return;
  drawer.innerHTML=`<header><div><p class="ra-kicker">选择入口 / 自由探索</p><h2>${kind==='places'?'地点图鉴':'模型与情境'}</h2></div><button data-ra-action="close" aria-label="关闭图鉴">×</button></header><p>${kind==='places'?'按地点找到空间位置，再查看相关事件和模型。':'原有场景全部保留。地点模型从地图进入；通用模型与原创情境可直接操作。'}</p>${kind==='places'?'<label class="ra-search">搜索地点<input type="search" placeholder="天池、喀什、吐鲁番…" aria-label="搜索图鉴地点"></label><div class="ra-catalog-filters" role="group" aria-label="图鉴分类"><button data-ra-filter="all" aria-pressed="true">全部</button><button data-ra-filter="nature">自然</button><button data-ra-filter="history">历史</button><button data-ra-filter="life">生活与水</button></div>':''}<div class="ra-catalog-grid">${kind==='places'?atlasEntries.map(e=>`<button data-ra-entry="${e.id}" data-entry-kind="${e.kind}" data-entry-name="${e.name}">${e.image?`<img src="${e.image}" alt="已有${e.name}关联场景预览" loading="lazy">`:'<div class="ra-catalog-placeholder">⌖<small>地图定位入口</small></div>'}<small>${entryText(e)}</small><strong>${e.name} ↗</strong><span>${e.text}</span></button>`).join(''):workspaceScenes.map(e=>`<button data-ra-free="${e.id}">${modelImages[e.id]?`<img src="${modelImages[e.id]}" alt="已有${e.name}场景预览" loading="lazy">`:''}<small>${e.group}</small><strong>${e.name} ↗</strong><span>${e.hint}</span><em>${e.tag}</em></button>`).join('')}</div>`;
  drawer.querySelector('[data-ra-action=close]').focus();
 }
 let filter='all';function filterCatalog(){const query=drawer.querySelector('input')?.value.trim()??'';for(const b of drawer.querySelectorAll('[data-entry-kind]'))b.hidden=!(filter==='all'||filter==='life'&&['water','culture'].includes(b.dataset.entryKind)||filter===b.dataset.entryKind)||!b.dataset.entryName.includes(query);}
 root.addEventListener('input',filterCatalog);
 root.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;
  if(b.dataset.raLayer||b.dataset.raTheme){selected=null;relief=null;showCatalog(null);onLayer(b.dataset.raLayer??b.dataset.raTheme);}
  if(b.dataset.raCatalog){filter='all';showCatalog(b.dataset.raCatalog);}
  if(b.dataset.raEntry){showCatalog(null);onEntry(b.dataset.raEntry);}
  if(b.dataset.raOpen)onOpen(b.dataset.raOpen);
  if(b.dataset.raPreview){selected=null;relief=null;onPreview(b.dataset.raPreview);}
  if(b.dataset.raEvent)onEvent(b.dataset.raEvent,b.dataset.raPlace,b.dataset.raFresh==='true');
  if(b.dataset.raFree){showCatalog(null);onFree(b.dataset.raFree);}
  if(b.dataset.raFeature)onFeature(b.dataset.raFeature);
  if(b.dataset.raFilter){filter=b.dataset.raFilter;drawer.querySelectorAll('[data-ra-filter]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));filterCatalog();}
  if(b.dataset.raAction==='region')onRegion();if(b.dataset.raAction==='locate')onLocate();
  if(b.dataset.raAction==='close')showCatalog(null);
  if(b.dataset.raAction==='clear'){selected=null;relief=null;onRegion(true);}
 });
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&catalog)showCatalog(null);});
 return {get selected(){return selected;},update(next){state=next;root.hidden=!['planet','region'].includes(state.stage);root.dataset.stage=state.stage;root.querySelector('.ra-description').textContent=state.stage==='planet'?'中国西北，欧亚大陆内陆。先建立全球方位，再走进新疆的山河、事件与生活。':'阿尔泰山、天山、昆仑山之间，准噶尔与塔里木两大盆地展开。以地理定位，用历史连接地点。';root.querySelectorAll('[data-ra-layer],[data-ra-theme]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.raLayer??b.dataset.raTheme)===state.layer)));if(root.hidden)showCatalog(null);drawGuide();if(state.stage==='region'&&!selected&&!relief&&['geography','water'].includes(state.layer)){const b=document.createElement('button');b.dataset.raTheme=state.layer==='geography'?'water':'history';b.textContent=state.layer==='geography'?'沿地理进入水与绿洲 →':'继续看绿洲与历史交流 →';guide.append(b);}root.querySelectorAll('[data-ra-action=region]').forEach(b=>{b.disabled=!!state.entering;b.textContent=state.entering?'正在定位新疆…':'进入新疆 →';});},select(id){relief=null;selected=atlasEntries.some(e=>e.id===id)?id:null;drawGuide();},relief(name){selected=null;relief=name;drawGuide();},clear(){selected=null;relief=null;},showCatalog};
}
