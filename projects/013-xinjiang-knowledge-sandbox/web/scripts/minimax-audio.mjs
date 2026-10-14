// Build-time generation only. Credentials never enter the browser or artifacts.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),option=name=>args[args.indexOf(name)+1];
if(!args.includes('--work-orders')||!args.includes('--output'))throw Error('Supply --work-orders and --output; optionally --credential-config and --install.');
const work=JSON.parse(await fs.readFile(path.resolve(option('--work-orders')),'utf8'));
const output=path.resolve(option('--output'));await fs.mkdir(output,{recursive:true});
const hosts=new Set(['https://api.minimaxi.com/v1/t2a_v2','https://api.minimax.cn/v1/t2a_v2','https://api.minimax.io/v1/t2a_v2']);
if(!hosts.has(work.endpoint))throw Error('An official MiniMax T2A endpoint is required.');
let apiKey=process.env.MINIMAX_API_KEY;
if(!apiKey&&args.includes('--credential-config')){
 const config=await fs.readFile(path.resolve(option('--credential-config')),'utf8');
 const section=config.split('[model_providers.minimax]')[1]?.split(/\n\[/)[0];
 apiKey=section?.match(/experimental_bearer_token\s*=\s*"([^"]+)"/)?.[1];
}
if(!apiKey)throw Error('Configure MINIMAX_API_KEY locally.');
const ff=process.env.FFMPEG_PATH||'D:/26project/26audio_and_video_project/ffmpeg-n6.1.3-win64-gpl-shared-6.1/bin/ffmpeg.exe';
const probe=path.join(path.dirname(ff),'ffprobe.exe');
const hash=b=>createHash('sha256').update(b).digest('hex');
const duration=file=>Number(JSON.parse(execFileSync(probe,['-v','error','-show_format','-of','json',file],{encoding:'utf8'})).format.duration);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let requestedAt=0;
const results=[];
for(const clip of work.clips){
 if(!/^[a-z0-9-]+$/.test(clip.id)||!['narration','dialogue'].includes(clip.kind))throw Error('Invalid clip identity.');
 const folder=path.join(output,clip.kind,clip.id);await fs.mkdir(folder,{recursive:true});
 let speed=clip.speed,selected;
 for(let attempt=1;attempt<=4;attempt++){
  const payload={model:work.model,text:clip.text,stream:false,output_format:'hex',language_boost:'Chinese',voice_setting:{voice_id:clip.voice_id,speed,vol:1,pitch:0},audio_setting:{sample_rate:32000,bitrate:128000,format:'mp3',channel:1}};
  const requestHash=hash(JSON.stringify(payload)),raw=path.join(folder,`take-${attempt}.mp3`),meta=path.join(folder,`take-${attempt}.json`);
  let response;
  try{response=JSON.parse(await fs.readFile(meta,'utf8'));if(response.requestHash!==requestHash)throw Error('Mismatch');await fs.access(raw);}catch{
   // Unknown account tier: stay below the documented free-account 10 RPM.
   await wait(Math.max(0,6300-(Date.now()-requestedAt)));requestedAt=Date.now();
   const res=await fetch(work.endpoint,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
   if(!res.ok)throw Error(`MiniMax HTTP ${res.status}; no audio installed.`);
   const body=await res.json(),code=body.base_resp?.status_code;
   if(code===1002||code===1039){await wait(30000);attempt--;continue;}
   if(code!==0||body.data?.status!==2||!body.data?.audio)throw Error(`MiniMax status ${code}; no audio installed.`);
   const bytes=Buffer.from(body.data.audio,'hex');if(bytes.length<1024)throw Error('Empty or invalid audio.');
   await fs.writeFile(raw,bytes);response={requestHash,request:payload,provider:work.provider,endpoint:work.endpoint,base_resp:body.base_resp,trace_id:body.trace_id,extra_info:body.extra_info,sha256:hash(bytes),generatedAt:new Date().toISOString()};
   await fs.writeFile(meta,JSON.stringify(response,null,2)+'\n');
  }
  const seconds=duration(raw);
  if(seconds<=clip.maxDuration){selected={raw,response,seconds,speed,attempt};break;}
  const next=Math.round(speed*(seconds/(clip.maxDuration-.1))*100)/100;
  if(next>1.4)throw Error(`${clip.id} needs a shorter line, instead of a rushed delivery (${seconds}s).`);
  speed=next;
 }
 if(!selected)throw Error(`${clip.id} did not fit the response window.`);
 const encoded=path.join(folder,'delivery.mp3');
 execFileSync(ff,['-hide_banner','-loglevel','error','-y','-i',selected.raw,'-af','loudnorm=I=-18:TP=-1.5:LRA=7','-ar','32000','-ac','1','-c:a','libmp3lame','-b:a','128k',encoded]);
 const bytes=await fs.readFile(encoded),seconds=duration(encoded);
 if(seconds>clip.maxDuration)throw Error(`${clip.id} encoding exceeds its window.`);
 const result={id:clip.id,kind:clip.kind,file:clip.id+'.mp3',voice_id:clip.voice_id,role:clip.role,text:clip.text,maxDuration:clip.maxDuration,sourceWaveDuration:selected.seconds,tempo:1,encodedDuration:seconds,speed:selected.speed,selectedTake:selected.attempt,sha256:hash(bytes),bytes:bytes.length,sourceSHA256:selected.response.sha256,model:work.model,trace_id:selected.response.trace_id};
 results.push(result);console.log(`${results.length}/${work.clips.length} ${clip.id}: ${seconds.toFixed(2)}s / ${clip.maxDuration}s`);
}
await fs.writeFile(path.join(output,'generation-report.json'),JSON.stringify({pass:true,provider:work.provider,model:work.model,version:work.version,createdAt:work.createdAt,characterCount:work.characterCount,clips:results},null,2)+'\n');
if(args.includes('--install')){
 // Replace a live path atomically: an archived hard link must remain immutable.
 async function replace(file,bytes){const temp=file+'.installing';await fs.writeFile(temp,bytes);await fs.rename(temp,file);}
 for(const clip of results)await replace(path.join(web,'public/assets/audio',clip.kind==='dialogue'?'dialogue':'',clip.file),await fs.readFile(path.join(output,clip.kind,clip.id,'delivery.mp3')));
 const policy='原创普通话合成旁白和人物对白；不是现场录音、历史引语或真实人物模仿。';
 for(const kind of ['narration','dialogue']){
  const folder=path.join(web,'public/assets/audio',kind==='dialogue'?'dialogue':'');
  const updates=results.filter(c=>c.kind===kind);if(!updates.length)continue;
  const previous=JSON.parse(await fs.readFile(path.join(folder,'manifest.json'),'utf8'));
  const merged=new Map(previous.clips.map(c=>[c.id??c.file.replace(/\.mp3$/,''),c]));for(const clip of updates)merged.set(clip.id,clip);
  const manifest={...previous,createdAt:work.createdAt,version:work.version,voice:`MiniMax ${work.model} / Chinese system voices`,provider:work.provider,model:work.model,policy,text:kind==='dialogue'?'./script.json':'../audio-script.json',ambient:'Original environmental and material Foley design; MiniMax synthetic Mandarin voice; teaching rhythm is original',clips:[...merged.values()]};
  await replace(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 }
 const scriptPath=path.join(web,'public/assets/audio/dialogue/script.json'),script=JSON.parse(await fs.readFile(scriptPath,'utf8'));script.version=work.version;
 for(const clip of script.clips){const generated=results.find(c=>c.id===clip.id);if(generated){clip.maxDuration=generated.maxDuration;clip.voice_id=generated.voice_id;clip.speed=generated.speed;}}
 if(results.some(c=>c.kind==='dialogue'))await replace(scriptPath,JSON.stringify(script,null,2)+'\n');console.log(`Installed ${results.length} verified updates; other clips and archived versions retained.`);
}
