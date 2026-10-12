import { createScreeningRoom } from './screening.js';
import { initOverview } from './overview.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const ref = 'a75e2b3384cded87955c8743b5a59db06ea491a8';
const repository = `https://github.com/lemomo-ai/lemo-opuscar/blob/${ref}/`;
const gallery = 'https://lemomo-ai.github.io/lemo-opuscar/';
const time = seconds => { const total = Math.round(seconds); return `${Math.floor(total / 60)}:${String(total % 60).padStart(2,'0')}`; };
const useNames = {
  'Picture books':'绘本','Bedtime stories':'睡前故事',"Kids' learning":'儿童学习','Nature documentary':'自然纪录','Travel':'旅行','Science explainers':'科学讲解','Wuxia':'武侠','Cultural brands':'文化品牌','Poetry':'诗歌','Music videos':'音乐视频','Art & culture':'艺术文化','Emotional ads':'情绪广告','Brand stories':'品牌故事','Life milestones':'人生纪念','Minimal ads':'极简广告','Explainers':'知识讲解','Online courses':'在线课程','Science':'科学','City & travel':'城市旅行','Architecture':'建筑','Lifestyle brands':'生活品牌','Myths & folklore':'神话民俗','Heritage':'文化传承','Festivals':'节日','Japanese culture':'日本文化','Lunar New Year':'春节','Festive greetings':'节日祝福','Folk tales':'民间故事','Gift brands':'礼品品牌','Cultural stories':'文化故事','Indie brands':'独立品牌','Zines':'独立刊物','Lifestyle':'生活方式','Humour':'幽默','Pet content':'宠物内容','Social shorts':'社交短片','Craft brands':'手工品牌','Book trailers':'图书预告','Museum labels':'博物馆展示','Brand heritage':'品牌历史','Trail & destination guides':'路线导览','Tourism promos':'旅游宣传','Event posters':'活动海报','Brand identity':'品牌识别','Events':'活动','Design education':'设计教育','Title sequences':'影片片头','Event openers':'活动开场','Trailers':'预告片','Luxury & hospitality':'酒店与高端服务','Galas':'庆典','Invitations':'邀请函','Engineering':'工程科普','Hardware launches':'硬件发布','Tech explainers':'技术讲解','Legends':'传奇故事','Holiday stories':'节日故事','Sports events':'体育活动','Visual identity':'视觉识别','Developer tools':'开发工具','Sci-fi':'科幻','Tech brands':'科技品牌','Data journalism':'数据新闻','Reports':'研究报告','Climate & science':'气候科学','Process explainers':'流程讲解','Supply chains':'供应链','Annual reports':'年度报告','Product launches':'产品发布','SaaS':'软件服务','Keynotes':'主题发布','Product tutorials':'产品教程','Feature launches':'功能发布','Onboarding':'新手引导','Product spec walkthroughs':'产品参数','Launch & crowdfunding videos':'发布与众筹','Trade-show screens':'展会展示','Food & drink':'食品饮料','Retro ads':'复古广告','Kids':'儿童内容','Game trailers':'游戏预告','Nostalgia':'怀旧','Comedy':'喜剧','Product set-up guides':'产品安装','Help-centre explainers':'帮助中心','How-to steps':'操作步骤','Recaps':'回顾','Fantasy':'奇幻','Story films':'故事短片','Tech timelines':'技术时间线','Year in review':'年度回顾','Variety shows':'综艺','Retro brands':'复古品牌','Silent storytelling':'无声叙事','Horror':'恐怖','Mystery & ARG':'悬疑与解谜','Game teasers':'游戏先导片','Toys & kids':'玩具与儿童','Product builds':'产品组装','Space':'太空',"Children's books":'儿童图书','City promos':'城市宣传','Real estate':'地产展示','Transport':'交通','World building':'世界构建','Calm content':'舒缓内容','Consumer tech':'消费科技','Beauty':'美妆'
};
const uses = style => style.uses.map(use => useNames[use] || use);
let styles = [], feature, selectedCategory = '全部', activeFilm = null, lastFocused = null;
$$('[data-doc]').forEach(link => { link.href = repository + link.dataset.doc; link.target = '_blank'; link.rel = 'noopener'; });
$('#commit-link').href = `https://github.com/lemomo-ai/lemo-opuscar/commit/${ref}`;

function renderCategories() {
  const categories = ['全部', ...new Set(styles.map(style => style.cat))];
  $('#category-filters').innerHTML = categories.map(category => `<button data-category="${escape(category)}" class="${category === selectedCategory ? 'active' : ''}" aria-pressed="${category === selectedCategory}">${escape(category)}<span>${category === '全部' ? styles.length : styles.filter(style => style.cat === category).length}</span></button>`).join('');
}
function renderStyles() {
  const query = $('#style-search').value.trim().toLocaleLowerCase();
  const duration = $('#duration-filter').value;
  const visible = styles.filter(style => (selectedCategory === '全部' || style.cat === selectedCategory) && (duration === 'all' || (duration === 'short' ? style.dur <= 60 : style.dur > 60)) && [style.cn, style.en, style.cat, style.slug, style.film, style.line_cn, ...style.uses, ...uses(style)].join(' ').toLocaleLowerCase().includes(query));
  $('#style-count').textContent = `显示 ${visible.length} / ${styles.length} 种风格${selectedCategory === '全部' ? '' : ` · ${selectedCategory}`}`;
  $('#style-empty').hidden = visible.length > 0;
  $('#style-grid').innerHTML = visible.map(style => `<article class="style-card"><button class="card-image" data-inline-style="${style.slug}" aria-label="播放${escape(style.cn)}样片"><img src="./${style.image}" alt="上游${escape(style.cn)}样片：${escape(style.film)}" loading="lazy" width="800" height="450"><span class="card-play" aria-hidden="true">▶</span><span class="card-duration">${time(style.dur)}</span></button><div class="card-body"><p class="card-category">${escape(style.cat)}</p><h3>${escape(style.cn)}</h3><p class="card-en">${escape(style.en)}</p><p class="card-story">${escape(style.line_cn)}</p><div class="use-tags">${uses(style).map(use => `<span>${escape(use)}</span>`).join('')}</div><div class="card-links"><button data-inline-style="${style.slug}">页内播放 ▶</button><button data-play="${style.slug}">风格详情 ↗</button><a href="${style.source}" target="_blank" rel="noopener">STYLE.md</a></div></div></article>`).join('');
}
function renderFeature() {
  const chapter = $('#chapter-filter').value;
  const query = $('#feature-search').value.trim().toLocaleLowerCase();
  const films = feature.films.filter(film => (chapter === 'all' || film.chapter === chapter) && [film.zh, film.title, film.year, film.style_zh, film.style_en, film.desc_zh, film.render].join(' ').toLocaleLowerCase().includes(query));
  $('#feature-count').textContent = `显示 ${films.length} / ${feature.films.length} 个片段 · 点击画面跳到长片对应时间，展开可读中文风格提示词`;
  $('#feature-grid').innerHTML = films.length ? films.map(film => `<article class="feature-card"><button data-feature="${film.no}" aria-label="播放${escape(film.zh)}对应片段，${time(film.t0)}"><img src="./assets/upstream/opuscar98/${String(film.no).padStart(2,'0')}.jpg" alt="上游 OPUSCAR 98 中的${escape(film.zh)}片段" loading="lazy" width="800" height="450"><span class="feature-time">▶ ${time(film.t0)}</span></button><h3>${escape(film.zh)}</h3><span class="feature-year">${escape(film.year)} · ${escape(film.title)}</span><p>${escape(film.style_zh)}</p><details><summary>中文风格提示词 +</summary><p>${escape(film.prompt_zh)}</p></details></article>`).join('') : '<div class="empty-state"><h3>没有匹配的片段</h3><p>试试其他年代，或选择全部年代再搜索。</p></div>';
}

// Only escaped Markdown is rendered. Raw HTML, javascript: URLs and event attributes stay inert.
function markdown(text, sourceURL) {
  const inline = text => escape(text).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (match, label, href) => {
    try { const url = new URL(href.replaceAll('&amp;', '&'), sourceURL); return /^https?:$/.test(url.protocol) ? `<a href="${escape(url.href)}" target="_blank" rel="noopener">${label}</a>` : label; } catch { return label; }
  });
  let html = '', code = [], inCode = false, list = false;
  for (const line of text.split('\n')) {
    if (/^```/.test(line)) { if (list) { html += '</ul>'; list = false; } if (inCode) { html += `<pre>${escape(code.join('\n'))}</pre>`; code = []; } inCode = !inCode; continue; }
    if (inCode) { code.push(line); continue; }
    if (/^[-*] /.test(line)) { if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(line.slice(2))}</li>`; continue; }
    if (list) { html += '</ul>'; list = false; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { const level = Math.min(heading[1].length + 1, 4); html += `<h${level}>${inline(heading[2])}</h${level}>`; }
    else if (line.startsWith('>')) html += `<blockquote>${inline(line.replace(/^>\s?/,''))}</blockquote>`;
    else if (/^---+$/.test(line)) html += '<hr>';
    else if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  if (list) html += '</ul>';
  if (inCode) html += `<pre>${escape(code.join('\n'))}</pre>`;
  return html;
}
function renderSpec(type = 'style') {
  $$('[data-spec]').forEach(button => { const active = button.dataset.spec === type; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); });
  const text = type === 'style' ? activeFilm.styleText : activeFilm.demoText;
  $('#film-spec').innerHTML = markdown(text || '该片段未提供独立技术说明。', activeFilm.source);
}
function openFilm(slug, clip = null) {
  const style = styles.find(style => style.slug === slug);
  if (!style && slug !== 'opuscar98') return;
  screening?.pauseAll();
  const isFeature = slug === 'opuscar98';
  activeFilm = isFeature ? {
    slug, cn: clip ? `${clip.zh} · ${clip.year}` : 'OPUSCAR 98', en: clip ? clip.title : '98 Years of Best Picture / 1927–2025', cat: clip ? clip.style_zh : '特别放映 / 6:31',
    line_cn: clip ? clip.desc_zh : '同一主角走过 98 部最佳影片，每一段切换到贴合影片的视觉语言。作者用代码组织画面、音乐与剪辑。',
    image: clip ? `assets/upstream/opuscar98/${String(clip.no).padStart(2,'0')}.jpg` : 'assets/upstream/feature.jpg',
    video: gallery + 'films/opuscar98.mp4', full: 'https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/opuscar98.mp4',
    source: gallery + 'opuscar98/', code: gallery + 'opuscar98/#styles', uses: [],
    styleText: clip ? `# ${clip.style_zh}\n\n${clip.prompt_zh}\n\n## 中文导演设计\n${clip.direction_zh || clip.desc_zh}\n\n## English style prompt\n${clip.prompt_en}` : '# OPUSCAR 98\n\n一支 6 分 31 秒的代码制片长片。下方年代索引提供 98 个片段的中文风格提示词和对应播放时间。\n\n这 98 个片段规格与 43 种完整风格工作流分开展示。\n\n画面与声音来自上游作者作品，视频通过官方站点在线播放。',
    demoText: clip ? `# ${clip.zh} / ${clip.render}\n\n${clip.desc_zh}\n\n${clip.direction_zh || ''}\n\n声音与音乐：${clip.music_zh || '详见上游影片风格页。'}` : '# 技术范围\n\n该长片的制片工程未随仓库公开。本地导入的是上游公开的片段风格规格、时间信息与截图，无法据此独立重建完整成片。'
  } : style;
  lastFocused = document.activeElement;
  $('#film-category').textContent = activeFilm.cat;
  $('#film-title').textContent = activeFilm.cn;
  $('#film-english').textContent = activeFilm.en;
  $('#film-description').textContent = activeFilm.line_cn;
  $('#film-tags').innerHTML = isFeature ? '' : uses(activeFilm).map(use => `<span>${escape(use)}</span>`).join('');
  $('#use-style').hidden = isFeature;
  $('#film-source').href = activeFilm.source;
  $('#film-code').href = activeFilm.code;
  $('#film-code').textContent = isFeature ? '上游片段风格页 ↗' : '样片实现 ↗';
  $('#film-full').href = activeFilm.full;
  $('#film-official').href = isFeature ? gallery + 'opuscar98/' : activeFilm.video;
  $('#spec-hint').textContent = isFeature ? '片段规格来自上游公开数据；长片工程未随仓库公开。' : '固定版本上游原文：绘制、色彩、运动、声音与质量要求。';
  renderSpec();
  const video = $('#film-video');
  video.pause(); video.poster = './' + activeFilm.image;
  video.src = activeFilm.video;
  $('#video-status').textContent = clip ? `正在加载上游长片，准备跳到 ${time(clip.t0)}；对应片段约 ${clip.dur.toFixed(1)} 秒。` : '正在加载上游真实样片…';
  video.onloadedmetadata = () => {
    if (clip) video.currentTime = clip.t0;
    video.play().catch(() => { if (!video.error) $('#video-status').textContent = '点击视频播放按钮开始观看；视频加载需要网络。'; });
  };
  video.oncanplay = () => { if (!video.seeking) $('#video-status').textContent = clip ? `正在查看 ${clip.zh}，起点 ${time(clip.t0)}。播放将继续到后续片段，可随时暂停。` : '上游真实样片已加载，可播放、拖动进度或全屏观看。'; };
  video.onseeking = () => { $('#video-status').textContent = `正在定位到 ${time(video.currentTime)}，等待上游视频缓冲。长片加载较慢时，可使用下方官方播放器。`; };
  video.onwaiting = () => { $('#video-status').textContent = '正在等待上游视频缓冲；长片首次加载与跳转可能较慢，可使用下方官方播放器。'; };
  video.onerror = () => { $('#video-status').textContent = '当前网络未能加载上游视频。可打开官方播放器或 1080p 原文件；本地风格规格与预览仍可阅读。'; };
  $('#film-dialog').showModal(); document.body.classList.add('dialog-open');
  video.preload = 'metadata';
  video.load();
}
function closeFilm() { $('#film-dialog').close(); }
$('#film-dialog').addEventListener('close', () => { const video = $('#film-video'); video.pause(); video.onloadedmetadata = null; video.oncanplay = null; video.onseeking = null; video.onwaiting = null; video.onerror = null; video.removeAttribute('src'); video.load(); document.body.classList.remove('dialog-open'); lastFocused?.focus({ preventScroll:true }); });
$('#close-dialog').addEventListener('click', closeFilm);
$('#film-dialog').addEventListener('click', event => { if (event.target === $('#film-dialog')) { const rect = $('#film-dialog').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeFilm(); } });
document.addEventListener('click', event => {
  const play = event.target.closest('[data-play]'); if (play) openFilm(play.dataset.play);
  const screen = event.target.closest('[data-screen]'); if (screen) screening?.showHero(screen.dataset.screen);
  const inline = event.target.closest('[data-inline-style]'); if (inline) screening?.showStyle(inline.dataset.inlineStyle, true);
  const fragment = event.target.closest('[data-feature]'); if (fragment) screening?.showFeature(feature.films.find(film => film.no === Number(fragment.dataset.feature)));
  const category = event.target.closest('[data-category]'); if (category) { selectedCategory = category.dataset.category; renderCategories(); renderStyles(); $('#category-filters').querySelector(`[data-category="${CSS.escape(selectedCategory)}"]`)?.focus({ preventScroll:true }); }
  const spec = event.target.closest('[data-spec]'); if (spec && activeFilm) renderSpec(spec.dataset.spec);
  const beat = event.target.closest('[data-beat]'); if (beat) selectBeat(Number(beat.dataset.beat));
  const track = event.target.closest('[data-track]'); if (track) selectTrack(track.dataset.track);
  const preset = event.target.closest('[data-preset]'); if (preset) applyPreset(preset.dataset.preset);
});
$('#style-search').addEventListener('input', renderStyles);
$('#duration-filter').addEventListener('change', renderStyles);
$('#reset-filters').addEventListener('click', () => { selectedCategory = '全部'; $('#style-search').value = ''; $('#duration-filter').value = 'all'; renderCategories(); renderStyles(); $('#style-search').focus(); });
$('#chapter-filter').addEventListener('change', renderFeature);
$('#feature-search').addEventListener('input', renderFeature);

const beats = [
  ['00–03 s','一滴水，为什么能被送上高处？','先画一滴停在低处的水，接着让它突然沿管道向上运动。运动产生疑问，问题驱动观众继续看。','蓝图线条迅速画出管道；水滴起动的一刻，用短促的水声与节拍落点强调。'],
  ['03–12 s','跟着水滴，进入泵体','镜头沿进水管进入泵体，先建立入口、叶轮与出口的位置关系。观众获得看懂后续变化所需的信息。','稳定节拍与轻微流动声；旁白只说明必要部件，字幕留足阅读时间。'],
  ['12–28 s','叶轮启动，水流的运动发生变化','叶轮转动，水流向外运动；用箭头和局部特写解释能量传递。这是讲解重点，也是画面变化的转折。','转动音逐渐增强，关键示意出现时对应音乐落点；旁白下压低配乐。'],
  ['28–40 s','镜头拉远，看见完整输水过程','从局部拉到整体，把进水、叶轮、泵体和出水连接起来，再把镜头拉到高处的水箱。','由局部机械声转为水流环境声，音乐逐步展开，支持尺度揭示。'],
  ['40–45 s','回到最初那滴水，回答问题','开头的水滴到达水箱。用简短文字呼应最初的疑问，让过程以一个清晰结果结束。','水滴落下作为结尾声音，音乐收束；末尾文字保持可读时间。']
];
function selectBeat(index) { const beat = beats[index]; $('#beat-time').textContent = beat[0]; $('#beat-title').textContent = beat[1]; $('#beat-description').textContent = beat[2]; $('#beat-sound').textContent = beat[3]; $$('[data-beat]').forEach(button => { const active = Number(button.dataset.beat) === index; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); }); }
const tracks = {
  picture:['画面是时间的函数','render(t) / 浏览器逐帧捕获','Canvas 2D 绘制多数平面风格；Three.js 组织 3D，WebGL2 执行后期。固定随机种子，不依赖上一帧状态。浏览器按 t = 帧号 / fps 绘制并截图，FFmpeg 编码。','core/render/video.mjs'],
  voice:['每句旁白各自制作','TTS / ASR / 词语时间戳','英文默认使用离线 Kokoro，中文可用在线 edge-tts；也可使用自有录音。faster-whisper 检查每句并输出时间戳，混音前压缩人声，让旁白高于配乐。','TECHNIQUE.md#4-voice'],
  music:['从镜头节拍写配乐','sampler.py / pluck.py / numpy','按同一时间线规划节奏和关键动作落点，用采样库演奏乐器、物理建模生成拨弦或合成电子声音。它需要 Agent 编写配乐事件；风格规范给出声音气质。','TECHNIQUE.md#5-music'],
  sound:['动作事件驱动拟音','window.EV / sfx.py','画面导出动作事件时间，程序在相应时刻生成点击、掠过、落地、纸张等声音。环境声、拟音和音乐分层组织，在对白与关键拟音出现时压低配乐。','TECHNIQUE.md#6-sound-effects-and-mix'],
  subtitles:['字幕是画面设计的一部分','SRT / 画面内字幕 / readcheck','字幕按时间码导出 SRT，并在页面中绘制符合风格的字幕。readcheck 检查报告给工具的屏幕文字是否完整可见、停留够久；字幕另按 SRT 检查，仍要观看遮挡与同步。','core/README.md']
};
function selectTrack(name) { const [title,file,description,doc] = tracks[name]; $$('[data-track]').forEach(button => { const active = button.dataset.track === name; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); }); $('#track-detail').innerHTML = `<div><p class="mini-label">${escape(file)}</p><h3>${escape(title)}</h3></div><p>${escape(description)}</p><a href="${repository + doc}" target="_blank" rel="noopener">对应源码与指南 ↗</a>`; }
selectTrack('picture');

const presets = {
  pump: { style:'blueprint', topic:'讲清楚离心泵如何把水从低处输送到高处，展示进水、叶轮旋转和出水过程。', goal:'叶轮把能量传给水，泵体引导水流向出口。' },
  product: { style:'dark-keynote', topic:'介绍一款虚构的桌面整理应用：用户被杂乱窗口打断，使用一个功能把任务归位，重新进入专注状态。', goal:'让观众理解整理功能的触发、操作和结果。' },
  data: { style:'dataviz', topic:'使用我提供的研究数据，展示一个指标随时间的变化、一次关键转折及其影响；缺失的数据先向我确认。', goal:'看清趋势与转折，理解数据能支持的结论。' },
  culture: { style:'papercut-red', topic:'围绕一张窗花讲一个原创春节故事：孩子尝试剪出礼物，经历一次失败，最终把祝福送给家人。', goal:'记住剪纸的手工质感和故事中的团圆情绪。' },
  pet: { style:'impasto', topic:'讲一只每天在窗台等主人下班的橘猫，某天它先听到钥匙声，跑向门口；结尾回到窗台，两个人一起看晚霞。', goal:'感受到等待变成陪伴的情绪变化。' }
};
function buildBrief() {
  const style = styles.find(style => style.slug === $('#brief-style').value); if (!style) return;
  const topic = $('#brief-topic').value.trim(), goal = $('#brief-goal').value.trim(), materials = $('#brief-materials').value.trim();
  const voice = $('#brief-voice').value;
  const brief = `请使用 Lemo-Opuscar Skill，制作一支 ${$('#brief-length').value}的短片。\n\n主题：${topic}\n观众看完应记住：${goal}\n风格：${style.cn} / ${style.en}（${style.slug}）。\n画幅：${$('#brief-ratio').value}，24 fps。\n声音：${voice}。${voice.startsWith('无旁白') ? '使用动作音效与配乐组织节奏，保留必要的屏幕文字。' : '配中文字幕，另导出 SRT；对白出现时压低配乐。'}\n\n导演要求：\n1. 前三秒用明确事件或疑问建立钩子。\n2. 围绕一个主体、一个目标、一次变化组织故事，结尾呼应开头。\n3. 设计一个值得记住的镜头，用 ${style.cn} 的材料与运动方式参与转场。\n4. 用统一时间线同步动作、剪辑、音乐和字幕，安排快慢与呼吸空间。\n\n流程：先写 TREATMENT.md，确定镜头、节拍和声音方案，用实际绘制代码验证风格。${$('#brief-storyboard').checked ? '先展示 6–9 个关键分镜，等我确认后制作成片。' : '无需中途分镜确认，按指南完成制作与自检后交付。'}\n${materials ? `\n其他要求或素材：${materials}\n` : ''}\n交付：MP4、海报、SRT（如有字幕）、TREATMENT.md、素材来源与授权 CREDITS，以及源码和可运行的 build.sh。\n\n检查：文字停留与可见性、配音准确性、声音响度、关键动作连续性、黑帧与声画同步；完整带声音播放后再交付。`;
  $('#brief-text').textContent = brief; $('#copy-status').textContent = '任务已更新，可复制给安装了 Skill 的编程 Agent。';
}
function applyPreset(name) { const preset = presets[name]; $('#brief-topic').value = preset.topic; $('#brief-goal').value = preset.goal; $('#brief-style').value = preset.style; buildBrief(); $('#create').scrollIntoView({ behavior:'smooth' }); $('#brief-topic').focus({ preventScroll:true }); }
$('#brief-form').addEventListener('submit', event => { event.preventDefault(); buildBrief(); });
$('#use-style').addEventListener('click', () => { const slug = activeFilm.slug; closeFilm(); $('#brief-style').value = slug; buildBrief(); $('#create').scrollIntoView({ behavior:'smooth' }); $('#brief-style').focus({ preventScroll:true }); });
$('#copy-brief').addEventListener('click', async () => {
  const text = $('#brief-text').textContent;
  try { await navigator.clipboard.writeText(text); $('#copy-status').textContent = '已复制创作任务。'; }
  catch { const range = document.createRange(); range.selectNodeContents($('#brief-text')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $('#brief-text').focus(); $('#copy-status').textContent = '浏览器未允许直接复制，已选中文本，请按 Ctrl+C 或系统复制命令。'; }
});
let screening;
try {
  const [catalogResponse, featureResponse] = await Promise.all([fetch('./data/catalog.json'), fetch('./data/opuscar98.json')]);
  if (!catalogResponse.ok || !featureResponse.ok) throw new Error('参考数据请求失败');
  const [catalogData, featureData] = await Promise.all([catalogResponse.json(), featureResponse.json()]);
  styles = catalogData.styles; feature = featureData;
  initOverview(styles, catalogData.ref);
  screening = createScreeningRoom(styles, gallery);
  renderCategories(); renderStyles();
  $('#chapter-filter').innerHTML = `<option value="all">全部年代（98 个片段）</option>` + feature.chapters.map(chapter => `<option value="${chapter.id}">${escape(chapter.years)} / ${escape(chapter.zh)}</option>`).join('');
  $('#chapter-filter').value = 'C1'; renderFeature();
  $('#brief-style').innerHTML = styles.map(style => `<option value="${style.slug}">${escape(style.cn)}</option>`).join('');
  $('#brief-style').value = 'blueprint'; buildBrief();
} catch (error) {
  $('#style-count').textContent = '本地风格索引加载失败，请刷新或打开上游图鉴。';
  $('#style-grid').innerHTML = `<p>请使用本地 HTTP 预览打开本页。<a href="${gallery}" target="_blank" rel="noopener">打开官方图鉴 ↗</a></p>`;
  $('#feature-count').textContent = '片段索引未加载。';
  $('#brief-form').querySelector('button').disabled = true;
  $('#copy-status').textContent = '参考数据加载失败，任务生成功能暂不可用。';
  console.error(error);
}
