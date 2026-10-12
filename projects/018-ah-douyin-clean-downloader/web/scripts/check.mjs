import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceRef } from '../src/content.mjs';
const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(web, 'dist');
execFileSync(process.execPath, ['--check', path.join(web, 'src/app.js')]);
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('HTML ID 重复');
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (url.startsWith('#')) {
    if (!ids.includes(url.slice(1))) throw new Error('缺少锚点：' + url);
  } else if (!/^(https?:|\.\.\/)/.test(url)) {
    await stat(path.join(dist, url.split('#')[0]));
  }
}
for (const [, id] of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)) {
  for (const target of id.split(' ')) if (!ids.includes(target)) throw new Error('ARIA 关联不存在：' + target);
}
const original = await readFile(path.join(web, '../assets/douyin-guide.png'));
const published = await readFile(path.join(dist, 'assets/douyin-guide.png'));
if (!original.equals(published)) throw new Error('发布图片与原图不一致');
const provenance = JSON.parse(await readFile(path.join(web, '../assets/guide-provenance.json'), 'utf8'));
if (createHash('sha256').update(original).digest('hex') !== provenance.sha256) throw new Error('原图 SHA-256 不符');
if (!html.includes(sourceRef) || !html.includes('未登录抖音')) throw new Error('研究依据或验证范围缺失');
console.log('通过：脚本语法、资源/锚点/ARIA 关联、固定来源与原图 SHA-256 一致性。');
