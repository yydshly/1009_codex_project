import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// 让未修改的上游素材用例使用其原始相对路径。只生成被忽略的测试夹具。
const fixture = new URL('../vendor/three-ilda/examples/public/ilda/', import.meta.url);
await mkdir(fixture, { recursive: true });
await copyFile(new URL('../public/upstream/ilda/sylvest.ild', import.meta.url), new URL('sylvest.ild', fixture));
const testFiles = [];
for (const relative of ['tests/', 'vendor/three-ilda/test/']) {
  const directory = new URL(`../${relative}`, import.meta.url);
  for (const name of await readdir(directory)) if (/\.test\.(?:mjs|js)$/.test(name)) testFiles.push(fileURLToPath(new URL(name, directory)));
}
const result = spawnSync(process.execPath, ['--test', ...testFiles], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
