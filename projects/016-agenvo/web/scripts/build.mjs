import { mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(web, 'dist');
await mkdir(path.join(dist, 'assets'), { recursive: true });
for (const name of ['index.html', 'styles.css', 'app.js', 'favicon.svg']) {
  const content = await readFile(path.join(web, 'src', name), 'utf8');
  await writeFile(path.join(dist, name), content.replaceAll('__REF__', '68e046a5d8691054f8c134d85ae051988bae3dff'));
}
await cp(path.join(web, '..', 'assets', 'agenvo-guide.png'), path.join(dist, 'assets', 'agenvo-guide.png'));
console.log('Agenvo 研究页已构建到 web/dist/（含原始引导图）。');
