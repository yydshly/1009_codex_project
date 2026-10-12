// 可复用的舞台与光效资产，不包含歌曲、时间线、角色或演出状态。
export const STAGE_STORAGE_KEY = 'three-ilda:stage-layout:v1';
export const ELEMENT_TYPES = { platform: '台面', screen: '屏幕占位', truss: '立柱', slot: '内容插槽', laser: '激光设备' };
export const MAX_ELEMENTS = 24;

export function createElement(type, id) {
  if (!Object.hasOwn(ELEMENT_TYPES, type)) throw new Error('未知舞台构件');
  const defaults = {
    platform: { position: [0, .25, 0], size: [14, .5, 10], color: '#122238', shape: 'rect' },
    screen: { position: [0, 3.5, -3], size: [12, 5, .15], color: '#183753' },
    truss: { position: [-7, 3, -3], size: [.3, 6, .3], color: '#56717d' },
    slot: { position: [0, .6, 1], size: [2, .15, 2], color: '#d1a66b' },
    laser: { position: [0, 3.5, -1.5], size: [4.3, 2.9, .1], color: '#8abbe2', program: 'light-flower', aperture: [0, -2.8, 7], pointRate: 9000, intensity: 1.4, beamIntensity: .65 },
  };
  return { id, type, name: ELEMENT_TYPES[type], rotationY: 0, ...structuredClone(defaults[type]) };
}

export function createDefaultStage() {
  const objects = [createElement('platform', 'deck'), createElement('screen', 'backdrop'), createElement('slot', 'content')];
  for (let i = 0; i < 3; i++) {
    const laser = createElement('laser', `laser-${i + 1}`);
    laser.name = `激光设备 ${i + 1}`; laser.position[0] = (i - 1) * 4.35;
    laser.aperture[0] = (1 - i) * 2.1;
    laser.program = ['corners', 'light-flower', 'orbits'][i]; objects.push(laser);
  }
  return { kind: 'ilda-virtual-stage', version: 1, name: '我的光效舞台', theme: 'midnight', objects };
}

function text(value, label, max = 80) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label}须为 1–${max} 字的文本`);
  return value.trim();
}
function number(value, label, min, max) {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${label}须在 ${min}–${max} 之间`);
  return value;
}
function vector(value, label, limits) {
  if (!Array.isArray(value) || value.length !== 3) throw new Error(`${label}须有三个坐标`);
  return value.map((v, i) => number(v, label, ...limits[i]));
}

// 只取已知字段；任意 URL、脚本与演出内容都不会成为加载指令。
export function validateStage(input) {
  if (!input || input.kind !== 'ilda-virtual-stage' || input.version !== 1) throw new Error('不是受支持的舞台配置（version 1）');
  if (!['midnight', 'gallery'].includes(input.theme)) throw new Error('未知舞台背景');
  const effectMode = input.effectMode ?? 'business';
  if (!['stage', 'business'].includes(effectMode)) throw new Error('未知光效接入方式');
  if (!Array.isArray(input.objects) || input.objects.length > MAX_ELEMENTS) throw new Error(`舞台最多容纳 ${MAX_ELEMENTS} 个构件`);
  const ids = new Set();
  const objects = input.objects.map(object => {
    if (!object || !Object.hasOwn(ELEMENT_TYPES, object.type)) throw new Error('未知舞台构件');
    const id = text(object.id, '构件 ID');
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) throw new Error('构件 ID 格式错误或重复');
    ids.add(id);
    if (typeof object.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(object.color)) throw new Error('颜色须为六位十六进制');
    const result = {
      id, type: object.type, name: text(object.name, '构件名称'), color: object.color,
      position: vector(object.position, '位置', [[-30, 30], [0, 20], [-30, 30]]),
      size: vector(object.size, '尺寸', [[.1, 30], [.1, 20], [.1, 30]]),
      rotationY: number(object.rotationY, '朝向', -180, 180),
    };
    if (object.type === 'platform') {
      if (!['rect', 'round'].includes(object.shape)) throw new Error('未知台面形状');
      result.shape = object.shape;
    }
    if (object.type === 'laser') {
      const program = text(object.program, '节目 ID');
      if (!/^[a-z0-9-]+$/.test(program)) throw new Error('节目 ID 格式错误');
      Object.assign(result, {
        program, aperture: vector(object.aperture, '局部出光口', [[-30, 30], [-20, 20], [.1, 30]]),
        pointRate: number(object.pointRate, '点率', 100, 50000),
        intensity: number(object.intensity, '轨迹亮度', 0, 5),
        beamIntensity: number(object.beamIntensity, '光束亮度', 0, 2),
      });
    }
    return result;
  });
  // 缺省保留旧文件的业务编排行为；显式接入方式随项目及 JSON 保存。
  return { kind: input.kind, version: 1, name: text(input.name, '舞台名称'), theme: input.theme, ...(input.effectMode === undefined ? {} : { effectMode }), objects };
}

export function serializeStage(stage) { return JSON.stringify(validateStage(stage), null, 2); }
export function saveStage(storage, stage) { storage.setItem(STAGE_STORAGE_KEY, serializeStage(stage)); }
export function loadStage(storage) {
  try {
    const saved = storage.getItem(STAGE_STORAGE_KEY);
    return { stage: saved ? validateStage(JSON.parse(saved)) : createDefaultStage(), saved: Boolean(saved), warning: '' };
  } catch (error) {
    return { stage: createDefaultStage(), saved: false, warning: `保存的配置无法读取，已加载默认舞台：${error.message}` };
  }
}
