import { AdditiveBlending, DoubleSide, LineBasicNodeMaterial, MeshBasicNodeMaterial, Vector3 } from 'three/webgpu'
import { attribute, float, mix, mx_noise_float, positionWorld, smoothstep, uniform, varying, vec3 } from 'three/tsl'
import { LaserShowBase } from '../core/LaserShowBase.js'

/**
 * Laser show for THREE.WebGPURenderer (the WebGPU / TSL version): node materials with the projection and beam math in TSL.
 * Playback, buffers and the public API live in LaserShowBase; ../webgl/LaserShow.js is the WebGL 2 version for WebGLRenderer.
 */
export class LaserShow extends LaserShowBase {
  _createMaterials() {
    const scale = uniform(new Vector3()), origin = uniform(new Vector3()), clock = uniform(0), intensity = uniform(1), beamIntensity = uniform(0.5)
    const line = new LineBasicNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending })
    line.positionNode = attribute('position', 'vec3').mul(scale)
    line.colorNode = attribute('color', 'vec3').mul(intensity)
    const beam = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide })
    beam.forceSinglePass = true
    beam.positionNode = mix(origin, attribute('position', 'vec3').mul(scale), attribute('beamAlong', 'float'))
    const along = varying(attribute('beamAlong', 'float'))
    const drift = positionWorld.mul(1.4).add(vec3(clock.mul(0.08), clock.mul(-0.12), 0))
    const haze = mx_noise_float(drift).mul(0.3).add(0.7)
    const envelope = smoothstep(0, 0.025, along).mul(float(1).sub(smoothstep(0.78, 1, along)))
    beam.colorNode = attribute('color', 'vec3').mul(haze).mul(envelope).mul(beamIntensity)
    return { line, beam, scale, origin, clock, intensity, beamIntensity }
  }
}
