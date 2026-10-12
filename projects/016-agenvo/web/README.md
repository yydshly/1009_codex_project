# Agenvo 研究网页

原生 HTML / CSS / JavaScript，零 npm 依赖。

- **运行环境：** Node.js 22+。
- **源文件：** `src/`。
- **原引导图：** `../assets/agenvo-guide.png`，字节保持不变。
- **构建产物：** `dist/`，不提交。

```sh
npm run build
npm run check
npm run dev
```

**本地预览：** http://127.0.0.1:4186/。

**在线阅读：** https://yydshly.github.io/1009_codex_project/016-agenvo/。

## 说明排版

- 开头完整摘要按定位、能力、模块、原理、部署、价值、边界、扩展分行标注。
- 长说明采用标签与正文对应的列表，一项只说明一个主题。
- 六步调用路径、三类原生接入、模块表、脚本规则与阅读清单同时可见。
- 手机表格按列名逐项展示，避免隐藏横向列。
- 原图支持放大、打开原尺寸、下载与 Escape 关闭；目录使用锚点。

全部内容是研究说明，未连接真实 Agent，不收集密钥。

## 构建与发布

`build` 复制四个源文件与原 PNG，并替换固定源码 SHA。

`check` 检查 JavaScript 语法、资源、锚点、版本替换及原 PNG 字节一致性。

项目 `pagesDir` 为 `web/dist`；`pages.yml` 与 `validate.yml` 构建并检查该页。资源采用相对路径，无 SPA 回退。

根目录运行 `npm run index:sync`、`npm run check`、`npm run pages:build`，生成 `_site/016-agenvo/index.html`。

## 预览配置

- **`AGENVO_PREVIEW_ROOT`：** 指定汇总站点目录。
- **`AGENVO_PREVIEW_PORT`：** 指定端口。
- **监听范围：** 仅 `127.0.0.1`。

支持减少动画偏好；不加载外部字体、脚本或分析服务。点击资料链接时访问外站。
