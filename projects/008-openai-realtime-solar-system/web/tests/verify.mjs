import assert from 'node:assert/strict';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const url = process.env.SOLAR_URL || 'http://127.0.0.1:5199/';
const executablePath = process.env.SOLAR_BROWSER || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [], failedRequests = [], checks = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('requestfailed', (request) => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failedRequests.push(request.url()); });
page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
const check = (name) => { checks.push(name); console.log(`PASS ${name}`); };
const reportDir = process.env.SOLAR_REPORT_DIR || fileURLToPath(new URL('../../assets/', import.meta.url));
mkdirSync(reportDir, { recursive: true });
const assetPath = (filename) => path.join(reportDir, filename);
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  const guide = page.locator('#overview img');
  await guide.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#overview img').naturalWidth > 0);
  assert.match(await page.locator('#modules').innerText(), /function_call_output/);
  assert.match(await page.locator('#extensions').innerText(), /完成率/);
  assert.match(await page.locator('#roadmap').innerText(), /尚未实现/);
  assert.match(await page.locator('meta[name="description"]').getAttribute('content'), /模块/);
  for (const id of ['overview', 'demo', 'mechanism', 'modules', 'extensions', 'roadmap', 'evidence']) {
    assert.equal(await page.locator(`nav[aria-label="页面导航"] a[href="#${id}"]`).count(), 1);
  }
  check('原始引导图、全面研究说明与七区导航加载');
  await page.locator('#solar-canvas').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#scene-fallback').isVisible(), false);
  await page.waitForFunction(() => [...document.querySelectorAll('.planet-label')].some((label) => label.style.opacity === '1'));
  assert.match(await page.locator('#tool-code').innerText(), /focus_planet/);
  await page.locator('#motion-toggle').click();
  await page.waitForTimeout(1400); // Allow the 1250ms camera transition to settle before capturing.
  await page.screenshot({ path: assetPath('preview.png') });
  check('初始土星聚焦、真实 WebGL 场景与暂停自转');

  await page.locator('[data-preset="chart"]').click();
  assert.match(await page.locator('#tool-code').innerText(), /display_data/);
  assert.equal(await page.locator('.donut').count(), 1);
  await page.locator('[data-chart="bar"]').click();
  assert.equal(await page.locator('.bar-row').count(), 2);
  assert.match(await page.locator('#tool-code').innerText(), /"bar"/);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: assetPath('chart-demo.png') });
  check('文字指令 → 图表工具 → 饼图 / 柱状图切换');

  await page.locator('[data-preset="moons"]').click();
  assert.match(await page.locator('#tool-code').innerText(), /Ganymede/);
  assert.equal(await page.locator('#chart-panel').isVisible(), false);
  await page.locator('#command-input').fill('冥王星的卫星');
  await page.locator('#command-form button').click();
  assert.match(await page.locator('#tool-code').innerText(), /Kerberos/);
  assert.match(await page.locator('#action-result').innerText(), /5 个/);
  check('木星与冥王星卫星指令，切换动作清除图表');

  await page.locator('[data-preset="orbit"]').click();
  assert.equal(await page.locator('#view-label').innerText(), '轨道俯视');
  await page.locator('[data-preset="iss"]').click();
  assert.match(await page.locator('#chart-panel').innerText(), /固定示例/);
  await page.locator('[data-preset="reset"]').click();
  assert.equal(await page.locator('#chart-panel').isVisible(), false);
  assert.equal(await page.locator('#view-label').innerText(), '全景视角');
  check('轨道视角 → ISS 示例 → 镜头复位，状态正确清除');

  await page.locator('#command-input').fill('这不是预设的命令');
  await page.locator('#command-form button').click();
  assert.match(await page.locator('#tool-code').innerText(), /未匹配/);
  assert.equal(await page.locator('#view-label').innerText(), '全景视角');
  check('未知指令不伪造工具调用、不改变场景');

  for (const id of ['pump', 'community', 'product', 'research']) {
    await page.locator(`[data-scenario="${id}"]`).click();
    assert.equal(await page.locator(`[data-scenario="${id}"]`).getAttribute('aria-selected'), 'true');
    assert.match(await page.locator('#scenario-detail').innerText(), /需要新增/);
  }
  await page.locator('[data-scenario="pump"]').focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('[data-scenario="community"]').getAttribute('aria-selected'), 'true');
  check('四类扩展方案与键盘切换，展示复用 / 新增 / 价值 / 边界');

  await page.locator('#demo').scrollIntoViewIfNeeded();
  await page.locator('#tour-toggle').click();
  assert.equal(await page.locator('#tour-toggle').getAttribute('aria-pressed'), 'true');
  await page.locator('[data-preset="reset"]').click();
  assert.equal(await page.locator('#tour-toggle').getAttribute('aria-pressed'), 'false');
  await page.locator('#tour-toggle').click();
  await page.waitForFunction(() => document.querySelector('#demo-progress').textContent === '6 步演示完成', null, { timeout: 40000 });
  assert.equal(await page.locator('#view-label').innerText(), '全景视角');
  check('自动六步演示完整结束，手动操作可中断');

  if (!(await page.locator('#read-toggle').isDisabled())) {
    await page.locator('#read-toggle').click();
    assert.equal(await page.locator('#read-toggle').getAttribute('aria-pressed'), 'true');
    await page.locator('#read-toggle').click();
    assert.equal(await page.locator('#read-toggle').getAttribute('aria-pressed'), 'false');
  }
  check('浏览器朗读开关；未测试音频听感');

  await page.locator('#evidence').scrollIntoViewIfNeeded();
  const image = page.locator('.evidence-grid img');
  await image.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('.evidence-grid img').naturalWidth > 0);
  for (const filename of ['openai-LICENSE.txt', 'three-LICENSE.txt']) {
    const response = await page.request.get(new URL(`licenses/${filename}`, url).href);
    assert.equal(response.status(), 200); assert.match(await response.text(), /MIT License/);
  }
  assert.equal(await page.locator('.capability-card').count(), 6);
  check('上游截图、六项能力与完整 MIT 许可资源加载');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#demo').scrollIntoViewIfNeeded();
  await page.locator('[data-preset="saturn"]').click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: assetPath('mobile.png') });
  check('390px 手机布局无横向溢出，指令可操作');
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: assetPath('preview.png') });
  assert.deepEqual(errors, []); assert.deepEqual(failedRequests, []);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const result = { date, url, browser: await browser.version(), status: 'passed', checks, errors, failedRequests, limitation: '本地规则与独立 3D 示意验证；未调用 Realtime API，未听测朗读音频。' };
  const reportName = new URL(url).pathname.includes('/008-openai-realtime-solar-system/') ? 'pages-verification.json' : 'browser-verification.json';
  writeFileSync(assetPath(reportName), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
