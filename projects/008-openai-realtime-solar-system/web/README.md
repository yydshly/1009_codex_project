# Realtime Solar System 中文研究演示

独立的 Vite + Three.js 静态网页，展示六类指令、3D 动画、两类图表、可选系统朗读、四类扩展方案和上游依据。

2026-10-12 完整整理为七个阅读区：理解汇总、可操作示意、能力与边界、七组模块与七步机制、场景与价值、六类扩展方向、源码与验证依据。项目摘要同样覆盖定位、能力、模块、原理、效果、场景、个人价值、投入、扩展和限制。

顶部新增中文理解汇总图，点击可打开高清 PNG。图片使用内置 imagegen 生成，参考上游自带截图及本地示意，区分已有能力、扩展方案和未验证的收益。

## 本地运行

需要 Node.js 22+。在本目录执行 npm ci、npm run dev，打开 http://127.0.0.1:5198/ 。执行 npm run build，构建到 dist/；npm run preview 打开 http://127.0.0.1:5199/ 。

## 验证

执行 npm run check、npm run build。保持 npm run preview 服务，在另一终端运行 npm run verify。

测试使用 Playwright，优先选择 Windows 安装的 Chrome 或 Edge；其他环境可先执行 npx playwright install chromium。SOLAR_BROWSER 指定浏览器路径，SOLAR_URL 指定测试地址。

覆盖示例指令、饼图与柱状图、卫星、轨道、ISS、复位、未知指令、扩展标签页、键盘操作、完整六步演示、390px 布局与许可资源。不调用真实模型，不听测朗读音频。

## Pages 接入

资源使用相对路径，Vite base 为 ./。根 projects.json 的 pagesDir 为 web/dist，两个工作流添加本项目的 npm ci、npm run check、npm run build。

根目录执行 npm run index:sync、npm run check、npm run pages:build。结果应包含 _site/008-openai-realtime-solar-system/index.html。静态服务器需打开整个 _site/，通过编号子路径访问。

本目录执行 npm run preview:pages，打开 http://127.0.0.1:5200/008-openai-realtime-solar-system/ 。PowerShell 中设置 $env:SOLAR_URL 为该地址，再运行 npm run verify，结果保存到 assets/pages-verification.json。

公开发布路径：https://yydshly.github.io/1009_codex_project/008-openai-realtime-solar-system/ 。部署结果与公开页面验证记录见 ../research.md。

## 输入与边界

识别关键词包括已展示天体的中文或英文名称、卫星、轨道、空间站或 ISS、陆海比例或比较、全景或复位。使用有限本地规则，不请求麦克风、不调用模型、不需要密钥，未知输入不执行动作。

朗读使用浏览器 speechSynthesis，不是 OpenAI 语音。地球海洋占比依据 NASA，ISS 为固定示例坐标，模型纹理、尺寸、轨道和位置均为教学示意。

上游截图与许可随构建复制到 dist/，来源见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。可扩展场景尚未接到 002、004 或真实后端。

真实语音需单独部署服务器签发短期凭据，并把前端工具调用适配到已有 Three.js 场景。正式 API Key 不存于 Pages。
