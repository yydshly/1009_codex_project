const $=id=>document.getElementById(id);
const clock=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const text=(tag,value,className)=>{const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node;};
const link=(label,href)=>{const a=text('a',label);a.href=href;a.target='_blank';a.rel='noopener';return a;};

// The main film has muted backing videos; only audible research players participate.
document.addEventListener('play',event=>{
  const media=event.target;
  if(!(media instanceof HTMLMediaElement)||media.muted)return;
  document.querySelectorAll('#audio,.review-video,#test-original-audio').forEach(other=>{if(other!==media&&!other.paused)other.pause();});
},true);

function marker(video,time,label,clip=null){
  const button=text('button','');button.type='button';
  button.append(text('span',clock(time)),document.createTextNode(' '+label));
  button.setAttribute('aria-label',`播放${label}，${clock(time)}`);
  button.addEventListener('click',async()=>{
    try{
      if(clip){video.src=clip.localMedia;video.load();$('reference-status').textContent='网页研究片段 · '+clip.rangeLabel+' / 完整原片 4:36';}
      if(video.readyState===0)await new Promise((resolve,reject)=>{video.addEventListener('loadedmetadata',resolve,{once:true});video.addEventListener('error',reject,{once:true});video.load();});
      video.currentTime=Math.min(time-(clip?.start||0),video.duration-.05);await video.play();
    }catch{const error=video.parentElement.querySelector('.media-error');if(error)error.hidden=false;}
  });
  return button;
}

try{
  const r=await fetch('./assets/research/reference-source.json');if(!r.ok)throw new Error('原片来源记录不可用');
  const source=await r.json(),video=$('reference-video');
  const local=await fetch(source.localMedia,{method:'HEAD'}).catch(()=>null);
  const hasLocal=local?.ok&&local.headers.get('content-type')?.includes('video/');
  const firstClip=source.researchClips?.[0];
  video.src=hasLocal?source.localMedia:firstClip?.localMedia||source.publicMedia;video.load();
  $('reference-status').textContent=hasLocal?'本地完整原片 · 1080p':firstClip?'网页研究片段 · '+firstClip.rangeLabel+' / 完整原片 4:36':'作者公开视频源 · 在线播放';
  if(!hasLocal&&firstClip)video.setAttribute('aria-label','DJ SHO 原片研究片段，12 秒；完整原片通过作者入口观看');
  if(hasLocal)$('reference-download').hidden=false;
  let remoteFallback=false;
  video.addEventListener('error',()=>{
    if(hasLocal&&!remoteFallback){remoteFallback=true;video.src=source.publicMedia;video.load();$('reference-status').textContent='本地读取失败 · 尝试公开视频源';}
    else{$('reference-media-error').hidden=false;$('reference-status').textContent='媒体暂不可用 · 保留作者入口';}
  });
  for(const item of source.watchMarkers){
    const clip=!hasLocal&&source.researchClips?.find(clip=>item.time>=clip.start&&item.time<clip.end);
    if(hasLocal||!firstClip||clip)$('reference-markers').append(marker(video,item.time,item.label,clip||null));
  }
}catch(error){$('reference-status').textContent=error.message;$('reference-media-error').hidden=false;}

try{
  const r=await fetch('./assets/research/experiment-log.json');if(!r.ok)throw new Error('测试清单不可用');
  const log=await r.json();
  for(const test of log.tests){
    const card=text('article','','experiment-card'),video=document.createElement('video');
    video.className='review-video';video.controls=true;video.playsInline=true;video.preload='metadata';video.src=test.localMedia;video.poster=test.poster;video.setAttribute('aria-label',test.title+'，未通过测试');
    const body=text('div','','experiment-body'),top=text('div','','experiment-topline');
    top.append(text('span',test.submittedAt+' · '+test.costDiamonds+' 钻石','small-label'),text('span','未通过','verdict rejected'));
    body.append(top,text('h4',test.title),text('p',test.mode+' / '+test.width+'×'+test.height+' / '+test.duration.toFixed(2)+'s','experiment-metadata'));
    const metrics=text('dl','','test-metrics');
    for(const [label,value,failed] of [['原音波形相关性',test.waveformCorrelation.toFixed(5),!test.audioRetentionPassed],['画面验收','拒绝接入',true]]){
      const group=text('div','');group.append(text('dt',label),text('dd',value,failed?'fail':''));metrics.append(group);
    }
    body.append(metrics);
    const findings=text('ul','','experiment-findings');for(const finding of test.findings)findings.append(text('li',finding));body.append(findings);
    const error=text('p','本地样片暂不可用，请通过原始视频入口查看。','media-error');error.hidden=true;video.addEventListener('error',()=>{error.hidden=false;});body.append(error);
    const jump=marker(video,test.watchTime,test.watchLabel);jump.className='test-marker';body.append(jump);
    const evidence=text('div','','evidence-links');evidence.append(link('逐帧证据 ↗',test.frameEvidence),link('质量记录 ↗',test.review),link('平台输出 ↗',test.publicMedia));body.append(evidence);
    card.append(video,body);$('experiment-cards').append(card);
  }
  window.researchLog=log;
}catch(error){$('experiment-cards').append(text('p',error.message,'media-error'));}

try{
  const timeline=await fetch('./assets/song-timeline.json').then(r=>{if(!r.ok)throw new Error('唱词读取失败');return r.json();});
  $('research-lyrics').replaceChildren(...timeline.cues.map(cue=>{const p=text('p','');p.append(text('time',clock(cue.start)),document.createTextNode(cue.text));return p;}));
}catch(error){$('research-lyrics').textContent=error.message;}
window.researchReady=true;
