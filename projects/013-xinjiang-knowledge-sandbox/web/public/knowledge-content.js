// Editorial learning structure. Modern coordinates orient the reader;
// historical relationships never imply surveyed routes or administrative borders.
export const knowledgeSources={
 overview:{title:'新疆政府 · 地理与历史概况（2022）',url:'https://www.xinjiang.gov.cn/xinjiang/c112848/xjsghdf.shtml'},
 history:{title:'新疆自然资源厅 · 历史问题资料（2019）',url:'https://zrzyt.xinjiang.gov.cn/xjgtzy/djgzxx/201910/d13245bdb7b84c1f9c003d3ed82f5b42.shtml'},
 archaeology:{title:'中国社会科学网 · 小河墓地考古研究',url:'https://www.cssn.cn/kgxc/kgxc_kgxl/202304/t20230407_5618618.shtml'},
 tang:{title:'新疆文旅厅 · 唐朝墩遗址年代与建筑',url:'https://wlt.xinjiang.gov.cn/wlt/gzdt/202212/ce818e5660e244d0bd557043ef928f50.shtml'},
 silk:{title:'UNESCO · 长安—天山廊道',url:'https://whc.unesco.org/en/list/1442/'},
 xibe:{title:'国家民委 · 锡伯族历史沿革',url:'https://www.neac.gov.cn/seac/ztzl/201806/1067551.shtml'},
 archaeologyHan:{title:'新疆文旅厅 · 乌垒与北庭考古',url:'https://wlt.xinjiang.gov.cn/wlt/mtbd/202303/2c41806b10f84069bbbe1adb542db056.shtml'},
 standard:{title:'自然资源厅 · 标准地图发布与获取',url:'https://zrzyt.xinjiang.gov.cn/xjgtzy/gzdt/202309/a3c073d3cdca43309cdd43e2ad6b422d.shtml'},
 muqam:{title:'UNESCO · 新疆维吾尔木卡姆艺术',url:'https://ich.unesco.org/en/RL/uyghur-muqam-of-xinjiang-00109'}
 ,water:{title:'新疆水利厅 · 河流与山地水系（2023）',url:'https://slt.xinjiang.gov.cn/xjslt/c114428/202309/a90332286c0c4dcaa0305131e18bb01c.shtml'},
 climate:{title:'气象学报 · 阿克苏降水的环流与地形研究（2019）',url:'https://html.rhhz.net/qxxb_cn/html/2019040.htm'}
};
export const knowledgeStages=[
 {id:'world',label:'地球与方位',title:'先知道，新疆在哪里',question:'先看欧亚大陆，再找中国西北。',intro:'地球帮助理解方位与远近。新疆位于欧亚大陆内陆、中国西北部；进入区域地图后，观察的尺度会缩小。'},
 {id:'map',label:'新疆全域',title:'山河之间，找到探索的线索',question:'选一处山地、流域或通道，再进入它关联的历史与地点。',intro:'点地图对象或右侧名称，镜头、取样线与下一步入口会一起变化。拖动与缩放始终可用。'},
 {id:'history',label:'历史脉络',title:'把地点放回它的时代',question:'这个时代发生了什么？留下哪些证据？',intro:'从史前到现代按八段组织重要线索。每段都有关注问题、地域参照和资料依据；可以按顺序读，也可以直接选时代。'},
 {id:'place',label:'地点与模型',title:'带着问题，走进地点',question:'先理解来由，再用模型观察具体机制。',intro:'同一个地点可以连接自然、历史和生活。先在地图上定位，再进入模型；返回后继续比较其他地点。'}
];
export const worldLessons=[
 {id:'position',label:'大陆与方位',title:'在欧亚大陆，找到中国西北',text:'先辨大洲与海洋，再靠近中国西北的新疆。洲名分色、国家细线与金色新疆范围帮助区分尺度；放大后城市与山河标注接着出现。',task:'比较亚洲、欧洲、非洲与印度洋的位置；找到金色新疆范围，再进入区域地图。',sources:['overview']},
 {id:'neighbors',label:'周边关系',title:'一个内陆地区，怎样连接周边？',text:'新疆国内与甘肃、青海、西藏相邻，周边与八个国家接壤。球面叠加现代国家与地区轮廓，点击名称会高亮范围；结合山地位置理解相邻关系。',task:'选择一个邻国，观察它与新疆的相对方向。',sources:['overview']},
 {id:'relief',label:'山地与盆地',title:'在球面影像上，先辨三山两盆',text:'阿尔泰山、天山、昆仑山与两个盆地构成下一层的地形骨架。球面山系线为位置示意，详细高程在区域地图中继续观察。',task:'点天山或盆地标记，进入真实区域高程地图。',sources:['overview']},
 {id:'coordinates',label:'经纬定位',title:'用经纬度，确认位置',text:'观察纬线与经线在乌鲁木齐相交：北纬约43.82°、东经约87.62°。转动地球后坐标保持不变，屏幕左右会变化。',task:'观察纬线的东西延伸与经线的南北延伸。',sources:[]},
 {id:'connections',label:'距离与联系',title:'从同一个城市，比较远近',text:'以乌鲁木齐为起点，比较五个现代城市。弧线只比较两点的球面距离，不表示历史行程、交通路线或实际出行里程。',task:'切换北京与阿拉木图，再看大陆西侧城市。',sources:[]},
 {id:'scale',label:'整体到局部',title:'逐层靠近，每层回答一个问题',text:'地球建立整体位置，靠近新疆辨认地形骨架，区域地图观察山地、聚落与历史线索。继续进入地点，才用模型观察结构和人的动作。',task:'依次选择地球全景、欧亚大陆、靠近新疆，再进入全域地图。',sources:[]}
 ,{id:'climate',label:'西风与内陆',title:'远离海洋，仍有水汽与来水',text:'偏西气流、天气系统和山地共同参与新疆的降水过程。把西侧方向、大陆内部与山地分开观察，再去区域地图看河谷与低地。',task:'拖动进程，看青色气流带逐段靠近新疆。',sources:['climate','water']},
 {id:'exchange',label:'大陆与交流',title:'从内陆位置，转向历史联系',text:'丝路是跨越多个地区的路线网络；城镇、补给和交流共同参与。金线用现代地域参照建立方位，历史事件在下一层分别展开。',task:'观察东西联系，再进入新疆地图看通道与绿洲。',sources:['silk']}
];
export const mapLessons=[
 {id:'relief',label:'地形骨架',title:'三山夹两盆',text:'从北到南依次认识阿尔泰山、准噶尔盆地、天山、塔里木盆地与昆仑山。天山是理解南北位置的骨架；塔克拉玛干沙漠位于塔里木盆地内。高程经过显示夸张，画面坡度不能代替实际坡度或通行判断。',task:'切换俯视与侧视，指出天山两侧分别是哪一个盆地。',sources:['overview'],points:[['阿尔泰山',88.1,47.6],['准噶尔盆地',86.7,45.6],['天山',83.6,42.75],['塔里木盆地',83.4,39.2],['昆仑山',80.4,36.2]],lines:[]},
 {id:'water',label:'水与绿洲',title:'水系不同，生活联系也不同',text:'在塔里木盆地和伊犁河谷分别观察山地与低地。来水、地形和用水工程共同影响聚落；这些区域不构成同一条连续水路。蓝线仅表示水系位置关系，不是河道测绘。',task:'点击吐鲁番，继续问：地下输水为什么要有竖井与暗渠？',sources:['overview','silk'],points:[['伊犁河谷',81.32,43.92],['塔里木河流域',83.8,41],['吐鲁番',89.19,42.95]],lines:[[[83.7,43.4],[82.8,43.65],[81.3,43.9],[80.45,44.1]],[[80.2,40.7],[82,41],[83.8,41],[85.8,40.8],[87.4,40.6],[88.3,39.9]]]},
 {id:'cities',label:'城市与区域',title:'先认识位置，再看行政地图',text:'全域定位图列出主要城市参照，帮助认识东、西、南、北。城市点不能代替行政区划面；完整政区名称与界线请对照官方标准地图。',task:'先找首府乌鲁木齐，再比较喀什、伊宁、哈密与和田的位置。',sources:['overview','standard'],points:[['乌鲁木齐',87.62,43.82],['喀什',75.99,39.47],['伊宁',81.32,43.92],['哈密',93.51,42.82],['和田',79.92,37.12]],lines:[]},
 {id:'corridors',label:'通道与历史',title:'从山河条件，进入历史线索',text:'先比较天山南侧与伊犁河谷的位置联系，再分别进入秦汉交流与清代西迁。线条是现代位置之间的教学观察线，不是古代道路测绘。',task:'沿取样线比较地表起伏，选择相关时代后操作事件。',sources:['silk','xibe'],points:[],lines:[]}
];
export const referenceCities=[
 ['乌鲁木齐',87.62,43.82],['克拉玛依',84.89,45.58],['吐鲁番',89.19,42.95],['哈密',93.51,42.82],
 ['昌吉',87.31,44.02],['博乐',82.07,44.9],['库尔勒',86.17,41.77],['阿克苏',80.26,41.17],
 ['阿图什',76.17,39.72],['喀什',75.99,39.47],['和田',79.92,37.12],['伊宁',81.32,43.92],
 ['塔城',82.98,46.75],['阿勒泰',88.14,47.85]
];
export const historicalPeriods=[
 {id:'early',label:'史前',date:'有文字记录以前',title:'历史从考古证据开始',background:'在出使和王朝机构出现以前，这片区域已经有人类活动。考古帮助理解环境、食物与生活方式。',change:'小河墓地等遗存提供研究古代人群生活的材料；现有证据仍有取样与解释范围。',impact:'先理解人怎样适应环境，再看后来的交通与聚落。不能把古代考古人群直接等同于今天的某个民族。',question:'我们怎样从遗物认识过去，而不是替过去编故事？',sources:['archaeology'],points:[['罗布泊地区 · 小河研究参照',88.6,40.4]],lines:[],place:'yardang',linkLabel:'比较干旱环境（跨时期延伸）'},
 {id:'han',label:'秦汉',date:'前138年 / 前60年',title:'外交往来与历史机构',background:'汉代出使与西域地方城镇之间的联系，需要放回欧亚大陆、山地和盆地来理解。',change:'前138年张骞出使；前60年西汉设西域都护，治所在乌垒。准确遗址位置仍有考古研究。',impact:'从外交活动和机构设置切入，继续观察跨时期的交流网络。丝路有多条线路，教学廊道不是张骞考证行程。',question:'出使、机构和长期交流，各自说明什么？',sources:['overview','archaeologyHan','silk'],points:[['敦煌 · 方向参照',94.66,40.14],['轮台地区 · 乌垒研究参照',84.25,41.78],['喀什 · 交流观察',75.99,39.47]],lines:[[[94.66,40.14],[88.17,39.02],[79.92,37.12],[75.99,39.47]]],event:'zhang',secondEvent:'protectorate',place:'kashgar',linkLabel:'走近交流与补给'},
 {id:'weijin',label:'魏晋南北朝',date:'3—6世纪',title:'吐鲁番与城镇历史',background:'时代更替时，要关注同一个盆地里的地方城镇与制度变化，而不是把当前地名直接当作古代城市。',change:'327年设高昌郡；460—640年吐鲁番盆地有高昌国。不同年代需要分别认识。',impact:'城镇遗存与文献成为观察人口往来、生活和文化的入口；地下水路模型只比较工程原理，不作为年代证据。',question:'同一个地点，在不同年代会有哪些变化？',sources:['history'],points:[['吐鲁番盆地 · 高昌方向',89.19,42.95]],lines:[],place:'turpan',linkLabel:'走近盆地与用水（机制延伸）'},
 {id:'tang',label:'隋唐',date:'6—9世纪',title:'机构、交通与城镇生活',background:'天山南北的机构与交通联系，需要结合地方城镇一起读。',change:'唐代先后设置安西与北庭都护府。唐朝墩遗址的院落、浴场与宗教建筑提供具体生活证据。',impact:'城镇不仅是交通点，也承载生活与文化交流。唐朝墩沿用至后来的高昌回鹘、西辽和元代，不能把各期建筑合成一个唐代场景。',question:'从城门、院落与浴场，我们能分别读出什么？',sources:['history','tang'],points:[['库车地区 · 龟兹参照',82.96,41.72],['吉木萨尔 · 北庭参照',89.18,44.0],['奇台 · 唐朝墩参照',89.59,44.02]],lines:[],place:'turpan',linkLabel:'比较城镇用水（异地机制延伸）'},
 {id:'songyuan',label:'五代宋辽金元',date:'10—14世纪',title:'多中心的往来与文化',background:'新疆历史并非始终只有一个中心。吐鲁番、喀什等地区应放在各自时代的关系中观察。',change:'可从高昌回鹘、喀喇汗、西辽与元代等线索认识地方政权及文化往来；这是一组连续时期，并非它们同时存在。',impact:'UNESCO记述长安—天山廊道在6—14世纪繁盛。贸易、文化与城镇生活相互关联，集市模型是概念观察入口。',question:'除了货物，沿通道往来的还有哪些知识与生活经验？',sources:['history','silk','tang'],points:[['吐鲁番 · 地域参照',89.19,42.95],['喀什 · 地域参照',75.99,39.47]],lines:[],place:'kashgar',linkLabel:'比较交换活动（跨时期情境）'},
 {id:'ming',label:'明代',date:'14—17世纪',title:'东侧入口与哈密',background:'把河西走廊与新疆东部放在一起读，认识哈密在区域联系中的位置。',change:'明代设哈密卫，相关资料也记述嘉峪关与哈密之间的卫所联系。',impact:'交通组织与地方生活可以分别研究。今天的哈密木卡姆资料提供文化延伸，不能直接套作明代同一场演出。',question:'地理入口长期存在，但它的组织与生活会怎样改变？',sources:['history','muqam'],points:[['哈密 · 现代地域参照',93.51,42.82],['敦煌 · 东侧参照',94.66,40.14]],lines:[[[94.66,40.14],[93.51,42.82]]],place:'hami',linkLabel:'走近当代文化传习（跨时期延伸）'},
 {id:'qing',label:'清代',date:'1762 / 1764—1766 / 1884',title:'制度安排、迁移与地方生活',background:'制度变化与具体家庭的远行，可以在不同尺度上相互对照。',change:'1762年设伊犁将军；1764年锡伯官兵与家属西迁，1765年抵达伊犁，随后安置；1884年新疆建省。',impact:'迁移带来安顿、开垦与文化记忆的问题。西迁、安置和之后的修渠须区分年代，不能一次动画表示同时完成。',question:'宏观安排怎样进入家庭的准备、抵达与生活？',sources:['history','xibe','overview'],points:[['伊犁 · 伊宁参照',81.32,43.92],['察布查尔 · 安置参照',81.14,43.84],['乌鲁木齐 · 今名参照',87.62,43.82]],lines:[],event:'xibe',place:'qabqal',linkLabel:'走近安顿与家庭'},
 {id:'modern',label:'近现代',date:'1912 / 1949 / 1955',title:'从历史沿革看今日新疆',background:'用明确年代连接历史沿革与今天的地域认识，避免把今日行政结构倒套到古代。',change:'1912年进入民国时期；1949年新疆和平解放；1955年10月1日新疆维吾尔自治区成立，首府为乌鲁木齐。',impact:'继续观察今日城市、文化传习、交通与公共服务。霍尔果斯模型是原创协作情境，不代表真实制度或政策成效。',question:'哪些是历史节点，哪些是今天可以观察的问题？',sources:['history','overview'],points:[['乌鲁木齐 · 首府',87.62,43.82],['霍尔果斯 · 当代观察',80.42,44.2],['哈密 · 文化观察',93.51,42.82]],lines:[],place:'horgos',linkLabel:'走近当代协作情境'}
];
export const learningPlaces=[
 {id:'turpan',name:'吐鲁番',lon:89.19,lat:42.95,title:'聚落怎样获得水？',why:'从盆地地形、城镇生存与用水需要进入这里。',see:'展开地下水路，改变来水与维护条件，记录下游变化；再走到地面用水，比较绿洲中的生活与往来。',scope:'通用坎儿井结构，不指定某口井的年代；不归因于张骞出使。维护和用水响应为原创教学试验，非水文模拟。',model:'karez',sources:['silk'],action:'操作地下水路'},
 {id:'kashgar',name:'喀什',lon:75.99,lat:39.47,title:'往来怎样变成交换？',why:'从盆地西侧位置、交流网络与补给需要进入这里。',see:'集市情境里比较织物、补给与器物的用途，观察人物回应。',scope:'人物、货物和集市为原创教学情境，不复原某个古代市场。',model:'market',sources:['silk'],action:'进入交换情境'},
 {id:'qabqal',name:'察布查尔',lon:81.14,lat:43.84,title:'远行之后，怎样安顿？',why:'从锡伯西迁的抵达和安置线索进入伊犁河谷。',see:'观察家庭的准备、安顿、引水和记忆交接。',scope:'原创建构的历史主题家庭；不对应真实家庭、街区或灌渠测绘。',model:'people',sources:['xibe'],action:'进入家庭情境'},
 {id:'hami',name:'哈密',lon:93.51,lat:42.82,title:'文化怎样在参与中延续？',why:'从新疆东部位置进入当代文化传习问题。',see:'观察、示范与学习反馈，对照木卡姆资料的区域差异。',scope:'原创练习动画和声音，不是历史演出或真实木卡姆曲式复原。',model:'culture',sources:['muqam'],action:'进入传习情境'},
 {id:'horgos',name:'霍尔果斯',lon:80.42,lat:44.2,title:'通行与生活怎样协调？',why:'从西部位置进入当代交通与公共空间问题。',see:'操作车队、等待和绿地安排，观察不同需求的回应。',scope:'原创公共空间协作情境；参数不代表真实关口程序。',model:'logistics',sources:['overview'],action:'进入协作情境'},
 {id:'glacier',name:'一号冰川',lon:86.817,lat:43.1,title:'山地冰雪怎样变化？',why:'从天山与低地的空间关系进入局部自然观测。',see:'查看固定日期的局部影像与地形，比较教学冰体变化。',scope:'真实观测底座与教学动画分别标注；不表示实测年度变化。',model:'glacier',sources:[],action:'观察冰谷与冰体'},
 {id:'yardang',name:'雅丹原理',lon:90,lat:40.3,title:'风怎样塑造干旱地貌？',why:'从干旱环境问题进入风蚀机理；与史前考古作环境比较。',see:'旋转通用地貌模型，观察侵蚀阶段。',scope:'现代定位为入口参照，不是小河墓地实测环境或遗址模型。',model:'yardang',sources:[],action:'观察风蚀机理'},
 {id:'luntai',name:'轮台地区',lon:84.25,lat:41.78,title:'机构怎样放回地方空间？',why:'从西域都护设立，进入乌垒研究的地域背景。',see:'选中城门、通道、围墙与内部空间，展开屋盖比较空间组织。',scope:'现代轮台是地域参照，不是乌垒遗址坐标；结构为抽象示意，不复原古城。',model:'structure',sources:['archaeologyHan'],action:'展开抽象空间结构'}
];
export function selectedKnowledge(items,id){return items.find(item=>item.id===id)??items[0];}
