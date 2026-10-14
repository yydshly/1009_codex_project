import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {captionAt,filmContextAt} from '../public/film-reading.js';
test('all actual selected speech is transcribed and bounded by its waveform-verified window',async()=>{
 const data=JSON.parse(await readFile(new URL('../public/assets/captions/r29-subtitles.json',import.meta.url),'utf8'));
 const verified=JSON.parse(await readFile(new URL('../../process/round-29/speech-and-sync-verification.json',import.meta.url),'utf8'));
 assert.equal(data.transcript.length,41);assert.equal(data.transcript.filter(t=>t.kind==='narration').length,33);
 for(const speech of verified.results){const rows=data.phrases.filter(p=>p.id===speech.id),line=data.transcript.find(t=>t.id===speech.id);
  assert.equal(rows.map(p=>p.text).join(''),line.text);assert(rows[0].start>=speech.matchedSecond-.001);
  assert(rows.at(-1).end<=speech.matchedSecond+speech.durationSeconds+.001);
 }
 for(const [i,p] of data.phrases.entries()){
  assert(p.start<p.end&&p.end<data.duration);if(i)assert(data.phrases[i-1].end<=p.start);
  assert.equal(captionAt(data.phrases,(p.start+p.end)/2),p);
 }
 assert.equal(captionAt(data.phrases,data.duration),null);
});
test('seeking changes place and period independently of subtitle silence',()=>{
 assert.match(filmContextAt(20).place,/新疆/);assert.match(filmContextAt(102).place,/吐鲁番/);
 assert.match(filmContextAt(355).era,/1764/);assert.match(filmContextAt(420).intro,/不同社区/);
 assert.match(filmContextAt(548).place,/霍尔果斯/);assert.match(filmContextAt(630).place,/地球/);
});
