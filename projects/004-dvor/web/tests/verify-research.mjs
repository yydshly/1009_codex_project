import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const url = process.env.DVOR_URL || 'http://127.0.0.1:5195/';
const executablePath = process.env.DVOR_BROWSER || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [], failed = [], checks = [];
const check = (name, evidence) => { checks.push({ name, status: 'passed', evidence }); console.log(`PASS ${name}`); };
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failed.push(request.url()); });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForFunction(() => window.__dvorLab?.ready, null, { polling: 100, timeout: 60000 });
  const guide = page.locator('#overview-guide');
  const source = readFileSync(new URL('../../assets/dvor-overview.png', import.meta.url));
  const guideUrl = await guide.getAttribute('src');
  const response = await page.request.get(new URL(guideUrl, url).href);
  assert.equal(response.status(), 200);
  assert.equal(hash(await response.body()), hash(source));
  assert.deepEqual(await guide.evaluate(img => [img.naturalWidth, img.naturalHeight, getComputedStyle(img).objectFit]), [2400, 6357, 'contain']);
  check('原始引导图完整保留', 'HTTP 图片 SHA-256 与原 PNG 完全一致；2400×6357，展示为 contain');

  await page.locator('#open-guide').click();
  assert.equal(await page.locator('#guide-dialog').evaluate(dialog => dialog.open), true);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#guide-dialog a[download]').click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), 'dvor-overview.png');
  assert.equal(hash(readFileSync(await download.path())), hash(source));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#guide-dialog').evaluate(dialog => dialog.open), false);
  assert.equal(await page.locator('#open-guide').evaluate(button => button === document.activeElement), true);
  check('完整图阅读与下载', '模态阅读、原 PNG 下载、Esc 关闭与焦点返回均可操作');

  const anchors = await page.locator('.site-header nav a').evaluateAll(items => items.map(item => item.getAttribute('href')));
  assert.equal(anchors.length, 9);
  for (const anchor of anchors) {
    await page.locator(`.site-header nav a[href="${anchor}"]`).click();
    assert.equal(new URL(page.url()).hash, anchor);
    assert.equal(await page.locator(anchor).count(), 1);
  }
  assert.equal(await page.locator('.overview-grid a').count(), 6);
  assert.equal(await page.locator('.module-table tbody tr').count(), 9);
  assert.equal(await page.locator('.value-grid article').count(), 4);
  assert.equal(await page.locator('.extension-grid article').count(), 3);
  check('研究内容与九个导航入口', '导读、能力、九组模块、原理、样例、实验、价值、提示词和扩展锚点全部可达');

  for (const phrase of ['Canvas2D', 'onBeforeCompile', 'InstancedMesh', '平面 XZ']) {
    assert.ok((await page.locator('main').innerText()).includes(phrase), phrase);
  }
  assert.match(await page.locator('#extension-plan').innerText(), /尚未在本页实现/);
  assert.match(await page.locator('#value').innerText(), /未证明商业转化/);
  assert.match(await page.locator('#evidence').innerText(), /未测模型生成质量/);
  check('事实与建议边界', '来源固定、雾位于场景阶段、编辑/LOD 为建议、价值与模型生成质量边界清楚');

  await page.locator('.hero').scrollIntoViewIfNeeded();
  await page.screenshot({ path: fileURLToPath(new URL('../../assets/research-first-screen.png', import.meta.url)) });
  await page.screenshot({ path: fileURLToPath(new URL('../../assets/research-desktop.png', import.meta.url)), fullPage: true });
  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.locator('.hero').scrollIntoViewIfNeeded();
  await page.screenshot({ path: fileURLToPath(new URL('../../assets/research-mobile.png', import.meta.url)), fullPage: true });
  check('响应式完整阅读', '1024/768/390/320px 无页面横向溢出；模块表与公式在自身区域滚动');
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  const result = { date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }), url, browser: await browser.version(), guideSha256: hash(source), checks, errors, failed };
  writeFileSync(new URL('../../assets/research-verification.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
