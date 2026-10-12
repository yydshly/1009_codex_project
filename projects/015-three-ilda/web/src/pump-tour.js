// Product teaching script belongs to this business, never to the saved stage asset.
export const PUMP_TOUR_DURATION = 108;
export const PUMP_TOUR_CUES = [
  { id: 'overview', start: 0, end: 6, short: '整机', part: 'motor', step: 0, title: '先认识这台泵', narration: '这是由六个主要部件组成的简化泵模型。接下来展开结构，沿着动力和液体的路径逐一观察。', explode: 0, rotation: 18, shell: 'solid', view: 'wide' },
  { id: 'motor', start: 6, end: 21, short: '电机', part: 'motor', step: 1, title: '01 · 驱动电机：动力从这里开始', narration: '电机提供旋转动力。散热片和接线盒帮助识别它；动力通过轴端传给联轴器，再带动泵的转动部件。', explode: .55, rotation: 38, shell: 'solid', view: 'part' },
  { id: 'coupling', start: 21, end: 36, short: '联轴器', part: 'coupling', step: 2, title: '02 · 联轴器：连接两根轴', narration: '联轴器连接电机轴与泵轴，把旋转动力传过去。这里将它向上分离，省略防护罩，方便看清连接关系。', explode: .85, rotation: -18, shell: 'solid', view: 'part' },
  { id: 'seal', start: 36, end: 51, short: '密封', part: 'seal', step: 3, title: '03 · 机械密封：限制轴处泄漏', narration: '机械密封位于泵轴穿过壳体的位置，用来限制这里的泄漏。模型用环形零件表示它的所在位置。', explode: 1, rotation: -42, shell: 'solid', view: 'part' },
  { id: 'impeller', start: 51, end: 66, short: '叶轮', part: 'impeller', step: 4, title: '04 · 叶轮：向液体传递能量', narration: '叶轮是带叶片的转动部件，向液体传递能量。展开并透视外壳后，可以直接观察叶片与中心轴的位置。', explode: .85, rotation: -68, shell: 'transparent', view: 'part' },
  { id: 'casing', start: 66, end: 81, short: '叶轮腔', part: 'casing', step: 5, title: '05 · 叶轮腔：容纳液体并连接出口', narration: '叶轮腔包围叶轮，容纳液体并连接上方出口。这里把复杂蜗壳简化为圆形腔体，方便观察内外关系。', explode: 1, rotation: -34, shell: 'solid', view: 'part' },
  { id: 'inlet', start: 81, end: 96, short: '进水口', part: 'inlet', step: 6, title: '06 · 进水口：液体从轴向进入', narration: '液体从进水口进入叶轮区域，再经叶轮腔汇集至上方出口。法兰与螺栓用来表现这个连接结构。', explode: .8, rotation: 12, shell: 'solid', view: 'part' },
  { id: 'summary', start: 96, end: 108, short: '流向总结', part: 'impeller', step: 0, title: '把六个部件连成完整工作链', narration: '收拢结构后再看流向：电机经联轴器带动叶轮，液体从进水口进入，再向上方出口流动。粒子与转速仅为示意。', explode: 0, rotation: 30, shell: 'transparent', view: 'assembly', flow: true },
];
export const clampPumpTourTime = value => Math.max(0, Math.min(PUMP_TOUR_DURATION, Number.isFinite(value) ? value : 0));
const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
export function pumpTourPoseAt(seconds) {
  const time = clampPumpTourTime(seconds), index = PUMP_TOUR_CUES.findIndex(cue => time >= cue.start && time < cue.end);
  const cue = PUMP_TOUR_CUES[index < 0 ? PUMP_TOUR_CUES.length - 1 : index];
  const previous = PUMP_TOUR_CUES[Math.max(0, PUMP_TOUR_CUES.indexOf(cue) - 1)];
  const transition = smooth((time - cue.start) / 2.6), progress = smooth((time - cue.start) / (cue.end - cue.start));
  return {
    cue, time, selected: cue.part,
    explode: previous.explode + (cue.explode - previous.explode) * transition,
    rotation: (cue.id === 'overview' ? 0 : previous.rotation) + (cue.rotation - (cue.id === 'overview' ? 0 : previous.rotation)) * progress,
    shell: cue.shell, flow: Boolean(cue.flow), view: cue.view,
    cameraAngle: (progress - .5) * 12,
    finished: time >= PUMP_TOUR_DURATION,
  };
}
export function formatPumpTourTime(value) {
  const seconds = Math.floor(clampPumpTourTime(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
export class PumpTourClock {
  constructor(now = () => performance.now() / 1000) { this.now = now; this.position = 0; this.startedAt = 0; this.active = false; }
  get time() {
    const time = clampPumpTourTime(this.position + (this.active ? Math.max(0, this.now() - this.startedAt) : 0));
    if (time >= PUMP_TOUR_DURATION) { this.position = PUMP_TOUR_DURATION; this.active = false; }
    return time;
  }
  get playing() { this.time; return this.active; }
  play() { if (this.time >= PUMP_TOUR_DURATION) this.position = 0; if (!this.active) { this.startedAt = this.now(); this.active = true; } }
  pause() { this.position = this.time; this.active = false; }
  seek(value) { this.position = clampPumpTourTime(value); this.startedAt = this.now(); if (this.position >= PUMP_TOUR_DURATION) this.active = false; }
}
