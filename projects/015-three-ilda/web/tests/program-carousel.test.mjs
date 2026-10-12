import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ProgramCarousel } from '../src/program-carousel.js';
import { parseProgram } from '../src/program-loader.js';
import { LaserScanner, SCANNER_DEFAULTS } from '../vendor/three-ilda/src/core/LaserScanner.js';
import { LaserShow } from '../vendor/three-ilda/src/webgl.js';

const entries = JSON.parse(await readFile(new URL('../public/shows/catalog.json', import.meta.url), 'utf8'));
const ids = entries.map(entry => entry.id);
async function readAsset(entry) {
  const bytes = await readFile(new URL(`../public/${entry.file}`, import.meta.url));
  return parseProgram(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), entry);
}
const fixture = await readAsset(entries[0]);
function active(scanner, id = ids[0]) {
  const carousel = new ProgramCarousel(ids);
  carousel.select(id, scanner); carousel.setEnabled(true);
  return carousel;
}
function tick(show, carousel, seconds, options = {}) {
  const playback = { playing: show.playing, ...options };
  show.update(carousel.playbackDelta(seconds, show.pointRate, playback));
  return carousel.advance(playback);
}
test('22 个真实文件逐点播完全部帧各一次，片尾不越界，最后回到第一个', async () => {
  const carousel = new ProgramCarousel(ids), visited = [];
  carousel.setEnabled(true);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i], asset = await readAsset(entry);
    const frames = asset.tracks.get(entry.track), scanner = new LaserScanner(frames, 32);
    const scanned = new Uint32Array(frames.length), sample = scanner.sample;
    scanner.sample = function (params, born) { scanned[this.frame]++; sample.call(this, params, born); };
    carousel.select(entry.id, scanner); visited.push(entry.id);
    assert.equal(scanner.samples, 0, '从第 1 帧第 1 个点开始');
    let steps = 0;
    while (carousel.remainingPoints > 0) {
      assert.equal(carousel.advance(), null, `${entry.id} 尚未完整播放不能切换`);
      const rate = [12000, 7001, 24000][steps % 3], dt = [1 / 60, .05, .0031, 2][steps % 4];
      scanner.advance(carousel.playbackDelta(dt, rate), { ...SCANNER_DEFAULTS, rate });
      assert.ok(++steps < 5000, '完成状态不能卡住');
    }
    assert.deepEqual([...scanned], frames.map(frame => frame.count), `${entry.id} 每帧每点恰好一次`);
    assert.equal(scanner.samples, scanner.total);
    assert.equal(scanner.lastFrame, frames.length - 1, '最后一次显示的是片尾帧');
    assert.equal(scanner.point, 0, '游标到达循环边界，但没有扫描第二遍');
    const next = carousel.advance();
    assert.equal(next, ids[(i + 1) % ids.length]);
    assert.equal(carousel.advance(), null, '加载中的切换不能重复触发');
  }
  assert.deepEqual([...visited, carousel.nextId], [...ids, ids[0]]);
});

test('真实 LaserShow 暂停和隐藏时保留进度，变更点率后仍扫描完最后一点才切换', () => {
  const show = new LaserShow(fixture, { capacity: 64 });
  try {
    show.reset(); show.pointRate = 12000;
    const carousel = active(show.scanner);
    assert.equal(tick(show, carousel, .137), null);
    const samples = show.scanner.samples, fraction = show.scanner.fraction;
    show.playing = false;
    assert.equal(tick(show, carousel, 600), null);
    show.playing = true;
    assert.equal(tick(show, carousel, 600, { visible: false }), null);
    assert.equal(show.scanner.samples, samples); assert.equal(show.scanner.fraction, fraction);
    show.pointRate = 7313;
    const almostEnd = (carousel.remainingPoints - 1 - fraction) / show.pointRate;
    assert.equal(tick(show, carousel, almostEnd), null);
    assert.equal(carousel.remainingPoints, 1);
    show.pointRate = 24000;
    assert.equal(tick(show, carousel, 600), ids[1]);
    assert.equal(show.scanner.samples, show.scanner.total);
    assert.equal(show.frame, show.frameCount - 1);
  } finally { show.dispose(); }
});

test('异步加载冻结旧节目，手动选择后从新节目第 1 帧继续目录顺序', () => {
  const scanner = new LaserScanner(fixture.tracks.get(0), 32), carousel = active(scanner);
  scanner.advance(carousel.playbackDelta(.1, 12000), { ...SCANNER_DEFAULTS, rate: 12000 });
  const samples = scanner.samples;
  carousel.beginLoad();
  scanner.advance(carousel.playbackDelta(600, 12000), { ...SCANNER_DEFAULTS, rate: 12000 });
  assert.equal(scanner.samples, samples); assert.equal(carousel.advance(), null);
  const nextScanner = new LaserScanner(fixture.tracks.get(0), 32);
  carousel.select(ids[15], nextScanner);
  assert.equal(carousel.remainingPoints, nextScanner.total);
  nextScanner.advance(carousel.playbackDelta(600, 12000), { ...SCANNER_DEFAULTS, rate: 12000 });
  assert.equal(carousel.advance(), ids[16]);
});

test('上游跳帧、暂停调参、重播和换轨后重新对齐真实扫描计数', () => {
  const frames = fixture.tracks.get(0);
  const asset = { ...fixture, tracks: new Map([[0, frames], [1, frames.slice(0, 2)]]) };
  const show = new LaserShow(asset, { track: 0, capacity: 64 });
  try {
    show.reset(); const carousel = active(show.scanner);
    show.playing = false;
    show.seekFrame(8); carousel.reset(show.scanner);
    assert.equal(carousel.remainingPoints, show.scanner.total - show.scanner.point);
    assert.equal(tick(show, carousel, 600), null);
    show.gain = .6; carousel.reset(show.scanner);
    show.playing = true;
    assert.equal(tick(show, carousel, 600), ids[1]);
    show.reset(); carousel.select(ids[0], show.scanner);
    assert.equal(show.scanner.samples, 0); assert.equal(carousel.remainingPoints, show.scanner.total);
    show.playing = false; show.seekFrame(show.frameCount - 1); carousel.reset(show.scanner);
    assert.equal(carousel.remainingPoints, 0); assert.equal(tick(show, carousel, 600), null);
    show.playing = true;
    assert.equal(tick(show, carousel, .05), ids[1]);
    assert.equal(show.frame, show.frameCount - 1, '拖到片尾后恢复不能绕回第 1 帧');
    show.setTrack(1); show.reset(); carousel.select(ids[0], show.scanner);
    assert.equal(show.frameCount, 2); assert.equal(show.scanner.samples, 0);
    assert.equal(tick(show, carousel, 600), ids[1]);
    assert.equal(show.scanner.samples, frames[0].count + frames[1].count);
  } finally { show.dispose(); }
});

test('关闭轮播后当前节目可循环，重新开启时从头完整播放', () => {
  const show = new LaserShow(fixture, { capacity: 32 });
  try {
    show.reset(); const carousel = active(show.scanner);
    carousel.setEnabled(false);
    assert.equal(tick(show, carousel, show.scanner.total * 2.5 / show.pointRate), null);
    assert.ok(show.scanner.samples > show.scanner.total * 2);
    show.reset(); carousel.reset(show.scanner); carousel.setEnabled(true);
    assert.equal(show.scanner.samples, 0);
    assert.equal(tick(show, carousel, 600), ids[1]);
    assert.equal(show.scanner.samples, show.scanner.total);
  } finally { show.dispose(); }
});

test('单帧节目及分数点进度也能完整播放一次，不误判初始游标为片尾', () => {
  const frame = fixture.tracks.get(0)[0], scanner = new LaserScanner([frame], 32);
  const carousel = active(scanner), rate = 11777, params = { ...SCANNER_DEFAULTS, rate };
  assert.equal(carousel.remainingPoints, frame.count); assert.equal(carousel.advance(), null);
  scanner.advance(carousel.playbackDelta(.000019, rate), params);
  assert.equal(scanner.samples, 0); assert.ok(scanner.fraction > 0);
  assert.equal(carousel.advance(), null);
  scanner.advance(carousel.playbackDelta(600, rate), params);
  assert.equal(scanner.samples, frame.count); assert.equal(scanner.lastFrame, 0);
  assert.equal(carousel.advance(), ids[1]);
});
