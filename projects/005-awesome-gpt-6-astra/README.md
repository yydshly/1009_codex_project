# 005 · Awesome GPT-6 Astra：作品合集、原理与复用研究

> Astra 参与制作的社区游戏与互动作品合集。固定版本包含 175 项入口、六类玩法、五个仓内作品目录，25 项条目标注源码入口；研究覆盖发现试玩、创作过程与源码复用、README 驱动的目录解析与缓存、WebGL / Canvas / React 案例原理、成熟度与许可边界、学习与原型等场景，以及实测分层、资料检索、组件模板和版本追踪等扩展方向。网页沿用中文引导图，提供完整样例库、交互原理和真实轨道花园背景演示；未逐一验收全部作品。

[返回总索引](../../README.md#有序索引) · [研究记录](research.md) · [Web 演示说明](web/README.md) · [网页入口](https://yydshly.github.io/1009_codex_project/005-awesome-gpt-6-astra/)

| 项目 | 信息 |
| --- | --- |
| 原仓库 | [MartinDelophy/awesome-gpt-6-astra](https://github.com/MartinDelophy/awesome-gpt-6-astra) |
| 研究版本 | [42ec7142a3da1dcce1846de8a3fc0b4891b4c8ae](https://github.com/MartinDelophy/awesome-gpt-6-astra/tree/42ec7142a3da1dcce1846de8a3fc0b4891b4c8ae) |
| 上游许可证 | 清单原创内容 CC0 1.0；第三方作品各自许可；[保留上游许可](licenses/awesome-gpt-6-astra-CC0.txt) |
| 收录 / 完整整理日期 | 2026-10-09 / 2026-10-12 |
| 当前状态 | 完整研究交付、GitHub Pages 部署与公开路径检查通过 |
| 研究交付范围 | 一图引导、完整研究、175 项目录、交互原理、本地轨道花园背景；未逐项验收全部游戏 |
| 正式编号路径 | /1009_codex_project/005-awesome-gpt-6-astra/ |

## 完整理解摘要

- **定位**：社区收集 Astra 参与制作的游戏与互动作品，提供导航与研究入口；非官方性能基准，模型参与按作者资料说明。
- **能力**：发现试玩、观察视觉与玩法、追溯部分 Prompt 和开发过程、选择公开源码做小范围复现与改造。
- **模块**：固定快照 175 项、六类玩法、五个 works 目录、25 项标注源码入口；另有 README、React 目录站、投稿规则与开发资料。
- **原理**：上游 Node 服务解析 Markdown、归类去重、稳定标识、300 秒请求驱动缓存与快照回退；作品经需求、模型辅助、运行反馈和迭代形成。本站构建固定数据，不实时同步。
- **案例**：轨道花园用 WebGL 绘制 48,000 颗粒子；雷霆战机用 Canvas / Web Audio；三分天下用 React / TypeScript 规则界面与另行生成素材。
- **价值与场景**：减少寻找创意与资料的成本；用于 AI 编程学习、小游戏与交互原型、互动艺术、个人理解与教学演示、团队案例库。
- **成熟度与限制**：成熟度不一、整体偏实验；能试玩不等于可稳定复用，25 项源码入口不等于统一开源许可；未逐一实测 175 项，第三方作品各自许可。
- **扩展方向**：建议补入口可用性与证据档案、统一实测与兼容性记录、成熟度分层、技术栈与许可检索、验证过的组件模板、版本追踪和参数实验。
- **网页交付**：既有中文引导图、完整研究章节、175 项筛选与详情、交互原理；本地轨道花园三形态、暂停、扰动和纯背景效果，运行不调用模型。

## 网页内容

- [首页](https://yydshly.github.io/1009_codex_project/005-awesome-gpt-6-astra/)：沿用既有引导图，正文完整说明能力、模块、目录与作品原理、成熟度、价值、场景、使用路径、扩展方向及依据。
- [完整样例库](https://yydshly.github.io/1009_codex_project/005-awesome-gpt-6-astra/library.html)：175 项，六类筛选、关键词、25 项源码入口、排序、分批浏览和作者资料详情；试玩进入原作者页面。
- [交互原理](https://yydshly.github.io/1009_codex_project/005-awesome-gpt-6-astra/about.html)：四项能力、两组流程、四种研究目标与三个精选案例。
- [本地完整原作](https://yydshly.github.io/1009_codex_project/005-awesome-gpt-6-astra/demos/orbital-garden/index.html)：轨道花园源码保留作者 jackroc、固定版本、CC0 许可。首页支持三形态、暂停、扰动与纯背景效果，运行不调用模型。

## 引导图

![005 Astra 作品合集研究引导图](assets/overview-infographic.png)

*沿用此前 imagegen 生成的研究图；粒子视觉参考 jackroc 的轨道花园截图，图本身不是实际运行截图。生成提示词见[记录](assets/infographic-prompt.md)，图中文字另有可读文本。*

## 如何研究与复用

先确定问题，再筛选源码、许可与开发记录；在固定环境运行一个案例，记录成功和失败；做一次小改动，确认代码与效果的关系；补齐依赖、测试、部署说明和许可后，才按自己的应用要求评估复用。作品可以作为创意参考、学习实验或原型起点，成熟度需逐项判断。

可扩展方向包括入口检查与证据档案、成熟度和兼容性记录、技术栈与许可检索、已验证组件和模板、开发过程比较、版本追踪与参数工作台。这些是研究建议，当前网页没有宣称已实现统一质量评测。

## 运行与校验

需要 Node.js 22+；本子项目无第三方包依赖、外部字体、API Key 或运行时目录抓取。

```sh
cd projects/005-awesome-gpt-6-astra/web
npm run build
npm run check
npm run dev
```

本地地址：http://127.0.0.1:4315/1009_codex_project/005-awesome-gpt-6-astra/ 。构建输出 web/dist/，资源使用相对路径。目录使用固定研究快照，不自动同步上游；作者试玩与部分远程预览需要联网。统一 Pages 工作流构建并校验本项目，部署结果和实际检查记录见 [research.md](research.md)。

## 来源与边界

网页、目录交互和构建脚本独立编写。完整条目从 source/ 的上游中文 README 快照解析，保留清单 CC0 许可。引入的轨道花园原文件、README、LICENSE、来源与 SHA-256 保存在 web/vendor/orbital-garden/；展示适配独立添加，不改渲染数学。三张精选截图保留原作者署名，其他目录预览引用原始地址。

验证覆盖研究网页与本地轨道花园，未全面运行其余游戏，也未复现上游动态目录服务。模型参与依据作者说明；社区收录、单个优秀案例与收录数量，均不能替代模型基准或生产质量验收。
