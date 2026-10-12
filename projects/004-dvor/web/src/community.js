import * as THREE from 'three';
import { Batch, M, decal, V } from './vendor/world/kit.js';
import { buildPlanet, bakeToPlanet } from './vendor/world/planet.js';
import { buildTrees, buildShrubs } from './vendor/world/nature.js';
import { buildPlayground, bench } from './vendor/world/yard.js';
import { communityStops } from './content.js';

/** New fictional community layout; shared geometry, materials and projection are Dvor MIT code. */
export function buildCommunity(scene) {
  const root = new THREE.Group();
  root.name = 'community';
  scene.add(root);
  const colliders = [], pads = [], interactables = [], ticks = [], after = [];
  const ctx = {
    root, scene, add: object => root.add(object),
    collide: (x0, z0, x1, z1, top) => colliders.push({ x0, z0, x1, z1, top }),
    pad: (x0, z0, x1, z1, top) => pads.push({ x0, z0, x1, z1, top }),
    interact: (hitbox, label, action) => interactables.push({ hitbox, label, action }),
    inscription: (hitbox, note) => interactables.push({ hitbox, label: '阅读社区说明', note }),
    tick: fn => ticks.push(fn), afterBake: fn => after.push(fn),
  };
  const b = new Batch();
  const paving = M(0xbab8a6), wall = M(0xe4d4af), roof = M(0x467f78), wood = M(0xa47751);
  const ground = M(0x98b468), kerb = M(0xe5ddc6), glass = M(0x7da3ac, { bands: 2 });
  b.slab(-37, -5, 37, 85, -0.06, 0.02, ground, { cast: false });
  b.slab(-3, -4, 3, 79, 0.02, 0.09, paving, { cast: false });
  b.slab(-31, 31, 28, 35, 0.02, 0.09, paving, { cast: false });
  b.slab(-30, 39, -5, 42, 0.02, 0.10, paving, { cast: false });
  ctx.pad(-3, -4, 3, 79, 0.09);
  ctx.pad(-31, 31, 28, 35, 0.09);
  for (const x of [-3.2, 3.2]) b.box(0.16, 0.18, 80, kerb, x, 0, 37, 0, 0, 0, { cast: false });
  for (let z = 12; z < 77; z += 5) b.box(5.6, 0.014, 0.04, M(0x929b88), 0, 0.096, z, 0, 0, 0, { cast: false });

  // Entrance gate, with a bilingual-readable sign rendered using Canvas2D.
  for (const x of [-5.5, 5.5]) {
    b.box(0.5, 5.3, 0.6, wood, x, 0, 9);
    ctx.collide(x - 0.3, 8.6, x + 0.3, 9.4);
  }
  b.box(12.5, 0.45, 0.9, roof, 0, 5, 9);
  addSign(communityStops[0], '柳荫里', '社区开放日 / COMMUNITY OPEN DAY', 8.2, 1.65, 0, 4.08, 8.48);

  // Community noticeboard.
  for (const x of [-9.7, -6.3]) b.box(0.13, 2.5, 0.13, wood, x, 0, 26.15);
  b.box(4.2, 0.17, 0.7, roof, -8, 3.05, 26);
  addSign(communityStops[1], '今日活动', '10:00 旧物交换\n14:00 庭院故事\n欢迎走进邻里书屋', 3.8, 2.15, -8, 1.93, 25.8);
  ctx.collide(-10.1, 25.8, -5.9, 26.4);

  // Reading room: repeated structural bays, glass panes and visible book spines.
  const lx = -20, lz = 49;
  b.box(19.2, 0.28, 12.3, kerb, lx, 0.02, lz);
  b.box(19, 6.2, 0.35, wall, lx, 0.3, lz + 5.8);
  for (const x of [-29.35, -10.65]) b.box(0.3, 6.2, 12, wall, x, 0.3, lz);
  b.box(19, 1.3, 0.35, wall, lx, 5.2, 43.05);
  b.box(21, 0.34, 14.2, roof, lx, 6.5, lz, 0, 0, -0.018);
  b.box(20, 0.16, 14, M(0xd4a274), lx, 6.35, lz);
  b.box(0.22, 4.9, 0.38, wood, -25.2, 0.3, 42.9);
  for (let x = -23.6; x <= -12; x += 3.2) {
    b.box(0.12, 4.9, 0.38, wood, x, 0.3, 42.9);
    b.box(3, 2.6, 0.04, glass, x + 1.56, 2.5, 42.95);
  }
  b.box(19, 0.15, 0.35, wood, lx, 2.4, 42.9);
  b.box(3.6, 0.12, 2, M(0xb9af97), -27, 0.16, 42);
  ctx.pad(-28.8, 41, -25.2, 43, 0.28);
  ctx.collide(-29.5, 43, -10.5, 55.2);
  for (const sx of [-22, -15.5]) {
    for (let row = 0; row < 3; row++) {
      b.box(4.9, 0.10, 0.55, wood, sx, 0.6 + row * 0.65, 43.2);
      for (let i = 0; i < 16; i++) {
        const colors = [0xcb6654, 0x668e85, 0xcfa864, 0xded1ab];
        b.box(0.18, 0.34 + (i % 3) * 0.06, 0.23, M(colors[(i + row) % 4]), sx - 2.1 + i * 0.27, 0.71 + row * 0.65, 43.1);
      }
    }
  }
  addSign(communityStops[2], '邻里书屋', 'READING ROOM', 5.2, 0.85, -20, 5.9, 42.72);
  const doorSign = decal(root, signTexture('欢迎阅读', '09:00—18:00'), 1.15, 0.65, -28.1, 1.75, 42.7, Math.PI);
  ctx.inscription(doorSign, communityStops[2]);

  // A small shaded rest area; benches reuse the upstream parametric builder.
  for (const [x, z, angle] of [[15, 43, 0], [23, 48, -Math.PI / 2], [16, 52, Math.PI]]) bench(ctx, x, z, angle);
  addSign(communityStops[3], '树荫下，慢一点', 'TAKE A BREAK', 3.1, 0.75, 18, 1.55, 44);
  b.box(0.10, 1.6, 0.10, wood, 16.6, 0, 44.1);
  b.box(0.10, 1.6, 0.10, wood, 19.4, 0, 44.1);
  b.cyl(1.1, 1.1, 0.12, 20, wood, 20, 0.85, 46);
  b.cyl(0.12, 0.18, 0.8, 8, M(0x667c69), 20, 0.4, 46);

  // Residential context remains deliberately simple and reproducible.
  for (const [x, z, w, floors] of [[-43, 60, 11, 4], [0, 92, 42, 4], [43, 63, 12, 3]]) {
    b.box(w, floors * 2.8, 11, M(0xc9bc9b), x, 0, z);
    b.box(w + 0.6, 0.3, 11.6, roof, x, floors * 2.8, z);
    for (let row = 0; row < floors; row++) for (let col = 0; col < Math.floor(w / 3); col++) {
      const wx = x - w / 2 + 1.5 + col * 3;
      b.box(1.6, 1.4, 0.05, M(row % 2 ? 0x769798 : 0x879d8e), wx, 0.8 + row * 2.8, z - 5.55);
      b.box(0.08, 1.5, 0.08, kerb, wx, 0.75 + row * 2.8, z - 5.62);
    }
    ctx.collide(x - w / 2, z - 5.5, x + w / 2, z + 5.5);
  }
  for (const x of [-33, 32]) for (let z = 15; z <= 77; z += 5) {
    b.box(0.09, 1.2, 0.09, roof, x, 0, z);
    b.box(0.09, 0.06, 4.9, roof, x, 1.06, z + 2.5);
  }
  b.flush(root, 'community-static');
  buildPlayground(ctx);
  buildTrees(ctx, [
    { x: -17, z: 18, kind: 'maple', seed: 1, scale: 1.1 }, { x: 17, z: 19, kind: 'maple', seed: 2 },
    { x: -31, z: 34, seed: 3, scale: 0.9 }, { x: 30, z: 36, seed: 4, scale: 0.9 },
    { x: 20, z: 54, kind: 'maple', seed: 5, scale: 1.25 }, { x: 29, z: 57, seed: 6 },
    { x: -29, z: 66, seed: 7, scale: 0.95 }, { x: -13, z: 68, kind: 'maple', seed: 8 },
    { x: 9, z: 75, seed: 9 }, { x: 30, z: 76, seed: 10 },
  ]);
  buildShrubs(ctx, [[-31, 15, -31, 29, 10], [29, 15, 29, 29, 11], [-29, 62, -11, 62, 12]]);
  buildPlanet(scene);
  const stats = bakeToPlanet(root);
  after.forEach(fn => fn());

  return {
    root, colliders, interactables, stats, bounds: { z0: -4, z1: 82 },
    heightAt(x, z, currentY = 0) {
      let height = 0.04;
      for (const pad of pads) if (x >= pad.x0 && x <= pad.x1 && z >= pad.z0 && z <= pad.z1 && pad.top <= currentY + 0.45) height = Math.max(height, pad.top);
      return height;
    },
    update: dt => ticks.forEach(fn => fn(dt)),
  };

  function addSign(note, title, text, width, height, x, y, z) {
    const sign = decal(root, signTexture(title, text), width, height, x, y, z, Math.PI);
    ctx.inscription(sign, note);
  }
}

function signTexture(title, text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f6ead0'; ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = '#315749'; ctx.lineWidth = 20; ctx.strokeRect(20, 20, 984, 472);
  ctx.fillStyle = '#315749'; ctx.textAlign = 'center';
  ctx.font = '600 100px Microsoft YaHei, sans-serif'; ctx.fillText(title, 512, 163);
  ctx.font = '42px Microsoft YaHei, sans-serif';
  const lines = text.split('\n');
  lines.forEach((line, i) => ctx.fillText(line, 512, 280 + i * 70));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
