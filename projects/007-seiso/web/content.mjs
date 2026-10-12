export const baseline = {
  repository: 'https://github.com/scarletkc/seiso',
  commit: '7e5b3b1b96766e69dedd091dd15ee44db89cf042',
  version: '0.3.0',
  researchedAt: '2026-10-09',
  publishedAt: '2026-10-12',
  guideHash: '7949dbb60ecbf34292670be52ba9eb588224eeb49b2566feb4157bc4297ed97c',
  url: 'https://yydshly.github.io/1009_codex_project/007-seiso/',
};

export const source = (path) => `${baseline.repository}/blob/${baseline.commit}/${path}`;

export const summary = '面向代码仓库的 Markdown 文档约定与 Rust 静态检查器。全面梳理文档类型与语言、配置与工作区、Markdown 解析、章节角色、路径与跨文件索引、规则与例外、诊断与有限修复、内容缓存及 CLI 集成；解释词表、正则、结构启发式与 Jaccard 相似度的分工，区分 5 条默认稳定规则与 22 条预览规则。保留原始中文引导图，说明 AI 文档、多人与多文档维护、操作手册、文档站点和提交/CI 场景，对研究总库的引用质量、事实归属与复现依据的价值，以及配置、Agent 集成、自定义业务规则、语义审阅与知识系统扩展。研究网页与 Pages 发布已完成；不依赖大模型执行检查，不自动验证任意字段或技术事实，上游 CLI 未独立实跑。';

export const summarySections = [
  { label: '定位', text: 'Markdown 文档约定及本地静态检查器，把能明确表述的文档维护要求转成可重复执行的检查；元数据决定策略，正文和结构提供检查内容。' },
  { label: '能力', text: '类型与本地文件目标、例外声明、易变值、对话残留、章节组织、含糊指向、标题锚点、重复定义、相似段落、权威归属和邻近证据；区分默认稳定与预览。' },
  { label: '模块', text: 'main/commands、workspace、analysis、config、md、paths、index、sections、rules、diagnostics、cache，分别承担命令、加载、策略、解析、关系检查、输出和缓存。' },
  { label: '原理', text: 'Markdown 解析成带原文位置的文档模型，结合类型、语言、领域与路径政策执行词表/正则、结构启发式和集合相似度，形成可追踪诊断；检查过程不调用模型。' },
  { label: '处理与集成', text: '文本、JSON、SARIF、GitHub 注解及 parse/policy/index 工具；--fix 主要清理确认失效的例外。Claude Code hook、pre-commit、CI 及外部 Agent 可调用 CLI。' },
  { label: '使用场景', text: 'AI 经常写改文档、多人协作、多页共享定义、操作手册、文档站点与提交检查；重复的是检查流程，文档内容本身无需重复，少量笔记收益有限。' },
  { label: '个人与总库价值', text: '补充 README/research/AGENTS 的引用与内容检查，按项目划分比较领域，让定义集中且研究结论有可核查来源；固定 commit 是复现依据，已有元数据和索引校验仍保留。' },
  { label: '扩展方向', text: '现有配置可扩词表、类型、阈值、领域和站点路由；外部接编辑器与 Agent；业务字段、实验/图片/元数据一致性需新规则，模型语义审阅、检索与存储另建。' },
  { label: '边界与交付', text: '不是数据库、知识检索或任意 schema 验证器，不抓取外部 URL，不保证事实与证据质量；固定 7e5b3b1 / 0.3.0 / MIT，原始引导图保留，网页与发布可验证，上游 CLI 未独立实跑。' },
];

export const rules = [
  ['KND001', '文档类型缺失或无法解析', 'stable', '类型', '从 frontmatter 或路径映射解析文档用途；损坏的声明不会被映射补救。'],
  ['KND002', '文档类型无效', 'stable', '类型', '识别不支持的类型，以及在文档中直接声明 generated 的情况。'],
  ['LNK001', '本地文件目标缺失', 'stable', '引用', '检查链接目标的物理存在性；外部 URL 不参与抓取。'],
  ['SUP001', '例外声明无效', 'stable', '例外', '检查规则代码、理由、作用范围等声明要求。'],
  ['SUP002', '例外声明已不再使用', 'stable', '例外', '只在相应规则完成检查后确认例外是否失效；是安全修复的主要对象。'],
  ['STL001', '长期文档中的当前值快照', 'preview', '易变信息', '当前状态词与版本、哈希、镜像标签或数量共同出现时，提示维护风险。'],
  ['STL002', '部署状态断言', 'preview', '易变信息', '识别长期文档里的部署状态表述，不核验真实服务状态。'],
  ['STL003', '嵌入提交标识', 'preview', '易变信息', '提交、SHA 或构建上下文后出现十六进制标识；复现所需的固定值可解释例外。'],
  ['STL004', '缺少长期约束的版本', 'preview', '易变信息', '区分可识别的版本快照、约束与历史上下文，提示作者作判断。'],
  ['PTR001', '只指向仓库根目录', 'preview', '引用', '在应该定位具体依据时，提示提供文件、符号或更明确的指向。'],
  ['PTR002', '目录指向缺少维护索引', 'preview', '引用', '结合 catalog-dirs 声明识别缺少明确答案入口的目录链接。'],
  ['PTR003', '来源指向不明确', 'preview', '引用', '通过来源词表提示指向不清的表述，不完成全文语义验证。'],
  ['LNK002', '本地标题锚点缺失', 'preview', '引用', '利用工作区索引判断目标文档中是否有对应标题或 HTML 锚点。'],
  ['DUP001', '重复维护标识符定义', 'preview', '重复与归属', '比较同语言、同领域的定义列表与表格中的标识符集合。'],
  ['DUP002', '重复说明后再指向来源', 'preview', '重复与归属', '结合定义与链接识别可改成直接引用来源的重述。'],
  ['DUP003', '高度相似的独立段落', 'preview', '重复与归属', '比较字符片段集合的 Jaccard 相似度，不建立全文语义等价。'],
  ['OWN001', '计划与定义重叠', 'preview', '重复与归属', '用共享定义标识识别计划文档与已交付定义的重叠。'],
  ['OWN002', '权威来源归属不明确', 'preview', '重复与归属', '根据 canonical 与类型排序发现平局，要求作者选择权威文档。'],
  ['RAT001', '流程前的设计论证', 'preview', '结构', '结合章节角色判断操作或参考文档是否先展开设计论证。'],
  ['RAT002', '设计选择标题', 'preview', '结构', '识别某些设计论证标题，建议把设计取舍放到 ADR。'],
  ['ORD001', '操作前铺垫过长', 'preview', '结构', '按结构与阈值提示前言是否延迟了读者需要的步骤。'],
  ['ORD002', '例外先于主要流程', 'preview', '结构', '提示操作指南和手册中可能妨碍主流程阅读的章节顺序。'],
  ['MIX001', '章节职责混杂', 'preview', '结构', '根据启发式角色，提示程序、参考或操作章节中的职责冲突。'],
  ['VOX001', '面向原请求者的对话残留', 'preview', '表达与证据', '词表与句子上下文识别“根据你的要求”等正式文档中的对话痕迹。'],
  ['VOX002', '排除范围式标题', 'preview', '表达与证据', '识别部分长期文档里的排除范围标题并提示作者判断。'],
  ['VOX003', '叙述文档或工作的制作过程', 'preview', '表达与证据', '通过标题和词表识别可能与读者任务无关的制作过程叙述。'],
  ['EVD001', '比较性评价附近缺少证据', 'preview', '表达与证据', '检查附近来源或测量的存在，不能证明证据可靠或结论成立。'],
].map(([code, title, status, family, detail]) => ({ code, title, status, family, detail, url: source(`docs/rules/${code}.md`) }));

export const modules = [
  ['main / commands', '命令入口与编排', '参数、命令分发、结果渲染与受控写入。', 'src/commands.rs'],
  ['workspace', '加载工作区', '发现 Markdown、解析路径策略、按所需范围读取文档并汇总输入错误。', 'src/workspace.rs'],
  ['config', '配置与策略', '读取 seiso.toml 等配置、显式继承、类型映射、领域与规则选择。', 'src/config/mod.rs'],
  ['md', '文档模型', '解析 CommonMark/GFM、元数据、块、句子和链接，保留原始位置。', 'src/md/parser.rs'],
  ['paths', '目标路径', '路径标准化、相对链接与站点路由候选、大小写与文件存在性。', 'src/paths.rs'],
  ['index', '跨文档关系', '组合类型、语言、领域、标题锚点与链接解析结果，支持跨文件检查。', 'src/index/mod.rs'],
  ['sections', '章节角色', '从结构与词表推断流程、背景、恢复等角色，保留判断依据。', 'src/sections.rs'],
  ['rules', '规则与例外', '注册稳定性、适用类型和依赖；执行规则、解释例外并构造有限修复。', 'src/rules/mod.rs'],
  ['analysis', '分析与报告', '编排检查、应用例外、选择需报告的问题并提出修复计划。', 'src/analysis.rs'],
  ['diagnostics', '诊断与输出', '文件位置、原文片段、关联证据、规则链接及多种输出格式。', 'src/diagnostics/mod.rs'],
  ['cache', '内容缓存', '按内容哈希缓存解析数据；配置、路径、规则结果仍在当前工作区重新解析。', 'src/cache/mod.rs'],
].map(([name, title, description, path]) => ({ name, title, description, path, url: source(path) }));

export const kinds = [
  ['readme', '这是什么，如何开始', '定位、快速开始、文档入口'],
  ['howto', '具体任务怎么做', '步骤、命令和预期结果'],
  ['reference', '接口或约定是什么', '字段、行为、契约与定义'],
  ['runbook', '如何运行与处理故障', '操作、恢复和必要条件'],
  ['agents', 'Agent 如何在此工作', '工作约定与操作指向'],
  ['adr', '为什么作出此决定', '设计取舍与决策记录'],
  ['plan', '接下来准备做什么', '计划与未交付内容'],
  ['changelog', '某个时间发生了什么', '带日期的变更与历史'],
  ['generated', '工具产生的参考内容', '只能路径映射；参与索引但不运行规则'],
];

export const scenarios = [
  ['AI 文档反馈', 'AI 更新安装指南后，自动检查本地引用和类型，并按需评估对话残留等预览问题。', '编辑后反馈 + 提交前完整复查；Claude Code hook 不覆盖 shell 写入。'],
  ['多人共同维护', '把明确的文档要求放在配置和类型约定里，减少每次评审反复讨论相同问题。', '规则统一是团队选择；语义与技术正确性仍需要审阅。'],
  ['多页共享定义', 'README、操作指南和参考手册都说明配置字段时，让完整定义保留一个权威来源。', '按同语言、同领域比较；合理重复可解释例外。'],
  ['操作与故障手册', '减少易变部署状态、过长前言与含糊的“见源码”指向，让读者尽快找到步骤和依据。', '固定实验版本属于复现依据，不能一律删除。'],
  ['文档站点', '通过 sites 路由映射让页面路由与 Markdown 源文件建立关系，再检查本地目标。', '支持配置路由；不会抓取全部外部网站验证链接。'],
  ['提交与 CI', '在 pre-commit、GitHub Actions 或其他流水线中输出文本、JSON、SARIF 与注解。', '稳定规则可先采用；预览规则先评估再考虑门禁。'],
];

export const values = [
  ['引用质量', '检查文档入口与本地文件指向，帮助避免“目录存在但读者找不到说明”的问题。'],
  ['单一事实来源', '提示跨页定义重复，为参考资料、操作指南和设计记录分配职责。'],
  ['AI 修改反馈', '把具体文件、位置与建议交给 Agent，支持先检查、再修复、再复查的工作流。'],
  ['可追踪结论', '对可识别的比较评价提示邻近来源；研究依据仍由你审核，工具不证明证据质量。'],
  ['可迁移的工程方法', '借鉴解析模型、规则注册、比较领域、诊断关联和内容哈希缓存，开发自己的研究检查器。'],
];

export const extensions = [
  { level: '配置调整', status: '已有能力', title: '按项目建立文档规则', items: ['按路径映射用途并选择规则', '扩展中英日词表与重复检测阈值', '按项目和语言划分比较范围', '配置站点路由、权威来源和有理由的例外'], boundary: '修改字段名称不等于增加校验算法。' },
  { level: '外部集成', status: '调用现有 CLI', title: '让检查进入工作流', items: ['Codex 或其他 Agent 调用 CLI 并消费诊断', '编辑器、提交与发布检查', '汇总 JSON / SARIF 形成检查报告', '比较 policy 变化并评审规则与例外调整'], boundary: '除已有适配器外，具体接入需自行实现。' },
  { level: '新增开发', status: '需要规则或脚本', title: '研究总库业务约定', items: ['来源、commit、许可证、环境和证据字段完整性', 'projects.json 与研究描述的一致性', '图片说明、实验记录和发布清单', 'sourceRef 所指版本与引用资料的匹配'], boundary: '需要新增 Rust 规则或配套脚本；本站未实现这些业务校验。' },
  { level: '外部系统', status: '另建语义与存储', title: '从检查到审阅与知识系统', items: ['接入模型审阅技术结论并由人确认', '检索来源并跳转到原始证据', '建立知识图谱、索引与资料存储', '持续评估误报、漏报与维护成本'], boundary: '模型、检索和数据库能力来自新系统。' },
];

export const examples = [
  { id: 'link', label: '失效链接', code: 'LNK001', status: 'stable', before: '[安装步骤](docs/install.md)', observation: '若 docs/install.md 不存在，本地文件存在性检查可以确定目标缺失。', after: '[安装步骤](docs/setup.md)', decision: '先确认实际文件位置，再修正链接；检查不推断哪个文件的内容正确。' },
  { id: 'voice', label: '对话残留', code: 'VOX001', status: 'preview', before: '---\nkind: howto\nlang: zh\n---\n\n根据你的要求，下面是更新后的安装指南。', observation: '类型和语言决定适用规则；词表与上下文识别面向原请求者的表达。', after: '---\nkind: howto\nlang: zh\n---\n\n按以下步骤安装命令行工具。', decision: '修复要面向实际读者；这种检查是语言信号，不证明文档由 AI 创作。' },
  { id: 'snapshot', label: '版本快照', code: 'STL001', status: 'preview', before: '---\nkind: howto\n---\n\nThe service currently uses v1.2.3.', observation: '识别当前状态词与版本组合，提示长期文档可能需要持续人工更新。', after: '---\nkind: howto\n---\n\nSee the release record for the deployed version.', decision: '工具不核验真实最新版本。固定研究版本可作为复现记录保留，不应擅自改成最低版本要求。' },
];

export const sources = [
  ['项目定位与独立规范', 'README.md'], ['规范覆盖与证据边界', 'docs/reference/convention.md'],
  ['架构与执行范围', 'docs/reference/architecture.md'], ['规则与稳定性注册', 'src/rules/mod.rs'],
  ['配置与类型映射', 'docs/reference/configuration.md'], ['命令、输出与安全修复', 'docs/guides/checking.md'],
  ['Claude Code、提交与 CI', 'docs/guides/integrations.md'], ['字段定义重复检测', 'docs/rules/DUP001.md'],
  ['段落相似度检测', 'docs/rules/DUP003.md'], ['邻近证据的判断范围', 'docs/rules/EVD001.md'],
  ['版本与依赖', 'Cargo.toml'], ['MIT 许可证', 'LICENSE'],
].map(([label, path]) => ({ label, path, url: source(path) }));
