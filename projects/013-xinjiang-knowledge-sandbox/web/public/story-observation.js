// Historical phases use one progress value. Speech reveals only the geometry
// belonging to its current chapter; observations never rewrite historical facts.
const ranges={zhang:[[0,.12],[.12,.7],[.7,1]],protectorate:[[0,.16],[.16,.64],[.64,1]],xibe:[[0,.08],[.08,.58],[.58,1]]};
export const storyRange=(id,beat)=>ranges[id]?.[beat]??[0,1];
export function storyProgress(id,beat,fraction){const [a,b]=storyRange(id,beat),t=Math.max(0,Math.min(1,Number(fraction)||0));return a+(b-a)*t;}
export function storySubtitle(text,fraction){
 if(typeof text!=='string'||!text.trim())return '';
 const lines=(text.match(/[^。！？；]+[。！？；]?/g)??[text]).flatMap(sentence=>{
  const chunks=[],parts=sentence.match(/[^，]+，?/g)??[sentence];
  while(parts.join('').length>48){
   const length=parts.join('').length,target=length/Math.ceil(length/48);let size=0,best=0,distance=Infinity;
   for(let i=0;i<parts.length;i++){size+=parts[i].length;if(size>48)break;if(Math.abs(size-target)<distance){best=i+1;distance=Math.abs(size-target);}}
   if(!best){chunks.push(parts[0].slice(0,48));parts[0]=parts[0].slice(48);}else chunks.push(parts.splice(0,best).join(''));
  }
  if(parts.length)chunks.push(parts.join(''));return chunks;
 });
 const length=lines.reduce((n,s)=>n+s.length,0),at=Math.max(0,Math.min(.99999,Number(fraction)||0))*length;
 let total=0;return lines.find(s=>(total+=s.length)>at)??lines.at(-1)??'';
}
// MiniMax supplies paragraph-sized timing blocks. Split long blocks for reading;
// intra-block sentence timing is proportional, not forced word alignment.
export function timedStorySubtitle(cues,timeMs){
 const cue=cues?.find(c=>timeMs>=c.time_begin&&timeMs<c.time_end);
 if(!cue)return '';
 return storySubtitle(cue.text,(timeMs-cue.time_begin)/Math.max(1,cue.time_end-cue.time_begin));
}
export function observationMeaning(id,records=[]){
 const accepted={zhang:['0','1','2'],protectorate:['0','1','2','3','connection'],xibe:['home','water']}[id];
 if(!accepted)return null;
 records=Array.isArray(records)?records.filter(r=>r&&accepted.includes(String(r.priority))):[];
 if(!records.length)return null;
 if(id==='zhang'){
  const meaning={'0':'织物被用于日常生活：交换把远方物品变成本地需要。','1':'补给被远行者使用：持续往来需要能停留、补充食水的地方。','2':'器物进入制作：交换与地方生产相互联系。'};
  return {title:'从集市带回地图',text:records.map(r=>meaning[r.priority]).filter(Boolean).join(''),node:'kashgar',scope:'这些是交换机制的观察，不是张骞某次出使的历史结果。'};
 }
 if(id==='xibe')return {title:'从安顿带回地图',text:'两种安排最终都需要居住与用水。地图上的一次迁移，抵达以后还要转化为能够持续的地方生活。',node:'qabqal',scope:'家庭选择用于比较生活需求，不代表当年的真实决策。'};
 return {title:'从结构带回地图',text:'入口把外部往来引向通道与内部空间。接着回到机构与地方的联系：位置和建筑只是理解这个关系的线索。',node:'luntai',scope:'空间观察不能证明西域都护的具体制度运作或建筑形制。'};
}
export function modelNarrative(id,d={},records=[]){
 d=d??{};
 if(!['zhang','protectorate','xibe'].includes(id))return {title:'先选择一条历史路径',text:'从地图选择事件与地点，再进入相应场景观察。'};
 const complete=observationMeaning(id,records);
 if(id==='zhang')return d.marketUse==='waiting-for-choice'?{title:'交流怎样进入生活？',text:'先选择货物。留意谁在等待，以及接到东西后怎样继续自己的生活。'}:d.marketUse==='receiving-and-using'?{title:'交换正在发生',text:'看接收者的双手与物品；搬到摊位只是开始，使用才把货物与生活连接起来。'}:complete??{title:'从通道，走向一次交换',text:'货物正在运向需要它的人。看清接收者，再回地图理解停留与往来的关系。'};
 if(id==='xibe')return Number(d.settlementReply)>.8&&complete?complete:Number(d.waterOutcome)>.2||Number(d.homeOutcome)>.2?{title:d.householdPriority==='water'?'先让田边有水':'先让家门有灯',text:d.householdPriority==='water'?'渠水先接上劳作，家人随后安顿。观察两种需求怎样接续。':'家人先在门前安顿，随后引水到田。一次抵达，需要多个生活条件一起建立。'}:{title:'抵达之后，生活怎样开始？',text:'先安顿，还是先引水？选择一种安排，观察门前、水闸与田边的人。'};
 const connection={entering:{title:'从外部走向内部',text:'金色标记穿过城门，沿通道向内。入口与通道一起组织了这次联系。'},inside:{title:'联系抵达内部空间',text:'往来抵达内部。此时展开屋盖，可以同时对照入口、通道与两侧空间。'},returning:{title:'再沿通道回到外部',text:'青色标记沿通道返回。看清内外联系，再把这个空间问题带回机构与地方的地图。'}}[d.structureConnectionState];
 if(connection)return connection;
 return complete??{title:'从一处机构，回看地方联系',text:'点“演示内外联系”，看标记穿过入口、沿通道进入内部。也可以展开屋盖，自己选择一处结构。'};
}
