import { overview as o } from './overview-content.js';
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function initOverview(styles, ref) {
  const map = document.getElementById('overview-map');
  const cats = [...new Set(styles.map(s => s.cat))];
  const heading = (num, title, desc) => `<div class="om-heading"><span>${num}</span><div><h3>${title}</h3><p>${desc}</p></div></div>`;
  map.innerHTML = `
    <div class="om-cover"><img class="om-cover-image" src="./assets/upstream/opuscar98/67.jpg" alt="OPUSCAR98 阿甘正传立体纸艺书真实演示画面"><div class="om-cover-copy"><p class="om-kicker">OUR UNDERSTANDING / 从欣赏到复用</p><h3>定制风格。<br>组织故事。<br><em>代码构建场景。</em></h3><p>${o.thesis}</p></div><div class="om-stats"><span><b>43</b>完整风格规范</span><span><b>9</b>风格类别</span><span><b>98</b>电影致敬片段</span></div><p class="om-cover-credit">背景：上游 OPUSCAR98《阿甘正传》片段</p></div>
    <div class="om-band">${heading('01','产品思路：以熟悉的题材进入新的动画世界','以下链路概括 OPUSCAR98；整个库把风格、导演与制片方法整理给新题材使用。')}<ol class="om-flow">${o.flow.map((f,i)=>`<li><span>0${i+1}</span><h4>${f.title}</h4><p>${f.detail}</p></li>`).join('')}</ol><div class="om-examples">${o.examples.map(e=>`<article><button data-feature="${e.no}" aria-label="观看${e.title}的代码重绘片段"><img src="./${e.image}" alt="上游 ${e.title} 致敬动画真实静帧" width="800" height="450" loading="lazy"><span>${e.title} · 看片段 ▶</span></button><p>${e.detail}</p></article>`).join('')}</div><p class="om-note">${o.boundaries}</p></div>
    <div class="om-band om-style-band">${heading('02','风格资产：9 类，完整列出 43 种','每种 STYLE.md 规定视觉与声音语言，配有 DEMO.md、样片和技术参考。点击名字查看规范。')}<div class="om-categories">${cats.map((cat,i)=>{const group=styles.filter(s=>s.cat===cat);return `<article><div class="om-category-head"><img src="./${group[0].image}" alt="${cat}类别代表：${group[0].cn}" loading="lazy"><h4>${cat}<small>${String(i+1).padStart(2,'0')} / ${group.length} 种</small></h4></div><div class="om-style-names">${group.map(s=>`<button data-play="${s.slug}" title="查看${esc(s.cn)}风格规范">${esc(s.cn)}</button>`).join('')}</div></article>`;}).join('')}</div></div>
    <div class="om-band">${heading('03','约束控制：从文字规范到可检验的画面','Agent 按规范设计与编写代码；表达质量由工具检查和实际观看共同判断。')}<div class="om-controls-grid">${o.controls.map((c,i)=>`<article><span>0${i+1} / ${c.source}</span><h4>${c.title}</h4><p>${c.detail}</p></article>`).join('')}</div></div>
    <div class="om-band om-effects-band">${heading('04','作品效果：直接成为图中的演示模块','蓝图画面源码在本地实时运行；右侧播放上游完整样片，静帧同时充当模块背景。')}<div class="om-effects"><article><div class="om-media"><iframe id="overview-blueprint" src="./demos/blueprint/index.html" title="总览图中的蓝图原作实时画面" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe></div><div class="om-effect-info"><h4>蓝图：把约束画出来</h4><p>蓝白配色 · 四级线宽 · 按制图顺序逐笔绘制 · 爆炸视图与机械动作</p><div class="om-player-tools"><button id="overview-toggle" disabled>加载本地画面…</button><button data-overview-time="11">爆炸视图</button><button data-overview-time="20">机械运行</button><a href="#live-demo">完整进度控制 ↗</a></div><p id="overview-live-status" class="om-media-status" role="status">本地静音画面，原作成片24fps，此处预览≤12fps。</p></div></article><article><div class="om-media"><video id="overview-video" controls muted playsinline preload="none" poster="./assets/upstream/frames/ink-wash.jpg" aria-label="总览图中的上游样片播放器"></video></div><div class="om-effect-info"><h4 id="overview-film-name">中国水墨：让笔墨参与转场</h4><p>选择作品后在图中播放。可暂停、开启声音、拖动或全屏。</p><div class="om-player-tools">${['ink-wash','glass-product','paper-popup'].map(slug=>`<button data-overview-film="${slug}" aria-pressed="${slug==='ink-wash'}">${esc(styles.find(s=>s.slug===slug).cn)} ▶</button>`).join('')}</div><p id="overview-video-status" class="om-media-status" role="status">作品图片已在本地；完整视频需联网，点击上方风格播放。</p></div></article></div><p class="om-note">${o.evidence}</p></div>
    <div class="om-band">${heading('05','使用场景：由内容目标选择画风','以下为我们的应用建议。先提供真实材料，再确定观众应记住的一个变化或结论。')}<div class="om-scenarios">${o.scenarios.map((s,i)=>`<article><b>0${i+1}</b><h4>${s.title}</h4><p>${s.outcome}</p><dl><div><dt>输入</dt><dd>${s.input}</dd></div><div><dt>画风</dt><dd>${s.styles}</dd></div></dl></article>`).join('')}</div></div>
    <div class="om-band om-value-band">${heading('06','对你的意义：把优秀案例变成自己的表达能力','以你的研究总库为起点，把作品思路迁移到项目、产品、原理和自己的角色。')}<div class="om-values">${o.values.map((v,i)=>`<article><span>0${i+1}</span><h4>${v.title}</h4><p>${v.detail}</p></article>`).join('')}</div><div class="om-transfer"><strong>迁移这套产品思路</strong><p>经典电影 → 你的项目或产品　 /　 Clawd → 你的角色或物体　 /　 电影致敬场景 → 你的解释、发布或系列故事</p></div></div>
    <div class="om-band om-delivery-band">${heading('07','从理解到交付：把方法变成一份创作任务','风格规范、导演判断与生产工具串成可执行流程，制作完成后留下可修改的工程。')}<ol class="om-delivery">${o.pipeline.map(p=>`<li>${p}</li>`).join('')}</ol><p class="om-trial">${o.trial} <button data-preset="pump">整理这份任务 →</button></p><p class="om-note">${o.conditions}</p></div>
    <figcaption class="om-footer"><p>图解：本地中文研究与应用判断 · 作品及规范：Lemomo / LemoLab · MIT（第三方素材保留各自归属）</p><p>来源版本 ${ref.slice(0,12)} · <a href="https://github.com/lemomo-ai/lemo-opuscar/tree/${ref}" target="_blank" rel="noopener">原仓库 ↗</a> · <a href="https://lemomo-ai.github.io/lemo-opuscar/opuscar98/" target="_blank" rel="noopener">OPUSCAR98 ↗</a> · <a href="#understanding">继续阅读完整研究 →</a></p></figcaption>`;
  setupLive(); setupVideos(styles);
  document.getElementById('overview-download-png').addEventListener('click', downloadPng);
}

function setupLive() {
  const frame=document.getElementById('overview-blueprint'), toggle=document.getElementById('overview-toggle'), status=document.getElementById('overview-live-status');
  let ready=false, running=false, visible=false, manual=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const send=(action,value)=>{if(ready) frame.contentWindow.postMessage({type:'lemo-blueprint-control',action,value},location.origin);};
  const play=()=>{document.querySelectorAll('video').forEach(v=>v.pause());send('play');};
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.type!=='lemo-blueprint-preview') return;
    if(event.data.error){status.textContent=event.data.error;return;}
    const first=!ready; ready=event.data.ready;running=event.data.running;toggle.disabled=!ready;
    toggle.textContent=running?'暂停动画 Ⅱ':'播放动画 ▶';
    status.textContent=`本地实时画面 · 静音 · ${event.data.time.toFixed(1)} / ${event.data.duration.toFixed(1)} 秒 · 预览≤12fps`;
    if(first&&visible&&!reduced)play();
  });
  toggle.addEventListener('click',()=>{manual=running;running?send('pause'):play();});
  document.querySelectorAll('[data-overview-time]').forEach(b=>b.addEventListener('click',()=>{manual=false;send('seek',Number(b.dataset.overviewTime));play();}));
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)send('pause');else if(ready&&!manual&&!reduced)play();},{threshold:.3}).observe(frame);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)send('pause');else if(visible&&!manual&&!reduced)play();});
  document.addEventListener('play',event=>{if(event.target instanceof HTMLVideoElement)send('pause');},true);
}

function setupVideos(styles) {
  const video=document.getElementById('overview-video'), status=document.getElementById('overview-video-status');
  let timer, current=styles.find(s=>s.slug==='ink-wash');
  const fallback=()=>{status.textContent='上游视频暂未加载，可重试或打开原作：';const link=document.createElement('a');link.href=current.video;link.target='_blank';link.rel='noopener';link.textContent='原视频 ↗';status.append(link);};
  document.querySelectorAll('[data-overview-film]').forEach(button=>button.addEventListener('click',()=>{
    current=styles.find(s=>s.slug===button.dataset.overviewFilm);
    document.querySelectorAll('[data-overview-film]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.getElementById('overview-film-name').textContent=current.cn+' · '+current.film;
    video.poster='./'+current.image;video.src=current.video;video.load();status.textContent='正在加载'+current.cn+'原作视频…';
    clearTimeout(timer);timer=setTimeout(()=>{if(video.readyState<2)fallback();},15000);
    video.play().catch(error=>{if(error.name!=='AbortError'&&!video.error)status.textContent='点击播放器开始观看。';});
  }));
  video.addEventListener('playing',()=>{clearTimeout(timer);status.textContent=current.cn+'正在播放 · 可在播放器开启声音。';});
  video.addEventListener('waiting',()=>{status.textContent='正在等待上游视频缓冲…';});
  video.addEventListener('error',()=>{clearTimeout(timer);fallback();});
}

async function downloadPng() {
  const button=document.getElementById('overview-download-png'), status=document.getElementById('overview-export-status');
  button.disabled=true;status.textContent='正在生成完整 PNG 总览图…';
  try {
    const response=await fetch('./lemo-opuscar-overview.svg');if(!response.ok)throw new Error('总览图文件未加载');
    const svg=await response.text();
    const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    canvas.getContext('2d').drawImage(image,0,0);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('浏览器未能生成图片');
    const url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download='Lemo-Opuscar-理解全景图.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
    status.textContent='完整 PNG 已生成，包含全部43种风格与作品静帧。';
  } catch(error){status.textContent=error.message+'；可先下载 SVG 总览图。';}
  finally{button.disabled=false;}
}
