import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const assets = fileURLToPath(new URL('../../assets/', import.meta.url));
const url = process.env.DVOR_URL || 'http://127.0.0.1:5195/';
const executablePath = process.env.DVOR_BROWSER || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, acceptDownloads: true });
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
const page = await context.newPage();
const errors = [], failed = [], results = [];
page.setDefaultTimeout(30000);
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failed.push(request.url()); });
const check = (name, evidence) => { results.push({ name, status: 'passed', evidence }); console.log(`PASS ${name}`); };
// Windows clipboard transport normalizes line endings to CRLF.
const clipboard = async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForFunction(() => window.__dvorLab?.ready, null, { polling: 100, timeout: 60000 });
  await page.locator('.site-header a[href="#prompts"]').click();
  assert.equal(new URL(page.url()).hash, '#prompts');
  assert.equal(await page.locator('.prompt-table tbody tr').count(), 7);
  assert.equal(await page.locator('[data-copy-revision]').count(), 4);
  const editor = page.locator('#prompt-text');
  const original3d = await editor.inputValue();
  assert.match(original3d, /styleConfig/); assert.match(original3d, /独立创建/);
  check('章节入口与视觉规格', '导航到 #prompts，七项规格、两种模板、四条修正建议可阅读');

  const edited3d = `${original3d}\n\n【场景补充】改为校园开放日，公告板文字：<社区开放日>。`;
  await editor.fill(edited3d);
  await page.locator('[data-prompt-mode="image"]').click();
  const originalImage = await editor.inputValue();
  assert.match(originalImage, /16:9/); assert.ok(!originalImage.includes('styleConfig'));
  assert.equal(await page.locator('#prompt-use-style').isDisabled(), true);
  const editedImage = `${originalImage}\n\n调整为校园庭院，保持整体构图。`;
  await editor.fill(editedImage);
  await page.locator('[data-prompt-mode="3d"]').click();
  assert.equal(await editor.inputValue(), edited3d);
  check('编辑与模板切换', '两个模板的编辑分别保留，图像模式禁用实时参数带入');

  await page.locator('#copy-prompt').click();
  await page.waitForFunction(() => document.getElementById('prompt-status').textContent.includes('已复制完整提示词'));
  assert.equal(await clipboard(), edited3d);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#download-prompt').click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), 'stylized-scene-3d-prompt.txt');
  assert.equal(readFileSync(await download.path(), 'utf8'), edited3d);
  check('完整提示词复制与下载', '实际剪贴板和下载的 UTF-8 TXT 与自定义正文完全一致');

  await page.locator('[data-preset="daylight"]').click();
  await page.locator('#ink').evaluate(input => { input.value = 112; input.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#fog').evaluate(input => { input.value = 40; input.dispatchEvent(new Event('input', { bubbles: true })); });
  const style = await page.evaluate(() => window.__dvorLab.style);
  await page.locator('#prompt-use-style').click();
  const withStyle = await editor.inputValue();
  assert.ok(withStyle.startsWith(edited3d));
  for (const fragment of ['光照色带：4 档', '太阳高度：62 度', '阴影色：#718c9a', '112%', '雾近距 66、远距 258', '整体饱和度参考：0.96']) assert.ok(withStyle.includes(fragment), fragment);
  assert.deepEqual(await page.evaluate(() => window.__dvorLab.style), style);
  await page.locator('#prompt-use-style').click();
  assert.equal((await editor.inputValue()).split('【当前实验参数，替换上文对应设置】').length, 2);
  check('实验参数 → 可审阅的提示词', '实际配置进入模板，自定义正文保留，重复带入不重复追加且不改变场景');

  for (const id of ['shadow', 'outline', 'trees', 'surface']) {
    const text = await page.locator(`[data-revision="${id}"]`).innerText();
    await page.locator(`[data-copy-revision="${id}"]`).click();
    await page.waitForFunction(expected => navigator.clipboard.readText().then(value => value.replace(/\r\n/g, '\n') === expected), text);
    assert.equal(await clipboard(), text);
  }
  check('逐轮修正提示词', '四条建议均实际复制，覆盖保留条件、单项修改与同镜头对照');

  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new DOMException('Clipboard unavailable', 'NotAllowedError'); } }); });
  await page.locator('#copy-prompt').click();
  await page.locator('#prompt-copy-fallback').waitFor({ state: 'visible' });
  const selected = await page.locator('#prompt-manual-copy').evaluate(input => ({ text: input.value, start: input.selectionStart, end: input.selectionEnd, focused: document.activeElement === input }));
  assert.equal(selected.text, await editor.inputValue());
  assert.equal(selected.start, 0); assert.equal(selected.end, selected.text.length); assert.equal(selected.focused, true);
  assert.match(await page.locator('#prompt-status').innerText(), /自动复制不可用/);
  await page.evaluate(() => { delete navigator.clipboard.writeText; });
  await editor.fill(''); await page.locator('#copy-prompt').click();
  assert.match(await page.locator('#prompt-status').innerText(), /请先填写提示词/);
  await page.locator('#reset-prompt').click();
  assert.equal(await editor.inputValue(), original3d);
  await page.locator('[data-prompt-mode="image"]').click();
  assert.equal(await editor.inputValue(), editedImage);
  await page.locator('#reset-prompt').click();
  assert.equal(await editor.inputValue(), originalImage);
  await page.locator('[data-prompt-mode="3d"]').click();
  check('复制失败回退与模板恢复', '剪贴板失败时准确选中手动文本，空内容提示，恢复只影响当前模板');

  await page.locator('[data-preset="evening"]').click();
  await page.locator('#overview').click();
  await page.locator('#prompts').screenshot({ path: `${assets}/prompt-desktop.png`, style: '.site-header{visibility:hidden!important}' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `${assets}/page-desktop.png`, fullPage: true });
  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.site-header a[href="#prompts"]').click();
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth, editor: document.getElementById('prompt-text').clientWidth }));
    assert.ok(dimensions.scroll <= dimensions.viewport + 1, JSON.stringify(dimensions)); assert.ok(dimensions.editor > 0);
    if (width === 390) {
      await page.locator('#prompts').screenshot({ path: `${assets}/prompt-mobile.png`, style: '.site-header{visibility:hidden!important}' });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `${assets}/page-mobile.png`, fullPage: true });
    }
  }
  check('桌面与手机布局', '1024/768/390/320px 无页面横向溢出；表格和编辑器在自身区域滚动');
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  writeFileSync(`${assets}/prompt-verification.json`, JSON.stringify({ date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }), url, browser: await browser.version(), results, errors, failed }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: results.length, errors, failed }));
} catch (error) {
  console.error('Prompt verification failed:', error.message); console.error(JSON.stringify({ errors, failed })); throw error;
} finally { await browser.close(); }
