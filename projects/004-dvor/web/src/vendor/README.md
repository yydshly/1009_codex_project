# 上游源码来源

本目录 `core/`、`world/`、`content/` 中 19 个 JavaScript 文件引入自：

- 仓库：[amirmushichge/dvor](https://github.com/amirmushichge/dvor)
- 提交：`30d6f684670915865743c79f44f931a43d987113`
- 原目录：`src/core/`、`src/world/`、`src/content/`
- 本地修改：`core/toon.js` 将 `flatShading` 从 MeshToonMaterial 构造参数移到构造后赋值；其余 18 个文件保持原样。网页控制和配置位于上层 `src/demo.js`，新社区位于 `src/community.js`。

Three.js r180 的 MeshToonMaterial 构造器不接受 `flatShading`，原参数会产生警告；WebGLPrograms 仍会读取该属性来启用 FLAT_SHADED。兼容修正保留原有平面着色意图，并消除不支持参数警告。升级依赖时需再次核查这一内部契约。

Dvor：Copyright (c) 2026 Amir Mušić，Portions copyright (c) 2026 Kenton Wang。部分基础来自 [Sakura Crossing](https://github.com/Kenton-GMI/sakura-crossing)，Copyright (c) 2026 Kenton Wang。

完整 MIT 文本保存在项目根的 [LICENSE.dvor](../../../LICENSE.dvor) 和 [LICENSE.sakura-crossing](../../../LICENSE.sakura-crossing)，并在 `web/public/licenses/` 保存相同副本，随静态网页分发。

本页使用渲染、建模、自然、投影、设施与玩家控制模块；保留的 HUD/audio 文件并未作为本页 UI 或声音系统使用。原始应用入口和菜单没有复制，本地 `demo.js` 负责集成。
