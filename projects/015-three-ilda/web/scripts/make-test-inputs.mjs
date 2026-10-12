// 本地文件导入验证输入，不进入 public/ 与发布产物。
import { mkdir, writeFile } from 'node:fs/promises';
import { encodeILDA, makeFrames } from '../src/samples.js';
const dir = new URL('../tests/fixtures/', import.meta.url); await mkdir(dir, { recursive: true });
await writeFile(new URL('invalid.ild', dir), 'This is deliberately not an ILDA file.');
const a = new Uint8Array(encodeILDA(makeFrames('corners').slice(0, 2), 'TRACK0'));
const b = new Uint8Array(encodeILDA(makeFrames('orbits').slice(0, 2), 'TRACK3'));
const view = new DataView(b.buffer); let offset = 0;
while (offset < b.length - 32) { view.setUint8(offset + 30, 3); offset += 32 + view.getUint16(offset + 24) * 8; }
const combined = new Uint8Array(a.length - 32 + b.length); combined.set(a.subarray(0, a.length - 32)); combined.set(b, a.length - 32);
await writeFile(new URL('multi-track.ild', dir), combined);
