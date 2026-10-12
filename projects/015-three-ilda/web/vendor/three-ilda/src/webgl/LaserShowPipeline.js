import { Color, DepthTexture, HalfFloatType, Layers, NoBlending, ShaderMaterial, Vector2, WebGLRenderTarget } from 'three'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

const QUAD_VERTEX = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

// Separable Gaussian with sigma 3 texels, the GaussianBlurNode settings of the node pipeline.
function blurFragment(sigma = 3, radius = 8) {
  const weights = []; let sum = 0
  for (let i = 0; i <= radius; i++) { const w = Math.exp(-(i * i) / (2 * sigma * sigma)); weights.push(w); sum += i ? 2 * w : w }
  const taps = weights.map((w, i) => i
    ? `sum += (texture2D(tDiffuse, vUv + direction * ${i}.0) + texture2D(tDiffuse, vUv - direction * ${i}.0)) * ${(w / sum).toFixed(6)};`
    : `vec4 sum = texture2D(tDiffuse, vUv) * ${(w / sum).toFixed(6)};`)
  return /* glsl */`
uniform sampler2D tDiffuse;
uniform vec2 direction;
varying vec2 vUv;
void main() {
  ${taps.join('\n  ')}
  gl_FragColor = sum;
}`
}

const COMPOSITE_FRAGMENT = /* glsl */`
uniform sampler2D tScene, tBeams;
uniform float haze;
varying vec2 vUv;
void main() {
  vec4 scene = texture2D(tScene, vUv);
  vec3 beams = texture2D(tBeams, vUv).rgb;
  float protect = 1.0 - smoothstep(0.025, 0.3, max(scene.r, max(scene.g, scene.b)));
  gl_FragColor = vec4(scene.rgb + (1.0 - exp(-beams)) * 0.14 * protect * haze, scene.a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

/** @typedef {import('../core/LaserShowBase.js').LaserShowBase} LaserShowBase */
/**
 * @typedef {Object} LaserShowPipelineOptions
 * @property {number} [beamLayer] Layer reserved for beam meshes, 1 to 31 (default 31).
 * @property {number} [strength] Bloom strength (default 15).
 * @property {number} [radius] Bloom radius (default 1).
 * @property {number} [threshold] Bloom luminance threshold (default 0).
 * @property {number} [samples] MSAA samples of the scene pass (default 4).
 */

/**
 * Post-processing for THREE.WebGLRenderer (the WebGL 2 version) with the same structure as the node pipeline:
 * scene pass with a depth texture, bloom, a half-resolution beam pass faded by scene depth, blur and haze compositing.
 * Uses the host's scene and camera; reserves beamLayer (default 31) for registered beam meshes.
 */
export class LaserShowPipeline {
  /**
   * @param {import('three').WebGLRenderer} renderer
   * @param {import('three').Scene} scene
   * @param {import('three').Camera} camera
   * @param {LaserShowPipelineOptions} [options]
   */
  constructor(renderer, scene, camera, { beamLayer = 31, strength = 15, radius = 1, threshold = 0, samples = 4 } = {}) {
    if (!Number.isInteger(beamLayer) || beamLayer < 1 || beamLayer > 31) throw new RangeError('beamLayer must be an integer from 1 to 31.')
    this.renderer = renderer; this.scene = scene; this.camera = camera; this.beamLayer = beamLayer
    /** @type {Map<LaserShowBase, { mask: number, uniforms: Record<string, { value: unknown }>, onDispose: () => void }>} */
    this.shows = new Map()
    this.disposed = false
    this._size = new Vector2(); this._clear = new Color(); this._beamLayers = new Layers(); this._beamLayers.set(beamLayer)
    this.sceneTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples, depthTexture: new DepthTexture(1, 1) })
    this.beamTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false })
    this.blurTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false })
    this.glow = new UnrealBloomPass(new Vector2(1, 1), strength, radius, threshold)
    // UnrealBloomPass scales its composite by 3 "for backwards compatibility"; the TSL BloomNode does not.
    // Drop the factor so glow.strength means the same in both versions (measured before this: WebGL 2 at 5 matched TSL at 15).
    const composite = this.glow.compositeMaterial
    if (composite.fragmentShader.includes('3.0 * bloomStrength')) { composite.fragmentShader = composite.fragmentShader.replace('3.0 * bloomStrength', 'bloomStrength'); composite.needsUpdate = true }
    this._blur = new FullScreenQuad(new ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, direction: { value: new Vector2() } },
      vertexShader: QUAD_VERTEX, fragmentShader: blurFragment(), depthTest: false, depthWrite: false, blending: NoBlending,
    }))
    this._composite = new FullScreenQuad(new ShaderMaterial({
      uniforms: { tScene: { value: this.sceneTarget.texture }, tBeams: { value: this.beamTarget.texture }, haze: { value: 0 } },
      vertexShader: QUAD_VERTEX, fragmentShader: COMPOSITE_FRAGMENT, depthTest: false, depthWrite: false, blending: NoBlending,
    }))
    // Shared by every registered beam material and refreshed on each render.
    this._depth = {
      tDepth: { value: this.sceneTarget.depthTexture }, resolution: { value: new Vector2(1, 1) },
      cameraNear: { value: camera.near }, cameraFar: { value: camera.far }, orthographic: { value: camera.isOrthographicCamera === true },
    }
  }

  /** @param {LaserShowBase} show @returns {this} */
  add(show) {
    if (this.shows.has(show)) return this
    if (!show.isLaserShow || show.disposed) throw new TypeError('Expected a live LaserShow.')
    const material = show.beams.material
    if (!material.isShaderMaterial) throw new TypeError('Expected a LaserShow from the three-ilda/webgl entry.')
    if (show.beams.userData.laserPipeline) throw new Error('This LaserShow already belongs to another LaserShowPipeline.')
    const saved = { mask: show.beams.layers.mask, uniforms: {}, onDispose: () => this.remove(show) }
    for (const key of Object.keys(this._depth)) { saved.uniforms[key] = material.uniforms[key]; material.uniforms[key] = this._depth[key] }
    material.defines.DEPTH_FADE = ''; material.needsUpdate = true
    show.beams.layers.set(this.beamLayer); show.beams.userData.laserPipeline = this
    show.addEventListener('dispose', saved.onDispose); this.shows.set(show, saved)
    return this
  }

  /** @param {LaserShowBase} show @returns {this} */
  remove(show) {
    const saved = this.shows.get(show)
    if (!saved) return this
    const material = show.beams.material
    for (const key of Object.keys(saved.uniforms)) material.uniforms[key] = saved.uniforms[key]
    delete material.defines.DEPTH_FADE; material.needsUpdate = true
    show.beams.layers.mask = saved.mask; delete show.beams.userData.laserPipeline
    show.removeEventListener('dispose', saved.onDispose); this.shows.delete(show)
    return this
  }

  _resize(width, height) {
    this.sceneTarget.setSize(width, height)
    const w = Math.max(1, Math.round(width / 2)), h = Math.max(1, Math.round(height / 2))
    this.beamTarget.setSize(w, h); this.blurTarget.setSize(w, h)
    this.glow.setSize(width, height)
    this._depth.resolution.value.set(w, h)
  }

  render() {
    if (this.disposed) return
    const { renderer, scene, camera } = this
    renderer.getDrawingBufferSize(this._size)
    const width = Math.max(1, Math.floor(this._size.x)), height = Math.max(1, Math.floor(this._size.y))
    if (width !== this.sceneTarget.width || height !== this.sceneTarget.height) this._resize(width, height)
    let beams = false
    for (const show of this.shows.keys()) {
      let visible = show.beams.visible && show.beamIntensity > 0
      for (let parent = show; parent; parent = parent.parent) visible &&= parent.visible
      if (visible) { beams = true; break }
    }
    const target = renderer.getRenderTarget(), mask = camera.layers.mask, autoClear = renderer.autoClear
    renderer.autoClear = true
    camera.layers.disable(this.beamLayer)
    renderer.setRenderTarget(this.sceneTarget); renderer.render(scene, camera)
    this.glow.render(renderer, null, this.sceneTarget, 0, false) // adds bloom in place
    if (beams) {
      this._depth.cameraNear.value = camera.near; this._depth.cameraFar.value = camera.far; this._depth.orthographic.value = camera.isOrthographicCamera === true
      const background = scene.background, alpha = renderer.getClearAlpha(); renderer.getClearColor(this._clear)
      scene.background = null; renderer.setClearColor(0x000000, 0); camera.layers.mask = this._beamLayers.mask
      renderer.setRenderTarget(this.beamTarget); renderer.render(scene, camera)
      scene.background = background; renderer.setClearColor(this._clear, alpha)
      const blur = this._blur.material.uniforms
      blur.tDiffuse.value = this.beamTarget.texture; blur.direction.value.set(1 / this.beamTarget.width, 0)
      renderer.setRenderTarget(this.blurTarget); this._blur.render(renderer)
      blur.tDiffuse.value = this.blurTarget.texture; blur.direction.value.set(0, 1 / this.beamTarget.height)
      renderer.setRenderTarget(this.beamTarget); this._blur.render(renderer)
    }
    camera.layers.mask = mask
    this._composite.material.uniforms.haze.value = beams ? 1 : 0
    renderer.setRenderTarget(target); this._composite.render(renderer)
    renderer.autoClear = autoClear
  }

  dispose() {
    if (this.disposed) return
    for (const show of [...this.shows.keys()]) this.remove(show)
    this.sceneTarget.depthTexture.dispose(); this.sceneTarget.dispose(); this.beamTarget.dispose(); this.blurTarget.dispose()
    this.glow.dispose(); this._blur.material.dispose(); this._blur.dispose(); this._composite.material.dispose(); this._composite.dispose()
    this.disposed = true
  }
}
