# Agenvo研究网页验证

日期：2026-10-12。验证对象为本站静态研究内容，不包含真实Agent/模型服务执行。

## 构建与内容

- 项目build/check通过：JavaScript语法、本地静态资源、锚点唯一与存在、固定源码SHA替换、引导图原件/发布副本字节一致。
- 原图SHA-256：`dfd387be5194b72d543d11cd936dd801d4368ec108522fd939795eab7a00da7d`。
- 主工作区index:sync/check/pages:build通过：16个本地项目，15个本地Web路径。
- 隔离发布目录index:sync/check/pages:build通过：只加入本次016-Agenvo，未打包其他15个尚未提交的本地项目；已分配编号保持不变。
- 上游固定main提交、v0.2.0 tag/发行、npm OpenCode0.2.0、OpenAI官方远控/app-server已分别核对。

## 本轮说明排版验证

2026-10-12 按用户要求调整描述的格式、换行与标注。范围为说明展示，未添加 Agent 控制功能。

- 完整摘要按定位、能力、模块、原理、部署、价值、边界、扩展八项展示。
- 六步调用路径、Codex / Herdr / 其他运行时说明同时可见。
- 模块表、脚本规则和阅读清单默认展开。
- 手机表格逐项显示列名；事实说明字号不小于 14 px。
- Chromium 检查 1440×1000、390×844、320×844、768×844，无文档或表格横向裁切。
- 禁用 JavaScript 后，摘要、六步调用路径和全部原生接入说明仍完整可读。
- 原图弹窗、Escape / 触摸关闭、下载字节一致、分节定位及总首页往返正常。
- 无脚本异常或 HTTP 4xx / 5xx 资源错误；已人工查看摘要、手机表格及流程截图。

## 首次版本浏览器记录

Playwright/Chromium在真实汇总子路径`/016-agenvo/`检查：

- 1440×1000桌面、390×844手机、320×720窄屏，无文档横向溢出。
- 11个阅读章节存在；原图naturalWidth2200，完整资源加载。
- 图弹窗、Escape关闭、手机触摸关闭；下载PNG与原件字节一致。
- 六步按钮更新内容与选中状态；末步后“重新看一遍”返回第一步。
- Codex/Herdr/其他标签及左右/Home键更新内容和ARIA状态。
- 模块详情可展开；统一首页→演示、演示→首页路径正常。
- 未出现pageerror或HTTP4xx/5xx资源错误。
- 桌面/手机截图已人工查看，见[素材目录](assets/)。

## 独立验收限制

未启动Agenvo Relay、Connector、真实Codex/Claude或云模型，不宣称真实任务、MCP客户端发现、OAuth和dot事件唤醒已独立验收。上游测试仅作为来源依据。

## 首次版本线上发布与复核

- 网页代码提交：`fe4fe30fe80e02da7772d71d82934ba92d7775b2`，已推送远端main。
- [GitHub校验](https://github.com/yydshly/1009_codex_project/actions/runs/38208155317)与[Pages构建/部署](https://github.com/yydshly/1009_codex_project/actions/runs/38208228391)均成功，部署于2026-10-12完成。
- [在线研究页](https://yydshly.github.io/1009_codex_project/016-agenvo/)和总首页、CSS、JavaScript、原图均返回HTTP200。
- 线上原图1254025字节，SHA-256与原件相同。
- 线上再次检查1440/390/320视口、步骤、标签与键盘、图片弹窗/下载、首页导航；无脚本或资源错误。
- 只提交本次Agenvo及必要索引/发布配置；其他本地未提交项目与改动完整保留。
