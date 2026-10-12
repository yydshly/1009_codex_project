import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { STAGE_TEMPLATES } from '../src/stage-templates.js';

// 只检查 HTTP 交付与数据完整性，不启动浏览器，也不宣称 GPU/交互实测。
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:5215/');
const page = await fetch(base); assert.equal(page.status, 200);
const html = await page.text(); assert.ok(html.includes('id="program"') && html.includes('id="program-gallery"'));
assert.ok(html.includes('id="carousel-toggle"') && html.includes('id="carousel-policy"'), '完整播放轮播控件已交付');
assert.ok(html.includes('每个节目完整播放一遍后切换') && !html.includes('id="carousel-duration"'), '轮播按完成状态切换，移除固定秒数选项');
const catalogResponse = await fetch(new URL('shows/catalog.json', base)); assert.equal(catalogResponse.status, 200);
const catalog = await catalogResponse.json(); assert.equal(catalog.length, 22);
assert.equal(catalog.filter(e => e.origin === 'upstream').length, 18);
for (let i = 0; i < catalog.length; i += 4) {
  await Promise.all(catalog.slice(i, i + 4).map(async entry => {
    const binary = await fetch(new URL(entry.file, base)); assert.equal(binary.status, 200, entry.file);
    const bytes = new Uint8Array(await binary.arrayBuffer()); assert.equal(bytes.length, entry.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.file);
    const thumbnail = await fetch(new URL(entry.preview, base)); assert.equal(thumbnail.status, 200, entry.preview);
    assert.ok((await thumbnail.text()).includes('<path'), entry.preview);
  }));
}
const credits = await fetch(new URL('upstream/CREDITS.md', base)); assert.equal(credits.status, 200);
const license = await fetch(new URL('upstream/LICENSE', base)); assert.equal(license.status, 200);
assert.ok(html.includes('./product.html') && html.includes('./stage.html'), '实验台有记录与舞台入口');
const notes = await fetch(new URL('product.html', base)); assert.equal(notes.status, 200);
const notesHtml = await notes.text();
assert.ok(notesHtml.includes('产品假设') && notesHtml.includes('音乐纪念空间') && notesHtml.includes('./stage.html'));
for (const id of ['summary', 'overview', 'understanding', 'modules', 'mechanism', 'reuse', 'examples', 'value', 'exploration', 'boundary', 'sources', 'resources']) assert.ok(notesHtml.includes(`id="${id}"`), `阶段汇总 ${id}`);
assert.ok(notesHtml.includes('阶段研究已完成') && notesHtml.includes('104 项'), '研究完成状态和验证范围已交付');
const explorationHtml = notesHtml.match(/<section id="exploration"[\s\S]*?<\/section>/)?.[0] ?? '';
assert.equal((explorationHtml.match(/<article>/g) ?? []).length, 16, '16 类探索文字目录');
assert.equal((explorationHtml.match(/<li>/g) ?? []).length, 64, '64 项探索文字目录');
const evidenceFiles = new Set([...notesHtml.matchAll(/(?:href|src)="\.\/records\/([^\"]+)"/g)].map(match => match[1]));
assert.equal(evidenceFiles.size, 12);
await Promise.all([...evidenceFiles].map(async name => {
  const response = await fetch(new URL(`records/${name}`, base)); assert.equal(response.status, 200, name);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(new URL(`../../assets/${name}`, import.meta.url)), `原始验证记录和图片：${name}`);
}));
const stage = await fetch(new URL('stage.html', base)); assert.equal(stage.status, 200);
const stageHtml = await stage.text();
assert.ok(stageHtml.includes('id="builder-view"') && stageHtml.includes('id="builder-save"') && stageHtml.includes('id="builder-import"') && stageHtml.includes('./show.html'), '交付舞台搭建与配置复用入口');
assert.ok(stageHtml.includes('id="stage-template-grid"') && stageHtml.includes('id="builder-save-as"') && stageHtml.includes('id="builder-project"'), '方案库、独立项目和另存入口可交付');
assert.ok(stageHtml.includes('id="builder-effect-grid"') && stageHtml.includes('id="builder-effect-target"') && stageHtml.includes('id="builder-effect-mode"'), '22 效果接入、设备绑定与复用方式已交付');
assert.ok(stageHtml.includes('id="builder-effect-search"') && stageHtml.includes('id="builder-effect-origin"') && stageHtml.includes('id="builder-effect-empty"'), '效果搜索、来源筛选及空结果反馈已交付');
assert.ok(stageHtml.includes('id="builder-undo"') && stageHtml.includes('id="builder-redo"') && stageHtml.includes('id="builder-project-refresh"'), '撤销重做及版本更新入口已交付');
for (const template of STAGE_TEMPLATES) {
  const file = `stages/${template.id}.json`, preset = await fetch(new URL(file,base)); assert.equal(preset.status,200);
  assert.deepEqual(Buffer.from(await preset.arrayBuffer()),await readFile(new URL(`../public/${file}`,import.meta.url)), '五套舞台模板按原文件交付');
}
const effectsExample = await fetch(new URL('stages/exhibition-effects.json', base)); assert.equal(effectsExample.status, 200);
const effectsConfig = await effectsExample.json(); assert.equal(effectsConfig.effectMode, 'stage');
assert.deepEqual(effectsConfig.objects.filter(object => object.type === 'laser').map(object => object.program), ['upstream-dolphin', 'upstream-plasma2']);
const show = await fetch(new URL('show.html', base)); assert.equal(show.status, 200);
const showHtml = await show.text();
assert.ok(showHtml.includes('id="concert-play"') && showHtml.includes('id="concert-layout"') && showHtml.includes('独立演出业务示例'));
const launch = await fetch(new URL('launch.html', base)); assert.equal(launch.status, 200);
const launchHtml = await launch.text();
assert.ok(launchHtml.includes('id="launch-view"') && launchHtml.includes('id="launch-reload"') && launchHtml.includes('id="launch-product-name"'), '发布会业务入口已交付');
assert.ok(showHtml.includes('id="concert-stage-select"') && launchHtml.includes('id="launch-stage-select"'), '两业务共用项目选择入口已交付');
assert.ok(showHtml.includes('id="concert-effects"') && launchHtml.includes('id="launch-effects"'), '两业务显示实际光效来源');
assert.ok(stageHtml.includes('./launch.html') && notesHtml.includes('./launch.html'), '搭建器与记录有第二种业务入口');
const pump = await fetch(new URL('pump.html', base)); assert.equal(pump.status, 200);
const pumpHtml = await pump.text();
for (const id of ['pump-view', 'pump-stage-select', 'pump-explode', 'pump-rotation', 'pump-parts', 'pump-screen-title', 'pump-slot', 'pump-tour-play', 'pump-tour-restart', 'pump-tour-seek', 'pump-tour-chapters', 'pump-tour-voice']) assert.ok(pumpHtml.includes(`id="${id}"`), id);
assert.ok(pumpHtml.includes('max="108"') && pumpHtml.includes('01:48'), '完整自动结构讲解已交付');
assert.ok(stageHtml.includes('./pump.html') && notesHtml.includes('./pump.html'), '舞台与记录有结构讲解入口');
const music = await fetch(new URL('stage/aurora-90s.wav', base)); assert.equal(music.status, 200);
const wav = new DataView(await music.arrayBuffer());
assert.equal(wav.byteLength, 3969044); assert.equal(wav.getUint32(0), 0x52494646); assert.equal(wav.getUint32(24, true), 22050);
// 构建版的脚本和样式使用相对子路径，逐个确认入口引用可交付。
for (const pageHtml of [stageHtml, notesHtml, showHtml, launchHtml, pumpHtml]) {
  const references = [...pageHtml.matchAll(/(?:src|href)="([^\"]+\.(?:js|css))"/g)].map(match => match[1]);
  for (const reference of references) { const resource = await fetch(new URL(reference, base)); assert.equal(resource.status, 200, reference); }
}
console.log(`HTTP 检查通过：${base.href} · 22 个节目/哈希/预览、来源文件、产品记录、舞台搭建器、音乐演出、产品发布会、泵结构讲解与 90 秒配乐可交付。未运行浏览器、音频播放或 GPU。`);
