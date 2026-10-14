// Claims link to public primary sources. Relationships are an editorial synthesis.
export const sources={
 terrain:{title:'地形与卫星观测记录',url:'./assets/data-sources.json',date:'固定日期观测',scope:'高程、影像和坐标；显示高度经过夸张。'},
 yardang:{title:'新疆自然资源厅 · 龙城雅丹',url:'https://zrzyt.xinjiang.gov.cn/xjgtzy/dzyjxq1/202307/18a525fe156e42d8bfc1c80f6adb8947.shtml',date:'2023 · 地质遗迹说明',scope:'风蚀与雨水冲刷概念；模型未标定实际地点、年代或速率。'},
 glacier:{title:'NSIDC · 冰川与水',url:'https://nsidc.org/learn/parts-cryosphere/glaciers/why-glaciers-matter',date:'原理资料',scope:'储水与质量收支概念；本地动画没有预测标定。'},
 karez:{title:'UNESCO · Karez Wells',url:'https://whc.unesco.org/en/tentativelists/5347/',date:'2008 · 预备名单申报说明',scope:'结构、灌溉与生活用途；该条目为申报资料。'},
 silk:{title:'UNESCO · 丝绸之路',url:'https://www.unesco.org/en/silk-roads/about-silk-roads?hub=196704',date:'历史概述',scope:'跨时期网络与交流；沙盘曲线为概念廊道。'},
 muqam:{title:'UNESCO · 新疆维吾尔木卡姆',url:'https://ich.unesco.org/en/RL/uyghur-muqam-of-xinjiang-00109?lang=en',date:'2008 · 列入代表作名录',scope:'歌、舞、音乐；十二、刀郎、吐鲁番、哈密四类区域风格与社区传习。庭院、节奏、人物动作是原创教学创作，没有复原各风格曲目。'},
 xibe:{title:'国家民委 · 锡伯族历史沿革',url:'https://www.neac.gov.cn/seac/ztzl/201806/1067551.shtml',date:'2018-06-29 · 历史资料',scope:'1764 年调遣、1765 年抵达伊犁、1766 年迁居察布查尔及之后修渠开垦。家庭、文书与优先选择是创作情境，路径只表示方向。'},
 xibememory:{title:'国家民委 · 锡伯西迁与文化记忆',url:'https://www.neac.gov.cn/seac/c103391/202304/1162735.shtml',date:'2023-04-18 · 官方文化记忆资料',scope:'一年多的西迁、锡伯语言文字与西迁纪念传统。家书仅为原创道具，不使用仿造的锡伯文字，也不是历史档案。'},
 policy:{title:'国务院 · 新疆自贸试验区总体方案',url:'https://app.www.gov.cn/govdata/gov/202310/31/508877/article.html',date:'2023-10-31 · 总体方案公布',scope:'三片区分工、贸易服务协同及土地与生态保护要求。三方协商、兼顾/货运/生境选择与等待时间均为创作教学机制，不是官方决策程序或实施成效。'},
};
export const domains=[
 {id:'nature',name:'自然',title:'山地储水，环境提供条件。',text:'冰雪、沟谷与干旱地表让水成为关键线索。它们约束生活，却不能单独解释社会和历史。',source:'glacier',cue:'water-ice',x:9,y:45},
 {id:'geography',name:'地理',title:'地形把条件放在不同位置。',text:'山系、盆地与山前绿洲组织可达空间；道路和城市仍受到技术、制度与历史选择影响。',source:'terrain',cue:'water-mountains',x:28,y:25},
 {id:'history',name:'历史',title:'通道随着时代改变。',text:'丝路是跨时期网络；锡伯西迁展示了具体的历史调遣。两者不能用一条恒定的路线解释。',source:'silk',cue:'exchange-network',x:48,y:17},
 {id:'culture',name:'文化',title:'传承需要有人示范，也有人接续。',text:'十二、刀郎、吐鲁番、哈密木卡姆各有区域风格。档案卡连接资料，庭院里的示范、轮流学习和回应呈现传习关系；原创节奏不替代真实表演。',source:'muqam',cue:'memory-practice',x:70,y:25},
 {id:'people',name:'民族',title:'人群有具体历史，也有延续记忆的实践。',text:'锡伯西迁连接调遣、家庭劳作、照护与语言文字记忆；维吾尔木卡姆连接另一个社区的传习。这是不同年代与社区的两个案例，不概括新疆所有人群，也不以服饰代替民族经验。',source:'xibememory',cue:'memory-journey',x:90,y:45},
 {id:'economy',name:'经济',title:'连接还需要产业与组织。',text:'2023 年方案为三个片区安排不同功能。地理位置成为经济活动的条件，还需要物流、产业和公共服务。',source:'policy',cue:'modern-kashgar',x:69,y:72},
 {id:'politics',name:'政治',title:'制度安排，要面对不同使用者的需求。',text:'清代调遣影响家庭迁移；当代方案提出片区协同与生态约束。居民、运输工和生境维护者的创作协商，让取舍进入空间与人物回应；两种治理有不同历史，动画不验证政策成效。',source:'policy',cue:'modern-rules',x:29,y:72},
];
export const relations=[['nature','geography','水与地形'],['geography','history','廊道与通行'],['history','culture','经历与记忆'],['culture','people','示范与社区传习'],['people','economy','劳作、照护与生产'],['politics','history','调遣与家庭迁移'],['politics','economy','服务协作与取舍'],['economy','nature','使用与生境约束']];
// Approximate city centres, not cultural distribution or policy-area boundaries.
export const mapPoints={
 culture:[{name:'吐鲁番',lon:89.19,lat:42.95,note:'木卡姆区域风格之一',cue:'memory-muqam'},{name:'哈密',lon:93.52,lat:42.83,note:'木卡姆区域风格之一',cue:'memory-practice'}],
 modern:[{name:'乌鲁木齐',lon:87.62,lat:43.82,note:'方案：国际贸易、物流与制造',cue:'modern-urumqi'},{name:'喀什',lon:75.99,lat:39.47,note:'方案：加工产业、物流与跨境电商',cue:'modern-kashgar'},{name:'霍尔果斯',lon:80.42,lat:44.21,note:'方案：跨境物流、旅游等',cue:'modern-kashgar'}],
};
export const questions=[
 {id:'water',name:'水的条件变了，会牵动什么？',title:'从冰雪，到生活与生产。',text:'冰川收支变化提示水源需要长期观察；灌溉、生活用水和生境让同一个问题进入经济与治理。真实影响还取决于季节、其他水源和用水方式。',domains:['nature','geography','economy','politics'],cue:'future-budget',source:'glacier',explore:['glacier',3]},
 {id:'trade',name:'同一片空间，怎样回应不同需求？',title:'通道连接货物，也连接公共服务与生活。',text:'回到三方协商，比较居民边界、货物交接与生境维护怎样回应你的选择。2023 年方案提供服务协同和生态要求的政策背景；情境取舍是教学创作，实际成效仍需要统计和后续评估。',domains:['geography','economy','politics','nature','people'],cue:'modern-limit',source:'policy',explore:['terrain',2]},
 {id:'memory',name:'远行之后，谁来接续生活和记忆？',title:'迁移有历史背景，文化需要具体的人。',text:'回看家庭怎样安排引水与照护，再看庭院怎样留出学习的时间。锡伯西迁与维吾尔木卡姆属于不同社区案例；语言文字、纪念与传习各有资料依据，创作人物不代表所有人的经历。',domains:['history','people','culture','politics','economy'],cue:'memory-arrival',source:'xibememory',explore:['migration',0]},
];
