import * as THREE from 'three';

export const PRODUCT_FINISHES = { pearl: { name: '月白', color: '#cbd8d8' }, graphite: { name: '石墨', color: '#253947' }, mist: { name: '雾蓝', color: '#729fb4' } };

// 原创程序建模的概念声场装置，不依赖图片、外部模型或真实产品规格。
export function createLaunchProduct() {
  const root = new THREE.Group(), resources = new Set(), parts = [];
  root.name = 'AURA ONE concept product';
  const keep = value => { resources.add(value); return value; };
  const shell = keep(new THREE.MeshStandardMaterial({ color: PRODUCT_FINISHES.pearl.color, metalness: .28, roughness: .32 }));
  const dark = keep(new THREE.MeshStandardMaterial({ color: '#132536', metalness: .2, roughness: .45 }));
  const silver = keep(new THREE.MeshStandardMaterial({ color: '#788e9a', metalness: .55, roughness: .27 }));
  const accent = keep(new THREE.MeshBasicMaterial({ color: '#a0f0de' }));
  function mesh(geometry, material, position = [0, 0, 0]) {
    const object = new THREE.Mesh(keep(geometry), material); object.position.set(...position); root.add(object); return object;
  }
  mesh(new THREE.CylinderGeometry(.75, .83, .16, 64), dark, [0, .08, 0]);
  const body = mesh(new THREE.CylinderGeometry(.54, .6, 2.4, 64), shell, [0, 1.43, 0]);
  const ribGeometry = keep(new THREE.BoxGeometry(.014, 1.97, .018));
  for (let i = 0; i < 80; i++) {
    const angle = i / 80 * Math.PI * 2, radius = .58;
    const rib = new THREE.Mesh(ribGeometry, dark); rib.position.set(Math.sin(angle) * radius, 1.4, Math.cos(angle) * radius); rib.rotation.y = angle; root.add(rib);
  }
  const lowerRing = mesh(new THREE.TorusGeometry(.595, .017, 8, 80), accent, [0, .3, 0]); lowerRing.rotation.x = Math.PI / 2;
  const upperRing = mesh(new THREE.TorusGeometry(.55, .022, 8, 80), accent, [0, 2.65, 0]); upperRing.rotation.x = Math.PI / 2;
  const cap = mesh(new THREE.CylinderGeometry(.55, .55, .13, 64), silver, [0, 2.72, 0]);
  const disk = mesh(new THREE.CylinderGeometry(.43, .43, .045, 64), dark, [0, 2.805, 0]);
  const halo = mesh(new THREE.TorusGeometry(.38, .018, 8, 64), accent, [0, 2.84, 0]); halo.rotation.x = Math.PI / 2;
  parts.push({ object: upperRing, y: 2.65, lift: .35 }, { object: cap, y: 2.72, lift: .7 }, { object: disk, y: 2.805, lift: 1.15 }, { object: halo, y: 2.84, lift: 1.4 });
  const emblem = mesh(new THREE.BoxGeometry(.13, .025, .012), accent, [0, .53, .6]); emblem.name = 'Concept mark';
  return {
    root, shell, body, parts, resources,
    setFinish(id) { if (!PRODUCT_FINISHES[id]) throw new Error('未知产品配色'); shell.color.set(PRODUCT_FINISHES[id].color); },
    update(pose) {
      root.rotation.y = pose.rotation; root.scale.setScalar(.12 + pose.reveal * .88);
      parts.forEach(part => { part.object.position.y = part.y + pose.detail * part.lift; });
      accent.color.setRGB(.32 + pose.pulse * .12, .7 + pose.pulse * .18, .6 + pose.pulse * .14);
    },
    dispose() { root.removeFromParent(); resources.forEach(resource => resource.dispose()); resources.clear(); },
  };
}

export class LaunchContent {
  constructor(layout, { makeScreenTexture } = {}) {
    this.layout = layout; this.screens = []; this.product = null; this.slotId = ''; this.resources = new Set();
    const slot = [...layout.records.values()].find(record => record.element.type === 'slot');
    if (slot) {
      this.product = createLaunchProduct(); this.slotId = slot.element.id;
      this.productRoot = new THREE.Group();
      const scale = Math.min(1.35, slot.element.size[0] / 1.65, slot.element.size[2] / 1.65);
      this.productRoot.scale.setScalar(scale); this.productRoot.add(this.product.root); slot.root.add(this.productRoot);
    }
    for (const record of layout.records.values()) {
      if (record.element.type !== 'screen' || !makeScreenTexture) continue;
      const [width, height, depth] = record.element.size, texture = makeScreenTexture(record.element);
      const geometry = new THREE.PlaneGeometry(width * .94, height * .9);
      const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      const plane = new THREE.Mesh(geometry, material); plane.position.z = depth / 2 + .015;
      record.root.add(plane); this.screens.push({ id: record.element.id, plane, texture });
      [geometry, material, texture].forEach(resource => this.resources.add(resource));
    }
  }
  get warnings() {
    return [!this.product && '舞台没有内容插槽，产品暂不显示；可在搭建器添加插槽。', !this.screens.length && '舞台没有屏幕，文案显示在页面中。'].filter(Boolean);
  }
  dispose() {
    this.product?.dispose(); this.productRoot?.removeFromParent(); this.screens.forEach(screen => screen.plane.removeFromParent());
    this.resources.forEach(resource => resource.dispose()); this.resources.clear();
  }
}
