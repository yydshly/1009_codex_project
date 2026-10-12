# 完整研究网页的远端发布

整理日期：2026-10-12（Asia/Shanghai）。研究基线保持上游 commit `255562b04b1e5ecaa4ba98e5c9aa191d5ba7f6fa`。

## 交付内容

使用已经生成的 3840 × 2560 能力全景图作为首屏引导和总索引预览，提供 PNG 与 SVG 下载。九个章节说明定位与摘要、实际演示、能力、四类模块、原理、案例、场景、价值与扩展；摘要按九个标签维护在 projects.json，网页读取同一份记录。

保留原有 24 秒代码动画、46 项 DOM 状态路径比较、原始三轮成片评审、上游许可证与案例证据边界。云端构建不生成素材、不导出 MP4；浏览器直接播放已保存的 HTML/GSAP 动画，本地 MP4 下载入口仅在该文件存在时显示。

## 发布方式与验证

发布目标：[GitHub Pages 编号网页](https://yydshly.github.io/1009_codex_project/001-motion-video-kit/)。沿用总库 Publish GitHub Pages 工作流，新增项目 001 的依赖安装、build 与 verify；Validate research index 同步加入相同检查。

使用独立工作树准备本项目与必要的总库登记，保留远端已经发布的项目；当前主工作区其他未提交研究不属于此次发布包。推送前检查源码、图片、许可证、摘要、九个章节与静态资源。部署结果和线上复核在完成后追加。

独立发布包检查通过：001 的 `npm ci`、build、verify，现有016/017/018的构建检查，以及根目录 index:sync、check、pages:build。发布目录包含4个已登记网页；主工作区18个项目的本地校验与17个Web汇总也通过。主工作区的额外研究仍留在本地，不随此次提交发布。

引导图原版 SHA-256：`c4a1b5a429dcdc91de215c928449cc392938b65e1ba70b355a9fc0539298230c`；发布包图片与原图逐字节一致，project.json 包含9条摘要、renderAvailable=false，符合干净CI环境直接播放代码动画的设计。
