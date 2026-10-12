import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as data from '../src/content.mjs';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceLink = file => '[' + file + '](' + data.source(file) + ')';
const lines = [
  '# 018 · ' + data.title, '', data.summary, '',
  '- 原仓库：' + data.repository,
  '- 用户指定分支：' + data.repository + '/tree/' + data.branch,
  '- 固定提交：' + data.sourceRef + '；功能版本：' + data.version,
  '- 引导图：' + data.guideDate + '；复核与网页整理：' + data.researchDate,
  '- 网页：https://yydshly.github.io/1009_codex_project/018-ah-douyin-clean-downloader/',
  '- 验证范围：文档与源码研究、网页和部署验证。未登录抖音、未下载真实作品、未运行 MLX/OCR。', '',
  '## 完整摘要', '',
  ...data.summarySections.flatMap(item => ['**' + item.label + '：** ' + item.text, '']),
  '## 原始引导图', '',
  '![完整中文研究引导图](assets/douyin-guide.png)', '',
  'AI 生成的研究说明图，非上游界面。原 PNG 字节保留，校验值见 assets/guide-provenance.json。', '',
  '## 已有能力', '',
  ...data.capabilities.flatMap(item => ['### ' + item.title, '', '- 输入：' + item.input, '- 输出：' + item.output, '- 边界：' + item.boundary, '- 依据：' + sourceLink(item.file), '']),
  '## 模块', '',
  ...data.modules.flatMap(item => ['### ' + item.title, '', item.role, '', '分工：' + item.responsibility, '', item.files.map(sourceLink).join(' · '), '']),
  '## 实现路线', '',
  ...data.routes.flatMap(route => ['### ' + route.label, '', route.description, '', ...route.steps.map((step, i) => (i + 1) + '. **' + step.title + '：** ' + step.text + ' ' + sourceLink(step.file)), '']),
  '## 交付与验收', '',
  ...data.deliverables.map(row => '- **' + row[0] + '：** ' + row[1] + '。' + row[2]), '',
  ...data.acceptance.map(item => '- **' + item.flag + '：** ' + item.text), '',
  '目录完整、文件完整与内容准确分别验收。样本成功不能证明全量。上游记录的一次 139 条实测为作者自报样本，本研究未独立复现。续跑主要按作品恢复，不能推断为单个 HTTP 文件字节级续传。', '',
  '## 风控与使用边界', '',
  ...data.boundaries.flatMap(item => ['### ' + item.title, '', item.text, '', sourceLink(item.file), '']),
  '## 环境与成本', '',
  ...data.environments.map(row => '- **' + row[0] + '：** ' + row[1] + '。' + row[2]), '',
  '采集、下载和首次权重需要网络；本地 ASR/OCR、哈希及原片保留消耗计算和存储；Codex 对话、校对和创作另用模型用量。', '',
  '## 个人价值与产品意义 · 分析判断', '',
  ...data.values.flatMap(item => ['### ' + item.scenario + ' / ' + item.verdict, '', item.text, '']),
  '产品意义是将分散步骤封装为自然语言驱动、可恢复、可核验的素材流水线。我们优先借鉴模块职责、检查点、哈希与验收，对少量下载无需完整接入。', '',
  '## 场景 · 能力推导', '',
  ...data.scenarios.flatMap(item => ['### ' + item.title, '', item.text, '', '条件：' + item.condition, '']),
  '## 可扩展方向 · 全部为建议，未实施', '',
  ...data.extensions.flatMap(item => ['### ' + item.title, '', '- 基础：' + item.base, '- 补充：' + item.add, '- 价值：' + item.value, '- 状态：' + item.status, '']),
  '我们的候选最小实验尚未实施：用自有本地视频验证原片、机器稿/SRT、校对版和来源索引，先评估资料管理收益再决定是否联网采集。', '',
  '## 来源与许可证', '',
  ...data.evidence.map(([file, title, detail]) => '- ' + sourceLink(file) + '：' + title + '。' + detail), '',
  '本站为原创研究文字、图示和网页，没有引入上游可执行代码。上游为 AH Source Available Non-Commercial License 1.0；商业用途需书面授权，且软件许可与内容授权分别确认。', '',
  '## 网页运行', '', 'Node.js 22+，无第三方依赖。', '',
  '进入 web/ 后运行 npm run build、npm run check、npm run dev。根目录运行 npm run index:sync、npm run check、npm run pages:build。', '',
];
await writeFile(path.join(project, 'README.md'), lines.join('\n'));
const record = [
  '# 018 · 研究记录', '',
  '## 快照与范围', '',
  '- 研究日期：2026-10-12（Asia/Shanghai）。讨论和引导图日期：2026-10-09。',
  '- 上游：' + data.repository + '/tree/' + data.branch,
  '- 固定提交：' + data.sourceRef + '。分支功能版本：v0.5.0；提交日期：2026-09-30。',
  '- 2026-10-12 通过 git ls-remote 再核对，指定分支仍指向同一提交；没有将 main 的其他版本混入。',
  '- 上游克隆仅用于源码阅读，保留在总库忽略的 upstream/ 下。',
  '- 本机环境：Windows、Node.js 22.15.0；没有搭建上游 MLX 或 Apple Vision 环境。',
  '- 页面为原创静态研究站点，Node.js 22+ 标准库构建，无第三方运行依赖。', '',
  '## 理解演进', '',
  '1. 最初按下载器理解；源码和文档表明已有整号归档、本地转写、封面识字及已有库改写。',
  '2. 单条下载用 HTTP 接口；整号仅由真实 Edge/SDK 产生目录请求。目录 ID 交给独立下载器。',
  '3. 没有证据把正常登录等同免风控；文档明确限频、页面验证和接口变化可能导致失败。',
  '4. “无水印”是选播放源；“离线”主要是本地识别；“可续跑”主要按作品和校验恢复。',
  '5. 对少量视频与当前 Windows 环境，增量有限；大批量授权资料管理更有收益，工程整合值得借鉴。', '',
  '## 结论依据', '',
  ...data.evidence.map(([file, title, detail]) => '- ' + sourceLink(file) + '：' + title + '。' + detail), '',
  '## 原始图与内容性质', '',
  '- 直接使用本次聊天最终生成的 PNG，未重新生成或编辑。原图文件名与 SHA-256 见 assets/guide-provenance.json。',
  '- 图为研究说明，非软件界面、账号采集结果或独立实测截图。',
  '- 网页区分源码事实、上游记录、分析判断、示例及建议。八类扩展均未在本站实现。', '',
  '## 验证与发布', '',
  '- 网页构建与检查覆盖脚本语法、本地资源、锚点与 ARIA、固定版本、原图发布字节及 SHA-256。',
  '- 浏览器阅读、交互、部署结果和最终提交另见 validation.md。',
  '- 未登录抖音、未下载真实作品、未运行 MLX/OCR，未独立认证准确率、风控概率或账号安全。', '',
  '## 许可', '',
  '上游源码可见非商业许可证，商业用途需书面授权；本次仅原创研究文字、网页与生成图，不引入上游执行代码。', '',
];
await writeFile(path.join(project, 'research.md'), record.join('\n'));
const repoRoot = path.resolve(project, '../..');
const catalogPath = path.join(repoRoot, 'projects.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const item = catalog.projects.find(project => project.id === '018' && project.slug === 'ah-douyin-clean-downloader');
if (!item) throw new Error('缺少 018 项目元数据');
Object.assign(item, { title: data.title, summary: data.summary, summarySections: data.summarySections, sourceRef: data.sourceRef, status: 'done', addedAt: data.researchDate, preview: 'assets/douyin-guide.png', previewCaption: '本次对话生成的完整中文研究引导图，原 PNG 字节保留，非上游界面或采集结果；依据 v0.5.0 / dbd22a4，网页全面补充能力、模块、三条路线、价值、风控/环境/成本/许可边界与扩展建议。', pagesDir: 'web/dist' });
await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
console.log('018 完整研究文档与分项摘要已更新。');
