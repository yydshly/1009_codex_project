import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const mime = {'.vtt':'text/vtt; charset=utf-8', '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.json':'application/json; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.md':'text/plain; charset=utf-8', '.mp4':'video/mp4', '.webm':'video/webm', '.mp3':'audio/mpeg', '.wav':'audio/wav'};

// Single byte ranges allow native video seeking without buffering the whole film.
export function byteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || !size) return null;
  let start, end;
  if (!match[1]) {
    const length = Number(match[2]);
    if (!Number.isSafeInteger(length) || length <= 0) return null;
    start = Math.max(0, size - length); end = size - 1;
  } else {
    start = Number(match[1]); end = match[2] ? Number(match[2]) : size - 1;
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) return null;
  return {start, end: Math.min(end, size - 1)};
}

export async function staticResponse(request, response, target) {
  const info = await stat(target);
  if (!info.isFile()) { response.writeHead(404); response.end(); return; }
  const headers = {'Content-Type': mime[path.extname(target).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control':'no-store', 'Accept-Ranges':'bytes'};
  // HTTP Range applies to GET; a HEAD request reports the whole representation.
  const range = request.method === 'GET' && request.headers.range;
  const selected = range ? byteRange(range, info.size) : null;
  if (range && !selected) { response.writeHead(416, {...headers, 'Content-Range':`bytes */${info.size}`, 'Content-Length':'0'}); response.end(); return; }
  const length = selected ? selected.end - selected.start + 1 : info.size;
  response.writeHead(selected ? 206 : 200, {...headers, 'Content-Length':length, ...(selected ? {'Content-Range':`bytes ${selected.start}-${selected.end}/${info.size}`} : {})});
  if (request.method === 'HEAD' || !length) { response.end(); return; }
  try { await pipeline(createReadStream(target, selected ?? {}), response); }
  catch (error) { if (!response.destroyed) response.destroy(error); }
}
