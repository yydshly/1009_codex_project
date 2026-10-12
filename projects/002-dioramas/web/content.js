export const upstream = 'https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/';
export const upstreamImages = 'https://github.com/blendi-remade/dioramas/blob/868539fb5b64a843071a2247d5d8bacb706a07b1/public/img/index/';
// Import only the 20 small gallery images. No models or large media are requested.
const imageFiles = import.meta.glob('../assets/upstream-gallery/*.webp', { eager: true, query: '?url', import: 'default' });
export const effectPreviews = Object.fromEntries(Object.entries(imageFiles).map(([path, url]) => [path.split('/').pop().replace('.webp', ''), url]));

export { parts } from './pump-parts.js';

export const steps = {
  image: { title: '01 / 生成参考图片', text: '给生图服务一个物体描述，生成主体完整、白色背景的参考图片。脚本统一提示词后缀与输出参数。这里借用外部生图能力，仓库负责请求编排。', path: 'scripts/gen.mjs' },
  mesh: { title: '02 / 图片转 3D', text: '将一张或多张参考图交给 Meshy，生成几何与 PBR 贴图。任务 ID 写入 manifest，便于恢复已提交任务；脚本支持目标面数、对称性等参数。', path: 'scripts/gen.mjs' },
  optimize: { title: '03 / 优化素材', text: '去重、焊接顶点，按需简化几何；量化并用 meshopt 压缩，把贴图转成 WebP。优化目标是降低传输与加载成本，不能替代目标设备的实际性能测试。', path: 'scripts/optimize.mjs' },
  render: { title: '04 / 加载与渲染', text: '加载 GLB 模型，调整尺度、材质与灯光，进入持续运行的 WebGL 帧循环。共享引擎把阴影、环境遮蔽、辉光和色调映射等组合成画面。', path: 'src/core/engine.js' },
  control: { title: '05 / 更新场景状态', text: '将滚动进度、鼠标位置或点击命中转成场景状态。镜头位置、模型姿态与效果参数在关键状态间平滑插值，特殊交互由各案例独立实现。', path: 'examples/horologie/main.js' },
  compose: { title: '06 / 形成网页体验', text: '把固定的 3D 画布与 HTML 章节、文字和按钮配合起来。设计简报决定叙事，再用截图工具检查各滚动位置和移动端布局，反复调整完成作品。', path: 'docs/ENGINE.md' },
};

// Description evidence: upstream README. Checked means relevant source was read,
// not that an upstream website was executed in this project.
export const effects = [
  ['reliquary', 'Reliquary', 'story', '提灯探索暗色博物馆，拍摄文物使其亮起。', '灯光 + 拾取 + 场景状态', false],
  ['abyssal', 'Abyssal', 'story', '用滚动表现深海下潜，操纵潜水器探照灯。', '镜头路径 + 体积光', false],
  ['ember', 'Hammer & Ember', 'product', '滚动加热刀刃，点击敲击产生火花。', '材质参数 + 粒子交互', false],
  ['terrarium', 'Bell & Moss', 'nature', '擦掉玻璃罩上的凝结水。', '玻璃表现 + 擦拭遮罩', false],
  ['koi', 'Still Water', 'nature', '水面涟漪、鱼群，以及点击水面喂鱼。', '自定义水波 + 反射 + 输入', true],
  ['florae', 'Florae', 'nature', '约 20 万粒子构成花朵，变形并随交互散开。', '表面采样 + 粒子系统', false],
  ['velocity', 'Velocity Lab', 'product', '通过 X 光、热成像与 CAD 风格镜头查看鞋。', '视觉模式切换 + 着色器', false],
  ['hangar', 'Hangar Nine', 'product', '按住让机甲启动，呈现逐渐蓄能的状态。', '长按输入 + 灯光 / 材质变化', false],
  ['sucre', 'Maison Sucre', 'product', '与糕点互动，结合物理表现和产品展示。', '物理库 + 拾取 + 镜头编排', true],
  ['monolith', 'Monolith', 'product', '拖动太阳，观察建筑随光照变化的表现。', '输入映射 + 动态灯光', false],
  ['lowfreq', 'Low Frequency', 'product', '播放和搓动唱片，结合合成音频。', '指针交互 + Web Audio', false],
  ['gambit', 'Gambit', 'story', '滚动重演经典棋局，之后进入自由下棋。', '离散状态序列 + 游戏规则', false],
  ['atlas', 'Atlas of Drifting Isles', 'story', '在漂浮岛屿之间飞行与探索。', '场景切换 + 镜头路径', false],
  ['lithos', 'Lithos', 'nature', '按住打开晶洞，探索内部结晶。', '部件动画 + 内外材质', false],
  ['artemis', 'Artemis', 'story', '滚动驱动有骨骼的宇航员在月面行走。', '骨骼动画 + 滚动进度', false],
  ['keeper', 'The Keeper', 'story', '在风暴中控制灯塔光束。', '体积光 + 输入方向映射', false],
  ['koen', 'Kōen', 'nature', '围绕同一株盆景展现四季变化。', '场景主题 + 植被变化', false],
  ['nocturne', 'Nocturne', 'product', '展示香水瓶与瓶内晃动液体。', '玻璃材质 + 自定义液体表现', false],
  ['racer', 'Nightshift Motor Co.', 'product', '长按拉升雨中摩托车的转速表现。', '长按状态 + 雨景与音效', false],
  ['horologie', 'Aurel Horologie', 'product', '随滚动展开机芯，切换到零件近景。', '分件结构 + 插值 + 景深', true],
].map((item, index) => ({ slug: item[0], name: item[1], category: item[2], description: item[3], technique: item[4], checked: item[5], number: String(index + 1).padStart(2, '0') }));

export const reusable = [
  ['模型加载与规范化', 'src/core/assets.js', 'GLTFLoader / MeshoptDecoder，结合 normalize', '统一模型尺度与位置，保留资源进度；本次用程序几何替代模型文件。', '程序几何替代'],
  ['PBR + 环境光', 'src/core/engine.js', 'Three.js 材质 + 环境贴图封装', '建立一致的金属、漆面与环境反射，调整明暗关系。', '独立实现'],
  ['阴影与后期', 'src/core/engine.js', 'postprocessing / N8AO', '按设备预算组合 AO、辉光、色调映射；将效果做成可选项。', '阴影 + 色调映射'],
  ['平面反射', 'src/core/reflector.js', '项目自定义反射实现', '适用于水面、地面、展台；注意额外渲染开销。', '尚未加入'],
  ['体积光与程序纹理', 'src/core/volumetric.js', '自定义射线步进 / GPU 纹理生成', '用于雾中光束、灯塔与舞台；适合进一步研究着色器。', '尚未加入'],
  ['输入与射线拾取', 'src/core/input.js', '指针封装 + 案例中的 Raycaster', '把 3D 命中映射到稳定部件 ID 与内容说明。', '独立实现'],
  ['关键状态插值', 'examples/horologie/main.js', '镜头 / 分件状态插值；GSAP / Lenis', '将产品、结构、原理设为关键状态；本次使用按钮和滑块驱动。', '独立实现'],
  ['动态粒子 / 水面', 'examples/koi/main.js', '案例自定义模拟和材质', '给教学场景添加动态说明；物理意义需独立验证。', '路径粒子示意'],
  ['截图评审', 'scripts/review.mjs', 'Playwright + Sharp', '按交互阶段截图，检查布局、报错和关键状态。', '浏览器验证'],
];
