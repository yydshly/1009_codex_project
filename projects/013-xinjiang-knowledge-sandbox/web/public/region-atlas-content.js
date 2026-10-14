// Existing working scenes form the catalog. Coordinates are entry references,
// not claims that a generic model reconstructs a particular historical site.
export const atlasThemes=[
 {id:'geography',title:'山河塑造新疆',sub:'自然地理',image:'./assets/atlas-r15-ice.jpg',question:'三山两盆，怎样决定新疆的空间格局？',copy:'沿山脉辨认盆地，再走近天池、冰川与风蚀地貌。',legend:'山地与盆地名称是区域定位；点选地点进入可操作模型。'},
 {id:'water',title:'水如何抵达生活',sub:'河流与绿洲',image:'./assets/atlas-r15-water.jpg',question:'山地来水，怎样与绿洲和生活发生联系？',copy:'对照塔里木与伊犁的方位，进入冰川、坎儿井和用水情境。',legend:'蓝线表示流域方向与关系，采用概括折线，不是实测河道或同一条连通水系。'},
 {id:'history',title:'沿事件走进历史',sub:'交流与聚落',image:'./assets/atlas-r15-market.jpg',question:'重大事件，为什么与这些地点相连？',copy:'选择出使、都护或西迁，观察背景、过程与影响，再放大地点。',legend:'金线为绿洲交流廊道参照；青线为伊犁与察布查尔位置联系。不是精确历史行军路线。'},
];
export const atlasEntries=[
 {id:'tianchi',name:'天山天池',kind:'nature',lon:88.12,lat:43.89,geo:'tianchi',model:'local',image:'./assets/overview/tianchi.png',text:'地形与真实观测影像，观察山地、湖泊和坡面。'},
 {id:'glacier',name:'一号冰川',kind:'nature',lon:86.817,lat:43.10,geo:'glacier',model:'glacier',image:'./assets/atlas-r15-ice.jpg',text:'冰谷观测、流动叠层与收支实验；地形底座与教学叠层分别标注。'},
 {id:'yardang',name:'雅丹地貌',kind:'nature',lon:90,lat:40.3,geo:'yardang',model:'yardang',image:'./assets/overview/yardang.png',text:'区域坐标是入口参照；模型演示风蚀机理，不复原特定地貌。'},
 {id:'dunhuang',name:'敦煌方向',kind:'history',lon:94.66,lat:40.14,event:'zhang',place:'dunhuang',text:'新疆东侧的交流入口参照，连接绿洲廊道观察。'},
 {id:'kashgar',name:'喀什',kind:'history',lon:75.99,lat:39.47,event:'zhang',place:'kashgar',model:'market',image:'./assets/atlas-r15-market.jpg',text:'从交流事件进入原创集市模型，比较交换、补给和人物回应。'},
 {id:'turpan',name:'吐鲁番',kind:'water',lon:89.19,lat:42.95,event:'zhang',place:'turpan',model:'karez',image:'./assets/atlas-r15-water.jpg',text:'从绿洲位置进入坎儿井构造与用水情境，不指定工程建造年代。'},
 {id:'luntai',name:'轮台一带',kind:'history',lon:84.25,lat:41.78,event:'protectorate',place:'luntai',model:'structure',text:'都护设立的地理参照；城门与内部空间采用抽象结构示意。'},
 {id:'ili',name:'伊犁',kind:'history',lon:81.32,lat:43.92,event:'xibe',place:'ili',model:'migration',text:'以1764—1766年西迁与安置建立历史、河谷和聚落联系。'},
 {id:'qabqal',name:'察布查尔',kind:'culture',lon:81.14,lat:43.84,event:'xibe',place:'qabqal',model:'people',image:'./assets/atlas-r15-family.jpg',text:'进入历史主题家庭情境，比较安顿、引水与记忆交接。'},
 {id:'hami',name:'哈密方向',kind:'culture',lon:93.51,lat:42.82,free:'culture',model:'culture',image:'./assets/atlas-r15-culture.jpg',text:'文化场景入口参照；庭院传习是原创练习，不代表特定社区完整文化。'},
 {id:'horgos',name:'霍尔果斯方向',kind:'culture',lon:80.42,lat:44.2,free:'logistics',model:'logistics',image:'./assets/atlas-r15-gate.jpg',text:'当代关口协作的情境入口，操作车队、绿地与公共空间选择。'},
];
export const reliefNames=[['阿尔泰山',88.1,47.6,'山脉'],['准噶尔盆地',86.7,45.6,'盆地'],['天山',83.6,42.75,'山脉'],['塔里木盆地',83.4,39.2,'盆地'],['昆仑山',80.4,36.2,'山脉']];
export const reliefDescriptions={
 '塔里木河流域':'在塔里木盆地观察山地与流域方向。吐鲁番的地下水路另作工程比较，两者不表示同一水系。',
 '伊犁河流域':'在西部河谷观察来水方向，再从西迁与安置事件进入伊犁及察布查尔地点。',
 '阿尔泰山':'北部山地。与天山之间是准噶尔盆地，先观察山地与盆地的相对位置。',
 '准噶尔盆地':'位于阿尔泰山与天山之间。对照山地边缘与盆地内部的高程和颜色。',
 '天山':'横贯新疆中部，成为南北盆地之间的空间骨架。可继续进入天池与冰川模型。',
 '塔里木盆地':'位于天山与昆仑山之间。切换“水与绿洲”，对照流域关系与生活入口。',
 '昆仑山':'南部山地。与天山之间展开塔里木盆地；现有DEM南缘以外只显示轮廓定位。',
};
export const waterRelations=[
 {name:'塔里木河流域',points:[[80.2,40.7],[82,41],[83.8,41],[85.8,40.8],[87.4,40.6],[88.3,39.9]]},
 {name:'伊犁河流域',points:[[83.7,43.4],[82.8,43.65],[81.3,43.9],[80.45,44.1]]},
];
export const atlasReferences=[
 {title:'地理与河流：新疆水利厅',url:'https://slt.xinjiang.gov.cn/xjslt/c114428/202309/a90332286c0c4dcaa0305131e18bb01c.shtml'},
 {title:'区域轮廓：DataV公开GeoJSON',url:'https://geo.datav.aliyun.com/areas_v3/bound/650000.json'},
];
export const modelImages={local:'./assets/overview/tianchi.png',glacier:'./assets/atlas-r15-ice.jpg',yardang:'./assets/overview/yardang.png',oasis:'./assets/atlas-r15-water.jpg',market:'./assets/atlas-r15-market.jpg',people:'./assets/atlas-r15-family.jpg',culture:'./assets/atlas-r15-culture.jpg',logistics:'./assets/atlas-r15-gate.jpg'};
