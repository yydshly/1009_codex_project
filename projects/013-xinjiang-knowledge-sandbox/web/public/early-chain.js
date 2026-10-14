// Independent places share an inquiry, never a measured watercourse or a cargo.
// These work orders are authored choreography, not irrigation measurements.
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function waterSequence(age,plan){
 const chosen=['home','field'].includes(plan),first=chosen?ease((age-.35)/3.4):0,second=chosen?ease((age-9.2)/3.2):0;
 return {home:plan==='home'?first:second,field:plan==='field'?first:second,
  phase:!chosen?'need':age<3.8?'arrival':age<9.2?'first-and-waiting':age<12.4?'second-arrival':'both-working',
  first:plan==='field'?'field':'home',waiting:chosen&&age<12.4?(plan==='field'?'home':'field'):null};
}
const mixPose=(a,b,u)=>({position:a.position.map((v,i)=>v+(b.position[i]-v)*u),target:a.target.map((v,i)=>v+(b.target[i]-v)*u)});
const wide={position:[7.2,6.8,10.4],target:[.5,.65,.1]},gate={position:[-3.3,3.8,7],target:[.1,.48,-.25]};
const home={position:[3.6,2.6,6.8],target:[3.1,.78,1.8]},field={position:[6.6,3.1,3.4],target:[4.35,.68,-1.85]};
export function waterCamera(plan,age,mode,elapsed=0){
 if(mode==='maintenance')return mixPose(wide,{position:[-5.6,2.5,4.3],target:[-4.6,.55,-.35]},ease((elapsed-1)/5));
 if(mode==='continue')return mixPose(wide,{position:[-4.7,2.6,6.2],target:[-3.9,.65,1.65]},ease((elapsed-1)/4));
 if(!plan)return wide;
 const first=plan==='home'?home:field,second=plan==='home'?field:home;
 const shots=[[0,wide],[2.4,gate],[4.8,first],[9.9,first],[12.5,wide],[15.4,second],[19.8,wide]];
 for(let i=1;i<shots.length;i++)if(age<shots[i][0])return mixPose(shots[i-1][1],shots[i][1],ease((age-shots[i-1][0])/(shots[i][0]-shots[i-1][0])));
 return wide;
}
export function marketUse(age,goods){
 const received=Number.isFinite(age)&&age>=0;
 return {received,use:received?ease((age-1)/3):0,continue:received?ease((age-6)/5):0,
  kind:['cloth','supplies','craft'][goods],waiting:[0,1,2].filter(i=>!received||i!==goods)};
}
export function earlyBearing(cue,ledger={}){
 if(['earth-arrival','water-inland','region-structure','region-ice','water-mountains'].includes(cue))return '地球 → 新疆 → 天山一号冰川';
 if(['oasis-engineering','water-ice','water-flow','oasis-use','water-valley'].includes(cue))return '转到吐鲁番 · 比较用水需要';
 if(['oasis-dry','oasis-wind','exchange-network','oasis-nodes','exchange-stops','exchange-goods','exchange-city'].includes(cue))return ledger.oasis?.replied?(ledger.oasis.plan==='field'?'用水后的生产与补给 → 喀什集市':'用水后的家庭照应 → 喀什集市'):'新疆 → 山前道路 → 喀什集市';
 return null;
}
