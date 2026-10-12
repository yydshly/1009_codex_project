import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
for(const file of ['app.js','film.js','song-motion.js','performance-video.js','scene-plan.js','scene-shot-plan.js','research.js','overview.js','summary.js'])execFileSync(process.execPath,['--check',path.join(root,file)]);
const timeline=JSON.parse(await fs.readFile(path.join(root,'assets/timeline.json'),'utf8'));
const model=JSON.parse(await fs.readFile(path.join(root,'assets/model-data.json'),'utf8'));
assert.equal(timeline.cues.length,model.records.length);
assert(timeline.duration>30&&timeline.duration<120);
assert.equal(timeline.chapters.length,4);
let previous=0;
for(let i=0;i<timeline.cues.length;i++){
  const cue=timeline.cues[i],record=model.records[i];
  assert(cue.start>=previous&&cue.end>cue.start&&cue.end<timeline.duration,'旁白时间不能重叠或超出片长');
  assert.equal(cue.text,record.text);assert.equal(cue.groups.length,record.groups.length);
  for(const group of record.groups){
    assert(group.ids.length>0&&group.ids.every(id=>Number.isInteger(id)&&id>=0&&id<50257));
    if(group.prediction){
      const p=group.prediction;
      assert(p.pActual>=0&&p.pActual<=1);assert.equal(p.candidates.length,3);
      assert(p.candidates.every(item=>item.p>0&&item.p<=1));
      assert(p.candidates.reduce((n,item)=>n+item.p,0)<=1.000001);
    }
  }
  previous=cue.end;
}
for(const name of ['server.png','rain.png','shore.png','story.mp3','story-emotional.mp3'])assert((await fs.stat(path.join(root,'assets',name))).size>1000);
const score=JSON.parse(await fs.readFile(path.join(root,'assets/emotion-score.json'),'utf8'));
assert.equal(score.duration,timeline.duration);assert.equal(score.rms.length,score.duration*score.fps);
assert(score.rms.every(value=>Number.isFinite(value)&&value>=0&&value<=1));
assert.equal(score.chapters.length,4);
assert.equal(model.revision,'bf2c7f02e0b826c60d03af341171bde20893da66');
assert.equal(model.modelSha256.length,64);
const html=await fs.readFile(path.join(root,'index.html'),'utf8');
const summary=JSON.parse(await fs.readFile(path.join(root,'assets/research/research-summary.json'),'utf8'));
assert.equal(summary.sections.length,10);assert.equal(summary.modules.length,8);assert.equal(summary.extensions.length,4);
assert(html.indexOf('id="overview"')<html.indexOf('class="cinema"'),'完整引导图应先于作品播放器');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);assert.equal(ids.length,new Set(ids).size);
const experiments=JSON.parse(await fs.readFile(path.join(root,'assets/research/experiment-log.json'),'utf8'));
assert.equal(experiments.tests.length,3);assert.equal(experiments.newAccepted,0);
assert.equal(experiments.fullMultisceneGenerationStarted,false);
assert.equal(experiments.totalCostDiamonds,experiments.tests.reduce((total,test)=>total+test.costDiamonds,0));
for(const test of experiments.tests){
  assert.equal(test.approvedForMV,false);assert.equal(test.includedInPlayer,false);
  assert.equal(createHash('sha256').update(await fs.readFile(path.join(root,test.localMedia))).digest('hex'),test.sha256);
  const review=JSON.parse(await fs.readFile(path.join(root,test.review),'utf8'));
  assert.equal(review.sha256,test.sha256);assert.equal(review.approvedForMV,false);
  for(const asset of [test.poster,test.frameEvidence,test.audioVerification])assert((await fs.stat(path.join(root,asset))).size>100);
}
assert.equal(createHash('sha256').update(await fs.readFile(path.join(root,'assets/experiments/opening-original.mp3'))).digest('hex'),experiments.originalInputSha256);
const reference=JSON.parse(await fs.readFile(path.join(root,'assets/research/reference-source.json'),'utf8'));
assert.equal(reference.author,'DJ SHO');assert(reference.source.includes('2108569544151146742'));
const overview=JSON.parse(await fs.readFile(path.join(root,'assets/overview/overview-content.json'),'utf8'));
assert.equal(overview.sections.length,8);assert.equal(overview.experimentalPasses,experiments.newAccepted);
assert.equal(overview.experimentalCostDiamonds,experiments.totalCostDiamonds);
const overviewSvg=await fs.readFile(path.join(root,'assets/overview/overview.svg'),'utf8');
assert.equal([...overviewSvg.matchAll(/<image\b/g)].length,4);
assert.equal([...overviewSvg.matchAll(/href="data:image\//g)].length,4,'总览图必须自包含所有位图');
const overviewPng=await fs.readFile(path.join(root,'assets/overview/overview.png'));
assert.equal(overviewPng.readUInt32BE(16),overview.width*1.5);
assert.equal(overviewPng.readUInt32BE(20),overview.height*1.5);
console.log('一图总览通过：八个模块、自包含矢量、高清 PNG 与真实实验结论。');
assert.equal(new URL(reference.publicMedia).hostname,'video.twimg.com');
assert(reference.watchMarkers.every(marker=>marker.time>=0&&marker.time<reference.duration));
const referenceFile=path.join(root,reference.localMedia);
if(await fs.stat(referenceFile).catch(()=>null)){
  assert.equal(createHash('sha256').update(await fs.readFile(referenceFile)).digest('hex'),reference.sha256);
}
console.log('研究区通过：原片来源、三条拒绝接入的真实样片与文件哈希，原唱输入及测试记录。');
console.log(`014 校验通过：${timeline.duration} 秒、${timeline.cues.length} 段旁白、四章、真实 GPT-2 编号/预测缓存及三张场景图。`);
try{
  const song=JSON.parse(await fs.readFile(path.join(root,'assets/song-timeline.json'),'utf8'));
  const songModel=JSON.parse(await fs.readFile(path.join(root,'assets/song-model-data.json'),'utf8'));
  const rhythm=JSON.parse(await fs.readFile(path.join(root,'assets/song-score.json'),'utf8'));
  assert.equal(song.kind,'song');assert.equal(song.cues.length,songModel.records.length);
  assert.equal(rhythm.duration,song.duration);assert.equal(rhythm.rms.length,Math.ceil(song.duration*rhythm.fps));
  let end=0;
  for(const [i,c] of song.cues.entries()){
    assert(c.start>=end&&c.end>c.start&&c.end<=song.duration,'唱词必须按时间顺序排列');
    assert.equal(c.text,songModel.records[i].text);assert.equal(c.groups.join(''),c.text);
    assert.equal(c.timings.length,c.groups.length);
    let wordEnd=c.start;
    for(const [j,w] of c.timings.entries()){
      assert.equal(w.text,c.groups[j]);assert(w.start>=wordEnd&&w.end>w.start&&w.end<=c.end+.001,'词块边界错误');
      assert(w.accent>=0&&w.accent<=1);wordEnd=w.end;
      assert(songModel.records[i].groups[j].ids.every(id=>Number.isInteger(id)&&id>=0&&id<50257));
    }
    end=c.end;
  }
  for(const name of song.scenes)assert((await fs.stat(path.join(root,'assets',name+'.png'))).size>1000);
  for(const values of [rhythm.beats,rhythm.onsets]){
    assert(values.length>20);assert(values.every((v,i)=>v>=0&&v<song.duration&&(!i||v>values[i-1])));
  }
  assert(rhythm.shots[0].start===0);assert(rhythm.shots.every(s=>s.end>s.start&&s.scene<song.scenes.length));
  assert((await fs.stat(path.join(root,'assets/song.mp3'))).size>100000);
  console.log(`演唱版通过：${song.duration} 秒、${song.cues.length} 行唱词、${rhythm.shots.length} 个镜头、实测节拍与真实 GPT-2 缓存。`);
}catch(error){if(error.code!=='ENOENT')throw error;}
const performancePath=path.join(root,'assets/performance-manifest.json');
if(await fs.stat(performancePath).catch(()=>null)){
  const performance=JSON.parse(await fs.readFile(performancePath,'utf8'));
  const song=JSON.parse(await fs.readFile(path.join(root,'assets/song-timeline.json'),'utf8'));
  assert.equal(performance.status,'complete_vocal_coverage');
  assert.equal(performance.duration,song.duration);
  assert.equal(performance.sources.length,3);
  let end=0;
  for(const clip of performance.clips){
    assert(clip.start>=end&&clip.end>clip.start&&clip.end<=song.duration);
    assert(clip.offset>=0);
    const source=performance.sources.find(s=>s.id===clip.source);
    assert(source&&clip.src==='./assets/'+source.file);
    assert(clip.offset+clip.end-clip.start<=source.videoDuration+.1);
    end=clip.end;
  }
  for(const source of performance.sources){
    const body=await fs.readFile(path.join(root,'assets',source.file));
    assert(body.length>100000);
    assert.equal(createHash('sha256').update(body).digest('hex'),source.sha256);
    assert.equal(source.watermark,true);
    assert(source.audioVerification.waveformCorrelation>=.9);
    assert(Math.abs(source.audioVerification.resultAudioLagSeconds)<=.15);
  }
  for(const cue of song.cues){
    for(const time of [cue.start+.001,(cue.start+cue.end)/2,cue.end-.001]){
      assert(performance.clips.some(c=>time>=c.start&&time<c.end),'唱词的人物表演缺失：'+cue.text);
    }
  }
  console.log(`动态演唱通过：${performance.sources.length} 条真实线上视频、${performance.clips.length} 段回接、全部 ${song.cues.length} 行唱词覆盖及文件哈希。`);
}
const cinemaPath=path.join(root,'assets/cinema-performance-manifest.json');
if(await fs.stat(cinemaPath).catch(()=>null)){
  const cinema=JSON.parse(await fs.readFile(cinemaPath,'utf8'));
  const song=JSON.parse(await fs.readFile(path.join(root,'assets/song-timeline.json'),'utf8'));
  assert.equal(cinema.status,'complete_multiscene_vocal_coverage');
  assert.equal(cinema.duration,song.duration);
  assert.equal(cinema.songSha256,createHash('sha256').update(await fs.readFile(path.join(root,'assets/song.mp3'))).digest('hex'));
  assert(new Set(cinema.performanceScenes).size>=3);
  let end=0;
  for(const clip of cinema.clips){
    const source=cinema.sources.find(s=>s.id===clip.source);
    assert(source&&clip.src==='./assets/'+source.file);
    assert(clip.start>=end&&clip.end>clip.start&&clip.end<=song.duration&&clip.offset>=0);
    assert(clip.offset+clip.end-clip.start<=source.videoDuration+.1);
    end=clip.end;
  }
  const used=new Set(cinema.clips.map(c=>c.source));
  assert(new Set(cinema.sources.filter(s=>used.has(s.id)).map(s=>s.inputPhotoSha256)).size>=3,'必须是实际不同场景来源');
  for(const source of cinema.sources){
    assert.equal(createHash('sha256').update(await fs.readFile(path.join(root,'assets',source.file))).digest('hex'),source.sha256);
    assert(source.audioVerification.waveformCorrelation>=.9&&Math.abs(source.audioVerification.resultAudioLagSeconds)<=.15);
    if(source.provider==='ChatArt'){
      assert.equal(source.jobEvidence.status,'completed');
      assert.equal(source.jobEvidence.approvedForMV,true,'线上生成完成后仍需画面复核通过');
    }
  }
  for(const cue of song.cues)for(const t of [cue.start+.001,(cue.start+cue.end)/2,cue.end-.001]){
    assert(cinema.clips.some(c=>t>=c.start&&t<c.end),'多场景唱词表演缺失：'+cue.text);
  }
  console.log(`多场景演唱通过：${cinema.performanceScenes.length} 个实际场景、${cinema.clips.length} 段回接及全部唱词的对应口型来源。`);
}
