# R7 · 冰谷里的时间

2026-10-10。根据用户调整后的方向，借鉴多尺度空间叙事，形成自己的冰谷体验。原片继续作为灵感与历史比较材料，不以同范围、同参数或逐帧相似作为本轮目标。

## 本轮成果

- 六段镜头：山地坐标 → 进入冰谷 → 缓慢流动 → 改变条件 → 前后对照 → 回到证据。默认时长 10 / 11 / 12 / 14 / 11 / 10 秒，共约 68 秒；渲染卡顿时实际录屏可能更长。
- 冰谷窗口从原 321×321 高程中直接取列 55–227、行 108–238，得到 173×131 个原样样本。范围 `[86.78234375,43.0733125,86.85221875,43.126125]`，约 5.68×5.88 km；显示高度 1.25×。原影像、DEM 与来源清单字节不修改。
- 贴图通过 UV offset/repeat 对同一景 2023-08-31 Sentinel-2 原始 10 m 影像裁窗，没有 AI 超分、虚构地表或增加实际几何分辨率。显示采样仍约 33×45 m，不称为原始 DEM 精度。
- 两条教学冰体路径总体从较高处到较低处，参考高程检查端点。冰体边界与厚度、流动箭头、积累粒子及响应幅度均为概念设定，未读取实测多年轮廓或流速。
- 收支试验允许改变积累、消融，运行、暂停、重置；积累较强时示意冰体恢复，消融较强时收缩，两者相同时保持。参数无量纲，没有真实日历、气候输入或预测用途。
- 三种观察模式共用真实底图；播放、镜头按钮与手动接管相容。连续叙事最后关闭教学图层，停在真实观测。
- 新增 `explorations.html`：候选影像切换、雪冰类比例、三层依据、本地前后画面、R1—R7 探索总结；原研究页与沙盘可进入。

冰川质量收支及缓慢流动的说明参考 [NSIDC 冰川说明](https://nsidc.org/learn/parts-cryosphere/glaciers/why-glaciers-matter) 和 [USGS 质量平衡说明](https://www.usgs.gov/programs/ecosystems-land-change-science-program/science/mass-balance-methods-measuring-glacier)。本轮读取公开资料核对概念，未重新获取遥感数据。候选图片取自已有研究证据。

## 素材保留

- [原效果总览](before/glacier-overview.png)、[原教学叠层](before/glacier-teaching.png)、`source-before/` 五份改动前文件。
- `after/`：六镜头、总览、流动、试验、自然播放及手机截图；`pass-a` 为修正前试调，保留其真实状态。
- [六段讲解实际录像](recordings/glacier-narrative.mp4)、[完整 WebM 母片](recordings/glacier-narrative.webm)、[录制参数与时间](recordings/capture-log.json)。录像为实时 WebGL，含镜头运动，不包含 HTML 控件/标签或设备语音；完整 UI 由截图记录。
- [界面与数据验证](verification.json)、[媒体验证](recordings/media-verification.json)。
- [R7 不可覆盖快照](../checkpoints/2026-10-10-glacier-narrative-final/materials.json)。R4—R6 原快照保留。

## 试调与修正

1. 首版手机试验面板与镜头条、控制条边缘重叠。保留 `mobile-experiment-pass-a.png`，调整三个区域的垂直间距后检查真实矩形无重叠。
2. 高程窗口边缘 UV 与原样采样用独立断言检查；没有通过放大网格宣称获得更高精度。
3. 阶段文案曾被旧的 `phaseLabel` 覆盖。改为统一百分比显示，并将手动试验文案跟随条件更新。
4. 网页检查脚本最初把 `?scene=glacier` 当本地文件名；修正查询参数解析后通过。
5. 手机按钮隐藏 `›`，自动化初次按桌面完整名称寻找失败；读取实际 DOM 后用手机可见名称，未把定位失败当产品故障。

本轮视觉与交互自检结果见 verification.json，用户验收不代为确认。未在线发布，未引入原应用源码与模型资产。

## 最终检查

24 项浏览器检查通过：六镜头、完整播放结束、三种收支响应、重置、真实图层返回、指针接管暂停、天池原功能、冰谷返回、390×844 间距、探索图片与候选切换、窄屏非溢出；两页控制台无警告或错误。阶段文案修正后的截图采用 `glacier-final-shot-*`。

MP4 保留母片前 75 秒，包含完整约 68 秒讲解及结束停留；1280×720、H.264、30 fps、2250 帧、10,189,511 字节，无音频。母片未删减（录制开始 06:07:27.740 UTC，结束检查 06:09:30.360 UTC，完整文件保留；WebM 容器没有写入 format.duration，不能把该字段缺失解释为零时长）。[七个抽帧接触表](after/video-contact-sheet.jpg) 已目视检查，73 秒画面已回到真实地表；全片解码无错误、无 ≥99.5% 黑屏超过 0.1 秒。

子项目检查、根索引同步、根检查、Pages 构建与 `git diff --check` 均通过（15 项目、14 Web）。源影像与 DEM 哈希保持；原样裁窗、UV 北向边缘、总体流向与试验响应独立断言通过。探索页宽度检查按 `scrollWidth <= innerWidth` 判断，正常竖向滚动条占位不视为横向溢出；初次严格等宽判据已在 JSON 标注修正。

## 最后跨场景返回修正

首次冻结后，直接展示复核发现：离开冰谷再返回，镜头按钮被覆盖为模式默认镜头，播放也会被暂停。`data-glacier-mode` 同时用于视口可观察状态和三个模式按钮；原先的全页选择器把事件绑到了视口本身，点击冒泡到视口再次触发模式选择。改为只选择 `#scene-controls [data-glacier-mode]`，保留视口数据属性作为观察信号。

补验两轮“天池→冰谷→首镜头→播放→暂停”，并检查第 5 镜头与独立阶段控制，均通过。失败截图与 verification-before-event-fix.json 不覆盖；最终 verification.json 将问题放入 resolvedFailures，24 项检查通过，控制台无警告/错误。

[首次冻结档案](../checkpoints/2026-10-10-glacier-narrative/materials.json) 与 handoff-evidence.zip 保留；[最终冻结档案](../checkpoints/2026-10-10-glacier-narrative-final/materials.json) 包含本次修复与最终截图。75 秒实际录像为同一六段体验的首入场景录制，未包含返回问题；镜头、纹理与动画未因事件修复改变。
