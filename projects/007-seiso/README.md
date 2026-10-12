# 007 · Seiso 文档规则检查与扩展

Seiso 是 Markdown 文档约定与 Rust 静态检查器，根据文档类型、结构、正文、配置规则与跨文件索引检查维护问题。元数据决定检查策略；新增任意业务字段不会自动获得校验能力。完整网页汇总能力、模块、算法原理、场景、个人与总库价值、采用方法、扩展方向和验证边界，并保留此前生成的完整引导图。

[阅读完整研究网页](https://yydshly.github.io/1009_codex_project/007-seiso/) · [返回总索引](../../README.md#有序索引) · [研究依据](research.md) · [原仓库](https://github.com/scarletkc/seiso)

![Seiso 中文全景图：原理、能力、场景、总库价值和扩展边界](assets/overview-infographic.png)

*内置 imagegen 生成的中文研究说明图，非 Seiso 软件界面。图片经目视核对；可编辑说明与来源见本页和研究记录。*

| 项目 | 信息 |
| --- | --- |
| 研究提交 | [7e5b3b1b96766e69dedd091dd15ee44db89cf042](https://github.com/scarletkc/seiso/commit/7e5b3b1b96766e69dedd091dd15ee44db89cf042) |
| 提交日期 | 2026-10-06 |
| 源码包版本 | 0.3.0 |
| 上游许可证 | MIT；Copyright (c) 2026 ScarletKc |
| 研究日期 | 2026-10-09 |
| 核查环境 | Windows、PowerShell、Git 2.42.0.windows.2、Node.js 22.15.0 |
| 验证范围 | 官方文档与源码静态核查；未运行 Seiso CLI 功能测试 |
| 网页整理日期 | 2026-10-12 |
| 状态 | 研究网页与图文分析已完成；上游 CLI 未独立实跑 |

## 能力与原理

输入为 Markdown 与 seiso.toml。解析器识别标题、段落、列表、表格、链接与原文位置，再结合 kind、lang、canonical 和路径策略执行规则。检查过程使用本地词表、正则、结构启发式与集合相似度，不调用大模型。外部 Agent 可以消费诊断并修改文档。

默认稳定规则检查文档类型、本地文件目标和规则例外。重复定义、段落相似度、标题锚点、易变状态、章节结构、对话残留和评价证据等属于预览能力，需显式开启并评估误报。

输出支持文本、JSON、SARIF 与 GitHub 注解。--fix 主要清理确认失效的例外声明；内容归属与语义改写由人或外部 Agent 判断。

## 场景与对总库的价值

适用于 AI 经常更新文档、多人维护、多文档共享定义、操作手册、文档站点，以及提交和 CI 检查。少量随手笔记或检查标准不明确时，收益有限。

总库已有 projects.json 和 npm run check，负责元数据、编号、目录、图片与索引一致性。Seiso 可补充 Markdown 内容与本地引用检查；按项目划分比较领域，能减少无关项目术语重叠的误判。

固定研究 commit 是复现依据，应按文档用途保留并解释例外，不能为了消除提示而删除必要研究证据。

## 扩展边界

现有配置支持类型映射、规则选择、中英日词表扩展、相似度阈值、领域、站点路由及带理由的例外。CLI 可接入 Codex、其他 Agent、编辑器与 CI；Claude Code 有官方仓库内的 hook 适配器。

来源、commit、许可证、环境、证据等业务字段校验，图片说明和实验记录完整性，以及 projects.json 与研究文字的一致性，均需要新增规则或配套脚本。模型语义审阅、检索和知识图谱需要外部处理系统与存储。

Seiso 不保证技术事实或证据质量，不抓取外部 URL，也不提供数据库或知识检索服务。

## 图像与来源

[完整生成提示词](assets/overview-prompt.txt)保留图像文案与布局要求，使用内置 imagegen 生成。本项目没有引入上游实现代码。

核心来源：[架构](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/reference/architecture.md)、[规范实现](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/reference/convention.md)、[规则注册](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/src/rules/mod.rs)、[配置](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/reference/configuration.md)、[检查](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/guides/checking.md)、[集成](https://github.com/scarletkc/seiso/blob/7e5b3b1b96766e69dedd091dd15ee44db89cf042/docs/guides/integrations.md)。

## 网页模块与复现

完整网页包含九个阅读区域：原始引导图、全部 27 条规则、11 个源码模块与执行流水线、三个规则判定示例、六类使用场景与总库价值、命令/配置/文档类型、四层扩展方向、能力边界和固定版本依据。

交互包括原图放大、稳定/预览规则筛选、规则解释展开、示例切换及键盘操作。示例仅解释官方规则，网页没有运行 Seiso 或模型。

网页使用 Node.js 22 标准库构建、原生 HTML/CSS/JavaScript，无第三方网页依赖，详见 [Web 运行与发布说明](web/README.md)。

```sh
cd projects/007-seiso/web
npm run build
npm run check
npm run dev
```

构建产物为被忽略的 web/dist，统一 Pages 编号路径为 /1009_codex_project/007-seiso/。根索引摘要按定位、能力、模块、原理、处理与集成、场景、个人价值、扩展、边界九个维度展开。
