import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { sampleDefinitions, makeFrames, encodeILDA } from '../src/samples.js';
import { parseProgram } from '../src/program-loader.js';
import { composeStageWav } from '../src/stage-score.js';
import { STAGE_TEMPLATES, createTemplateStage } from '../src/stage-templates.js';
import { serializeStage } from '../src/stage-definition.js';
const stagePresets = new URL('../public/stages/', import.meta.url);
await mkdir(stagePresets, { recursive: true });
for (const template of STAGE_TEMPLATES) await writeFile(new URL(`${template.id}.json`, stagePresets), serializeStage(createTemplateStage(template.id)) + '\n');
const target = new URL('../public/shows/', import.meta.url);
await mkdir(target, { recursive: true });
const catalog = [];
for (const def of sampleDefinitions) {
  const frames = makeFrames(def.id), data = encodeILDA(frames, def.id);
  await writeFile(new URL(`${def.id}.ild`, target), new Uint8Array(data));
  catalog.push({ ...def, file: `shows/${def.id}.ild`, origin: 'original', author: '本研究子项目原创，程序生成', format: 5, previewFrame: 18, pointsPerFrame: frames[0].length, bytes: data.byteLength });
}
const upstream = JSON.parse(await readFile(new URL('../public/upstream/catalog.json', import.meta.url), 'utf8'));
catalog.unshift(...upstream.map(entry => ({ ...entry, id: `upstream-${entry.id}`, file: `upstream/${entry.file}`, origin: 'upstream', en: entry.file.split('/').at(-1), author: '由上游项目所有者提供；原始作者见来源说明' })));
const previews = new URL('../public/previews/', import.meta.url);
await mkdir(previews, { recursive: true });
for (const entry of catalog) {
  const bytes = await readFile(new URL(`../public/${entry.file}`, import.meta.url));
  const asset = parseProgram(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), entry);
  const frames = asset.tracks.get(entry.track ?? 0) ?? asset.tracks.values().next().value;
  entry.track = frames[0].projector;
  entry.frames = frames.length; entry.totalPoints = asset.totalPoints; entry.tracks = [...asset.tracks.keys()];
  entry.previewFrame = Math.min(entry.previewFrame ?? 0, frames.length - 1);
  entry.bytes = bytes.length; entry.sha256 = createHash('sha256').update(bytes).digest('hex');
  entry.note = `${entry.frames} 帧 · ${asset.totalPoints.toLocaleString('en-US')} 点`;
  entry.preview = `previews/${entry.id}.svg`;
  const frame = frames[entry.previewFrame], segments = [];
  for (let i = 1; i < frame.count; i++) {
    if (frame.blank[i] || frame.blank[i - 1]) continue;
    const a = (i - 1) * 3, b = i * 3;
    const color = [0, 1, 2].map(k => Math.round((frame.color[a + k] + frame.color[b + k]) * 127.5));
    if (!color.some(v => v > 0)) continue;
    segments.push(`<path d="M${frame.position[a].toFixed(4)} ${(-frame.position[a + 1]).toFixed(4)}L${frame.position[b].toFixed(4)} ${(-frame.position[b + 1]).toFixed(4)}" stroke="rgb(${color.join(',')})"/>`);
  }
  await writeFile(new URL(`${entry.id}.svg`, previews), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.05 -1.05 2.1 2.1"><rect x="-1.05" y="-1.05" width="2.1" height="2.1" fill="#030b07"/><g fill="none" stroke-width=".005" stroke-linecap="round">${segments.join('')}</g></svg>\n`);
}
await writeFile(new URL('catalog.json', target), JSON.stringify(catalog, null, 2) + '\n');
await copyFile(new URL('../../research.md', import.meta.url), new URL('../public/research.md', import.meta.url));
// Curated evidence is delivered with the notes page, including at numbered Pages paths.
await mkdir(new URL('../public/records/', import.meta.url), { recursive: true });
for (const name of ['research-overview.svg', 'research-overview.png', 'stage-entry-exhibit.jpg', 'preview.jpg', 'pump-tour-impeller.jpg', 'stage-effects-music.jpg', 'stage-effects-launch.jpg', 'stage-library-validation.json', 'stage-effects-validation.json', 'pump-exhibit-validation.json', 'pump-tour-validation.json', 'webgl-validation.json']) {
  await copyFile(new URL(`../../assets/${name}`, import.meta.url), new URL(`../public/records/${name}`, import.meta.url));
}
await copyFile(new URL('../node_modules/three/LICENSE', import.meta.url), new URL('../public/licenses/three.txt', import.meta.url));
await copyFile(new URL('../../LICENSE', import.meta.url), new URL('../public/licenses/samples.txt', import.meta.url));
await mkdir(new URL('../public/stage/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/stage/aurora-90s.wav', import.meta.url), new Uint8Array(composeStageWav()));
console.log(`节目目录已就绪：18 个上游 + ${sampleDefinitions.length} 个原创，含真实路线缩略图。${fileURLToPath(target)}`);
