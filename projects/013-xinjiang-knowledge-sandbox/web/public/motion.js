// Interpolate around the subject rather than cutting through it.
export const smoothStep = t => { const x = Math.max(0, Math.min(1, t)); return x*x*x*(x*(x*6-15)+10); };
const mix = (a,b,t) => a+(b-a)*t;
const polar = (p,target) => {
  const [x,y,z] = p.map((v,i)=>v-target[i]), r=Math.hypot(x,y,z);
  return {r:Math.max(.01,r),theta:Math.atan2(x,z),phi:Math.acos(Math.max(-1,Math.min(1,y/Math.max(.01,r))))};
};
export function cameraFrame(from,to,oldTarget,target,progress,lift=.05) {
  const t=smoothStep(progress), a=polar(from,oldTarget),b=polar(to,target);
  const delta=Math.atan2(Math.sin(b.theta-a.theta),Math.cos(b.theta-a.theta));
  const theta=a.theta+delta*t,phi=mix(a.phi,b.phi,t);
  const r=Math.exp(mix(Math.log(a.r),Math.log(b.r),t))*(1+Math.sin(Math.PI*t)*lift);
  const focus=target.map((v,i)=>mix(oldTarget[i],v,t));
  return {target:focus,position:[r*Math.sin(phi)*Math.sin(theta)+focus[0],r*Math.cos(phi)+focus[1],r*Math.sin(phi)*Math.cos(theta)+focus[2]]};
}
export function phaseFrame(from,to,progress) {return mix(from,to,smoothStep(progress));}
