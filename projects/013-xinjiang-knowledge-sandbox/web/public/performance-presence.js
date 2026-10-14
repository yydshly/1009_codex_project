// Authored reaction timing. It follows a completed action, rather than
// inventing speech, personality, or a culturally specific gesture.
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function reactionFrame(age,{contactAt=3,replyAt=8,pending=false}={}){
 if(pending||!Number.isFinite(age)||age<0)return {phase:'waiting',hands:0,acknowledge:0,settled:0};
 const attention=ease((age-.3)/.8)*(1-ease((age-replyAt+.8)/1.1));
 const nod=x=>x>0&&x<1?Math.sin(Math.PI*x)**2:0;
 return {phase:age<contactAt?'approach':age<replyAt?'use':age<replyAt+3?'reply':'settle',
  hands:attention,acknowledge:nod((age-replyAt)/1.35)+.32*nod((age-replyAt-1.7)/.85),
  settled:ease((age-replyAt-2)/2)};
}
export function expressionForRecipient(frame){
 return frame.phase==='waiting'?'attentive':frame.phase==='approach'?'thoughtful':frame.phase==='use'?'attentive':frame.phase==='reply'?'grateful':'warm';
}
