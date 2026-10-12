import * as THREE from 'three';
import { createPumpModel } from '../../../002-dioramas/web/pump-model.js';
export { parts as PUMP_PARTS } from '../../../002-dioramas/web/pump-parts.js';

// Business adapter only: geometry, part IDs and animation are shared with 002.
export class PumpContent {
  constructor(layout, { makeScreenTexture, slotId } = {}) {
    this.screens = []; this.resources = new Set(); this.warnings = []; this.model = null;
    const slots = [...layout.records.values()].filter(record => record.element.type === 'slot');
    const isProductSlot = record => /产品|展品|商品/.test(record.element.name);
    const slot = slots.find(record => record.element.id === slotId) ?? [...slots].sort((a, b) =>
      Number(isProductSlot(b)) - Number(isProductSlot(a)) ||
      a.element.position[0] ** 2 + a.element.position[2] ** 2 - b.element.position[0] ** 2 - b.element.position[2] ** 2)[0];
    this.slotId = slot?.element.id ?? '';
    if (slot) {
      this.model = createPumpModel(THREE);
      const bounds = new THREE.Box3().setFromObject(this.model.root), size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      this.model.root.position.set(-center.x, -bounds.min.y, -center.z);
      this.productRoot = new THREE.Group();
      // The assembled product fits the slot even while rotating. Exploded parts fan out for teaching.
      const scale = Math.min(1, Math.min(slot.element.size[0], slot.element.size[2]) / Math.hypot(size.x, size.z) * .94);
      this.productRoot.scale.setScalar(scale); this.productRoot.add(this.model.root); slot.root.add(this.productRoot);
    } else this.warnings.push('此舞台没有内容插槽；可在搭建器添加插槽后保存。');
    for (const record of layout.records.values()) {
      if (record.element.type !== 'screen' || !makeScreenTexture) continue;
      const [width, height, depth] = record.element.size, texture = makeScreenTexture(record.element);
      const geometry = new THREE.PlaneGeometry(width * .94, height * .9);
      const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      const screen = new THREE.Mesh(geometry, material); screen.position.z = depth / 2 + .015;
      record.root.add(screen); this.screens.push(screen); [geometry, material, texture].forEach(item => this.resources.add(item));
    }
    if (!this.screens.length) this.warnings.push('此舞台没有屏幕；网页上的部件讲解仍可阅读。');
  }
  select(id) { return this.model?.select(id) ?? false; }
  update(state, dt, time, reducedMotion) {
    if (!this.model) return;
    this.productRoot.rotation.y = state.rotation * Math.PI / 180;
    return this.model.update({ ...state, dt, time, reducedMotion });
  }
  pick(raycaster, shell) {
    if (!this.model) return null;
    const hits = raycaster.intersectObjects(this.model.pickable, false);
    return (hits.find(hit => shell !== 'transparent' || hit.object.userData.partId !== 'casing') ?? hits[0])?.object.userData.partId ?? null;
  }
  bounds() { return this.model ? new THREE.Box3().setFromObject(this.productRoot) : null; }
  partBounds(id) {
    const group = this.model?.partGroups.get(id);
    return group ? new THREE.Box3().setFromObject(group) : this.bounds();
  }
  dispose() {
    this.model?.dispose(); this.productRoot?.removeFromParent(); this.screens.forEach(screen => screen.removeFromParent());
    this.resources.forEach(resource => resource.dispose()); this.resources.clear(); this.screens = []; this.model = null;
  }
}
