import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceRef, summary, summarySections } from '../src/content.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const file = path.join(root, 'projects.json');
const catalog = JSON.parse(await readFile(file, 'utf8'));
const project = catalog.projects.find(p => p.id === '017' && p.slug === 'alook');
if (!project) throw new Error('先使用根 project:new 脚本登记 017-alook');
Object.assign(project, {
  summary, summarySections, sourceRef, status: 'done', addedAt: '2026-10-12',
  preview: 'assets/alook-guide.png',
  previewCaption: '本次对话生成的完整中文研究引导图，原 PNG 未改动，非上游界面；图示依据 2026-10-09 的 v0.1.46，网页补充 2026-10-12 固定源码、能力/模块/原理/价值/场景/扩展和验证边界。',
  pagesDir: 'web/dist',
});
await writeFile(file, JSON.stringify(catalog, null, 2) + '\n');
console.log('已更新 017 的完整摘要、九项分节摘要、版本、原图和 Pages 路径。');
