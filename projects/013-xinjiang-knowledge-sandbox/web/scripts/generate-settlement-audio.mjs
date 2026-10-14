// Build-time, public narration only. Credentials are never copied or printed.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {directorModelNarration} from '../public/director-model-narration.js';
const args=process.argv.slice(2),round=args[args.indexOf('--round')+1];
if(!args.includes('--round')||!/^round-\d+$/.test(round))throw Error('Specify --round round-N');
const project=path.resolve('..'),roundRoot=path.join(project,'process',round),output=path.join(roundRoot,'audio');
if(await fs.access(path.join(roundRoot,'retention.json')).then(()=>true,()=>false))throw Error('This round has been frozen; use a new incremental round.');
await fs.mkdir(output,{recursive:true});
const config=await fs.readFile('F:/codex_project/.env.minimax','utf8');
const key=process.env.MINIMAX_API_KEY??config.match(/^\s*(?:export\s+)?MINIMAX_API_KEY\s*=\s*['"]?([^\r\n'"#]+)/m)?.[1]?.trim();
if(!key)throw Error('MiniMax credential not configured.');
const live=path.resolve('public/assets/audio/director'),manifest=JSON.parse(await fs.readFile(path.join(live,'manifest.json'),'utf8'));
const ff='D:/26project/26audio_and_video_project/ffmpeg-n6.1.3-win64-gpl-shared-6.1/bin/ffmpeg.exe',probe=path.join(path.dirname(ff),'ffprobe.exe');
const sha=b=>createHash('sha256').update(b).digest('hex');const duration=f=>Number(JSON.parse(execFileSync(probe,['-v','error','-show_format','-of','json',f],{encoding:'utf8'})).format.duration);
for(const [beat,text]of Object.entries(directorModelNarration.xibe)){
 const id='xibe-'+beat,file=id+'.mp3',metaFile=path.join(output,id+'.json'),rawFile=path.join(output,id+'-take.mp3');
 const payload={model:manifest.model,text,stream:false,subtitle_enable:true,output_format:'hex',language_boost:'Chinese',voice_setting:{voice_id:manifest.voice_id,speed:1.04,vol:1,pitch:0},audio_setting:{sample_rate:32000,bitrate:128000,format:'mp3',channel:1}};
 let metadata;try{metadata=JSON.parse(await fs.readFile(metaFile,'utf8'));if(metadata.requestHash!==sha(JSON.stringify(payload)))throw Error('Request changed');await fs.access(rawFile);}catch{
  const recovered=await fs.readFile(rawFile).catch(()=>null);
  if(recovered)throw Error('Existing audio has no matching request record; preserve it and choose a new round.');
  else{
  const response=await fetch('https://api.minimaxi.com/v1/t2a_v2',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('MiniMax HTTP '+response.status);
  const body=await response.json();if(body.base_resp?.status_code!==0||!body.data?.audio)throw Error('MiniMax status '+body.base_resp?.status_code);
  const bytes=Buffer.from(body.data.audio,'hex');await fs.writeFile(rawFile,bytes);
  let subtitles=[];if(body.data.subtitle_file){const url=new URL(body.data.subtitle_file);if(url.protocol==='https:')try{subtitles=await (await fetch(url)).json();}catch{}}
  metadata={request:payload,requestHash:sha(JSON.stringify(payload)),sourceSHA256:sha(bytes),extra_info:body.extra_info,trace_id:body.trace_id,subtitles};await fs.writeFile(metaFile,JSON.stringify(metadata,null,2)+'\n');}
 }
 const delivered=path.join(output,file);execFileSync(ff,['-hide_banner','-loglevel','error','-y','-i',rawFile,'-af','loudnorm=I=-18:TP=-1.5:LRA=7','-ar','32000','-ac','1','-c:a','libmp3lame','-b:a','128k',delivered]);
 const bytes=await fs.readFile(delivered),seconds=duration(delivered),sourceDuration=duration(rawFile);
 const segments=text.match(/[^。！？]+[。！？]?/g)??[text];let cursor=0;
 const subtitles=segments.map(segment=>{const begin=cursor;cursor+=segment.length;return {text:segment,time_begin:begin/text.length*seconds*1000,time_end:cursor/text.length*seconds*1000};});
 // API subtitles often contain an entire paragraph. Split them for readable captions,
 // retaining original provider timings in the process metadata above.
 if(metadata.subtitles?.length>1){let combined='';const timed=metadata.subtitles.map(s=>({...s,text:s.text??s.pronounce_text,time_begin:s.time_begin*seconds/sourceDuration,time_end:Math.min(seconds*1000,s.time_end*seconds/sourceDuration)}));combined=timed.map(s=>s.text).join('');if(combined===text)subtitles.splice(0,subtitles.length,...timed);}
 const clip={id,event:'xibe',beat,file,text,duration:seconds,sha256:sha(bytes),bytes:bytes.length,requestHash:metadata.requestHash,sourceSHA256:metadata.sourceSHA256,model:manifest.model,voice_id:manifest.voice_id,speed:1.04,subtitles,subtitlePolicy:'provider timing where available; otherwise sentence timing estimated from text length'};
 const index=manifest.clips.findIndex(c=>c.id===id);if(index<0)manifest.clips.push(clip);else manifest.clips[index]=clip;
 await fs.writeFile(path.join(live,file+'.installing'),bytes);await fs.rename(path.join(live,file+'.installing'),path.join(live,file));console.log(id+': '+seconds.toFixed(3)+' seconds');
}
const archived=manifest.clips.find(c=>c.id==='zhang-desert');if(archived){archived.archiveOnly=true;archived.scope='R80 original experiment narration; no historical director playback.';}
manifest.version='R'+round.split('-')[1];await fs.writeFile(path.join(live,'manifest.json.installing'),JSON.stringify(manifest,null,2)+'\n');await fs.rename(path.join(live,'manifest.json.installing'),path.join(live,'manifest.json'));
