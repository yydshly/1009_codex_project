# Motion Video Kit 中文研究网页

纯静态 HTML/CSS/JavaScript 页面，包含九个研究章节、能力全景引导图、九条完整摘要、可定位的 24 秒代码动画、验证入口与来源链接。Node.js 22+ 标准库负责构建和本地服务；GSAP 3.15.0 与 HyperFrames 0.8.143 已锁定版本。

在线地址：[完整研究网页](https://yydshly.github.io/1009_codex_project/001-motion-video-kit/)。全景图沿用 2026-10-09 原版，PNG 3840 × 2560，SVG 保留可编辑文字；网页构建只复制图像，不运行图像生成服务。项目摘要由根 projects.json 的 summarySections 同步到 project.json，网页与总索引使用同一份理解。

## 安装与预览

```powershell
cd projects/001-motion-video-kit/web
npm ci
npm run build
npm run dev
```

地址：[本地研究页](http://127.0.0.1:4311/1009_codex_project/001-motion-video-kit/)。服务仅监听 127.0.0.1，也接受根路径；可用环境变量 MOTION_RESEARCH_PORT 更换端口。

无需 API key、账号或模型服务。GSAP 构建时复制到站点内部，运行时不访问 CDN。字体使用本机中文字体，输出可能随系统变化。

## 检查与导出

```powershell
npm run verify
npm run motion:check
npm run render
npm run build
```

- verify 检查九个章节、摘要完整性、引导图尺寸、播放器结构、相对资源路径、JavaScript 语法、分镜长度与研究版本。
- motion:check 运行 HyperFrames 默认检查。密集采样与实际结果见 [验证记录](../verification.md)。
- render 导出 renders/research-workflow.mp4，24 秒、1280 × 720、30 fps、静音，软件截图模式，1 个 worker。初轮曾用2个worker完成，最终导出改为1个以减少本机并行浏览器争用。
- 渲染脚本尊重 HYPERFRAMES_BROWSER_PATH。Windows 未配置时优先使用标准路径已安装的系统 Chrome；没有系统 Chrome 则使用 HyperFrames 默认选择。本机的打包 headless shell 启动失败，已通过系统 Chrome 完成导出。
- 再次 build 将 MP4 复制到 dist/media/，启用网页下载入口。未导出时仍可播放同一段代码动画，下载入口隐藏。

详细诊断位于被忽略的 renders-check.json；关键汇总保存在 ../assets/validation.json。视频、密集评审帧、依赖和构建目录均不提交。

## Pages 集成

输出 web/dist/，必须含 index.html。资源使用相对路径，可部署到 /<repo>/001-motion-video-kit/。总库 projects.json 的 pagesDir 指向 web/dist，工作流在汇总前运行：

```sh
npm ci
npm run build
npm run verify
```

CI 默认只构建静态研究页，不导出或提交视频；网页动画可直接播放。完整集成检查从根目录执行：

```sh
npm run index:sync
npm run check
npm run pages:build
```

发布使用总库 Publish GitHub Pages 工作流；提交和部署结果记录在 [部署记录](../deployment.md)。CI 构建研究页与代码动画，不运行素材生成模型，也不重新渲染 MP4。

## 文件与许可证

- src/：研究页和动画源码。
- scripts/：构建、服务、静态验证和导出。
- dist/：被忽略的可部署产物。
- renders/ 与 review-frames/：被忽略的视频和密集评审帧。
- [licenses/README.md](../licenses/README.md)：上游 MIT、GSAP 许可与素材说明；构建保留 GSAP 文件头并生成许可说明。
