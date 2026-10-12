import { STAGE_BPM, STAGE_DURATION, stageCueAt, stageEnvelopeAt } from './stage-plan.js';

// 本项目原创电子伴奏：正弦合成、和弦琶音、低音与鼓点；无外部采样、歌词或歌手。
export function composeStageWav({ sampleRate = 22050, duration = STAGE_DURATION } = {}) {
  if (!Number.isInteger(sampleRate) || sampleRate < 8000 || !Number.isFinite(duration) || duration <= 0 || duration > STAGE_DURATION) throw new RangeError('无效配乐长度或采样率。');
  const count = Math.floor(duration * sampleRate), buffer = new ArrayBuffer(44 + count * 2), view = new DataView(buffer);
  const word = (offset, value) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  word(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); word(8, 'WAVE'); word(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  word(36, 'data'); view.setUint32(40, count * 2, true);
  const beat = 60 / STAGE_BPM, chordRoots = [45, 41, 48, 43], chords = [[0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 4, 7]];
  const frequency = midi => 440 * 2 ** ((midi - 69) / 12), oscillate = (hz, t) => Math.sin(Math.PI * 2 * hz * t);
  for (let i = 0; i < count; i++) {
    const time = i / sampleRate, beats = time / beat, chord = Math.floor(beats / 8) % 4, root = chordRoots[chord];
    const step = Math.floor(beats * 2), stepTime = (beats * 2 - step) * beat / 2, beatTime = (beats % 1) * beat;
    const pad = chords[chord].reduce((sum, n) => sum + oscillate(frequency(root + 12 + n), time), 0) * .028;
    const melody = oscillate(frequency(root + 24 + chords[chord][step % 3]), time) * Math.exp(-stepTime * 12) * .085;
    const bass = oscillate(frequency(root), time) * Math.exp(-beatTime * 6) * .075;
    const kick = oscillate(48 + 65 * Math.exp(-beatTime * 38), beatTime) * Math.exp(-beatTime * 30) * .19;
    let hash = Math.imul(i ^ (i >>> 13), 1597334677); hash ^= hash >>> 15;
    const noise = (hash >>> 0) / 2147483648 - 1;
    const snare = Math.floor(beats) % 2 === 1 ? noise * Math.exp(-beatTime * 35) * .055 : 0;
    const hat = noise * Math.exp(-stepTime * 95) * .018;
    const energy = .45 + stageCueAt(time).gain * .6;
    const envelope = Math.min(stageEnvelopeAt(time), (duration - time) / 2);
    const value = (pad + melody + bass + kick + snare + hat) * energy * Math.max(0, envelope);
    view.setInt16(44 + i * 2, Math.round(Math.max(-.8, Math.min(.8, value)) * 32767), true);
  }
  return buffer;
}
