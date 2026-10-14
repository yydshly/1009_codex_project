import {smoothStep} from './motion.js';

const length = v => Math.hypot(...v);
const unit = v => v.map(x => x / length(v));
function direction(a,b,t) {
  const dot=Math.max(-1,Math.min(1,a.reduce((n,v,i)=>n+v*b[i],0)));
  if(dot>.9995)return unit(a.map((v,i)=>v+(b[i]-v)*t));
  let tangent=b.map((v,i)=>v-dot*a[i]);
  if(length(tangent)<1e-8){
    const axis=Math.abs(a[0])<.8?[1,0,0]:[0,1,0];
    const d=a.reduce((n,v,i)=>n+v*axis[i],0);
    tangent=axis.map((v,i)=>v-d*a[i]);
  }
  tangent=unit(tangent);const angle=Math.acos(dot)*t;
  return a.map((v,i)=>v*Math.cos(angle)+tangent[i]*Math.sin(angle));
}

// Globe movement follows the Earth's centre, even when the orbit target is
// near the surface. Interpolating around a changing local target can cut in.
export function globeFrame(from,to,oldTarget,target,progress) {
  if(progress<=0)return {position:[...from],target:[...oldTarget]};
  if(progress>=1)return {position:[...to],target:[...target]};
  const t=smoothStep(progress),a=length(from),b=length(to);
  const radius=3.2+Math.exp(Math.log(Math.max(.02,a-3.2))*(1-t)+Math.log(Math.max(.02,b-3.2))*t);
  const p=direction(unit(from),unit(to),t).map(v=>v*radius);
  const ra=length(oldTarget),rb=length(target);
  const focus=ra>.001&&rb>.001?direction(unit(oldTarget),unit(target),t).map(v=>v*(ra+(rb-ra)*t)):target.map((v,i)=>oldTarget[i]+(v-oldTarget[i])*t);
  return {position:p,target:focus};
}

export function eventMotion(from,to,reduced=false) {
  return {from,to,time:0,duration:reduced?0:Math.max(1.4,Math.abs(to-from)*4.8)};
}
export function eventMotionFrame(motion,dt) {
  const time=Math.min(motion.duration,motion.time+Math.max(0,dt));
  const t=motion.duration?time/motion.duration:1;
  return {time,progress:motion.from+(motion.to-motion.from)*smoothStep(t),done:t>=1};
}
