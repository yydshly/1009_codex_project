import {spatialCameras,spatialDuration} from './spatial-spine.js';
import { stories, catalog } from './story.js';
import { sources } from './connections.js';
import { stagedCues } from './lived-model.js';
import {bridges} from './continuity.js';
import {cueDurations} from './story-outcomes.js';
// Questions cross independent cases. Each transition returns to a location or names the change in era.
const acts=[
 ['地球 · 寻找生活的位置', '人怎样在这片土地上生活，并与外界建立联系？', '先建立位置，再追问人的生活。', [
  ['earth-arrival', 'earth', 0, '从地球，问一个关于生活的问题。', '人怎样在这片土地上生活，并与外界建立联系？先找到中国西北的新疆，再沿水、道路与人的选择走进去。每到一处，我们都带着上一处留下的问题。', 'nature geography', 'terrain', '找到新疆 → 带着问题走进生活'], 
  ['water-inland','earth',2,'在大陆腹地，找到新疆。','镜头锁定欧亚大陆内部。远离海洋的位置与周围山脉，是理解这里水与干旱的起点。接下来把新疆从地球上展开，先看整体，再选择地点。','nature geography','terrain','山地与盆地 → 生活的条件'],
  ['region-structure','terrain',0,'先看三山两盆，再读地点。','阿尔泰山在北，天山居中，昆仑山在南。准噶尔与塔里木两大盆地位于山系之间。山地、盆地和山前节点构成这次旅行的空间骨架。','nature geography','terrain','山系与盆地 → 地点与联系'],
  ['region-ice','terrain',3,'在整张图上，锁定一段冰谷。','先找到天山，再看乌鲁木齐附近的山地。金色定位点锁定一号冰川。镜头从区域图靠近这里，下一步才加载冰谷的局部高程与真实影像。','nature geography','glacier','新疆整体 → 天山 → 一号冰川'],
  ['water-mountains', 'glacier', 1, '山地有水，人怎样留下来？', '观察天山一号冰川附近的冰雪、裸岩与沟谷。山地让我们追问水；接下来转向吐鲁番，看人怎样把水接进生活。两处并非同一条实测水系。', 'nature geography', 'glacier', '观测山地 → 寻找生活条件'], 
 ]],
 ['水路 · 从留下来到联系外界', '怎样留下来，又怎样接上外界？', '水路与维护支撑停留，物品与补给引出交流。', [
  ['oasis-engineering', 'karez', 0, '先看水怎样抵达，再决定送到哪里。', '来到吐鲁番，先展开坎儿井。竖井连接施工与维护，暗渠利用坡降输水。水路接到地表之后，家里与田里才有了可以安排的来水。', 'geography culture economy', 'karez', '工程把水送来 → 人安排用水'], 
  ['water-ice','karez',0,'家里与田里，都在等第一道水。','家里需要接水，田边的人也在等待。先打开哪条支渠？两种选择改变工作的顺序，让你看到水抵达之后，人怎样回应。','nature geography economy culture','karez','发现需求 → 安排先后'],
  ['water-flow','karez',1,'水闸打开之后，变化就在眼前。','沿着支渠看水抵达。家人接过水，田边的人引水入垄；看完一种顺序，也可以试试另一种。人的需要，让山水进入生活。','nature geography economy people','karez','打开支渠 → 生活与生产的回应'],
  ['oasis-use','karez',2,'水路，连着田地与日常。','地下输水减少暴露，竖井支持施工与维护。水的用途连到耕作、居民和往来者；绿洲不仅是地图上的绿色，也是一套生活与生产关系。','nature economy culture','karez','供水与维护 → 生活与生产'],
  ['water-valley', 'karez', 2, '水接上日常，人又需要什么？', '家门与田地都接上了水，往来者整理行装。水路还要维护，生活也需要物品与补给。下一步回到地图，看看有了停留的地方，怎样接上外面的道路。', 'nature geography economy culture', 'karez', '供水后的日常 → 物品与补给'], 
  ['oasis-dry', 'terrain', 0, '把这一次停留，放回盆地边缘。', '离开用水情境，回到新疆。干旱的盆地与周围山系，把我们带向山前的绿洲节点。刚才的水路回答怎样留下来，现在追问怎样与外界联系。', 'nature geography', 'terrain', '可以留下来 → 怎样联系外界'], 
  ['oasis-wind', 'terrain', 2, '沿山前找下一处可以停留的地方。', '在区域图上沿盆地边缘寻找节点。对远行的人，水、食物与可停留的地方决定下一段路能否继续。镜头向西，逐步靠近喀什。', 'nature geography economy', 'silk', '水与补给 → 连续的停留节点'], 
 ]],
 ['集市 · 物品进入日常', '道路怎样连接具体的需要？', '交换让物品被使用，迁居则追问长期安顿。', [
  ['exchange-network', 'history', 0, '道路，把分散的需要接到一起。', '展开跨地区交流的路径。历史丝路有多个时期和多条道路；这里用联系网络解释，为什么山前的停留节点可以承接货物、技艺与人的往来。', 'history geography politics', 'silk', '多条道路 → 当地的停留与需求'], 
  ['oasis-nodes', 'terrain', 2, '下一站喀什：物品怎样进入生活？', '在盆地西缘锁定喀什。将绿洲停留的问题带进集市：家人、远行者与手艺人需要不同物品。地图给出位置，人物会让需要变得具体。', 'geography history economy', 'silk', '绿洲节点 → 集市里具体的需要'], 
  ['exchange-stops','terrain',0,'地图西缘，喀什把道路接到一起。','沿盆地山前看绿洲廊道，在西缘找到喀什。先知道集市位于哪里，再进入原创商队与交换情境，观察远方货物怎样回应当地需求。','geography history economy','silk','道路与停留 → 相遇与交换'],
  ['exchange-goods','history',2,"选择一批货物，看交换怎样发生。","远行者需要补给，家人需要织物，手艺人需要器物。选择一批货物，看它被送达、接过和使用；交换在具体需求中发生。",'history economy culture','silk','商品交换 → 知识与文化交流'],
  ['exchange-city', 'history', 3, '物品留了下来，远行者还会继续走。', '看刚才选择的物品留在接收者身边。商旅整理行装，准备离开；接收者接着自己的日常。可是，有些远行的人需要长期留下来。他们怎样重新安顿生活？', 'history culture people', 'silk', '商旅继续走 → 迁来的人怎样留下'], 
  ['exchange-question', 'terrain', 0, '换一个移动背景，追问怎样安顿。', '先回到新疆图上，找到伊犁。为了比较短暂停留与长期安顿，我们转入锡伯西迁的历史案例。时间回到1764年，移动的原因也从贸易变为国家调遣。', 'history people politics', 'xibe', '回到伊犁的位置 → 转入1764年的历史案例'], 
 ]],
 ['生活 · 安顿与接续', '安顿之后，经验与记忆怎样由下一代接上？', '国家调遣影响家庭，代际接续引向独立的文化案例。', [
  ['memory-departure','migration',0,"1764 年：调遣进入家庭的生活。","1764年，清政府为加强伊犁防务，调遣锡伯官兵及家属西行。成年人收好文书，孩子守着行装；这一家人为创作角色，文书也不是档案复刻。",'history people politics','xibe','历史调遣 → 家庭的准备'],
  ['memory-journey','migration',1,'把一年多的远行，放回地球。','从盛京一带向西，方向弧线跨过蒙古高原，抵达伊犁。它表示1764—1765年西迁的空间方向，不是逐站考证的道路。下一步靠近伊犁，观察抵达后的生活情境。','geography history people culture','xibememory','远行的经历 → 书写与纪念'],
  ['memory-arrival','migration',2,"安顿与引水，连着劳作和照护。","1765年抵达伊犁，次年迁居察布查尔，之后修渠开垦。先引水，还是先安顿？看一家人的劳作与照护；画面压缩长期生活。",'history people politics culture economy','xibe','引水与安顿 → 生活和记忆'],
  ['memory-muqam', 'terrain', 0, '从安顿生活，追问下一代怎样接上。', '工具与家书让我们看见经验和记忆的接续。带着这个问题回到新疆，转向哈密的文化案例。锡伯西迁与维吾尔木卡姆属于不同社区；比较的是下一代怎样参与。', 'culture people history', 'muqam', '生活与记忆的交接 → 另一社区的传习', 'culture'], 
  ['memory-practice','terrain',2,"留出停顿，让下一位参与者接上。","传承需要留出学习的时间。看示范者、学习者与同伴轮流回应；参与一拍，记录一次学习。节奏和动作均为原创。",'culture people','muqam','示范与参与 → 社区传习','culture'],
 ]],
 ['关口 · 给彼此留出空间', '多种需要同时出现，怎样共同安排？', '将参与和回应的问题带到当代公共空间。', [
  ['modern-hubs', 'terrain', 0, '从给下一位留出停顿，到给彼此留出空间。', '庭院里，留出停顿让学习者接上。把这个观察问题带回地图：当生活、运输与维护同时需要空间，怎样听见彼此？接下来进入当代关口，比较公共安排。', 'geography economy politics', 'policy', '留出参与的机会 → 同时回应多种需要', 'modern'], 
  ['modern-urumqi', 'terrain', 2, '先跟货物走，看看通行需要哪些协作。', '从乌鲁木齐的装载与转运开始。车辆、吊机与信息共同完成交接；货物继续走，也依赖有人维护设施、安排时间。接下来沿伊犁谷地走向霍尔果斯。', 'geography economy politics', 'policy', '装载与转运 → 关口的共同安排', 'modern'], 
  ['modern-kashgar', 'terrain', 1, '沿伊犁谷地，走向需要共同安排的关口。', '回到区域图，锁定霍尔果斯。我们已经看过接水、交接与学习；现在把关注对象扩大到同一片空间里的多种使用者，再听他们分别提出什么需要。', 'geography economy politics', 'policy', '此前的具体需要 → 当代多方的空间安排', 'modern'], 
  ['modern-rules','terrain',0,"先听三种需求，再安排同一片空间。","关口里的协作，也要听见不同需求。居民、运输工和生境维护者围桌交流，讨论生活、交接与保护。",'politics economy nature people','policy','不同使用者 → 公共协商','modern'],
  ['modern-limit','ecology',0,"一项选择，怎样回应三方的需求？","选择兼顾、货运或生境优先，看等待区和缓冲带改变。三方需求并未全部满足；这是创作协商，不代表真实政策成效。",'nature economy politics people','policy','协商与取舍 → 空间变化与人物回应'],
 ]],
 ['回望 · 回应最初的问题', '人怎样在这片土地上生活，并与外界建立联系？', '回收实际观察，留下仍需回应的问题。', [
  ['future-landscape', 'terrain', 0, '回应之后，镜头留给尚未解决的问题。', '先不离开关口。刚才的选择改变了车队、等待区与缓冲带，但没有让所有需要消失。沿着画面上的标记，看谁先得到了回应，谁还需要下一步安排。', 'nature economy politics people', 'policy', '已经发生的变化 → 仍未满足的需要'], 
  ['future-budget', 'terrain', 0, '把取舍也留下，才能继续协作。', '继续看同一片空间：通行与维护都需要有人承担。画面保留刚才的选择，不重新替你作决定。等待、缓冲或交接上的缺口，会成为下一次协商的起点。', 'nature geography economy politics', 'policy', '真实记录选择 → 带着约束继续协商'], 
  ['future-evidence', 'terrain', 0, '五处观察，分别留下了具体的回应。', '现在回看各处留下的记录：水抵达家里和田里，货物被使用，生活与记忆被交接，学习者接上一拍，关口也留下了取舍。各案例独立，接续的是我们关于生活的问题。', 'nature history culture economy politics', 'silk', '各处具体的回应 → 回答最初的问题'], 
  ['future-synthesis', 'terrain', 0, '人怎样留下来，又怎样与外界联系？', '把实际观察放回新疆图上。水与维护支撑停留，道路让物品和人相遇；历史影响家庭，文化由社区接续，公共安排回应共同的空间需要。地图上的每一处，都留下了变化和下一步问题。', 'nature geography history culture people economy politics', 'silk', '实际选择与未尽的需要 → 新疆整体'], 
  ['future-result', 'earth', 4, '回到地球，带走一个可以继续追问的答案。', '生活与联系，需要自然条件，也需要人的持续回应。这次我们从地球来到地点，再带着具体的观察回到整体。选择地图上的另一处，可以继续比较怎样留下来、怎样接上外界。', 'nature geography history culture people economy politics', 'silk', '回应最初的问题 → 从地图继续探索'], 
 ]],
];
export const chapters=[],cues=[];
let cursor=0;
for(const [chapter,[short,title,answer,items]] of acts.entries()){
 const start=cursor;
 for(const [part,[id,key,shot,heading,text,domains,source,connection,map]] of items.entries()){
  const duration=spatialDuration(id,cueDurations),stage=stagedCues[id]; cues.push({...stories[key][shot],...stage,...spatialCameras[id],id,index:cues.length,key,shot,chapter,part,partCount:items.length,heading,text,domains:domains.split(' '),source,connection,bridge:bridges[id],map:stage?undefined:map,start:cursor,end:cursor+duration,duration,credit:`${stage?.stage==='nature'?'NASA 影像 × 真实 DEM · 微缩展示 / 高度夸张':stage?'原创三维场景 · 人物、建筑与过程为教学创作':catalog[key].note} · 内容：${sources[source].date}`});cursor+=duration;
 }
 chapters.push({chapter,start,end:cursor,short,title,answer,key:cues.find(c=>c.chapter===chapter).key});
}
export const journeyDuration=cursor;
export const formatTime=value=>{const n=Math.floor(Math.max(0,value));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
export function locateTime(seconds){const time=Math.max(0,Math.min(journeyDuration,Number(seconds)||0)),cue=cues.find(c=>time<c.end)??cues.at(-1);return {...cue,elapsed:time-cue.start,time};}
export function journeyTime(index,elapsed){const cue=cues[index];return cue?cue.start+Math.max(0,Math.min(cue.duration,elapsed)):0;}
