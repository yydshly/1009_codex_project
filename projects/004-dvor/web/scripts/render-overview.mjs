import assert from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const html = new URL('../../assets/dvor-overview.html', import.meta.url);
const png = fileURLToPath(new URL('../../assets/dvor-overview.png', import.meta.url));
const evidence = fileURLToPath(new URL('../../assets/dvor-overview-verification.json', import.meta.url));
const executablePath = process.env.DVOR_BROWSER || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1.5 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(html.href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const data = await page.evaluate(() => ({
    sections: [...document.querySelectorAll('[data-section]')].map(node => node.dataset.section),
    images: [...document.images].map(image => ({ src: image.getAttribute('src'), complete: image.complete, width: image.naturalWidth })),
    width: document.getElementById('poster').getBoundingClientRect().width,
    height: document.getElementById('poster').getBoundingClientRect().height,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    clipped: [...document.querySelectorAll('.card, .stage, .prompt-example, .module, .source, h1')].filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.className || node.tagName),
    body: document.body.innerText,
  }));
  assert.deepEqual(data.sections, ['01', '02', '03', '04', '05', '06', '07', '08']);
  assert.ok(data.images.length === 9 && data.images.every(image => image.complete && image.width > 0), 'All nine real screenshot inserts must load');
  assert.ok(!data.overflow && !data.clipped.length, 'No page or card may clip text horizontally');
  for (const phrase of ['深度二阶差分', 'InstancedMesh', '平面 XZ', 'styleConfig', '同镜头截图', '产品方向建议', '真实截图', '预设翻译']) assert.ok(data.body.includes(phrase), phrase);
  assert.equal(errors.length, 0);
  await page.locator('#poster').screenshot({ path: png, animations: 'disabled' });
  delete data.body;
  const result = { generatedAt: new Date().toISOString(), method: 'Native HTML/CSS layout of verified screenshots, exported by Chromium; no AI-reconstructed scene images', ...data, pixels: { width: data.width * 1.5, height: Math.ceil(data.height * 1.5) }, errors, status: 'passed' };
  writeFileSync(evidence, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  console.log(`Saved ${png}`);
} finally {
  await browser.close();
}
