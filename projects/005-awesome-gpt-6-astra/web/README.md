# Awesome GPT-6 Astra：AI 游戏作品与开发方法 Web 演示

既有中文引导图、八章完整研究、案例背景演示、完整样例库与交互原理。采用 HTML、CSS、原生 JavaScript；构建与服务使用 Node.js 22+ 标准库。背景引入 CC0 许可的轨道花园单文件 WebGL 源码，无包依赖、外部字体、API Key 或运行时目录抓取。

## 页面内容与交互

- `index.html`：沿用既有说明图，并以可直接阅读的八章正文解释能力、模块、目录与作品原理、成熟度、价值与场景、使用路径、扩展建议和证据边界。提供章节导航、高清图下载与图中文字。
- 本地轨道花园作为实际背景，支持星之花、引力环、旋涡星系、暂停、引力扰动；“只看背景效果”可以拖动或用方向键旋转，Escape 返回说明图。系统减少动态效果时默认暂停并关闭引力扰动。
- `library.html`：原有完整 175 项样例库，支持六类玩法、关键词搜索、25 项源码入口筛选、三种排序和分批继续浏览。
- 点击作品图片、标题或“资料与详情”，打开原生 dialog，展示作者、平台、模型参与原文、来源与开发资料；“在线体验”进入作者公开网页。
- `about.html`：四项能力的可切换说明：发现体验、研究过程、运行改造、搭建目录。
- 轨道花园、雷霆战机、三分天下的上游实际截图、技术栈、开发分工、体验及来源链接。
- 目录数据流和作品创作流程两组步骤；点击步骤显示输入、处理、产出与依据。
- 按学习、游戏原型、互动艺术、案例库四种目标切换研究建议。
- 来源快照、模型归属说明、开源与许可边界。

说明图与文字在不启用 JavaScript 时可以阅读；背景控制与目录浏览需要 JavaScript。`about.html` 的主要内容也可直接阅读。详情 dialog 支持 Escape 与焦点恢复；介绍页 Tab 组件支持方向键、Home、End。手机可展开“图中文字与研究依据”，避免依赖小字图片。WebGL 不可用时仍可阅读静态说明。

## 本地运行

```sh
cd projects/005-awesome-gpt-6-astra/web
npm run build
npm run check
npm run dev
```

默认地址：`http://127.0.0.1:4315/1009_codex_project/005-awesome-gpt-6-astra/`。

本地“返回项目总索引”读取根目录生成的 `_site/`；首次使用总索引导航前，在根目录执行 `npm run pages:build`。

PowerShell 可用 `$env:ASTRA_RESEARCH_PORT = '4415'` 调整端口。构建后可用任意静态服务发布 `dist/`。目录数据由普通脚本加载，不使用模块脚本或目录 API 请求。说明图与本地轨道花园不依赖外部网络；目录的远程预览与作者试玩需要联网。建议通过 HTTP 运行，保证 iframe 控制与图片下载行为一致。

## 构建与 Pages

`npm run build` 读取 `../source/README.zh-CN.md`，通过 `scripts/catalog.mjs` 解析已知的条目格式。构建会验证数量与 README 声明一致、ID 无重复、六类齐全且作者/平台/模型说明存在；缺失时直接失败，避免静默丢失样例。

解析结果保存在 `data/catalog.json`，发布时同时生成 `catalog.json` 与安全序列化的 `catalog-data.js`。三个研究页面、样式、脚本、说明图、本地截图、上游许可与版本信息复制到 `dist/`；不复制整个工作区。构建过程不依赖网络。

`vendor/orbital-garden/index.html` 保留上游原始文件。构建将原作原样复制到 `dist/demos/orbital-garden/`，同时生成 `garden-background.html`：额外加载 `garden-background.css` 隐藏原界面、`garden-adapter.js` 连接原按钮。父页使用 `postMessage`，验证消息来源、同源与命令字段，不访问渲染器私有变量；原作 WebGL、数学、静音默认和减少动态效果逻辑保留。许可与来源文件随原作发布。

- `projects.json.pagesDir`：`web/dist`。
- 正式编号路径：`/1009_codex_project/005-awesome-gpt-6-astra/`。
- 页面代码、本地图片与原作 iframe 使用相对路径；三个研究页面之间使用相对链接。
- Pages 与 Validate 两个工作流都先执行本子项目构建，再进行根校验。
- 总库运行 `npm run index:sync`、`npm run check`、`npm run pages:build` 验证汇总。

正式入口：[005 完整研究页](https://yydshly.github.io/1009_codex_project/005-awesome-gpt-6-astra/)。实际部署与公开验证记录见 [research.md](../research.md)。

`npm run check` 校验固定快照计数、六类与源码筛选数、175 个唯一 ID、本地资源与锚点、脚本语法、既有引导图 SHA-256、完整原作字节与 LICENSE。它验证发布完整性，不能替代浏览器交互与全部游戏实测。

## 来源与限制

页面固定研究版本为 `42ec7142a3da1dcce1846de8a3fc0b4891b4c8ae`。175 项由完整 README 实际解析得到；源码入口数按“开发资料”中明确的源码、GitHub、HTML 或运行说明链接统计。六类计数为 58、12、37、21、35、12，总和 175。详情中的模型参与文字保留作者说明，包括待确认条目，不把待确认归因改写为已验证事实。

维护日期和条目内容来自固定快照，不是实时同步；介绍页图示不会实际发起上游目录请求。更新研究版本时，需要同步 source 快照、解析规则、元数据与研究说明。

说明图由内置 imagegen 工具生成，参考原作者截图，完整提示词见[记录](../assets/infographic-prompt.md)。本地截图与 AI 信息图有明确区分，详见[图片说明](../assets/README.md)。成熟度描述是研究判断，未对全部 175 项实测。除了本地轨道花园，目录试玩仍进入原作者站点，其可用性、兼容性和版本由作者维护。
