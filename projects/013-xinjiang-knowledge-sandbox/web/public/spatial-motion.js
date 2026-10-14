import {contextFor,changesPlace} from './spatial-spine.js';
import {smoothStep,cameraFrame} from './motion.js';

// One easing pass per leg; map arrival and local arrival have exact endpoints.
export function spatialPlan(previous,next){
 if(next.id==='region-structure'&&previous?.key==='earth')return {kind:'unfold',duration:5200};
 if(!previous)return null;
 const a=contextFor(previous),b=contextFor(next),regional=c=>['terrain','history'].includes(c.key)&&!c.stage;
 if(['earth','migration'].includes(next.key)&&!next.stage&&!['earth','migration'].includes(previous.key))return {kind:'globe-return',duration:4400};
 if(regional(next)&&!regional(previous))return {kind:'map-return',duration:4600};
 if(['place','people'].includes(b.scale)&&(changesPlace(a,b)||regional(previous)||a.scale==='continent'||previous.stage!==next.stage))return {kind:'locate',duration:7400};
 return null;
}
export function flightTiming(kind,t){
 const clamp=x=>Math.max(0,Math.min(1,x));
 if(kind==='locate')return {approach:clamp(t/.54),handoff:clamp((t-.54)/.46),outgoing:1-smoothStep(t/.16),phase:t<.16?'establish':t<.54?'approach':'arrive'};
 if(kind==='unfold')return {approach:clamp(t),handoff:0,outgoing:0,globeOpacity:1-smoothStep(t/.32),phase:t<.3?'establish':'unfold'};
 return {approach:clamp(t),handoff:0,outgoing:1-smoothStep(t/.25),phase:t<.25?'establish':'return'};
}
export function arrivalPose(position,target){
 const offset=position.map((v,i)=>(v-target[i])*1.14);
 return {position:target.map((v,i)=>v+offset[i]+(i===1?.65:0)),target:[...target]};
}
export function flightCamera(from,to,oldTarget,target,t){return cameraFrame(from,to,oldTarget,target,t,0);}
// Advance only by rendered animation time. A suspended frame or a manual pause
// must not skip the geographic approach while the story clock stays held.
export function advanceFlight(elapsed,delta,paused,duration){
 return Math.min(duration,Math.max(0,elapsed)+(paused?0:Math.max(0,Math.min(delta,.06))*1000));
}
export const flightPhrases={
 'region-structure':'从球面上的新疆，展开山系与盆地。',
 'water-mountains':'沿天山靠近冰谷，观察来水的自然条件。',
 'water-ice':'水路接到地表，靠近家里与田里的具体需要。',
 'oasis-dry':'把用水之后的需要带回地图，寻找通向外界的道路。',
 'oasis-engineering':'从山地的用水问题，转向吐鲁番的地下工程。',
 'oasis-use':'留在吐鲁番，回看支撑日常的暗渠与维护。',
 'water-valley':'沿出水口回到绿洲，接上用水之后的生活。',
 'oasis-nodes':'沿山前节点向西，在盆地西缘找到喀什。',
 'exchange-goods':'沿盆地西缘的廊道，走进喀什的一次交换。',
 'exchange-question':'先在图上找到伊犁，再转入有明确年代的西迁案例。',
 'memory-departure':'时间回到1764年，镜头前往盛京一带的家庭准备。',
 'memory-journey':'拉远看东北与伊犁之间的西迁方向。',
 'memory-arrival':'沿西迁方向落到伊犁，再看抵达之后的生活。',
 'memory-muqam':'从伊犁日常回到区域，再看另一社区的文化实践。',
 'memory-practice':'在地图上找到哈密，再走进庭院里的传习。',
 'modern-hubs':'从社区实践拉远，转向当代区域联系。',
 'modern-urumqi':'定位乌鲁木齐，观察加工与物流怎样组织。',
 'modern-kashgar':'从区域协作走到伊犁谷地，找到霍尔果斯。',
 'modern-rules':'沿关口位置靠近，再看人的通行与等待需求。',
 'future-landscape':'留在同一处关口，看看选择留下的回应与缺口。',
 'future-budget':'保留刚才的安排，继续观察仍然存在的等待与维护。',
 'future-synthesis':'拉远，把具体地点重新放回新疆。',
 'future-result':'再回到地球，看这些地点如何彼此联系。',
};
