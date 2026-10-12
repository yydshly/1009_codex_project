import { validateStage } from './stage-definition.js';

export const stageUsesEffects = stage => stage?.effectMode === 'stage';
export const stageEffectIds = stage => [...new Set(stage.objects.filter(object => object.type === 'laser').map(object => object.program))];

export function assignStageEffect(stage, program, target = 'all') {
  const devices = stage.objects.filter(object => object.type === 'laser' && (target === 'all' || object.id === target));
  if (!devices.length) throw new Error('请先添加或选择激光设备');
  return validateStage({ ...stage, effectMode: 'stage', objects: stage.objects.map(object => devices.includes(object) ? { ...object, program } : object) });
}

const assigned = new WeakMap();
// 两种业务借用各自的时钟推进已保存效果，不按业务段落替换节目或设备参数。
export function syncConfiguredEffects(layout, assets, seconds, catalog = []) {
  const time = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  for (const record of layout.records.values()) {
    if (!record.show) continue;
    const { show, element } = record, data = assets.get(element.program);
    if (!data) throw new Error(`缺少展台效果：${element.program}`);
    const track = catalog.find(entry => entry.id === element.program)?.track ?? data.tracks.keys().next().value;
    const previous = assigned.get(show);
    if (previous?.data !== data || previous?.track !== track || show.asset !== data || show.track !== track) {
      show.setData(data, track); show.reset(); assigned.set(show, { data, track });
    }
    if (time < show.time || time - show.time > .25) show.reset();
    show.playing = true; show.update(Math.max(0, time - show.time)); show.playing = false;
    show.intensity = element.intensity; show.beamIntensity = element.beamIntensity;
    show.zoom = 1; show.rotation.set(0, 0, 0);
  }
}

export function stageEffectSummary(stage, catalog) {
  if (!stageUsesEffects(stage)) return '光效来源：业务编排';
  const names = stageEffectIds(stage).map(id => catalog.find(entry => entry.id === id)?.name ?? id);
  return `沿用展台效果：${names.join(' / ') || '尚无激光设备'}`;
}
