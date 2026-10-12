# 012 · Motion Graphics MV 研究记录

## 目标与研究基线

回答能力、输入输出、使用场景、个人意义、可扩展方向和底层原理，并制作可在总库编号子路径浏览的中文网页。

| 项目 | 记录 |
| --- | --- |
| 原仓库 | https://github.com/makevoid/motion-graphics-music-video-skill |
| 固定提交 | 759ba6a7c80e2771f4dd69792e74383d71512e35 |
| 提交时间 | 2026-10-05T12:19:47Z |
| 许可证 | MIT；Copyright (c) 2026 makevoid |
| 研究环境 | Windows / PowerShell；Node.js v22.15.0；Codex 内置 Chromium 浏览器 |
| 网页技术 | 原生 HTML / CSS / JavaScript；Node 标准库预览；无根级或子项目依赖 |
| 上游要求 | Claude Code；Ruby 3.2+ / Bundler、Node 22+、Python 3、Chrome、FFmpeg、ImageMagick；Swift VFX 需 macOS 14+ / Swift 5.9+ |
| 研究日期 | 2026-10-09（Asia/Shanghai） |
| 已验证层级 | 文档与关键源码阅读；原创网页交互；总库集成 |
| 未验证层级 | 上游生产运行、付费生成、模型当前可用性、实际费用及作者样片逐帧质量 |

Git 克隆遇到网络握手失败后改用 GitHub API 固定提交，并从 raw.githubusercontent.com 获取文本快照至被忽略的 upstream/motion-graphics-music-video-skill-review/。未运行快照中的程序或安装上游依赖。

## 能力与依据

以下引用均固定在同一提交，作者描述与本地验证分别记录。

| 结论 | 依据 | 证据层级 |
| --- | --- | --- |
| 以已有歌曲和创意作为入口，默认 16:9 / 24fps / 1080p | [SKILL.md](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/.claude/skills/motion-graphics-music-video/SKILL.md) | 制作合同 |
| 默认图像生成／编辑与 H3 绿幕角色表演，经 Fal API | [prompts.md](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/.claude/skills/motion-graphics-music-video/references/prompts.md) | 制作约定；未调用模型 |
| p5 按帧绘制角色、图形、文字和镜头，Python 处理抠图和音频，Swift 做后期 | [animation-audio-vfx.md](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/.claude/skills/motion-graphics-music-video/references/animation-audio-vfx.md) | 工具说明 |
| Ruby 是统一执行入口，初始化独立项目，MCP 传入凭据 | [tasks.md](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/.claude/skills/motion-graphics-music-video/references/tasks.md) | 架构与执行合同 |
| 批次上限为 2、4、8、10，任务接受需要存在的审查文件 | [waves.rb](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/.claude/skills/motion-graphics-music-video/scripts/lib/workflow/waves.rb) | 关键源码阅读 |
| 已有请求保存回执；上传按文件字节缓存；显式新请求可再次付费 | [fal/client.rb](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/.claude/skills/motion-graphics-music-video/scripts/lib/fal/client.rb)、[production.md](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/.claude/skills/motion-graphics-music-video/references/production.md) | 关键源码与合同 |
| 节拍分析是 numpy 光谱通量、80–180 BPM 搜索与四拍分组 | [beats.py](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/.claude/skills/motion-graphics-music-video/scripts/tools/python/beats.py) | 算法源码阅读；未测准确率 |
| 作者有六支样片；约 3 分钟作品的 30 美元 Fal 和 300 万 Opus token 为经验 | [README](https://github.com/makevoid/motion-graphics-music-video-skill/blob/759ba6a7c80e2771f4dd69792e74383d71512e35/README.md) | 作者自述；非复现报价 |

## 底层原理

歌曲＋创意 → 本地音乐数据＋Agent 分镜 → 图像／视频模型生成角色与表演 → Python 抠图 → p5 按帧合成角色、静态背景、文字、图形与镜头 → 全曲画面接续 → Python 音效／Swift VFX → FFmpeg 编码输出。

Agent 负责研究、计划、任务分配和视觉听音审查；Ruby 管理具体工具任务、生成回执、manifest、依赖及批次状态。实际子 Agent 来自宿主工具，Ruby 的批次分配器不会独立启动 AI 代理。

默认生成单角色绿幕、锁定镜头，再在代码场景中合成。背景和字幕的变化可以与表演素材分开修改。已有角色参考固定版本，替换角色后只重建受影响的依赖及后续合成。请求恢复机制减少重复提交机会，但未收到回执时仍需核对供应商记录。

全曲保留一条连续主音轨，各画面段按整数帧范围连接。p5 的时间控制不能替代对模型表演、口型、透明边缘、字体和最终播放的审查。

## 使用判断、个人价值与扩展

以下为研究判断和建议，不作为上游已有产品功能。

- 独立歌曲 MV 与歌词动画最接近默认工作流。知识歌曲／研究导览需要先准备事实准确的歌词和说明。品牌音乐短片需要品牌规范和可用素材。
- 对总库的价值在于动态传播研究结果、积累制作协议、理解模型素材与代码编排的职责。与 001 商业短片流程、006 视频工作台、009 程序油画动画互补。
- 复用起点：版本化角色与 p5 动效库。
- 需要适配：竖屏／帧率、Windows 工具和字体、Swift 替代、模型协议与 schema。
- 需新增实现：可视化制作工作台、实际计费台账与提交前硬限制。
- 建议先选择 15–30 秒歌曲段落试做。这个建议未在本次执行付费验证。

## 原创网页

深色制作台、荧光黄、珊瑚色与薄荷绿；强调“音乐 → 素材 → 编排”的关系。无第三方运行时依赖。样片截图本地保存，点击播放后才加载 YouTube 嵌入；同时保留原片链接。

- 16 秒静音分层动画：原创 SVG 角色代替模型素材，模拟 120 BPM，支持播放、暂停、时间轴定位和三图层开关。
- 五制作环节、四职责节点、三场景、三类扩展筛选；动态面板使用 aria-live 和按钮 aria-pressed。
- 场景 brief 下载为 Markdown，写明输入、输出、约束、验收和研究提交；不是视频或直接运行的项目文件。
- 支持键盘、可见焦点、跳过导航、移动布局和减少动态效果。停止后台标签的播放。
- 无 JavaScript 时仍可阅读正文、默认面板与链接。
- 页面及 SVG 图形为原创，没有引入上游实现或字体。作者视频的实际截图和嵌入单独标注来源；研究文本快照保存在被忽略的 upstream/。

## 验证记录

本地执行 JavaScript 与服务脚本语法检查，HTTP 首页返回 200。Chromium 检查实际页面、交互及响应式布局。具体最终结果在完成浏览器与 Pages 验证后补记。

## 保留的边界

不以请求成功证明创意质量或准确口型；不以 README 成本推断固定报价；不把竖屏和 Windows 当作无需改动的运行配置；不把原创示意当作上游界面或生成结果。

### 最终浏览器与集成检查

| 检查 | 实际结果 |
| --- | --- |
| 五个环节 | 全部可选；标题、输入、输出、边界和来源更新 |
| 四个职责 | Agent / Ruby / 模型 / 本地代码面板均可切换 |
| 三个场景 | 输入、重点、产出和创意随选择更新 |
| 下载 | 实际保存并读回品牌场景 Markdown，文件名与内容匹配 |
| 扩展筛选 | 复用 1、适配 3、新增 2、全部 6 |
| 时间线 | 播放可推进，暂停停止；End 到 16 秒并停播；再播放从开头开始 |
| 图层 | 三图层关闭时 aria-pressed=false、SVG display=none；恢复后重新显示 |
| 响应式 | 390、768、1024、1280 像素视口无文档横向溢出；保存移动与桌面截图 |
| 控制台 | 检查未见 error / warn |
| 子路径 | /012-motion-graphics-music-video/ 的 HTML、CSS、JS、favicon 返回 200 |
| 总库关联 | 总索引与 001、006、009 相关页均返回 200 |
| 根级检查 | index:sync、check、pages:build 成功；包含本项目 index.html |
| 工作流 | Pages 与 validate 工作流增加本项目脚本检查 |

首次浏览器读取曾得到 SVG 可见状态的滞后结果；刷新实际 DOM／可访问状态后，使用按钮属性、SVG display 与截图重新核对，三图层均正常。使用 viewport 进行响应式检查后恢复默认窗口大小。

初版截图：assets/preview.png 为桌面首屏，assets/mobile.png 为移动首屏，assets/principle.png 为底层原理段的实际网页截图。上述三张只展示原创网页与 SVG 示意。2026-10-10 新增的作者样片截图单独见 assets/upstream-frames/。

远程 Pages 部署和上游付费制作未执行。

## 2026-10-10：作者样片接入与效果来源

把原来的两个外链卡片升级为真实样片与截图对照。来源为上游 README 指向的 [The Math of You](https://youtu.be/TKXSOnVtfWQ) 和 [You knew how to fork](https://youtu.be/b70F1bWZlwE)。通过正常 YouTube 播放器抽样观看、暂停和定位，每支截取两帧；时间点与采集信息在 [截图来源记录](assets/upstream-frames/README.md)。未下载完整视频，也未执行上游制作。

| 样片 | 实际可见的风格 | 阅读重点 |
| --- | --- | --- |
| The Math of You | 奶油色纸感网格、蓝色西装人物插画、红／黄点色、摆锤／积分符号／等号 | 人物表演如何与数学隐喻共用画面 |
| You knew how to fork | 白色尖发漫画角色、黄黑警示条、粉色强调、大字、新闻主播场景与走势图 | 表情、大字、场景梗与内容如何配合 |

以上风格说明来自实际画面。素材与代码的职责来自固定提交的工作流说明，不把视觉观察当成每个元素的制作溯源。没有取得这两支样片的完整制作日志。

最终效果由三类能力共同形成：图像／视频模型影响角色外观、细节、动作和表演；p5 与本地工具控制文字、图形、布局、逐帧时序、抠图和合成；Agent 与人决定参考、分镜、隐喻、素材选择和审查。该库的价值是可控制、可修改、可复用的制作组织方式，不能把成片质量全部归因于模型，也不能把流程本身当作提升生成模型质量的办法。

网页默认展示本地截图，仅点击播放才连接 youtube-nocookie.com。截图按钮切换主预览并关闭对应播放器；收起恢复当前截图；播放另一支卸载前一支 iframe，避免同时播放。保留 YouTube 原片链接作为网络或嵌入规则下的替代入口。

### 样片更新的实际验证

| 检查 | 实际结果 |
| --- | --- |
| Math 页内播放 | 官方嵌入实际播放，读取视频 paused=false、时间 13.51 秒、1280×720 |
| Fork 页内播放 | 官方嵌入实际播放，paused=false、时间 29.06 秒、1280×720 |
| 单播放器 | 播放 Fork 后页面仅剩 Fork iframe，Math 已卸载 |
| 截图切换 | 两支第二张截图分别更新主预览、时间说明和选中状态 |
| 收起 | 移除 iframe，恢复当前截图；恢复第一张后默认展示两种风格 |
| 图片 | 四张 JPEG 原件与发布副本一致，网页全部加载成功 |
| 响应式 | 1280×900 双列、390×844 单列，文档无横向溢出 |
| 集成 | 网页语法检查、根索引同步、根校验及 Pages 汇总构建通过 |

实际网页截图：assets/examples.jpg 与 assets/examples-mobile.jpg。截图原件和发布副本均保留来源信息。

## 2026-10-10：一张图汇总理解

新增 assets/overview-infographic.png（2400×3500）和可编辑 SVG，并接入网页首屏下方的“一图总览”。内容包含目标与风格示意、输入、Opus 导演与工程师职责、Ruby 执行层、图像与视频模型、歌唱口型、p5／Python／Swift／FFmpeg、输出、扩展场景、个人价值与制作边界。

模型名称沿用固定提交中的约定：图像使用 GPT Image 2.5 Sunburst，角色表演使用 MiniMax H3 Max；不作为当前可用性验证。口型链路写明分离人声、对齐片段、音频约束表演与看／听检查，未把独立口型服务描述为现成默认能力，也未以音频绑定证明精准口型。

内置 imagegen 两次请求均因网络错误失败；未启用需要 API Key 的 CLI fallback。最终采用原创 SVG 排版，通过本机 bundled Sharp 导出 PNG。尝试提示词保留在 assets/overview-infographic.prompt.txt；最终排版源为 assets/overview-layout.mjs。图内风格缩略仅为原创图形示意，不包含作者截图，也不是上游生成成片。

已直接检查 PNG 的中文、章节、关系箭头与版面；Ruby 执行层连接全部五个工具阶段。原件与发布副本字节一致。网页支持展开、查看原图、下载 PNG 与打开 SVG；不增加网页运行依赖。

## 2026-10-12：全面理解汇总与发布准备

本轮沿用原始理解图作为首页导览，不重绘或修改 PNG／SVG。GitHub API 复核上游 main 为 `759ba6a7c80e2771f4dd69792e74383d71512e35`，提交时间仍为 2026-10-05T12:19:47Z。模型名称继续作为该快照的配置记录，不推断当前可用性。

页面补全八组模块、完整输入输出、导演与工程师职责、口型处理链、个人试做路径和九个扩展方向。原静音分层实验移到能力段，保留播放／暂停、定位和图层开关。总库元数据使用全面摘要与十二项分段摘要，预览改为原始理解图；远端统一站点仅增加 012，不引入其他项目的本地未发布草稿。

### 我们的理解与实现边界

| 问题 | 结论与依据 |
| --- | --- |
| 目标是否仍是生成 MV | 是。已有歌曲＋创意进入音乐驱动的 MV 制作链；不是从无到有创作歌曲的默认入口。依据 SKILL.md / README。 |
| Opus 是否只是导演 | 还负责研究、提示词、场景代码、工具调度与审查。执行器与媒体工具处理具体任务。 |
| 模型与代码如何搭配 | 图像模型提供角色／关键帧，视频模型提供绿幕表演，Python 分离角色，p5 按帧组织背景、文字与图形，Swift／FFmpeg 完成后期与编码。 |
| 是否已自带精准口型模型 | 默认是音频约束演唱加实际审查。`target_audio_url` 不证明精准口型；专用口型服务为新增适配方向。依据 prompts.md 与表演／音频合同。 |
| 最终效果来自谁 | 模型素材、确定性代码动画、创作选择与审查共同形成；没有两支样片完整日志，不能从截图反推每个元素来源。 |
| 生产管理新增价值 | 版本、任务依赖、分批审查、manifest、回执和上传缓存减少重复劳动，便于恢复与局部修订；不保证素材质量或实际费用硬限制。 |
| 对我们是否必须完整接入 | 不是必需。优先借鉴制作协议与素材管理，15–30 秒试做后再决定接入。总库到知识短片、工作台和自动验收是待开发建议。 |

### 原图完整性

| 文件 | SHA-256 |
| --- | --- |
| overview-infographic.png | `0e56387dd34e5462924886c6bb8602ae7f141ddc7a3d918c361aa4da55a2b6d0` |
| overview-infographic.svg | `04bfaf7ab8b1d9f4881e18fb9e6d2ac81da7d8880f28ea5983c28542a21e173e` |

原件与网页副本一致；远程部署后核对公开 PNG／SVG 的相同哈希。初版网页截图保留为历史记录，本轮的新截图另行命名。

### 本轮本地验证

在基于最新远端 main 的独立工作树中，完整执行现有已发布项目的依赖安装／构建步骤，以及 `npm run index:sync`、`npm run check`、`npm run pages:build`。十五个项目的站点汇总通过；012 使用无依赖静态网页，脚本语法检查通过。Oil UI 工作台的派生目录快照随元数据增加 012，保持发布索引一致。

浏览器验证五个制作环节、四个职责面板、场景切换、九个扩展筛选（复用 1／适配 4／新增 4）、三图层关闭与恢复、播放及 End 到 16 秒停止。四张作者截图、六个网页图片引用加载正常；两支第二张截图的时间说明和主预览同步更新。桌面 1280×720 和手机 390×844 无页面横向溢出，移动样片单列；浏览器未见 error／warn，章节锚点完整。截图保存为 preview-20261012.jpg、mobile-20261012.jpg、examples-20261012.jpg。

上述为研究网页验证，不代表上游制作链、模型口型、费用或整曲成片质量实测。两支样片实际播放的既有证据记录在 2026-10-10 一节；本轮公开站点另行验证嵌入与截图交互。

### 远端提交与公开部署验证

- 发布提交：[6caf5a6dc0eca12a37128649511b2289b9769786](https://github.com/yydshly/1009_codex_project/commit/6caf5a6dc0eca12a37128649511b2289b9769786)，已推送至 main。
- [Pages 工作流 38255884806](https://github.com/yydshly/1009_codex_project/actions/runs/38255884806)：build、deploy 均 success；[校验工作流 38255855392](https://github.com/yydshly/1009_codex_project/actions/runs/38255855392) success。
- 公开地址：[012 Motion Graphics MV](https://yydshly.github.io/1009_codex_project/012-motion-graphics-music-video/)。统一远端站点本轮包含十五个已发布项目，保留其他项目的既有内容。
- HTML、CSS、JavaScript、favicon、四张作者截图、总索引及 001／006／009 关联网页均验证 HTTP 200。检查途中一次图片请求遇到 GitHub 临时服务错误；随后以失败即停止的检查重新验证四张图片，全部返回 200／image/jpeg，浏览器六个截图引用全部加载成功。
- 公开 PNG／SVG 的 SHA-256 与上表原件完全一致；浏览器理解图 naturalWidth=2400，八组模块和九个扩展方向正常展示，完整图默认展开。
- Math 官方嵌入实播：paused=false、readyState=4、currentTime=39.921401 秒；Fork：paused=false、readyState=4、currentTime=17.480064 秒。自动播放第二支时只保留一个 iframe；收起后 iframe 为零并恢复截图，截图时间说明与选中状态一致。
- 公开页面未出现横向溢出；首屏实际截图为 assets/published-20261012.jpg。验证后恢复公开首页供阅读。

主工作区保留其他项目的本地草稿；只同步本项目文件与 012 元数据，并成功执行十九项本地总索引的 index:sync、check、pages:build。本轮提交范围是 012、根索引／元数据、两个工作流的 012 检查，以及自动派生的 Oil UI 项目目录快照。部署的是研究网页，未安装上游插件或执行付费制片。
