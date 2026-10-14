// Local prerecorded narration. Loading a chapter never starts playback.
import {timedStorySubtitle} from './story-observation.js';
const defaultManifestURL = new URL('./assets/audio/history-story/manifest.json', import.meta.url);
const beatIds = ['background', 'process', 'impact'];
const manifests=new Map();
function readManifest(url) {
 const key=String(url);
 if(!manifests.has(key))manifests.set(key,fetch(url).then(response=>{
  if(!response.ok)throw new Error('Narration manifest unavailable');
  return response.json();
 }).catch(error=>{manifests.delete(key);throw error;}));
 return manifests.get(key);
}

export function createHistoryStoryAudio({onState = () => {}, onTime = () => {}, onEnded = () => {}, manifestURL = defaultManifestURL} = {}) {
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.9;
  let status = 'idle', current = null, event = null, beat = null, sequence = 0;
  let frame = 0, pendingSeek = null, disposed = false, message = '';
  const duration = () => Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : current?.duration || 0;
  const time = () => Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const subtitle = () => timedStorySubtitle(current?.subtitles,time()*1000);
  const snapshot = () => ({event, beat, state: status, time: time(), duration: duration(), fraction: duration() ? Math.min(1, time() / duration()) : 0, available: !!current && status !== 'error', muted: audio.muted, subtitle: subtitle(), message});
  const changed = value => { status = value; onState(snapshot()); };
  const stopFrames = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
  function tick() {
    frame = 0;
    if (disposed || audio.paused || status !== 'playing') return;
    onTime(snapshot());
    frame = requestAnimationFrame(tick);
  }
  function applySeek() {
    if (pendingSeek === null || !Number.isFinite(audio.duration) || !audio.duration) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, pendingSeek * audio.duration));
    pendingSeek = null;
    onTime(snapshot());
  }
  function isCurrentSource() {
    return current && audio.currentSrc === new URL(current.file, manifestURL).href;
  }
  audio.addEventListener('loadedmetadata', () => {
    if (!isCurrentSource()) return;
    applySeek();
    if (status === 'loading') changed('ready');
    onTime(snapshot());
  });
  audio.addEventListener('timeupdate', () => { if (current) onTime(snapshot()); });
  audio.addEventListener('pause', () => {
    stopFrames();
    if (status === 'playing' && !audio.ended) changed('paused');
  });
  audio.addEventListener('ended', () => {
    stopFrames();
    if (!isCurrentSource()) return;
    changed('ended');
    onTime(snapshot());
    onEnded(snapshot());
  });
  audio.addEventListener('error', () => {
    if (!current || disposed || !audio.src || (audio.currentSrc && !isCurrentSource())) return;
    stopFrames();
    message = '旁白暂不可用，可继续阅读字幕。';
    changed('error');
  });

  return {
    async load(eventId, beatId) {
      const nextBeat = typeof beatId === 'number' ? beatIds[beatId] : typeof beatId === 'object' ? beatId?.id : beatId;
      if (!disposed && current && event === eventId && beat === nextBeat && status !== 'error') return snapshot();
      const version = ++sequence;
      audio.pause(); stopFrames();
      audio.removeAttribute('src'); audio.load();
      current = null; event = eventId; beat = nextBeat; pendingSeek = null; message = '';
      if (disposed) return snapshot();
      changed('loading');
      try {
        const manifest = await readManifest(manifestURL);
        if (disposed || version !== sequence) return snapshot();
        current = manifest.clips.find(clip => clip.event === eventId && clip.beat === nextBeat) || null;
        if (!current) throw new Error('Unknown narration chapter');
        audio.src = new URL(current.file, manifestURL).href;
        audio.load();
        return snapshot();
      } catch {
        if (disposed || version !== sequence) return snapshot();
        current = null;
        message = '旁白暂不可用，可继续阅读字幕。';
        changed('error');
        return snapshot();
      }
    },
    async play() {
      if (disposed || !current || status === 'error') return false;
      const version = sequence;
      if (audio.ended) audio.currentTime = 0;
      try {
        await audio.play();
        if (disposed || version !== sequence || audio.paused) return false;
        message = '';
        changed('playing');
        stopFrames(); frame = requestAnimationFrame(tick);
        return true;
      } catch (error) {
        if (disposed || version !== sequence) return false;
        // An interrupted play is expected when changing chapters or pausing.
        if (error?.name === 'AbortError') return false;
        message = error?.name === 'NotAllowedError' ? '点击播放即可开启旁白。' : '旁白暂不可用，可继续阅读字幕。';
        changed(error?.name === 'NotAllowedError' ? 'paused' : 'error');
        return false;
      }
    },
    pause() {
      audio.pause(); stopFrames();
      if (current && !['error', 'ended'].includes(status)) changed('paused');
    },
    seek(fraction) {
      if (disposed || !current || !Number.isFinite(Number(fraction))) return false;
      pendingSeek = Math.max(0, Math.min(1, Number(fraction)));
      applySeek();
      if (status === 'ended') changed('paused');
      return true;
    },
    stop() {
      ++sequence;
      audio.pause(); stopFrames(); pendingSeek = null;
      audio.removeAttribute('src'); audio.load();
      current = null; event = null; beat = null; message = '';
      changed('idle'); onTime(snapshot());
    },
    dispose() { this.stop(); disposed = true; },
    get state() { return status; },
    get time() { return time(); },
    get duration() { return duration(); },
    get available() { return !!current && status !== 'error'; },
    setMuted(value) { audio.muted = Boolean(value); onState(snapshot()); },
    get muted() { return audio.muted; },
    set muted(value) { audio.muted = Boolean(value); onState(snapshot()); },
    get subtitle() { return subtitle(); },
    get subtitles() { return current?.subtitles || []; },
    get snapshot() { return snapshot(); }
  };
}
