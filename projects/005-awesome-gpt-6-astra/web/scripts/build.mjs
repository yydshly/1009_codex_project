import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCatalog } from './catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.resolve(root, '..');
const output = path.join(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid build directory');
await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'assets'), { recursive: true });
for (const file of ['index.html', 'library.html', 'about.html', 'styles.css', 'catalog.css', 'overview.css', 'app.js', 'catalog.js', 'overview.js', 'garden-adapter.js', 'garden-background.css', 'favicon.svg']) {
  await cp(path.join(root, 'src', file), path.join(output, file));
}
const catalog = parseCatalog(await readFile(path.join(project, 'source/README.zh-CN.md'), 'utf8'));
await writeFile(path.join(root, 'data/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
await writeFile(path.join(output, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
await writeFile(path.join(output, 'catalog-data.js'), 'globalThis.ASTRA_CATALOG = ' + JSON.stringify(catalog).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + ';\n');
for (const file of ['overview-infographic.png', 'orbital-garden.jpg', 'thunderfall.jpg', 'three-kingdoms.jpg']) {
  await cp(path.join(project, 'assets', file), path.join(output, 'assets', file));
}
await cp(path.join(project, 'licenses'), path.join(output, 'licenses'), { recursive: true });
const originalGarden = await readFile(path.join(root, 'vendor/orbital-garden/index.html'), 'utf8');
const adaptedGarden = originalGarden.replace('</head>', '<!-- Local research presentation adapter. Original: jackroc / Orbital Garden, CC0 1.0. -->\n<link rel="stylesheet" href="./garden-background.css">\n<script src="./garden-adapter.js" defer></script>\n</head>');
if (adaptedGarden === originalGarden) throw new Error('Orbital Garden head marker missing');
await writeFile(path.join(output, 'garden-background.html'), adaptedGarden);
await mkdir(path.join(output, 'demos'), { recursive: true });
await cp(path.join(root, 'vendor/orbital-garden'), path.join(output, 'demos/orbital-garden'), { recursive: true });
const data = JSON.parse(await readFile(path.join(project, '../../projects.json'), 'utf8'));
const metadata = data.projects.find(item => item.slug === 'awesome-gpt-6-astra');
if (!metadata) throw new Error('Project metadata missing');
await writeFile(path.join(output, 'project.json'), JSON.stringify({ id: metadata.id, source: metadata.source, sourceRef: metadata.sourceRef, researchDate: '2026-10-09', researchUpdatedAt: '2026-10-12' }, null, 2) + '\n');
console.log(`完整研究、一图说明与本地轨道花园已构建；${catalog.works.length} 项目录位于 library.html，交互原理位于 about.html。`);
