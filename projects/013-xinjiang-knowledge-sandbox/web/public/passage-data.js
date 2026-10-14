import {sampleElevation} from './geo.js';

// These comparison lines are authored teaching geometry, never archaeological routes.
export const passageRoutes={
 direct:{name:'直线跨盆地',points:[[94.66,40.14],[75.99,39.47]],scope:'几何直线，只用来比较距离与地表起伏。'},
 oasis:{name:'沿盆地边缘',points:[[94.66,40.14],[88.17,39.02],[79.92,37.12],[77.24,38.42],[75.99,39.47]],scope:'概括廊道，地点为现代地域参照，不是张骞逐站行程。'}
};
export const passageStops=[
 {name:'敦煌',lon:94.66,lat:40.14},
 {name:'若羌地区',lon:88.17,lat:39.02},
 {name:'和田地区',lon:79.92,lat:37.12},
 {name:'喀什',lon:75.99,lat:39.47}
];
export const reliefSection=[[87.5,36.2],[87.5,48.5]];
export const turpanSection=[[88.2,44.0],[89.19,42.95]];
export function geographicDistance(a,b){
 const r=Math.PI/180,dLat=(b[1]-a[1])*r,dLon=(b[0]-a[0])*r;
 const h=Math.sin(dLat/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dLon/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export function elevationProfile(dem,points,count=181){
 if(points.length<2||!Number.isInteger(count)||count<2)throw new Error('A profile needs two points and two samples.');
 const [w,s,e,n]=dem.bounds;
 if(points.some(p=>!p.every(Number.isFinite)||p[0]<w||p[0]>e||p[1]<s||p[1]>n))throw new Error('Profile is outside DEM coverage.');
 const lengths=points.slice(1).map((p,i)=>geographicDistance(points[i],p));
 const distance=lengths.reduce((a,b)=>a+b,0),samples=[];
 for(let i=0;i<count;i++){
  const at=distance*i/(count-1);let segment=0,start=0;
  while(segment<lengths.length-1&&at>start+lengths[segment])start+=lengths[segment++];
  const t=lengths[segment]?(at-start)/lengths[segment]:0,a=points[segment],b=points[segment+1];
  const lon=a[0]+(b[0]-a[0])*t,lat=a[1]+(b[1]-a[1])*t;
  samples.push({lon,lat,km:at,height:sampleElevation(dem,lon,lat)});
 }
 return {samples,distance,min:Math.min(...samples.map(s=>s.height)),max:Math.max(...samples.map(s=>s.height))};
}
export const passageSteps=[
 {id:'world',actionTitle:'先建立方位',label:'全球定位',title:'从欧亚大陆，找到新疆',copy:'新疆位于中国西北、欧亚大陆内陆。先转动地球建立方位，再进入山河之间。',next:'进入三山两盆'},
 {id:'relief',actionTitle:'观察地形起伏',label:'山地与盆地',title:'三列山地，两个盆地',copy:'把地图转到侧面：天山将两大盆地分开。沿白色取样线读高程，再想一想：远行会遇到什么条件？',next:'带着地形问题进入历史'},
 {id:'passage',actionTitle:'比较两条教学通道',label:'历史与通道',title:'路，为什么不只选最短？',copy:'张骞出使是欧亚交流的重要线索；后来丝路形成多条网络。比较两条教学线：地表起伏之外，城镇、补给与水也影响通行。',next:'走近吐鲁番的用水问题'},
 {id:'place',actionTitle:'沿山地向盆地观察',label:'吐鲁番',title:'通道上的聚落，怎样获得水？',copy:'吐鲁番是用水工程的观察入口。蓝线取样从天山侧向盆地下降；转动地图，比较山地与低地的位置。',next:'展开地下水路模型'},
 {id:'model',actionTitle:'展开结构，改变来水',label:'地下水路',title:'水，怎样穿过地下？',copy:'剖面把地下通道显露出来：竖井用于开挖和维护，暗渠输水，出口连接地表。改变来水与剖面，观察水路怎样贯通。',next:'带着答案返回通道地图'}
];
