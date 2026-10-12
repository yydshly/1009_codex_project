import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const prefix = '/1009_codex_project/010-lemo-opuscar/';
const port = Number(process.env.LEMO_PREVIEW_PORT || 4320);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('预览端口无效');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png':'image/png', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.ttf':'font/ttf', '.txt':'text/plain; charset=utf-8' };
http.createServer(async (request, response) => {
  try {
    let relative = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (relative.startsWith(prefix)) relative = relative.slice(prefix.length);
    else relative = relative.replace(/^\//, '');
    relative ||= 'index.html';
    const file = path.resolve(root, relative);
    const offset = path.relative(root, file);
    if (offset.startsWith('..') || path.isAbsolute(offset)) { response.writeHead(403).end(); return; }
    const body = await fs.readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}${prefix}`));
