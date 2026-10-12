import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { Loader, LoadingManager } from 'three'
import { ILDALoader, ILDA_DEFAULT_PALETTE } from '../src/loaders/ILDALoader.js'

// Node has fetch/Response but does not provide the browser progress event used by FileLoader.
if (typeof ProgressEvent === 'undefined') {
  globalThis.ProgressEvent = class extends Event {
    constructor(type, init) { super(type); Object.assign(this, init) }
  }
}

function record(format, points, { projector = 0, number = 0, name = 'test' } = {}) {
  const size = { 0: 8, 1: 6, 2: 3, 4: 10, 5: 8 }[format]
  const bytes = new Uint8Array(32 + size * points.length), view = new DataView(bytes.buffer)
  bytes.set(new TextEncoder().encode('ILDA')); bytes[7] = format
  bytes.set(new TextEncoder().encode(name).subarray(0, 8), 8)
  view.setUint16(24, points.length); view.setUint16(26, number); bytes[30] = projector
  points.forEach((p, i) => {
    let at = 32 + i * size
    if (format === 2) { bytes.set(p.rgb, at); return }
    view.setInt16(at, p.x ?? 0); view.setInt16(at + 2, p.y ?? 0); at += 4
    if (format === 0 || format === 4) { view.setInt16(at, p.z ?? 0); at += 2 }
    bytes[at++] = (p.blank ? 0x40 : 0) | (i === points.length - 1 ? 0x80 : 0)
    if (format === 0 || format === 1) bytes[at] = p.index ?? 0
    else bytes.set([...p.rgb].reverse(), at)
  })
  return bytes
}
function file(...records) {
  const bytes = new Uint8Array(records.reduce((sum, r) => sum + r.length, 0))
  let at = 0; for (const r of records) { bytes.set(r, at); at += r.length }
  return bytes.buffer
}
const fixture = () => file(record(1, [{ x: 16384, y: -8192 }, { blank: true, index: 24 }]), record(0, []))
function manager() {
  const errors = [], starts = [], progress = []
  let done
  const complete = new Promise(resolve => { done = resolve })
  const value = new LoadingManager(done, (...args) => progress.push(args), url => errors.push(url))
  value.onStart = (...args) => starts.push(args)
  return { value, errors, starts, progress, complete }
}

// All five supported record formats, projector-local palettes, channel order and blanking.
test('parses mixed ILDA formats into independent tracks with normalized typed arrays', () => {
  const data = file(
    record(2, [{ rgb: [0, 0, 0] }, { rgb: [12, 34, 56] }], { projector: 2 }),
    record(0, [{ x: -32768, y: 16384, z: -8192, index: 1, blank: true }], { projector: 2, number: 7 }),
    record(1, [{ x: 8192, index: 1 }], { projector: 0, number: 8 }),
    record(4, [{ x: 32767, z: 16384, rgb: [25, 127, 250] }], { projector: 2, number: 9 }),
    record(5, [{ y: -16384, rgb: [250, 127, 25] }], { projector: 0, number: 10 }),
    record(0, []),
  )
  const show = new ILDALoader().parse(data)
  assert.equal(show.frames.length, 4); assert.equal(show.totalPoints, 4); assert.equal(show.blanked, 1)
  assert.equal(show.bytes, data.byteLength); assert.equal(show.eof, true); assert.equal(show.paletteFallbacks, 0)
  assert.deepEqual([...show.tracks.keys()], [2, 0]); assert.equal(show.tracks.get(2)[0], show.frames[0])
  assert.deepEqual([...show.frames[0].position], [-1, 0.5, -0.25]); assert.equal(show.frames[0].blank[0], 1)
  assert.deepEqual(show.frames[0].color, new Float32Array([12, 34, 56].map(v => v / 255)))
  assert.deepEqual(show.frames[1].color, new Float32Array(ILDA_DEFAULT_PALETTE[1].map(v => v / 255)))
  assert.deepEqual(show.frames[2].color, new Float32Array([25, 127, 250].map(v => v / 255)))
  assert.deepEqual(show.frames[3].color, new Float32Array([250, 127, 25].map(v => v / 255)))
  assert.deepEqual([...show.frames[3].position], [0, -0.5, 0])
  assert.ok(show.frames.every(f => f.position instanceof Float32Array && f.color instanceof Float32Array && f.blank instanceof Uint8Array))
  assert.ok(Number.isFinite(show.parseTimeMs) && show.parseTimeMs >= 0)
})

test('copies optional fallback colors and respects embedded palettes', () => {
  const palette = [[1, 2, 3]], loader = new ILDALoader().setFallbackPalette(palette)
  palette[0][0] = 255
  assert.deepEqual(loader.parse(fixture()).frames[0].color.slice(0, 3), new Float32Array([1, 2, 3].map(v => v / 255)))
  const custom = file(record(2, [{ rgb: [4, 5, 6] }]), record(1, [{}]))
  assert.deepEqual(loader.parse(custom).frames[0].color, new Float32Array([4, 5, 6].map(v => v / 255)))
  const missing = loader.parse(file(record(1, [{ index: 2 }])))
  assert.equal(missing.paletteFallbacks, 1); assert.deepEqual([...missing.frames[0].color], [1, 1, 1])
  assert.equal(loader.setFallbackPalette(null), loader)
  assert.deepEqual([...loader.parse(fixture()).frames[0].color.slice(0, 3)], [1, 0, 0])
  for (const invalid of [[], [[-1, 0, 0]], [[0, 0, 256]], [[0, 0.5, 0]], [[0, 0]], new Array(1), [new Array(3)], 'red']) {
    assert.throws(() => loader.setFallbackPalette(invalid), TypeError)
  }
})

test('rejects malformed input and reports explicit EOF accurately', () => {
  const loader = new ILDALoader(), bytes = fixture()
  assert.throws(() => loader.parse(new Uint8Array(bytes)), /binary ILDA/)
  assert.throws(() => loader.parse(bytes.slice(0, 12)), /Incomplete ILDA header/)
  assert.throws(() => loader.parse(new ArrayBuffer(32)), /Invalid ILDA signature/)
  assert.throws(() => loader.parse(bytes.slice(0, 33)), /middle of a frame/)
  const unsupported = bytes.slice(0); new Uint8Array(unsupported)[7] = 3
  assert.throws(() => loader.parse(unsupported), /Unsupported ILDA format 3/)
  assert.throws(() => loader.parse(file(record(0, []))), /no point frames/)
  assert.equal(loader.parse(file(record(1, [{}]))).eof, false)
  assert.throws(() => loader.parse(new ArrayBuffer(32 * 1024 * 1024 + 1)), /32 MiB/)
})

test('loads the real demo and preserves the prototype-specific palette', async () => {
  const bytes = await readFile(new URL('../examples/public/ilda/sylvest.ild', import.meta.url))
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  const show = new ILDALoader().parse(buffer)
  assert.equal(show.frames.length, 121); assert.equal(show.totalPoints, 96942); assert.equal(show.blanked, 16919)
  const demoPalette = ILDA_DEFAULT_PALETTE.map((rgb, i) => i < 10 ? [55, rgb[1], rgb[2]] : rgb)
  const demo = new ILDALoader().setFallbackPalette(demoPalette).parse(buffer)
  assert.deepEqual(demo.frames.map(f => f.position), show.frames.map(f => f.position))
  assert.deepEqual(demo.frames.map(f => f.blank), show.frames.map(f => f.blank))
  assert.notDeepEqual(demo.frames.map(f => f.color), show.frames.map(f => f.color))
})

test('loadAsync honors path, manager URL modifiers, headers, credentials and progress', async t => {
  const m = manager(), bytes = fixture(), events = [], requests = []
  m.value.setURLModifier(url => url.replace('show.ild', 'resolved.ild'))
  t.mock.method(globalThis, 'fetch', async request => {
    requests.push(request)
    return new Response(bytes, { headers: { 'Content-Length': String(bytes.byteLength) } })
  })
  const loader = new ILDALoader(m.value).setPath('https://ilda.test/assets/').setRequestHeader({ 'X-Test': 'ilda' }).setWithCredentials(true)
  assert.ok(loader instanceof Loader)
  const show = await loader.loadAsync('show.ild', event => events.push(event))
  await m.complete
  assert.equal(show.totalPoints, 2); assert.equal(requests.length, 1)
  assert.equal(requests[0].url, 'https://ilda.test/assets/resolved.ild')
  assert.equal(requests[0].headers.get('X-Test'), 'ilda'); assert.equal(requests[0].credentials, 'include')
  assert.equal(events.at(-1).loaded, bytes.byteLength); assert.equal(events.at(-1).total, bytes.byteLength)
  assert.equal(m.starts.length, 1); assert.equal(m.progress.at(-1)[1], m.progress.at(-1)[2]); assert.deepEqual(m.errors, [])
})

test('callback load delivers parsed data and supports simultaneous requests', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(fixture()))
  const m = manager(), loader = new ILDALoader(m.value)
  const first = new Promise((resolve, reject) => loader.load('https://ilda.test/first.ild', resolve, undefined, reject))
  const second = loader.loadAsync('https://ilda.test/second.ild')
  const [a, b] = await Promise.all([first, second]); await m.complete
  assert.equal(a.totalPoints, 2); assert.equal(b.totalPoints, 2)
  assert.notEqual(a.frames[0].position, b.frames[0].position)
  assert.deepEqual(m.errors, []); assert.equal(m.progress.at(-1)[1], 2)
})

test('reports parsing failures once to callbacks and LoadingManager', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(new ArrayBuffer(32)))
  const m = manager(), loader = new ILDALoader(m.value)
  let successes = 0, failures = 0
  const error = await new Promise(resolve => loader.load('https://ilda.test/invalid.ild', () => successes++, undefined, e => { failures++; resolve(e) }))
  await m.complete
  assert.match(error.message, /Invalid ILDA signature/); assert.equal(successes, 0); assert.equal(failures, 1)
  assert.deepEqual(m.errors, ['https://ilda.test/invalid.ild']); assert.equal(m.progress.length, 1)
})

test('loadAsync rejects both HTTP and parser errors without hanging the manager', async t => {
  for (const [url, response, expected] of [
    ['missing', () => new Response('Missing', { status: 404 }), /404/],
    ['broken', () => new Response(new ArrayBuffer(32)), /Invalid ILDA signature/],
  ]) {
    const m = manager()
    t.mock.method(globalThis, 'fetch', async () => response())
    await assert.rejects(new ILDALoader(m.value).loadAsync(`https://ilda.test/${url}.ild`), expected)
    await m.complete
    assert.equal(m.errors.length, 1); assert.equal(m.progress.length, 1)
  }
})
