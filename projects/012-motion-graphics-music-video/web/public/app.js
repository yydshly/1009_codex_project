(() => {
  'use strict';
  const sha = '759ba6a7c80e2771f4dd69792e74383d71512e35';
  const repo = 'https://github.com/makevoid/motion-graphics-music-video-skill';
  const skill = '.claude/skills/motion-graphics-music-video/';
  const source = (file) => repo + '/blob/' + sha + '/' + file;
  const steps = [
    {
      label: '本地分析', title: '把音乐变成可以编排的数据。',
      description: '从歌曲中估计节拍、起音与能量，给字幕、镜头和特效安排时间点。',
      input: '已有歌曲；初始化后转换为可分析的音频。',
      output: '节拍、时间／帧位置、能量等 JSON 数据。',
      limit: '节奏估计仍需试听校准，复杂变速或拍号需要适配。',
      file: skill + 'scripts/tools/python/beats.py', filename: 'beats.py',
    },
    {
      label: 'Agent 规划', title: '先把创意写成一份可检查的计划。',
      description: '结合歌曲、创意与研究资料，确定角色、视觉风格、每个时段的动作和镜头。新方向的付费制作先确认计划和预算。',
      input: '歌曲、歌词、创意、视觉参考、受众与预算约束。',
      output: 'PLAN.md / RESEARCH.md；提示词、帧区间、任务依赖与费用估算。',
      limit: '计划要具体到表演、场景和审查标准。预算估算与实际供应商计费需要分别核对。',
      file: skill + 'SKILL.md', filename: 'SKILL.md · 计划与授权',
    },
    {
      label: '云端生成', title: '让模型提供角色和表演素材。',
      description: '仓库默认用 GPT Image 2.5 生成／编辑角色参考和关键帧，用 MiniMax H3 生成单角色绿幕表演；经 Fal API 调用。',
      input: '已审查的角色参考、关键帧提示词、表演要求及对齐的人声片段。',
      output: '角色图、背景静帧、表演视频；必要时生成／分离音频素材。',
      limit: '默认模型与 schema 需要在制作时核验；角色一致性、动作、口型和画面边缘需实际审查。',
      file: skill + 'references/prompts.md', filename: 'prompts.md · 角色与表演',
    },
    {
      label: '代码动画', title: '把素材安排到精确的画面位置和时间。',
      description: 'p5.js 按帧绘制背景、角色、文字、图形与镜头变化。Python 负责抠图和素材处理，模型素材由代码重新编排。',
      input: '透明角色帧、背景静图、歌词／节拍时间点和场景脚本。',
      output: '各段画面、图形覆盖层、可检查的事件帧与场景预览。',
      limit: '可以控制摆放、文字、镜头和节奏；复杂交互表演要在生成时准备，并检查角色裁切与层级。',
      file: skill + 'references/animation-audio-vfx.md', filename: 'animation-audio-vfx.md · p5 场景',
    },
    {
      label: '本地合成', title: '以完整原曲为主线，交付整支视频。',
      description: '按连续的整数帧区间拼接画面，匹配一条完整主音轨。Python 混音效，Swift 加按帧指定的特效，FFmpeg 编码交付。',
      input: '已审查的各段画面、完整原曲、音效时间点与特效配置。',
      output: '清洁版与计划中的完成版 MP4，附审查记录、素材和配置。',
      limit: '检查全曲覆盖、结尾、帧数和音画衔接；Swift VFX 需要 macOS，最终效果仍要观看和听音验证。',
      file: skill + 'references/animation-audio-vfx.md', filename: 'animation-audio-vfx.md · 合成交付',
    },
  ];
  const roles = {
    agent: {
      label: 'OPUS / 导演与工程师', title: '把创意和工具组织成一场制作。',
      description: '理解歌曲与创意，研究视觉细节，写计划、预算、提示词与场景代码，调度工具和素材任务，检查结果并安排修订。',
      points: ['开头与高潮先做代表性素材。', '每批审查完成后，再扩大制作。', '判断依赖于实际图像、播放与听音检查。'],
      limit: '调度和审查机制有实现，审美质量仍需要 Agent 或人的判断。',
    },
    ruby: {
      label: 'RUBY / 统一执行层', title: '把制作步骤变成有记录的任务。',
      description: 'Ruby CLI 负责初始化、执行和记录；MCP 服务接收插件配置的凭据，调用同一套 Ruby 任务。它再调用云端 API 和本地媒体工具。',
      points: ['独立项目保存依赖、配置与输出。', '任务图按 2 → 4 → 8 → 10 的上限逐批分配。', '回执、manifest、文件锁帮助恢复与避免冲突。'],
      limit: 'Ruby 的批次分配器管理任务状态；实际子 Agent 由宿主的代理工具启动。',
    },
    model: {
      label: 'MODELS / 云端素材', title: '给画面提供角色、表演和音频。',
      description: '图像模型建立角色参考与关键帧，视频模型生成表演片段。人声分离、转录和音效使用对应音频适配器。',
      points: ['角色参考固定后，用图像编辑延续身份。', '默认一段视频一个角色，绿幕、锁定镜头。', '准备人声片段辅助演唱；口型需观看验证。'],
      limit: '所选媒体与提示词发送给服务商；模型能力、可用性与费用应按当前服务核验。',
    },
    code: {
      label: 'CODE / 本地制作', title: '代码本身也直接产生动画。',
      description: 'p5.js 用 Chromium 按帧绘制文字、图形、角色布局和镜头；Python 分析音乐、处理透明边缘和混音；Swift Core Image 实现按帧的后期特效。',
      points: ['每帧时间为 frame / 24，按 cue 控制事件。', '角色与场景分层，改变布局可复用表演素材。', 'FFmpeg 验证片段长度、拼接画面并混入完整原曲。'],
      limit: '本地编排可精确控制时间与位置，输入素材的表演质量仍需要检查。',
    },
  };
  const scenarios = {
    music: {
      name: '独立音乐 MV', tag: '与默认流程匹配', title: '给已有歌曲建立视觉世界。',
      description: '适合独立音乐人、原创歌曲发布、歌词动画和角色表演 MV。',
      brief: '让一个纸感机器人在城市里寻找自己的声音。主歌克制，副歌加入跳跃的歌词和节拍图形。',
      input: '已有歌曲、歌词、视觉参考、预算与角色设定。',
      priority: '角色一致性、主歌／副歌差异、开场与高潮的表演和口型。',
      output: '整曲 MV、清洁版、素材与可继续修订的制作记录。',
    },
    knowledge: {
      name: '知识歌曲与研究导览', tag: '应用建议 · 需准备内容', title: '把一个知识点唱成动态讲解。',
      description: '适合已有知识歌曲、项目研究导览与带音乐的概念动画。准确性依靠已核验的文案和出处。',
      brief: '用一段已有的知识歌曲讲解“音乐、模型、代码、Agent”的分工。四个角色依次入场，图形按节拍连成制作链路，重点句保留足够阅读时间。',
      input: '已有歌曲或已制作的知识音轨、核验过的歌词、关键概念、研究出处。',
      priority: '术语准确、图形关系清晰、阅读时长；复杂知识需人工校对。',
      output: '带图形和角色的音乐讲解短片，另附可检索的网页与出处。',
    },
    brand: {
      name: '品牌音乐短片', tag: '应用建议 · 需适配品牌', title: '让品牌角色跟着音乐讲故事。',
      description: '适合已有品牌歌曲、角色宣传和活动音乐短片。产品特征与商用素材需要单独核验。',
      brief: '为一首已有的咖啡品牌短歌制作角色动画。杯子吉祥物在音乐重拍上完成三次入场，字幕由代码绘制，保持品牌色和包装细节可读。',
      input: '品牌歌曲、吉祥物参考、品牌规范、合法可用的产品素材与预算。',
      priority: '品牌色、角色身份、产品外观和宣传措辞；竖屏交付需适配。',
      output: '音乐宣传片和可复用的角色／版式；交付格式按实际适配结果确定。',
    },
  };
  let activeScenario = 'music';
  const select = (group, key, value) => {
    document.querySelectorAll(group).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset[key] === String(value)));
    });
  };
  const stepDetail = document.querySelector('#step-detail');
  document.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.step);
      const item = steps[index];
      select('[data-step]', 'step', index);
      stepDetail.innerHTML = '<div class="detail-title"><span class="large-number">0' + (index + 1) +
        '</span><div><p class="eyebrow">' + item.label + '</p><h3>' + item.title + '</h3><p>' +
        item.description + '</p></div></div><div class="detail-columns"><div><h4>输入</h4><p>' +
        item.input + '</p></div><div><h4>输出</h4><p>' + item.output +
        '</p></div><div><h4>控制与边界</h4><p>' + item.limit +
        '</p></div></div><a class="source-link" href="' + source(item.file) +
        '" target="_blank" rel="noopener noreferrer">依据：' + item.filename + ' ↗</a>';
    });
  });
  document.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = roles[button.dataset.role];
      select('[data-role]', 'role', button.dataset.role);
      document.querySelector('#role-detail').innerHTML = '<p class="eyebrow">' + item.label +
        '</p><h3>' + item.title + '</h3><p>' + item.description + '</p><ul>' +
        item.points.map((point) => '<li>' + point + '</li>').join('') +
        '</ul><p class="role-limit">' + item.limit + '</p>';
    });
  });
  const scenarioDetail = document.querySelector('#scenario-detail');
  document.querySelectorAll('[data-scenario]').forEach((button) => {
    button.addEventListener('click', () => {
      activeScenario = button.dataset.scenario;
      const item = scenarios[activeScenario];
      select('[data-scenario]', 'scenario', activeScenario);
      scenarioDetail.innerHTML = '<div><span class="tag">' + item.tag + '</span><h3>' + item.title +
        '</h3><p>' + item.description + '</p><div class="brief-box"><span>创意示例</span><p>“' +
        item.brief + '”</p></div></div><div class="scenario-spec"><div><span>准备什么</span><p>' +
        item.input + '</p></div><div><span>重点控制</span><p>' + item.priority +
        '</p></div><div><span>拿到什么</span><p>' + item.output +
        '</p></div><button class="button secondary" id="download-brief">下载这个场景的制作 brief ↓</button>' +
        '<small>Markdown 创作说明；用于规划下一次制作。</small></div>';
    });
  });
  scenarioDetail.addEventListener('click', (event) => {
    if (!event.target.closest('#download-brief')) return;
    const item = scenarios[activeScenario];
    const text = [
      '# Motion Graphics MV · ' + item.name, '',
      '这是场景制作 brief，不是视频或可直接执行的项目。', '',
      '## 创意', '', item.brief, '',
      '## 输入', '', item.input, '',
      '## 重点控制', '', item.priority, '',
      '## 期望输出', '', item.output, '',
      '## 待填写的制作约束', '', '- 音乐文件路径：', '- 选定段落与歌词：',
      '- 角色与视觉参考：', '- 预算、重试额度：', '- 画幅与帧率：默认 16:9 / 24fps，变更需适配',
      '- 用途与素材授权：', '',
      '## 制作步骤', '', '分析音乐 → 规划分镜与预算 → 先试代表性素材 → 审查 → 扩展生成 → 代码编排 → 合成与全片检查', '',
      '## 验收', '', '- 角色、边缘与文字可读', '- 音画时间线与完整原曲连续',
      '- 口型与表演经过实际观看验证', '- 结尾与交付文件齐全', '',
      '研究基线：' + sha, '来源：' + repo,
      '研究网页为原创讲解示意；未执行付费生成。', '',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mv-brief-' + activeScenario + '.md';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      select('[data-filter]', 'filter', filter);
      document.querySelectorAll('[data-kind]').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.kind !== filter;
      });
    });
  });

  // Only connect to the author's YouTube player after an explicit play action.
  const authorVideos = {
    math: { id: 'TKXSOnVtfWQ', title: 'The Math of You — 作者样片' },
    fork: { id: 'b70F1bWZlwE', title: 'You knew how to fork — 作者样片' },
  };
  const closeAuthorVideo = (key) => {
    const card = document.querySelector('[data-sample="' + key + '"]');
    card.querySelector('iframe')?.remove();
    card.querySelector('.sample-poster').hidden = false;
    card.querySelector('[data-close-video]').hidden = true;
    const still = card.querySelector('[data-still][aria-pressed="true"]');
    card.querySelector('.sample-frame-label').textContent = '截图 · ' + still.dataset.time;
  };
  document.querySelectorAll('[data-play-video]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.playVideo;
      const video = authorVideos[key];
      if (!video) return;
      Object.keys(authorVideos).forEach(closeAuthorVideo);
      const card = button.closest('[data-sample]');
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + video.id + '?rel=0&playsinline=1&autoplay=1';
      iframe.title = video.title;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      button.hidden = true;
      card.querySelector('.sample-player').append(iframe);
      card.querySelector('[data-close-video]').hidden = false;
      card.querySelector('.sample-frame-label').textContent = 'YouTube · 作者完整样片';
    });
  });
  document.querySelectorAll('[data-close-video]').forEach((button) => {
    button.addEventListener('click', () => closeAuthorVideo(button.dataset.closeVideo));
  });
  document.querySelectorAll('[data-still]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.still;
      const card = button.closest('[data-sample]');
      card.querySelectorAll('[data-still]').forEach((still) => still.setAttribute('aria-pressed', String(still === button)));
      closeAuthorVideo(key);
      const image = card.querySelector('.sample-poster img');
      image.src = button.dataset.src;
      image.alt = button.dataset.alt;
    });
  });

  const play = document.querySelector('#play');
  const timeline = document.querySelector('#timeline');
  const timeOutput = document.querySelector('#time');
  timeOutput.setAttribute('aria-live', 'off');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const character = document.querySelector('#character');
  const mouth = document.querySelector('#mouth');
  const disc = document.querySelector('#graphic-disc');
  const orbit = document.querySelector('#orbit');
  const word = document.querySelector('#scene-word');
  const glow = document.querySelector('#glow');
  const flash = document.querySelector('#flash');
  const bars = Array.from(document.querySelector('#bars').children);
  const stageBadge = document.querySelector('#stage-badge');
  let position = 0;
  let playing = false;
  let animationId = null;
  let lastTime = null;
  const draw = () => {
    const beat = Math.max(0, Math.sin(position * Math.PI * 4));
    const section = Math.min(3, Math.floor(position / 4));
    const labels = ['01 / 节拍与入场', '02 / 角色与字幕', '03 / 镜头与重拍', '04 / 合成与收尾'];
    const words = ['ON THE BEAT.', 'MAKE IT MOVE.', 'HIT THE HOOK.', 'BRING IT HOME.'];
    timeline.value = String(position);
    timeOutput.textContent = '00:' + String(Math.floor(position)).padStart(2, '0') + ' / 00:16';
    stageBadge.textContent = labels[section];
    word.textContent = words[section];
    if (reducedMotion.matches) {
      character.removeAttribute('transform');
      disc.removeAttribute('transform');
      word.removeAttribute('transform');
      mouth.setAttribute('ry', '4');
      flash.setAttribute('opacity', '0');
      glow.setAttribute('opacity', '.2');
      return;
    }
    const bounce = -beat * 7;
    character.setAttribute('transform', 'translate(0 ' + bounce + ') rotate(' + Math.sin(position * 3) * 2 + ' 333 233)');
    mouth.setAttribute('ry', String(3 + beat * 4));
    disc.setAttribute('transform', 'rotate(' + position * 35 + ' 492 113)');
    orbit.setAttribute('stroke-dashoffset', String(position * -12));
    word.setAttribute('transform', 'translate(44 357) scale(' + (1 + beat * .025) + ') translate(-44 -357)');
    glow.setAttribute('opacity', String(.09 + beat * .18));
    flash.setAttribute('opacity', String(section === 2 ? beat * .025 : 0));
    bars.forEach((bar, index) => {
      const height = 12 + Math.abs(Math.sin(position * 7 + index * .8)) * 36;
      bar.setAttribute('d', 'M' + (530 + index * 12) + ' 326v-' + height);
    });
  };
  const setPlaying = (value) => {
    playing = value;
    play.setAttribute('aria-pressed', String(playing));
    play.setAttribute('aria-label', playing ? '暂停编排示意' : '播放编排示意');
    document.querySelector('#play-icon').textContent = playing ? 'Ⅱ' : '▶';
    cancelAnimationFrame(animationId);
    lastTime = null;
    if (playing) animationId = requestAnimationFrame(tick);
  };
  const tick = (now) => {
    if (!playing) return;
    if (lastTime !== null) position = Math.min(16, position + Math.min(.1, (now - lastTime) / 1000));
    lastTime = now;
    draw();
    if (position >= 16) setPlaying(false);
    else animationId = requestAnimationFrame(tick);
  };
  play.addEventListener('click', () => {
    if (!playing && position >= 16) position = 0;
    draw();
    setPlaying(!playing);
  });
  timeline.addEventListener('input', () => {
    position = Number(timeline.value);
    lastTime = null;
    draw();
    if (position >= 16) setPlaying(false);
  });
  document.querySelectorAll('[data-layer]').forEach((button) => {
    button.addEventListener('click', () => {
      const visible = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(visible));
      document.querySelector('#' + button.dataset.layer + '-layer').style.display = visible ? '' : 'none';
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) setPlaying(false);
  });
  reducedMotion.addEventListener('change', draw);
  draw();
})();
