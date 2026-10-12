import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseline, rules, modules, examples, summarySections } from './content.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
assert.equal(rules.length, 27);
assert.equal(rules.filter(rule => rule.status === 'stable').length, 5);
assert.equal(rules.filter(rule => rule.status === 'preview').length, 22);
assert.equal(new Set(rules.map(rule => rule.code)).size, 27);
assert.equal(modules.length, 11);
assert.equal(summarySections.length, 9);
assert(html.includes('lang="zh-CN"'));
for (const id of ['guide', 'capabilities', 'architecture', 'examples', 'value', 'adoption', 'extensions', 'boundaries', 'sources']) assert(html.includes(`id="${id}"`), `缺少章节 ${id}`);
for (const example of examples) assert(html.includes(`id="example-${example.id}"`));
for (const rule of rules) assert(html.includes(rule.code) && html.includes(rule.url));
for (const module of modules) assert(html.includes(module.url));
assert(html.includes('页面没有运行 Seiso'), '示例必须声明为说明性内容');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, '存在重复元素 ID');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), `失效锚点 ${match[1]}`);
const expected = ['app.js', 'index.html', 'overview-infographic.png', 'styles.css'];
assert.deepEqual((await readdir(dist)).sort(), expected.sort(), '发布目录包含意外文件');
for (const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) await readFile(path.join(dist, match[1]));
for (const target of ['../assets/overview-infographic.png', 'dist/overview-infographic.png']) {
  assert.equal(createHash('sha256').update(await readFile(path.join(root, target))).digest('hex'), baseline.guideHash, '引导图字节改变');
}
assert(!html.includes('OPENAI_API_KEY') && !html.includes('ghp_'));
assert(html.includes(baseline.url));
console.log('校验通过：完整章节、27 条规则/11 个模块、全部本地引用和锚点、原图 SHA-256、发布目录边界。');
