// Incremental build-time synthesis only. The credential file is read in memory and is never archived.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';

const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.dirname(web);
const args=process.argv.slice(2),outputArg=args.indexOf('--output');
if(outputArg<0||!args[outputArg+1])throw Error('Supply --output with a new, writable process/audio directory.');
const output=path.resolve(args[outputArg+1]);
const assets=path.join(web,'public/assets/audio/director');
const {directorPaths}=await import(pathToFileURL(path.join(web,'public/exploration-director-paths.js')));
const pathArg=args.indexOf('--path'),selected=pathArg>=0?args[pathArg+1]:null;
if(selected&&!directorPaths[selected])throw Error('Unknown director path');
const inputs=Object.values(directorPaths).filter(p=>!selected||p.id===selected).flatMap(p=>p.shots.filter(s=>s.speech));
const unique=[...new Map(inputs.map(s=>[s.audio.event+'-'+s.audio.beat,s])).values()];
const ffmpeg = 'D:/26project/26audio_and_video_project/ffmpeg-n6.1.3-win64-gpl-shared-6.1/bin/ffmpeg.exe';
const ffprobe = path.join(path.dirname(ffmpeg), 'ffprobe.exe');
const endpoint = 'https://api.minimax.cn/v1/t2a_v2';
const docs = 'https://platform.minimax.cn/docs/api-reference/speech-t2a-http';
const model = 'speech-2.8-hd';
const voice = 'Chinese (Mandarin)_Gentleman';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const probe = file => JSON.parse(execFileSync(ffprobe, ['-v','error','-show_format','-show_streams','-of','json',file], {encoding:'utf8'}));
const exists = async file => { try { await fs.access(file); return true; } catch { return false; } };
const atomic = async (file, data) => { await fs.writeFile(file + '.installing', data); await fs.rename(file + '.installing', file); };
const env = await fs.readFile('F:/codex_project/.env.minimax', 'utf8');
const values = Object.fromEntries(env.split(/\r?\n/).map(line => line.trim().match(/^(?:export\s+)?([A-Za-z_][A-Za-z_0-9]*)\s*=\s*(.*?)\s*$/)).filter(Boolean).map(([,key,value]) => [key, value.replace(/^(['"])(.*)\1$/, '$2')]));
const key = process.env.MINIMAX_API_KEY || values.MINIMAX_API_KEY;
if (!key) throw new Error('MiniMax credential unavailable; no credential value was read into output.');
await fs.mkdir(assets, {recursive:true});
await fs.mkdir(path.join(output, 'source'), {recursive:true});
await fs.mkdir(path.join(output, 'requests'), {recursive:true});
const clips = [];
const previousPath = path.join(assets, 'manifest.json');
const previousClips = await exists(previousPath) ? JSON.parse(await fs.readFile(previousPath, 'utf8')).clips : [];
let lastRequest = 0;
for(const shot of unique){
    const event=shot.audio.event,beat={id:shot.audio.beat,paragraph:shot.speech};
    const id=event+'-'+beat.id;
    if(!/^(opening|zhang|protectorate|xibe|glacier)-[a-z-]+$/.test(id))throw Error('Unexpected director identity');
    const payload = {
      model, text:beat.paragraph, stream:false, output_format:'hex', language_boost:'Chinese',
      voice_setting:{voice_id:voice, speed:1.04, vol:1, pitch:0},
      audio_setting:{sample_rate:32000, bitrate:128000, format:'mp3', channel:1},
      pronunciation_dict:{tone:['张骞/(zhang1)(qian1)','锡伯/(xi1)(bo2)','察布查尔/(cha2)(bu4)(cha2)(er3)','乌垒/(wu1)(lei3)','都护/(du1)(hu4)']},
      subtitle_enable:true, subtitle_type:'sentence'
    };
    // Ministry of Education dictionary: 大月氏 is da4 yue4 zhi1.
    if (beat.paragraph.includes('大月氏')) payload.pronunciation_dict.tone.push('大月氏/(da4)(yue4)(zhi1)');
    const requestHash = hash(JSON.stringify(payload));
    const reusable=previousClips.find(c=>c.id===id&&c.requestHash===requestHash);
    const reusableFile=path.join(assets,`${id}.mp3`);
    if(reusable&&await exists(reusableFile)&&hash(await fs.readFile(reusableFile))===reusable.sha256){
      clips.push(reusable);console.log(`${clips.length}/${unique.length} ${id}: unchanged recording reused`);continue;
    }
    const stem = `${id}-${requestHash.slice(0,12)}`;
    const rawPath = path.join(output, 'source', `${stem}.mp3`);
    const metaPath = path.join(output, 'requests', `${stem}.json`);
    const subtitlePath = path.join(output, 'source', `${stem}.subtitles.json`);
    let summary;
    if (await exists(rawPath) && await exists(metaPath)) {
      summary = JSON.parse(await fs.readFile(metaPath, 'utf8'));
      if (summary.requestHash !== requestHash || hash(await fs.readFile(rawPath)) !== summary.sha256) throw new Error(`Cache integrity failed: ${id}`);
      console.log(`${id}: verified cached source`);
    } else {
      let response;
      for (let attempt=0; attempt<3; attempt++) {
        await wait(Math.max(0, 6300 - (Date.now()-lastRequest)));
        lastRequest = Date.now();
        try {
          response = await fetch(endpoint, {method:'POST', headers:{Authorization:`Bearer ${key}`, 'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:AbortSignal.timeout(60000)});
        } catch {
          throw new Error(`MiniMax network request failed for ${id}; credential and response not logged.`);
        }
        if (!response.ok) throw new Error(`MiniMax HTTP ${response.status} for ${id}`);
        const body = await response.json();
        const code = body.base_resp?.status_code;
        if ([1002,1039].includes(code) && attempt<2) { await wait(10000); continue; }
        if (code !== 0 || body.data?.status !== 2 || typeof body.data?.audio !== 'string' || !/^[0-9a-f]+$/i.test(body.data.audio)) throw new Error(`MiniMax status ${Number(code)} for ${id}`);
        const bytes = Buffer.from(body.data.audio, 'hex');
        if (bytes.length<1024) throw new Error(`Empty generated audio for ${id}`);
        await atomic(rawPath, bytes);
        summary = {id, event, beat:beat.id, requestHash, request:payload, provider:'MiniMax', endpoint, docs, generatedAt:new Date().toISOString(), statusCode:code, traceId:body.trace_id, extraInfo:body.extra_info, sha256:hash(bytes), bytes:bytes.length};
        const subtitleUrl = body.data?.subtitle_file || body.subtitle_file;
        if (typeof subtitleUrl === 'string' && new URL(subtitleUrl).protocol === 'https:') {
          try {
            const subtitleResponse = await fetch(subtitleUrl, {signal:AbortSignal.timeout(20000)});
            if (subtitleResponse.ok) {
              const subtitleData = await subtitleResponse.json();
              await atomic(subtitlePath, json(subtitleData));
              summary.subtitleAvailable = true;
            }
          } catch { summary.subtitleAvailable = false; }
        }
        await atomic(metaPath, json(summary));
        break;
      }
    }
    let normalizedFromSource=false;
    const delivery = path.join(assets, `${id}.mp3`);
    const previous = previousClips.find(clip => clip.id===id);
    if (!previous || previous.requestHash!==requestHash || previous.normalization.method!=='two-pass' || !await exists(delivery) || hash(await fs.readFile(delivery))!==previous.sha256) {
      normalizedFromSource=true;
      const pending = path.join(assets, `${id}.pending.mp3`);
      const analysis=spawnSync(ffmpeg,['-hide_banner','-nostats','-i',rawPath,'-af','loudnorm=I=-18:TP=-1.5:LRA=7:print_format=json','-f','null','NUL'],{encoding:'utf8'});
      if(analysis.status!==0)throw new Error(`Source loudness analysis failed for ${id}`);
      const levels=JSON.parse(analysis.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0]||'null');
      if(!levels)throw new Error(`Missing source loudness for ${id}`);
      await atomic(path.join(output,'requests',`${stem}.mix.json`),json({method:'two-pass',sourceSHA256:summary.sha256,levels,targets:{I:-18,TP:-1.5,LRA:7}}));
      const filter=`loudnorm=I=-18:TP=-1.5:LRA=7:measured_I=${levels.input_i}:measured_TP=${levels.input_tp}:measured_LRA=${levels.input_lra}:measured_thresh=${levels.input_thresh}:offset=${levels.target_offset}:linear=false`;
      execFileSync(ffmpeg, ['-hide_banner','-loglevel','error','-y','-i',rawPath,'-af',filter,'-ar','32000','-ac','1','-c:a','libmp3lame','-b:a','128k',pending]);
      await fs.rename(pending, delivery);
    }
    const bytes = await fs.readFile(delivery), info = probe(delivery);
    const subtitles = await exists(subtitlePath) ? JSON.parse(await fs.readFile(subtitlePath,'utf8')) : null;
    const clip = {id,event,beat:beat.id,file:`${id}.mp3`,text:beat.paragraph,duration:Number(info.format.duration),sha256:hash(bytes),bytes:bytes.length,requestHash,sourceSHA256:summary.sha256,model,voice_id:voice,speed:1.04,sampleRate:32000,channels:1,normalization:{method:'two-pass',integratedLUFS:-18,truePeakDBTP:-1.5,rangeLU:7,...(!normalizedFromSource?previous?.normalization:{})},subtitles};
    clips.push(clip);
    const manifest = {version:'R76',provider:'MiniMax',model,voice_id:voice,generatedAt:new Date().toISOString(),policy:'原创普通话合成故事讲解；不是历史引语、现场录音或真实人物模仿。',clips};
    await atomic(path.join(output,'generation-checkpoint.json'),json(manifest));
    console.log(`${clips.length}/${unique.length} ${id}: ${clip.duration.toFixed(3)}s, ${bytes.length} bytes`);
 }
const historical=JSON.parse(await fs.readFile(path.join(web,'public/assets/audio/history-story/manifest.json'),'utf8'));
const reused=historical.clips.map(c=>({...c,file:'../history-story/'+c.file,reused:true}));
const merged=[...new Map([...previousClips,...clips,...reused].map(c=>[c.id,c])).values()];
await atomic(path.join(assets,'manifest.json'),json({version:'R90',provider:'MiniMax',model,voice_id:voice,policy:'原创普通话合成导览与故事讲解。旧历史音频引用原文件，不重复保存。',clips:merged}));
await atomic(path.join(output,'generation-report.json'),json({pass:clips.length===unique.length,docs,endpoint,clips:clips.map(({subtitles,...clip})=>({...clip,subtitleEntries:Array.isArray(subtitles)?subtitles.length:null})),totalBytes:clips.reduce((n,c)=>n+c.bytes,0),totalDuration:clips.reduce((n,c)=>n+c.duration,0)}));
console.log(`Completed ${clips.length} director introductions; existing audio unchanged.`);
