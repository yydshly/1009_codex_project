'use strict';
(() => {
  const commit = '53d7c6f752fb85b449de8cf806b77ad21808a8f1';
  const root = 'https://github.com/diggerhq/shipvideo/blob/' + commit + '/';
  const paths = {
    agent: 'opencomputer/agents/director/agent.ts',
    web: 'opencomputer/agents/director/tools/web.ts',
    scene: 'opencomputer/agents/director/tools/scene.ts',
    renderer: 'opencomputer/agents/director/tools/renderer.ts',
    jobs: 'web/src/app/api/jobs/route.ts',
    poll: 'web/src/app/api/jobs/%5Bid%5D/route.ts',
    package: 'package.json',
    page: 'web/src/app/page.tsx',
    oc: 'web/src/lib/oc.ts'
  };
  document.querySelectorAll('[data-source]').forEach(link => {
    link.href = root + paths[link.dataset.source];
    link.target = '_blank';
    link.rel = 'noopener';
  });
  const $ = id => document.getElementById(id);
  const scenarios = {
    launch: {
      kicker: '从产品页到发布短片', heading: '让一个产品，快速被理解。',
      description: '提供产品定位、目标用户和三项具体能力，用动态排版与图形组织一支发布介绍片。适合信息明确的软件、工具或服务。',
      fit: 'SaaS 发布、独立产品介绍、活动前的产品预告',
      boundary: '需要真实产品摄影、人物表演或复杂操作演示时，还需额外素材与制作环节。',
      inputs: ['产品首页或明确的产品描述', '用户痛点、三项真实能力、品牌色与行动入口', '目标受众、中文、30 秒、清楚的动态排版'],
      output: '一支按问题、产品、三项能力与行动入口组织的横屏静音发布片。',
      prompt: '制作一支 30 秒中文发布短片，介绍一款示例任务管理产品。受众是小型团队。已知能力：创建任务、查看进度、分享项目链接。用动态文字、任务卡片和进度条展示工作方式。不要声称未知的用户数量或效率提升。结尾提示访问产品主页。本简报为假想产品示例。',
      brand: 'PRODUCT LAUNCH',
      beats: [
        ['从问题开始', '事情越来越多。', '让工作有条理。', ['想法', '任务', '进度']],
        ['产品亮相', '一个工作入口。', '组织每项任务。', ['创建', '安排', '查看']],
        ['展示工作方式', '从任务到进度。', '用图形讲清楚。', ['任务卡片', '进度条', '状态']],
        ['表达具体价值', '信息放在一起。', '团队看见同一进度。', ['组织任务', '查看进度', '分享链接']],
        ['给出行动入口', '用短片介绍产品。', '让人愿意进一步了解。', ['产品定位', '实际能力', '访问主页']]
      ]
    },
    feature: {
      kicker: '把功能变化讲清楚', heading: '新增功能，需要一个清楚的说明。',
      description: '围绕一次具体变化，展示以前如何操作、新流程怎样完成，以及用户下一步该做什么。代码动画适合画出步骤与状态变化。',
      fit: '版本更新、功能公告、团队内部使用说明',
      boundary: '重绘的界面是功能示意；需要验证实际交互时，应补充真实截图或操作录屏。',
      inputs: ['功能名称、发布说明与适用用户', '原来的步骤、新的步骤与已核实变化', '真实界面参考、动作顺序、结尾使用入口'],
      output: '一支展示具体变化、操作步骤与使用入口的功能介绍片。',
      prompt: '制作一支 25 秒中文功能更新短片。假想产品新增批量归档：过去逐个归档任务，现在选中多个任务后点击归档。用简化任务卡片展示选择、确认、状态变更三个步骤。不要宣称未经测试的节省时间比例。画面注明界面示意，结尾提示打开任务列表体验。',
      brand: 'FEATURE UPDATE',
      beats: [
        ['先说原有流程', '逐个处理任务。', '步骤有些重复。', ['选择一个', '确认', '再次选择']],
        ['说清功能变化', '现在，批量归档。', '先选中多个任务。', ['任务 A', '任务 B', '任务 C']],
        ['画出动作顺序', '选中，确认，归档。', '每一步都看得懂。', ['选择', '确认', '归档']],
        ['表达真实变化', '操作方式改变了。', '数据效果需要验证。', ['原流程', '新流程', '已核实变化']],
        ['给出使用入口', '让更新被理解。', '从实际步骤开始。', ['更新公告', '步骤示意', '打开列表']]
      ]
    },
    technical: {
      kicker: '代码动画适合机制说明', heading: '把抽象机制，画成可理解的过程。',
      description: '提供经过核实的系统流程，让请求、数据、工具调用或状态变化成为画面的主角。适合 Agent、API 和自动化工作流。',
      fit: '技术方案介绍、API 数据流、Agent 工具调用解释',
      boundary: '流程图依据输入绘制；架构、失败分支和性能数字需要技术人员先核实。',
      inputs: ['经过核实的技术流程与关键术语', '步骤关系、输入输出、成功和失败分支', '受众技术水平、讲解重点与显示字数'],
      output: '一支以节点、连线、状态与动态文字解释工作机制的静音短片。',
      prompt: '制作一支 30 秒中文技术解释短片，介绍代码制片流程：输入简报，AI 编写 HTML 动画，虚拟时钟推进时间，Chromium 逐帧截图，FFmpeg 编码 MP4。用流程节点与流动标记呈现。不要把动画示意描述成实际任务监控。面向了解基本编程的读者，结尾引导阅读渲染器源码。',
      brand: 'HOW IT WORKS',
      beats: [
        ['把抽象流程画出来', '一个请求。', '经过多个环节。', ['输入', '处理', '输出']],
        ['AI 负责写代码', '信息变成动画程序。', '画面由代码表达。', ['简报', 'HTML', '动画']],
        ['时间推进到每一帧', '虚拟时钟。', '让画面时间可控。', ['00:00', '00:01', '00:02']],
        ['浏览器负责画面', '逐帧绘制与截图。', '再编码为视频。', ['Chromium', '图像帧', 'FFmpeg']],
        ['把机制解释清楚', '代码，成为视频。', '理解每个环节。', ['画面代码', '渲染', 'MP4']]
      ]
    },
    research: {
      kicker: '适合你的研究总库', heading: '把研究结论，变成项目介绍片。',
      description: '把已经核实的能力、流程与限制整理成简报，帮助读者在半分钟里判断：它解决什么问题，是否值得继续阅读。',
      fit: '项目能力介绍、研究成果分享、合集导航预告',
      boundary: '技术事实先由研究者核实；网址抓取不等于深入阅读整个仓库。',
      inputs: ['研究结论与原仓库链接', '三项已核实能力与一个限制', '受众、中文、30 秒、动态文字与流程图'],
      output: '一支展示问题、机制、价值与阅读入口的横屏静音介绍片。',
      prompt: '制作一支 30 秒中文短片，介绍 ShipVideo（https://github.com/diggerhq/shipvideo）。已核实能力：读取公开网页或接收提示词；AI 编写 HTML/CSS/SVG/Canvas 动画并检查；Chromium 逐帧渲染，FFmpeg 导出 1080p MP4。说明当前输出静音、依赖 OpenComputer，研究提交未发现 LICENSE。面向 GitHub 项目研究者，用动态文字与流程图解释输入、制作过程、输出和价值。不要编造数据，不声称已经实测生成质量。结尾引导阅读研究页。',
      brand: 'RESEARCH HUB',
      beats: [
        ['一个链接，一个起点', '发现好项目。', '让更多人看懂。', ['网址 / 简报', '代码动画', 'MP4']],
        ['先研究，再整理', '核实能力与边界。', '写出清楚的简报。', ['源码', '证据', '结论']],
        ['把信息变成画面', 'AI 编排故事。', '再写动画代码。', ['问题', '机制', '价值']],
        ['每一帧都有时间', '浏览器绘制画面。', 'FFmpeg 编码成片。', ['HTML', 'Chromium', 'MP4']],
        ['给研究增加一个出口', '先看懂，再深入。', '打开项目研究页。', ['项目短片', '能力说明', '研究文档']]
      ]
    }
  };
  let selectedScenario = 'research';
  const drafts = { url: 'https://your-product.example/', prompt: scenarios.research.prompt };
  let mode = 'url';
  function updateCount() {
    $('char-count').textContent = mode === 'prompt' ? $('brief').value.length + ' / 2000' : 'URL 示例';
    drafts[mode] = $('brief').value;
    $('copy-status').textContent = '';
  }
  function setMode(next) {
    drafts[mode] = $('brief').value;
    mode = next;
    $('brief').value = drafts[next];
    $('brief-label').textContent = next === 'url' ? '公开网页地址' : '创作简报，可编辑';
    $('input-note').textContent = next === 'url' ? '网址仅为格式示例；本页不会抓取网页。' : '仅在当前页面编辑；本页不会提交模型。';
    $('input-boundary').textContent = next === 'url'
      ? '读取公开页面返回的内容与元数据。抓取工具不执行页面脚本；登录后的功能和真实操作需要额外提供资料。'
      : '将已核实内容、受众、风格和限制明确写入简报。输出质量仍需人工观看评审，提示词不会保证每次生成相同作品。';
    const tags = next === 'url' ? ['页面文字', '标题与描述', '颜色与字体线索'] : ['目标受众', '已核实事实', '时长与风格', '能力边界'];
    $('input-tags').replaceChildren(...tags.map(t => Object.assign(document.createElement('span'), { textContent: t })));
    document.querySelectorAll('[data-input]').forEach(b => {
      const active = b.dataset.input === next;
      b.classList.toggle('selected', active);
      b.setAttribute('aria-pressed', String(active));
    });
    updateCount();
  }
  document.querySelectorAll('[data-input]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.input)));
  $('brief').addEventListener('input', updateCount);
  updateCount();
  const engines = [
    ['画面由代码表达', 'AI 编写的是动画程序。', '文字、图形、位置、颜色与运动都写在同一份 HTML 中。导演 Agent 当前使用 anthropic/claude-opus-5.5；OpenComputer 提供 Agent、模型网关与会话运行环境。', '输入信息 → 提炼卖点 → 编排节奏\n         ↓\nHTML + CSS + SVG + Canvas'],
    ['动画时间由渲染器控制', '先确定时间，再计算画面。', '渲染器接管 rAF、定时器和动画时钟，按帧推进到目标时间。同一份合规动画代码可重现时间状态；重新生成代码仍会产生不同作品。', '目标时间 = 当前帧 ÷ 帧率\n推进虚拟时间到目标值\n计算该时间的文字、图形与位置'],
    ['浏览器负责绘制', '把每一帧，变成一张图。', 'Playwright 启动 Chromium 无头浏览器，加载动画 HTML，在指定时间截图。画面由浏览器排版与绘图，帧图片进入后续编码步骤。', '加载 HTML，等待字体\n推进到当前帧时间\n浏览器截图 → JPEG 帧'],
    ['编码器负责视频文件', '连续图片，组成一支 MP4。', 'FFmpeg 接收 JPEG 帧流，用 libx264 编码为 H.264 MP4。完成文件复制到会话工作区，前端取得签名下载地址。当前编码流程没有音轨输入。', 'JPEG 帧序列\n    ↓ FFmpeg / libx264\nvideos/<job>.mp4 → 签名下载']
  ];
  document.querySelectorAll('[data-engine]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-engine]').forEach(other => {
      const active = other === b;
      other.classList.toggle('selected', active);
      other.setAttribute('aria-pressed', String(active));
    });
    const e = engines[Number(b.dataset.engine)];
    $('engine-label').textContent = e[0];
    $('engine-detail-title').textContent = e[1];
    $('engine-description').textContent = e[2];
    $('engine-code').textContent = e[3];
  }));
  document.querySelectorAll('[data-scenario]').forEach(b => b.addEventListener('click', () => {
    selectedScenario = b.dataset.scenario;
    const s = scenarios[selectedScenario];
    document.querySelectorAll('[data-scenario]').forEach(other => {
      const active = other === b;
      other.classList.toggle('selected', active);
      other.setAttribute('aria-pressed', String(active));
    });
    ['kicker', 'heading', 'description', 'fit', 'boundary', 'output'].forEach(k => $('scenario-' + k).textContent = s[k]);
    $('scenario-inputs').replaceChildren(...s.inputs.map(t => Object.assign(document.createElement('li'), { textContent: t })));
  }));
  const duration = 24;
  const starts = [0, 4.5, 9, 14, 19];
  let filmScenario = 'research', time = 0, playing = false, frame = 0, anchor = 0, lastBeat = -1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const formatTime = value => '00:' + Math.floor(value).toString().padStart(2, '0');
  function paint(value) {
    time = Math.min(duration, Math.max(0, value));
    let beat = 0;
    for (let i = 0; i < starts.length; i++) if (time >= starts[i]) beat = i;
    if (beat !== lastBeat) {
      const s = scenarios[filmScenario], b = s.beats[beat];
      $('film-brand').textContent = s.brand;
      $('film-kicker').textContent = b[0];
      const emphasis = Object.assign(document.createElement('em'), { textContent: b[2] });
      $('film-title').replaceChildren(document.createTextNode(b[1]), document.createElement('br'), emphasis);
      $('beat-label').textContent = String(beat + 1).padStart(2, '0') + ' / 05';
      const nodes = [];
      b[3].forEach((t, i) => {
        if (i) nodes.push(Object.assign(document.createElement('span'), { className: 'visual-arrow', textContent: '→' }));
        nodes.push(Object.assign(document.createElement('span'), { className: 'visual-node' + (i === 1 ? ' active-node' : ''), textContent: t }));
      });
      $('film-visual').replaceChildren(...nodes);
      $('film').setAttribute('aria-label', '本地代码动画示意：' + b[1] + b[2]);
      lastBeat = beat;
    }
    const progress = Math.min(1, (time - starts[beat]) / .65);
    const ease = 1 - Math.pow(1 - progress, 3);
    document.querySelector('.film-content').style.transform = reducedMotion.matches || time === 0 ? 'none' : 'translateY(' + (1 - ease) * 12 + 'px)';
    $('film-progress').style.width = (time / duration * 100) + '%';
    $('film-time').textContent = formatTime(time);
    $('timeline').value = time.toFixed(1);
    $('time-readout').textContent = formatTime(time) + ' / 00:24';
  }
  function setPlaying(next) {
    cancelAnimationFrame(frame);
    playing = next;
    $('play').textContent = next ? 'Ⅱ 暂停' : '▶ 播放示意';
    $('play').setAttribute('aria-label', next ? '暂停代码动画' : '播放代码动画');
    $('play').setAttribute('aria-pressed', String(next));
    if (next) {
      if (time >= duration) { lastBeat = -1; paint(0); }
      anchor = performance.now() - time * 1000;
      frame = requestAnimationFrame(tick);
    }
  }
  function tick(now) {
    if (!playing) return;
    paint((now - anchor) / 1000);
    if (time >= duration) setPlaying(false);
    else frame = requestAnimationFrame(tick);
  }
  $('play').addEventListener('click', () => setPlaying(!playing));
  $('restart').addEventListener('click', () => { setPlaying(false); lastBeat = -1; paint(0); setPlaying(true); });
  $('timeline').addEventListener('input', event => { setPlaying(false); paint(Number(event.target.value)); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); });
  $('load-demo').addEventListener('click', () => {
    setPlaying(false); filmScenario = selectedScenario; lastBeat = -1; paint(0);
    $('demo').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    if (!reducedMotion.matches) setPlaying(true);
  });
  $('load-prompt').addEventListener('click', () => {
    if (mode === 'prompt') setMode('url');
    drafts.prompt = scenarios[selectedScenario].prompt;
    setMode('prompt');
    $('io').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    $('brief').focus({ preventScroll: true });
  });
  $('copy-brief').addEventListener('click', async () => {
    if (mode === 'url') {
      drafts.prompt = scenarios[selectedScenario].prompt;
      setMode('prompt');
    }
    const content = $('brief').value.trim();
    if (!content) { $('copy-status').textContent = '提示词为空，请先填写创作简报。'; return; }
    try {
      await navigator.clipboard.writeText(content);
      $('copy-status').textContent = '已复制，可粘贴到上游 Prompt 输入框。';
    } catch {
      $('brief').scrollIntoView({ block: 'center' });
      $('brief').focus();
      $('brief').select();
      $('copy-status').textContent = document.execCommand('copy') ? '已复制当前提示词。' : '自动复制不可用，已选中文字，请手动复制。';
    }
  });
  paint(0);
})();
