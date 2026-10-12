import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {createHash} from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const script = await fs.readFile(path.join(root, 'app.js'), 'utf8');
execFileSync(process.execPath, ['--check', path.join(root, 'app.js')]);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'HTML ID 不能重复');
for (const id of ['overview','summary','io','capabilities','modules','engine','effects','scenarios','business','value','extensions','evidence']) assert(ids.includes(id), '缺少内容：' + id);
for (const match of html.matchAll(/(?:href|src)="\.\/([^"#]+)"/g)) await fs.access(path.join(root, match[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), '锚点无目标：' + match[1]);
for (const match of script.matchAll(/\$\('([^']+)'\)/g)) assert(ids.includes(match[1]), '脚本引用不存在的节点：' + match[1]);
for (const phrase of ['尚未实现','非上游生成成片','当前代码未使用 Remotion 或 HeyGen','静音','源码依据']) assert(html.includes(phrase), '缺少关键说明：' + phrase);
assert(!/(?:\bfetch\s*\(|XMLHttpRequest|OPENCOMPUTER_API_KEY)/.test(script), '讲解页面不应请求生成服务');
for (const [filename, expected] of [['overview-infographic.png','ee01856297e065785626001de01539df77098870c75888221c01bb9b58f66ef6'], ['overview-infographic.svg','8e63f0c73781957997c38341d383123be6180c1fba29ad0893bf6fb17e685e42']]) {
  for (const base of [path.join(root,'assets'),path.resolve(root,'../../assets')]) {
    const bytes = await fs.readFile(path.join(base,filename));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),expected,'原始引导图被改变：'+filename);
  }
}
console.log('ShipVideo 网页检查通过：资源、内容、锚点、节点引用与 JavaScript 语法。');
