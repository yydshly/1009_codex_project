// Pure geometry helpers, shared by the renderer and its dateline tests.
export function countrySegments(paths, radius=3.242, step=.65){
 const out=[],seen=new Set(),point=(lon,lat)=>{const a=lon*Math.PI/180,b=lat*Math.PI/180;return [radius*Math.cos(b)*Math.cos(a),radius*Math.sin(b),-radius*Math.cos(b)*Math.sin(a)];};
 for(const path of paths)for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i];let dx=b[0]-a[0];dx=((dx+540)%360)-180;
  const key=[a.join(','),b.join(',')].sort().join('|');if(seen.has(key))continue;seen.add(key);
  const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(b[1]-a[1]))/step));
  let previous=point(...a);for(let j=1;j<=n;j++){const next=point(a[0]+dx*j/n,a[1]+(b[1]-a[1])*j/n);out.push(...previous,...next);previous=next;}
 }
 return out;
}
export function unwrappedRing(ring){let last=ring[0]?.[0]??0;return ring.map(([lon,lat],i)=>{if(i){while(lon-last>180)lon-=360;while(lon-last< -180)lon+=360;}last=lon;return [lon,lat];});}
export function countryLabelEligible(item,{distance,width,selected,topic}){
 if(item.id===selected||item.id==='china')return true;
 const neighbors=['russia','mongolia','kazakhstan','kyrgyzstan','tajikistan','afghanistan','pakistan','india'];
 if(neighbors.includes(item.id))return distance<10||topic==='neighbors'||['russia','mongolia','kazakhstan','india'].includes(item.id);
 if(['neighbors','relief'].includes(topic)&&(item.lon<40||item.lon>140||item.lat<12||item.lat>65))return false;
 return item.rank<=(distance<5.8?5:distance<9?4:3)&&item.minLabel<=(width<500?3:distance<7.5?5:3.8);
}

// The canvas height matters as much as its width: a 660px phone layout has a
// short globe above its reading panel, not a desktop-sized map.
export function countryLabelBudget(width,height,{detail=false,topic='position'}={}){
 const short=Math.min(width,height);
 let budget=short<450?10:width<700||height<560?14:22;
 if(topic==='relief')budget=Math.max(6,budget-5);
 if(detail)budget=Math.min(36,Math.ceil(budget*1.7));
 return budget;
}
export function worldHandoffFrame(seconds){
 const fade=(start,duration)=>{const t=Math.max(0,Math.min(1,(seconds-start)/duration));return 1-t*t*(3-2*t);};
 return {labels:fade(0,.65),surface:fade(.2,1.5)};
}
