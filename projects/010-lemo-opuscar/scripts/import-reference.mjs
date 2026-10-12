import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ref = 'a75e2b3384cded87955c8743b5a59db06ea491a8';
const base = `https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/${ref}/`;
const manifest = [];
async function fetchFile(source, target, json = false) {
  const output = path.join(root, target);
  await fs.mkdir(path.dirname(output), { recursive: true });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(base + source, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(output, bytes);
      manifest.push({ source: base + source, local: target, bytes: bytes.length });
      return json ? JSON.parse(bytes.toString('utf8')) : bytes.toString('utf8');
    } catch (error) { if (attempt === 2) throw error; }
  }
}
async function pool(items, fn, workers = 6) {
  let position = 0;
  await Promise.all(Array.from({ length: workers }, async () => {
    while (position < items.length) await fn(items[position++]);
  }));
}
const catalog = await fetchFile('styleboard/catalog.json', 'references/catalog.upstream.json', true);
const feature = await fetchFile('styleboard/opuscar98_styles.json', 'web/data/opuscar98.json', true);
await pool(['README.zh-CN.md', 'DIRECTOR.md', 'TECHNIQUE.md', 'core/README.md', 'LICENSE', 'plugin/skills/lemo-opuscar/SKILL.md', 'core/render/video.mjs'], async source => {
  await fetchFile(source, `references/${source}`);
});
await fetchFile('LICENSE', 'assets/upstream/LICENSE');
await fetchFile('docs/opuscar98.jpg', 'assets/upstream/feature.jpg');
await pool(catalog, async style => {
  style.styleText = await fetchFile(`styles/${style.slug}/STYLE.md`, `references/styles/${style.slug}/STYLE.md`);
  style.demoText = await fetchFile(`styles/${style.slug}/DEMO.md`, `references/styles/${style.slug}/DEMO.md`);
  style.image = `assets/upstream/frames/${style.slug}.jpg`;
  style.video = `https://lemomo-ai.github.io/lemo-opuscar/films/${style.slug}.mp4`;
  style.full = `https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/${style.slug}.mp4`;
  style.source = `https://github.com/lemomo-ai/lemo-opuscar/blob/${ref}/styles/${style.slug}/STYLE.md`;
  style.code = `https://github.com/lemomo-ai/lemo-opuscar/tree/${ref}/styles/${style.slug}/demo`;
  await fetchFile(`docs/frames/${style.slug}.jpg`, style.image);
});
await pool(feature.films, async film => {
  await fetchFile(`styleboard/img/opuscar98/${String(film.no).padStart(2, '0')}.jpg`, `assets/upstream/opuscar98/${String(film.no).padStart(2, '0')}.jpg`);
});
await fs.mkdir(path.join(root, 'web/data'), { recursive: true });
await fs.writeFile(path.join(root, 'web/data/catalog.json'), JSON.stringify({ ref, date: '2026-10-09', styles: catalog }, null, 2) + '\n');
manifest.sort((a, b) => a.local.localeCompare(b.local));
await fs.writeFile(path.join(root, 'references/manifest.json'), JSON.stringify({ repo: 'https://github.com/lemomo-ai/lemo-opuscar', ref, files: manifest }, null, 2) + '\n');
console.log(`已导入 ${catalog.length} 种风格、${feature.films.length} 个 OPUSCAR 98 片段、${manifest.length} 个来源文件。视频使用上游在线播放地址，不复制视频文件。`);
