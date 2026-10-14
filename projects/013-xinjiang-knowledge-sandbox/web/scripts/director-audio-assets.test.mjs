import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {directorPaths} from '../public/exploration-director-paths.js';

test('director narration is complete, timed, and shares existing recordings',async()=>{
 const url=new URL('../public/assets/audio/director/manifest.json',import.meta.url);
 const manifest=JSON.parse(await fs.readFile(url,'utf8'));
 const historical=JSON.parse(await fs.readFile(new URL('../public/assets/audio/history-story/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.clips.length,44);assert.equal(manifest.clips.filter(c=>!c.reused).length,35);
 assert.equal(new Set(manifest.clips.map(c=>c.id)).size,44);
 for(const c of manifest.clips){
  const bytes=await fs.readFile(new URL(c.file,url));
  assert.equal(bytes.length,c.bytes,c.id);assert.equal(createHash('sha256').update(bytes).digest('hex'),c.sha256,c.id);
  assert(c.duration>0&&Number.isFinite(c.duration),c.id);
  assert.equal(c.subtitles.map(s=>s.text).join(''),c.text,c.id);
  assert(c.subtitles.every((s,i)=>s.time_begin>=0&&s.time_end>s.time_begin&&s.time_end<=c.duration*1000+100&&(!i||s.time_begin>=c.subtitles[i-1].time_end)),c.id);
  if(c.reused){const old=historical.clips.find(x=>x.id===c.id);assert.equal(c.sha256,old.sha256);assert.equal(c.file,'../history-story/'+old.file);}
 }
 const files=new Set();
 for(const path of Object.values(directorPaths))for(const shot of path.shots.filter(s=>s.audio)){
  const clip=manifest.clips.find(c=>c.event===shot.audio.event&&c.beat===shot.audio.beat);
  assert(clip,`${path.id}: ${shot.id}`);assert.equal(clip.text,shot.speech);files.add(clip.file);
 }
 assert.equal(files.size,34,'historical paths omit the archived, unsupported desert recording');
 assert.equal(manifest.clips.find(c=>c.id==='zhang-desert').archiveOnly,true);
 const mission=manifest.clips.find(c=>c.id==='zhang-mission-route');assert.equal(mission.visualCues.length,7);
 assert.deepEqual(mission.visualCues.map(c=>c.progress),[.02,.30,.49,.60,.72,.84,.96]);
 assert(mission.visualCues.every((c,i)=>c.fraction>=0&&c.fraction<1&&(!i||c.fraction>mission.visualCues[i-1].fraction)&&mission.text.includes(c.needle)));
 for(const path of Object.values(directorPaths))for(const shot of path.shots){
  const key=shot.audio??{event:path.id,beat:['background','process','impact'][shot.beat]};
  assert(manifest.clips.some(c=>c.event===key.event&&c.beat===key.beat),`${path.id}/${shot.id} must have narration`);
 }
});
