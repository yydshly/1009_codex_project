export const sourceRef = 'c609246c1eca69f6bc129bcbb5d64c36734e4a4a';
export const repository = 'https://github.com/libtv-labs/libtv-skills';
export const title = 'LibTV Skills：专用创作服务接入与有限复用价值';
export const summary = '面向外部 AI Agent 的 LibTV 专用创作服务接入 Skill，以技能说明、调用步骤和 Python 标准库脚本完成素材上传、会话消息、增量查询、项目切换与图片／视频结果下载。梳理故事与剧本、人物与场景、分镜与参考图、视频镜头、成片与修改的创作链，区分操作约束、LibTV 自家服务端 Agent 的编排、底层图片／视频模型的生成与画布呈现；拆解 1 个 Skill、5 个操作脚本和 1 个公共接口模块、Bearer 鉴权、异步会话、结果解析与平台耦合。沿用原始总结图，评估短剧、广告、MV、产品展示等官方描述场景、现有用户接入价值与我们自建系统的有限复用价值；说明兼容后端、解析泛化、任务恢复、参数与版本追踪及独立人物／分镜／剪辑系统等扩展的条件和成本。研究固定源码、MIT 许可与用户反馈，明确云端核心未公开、扩展方案未实现、未进行真实生成或成片质量验证。';
export const summarySections = [
  { label: '定位', text: '面向外部 Agent 的 LibTV 专用接入 Skill；本质是创作服务调用的一组步骤与操作约束，后台编排交由 LibTV 自家服务端 Agent。' },
  { label: '能力', text: '上传参考图片／视频、创建和续用会话、发送自然语言要求、增量查询消息、切换项目、批量下载结果与提供画布链接；文生图、视频生成编辑、短剧和 MV 等是官方描述的云端能力。' },
  { label: '模块', text: '1 个 SKILL.md、5 个操作脚本，以及 _common.py 公共模块；客户端负责上传、传话、查询和取件，服务端处理创作编排，图片／视频模型生成画面。' },
  { label: '原理', text: '素材上传取得 URL，自然语言经 Bearer 鉴权发送到会话 API，返回 sessionId／projectUuid；宿主按文本规则轮询消息，解析结果并下载，云端内部模型调度与剪辑实现未公开。' },
  { label: '内容与界面', text: '故事／剧本、人物／场景、分镜／参考图、镜头、成片／修改构成创作链；画布是呈现与操作方式，对话、表格、时间线可承载不同操作，但不自动增加后台能力。' },
  { label: '引导与证据', text: '原样使用 2026-10-09 本地排版的完整中文总结图，保留 PNG、HTML、SHA-256 与来源说明；网页提供放大阅读、两条流程、模块依据与事实／判断／建议区分。' },
  { label: '场景与价值', text: '面向已使用 LibTV 的 Agent 用户，可减少上传、轮询和取件操作；短剧、广告、MV、产品展示等依赖云端能力。对我们自建、自由接模型、控制人物和镜头的系统，直接复用价值有限。' },
  { label: '耦合与边界', text: '可改服务地址，但接口、鉴权与消息格式仍需兼容；画布链接与部分结果解析绑定 LibTV。缺少完整画布、创作引擎和底层模型实现，参数细控与可复现性不能从当前接口推断。' },
  { label: '扩展方向', text: '客户端可补解析泛化、文件检查、下载验收和任务恢复；兼容自有后端需实现会话与任务协议；通用多模型、人物约束、分镜版本、局部重做与剪辑交付需独立设计，不属于已有能力。' },
  { label: '研究基线', text: '固定 main 提交 c609246，2026-10-12 复核仍为同一 HEAD，MIT；Windows／Node.js 22+ 原创静态网页，无根级依赖；未配置 API Key、未运行真实生成，官方描述与用户反馈均不等同于本地实测。' }
];

export const modules = [
  { file: 'skills/libtv-skill/SKILL.md', name: '技能说明与操作约束', role: '决定何时触发、如何上传与传话、怎样查询和交付。', mechanism: '用文本要求外部 Agent 保留用户原始意图，把创作拆解交给服务端；规定 8 秒轮询、增量 seq、超时和展示规则。', boundary: '这些流程规则主要由宿主 Agent 执行，仓库没有完整持久任务调度器；文本要求不等于硬性程序门禁。' },
  { file: 'skills/libtv-skill/scripts/_common.py', name: '公共 API 客户端', role: '统一服务地址、Bearer 鉴权、HTTP 请求及项目链接。', mechanism: 'Python urllib 发起 POST／GET，解析响应 data；默认服务 im.liblib.tv，可由环境变量改地址。', boundary: '会话端点和返回字段采用 LibTV 协议；画布链接前缀固定。改地址需要新服务兼容协议。' },
  { file: 'skills/libtv-skill/scripts/create_session.py', name: '创建会话与发送要求', role: '提交消息，或在已有 session 中继续提出要求。', mechanism: '接受 message 和可选 session-id，返回 sessionId、projectUuid 与 projectUrl。', boundary: '未传 message 时只创建／绑定会话；公开 CLI 没有独立的模型、seed、镜头或时间线参数。' },
  { file: 'skills/libtv-skill/scripts/query_session.py', name: '增量消息查询', role: '读取消息，用于宿主轮询生成进展。', mechanism: '用 afterSeq 拉取后续消息，可根据 project-id 附加画布 URL。', boundary: '脚本每次只查询一次。8 秒轮询、3 分钟超时是 Skill 约定，不能推断服务端任务在超时后被取消。' },
  { file: 'skills/libtv-skill/scripts/upload_file.py', name: '参考素材上传', role: '把本地图片／视频变成服务端可访问的素材 URL。', mechanism: '根据扩展名猜 MIME，构造 multipart 请求，读取服务返回的 url。', boundary: '文档要求小于 200 MB；当前客户端未实现文件大小检查，整个文件读入内存。MIME 推断也不是内容格式检测。' },
  { file: 'skills/libtv-skill/scripts/change_project.py', name: '切换绑定项目', role: '请求切换 accessKey 当前绑定的项目。', mechanism: '调用 change-project 接口，返回新 projectUuid 和画布链接。', boundary: '当前脚本不接收目标项目 UUID；不能据“切换”推断任意项目选择、列出或删除能力。' },
  { file: 'skills/libtv-skill/scripts/download_results.py', name: '结果解析与批量下载', role: '从消息提取生成媒体，保存到本地。', mechanism: '解析 tool 消息的 task_result 与 assistant 文本 URL；自动提取结果去重，默认 5 个下载线程，可指定前缀和目录。', boundary: 'assistant 文本正则限定 LibTV 域名和部分后缀；tool 字段或手动 URL 路线不受同一正则限制。没有媒体完整性验收或断点恢复，下载部分失败会返回 errors。' }
];

export const interfaces = [
  ['POST', '/openapi/session', 'message、sessionId（均可选）', 'data.sessionId、data.projectUuid', '创建／绑定会话，或提交追加消息'],
  ['GET', '/openapi/session/{sessionId}', 'afterSeq（可选查询参数）', 'data.messages', '单次查询消息，供宿主轮询'],
  ['POST', '/openapi/session/change-project', '空 JSON 对象', 'data.projectUuid', '切换当前密钥绑定项目'],
  ['POST', '/openapi/upload', 'multipart：file、accessKey', 'data.url', '上传参考图片／视频']
];

export const capabilities = [
  ['素材接入', '图片／视频上传、素材 URL', '公开脚本', 'upload_file.py', '支持类型与格式检查仍有边界；不包含上传本地音频的操作脚本。'],
  ['会话与要求', '创建、续用会话，发送自然语言', '公开脚本', 'create_session.py', '提供高层创作要求，细粒度操作依赖后端理解与能力。'],
  ['进展与项目', '消息查询、增量 seq、切换绑定项目', '公开脚本', 'query_session.py / change_project.py', '不是完整项目 CRUD，也不是客户端持久任务管理。'],
  ['成果交付', '批量下载图片／视频、画布链接', '公开脚本', 'download_results.py / _common.py', '结果 URL 是产物入口；文件是否完整、画面是否正确要另行验收。'],
  ['图片与视频创作', '生成、编辑、风格迁移、视频续写', '官方能力描述', 'SKILL.md', '通过消息请求 LibTV 云端执行，仓库没有公开这些算法实现。'],
  ['复杂内容制作', '短剧、MV、TVC、产品展示、分镜', '官方能力描述', 'SKILL.md', '剧本到成片是平台能力描述；不能据此保证一条要求稳定产生可交付成片。']
];

export const roles = [
  { name: '外部 Agent', title: '表达与协调用户要求', description: '读取 Skill，上传用户提供的素材，把原始要求与素材 URL 发出，并按规则查询与交付。它不从这个仓库获得故事、人物和镜头的创作算法。', tag: '宿主执行' },
  { name: 'LibTV Skill', title: '专用服务接入与操作约束', description: '公开部分是 SKILL.md、五个操作脚本和公共 HTTP 模块。它规定调用步骤，承接上传、传话、查询和取件。', tag: '开源客户端' },
  { name: 'LibTV 服务端 Agent', title: '组织创作任务', description: '按官方说明负责理解要求、拆解分镜、选择模型和编写模型提示词。内部任务状态、编排算法与剪辑实现未在此仓库公开。', tag: '云端描述' },
  { name: '图片／视频模型', title: '实际生成图像、动作与镜头', description: '模型接受最终提示词及参考媒体，生成具体画面。人物一致性、动作合理性和镜头衔接仍需检查；开源客户端没有包含模型权重或推理实现。', tag: '底层生成' }
];

export const creation = [
  { title: '故事与剧本', text: '叙事目标、人物动机、情节与对白。它决定内容要表达什么。' },
  { title: '人物与场景', text: '角色外观、场景设定、参考素材和需要保持的约束。' },
  { title: '分镜与参考图', text: '把情节转成镜头：景别、动作、运镜、构图、时长和声音。' },
  { title: '视频镜头', text: '图片／视频模型执行生成，逐镜头挑选结果与修正偏差。' },
  { title: '成片与修改', text: '组织镜头、节奏、字幕与声音，检查后局部重做与导出。' }
];

export const serviceFlow = [
  { title: '上传参考素材', text: '用户给了图片／视频时，先上传取得可访问 URL；纯文字要求可跳过。', file: 'upload_file.py' },
  { title: '发送创作要求', text: '将要求和素材 URL 发送到会话接口，保留 sessionId 与 projectUuid。', file: 'create_session.py' },
  { title: '云端编排与生成', text: '服务端 Agent 组织创作并调用模型；这是官方描述，内部实现不在公开库。', file: 'SKILL.md' },
  { title: '查询消息与结果', text: '宿主按 Skill 轮询，利用 seq 增量读取消息与结果 URL。', file: 'query_session.py' },
  { title: '下载并交付', text: '提取图片／视频、下载本地文件，并提供项目画布链接继续查看。', file: 'download_results.py' }
];

export const coupling = [
  ['更换外部 Agent', '宿主能读取技能说明、执行 Python 脚本并满足授权条件', '可以使用现有 Skill；不同宿主的技能加载与展示方式需要适配。'],
  ['修改服务地址', '设置 OPENAPI_IM_BASE 或 IM_BASE_URL', '只改变请求目标；新服务仍须兼容端点、Bearer 鉴权、字段与消息格式。'],
  ['代理转发到 LibTV', '正确转发现有协议与授权', '仍依赖 LibTV 运行创作任务，没有取得其创作引擎。'],
  ['接入独立兼容后端', '实现会话、项目绑定、上传、消息、任务和结果协议', '技术上可行，但服务端创作编排、存储和模型调用要自己完成。'],
  ['直接换模型 API', '新增协议适配、媒体引用、参数、查询与结果解析', '当前脚本没有通用供应商插件机制；修改 base URL 无法完成这些工作。'],
  ['控制人物／分镜／时间线', '新增结构化对象、操作接口、版本和执行能力', '当前公开接口不足以证明支持精细编辑，需要后端新增能力。']
];

export const values = [
  { scenario: '已有 LibTV 用户，让 Agent 帮忙操作', verdict: '用途明确', text: '上传、发送、查询和取件可以纳入自然语言对话，减少重复手动操作。实际收益取决于云端效果、费用与服务稳定性，本次未量化。' },
  { scenario: '我们研究专用 Skill 的接口组织', verdict: '可作小样例', text: '可以学习外部 Agent 与专业服务端的分工，以及会话 ID、增量消息、素材 URL 和结果交付的串联。脚本规模较小，参考深度有限。' },
  { scenario: '我们自建可控、多模型创作系统', verdict: '直接复用价值有限', text: '故事／人物／镜头管理、可见编排、参数控制、局部重做、版本与剪辑等核心实现未公开。供应商耦合较强，核心系统仍需另做。' },
  { scenario: '我们学习视频生成算法或训练模型', verdict: '缺少所需实现', text: '公开库没有模型权重、训练、推理算法或性能基准。模型能力来自云端服务，不能从接入脚本推出模型创新。' }
];

export const scenarios = [
  { title: '短剧与短漫剧', use: '请求剧本、分镜和视频素材，继续提出修改。', condition: '依赖服务端编排；人物一致性、情节与镜头连续性需实际验证。' },
  { title: '产品展示与广告', use: '基于参考图片提出展示片或宣传片要求。', condition: '产品外观、文字、卖点和使用素材的授权需人工确认。' },
  { title: 'MV 与创意短片', use: '以主题、音乐或风格提出镜头创作要求。', condition: '官方描述不等于客户端支持所有音频输入；同步、节奏和最终剪辑需确认。' },
  { title: '视觉预演与分镜探索', use: '快速查看方向、参考构图、镜头候选。', condition: '更适合容许迭代的草稿；精确复现参数与品牌规范需要更细的控制接口。' }
];

export const extensions = [
  { title: '结果解析与文件交付泛化', scope: '客户端可改', basis: '现有 tool 结果解析、assistant 正则与下载脚本。', work: '改为明确的媒体清单，兼容域名／后缀，补临时文件、完整性校验、失败退出和重试恢复。', boundary: '能改善取件可靠性；不能增加云端模型或创作能力。' },
  { title: '显式任务状态与恢复记录', scope: '客户端＋后端协议', basis: '会话 ID、增量 seq 和文本轮询约定。', work: '增加 taskId、状态机、检查点、去重与幂等、取消／超时、重启恢复和单任务产物关联。', boundary: '需要后端提供可区分的任务状态；不能把出现某个 URL 当作整项创作完成。' },
  { title: '模型参数与实际提示词留痕', scope: '后端需配合', basis: '当前只发送 message，后端负责编排与提示词。', work: '记录用户要求、最终模型提示词、模型版本、seed、参考素材、生成参数和费用，支持选择或受控 raw 模式。', boundary: '这是我们提出的可控性方案；仓库没有公开稳定 raw 模式或完整参数合同。' },
  { title: '通用创作服务适配层', scope: '独立开发', basis: '可以参考上传、提交、查询与下载的操作分工。', work: '为不同供应商定义 submit／status／cancel／results 合同，显式声明模型参考能力、时长与参数差异。', boundary: '要实现协议映射、错误与费用处理；此库不是现成多供应商 SDK。' },
  { title: '人物、场景与镜头的可编辑项目', scope: '独立核心系统', basis: '我们对创作链的分析，非此仓库的数据模型。', work: '设计角色设定、场景约束、镜头 ID、参考关系、候选版本、审核与局部重做；把修改影响传播到相关产物。', boundary: '核心对象、依赖关系和一致性保障需自己实现与验证。' },
  { title: '剪辑、质量检查与多种界面', scope: '独立核心系统', basis: '内容结构与呈现方式可以分离。', work: '以统一项目数据驱动画布、表格、对话和时间线；增加字幕、音轨、拼接导出与逐镜头人工审核。', boundary: '新界面需要已有业务操作和执行器支撑；画布改版本身不会形成新的生成能力。' }
];

export const objects = [
  ['故事／剧本', '叙事目标、情节、对白、场景顺序、版本', '内容结构可检查与修改'],
  ['人物／场景', '角色外观、场景设定、参考素材、连续性约束', '为多个镜头提供共同依据'],
  ['镜头／分镜', '镜头 ID、人物引用、动作、景别、运镜、时长、声音', '支持定位、选择和单镜头重做'],
  ['任务／产物', '输入素材、实际提示词、模型参数、状态、费用、候选版本', '可追踪生成过程与失败恢复'],
  ['成片／时间线', '已选镜头、顺序、字幕、音轨、转场、导出设置', '把素材组织成可交付作品']
];

export const evidence = [
  ['README.md', '项目定位与安装条件', '专用 OpenAPI 接入 Skill，Python 标准库、密钥、安装与五类操作。README 的 Python 3.6+ 是上游声明，本次没有逐版本兼容实测。'],
  ['skills/libtv-skill/SKILL.md', '操作约束与云端能力描述', '外部 Agent 负责传话，服务端负责创作编排；轮询、超时与展示规则是文本协议。'],
  ['skills/libtv-skill/scripts/_common.py', '接口协议与服务耦合', '可配置 IM 地址、固定会话端点、Bearer 鉴权、data 字段与画布链接前缀。'],
  ['skills/libtv-skill/scripts/create_session.py', '公开参数范围', 'message 与 session-id；响应标识与项目链接。'],
  ['skills/libtv-skill/scripts/query_session.py', '单次查询与增量读取', 'after-seq 与 project-id；脚本没有常驻轮询调度。'],
  ['skills/libtv-skill/scripts/upload_file.py', '素材传输与检查边界', 'multipart 上传、MIME 推断、一次读入文件；客户端没有 200 MB 大小校验。'],
  ['skills/libtv-skill/scripts/change_project.py', '项目切换范围', '无目标 UUID 参数，切换密钥当前绑定项目。'],
  ['skills/libtv-skill/scripts/download_results.py', '结果解析与交付边界', 'tool 的 task_result、assistant 的限定域名正则、并行下载和 errors。'],
  ['LICENSE', '上游 MIT 许可', 'Copyright (c) 2026 libtv-labs；本项目未引入上游执行代码，保留许可原文供研究查阅。']
];
