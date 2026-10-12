# 007 · Seiso 原理 能力与扩展依据

## 基线与环境

原仓库：https://github.com/scarletkc/seiso 。研究提交为 7e5b3b1b96766e69dedd091dd15ee44db89cf042，提交日期为 2026-10-06；Cargo.toml 中包版本为 0.3.0。上游采用 MIT，版权声明为 Copyright (c) 2026 ScarletKc。

研究日期为 2026-10-09。环境为 Windows、PowerShell、Git 2.42.0.windows.2、Node.js 22.15.0。源码通过临时只读克隆核查。本次交付为图像及研究记录，未安装或执行 Seiso CLI，未引入其实现代码。

## 核心理解

“基于 Markdown 字段定制进行识别检查处理”仅描述入口的一部分。kind 决定文档角色，lang 决定语言策略，canonical 参与重复内容的权威来源排序。实际检查同时读取正文、标题、列表、表格、链接与例外注释。任意自定义字段不会自动成为检查规则。

类型可以来自 YAML frontmatter 或配置中的路径映射。声明优先于映射；损坏声明不能由映射补救。generated 只能由映射指定，不运行规则，但仍为链接和重复比较提供索引内容。

## 执行机制与源码

| 机制 | 依据 |
| --- | --- |
| CommonMark/GFM AST 与原文位置 | src/md/parser.rs 使用 markdown-rs，形成结构化文档模型 |
| 类型与路径配置 | src/rules/kind.rs、src/config/mod.rs |
| 单文件词表、正则与结构检查 | src/rules/normative.rs、src/rules/heuristic.rs |
| 本地文件目标 | src/rules/links.rs、src/paths.rs |
| 锚点、定义与段落的跨文件比较 | src/index/mod.rs、src/rules/cross_file.rs |
| 诊断、例外与有限修复 | src/diagnostics、src/rules/suppression.rs、src/rules/fixes.rs |

以上为本地规则与算法；外部 Agent 的理解和改写不属于 Seiso 自身的检查执行机制。

## 现有能力与状态

规则注册表将 KND001、KND002、LNK001、SUP001、SUP002 标记为稳定，其余已实现规则标记为预览。稳定检查覆盖类型、本地文件目标和例外声明。标题锚点 LNK002 也属于预览，不能描述成默认能力。

DUP001 对同语言、同领域的字段定义比较，默认要求至少五个共同的不同标识符，集合 Jaccard 相似度至少为 0.8。DUP003 比较独立段落，默认候选至少包含 80 个字母或数字和八个不同五字符片段，相似度至少为 0.9。这些规则提示重复维护风险，不证明语义相同或事实错误。

易变值规则识别长期文档中的快照风险，不核验最新版本与部署状态。EVD001 判断邻近证据是否存在，不判断证据质量。不抓取外部 URL。

## 对研究总库的应用建议

总库已有 projects.json、索引生成与目录校验脚本。Seiso 可补充 Markdown 引用和内容检查，不应替代这些已有脚本。

可把入口映射为 readme、操作说明映射为 howto、Agent 指令映射为 agents。综合研究记录不必强行映射为操作指南；参考事实、决策与实验记录可以按用途组织，再选择类型。

跨项目比较可按 projects/编号-slug 划分领域，以减少不同项目共享术语产生的误判。降低维护成本、提高 AI 修改反馈质量是基于机制的应用判断，未量化本总库使用后的收益。

固定 commit、环境与许可证是必要复现依据，不能为满足长期文档规则而删除。必要时给出有理由的例外，不能把观察到的版本擅自改成没有依据的最低版本要求。

建议流程：模板填写 → 人或 AI 写文档 → 总库校验加 Seiso 稳定检查 → 修复并复查 → 提交。预览规则先本地评估，再考虑纳入工作流。本次未将 Seiso 加入根级依赖或 CI。

## 扩展场景

| 层次 | 场景 | 所需工作 |
| --- | --- | --- |
| 现有配置 | 类型、规则、词表、阈值、领域、路由、权威来源与例外 | 配置调整；业务字段不会自动得到验证 |
| 外部集成 | Codex 与其他 Agent、编辑器、提交、CI、JSON/SARIF 报告 | 调用 CLI 或自行编写适配器 |
| 新增开发 | 来源、commit、许可证、环境、证据、图片与实验记录、元数据一致性 | 新增 Rust 规则或配套脚本 |
| 外部语义系统 | 模型审阅、来源检索、知识图谱 | 另建模型、检索、存储与人审流程 |

后三类建议不代表 Seiso 已有相应业务校验、模型或数据库功能。

## 图像与交付验证

信息图采用内置 imagegen 生成，完整提示词在 assets/overview-prompt.txt。图片为研究说明，非软件截图，最终输出已经目视核对。文字依据以本记录与 README 为准。项目收录后执行 npm run index:sync 与 npm run check。

## 2026-10-12 网页整理与交付

保留 2026-10-09 原图与固定源码基线；网页不宣称快照版本是当前最新版本。通过源码注册表复核，共 27 条已实现规则，5 条默认稳定、22 条预览；架构模块完整展开为 11 项。

网页涵盖能力、模块、原理、场景、总库价值、接入方法、扩展与边界；规则示例注明为解释性示例，未把自行模拟的结果当作 Seiso CLI 实测。图像原始 SHA-256 为 7949dbb60ecbf34292670be52ba9eb588224eeb49b2566feb4157bc4297ed97c，构建时逐字节保留。

研究网页源文件：web/content.mjs 保存结构化文字，web/build.mjs 生成 HTML，web/styles.css 与 web/app.js 实现布局和浏览交互；web/check.mjs 校验章节、来源、本地引用、锚点、发布文件与原图哈希。项目依赖 Node.js 22 标准库，不在总库根目录增加依赖。

统一 Pages 配置为 pagesDir=web/dist，并在发布与校验工作流中增加本项目构建和检查。根索引摘要提供九个维度的完整说明。

本地网页构建与静态检查通过；浏览器验证覆盖 HTTP 200、27/5/22 规则筛选、解释展开、示例切换与方向键、原图放大/关闭/焦点返回，以及 1440、768、390、360 像素视口无横向溢出。原图哈希一致，无脚本、控制台或资源请求错误。实际截图和结果见 assets/site-local-desktop.png、assets/site-local-mobile.png、assets/browser-local-verification.json。统一站点构建通过；远端发布与公开访问结果另行记录。

## 2026-10-12 已验证的远端发布

功能提交为 [7c529b6](https://github.com/yydshly/1009_codex_project/commit/7c529b6c6b21bc2e10e89c10a49043ee00160f4b)，已推送 origin/main。

- [GitHub Pages 发布运行](https://github.com/yydshly/1009_codex_project/actions/runs/38236191537)：构建、校验、上传与部署均成功。
- [远端研究索引校验运行](https://github.com/yydshly/1009_codex_project/actions/runs/38236190367)：成功。
- [公开研究页](https://yydshly.github.io/1009_codex_project/007-seiso/)：HTTP 200，规则筛选、解释展开、示例切换/键盘、原图放大与关闭/焦点返回均通过。
- [公开总索引](https://yydshly.github.io/1009_codex_project/)：HTTP 200，包含 Seiso 编号入口。

公开页面在 1440、768、390、360 像素宽度下无页面横向溢出，图片均成功加载，无脚本、控制台或资源请求错误。远端原图 SHA-256 与本地保留原图完全一致。公开截图和机器可读结果为 assets/site-public-desktop.png、assets/site-public-mobile.png、assets/browser-public-verification.json。

部署验证只证明研究网页及其交互成功发布；上游 Seiso CLI 仍未独立实跑。

## 固定版本依据

- [包版本](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/Cargo.toml)
- [LICENSE](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/LICENSE)
- [规则状态](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/src/rules/mod.rs)
- [架构](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/reference/architecture.md)
- [规范覆盖](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/reference/convention.md)
- [配置](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/reference/configuration.md)
- [DUP001](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/rules/DUP001.md)
- [DUP003](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/rules/DUP003.md)
- [EVD001](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/rules/EVD001.md)
- [使用与修复](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/guides/checking.md)
- [集成](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/guides/integrations.md)
