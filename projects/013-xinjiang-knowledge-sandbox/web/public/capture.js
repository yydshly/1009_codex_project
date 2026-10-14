import { drawFilm } from './film.js';
// Actual WebGL, with the cinematic player's matching captions when it is active.
// HTML controls and device speech is excluded; the authored audio mix is recorded.
export function installCapture(renderer,button,status,frameProvider=()=>null,audioProvider=()=>null,audioEventsProvider=()=>[]) {
  let recorder,stream,chunks=[],started,recordingCanvas,context,startedAt,cueLog=[],cueIdentity,originalViewportStyle,decisionLog=[],decisionIdentity,annotationLog=[],annotationIdentity,motionLog=[],motionIdentity,motionSample=0,workLog=[],workSample=0;
  const viewport=document.getElementById('viewport');
  function restoreLayout(){if(originalViewportStyle===null)viewport.removeAttribute('style');else if(originalViewportStyle!==undefined)viewport.setAttribute('style',originalViewportStyle);delete viewport.dataset.captureLayout;originalViewportStyle=undefined;}
  const available=typeof MediaRecorder!=='undefined'&&typeof renderer.domElement.captureStream==='function';
  button.hidden=!available;
  if(!available)return;
  const formats=['video/mp4;codecs=avc1.42001E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  button.dataset.captureFormat=formats.find(type=>MediaRecorder.isTypeSupported(type))??'unavailable';
  button.addEventListener('click',()=>{
    if(recorder?.state==='recording'){recorder.stop();return;}
    try {
      const mimeType=button.dataset.captureFormat;
      if(!mimeType)throw new Error('This browser cannot record WebM.');
      // The authored movie uses a fixed layout even if the app panel is resized.
      // Restore the native responsive layout after saving or a recording error.
      originalViewportStyle=viewport.getAttribute('style');viewport.style.width='1280px';viewport.style.height='720px';viewport.dataset.captureLayout='fixed';
      chunks=[];cueLog=[];cueIdentity=null;decisionLog=[];decisionIdentity=null;annotationLog=[];annotationIdentity=null;motionLog=[];motionIdentity=null;motionSample=0;workLog=[];workSample=0;started=Date.now();startedAt=performance.now();recordingCanvas=document.createElement('canvas');
      recordingCanvas.width=1280;recordingCanvas.height=720;
      context=recordingCanvas.getContext('2d');stream=recordingCanvas.captureStream(30);
      const audio=audioProvider();for(const track of audio?.getAudioTracks()??[])stream.addTrack(track.clone());
      recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:6000000});
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      recorder.onstop=()=>{
        restoreLayout();
        stream.getTracks().forEach(track=>track.stop());
        const blob=new Blob(chunks,{type:mimeType}),url=URL.createObjectURL(blob);
        const link=document.createElement('a');link.href=url;link.download=`xinjiang-${document.getElementById('viewport').dataset.scene}-${new Date(started).toISOString().replaceAll(':','-')}.webm`;
        link.download=link.download.replace(/\.webm$/,mimeType.startsWith('video/mp4')?'.mp4':'.webm');
        link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
        button.setAttribute('aria-label','录制三维画面');button.setAttribute('aria-pressed','false');button.textContent='●';
        status.textContent='三维录像已保存';status.dataset.capture='saved';
        if(cueLog.length){
          const audioEvents=audioEventsProvider().filter(e=>e.performanceMS>=startedAt).map(e=>({...e,recordingSecond:(e.performanceMS-startedAt)/1000}));
          const log={startedAt:new Date(started).toISOString(),durationSeconds:(performance.now()-startedAt)/1000,width:recordingCanvas.width,height:recordingCanvas.height,audio:stream.getAudioTracks().length>0,source:'actual WebGL + matching cinematic captions + anchored explanation markers + contact-synchronous authored audio mix',cues:cueLog,decisions:decisionLog,annotations:annotationLog,motions:motionLog,work:workLog,audioEvents};
          const logURL=URL.createObjectURL(new Blob([JSON.stringify(log,null,2)],{type:'application/json'}));
          const exportLink=document.createElement('a');exportLink.id='capture-cue-export';exportLink.href=logURL;exportLink.download='xinjiang-journey-cues.json';exportLink.textContent=' · 字幕时间记录';status.append(exportLink);setTimeout(()=>URL.revokeObjectURL(logURL),60000);
        }
      };
      recorder.start(500);button.textContent='■';button.setAttribute('aria-label','停止录制');button.setAttribute('aria-pressed','true');
      status.textContent='正在录制三维画面';status.dataset.capture='recording';
    } catch(error) {
      stream?.getTracks().forEach(track=>track.stop());restoreLayout();status.textContent='此浏览器暂不支持录像';status.dataset.capture='unavailable';
    }
  });
  window.addEventListener('pagehide',()=>{if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(track=>track.stop());});
  // Called immediately after WebGL renders, before its drawing buffer is discarded.
  return ()=>{
    if(recorder?.state!=='recording')return;
    const {width,height}=recordingCanvas;
    context.globalAlpha=1;context.fillStyle='#05080c';context.fillRect(0,0,width,height);
    context.globalAlpha=Number(renderer.domElement.style.opacity||1);context.drawImage(renderer.domElement,0,0,width,height);
    const frozen=document.getElementById('transition-frame');
    if(frozen.style.display!=='none'&&frozen.width>0){context.globalAlpha=Number(frozen.style.opacity||1);context.drawImage(frozen,0,0,width,height);}
    context.globalAlpha=1;
    const frame=frameProvider();
    if(frame){
      const identity=`${frame.id}/${frame.key}/${frame.shot}/${!!frame.ended}`;
      if(identity!==cueIdentity){cueIdentity=identity;cueLog.push({recordingSecond:(performance.now()-startedAt)/1000,...frame});}
      const d=frame.live?.decision,di=d?`${frame.id}/${d.choice}/${d.phase}/${d.ready}`:'';
      if(d&&di!==decisionIdentity){decisionIdentity=di;decisionLog.push({recordingSecond:(performance.now()-startedAt)/1000,cue:frame.id,...d});}
      const notes=frame.annotations??[],ni=frame.id+'/'+notes.map(n=>[n.anchor,n.title,n.detail].join('|')).join('/');
      if(notes.length&&ni!==annotationIdentity){annotationIdentity=ni;annotationLog.push({recordingSecond:(performance.now()-startedAt)/1000,cue:frame.id,phase:d?.phase??frame.live?.outcome?.label,notes});}
      const m=frame.motion,mi=frame.id+'/'+(m?.phase??'settled'),now=performance.now();
      if(mi!==motionIdentity||(m&&now-motionSample>250)){motionIdentity=mi;motionSample=now;motionLog.push({recordingSecond:(now-startedAt)/1000,cue:frame.id,phase:m?.phase??'settled',...m});}
      if(['oasis','market'].includes(frame.live?.stage)&&now-workSample>500){workSample=now;workLog.push({recordingSecond:(now-startedAt)/1000,cue:frame.id,...frame.work,caption:frame.spokenCaption,dialogue:frame.live.dialogue?.id});}
    }
    drawFilm(context,frame,width,height);
  };
}
