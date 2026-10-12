import * as THREE from 'three';
import { LaserShow } from '../vendor/three-ilda/src/webgl.js';
import { validateStage } from './stage-definition.js';

// 编辑器和演出示例共用此装配器。装配器不获取音频、不运行时间线。
export class StageLayout {
  constructor(scene, pipeline, { showSlots = true } = {}) {
    this.scene = scene; this.pipeline = pipeline; this.showSlots = showSlots;
    this.records = new Map();
  }
  build(definition) {
    const stage = validateStage(definition);
    this.dispose();
    stage.objects.forEach(element => this.add(element));
    return stage;
  }
  add(element) {
    this.remove(element.id);
    const root = new THREE.Group(); root.name = element.name; root.userData.elementId = element.id;
    root.position.set(...element.position); root.rotation.y = THREE.MathUtils.degToRad(element.rotationY);
    const resources = new Set();
    const keep = resource => { resources.add(resource); return resource; };
    const mesh = (geometry, color, wireframe = false, parent = root) => {
      const object = new THREE.Mesh(keep(geometry), keep(new THREE.MeshBasicMaterial({ color, wireframe })));
      parent.add(object); return object;
    };
    const edge = (geometry, color, parent = root) => {
      const object = new THREE.LineSegments(keep(new THREE.EdgesGeometry(geometry)), keep(new THREE.LineBasicMaterial({ color })));
      parent.add(object); return object;
    };
    let show;
    const [width, height, depth] = element.size;
    if (element.type === 'laser') {
      show = new LaserShow(null, { capacity: 1536, width, height });
      show.pointRate = element.pointRate; show.intensity = element.intensity; show.beamIntensity = element.beamIntensity;
      show.lightDecay = .89; show.beamMode = 'Front'; show.projector.position.set(...element.aperture); show.playing = false;
      root.add(show); this.pipeline?.add(show);
      const box = mesh(new THREE.BoxGeometry(.32, .2, .4), '#253a50'); box.position.set(...element.aperture); box.position.z += .2;
      const aperture = mesh(new THREE.SphereGeometry(.045, 10, 8), element.color); aperture.position.set(...element.aperture);
      // 虚线轮廓标识投影面，演出业务不显示编辑辅助线。
      if (this.showSlots) { const plane = keep(new THREE.PlaneGeometry(width, height)); edge(plane, '#23425a'); }
    } else if (element.type === 'platform' && element.shape === 'round') {
      const object = mesh(new THREE.CylinderGeometry(.5, .5, 1, 64), element.color);
      object.scale.set(width, height, depth);
      const rim = edge(object.geometry, '#426371'); rim.scale.copy(object.scale);
    } else if (element.type === 'slot') {
      if (this.showSlots) { const geometry = keep(new THREE.BoxGeometry(width, height, depth)); edge(geometry, element.color); }
    } else {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      mesh(geometry, element.color); edge(geometry, element.type === 'screen' ? '#507f91' : '#426371');
    }
    this.scene.add(root);
    const record = { root, show, element: structuredClone(element), resources };
    this.records.set(element.id, record); return record;
  }
  setProgram(id, asset, track) {
    const record = this.records.get(id);
    if (!record?.show) throw new Error('该构件不是激光设备');
    record.show.setData(asset, track ?? asset.tracks.keys().next().value); record.show.playing = false;
  }
  get shows() { return [...this.records.values()].filter(record => record.show).map(record => record.show); }
  remove(id) {
    const record = this.records.get(id); if (!record) return;
    if (record.show) { this.pipeline?.remove(record.show); record.show.dispose(); }
    record.resources.forEach(resource => resource.dispose());
    this.scene.remove(record.root); this.records.delete(id);
  }
  dispose() { [...this.records.keys()].forEach(id => this.remove(id)); }
}
