import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.MOTION_RESEARCH_PORT || 4311);
const prefix = '/1009_codex_project/001-motion-video-kit';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8' };
http.createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === prefix) { response.writeHead(302, { Location: prefix + '/' }); return response.end(); }
    if (pathname.startsWith(prefix + '/')) pathname = pathname.slice(prefix.length);
    const resolved = path.resolve(root, '.' + pathname);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) { response.writeHead(403); return response.end(); }
    const file = (await stat(resolved)).isDirectory() ? path.join(resolved, 'index.html') : resolved;
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(data);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`研究页：http://127.0.0.1:${port}${prefix}/`));
