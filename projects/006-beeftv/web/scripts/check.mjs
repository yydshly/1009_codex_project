import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(web, 'public');
const document = await readFile(path.join(publicDir, 'index.html'), 'utf8');
const ids = [...document.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('HTML 存在重复 id');
let references = 0;
for (const [, reference] of document.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if (reference.startsWith('#')) {
    if (reference.length > 1 && !ids.includes(reference.slice(1))) throw new Error(`章节锚点不存在：${reference}`);
  } else if (reference.startsWith('./')) {
    const filename = path.resolve(publicDir, reference.split(/[?#]/)[0]);
    if (!filename.startsWith(publicDir + path.sep)) throw new Error(`资源越界：${reference}`);
    if (!(await stat(filename)).isFile()) throw new Error(`本地资源不存在：${reference}`);
    references++;
  }
}
for (const filename of (await readdir(publicDir)).filter((name) => name.endsWith('.js'))) {
  execFileSync(process.execPath, ['--check', path.join(publicDir, filename)], { stdio: 'inherit' });
}
const expectedHash = '000ed36cb6284114ae470d3e8c37c239c306f0e0d2a33a5324a2d0748e737458';
for (const filename of [path.join(web, '../assets/beeftv-overview.png'), path.join(publicDir, 'assets/beeftv-overview.png')]) {
  const bytes = await readFile(filename);
  if (createHash('sha256').update(bytes).digest('hex') !== expectedHash) throw new Error('原能力全景图已发生变化');
  if (bytes.readUInt32BE(16) !== 2400 || bytes.readUInt32BE(20) !== 4623) throw new Error('全景图尺寸错误');
}
console.log(`BeefTV 校验通过：JS 语法、${ids.length} 个唯一锚点、${references} 处资源引用、两份原图 SHA-256 与尺寸。`);
