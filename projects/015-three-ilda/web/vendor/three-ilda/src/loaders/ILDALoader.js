import { FileLoader, Loader } from 'three'

const MAX_FILE_BYTES = 32 * 1024 * 1024, MAX_POINTS = 2_000_000
const FORMAT_SIZE = { 0: 8, 1: 6, 2: 3, 4: 10, 5: 8 }
const HEADER = 32

/**
 * @typedef {Object} ILDAFrame
 * @property {number} number Frame number from the file.
 * @property {string} name Frame name from the file.
 * @property {number} projector Projector ID from the file (zero-based).
 * @property {number} count Number of points.
 * @property {Float32Array} position Interleaved XYZ, normalized by 32768. Z is zero for 2D formats.
 * @property {Float32Array} color Interleaved RGB in [0, 1], including colors of blanked points.
 * @property {Uint8Array} blank One flag per point: 1 means laser off.
 */

/**
 * @typedef {Object} ILDAAsset
 * @property {ILDAFrame[]} frames Point frames in file order; palette records are not frames.
 * @property {Map<number, ILDAFrame[]>} tracks Frames grouped by projector ID, sharing objects with frames.
 * @property {number} totalPoints Total number of points in all tracks.
 * @property {number} blanked Number of blanked points.
 * @property {number} paletteFallbacks Number of unknown palette indices rendered in white.
 * @property {boolean} eof Whether an explicit end-of-file record was found.
 * @property {number} bytes Input size in bytes.
 * @property {number} parseTimeMs CPU parsing time; excludes downloading and local file reading.
 */

/**
 * ILDA IDTF loader for formats 0, 1, 2, 4 and 5. No renderer, DOM or player dependency.
 * Uses the standard Three.js LoadingManager, FileLoader and inherited loadAsync().
 *
 * @example
 * const loader = new ILDALoader(manager);
 * const show = await loader.loadAsync('/shows/example.ild');
 * const localShow = loader.parse(await file.arrayBuffer());
 *
 * @extends Loader
 */
export class ILDALoader extends Loader {
  /** @param {import('three').LoadingManager} [manager] */
  constructor(manager) {
    super(manager)
    this.fallbackPalette = ILDA_DEFAULT_PALETTE
  }

  /**
   * Sets colors for indexed files without a format-2 palette. Embedded palettes always win.
   * Copies the array; pass null to restore the standard ILDA palette.
   * @param {ReadonlyArray<ReadonlyArray<number>> | null} palette Between 1 and 256 RGB triplets of integer bytes.
   * @returns {ILDALoader}
   */
  setFallbackPalette(palette) {
    if (palette === null) { this.fallbackPalette = ILDA_DEFAULT_PALETTE; return this }
    if (!Array.isArray(palette) || !palette.length || palette.length > 256 || Array.from(palette).some(rgb =>
      !Array.isArray(rgb) || rgb.length !== 3 || Array.from(rgb).some(v => !Number.isInteger(v) || v < 0 || v > 255))) {
      throw new TypeError('Expected 1–256 RGB triplets with integer values from 0 to 255.')
    }
    this.fallbackPalette = Object.freeze(palette.map(rgb => Object.freeze([...rgb])))
    return this
  }

  /**
   * @param {string} url URL or path, resolved by the loading manager.
   * @param {(asset: ILDAAsset) => void} onLoad
   * @param {(event: ProgressEvent) => void} [onProgress]
   * @param {(error: Error) => void} [onError] Receives download and parsing errors.
   */
  load(url, onLoad, onProgress, onError) {
    const loader = new FileLoader(this.manager)
    loader.setPath(this.path)
    loader.setResponseType('arraybuffer')
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)
    loader.load(url, buffer => {
      try {
        const asset = this.parse(buffer)
        if (onLoad) onLoad(asset)
      } catch (error) {
        if (onError) onError(error)
        else console.error(error)
        this.manager.itemError(url)
      }
    }, onProgress, onError)
  }

  /**
   * Parses already-loaded bytes synchronously. Does not create geometry or apply scanner settings.
   * @param {ArrayBuffer} buffer
   * @returns {ILDAAsset}
   * @throws {Error} On invalid data, unsupported formats or the 32 MiB / 2M point limits.
   */
  parse(buffer) {
    const start = performance.now()
    const asset = parseILDA(buffer, this.fallbackPalette)
    asset.parseTimeMs = performance.now() - start
    return asset
  }
}

// ILDA IDTF revision 011, appendix A. A file's format-2 palette overrides this per projector.
function defaultPalette() {
  const p = []
  for (let i = 0; i < 16; i++) p.push([255, i * 16, 0])
  p.push([255, 255, 0]); for (let i = 7; i > 0; i--) p.push([i * 32, 255, 0])
  p.push([0, 255, 0]); for (const v of [36, 73, 109, 146, 182, 219, 255]) p.push([0, 255, v])
  for (const v of [227, 198, 170, 142, 113, 85, 56, 28, 0]) p.push([0, v, 255])
  for (const v of [32, 64, 96, 128, 160, 192, 224, 255]) p.push([v, 0, 255])
  for (const v of [32, 64, 96, 128, 160, 192, 224, 255]) p.push([255, v, 255])
  for (const v of [224, 192, 160, 128, 96, 64, 32]) p.push([255, v, v])
  return p
}
export const ILDA_DEFAULT_PALETTE = Object.freeze(defaultPalette().map(rgb => Object.freeze(rgb)))

/** One DataView and a cursor: no repeated copies of the remaining file. Returns all projector tracks. */
function parseILDA(buffer, fallbackPalette) {
  if (!(buffer instanceof ArrayBuffer)) throw new Error('Expected a binary ILDA file.')
  if (buffer.byteLength > MAX_FILE_BYTES) throw new Error('ILDALoader supports files up to 32 MiB.')
  const v = new DataView(buffer), text = new TextDecoder('ascii'), palettes = new Map(), tracks = new Map(), frames = []
  let offset = 0, totalPoints = 0, blanked = 0, paletteFallbacks = 0, eof = false
  while (offset < v.byteLength) {
    if (offset + HEADER > v.byteLength) throw new Error(`Incomplete ILDA header at byte ${offset}.`)
    if (v.getUint32(offset) !== 0x494c4441) throw new Error(`Invalid ILDA signature at byte ${offset}.`)
    const format = v.getUint8(offset + 7), count = v.getUint16(offset + 24), projector = v.getUint8(offset + 30)
    const size = FORMAT_SIZE[format]
    if (!size) throw new Error(`Unsupported ILDA format ${format}. Supported formats: 0, 1, 2, 4 and 5.`)
    const number = v.getUint16(offset + 26), name = text.decode(new Uint8Array(buffer, offset + 8, 8)).replace(/\0/g, '').trim()
    offset += HEADER
    if (format !== 2 && count === 0) { eof = true; break }
    if (offset + count * size > v.byteLength) throw new Error('The ILDA file ends in the middle of a frame.')
    if (format === 2) {
      if (count > 256 || count === 0) throw new Error('Invalid ILDA palette size.')
      const palette = []
      for (let i = 0; i < count; i++, offset += 3) palette.push([v.getUint8(offset), v.getUint8(offset + 1), v.getUint8(offset + 2)])
      palettes.set(projector, palette); continue
    }
    totalPoints += count
    if (totalPoints > MAX_POINTS) throw new Error('ILDALoader supports up to 2,000,000 points.')
    const position = new Float32Array(count * 3), color = new Float32Array(count * 3), blank = new Uint8Array(count)
    const palette = palettes.get(projector) || fallbackPalette, is3D = format === 0 || format === 4, indexed = format === 0 || format === 1
    for (let i = 0; i < count; i++, offset += size) {
      const j = i * 3, statusAt = offset + (is3D ? 6 : 4)
      position[j] = v.getInt16(offset) / 32768; position[j + 1] = v.getInt16(offset + 2) / 32768
      position[j + 2] = is3D ? v.getInt16(offset + 4) / 32768 : 0
      blank[i] = (v.getUint8(statusAt) & 0x40) !== 0 ? 1 : 0; blanked += blank[i]
      if (indexed) {
        const rgb = palette[v.getUint8(statusAt + 1)]
        if (!rgb) paletteFallbacks++
        color[j] = (rgb?.[0] ?? 255) / 255; color[j + 1] = (rgb?.[1] ?? 255) / 255; color[j + 2] = (rgb?.[2] ?? 255) / 255
      } else { // true-color point records store B, G, R; palette records store R, G, B
        color[j] = v.getUint8(statusAt + 3) / 255; color[j + 1] = v.getUint8(statusAt + 2) / 255; color[j + 2] = v.getUint8(statusAt + 1) / 255
      }
    }
    const frame = { number, name, projector, count, position, color, blank }
    frames.push(frame); if (!tracks.has(projector)) tracks.set(projector, []); tracks.get(projector).push(frame)
  }
  if (!frames.length) throw new Error('The file contains no point frames.')
  return { frames, tracks, totalPoints, blanked, paletteFallbacks, eof, bytes: buffer.byteLength }
}
