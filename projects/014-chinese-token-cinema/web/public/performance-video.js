// Real online-generated performance clips. The original song remains the clock.
// A clip is never looped or stretched to cover different lyrics.
export function createPerformanceTrack(clips = [], duration, invalidate = () => {}) {
  let previousEnd = 0, current = null, playing = false;
  const entries = clips.map(clip => {
    if (!clip.src || !Number.isFinite(clip.start) || !Number.isFinite(clip.end) ||
        clip.start < previousEnd || clip.end <= clip.start || clip.end > duration ||
        !Number.isFinite(clip.offset ?? 0) || (clip.offset ?? 0) < 0) {
      throw new Error('人物视频片段的时间或来源无效');
    }
    previousEnd = clip.end;
    const video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.preload = 'auto';
    video.src = clip.src;
    let loaded;
    const entry = {...clip, offset: clip.offset ?? 0, video, pending: null};
    entry.load = () => loaded ??= new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout);
        video.removeEventListener('loadeddata', ready);
        video.removeEventListener('error', failed);
      };
      const ready = () => {
        cleanup();
        // Provider encoding can trim at most a few terminal frames; never retime the clip.
        if (entry.offset + entry.end - entry.start > video.duration + .1) {
          reject(new Error('人物视频短于对应的唱词：' + clip.src));
        } else resolve();
      };
      const failed = () => { cleanup(); reject(new Error('人物视频加载失败：' + clip.src)); };
      const timeout = setTimeout(failed, 20000);
      if (video.readyState >= 2) ready();
      else {
        video.addEventListener('loadeddata', ready, {once:true});
        video.addEventListener('error', failed, {once:true});
        video.load();
      }
    });
    return entry;
  });
  const at = t => entries.find(entry => t >= entry.start && t < entry.end) ?? null;
  const localTime = (entry, t) => Math.max(0, Math.min(entry.video.duration - .001, t - entry.start + entry.offset));
  async function seek(entry, target) {
    if (entry.pending) await entry.pending;
    if (Math.abs(entry.video.currentTime - target) < .001 && !entry.video.seeking) return;
    entry.pending = new Promise((resolve, reject) => {
      const video = entry.video;
      const cleanup = () => {
        clearTimeout(timeout);
        video.removeEventListener('seeked', complete);
        video.removeEventListener('error', failed);
      };
      const complete = () => { cleanup(); resolve(); };
      const failed = () => { cleanup(); reject(new Error('人物视频定位失败：' + entry.src)); };
      const timeout = setTimeout(failed, 10000);
      video.addEventListener('seeked', complete, {once:true});
      video.addEventListener('error', failed, {once:true});
      video.currentTime = target;
    });
    try { await entry.pending; } finally { entry.pending = null; }
  }
  function activate(t) {
    const entry = at(t);
    if (entry !== current) { current?.video.pause(); current = entry; }
    return entry;
  }
  return {
    get count() { return entries.length; },
    inspect(t) {
      const entry=at(t);
      return entry?{source:entry.source,src:entry.src,localTime:entry.video.currentTime,targetTime:localTime(entry,t),paused:entry.video.paused,ready:entry.video.readyState>=2,error:entry.error?.message??null}:null;
    },
    frameAt(t) {
      const entry = at(t);
      return entry?.video.readyState >= 2 && !entry.video.seeking ? entry.video : null;
    },
    protectedRegionsAt(t) { return at(t)?.protectedRegions; },
    sync(t, isPlaying) {
      playing = isPlaying;
      const entry = activate(t);
      if (!entry) return;
      if (!isPlaying) entry.video.pause();
      if (entry.updating) return;
      entry.updating = true;
      entry.load().then(async () => {
        const target = localTime(entry, t);
        if (Math.abs(entry.video.currentTime - target) > (isPlaying ? .12 : .025)) await seek(entry, target);
        if (current === entry && playing) await entry.video.play();
        invalidate();
      }).catch(error => { entry.error = error; }).finally(() => { entry.updating = false; });
    },
    async prepareFrame(t) {
      playing = false;
      const entry = activate(t);
      if (!entry) return;
      entry.video.pause();
      await entry.load();
      await seek(entry, localTime(entry, t));
      if (entry.error) throw entry.error;
    },
    pause() { playing = false; entries.forEach(entry => entry.video.pause()); },
  };
}
