// 使用上游扫描器的实际样本计数，播完当前轨道一次才切换，不依赖墙上时钟。
export class ProgramCarousel {
  constructor(ids) {
    this.ids = [...ids];
    this.enabled = false;
    this.loading = false;
    this.currentId = null;
    this.scanner = null;
    this.endSample = 0;
  }
  reset(scanner = this.scanner) {
    this.scanner = scanner;
    if (!scanner) { this.endSample = 0; return; }
    // seekFrame 会重置计数并预扫描所选整帧；拖到最后一帧后已经到达片尾。
    const atEnd = scanner.samples > 0 && scanner.point === 0 && scanner.lastFrame === scanner.frames.length - 1;
    this.endSample = scanner.samples + (atEnd ? 0 : scanner.total - scanner.point);
  }
  setEnabled(enabled) { this.enabled = Boolean(enabled); }
  beginLoad() { this.loading = true; }
  select(id, scanner) { this.currentId = id; this.loading = false; this.reset(scanner); }
  get remainingPoints() { return this.scanner ? Math.max(0, this.endSample - this.scanner.samples) : 0; }
  get nextId() {
    const index = this.ids.indexOf(this.currentId);
    return index < 0 ? this.ids[0] : this.ids[(index + 1) % this.ids.length];
  }
  playbackDelta(seconds, pointRate, { playing = true, visible = true } = {}) {
    if (this.loading || !playing || !visible || !Number.isFinite(seconds) || seconds <= 0) return 0;
    if (!this.enabled || !this.currentId || !this.scanner || this.ids.length < 2) return seconds;
    // 限制最后一次 update，避免同一显示帧越过片尾、又扫描到第 1 帧。
    const untilEnd = Math.max(0, (this.remainingPoints - this.scanner.fraction) / pointRate);
    return Math.min(seconds, untilEnd);
  }
  advance({ playing = true, visible = true } = {}) {
    if (!this.enabled || this.loading || !playing || !visible || !this.currentId || this.ids.length < 2) return null;
    if (!this.scanner || this.remainingPoints > 0) return null;
    this.beginLoad();
    return this.nextId;
  }
}
