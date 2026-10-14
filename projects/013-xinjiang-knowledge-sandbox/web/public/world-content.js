import {countryCatalog} from './world-country-data.js';
// Approximate annotation anchors; country outlines now come from Natural Earth.
// Anchors are not capitals; comparison arcs are not travel routes.
export const worldAnchors=[
 {id:'xinjiang',name:'新疆',lon:84,lat:43,kind:'region',detail:'在欧亚大陆内陆、中国西北。先看周边，再进入全域地图。'},
 {id:'eurasia',name:'欧亚大陆',lon:70,lat:55,kind:'continent',detail:'先把欧洲与亚洲放在同一个大陆尺度里观察。'},
 {id:'europe',name:'欧洲',lon:17,lat:49,kind:'continent',detail:'转到大陆西侧，再回看新疆的相对位置。'},
 {id:'asia',name:'亚洲',lon:94,lat:23,kind:'continent',detail:'先辨认亚洲，再找到中国西北的新疆。新疆位于欧亚大陆内陆。'},
 {id:'eastAsia',name:'东亚',lon:122,lat:33,kind:'subregion',detail:'从东亚方向回看中国西北的内陆位置。'},
 {id:'china',name:'中国',lon:104,lat:29,kind:'country',detail:'结合北京、西安、兰州等现代城市参照，辨认新疆在中国西北的方位。'},
 {id:'africa',name:'非洲',lon:20,lat:6,kind:'continent',detail:'大陆和海洋的参照帮助理解地球上的方位。'},
 {id:'northAmerica',name:'北美洲',lon:-105,lat:44,kind:'continent',detail:'转到另一侧，再回到欧亚大陆；屏幕左右随旋转变化。'},
 {id:'southAmerica',name:'南美洲',lon:-61,lat:-17,kind:'continent',detail:'观察南北半球与大陆、海洋的分布。'},
 {id:'oceania',name:'大洋洲',lon:136,lat:-26,kind:'continent',detail:'比较南半球与欧亚大陆的方位。'},
 {id:'pacific',name:'太平洋',lon:155,lat:17,kind:'ocean',detail:'从亚洲东侧辨认海洋，再回到内陆。'},
 {id:'indian',name:'印度洋',lon:73,lat:-13,kind:'ocean',detail:'对照亚洲南侧海洋与新疆内陆的位置。'},
 {id:'atlantic',name:'大西洋',lon:-25,lat:25,kind:'ocean',detail:'辨认欧洲、非洲与美洲之间的海洋。'},
 {id:'arctic',name:'北冰洋',lon:80,lat:78,kind:'ocean',detail:'辨认北极方向；经线在两极汇聚。'},
 {id:'beijing',name:'北京',lon:116.40,lat:39.90,kind:'city',detail:'现代城市方位参照。与乌鲁木齐的比较线只量球面距离。'},
 {id:'xian',name:'西安',lon:108.94,lat:34.34,kind:'city',detail:'现代城市方位参照，不把今天的位置等同于某次历史行程。'},
 {id:'lanzhou',name:'兰州',lon:103.83,lat:36.06,kind:'city',detail:'从东侧参照中国西北的相对方位。'},
 {id:'urumqi',name:'乌鲁木齐',lon:87.62,lat:43.82,kind:'city',detail:'首府的现代近似坐标；用于城市定位和距离比较。'},
 {id:'mongolia',name:'蒙古国',lon:103,lat:46,kind:'neighbor',detail:'新疆周边邻国之一，在新疆东北方向，点击可查看国家轮廓。'},
 {id:'russia',name:'俄罗斯',lon:94,lat:57,kind:'neighbor',detail:'新疆周边邻国之一，跨欧亚大陆，金色轮廓显示当前观察范围。'},
 {id:'kazakhstan',name:'哈萨克斯坦',lon:67,lat:48,kind:'neighbor',detail:'新疆周边邻国之一；在更近的地图观察伊犁与西部入口。'},
 {id:'kyrgyzstan',name:'吉尔吉斯斯坦',lon:74.6,lat:41.2,kind:'neighbor',detail:'新疆周边邻国之一，位于天山西段，轮廓与山系一起显示。'},
 {id:'tajikistan',name:'塔吉克斯坦',lon:69.4,lat:38.6,kind:'neighbor',detail:'新疆周边邻国之一，结合高亮轮廓辨认它与新疆的位置关系。'},
 {id:'afghanistan',name:'阿富汗',lon:67.8,lat:33.9,kind:'neighbor',detail:'新疆周边邻国之一，通过瓦罕走廊与新疆相邻，可放大观察狭长部分。'},
 {id:'pakistan',name:'巴基斯坦',lon:69.3,lat:29.4,kind:'neighbor',detail:'新疆周边邻国之一，结合高亮轮廓辨认它与新疆的位置关系。'},
 {id:'india',name:'印度',lon:79,lat:22.7,kind:'neighbor',detail:'新疆周边邻国之一，对照轮廓观察南侧山地与周边关系。'},
 {id:'almaty',name:'阿拉木图',lon:76.89,lat:43.24,kind:'city',detail:'现代城市近似坐标；与乌鲁木齐比较球面距离。'},
 {id:'istanbul',name:'伊斯坦布尔',lon:28.98,lat:41.01,kind:'city',detail:'用大陆西部的城市参照比较东西跨度，非历史路线。'},
 {id:'rotterdam',name:'鹿特丹',lon:4.48,lat:51.92,kind:'city',detail:'现代城市近似坐标，比较线不表示铁路、航线或贸易量。'},
];
export const comparisonCities=['beijing','xian','almaty','istanbul','rotterdam'];
export const mountainBands=[
 {id:'altai',name:'阿尔泰山',points:[[83.6,49.4],[86.4,48.2],[88.7,47.1],[91.2,46.4]]},
 {id:'tianshan',name:'天山',points:[[69.8,42.2],[74.7,42.5],[79.8,43.0],[84.0,42.6],[88.7,43.1],[94.1,42.8]]},
 {id:'kunlun',name:'昆仑山',points:[[74.7,36.1],[79.8,35.5],[85.3,35.8],[90.0,36.2],[94.0,35.8]]},
];
const countryAnchors=countryCatalog.map(c=>({...c,kind:'country',detail:'查看高亮轮廓，辨认它在大陆中的位置；可拖动和缩放，再回到新疆。'}));
export const worldAnchor=id=>worldAnchors.find(p=>p.id===id)??countryAnchors.find(p=>p.id===id)??worldAnchors[0];
export function globePosition(lon,lat,radius=3.24){const a=lon*Math.PI/180,b=lat*Math.PI/180;return [radius*Math.cos(b)*Math.cos(a),radius*Math.sin(b),-radius*Math.cos(b)*Math.sin(a)];}
export function angularDistance(a,b){const u=globePosition(a.lon,a.lat,1),v=globePosition(b.lon,b.lat,1);return Math.acos(Math.max(-1,Math.min(1,u.reduce((n,x,i)=>n+x*v[i],0))));}
export function surfaceDistance(a,b){return angularDistance(a,b)*6371.0088;}
export function comparisonArc(a,b,t,radius=3.25,lift=.32){
 const u=globePosition(a.lon,a.lat,1),v=globePosition(b.lon,b.lat,1),angle=angularDistance(a,b),s=Math.sin(angle);
 const p=angle<1e-7?u:u.map((x,i)=>(x*Math.sin((1-t)*angle)+v[i]*Math.sin(t*angle))/s);
 const r=radius+Math.sin(Math.PI*t)*lift;return p.map(x=>x*r);
}
