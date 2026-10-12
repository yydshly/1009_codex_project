import { AdditiveBlending, DoubleSide, ShaderMaterial, Vector2, Vector3 } from 'three'
import { LaserShowBase } from '../core/LaserShowBase.js'

const LINE_VERTEX = /* glsl */`
uniform vec3 scale;
varying vec3 vColor;
void main() {
  vColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
}`

const LINE_FRAGMENT = /* glsl */`
uniform float intensity;
varying vec3 vColor;
void main() { gl_FragColor = vec4(vColor * intensity, 1.0); }`

const BEAM_VERTEX = /* glsl */`
uniform vec3 scale, origin;
attribute float beamAlong;
varying vec3 vColor, vWorld;
varying float vAlong, vViewZ;
void main() {
  vColor = color; vAlong = beamAlong;
  vec4 world = modelMatrix * vec4(mix(origin, position * scale, beamAlong), 1.0);
  vec4 view = viewMatrix * world;
  vWorld = world.xyz; vViewZ = view.z;
  gl_Position = projectionMatrix * view;
}`

// DEPTH_FADE is defined by LaserShowPipeline, which also provides the scene depth uniforms.
const BEAM_FRAGMENT = /* glsl */`
uniform float clock, beamIntensity;
varying vec3 vColor, vWorld;
varying float vAlong, vViewZ;
#ifdef DEPTH_FADE
#include <packing>
uniform sampler2D tDepth;
uniform vec2 resolution;
uniform float cameraNear, cameraFar;
uniform bool orthographic;
#endif
// 3D gradient noise, the role mx_noise_float plays in the TSL material; values stay roughly within [-1, 1].
vec3 hash(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(dot(hash(i), f), dot(hash(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
        mix(dot(hash(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)), dot(hash(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(mix(dot(hash(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)), dot(hash(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
        mix(dot(hash(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)), dot(hash(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}
void main() {
  float envelope = smoothstep(0.0, 0.025, vAlong) * (1.0 - smoothstep(0.78, 1.0, vAlong));
  float haze = 0.7 + 0.3 * noise(vWorld * 1.4 + vec3(clock * 0.08, clock * -0.12, 0.0));
  float alpha = 1.0;
#ifdef DEPTH_FADE
  float depth = texture2D(tDepth, gl_FragCoord.xy / resolution).x;
  float sceneViewZ = orthographic ? orthographicDepthToViewZ(depth, cameraNear, cameraFar) : perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
  alpha = 1.0 - smoothstep(0.002, 0.015, sceneViewZ - vViewZ);
#endif
  gl_FragColor = vec4(vColor * haze * envelope * beamIntensity, alpha);
}`

/**
 * Laser show for THREE.WebGLRenderer (the WebGL 2 version): ShaderMaterials with the same math as the TSL variant.
 * Playback, buffers and the public API live in LaserShowBase.
 */
export class LaserShow extends LaserShowBase {
  _createMaterials() {
    const scale = { value: new Vector3() }, origin = { value: new Vector3() }, clock = { value: 0 }, intensity = { value: 1 }, beamIntensity = { value: 0.5 }
    const line = new ShaderMaterial({
      uniforms: { scale, intensity }, vertexShader: LINE_VERTEX, fragmentShader: LINE_FRAGMENT,
      vertexColors: true, transparent: true, depthWrite: false, blending: AdditiveBlending,
    })
    const beam = new ShaderMaterial({
      uniforms: { scale, origin, clock, beamIntensity, tDepth: { value: null }, resolution: { value: new Vector2(1, 1) }, cameraNear: { value: 0.1 }, cameraFar: { value: 1000 }, orthographic: { value: false } },
      vertexShader: BEAM_VERTEX, fragmentShader: BEAM_FRAGMENT,
      vertexColors: true, transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, forceSinglePass: true,
    })
    return { line, beam, scale, origin, clock, intensity, beamIntensity }
  }
}
