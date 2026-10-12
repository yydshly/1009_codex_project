# 说明图生成记录

- 日期：2026-10-09。
- 使用：内置 `image_gen.imagegen`（imagegen 技能）；未使用 CLI/API Key。
- 输入图：`orbital-garden.jpg`，jackroc / Orbital Garden 上游截图；作为背景视觉参考和重新编排的输入。
- 输出：`overview-infographic.png`，1536 × 1024，非透明背景。
- 用途：研究首页、根项目索引；说明图不是作品运行截图。
- 复核：标题、定位、175 项 / 六类 / 固定版本、成熟度边界、价值、场景、扩展方向、48,000 粒子及署名均可读。成熟度为研究判断，没有生成分数或排名。

## 实际生成提示词

```text
Use case: infographic-diagram / compositing. Create one finished Chinese editorial infographic by transforming the supplied ORBITAL GARDEN screenshot. Output a high-resolution landscape image, ideally 2400 × 1600, with perfectly legible Simplified Chinese typography. Retain the mint luminous particle flower visual as a subtle dark background/reference motif, but remove all of the screenshot's original UI, controls and English branding. This is an explanatory graphic, not a screenshot, benchmark or product advertisement. Palette: near black navy, soft mint, off-white, warm amber for maturity cautions. Restrained, precise, generous spacing. No fake charts, scores or quality ratings. Clear title and hierarchy; four readable information modules plus a small process strip. All requested Chinese text must be rendered exactly, with no missing, invented or corrupted characters.
Layout: top main title and succinct positioning; slim process flow under title; two mid-row modules about positioning and maturity; three equally legible bottom columns for value, scenarios and extension. A beautifully structured mint particle flower can occupy background negative space and must not reduce text contrast. Discreet thin lines and numbering rather than cluttered iconography.
Text (verbatim):
Title: '一张图看懂 Awesome GPT-6 Astra'
Subtitle: 'Astra 参与制作的游戏与互动作品合集'
Small summary: '175 项作品入口 · 6 类玩法 · 固定研究版本 42ec714'
Process: '需求与创意 → Astra 辅助实现 → 浏览器作品 → 社区收集与导航'
Module 01 heading: '本质：作品目录与研究入口'
Module 01 body: '主要提供试玩链接、作者、截图与模型参与说明'
Module 01 body second line: '部分公开源码、Prompt 和创作记录'
Module 02 heading: '成熟度不一，整体偏实验'
Module 02 body: '能试玩 ≠ 稳定可复用'
Module 02 body second line: '收录不要求开源；质量与完整度需逐项验证'
Module 02 small line: '目录数量不代表模型性能或工程成熟度'
Column 03 heading: '价值'
Column 03 three lines: '发现创意与交互效果' / '追溯需求、实现和成品' / '筛选值得深入的案例'
Column 04 heading: '使用场景'
Column 04 three lines: '学习 AI 辅助编程' / '小游戏与互动艺术原型' / '个人作品展示与教学'
Column 05 heading: '可扩展方向'
Column 05 three lines: '补充实测与成熟度分层' / '整理技术栈、源码和许可' / '验证后提炼组件与模板'
Footer callout: '背景案例：轨道花园 · WebGL · 48,000 颗粒子'
Footer second line: '看见效果 → 理解机制 → 实测验证 → 选择性复用'
Small credit: '粒子视觉参考：jackroc / Orbital Garden · 本图为研究说明，非完整质量评测'
Keep every Chinese phrase faithful. The maturity statement is a cautious research judgment about an anthology, not a claim that every project is broken. The image should feel like a serious visual research brief, not a flashy promotional poster.
```
