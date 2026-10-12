// Frame assembly adapted from upstream js/main.js, MIT. See vendor/functional-emotions/LICENSE.
try {
  const canvas = document.getElementById('c');
  canvas.width = W; canvas.height = H;
  Paint.init(canvas);
  window.renderReferenceFrame = (t, overrides = {}) => {
    bindCtx();
    for (const g of [s, f]) { g.setTransform(.5, 0, 0, .5, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; }
    fill(s, P.night0); fill(f, '#000');
    let paint = {}; PAINT_FRAME = {};
    for (let k = 0; k < SHOTS.length; k++) {
      const sh = SHOTS[k], nx = SHOTS[k + 1];
      const end = sh.b + (nx && nx.o.xin && Math.abs(nx.a - sh.b) < .01 ? nx.o.xin : 0);
      if (t < sh.a || t >= end) continue;
      const alpha = sh.o.xin ? smooth((t - sh.a) / sh.o.xin) : 1;
      for (const g of [s, f]) { g.save(); g.globalAlpha = alpha; }
      try { sh.fn(t, clamp((t - sh.a) / (sh.b - sh.a)), t - sh.a); }
      finally { for (const g of [s, f]) g.restore(); }
      const pc = typeof sh.o.paint === 'function' ? sh.o.paint(t) : (sh.o.paint || {});
      paint = alpha >= 1 ? pc : { ...paint, ...Object.fromEntries(Object.entries(pc).map(([key, value]) => [key, typeof value === 'number' ? lerp(paint[key] ?? value, value, alpha) : value])) };
    }
    Paint.present(t, { ...paint, ...PAINT_FRAME, ...overrides });
    return SHOTS.find(shot => t >= shot.a && t < shot.b)?.name || '';
  };
  window.referenceReady = true;
} catch (error) { window.referenceError = String(error); }
