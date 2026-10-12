import { access, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env };
// HyperFrames' downloaded headless shell cannot launch on the tested Windows
// host. Its documented browser-path override supports the installed Chrome.
if (process.platform === 'win32' && !env.HYPERFRAMES_BROWSER_PATH) {
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  try { await access(chrome); env.HYPERFRAMES_BROWSER_PATH = chrome; } catch {}
}
await mkdir(path.join(root, 'renders'), { recursive: true });
const child = spawn(process.execPath, [path.join(root, 'node_modules/hyperframes/bin/hyperframes.mjs'), 'render', 'dist/motion', '--quality', 'delivery', '--fps', '30', '--workers', '1', '--browser-gpu=false', '--output', 'renders/research-workflow.mp4'], { cwd: root, env, stdio: 'inherit' });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
