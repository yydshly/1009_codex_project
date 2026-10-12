import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, ['--check', path.join(web, 'src/app.js')]);
const root = path.join(web, 'dist');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
if (html.includes('__REF__')) throw new Error('源码引用版本尚未替换');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('HTML 存在重复 ID');
for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (href.startsWith('#')) {
    if (!ids.includes(href.slice(1))) throw new Error(`缺少锚点 ${href}`);
  } else if (!/^(https?:|\.\.\/)/.test(href)) {
    await stat(path.join(root, href.split('#')[0]));
  }
}
const original = await readFile(path.join(web, '..', 'assets/agenvo-guide.png'));
const published = await readFile(path.join(root, 'assets/agenvo-guide.png'));
if (!original.equals(published)) throw new Error('发布引导图与原图不一致');
console.log('通过：脚本语法、静态资源、目录锚点、固定源码引用、引导图一致性。');
