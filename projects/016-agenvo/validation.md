# Agenvo研究网页验证

日期：2026-10-12。验证对象为本站静态研究内容，不包含真实Agent/模型服务执行。

## 构建与内容

- 项目build/check通过：JavaScript语法、本地静态资源、锚点唯一与存在、固定源码SHA替换、引导图原件/发布副本字节一致。
- 原图SHA-256：`dfd387be5194b72d543d11cd936dd801d4368ec108522fd939795eab7a00da7d`。
- 主工作区index:sync/check/pages:build通过：16个本地项目，15个本地Web路径。
- 隔离发布目录index:sync/check/pages:build通过：只加入本次016-Agenvo，未打包其他15个尚未提交的本地项目；已分配编号保持不变。
- 上游固定main提交、v0.2.0 tag/发行、npm OpenCode0.2.0、OpenAI官方远控/app-server已分别核对。

## 浏览器

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

未启动Agenvo Relay、Connector、真实Codex/Claude或云模型，不宣称真实任务、MCP客户端发现、OAuth和dot事件唤醒已独立验收。上游测试仅作为来源依据。线上发布与访问结果在交付时另行验证。
