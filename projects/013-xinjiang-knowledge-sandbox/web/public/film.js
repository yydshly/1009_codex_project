import {drawLocator} from './spatial-navigation.js';
import {scaleNames} from './spatial-spine.js';
import {presentationFrame,briefCaption} from './scene-presentation.js';
import {atlasScenes} from './atlas.js';
import {drawAnnotationFilm} from './story-annotations.js';
import {decisionScenes} from './scene-decisions.js';
const atlasImages=new Map();
function atlasImage(item){if(!atlasImages.has(item.id)){const image=new Image();image.src=item.image;atlasImages.set(item.id,image);}return atlasImages.get(item.id);}
atlasScenes.forEach(atlasImage);
// Recording-only composition: the live WebGL frame stays untouched.
// Captions and credits use exactly the same text as the cinematic player.
function wrapped(context, text, x, y, maxWidth, lineHeight) {
  let line = '';
  for (const char of text) {
    if(char==='\n'){context.fillText(line,x,y);y+=lineHeight;line='';continue;}
    if (context.measureText(line + char).width > maxWidth && line) {
      context.fillText(line, x, y); y += lineHeight; line = '';
    }
    line += char;
  }
  if (line) context.fillText(line, x, y);
  return y + lineHeight;
}
export function drawFilm(context, frame, width, height) {
  if (!frame) return;
  const scale = Math.min(width / 1280, height / 720);
  context.save(); context.scale(scale, scale);
  const w = width / scale, h = height / scale, x = 40;
  context.textBaseline = 'top';
  const shadeHeight=205;
  const shade = context.createLinearGradient(0, h - shadeHeight, 0, h);
  shade.addColorStop(0, '#05080c00'); shade.addColorStop(.4, '#05080cba'); shade.addColorStop(1, '#05080cf2');
  context.fillStyle = shade; context.fillRect(0, h - shadeHeight, w, shadeHeight);
  context.shadowColor = '#000'; context.shadowBlur = 6;
  context.fillStyle = '#e5efeb'; context.font = '18px "Microsoft YaHei", sans-serif';
  context.fillText('山河之间 / 新疆 · 连接之地', x, 26);
  if(frame.atlas){
    context.fillStyle='#13221acc';context.fillRect(20,75,345,355);
    context.fillStyle='#b8ccb3';context.font='11px "Microsoft YaHei", sans-serif';context.fillText('XINJIANG / AN INTERACTIVE ATLAS',x,95);
    context.fillStyle='#eef0de';context.font='68px "Microsoft YaHei", sans-serif';context.font=(frame.entryScale==='planet'?'42':'68')+'px Microsoft YaHei';context.fillText(frame.entryScale==='planet'?'从地球出发':'新疆',x,125);
    context.font='18px "Microsoft YaHei", sans-serif';context.fillText('来到新疆，再走进一个地点。',x,219);
    context.fillStyle='#bdc9b6';context.font='13px "Microsoft YaHei", sans-serif';wrapped(context,'先在地球建立位置。\n展开区域地形，再走进当地故事。',x,263,315,25);
    context.fillStyle='#b8cfbc';context.fillRect(x,339,165,42);context.fillStyle='#19362c';context.font='13px "Microsoft YaHei", sans-serif';context.fillText('跟随空间旅行 ↗',x+20,353);
    context.fillStyle='#c9d4bb';context.font='10px "Microsoft YaHei", sans-serif';context.fillText('地球 → 区域 → 地点 / 8 分 32 秒',x,398);
    context.fillStyle='#cbd5bb';context.font='14px "Microsoft YaHei", sans-serif';if(frame.entryScale!=='planet')context.fillText('从这里进入 / EXPLORE THE STORIES',x,h-194);
    const cardWidth=(w-80-50)/6;
    for(const [i,item] of (frame.entryScale==='planet'?[]:atlasScenes).entries()){const cx=x+i*(cardWidth+10),im=atlasImage(item);context.fillStyle='#17291f';context.fillRect(cx,h-168,cardWidth,123);if(im.complete&&im.naturalWidth){const ratio=cardWidth/73,cropH=im.naturalWidth/ratio,sy=Math.max(0,(im.naturalHeight-cropH)/2);context.drawImage(im,0,sy,im.naturalWidth,Math.min(cropH,im.naturalHeight),cx,h-168,cardWidth,73);}context.fillStyle='#b4c3a9';context.font='9px "Microsoft YaHei", sans-serif';context.fillText(item.type,cx+10,h-86);context.fillStyle='#edf0d8';context.font='13px "Microsoft YaHei", sans-serif';context.fillText(item.name,cx+10,h-67);}
    context.fillStyle='#aabdac';context.font='10px "Microsoft YaHei", sans-serif';context.fillText('真实高程与影像 / 生活场景为原创叙事 · 本片自动演示选择',x,h-25);
    context.restore();return;
  }
  const p=frame.presentation??presentationFrame(frame),location=frame.spatial;
  if(frame.bearing){context.fillStyle='#d4c49e';context.font='13px Microsoft YaHei';context.fillText(frame.bearing,40,51,w-320);}
  // Persistent compact bearing, rather than a second explanation panel.
  if(location){
   context.fillStyle='#11251c9c';context.fillRect(24,72,Math.min(520,w-48),68);
   context.fillStyle='#b4cbb7';context.font='10px Microsoft YaHei';context.fillText('地球  ›  新疆  ›  '+scaleNames[location.scale],36,82);
   context.fillStyle='#edf0d8';context.font='15px Microsoft YaHei';context.fillText(location.place,36,101,470);
   context.fillStyle='#a8bfaa';context.font='10px Microsoft YaHei';context.fillText(location.journey?.place?.era??location.lat.toFixed(2)+'°N · '+location.lon.toFixed(2)+'°E',36,124,470);
   if(p.map||frame.bearing){context.save();context.translate(w-214,72);drawLocator(context,location,180,95);context.restore();}
  }
  for(const l of location?.landmarks??[]){context.fillStyle='#e4dcae';context.font='12px Microsoft YaHei';context.fillText(l.name,l.x-context.measureText(l.name).width/2,l.y-6);}
  if(p.annotation&&!frame.ended)drawAnnotationFilm(context,frame.annotations,w,h);
  if(p.phase==='travel'){
   context.fillStyle='#ebebd4';context.font='22px Microsoft YaHei';wrapped(context,location?.leg?.phrase??'沿着地图，走近下一个地点。',x,h-94,w-80,30);
  }else if(p.title){
   context.fillStyle='#b4d2bd';context.font='11px Microsoft YaHei';context.fillText(frame.kicker,x,h-133);
   context.fillStyle='#f1f3e8';context.font='27px Microsoft YaHei';context.fillText(frame.ended?'带着实际回应，重新看见新疆。':frame.heading,x,h-110,w-80);
   context.fillStyle='#d1dccb';context.font='13px Microsoft YaHei';if(!frame.spokenCaption)wrapped(context,frame.ended?'五处选择留下了变化，也留下继续追问的需要。':briefCaption(frame.text),x,h-72,Math.min(w-80,900),22);
  }else if(p.choice){
   const d=frame.live?.decision;
   context.fillStyle='#10221fde';context.fillRect(40,h-212,Math.min(830,w-80),118);
   context.fillStyle='#e6ebcd';context.font='21px Microsoft YaHei';wrapped(context,d?.title??'第一道水，先送到家里还是田里？',56,h-201,790,27);
   context.fillStyle='#b7cbb3';context.font='12px Microsoft YaHei';wrapped(context,d?.need??'家里和田里都在等待。先让一方开始工作，再看另一方怎样接上。',56,h-165,790,21);
   const options=(decisionScenes[frame.id]?.choices??[{name:'先送到家里'},{name:'先送到田里'}]);
   options.forEach((o,i)=>{const bw=Math.min(230,760/options.length),bx=56+i*(bw+12);context.fillStyle='#243d33';context.fillRect(bx,h-133,bw,28);context.fillStyle='#e1e6cc';context.font='13px Microsoft YaHei';context.fillText(o.name,bx+10,h-125,bw-18);});
  }else if(p.dialogue){
   const d=frame.live.dialogue,cw=Math.min(700,w-80),cx=(w-cw)/2;
   context.fillStyle='#10221fd9';context.fillRect(cx,h-154,cw,104);
   context.fillStyle='#cfbd93';context.font='11px Microsoft YaHei';context.textAlign='center';context.fillText(d.role+' · 创作对白',w/2,h-142);context.textAlign='left';
   context.fillStyle='#f0f0dc';context.font='18px Microsoft YaHei';wrapped(context,d.text,cx+24,h-118,cw-48,28);
  }else if(p.status){
   const d=frame.live?.decision;
   context.fillStyle='#d8d5b4';context.font='14px Microsoft YaHei';context.fillText(d?(d.manual?'你的选择':'演示选择')+' · '+d.choiceName+' / '+d.phase:'演示选择 · '+(frame.live?.waterPlan==='field'?'先送到田里':'先送到家里'),x,h-108,w-80);
  }
  if(frame.spokenCaption){
   context.font='24px Microsoft YaHei';const sw=Math.min(w-80,context.measureText(frame.spokenCaption).width+36),sx=(w-sw)/2;
   context.fillStyle='#071513e6';context.fillRect(sx,h-72,sw,40);context.fillStyle='#fff';context.textAlign='center';context.fillText(frame.spokenCaption,w/2,h-66,sw-24);context.textAlign='left';
  }
  context.fillStyle='#8fa995';context.font='9px Microsoft YaHei';context.fillText(frame.credit,x,h-33,w-210);
  context.fillStyle='#cbdcc7';context.font='10px monospace';context.fillText(frame.clock,w-118,h-33);
  context.shadowBlur=0;context.fillStyle='#ffffff25';context.fillRect(x,h-16,w-80,2);context.fillStyle='#aac7ab';context.fillRect(x,h-16,(w-80)*frame.progress,2);
  context.restore();
}
