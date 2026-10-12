# 图片与验证记录

离心泵图片由本地独立 Web 页面生成。upstream-gallery/ 是新增的 20 张小体积上游案例截图；全部保留来源与署名，没有模型下载。

| 文件 | 内容 |
| --- | --- |
| preview.png | 离心泵装配状态的实际浏览器截图，用于根索引 |
| overview.png | 桌面研究页首屏 |
| scene.png | 装配状态与控件 |
| exploded.png | 部件展开 |
| flow.png | 透视外壳与预设路径粒子 |
| mobile.png | 手机视口下的实际界面 |
| verification.json | 交互、无模型请求、移动与子路径检查 |
| gallery-desktop.png | 更新后的上游案例图览实际页面截图 |
| gallery-mobile.png | 手机图览实际界面 |
| gallery-detail.png | 原生放大视图 |
| gallery-verification.json | 图片加载、筛选、放大、键盘、移动与子路径检查 |
| upstream-gallery/ | 20 张原样上游 WebP、来源清单与许可 |
| understanding-map.svg | 本次研究绘制的完整链路矢量图，1600 × 1940，包含素材生产、设计与代码实现、实时控制和验证迭代 |
| understanding-map.png | 同一矢量图的浏览器渲染 PNG，可直接查看或分享 |
| understanding-desktop.png | 理解总览在桌面网页中的实际呈现 |
| understanding-mobile.png | 理解总览在手机网页中的实际呈现 |
| understanding-verification.json | 总览图加载 / 下载、移动布局、共享引擎与工具、交互回归与生产子路径验证 |
| publish-verification.json | 2026-10-12 完整摘要、模块、价值与扩展、原图保留及本地 / 线上交互验证 |
| publish-desktop.png | 完整整理版网页的实际桌面首屏 |
| publish-mobile.png | 完整整理版网页的实际手机首屏 |

泵体是代码生成的简化教学结构，不代表上游作品、厂商品牌、实物尺寸或工业流场。截图只证明本地页面的可见状态。

原模板 preview.svg 为占位图，已从索引移除；实际预览采用 preview.png。

understanding-map.* 是原创研究图，依据固定提交的生成脚本、优化脚本、ENGINE.md、案例与截图工具整理，没有复制上游图片或代码。图中的生成链路说明上游制作机制；本次没有调用生成服务或下载模型。PNG 由本地 Chromium 按 SVG 的 1600 × 1940 固定尺寸渲染，图中文字另有网页正文说明。

gallery-* 页面截图包含 Dioramas 的上游画面，相关图片按 CC BY 4.0 署名。它们证明本地图库能呈现图片，不证明本地运行了上游 3D 场景。原先 verification.json 中“无外部素材请求”记录对应第一版实验；更新版仍无模型和外部运行时请求，但会读取本地上游截图。
