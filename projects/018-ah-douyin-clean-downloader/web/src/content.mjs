export const repository = 'https://github.com/ahang008/ah-douyin-clean-downloader';
export const sourceRef = 'dbd22a4711d448770169c186dcc7708a2357b5ec';
export const branch = 'feat/creator-batch-offline';
export const version = 'v0.5.0';
export const researchDate = '2026-10-12';
export const guideDate = '2026-10-09';
export const source = file => repository + '/blob/' + sourceRef + '/' + file;
export const title = '抖音内容工作流：下载、资料库与口播加工研究';
export const summary = '一个将抖音公开内容获取、本地识别、资料库管理和 Codex 写作串联起来的 Skill。全面说明单条与整号下载、逐字稿与字幕、文案标签和封面 OCR、公开指标、续跑验收与批量口播改写；拆解 HTTP 下载器、专用 Edge/官方 SDK/Playwright、MLX Whisper、Apple Vision 和确定性辅助脚本的分工。评估风控、Windows 适配、模型成本和非商业许可，保留原始引导图，给出个人价值、产品意义及跨平台、检索、质量审核和任务面板等扩展建议。研究网页已完成，上游下载与真实账号未独立实测。';
export const summarySections = [
  { label: '定位', text: '面向自有或已获授权公开内容的 Codex Skill，把链接、视频和博主目录整理成可追溯的本地素材库，再按需校对或改写文字。' },
  { label: '能力', text: '单条与整号批量下载、本地逐字稿与 SRT、单条语义校对、发布文案与标签、选定封面 OCR、公开互动指标、资料索引与合集、续跑刷新、按点赞排序的口播改写。' },
  { label: '模块', text: 'Skill 路由与环境检查、作者身份解析、专用 Edge 启动与浏览器采集、HTTP 下载器与批量队列、MLX ASR、Apple Vision OCR、指标命名、导出验收和改写准备/渲染/检查。' },
  { label: '原理', text: '单条从官方链接解析作品 ID，查询元数据并用 curl 保存播放源；整号由正常登录的 Edge 和官方网页 SDK 发出分页，Playwright/CDP 捕获目录，之后复用同一下载器。识别在本机，理解和创作由 Codex 完成。' },
  { label: '效果与验收', text: '形成 MP4、JPEG、Markdown、SRT、CSV、JSONL、索引和来源证据。全量需分页闭合、逐项下载/转写验证且缺失为空；机器稿齐全不等于内容准确或已人工听音。' },
  { label: '个人价值', text: '少量视频且已有处理工具时增量有限；大量授权作品的长期整理更受益。对当前 Windows 研究总库，优先借鉴采集分工、哈希证据、检查点与任务验收，暂不需要完整接入。' },
  { label: '产品意义', text: '将分散的采集、下载、识别和写作步骤封装为自然语言驱动、可恢复、可核验的素材工作流；价值侧重减少重复劳动和管理成果。未见本分支分发自研签名破解算法。' },
  { label: '边界与环境', text: '真实浏览器和登录不保证免风控，播放源不擦除烧录水印；公开指标不是后台数据。单条下载可跨平台，当前完整批量/MLX/OCR 路线依赖苹果环境；Codex 校对和写作仍消耗模型用量，商业使用需书面授权。' },
  { label: '扩展方向', text: '跨平台 ASR/OCR 与浏览器适配、资料检索和来源跳转、听音校对台、指标快照比较、进度/错误面板、资料导出及授权与会话管理；均为建议，未在本站实现。' },
  { label: '依据与交付', text: '固定研究 feat/creator-batch-offline 的 v0.5.0 / dbd22a4，保留 2026-10-09 生成的完整原图，2026-10-12 复核；交付研究文档、响应式网页和 Pages 发布，未登录抖音或实跑下载/识别。' },
];
export const capabilities = [
  { title: '单条视频获取', input: '官方视频链接或完整分享口令。', output: '按博主目录保存平台播放源 MP4，保留其音视频，不转码。', boundary: '文件头或 ffprobe 检查验证媒体；平台播放文件不是作者上传前的母版。', file: 'scripts/download_douyin.py' },
  { title: '整号批量归档', input: '博主主页、分享名片或 sec_uid。', output: '采集公开作品目录，逐条下载，保留状态；可同目录续跑或显式刷新纳入新作品。', boundary: '范围是当前公开且可访问的视频。图文、私密、已删除或不可访问作品不算归档成功。', file: 'scripts/run_creator.py' },
  { title: '本地逐字稿与字幕', input: '已经校验的本地媒体。', output: 'FFmpeg 提取音频，本地 MLX Whisper 输出 Markdown、SRT、ASR 片段和识别证据。', boundary: '默认模型 mlx-community/whisper-large-v3-turbo；批量输出默认是机器稿。', file: 'scripts/transcribe_local.py' },
  { title: '单条语义校对', input: '单条链接与提取逐字稿的要求。', output: 'Codex 完整校对机器文本、同步 SRT 文字，验收后清理受控临时目录，交付两份成品。', boundary: '保留字幕时间码；未听音的疑点标注待核。批量全稿校对需另行执行并保留原库。', file: 'references/single-transcript.md' },
  { title: '发布文案、标签和封面 OCR', input: '已经取得的公开作品目录。', output: '补采完整文案、标签和选定封面 JPEG；Apple Vision 识字并生成带标注的阅读副本。', boundary: '标题候选可为空；选定封面与首帧不同。低置信、未识出字和获取失败分开记录。', file: 'scripts/collect_cover_metadata.py' },
  { title: '公开指标与一致命名', input: '官方网页公开返回的计数和观察时间。', output: '记录点赞、评论、收藏、分享，生成指标 CSV；MP4/MD/SRT 使用同一命名规则。', boundary: '缺失用 null/未获取，不冒充零；播放占位零不当真实播放量，指标只表示采集快照。', file: 'scripts/work_metrics.py' },
  { title: '资料索引、合并与恢复', input: '目录、下载清单、逐篇稿件、字幕和证据。', output: '逐条来源链接、机器稿合集、JSONL、缺失清单和哈希验收；已验证成果跳过，手改成品保护。', boundary: '同一来源/模型/输出验证一致才复用；样本和旧合集不能证明本次全量完成。', file: 'scripts/export_transcripts.py' },
  { title: '已有库的批量口播改写', input: '已经完成并通过离线验证的原片、机器稿、SRT 和证据。', output: '按点赞稳定排序，准备输入；Codex 逐篇创作，另存口播稿、来源映射、拍摄建议、首评和核对清单。', boundary: '默认保留完整开场、重建正文；不将作者亲历变成改写者事实。脚本检查不能认证语义和听音。', file: 'references/batch-rewrite.md' },
];
export const modules = [
  { title: '入口与环境', files: ['SKILL.md', 'scripts/doctor.py', 'scripts/bootstrap.sh', 'scripts/bootstrap-browser.sh'], role: '按用户请求选择单条、转写、整号或已有库改写；检查工具，准备隔离运行环境。', responsibility: '编排入口' },
  { title: '作者身份与独立浏览器', files: ['scripts/collect_creator.py', 'scripts/launch_browser_collector.py'], role: '解析作者 sec_uid；启动已安装的 Edge 与专用会话，开放本机 CDP，用户完成正常登录。', responsibility: '联网 / 用户参与' },
  { title: '官方目录响应采集', files: ['scripts/collect_creator_browser.py'], role: 'Playwright 监听官方网页 SDK 的分页响应，保留公开字段，验证作者、游标链、登录过滤和终点。', responsibility: '联网 / 确定性脚本' },
  { title: 'HTTP 播放源下载器', files: ['scripts/download_douyin.py', 'scripts/download_batch.py'], role: '从分享链接取作品 ID，查询 feed 元数据，选择播放地址；curl 下载，队列限制并发、重试、检查点与逐项验证。', responsibility: '联网 / 确定性脚本' },
  { title: '本地语音识别', files: ['scripts/transcribe_local.py', 'scripts/transcribe_douyin.py'], role: 'FFmpeg 提取音频，本地缓存 MLX Whisper 识别，输出文本、时间码、模型设置与源文件/输出哈希。单条路线管理临时文件。', responsibility: '本地 / ASR 模型' },
  { title: '封面、文案与阅读副本', files: ['scripts/collect_cover_metadata.py', 'scripts/ocr_covers.swift', 'scripts/build_annotated_transcripts.py'], role: '按 ID 补采文案与选定封面，用 Apple Vision 识字；元数据前置到副本中，原机器稿和 SRT 字节保留。', responsibility: '联网采集 + 本地 OCR' },
  { title: '指标、命名与导出', files: ['scripts/work_metrics.py', 'scripts/name_artifacts.py', 'scripts/export_transcripts.py', 'scripts/run_creator.py'], role: '管理未知计数、观察快照、命名变更与恢复，生成 CSV、JSONL、索引、合集和 pipeline-summary。', responsibility: '本地 / 确定性脚本' },
  { title: '改写与审核分工', files: ['scripts/batch_rewrite.py', 'references/batch-rewrite.md'], role: 'prepare/render/check 负责快照、排序、开场锁定、文件与覆盖验收；Codex 负责理解、创作和逐篇语义核验。', responsibility: '本地辅助 + Codex' },
  { title: '进程内网络修复', files: ['scripts/browser_dns_proxy.py'], role: '遇到域名解析异常时可使用本机 CONNECT/DoH 通道；转发加密字节并保留证书验证，不解密 TLS。', responsibility: '可选网络支持' },
];
export const routes = [
  { id: 'single', label: '单条下载', color: 'online', description: '不以浏览器登录为默认前提。核心是链接解析、元数据查询、播放源选择和文件保存。', steps: [
    { title: '识别官方链接', text: '从完整分享文本中提取官方 HTTPS 地址，跟随跳转并再次检查域名。', file: 'scripts/download_douyin.py' },
    { title: '取得作品 ID', text: '从 /video/ 路径、modal_id 或分享页解析唯一作品编号。', file: 'scripts/download_douyin.py' },
    { title: '查询元数据', text: 'curl 请求 aweme.snssdk.com 的 feed 接口，使用客户端风格的 User-Agent；这只是请求声明，不能等同完整模拟 App。', file: 'scripts/download_douyin.py' },
    { title: '选择播放源', text: '优先 play_addr_h264、play_addr，再尝试 H.264 码率源；不将 download_addr 用作后备播放源。', file: 'scripts/download_douyin.py' },
    { title: '保存与检查', text: '下载到 .part，完成后保存 MP4 并检查；不转码。同名文件使用新名称，作者烧录元素保留。', file: 'scripts/download_douyin.py' },
  ] },
  { id: 'creator', label: '整号资料库', color: 'online', description: '浏览器负责作品目录。得到视频 ID 后，批量队列逐条调用上面的独立 HTTP 下载器；视频不是全部通过浏览器保存。', steps: [
    { title: '解析作者并登录', text: '由主页、名片解析 sec_uid；启动本机 Edge 的专用会话，用户在官方窗口正常扫码并完成验证。', file: 'scripts/launch_browser_collector.py' },
    { title: '官方网页产生分页', text: '页面 SDK 发出作者作品请求。Playwright 经本机 CDP 连接，自动滚动并读取已返回的响应。', file: 'scripts/collect_creator_browser.py' },
    { title: '验证完整目录', text: '记录必要公开字段及游标证据，从游标 0 连续到 has_more=0；作者一致、没有登录过滤才可能标为完整。', file: 'scripts/collect_creator_browser.py' },
    { title: '独立下载视频', text: '将目录里的视频 ID 转成官方链接，调用同一下载后端；默认并发 2，本地识别单路运行。', file: 'scripts/download_batch.py' },
    { title: '识别、补采和导出', text: '本地 ASR；补采发布文案和封面、执行 OCR；生成指标、阅读副本、索引与校验通过的全量机器稿合集。', file: 'scripts/run_creator.py' },
  ] },
  { id: 'rewrite', label: '已有库改写', color: 'model', description: '从已完成的资料库开始，准备与渲染可离线进行；Codex 写作和语义审核仍使用模型用量。', steps: [
    { title: '原库完整性验证', text: '检查完整目录、原片、稿件、字幕与识别证据，复核哈希。原库保持独立于 WORK 和 OUT。', file: 'scripts/batch_rewrite.py' },
    { title: '排序与写作输入', text: '主排序按点赞降序，并列再比较分享、收藏、评论、发布时间和 ID；未知值后置，按实际数量准备输入。', file: 'references/batch-rewrite.md' },
    { title: 'Codex 理解与创作', text: '选择覆盖完整开场语意的连续 ASR 片段，默认保留开场，重组正文并加入新案例；亲历归属、错字和事实具体标注。', file: 'references/batch-rewrite.md' },
    { title: '渲染与结构检查', text: '按来源 ID 合并草稿，验证独一覆盖、顺序和开场映射，生成稿件、索引和全量合集。手改成品不静默覆盖。', file: 'scripts/batch_rewrite.py' },
    { title: '另行语义与听音复核', text: '技术完成不等于语义完成；结构报告保留 semantic_review_certified=false、audio_review_certified=false。', file: 'scripts/batch_rewrite.py' },
  ] },
];
export const deliverables = [
  ['media/', 'MP4 原片、download-manifest.json', '源文件 SHA-256、下载状态、时长和音视频流信息。'],
  ['local-transcripts/<ID>/', 'Markdown、SRT、识别证据 JSON', '机器正文、字幕片段、模型设置、源媒体与输出校验值。'],
  ['catalog/', '作品目录、CSV、JSONL、分页证据', '公开指标、采集时间、发布文案、封面文字与可用性。'],
  ['covers/ 与 annotated-transcripts/', '选定封面 JPEG、带标注阅读副本', '封面不是首帧；副本保留原稿，人工修改受到保护。'],
  ['资料库根目录', '视频索引、全文机器稿合集、pipeline-summary.json', '可跳转逐条文件；合集数量以当前完整范围为准。'],
  ['独立 WORK / OUT', '改写快照、草稿、口播稿、索引、核对清单', '写作过程与成品分开，保留来源及开场时间映射。'],
];
export const acceptance = [
  { flag: 'catalog_complete=true', text: '游标从 0 连续分页到真实终点，作者一致、无登录过滤且视频目录非空。' },
  { flag: 'all_public_videos_downloaded=true', text: '当前完整目录中的视频都有校验通过的 MP4、哈希、正时长与音视频流检查。' },
  { flag: 'all_public_videos_transcribed=true', text: '每项都有非空 Markdown/SRT/ASR 证据，源文件、模型设置和输出一致。' },
  { flag: 'cover_metadata_complete=true', text: '文案与封面处理记录覆盖当前目录，缺失为空；ok、低置信或空 OCR 是处理终态，不是人工认证。' },
  { flag: 'missing_*_ids 为空', text: '不能设置样本 limit 后宣称全量；导出数量应与本次完整目录一致。' },
];
export const environments = [
  ['单条下载', 'Python 3.9+、curl；ffprobe 可选', 'Windows / macOS / Linux；缺 ffprobe 时仅做 MP4 文件头检查。'],
  ['本地 MLX 转写 / 完整批量', 'Apple Silicon、macOS 15+、Python 3.12、FFmpeg/ffprobe', '固定依赖在独立虚拟环境；首次模型准备联网，识别读取本地缓存。'],
  ['官方网页目录采集', '已安装 Microsoft Edge、Playwright、专用浏览器会话', '本分支启动器采用 macOS Edge 路径，并使用 POSIX 工具；Windows 需适配。'],
  ['封面 OCR', 'macOS curl/sips/swift、Apple Vision', '不是通用 Windows OCR 后端；只补元数据无需重下 MP4 或重做 ASR。'],
  ['已有库改写辅助', 'Python 3.9+；Codex 负责创作', 'prepare/render/check 不重新登录、下载或识别；模型写作另外计量。'],
];
export const boundaries = [
  { title: '登录和真实浏览器不免风控', text: '官方 SDK 请求仍可能遇到页面验证、登录过滤、限频或接口变化。默认并发 2、有限重试和暂停后续跑属于恢复机制，不能证明安全频率，更不能推断账号不会受限。', file: 'references/troubleshooting.md' },
  { title: '目录获取与媒体下载是两层', text: '浏览器拿到作品目录后，独立 curl 下载器仍需成功查询元数据和取得文件。这个分支没有分发自研签名实现；不能将网页正常打开解释成下载限制已解决。', file: 'scripts/download_batch.py' },
  { title: '无水印的实际含义', text: '选择平台提供的播放源，避开下载字段。它不逐帧修复画面，不擦除上传前烧录的 Logo、字幕或贴片，也不保证获取作者的上传母版。', file: 'references/backend.md' },
  { title: '本地识别不等于全流程离线或零成本', text: '采集、下载和首次模型缓存需要网络；ASR 消耗本机算力、存储和电量。机械辅助脚本不调用在线 LLM，不包含 Codex 对话、校对和改写的模型用量。', file: 'scripts/transcribe_local.py' },
  { title: '数据与内容质量边界', text: '缺失计数不补零；未取得的播放量不估算，公开计数不能代替完播率、转化或收入。机器转写与 OCR 存在误识；技术完整性不认证事实、语义或人工听音。', file: 'references/creator-batch.md' },
  { title: '内容范围、隐私与许可证', text: '仅处理自有或获授权的公开内容。专用浏览器正常保存登录，资料目录与截图是私有运行数据。AH Source Available Non-Commercial License 1.0 限非商业用途，商业使用需书面授权；它不是 OSI 认可的开放源码许可证。', file: 'LICENSE' },
];
export const values = [
  { scenario: '偶尔下载几条，已有转写或分析工具', verdict: '增量价值有限', text: '整套安装和资料库管理可能超过需求。下载后按需处理即可，不必为少量任务迁移完整路线。' },
  { scenario: '大量授权视频，持续整理一个作者', verdict: '工作流价值更明显', text: '分页、逐条产物、检查点、统一命名、来源索引与全量验收能减少重复劳动和成果丢失。' },
  { scenario: '希望学习新的下载底层算法', verdict: '研究优先级可降低', text: '源码未见分发自研签名破解或视频解密。更值得看的是接口与浏览器的职责拆分，以及可靠的本地处理链。' },
  { scenario: '当前 Windows 研究总库', verdict: '先借鉴方法，再按需接入', text: '单条下载路线可用；完整流程的 MLX、Vision、Edge 路径和 POSIX 使用增加适配成本。先复用哈希证据和验收设计。' },
];
export const scenarios = [
  { title: '个人作品备份', text: '将自己的公开视频、字幕和文案统一归档；每条保留 ID 和文件依据，方便恢复与二次整理。', condition: '平台可访问，作品属于自己或已获授权。' },
  { title: '选题与表达研究', text: '对照正文、标题、封面和公开互动快照，研究开场结构与内容主题；结果是编辑参考。', condition: '指标不等同传播因果，也不能推断平台算法。' },
  { title: '授权知识资料库', text: '把讲解视频转成可检索文字，再交给模型做主题整理、比较或摘要。', condition: '检索/RAG 属于后续扩展；先校对关键内容。' },
  { title: '口播创作准备', text: '从已有库选稿、另存改写版本，附来源、拍摄建议与事实核对。', condition: '确认素材授权、亲历归属与商业使用许可。' },
];
export const extensions = [
  { title: '跨平台后端适配', status: '建议 / 未实现', base: 'ASR、OCR、浏览器启动已有清晰职责。', add: '定义统一识别结果和证据接口；适配 Windows/Linux ASR、OCR 和 Edge 路径/锁/进程生命周期。', value: '让当前 Windows 环境按需复用，保持时间码和来源校验一致。' },
  { title: '来源可回跳的检索', status: '建议 / 未实现', base: 'Markdown、JSONL、片段时间码和稳定视频 ID。', add: '全文搜索、主题标签或向量索引；回答引用对应视频和时间段，记录索引版本。', value: '让资料库可用于知识查询，同时可以回听验证。' },
  { title: '听音与校对工作台', status: '建议 / 未实现', base: '机器稿、SRT、置信提示和封面 OCR 状态。', add: '同步播放、逐段修订、术语表和审核记录；保留机器原件与校对差异。', value: '把文件完整性之外的内容质量变成可验收过程。' },
  { title: '进度、错误与恢复面板', status: '建议 / 未实现', base: 'pipeline-summary、manifest、日志和缺失 ID。', add: '可视化阶段、暂停恢复、错误分类与官方验证提示；遇到持续拒绝时停止请求。', value: '降低命令行操作成本，让未完成范围清晰可见；不作为风控绕过功能。' },
  { title: '指标快照比较', status: '建议 / 未实现', base: '公开计数、观察时间和缺失值语义。', add: '显式刷新后保留多版本快照，对齐同一视频并展示变化与数据缺失。', value: '辅助内容研究；不推算未知播放量，不声称预测爆款。' },
  { title: '知识工具导出与阅读', status: '建议 / 未实现', base: '原文、阅读副本、JSONL、CSV 和本地索引。', add: '按用户目标导出到笔记工具或文档系统，维持媒体链接、来源、许可和版本。', value: '把已经取得的资料复用到现有研究流程；当前仅有本地文件交付。' },
  { title: '授权、会话与保留策略', status: '建议 / 未实现', base: '内容授权范围、专用浏览器目录和独立输出。', add: '记录授权范围和期限、敏感目录排除、媒体保留期限、访问与删除审计。', value: '降低长期管理成本；分清软件商业许可与内容使用许可。' },
  { title: '受控更新任务', status: '建议 / 未实现', base: '已有目录缓存、手动 refresh-catalog 和续跑。', add: '用户配置的调度、阶段幂等、失败暂停、变更通知与部署认证。', value: '在确有持续采集需求时减少手动工作；本分支不提供免风控无人值守保证。' },
];
export const evidence = [
  ['README.md', '版本、四种入口与运行要求', '本分支 v0.5.0 的功能范围，单条、整号和已有库改写的交付区别。'],
  ['SKILL.md', '自然语言路由', 'Skill 指令负责选择流程和验收要求，编排不等于全部逻辑交给模型执行。'],
  ['scripts/download_douyin.py', '作品 ID、元数据、播放源与 curl', '固定 feed 入口、User-Agent、播放字段优先级与无转码下载。'],
  ['scripts/download_batch.py', '批量下载与恢复', '复用单条下载后端，默认并发 2、有限重试、manifest 与源文件哈希。'],
  ['scripts/collect_creator_browser.py', '真实网页分页响应', 'Playwright/CDP、官方 SDK、公开字段投影和连续目录验收。'],
  ['scripts/launch_browser_collector.py', '专用 Edge 与环境依赖', '独立浏览器会话、正常登录、macOS 路径和回环 CDP。'],
  ['scripts/transcribe_local.py', '本地 MLX Whisper', '缓存模型、音频提取、片段时间码、模型设置与产物哈希。'],
  ['scripts/ocr_covers.swift', 'Apple Vision OCR', '本地中文/英文识字和置信结果，证明当前苹果框架依赖。'],
  ['scripts/collect_cover_metadata.py', '文案、选定封面与状态', '标题候选、标签、封面取得及低置信/空识别等处理状态。'],
  ['scripts/build_annotated_transcripts.py', '阅读副本与手改保护', '前置元数据说明并保留原机器稿字节，防止覆盖用户修改。'],
  ['scripts/name_artifacts.py', '一致命名与中断恢复', '指标刷新后的路径同步、内容哈希保留与改名恢复记录。'],
  ['scripts/export_transcripts.py', '资料导出与完整性验收', '逐项文件验证、索引、机器稿合集与 JSONL。'],
  ['scripts/batch_rewrite.py', '确定性改写辅助', '快照、排序、输入、渲染、覆盖与开场锁定；不将技术检查认证为语义审核。'],
  ['references/creator-batch.md', '整号范围与完成条件', '各阶段、目录结构、机器稿与人工校对边界。'],
  ['references/batch-rewrite.md', '模型创作与事实归属', '稳定排序、开场、草稿接口、另存成品与内容核验。'],
  ['references/troubleshooting.md', '风控与失败情形', '限频、验证、接口变化、未完成目录与恢复方式。'],
  ['PROVENANCE.md', '独立实现与未分发能力', '未捆绑 F2/DTK 签名实现或日常浏览器凭据读取路线。'],
  ['LICENSE', '商业使用条件', '源码可见非商业许可，商业用途需要书面授权。'],
];
