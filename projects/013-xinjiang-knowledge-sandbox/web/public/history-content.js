// Historical claims have individual sources. Coordinates are modern orientation references.
export const historyEvents = [
 {id:'zhang',date:'公元前2世纪',title:'张骞出使西域',short:'出使与交流',question:'一次出使，怎样把新疆放进更大的交流网络？',summary:'汉代的外交探索成为理解欧亚交流的重要线索。先读山地、盆地与通道，再对照跨时期的绿洲网络。',facts:['张骞出使西域是外交活动，也是欧亚交流史的重要事件。','丝路逐渐形成多条相互连接的路线；不应把它画成一条恒定道路。'],source:{title:'UNESCO · 长安—天山廊道',url:'https://whc.unesco.org/en/list/1442/',scope:'支持外交使命与欧亚交流背景；不证明本地廊道是张骞逐站行程。'},phases:[{label:'背景',text:'汉代外交探索置于欧亚内陆背景。东侧入口先显现，山地与盆地保持作为空间参照。'},{label:'过程',text:'金色廊道逐段展开，队伍沿线推进。用来观察通行条件，不是张骞逐站行程，也不以商队代指使团。'},{label:'影响',text:'绿色连接展开，喀什侧出现交换空间。表示跨时期形成的交流网络，不把长期贸易变化归因于一次出使。'}],nodes:[
  {id:'dunhuang',name:'敦煌 · 东侧参照',lon:94.66,lat:40.14,role:'区域定位参照',text:'以河西走廊西端的现代城市位置认识盆地东侧入口，不表示张骞在此停驻。',models:[['history','观察绿洲廊道','教学路线，非出使行程']]},
  {id:'kashgar',name:'喀什 · 西侧参照',lon:75.99,lat:39.47,role:'区域定位参照',text:'在盆地西缘观察通道与绿洲。集市模型用于理解交换活动，人物与货物是原创情境。',models:[['history','观察绿洲廊道','跨时期概念'],['market','进入交换情境','原创教学情境']]},
  {id:'turpan',name:'吐鲁番 · 绿洲延伸',lon:89.19,lat:42.95,role:'延伸观察，不是事件停驻点',text:'把交通话题延伸到绿洲生活与工程结构。通用坎儿井模型没有指定历史建造年代。',models:[['karez','展开地下水路','通用结构示意'],['oasis','观察用水活动','原创教学情境']]}
 ],corridor:[[94.66,40.14],[88.17,39.02],[79.92,37.12],[77.24,38.42],[75.99,39.47]],lineLabel:'盆地南缘教学廊道 · 非张骞行程'},
 {id:'protectorate',date:'公元前60年',title:'西域都护设立',short:'机构与地方',question:'历史机构的位置，怎样放回山地、盆地与城镇之间？',summary:'西汉在乌垒设西域都护。先定位轮台地区，再用抽象结构观察城门、道路与内部空间怎样组织联系。',facts:['公元前60年，西汉设立西域都护，治所在乌垒。','乌垒治所的准确位置仍在考古研究中；现代轮台参照点不等于遗址坐标。'],source:{title:'新疆文旅厅 · 2022年考古综述',url:'https://wlt.xinjiang.gov.cn/wlt/mtbd/202303/2c41806b10f84069bbbe1adb542db056.shtml',scope:'支持设立年代、乌垒与考古研究背景；结构模型不依据遗址测绘。'},phases:[{label:'背景',text:'天山南侧已有地方城镇与通行空间。底座表示背景；建筑显现解释机构空间，不表示前60年才开始建城。'},{label:'过程',text:'公元前60年设立西域都护。城门、通道与内部空间逐步显现，帮助理解机构在地方空间中怎样组织联系。'},{label:'影响',text:'联络线与往来人员展开，表达机构与地方联系这一教学问题。没有绘制辖境；乌垒位置和建筑布局仍需考古依据。'}],nodes:[
  {id:'luntai',name:'轮台地区 · 定位参照',lon:84.25,lat:41.78,role:'现代地域参照，非乌垒遗址坐标',text:'在天山南侧、盆地北缘读位置。结构模型仅解释入口、道路和内部空间，不复原西域都护府建筑。',models:[['structure','观察空间结构','抽象城址示意 · 非遗址复原']]}
 ],corridor:[],lineLabel:'定位参照 · 未绘历史管辖边界'},
 {id:'xibe',date:'1764—1766',title:'锡伯西迁与安置',short:'远行与生活',question:'一次跨越大陆的迁移，怎样连接制度安排、家庭与地方生活？',summary:'从盛京启程、抵达伊犁，再到察布查尔安置。全球方向、区域地点和生活模型共同帮助理解不同尺度。',facts:['1764年锡伯官兵与家属从盛京一带启程，1765年抵达伊犁。','1766年迁居察布查尔；史料记述之后的修渠与开垦。'],additionalSources:[{title:'新疆档案馆 · 屯戍边陲的锡伯营',url:'https://www.xjaa.gov.cn/content/21/522.html'},{title:'新疆财政厅 · 后续大渠建设',url:'https://czt.xinjiang.gov.cn/xjczt/c115020/202508/233609176d4e4c7b94132bc34df5176a.shtml'}],source:{title:'国家民委 · 锡伯族历史沿革',url:'https://www.neac.gov.cn/seac/ztzl/201806/1067551.shtml',scope:'支持启程、抵达、安置和修渠开垦；球面路径与人物不是史实逐站复原。'},phases:[{label:'背景',text:'1764年清政府调遣锡伯官兵与家属西迁屯垦戍边。小地球呈现盛京与伊犁的方向，起点不放到新疆区域图内。'},{label:'过程',text:'全球弧线推进到伊犁方向，1765年抵达，继而转向安置。伊宁和察布查尔标记仅为地域参照，不是抵达遗址或考证行程。'},{label:'影响',text:'1766年安置后，家庭、住处和田地逐步显现；最后引出后来修渠的生活延伸。水渠为简化图标，并不声称修渠与安置同年。'}],nodes:[
  {id:'ili',name:'伊犁河谷 · 伊宁参照',lon:81.32,lat:43.92,role:'现代城市定位，非抵达遗址',text:'先看河谷与周边山地，再放回跨大陆迁移背景。',models:[['migration','观察全球西迁方向','方向示意 · 非逐站考证路线']]},
  {id:'qabqal',name:'察布查尔地区 · 参照',lon:81.14,lat:43.84,role:'近似地域定位，非历史街区',text:'史料记述安置与修渠开垦。家庭模型没有复原某个真实家庭或某座历史聚落。',models:[['people','观察家庭与安顿','原创历史主题情境'],['karez','比较地下水路结构','工程类比，非察布查尔水渠复原']]}
 ],corridor:[],lineLabel:'全球方向与安置示意 · 非逐站行程'}
];
export const geographyStops = [
 {id:'mountains',name:'山地与盆地',lon:83.4,lat:42.8,text:'天山位于两大盆地之间。切换俯视和侧视，观察整体骨架；显示高度不等于真实比例。'},
 {id:'tianchi',name:'天山天池',lon:88.12,lat:43.89,scene:'local',text:'从区域定位进入真实局部影像与高程。它是自然观察入口，不作为某次历史事件的发生地点。'},
 {id:'glacier',name:'一号冰川',lon:86.817,lat:43.10,scene:'glacier',text:'进入固定日期的真实卫星地表。教学冰体变化可独立观察，不表示实测年度变化。'},
 {id:'yardang',name:'雅丹原理',lon:90.0,lat:40.3,scene:'yardang',text:'在区域东部认识干旱地貌背景，再进入通用侵蚀原理模型；定位不代表模型的实测地点。'}
];
export function eventById(id){return historyEvents.find(e=>e.id===id)??historyEvents[0];}
export function nodeById(event,id){return event.nodes.find(n=>n.id===id)??null;}
