import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Optional rendering dependency; the static website itself has no dependency.
const playwrightEntry = process.env.BEEFTV_PLAYWRIGHT_ENTRY;
const { chromium } = await import(playwrightEntry ? pathToFileURL(playwrightEntry).href : 'playwright');
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(project, 'assets', 'beeftv-overview.png');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 2400, height: 1800 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(project, 'assets', 'beeftv-overview.html')).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const inspection = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    imagesReady: [...document.images].every(image => image.complete && image.naturalWidth > 0),
    // Flow arrows intentionally extend beyond their nodes; inspect their text instead.
    overflowing: [...document.querySelectorAll('.card, .flow-node p, .flow-node h3, .entry, .tech, .demo, .bottom-card')]
      .filter(element => element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2)
      .map(element => element.className),
  }));
  if (!inspection.imagesReady || inspection.width > 2400 || inspection.overflowing.length) throw new Error(JSON.stringify(inspection));
  await mkdir(path.dirname(output), { recursive: true });
  await page.screenshot({ path: output, fullPage: true });
  console.log(JSON.stringify({ output, ...inspection }, null, 2));
} finally {
  await browser.close();
}
