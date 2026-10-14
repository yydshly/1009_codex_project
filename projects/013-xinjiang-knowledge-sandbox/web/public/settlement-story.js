// A causal reading of the documented sequence, not a family's biography or a
// measured water/agriculture simulation. A user can seek every beat backwards.
export const settlementStory={
 settle:{question:'安置之后，怎样开展耕作？',need:'住处之外，还需要能维持生活的生产。',steps:[
  {at:0,key:'source',label:'找到支流水源',title:'河谷里的住处，连着支流水源',look:'看右侧住处与支渠。初期灌溉已经存在，左侧后建大渠尚未出现。',focus:'home'},
  {at:.28,key:'walk',label:'走到初期田地',title:'从居住的地方，走到耕作的地方',look:'跟随居民从庭院走向初期田地；金色短线连接住处、渠边与耕地。',focus:'overview'},
  {at:.65,key:'work',label:'继续初期耕作',title:'支流灌溉与初期耕作相接',look:'居民检查渠边，另一人转向田垄劳作。初期耕作没有等到1808年才开始。',focus:'initial'}]},
 dig:{question:'原有灌溉之外，为什么还要开新渠？',need:'人口增长带来扩大耕作的需求。',steps:[
  {at:0,key:'need',label:'看到扩耕需求',title:'原有田地保留，新的空间等待接水',look:'右侧仍有初期灌溉。左侧金色田区只表示新增耕作的空间，尚未接上新渠。',focus:'overview'},
  {at:.25,key:'build',label:'沿渠推进施工',title:'图伯特组织开渠，工程历时六年',look:'干渠槽从水源方向延伸，劳动者沿渠握住工具作业。它属于安置几十年后的建设。',focus:'water'},
  {at:.82,key:'connect',label:'连到田边',title:'渠槽延伸到新增田区，仍未放水',look:'看主渠与田边支渠连起来；田区仍是干地。建好渠槽与后来放水分开观察。',focus:'field'}]},
 flow:{question:'新渠的来水，怎样进入耕作？',need:'新渠把水接向更多可耕作的空间。',steps:[
  {at:0,key:'water',label:'沿主渠来水',title:'主渠开始放水',look:'青色水流从伊犁河水源参照沿新渠前进，居民靠近渠口观察。',focus:'water'},
  {at:.38,key:'field',label:'水接到田边',title:'从主渠，经支渠，接到新增田区',look:'继续跟随青色水流进入田边支渠。湿润颜色从渠侧展开，耕作空间随后显现。',focus:'field'},
  {at:.73,key:'response',label:'居民继续耕作',title:'水利支持扩耕，人物转向田间劳作',look:'居民从查看渠口转向田间，劳动者在田垄旁继续作业。新增田区与原有田地一起保留。',focus:'field'}]}
};
const clamp=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
export const storyEase=(p,a,b)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
export function settlementStoryFrame(phase='settle',progress=0){
 const story=settlementStory[phase]??settlementStory.settle,p=clamp(progress),index=story.steps.reduce((n,s,i)=>p>=s.at?i:n,0);
 return {story,beat:story.steps[index],index,progress:p,
  residentWalk:storyEase(p,.28,.65),initialWork:storyEase(p,.65,.90),
  demand:phase==='dig'?storyEase(p,.02,.20):phase==='flow'?1:0,
  branch:phase==='flow'?storyEase(p,.43,.68):0,soil:phase==='flow'?storyEase(p,.68,.88):0,
  response:phase==='flow'?storyEase(p,.73,.98):0,
  phaseKey:phase+'-'+story.steps[index].key};
}
export function settlementBeatProgress(phase,index){
 const steps=settlementStory[phase]?.steps;if(!steps)return 0;
 const i=Math.max(0,Math.min(steps.length-1,Number(index)||0));return Math.min(.99,steps[i].at+.025);
}
