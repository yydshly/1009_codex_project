import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.dirname(root);
const dist = path.join(root, 'dist');
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const catalog = JSON.parse(await readFile(path.join(dist, 'catalog.json'), 'utf8'));
assert.equal(catalog.works.length, 175, '固定快照的作品数有变更');
assert.equal(new Set(catalog.works.map(work => work.id)).size, 175, '作品 ID 重复');
assert.deepEqual(catalog.categories.map(category => catalog.works.filter(work => work.category === category.id).length), [58, 12, 37, 21, 35, 12]);
assert.equal(catalog.works.filter(work => work.sourceLinks.length).length, 25, '源码入口筛选数有变更');
assert.equal(catalog.sourceSha256, hash(await readFile(path.join(project, 'source/README.zh-CN.md'))));
assert.equal(hash(await readFile(path.join(dist, 'assets/overview-infographic.png'))), '8d3db1a84720efc2c6203b95fdd2ccd28fe76767fb946e03c58d6fe9ac56ab0e', '应沿用已有引导图');
assert.equal(hash(await readFile(path.join(dist, 'demos/orbital-garden/index.html'))), 'd4a6c366bdeb439ac8e14fff1d29107fd086574de8f6f6215e718ae157b801b1', '完整原作应保留原始字节');
assert.deepEqual(await readFile(path.join(dist, 'demos/orbital-garden/LICENSE')), await readFile(path.join(root, 'vendor/orbital-garden/LICENSE')));
const htmlFiles = ['index.html', 'library.html', 'about.html', 'garden-background.html', 'demos/orbital-garden/index.html'];
let checkedLinks = 0;
for (const file of htmlFiles) {
  const html = await readFile(path.join(dist, file), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file} 有重复锚点`);
  for (const match of html.matchAll(/\b(?:href|src|data-src)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(?:https?:|data:|mailto:|\/\/)/.test(url) || url === '../') continue;
    const [pathname, fragment] = url.split('#');
    const target = path.resolve(dist, path.dirname(file), pathname.split('?')[0] || path.basename(file));
    assert.ok(target === dist || target.startsWith(dist + path.sep), `${file} 路径超出发布目录：${url}`);
    let targetFile = target;
    if ((await stat(target)).isDirectory()) targetFile = path.join(target, 'index.html');
    await stat(targetFile);
    if (fragment && targetFile.endsWith('.html')) {
      const targetHTML = targetFile === path.join(dist, file) ? html : await readFile(targetFile, 'utf8');
      assert.ok(targetHTML.includes(`id="${fragment}"`), `${file} 的锚点不存在：${url}`);
    }
    checkedLinks++;
  }
}
for (const file of ['app.js', 'catalog.js', 'overview.js', 'garden-adapter.js', 'catalog-data.js']) {
  new Script(await readFile(path.join(dist, file), 'utf8'), { filename: file });
}
const metadata = JSON.parse(await readFile(path.join(dist, 'project.json'), 'utf8'));
assert.equal(metadata.sourceRef, '42ec7142a3da1dcce1846de8a3fc0b4891b4c8ae');
console.log(`研究页检查通过：175 项 / 六类 / 25 项源码入口，${checkedLinks} 处本地资源与锚点，脚本语法、引导图、原作字节与许可。`);
