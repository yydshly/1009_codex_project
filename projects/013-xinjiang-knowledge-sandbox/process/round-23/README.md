# R23 · 从地形进入到人的双手

本轮补充人物动作、近景显示质感与文化生活细节，保留R22的地点地图、选择记录和前后幕问题延续。旁白按用户决定后补，没有更换原音频。

实际交付影片 **10:31**，六章33段自然结束；19次飞行均抵达，29段播放语音首尾检查通过，49个音频文件与上一轮相同。运行环境：Windows、本机Codex浏览器、Node.js 22.15.0、Three.js 0.186.1、Python 3.10与FFmpeg 6.1.3。[实际画面检查](visual-review.json)记录可见变化与限制，[交付检查](delivery-checks.json)保留总库校验和站点构建输出。

- 位移控制步态、脚底支撑和停止后的收步。每帧最后的动作意图从上一帧混合，避免多个场景层反复累积动作。
- 拨弦、手鼓分别控制双手；庭院学习者在停顿后以右手回应原创拍点练习，保留纸张交接、眼神和人物发言。
- 新增下垂遮布、折叠织物、木格、陶器和家庭小用品，分别使用织物、木器、陶器显示表面。布景、纹样与服装是原创，未被标成实物或民族服饰复原。
- 冰谷、天池与冰川收支的进入使用真实局部网格的GPU坐标变换。进入、取消和抵达恢复原网格；高程与影像文件不改。新的图像亮度微弱法线是显示处理，不提供新增地形精度。
- 哈密入口先关联哈密木卡姆资料，依据[UNESCO四类区域风格记录](https://ich.unesco.org/en/RL/uyghur-muqam-of-xinjiang-00109)。动作与节奏仍是原创练习，不声称对应真实曲式或舞步。

材料入口：

- [整段实际影片](recordings/xinjiang-spatial-story.mp4)与WebM母片；[播放核验](recordings/media-verification.json)。
- [整段关键帧](complete-story-contact-sheet.jpg)、[人物与材质前后对比](physical-details-comparison.jpg)、[地形进入连续帧](terrain-arrival-contact-sheet.jpg)。
- [十项检查](checks.json)、[录制镜头核验](recorded-motion-verification.json)、[语音首尾核验](recorded-speech-verification.json)、[浏览器实际交互](browser-interaction-evidence.json)。
- `before/public`保留改动前的R22完整网页与素材；`source-recorded`保留本轮录制源文件。`after`保存实际交互截图，01与02为未完成检查时的候选状态，不代表最终冰谷画面。
- `documentation-final`保留录制后补充的独立探索手记；[逐文件清单](materials.json)与[source-and-materials.zip](source-and-materials.zip)记录原片、图片、源码与检查材料。

录制说明：第一次后台录制在家庭段附近因标签页关闭中断，相关过程截图继续保留；交付影片在当前演示页从地球入口重新完整录制，不把第一次中断的素材冒充整段成品。开发中修复了临时地形变换恢复时空morph属性引起的着色器错误；交付源码在新页面完整运行验证。

本轮不引入新的更高分辨率观测影像或DEM，不声明达到原视频全部艺术品质；可检查的改进以实际影片和交互为准。旧轮次及音频原文件继续保留。
