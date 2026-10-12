import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { styles, ref } = JSON.parse(await fs.readFile(path.join(root, 'data/catalog.json'), 'utf8'));
const feature = JSON.parse(await fs.readFile(path.join(root, 'data/opuscar98.json'), 'utf8'));
assert.equal(styles.length, 43, '风格索引应包含43项');
assert.equal(new Set(styles.map(style => style.slug)).size, 43, '风格标识不得重复');
assert.equal(new Set(styles.map(style => style.cat)).size, 9, '风格分类应为9类');
assert.equal(feature.films.length, 98, '长片应包含98个片段');
assert.equal(new Set(feature.films.map(film => film.no)).size, 98);
assert.match(ref, /^[a-f0-9]{40}$/);
for (const style of styles) {
  assert(style.styleText.length > 200 && style.demoText.length > 100, `${style.slug} 规格或技术说明缺失`);
  assert(style.dur > 0 && style.source.includes(ref));
  const image = await fs.readFile(path.join(root, 'dist', style.image));
  assert(image[0] === 0xff && image[1] === 0xd8, `${style.slug} 预览应为有效JPEG`);
  assert.equal(new URL(style.video).hostname, 'lemomo-ai.github.io');
}
for (const film of feature.films) {
  assert(film.t0 >= 0 && film.t0 + film.dur <= 392, `片段${film.no}时间范围错误`);
  assert(film.prompt_zh && film.style_zh);
  assert(feature.chapters.some(chapter => chapter.id === film.chapter));
  await fs.access(path.join(root, `dist/assets/upstream/opuscar98/${String(film.no).padStart(2,'0')}.jpg`));
}
for (const file of ['index.html','style.css','app.js','screening.js','live-demo.js','overview.css','overview.js','overview-content.js','lemo-opuscar-overview.svg','demos/blueprint/index.html','demos/blueprint/player.js','demos/blueprint/LICENSE','demos/blueprint/CREDITS','demos/blueprint/import-manifest.json','data/catalog.json','data/opuscar98.json','LICENSE','assets/upstream/LICENSE']) await fs.access(path.join(root, 'dist', file));
const overviewSvg = await fs.readFile(path.join(root,'dist/lemo-opuscar-overview.svg'),'utf8');
const guide = JSON.parse(await fs.readFile(path.join(root,'dist/data/research-guide.json'),'utf8'));
assert.equal(guide.ref,ref);assert.equal(guide.capabilities.length,6);assert.equal(guide.modules.length,8);assert.equal(guide.principles.length,6);assert.equal(guide.extensions.length,8);
for (const file of ['guide.js','guide.css']) await fs.access(path.join(root,'dist',file));
const guideHashes = {'understanding-overview.png':'ff8c29b438498bbd00a6c50eba0812e6a97c000bd7521aa6f9f2c13c801d6303','understanding-overview.svg':'fac5516e94f768e4da0dd00ecc8f8bdc76321aa555e2d7866b4eed6984e23ecb'};
for (const [file,hash] of Object.entries(guideHashes)) assert.equal(createHash('sha256').update(await fs.readFile(path.join(root,'dist/assets/guide',file))).digest('hex'),hash,'引导图原文件应保持不变');
for (const style of styles) assert(overviewSvg.includes(style.cn), `总览图应列出${style.cn}`);
assert(!/<(?:script|foreignObject)\b/.test(overviewSvg), '静态总览图不包含脚本或外部HTML');
assert(!/href="https?:/.test(overviewSvg), '导出图的作品图片应内嵌以支持离线阅读');
const demoManifest = JSON.parse(await fs.readFile(path.join(root,'public/demos/blueprint/import-manifest.json'),'utf8'));
for (const file of demoManifest.files) {
  const bytes = await fs.readFile(path.join(root,'dist/demos/blueprint',file.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `${file.path}应保留导入原文`);
}
for (const file of ['app.js','screening.js','live-demo.js','overview.js','overview-content.js','guide.js','demos/blueprint/player.js']) {
  const syntax = spawnSync(process.execPath, ['--check', path.join(root, 'public', file)], { encoding:'utf8' });
  assert.equal(syntax.status, 0, syntax.stderr);
}
console.log('校验通过：43种风格、9类、98个片段、完整规格、本地图像、固定来源、交付文件与脚本语法。');
