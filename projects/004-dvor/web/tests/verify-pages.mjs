import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const url = process.env.DVOR_PAGES_URL || 'http://127.0.0.1:5196/004-dvor/';
const executablePath = process.env.DVOR_BROWSER || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [], failed = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failed.push(request.url()); });
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForFunction(() => window.__dvorLab?.ready, null, { polling: 100, timeout: 60000 });
  console.log('PASS 编号子路径 WebGL 初始化');
  const images = await page.locator('#sample-gallery img').evaluateAll(items => items.map(img => ({ complete: img.complete, width: img.naturalWidth, path: new URL(img.src).pathname })));
  assert.equal(images.length, 6);
  assert.ok(images.every(img => img.complete && img.width > 0 && img.path.startsWith(new URL(url).pathname)));
  console.log('PASS 六张样例的子路径资源');
  const guide = await page.request.get(new URL('guides/dvor-overview.png', url).href);
  assert.equal(guide.status(), 200);
  const digest = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(digest(await guide.body()), digest(readFileSync(new URL('../../assets/dvor-overview.png', import.meta.url))));
  assert.equal(await page.locator('.module-table tbody tr').count(), 9);
  assert.equal(await page.locator('.value-grid article').count(), 4);
  assert.equal(await page.locator('.extension-grid article').count(), 3);
  assert.ok((await page.locator('#prompt-text').inputValue()).includes('styleConfig'));
  console.log('PASS 原图完整资源与研究、价值、扩展、提示词内容');
  await page.locator('[data-world="original"]').click();
  await page.bringToFront();
  await page.waitForFunction(() => window.__dvorLab.source === 'original' && document.getElementById('scene-loading').hidden, null, { polling: 100, timeout: 60000 });
  assert.ok(await page.evaluate(() => window.__dvorLab.world.tram && window.__dvorLab.world.interactables.length > 10));
  console.log('PASS 动态导入的原作世界');
  for (const filename of ['LICENSE.dvor', 'LICENSE.sakura-crossing', 'LICENSE.three']) {
    const response = await page.request.get(new URL(`licenses/${filename}`, url).href);
    assert.equal(response.status(), 200);
    assert.match(await response.text(), /MIT License/);
  }
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  const result = { date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }), url, browser: await browser.version(), status: 'passed', evidence: ['编号子路径页面和实际 WebGL 场景加载', '六张本地样例加载且资源路径位于子目录', '完整引导图哈希一致，模块/价值/扩展/提示词内容呈现', '动态导入的上游世界 chunk 能构建电车与注释', '三份完整 MIT 许可证返回 HTTP 200'], errors, failed };
  const filename = ['127.0.0.1', 'localhost'].includes(new URL(url).hostname) ? 'pages-verification.json' : 'public-pages-verification.json';
  writeFileSync(new URL(`../../assets/${filename}`, import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
} catch (error) {
  console.error('Pages verification failed:', error.message);
  console.error(JSON.stringify({ errors, failed, page: await page.evaluate(() => ({ source: window.__dvorLab?.source, loading: document.getElementById('scene-loading')?.textContent, hidden: document.getElementById('scene-loading')?.hidden, title: document.title })) }));
  throw error;
} finally { await browser.close(); }
