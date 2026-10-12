import * as THREE from 'three';
import { createPumpModel } from './pump-model.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Independent implementation of the rendering / input / scene-state principles.
// No Dioramas model files, generated textures or engine source are included.
export function createPumpScene(canvas, onSelect) {
  const host = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#142725');
  scene.fog = new THREE.Fog('#142725', 15, 35);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(-6.4, 4.5, 7.4);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0.1, 1.3, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI / 2.08;
  // Preserve vertical page scrolling on touch screens; sliders and presets are touch equivalents.
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  canvas.style.touchAction = 'pan-y';
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.65;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#c3e0d7', '#142923', 2.1));
  const key = new THREE.DirectionalLight('#ffe2c3', 4.3);
  key.position.set(-4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.normalBias = 0.03;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#83ddcc', 2.4);
  rim.position.set(5, 4, -5);
  scene.add(rim);

  const material = (color, metalness = .5, roughness = .35) => new THREE.MeshStandardMaterial({color, metalness, roughness});
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material('#182e29', 0.1, 0.88));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.12;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(28, 56, '#345b4f', '#25483e');
  grid.position.y = -0.1;
  grid.material.transparent = true;
  grid.material.opacity = 0.3;
  scene.add(grid);

  const model = createPumpModel(THREE);
  const { root: assembly, partGroups, pickable, flowGroup } = model;
  scene.add(assembly);
  const labels = new THREE.Group();
  scene.add(labels);
  function label(text, position) {
    const surface = document.createElement('canvas');
    surface.width = 512;
    surface.height = 100;
    const context = surface.getContext('2d');
    context.fillStyle = '#213b33';
    context.fillRect(0, 0, 512, 100);
    context.strokeStyle = '#678c76';
    context.lineWidth = 2;
    context.strokeRect(1, 1, 510, 98);
    context.font = '32px "Microsoft YaHei", sans-serif';
    context.fillStyle = '#dae8d5';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 50);
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.position.set(...position);
    sprite.scale.set(1.35, 0.27, 1);
    sprite.renderOrder = 5;
    labels.add(sprite);
    return sprite;
  }
  const flowLabels = [label('轴向进水 →', [-2.8, 0.55, 0]), label('↑ 出水', [-1.02, 3.35, 0])];
  flowLabels.forEach((item) => { item.visible = false; });
  const rootLabel = label('FLOW—01 / 结构示意', [1.3, 0.42, 0.95]);
  rootLabel.scale.set(1.7, 0.33, 1);

  let selected = 'motor';
  const state = { explode: 0, shell: 'solid', flow: false };
  let currentExplode = 0;
  let cameraGoal = null;
  let targetGoal = null;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let pointerDown = null;
  function select(id) {
    if (!partGroups.has(id)) return;
    selected = id;
    model.select(id);
  }
  function handleDown(event) {
    pointerDown = { x: event.clientX, y: event.clientY };
    cameraGoal = null;
    targetGoal = null;
  }
  function handleUp(event) {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 6) {
      pointerDown = null;
      return;
    }
    pointerDown = null;
    const rect = canvas.getBoundingClientRect();
    ndc.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(pickable, false);
    const hit = hits.find((result) => state.shell !== 'transparent' || result.object.userData.partId !== 'casing') || hits[0];
    if (hit) {
      select(hit.object.userData.partId);
      onSelect(hit.object.userData.partId);
    }
  }
  canvas.addEventListener('pointerdown', handleDown);
  canvas.addEventListener('pointerup', handleUp);
  controls.addEventListener('start', () => {
    cameraGoal = null;
    targetGoal = null;
  });
  function setCamera(name) {
    const compact = host.clientWidth < 480;
    const zoom = compact ? 1.25 : 1;
    const presets = {
      showcase: { camera: [-6.4, 4.5, 7.4], target: [0.1, 1.3, 0] },
      structure: { camera: [-8.8, 6.2, 10.2], target: [0, 1.6, 0] },
      flow: { camera: [-7.2, 4.6, 7.7], target: [-0.4, 1.6, 0] },
    };
    const preset = presets[name] || presets.showcase;
    cameraGoal = new THREE.Vector3(...preset.camera).multiplyScalar(zoom);
    targetGoal = new THREE.Vector3(...preset.target);
  }
  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    if (width < 480 && camera.position.length() < 14) camera.position.multiplyScalar(1.25);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();
  select(selected);
  controls.update();
  renderer.compile(scene, camera);
  let visible = true;
  const intersectionObserver = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }, { rootMargin: '80px' });
  intersectionObserver.observe(host);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let last = performance.now();
  let time = 0;
  let disposed = false;
  let animation;
  function tick(now) {
    if (disposed) return;
    animation = requestAnimationFrame(tick);
    // RAF's first timestamp can precede performance.now() taken during setup.
    // Keep arc-length lookups in range on slow frames and newly visible canvases.
    const dt = THREE.MathUtils.clamp((now - last) / 1000, 0, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    time += dt;
    const damping = reducedMotion.matches ? 1 : 1 - Math.exp(-8 * dt);
    const updated = model.update({ ...state, time, dt, reducedMotion: reducedMotion.matches });
    currentExplode = updated.currentExplode;
    flowLabels.forEach(item => { item.visible = updated.flowVisible; });
    if (cameraGoal) {
      camera.position.lerp(cameraGoal, damping * 0.65);
      controls.target.lerp(targetGoal, damping * 0.65);
      if (camera.position.distanceTo(cameraGoal) < 0.003) {
        cameraGoal = null;
        targetGoal = null;
      }
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animation = requestAnimationFrame(tick);
  // Read-only diagnostics used by the local interaction verification script.
  const diagnostics = () => ({
    ready: true, selected, ...state, currentExplode,
    camera: camera.position.toArray(),
    groups: [...partGroups.values()].map((group) => ({ id: group.userData.partId, position: group.position.toArray() })),
    flowVisible: flowGroup.visible, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
  });
  window.__pumpDiagnostics = diagnostics;
  function dispose() {
    disposed = true;
    cancelAnimationFrame(animation);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    controls.dispose();
    canvas.removeEventListener('pointerdown', handleDown);
    canvas.removeEventListener('pointerup', handleUp);
    model.dispose();
    const geometries = new Set();
    const materials = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) {
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((item) => materials.add(item));
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((mat) => { mat.map?.dispose(); mat.dispose(); });
    environment.dispose();
    renderer.dispose();
    delete window.__pumpDiagnostics;
  }
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  return {
    select,
    setCamera,
    setExplode: (value) => { state.explode = THREE.MathUtils.clamp(value, 0, 1); },
    setShell: (value) => { state.shell = value === 'transparent' ? 'transparent' : 'solid'; },
    setFlow: (value) => { state.flow = Boolean(value); },
    dispose,
  };
}
