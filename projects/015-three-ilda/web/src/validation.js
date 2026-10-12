import * as THREE from 'three';
import { ILDALoader, LaserShow, LaserShowPipeline } from '../vendor/three-ilda/src/webgl.js';
const result = document.querySelector('#result'), report = { backend: 'WebGL 2', fixture: '原创 light-flower.ild', errors: [] };
let renderer, pipeline, show;
const mean = pixels => { let s = 0; for (let i = 0; i < pixels.length; i += 4) s += Math.max(pixels[i], pixels[i + 1], pixels[i + 2]); return +(s / (pixels.length / 4)).toFixed(4); };
const diff = (a, b) => { let count = 0; for (let i = 0; i < a.length; i += 4) if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 0) count++; return count; };
async function validate() {
try {
  renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('canvas'), antialias: false }); renderer.setSize(480, 320, false); renderer.setPixelRatio(1); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.debug.onShaderError = () => report.errors.push('shader compile error');
  report.browser = navigator.userAgent;
  const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); report.gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1.5, .1, 100); camera.position.z = 8;
  const asset = await new ILDALoader().loadAsync(new URL('shows/light-flower.ild', new URL(import.meta.env.BASE_URL, document.baseURI)).href);
  show = new LaserShow(asset, { capacity: 4096 }); show.playing = false; show.seekFrame(18); scene.add(show);
  pipeline = new LaserShowPipeline(renderer, scene, camera, { strength: 8, samples: 0 }); pipeline.add(show);
  const target = new THREE.WebGLRenderTarget(480, 320), pixels = new Uint8Array(480 * 320 * 4);
  const grab = () => { show.update(0); renderer.setRenderTarget(target); pipeline.render(); renderer.readRenderTargetPixels(target, 0, 0, 480, 320, pixels); renderer.setRenderTarget(null); return pixels.slice(); };
  const before = grab(); show.beamMode = 'Front'; const front = grab(); show.beamMode = 'Back'; const back = grab(); show.beamMode = 'Disabled'; const after = grab();
  report.frontChangedPixels = diff(before, front); report.backChangedPixels = diff(before, back); report.disabledRestoresPixels = diff(before, after) === 0;
  report.meanBrightness = { bloom: mean(before) }; pipeline.glow.strength = 0; report.meanBrightness.noBloom = mean(grab()); pipeline.glow.strength = 8;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0x000000 })); wall.position.z = 5; scene.add(wall); show.beamMode = 'Front'; const occluded = grab(); report.occludedMean = mean(occluded);
  scene.remove(wall); wall.geometry.dispose(); wall.material.dispose();
  const blank = { count: 2, position: new Float32Array([-.5, 0, 0, .5, 0, 0]), color: new Float32Array(6).fill(1), blank: new Uint8Array([1, 1]) };
  show.setData({ tracks: new Map([[0, [blank]]]) }); scene.background = new THREE.Color(.025, .05, .08); show.beamMode = 'Disabled'; const backgroundA = grab(); show.beamMode = 'Front'; const backgroundB = grab(); report.backgroundPreserved = diff(backgroundA, backgroundB) === 0;
  report.pass = report.frontChangedPixels > 0 && report.backChangedPixels > 0 && report.disabledRestoresPixels && report.meanBrightness.bloom > report.meanBrightness.noBloom && report.occludedMean === 0 && report.backgroundPreserved && report.errors.length === 0;
  target.dispose(); pipeline.dispose(); show.dispose(); renderer.dispose();
} catch (error) { report.pass = false; report.errors.push(error.stack); renderer?.dispose(); }
window.ildaValidation = report; result.textContent = JSON.stringify(report, null, 2);
}
validate();
