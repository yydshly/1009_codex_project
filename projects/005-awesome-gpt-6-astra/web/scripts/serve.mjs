import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.ASTRA_RESEARCH_PORT || 4315);
const prefix = '/1009_codex_project/005-awesome-gpt-6-astra';
const sitePrefix = '/1009_codex_project';
const siteRoot = path.resolve(root, '../../../../_site');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    return response.end();
  }
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === prefix) { response.writeHead(302, { Location: prefix + '/' }); return response.end(); }
    if (pathname === sitePrefix) { response.writeHead(302, { Location: sitePrefix + '/' }); return response.end(); }
    let servingRoot = root;
    if (pathname.startsWith(prefix + '/')) pathname = pathname.slice(prefix.length);
    else if (pathname.startsWith(sitePrefix + '/')) { servingRoot = siteRoot; pathname = pathname.slice(sitePrefix.length); }
    const resolved = path.resolve(servingRoot, '.' + pathname);
    const offset = path.relative(servingRoot, resolved);
    if (offset.startsWith('..') || path.isAbsolute(offset)) { response.writeHead(403); return response.end(); }
    const file = (await stat(resolved)).isDirectory() ? path.join(resolved, 'index.html') : resolved;
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`研究页：http://127.0.0.1:${port}${prefix}/`));
