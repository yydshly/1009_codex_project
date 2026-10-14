// Normal foreground FPS follows elapsed time. A long blocking frame holds the
// missed interval so newly entered captions and replies cannot skip their start.
// A hidden document holds its clock; visibility resets the frame baseline.
export function frameHold(now,previous,hidden=false){
 const elapsed=previous>0&&Number.isFinite(now)&&now>=previous?(now-previous)/1000:0;
 return !hidden&&elapsed>.5?elapsed-.06:0;
}
export function frameDelta(now,previous,hidden=false){
 const elapsed=previous>0&&Number.isFinite(now)&&now>=previous?(now-previous)/1000:0;
 return {story:hidden?0:elapsed-frameHold(now,previous),animation:hidden?0:Math.min(elapsed,.06)};
}
