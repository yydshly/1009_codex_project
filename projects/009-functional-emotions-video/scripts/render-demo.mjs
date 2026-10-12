// Optional offline export. Requires local Chrome, Playwright and FFmpeg; not part of CI build.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { SCORE } from '../web/public/demo/score.js';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(project, 'assets/demo');
const outputDirectory = path.resolve(project, '../../upstream/functional-emotions-video-review/out/original-demo');
const playwrightPath = process.env.PLAYWRIGHT_MODULE || path.resolve(project, '../004-dvor/web/node_modules/playwright/index.mjs');
const { chromium } = await import(pathToFileURL(playwrightPath));
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: process.platform === 'win32' ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] : [] });
const errors = [];
try {
  const page = await browser.newPage(); page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:4319/1009_codex_project/009-functional-emotions-video/demo/player.html');
  await page.waitForFunction(() => window.journeyReady);
  async function jpeg(time) { return Buffer.from(await page.evaluate(time => { window.renderJourneyFrame(time); return document.getElementById('oil').toDataURL('image/jpeg', .88).split(',')[1]; }, time), 'base64'); }
  for (let i = 0; i < 6; i++) await fs.writeFile(path.join(assets, `shot-${i + 1}.jpg`), await jpeg((SCORE.shots[i].start + SCORE.shots[i].end) / 2));
  await fs.writeFile(path.join(assets, 'seed-journey-poster.jpg'), await jpeg(24));
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Rendered six original scene stills and cover.');
  if (!process.argv.includes('--stills-only')) {
    await fs.mkdir(outputDirectory, { recursive: true }); const output = path.join(outputDirectory, 'seed-journey.mp4');
    const ffmpeg = spawn(process.env.FFMPEG_PATH || 'ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', '24', '-i', 'pipe:0', '-i', path.join(assets, 'seed-journey.wav'), '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-t', '32', '-movflags', '+faststart', output], { stdio: ['pipe', 'ignore', 'pipe'] });
    let diagnostics = ''; ffmpeg.stderr.on('data', chunk => diagnostics += chunk.toString());
    const completion = new Promise((resolve, reject) => { ffmpeg.on('error', reject); ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error(diagnostics || 'FFmpeg failed: ' + code))); });
    for (let i = 0; i < 768; i++) { const bytes = await jpeg(i / 24); if (!ffmpeg.stdin.write(bytes)) await once(ffmpeg.stdin, 'drain'); if ((i + 1) % 128 === 0) console.log('Rendered video frames: ' + (i + 1) + '/768'); }
    ffmpeg.stdin.end(); await completion;
    if (errors.length) throw new Error(errors.join('\n'));
    console.log('Exported original MP4 to ignored local output: ' + output);
  }
} finally { await browser.close(); }
