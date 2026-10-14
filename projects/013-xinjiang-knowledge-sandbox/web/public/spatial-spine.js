// Geographic context is the backbone; a teaching set belongs to a case location.
// Coordinates locate cases, not buildings, community boundaries or exact journeys.
export const cuePlaces={
 'earth-arrival':['地球','欧亚大陆',84,43,'planet'],
 'water-inland':['欧亚大陆','新疆 · 大陆腹地',84,43,'continent'],
 'region-structure':['新疆','三山与两盆',84,43,'region'],
 'region-ice':['天山','乌鲁木齐一号冰川',86.817,43.10,'region'],
 'water-mountains':['天山','乌鲁木齐一号冰川',86.817,43.10,'place'],
 'water-ice':['吐鲁番','绿洲用水情境',89.19,42.95,'people'],
 'water-flow':['吐鲁番','绿洲用水情境',89.19,42.95,'people'],
 'water-valley':['吐鲁番','绿洲用水情境',89.19,42.95,'people'],
 'oasis-dry':['新疆','供水之后 · 回到盆地边缘',84,43,'region'],
 'oasis-wind':['塔里木盆地','山前绿洲廊道',82,39,'region'],
 'oasis-engineering':['吐鲁番','坎儿井结构',89.19,42.95,'place'],
 'oasis-use':['吐鲁番','来水之后 · 水路维护',89.19,42.95,'people'],
 'oasis-nodes':['喀什','下一处停留与交换',75.99,39.47,'region'],
 'exchange-network':['塔里木盆地','山前廊道',82,38,'region'],
 'exchange-stops':['喀什','盆地西缘的交汇点',75.99,39.47,'region'],
 'exchange-goods':['喀什','绿洲集市情境',75.99,39.47,'people'],
 'exchange-city':['喀什','绿洲集市情境',75.99,39.47,'people'],
 'exchange-question':['伊犁','转入1764—1765西迁案例',81.15,43.84,'region'],
 'memory-departure':['盛京一带','1764 · 家庭准备',123.43,41.80,'people'],
 'memory-journey':['欧亚大陆','1764—1765 · 西迁方向',101,43,'continent'],
 'memory-arrival':['伊犁 · 察布查尔','抵达后的生活',81.15,43.84,'people'],
 'memory-muqam':['新疆','木卡姆区域风格',89.19,42.95,'region'],
 'memory-practice':['哈密','庭院传习情境',93.51,42.82,'people'],
 'modern-hubs':['新疆','当代三个片区',84,43,'region'],
 'modern-urumqi':['乌鲁木齐','加工与物流情境',87.62,43.82,'people'],
 'modern-kashgar':['霍尔果斯','伊犁谷地与关口',80.42,44.21,'region'],
 'modern-rules':['霍尔果斯','公共协商情境',80.42,44.21,'people'],
 'modern-limit':['霍尔果斯','公共协商情境',80.42,44.21,'people'],
 'future-landscape':['霍尔果斯','选择后的关口',80.42,44.21,'people'],
 'future-budget':['霍尔果斯','关口尚未解决的需要',80.42,44.21,'people'],
 'future-evidence':['霍尔果斯','各处观察的比较记录',80.42,44.21,'region'],
 'future-synthesis':['新疆','回到整体 · 地点之间的联系',84,43,'region'],
 'future-result':['地球','重新看见新疆',84,43,'planet'],
};
export const spatialCameras={
 'earth-arrival':{globe:[112,24,12.6]},
 'water-inland':{globe:[84,43,7.8]},
 'region-structure':{camera:[4,12,19],target:[0,.6,0]},
 'region-ice':{focus:[86.817,43.10],distance:8},
 'memory-journey':{globe:[104,39,12.4],migration:0},
 'exchange-stops':{focus:[75.99,39.47],distance:9},
 'exchange-network':{route:0,endRoute:100},
 'modern-kashgar':{focus:[80.42,44.21],distance:9},
 'exchange-question':{focus:[81.15,43.84],distance:11},
 'oasis-nodes':{focus:[75.99,39.47],distance:11},
 'future-synthesis':{camera:[4,12,19],target:[0,.6,0]},
 'future-result':{globe:[84,43,12.6]},
};
const originalIDs='water-inland water-mountains water-ice water-flow water-valley oasis-dry oasis-wind oasis-engineering oasis-use oasis-nodes exchange-network exchange-stops exchange-goods exchange-city exchange-question memory-departure memory-journey memory-arrival memory-muqam memory-practice modern-hubs modern-urumqi modern-kashgar modern-rules modern-limit future-landscape future-budget future-evidence future-synthesis future-result'.split(' ');
export function spatialDuration(id,durations){return ({'earth-arrival':12,'region-structure':14,'region-ice':12,'water-ice':28})[id]??durations[originalIDs.indexOf(id)];}
export function contextFor(cue){const [region,place,lon,lat,scale]=cuePlaces[cue.id];return {region,place,lon,lat,scale,scope:cue.stage?'案例定位 · 原创情境':cue.key==='yardang'?'区域定位 · 原理模型':'地理位置'};}
export function changesPlace(a,b){return !!a&&Math.hypot(a.lon-b.lon,a.lat-b.lat)>.2;}
export const scaleNames={planet:'地球',continent:'大陆',region:'区域',place:'地点',people:'人的尺度'};
export const regionLandmarks=[['阿尔泰山',88,48],['准噶尔盆地',86.4,45.5],['天山',84.5,43.2],['塔里木盆地',83.8,39.4],['昆仑山',82.5,36.5]];
