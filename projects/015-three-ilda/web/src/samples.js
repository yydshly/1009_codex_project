// 本地原创：生成扫描路线并编码为标准 ILDA 格式 5（2D true color）。
export const sampleDefinitions = [
  { id: 'light-flower', name: '光之花', en: 'LIGHT FLOWER', note: '连续曲线 · 色彩与扫描', frames: 72 },
  { id: 'corners', name: '折角与停顿', en: 'CORNERS / DWELL', note: '直角路线 · 惯性与亮点', frames: 48 },
  { id: 'orbits', name: '轨道之间', en: 'ORBIT / BLANKING', note: '三条轨道 · 关光跳转', frames: 60 },
  { id: 'lab-mark', name: '光的签名', en: 'LAB / 015', note: '原创字形 · 分离笔画', frames: 48 },
];
function rgb(h) {
  const f = n => { const k = (n + h * 12) % 12; return Math.round(255 * (0.58 - 0.42 * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
  return [f(0), f(8), f(4)];
}
function stroke(out, points, hue, dwell = 1) {
  const color = rgb(hue % 1), add = (p, blank = false) => out.push({ x: p[0], y: p[1], color, blank });
  if (out.length) { const last = out.at(-1); for (let i = 0; i < 4; i++) out.push({ ...last, blank: true }); }
  for (let i = 0; i < 5; i++) add(points[0], true);
  for (const p of points) for (let i = 0; i < dwell; i++) add(p);
  for (let i = 0; i < 4; i++) add(points.at(-1), true);
}
function line(a, b, n = 20) { return Array.from({ length: n }, (_, i) => [a[0] + (b[0] - a[0]) * i / (n - 1), a[1] + (b[1] - a[1]) * i / (n - 1)]); }
export function makeFrames(id) {
  const def = sampleDefinitions.find(d => d.id === id);
  if (!def) throw new Error('Unknown original sample');
  return Array.from({ length: def.frames }, (_, frame) => {
    const phase = frame / def.frames * Math.PI * 2, out = [];
    if (id === 'light-flower') {
      const pts = Array.from({ length: 280 }, (_, i) => {
        const t = i / 279 * Math.PI * 2, radius = 0.6 + 0.19 * Math.cos(5 * t + phase);
        return [radius * Math.cos(t), radius * Math.sin(t)];
      });
      // 连续变色是文件中逐点保存的内容，不是运行时随机改色。
      stroke(out, pts, 0.43);
      out.forEach((p, i) => { p.color = rgb((0.42 + i / out.length * 0.45 + frame / def.frames * 0.13) % 1); });
    } else if (id === 'corners') {
      const corners = [[-.75, -.58], [.75, -.58], [.75, .58], [-.75, .58], [-.75, -.58]];
      const pts = [];
      for (let i = 1; i < corners.length; i++) { pts.push(...line(corners[i - 1], corners[i], 28)); for (let j = 0; j < 9; j++) pts.push(corners[i]); }
      stroke(out, pts, 0.45);
      stroke(out, line([-.45, -.25], [.45, .25], 36), 0.85);
    } else if (id === 'orbits') {
      for (let orbit = 0; orbit < 3; orbit++) {
        const angle = orbit * Math.PI / 3 + phase * 0.25;
        stroke(out, Array.from({ length: 110 }, (_, i) => {
          const t = i / 109 * Math.PI * 2, x = .8 * Math.cos(t), y = .25 * Math.sin(t);
          return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
        }), .4 + orbit * .19);
      }
    } else {
      const glyphs = [
        [[-.82, .36], [-.82, -.36], [-.52, -.36]],
        [[-.39, -.36], [-.19, .36], [.01, -.36]], [[-.31, -.08], [-.07, -.08]],
        [[.16, -.36], [.16, .36], [.41, .36], [.52, .24], [.41, .03], [.16, .03]],
        [[.41, .03], [.54, -.16], [.43, -.36], [.16, -.36]],
      ];
      for (let k = 0; k < glyphs.length; k++) {
        const pts = [];
        for (let i = 1; i < glyphs[k].length; i++) pts.push(...line(glyphs[k][i - 1], glyphs[k][i], 18));
        stroke(out, pts.map(([x, y]) => [x, y + .03 * Math.sin(phase)]), .43 + k * .08);
      }
    }
    return out;
  });
}
export function encodeILDA(frames, name = 'LAB015') {
  if (!frames.length || frames.some(f => !f.length || f.length > 65535)) throw new Error('Invalid ILDA frames');
  const bytes = 32 + frames.reduce((n, f) => n + 32 + f.length * 8, 0), buffer = new ArrayBuffer(bytes), view = new DataView(buffer);
  let offset = 0;
  const header = (count, index) => {
    view.setUint32(offset, 0x494c4441); view.setUint8(offset + 7, 5);
    for (let i = 0; i < Math.min(8, name.length); i++) view.setUint8(offset + 8 + i, name.charCodeAt(i) & 127);
    view.setUint16(offset + 24, count); view.setUint16(offset + 26, index); view.setUint16(offset + 28, frames.length);
    offset += 32;
  };
  frames.forEach((points, index) => {
    header(points.length, index);
    points.forEach((p, i) => {
      const coord = n => Math.max(-32768, Math.min(32767, Math.round(n * 32768)));
      view.setInt16(offset, coord(p.x)); view.setInt16(offset + 2, coord(p.y));
      view.setUint8(offset + 4, (p.blank ? 0x40 : 0) | (i === points.length - 1 ? 0x80 : 0));
      view.setUint8(offset + 5, p.color[2]); view.setUint8(offset + 6, p.color[1]); view.setUint8(offset + 7, p.color[0]); offset += 8;
    });
  });
  header(0, 0);
  return buffer;
}
