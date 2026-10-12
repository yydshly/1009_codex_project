export const STAGE_DURATION = 90;
export const STAGE_BPM = 112;
export const STAGE_CUES = [
  { id: 'arrival', name: '开场 · 进入光的空间', start: 0, end: 10, short: '开场', caption: '光线从舞台两侧聚拢，演出即将开始。', programs: ['corners', 'lab-mark', 'corners'], gain: .3, bloom: 3, beams: .45 },
  { id: 'verse', name: '主歌 · 靠近音乐情绪', start: 10, end: 30, short: '主歌', caption: '曲线与轨道缓慢展开，换个视角靠近舞台。', programs: ['orbits', 'light-flower', 'orbits'], gain: .48, bloom: 5, beams: .6 },
  { id: 'chorus', name: '副歌 · 让舞台展开', start: 30, end: 50, short: '副歌', caption: '舞台里的投影机随节拍展开。点击应援，点亮一次舞台。', programs: ['light-flower', 'corners', 'light-flower'], gain: .8, bloom: 8, beams: 1.2 },
  { id: 'journey', name: '间奏 · 穿行音乐意境', start: 50, end: 70, short: '间奏', caption: '让镜头自动巡游，或切换星海与霓虹城市主题。', programs: ['orbits', 'light-flower', 'orbits'], gain: .6, bloom: 6, beams: .95 },
  { id: 'finale', name: '结束 · 光线收束', start: 70, end: 90, short: '结束', caption: '光线逐渐收束。可以重播，也可以回到产品记录继续研究。', programs: ['corners', 'lab-mark', 'corners'], gain: .42, bloom: 4, beams: .65 },
];
export function clampStageTime(seconds) { return Math.min(STAGE_DURATION, Math.max(0, Number.isFinite(seconds) ? seconds : 0)); }
export function stageCueAt(seconds) {
  const time = clampStageTime(seconds);
  return STAGE_CUES.find(cue => time >= cue.start && time < cue.end) ?? STAGE_CUES.at(-1);
}
export function beatPulseAt(seconds) { return Math.exp(-((clampStageTime(seconds) * STAGE_BPM / 60) % 1) * 6); }
export function stageEnvelopeAt(seconds) {
  const time = clampStageTime(seconds);
  return Math.min(1, time / 3, (STAGE_DURATION - time) / 4);
}
export function formatStageTime(seconds) {
  const time = Math.floor(clampStageTime(seconds));
  return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
}

// 每台 LaserShow 对齐同一个音频时间；跳段时重新扫描，普通播放只补算差值。
const showCues = new WeakMap();
export function syncStageShows(shows, assets, seconds) {
  const time = clampStageTime(seconds), cue = stageCueAt(time), localTime = time - cue.start;
  shows.forEach((show, index) => {
    const id = cue.programs[index % cue.programs.length];
    const asset = assets.get(id);
    if (!asset) throw new Error(`缺少原创节目：${id}`);
    if (showCues.get(show) !== cue.id) { show.setData(asset); show.reset(); showCues.set(show, cue.id); }
    if (localTime < show.time || localTime - show.time > .25) show.reset();
    show.playing = true;
    show.update(Math.max(0, localTime - show.time));
    show.playing = false;
  });
  return cue;
}
