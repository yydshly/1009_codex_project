// 发布会业务的时间与内容；不属于舞台资产协议。
export const LAUNCH_DURATION = 60;
export const LAUNCH_CUES = [
  { id: 'welcome', start: 0, end: 8, short: '预热', title: '让声音，成为空间的一部分。', caption: '一道光，勾勒一个新想法。', screen: 'A NEW WAY TO LISTEN', programs: ['corners', 'lab-mark', 'corners'], gain: .24, beams: .24, detail: 0 },
  { id: 'reveal', start: 8, end: 24, short: '揭幕', title: 'AURA ONE · 正式亮相', caption: '转动视角，观察原创概念声场装置。', screen: 'MEET AURA ONE', programs: ['orbits', 'light-flower', 'orbits'], gain: .72, beams: .6, detail: 0 },
  { id: 'design', start: 24, end: 44, short: '结构', title: '设计，逐层展开。', caption: '外壳、环形光带与顶部结构，分层展示。', screen: 'DESIGNED IN LAYERS', programs: ['corners', 'orbits', 'corners'], gain: .45, beams: .38, detail: 1 },
  { id: 'experience', start: 44, end: 60, short: '场景', title: '为你的空间，换一种表达。', caption: '选择配色，重播发布流程，或沿用这份舞台开展其他业务。', screen: 'MAKE IT YOUR SPACE', programs: ['light-flower', 'lab-mark', 'light-flower'], gain: .62, beams: .55, detail: 0 },
];
export const clampLaunchTime = seconds => Math.max(0, Math.min(LAUNCH_DURATION, Number.isFinite(seconds) ? seconds : 0));
export function launchCueAt(seconds) {
  const time = clampLaunchTime(seconds);
  return LAUNCH_CUES.find(cue => time >= cue.start && time < cue.end) ?? LAUNCH_CUES.at(-1);
}
const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
export function launchPoseAt(seconds, detailOverride = null) {
  const time = clampLaunchTime(seconds), cue = launchCueAt(time);
  return {
    cue, reveal: smooth((time - 5) / 5),
    detail: detailOverride ?? (smooth((time - 24) / 2) * (1 - smooth((time - 42) / 2))),
    rotation: time * .09, pulse: .5 + .5 * Math.sin(time * 1.7),
  };
}
export function formatLaunchTime(seconds) { const time = Math.floor(clampLaunchTime(seconds)); return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`; }

export class LaunchClock {
  constructor(now = () => performance.now() / 1000) { this.now = now; this.position = 0; this.startedAt = 0; this.active = false; }
  get time() {
    const time = clampLaunchTime(this.position + (this.active ? Math.max(0, this.now() - this.startedAt) : 0));
    if (time >= LAUNCH_DURATION) { this.active = false; this.position = LAUNCH_DURATION; }
    return time;
  }
  get playing() { this.time; return this.active; }
  play() { if (this.time >= LAUNCH_DURATION) this.position = 0; if (!this.active) { this.startedAt = this.now(); this.active = true; } }
  pause() { this.position = this.time; this.active = false; }
  seek(seconds) { this.position = clampLaunchTime(seconds); this.startedAt = this.now(); if (this.position >= LAUNCH_DURATION) this.active = false; }
}

const showCues = new WeakMap();
export function syncLaunchShows(shows, assets, seconds) {
  const time = clampLaunchTime(seconds), cue = launchCueAt(time), local = time - cue.start;
  shows.forEach((show, index) => {
    const id = cue.programs[index % cue.programs.length], data = assets.get(id);
    if (!data) throw new Error(`发布会缺少原创光效：${id}`);
    if (showCues.get(show) !== cue.id) { show.setData(data); show.reset(); showCues.set(show, cue.id); }
    if (local < show.time || local - show.time > .25) show.reset();
    show.playing = true; show.update(Math.max(0, local - show.time)); show.playing = false;
  });
  return cue;
}
