import {regionBoundary} from './region-boundary.js';
import {mapFeatures} from './map-learning-content.js';
import {relationGeometry,relationById} from './spatial-relations.js';
// A small, north-up locator using the same raster bounds and geographic data
// as the live Earth. Kept in the information rail, outside the 3D viewing area.
export function createSpatialContextMap(){
 const image=new Image();image.src=new URL('./assets/xinjiang-blue-marble-500m.jpg',import.meta.url).href;
 let lastCanvas=null,lastKey='',previous=null;
 image.onload=()=>{lastKey='';if(previous)update(...previous);};
 function update(canvas,{path='zhang',selected,kind='geography',index=0,records=[]}={}){
  if(!canvas)return;previous=[canvas,{path,selected,kind,index,records}];
  const key=[path,selected,kind,index,records.map(r=>r.priority).join(',')].join('/');
  if(canvas===lastCanvas&&key===lastKey)return;lastCanvas=canvas;lastKey=key;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const xy=([lon,lat])=>[(lon-73)/23*w,(49-lat)/14*h];
  ctx.fillStyle='#172a25';ctx.fillRect(0,0,w,h);if(image.complete&&image.naturalWidth){ctx.globalAlpha=.68;ctx.drawImage(image,0,0,w,h);ctx.globalAlpha=1;}
  function line(points,color,width=1.5){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>{const [x,y]=xy(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}
  line([...regionBoundary,regionBoundary[0]],'#edd49c',1);
  if(path==='glacier'){
   line(mapFeatures.find(f=>f.id==='tianshan').shape,'#b5d7b8',2);const [x,y]=xy([86.817,43.1]);ctx.fillStyle='#ffe5a0';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffe5a0';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.stroke();ctx.font='bold 11px sans-serif';ctx.fillText('一号冰川',x-30,y-17);ctx.fillStyle='#f7eccf';ctx.fillText('天山 · 地理参照',8,h-8);ctx.fillText('北 ↑',w-32,14);return;
  }
  const r=relationById(path),g=relationGeometry(path,'region',selected??r.place);
  if(path==='zhang'){
   for(const id of ['tianshan','kunlun'])line(mapFeatures.find(f=>f.id===id).shape,'#b5d7b8',1.4);
   if(kind!=='position')line(mapFeatures.find(f=>f.id==='tarim-water').shape,'#66cdd4',1.4);
  }
  if(['history','place','market','return'].includes(kind))for(const l of g.lines)line(l.points,l.kind==='local'?'#8dd9c6':'#f3c875',2);
  const activeId=selected??r.place;
  const nodes=g.nodes.filter(n=>(n.selectable||n.id===activeId||path==='zhang'&&n.id==='dunhuang')&&n.anchor[0]>=73&&n.anchor[0]<=96&&n.anchor[1]>=35&&n.anchor[1]<=49);
  ctx.font='bold 11px sans-serif';ctx.textBaseline='middle';
  for(const n of nodes){const [x,y]=xy(n.anchor),active=n.id===(selected??r.place);ctx.fillStyle=active?'#ffe5a0':'#a4e1c5';ctx.beginPath();ctx.arc(x,y,active?5:3,0,Math.PI*2);ctx.fill();if(active){ctx.strokeStyle='#ffdf94';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.stroke();}const labelX=x>w-48?x-5:x+7;ctx.textAlign=x>w-48?'right':'left';ctx.lineWidth=4;ctx.strokeStyle='#12291e';ctx.strokeText(n.name.split(' · ')[0],labelX,y-12);ctx.fillStyle='#f2eddb';ctx.fillText(n.name.split(' · ')[0],labelX,y-12);}
  ctx.textAlign='right';ctx.fillStyle='#f7eccf';ctx.fillText('北 ↑',w-8,12);
  const outside=g.nodes.find(n=>n.id===activeId&&!nodes.includes(n));if(outside){ctx.textAlign='left';ctx.font='10px sans-serif';ctx.fillText('区域外参照 · '+outside.name,8,12);}
  if(records.length){ctx.textAlign='left';ctx.font='10px sans-serif';ctx.fillStyle='#ffe0a0';ctx.fillText('● 已看见 '+records.length+' 项回应',8,h-9);}
 }
 return {update};
}
