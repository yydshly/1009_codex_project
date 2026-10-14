// Original roleplay, grounded topics. These lines are not historical quotations.
export const traditions=[
 {id:'twelve',name:'十二木卡姆',note:'大型组曲传统；请查阅 UNESCO 原始记录。'},
 {id:'dolan',name:'刀郎木卡姆',note:'地域传统之一；同一名称背后有具体社区实践。'},
 {id:'turpan',name:'吐鲁番木卡姆',note:'地域传统之一；本场景只切换资料卡与学习关注。'},
 {id:'hami',name:'哈密木卡姆',note:'地域传统之一；没有生成对应的真实曲式或舞步。'},
];
export const civicVoices={
 resident:{name:'附近居民',line:'货物要走，我们也需要安静、安全的日常。',request:'生活：缓冲与安全'},
 worker:{name:'货运工作人员',line:'车队还在等。能否集中交接，少跑几趟？',request:'工作：交接与通行'},
 steward:{name:'生境维护者',line:'留下连续的绿带，也要留出维护的空间。',request:'环境：连续与维护'},
};
export const civicPlans={
 freight:{name:'集中转运',green:22,coordination:true,capacity:7,dispatch:1,buffer:.25,summary:'交接优先，更多车位投入使用；绿带较窄，居民与维护者的需求仍待回应。'},
 balanced:{name:'轮换通行',green:36,coordination:true,capacity:6,dispatch:.76,buffer:.65,summary:'交接与通行分时轮换，保留缓冲带；车队仍会等待，三方共同接受一部分约束。'},
 habitat:{name:'保留生境',green:48,coordination:true,capacity:4,dispatch:.55,buffer:1,summary:'绿带和维护空间扩大，更多车辆在场外等候；需要进一步安排交接。'},
};
export const dialogueClips=[
 {id:'family-memory',role:'家庭成员',text:'孩子要安顿好，来时的记忆也要留给下一代。',rate:0},
 {id:'family-child',role:'孩子',text:'到了新家，也讲讲来时的路。',rate:1},
 {id:'teacher',role:'示范者',text:'先看我的手，留出停顿，再轮到你。',rate:0},
 {id:'learner',role:'学习者',text:'我接上这一拍，下次还想和大家一起学。',rate:1},
 ...Object.entries(civicVoices).map(([id,v])=>({id:'civic-'+id,role:v.name,text:v.line,rate:0})),
 {id:'civic-balanced',role:'协作回应',text:'先轮换通行，留出缓冲。等待和维护，都继续记录。',rate:0},
 {id:'civic-freight',role:'协作回应',text:'集中交接让货物继续走。生活与生境的需求，还要接着协调。',rate:0},
 {id:'civic-habitat',role:'协作回应',text:'先把连续的绿带留下。场外等待的车队，也需要下一步安排。',rate:0},
];
const byId=Object.fromEntries(dialogueClips.map(d=>[d.id,d]));
export function socialDialogue(cue,elapsed,settings){
 let id,offset=0;
 if(cue.id==='memory-arrival')id=elapsed>=19?'family-child':elapsed>=13?'family-memory':null;
 if(cue.id==='memory-practice')id=elapsed>=17?'learner':elapsed>=11?'teacher':null;
 if(cue.id==='modern-rules'){
  id=elapsed>=20?'civic-steward':elapsed>=15?'civic-worker':elapsed>=10?'civic-resident':null;
  if(id)offset=elapsed-({'civic-resident':10,'civic-worker':15,'civic-steward':20}[id]);
 }
 if(cue.id==='modern-limit'&&elapsed>=13)id='civic-'+settings.civicPlan;
 return id&&byId[id]?{...byId[id],authored:true,offset}:null;
}
export function civicAutoFrame(cue,elapsed){
 if(cue.id==='modern-rules')return {voice:elapsed<15?'resident':elapsed<20?'worker':'steward',plan:'freight'};
 if(cue.id==='modern-limit')return {voice:'steward',plan:elapsed<7?'freight':elapsed<13?'balanced':'habitat'};
 return {voice:'worker',plan:'balanced'};
}
