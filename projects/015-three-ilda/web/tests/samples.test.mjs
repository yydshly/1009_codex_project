import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleDefinitions, makeFrames, encodeILDA } from '../src/samples.js';
import { ILDALoader } from '../vendor/three-ilda/src/loaders/ILDALoader.js';
import { LaserScanner, SCANNER_DEFAULTS } from '../vendor/three-ilda/src/core/LaserScanner.js';
for (const definition of sampleDefinitions) test(`原创 ${definition.id} 经真实解析器与扫描器读取`, () => {
  const original = makeFrames(definition.id), asset = new ILDALoader().parse(encodeILDA(original, definition.id));
  assert.equal(asset.frames.length, definition.frames); assert.equal(asset.eof, true);
  assert.equal(asset.tracks.size, 1); assert.ok(asset.blanked > 0); assert.equal(asset.paletteFallbacks, 0);
  for (const frame of asset.frames) {
    assert.equal(frame.count, original[0].length);
    for (const n of frame.position) assert.ok(Number.isFinite(n) && n >= -1 && n < 1);
  }
  const firstLit = original[0].findIndex(p => !p.blank), expected = original[0][firstLit];
  for (let j = 0; j < 3; j++) assert.ok(Math.abs(asset.frames[0].color[firstLit * 3 + j] - expected.color[j] / 255) < 1e-6);
  const scanner = new LaserScanner(asset.frames, 4096); scanner.advance(.2, SCANNER_DEFAULTS);
  const out = scanner.snapshot(SCANNER_DEFAULTS.lightDecay); assert.ok(out.count > 0);
  assert.ok(out.position.every(Number.isFinite)); assert.ok(out.color.some(x => x > 0));
});
