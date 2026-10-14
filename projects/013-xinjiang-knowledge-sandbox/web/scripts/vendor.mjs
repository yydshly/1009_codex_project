import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendor = path.join(root, 'public/vendor');
const upstream = path.join(root, 'node_modules/three');
await fs.mkdir(vendor, { recursive: true });
for (const [from, to] of [
  ['build/three.module.js', 'three.module.js'],
  ['build/three.core.js', 'three.core.js'],
  ['examples/jsm/controls/OrbitControls.js', 'OrbitControls.js'],
  ['LICENSE', 'THREE-LICENSE.txt'],
]) await fs.copyFile(path.join(upstream, from), path.join(vendor, to));
console.log('Three.js 0.186.1 模块与 MIT 许可证已复制至本地静态目录。');
