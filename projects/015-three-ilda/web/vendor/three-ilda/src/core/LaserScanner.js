/**
 * @typedef {Object} ScannerParams
 * @property {number} rate Samples per second.
 * @property {number} gain Mirror spring constant.
 * @property {number} dampening Fraction of velocity kept per sample (larger = less damping).
 * @property {number} blankingOffset Blank-flag offset in points.
 * @property {number} lightDecay Afterglow factor per 1/60 s.
 */

export const TRAIL_POINTS = 2048
/** @type {Readonly<ScannerParams>} */
export const SCANNER_DEFAULTS = Object.freeze({ rate: 8000, gain: 0.51, dampening: 0.39, blankingOffset: -3, lightDecay: 0.95 })

/** The demo's per-sample galvo recurrence, with a fixed-size ring instead of shifting/allocating arrays each frame. */
export class LaserScanner {
  /**
   * @param {import('../loaders/ILDALoader.js').ILDAFrame[]} frames Frames of one projector track.
   * @param {number} [capacity] Ring size in samples.
   */
  constructor(frames, capacity = TRAIL_POINTS) {
    if (!frames.length || frames.some(f => !f.count)) throw new Error('No points to scan.')
    this.frames = frames; this.capacity = capacity
    this.starts = []; this.total = 0
    for (const f of frames) { this.starts.push(this.total); this.total += f.count }
    this.position = new Float32Array(capacity * 3); this.color = new Float32Array(capacity * 3)
    this.blank = new Uint8Array(capacity); this.born = new Float64Array(capacity)
    this.output = { position: new Float32Array(capacity * 3), color: new Float32Array(capacity * 3), blank: new Uint8Array(capacity), count: 0 }
    this.reset()
  }

  /** @param {number} [frame] */
  reset(frame = 0) {
    this.frame = frame; this.index = 0; this.lastFrame = frame; this.x = 0; this.y = 0; this.vx = 0; this.vy = 0
    this.time = 0; this.fraction = 0; this.write = 0; this.count = 0; this.samples = 0; this.output.count = 0
  }

  get point() { return this.starts[this.frame] + this.index }

  /** @param {number} offset @returns {number} */
  blankAtOffset(offset) {
    let frame = this.frame, index = this.index + offset
    while (index < 0) { frame = (frame + this.frames.length - 1) % this.frames.length; index += this.frames[frame].count }
    while (index >= this.frames[frame].count) { index -= this.frames[frame].count; frame = (frame + 1) % this.frames.length }
    return this.frames[frame].blank[index]
  }

  /** @param {ScannerParams} params @param {number} born */
  sample(params, born) {
    const f = this.frames[this.frame], p = this.index * 3
    this.vx = (this.vx + (f.position[p] - this.x) * params.gain) * params.dampening
    this.vy = (this.vy + (f.position[p + 1] - this.y) * params.gain) * params.dampening
    this.x += this.vx; this.y += this.vy
    // Protect rendering from unbounded tuning/input; ordinary slider ranges never approach this guard.
    if (!Number.isFinite(this.x + this.y) || Math.abs(this.x) + Math.abs(this.y) > 1e6) { this.x = f.position[p]; this.y = f.position[p + 1]; this.vx = this.vy = 0 }
    const i = this.write, q = i * 3, blank = this.blankAtOffset(Math.round(params.blankingOffset))
    this.position[q] = this.x; this.position[q + 1] = this.y; this.position[q + 2] = 0 // scanner axes are X/Y, as in the demo
    this.color[q] = f.color[p]; this.color[q + 1] = f.color[p + 1]; this.color[q + 2] = f.color[p + 2]
    this.blank[i] = blank; this.born[i] = born; this.lastFrame = this.frame
    this.write = (i + 1) % this.capacity; this.count = Math.min(this.count + 1, this.capacity); this.samples++
    if (++this.index >= f.count) { this.index = 0; this.frame = (this.frame + 1) % this.frames.length }
  }

  /** @param {number} dt Seconds. @param {ScannerParams} params @returns {number} Samples produced. */
  advance(dt, params) {
    if (!(dt > 0) || !Number.isFinite(dt)) return 0
    this.time += dt
    const requested = this.fraction + dt * params.rate, steps = Math.floor(requested + 1e-9)
    this.fraction = Math.max(0, requested - steps)
    const first = this.time - (steps - 1 + this.fraction) / params.rate
    for (let i = 0; i < steps; i++) this.sample(params, first + i / params.rate)
    return steps
  }

  /** @param {number} frame @param {ScannerParams} params */
  seekFrame(frame, params) {
    this.reset(Math.max(0, Math.min(this.frames.length - 1, frame)))
    // Build the selected frame's trail while paused, instead of displaying stale samples from the old location.
    this.advance(this.frames[this.frame].count / params.rate, params)
  }

  /** @param {number} lightDecay */
  snapshot(lightDecay) {
    const out = this.output, start = (this.write - this.count + this.capacity) % this.capacity
    for (let j = 0; j < this.count; j++) {
      const i = (start + j) % this.capacity, p = i * 3, q = j * 3, age = Math.max(0, this.time - this.born[i])
      // 0.95 is the demo's decay per display frame. Normalize to 60 Hz so persistence is stable at 30/60/120 FPS.
      const decay = lightDecay === 0 ? (age < 1 / 60 ? 1 : 0) : Math.pow(lightDecay, age * 60)
      const fade = this.blank[i] ? 0 : decay
      out.position[q] = this.position[p]; out.position[q + 1] = this.position[p + 1]; out.position[q + 2] = 0
      out.color[q] = this.color[p] * fade; out.color[q + 1] = this.color[p + 1] * fade; out.color[q + 2] = this.color[p + 2] * fade
      out.blank[j] = this.blank[i]
    }
    out.count = this.count
    return out
  }
}

