import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '../../..');
const prefix = '/1009_codex_project/';
const ownFolder = '011-shipvideo';
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.mp4':'video/mp4' };
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const url = new URL(request.url, 'http://127.0.0.1');
    let relative = decodeURIComponent(url.pathname);
    if (relative === '/') { response.writeHead(302, { Location: prefix + ownFolder + '/' }); response.end(); return; }
    if (relative.startsWith(prefix)) relative = relative.slice(prefix.length);
    else { response.writeHead(404); response.end('Not found'); return; }
    let base;
    if (relative.startsWith(ownFolder + '/')) { base = path.join(webRoot, 'public'); relative = relative.slice(ownFolder.length + 1); }
    else base = path.join(repoRoot, '_site');
    relative ||= 'index.html';
    if (relative.endsWith('/')) relative += 'index.html';
    const target = path.resolve(base, relative);
    const offset = path.relative(base, target);
    if (offset.startsWith('..') || path.isAbsolute(offset)) { response.writeHead(403); response.end(); return; }
    const body = await fs.readFile(target);
    response.writeHead(200, { 'Content-Type':mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(4321, '127.0.0.1', () => console.log('http://127.0.0.1:4321' + prefix + ownFolder + '/'));
