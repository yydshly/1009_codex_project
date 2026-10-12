import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCORE } from '../web/public/demo/score.js';
const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/demo');
const rate = 22050, count = rate * SCORE.duration, dry = new Float64Array(count), events = [];
let noiseSeed = 93717;
function noise() { noiseSeed ^= noiseSeed << 13; noiseSeed ^= noiseSeed >>> 17; noiseSeed ^= noiseSeed << 5; return (noiseSeed >>> 0) / 2147483648 - 1; }
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
function note(start, midi, duration, gain, voice) {
  events.push({ start: Number(start.toFixed(4)), midi, duration, voice });
  const begin = Math.round(start * rate), end = Math.min(count, begin + Math.round(duration * rate)), frequency = hz(midi);
  for (let index = begin; index < end; index++) {
    const t = (index - begin) / rate, phase = Math.PI * 2 * frequency * t;
    const release = Math.min(1, (duration - t) / .16);
    let value;
    if (voice === 'bell') value = (Math.sin(phase) + .28 * Math.sin(phase * 2.01) + .09 * Math.sin(phase * 3.97)) * (1 - Math.exp(-t * 180)) * Math.exp(-t * 2.3);
    else if (voice === 'pad') value = (.7 * Math.sin(phase) + .2 * Math.sin(phase * 2) + .1 * Math.sin(phase * 3)) * Math.min(1, t / .3) * .65;
    else value = Math.sin(phase) * Math.min(1, t / .025) * Math.exp(-t * 1.3);
    dry[index] += value * gain * Math.max(0, release);
  }
}
function drum(start, kind, gain) {
  const begin = Math.round(start * rate), duration = kind === 'kick' ? .24 : .1;
  for (let i = 0; i < duration * rate && begin + i < count; i++) {
    const t = i / rate;
    const value = kind === 'kick' ? Math.sin(2 * Math.PI * (54 * t + 8 * (1 - Math.exp(-t * 24)))) * Math.exp(-t * 20) : noise() * Math.exp(-t * (kind === 'snare' ? 42 : 85));
    dry[begin + i] += value * gain;
  }
}
const chords = [[50, 57, 62, 65], [46, 53, 58, 62], [41, 53, 57, 60], [48, 55, 60, 64]];
const melody = [[74, 77, 81], [77, 74, 72], [69, 72, 77], [76, 72, 67], [74, 77, 79], [81, 77, 74], [77, 81, 84], [79, 76, 72], [81, 84, 86], [84, 81, 77], [79, 77, 74], [77, 74, 74]];
for (let bar = 0; bar < 12; bar++) {
  const start = bar * SCORE.beat * 4, chord = chords[bar % 4], final = bar === 11;
  (final ? chords[0] : chord).slice(1).forEach(midi => note(start, midi, SCORE.beat * 3.95, .055, 'pad'));
  note(start, (final ? chords[0] : chord)[0] - 12, SCORE.beat * 1.8, .12, 'bass');
  if (!final) note(start + SCORE.beat * 2, chord[0] - 12, SCORE.beat * 1.8, .085, 'bass');
  melody[bar].forEach((midi, index) => note(start + [0, 1.5, 2.5][index] * SCORE.beat, midi, 1.8, .17, 'bell'));
  for (let beat = 0; beat < 4; beat++) {
    drum(start + beat * SCORE.beat, beat % 2 ? 'snare' : 'kick', beat % 2 ? .035 : .09);
    if (bar < 11) for (const half of [0, .5]) drum(start + (beat + half) * SCORE.beat, 'hat', .012);
  }
}
const channels = [new Float64Array(count), new Float64Array(count)]; let peak = 0;
for (let i = 0; i < count; i++) {
  for (let channel = 0; channel < 2; channel++) {
    let value = dry[i];
    for (const [seconds, gain] of [[channel ? .31 : .25, .2], [channel ? .63 : .5, .11], [.88, .05]]) if (i >= seconds * rate) value += dry[i - Math.round(seconds * rate)] * gain;
    value *= Math.min(1, i / rate / .8, (SCORE.duration - i / rate) / 1.8);
    channels[channel][i] = value; peak = Math.max(peak, Math.abs(value));
  }
}
const wav = Buffer.alloc(44 + count * 4); wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(count * 4, 40);
for (let i = 0; i < count; i++) for (let channel = 0; channel < 2; channel++) wav.writeInt16LE(Math.round(channels[channel][i] / peak * .76 * 32767), 44 + i * 4 + channel * 2);
await fs.mkdir(directory, { recursive: true }); await fs.writeFile(path.join(directory, 'seed-journey.wav'), wav);
await fs.writeFile(path.join(directory, 'score.json'), JSON.stringify({ ...SCORE, sampleRate: rate, channels: 2, encoding: 'PCM 16-bit', source: '本项目原创乐谱与程序合成，无采样素材或模型音乐接口', beatTimes: Array.from({ length: 48 }, (_, i) => Number((i * SCORE.beat).toFixed(4))), noteEvents: events }, null, 2));
console.log('Generated original 32-second stereo score: assets/demo/seed-journey.wav');
