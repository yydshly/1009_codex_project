// Original scenes. Brushstroke rendering uses upstream Paint (MIT; ../vendor/functional-emotions/LICENSE).
import { SCORE, shotAt } from './score.js';
const oil = document.getElementById('oil'), flat = document.getElementById('flat');
oil.width = flat.width = W; oil.height = flat.height = H;
const s = Paint.sctx, f = Paint.fctx, plain = flat.getContext('2d');
const clamp = n => Math.max(0, Math.min(1, n)), ease = n => { n = clamp(n); return n * n * (3 - 2 * n); }, lerp = (a, b, n) => a + (b - a) * n;
const random = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
let gold, bright, pale, pulse;
function ellipse(g, x, y, rx, ry, color, angle = 0) { g.fillStyle = color; g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), angle, 0, Math.PI * 2); g.fill(); }
function line(g, points, color, width) { g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; g.beginPath(); points.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
function glow(x, y, size, intensity = 1) { const gradient = f.createRadialGradient(x, y, 0, x, y, size); gradient.addColorStop(0, `rgba(${bright},${.56 * intensity})`); gradient.addColorStop(.25, `rgba(${bright},${.16 * intensity})`); gradient.addColorStop(1, `rgba(${bright},0)`); f.fillStyle = gradient; f.fillRect(x - size, y - size, size * 2, size * 2); }
function seed(x, y, t, size = 1) { glow(x, y, 110 * size, .65 + pulse * .45); ellipse(s, x, y, 13 * size, 23 * size, pale, -.25 + Math.sin(t * 2) * .2); ellipse(f, x, y, 7 * size, 14 * size, `rgba(${bright},.85)`); }
function sky(t) {
  const bg = s.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#061222'); bg.addColorStop(.56, '#23374f'); bg.addColorStop(1, '#0a2335'); s.fillStyle = bg; s.fillRect(0, 0, W, H);
  for (let i = 0; i < 85; i++) { const x = random(i + 1) * W, y = random(i + 103) * 500; ellipse(s, x, y, 1.7 + random(i + 201) * 2.2, 1.7, '#b7cbda'); if (i % 13 === 0) glow(x, y, 22, .16 + .05 * Math.sin(t + i)); }
  ellipse(s, 1510, 196, 69, 69, '#cfdae2'); ellipse(s, 1533, 179, 66, 66, '#101f35'); glow(1490, 220, 110, .2);
  for (let layer = 0; layer < 3; layer++) {
    s.fillStyle = ['#152b42', '#10243a', '#0c1f31'][layer]; s.beginPath(); s.moveTo(-100, 630);
    for (let x = -100; x <= W + 100; x += 90) s.lineTo(x, 570 - Math.sin(x * .003 + layer * 2) * (85 - layer * 18) - random(x + layer * 143) * 60 + layer * 28);
    s.lineTo(W + 100, 710); s.lineTo(-100, 710); s.fill();
  }
}
function water(t) {
  const bg = s.createLinearGradient(0, 570, 0, H); bg.addColorStop(0, '#1b354b'); bg.addColorStop(1, '#071c2f'); s.fillStyle = bg; s.fillRect(0, 580, W, H - 580);
  for (let i = 0; i < 85; i++) { const y = 600 + i * 6.3, x = 1400 + Math.sin(t * .7 + i * .8) * 33, spread = 38 + i * 1.35; line(s, [[x - spread, y], [x + spread, y]], `rgba(145,183,204,${.17 + random(i) * .22})`, 3 + random(i) * 3); }
  for (let i = 0; i < 72; i++) { const x = random(i + 83) * W, y = 590 + random(i + 413) * 480; line(s, [[x - 25, y], [x + 60 + Math.sin(t + i) * 18, y + 2]], '#224358', 2.5); }
}
function island(t) { ellipse(s, 960, 890, 315, 58, '#102c30'); ellipse(s, 955, 875, 295, 31, '#294238'); for (let i = 0; i < 17; i++) line(s, [[730 + i * 29, 882], [734 + i * 29, 861 - random(i) * 25]], '#49715c', 3); }
function branchPoints(x1, y1, x2, y2, curve, progress) { const points = []; for (let i = 0; i <= 20; i++) { const u = progress * i / 20; points.push([lerp(x1, x2, u) + Math.sin(u * Math.PI) * curve, lerp(y1, y2, u)]); } return points; }
function tree(t, growth = 1, blossom = 0) {
  const wind = Math.sin(t * .8) * 12, top = 380;
  const trunk = branchPoints(960, 869, 958 + wind, top, -35, clamp(growth * 1.45)); line(s, trunk, '#745851', 25); line(s, trunk.map(([x, y]) => [x + 5, y]), gold, 5);
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1, level = Math.floor(i / 2), x1 = 955 + wind * .4, y1 = 810 - level * 57;
    const x2 = x1 + side * (190 - level * 13) + Math.sin(i * 2) * 16 + wind, y2 = y1 - 110 - level * 8;
    const g = ease((growth - .16 - level * .062) * 2.4);
    line(s, branchPoints(x1, y1, x2, y2, side * 24, g), '#79574d', 12 - level * .8);
    line(s, branchPoints(x1 + 2, y1, x2, y2, side * 24, g), gold, 3.2);
    if (g > .78) for (let leaf = 0; leaf < 8; leaf++) { const a = leaf * 2.4 + i, distance = 19 + random(leaf + i * 17) * 44; const x = x2 + Math.cos(a) * distance, y = y2 + Math.sin(a) * distance * .6; ellipse(s, x, y, 24 * g, 8 * g, leaf % 3 ? gold : pale, a + Math.sin(t + i) * .12); }
    const opening = ease(blossom * 2.3 - (i % 7) * .16);
    if (opening > 0) { glow(x2, y2, 80, opening * (.3 + pulse * .22)); for (let petal = 0; petal < 5; petal++) { const a = petal * Math.PI * 2 / 5 + t * .025; ellipse(s, x2 + Math.cos(a) * 13 * opening, y2 + Math.sin(a) * 13 * opening, 18 * opening, 8 * opening, pale, a); } ellipse(f, x2, y2, 7, 7, `rgba(${bright},.7)`); }
  }
  if (growth > .4) for (let i = 0; i < 34; i++) { const x = 760 + random(i + 773) * 410 + Math.sin(t * .6 + i) * 15, y = 820 - ((t * 28 + random(i + 144) * 460) % 470); ellipse(s, x, y, 2.5, 3, gold); if (i % 4 === 0) glow(x, y, 24, .24); }
}
function ripple(t, origin, localTime) {
  for (let i = 0; i < 8; i++) { const age = localTime - i * SCORE.beat; if (age < 0) continue; const size = 24 + age * 110; s.strokeStyle = `rgba(${bright},${Math.max(0, .56 - age * .1)})`; s.lineWidth = 4; s.beginPath(); s.ellipse(origin[0], origin[1], size, size * .17, 0, 0, Math.PI * 2); s.stroke(); }
}
function draw(t, shot, local) {
  const p = local / (16 / 3);
  if (shot === 2) {
    const bg = s.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#164252'); bg.addColorStop(.4, '#092536'); bg.addColorStop(1, '#031520'); s.fillStyle = bg; s.fillRect(0, 0, W, H);
    for (let i = 0; i < 28; i++) line(s, [[i * 78, 0], [i * 80 + Math.sin(t + i) * 95, 190 + Math.sin(i) * 50]], '#275063', 7);
    seed(960, 610, t, 1.8);
    for (let i = 0; i < 22; i++) { const a = i * .61 + t * .24, radius = lerp(390, 100, ease(p)) + Math.sin(t + i) * 30; const x = 960 + Math.cos(a) * radius, y = 610 + Math.sin(a) * radius * .65; line(s, branchPoints(960, 635, x, y + 120, 45 * Math.sin(a), ease(p)), gold, 3); glow(x, y, 30, .3 + pulse * .2); ellipse(s, x, y, 4, 5, pale); }
    return;
  }
  sky(t); water(t);
  if (shot === 0) {
    const x = lerp(400, 1060, ease(p)), y = 220 + Math.sin(p * Math.PI) * 115 + p * 180;
    for (let i = 0; i < 19; i++) { const back = i * .023, q = clamp(p - back); ellipse(s, lerp(400, 1060, ease(q)), 220 + Math.sin(q * Math.PI) * 115 + q * 180, 2 + (19 - i) * .25, 2, gold); }
    seed(x, y, t, 1.35); glow(x, y, 200, .22);
  } else if (shot === 1) {
    const drop = ease(local / 1.8), x = 960, y = lerp(265, 755, drop); seed(x, y, t, lerp(1.4, .5, drop));
    if (local > 1.5) { ripple(t, [960, 755], local - 1.5); glow(960, 750, 180, .5); for (let i = 0; i < 13; i++) { const age = (local - 1.5 + random(i) * .5) % 1.7, a = i * .51; ellipse(s, 960 + Math.cos(a) * age * 110, 750 - Math.sin(age / 1.7 * Math.PI) * 80, 3, 5, gold); } }
  } else {
    island(t); const growth = shot === 3 ? ease(p) : 1; const blossom = shot >= 4 ? (shot === 4 ? ease(p) : 1) : 0;
    tree(t, growth, blossom); glow(960, 860, 150, .35 + pulse * .22);
    for (let i = 0; i < 28; i++) { const y = 925 + i * 4.9, spread = (30 + i * 2.1) * growth; line(s, [[960 - spread + Math.sin(t + i) * 17, y], [960 + spread + Math.cos(t + i) * 17, y]], `rgba(${bright},${.27 - i * .006})`, 4); }
    if (shot === 5) for (let i = 0; i < 18; i++) { const u = ease(p), a = i * .63; const x = 960 + Math.cos(a) * (70 + u * 530), y = 490 - u * (120 + random(i) * 260); ellipse(s, x, y, 2.5, 3, pale); glow(x, y, 25, .25); }
  }
}
try {
  Paint.init(oil);
  window.renderJourneyFrame = (time, options = {}) => {
    const t = Math.max(0, Math.min(31.999, time)), shot = shotAt(t), local = t - SCORE.shots[shot].start;
    gold = options.tone === 'jade' ? '#6bd8bb' : '#e6af62'; bright = options.tone === 'jade' ? '106,239,199' : '255,193,94'; pale = options.tone === 'jade' ? '#d8fff1' : '#fff0bf'; pulse = Math.exp(-(t / SCORE.beat % 1) / .15);
    for (const g of [s, f]) { g.setTransform(.5, 0, 0, .5, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.save(); }
    const progress = local / (16 / 3); const zoom = shot === 0 ? 1 + progress * .09 : shot === 1 ? 1.12 : shot === 4 ? 1.14 : shot === 5 ? lerp(1.24, 1, ease(progress)) : 1;
    for (const g of [s, f]) { g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2); }
    draw(t, shot, local); for (const g of [s, f]) g.restore();
    if (options.style === 'flat') { plain.fillStyle = '#071526'; plain.fillRect(0, 0, W, H); plain.drawImage(Paint.src, 0, 0, W, H); plain.globalCompositeOperation = 'lighter'; plain.drawImage(Paint.fx, 0, 0, W, H); plain.globalCompositeOperation = 'source-over'; }
    else Paint.present(t, { boil: 7, strokeK: 1.05, bloom: 1.25, grain: .06, vig: .4, flowK: .85 });
    flat.hidden = options.style !== 'flat'; oil.hidden = options.style === 'flat';
    return { shot, title: SCORE.shots[shot].title, beat: Math.floor(t / SCORE.beat), pulse };
  };
  window.renderJourneyFrame(24); window.journeyReady = true;
} catch (error) { window.journeyError = error.message; }
