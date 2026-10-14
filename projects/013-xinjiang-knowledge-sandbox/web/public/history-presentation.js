// Short on-canvas introductions, reusing the facts and scope in history-story.js.
// These explain the diagram; they do not add surveyed routes or new chronology.
const chapters={
 zhang:[
  {where:'欧亚大陆 · 新疆的山地与盆地',title:'远行，先要穿过怎样的地方？',intro:'公元前138年，张骞带着联络大月氏的任务出发。先认山地与盆地，再理解向西建立联系的困难。',steps:['认山地','看盆地边缘','找东侧参照'],legend:['浅线 · 地理轮廓','地点 · 现代方位参照'],next:'下一幕：任务之后，联系怎样展开 →'},
  {where:'东西之间 · 从出使到往来',title:'一次出使，打开更大的联系',intro:'最初的联盟未能促成，后续使节往来继续。沿着逐段展开的金线，观察彼此分隔的地域怎样产生联系。',steps:['联系展开','沿线观察','走向西侧'],legend:['金线 · 地域联系示意','队伍 · 往来机制示意'],next:'下一幕：往来怎样进入日常生活 →'},
  {where:'喀什 · 从区域联系到一次交换',title:'地图上的线，落到人的生活里',intro:'沿途城镇让停留、补给与交换得以继续。靠近喀什，看一件货物如何交到需要它的人手中。',steps:['看交流网络','定位喀什','近看货物交接'],legend:['青线 · 长期交流联系','集市 · 跨时期生活情境'],next:'为什么去喀什？定位并继续探索 →'}
 ],
 protectorate:[
  {where:'天山南侧 · 塔里木盆地北缘',title:'机构出现前，这里已有生活',intro:'先找到山地、盆地与地方聚落。灰色房屋标出已有的地方世界，下一幕的新机构将进入这片空间。',steps:['认地方空间','看山地聚落','走近已有生活'],legend:['灰色聚落 · 已有地方生活','浅线 · 地理方位参照'],next:'下一幕：观察机构怎样出现 →'},
  {where:'轮台地区 · 设立的地域背景',title:'新机构与地方，同时出现在地图上',intro:'公元前60年，西汉设立西域都护。看机构逐步显现，同时留意周边聚落仍然存在。',steps:['机构出现','结构成形','观察内外入口'],legend:['门楼与院落 · 机构示意','轮台 · 现代地域参照'],next:'下一幕：把机构放回地方联系 →'},
  {where:'轮台与周边 · 从中心到联系',title:'理解一处机构，也要看它连接谁',intro:'青线把机构与地方连起来。靠近轮台，再主动进入结构，观察外部、入口与内部怎样相接。',steps:['看地方联系','看沿线往来','观察内外空间'],legend:['青线 · 关系示意，非辖区','建筑 · 空间观察模型'],next:'为什么去轮台？定位并观察结构 →'}
 ],
 xibe:[
  {where:'盛京方向 → 伊犁 · 同一地球上的两端',title:'一次调遣，也是家庭的远行',intro:'1764年，锡伯官兵及家属从盛京方向西迁。先同时看见起点与目的地，理解这次远行的空间尺度。',steps:['看起讫两端','认出发方向','认伊犁河谷'],legend:['两端 · 现代地域定位','淡线 · 只表示起讫方向'],next:'下一幕：从远行到抵达 →'},
  {where:'伊犁 → 察布查尔 · 抵达与安置',title:'抵达河谷，还要找到新的住处',intro:'1765年抵达伊犁，1766年春安置察布查尔。跟随方向线，分清抵达与安顿的两个时间节点。',steps:['看远行方向','跟随家庭行装','从抵达到安置'],legend:['金线 · 起讫联系示意','队列 · 官兵与家属的远行'],next:'下一幕：新生活需要什么 →'},
  {where:'察布查尔 · 住处、生产与后续建设',title:'住下来以后，生活怎样继续？',intro:'住房先出现，随后观察田地与后期渠水。进入家庭，可以亲自比较先安顿住处、还是先照顾用水。',steps:['看河谷条件','看住处出现','近看田地与水'],legend:['房屋 · 安置后的生活需要','渠水 · 后期建设，非同时完成'],next:'为什么去察布查尔？定位并比较安排 →'}
 ]
};
const labels={
 zhang:{dunhuang:['敦煌','东侧方位参照','联系从东侧展开','沿途停留的地域参照'],kashgar:['喀什','盆地西侧的地域参照','向西观察地域联系','交换与使用 · 下一层入口'],turpan:['吐鲁番','盆地东侧的绿洲参照','绿洲与沿途补给','停留与补给 · 延伸观察']},
 protectorate:{luntai:['轮台地区','地方生活先于机构出现','西域都护设立 · 地域参照','机构与地方 · 进入结构观察']},
 xibe:{shengjing:['盛京方向','1764 · 出发的地域参照','从起点看远行尺度','回看出发方向'],ili:['伊犁河谷','远行的目的地区域','1765 · 抵达伊犁','河谷是安置生活的环境'],qabqal:['察布查尔','接下来认识的安置地区','1766春 · 安置的地域参照','住处与后期用水 · 家庭入口']}
};
export function historyPresentation(id,phase=0){
 const key=id==='migration'?'xibe':id,rows=chapters[key];
 if(!rows)return null;
 const index=Math.max(0,Math.min(2,Math.floor(Number(phase)||0)));
 return {...rows[index],phase:index,number:String(index+1).padStart(2,'0'),chapter:['背景','发生','影响'][index]};
}
export function historyMapIntroduction(id,phase,node){
 const row=labels[id==='migration'?'xibe':id]?.[node];
 if(!row)return null;
 return {name:row[0],meaning:row[Math.max(0,Math.min(2,Math.floor(Number(phase)||0)))+1]};
}
