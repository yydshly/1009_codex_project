# 009 Web · 油画动画与音乐同步

原生 HTML / CSS / JavaScript。构建、检查和开发服务只依赖 Node.js 22+ 标准库，无需 npm install。

在总库根目录：

    npm.cmd run build --prefix projects/009-functional-emotions-video/web
    npm.cmd run check --prefix projects/009-functional-emotions-video/web
    npm.cmd run dev --prefix projects/009-functional-emotions-video/web

访问 http://127.0.0.1:4319/1009_codex_project/009-functional-emotions-video/ 。修改后重新 build 并刷新。

## 结构与输出

- public/：原创研究页面、交互与隔离的 WebGL2 播放器。
- vendor/functional-emotions/：固定提交的 MIT 渲染器、工具、八个章节、数字时间数据及许可证。
- ../assets/frames/：完整原项目的八张真实静帧。
- scripts/build.mjs：复制静态文件到被忽略的 dist/。
- scripts/check.mjs：检查 JS 语法、所需输出与不含歌词句子的时间数据。
- public/demo/：原创乐谱配置、新场景和同步控制器；复用上游 paint.js。
- ../assets/demo/：原创 WAV、乐谱 JSON 与七张真实渲染图。
- public/overview.js、overview.css：总览图大图缩放、独立提示词复制及响应式布局。
- ../assets/overview/：研究总览 PNG、图像编排说明与独立创作提示词；构建复制到 dist/assets/overview/。

页面、渲染器与截图使用相对路径，原曲使用固定上游提交的 raw.githubusercontent.com 音频地址。pagesDir 为 web/dist，输出包含 index.html。根 pages.yml 与 validate.yml 在校验之前执行本子项目的 build/check。

## 播放边界

实时画面需要 WebGL2，默认暂停。完整模式可顺序播放 372.7 秒、定位八个章节并拖动时间；精选模式循环四段镜头。笔触参数可调。初始化失败会显示状态，截图与说明仍可阅读。

主按钮“播放原版 MV”和“播放原版音乐”会直接读取上游原曲，以 audio.currentTime 驱动画面。初始状态不播放、不请求音频；点击后才联网加载。暂停、拖动、章节定位和重播同时控制声音与画面；网络失败时提供重试、本地文件与静音入口。

选择本地音频后继续使用相同同步逻辑。文件通过 Object URL 读取，不上传、不持久化；刷新后需重新选择。其他音频仅伴随播放，不重新分析或编排动作。“静音观看”移除当前音频并只播放画面。

上游歌曲文件和完整歌词没有纳入构建产物，原歌曲来源和作者有声成片链接可从实验台打开。新增原创 WAV 从本站加载。新主题仍需新的分镜和场景代码。

## 原创演示

《光种的旅行》包含 32 秒原创器乐与六个新镜头，90 BPM、48 拍。构建会执行 ../scripts/generate-demo-music.mjs，用固定乐谱与确定性合成生成 22050 Hz、16 位立体声 WAV，无外部音频或音乐模型接口。

新场景与原创音乐共用拍点时间轴；支持播放、暂停、拖动、重播、静音、六镜头定位、底画/油画切换和暖金/青绿配色。原版播放器与原创演示互相暂停，避免同时发声。完整音乐直接从本站加载。

离线导出是可选的本地步骤，需要已安装的 Chrome、Playwright 与 FFmpeg：

    npm.cmd run render:demo --prefix projects/009-functional-emotions-video/web
    npm.cmd run build --prefix projects/009-functional-emotions-video/web

默认复用 004 Dvor 的本地 Playwright 安装；可通过 PLAYWRIGHT_MODULE 与 FFMPEG_PATH 指定工具路径。导出逐帧绘制 768 帧，生成 32 秒、1280×720、24 fps、H.264/AAC MP4，保存于被忽略的 upstream/functional-emotions-video-review/out/original-demo/。构建检测到该文件才复制到 dist 并显示 MP4 入口；CI 默认只构建实时演示，不提交离线产物。

本次展示实际制作的场景适配，不包含通用音乐上传、自动分镜或在线代码生成服务。

## 共同理解与总览图

2026-10-12 更新。#overview 位于开篇，沿用此前生成的总览图，汇总能力、模块、效果、原理、价值、扩展场景及已验证阶段；支持 PNG 下载和模态大图 100%–300% 缩放。总览图由 AI 编排并使用真实渲染素材作为插图，原始素材及两个动态播放器仍保留。

#modules 拆解七个制作模块，说明职责、复用范围和新增工作；#product-direction 展示已完成实作、接入用户音乐的下一步和系列化／批量制作方向。根 README 索引采用九项结构化摘要，Pages 卡片提供概述及完整研究网页入口，预览使用同一张生成的引导图。

#understanding 说明 Skill 约束风格、方向、流程，模型自由决定故事与分镜，最后用代码实现画面。原仓库实际使用制作指南；当前网页没有在线运行模型或音乐生成 Skill。原创音乐与场景依据共同乐谱设计，不能表述为网页自动听歌成片。

#creative-prompt 提供独立于原库的创作任务，支持复制、下载 TXT 和直接锚点展开。复制权限不可用时选中文字，用户仍可复制或下载。

## 维护来源

子项目 scripts/import-reference.mjs 可从被忽略的固定上游研究目录导入八个章节，将词时间查询转换为数字标识，并排除完整歌词和音频。正常构建不运行导入，也不下载上游。

继续保留 vendor/functional-emotions/LICENSE 与 README.md。图片来源和验证数据见 ../assets/README.md。
