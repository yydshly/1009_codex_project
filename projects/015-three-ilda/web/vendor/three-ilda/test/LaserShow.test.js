import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Scene, PerspectiveCamera, Vector3 } from 'three'
import * as webgpu from '../src/index.js'
import * as webgl from '../src/webgl.js'

function asset(blank = [0, 0, 0, 0]) {
  const f = { count: 4, position: new Float32Array([-0.8, -0.5, 0, 0.7, -0.5, 0, 0.6, 0.7, 0, -0.6, 0.7, 0]), color: new Float32Array(12).fill(1), blank: new Uint8Array(blank) }
  return { frames: [f], tracks: new Map([[0, [f]], [2, [f]]]) }
}
const fakeRenderer = { toneMapping: 0, outputColorSpace: 'srgb-linear' }

test('scanner motion and persistence are independent of display frame rate', () => {
  const { LaserScanner, SCANNER_DEFAULTS } = webgpu
  const data = asset(), results = []
  for (const fps of [30, 60, 120]) {
    const scanner = new LaserScanner(data.frames)
    for (let i = 0; i < fps; i++) scanner.advance(1 / fps, SCANNER_DEFAULTS)
    results.push(scanner)
  }
  for (const scanner of results) assert.equal(scanner.samples, 8000)
  for (let i = 1; i < results.length; i++) {
    const a = results[0].snapshot(0.95), b = results[i].snapshot(0.95)
    assert.deepEqual(a.position, b.position)
    for (let j = 0; j < a.color.length; j++) assert.ok(Math.abs(a.color[j] - b.color[j]) < 1e-6)
  }
})

// The CPU side is shared; both entries must behave identically.
for (const [entry, { LaserShow }] of [['three-ilda', webgpu], ['three-ilda/webgl', webgl]]) {
  test(`${entry}: scene instances share data but own playback and GPU buffers`, () => {
    const data = asset(), a = new LaserShow(data), b = new LaserShow(data)
    assert.equal(a.asset, b.asset); assert.notEqual(a.scanner, b.scanner)
    assert.notEqual(a.projection.geometry, b.projection.geometry)
    assert.notEqual(a.projection.geometry.attributes.position.array, b.projection.geometry.attributes.position.array)
    assert.notEqual(a.projection.material, b.projection.material)
    b.playing = false; const pausedTime = b.time; a.update(0.1); b.update(0.1)
    assert.equal(b.time, pausedTime); assert.ok(a.time > b.time)
    a.position.set(2, 3, 4); a.scale.setScalar(2); a.updateMatrixWorld(true)
    assert.deepEqual(a.localToWorld(new Vector3()).toArray(), [2, 3, 4])
    a.dispose(); b.update(0); assert.equal(b.disposed, false)
    assert.equal(data.frames[0].position[0], Math.fround(-0.8)); b.dispose()
  })

  test(`${entry}: no projection segments or beam sheets cross blanked travel points`, () => {
    const show = new LaserShow(asset([0, 1, 0, 0]))
    show.playing = false; show.blankingOffset = 0; show.beamMode = 'Front'; show.seekFrame(0)
    assert.equal(show.projection.geometry.drawRange.count, 2)
    assert.equal(show.beams.geometry.drawRange.count, 3)
    const data = show.beams.geometry.attributes.position.array
    assert.deepEqual([...data.slice(0, 3)], [0, 0, 0])
    show.dispose()
  })

  test(`${entry}: beam sides follow the local projection plane and Disabled stops beam uploads`, () => {
    const show = new LaserShow(asset()); show.playing = false
    show.beamMode = 'Front'; show.update(0); assert.ok(show.projector.position.z > 0)
    show.beamMode = 'Back'; show.update(0); assert.ok(show.projector.position.z < 0)
    show.beamMode = 'Disabled'; const version = show.beams.geometry.attributes.position.version
    show.playing = true; show.update(0.1)
    assert.equal(show.beams.visible, false); assert.equal(show.beams.geometry.attributes.position.version, version)
    assert.throws(() => { show.beamMode = 'Other' }, /beamMode/)
    show.dispose()
  })

  test(`${entry}: uniforms follow the setters and the projector`, () => {
    const show = new LaserShow(asset()); show.playing = false
    show.setProjectionSize(4, 2); show.zoom = 0.5; show.intensity = 2; show.beamIntensity = 1.5
    show.projector.position.set(1, 2, 3); show.update(0)
    assert.deepEqual(show._scale.value.toArray(), [1, 0.5, 0])
    assert.equal(show._intensity.value, 2); assert.equal(show._beamIntensity.value, 1.5)
    assert.deepEqual(show._origin.value.toArray(), [1, 2, 3])
    show.dispose()
  })

  test(`${entry}: parameter validation, seeking, track switching and disposal preserve ownership`, () => {
    const data = asset(), show = new LaserShow(data)
    assert.throws(() => new LaserShow(data, { capacity: 1 }), /capacity/)
    assert.throws(() => { show.pointRate = NaN }, /pointRate/)
    assert.throws(() => show.update(-1), /delta/)
    assert.throws(() => show.seekFrame(10), /frame/)
    assert.throws(() => show.setTrack(1), /does not exist/)
    assert.equal(show.setTrack(2), show); assert.equal(show.track, 2)
    show.playing = false; show.lightDecay = 0; show.update(0)
    const version = show.projection.geometry.attributes.position.version
    show.gain = 0.8; show.update(0); assert.ok(show.projection.geometry.attributes.position.version > version)
    let disposals = 0; show.projection.geometry.addEventListener('dispose', () => disposals++)
    show.dispose(); show.dispose(); assert.equal(disposals, 1)
    assert.throws(() => show.setData(data), /disposed/)
    assert.equal(data.frames[0].count, 4)
  })

  test(`${entry}: Object3D clone preserves the visible state with independent playback and geometry`, () => {
    const source = new LaserShow(asset(), { capacity: 128 })
    source.beamMode = 'Back'; source.update(0.1); source.playing = false; source.position.set(1, 2, 3)
    const clone = source.clone()
    assert.equal(clone.asset, source.asset); assert.equal(clone.time, source.time)
    assert.equal(clone.children.length, source.children.length); assert.deepEqual(clone.position.toArray(), [1, 2, 3])
    assert.notEqual(clone.projection.material, source.projection.material)
    assert.deepEqual(clone.projection.geometry.attributes.position.array, source.projection.geometry.attributes.position.array)
    assert.equal(clone.beamMode, 'Back'); clone.playing = true; clone.update(0.02)
    assert.notEqual(clone.time, source.time); source.dispose(); clone.update(0.01); clone.dispose()
  })
}

test('three-ilda: node pipeline restores layers and material state when removed or disposed', () => {
  // Creating the graph is independent of a device; shader execution is checked in the browser (examples/validation-webgpu.html, validation-webgl.html).
  const scene = new Scene(), camera = new PerspectiveCamera(), show = new webgpu.LaserShow(asset())
  scene.add(show); show.beams.layers.enable(3)
  const mask = show.beams.layers.mask
  const pipeline = new webgpu.LaserShowPipeline(fakeRenderer, scene, camera)
  pipeline.add(show); assert.equal(show.beams.layers.mask, 2 ** 31)
  assert.ok(show.beams.material.opacityNode)
  pipeline.remove(show); assert.equal(show.beams.layers.mask, mask); assert.equal(show.beams.material.opacityNode, null)
  pipeline.add(show); show.dispose(); assert.equal(pipeline.shows.size, 0)
  pipeline.dispose(); pipeline.dispose()
})

test('three-ilda/webgl: pipeline installs the depth fade and restores the material when removed or disposed', () => {
  const scene = new Scene(), camera = new PerspectiveCamera(), show = new webgl.LaserShow(asset())
  scene.add(show); show.beams.layers.enable(3)
  const mask = show.beams.layers.mask, material = show.beams.material, original = material.uniforms.tDepth
  const pipeline = new webgl.LaserShowPipeline(fakeRenderer, scene, camera)
  pipeline.add(show)
  assert.equal(show.beams.layers.mask, 2 ** 31); assert.equal(material.defines.DEPTH_FADE, '')
  assert.equal(material.uniforms.tDepth.value, pipeline.sceneTarget.depthTexture)
  pipeline.remove(show)
  assert.equal(show.beams.layers.mask, mask); assert.equal('DEPTH_FADE' in material.defines, false); assert.equal(material.uniforms.tDepth, original)
  pipeline.add(show); show.dispose(); assert.equal(pipeline.shows.size, 0)
  pipeline.dispose(); pipeline.dispose()
})

test('each pipeline rejects shows built for the other renderer', () => {
  const scene = new Scene(), camera = new PerspectiveCamera(), gpu = new webgpu.LaserShow(asset()), gl = new webgl.LaserShow(asset())
  assert.throws(() => new webgpu.LaserShowPipeline(fakeRenderer, scene, camera).add(gl), /three-ilda\/webgl/)
  assert.throws(() => new webgl.LaserShowPipeline(fakeRenderer, scene, camera).add(gpu), /three-ilda\/webgl/)
  gpu.dispose(); gl.dispose()
})
