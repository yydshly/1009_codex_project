import { readFile, access, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', file]);
  }
}
await walk(path.join(root, 'public')); await walk(path.join(root, 'vendor'));
for (const relative of ['index.html', 'app.js', 'style.css', 'player/index.html', 'player/renderer.js', 'vendor/functional-emotions/LICENSE', 'assets/frames/t-30.jpg', 'assets/frames/t-350.jpg', ...Array.from({ length: 8 }, (_, i) => 'vendor/functional-emotions/js/ch/c' + (i + 1) + '.js')]) await access(path.join(root, 'dist', relative));
const timing = await readFile(path.join(root, 'vendor/functional-emotions/js/data.js'), 'utf8');
if (!timing.includes('window.LYRICS=[];')) throw new Error('Reference data must exclude lyric sentences');
if (!timing.includes('window.TIMING_CUES=')) throw new Error('Full player requires numeric timing cues');
for (const file of ['demo/player.html', 'demo/scene.js', 'demo/controller.js', 'assets/demo/seed-journey.wav', 'assets/demo/seed-journey-poster.jpg', 'assets/demo/score.json', 'assets/demo/export-status.json']) await access(path.join(root, 'dist', file));
const music = await readFile(path.join(root, 'dist/assets/demo/seed-journey.wav'));
for (const file of ['overview.js', 'overview.css', 'assets/overview/research-overview.png', 'assets/overview/mv-creative-prompt.txt']) await access(path.join(root, 'dist', file));
if (music.toString('ascii', 0, 4) !== 'RIFF' || music.length !== 44 + 32 * 22050 * 4) throw new Error('Original music must contain 32 seconds of stereo PCM');
console.log('JavaScript syntax and required static output verified.');
