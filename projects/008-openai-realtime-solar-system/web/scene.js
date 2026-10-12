import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bodies, moonGroups } from './content.js';

// Independent illustrative scene. No upstream scene code or Spline model is used.
export function createSolarScene(canvas, labelHost, onSelect) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 220);
  const home = new THREE.Vector3(-4, 22, 32);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enabled = window.matchMedia('(pointer:fine)').matches;
  controls.minPolarAngle = .04;
  controls.maxPolarAngle = Math.PI * .8;
  canvas.style.touchAction = 'pan-y';
  scene.add(new THREE.AmbientLight('#b2c8ed', 1.7));
  const sunlight = new THREE.PointLight('#ffd29b', 90, 80, 1.2);
  scene.add(sunlight);
  const fill = new THREE.DirectionalLight('#bddaf5', 2);
  fill.position.set(8, 10, 15);
  scene.add(fill);
  const meshById = new Map();
  const labels = [];
  const orbitalLines = [];
  const moonMeshes = [];
  const geometry = new THREE.SphereGeometry(1, 48, 32);
  let activeTarget = null;
  let motionPaused = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  let running = true;
  let frameId;
  let transition = null;
  let moonStart = 0;
  let simulationTime = 0;
  const projected = new THREE.Vector3();
  const elapsedClock = new THREE.Clock();

  function textureFor(body) {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 512; textureCanvas.height = 256;
    const context = textureCanvas.getContext('2d');
    const base = new THREE.Color(body.color);
    const pixels = context.createImageData(512, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 512; x++) {
      const noise = Math.sin(x * .17 + y * .51) * Math.sin(x * .041 - y * .15);
      const band = Math.sin(y * .14 + Math.sin(x * .02) * .7) * .1 + Math.sin(y * .38) * .04;
      let color = base.clone().multiplyScalar(.88 + noise * .09 + (body.kind === 'bands' ? band : 0));
      if (body.kind === 'sun') color = base.clone().multiplyScalar(.8 + noise * .22);
      if (body.kind === 'earth') {
        // Schematic land pattern, not a geographic texture or a measured map.
        const land = Math.sin(x * .024 + Math.sin(y * .045) * 2.1) + Math.cos(y * .058 + x * .009);
        color = new THREE.Color(land > .85 ? '#769c72' : '#267bac').multiplyScalar(.93 + noise * .06);
        if (y < 13 || y > 243) color = new THREE.Color('#d4e4eb');
      }
      const index = (y * 512 + x) * 4;
      pixels.data[index] = Math.round(THREE.MathUtils.clamp(color.r, 0, 1) * 255);
      pixels.data[index + 1] = Math.round(THREE.MathUtils.clamp(color.g, 0, 1) * 255);
      pixels.data[index + 2] = Math.round(THREE.MathUtils.clamp(color.b, 0, 1) * 255);
      pixels.data[index + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  for (const body of bodies) {
    const group = new THREE.Group();
    group.position.set(Math.cos(body.angle) * body.orbit, 0, Math.sin(body.angle) * body.orbit);
    const material = body.id === 'Sun' ? new THREE.MeshBasicMaterial({ map: textureFor(body) }) : new THREE.MeshStandardMaterial({ map: textureFor(body), roughness: .85, metalness: .04 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(body.radius);
    mesh.userData.bodyId = body.id;
    group.add(mesh);
    scene.add(group);
    meshById.set(body.id, { group, mesh, body });
    const label = document.createElement('div');
    label.className = 'planet-label';
    const name = document.createElement('span'); name.textContent = body.label;
    const english = document.createElement('small'); english.textContent = body.id.toUpperCase();
    label.append(name, english); labelHost.append(label);
    labels.push({ group, label, radius: body.radius });
    if (body.orbit) {
      const points = Array.from({ length: 181 }, (_, index) => {
        const angle = index / 180 * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * body.orbit, 0, Math.sin(angle) * body.orbit);
      });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#355675', transparent: true, opacity: .28 }));
      scene.add(line); orbitalLines.push(line);
    }
    if (body.id === 'Saturn') {
      for (const [inner, outer, opacity] of [[1.3, 1.62, .7], [1.67, 2.15, .85], [2.18, 2.3, .35]]) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 100), new THREE.MeshStandardMaterial({ color: '#c8b997', transparent: true, opacity, side: THREE.DoubleSide, roughness: 1 }));
        ring.rotation.x = -Math.PI / 2.4;
        ring.userData.bodyId = body.id;
        group.add(ring);
      }
    }
    if (body.id === 'Earth') {
      const atmosphere = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#77cbff', transparent: true, opacity: .1, side: THREE.BackSide }));
      atmosphere.scale.setScalar(body.radius * 1.075); group.add(atmosphere);
    }
  }
  const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128;
  const glowContext = glowCanvas.getContext('2d');
  const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,188,83,.32)'); gradient.addColorStop(.25, 'rgba(255,155,60,.16)'); gradient.addColorStop(1, 'rgba(255,133,43,0)');
  glowContext.fillStyle = gradient; glowContext.fillRect(0, 0, 128, 128);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.set(11, 11, 1); scene.add(glow);
  for (const [parentId, names] of Object.entries(moonGroups)) {
    const parent = meshById.get(parentId);
    names.forEach((name, index) => {
      const moon = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: ['#e4c598', '#c7cbd1', '#9b918a', '#b9a896', '#ddd1b9'][index], roughness: 1 }));
      moon.scale.setScalar(parentId === 'Jupiter' ? .14 : .075);
      moon.visible = false; parent.group.add(moon);
      moonMeshes.push({ mesh: moon, parentId, name, index, radius: parent.body.radius * 1.8 + index * (parentId === 'Jupiter' ? .5 : .22), enabled: false });
    });
  }
  const iss = new THREE.Group();
  const center = new THREE.Mesh(new THREE.BoxGeometry(.13, .13, .45), new THREE.MeshStandardMaterial({ color: '#d9dce0', metalness: .6, roughness: .3 }));
  iss.add(center);
  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(.42, .025, .38), new THREE.MeshStandardMaterial({ color: '#5e86b8', metalness: .6, roughness: .3 }));
    panel.position.x = side * .3; iss.add(panel);
  }
  iss.position.set(1.6, .25, .2); iss.visible = false; meshById.get('Earth').group.add(iss);
  const starPositions = new Float32Array(700 * 3);
  let seed = 88;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let index = 0; index < 700; index++) {
    const theta = random() * Math.PI * 2, phi = Math.acos(random() * 2 - 1), radius = 70 + random() * 40;
    starPositions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    starPositions[index * 3 + 1] = Math.cos(phi) * radius;
    starPositions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }
  const stars = new THREE.BufferGeometry(); stars.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: '#b9d6e7', size: .09, transparent: true, opacity: .65 })));

  function moveCamera(position, target) {
    transition = { start: performance.now(), from: camera.position.clone(), to: position, targetFrom: controls.target.clone(), targetTo: target };
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      camera.position.copy(position); controls.target.copy(target); transition = null;
    }
  }
  function resize() {
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas.parentElement); resize();
  const raycaster = new THREE.Raycaster();
  let pointerStart = null;
  canvas.addEventListener('pointerdown', (event) => { pointerStart = { x: event.clientX, y: event.clientY }; transition = null; });
  canvas.addEventListener('pointerup', (event) => {
    if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) return;
    const rect = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
    const hit = raycaster.intersectObjects([...meshById.values()].map((item) => item.group), true).find((item) => item.object.userData.bodyId);
    if (hit) onSelect(hit.object.userData.bodyId);
    pointerStart = null;
  });
  controls.addEventListener('start', () => { transition = null; });

  function applyCommand(command) {
    activeTarget = command.target ?? null;
    moonMeshes.forEach((moon) => { moon.enabled = command.name === 'show_moons' && command.args.moons.includes(moon.name); moon.mesh.visible = false; });
    moonStart = performance.now();
    iss.visible = command.name === 'get_iss_position';
    orbitalLines.forEach((line) => { line.material.opacity = command.name === 'show_orbit' ? .6 : .24; });
    if (command.name === 'show_orbit') moveCamera(new THREE.Vector3(0, 47, .5), new THREE.Vector3());
    else if (command.name === 'reset_camera') moveCamera(home.clone(), new THREE.Vector3());
    else if (activeTarget) {
      const entry = meshById.get(activeTarget);
      const distance = command.name === 'show_moons' ? (activeTarget === 'Jupiter' ? 11 : 5) : entry.body.radius * 4.5 + 2;
      const offset = new THREE.Vector3(.9, .55, 1.25).normalize().multiplyScalar(distance);
      moveCamera(entry.group.position.clone().add(offset), entry.group.position.clone());
    }
    labels.forEach(({ group, label }) => label.classList.toggle('selected', meshById.get(activeTarget)?.group === group));
  }
  function render(now) {
    if (!running) return;
    const delta = Math.min(elapsedClock.getDelta(), .05);
    if (transition) {
      const progress = Math.min((now - transition.start) / 1250, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(transition.from, transition.to, eased);
      controls.target.lerpVectors(transition.targetFrom, transition.targetTo, eased);
      if (progress === 1) transition = null;
    }
    if (!motionPaused) {
      simulationTime += delta;
      meshById.forEach(({ mesh }) => { mesh.rotation.y += delta * .08; });
    }
    moonMeshes.forEach((moon) => {
      moon.mesh.visible = moon.enabled && now - moonStart > moon.index * 160;
      const angle = moon.index * 1.4 + simulationTime * .07;
      moon.mesh.position.set(Math.cos(angle) * moon.radius, Math.sin(angle * 1.2) * .12, Math.sin(angle) * moon.radius);
    });
    controls.update(); camera.updateMatrixWorld();
    const { clientWidth: width, clientHeight: height } = canvas;
    labels.forEach(({ group, label, radius }) => {
      const isSelected = meshById.get(activeTarget)?.group === group;
      projected.copy(group.position); projected.y += isSelected ? radius * .5 : radius + .3; projected.project(camera);
      const x = (projected.x * .5 + .5) * width, y = (-projected.y * .5 + .5) * height;
      const visible = projected.z < 1 && projected.z > -1 && x > 25 && x < width - 25 && y > 55 && y < height - 50;
      const selected = !activeTarget || meshById.get(activeTarget)?.group === group;
      label.style.opacity = visible && selected ? '1' : '0';
      label.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
    });
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(render);
  }
  frameId = requestAnimationFrame(render);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { elapsedClock.getDelta(); frameId = requestAnimationFrame(render); }
    else cancelAnimationFrame(frameId);
  });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); running = false; cancelAnimationFrame(frameId);
    document.querySelector('#scene-fallback').hidden = false;
  });
  return { applyCommand, setPaused(value) { motionPaused = value; }, get paused() { return motionPaused; } };
}
