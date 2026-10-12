import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOverviewSvg } from './overview-svg.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('无效构建目录');
await fs.rm(output, { recursive: true, force: true });
await fs.cp(path.join(root, 'public'), output, { recursive: true });
await fs.cp(path.join(root, 'data'), path.join(output, 'data'), { recursive: true });
await fs.cp(path.join(root, '../assets/upstream'), path.join(output, 'assets/upstream'), { recursive: true });
await fs.cp(path.join(root, '../references/LICENSE'), path.join(output, 'LICENSE'));
await fs.mkdir(path.join(output,'assets/guide'),{recursive:true});
for (const file of ['understanding-overview.png','understanding-overview.svg']) {
  await fs.copyFile(path.join(root,'../assets',file),path.join(output,'assets/guide',file));
}
const { styles, ref } = JSON.parse(await fs.readFile(path.join(root,'data/catalog.json'),'utf8'));
const graphic = await createOverviewSvg(styles, ref, async file => {
  const relative = path.relative(output, path.resolve(output,file));
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('无效图解素材路径');
  return 'data:image/jpeg;base64,' + (await fs.readFile(path.join(output,file))).toString('base64');
});
await fs.writeFile(path.join(output,'lemo-opuscar-overview.svg'),graphic);
console.log('已生成 web/dist：研究页、43 种风格、98 个片段和本地图像。');
