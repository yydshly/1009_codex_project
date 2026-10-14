import {glacierShots} from './glacier-director.js';
import {envoyNarration} from './envoy-journey-data.js';
import {historyStories} from './history-story.js';
import {directorOpening,directorGeographyShots} from './director-spatial-sequence.js';
import {directorModelNarration} from './director-model-narration.js';
// One ordered, reversible journey over the live exploration platform.
const xibeShots = [
 {id:'departure',label:'出发',title:'一次调遣，连着许多家庭',where:'1764 · 盛京方向 → 伊犁',why:'制度安排带来远行；家庭需要让我们继续追问抵达之后的生活。',next:'沿方向线，看抵达与安置的时间差。',beat:0,duration:24},
 {id:'arrival',label:'抵达',title:'抵达伊犁，还要找到安置地',where:'1765 抵达 → 1766 春安置',why:'抵达伊犁和迁往察布查尔发生在不同时间。跟随金线，看目的地如何变成新的生活地点。',next:'留在河谷，看山地、河流与安置点的关系。',beat:1,duration:24},
 {id:'settlement',label:'安置',title:'从远行终点，到生活起点',where:'1766 年起 · 安置与后续建设',why:'住处提供栖身之所，后续修渠与开垦支撑生活。依次观察住房、田地和渠水出现。',next:'把安置后的生产需求，带到住处、水系与耕地的关系模型。',beat:2,duration:24},
 {id:'place',label:'地点',title:'为什么走进察布查尔？',where:'伊犁河谷 → 察布查尔 → 家庭',why:'方向线回答“到哪里”，下一层区分“初期屯居”与“后来的开渠”。保留地图定位，再进入可操作场景。',next:'导演依次展开三个历史阶段；可随时接管切换年代。',duration:8,caption:'接下来按三个年代看水系与屯居。人物、建筑和渠线是关系示意，具体布局不作复原。'},
 {id:'home',label:'1766屯居',model:'people',settlement:'settle',detail:'story',title:'安置后已有初期灌溉与耕作',where:'1766年春起 · 察布查尔',why:'先看右侧住处、初期耕地与支渠；后来大渠尚未出现。',next:'跨过几十年，观察新水利需求怎样带来建设。',duration:18},
 {id:'water',label:'开挖新渠',model:'people',settlement:'dig',detail:'story',title:'原有耕作之外，组织开挖新大渠',where:'19世纪初 · 图伯特组织开渠',why:'左侧渠槽延伸，劳动者沿干渠作业，原有右侧耕地保留。',next:'到1808年初，看新渠放水与耕地扩展。',duration:18},
 {id:'irrigation',label:'1808放水',model:'people',settlement:'flow',detail:'story',title:'新渠来水，支持扩大耕作',where:'1808年初 · 大渠竣工放水',why:'沿青色新渠看水到新增田地，田垄随后显现；不是1766年同时建成。',next:'回到河谷地图，把安置和后续发展放回不同年代。',duration:18},
 {id:'return',label:'回到地图',title:'从屯居与水系，重新读懂河谷',where:'分期水利观察 → 察布查尔 → 伊犁河谷',why:'迁移改变位置，屯居建立初期耕作，后来的新渠支持扩展。把不同年代的变化带回同一个河谷。',next:'演示结束后，自己切换年代，或比较另外两条历史路径。',duration:10,caption:'把安顿与用水放回地图：居住、生产和河谷环境相互联系。安置与开渠相隔几十年，具体布局只作关系示意。'}
];

const narration=(event,beat,label)=>{const b=historyStories[event].beats[beat];return {id:b.id,label,beat,title:b.title,where:b.time,why:b.meaning,next:b.next,duration:24};};
const zhangShots=[
 narration('zhang',0,'出使背景'),
 {id:'mission-route',label:'记载与地域',journey:'map',title:'依据记载，认识第一次出使',where:'出陇西 · 大宛、康居、大月氏、大夏（地域参照）',why:'先看史书记载的经历；地点间的具体道路未考定，不复原沙丘行进。',next:'回到地图，区分外交结果与此后的长期往来。',duration:60,speech:envoyNarration['mission-route'],audio:{event:'zhang',beat:'mission-route'}},
 narration('zhang',1,'通道展开'),
 narration('zhang',2,'长期交流'),
 {id:'place',label:'喀什',title:'为什么在喀什观察交换？',where:'盆地西缘 → 喀什 → 原创集市',why:'从跨区域的联系，走近停留、交换与使用的生活机制。喀什是地域案例，集市是独立的跨时期情境。',next:'依次看三种货物怎样交到不同的人手里。',duration:8,caption:'保留喀什的地图定位，再靠近集市。下一层观察交流的生活机制，不把场景当作张骞某次停留。'},
 ...[
  ['cloth','织物',0,'家庭','孩子披上织物，家人回应','交换回应了居住与日常生活的需要。'],
  ['supplies','补给',1,'远行者','补充食物与水，整理行装后出发','通道需要补给，停留之后才能继续远行。'],
  ['craft','器物',2,'手艺人','器物交到工作台，手艺人继续制作','交换也连接生产，让地方需求与往来相接。']
 ].map(([id,label,goods,who,response,why])=>({id,label,goods,model:'market',title:`${label}交出以后，谁作出回应？`,where:`喀什 · 原创集市 · ${who}`,why,next:goods<2?'留在同一个集市，比较另一种需要。':'带着三种用途，回到地域联系地图。',duration:16,caption:`导演示范：${label}交给${who}。观察搬运、接手，再看${response}。`})),
 {id:'return',label:'回到地图',title:'从具体用途，读懂长期交流',where:'集市 → 喀什 → 跨区域联系',why:'出使与长期交流是不同尺度。集市里发生的接收、使用和出发，帮助理解联系怎样进入生活。',next:'自己选择货物，或切换到机构、迁移的另一个问题。',duration:10,caption:'把三种用途带回地图。金线代表跨时期交流；集市观察帮助理解机制，不作为张骞行程的证据。'}
];
const protectorateShots=[

 narration('protectorate',0,'地方背景'),narration('protectorate',1,'机构设立'),narration('protectorate',2,'联系展开'),
 {id:'place',label:'轮台地区',title:'从地方关系，走进空间组织',where:'轮台地域参照 → 抽象空间模型',why:'地图提出机构与地方怎样相接的问题；模型让我们观察入口、通道与内部的组织。',next:'先看城门，再展开屋盖，沿同一条通道观察内外往来。',duration:8,caption:'从轮台地区靠近抽象结构。模型提供空间观察，不复原乌垒城的建筑布局或行政流程。'},
 {id:'gate',label:'入口',model:'structure',part:0,open:false,title:'外部怎样通向内部？',where:'抽象结构 · 城门与围墙',why:'入口被高亮，围墙界定内外。先看门的位置，再看它后面的通道。',next:'展开屋盖，让被遮住的通道与两侧空间显现。',duration:8,caption:'金色高亮城门。对照外侧空地与围墙，在画面里找到进入内部的位置。'},
 {id:'inside',label:'展开内部',model:'structure',part:1,open:true,title:'屋盖展开，联系在内部延续',where:'城门 → 中央通道 → 两侧空间',why:'房屋还在原位，屋盖抬起后，通道和内部空间可以一起对照。',next:'让标记实际通过入口，进入内部，再沿通道返回。',duration:8,caption:'屋盖正在抬起，中央通道被高亮。观察它怎样把入口与两侧房屋、空地连接起来。'},
 {id:'connection',label:'内外往来',model:'structure',part:3,open:true,connection:true,title:'让内外联系在模型里走一遍',where:'外部 → 城门 → 内部 → 外部',why:'金色标记进入内部，青色标记返回外侧。结合入口与通道，看清内外如何相接。',next:'把空间观察带回地图，重新对照机构与周边地方。',duration:14,caption:'跟随金色标记进入，再沿青色路径返回。双向联系在同一个结构中发生。'},
 {id:'return',label:'回到地图',title:'回到机构与地方的共同空间',where:'内外空间 → 轮台地域参照 → 地方联系',why:'结构提供可观察的空间问题；地图把机构与周边地方放回一起。历史职能仍需结合资料理解。',next:'自己展开模型、选择部件，或换一条历史路径继续探索。',duration:10,caption:'返回天山南侧，对照机构符号与周边地方。青色联系不表示辖区边界，结构也不能证明真实古城形制。'}
];
export const directorPaths={
 glacier:{id:'glacier',kind:'nature',name:'一号冰川',title:'从天山，到冰谷',question:'真实地表告诉我们什么，教学模型帮助我们观察什么？',trail:false,period:'early',place:'glacier',model:'glacier',features:['tianshan'],image:'./assets/atlas-r15-ice.jpg',outline:[['地球到天山','新疆全域、山地骨架与冰川位置'],['真实地表到教学叠层','固定日期影像与高程；流动示意独立标注'],['改变条件，再回地图','对照初始轮廓与变化冰体，保留自由操作']],shots:glacierShots},
 zhang:{id:'zhang',name:'张骞出使',title:'从出使，到交流',question:'远行怎样发生，联系又怎样进入生活？',trail:'zhang',period:'han',place:'kashgar',model:'market',features:['tianshan','tarim','all'],image:'./assets/process/r81-recorded-regions.png',outline:[['地球到新疆','大陆方位、国家周边与盆地地理'],['依据史书记载','出陇西、长期扣留与中亚到访地域；不复原未考定道路'],['出使与长期交流','回图理解结果，再进入喀什的交换与人物回应']],shots:zhangShots},
 protectorate:{id:'protectorate',name:'西域都护',title:'从机构，到地方',question:'一个新机构，怎样放进已有的地方世界？',trail:'protectorate',period:'han',place:'luntai',model:'structure',features:['tianshan','tarim','all'],image:'./assets/process/r55-structure.png',outline:[['地球到天山南侧','新疆范围、盆地与轮台地区'],['从地方到机构','聚落、机构符号与联系展开'],['走进结构，再返回地图','入口、屋盖、通道与内外往来']],shots:protectorateShots},
 xibe:{id:'xibe',name:'锡伯西迁',title:'从远行，到安顿',question:'远行的终点，怎样成为生活的起点？',trail:'migration',period:'qing',place:'qabqal',model:'people',features:['tianshan','ili-water','all'],image:'./assets/process/r83-courtyard.png',outline:[['地球到伊犁河谷','新疆范围、天山与察布查尔'],['远行到安置','盛京方向的出发、抵达与安置'],['走进屯居，再回到地图','1766安置、19世纪初开渠、1808放水，分期看画面变化']],shots:xibeShots}
};
for(const path of Object.values(directorPaths)){
 // Geography is read at three distinct observation stops, each with its own
 // speech clock. Historical results stay hidden until the background begins.
 path.shots=[...directorOpening.map(s=>({...s})),...(path.kind==='nature'?[]:directorGeographyShots(path.id)),...path.shots];

}
for(const path of Object.values(directorPaths))path.shots=path.shots.map(s=>({...s,event:path.id,...(s.choice?{model:'people'}:{})}));
for(const path of Object.values(directorPaths))for(const shot of path.shots){
 const speech=directorModelNarration[path.id]?.[shot.id];
 if(speech){shot.speech=speech;shot.audio={event:path.id,beat:shot.id};}
}

