import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(project, '../../upstream/functional-emotions-video-review');
const output = path.join(project, 'web/vendor/functional-emotions');
const commit = 'b34c20a4f8f64ee87079a2ae2fdedf2cf1990a49';
const context = { window: {} };
vm.runInNewContext(await fs.readFile(path.join(source, 'js/data.js'), 'utf8'), context);
const original = context.window;
const cues = {};
const names = new Map();
function cueId(word) {
  const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  let id = 2166136261;
  for (const letter of normalized) id = Math.imul(id ^ letter.charCodeAt(0), 16777619);
  return id >>> 0;
}
for (const item of original.LYRICS.flatMap(line => line.words)) {
  const normalized = item.t.toLowerCase().replace(/[^a-z0-9]/g, '');
  const id = cueId(item.t);
  if (names.has(id) && names.get(id) !== normalized) throw new Error('Timing cue collision');
  names.set(id, normalized);
  (cues[id] ||= []).push(item.s);
}
await fs.writeFile(path.join(output, 'js/data.js'), `// Numeric audio features and opaque scene timing identifiers. No song audio or full lyric text.\nwindow.LYRICS=[];\nwindow.TIMING_CUES=${JSON.stringify(cues)};\nwindow.FEAT=${JSON.stringify(original.FEAT)};\n`);
for (const name of ['paint.js', 'lib.js', 'cast.js', ...Array.from({ length: 8 }, (_, i) => `ch/c${i + 1}.js`)]) {
  let text = await fs.readFile(path.join(source, 'js', name), 'utf8');
  if (name === 'lib.js') {
    const originalFunction = /function when\(word, after = 0\) \{[^\n]+\}/;
    if (!originalFunction.test(text)) throw new Error('Upstream timing function changed');
    text = text.replace(originalFunction, "function when(word, after = 0) { let id = word; if (typeof word !== 'number') { id = 2166136261; for (const letter of norm(word)) id = Math.imul(id ^ letter.charCodeAt(0), 16777619); id >>>= 0; } const times = window.TIMING_CUES[id] || []; const time = times.find(value => value >= after - .01); if (time === undefined) throw new Error('Missing scene timing cue'); return time; }");
  } else if (name.startsWith('ch/')) {
    text = text.replace(/\b(when|W_|W8)\(('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g,
      (_, fn, literal) => `${fn}(${cueId(vm.runInNewContext(literal, {}))}`);
    if (name === 'ch/c7.js') {
      text = text.replace(/const words = (\[[^\n]+\]);\n(\s*let m = 0; let after)/g,
        (_, literal, next) => `const words = ${JSON.stringify(vm.runInNewContext(literal, {}).map(cueId))};\n${next}`);
    }
  }
  await fs.writeFile(path.join(output, 'js', name), `// Source: ledbetterljoshua/functional-emotions-video @ ${commit}. MIT; see ../LICENSE.\n${text}`);
}
console.log('Imported all eight chapters with numeric timing cues; excluded audio and full lyric text.');
