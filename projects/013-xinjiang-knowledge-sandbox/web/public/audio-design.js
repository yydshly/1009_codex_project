// Independently authored sound textures and Foley. No field recordings or
// culturally specific music are simulated as documentary evidence.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function random(seed){let n=seed>>>0;return()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296*2-1;};}
export const environmentProfiles=['space','mountain','water','desert','market','home','courtyard','gate'];
export function environmentFor(cue){
 if(cue.stage)return ({oasis:'water',nature:'mountain',market:'market',people:'home',culture:'courtyard',logistics:'gate'})[cue.stage]??'space';
 return ({glacier:'mountain',local:'water',yardang:'desert',karez:'water'})[cue.key]??'space';
}
export function ambientSamples(profile,rate,seconds=17){
 const out=new Float32Array(Math.round(rate*seconds)),rng=random(631+environmentProfiles.indexOf(profile)*719);
 let brown=0,low=0,mid=0;
 for(let i=0;i<out.length;i++){
  const t=i/rate,n=rng();brown=(brown+.021*n)/1.021;low+=.012*(n-low);mid+=.095*(n-mid);
  const air=(brown*.75+(mid-low)*.13)*(1+.18*Math.sin(t*.71)+.12*Math.sin(t*1.31));
  let v=air;
  if(profile==='space')v=air*.28;
  if(profile==='mountain')v=air*1.35+(mid-low)*.025*(.5+.5*Math.sin(t*.41));
  if(profile==='desert')v=air*1.05+(n-mid)*.018*(.5+.5*Math.sin(t*.8));
  if(profile==='water')v=air*.3+(mid-low)*.5*(.7+.18*Math.sin(t*3.7))+.018*Math.sin(2*Math.PI*(920*t+.8*Math.sin(t*6.1)))*Math.max(0,Math.sin(t*9.4))**12;
  // Distant, nonverbal crowd texture: no words or invented cultural dialogue.
  if(profile==='market')v=air*.55+low*.4*(.4+.3*Math.sin(t*4.1)**2)+.017*Math.sin(t*2*Math.PI*157)*Math.max(0,Math.sin(t*2.6))**4;
  if(profile==='home')v=air*.5+(mid-low)*.06*(.5+.5*Math.sin(t*2.3));
  if(profile==='courtyard'){
   const chirp=Math.max(0,Math.sin(t*.83-.9))**40;
   v=air*.45+.017*chirp*Math.sin(2*Math.PI*(2200*t+130*Math.sin(t*11)));
  }
  if(profile==='gate')v=air*.55+.045*(Math.sin(t*2*Math.PI*64)+.38*Math.sin(t*2*Math.PI*129))*(.35+.3*Math.sin(t*.64)**2)+low*.13;
  // A short equal-power edge envelope makes the authored texture loop cleanly.
  const edge=Math.min(1,t/.12,(seconds-t)/.12);out[i]=clamp(v*edge,-.35,.35);
 }
 return out;
}
export function foleySamples(kind,rate,variant=0){
 const length=kind==='cloth'?.28:kind==='paper'?.22:kind==='pluck'?1.1:kind==='drum'?.32:kind==='latch'?.24:.18;
 const out=new Float32Array(Math.round(rate*length)),rng=random(5127+variant*97);let low=0;
 for(let i=0;i<out.length;i++){
  const t=i/rate,n=rng();low+=.09*(n-low);const attack=Math.min(1,t/.004);
  let v=(low*.65+(n-low)*.075)*Math.exp(-t*27)+.25*Math.sin(2*Math.PI*74*t)*Math.exp(-t*48);
  if(kind==='cloth'||kind==='paper')v=(kind==='cloth'?low:n-low)*.25*Math.sin(Math.PI*t/length)**2*(.7+.3*Math.sin(t*160));
  if(kind==='wood')v=.45*Math.sin(t*2*Math.PI*178)*Math.exp(-t*36)+n*.08*Math.exp(-t*65);
  if(kind==='clay')v=(.31*Math.sin(t*2*Math.PI*810)+.18*Math.sin(t*2*Math.PI*1330))*Math.exp(-t*35)+low*.06;
  if(kind==='latch')v=(.25*Math.sin(t*2*Math.PI*1280)+.17*Math.sin(t*2*Math.PI*2073))*Math.exp(-t*35)+n*.12*Math.exp(-t*80);
  if(kind==='drum')v=.48*Math.sin(2*Math.PI*(124*t-8*t*t))*Math.exp(-t*15)+low*.3*Math.exp(-t*45);
  if(kind==='pluck')v=(.28*Math.sin(t*2*Math.PI*196)+.14*Math.sin(t*2*Math.PI*392)+.07*Math.sin(t*2*Math.PI*588))*Math.exp(-t*6)+n*.035*Math.exp(-t*90);
  out[i]=clamp(v*attack,-.85,.85);
 }
 return out;
}
// A contact is emitted only when an advancing, distance-driven gait enters
// support. Teleports, stationary rigs and pause/resume never make fake steps.
export function footContacts(previous,next,blend,moving){
 if(!moving||blend<.25||next<=previous||next-previous>.15)return [];
 const hits=[];
 for(const [foot,offset] of [['left',0],['right',.5]])if(Math.floor(next+offset)>Math.floor(previous+offset))hits.push({kind:'step',foot,phase:next});
 return hits;
}
export function instrumentContacts(previous,next,kind,performing){
 if(!kind||!performing||previous===null||next<=previous||next-previous>.15)return [];
 const before=previous*1.25,after=next*1.25;
 return Math.floor(after)>Math.floor(before)?[{kind:kind==='drum'?'drum':'pluck',phase:after}]:[];
}
export function crossed(previous,next,threshold){return Number.isFinite(previous)&&previous<threshold&&next>=threshold;}
