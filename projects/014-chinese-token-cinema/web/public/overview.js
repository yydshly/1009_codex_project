const $=id=>document.getElementById(id);
const setText=(node,text)=>{node.textContent=text;return node;};
let source;
async function referenceSource(){if(!source)source=await fetch('./assets/research/reference-source.json').then(r=>{if(!r.ok)throw new Error('来源读取失败');return r.json();});return source;}
const dialog=document.createElement('dialog');dialog.className='overview-dialog';
dialog.innerHTML='<div class="overview-dialog-header"><h2 id="overview-media-title">效果播放</h2><button type="button" aria-label="关闭效果播放">关闭 ×</button></div><video id="overview-media" class="review-video" controls playsinline preload="metadata" aria-labelledby="overview-media-title"></video><p id="overview-media-note"></p><p id="overview-media-status" role="status" hidden></p><p><a id="overview-media-fallback" href="./#stage">打开原播放器 ↗</a></p>';
dialog.setAttribute('aria-labelledby','overview-media-title');document.body.append(dialog);
const media=$('overview-media'),status=$('overview-media-status');
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>media.pause());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
media.addEventListener('play',()=>document.querySelectorAll('audio,video').forEach(other=>{if(other!==media&&!other.muted)other.pause();}));
media.addEventListener('error',()=>{status.textContent='视频暂不可用，可通过下方原播放器入口观看。';status.hidden=false;});
let request=0;
document.querySelectorAll('[data-overview-watch]').forEach(button=>button.addEventListener('click',async()=>{
  const run=++request,ours=button.dataset.overviewWatch==='ours',time=Number(button.dataset.time||0);
  document.querySelectorAll('audio,video').forEach(other=>other.pause());media.removeAttribute('src');media.load();
  $('overview-media-title').textContent=ours?'我还在这里 · 中文动态演唱初版':'DJ SHO · 参考原片';
  $('overview-media-note').textContent=ours?'原始中文歌曲与 HeyGen 线上人物表演，字幕和预测面板由本地合成；完整多场景版尚未通过。':'4 分 36 秒完整参考作品，作者 DJ SHO；保留原声与完整画面。';
  $('overview-media-fallback').href=ours?'./?version=motion#stage':'./#reference';
  status.hidden=true;dialog.showModal();
  try{
    let src,playbackTime=time;
    if(ours){
      src='./exports/wo-hai-zai-zhe-li-motion.mp4';
      const r=await fetch(src,{method:'HEAD'});
      if(!r.ok||!r.headers.get('content-type')?.includes('video/')){
        if(run!==request||!dialog.open)return;
        dialog.close();
        if(window.filmReady&&window.playFilmAt&&$('work-version')?.value==='motion'){
          $('stage').scrollIntoView({block:'start'});await window.playFilmAt(time);
        }else location.href='./?version=motion&start='+time+'#stage';
        return;
      }
    }else{
      const ref=await referenceSource();
      const local=await fetch(ref.localMedia,{method:'HEAD'}).catch(()=>null);
      const hasLocal=local?.ok&&local.headers.get('content-type')?.includes('video/');
      const clip=ref.researchClips?.find(clip=>time>=clip.start&&time<clip.end);
      src=hasLocal?ref.localMedia:clip?clip.localMedia:ref.publicMedia;
      if(!hasLocal&&clip){playbackTime=time-clip.start;$('overview-media-note').textContent='DJ SHO 原片研究引用：'+clip.label+'，截取原片 '+clip.rangeLabel+'；保留原声、完整画面和作者署名。完整原片请通过作者入口观看。';}
    }
    if(run!==request||!dialog.open)return;
    media.src=src;
    await new Promise((resolve,reject)=>{
      const clean=()=>{clearTimeout(timer);media.removeEventListener('loadedmetadata',loaded);media.removeEventListener('error',failed);};
      const loaded=()=>{clean();resolve();},failed=()=>{clean();reject(new Error('视频加载失败，可使用原播放器入口。'));};
      const timer=setTimeout(()=>{clean();reject(new Error('加载较慢，可使用视频控件或原播放器入口。'));},15000);
      media.addEventListener('loadedmetadata',loaded);media.addEventListener('error',failed);media.load();
    });
    if(run!==request||!dialog.open)return;
    media.currentTime=Math.min(playbackTime,media.duration-.05);
    try{await media.play();}catch{status.textContent='点击视频中的播放键开始观看。';status.hidden=false;}
  }catch(error){if(run===request){status.textContent=error.message;status.hidden=false;}}
}));

if($('overview-transcript')){
  try{
    const content=await fetch('./assets/overview/overview-content.json').then(r=>{if(!r.ok)throw new Error('图中文字暂不可用');return r.json();});
    for(const value of content.labels)$('overview-transcript').append(setText(document.createElement('p'),value));
    for(const item of content.sources){const a=setText(document.createElement('a'),item.label+' ↗');a.href=item.url;a.target='_blank';a.rel='noopener';$('overview-sources').append(a);}
  }catch(error){$('overview-transcript').textContent=error.message;}
}

if($('overview-scroll')){
  let scale=1;
  const pane=$('overview-scroll'),wrap=$('overview-image-wrap');
  function zoom(value){
    const next=Math.max(1,Math.min(4,value)),ratio=next/scale;
    const x=(pane.scrollLeft+pane.clientWidth/2)*ratio-pane.clientWidth/2;
    const y=(pane.scrollTop+pane.clientHeight/2)*ratio-pane.clientHeight/2;
    scale=next;wrap.style.width=scale*100+'%';$('overview-scale').textContent=Math.round(scale*100)+'%';
    pane.scrollLeft=Math.max(0,x);pane.scrollTop=Math.max(0,y);
    $('overview-minus').disabled=scale<=1;$('overview-plus').disabled=scale>=4;
  }
  $('overview-fit').addEventListener('click',()=>zoom(1));
  $('overview-plus').addEventListener('click',()=>zoom(scale+.5));
  $('overview-minus').addEventListener('click',()=>zoom(scale-.5));
  $('overview-minus').disabled=true;
  $('overview-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await pane.requestFullscreen();}catch{$('overview-viewer-error').textContent='当前浏览器无法进入全屏；仍可放大和滚动阅读。';$('overview-viewer-error').hidden=false;}});
}
window.overviewReady=true;
