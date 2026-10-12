import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseProgram } from '../src/program-loader.js';
import { ILDALoader, LaserShow } from '../vendor/three-ilda/src/webgl.js';

const catalog = JSON.parse(await readFile(new URL('../public/shows/catalog.json', import.meta.url), 'utf8'));
const upstream = catalog.filter(entry => entry.origin === 'upstream');
assert.equal(upstream.length, 18);
assert.equal(catalog.length, 22);
assert.equal(new Set(catalog.map(entry => entry.id)).size, 22);

for (const entry of upstream) {
  test(`上游 ${entry.name} 原文件、预览帧和真实扫描几何`, async () => {
    const bytes = await readFile(new URL(`../public/${entry.file}`, import.meta.url));
    assert.equal(bytes.length, entry.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const asset = parseProgram(buffer, entry), frames = asset.tracks.get(entry.track);
    assert.equal(asset.totalPoints, entry.totalPoints);
    assert.equal(frames.length, entry.frames);
    assert.ok(frames[entry.previewFrame]);
    const show = new LaserShow(asset, { track: entry.track, capacity: 4096 });
    try {
      show.beamMode = 'Front';
      show.seekFrame(entry.previewFrame);
      assert.ok(show.projection.geometry.drawRange.count > 0, '真实扫描输出包含可绘制线段');
      assert.ok(show.beams.geometry.drawRange.count > 0, '真实扫描输出包含空气光束三角面');
      for (const n of show.scanner.snapshot(.9).position) assert.ok(Number.isFinite(n));
      show.update(.05);
      assert.ok(show.scanner.count > 0);
      if (entry.palette === 'observable-demo') {
        const standard = new ILDALoader().parse(buffer);
        assert.notDeepEqual(asset.frames[0].color, standard.frames[0].color, '保留上游特殊调色板');
      }
    } finally { show.dispose(); }
    const preview = await readFile(new URL(`../public/${entry.preview}`, import.meta.url), 'utf8');
    assert.ok(preview.includes('<path'), '缩略图包含真实源路线');
  });
}
