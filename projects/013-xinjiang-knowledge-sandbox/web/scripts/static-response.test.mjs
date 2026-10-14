import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, writeFile, unlink, rmdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { staticResponse } from './static-response.mjs';

test('media GET, HEAD and byte ranges serve the requested bytes', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'xinjiang-media-'));
  const file = path.join(directory, 'sample.mp4');
  await writeFile(file, Buffer.from('0123456789'));
  const server = http.createServer((req,res) => void staticResponse(req,res,file));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/sample.mp4`;
  try {
    const full = await fetch(url);
    assert.equal(full.status, 200); assert.equal(full.headers.get('content-type'), 'video/mp4');
    assert.equal(full.headers.get('content-length'), '10'); assert.equal(await full.text(), '0123456789');
    const head = await fetch(url, {method:'HEAD', headers:{Range:'bytes=2-4'}});
    assert.equal(head.status, 200); assert.equal(head.headers.get('content-length'), '10'); assert.equal(await head.text(), '');
    for (const [range, content, contentRange] of [['bytes=2-4','234','bytes 2-4/10'], ['bytes=7-','789','bytes 7-9/10'], ['bytes=-3','789','bytes 7-9/10'], ['bytes=8-99','89','bytes 8-9/10']]) {
      const response = await fetch(url, {headers:{Range:range}});
      assert.equal(response.status, 206); assert.equal(response.headers.get('content-range'), contentRange);
      assert.equal(await response.text(), content);
    }
    for (const range of ['bytes=11-','bytes=4-2','bytes=-0','bytes=','bytes=1-2,4-5']) {
      const response = await fetch(url, {headers:{Range:range}});
      assert.equal(response.status, 416); assert.equal(response.headers.get('content-range'), 'bytes */10');
      assert.equal(await response.text(), '');
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    await unlink(file); await rmdir(directory);
  }
});
