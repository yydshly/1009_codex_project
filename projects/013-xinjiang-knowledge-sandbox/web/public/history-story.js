import {knowledgeSources} from './knowledge-content.js';

// Facts and teaching scenarios have separate roles. These short chapters are
// shared by on-screen narration and recorded speech; animation is illustrative.
export const historyStorySources={
 ...knowledgeSources,
 zhangMission:{title:'中国国家博物馆 · 张骞出使西域',url:'https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/'}
};

export const historyStories={
 zhang:{
  id:'zhang',title:'一趟出使，怎样连接更大的世界？',question:'从一次外交任务，走向长期的地域交流。',sources:['zhangMission','silk'],
  scope:'出使年代与目的据中国国家博物馆，交流网络据 UNESCO。金线使用现代地域参照，不能当作张骞的精确行程；集市为跨时期的原创交流情境。',
  beats:[
   {id:'background',time:'公元前138年 · 出使的起点',title:'一项外交任务，从远行开始',question:'张骞为什么出发？',
    paragraph:'公元前一百三十八年，汉武帝派张骞前往西域，希望联合大月氏对抗匈奴。先把目光放到欧亚大陆：山地、盆地与荒漠，把遥远的地方分隔开来。要建立联系，首先要面对远行。接下来，我们看这项外交任务怎样走向更广泛的往来。',
    visible:'先看山地、盆地与东西两侧的地域参照',meaning:'政治上的联络目的，把一次远行放进大陆尺度；地理条件决定我们需要关注哪些空间问题。',next:'沿地表展开联系，继续了解出使的经历。',
    focus:{lon:85.5,lat:40.3,distance:5.5,surface:3}},
   {id:'process',time:'出使与此后的使节往来',title:'任务未如愿，联系继续展开',question:'没有达成最初的目标，远行还带来了什么？',
    paragraph:'张骞历经艰难抵达大月氏，却没有促成最初希望的联盟。出使的意义并未停在这里。此后，他再次出使，使节往来继续展开，汉朝与西域之间的联系增加。画面用金线表达这种联系的展开。它帮助我们理解地域关系，而不是复走某一次出使。',
    visible:'金线逐段展开，观察各地域之间的联系',meaning:'区分任务的直接结果与后续影响：一次出使有自己的目标，区域往来则持续发展。',next:'从使节往来，转向长期交流怎样进入生活。',
    focus:{lon:85.5,lat:40.3,distance:5.1,surface:3}},
   {id:'impact',time:'长期交流 · 跨时期观察',title:'联系成为网络，也进入日常生活',question:'地图上的线，怎样变成人与人的交换？',
    paragraph:'随着长期往来，丝路形成多条相互联系的线路。沿途城镇提供停留和补给，流动的也不只有货物，还有知识与生活经验。现在把视线移到盆地西侧的喀什，用一个跨时期集市情境继续追问：谁需要这些货物，接手之后，生活发生了什么变化？',
    visible:'青色支线与交换符号出现，下一站定位喀什',meaning:'长期交流依靠沿途聚落与具体需要。下一层把区域联系缩小为可观察的交接和使用。',next:'选择喀什，观察远行与日常需求怎样相接。',
    focus:{lon:81.6,lat:41.4,distance:5.1,surface:3}}
  ],
  place:{id:'kashgar',name:'喀什',why:'地图已经提出“往来怎样延续”的问题。喀什位于盆地西侧，我们在这里把区域尺度的交流，缩小为一次货物交接。',bridge:'接下来进入跨时期集市情境：保留交流问题，观察具体的接收者和用途。'},
  model:{id:'market',title:'一次交换，连接三种生活需要',question:'货物交给谁？它为什么有用？',context:'长距离联系需要落到具体的停留与使用。比较三种货物，观察同一处集市怎样连接家庭、远行者和手艺人。',
   tasks:[
    {id:'cloth',label:'织物与家庭',action:'选择织物，跟随搬运到家庭。',observe:'等孩子披上织物、家人回应后，再回看集市与家庭的距离。',meaning:'交换抵达了日常生活；需求为往来提供了具体用途。'},
    {id:'supplies',label:'补给与远行',action:'选择补给，观察远行者接手。',observe:'看食物和水怎样进入行装，人物准备好后继续出发。',meaning:'一次停留支持下一段远行。聚落不仅是地图上的点，也是延续往来的条件。'},
    {id:'tools',label:'器物与制作',action:'选择器物，跟随它进入工作台。',observe:'等手艺人接收并继续制作，再比较另外两种用途。',meaning:'交换也连接生产活动。把这些用途合起来，才能理解网络为什么会持续。'}
   ],summary:'带回地图的观察：使节往来与长期交流分属不同尺度；集市解释了停留、需求和使用怎样让联系继续。'}
 },
 protectorate:{
  id:'protectorate',title:'一个机构，怎样放进已有的地方世界？',question:'先看地方聚落，再理解西域都护的设立与联系。',sources:['archaeologyHan'],
  scope:'公元前60年设立西域都护及治所乌垒据考古资料。轮台是现代地域参照，乌垒遗址仍在研究。联系线不表示辖区；结构模型不复原古城，也不能证明真实行政过程。',
  beats:[
   {id:'background',time:'设立之前 · 地方聚落',title:'机构出现以前，地方已有生活',question:'这片空间原本是什么样的？',
    paragraph:'把目光移到天山南侧、塔里木盆地北缘。在西域都护设立以前，这里已经有人群活动和聚落。灰色房屋代表这个先在的地方世界。我们的故事从这里开始：一个新的机构，将怎样进入已有的地方联系？先看清聚落，再观察下一幕的变化。',
    visible:'灰色地方聚落保留，机构符号尚未出现',meaning:'历史上的机构建立在已有的地方社会之中，不能把机构出现误读为城镇生活的起点。',next:'推进到公元前60年，观察机构与地方同时出现。',
    focus:{lon:84.25,lat:41.78,distance:4.7,surface:3}},
   {id:'process',time:'公元前60年 · 设立西域都护',title:'新的机构，进入同一片空间',question:'设立，究竟改变了什么？',
    paragraph:'公元前六十年，西汉设立西域都护，治所在乌垒。画面中的机构符号开始出现，周边聚落仍然保留。这一变化要表达的，是机构与地方开始放在同一幅关系图里。乌垒的准确城址仍在考古研究中，因此我们先以轮台地区帮助建立方位。',
    visible:'机构符号升起，周边聚落继续保留',meaning:'重点是机构与地方的关系，而不只是新出现一座建筑。现代轮台只帮助定位研究区域。',next:'继续观察机构与地方之间怎样在地图上相连。',
    focus:{lon:84.25,lat:41.78,distance:4.25,surface:3}},
   {id:'impact',time:'机构与地方 · 关系观察',title:'理解机构，要同时看见它的联系',question:'为什么还要进入地点和模型？',
    paragraph:'机构的意义，需要连同周边地方一起理解。青色线条把这些关系显现出来，让我们从一个中心转向一组联系。下一步靠近轮台地区，再进入抽象结构，观察外部、入口、通道与内部怎样连接。空间观察帮助提出问题，历史职能仍要回到资料中理解。',
    visible:'地方联系展开，再定位轮台的地域参照',meaning:'关系线说明这一层的观察对象；结构只提供空间问题的入口，掀开屋盖本身不是历史影响。',next:'定位轮台地区，带着“内外如何相接”进入结构。',
    focus:{lon:84.25,lat:41.78,distance:4.7,surface:3}}
  ],
  place:{id:'luntai',name:'轮台地区',why:'我们已从单个机构转向机构与地方的联系。轮台地区提供乌垒研究的地域背景，下一层用结构观察“外部怎样进入内部”。',bridge:'从地域关系转向空间关系。入口、通道与内部空间是可观察的教学问题；机构职能须结合史料。'},
  model:{id:'structure',title:'把空间组织与历史职能分开看',question:'怎样穿过入口，到达内部空间？',context:'模型把内外联系变成可指认的对象。观察完入口、通道和内部，再返回地图理解机构与地方；建筑外形不能代替历史解释。',
   tasks:[
    {id:'gate',label:'外部与入口',action:'选中城门，先观察外部通向哪里。',observe:'对照城门与围墙的位置，再展开屋盖。',meaning:'入口让内外联系变得具体；它是观察空间组织的起点。'},
    {id:'passage',label:'入口与通道',action:'选中通道，沿它向内观察。',observe:'比较通道与两侧房屋、空地的连接。',meaning:'联系不止发生在入口，还需要在内部延续。'},
    {id:'wall',label:'边界与联系',action:'选中围墙，对照入口。',observe:'同时看见围合的空间与允许连接的位置。',meaning:'模型的物理边界与地图的历史联系是两种尺度，不能把墙体当作辖区。'},
    {id:'space',label:'内部与地方',action:'展开屋盖，选中内部空间。',observe:'看清结构后返回地图，对照地方聚落。',meaning:'从内部退回区域，才能继续问机构与地方的关系；空间观察提供问题，不能独自给出史实答案。'}
   ],summary:'带回地图的观察：建筑的内部组织可以帮助理解尺度；西域都护的历史意义需要连同地方关系与考古资料一起认识。'}
 },
 xibe:{
  id:'xibe',title:'远行的终点，怎样成为新的生活起点？',question:'从西迁的起讫，走向安置、用水和家庭生活。',sources:['xibe'],
  scope:'1764年出发、1765年抵达伊犁、1766年春安置察布查尔据国家民委资料。起讫线不复原中途行程；家庭为原创情境。后来的修渠与开垦不表示在抵达时同时完成。',
  beats:[
   {id:'background',time:'1764年 · 从盛京方向出发',title:'一次调遣，也是许多家庭的远行',question:'为什么把两个遥远地点放在同一个地球上？',
    paragraph:'一七六四年，清政府为加强伊犁地区防务，调遣锡伯官兵及家属西迁。把盛京方向与伊犁同时放在地球上，我们才看得见这次远行的尺度。对官兵与家属来说，任务连着生活：抵达以后，住在哪里，又怎样维持日常？这些问题将带我们进入河谷。',
    visible:'盛京方向与伊犁同时标记，先比较起讫位置',meaning:'制度安排与家庭生活由同一场迁移相连。先理解远行尺度，再看抵达后的具体需要。',next:'展开方向线，区分出发、抵达与安置的时间。',
    focus:{lon:102,lat:42,distance:7.6,surface:2.6}},
   {id:'process',time:'1765年抵伊犁 → 1766年安置',title:'到达伊犁，还不是生活安顿的终点',question:'抵达与安置之间，还有什么变化？',
    paragraph:'西迁官兵与家属在一七六五年抵达伊犁，次年春天迁往察布查尔安置。跟随方向线，我们先看远行怎样抵达河谷，再靠近新的生活地点。两步发生在不同时间。地图上的终点逐渐成为住处与生产的起点，问题也从怎样到达，转成怎样安顿。',
    visible:'起讫联系推进到伊犁，再关注察布查尔',meaning:'迁移、抵达、安置是连续但不同的过程；地点变化带来新的生活问题。',next:'看住房先出现，再看后来的用水与开垦。',
    focus:{lon:102,lat:42,distance:7.6,surface:2.6}},
   {id:'impact',time:'1766年起的安置与后续建设',title:'安顿下来，还要让生活继续',question:'一处新家，需要什么才能运转？',
    paragraph:'安置以后，住处、用水与生产成为延续生活的具体条件。察布查尔的住房先出现，后来的修渠和开垦再逐步显现。接下来进入原创家庭情境，你可以先照顾住处，也可以先关注用水。观察不同选择带来什么回应，再把家庭的需要放回河谷与历史中。',
    visible:'住房先出现，随后显示田垄和后期渠水',meaning:'宏观迁移落实为生活需要。模型让你比较照顾这些需要的次序，不改写历史上实际的安置政策。',next:'选择察布查尔，进入家庭观察安顿与用水。',
    focus:{lon:81.23,lat:43.88,distance:4.25,surface:3}}
  ],
  place:{id:'qabqal',name:'察布查尔',why:'方向线回答了从哪里来到哪里。现在靠近安置地，继续问一处住处怎样成为可以延续的生活。',bridge:'从远行的起讫，进入安置后的日常需要。下一层比较住处与用水，保留与伊犁河谷的联系。'},
  model:{id:'people',title:'先安顿，还是先照顾用水？',question:'你的选择，回应了家庭的哪一种需要？',context:'家庭是原创的历史主题情境。两种次序把住处与用水的需要变成可观察的动作，让迁移后的生活问题具体起来。',
   tasks:[
    {id:'home',label:'先照顾住处',action:'选择先安顿，观察整理和安置。',observe:'等家人完成动作并回应，再观察尚未解决的用水需要。',meaning:'抵达一个地点与建立生活不同。安顿住处回应了其中一种需要。'},
    {id:'water',label:'先照顾用水',action:'选择先引水，观察水路与人物协作。',observe:'看供水变化和家庭回应，再与先安顿的次序比较。',meaning:'水把河谷环境、生产和家庭连在一起；后期建设延续了安置后的生活。'}
   ],summary:'带回地图的观察：迁移先改变了位置，安置和后续建设又把住处、用水与生产联系起来。家庭情境帮助理解这些需要。'}
 }
};

/** Resolve the UI route alias without silently substituting an unrelated story. */
export function historyStory(id){return historyStories[id==='migration'?'xibe':id]??null;}

/** Same thresholds as the map process; malformed input starts at the background. */
export function storyBeat(progress){
 const value=typeof progress==='number'?progress:Number(progress);
 if(!Number.isFinite(value))return 0;
 return value<.28?0:value<.72?1:2;
}
