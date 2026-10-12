import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Group, LineSegments, Mesh, Object3D, Vector2 } from 'three'
import { LaserScanner, SCANNER_DEFAULTS, TRAIL_POINTS } from './LaserScanner.js'

function number(value, min, max, name) {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`${name} must be between ${min} and ${max}.`)
  return value
}
function dynamic(size, width = 3) { return new BufferAttribute(new Float32Array(size), width).setUsage(DynamicDrawUsage) }
function upload(attribute, size) {
  attribute.clearUpdateRanges()
  if (size) { attribute.addUpdateRange(0, size); attribute.needsUpdate = true }
}

/** @typedef {import('../loaders/ILDALoader.js').ILDAAsset} ILDAAsset */
/** @typedef {'Disabled' | 'Front' | 'Back'} BeamMode */
/**
 * @typedef {Object} LaserShowOptions
 * @property {number} [track] Projector track to play; defaults to the first track of the asset.
 * @property {number} [capacity] Trail length in samples, 2 to 65536 (default 2048).
 * @property {number} [width] Projection width in local units at zoom 1 (default 4.8).
 * @property {number} [height] Projection height in local units at zoom 1 (default 3.2).
 */

/**
 * Renderer-independent part of a laser show: scene graph, scanner playback, segment compaction and buffer uploads.
 * The image lies in local XY at Z=0; Front is +Z, Back is -Z, regardless of the camera.
 * One instance plays one ILDA projector track. Assets may be shared; playback/GPU buffers are independent.
 * A subclass supplies the two materials through _createMaterials(); the uniform handles it returns only need a `.value`.
 */
export class LaserShowBase extends Group {
  /**
   * @param {ILDAAsset | null} [asset] Parsed ILDA file; call setData() later when omitted.
   * @param {LaserShowOptions} [options]
   */
  constructor(asset = null, { track, capacity = TRAIL_POINTS, width = 4.8, height = 3.2 } = {}) {
    super()
    if (!Number.isInteger(capacity) || capacity < 2 || capacity > 65536) throw new RangeError('capacity must be an integer from 2 to 65536.')
    this.type = 'LaserShow'; this.name = 'ILDA laser show'; this.isLaserShow = true
    this.capacity = capacity; this.playing = true; this.disposed = false
    /** @type {import('./LaserScanner.js').ScannerParams} */
    this._params = { ...SCANNER_DEFAULTS }
    /** @type {BeamMode} */
    this._beamMode = 'Disabled'
    this._zoom = 1; this._dirty = true
    /** @type {ILDAAsset | null} */ this.asset = null
    /** @type {number | undefined} */ this.track = undefined
    /** @type {LaserScanner | null} */ this.scanner = null
    this._projectionSize = new Vector2(width, height)
    const { line, beam, scale, origin, clock, intensity, beamIntensity } = this._createMaterials()
    this._scale = scale; this._origin = origin; this._clock = clock; this._intensity = intensity; this._beamIntensity = beamIntensity
    this.projector = new Object3D(); this.projector.name = 'Projector aperture'; this.projector.position.set(-2.2, -1.4, 3)
    this.add(this.projector)

    const segments = capacity - 1
    this._linePosition = dynamic(segments * 6); this._lineColor = dynamic(segments * 6)
    const lineGeometry = new BufferGeometry()
    lineGeometry.setAttribute('position', this._linePosition); lineGeometry.setAttribute('color', this._lineColor); lineGeometry.setDrawRange(0, 0)
    this.projection = new LineSegments(lineGeometry, line)
    this.projection.name = 'Laser projection'; this.projection.frustumCulled = false
    this.add(this.projection)

    this._beamPosition = dynamic(segments * 9); this._beamColor = dynamic(segments * 9)
    const along = new Float32Array(segments * 3)
    for (let i = 0; i < along.length; i += 3) { along[i + 1] = 1; along[i + 2] = 1 }
    const beamGeometry = new BufferGeometry()
    beamGeometry.setAttribute('position', this._beamPosition); beamGeometry.setAttribute('color', this._beamColor)
    beamGeometry.setAttribute('beamAlong', new BufferAttribute(along, 1)); beamGeometry.setDrawRange(0, 0)
    this.beams = new Mesh(beamGeometry, beam); this.beams.name = 'Soft projector beams'
    this.beams.frustumCulled = false; this.beams.visible = false; this.add(this.beams)
    this.setProjectionSize(width, height)
    if (asset) this.setData(asset, track)
  }

  /**
   * Creates the line and beam materials for one renderer family.
   * @returns {{ line: import('three').Material, beam: import('three').Material, scale: { value: import('three').Vector3 }, origin: { value: import('three').Vector3 }, clock: { value: number }, intensity: { value: number }, beamIntensity: { value: number } }}
   */
  _createMaterials() { throw new Error('LaserShowBase is abstract: use the LaserShow of the three-ilda or three-ilda/webgl entry.') }

  get pointRate() { return this._params.rate }
  set pointRate(v) { this._params.rate = number(v, 1, 100000, 'pointRate') }
  get gain() { return this._params.gain }
  set gain(v) { this._params.gain = number(v, 0.001, 2, 'gain'); this._retune() }
  get dampening() { return this._params.dampening }
  set dampening(v) { this._params.dampening = number(v, 0, 1, 'dampening'); this._retune() }
  get blankingOffset() { return this._params.blankingOffset }
  set blankingOffset(v) { this._params.blankingOffset = Math.round(number(v, -100, 100, 'blankingOffset')); this._retune() }
  get lightDecay() { return this._params.lightDecay }
  set lightDecay(v) { this._params.lightDecay = number(v, 0, 1, 'lightDecay'); this._dirty = true }
  get zoom() { return this._zoom }
  set zoom(v) { this._zoom = number(v, 0, 4, 'zoom'); this._updateScale() }
  get intensity() { return this._intensity.value }
  set intensity(v) { this._intensity.value = number(v, 0, 100, 'intensity') }
  get beamIntensity() { return this._beamIntensity.value }
  set beamIntensity(v) { this._beamIntensity.value = number(v, 0, 2, 'beamIntensity') }
  get beamMode() { return this._beamMode }
  /** @param {BeamMode} mode */
  set beamMode(mode) {
    if (!['Disabled', 'Front', 'Back'].includes(mode)) throw new RangeError('beamMode must be Disabled, Front or Back.')
    this._beamMode = mode; this.beams.visible = mode !== 'Disabled'
    if (mode !== 'Disabled') this.projector.position.z = Math.max(0.1, Math.abs(this.projector.position.z)) * (mode === 'Front' ? 1 : -1)
    this._dirty = true
  }
  get frame() { return this.scanner?.lastFrame ?? 0 }
  get frameCount() { return this.scanner?.frames.length ?? 0 }
  get time() { return this.scanner?.time ?? 0 }
  get trackIds() { return this.asset ? [...this.asset.tracks.keys()] : [] }
  get projectionSize() { return this._projectionSize.clone() }

  /** @param {number} width @param {number} height @returns {this} */
  setProjectionSize(width, height) {
    this._projectionSize.set(number(width, 0.001, 10000, 'width'), number(height, 0.001, 10000, 'height'))
    this._updateScale(); return this
  }
  _updateScale() { this._scale.value.set(this._projectionSize.x * this.zoom / 2, this._projectionSize.y * this.zoom / 2, 0) }
  _retune() {
    if (this.scanner && !this.playing) this.scanner.seekFrame(this.frame, this._params)
    this._dirty = true
  }
  /**
   * Replaces the played file, building a fresh scanner for one projector track.
   * @param {ILDAAsset} asset
   * @param {number} [track] Defaults to the first track of the asset.
   * @returns {this}
   */
  setData(asset, track = asset.tracks.keys().next().value) {
    if (this.disposed) throw new Error('LaserShow has been disposed.')
    const frames = asset?.tracks?.get(track)
    if (!frames?.length) throw new Error(`ILDA track ${track} does not exist.`)
    const scanner = new LaserScanner(frames, this.capacity)
    this.asset = asset; this.track = track; this.scanner = scanner
    this.scanner.seekFrame(0, this._params); this._dirty = true; this.update(0)
    return this
  }
  /** @param {number} track @returns {this} */
  setTrack(track) { return this.setData(this.asset, track) }
  /** @param {number} frame @returns {this} */
  seekFrame(frame) {
    if (!this.scanner) return this
    number(frame, 0, this.frameCount - 1, 'frame')
    this.scanner.seekFrame(Math.floor(frame), this._params); this._dirty = true; this.update(0)
    return this
  }
  reset() { if (this.scanner) { this.scanner.reset(); this._dirty = true; this.update(0) } return this }

  /**
   * Advances playback and uploads the trail. Call once per application frame, including while paused to apply parameter changes.
   * @param {number} [delta] Seconds since the previous call.
   * @returns {this}
   */
  update(delta = 0) {
    if (this.disposed || !this.scanner) return this
    if (!Number.isFinite(delta) || delta < 0) throw new RangeError('delta must be a finite non-negative number.')
    if (this.playing && delta > 0) { this.scanner.advance(delta, this._params); this._dirty = true }
    this._origin.value.copy(this.projector.position); this._clock.value = this.time
    if (!this._dirty) return this
    const out = this.scanner.snapshot(this.lightDecay)
    const lp = this._linePosition.array, lc = this._lineColor.array, bp = this._beamPosition.array, bc = this._beamColor.array
    let lineSize = 0, beamSize = 0
    for (let i = 1; i < out.count; i++) {
      if (out.blank[i - 1] || out.blank[i]) continue
      const a = (i - 1) * 3, b = i * 3
      if (Math.max(out.color[a], out.color[a + 1], out.color[a + 2], out.color[b], out.color[b + 1], out.color[b + 2]) < 0.001) continue
      for (let j = 0; j < 3; j++) {
        lp[lineSize + j] = out.position[a + j]; lp[lineSize + 3 + j] = out.position[b + j]
        lc[lineSize + j] = out.color[a + j]; lc[lineSize + 3 + j] = out.color[b + j]
      }
      lineSize += 6
      if (!this.beams.visible) continue
      for (let j = 0; j < 3; j++) {
        bp[beamSize + j] = 0; bp[beamSize + 3 + j] = out.position[a + j]; bp[beamSize + 6 + j] = out.position[b + j]
        const color = (out.color[a + j] + out.color[b + j]) * 0.5
        bc[beamSize + j] = color; bc[beamSize + 3 + j] = color; bc[beamSize + 6 + j] = color
      }
      beamSize += 9
    }
    this.projection.geometry.setDrawRange(0, lineSize / 3)
    upload(this._linePosition, lineSize); upload(this._lineColor, lineSize)
    if (this.beams.visible) {
      this.beams.geometry.setDrawRange(0, beamSize / 3)
      upload(this._beamPosition, beamSize); upload(this._beamColor, beamSize)
    }
    this._dirty = false; return this
  }

  /**
   * Clone shares the immutable asset, but copies scanner history and allocates independent GPU resources.
   * @param {boolean} [recursive]
   * @returns {this}
   */
  clone(recursive = true) {
    return new this.constructor(null, { capacity: this.capacity, width: this._projectionSize.x, height: this._projectionSize.y }).copy(this, recursive)
  }
  /** @param {LaserShowBase} source @param {boolean} [recursive] @returns {this} */
  copy(source, recursive = true) {
    if (this.disposed || source.disposed) throw new Error('Cannot copy a disposed LaserShow.')
    if (this.capacity !== source.capacity) throw new Error('copy() requires matching trail capacities; use clone() to preserve capacity.')
    super.copy(source, false)
    this._params = { ...source._params }; this.playing = source.playing
    this.setProjectionSize(source._projectionSize.x, source._projectionSize.y)
    this.zoom = source.zoom; this.intensity = source.intensity; this.beamIntensity = source.beamIntensity; this.beamMode = source.beamMode
    this.projector.position.copy(source.projector.position)
    this.projection.visible = source.projection.visible; this.beams.visible = source.beams.visible
    if (source.asset) {
      this.setData(source.asset, source.track)
      for (const key of ['frame', 'index', 'lastFrame', 'time', 'fraction', 'write', 'count', 'samples', 'x', 'y', 'vx', 'vy']) this.scanner[key] = source.scanner[key]
      for (const key of ['position', 'color', 'blank', 'born']) this.scanner[key].set(source.scanner[key])
    } else {
      this.asset = null; this.scanner = null; this.track = undefined
      this.projection.geometry.setDrawRange(0, 0); this.beams.geometry.setDrawRange(0, 0)
    }
    for (const child of [...this.children]) if (![this.projector, this.projection, this.beams].includes(child)) this.remove(child)
    if (recursive) for (const child of source.children) if (![source.projector, source.projection, source.beams].includes(child)) this.add(child.clone())
    this._dirty = true; this.update(0); return this
  }

  /** Releases only this instance's GPU resources; shared ILDA data stays usable. */
  dispose() {
    if (this.disposed) return
    this.projection.geometry.dispose(); this.projection.material.dispose()
    this.beams.geometry.dispose(); this.beams.material.dispose()
    this.disposed = true; this.dispatchEvent({ type: 'dispose' })
  }
}
