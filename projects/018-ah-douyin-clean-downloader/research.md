# 018 · 研究记录

## 快照与范围

- 研究日期：2026-10-12（Asia/Shanghai）。讨论和引导图日期：2026-10-09。
- 上游：https://github.com/ahang008/ah-douyin-clean-downloader/tree/feat/creator-batch-offline
- 固定提交：dbd22a4711d448770169c186dcc7708a2357b5ec。分支功能版本：v0.5.0；提交日期：2026-09-30。
- 2026-10-12 通过 git ls-remote 再核对，指定分支仍指向同一提交；没有将 main 的其他版本混入。
- 上游克隆仅用于源码阅读，保留在总库忽略的 upstream/ 下。
- 本机环境：Windows、Node.js 22.15.0；没有搭建上游 MLX 或 Apple Vision 环境。
- 页面为原创静态研究站点，Node.js 22+ 标准库构建，无第三方运行依赖。

## 理解演进

1. 最初按下载器理解；源码和文档表明已有整号归档、本地转写、封面识字及已有库改写。
2. 单条下载用 HTTP 接口；整号仅由真实 Edge/SDK 产生目录请求。目录 ID 交给独立下载器。
3. 没有证据把正常登录等同免风控；文档明确限频、页面验证和接口变化可能导致失败。
4. “无水印”是选播放源；“离线”主要是本地识别；“可续跑”主要按作品和校验恢复。
5. 对少量视频与当前 Windows 环境，增量有限；大批量授权资料管理更有收益，工程整合值得借鉴。

## 结论依据

- [README.md](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/README.md)：版本、四种入口与运行要求。本分支 v0.5.0 的功能范围，单条、整号和已有库改写的交付区别。
- [SKILL.md](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/SKILL.md)：自然语言路由。Skill 指令负责选择流程和验收要求，编排不等于全部逻辑交给模型执行。
- [scripts/download_douyin.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/download_douyin.py)：作品 ID、元数据、播放源与 curl。固定 feed 入口、User-Agent、播放字段优先级与无转码下载。
- [scripts/download_batch.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/download_batch.py)：批量下载与恢复。复用单条下载后端，默认并发 2、有限重试、manifest 与源文件哈希。
- [scripts/collect_creator_browser.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/collect_creator_browser.py)：真实网页分页响应。Playwright/CDP、官方 SDK、公开字段投影和连续目录验收。
- [scripts/launch_browser_collector.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/launch_browser_collector.py)：专用 Edge 与环境依赖。独立浏览器会话、正常登录、macOS 路径和回环 CDP。
- [scripts/transcribe_local.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/transcribe_local.py)：本地 MLX Whisper。缓存模型、音频提取、片段时间码、模型设置与产物哈希。
- [scripts/ocr_covers.swift](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/ocr_covers.swift)：Apple Vision OCR。本地中文/英文识字和置信结果，证明当前苹果框架依赖。
- [scripts/collect_cover_metadata.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/collect_cover_metadata.py)：文案、选定封面与状态。标题候选、标签、封面取得及低置信/空识别等处理状态。
- [scripts/build_annotated_transcripts.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/build_annotated_transcripts.py)：阅读副本与手改保护。前置元数据说明并保留原机器稿字节，防止覆盖用户修改。
- [scripts/name_artifacts.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/name_artifacts.py)：一致命名与中断恢复。指标刷新后的路径同步、内容哈希保留与改名恢复记录。
- [scripts/export_transcripts.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/export_transcripts.py)：资料导出与完整性验收。逐项文件验证、索引、机器稿合集与 JSONL。
- [scripts/batch_rewrite.py](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/scripts/batch_rewrite.py)：确定性改写辅助。快照、排序、输入、渲染、覆盖与开场锁定；不将技术检查认证为语义审核。
- [references/creator-batch.md](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/references/creator-batch.md)：整号范围与完成条件。各阶段、目录结构、机器稿与人工校对边界。
- [references/batch-rewrite.md](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/references/batch-rewrite.md)：模型创作与事实归属。稳定排序、开场、草稿接口、另存成品与内容核验。
- [references/troubleshooting.md](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/references/troubleshooting.md)：风控与失败情形。限频、验证、接口变化、未完成目录与恢复方式。
- [PROVENANCE.md](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/PROVENANCE.md)：独立实现与未分发能力。未捆绑 F2/DTK 签名实现或日常浏览器凭据读取路线。
- [LICENSE](https://github.com/ahang008/ah-douyin-clean-downloader/blob/dbd22a4711d448770169c186dcc7708a2357b5ec/LICENSE)：商业使用条件。源码可见非商业许可，商业用途需要书面授权。

## 原始图与内容性质

- 直接使用本次聊天最终生成的 PNG，未重新生成或编辑。原图文件名与 SHA-256 见 assets/guide-provenance.json。
- 图为研究说明，非软件界面、账号采集结果或独立实测截图。
- 网页区分源码事实、上游记录、分析判断、示例及建议。八类扩展均未在本站实现。

## 验证与发布

- 网页构建与检查覆盖脚本语法、本地资源、锚点与 ARIA、固定版本、原图发布字节及 SHA-256。
- 浏览器阅读、交互、部署结果和最终提交另见 validation.md。
- 未登录抖音、未下载真实作品、未运行 MLX/OCR，未独立认证准确率、风控概率或账号安全。

## 许可

上游源码可见非商业许可证，商业用途需书面授权；本次仅原创研究文字、网页与生成图，不引入上游执行代码。
