import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prefix = '/1009_codex_project/009-functional-emotions-video/';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.wav': 'audio/wav', '.mp4': 'video/mp4' };
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    let relative = decodeURIComponent(url.pathname);
    if (relative.startsWith(prefix)) relative = relative.slice(prefix.length);
    else relative = relative.replace(/^\//, '');
    relative ||= 'index.html';
    const file = path.resolve(root, 'dist', relative);
    const offset = path.relative(path.join(root, 'dist'), file);
    if (offset.startsWith('..') || path.isAbsolute(offset)) { response.writeHead(403); response.end(); return; }
    const body = await fs.readFile(file);
    const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
    const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
    if (range) {
      const start = range[1] ? Number(range[1]) : Math.max(0, body.length - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(body.length - 1, Number(range[2])) : body.length - 1;
      if (start > end || start >= body.length) { response.writeHead(416, { ...headers, 'Content-Range': 'bytes */' + body.length }); response.end(); return; }
      response.writeHead(206, { ...headers, 'Content-Range': 'bytes ' + start + '-' + end + '/' + body.length, 'Content-Length': end - start + 1 });
      response.end(request.method === 'HEAD' ? undefined : body.subarray(start, end + 1));
    } else { response.writeHead(200, { ...headers, 'Content-Length': body.length }); response.end(request.method === 'HEAD' ? undefined : body); }
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(4319, '127.0.0.1', () => console.log(`http://127.0.0.1:4319${prefix}`));
