const clamp=x=>Math.max(0,Math.min(1,x));
export const smootherStep=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export function smoothFacing(current,target,dt){return current+Math.atan2(Math.sin(target-current),Math.cos(target-current))*(1-Math.exp(-Math.max(0,dt)*5.5));}
export function responseEnvelope(age,start=7,duration=2){const t=(age-start)/duration;return t>0&&t<1?Math.sin(t*Math.PI)**2:0;}
// A small move on the same side of the action: hands first, then the recipient's
// face. It never crosses the performers' axis or recreates the scene on choice.
export function responseCamera(stage,pose,age){
 const position=[...(pose.position??pose.camera)],target=[...pose.target];
 const hands=smootherStep((age-2)/3)*(1-smootherStep((age-7)/3));
 const reply=smootherStep((age-7)/3);
 target[1]-=.12*hands;target[1]+=.1*reply;
 if(stage==='people'){target[0]-=.12*hands;target[2]+=.12*hands;}
 if(stage==='culture')target[0]+=.15*reply;
 // Stay on the established side of the action, but give hands and faces enough
 // pixels to read. Ease into the response, then release toward the next scene.
 const release=smootherStep((age-14)/4);
 const approach=(.10*hands+.26*reply)*(1-.72*release);
 position[1]-=.26*reply*(1-release);
 for(let i=0;i<3;i++)position[i]+=(target[i]-position[i])*approach;
 return {...pose,position,target};
}
