import { cp, mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(root, '../scripts/generate-demo-music.mjs')], { stdio: 'inherit' });
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'public'), path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'vendor'), path.join(root, 'dist/vendor'), { recursive: true });
await cp(path.join(root, '../assets/frames'), path.join(root, 'dist/assets/frames'), { recursive: true });
await cp(path.join(root, '../assets/demo'), path.join(root, 'dist/assets/demo'), { recursive: true });
await cp(path.join(root, '../assets/overview'), path.join(root, 'dist/assets/overview'), { recursive: true });
const renderedVideo = path.resolve(root, '../../../upstream/functional-emotions-video-review/out/original-demo/seed-journey.mp4');
let mp4Available = false;
try { await access(renderedVideo); await cp(renderedVideo, path.join(root, 'dist/assets/demo/seed-journey.mp4')); mp4Available = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(path.join(root, 'dist/assets/demo/export-status.json'), JSON.stringify({ mp4Available }));
console.log('Built static research page at web/dist/');
