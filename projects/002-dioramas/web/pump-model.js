// Shared local teaching model from project 002. No upstream Dioramas assets or engine.
// THREE is supplied by the host: the two apps keep their own dependency versions.
export function createPumpModel(THREE) {
  const material = (color, metalness = 0.5, roughness = 0.35) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const paint = material('#4d716b', 0.65, 0.36);
  const motorPaint = material('#44615b', 0.55, 0.36);
  const metal = material('#b1b7ad', 0.85, 0.27);
  const brass = material('#cd9363', 0.8, 0.3);
  const dark = material('#172d29', 0.45, 0.48);
  const baseMaterial = material('#304942', 0.55, 0.48);
  const assembly = new THREE.Group();

  const partGroups = new Map();
  const pickable = [];
  function part(id, position, offset) {
    const group = new THREE.Group();
    group.position.set(...position);
    group.userData = { partId: id, home: new THREE.Vector3(...position), offset: new THREE.Vector3(...offset) };
    assembly.add(group);
    partGroups.set(id, group);
    return group;
  }
  function add(group, geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(geometry, mat.clone());
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.partId = group.userData.partId;
    mesh.userData.baseEmissive = mesh.material.emissive.clone();
    group.add(mesh);
    if (mesh.userData.partId) pickable.push(mesh);
    return mesh;
  }
  function cylinder(group, radius, length, mat, position = [0, 0, 0], axis = 'x', radiusEnd = radius) {
    return add(group, new THREE.CylinderGeometry(radiusEnd, radius, length, 48), mat, position, axis === 'x' ? [0, 0, Math.PI / 2] : [0, 0, 0]);
  }
  function ring(group, inner, outer, length, mat, position = [0, 0, 0], axis = 'x') {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.015, bevelThickness: 0.015, curveSegments: 48 });
    geometry.translate(0, 0, -length / 2);
    return add(group, geometry, mat, position, axis === 'x' ? [0, Math.PI / 2, 0] : [-Math.PI / 2, 0, 0]);
  }
  function bolts(group, radius, x, count = 8) {
    for (let index = 0; index < count; index++) {
      const angle = index / count * Math.PI * 2;
      const mesh = add(group, new THREE.CylinderGeometry(0.055, 0.055, 0.085, 6), metal, [x, Math.sin(angle) * radius, Math.cos(angle) * radius], [0, 0, Math.PI / 2]);
      mesh.castShadow = false;
    }
  }
  const fixed = new THREE.Group();
  assembly.add(fixed);
  add(fixed, new THREE.BoxGeometry(5.6, 0.2, 1.8), baseMaterial, [0.45, 0.1, 0]);
  for (const x of [-1.9, 2.8]) for (const z of [-0.65, 0.65]) cylinder(fixed, 0.06, 0.07, metal, [x, 0.23, z], 'y');
  const motor = part('motor', [1.7, 1.15, 0], [1.4, 0.5, 0]);
  cylinder(motor, 0.65, 1.62, motorPaint);
  cylinder(motor, 0.58, 0.25, dark, [0.88, 0, 0]);
  cylinder(motor, 0.59, 0.12, metal, [-0.83, 0, 0]);
  cylinder(motor, 0.1, 0.5, metal, [-1.02, 0, 0]);
  for (let index = 0; index < 20; index++) {
    const angle = index / 20 * Math.PI * 2;
    add(motor, new THREE.BoxGeometry(1.46, 0.09, 0.055), motorPaint, [0, Math.cos(angle) * 0.66, Math.sin(angle) * 0.66], [angle, 0, 0]);
  }
  add(motor, new THREE.BoxGeometry(0.55, 0.28, 0.5), dark, [0.25, 0.72, 0]);
  for (const x of [-0.5, 0.5]) add(motor, new THREE.BoxGeometry(0.33, 0.42, 1.06), motorPaint, [x, -0.65, 0]);
  const badge = add(motor, new THREE.BoxGeometry(0.6, 0.27, 0.018), brass, [0.15, 0.03, 0.657]);
  badge.castShadow = false;
  const coupling = part('coupling', [0.3, 1.15, 0], [0.4, 1.65, 0.35]);
  cylinder(coupling, 0.24, 0.2, brass, [0.12, 0, 0]);
  cylinder(coupling, 0.24, 0.2, metal, [-0.12, 0, 0]);
  cylinder(coupling, 0.17, 0.08, dark);
  const seal = part('seal', [-0.22, 1.15, 0], [0.0, 0.85, -0.95]);
  ring(seal, 0.1, 0.25, 0.12, metal);
  ring(seal, 0.1, 0.19, 0.06, dark, [-0.1, 0, 0]);
  cylinder(seal, 0.085, 0.6, metal);
  const casing = part('casing', [-1.02, 1.15, 0], [-0.55, 0.3, -1.75]);
  // A circular chamber deliberately substitutes for a manufacturer's exact volute.
  ring(casing, 0.77, 0.98, 0.5, paint);
  ring(casing, 0.3, 0.94, 0.12, paint, [0.29, 0, 0]);
  ring(casing, 0.36, 0.94, 0.12, paint, [-0.29, 0, 0]);
  bolts(casing, 0.86, -0.37);
  ring(casing, 0.2, 0.3, 0.62, paint, [0, 1.01, 0], 'y');
  ring(casing, 0.2, 0.43, 0.12, metal, [0, 1.34, 0], 'y');
  for (const z of [-0.55, 0.55]) add(casing, new THREE.BoxGeometry(0.65, 0.32, 0.27), paint, [0, -0.87, z]);
  const impeller = part('impeller', [-1.02, 1.15, 0], [-0.75, 0.45, 1.55]);
  cylinder(impeller, 0.7, 0.065, brass, [0.1, 0, 0]);
  cylinder(impeller, 0.16, 0.28, metal);
  for (let index = 0; index < 7; index++) {
    const blade = new THREE.Shape();
    blade.moveTo(0.18, -0.06);
    blade.quadraticCurveTo(0.48, -0.03, 0.66, 0.24);
    blade.lineTo(0.6, 0.28);
    blade.quadraticCurveTo(0.42, 0.06, 0.17, 0.015);
    blade.closePath();
    const geo = new THREE.ExtrudeGeometry(blade, { depth: 0.18, bevelEnabled: true, bevelSize: 0.009, bevelThickness: 0.009, bevelSegments: 2 });
    geo.translate(0, 0, -0.12);
    const vane = add(impeller, geo, brass, [0, 0, 0], [0, Math.PI / 2, 0]);
    vane.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), index / 7 * Math.PI * 2);
  }
  const inlet = part('inlet', [-1.82, 1.15, 0], [-1.6, 0.15, 0]);
  ring(inlet, 0.25, 0.36, 0.7, paint);
  ring(inlet, 0.25, 0.55, 0.12, metal, [-0.4, 0, 0]);
  bolts(inlet, 0.43, -0.5);

  // Flow paths are an explanatory animation, not fluid simulation.
  const route = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.9, 1.15, 0),
    new THREE.Vector3(-1.8, 1.15, 0),
    new THREE.Vector3(-1.12, 1.15, 0),
    new THREE.Vector3(-1.12, 1.35, 0.38),
    new THREE.Vector3(-1.12, 1.65, 0.55),
    new THREE.Vector3(-1.12, 1.92, 0.2),
    new THREE.Vector3(-1.02, 2.25, 0),
    new THREE.Vector3(-1.02, 3.2, 0),
  ], false, 'centripetal');
  const flowGroup = new THREE.Group();
  flowGroup.visible = false;
  assembly.add(flowGroup);
  const guide = new THREE.Mesh(new THREE.TubeGeometry(route, 80, 0.015, 6, false), new THREE.MeshBasicMaterial({ color: '#7ac7b9', transparent: true, opacity: 0.32, depthTest: false }));
  guide.renderOrder = 3;
  flowGroup.add(guide);
  const particleGeo = new THREE.SphereGeometry(0.039, 8, 6);
  const particles = new THREE.InstancedMesh(particleGeo, new THREE.MeshBasicMaterial({ color: '#a5f7e2', depthTest: false }), 40);
  particles.renderOrder = 4;
  flowGroup.add(particles);
  const matrix = new THREE.Matrix4();

  let currentExplode = 0, currentOpacity = 1;
  const tempPosition = new THREE.Vector3();
  const resources = new Set([paint, motorPaint, metal, brass, dark, baseMaterial, particles]);
  assembly.traverse(object => { if (object.geometry) resources.add(object.geometry); if (object.material) resources.add(object.material); });
  return {
    root: assembly, partGroups, pickable, casing, impeller, flowGroup, resources,
    select(id) {
      if (!partGroups.has(id)) return false;
      pickable.forEach(mesh => {
        const active = mesh.userData.partId === id;
        mesh.material.emissive.set(active ? '#2b5949' : '#000000');
        mesh.material.emissiveIntensity = active ? .4 : 0;
      });
      return true;
    },
    update({explode = 0, shell = 'solid', flow = false, time = 0, dt = 0, reducedMotion = false} = {}) {
      const state = {explode: THREE.MathUtils.clamp(explode, 0, 1), shell, flow};
      dt = THREE.MathUtils.clamp(dt, 0, .05);
      const damping = reducedMotion ? 1 : 1 - Math.exp(-8 * dt);
      currentExplode += (state.explode - currentExplode) * damping;
      const targetOpacity = state.shell === 'transparent' ? 0.14 : 1;
      currentOpacity += (targetOpacity - currentOpacity) * damping;
      partGroups.forEach((group) => {
        tempPosition.copy(group.userData.offset).multiplyScalar(currentExplode).add(group.userData.home);
        group.position.copy(tempPosition);
      });
      casing.traverse((mesh) => {
        if (!mesh.isMesh) return;
        const transparent = currentOpacity < 0.995;
        if (mesh.material.transparent !== transparent) {
          mesh.material.transparent = transparent;
          mesh.material.needsUpdate = true;
        }
        mesh.material.opacity = currentOpacity;
        mesh.material.depthWrite = !transparent;
        mesh.castShadow = !transparent;
      });
      flowGroup.visible = state.flow && currentExplode < 0.02;
      if (flowGroup.visible) {
        if (!reducedMotion) impeller.rotation.x += dt * 1.8;
        for (let index = 0; index < 40; index++) {
          const progress = (index / 40 + (reducedMotion ? 0 : time * 0.2)) % 1;
          tempPosition.copy(route.getPointAt(progress));
          matrix.makeTranslation(tempPosition.x, tempPosition.y, tempPosition.z);
          particles.setMatrixAt(index, matrix);
        }
        particles.instanceMatrix.needsUpdate = true;
      }

      return { currentExplode, flowVisible: flowGroup.visible };
    },
    dispose() { assembly.removeFromParent(); resources.forEach(resource => resource.dispose()); resources.clear(); }
  };
}
