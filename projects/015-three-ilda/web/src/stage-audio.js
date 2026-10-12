import { STAGE_DURATION, clampStageTime } from './stage-plan.js';

// 只有用户点击播放时才创建/恢复 AudioContext。静音仍保留同一主时钟。
export class StageAudio {
  constructor(bytes, createContext = () => new (window.AudioContext ?? window.webkitAudioContext)()) {
    this.bytes = bytes; this.createContext = createContext; this.context = null; this.buffer = null;
    this.source = null; this.position = 0; this.startedAt = 0; this.playing = false; this.volume = .55; this.muted = false; this.revision = 0;
  }
  get time() { return clampStageTime(this.position + (this.playing ? this.context.currentTime - this.startedAt : 0)); }
  async play() {
    const revision = ++this.revision;
    if (!this.context) {
      this.context = this.createContext(); this.gain = this.context.createGain(); this.gain.connect(this.context.destination); this.applyVolume();
    }
    await this.context.resume();
    this.decode ??= this.context.decodeAudioData(this.bytes.slice(0));
    this.buffer ??= await this.decode;
    if (revision !== this.revision) return;
    if (this.position >= STAGE_DURATION) this.position = 0;
    this.startSource();
  }
  startSource() {
    this.stopSource();
    const source = this.context.createBufferSource(); source.buffer = this.buffer; source.connect(this.gain);
    this.source = source; this.startedAt = this.context.currentTime; this.playing = true;
    source.onended = () => { if (this.source === source) { this.position = STAGE_DURATION; this.playing = false; this.source = null; source.disconnect(); } };
    source.start(0, this.position);
  }
  stopSource() { if (this.source) { const source = this.source; this.source = null; source.onended = null; source.stop(); source.disconnect(); } }
  pause() { this.revision++; this.position = this.time; this.playing = false; this.stopSource(); }
  seek(seconds) { const resume = this.playing; this.pause(); this.position = clampStageTime(seconds); if (resume && this.position < STAGE_DURATION) this.startSource(); }
  applyVolume() { if (this.gain) this.gain.gain.value = this.muted ? 0 : this.volume; }
  dispose() { this.pause(); this.context?.close(); }
}
