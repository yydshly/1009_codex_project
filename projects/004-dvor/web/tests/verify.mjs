import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const assets = fileURLToPath(new URL('../../assets/', import.meta.url));
mkdirSync(assets, { recursive: true });
const url = process.env.DVOR_URL || 'http://127.0.0.1:5195/';
const executablePath = process.env.DVOR_BROWSER || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [], warnings = [], requests = [], results = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); if (message.type() === 'warning') warnings.push(message.text()); });
page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) requests.push(`${request.url()}: ${request.failure()?.errorText}`); });
page.setDefaultTimeout(30000);
const check = (name, evidence) => { results.push({ name, status: 'passed', evidence }); console.log(`PASS ${name}`); };
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForFunction(() => window.__dvorLab?.ready, null, { polling: 100, timeout: 60000 });
  assert.equal(await page.title(), 'Dvor · 风格化世界与社区导览实验');
  assert.equal(await page.locator('#sample-gallery img').count(), 6);
  assert.ok(await page.locator('#scene-canvas').evaluate(canvas => canvas.toDataURL().length > 20000));
  check('研究页与实际 WebGL 场景加载', '六个上游截图、场景非空，社区世界已初始化');
  await page.screenshot({ path: `${assets}/page-desktop.png`, fullPage: true });

  await page.locator('#experiment').scrollIntoViewIfNeeded();
  await page.locator('[data-stop="notice"]').click();
  assert.match(await page.locator('#location-detail').innerText(), /10:00/);
  const noticePoint = await page.evaluate(() => {
    const lab = window.__dvorLab;
    const target = lab.world.interactables.find(item => item.note?.id === 'notice');
    target.hitbox.geometry.computeBoundingSphere();
    const p = target.hitbox.geometry.boundingSphere.center.clone().applyMatrix4(target.hitbox.matrixWorld).project(lab.camera);
    const rect = document.getElementById('scene-canvas').getBoundingClientRect();
    return { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 };
  });
  await page.mouse.click(noticePoint.x, noticePoint.y);
  await page.locator('#inscription-note').waitFor({ state: 'visible' });
  assert.match(await page.locator('#note-translation').innerText(), /swap meet/);
  await page.locator('#close-note').click();
  check('真实几何热点 → 注释数据 → 页面说明', '鼠标射线命中公告平面，呈现对应英文内容');

  await page.locator('[data-stop="entrance"]').click();
  for (let i = 0; i < 3; i++) await page.locator('#next-stop').click();
  assert.match(await page.locator('#visit-progress').innerText(), /4 \/ 4/);
  assert.equal(await page.evaluate(() => window.__dvorLab.selected), 3);
  await page.locator('#language-toggle').click();
  assert.match(await page.locator('#location-detail').innerText(), /Take a break/);
  await page.locator('#language-toggle').click();
  await page.locator('#animate-prop').click();
  assert.match(await page.locator('#animate-prop').innerText(), /已推动/);
  const animated = await page.evaluate(() => {
    const root = window.__dvorLab.world.root;
    const groups = []; root.traverse(object => { if (object.isGroup) groups.push(object); });
    const before = groups.map(group => group.quaternion.toArray().join(','));
    window.__dvorLab.world.update(0.25);
    return groups.some((group, i) => group.quaternion.toArray().join(',') !== before[i]);
  });
  assert.ok(animated);
  check('四站导览、双语切换与实际动画', '进度 4/4，英文说明正确，场景动画组发生旋转');

  await page.locator('[data-preset="daylight"]').click();
  assert.equal(await page.evaluate(() => window.__dvorLab.style.sun), 62);
  await page.locator('#compare-style').click();
  assert.equal(await page.evaluate(() => window.__dvorLab.pipeline.enabled.ink), false);
  assert.equal(await page.evaluate(() => window.__dvorLab.pipeline.grade.mat.uniforms.uWarmth.value), 0);
  await page.locator('#compare-style').click();
  await page.locator('#bands').evaluate(input => { input.value = 5; input.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.equal(await page.evaluate(() => window.__dvorLab.style.bands), 5);
  await page.locator('#save-preset').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('dvor-004-style-v1')));
  assert.equal(saved.bands, 5); assert.equal(saved.sun, 62); assert.equal(saved.warmth, 0.02);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-preset').click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'dvor-style.json');
  await page.reload({ waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForFunction(() => window.__dvorLab?.ready, null, { polling: 100 });
  assert.equal(await page.evaluate(() => window.__dvorLab.style.bands), 5);
  assert.equal(await page.evaluate(() => window.__dvorLab.style.warmth), 0.02);
  check('参数 → 材质 / 渲染管线 → 保存与导出', '色带与灯光生效，原色对照关闭描边；预设重载完整恢复并可下载');

  await page.locator('#experiment').scrollIntoViewIfNeeded();
  await page.locator('[data-preset="evening"]').click();
  await page.locator('[data-stop="library"]').click();
  await page.locator('.lab-layout').screenshot({ path: `${assets}/community-guide.png`, style: '.site-header{visibility:hidden!important}' });
  await page.locator('#overview').click();
  await page.locator('.lab-layout').screenshot({ path: `${assets}/preview.png`, style: '.site-header{visibility:hidden!important}' });
  await page.locator('#planet-view').click();
  assert.equal(await page.evaluate(() => window.__dvorLab.mode), 'planet');
  await page.locator('#scene-stage').screenshot({ path: `${assets}/planet-view.png` });
  await page.locator('#overview').click();
  await page.locator('[data-world="original"]').click();
  await page.waitForFunction(() => window.__dvorLab.source === 'original' && document.getElementById('scene-loading').hidden, null, { timeout: 60000 });
  await page.locator('[data-stop="arch"]').click();
  await page.locator('#scene-stage').screenshot({ path: `${assets}/original-reproduction.png` });
  assert.ok(await page.evaluate(() => window.__dvorLab.world.tram && window.__dvorLab.world.interactables.length > 10));
  await page.locator('[data-stop="tram"]').click();
  const tramX = await page.evaluate(() => window.__dvorLab.world.tram.x);
  assert.ok(tramX > -40 && tramX < -10);
  check('小行星视角与上游完整世界复现', '球面远景可用，上游热点与电车被构建且可呼叫');

  await page.locator('[data-world="community"]').click();
  await page.waitForFunction(() => window.__dvorLab.source === 'community' && document.getElementById('scene-loading').hidden);
  await page.bringToFront();
  await page.locator('#walking').click();
  await page.waitForFunction(() => window.__dvorLab.player.locked);
  const beforeWalk = await page.evaluate(() => window.__dvorLab.player.pos.z);
  await page.keyboard.down('w');
  await page.waitForFunction(initial => window.__dvorLab.player.pos.z > initial + 0.2, beforeWalk);
  await page.keyboard.up('w');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !window.__dvorLab.player.locked);
  check('键鼠漫游', 'Pointer Lock 生效，W 实际改变玩家位置，Esc 退出');

  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('#experiment').scrollIntoViewIfNeeded();
    await page.locator('#overview').click();
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth, canvas: document.getElementById('scene-canvas').width }));
    assert.ok(dimensions.scroll <= dimensions.viewport + 1, JSON.stringify(dimensions));
    assert.ok(dimensions.canvas > 0);
    check(`响应式 ${width}px`, '无横向溢出；3D 画布重新适配尺寸');
    if (width === 390) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `${assets}/page-mobile.png`, fullPage: true });
    }
  }
  await page.locator('#samples').scrollIntoViewIfNeeded();
  await page.locator('.sample-card').first().click();
  assert.ok(await page.locator('#sample-dialog').evaluate(dialog => dialog.open));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#sample-dialog').evaluate(dialog => dialog.open), false);
  check('原始样例放大与关闭', '原生对话框可打开，Esc 可关闭');
  assert.deepEqual(errors, []); assert.deepEqual(requests, []);
  writeFileSync(`${assets}/verification.json`, JSON.stringify({ date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }), url, browser: await browser.version(), results, errors, warnings, requests }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: results.length, errors, warnings, requests, screenshots: assets }));
} catch (error) {
  console.error('Verification failed:', error.message);
  console.error(JSON.stringify({ errors, warnings, requests }));
  throw error;
} finally {
  await browser.close();
}
