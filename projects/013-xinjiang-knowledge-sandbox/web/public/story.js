// Narrative shots are independent of real data. Cameras use display units.
export { erosionHeight } from './landscape.js';
export const catalog = {
  journey:{category:'model',short:'独立荒漠实验',note:'原创动画 · 无历史行程归属 · 已移出历史导演'},
  earth: { category: 'geography', short: '地球上的新疆', note: 'NASA Blue Marble · 真实影像 / 定位轮廓示意' },
  terrain: { category: 'geography', short: '三山与两盆', note: 'NASA 影像 × 真实 DEM · 高度夸张 / 彩色范围为定位示意' },
  history: { category: 'geography', short: '沿绿洲穿行', note: '真实地形 · 丝路廊道为教学示意' },
  local: { category: 'local', short: '天山天池', note: 'Contains modified Copernicus Sentinel data 2024 · 10 m / 09.04 × 真实 DEM' },
  ecology: { category: 'local', short: '山地里的生命', note: '真实区域地形 · 保护地点光圈为示意' },
  karez: { category: 'model', short: '坎儿井', note: '程序教学模型 · 坡降、井筒、地下水路' },
  yardang: { category: 'model', short: '雅丹的形成', note: '程序教学模型 · 风沙与地貌演变示意' },
  migration: { category: 'geography', short: '锡伯族西迁', note: '1764—1765 · 迁移方向示意' },
  glacier: { category: 'local', short: '冰谷里的时间', note: 'Contains modified Copernicus Sentinel data 2023 · 10 m / 08.31 × 真实 DEM' },
};
export const stories = {
  earth: [
    { label: '经纬位置', heading: '先在地球上找到它。', text: '转向欧亚大陆，新疆位于中国西北。红色轮廓帮助定位，接下来从星球走进这片土地。', globe: [83, 30, 11.4], layer: 'position' },
    { label: '五带与纬度', heading: '同一条纬线，跨过不同环境。', text: '金色参考纬线经过中纬度地区。纬度影响太阳照射，也为理解温带环境提供一个起点。', globe: [83, 12, 12.3], layer: 'latitude' },
    { label: '大陆腹地', heading: '离海很远。', text: '拉远一点，观察欧亚大陆。新疆处在大陆内部，地理位置与山脉共同影响水汽到达的方式。', globe: [74, 36, 14], layer: 'inland' },
    { label: '西风的方向', heading: '沿着西风，理解水汽的方向。', text: '青色流线从西向东跨过中纬度区域。这是方向示意，帮助观察山地与来水的关系。', globe: [67, 40, 11.8], layer: 'wind' },
    { label: '丝绸之路', heading: '从内陆，连接东西。', text: '地理上的内陆，也可以成为交流的通道。点击下一场景，进入三山与两盆的地形。', globe: [83, 36, 10.8], layer: 'connections' },
  ],
  terrain: [
    { label: '三山骨架', heading: '三条山系，构成地形骨架。', text: '北部阿尔泰山、中部天山、南部昆仑山。真实高程与卫星合成影像，让山脊和盆地同时可见。', camera: [4, 8.5, 17], target: [0, .8, 0], framing:'wide' },
    { label: '两大盆地', heading: '山脉之间，是广阔的盆地。', text: '天山把准噶尔盆地与塔里木盆地分开。换一个低一些的视角，观察盆地边缘和山地的落差。', camera: [-3, 7.5, 13], target: [0, .7, 1] },
    { label: '绿洲与来水', heading: '城市，常常靠近山地与水。', text: '选择乌鲁木齐、吐鲁番、喀什或伊宁，查看它们的位置。显示高度可以放大，原始海拔读数仍保留真实米数。', camera: [8, 8, 11], target: [2, .8, -.5] },
    { label: '走进天山', heading: '由区域，走进一片山地。', text: '定位天山天池，点击标记进入局部。区域与局部加载不同的高程网格，让同一个地点有不同的观察尺度。', camera: [8, 5, 8], target: [2.6, .8, -.6] },
  ],
  history: [
    { label: '绿洲网络', heading: '丝绸之路，是一张网络。', text: '先把五个现代定位点放回地形。这条南缘廊道演示沿绿洲联系的空间概念。', camera: [4, 12, 15], target: [0, .7, 0], route: 0 },
    { label: '盆地东南缘', heading: '从敦煌，走向若羌。', text: '金色路径逐步显现，移动光点串起地点。曲线是教学插值，不代表某支历史队伍的真实行程。', camera: [10, 8, 12], target: [3, .4, 1], route: 30 },
    { label: '昆仑山北麓', heading: '沿山前绿洲向西。', text: '观察和田与莎车一带的地理背景：山地、来水和盆地边缘，为交通廊道提供空间条件。', camera: [-6, 8, 12], target: [-2, .7, 2], route: 72 },
    { label: '汇合于喀什', heading: '走到盆地西缘。', text: '在喀什结束这段教学行程。你可以拖动进度或重新播放，让路线、地点与文字一起变化。', camera: [-9, 9, 14], target: [-3, .5, 1], route: 100 },
  ],
  local: [
    { label: '天山中的湖', heading: '从沙盘，走进湖泊。', text: '2024 年 9 月 4 日的真实卫星影像，沿坐标贴合山地。湖水、森林、裸岩与山脊，在同一片地形上相遇。', camera: [8, 13, 18], target: [-.6, 2.0, 1.8] },
    { label: '山脊与沟谷', heading: '湖泊，被山地环抱。', text: '换到山谷另一侧，观察山脊、沟谷与湖泊。纹理来自原始 10 米的 Sentinel-2 观测，山体起伏来自独立高程数据。', camera: [-10, 13, 17], target: [-.5, 2.5, .6] },
    { label: '集水的方向', heading: '山地的水，沿沟谷汇聚。', text: '青色动画示意从山坡向湖泊汇流。它解释空间关系，没有计算真实径流或水量。', camera: [0, 21, 12], target: [0, 2.4, 0], water: true },
    { label: '自由环视', heading: '同一地点，换一个观察角度。', text: '回到真实影像，旋转观察湖岸与林地。高度夸张改变显示起伏，纹理与高程的地理位置保持对齐。', camera: [15, 12, -12], target: [0, 2.5, 0] },
  ],
  ecology: [
    { label: '生境的梯度', heading: '山地，也是一种生态骨架。', text: '把保护地点放到地形里，观察冰雪山地、森林与干旱荒漠的位置关系。绿色光圈只提示地点。', camera: [4, 11, 15], target: [0, .8, 0] },
    { label: '喀纳斯山地', heading: '森林、冰湖与山谷。', text: '喀纳斯位于阿尔泰山地。地形与水系相联系，形成森林、草甸与湖泊相映的环境。', camera: [7, 8, 4], target: [2, .8, -3.4] },
    { label: '托木尔峰', heading: '高山冰雪，与山下来水。', text: '向天山西段移动，观察山地的高度与盆地的位置。光圈没有表示保护区的法定边界。', camera: [-7, 8, 11], target: [-2.5, .9, -.3] },
    { label: '荒漠的生命', heading: '在干旱环境里，寻找生境。', text: '转向准噶尔盆地东部的卡拉麦里一带。不同的地形与环境，容纳不同的生命。', camera: [10, 8, 8], target: [3, .3, -1.5] },
  ],
  karez: [
    { label: '地表与地下', heading: '先把地下的结构展开。', text: '打开剖面，沿着坡地看母井、竖井、暗渠与出口。这个教学模型让看不见的水路变得可见。', camera: [8, 8, 18], target: [0, 1.3, 0], cut: true, framing:'wide' },
    { label: '母井与竖井', heading: '从含水层取水。', text: '母井连接地下含水层，沿线竖井为施工和维护提供通道。观察井深随地表坡度如何变化。', camera: [-9, 6, 13], target: [-3, 1.7, 0], cut: true },
    { label: '暗渠输水', heading: '借助落差，水向低处流动。', text: '青色粒子沿暗渠移动。地下输水减少地表暴露，动画强度只控制视觉，不是实际流量。', camera: [0, 5, 15], target: [0, .8, .4], cut: true },
    { label: '绿洲与利用', heading: '水，从地下走向地面。', text: '明渠与水池连接到耕地。关闭剖面看地表，再打开剖面对照完整的水路。', camera: [13, 9, 12], target: [3, .6, 0], cut: false },
  ],
  yardang: [
    { label: '沉积地表', heading: '先有一片沉积地表。', text: '地表有细小起伏与裂隙。这个程序模型把地貌演变压缩成几个可观察的阶段。', camera: [8, 8, 17], target: [0, .65, 0], erosion: 0, framing:'wide' },
    { label: '侵蚀沟槽', heading: '沿薄弱部位，形成沟槽。', text: '风蚀与雨水冲刷可以共同改变地表。移动滑块，观察沟槽加深、台地开始分离。', camera: [5, 8, 13], target: [0, .5, 0], erosion: 35 },
    { label: '土垄与残丘', heading: '连续地表，变成长形土台。', text: '较软部位被侵蚀，较坚实部分留下。长形垄脊与沟槽构成雅丹地貌的直观特征。', camera: [-8, 6, 12], target: [0, .6, 0], erosion: 75 },
    { label: '风的方向', heading: '观察形态与风向的关系。', text: '沙粒沿着风向移动，土台沿模型设定的方向排列。这是概念动画，没有真实侵蚀速率或年代。', camera: [10, 5, 10], target: [0, .5, 0], erosion: 100 },
  ],
  migration: [
    { label: '1764 · 启程', heading: '从盛京一带出发。', text: '1764 年，锡伯官兵与家属启程向西。地球上的两个地点，连接起东北与伊犁。', globe: [109, 38, 11.8], migration: 0 },
    { label: '蒙古高原', heading: '跨过高原，向西行进。', text: '光点沿弧线向西移动。蒙古高原是概念中间节点，整条弧线表示方向，不是逐站考证的历史道路。', globe: [101, 43, 11.6], migration: 50 },
    { label: '1765 · 伊犁', heading: '抵达伊犁。', text: '1765 年抵达伊犁，迁移让历史、人群与地域发生联系。路线动画让这段叙事有了空间位置。', globe: [90, 40, 10.9], migration: 100 },
  ],
  glacier: [
    { label:'山地坐标', heading:'在天山，找到一段冰谷。', text:'从新疆中部的天山进入乌鲁木齐一号冰川附近。这个约 5.7 公里的窗口保留原始高程采样，把注意力留给冰雪、山脊与沟谷。', camera:[8,11,-17],target:[0,1.8,0],retreat:0,framing:'wide',mode:'observation',duration:10 },
    { label:'进入冰谷', heading:'沿着岩壁，走近冰雪。', text:'镜头进入谷地。白色冰雪、褐色裸岩与冰碛纹理由 2023 年 8 月 31 日的卫星观测提供；光照与高度夸张帮助阅读山体。',camera:[-6.1,7,-10.8],target:[-.8,2.3,0],retreat:0,mode:'observation',duration:11 },
    { label:'缓慢流动', heading:'冰川，也是一条缓慢的河。',text:'开启教学冰体，光点沿两条概念路径向较低处移动。方向借助真实高程检查，路径、冰体边界与速度均为示意。',camera:[-9,10,13],target:[-.5,2.3,-.2],retreat:0,teaching:true,mode:'flow',duration:12 },
    { label:'改变条件', heading:'留下的冰，取决于收支。',text:'积累补充冰雪，消融带走质量。这里设置“消融较强”的试验，示意冰体缓慢收缩。你可以调整右侧强度，接管这段推演。',camera:[7,11,12],target:[-.3,2.4,-.5],retreat:0,teaching:true,mode:'experiment',duration:14 },
    { label:'前后对照',heading:'边缘后退，山谷仍在。',text:'保留初始教学轮廓，观察收缩后的覆盖。退缩表示边缘位置改变，冰体仍可以向下流动；底图始终保持同一天的真实观测。',camera:[0,24,-6],target:[0,2,0],retreat:85,teaching:true,mode:'flow',duration:11 },
    { label:'回到证据',heading:'把问题交给真实观测。',text:'关闭教学图层，回到真实地表。单景影像能展示冰谷，判断历年变化还需要多期边界和长期观测。现在可以自由绕行，或打开探索手记了解我们如何选景。',camera:[11,13,-17],target:[0,2,0],retreat:85,mode:'observation',duration:10 },
  ],
};

// Hold the opening pose, develop the process, then leave time to read the result.
for(const [key,shots] of Object.entries(stories))for(const [index,shot] of shots.entries())shot.duration??=['yardang','karez'].includes(key)?10:index===0?9:8;
// Both timelines deliberately omit calendar interpolation: their phases are illustrative.
export const phaseLabel = value => value < 25 ? '初始阶段' : value < 60 ? '变化阶段' : value < 90 ? '后期阶段' : '对照阶段';

stories.journey=[{label:'独立动画',heading:'原创荒漠动画实验',duration:12,text:'行走、风沙与停留',camera:[-18,8,17],target:[-25,1,0],framing:'close'}];
