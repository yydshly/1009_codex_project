import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { staticResponse } from './static-response.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prefix = '/1009_codex_project/013-xinjiang-knowledge-sandbox/';
const siteRoot = path.resolve(webRoot, '../../../_site');
const publicRoot = path.join(webRoot, 'public');
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const url = new URL(request.url, 'http://127.0.0.1');
    if (url.pathname === '/') { response.writeHead(302, { Location: prefix }); response.end(); return; }
    const own = url.pathname.startsWith(prefix);
    if (!own && !url.pathname.startsWith('/1009_codex_project/')) { response.writeHead(404); response.end(); return; }
    const base = own ? publicRoot : siteRoot;
    let relative = decodeURIComponent(url.pathname.slice(own ? prefix.length : '/1009_codex_project/'.length));
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    const target = path.resolve(base, relative);
    const offset = path.relative(base, target);
    if (!offset || offset.startsWith('..') || path.isAbsolute(offset)) { response.writeHead(403); response.end(); return; }
    await staticResponse(request, response, target);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(4313, '127.0.0.1', () => console.log(`http://127.0.0.1:4313${prefix}`));
