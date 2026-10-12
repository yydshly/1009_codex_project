import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as d from '../src/content.mjs';
const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.dirname(web);
const root = path.resolve(project, '../..');
const link = (file, name = file) => '[' + name + '](' + d.repository + '/blob/' + d.sourceRef + '/' + file + ')';
const md = value => String(value).replaceAll('|', '\\|');
const table = (heads, rows) => ['| ' + heads.join(' | ') + ' |', '| ' + heads.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.map(md).join(' | ') + ' |')].join('\n');
const readme = [
  '# 019 · ' + d.title,
  '[返回总索引](../../README.md) · [研究记录](research.md) · [网页说明](web/README.md) · [原仓库](' + d.repository + ')',
  '## 全面摘要', d.summary,
  '## 理解引导图',
  '![LibTV Skills 本质、公开能力、服务端依赖与有限价值](assets/libtv-summary.png)',
  '*原样沿用 2026-10-09 的完整总结图：本地 HTML/CSS 排版与 Chromium 截图，非上游产品界面或真实生成效果。PNG 为 2400 × 3748，原文件 SHA-256 已记录于 [来源记录](assets/guide-provenance.json)，保留 [可编辑排版源](assets/libtv-summary.html)。*',
  '## 核心理解',
  '这个公开库是给外部 Agent 使用、连接 LibTV 自家服务端创作 Agent 的专用接入 Skill。公开的是调用步骤、操作约束和 Python 接口脚本。故事、剧本、人物、场景、分镜、视频镜头与成片构成创作链；画布是呈现与操作方式。服务端组织创作，图片／视频模型实现具体画面。',
  '对我们自建、自由接模型和精细控制制作的系统，直接复用价值有限。可参考会话、素材传输、增量查询与结果交付；核心编排、人物／镜头管理、模型适配与剪辑执行仍需另行开发。评价限定为这个公开库的复用价值，不代表 LibTV 产品对所有用户没有价值。',
  '## 能力与证据层级', table(['类别', '能力', '层级', '模块', '边界'], d.capabilities),
  '## 模块',
  ...d.modules.map(item => '### ' + item.name + '\n\n' + link(item.file) + '\n\n- 职责：' + item.role + '\n- 机制：' + item.mechanism + '\n- 边界：' + item.boundary),
  '## 实现原理',
  '接入链：外部 Agent → LibTV Skill → LibTV 自家服务端 Agent → 图片／视频模型 → 生成结果。',
  ...d.serviceFlow.map((step, i) => (i + 1) + '. **' + step.title + '**：' + step.text),
  table(['方法', '接口', '输入', '输出', '用途'], d.interfaces),
  'LIBTV_ACCESS_KEY 用于 Bearer 鉴权。默认 https://im.liblib.tv，可通过 OPENAPI_IM_BASE 或 IM_BASE_URL 改地址；仍需兼容端点、鉴权、data、messages 与媒体结果。项目画布链接固定指向 LibTV。',
  '## 内容结构与界面',
  ...d.creation.map((step, i) => (i + 1) + '. **' + step.title + '**：' + step.text),
  '创作链是我们的概括，不能视为这些算法已在客户端实现。画布适合素材关系，表格适合批量镜头检查，时间线适合节奏，对话适合表达要求；换界面不自动增加后台创作能力。',
  '## 使用场景',
  ...d.scenarios.map(item => '- **' + item.title + '**：' + item.use + ' 条件：' + item.condition),
  '## 对我们的价值',
  ...d.values.map(item => '- **' + item.scenario + '（' + item.verdict + '）**：' + item.text),
  '## 耦合与扩展条件', table(['方式', '条件', '范围'], d.coupling),
  '## 可扩展方向：全部为建议，尚未实施',
  ...d.extensions.map(item => '### ' + item.title + ' · ' + item.scope + '\n\n- 基础：' + item.basis + '\n- 需补充：' + item.work + '\n- 边界：' + item.boundary),
  '## 自建创作对象：设计建议', table(['对象', '建议保存', '用途'], d.objects),
  '“把第三个镜头改成近景”的完整流程，应定位镜头、保留参考、生成候选、检查连续性、选版并更新成片。镜头 ID、依赖、版本与剪辑能力需要另做。',
  '## 基线、许可与运行边界',
  '- 固定 main 提交：[' + d.sourceRef + '](' + d.repository + '/commit/' + d.sourceRef + ')；提交日期 2026-03-18，2026-10-12 复核 HEAD 仍一致。',
  '- 上游 MIT，Copyright (c) 2026 libtv-labs；[许可原文](licenses/upstream-MIT.txt)保留。网页与说明原创，未引入上游执行代码。',
  '- 网页环境：Windows／PowerShell；Node.js 22.15.0；HTML/CSS/JavaScript 与 Node 标准库，无根级依赖。',
  '- 上游文档声明 Python 3.6+；本次只研究源码，没有验证所有 Python 版本、配置密钥或实际生成。',
  '- 官网能力、用户反馈、研究判断与网页交互验证分别记录。未实测模型、人物一致性、完整成片、商业效率或费用。',
  '- 官网：[LibTV](https://www.liblib.tv/)；组织：[libtv-labs](https://github.com/libtv-labs)。',
  '## 来源', ...d.evidence.map(([file, name, detail]) => '- ' + link(file, name) + '：' + detail),
  '- [Issue #12](' + d.repository + '/issues/12)：用户对后端改写提示词与可见性的反馈；不是我们实测。',
  '## 网页', '[正式阅读地址](https://yydshly.github.io/1009_codex_project/019-libtv-skills/) · [运行与发布说明](web/README.md)',
  '网页提供完整引导图放大／下载、两条流程切换、模块展开、章节导航、来源链接和文档下载。它是研究展示，不调用模型或接收密钥。'
].join('\n\n') + '\n';
const previousReadme = await readFile(path.join(project, 'README.md'), 'utf8');
const readmeLogStart = previousReadme.indexOf('## 部署记录');
await writeFile(path.join(project, 'README.md'), readme + (readmeLogStart >= 0 ? '\n' + previousReadme.slice(readmeLogStart) : ''));
const research = [
  '# 019 · LibTV Skills 研究记录',
  '## 研究目标与结论',
  '整合本次讨论，以原始引导图呈现库的本质、能力、模块、原理、价值与可扩展方向。核心判断：它是强依赖 LibTV 服务端的专用 Skill，对我们的自建创作系统直接复用价值有限；它仍可作为少量接入脚本和职责划分的参照。',
  '## 基线',
  table(['项目', '记录'], [
    ['原仓库', d.repository], ['组织', 'https://github.com/libtv-labs'], ['官网', 'https://www.liblib.tv/'],
    ['分支与提交', 'main / ' + d.sourceRef], ['提交时间', '2026-03-18T11:39:25+08:00'],
    ['复核日期', '2026-10-12 / Asia/Shanghai；git ls-remote HEAD 与固定提交一致'],
    ['上游许可', 'MIT，Copyright (c) 2026 libtv-labs；licenses/upstream-MIT.txt'],
    ['研究环境', 'Windows / PowerShell；Node.js 22.15.0；Python 3.10.11 用于环境记录，未运行上游调用脚本'],
    ['网页技术', '原生 HTML/CSS/JavaScript + Node.js 22 标准库，无第三方运行依赖'],
    ['实际验证', '源文件审查与网页交付；未配置密钥、未执行生成、未复现云端引擎']
  ]),
  '## 来源与证据', ...d.evidence.map(([file, name, detail]) => '- ' + link(file, name) + '：' + detail),
  '## 需要特别分开的判断',
  '1. 公开客户端的可执行功能，与 SKILL.md／官网描述的云端创作能力不同。',
  '2. 故事、人物、分镜、镜头与成片是产品内容链；Skill 约束接入步骤，没有公开每一阶段的内部算法。',
  '3. 外部 Agent 与 LibTV 自家服务端 Agent 不同；Skill 面向外部宿主，但后端服务采用专用协议。',
  '4. 可配置 base URL 不代表直接可替换供应商；会话、消息、结果和画布链接均需检查兼容。',
  '5. 查询是单次 HTTP，轮询／超时在文本规则中；出现结果 URL 与整项任务完成并非可直接等同。',
  '6. 文档 200 MB 限制没有在当前上传客户端落实。MIME 猜测不等同于检测内容，文件一次读入内存。',
  '7. assistant URL 提取限定域名，tool 的 task_result 与手动 URL 是其他路径；不将所有下载都说成被同一正则限制。',
  '8. “价值有限”限定为我们的自建系统复用目标；并不评价所有用户的云端使用价值。无商业效果或成本量化。',
  '9. 新增数据对象、多模型层、恢复调度和剪辑器都是我们的方案，尚未实施。',
  '## 用户反馈',
  '[Issue #12](' + d.repository + '/issues/12) 报告提示词改写、风格和复现可见性问题。本次只读取公开反馈，未独立测试，不能对所有生成任务作确定结论。',
  '## 引导图与素材',
  '原 PNG 与 HTML 来自本次对话 2026-10-09 的总结图。初次 AI 图像生成服务网络失败，最终用 HTML/CSS 与 Chromium 输出图像，因此本图不是成功的 AI 图像生成结果。',
  '文件：assets/libtv-summary.png（2400×3748）；assets/libtv-summary.html；assets/guide-provenance.json。SHA-256：9a5f3d7c7150d130871e5a3b870c72493fda773159014e290778faab078938c9。',
  '网页发布目录复制原 PNG，不压缩、裁切或重绘。图中的 2026-10-09 保留原始制作时间；当前研究日期 2026-10-12 在网页另行标注。',
  '## 验证记录',
  '构建、资源／锚点／ARIA、原图哈希、响应式与交互、Pages 汇总和远端部署的实际结果，见下方本次交付记录。上游真实生成不在验证范围内。',
  '## 发布与交付',
  '统一 GitHub Pages 路径：/019-libtv-skills/。源码在 web/src，构建到被忽略的 web/dist。根 projects.json 的 summary 与 summarySections 覆盖本质、能力、模块、原理、场景、价值、耦合、扩展与证据。',
  '独立工作树基于最新 origin/main，仅提交 019 与必要的根索引、目录和工作流变更。主工作区中其他未提交项目保持独立。实际提交与部署结果在完成后补录。'
].join('\n\n') + '\n';
const previousResearch = await readFile(path.join(project, 'research.md'), 'utf8');
const researchLogStart = previousResearch.indexOf('## 本次网页实际验证');
await writeFile(path.join(project, 'research.md'), research + (researchLogStart >= 0 ? '\n' + previousResearch.slice(researchLogStart) : ''));
const catalogFile = path.join(root, 'projects.json');
const catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
const entry = catalog.projects.find(item => item.id === '019' && item.slug === 'libtv-skills');
if (!entry) throw new Error('019 registry entry missing');
Object.assign(entry, { title: d.title, summary: d.summary, summarySections: d.summarySections, sourceRef: d.sourceRef, status: 'done', addedAt: '2026-10-12', preview: 'assets/libtv-summary.png', previewCaption: '本次对话 2026-10-09 制作的完整中文总结图，原 PNG 与 HTML 保留：创作链、外部 Agent／专用 Skill／LibTV 服务端 Agent／模型依赖、公开能力及对自建系统有限价值；独立说明图，非产品界面或生成效果实测。', pagesDir: 'web/dist', tags: ['Agent Skill', 'AI视频', '专用云端接入', '创作流程', '有限复用价值'] });
await writeFile(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
console.log('019 完整 README、研究记录与 10 项结构化摘要已同步。');
