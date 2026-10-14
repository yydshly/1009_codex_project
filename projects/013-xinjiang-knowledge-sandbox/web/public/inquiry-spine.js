// The visitor carries a question between independent cases, not a fictional
// shared river, family or historical cause. Outcomes read the actual ledger.
export const openingQuestion='人怎样在这片土地上生活，并与外界建立联系？';
export function storyReceipts(ledger={}){
 const rows=[];
 if(ledger.oasis){const v=ledger.oasis;rows.push({stage:'oasis',place:'吐鲁番',answer:v.plan==='field'?'田地先接水，家门随后接上':'家门先接水，田地随后接上',open:'水路仍需要共同维护',complete:v.replied===true});}
 if(ledger.market){const v=ledger.market;rows.push({stage:'market',place:'喀什',answer:['织物到了家人手中','补给到了远行者手中','器物到了手艺人手中'][v.goods]??'观察货物交接',open:'下一次停留仍需要供水与补给',complete:v.deliveries>0});}
 if(ledger.people){const v=ledger.people;rows.push({stage:'people',place:'察布查尔',answer:v.memory==='tools'?'引水后交接工具，劳动有人接续':'安顿后交接家书，记忆有人讲述',open:'日常与记忆需要下一代接续',complete:v.progress>=78});}
 if(ledger.culture){const v=ledger.culture;rows.push({stage:'culture',place:'哈密',answer:v.choice==='listen'?'学习者观察之后回应':'学习者主动接上一拍',open:'一次回应之后，仍要持续练习',complete:v.beats>0});}
 if(ledger.logistics){const v=ledger.logistics;rows.push({stage:'logistics',place:'霍尔果斯',answer:({balanced:'轮换通行，同时保留缓冲',freight:'交接优先，车位投入使用',habitat:'绿带扩大，维护空间保留'})[v.plan]??'观察公共协商',open:({balanced:'等待与维护仍需共同承担',freight:'居民缓冲与连续绿带仍待回应',habitat:'场外车队仍需要交接安排'})[v.plan]??'不同需要还要协商',complete:!!v.plan});}
 return rows;
}
const water=new Set('oasis-engineering water-ice water-flow oasis-use water-valley'.split(' '));
const road=new Set('oasis-dry oasis-wind oasis-nodes exchange-network exchange-stops exchange-goods exchange-city'.split(' '));
const family=new Set('exchange-question memory-departure memory-journey memory-arrival'.split(' '));
const culture=new Set('memory-muqam memory-practice'.split(' '));
export function inquiryFrame(cue,ledger={}){
 const id=typeof cue==='string'?cue:cue.id,rows=storyReceipts(ledger),last=stage=>rows.find(r=>r.stage===stage);
 let focus='先找到位置，再走进生活',question=openingQuestion,receipt=null,scope='地球 → 新疆 → 地点';
 if(water.has(id)){focus='01 留下来';question='有了水，怎样让家里与田里都能生活？';receipt=last('oasis');scope='吐鲁番 · 原创生活情境';}
 if(road.has(id)){focus='02 联系外界';question='有了停留的地方，怎样接上道路与交换？';receipt=last('market')??last('oasis');scope='山前节点 → 喀什 · 交流主题';}
 if(family.has(id)){focus='03 生活如何接续';question=id==='exchange-question'?'商旅可以继续走，迁来的家庭怎样留下来？':'一次国家调遣，怎样改变家庭的生活？';receipt=last('people')??last('market');scope='转入历史案例 · 1764—1765 锡伯西迁';}
 if(culture.has(id)){focus='04 让下一位接上';question='安顿之后，经验与记忆怎样由下一代接续？';receipt=last('culture')??last('people');scope='回到新疆 → 哈密 · 另一个社区的文化案例';}
 if(id.startsWith('modern-')){focus='05 共同安排空间';question='当几种需要同时出现，怎样给彼此留出空间？';receipt=last('logistics')??last('culture');scope='当代比较 · 2023 方案主题';}
 if(id.startsWith('future-')){focus='回到最初的问题';question=openingQuestion;receipt=last('logistics');scope='回看实际观察 · 各地点、年代与社区独立';}
 return {question,focus,receipt,rows,scope,closing:id.startsWith('future-'),next:receipt?.open??'沿着地图，把问题带到下一处'};
}
export function installInquiryUI(viewport){
 const el=document.createElement('aside');el.id='inquiry-spine';el.setAttribute('aria-label','贯穿故事的问题');el.innerHTML='<small></small><strong></strong>';
 document.getElementById('demo-player').append(el);let signature='';
 return {update(frame,visible){el.hidden=!visible;const next=frame.focus+frame.question;if(signature!==next){signature=next;el.querySelector('small').textContent=frame.focus;el.querySelector('strong').textContent=frame.question;}viewport.dataset.inquiry=frame.focus;viewport.dataset.openNeed=frame.next;}};
}
