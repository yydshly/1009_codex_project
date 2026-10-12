import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'src'), dist, { recursive: true });
for (const name of ['capability-map-v1.png', 'capability-map-v1.svg']) {
  await cp(path.join(root, '../assets', name), path.join(dist, name));
}
await mkdir(path.join(dist, 'vendor'), { recursive: true });
await cp(path.join(root, 'node_modules/gsap/dist/gsap.min.js'), path.join(dist, 'vendor/gsap.min.js'));
await mkdir(path.join(dist, 'motion/vendor'), { recursive: true });
await cp(path.join(root, 'node_modules/gsap/dist/gsap.min.js'), path.join(dist, 'motion/vendor/gsap.min.js'));
await mkdir(path.join(dist, 'licenses'), { recursive: true });
const gsapPackage = JSON.parse(await readFile(path.join(root, 'node_modules/gsap/package.json'), 'utf8'));
const gsapHeader = (await readFile(path.join(root, 'node_modules/gsap/dist/gsap.min.js'), 'utf8')).match(/^\/\*![\s\S]*?\*\//)?.[0] || '';
await writeFile(path.join(dist, 'licenses/gsap.txt'), `${gsapHeader}\n\nPackage license: ${gsapPackage.license}\n`);
await cp(path.join(root, '../licenses/motion-video-kit-LICENSE'), path.join(dist, 'licenses/motion-video-kit.txt'));
const metadata = JSON.parse(await readFile(path.join(root, '../../../projects.json'), 'utf8')).projects.find(p => p.id === '001');
let renderAvailable = false;
try {
  await access(path.join(root, 'renders/research-workflow.mp4'));
  await mkdir(path.join(dist, 'media'), { recursive: true });
  await cp(path.join(root, 'renders/research-workflow.mp4'), path.join(dist, 'media/research-workflow.mp4'));
  renderAvailable = true;
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(path.join(dist, 'project.json'), JSON.stringify({ id: metadata.id, slug: metadata.slug, source: metadata.source, sourceRef: metadata.sourceRef, addedAt: metadata.addedAt, summary: metadata.summary, summarySections: metadata.summarySections, renderAvailable }, null, 2));
console.log('已构建中文研究页与可定位动画：web/dist/');
