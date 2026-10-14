// A question-led route through existing geographic and scene capabilities.
// Recorded results describe authored model responses, never historical outcomes.
export const migrationStops=[
 {id:'world',label:'地球',title:'一次远行，怎样变成新的日常？',why:'先在欧亚大陆找到新疆。接下来沿同一个地球靠近西部的伊犁河谷。',look:'新疆位于欧亚大陆腹地。先看它与大陆、周边地区的相对位置。'},
 {id:'map',label:'河谷',title:'抵达之后，在哪里生活？',why:'地图上的伊犁河谷，把宏观位置缩小到生活的地理条件。它帮助理解安顿，却不能代替迁移的历史原因。',look:'青线概括河谷地域关系。比较山地与低地，再追问：谁在什么时候来到这里？'},
 {id:'history',label:'西迁',title:'把方向，放回具体的年代',why:'1764年从盛京出发，1765年到达伊犁，1766年安置于察布查尔。分开观察远行、抵达与安置。',look:'金线是起讫方向示意；聚落、田地和后续水渠随进程出现。水渠属于后来发展。'},
 {id:'place',label:'地点',title:'为什么走进察布查尔？',why:'这里是本次事件连接的安置地域。先确认它在伊犁河谷的位置，再把“安顿”变成可观察的生活问题。',look:'地图保留周边地势；下一步才主动进入一个原创家庭情境。'},
 {id:'family',label:'家庭',title:'抵达门前，先做哪件事？',why:'在模型里比较两种安排：先安顿，或先引水。看人物、灯火和渠水的先后变化，再把观察带回地图。',look:'这是对生活需求的互动理解，不是对历史家庭选择的复原。'}
];
export function migrationStep(stage,modelOpen){return stage==='place'&&modelOpen?'family':stage;}
export function settlementObservation(d,expected){
 if(!['home','water'].includes(expected)||d.householdPriority!==expected)return null;
 const values=['familyProgress','homeOutcome','waterOutcome','settlementReply'].map(k=>Number(d[k]));
 if(values.some(v=>!Number.isFinite(v))||values[0]<.98||values[1]<.95||values[2]<.95||values[3]<.8)return null;
 return {priority:expected,label:expected==='home'?'先安顿':'先引水',sequence:expected==='home'?'家人到门前 → 灯火亮起 → 渠水进入田边':'水闸打开 → 渠水进入田边 → 家人到门前',reply:'迎接者致意，家人开始门前的生活'};
}
export function trailRecordsHTML(records){return records.length?`<ol class="mt-records">${records.map(r=>`<li><b>${r.label}</b><span>${r.sequence}</span><small>${r.reply}</small></li>`).join('')}</ol>`:'<p class="mt-empty">还没有完成观察。选择一种安排，等人物回应后，这里会留下记录。</p>';}
export function trailProgressHTML(current){return `<nav class="mt-stops" aria-label="从远行到安顿的五个观察尺度">${migrationStops.map((s,i)=>`<button data-mt-stop="${s.id}" aria-current="${s.id===current?'step':'false'}"><small>0${i+1}</small>${s.label}</button>`).join('')}</nav>`;}
