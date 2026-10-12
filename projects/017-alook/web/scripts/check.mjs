import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceRef } from '../src/content.mjs';
const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.join(web, 'dist');
execFileSync(process.execPath, ['--check', path.join(web, 'src/app.js')]);
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (ids.length !== new Set(ids).size) throw new Error('存在重复 HTML ID');
for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (url.startsWith('#')) {
    if (!ids.includes(url.slice(1))) throw new Error(`缺失锚点：${url}`);
  } else if (!/^(https?:|\.\.\/)/.test(url)) {
    await stat(path.join(root, url.split('#')[0]));
  }
}
if (!html.includes(sourceRef)) throw new Error('缺少固定研究版本');
const original = await readFile(path.join(web, '../assets/alook-guide.png'));
const published = await readFile(path.join(root, 'assets/alook-guide.png'));
if (!original.equals(published)) throw new Error('发布引导图发生变化');
const provenance = JSON.parse(await readFile(path.join(web, '../assets/guide-provenance.json'), 'utf8'));
if (createHash('sha256').update(original).digest('hex') !== provenance.sha256) throw new Error('引导图与保留的原始 SHA-256 不符');
const flow = JSON.parse(html.match(/<script type="application\/json" id="flow-data">([\s\S]*?)<\/script>/)[1]);
if (flow.length !== 6 || flow.some(s => !s.url.includes(sourceRef))) throw new Error('调用路径缺少固定源码依据');
console.log('通过：脚本语法、静态资源、章节导航、固定源码依据和原图 SHA-256 一致性。');
