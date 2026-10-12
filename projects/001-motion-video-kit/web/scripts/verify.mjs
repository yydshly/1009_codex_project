import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const page = await readFile(path.join(dist, 'index.html'), 'utf8');
const motion = await readFile(path.join(dist, 'motion/index.html'), 'utf8');
for (const id of ['overview', 'demo', 'capabilities', 'modules', 'principles', 'examples', 'scenarios', 'value', 'extensions']) assert(page.includes(`id="${id}"`), `缺少研究章节 ${id}`);
for (const id of ['play', 'replay', 'seek', 'speed', 'test-seek']) assert(page.includes(`id="${id}"`), `缺少演示交互 ${id}`);
for (const file of ['index.html', 'styles.css', 'app.js', 'motion/index.html', 'motion/motion.js', 'motion/motion.css', 'vendor/gsap.min.js', 'licenses/gsap.txt', 'licenses/motion-video-kit.txt', 'capability-map-v1.png', 'capability-map-v1.svg']) assert((await stat(path.join(dist, file))).size > 0, `缺少资源 ${file}`);
assert(motion.includes('data-duration="24"') && motion.includes('data-fps="30"'), '时间与帧率须匹配 Brief');
for (const match of motion.matchAll(/data-start="([\d.]+)" data-duration="([\d.]+)"/g)) assert(Number(match[1]) >= 0 && Number(match[1]) + Number(match[2]) <= 24.001, '片段超出时间轴');
for (const file of ['src/app.js', 'src/motion/motion.js', 'scripts/build.mjs', 'scripts/serve.mjs']) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
const metadata = JSON.parse(await readFile(path.join(dist, 'project.json'), 'utf8'));
assert.equal(metadata.sourceRef, '255562b04b1e5ecaa4ba98e5c9aa191d5ba7f6fa');
assert.equal(metadata.summarySections.length, 9, '完整摘要应包含九个说明条目');
const guide = await readFile(path.join(dist, 'capability-map-v1.png'));
assert.equal(guide.readUInt32BE(16), 3840, '引导图宽度');
assert.equal(guide.readUInt32BE(20), 2560, '引导图高度');
if (metadata.renderAvailable) assert((await stat(path.join(dist, 'media/research-workflow.mp4'))).size > 1000, '可下载视频缺失');
console.log('通过：九个研究章节、完整摘要、高清引导图、播放控制、相对路径资源、片段时长、JavaScript 语法与版本基线。');
