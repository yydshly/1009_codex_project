import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { STAGE_CUES, STAGE_DURATION, stageCueAt, syncStageShows } from '../src/stage-plan.js';
import { StageAudio } from '../src/stage-audio.js';
import { parseProgram } from '../src/program-loader.js';
import { LaserShow } from '../vendor/three-ilda/src/webgl.js';

test('五段演出无空隙覆盖 90 秒，边界、跳段与片尾都有唯一段落', () => {
  assert.equal(STAGE_CUES.length, 5); assert.equal(STAGE_CUES[0].start, 0); assert.equal(STAGE_CUES.at(-1).end, STAGE_DURATION);
  STAGE_CUES.forEach((cue, i) => {
    assert.ok(cue.end > cue.start); if (i) assert.equal(cue.start, STAGE_CUES[i - 1].end);
    assert.equal(stageCueAt(cue.start).id, cue.id); assert.equal(stageCueAt(cue.end - .001).id, cue.id);
    assert.equal(cue.programs.length, 3);
  });
  assert.equal(stageCueAt(-1).id, 'arrival'); assert.equal(stageCueAt(90).id, 'finale'); assert.equal(stageCueAt(999).id, 'finale');
});

test('三台真实 LaserShow 由同一时间同步，正常播放、前后跳段、暂停位置与重播一致', async () => {
  const assets = new Map();
  for (const id of ['corners', 'lab-mark', 'orbits', 'light-flower']) {
    const bytes = await readFile(new URL(`../public/shows/${id}.ild`, import.meta.url));
    assets.set(id, parseProgram(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
  }
  const shows = Array.from({ length: 3 }, () => { const show = new LaserShow(null, { capacity: 64 }); show.pointRate = 9000; show.beamMode = 'Front'; return show; });
  try {
    for (const time of [0, 12.375, 12.425, 47.25, 31.5, 31.5, 0, 70.125, 90]) {
      const cue = syncStageShows(shows, assets, time), local = Math.max(0, Math.min(90, time)) - cue.start;
      shows.forEach((show, i) => {
        assert.equal(show.asset, assets.get(cue.programs[i]));
        assert.ok(Math.abs(show.time - local) < 1e-9);
        assert.equal(show.scanner.samples, Math.floor(local * show.pointRate + 1e-9));
        assert.equal(show.playing, false, '只由统一主时钟推进');
        for (const value of show.scanner.snapshot(.9).position) assert.ok(Number.isFinite(value));
      });
    }
    assert.ok(shows.every(show => show.projection.geometry.drawRange.count > 0 && show.beams.geometry.drawRange.count > 0));
  } finally { shows.forEach(show => show.dispose()); }
});

test('交付的原创配乐是完整 90 秒单声道 PCM，含有效信号、淡入淡出且没有削波', async () => {
  const bytes = await readFile(new URL('../public/stage/aurora-90s.wav', import.meta.url));
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF'); assert.equal(bytes.toString('ascii', 8, 12), 'WAVE');
  assert.equal(bytes.readUInt32LE(4), bytes.length - 8); assert.equal(bytes.readUInt16LE(20), 1);
  assert.equal(bytes.readUInt16LE(22), 1); assert.equal(bytes.readUInt32LE(24), 22050); assert.equal(bytes.readUInt16LE(34), 16);
  assert.equal(bytes.readUInt32LE(40), STAGE_DURATION * 22050 * 2);
  let peak = 0, power = 0;
  for (let i = 44; i < bytes.length; i += 2) { const value = bytes.readInt16LE(i); peak = Math.max(peak, Math.abs(value)); power += value * value; }
  assert.ok(peak > 5000 && peak < 32767); assert.ok(Math.sqrt(power / ((bytes.length - 44) / 2)) > 100);
  assert.equal(bytes.readInt16LE(44), 0); assert.ok(Math.abs(bytes.readInt16LE(bytes.length - 2)) < 2);
});

function contextFixture(decode = Promise.resolve({ duration: 90 })) {
  const sources = [], gain = { gain: { value: 1 }, connect() {} };
  const context = { currentTime: 0, destination: {}, closed: false, resume: async () => {}, createGain: () => gain, decodeAudioData: () => decode, close() { this.closed = true; } };
  context.createBufferSource = () => {
    const source = { offset: null, stops: 0, connects: 0, connect() { this.connects++; }, disconnect() {}, start(_, offset) { this.offset = offset; }, stop() { this.stops++; }, onended: null };
    sources.push(source); return source;
  };
  return { context, sources, gain };
}

test('音频主时钟在暂停后冻结，跳转播放从新位置续播，静音不改变时间', async () => {
  const fake = contextFixture(); let creations = 0;
  const audio = new StageAudio(new ArrayBuffer(0), () => { creations++; return fake.context; });
  assert.equal(creations, 0, '用户播放前不创建音频上下文');
  await audio.play(); assert.equal(creations, 1); assert.equal(fake.sources[0].offset, 0);
  fake.context.currentTime = 8.25; assert.equal(audio.time, 8.25);
  audio.pause(); fake.context.currentTime = 18.25; assert.equal(audio.time, 8.25);
  audio.seek(30); await audio.play(); assert.equal(fake.sources.at(-1).offset, 30);
  fake.context.currentTime += 2; assert.equal(audio.time, 32);
  audio.seek(50); assert.equal(fake.sources.at(-1).offset, 50); assert.equal(audio.playing, true);
  audio.muted = true; audio.applyVolume(); assert.equal(fake.gain.gain.value, 0);
  fake.context.currentTime += .5; assert.equal(audio.time, 50.5);
  audio.muted = false; audio.volume = .2; audio.applyVolume(); assert.equal(fake.gain.gain.value, .2);
  audio.dispose(); assert.equal(audio.playing, false); assert.equal(fake.context.closed, true);
});

test('解码等待期间暂停会取消旧播放请求，过期请求不能重新启动音乐', async () => {
  let resolve; const decode = new Promise(done => { resolve = done; }), fake = contextFixture(decode);
  const audio = new StageAudio(new ArrayBuffer(0), () => fake.context);
  const pending = audio.play(); await Promise.resolve(); audio.pause(); audio.seek(12);
  resolve({ duration: 90 }); await pending;
  assert.equal(audio.playing, false); assert.equal(audio.time, 12); assert.equal(fake.sources.length, 0);
  await audio.play(); assert.equal(fake.sources[0].offset, 12); audio.dispose();
});

test('音频结束停在片尾，重新播放从头开始，片尾跳转不会创建空播放节点', async () => {
  const fake = contextFixture(), audio = new StageAudio(new ArrayBuffer(0), () => fake.context);
  await audio.play(); fake.context.currentTime = 90; fake.sources[0].onended();
  assert.equal(audio.playing, false); assert.equal(audio.time, 90);
  await audio.play(); assert.equal(fake.sources.at(-1).offset, 0);
  const count = fake.sources.length; audio.seek(90); assert.equal(audio.playing, false); assert.equal(fake.sources.length, count);
  audio.dispose();
});
