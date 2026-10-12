# Dvor 中文研究页与社区导览

单页静态研究网站，包含六个上游截图、真实可交互社区场景、上游完整世界复现、四站导览与风格参数实验。

2026-10-12 整理为完整研究指南：原图导读、全面摘要、九组模块职责、渲染管线、世界运行契约、原作效果、本地实验、价值、提示词、使用场景、分阶段扩展与证据边界。引导图从 `../assets/dvor-overview.png` 原样复制到 `public/guides/`，支持模态放大和 PNG 下载，原图字节未变。

## 运行

Node.js 22+；本地环境为 Node.js 22.15.0 / npm 10.9.2。依赖固定为 Three.js 0.180.0、Vite 6.4.3 和验证用 Playwright 1.62.1。

```sh
cd projects/004-dvor/web
npm ci
npm run dev
```

开发：`http://127.0.0.1:5194/`。

```sh
npm run build
npm run preview
```

构建预览：`http://127.0.0.1:5195/`。没有环境变量配置、外部 API、凭据或 CDN；模型和纹理由代码生成，样例图本地提供。

## 实验操作

- 社区模式：点入口/公告/书屋/休息区，完成四站路线；切换中英说明。
- 3D 视角：拖拽旋转、滚轮缩放；点全景、小行星或全屏。键鼠漫游支持 WASD、Shift、E、Esc。
- 点可见标识平面阅读空间注释；推动转盘观察真实动画。
- 切换到上游庭院，体验相同风格管线处理完整原作世界。
- 选三种预设或调色带、太阳、描边、雾、阴影色和粒子；保存到本机，或下载预设 JSON。
- 进入“提示词”章节：编辑编程/图像模型模板，复制或下载 TXT；把当前风格配置带入 3D 模板，使用四个修正示例继续迭代。

原色对照仍是连续 ramp 的 toon 材质。参数保存不包含布局，也暂未提供 JSON 导入。社区地名、布局、活动和时间均为演示内容。

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `index.html`、`src/style.css` | 中文研究内容与响应式页面 |
| `src/content.js` | 上游图片说明、地点/镜头/中英导览数据 |
| `src/community.js` | 本地新社区几何、文字纹理、碰撞和热点 |
| `src/demo.js` | 场景切换、渲染管线、摄像机、交互及风格控制 |
| `src/prompt-guide.js`、`src/prompt-guide.css` | 两类独立创作模板、当前风格参数带入、复制/下载与提示词章节 |
| `src/research-guide.css`、`public/guides/` | 完整研究内容样式与此前生成的原始全景图 |
| `src/vendor/` | 原始 Dvor core/world/content 文件；[来源声明](src/vendor/README.md) |
| `public/samples/`、`public/licenses/` | 上游六张图片和两份许可证 |
| `tests/verify.mjs` | 实际浏览器用户流程验证与截图 |
| `tests/verify-research.mjs` | 引导图 SHA-256、完整下载、模态阅读、导航与新增内容、320–1024px 阅读布局 |

## 验证

先启动构建预览，再在另一个终端执行：

```sh
npm run verify
```

脚本优先使用本机 Chrome 或 Edge。没有这些浏览器时，安装 Playwright Chromium：

```sh
npx playwright install chromium
npm run verify
```

可用 `DVOR_BROWSER` 指定浏览器路径，`DVOR_URL` 指定预览 URL；这两个变量只供本地验证脚本使用。验证包括实际 WebGL、热点、路线、保存/导出、原作、电车、Pointer Lock、行走与响应式。截图和结果写入 `../assets/`。部分受限浏览器禁止 Pointer Lock 时，页面仍可拖拽和地点导航。

2026-10-09 本机 Chrome 154 的最终浏览器验证：10 项通过，错误/警告/失败请求均为 0。该结果覆盖实际场景交互及响应式模拟，没有覆盖真实手机 GPU 或全部浏览器。

提示词交互的新增验证使用 `npm run verify:prompts`，覆盖模板切换/编辑、实际剪贴板、TXT 文件内容、当前实验数据带入、复制失败回退和响应式；结果记录在 `../assets/prompt-verification.json`。模板是方法建议，页面没有调用生成模型，效果需要在独立工程中实际验证。

完整指南检查使用 `npm run verify:research`，实际验证原图资源与下载内容、Esc / 焦点返回、九个导航、模块与价值/扩展说明、四档响应式无页面溢出，并记录实际截图。先执行 `npm run build` 再在构建预览上验证。记录使用运行当天的 Asia/Shanghai 日期。

## Pages 接入

`vite.config.js` 设置 `base: './'`，资源和动态世界 chunk 都使用相对路径。构建输出 `web/dist/`，根元数据的 `pagesDir` 指向此目录，Pages 与 validate 工作流均增加本项目 `npm ci` / `npm run build`。

```sh
# 总库根目录
npm run index:sync
npm run check
npm run pages:build
```

汇总目录 `_site/004-dvor/index.html`。在线地址：[完整 Dvor 研究页](https://yydshly.github.io/1009_codex_project/004-dvor/)。2026-10-12 的 GitHub Pages 工作流与公网实际浏览器检查均成功。静态资源不含 `node_modules/`、测试脚本或源码目录；Dvor、Sakura Crossing 和 Three.js 三份许可证随产物发布。

将 `_site/` 通过 HTTP 提供于 `127.0.0.1:5196` 后，可执行 `npm run verify:pages`，检查编号子路径的图片、动态原作 chunk、WebGL 场景与许可证。其他地址使用 `DVOR_PAGES_URL` 指定。

`verify:pages` 同时检查原图哈希与完整研究内容；公网结果写入 `assets/public-pages-verification.json`，本地结果写入 `assets/pages-verification.json`。完整发布记录见 `assets/deployment.json`，此检查不替代真实手机或用户任务测试。
