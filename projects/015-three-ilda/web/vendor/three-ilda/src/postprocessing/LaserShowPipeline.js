import { Color, Layers, PassNode, RenderPipeline } from 'three/webgpu'
import { float, max, orthographicDepthToViewZ, pass, perspectiveDepthToViewZ, positionView, screenUV, smoothstep, uniform, vec2, vec3, vec4 } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { gaussianBlur } from 'three/addons/tsl/display/GaussianBlurNode.js'

// Same scene and camera, with a black background only while rendering the light layer.
class BeamPass extends PassNode {
  constructor(scene, camera) { super(PassNode.COLOR, scene, camera, { samples: 0, depthBuffer: false }); this.name = 'Projector beams'; this._clear = new Color() }
  updateBefore(frame) {
    const scene = this.scene, renderer = frame.renderer
    const background = scene.background, backgroundNode = scene.backgroundNode, alpha = renderer.getClearAlpha()
    renderer.getClearColor(this._clear)
    try {
      scene.background = null; scene.backgroundNode = null; renderer.setClearColor(0x000000, 0)
      super.updateBefore(frame)
    } finally {
      scene.background = background; scene.backgroundNode = backgroundNode; renderer.setClearColor(this._clear, alpha)
    }
  }
}

/** @typedef {import('../core/LaserShowBase.js').LaserShowBase} LaserShowBase */
/**
 * @typedef {Object} LaserShowPipelineOptions
 * @property {number} [beamLayer] Layer reserved for beam meshes, 1 to 31 (default 31).
 * @property {number} [strength] Bloom strength (default 15).
 * @property {number} [radius] Bloom radius (default 1).
 * @property {number} [threshold] Bloom luminance threshold (default 0).
 * @property {number} [samples] MSAA samples of the scene pass (default 4).
 * @property {boolean} [inspect] Label the passes for the r185 Inspector (default false).
 */

/**
 * Optional post-processing owned by the host application. Uses its scene, camera and renderer.
 * Reserves beamLayer (default 31); all other objects keep their normal camera layers.
 * One pipeline can serve multiple registered LaserShow objects in the same scene.
 */
export class LaserShowPipeline {
  /**
   * @param {import('three/webgpu').WebGPURenderer} renderer
   * @param {import('three').Scene} scene
   * @param {import('three').Camera} camera
   * @param {LaserShowPipelineOptions} [options]
   */
  constructor(renderer, scene, camera, { beamLayer = 31, strength = 15, radius = 1, threshold = 0, samples = 4, inspect = false } = {}) {
    if (!Number.isInteger(beamLayer) || beamLayer < 1 || beamLayer > 31) throw new RangeError('beamLayer must be an integer from 1 to 31.')
    this.renderer = renderer; this.camera = camera; this.beamLayer = beamLayer
    /** @type {Map<LaserShowBase, { mask: number, opacity: unknown, onDispose: () => void }>} */
    this.shows = new Map()
    this.disposed = false; this._withBeams = false
    const baseLayers = new Layers(); baseLayers.mask = camera.layers.mask; baseLayers.disable(beamLayer)
    this._baseLayers = baseLayers
    const beamLayers = new Layers(); beamLayers.set(beamLayer)
    this.scenePass = pass(scene, camera, { samples }).setLayers(baseLayers)
    this._near = uniform(camera.near); this._far = uniform(camera.far)
    const depth = this.scenePass.getTextureNode('depth').sample(screenUV)
    this._sceneViewZ = (camera.isPerspectiveCamera ? perspectiveDepthToViewZ : orthographicDepthToViewZ)(depth, this._near, this._far)
    this.beamPass = new BeamPass(scene, camera).setLayers(beamLayers).setResolutionScale(0.5)
    const label = (node, name) => inspect ? node.toInspector(name) : node
    const sceneColor = label(this.scenePass.getTextureNode('output'), 'Scene / projection')
    this.glow = bloom(sceneColor, strength, radius, threshold)
    this.blur = gaussianBlur(this.beamPass.getTextureNode('output'), vec2(1, 1), 3)
    const glowColor = label(this.glow, 'Laser bloom'), beamColor = label(this.blur, 'Soft projector beams')
    this.projectionOutput = sceneColor.add(glowColor)
    const protect = float(1).sub(smoothstep(0.025, 0.3, max(this.projectionOutput.r, max(this.projectionOutput.g, this.projectionOutput.b))))
    const haze = vec3(1).sub(beamColor.rgb.negate().exp()).mul(0.14).mul(protect)
    this.beamOutput = vec4(this.projectionOutput.rgb.add(haze), this.projectionOutput.a)
    this.pipeline = new RenderPipeline(renderer, this.projectionOutput)
  }

  /** @param {LaserShowBase} show @returns {this} */
  add(show) {
    if (this.shows.has(show)) return this
    if (!show.isLaserShow || show.disposed) throw new TypeError('Expected a live LaserShow.')
    if (!show.beams.material.isNodeMaterial) throw new TypeError('Expected a LaserShow from the three-ilda entry; three-ilda/webgl shows need the webgl pipeline.')
    if (show.beams.userData.laserPipeline) throw new Error('This LaserShow already belongs to another LaserShowPipeline.')
    const saved = { mask: show.beams.layers.mask, opacity: show.beams.material.opacityNode, onDispose: () => this.remove(show) }
    this.shows.set(show, saved); show.beams.userData.laserPipeline = this
    show.beams.layers.set(this.beamLayer)
    // Beam geometry is drawn separately, but the main scene depth still occludes it.
    const difference = this._sceneViewZ.sub(positionView.z)
    show.beams.material.opacityNode = float(1).sub(smoothstep(0.002, 0.015, difference))
    show.beams.material.needsUpdate = true; show.addEventListener('dispose', saved.onDispose)
    return this
  }

  /** @param {LaserShowBase} show @returns {this} */
  remove(show) {
    const saved = this.shows.get(show)
    if (!saved) return this
    show.beams.layers.mask = saved.mask; show.beams.material.opacityNode = saved.opacity
    show.beams.material.needsUpdate = true; delete show.beams.userData.laserPipeline
    show.removeEventListener('dispose', saved.onDispose); this.shows.delete(show)
    return this
  }

  render() {
    if (this.disposed) return
    this._near.value = this.camera.near; this._far.value = this.camera.far
    this._baseLayers.mask = this.camera.layers.mask; this._baseLayers.disable(this.beamLayer)
    let beams = false
    for (const show of this.shows.keys()) {
      let visible = show.beams.visible && show.beamIntensity > 0
      for (let parent = show; parent; parent = parent.parent) visible &&= parent.visible
      if (visible) { beams = true; break }
    }
    if (beams !== this._withBeams) {
      this._withBeams = beams; this.pipeline.outputNode = beams ? this.beamOutput : this.projectionOutput; this.pipeline.needsUpdate = true
    }
    this.pipeline.render()
  }

  dispose() {
    if (this.disposed) return
    for (const show of [...this.shows.keys()]) this.remove(show)
    this.pipeline.dispose(); this.scenePass.dispose(); this.beamPass.dispose(); this.glow.dispose(); this.blur.dispose()
    this.disposed = true
  }
}
