// Spatial reading of the sourced events. These are teaching mechanisms, not measured reconstructions.
export const eventReadings={
 zhang:{
  stages:[
   {title:'01 山地之间的通行条件',look:'灰线与绿洲台地先出现：先辨山地、盆地和可观察的通道。',reason:'把汉代外交探索放回欧亚内陆的地理背景。',focus:[85.5,38.8],distance:23},
   {title:'02 从通道观察往来',look:'金线逐段延伸，队伍携带物件前行；暂停可以查看当前位置。',reason:'用教学队伍观察通行条件，和考证出使行程分别说明。',focus:[85.5,38.8],distance:21},
   {title:'03 从往来到交流网络',look:'交换台、货物和多方向连接展开，进入喀什比较补给与交换。',reason:'这里看跨时期交流，不把长期贸易网络视作一次出使的即时结果。',focus:[75.99,39.47],distance:8}
  ],places:{
   dunhuang:{why:'在东侧入口建立方位，再回看盆地通道怎样展开。',next:'拖动廊道进程，比较队伍前后位置。'},
   kashgar:{why:'来到盆地西缘，把地图上的交流网络转成可操作的补给与交换。',next:'选择食物、织物或工艺物品，观察使用者怎样回应。'},
   turpan:{why:'从往来与补给转向绿洲如何支持生活；这是延伸案例。',next:'打开水路剖面或用水场景，比较工程与生活需要。'}
  }
 },
 protectorate:{
  stages:[
   {title:'01 地方空间已有联系',look:'灰色地方聚落与通道先存在，轮台地区定位环标出观察范围。',reason:'机构出现之前，先读天山南侧与盆地北缘的地方空间。',focus:[84.25,41.78],distance:10},
   {title:'02 机构怎样进入地方',look:'城门、围墙和内部空间逐步显现，保留原有地方参照。',reason:'以公元前60年设立为历史线索，用抽象结构解释空间组织。',focus:[84.25,41.78],distance:7},
   {title:'03 从空间到联络',look:'绿色联系线向两侧展开，往来人员携带联络物件移动。',reason:'放大轮台，展开屋盖，检查入口、通道与内部空间如何连接。',focus:[84.25,41.78],distance:10}
  ],places:{luntai:{why:'来到天山南侧的轮台地区参照点，观察机构与地方空间的联系。',next:'展开屋盖，选择城门、通道或内部空间。'}}
 },
 xibe:{
  stages:[
   {title:'01 从大陆尺度理解远行',look:'小地球标出盛京与伊犁方向；起点在新疆区域之外。',reason:'1764年调遣官兵与家属，先看跨大陆距离与方向。',focus:[81.32,43.92],focusOffset:[-1.85,1.35,-.15],distance:4.6},
   {title:'02 从远行到抵达',look:'球面方向线推进，行进点抵达伊犁；区域定位接上河谷。',reason:'1765年抵达伊犁，再把注意力转向安置地域。',focus:[81.32,43.92],distance:7},
   {title:'03 安顿之后怎样生活',look:'住处、家人和田地先展开，之后才出现修渠延伸。',reason:'1766年安置与之后修渠分开呈现；进入家庭看引水、照护和行装。',focus:[81.14,43.84],focusOffset:[.55,.6,.4],distance:5.8}
  ],places:{
   ili:{why:'从盛京与伊犁的全球方向落到河谷，连接远行和地方地理。',next:'控制球面方向进度，再选择察布查尔看安顿。'},
   qabqal:{why:'从抵达河谷走近安置地域，观察家庭怎样组织新的生活。',next:'选择引水、照护或带来的物品，观察家人回应。'}
  }
 }
};
export function readingFor(id,phase=0){return (eventReadings[id]??eventReadings.zhang).stages[Math.max(0,Math.min(2,phase))];}
export function placeReading(id,place){return eventReadings[id]?.places[place]??null;}
