# 019 · LibTV Skills 研究记录

## 研究目标与结论

整合本次讨论，以原始引导图呈现库的本质、能力、模块、原理、价值与可扩展方向。核心判断：它是强依赖 LibTV 服务端的专用 Skill，对我们的自建创作系统直接复用价值有限；它仍可作为少量接入脚本和职责划分的参照。

## 基线

| 项目 | 记录 |
| --- | --- |
| 原仓库 | https://github.com/libtv-labs/libtv-skills |
| 组织 | https://github.com/libtv-labs |
| 官网 | https://www.liblib.tv/ |
| 分支与提交 | main / c609246c1eca69f6bc129bcbb5d64c36734e4a4a |
| 提交时间 | 2026-03-18T11:39:25+08:00 |
| 复核日期 | 2026-10-12 / Asia/Shanghai；git ls-remote HEAD 与固定提交一致 |
| 上游许可 | MIT，Copyright (c) 2026 libtv-labs；licenses/upstream-MIT.txt |
| 研究环境 | Windows / PowerShell；Node.js 22.15.0；Python 3.10.11 用于环境记录，未运行上游调用脚本 |
| 网页技术 | 原生 HTML/CSS/JavaScript + Node.js 22 标准库，无第三方运行依赖 |
| 实际验证 | 源文件审查与网页交付；未配置密钥、未执行生成、未复现云端引擎 |

## 来源与证据

- [项目定位与安装条件](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/README.md)：专用 OpenAPI 接入 Skill，Python 标准库、密钥、安装与五类操作。README 的 Python 3.6+ 是上游声明，本次没有逐版本兼容实测。

- [操作约束与云端能力描述](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/skills/libtv-skill/SKILL.md)：外部 Agent 负责传话，服务端负责创作编排；轮询、超时与展示规则是文本协议。

- [接口协议与服务耦合](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/skills/libtv-skill/scripts/_common.py)：可配置 IM 地址、固定会话端点、Bearer 鉴权、data 字段与画布链接前缀。

- [公开参数范围](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/skills/libtv-skill/scripts/create_session.py)：message 与 session-id；响应标识与项目链接。

- [单次查询与增量读取](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/skills/libtv-skill/scripts/query_session.py)：after-seq 与 project-id；脚本没有常驻轮询调度。

- [素材传输与检查边界](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/skills/libtv-skill/scripts/upload_file.py)：multipart 上传、MIME 推断、一次读入文件；客户端没有 200 MB 大小校验。

- [项目切换范围](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/skills/libtv-skill/scripts/change_project.py)：无目标 UUID 参数，切换密钥当前绑定项目。

- [结果解析与交付边界](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/skills/libtv-skill/scripts/download_results.py)：tool 的 task_result、assistant 的限定域名正则、并行下载和 errors。

- [上游 MIT 许可](https://github.com/libtv-labs/libtv-skills/blob/c609246c1eca69f6bc129bcbb5d64c36734e4a4a/LICENSE)：Copyright (c) 2026 libtv-labs；本项目未引入上游执行代码，保留许可原文供研究查阅。

## 需要特别分开的判断

1. 公开客户端的可执行功能，与 SKILL.md／官网描述的云端创作能力不同。

2. 故事、人物、分镜、镜头与成片是产品内容链；Skill 约束接入步骤，没有公开每一阶段的内部算法。

3. 外部 Agent 与 LibTV 自家服务端 Agent 不同；Skill 面向外部宿主，但后端服务采用专用协议。

4. 可配置 base URL 不代表直接可替换供应商；会话、消息、结果和画布链接均需检查兼容。

5. 查询是单次 HTTP，轮询／超时在文本规则中；出现结果 URL 与整项任务完成并非可直接等同。

6. 文档 200 MB 限制没有在当前上传客户端落实。MIME 猜测不等同于检测内容，文件一次读入内存。

7. assistant URL 提取限定域名，tool 的 task_result 与手动 URL 是其他路径；不将所有下载都说成被同一正则限制。

8. “价值有限”限定为我们的自建系统复用目标；并不评价所有用户的云端使用价值。无商业效果或成本量化。

9. 新增数据对象、多模型层、恢复调度和剪辑器都是我们的方案，尚未实施。

## 用户反馈

[Issue #12](https://github.com/libtv-labs/libtv-skills/issues/12) 报告提示词改写、风格和复现可见性问题。本次只读取公开反馈，未独立测试，不能对所有生成任务作确定结论。

## 引导图与素材

原 PNG 与 HTML 来自本次对话 2026-10-09 的总结图。初次 AI 图像生成服务网络失败，最终用 HTML/CSS 与 Chromium 输出图像，因此本图不是成功的 AI 图像生成结果。

文件：assets/libtv-summary.png（2400×3748）；assets/libtv-summary.html；assets/guide-provenance.json。SHA-256：9a5f3d7c7150d130871e5a3b870c72493fda773159014e290778faab078938c9。

网页发布目录复制原 PNG，不压缩、裁切或重绘。图中的 2026-10-09 保留原始制作时间；当前研究日期 2026-10-12 在网页另行标注。

## 验证记录

构建、资源／锚点／ARIA、原图哈希、响应式与交互、Pages 汇总和远端部署的实际结果，见下方本次交付记录。上游真实生成不在验证范围内。

## 发布与交付

统一 GitHub Pages 路径：/019-libtv-skills/。源码在 web/src，构建到被忽略的 web/dist。根 projects.json 的 summary 与 summarySections 覆盖本质、能力、模块、原理、场景、价值、耦合、扩展与证据。

独立工作树基于最新 origin/main，仅提交 019 与必要的根索引、目录和工作流变更。主工作区中其他未提交项目保持独立。实际提交与部署结果在完成后补录。

## 本次网页实际验证（2026-10-12）

| 检查 | 实际结果 |
| --- | --- |
| 构建与源码语法 | npm run build 与 npm run check 通过 |
| 根索引 | npm run index:sync 与 npm run check 通过；独立发布工作树登记 11 个已在远端的项目，新增编号 019，不复用本地主工作区已经分配的编号 |
| 原图 | 项目原图、发布副本与浏览器实际下载的 PNG，SHA-256 均一致 |
| 页面边界 | 11 个章节；资源／锚点／ARIA 关联检查通过 |
| 浏览器交互 | 两条流程点击与方向键、模块展开、原图弹窗／原始尺寸／Escape／焦点返回、PNG 与研究记录下载通过 |
| 响应式 | Chromium 390、768、1024、1440px；document.scrollWidth 与视口一致，无文档横向溢出 |
| 浏览器错误 | pageerror 与 HTTP 4xx/5xx 为 0；无 LibTV API 或模型请求 |
| 无 JavaScript | 两条流程正文均可读，原图链接仍可打开 |
| 页面截图 | assets/desktop-preview.png、mobile-preview.png、value-preview.png；为本项目实际研究页，非上游应用 |
| 发布汇总 | npm run pages:build 通过，汇总产物包含 /019-libtv-skills/index.html |

浏览器验证脚本为 web/scripts/verify-browser.cjs，需通过参数指定可用 Playwright 包，使用本机 Chrome。它是交付验证辅助，不属于网页运行依赖。

## 远端发布与正式站点复核（2026-10-12）

- 内容提交：[bbd5844](https://github.com/yydshly/1009_codex_project/commit/bbd5844c495124594defaa50f6f8845b9db075c0)，已推送至 origin/main。
- 首次 Pages 构建与部署：[38241858905](https://github.com/yydshly/1009_codex_project/actions/runs/38241858905)，build 与 deploy 均成功，2026-10-12 19:19:40（Asia/Shanghai）完成部署。
- 同提交仓库验证：[38241857175](https://github.com/yydshly/1009_codex_project/actions/runs/38241857175)，成功。
- 正式网址：https://yydshly.github.io/1009_codex_project/019-libtv-skills/。
- 线上 HTTP 200；标题、固定来源提交和有限复用结论与交付一致。对正式网址再次执行浏览器验证：11 个章节、四个视口、流程与键盘、模块展开、原图窗口／缩放／Escape／焦点、PNG 下载哈希、研究记录下载和无 JS 阅读全部通过，页面错误与 4xx/5xx 为 0。
- 全面摘要与 10 项结构化摘要写入 projects.json，根 README 索引自动同步；demoUrl 在正式网址验证成功后填写。
- 本地主工作区同步了 019 源码、素材、文档和必要工作流步骤，保留其他项目与未提交内容；本地索引共 19 个项目，根校验通过。

后续的部署记录补录提交不改变核心研究结论与原始引导图；下载文档会随该次补录发布更新。
