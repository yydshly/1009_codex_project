export function createScreeningRoom(styles, gallery) {
  const $ = selector => document.querySelector(selector);
  const hero = $('#hero-video'), styleVideo = $('#gallery-video'), feature = $('#feature-video');
  const players = [hero, styleVideo, feature];
  const states = new Map(players.map(video => [video, { label:'', status:$('#' + video.id + '-status'), seek:0, request:0 }]));
  states.get(styleVideo).status = $('#gallery-video-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  hero.autoplay = false;
  const pauseAll = except => players.forEach(video => { if (video !== except) video.pause(); });
  const status = (video, text) => { states.get(video).status.textContent = text; };
  function fallback(video, message) {
    const state = states.get(video);
    state.status.textContent = message;
    const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = '重试播放';
    retry.addEventListener('click', () => load(video, video.src, video.poster, state.label, true, state.seek));
    const link = document.createElement('a'); link.href = video.src || gallery; link.target = '_blank'; link.rel = 'noopener'; link.textContent = '打开上游视频 ↗';
    state.status.append(' ', retry, ' ', link);
  }
  function play(video) {
    pauseAll(video);
    const request = ++states.get(video).request;
    video.play().catch(error => {
      if (error.name !== 'AbortError' && request === states.get(video).request && !video.error) {
        status(video, '点击播放器的播放按钮开始观看；默认静音，可开启声音。');
      }
    });
  }
  function load(video, src, poster, label, autoplay, seek = 0) {
    const state = states.get(video);
    state.label = label; state.seek = seek; state.request++;
    clearTimeout(state.timer);
    state.timer = setTimeout(() => { if (video.readyState < 2) fallback(video, '上游视频缓冲较慢，可以重试或打开原视频。'); }, 15000);
    video.poster = poster;
    status(video, seek ? `正在定位到 ${Math.floor(seek / 60)}:${String(Math.floor(seek % 60)).padStart(2,'0')}，等待上游视频缓冲…` : `正在加载${label}真实样片…`);
    video.onloadedmetadata = () => { if (state.seek || video.currentTime > 0) video.currentTime = state.seek; if (autoplay) play(video); };
    if (video.getAttribute('src') !== src) {
      video.pause(); video.preload = autoplay ? 'auto' : 'metadata'; video.src = src; video.load();
      if (autoplay) play(video);
    } else if (video.readyState >= 1) {
      video.currentTime = seek;
      if (autoplay) play(video);
    }
  }
  for (const video of players) {
    const state = states.get(video);
    video.addEventListener('playing', () => { clearTimeout(state.timer); status(video, `${state.label}正在页内播放 · ${video.muted ? '静音，可在播放器开启声音' : '声音已开启'}`); });
    video.addEventListener('play', () => pauseAll(video));
    video.addEventListener('waiting', () => status(video, '正在缓冲上游视频，加载完成后继续播放。'));
    video.addEventListener('seeking', () => status(video, '正在定位画面，等待上游视频缓冲…'));
    video.addEventListener('canplay', () => { if (video.paused) status(video, `${state.label}已加载，可直接播放、开启声音或全屏观看。`); });
    video.addEventListener('error', () => {
      clearTimeout(state.timer); fallback(video, '当前网络未能加载样片。');
    });
  }
  document.addEventListener('play', event => {
    if (event.target instanceof HTMLVideoElement) {
      for (const other of document.querySelectorAll('video')) if (other !== event.target) other.pause();
    }
  }, true);
  const bySlug = slug => styles.find(style => style.slug === slug);
  const poster = style => './' + style.image;
  function showHero(slug, autoplay = true) {
    const style = bySlug(slug); if (!style) return;
    $('#hero-film-name').textContent = style.cn;
    $('#hero-film-title').textContent = style.film;
    $('#hero-film-details').dataset.play = slug;
    document.querySelectorAll('[data-screen]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.screen === slug)));
    load(hero, style.video, poster(style), style.cn, autoplay);
  }
  function styleInfo(slug) {
    const style = bySlug(slug); if (!style) return null;
    $('#inline-style-select').value = slug;
    $('#gallery-screening-title').textContent = style.cn;
    $('#gallery-film-story').textContent = style.line_cn;
    $('#inline-style-details').dataset.play = slug;
    return style;
  }
  function showStyle(slug, scroll = false) {
    const style = styleInfo(slug); if (!style) return;
    load(styleVideo, style.video, poster(style), style.cn, true);
    if (scroll) $('.gallery-screening').scrollIntoView({ behavior:reducedMotion ? 'instant' : 'smooth', block:'center' });
  }
  function showFeature(clip = null) {
    load(feature, gallery + 'films/opuscar98.mp4', clip ? `./assets/upstream/opuscar98/${String(clip.no).padStart(2,'0')}.jpg` : './assets/upstream/feature.jpg', clip ? clip.zh : 'OPUSCAR 98', true, clip?.t0 || 0);
    $('.feature-inline-player').scrollIntoView({ behavior:reducedMotion ? 'instant' : 'smooth', block:'center' });
  }
  const select = $('#inline-style-select');
  for (const style of styles) { const option = document.createElement('option'); option.value = style.slug; option.textContent = style.cn; select.append(option); }
  select.value = 'ink-wash'; styleInfo('ink-wash'); styleVideo.poster = poster(bySlug('ink-wash'));
  select.addEventListener('change', () => showStyle(select.value));
  $('#inline-style-play').addEventListener('click', () => showStyle(select.value));
  $('#inline-feature-play').addEventListener('click', () => showFeature());
  // Each visible player starts once; later playback remains under native controls.
  const started = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || started.has(entry.target)) continue;
      started.add(entry.target); observer.unobserve(entry.target);
      if (entry.target === hero) showHero('ink-wash', !reducedMotion);
      else { const style = bySlug(select.value); load(styleVideo, style.video, poster(style), style.cn, !reducedMotion); }
    }
  }, { threshold:0.35 });
  observer.observe(hero); observer.observe(styleVideo);
  return { showHero, showStyle, showFeature, pauseAll };
}
