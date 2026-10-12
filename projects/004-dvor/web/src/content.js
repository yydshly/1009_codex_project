export const samples = [
  { file: '01-arch.jpg', title: '通道中的第一眼', description: '住宅楼通道形成画框，庭院设施、地毯架与树木共同组织初始构图。', effect: '构图 / 暖光冷影' },
  { file: '02-playground.jpg', title: '有形体的游乐场', description: '几何体构成设施与树木，卡通色带和轮廓线随 3D 视角改变。', effect: '色带 / 设施动画' },
  { file: '03-garages.jpg', title: '车库与生活痕迹', description: '简化的金属壳体、车辆、警示文字与涂鸦建立场所的生活感。', effect: '材质 / 程序纹理' },
  { file: '04-panel.jpg', title: '参数化的住宅立面', description: '重复窗格与阳台经过种子变化，颜色、框架与生活物件产生细节差异。', effect: '几何重复 / 种子变化' },
  { file: '05-tram.jpg', title: '街道上的环行电车', description: '电车沿球面环线运行，自动减速停站；车身额外使用外壳描边。', effect: '球面运动 / 外壳描边' },
  { file: '06-planet.jpg', title: '整个世界的另一面', description: '平面坐标中的场景映射到球面，远景展示小行星的完整结构。', effect: '坐标映射 / 远景' },
];

export const communityStops = [
  { id: 'entrance', title: '入口 · 先认识这里', enTitle: 'Welcome to the neighbourhood', x: 0, z: 9, height: 4.4, view: [13, 10, -5], target: [0, 2.5, 10],
    body: '柳荫里社区开放日。沿中央步道进入，左侧公告板展示活动，书屋在庭院西北侧；东侧长椅可以稍作休息。',
    enBody: 'Follow the central path. The noticeboard is on the left, the reading room is to the northwest, and shaded benches are on the east side.',
    tag: '入口识别 · 场景定位', original: '柳荫里 · 社区开放日', translation: 'Liuyinli · Community Open Day',
    context: '本地虚构社区案例；导览数据可以与真实场地的信息系统连接。' },
  { id: 'notice', title: '公告 · 今天有什么活动', enTitle: 'What is happening today?', x: -8, z: 26, height: 3.2, view: [-2, 6, 17], target: [-8, 1.8, 26],
    body: '演示活动：10:00 旧物交换，14:00 庭院故事分享。公告板保留中文，访客可以切换英文解读，并直接定位到书屋。',
    enBody: 'Demo events: a swap meet at 10:00 and courtyard stories at 14:00. Read the local notice in context, then continue to the reading room.',
    tag: '空间注释 · 中英内容', original: '今日活动：旧物交换 / 庭院故事', translation: 'Today: swap meet / courtyard stories',
    context: '时间和活动均为演示内容。双语文本由内容数据明确提供，没有调用自动翻译。' },
  { id: 'library', title: '书屋 · 找到目的地', enTitle: 'Find the neighbourhood reading room', x: -20, z: 43, height: 7.4, view: [-5, 11, 27], target: [-20, 3.8, 47],
    body: '邻里书屋的入口位于面向中央步道的一侧。演示开放时间为 09:00–18:00，临窗设置共享书架。点击地点后，镜头会移动到入口前方。',
    enBody: 'The entrance faces the central path. Demo opening hours are 09:00–18:00. Shared shelves are visible at the front of the building.',
    tag: '参数化建筑 · 地点导航', original: '邻里书屋', translation: 'Neighbourhood Reading Room',
    context: '新场景通过上游建模积木搭建，并继续使用同一套卡通材质与球面投影。' },
  { id: 'rest', title: '休息区 · 在树下停留', enTitle: 'Take a break under the trees', x: 18, z: 44, height: 3.3, view: [29, 8, 32], target: [18, 1.5, 46],
    body: '树下的长椅提供休息点。附近转盘可以实际推动，秋千会缓慢摆动；飘动的杨絮让环境拥有少量动态。路线浏览完成后，可以自由探索庭院。',
    enBody: 'Rest on a bench in the shade. Spin the nearby roundabout and watch the gently moving swing and drifting poplar fluff.',
    tag: '实例树木 · 轻量动画', original: '树荫下，慢一点', translation: 'Slow down in the shade',
    context: '导览可以加入无障碍设施和路线信息；本案例尚未对真实尺寸和通行条件做测量。' },
];

export const originalStops = [
  { id: 'arch', title: '通道 · 庭院入口', x: 0, z: 24, height: 7, view: [0.2, 1.9, 16.2], target: [2, 3.2, 49], body: '上游庭院的原始布局。走近通道墙面的俄文涂鸦，按 E 可阅读英文翻译和文化背景；也可以点击可见文字平面。', tag: '原始 Dvor 世界 · 新增轨道视角' },
  { id: 'playground', title: '游乐场 · 推动设施', x: 4.6, z: 49, height: 6, view: [13, 8, 34], target: [-1, 2, 51], body: '火箭、秋千、转盘和沙坑来自上游场景。转盘和秋千的动作由更新函数驱动；“推一把转盘”按钮直接调用场景中的真实交互动作。', tag: '上游几何与动画复现' },
  { id: 'garages', title: '车库 · 阅读生活细节', x: 25, z: 47, height: 5, view: [15, 5, 28], target: [25, 2, 47], body: '车库、车辆和俄文警示共同组成生活场景。文字由 Canvas 生成，并与翻译数据绑定。', tag: '程序纹理 · 内容热点' },
  { id: 'tram', title: '街道 · 呼叫电车', x: -22, z: 0, height: 5, view: [-14, 7, 13], target: [-22, 2.2, 0], body: '电车沿小行星赤道行驶，到站减速并停留。选中此地点会将电车呼叫到站点附近，可以观察车身的外壳描边。', tag: '球面运动 · 自动停靠' },
];
