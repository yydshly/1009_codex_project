# Dioramas 研究页与 FLOW—01 场景实验

原生 HTML / CSS / JavaScript + Three.js 0.186.1，Vite 8.3.4。没有下载上游模型、大文件或完整仓库。

## 运行

Node.js 22.12+；本地验证为 22.15.0。在此目录执行：

    npm ci
    npm run dev

打开 http://127.0.0.1:5192/。Windows 可使用 npm.cmd。

生产构建与预览：

    npm run build
    npm run preview

预览地址 http://127.0.0.1:5193/。

## 内容与交互

正文涵盖能力、原理、20 个案例、场景、复用技术、扩展方向和证据。原理节点可查看职责。20 个案例直接显示上游截图，支持分类、点击放大、上一张 / 下一张、左右键和 Escape 关闭；图片每张不超过 182 KB，总量约 1.8 MB。

新增 #understanding 理解总览：一张图汇总“外部生图 → 图转 3D → 调度与优化 → 场景 / 网页设计 → 共享引擎 + 场景代码 + HTML → 实时交互 → 测试迭代 → 最终网页”，可打开大图、下载 SVG 或 PNG。四个职责说明覆盖模型、库、设计和浏览器；#principle 补充共享引擎模块和开发工具表，#effects 说明 3D、着色器、2D 内容与音频等效果层次。

3D 结构由代码生成：拖动旋转、点击部件、切换展示 / 展开 / 流向预设，滑块调整展开，切换实体 / 透视与流向，按钮重置。部件列表支持触摸和键盘等效操作。小屏重新排版；减少运动偏好暂停连续动画；WebGL 失败时保留说明。

## 文件

| 文件 | 职责 |
| --- | --- |
| index.html / style.css | 研究结构、语义控件、桌面和移动布局 |
| content.js | 部件说明、案例、原理节点、复用映射 |
| research-summary.json | 与 projects.json 中 002 摘要一致的九维说明，供网页显示 |
| main.js | 筛选、导航、界面状态与场景控制 |
| scene.js | 几何、灯光、材质、拾取、插值、粒子与资源释放 |
| ../assets/understanding-map.svg / .png | 理解总览原图与 PNG；通过 Vite 导入并随生产子路径发布 |
| public/licenses/three-LICENSE.txt | Three.js 原始许可，随静态产物分发 |
| THIRD_PARTY_NOTICES.md | 来源和第三方归属 |

## Pages

Vite base 为 ./，没有 history 路由或绝对资源路径。构建到 web/dist，pagesDir 指向该目录，根 pages:build 汇总到 _site/002-dioramas/。

pages.yml 与 validate.yml 均在根校验前执行此项目的 npm ci、npm run build。根级无需依赖。dist 与 node_modules 被忽略。

根目录执行：

    npm run index:sync
    npm run check
    npm run pages:build

已部署并验证：https://yydshly.github.io/1009_codex_project/002-dioramas/。本轮提交、Actions 运行与线上验证见 ../deployment.md。

## 边界与验证

离心泵场景为真实需求的教学示意，无型号、尺寸或工业仿真参数，三维结构完全由代码生成。上游案例采用原样小体积截图、说明与源码链接呈现，没有加载模型；静态图不包含原有交互。

浏览器检查见 ../assets/verification.json；截图说明见 ../assets/README.md。

图览补充检查见 ../assets/gallery-verification.json。图源与许可在 ../assets/upstream-gallery/manifest.json 和 README.md；截图通过 Vite 导入，无外部运行时请求。Dioramas 的素材署名随 public/licenses/dioramas-assets.txt 一同发布。

理解总览补充检查见 ../assets/understanding-verification.json。图片为本次研究整理，非上游官方架构图；没有增加外部运行时服务或模型请求。

可复用模型组件：`pump-model.js` 接受宿主 THREE，返回模型根、部件、选择、动画更新和释放接口；`pump-parts.js` 提供六部件说明。原 scene.js 与 015 展台直接引用同一个工厂。几何、材质和流向仍为本地简化教学示意。

## 2026-10-12 完整整理

网页按“原图总览与九维摘要 → 能力与 9 文件模块地图 → 制作 / 访问原理及 7 项工具 → 20 个效果 → 场景 → 价值与技术复用 → 泵实验 → 6 项扩展验收 → 证据”排列。原 understanding-map.svg 与 PNG 保持字节不变。价值为研究判断，扩展为待验证建议；未下载模型或调用生成服务。
