const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
// Generic authored gait, not motion capture or a culturally specific dance.
// Stance occupies 62% of a cycle; the remaining time lifts and returns the foot.
export function footCycle(phase,stride=.22){
 const p=((phase%1)+1)%1,stance=p<.62;
 const u=stance?p/.62:(p-.62)/.38;
 return {stance,...(stance?{z:stride*(.5-u),lift:0,pitch:.11*(1-2*u)}:{z:stride*(-.5+ease(u)),lift:.067*Math.sin(Math.PI*u)**1.4,pitch:-.19*Math.sin(Math.PI*u)})};
}
export function instrumentFrame(kind,time){
 const beat=((time*1.25)%1+1)%1;
 if(kind==='drum')return {left:[-.105,.64,.3],right:[.08,.63,.335+.075*Math.sin(beat*Math.PI)**2],pulse:Math.exp(-beat*20)};
 return {left:[-.11,.92,.265],right:[.06,.65,.323+.027*Math.sin(time*7.85)],pulse:0};
}
