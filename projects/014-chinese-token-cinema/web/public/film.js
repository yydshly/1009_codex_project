// Deterministic code-composited film: same renderer for playback and MP4 export.
// Curved links/particle locations are editorial design, not GPT-2 attention data.
import {songMotion,shotAt} from './song-motion.js';
import {createPerformanceTrack} from './performance-video.js';
const W = 1600, H = 900;
const SANS = '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif';
const MONO = 'Consolas, monospace';
const BLUE = '#92bed0', ORANGE = '#f2ac70', WHITE = '#e7edf1';
const clamp = (x,a=0,b=1) => Math.max(a, Math.min(b,x));
const smooth = x => { x=clamp(x); return x*x*(3-2*x); };
const hash = x => { const n=Math.sin(x*127.1+311.7)*43758.5453;return n-Math.floor(n); };

export async function createFilm(canvas, timeline, model, score, onMediaFrame = () => {}) {
  const ctx = canvas.getContext('2d', {alpha:false});
  const singing=timeline.kind==='song';
  const performance=createPerformanceTrack(timeline.performanceClips, timeline.duration, onMediaFrame);
  const images = await Promise.all((timeline.scenes||['server','rain','shore']).map(name => new Promise((resolve,reject) => {
    const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('场景加载失败：'+name));im.src='./assets/'+name+'.png';
  })));
  const pointSources=images.map(im=>{
    const sample=document.createElement('canvas');sample.width=160;sample.height=90;
    const c=sample.getContext('2d',{willReadFrequently:true});c.drawImage(im,0,0,160,90);
    return c.getImageData(0,0,160,90).data;
  });
  const options={words:true,data:true,links:true,subtitleStyle:'expressive',soundtrack:singing?'song':'emotional'};
  let measuredEnergy=0,motion={beat:0,onset:0,stress:0,hold:0,progress:0};
  function text(value,x,y,size=14,color=WHITE,font=SANS,weight=400){ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font}`;ctx.fillText(value,x,y);}
  function line(x1,y1,x2,y2,color='#749aaf55',width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function image(im,t,phase,alpha=1,shot=null){
    ctx.save();ctx.globalAlpha=alpha;
    const iw=im.videoWidth||im.width,ih=im.videoHeight||im.height;
    const scale=Math.max(W/iw,H/ih)*(shot?shot.zoom+motion.beat*.002:1.02+.025*Math.sin(t*.045+phase));
    const w=iw*scale,h=ih*scale;
    const x=shot?(W-w)*(shot.focusX??.7)+(shot.pan||0)*(shot.progress-.5):(W-w)/2+Math.sin(t*.07+phase)*8;
    const y=shot?(H-h)*(shot.focusY??.4)+motion.beat*1.2:(H-h)/2;
    ctx.drawImage(im,x,y,w,h);ctx.restore();
  }
  function points(t,index,amount){
    if(amount<=0)return;
    const colors=pointSources[index];ctx.save();ctx.globalAlpha=amount;
    ctx.fillStyle='#061019';ctx.fillRect(0,0,W,H);
    const drift=(1-amount)*26;
    for(let y=0;y<90;y++)for(let x=0;x<160;x++){
      if(hash(x+y*160)<.22)continue;
      const k=(y*160+x)*4;const r=colors[k],g=colors[k+1],b=colors[k+2];
      const bright=(r+g+b)/3;
      if(bright<17)continue;
      const px=x*10+Math.sin(t*.55+y*.1+x*.03)*drift,py=y*10+Math.cos(t*.4+x*.11)*drift;
      ctx.fillStyle=`rgba(${r},${g},${b},${.38+bright/350})`;
      const rad=.65+bright/150;ctx.fillRect(px,py,rad*1.5,rad*1.5);
    }
    // Structured grid is a visual scaffold, deliberately unlabelled as weights.
    for(let i=0;i<8;i++)line(60+i*180,80,60+i*180,810,'#60839815');
    for(let i=0;i<6;i++)line(60,80+i*135,1500,80+i*135,'#60839815');
    ctx.restore();
  }
  function corners(){
    for(const [x,y,sx,sy] of [[44,40,1,1],[1556,40,-1,1],[44,854,1,-1],[1556,854,-1,-1]]){
      line(x,y,x+18*sx,y,'#96b4c45a');line(x,y,x,y+18*sy,'#96b4c45a');
    }
  }
  function prediction(record,t,cue){
    if(!options.data||!record?.prediction)return;
    const active=cue.timings.findIndex(span=>t>=span.start&&t<span.end);
    const p=record.groups[active]?.prediction||record.prediction;
    const x=78,y=370,w=380,h=214;
    ctx.fillStyle='#061019c9';ctx.fillRect(x,y,w,h);
    line(x,y,x+w,y,'#7ba1b84a');
    text('NEXT TOKEN  /  GPT-2 SMALL',x+18,y+27,12,BLUE,MONO);
    text('真实推理 · 词组起点的下一片段',x+18,y+48,10,'#6c929f');
    for(let i=0;i<3;i++){
      const c=p.candidates[i],yy=y+81+i*31;
      const label=c.decoded.trim()&&!c.decoded.includes('�')?c.decoded.replace(/\n/g,'↵').slice(0,7):`片段 #${c.id}`;
      text(label,x+18,yy,14,i===0?WHITE:'#8ca2ae',SANS);
      const bar=Math.min(137,c.p*210);
      ctx.fillStyle='#28404d';ctx.fillRect(x+141,yy-11,137,3);
      ctx.fillStyle=i===0?ORANGE:BLUE;ctx.fillRect(x+141,yy-11,bar,3);
      text((c.p*100).toFixed(1)+'%',x+299,yy,12,i===0?ORANGE:'#7c97a8',MONO);
    }
    line(x+18,y+161,x+w-18,y+161,'#314b5a');
    text('本句实际片段',x+18,y+187,11,'#7d97a5');
    text('#'+p.actual,x+119,y+187,13,ORANGE,MONO);
    text('p '+p.pActual.toExponential(2),x+215,y+187,12,BLUE,MONO);
    const pulse=(Math.sin(t*2)+1)/2;
    ctx.fillStyle=`rgba(242,172,112,${.35+pulse*.5})`;ctx.fillRect(x+w-21,y+20,3,3);
  }
  function classicTiles(cue,record,t){
    if(!options.words||!cue)return;
    const y=751,groups=cue.groups;
    ctx.font=`500 24px ${SANS}`;
    const widths=groups.map((word,i)=>Math.max(ctx.measureText(word).width+28,Math.min(120,((record?.groups[i]?.ids.length||1)*19))));
    const total=widths.reduce((a,b)=>a+b,0)+8*(groups.length-1);
    let x=Math.max(78,(W-total)/2);
    const centers=[];const active=cue.timings.findIndex(span=>t>=span.start&&t<span.end);
    ctx.fillStyle='#050b129c';ctx.fillRect(0,700,W,132);
    for(let i=0;i<groups.length;i++){
      const span=cue.timings[i],selected=i===active,spoken=t>=span.end;
      const isSelf=groups[i]==='我';
      const top=y-5-(selected?3:0);
      ctx.fillStyle=selected?'#264352ee':isSelf?'#382a22e8':'#101b25dd';ctx.fillRect(x,top,widths[i],50);
      if(selected){ctx.fillStyle=ORANGE;ctx.fillRect(x,top+48,widths[i],2);}
      const ids=record?.groups[i]?.ids||[];
      const idText=ids.join('·');
      text(idText,x+5,y-15,Math.max(8,Math.min(10,(widths[i]-10)/(Math.max(idText.length,1)*.56))),selected?ORANGE:'#7091a2',MONO);
      const color=isSelf?ORANGE:selected?WHITE:spoken?'#adc4d0':'#6e8798';
      ctx.font=`500 24px ${SANS}`;const tw=ctx.measureText(groups[i]).width;
      text(groups[i],x+(widths[i]-tw)/2,top+32,24,color,SANS,500);
      centers.push(x+widths[i]/2);x+=widths[i]+8;
    }
    if(options.links&&centers.length>1){
      const destination=active>=1?active:Math.min(2,centers.length-1);
      for(let i=0;i<destination;i++){
        const a=centers[i],b=centers[destination];
        ctx.strokeStyle=i===0?'#f2ac707d':'#7caac966';ctx.lineWidth=i===0?1.4:1;
        ctx.beginPath();ctx.moveTo(a,y-32);ctx.quadraticCurveTo((a+b)/2,y-77-Math.abs(a-b)*.11,b,y-32);ctx.stroke();
        ctx.fillStyle=BLUE;ctx.fillRect(b-2,y-34,4,4);
      }
      text('关联弧线 · 视觉编排',78,827,9,'#657f8e',SANS);
    }
    text('CHINESE PHRASES  /  BYTE-LEVEL TOKEN IDS',W-452,827,9,'#657f8e',MONO);
  }
  function rounded(x,y,w,h,r,fill,stroke){
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
  }
  function curvedArrow(a,b,height,color,strength,t,broken=false,variant=0){
    const dx=b.x-a.x;
    height*=1+(singing?motion.hold*.22+motion.beat*.06:0);
    const p0=a,p1={x:a.x+dx*.26,y:a.y-height},p2={x:b.x-dx*.26,y:b.y-height},p3=b;
    const at=q=>{const r=1-q;return{x:r*r*r*p0.x+3*r*r*q*p1.x+3*r*q*q*p2.x+q*q*q*p3.x,y:r*r*r*p0.y+3*r*r*q*p1.y+3*r*q*q*p2.y+q*q*q*p3.y};};
    const begin=broken?.12:0,end=broken?.78:1;
    ctx.save();ctx.globalAlpha=strength;
    ctx.strokeStyle=color;ctx.lineWidth=1.6+measuredEnergy*2+(singing?motion.beat*.9+motion.onset*.45:0);
    ctx.setLineDash(broken?[5,6]:[]);ctx.lineDashOffset=-t*8;
    ctx.beginPath();
    for(let n=0;n<=36;n++){const p=at(begin+(end-begin)*n/36);if(n===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
    ctx.stroke();ctx.setLineDash([]);
    // The tip follows the curve tangent; a gap means an interrupted signal.
    const tip=at(end),before=at(end-.025),angle=Math.atan2(tip.y-before.y,tip.x-before.x);
    const size=6+strength*2;
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(tip.x,tip.y);
    ctx.lineTo(tip.x-Math.cos(angle-.44)*size,tip.y-Math.sin(angle-.44)*size);
    ctx.lineTo(tip.x-Math.cos(angle+.44)*size,tip.y-Math.sin(angle+.44)*size);ctx.closePath();ctx.fill();
    const q=begin+(singing?clamp(motion.progress+variant*.08):((t*.57+variant*.21)%1))*(end-begin),bead=at(q);
    ctx.shadowColor=color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(bead.x,bead.y,1.7+measuredEnergy*2,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  const layouts=[
    {x:105,y:760,mode:'chain'}, {x:120,y:748,mode:'back'},
    {x:290,y:767,mode:'chain'}, {x:185,y:770,mode:'back'},
    {x:235,y:760,mode:'broken'}, {x:148,y:746,mode:'broken'},
    {x:520,y:770,mode:'fan'}, {x:235,y:770,mode:'bridge'},
    {x:120,y:750,mode:'fan'}, {x:225,y:751,mode:'bridge'},
    {x:525,y:754,mode:'question'}, {x:540,y:736,mode:'answer'}
  ];
  function expressiveTiles(cue,record,t,index){
    if(!options.words||!cue)return;
    const layout=cue.layout||layouts[index]||layouts[index%layouts.length],spans=cue.timings;
    const live=spans.findIndex(span=>t>=span.start&&t<span.end);
    const active=live>=0?live:t<cue.start?0:Math.max(0,spans.findLastIndex(span=>t>=span.start));
    const count=Math.min(4,cue.groups.length);
    const first=Math.min(Math.max(0,active-2),Math.max(0,cue.groups.length-count));
    const visible=cue.groups.slice(first,first+count);
    const positions=[];
    let x=layout.x;
    // Present a phrase at a time, with independent incoming and departing tiles.
    visible.forEach((word,local)=>{
      const i=first+local,span=spans[i],self=word==='我';
      const selected=i===active&&t>=cue.start;
      const future=t<span.start;
      const accent=singing?(span.accent||0):0;
      const rise=selected?(1-smooth((t-span.start)/.18))*(9+accent*8)+motion.beat*accent*2:0;
      const key=['我','你','感受','回响','这里','吗','在'].includes(word);
      const size=selected?(key?43:39)+(singing?Math.round(accent*4+motion.hold*3):0):34;
      ctx.font=`600 ${size}px ${SANS}`;
      const w=Math.max(100,ctx.measureText(word).width+31),h=64;
      const y=layout.y-rise-(selected?5:0);
      const alpha=future?.4:i<active?.85:1;
      const fill=self?'#efab70':selected?'#a9c9d8':'#070e17e8';
      ctx.save();ctx.globalAlpha=alpha;
      rounded(x,y-h,w,h,5,fill,selected?'#d2e6ef':self?'#ffcd99':'#7690a85a');
      const ink=self||selected?'#111b22':'#e5edf1';
      text(word,x+15,y-17,size,ink,SANS,600);
      if(selected){ctx.fillStyle=ORANGE;ctx.fillRect(x+10,y+6,w-20,2);}
      const ids=record.groups[i].ids;
      ctx.font=`11px ${MONO}`;
      const lines=[];let row='';
      ids.forEach(id=>{const next=row?row+'·'+id:String(id);if(ctx.measureText(next).width>w-2&&row){lines.push(row);row=String(id);}else row=next;});
      if(row)lines.push(row);
      lines.forEach((value,j)=>text(value,x+2,y-h-12-(lines.length-1-j)*14,11,self?ORANGE:selected?'#a5c7d9':'#708a9b',MONO));
      ctx.restore();
      positions.push({i,x:x+w/2,y:y-h-21-lines.length*14,w,selected,self});
      x+=w+(index===1&&word==='拆成'?26:14);
    });
    if(options.links&&positions.length){
      const current=positions.find(p=>p.i===active)||positions[positions.length-1];
      const past=positions.filter(p=>p.i<active);
      const future=positions.find(p=>p.i>active);
      const amber=ORANGE,blue='#9abed5';
      const draw=(from,to,h,color,strong=1,broken=false,n=0)=>curvedArrow(from,to,h,color,strong,t,broken,n);
      if(layout.mode==='chain'){
        // Adjacent short links, plus one longer contextual return.
        past.slice(-2).forEach((p,j)=>{const next=positions.find(q=>q.i===p.i+1);if(next)draw(next,p,26+j*13,p.self?amber:blue,.4+j*.2,false,j);});
        if(past.length>2)draw(current,past[0],86,blue,.38,false,2);
      }else if(layout.mode==='back'){
        const self=past.find(p=>p.self)||past[0];
        if(self)draw(current,self,48+Math.abs(current.x-self.x)*.055,self.self?amber:blue,.86,false,1);
        const close=past[past.length-1];if(close&&close!==self)draw(current,close,25,blue,.42,false,2);
      }else if(layout.mode==='fan'){
        past.forEach((p,j)=>draw(current,p,30+j*24,p.self?amber:blue,.35+j*.16,false,j));
        if(future)draw(current,future,28,blue,.26,true,3);
      }else if(layout.mode==='broken'){
        const target=past.find(p=>p.self)||past[past.length-1];
        if(target)draw(current,target,42,amber,.48,true,1);
        if(past.length>1)draw(current,past[0],79,blue,.25,true,2);
      }else if(layout.mode==='bridge'){
        if(past.length)draw(current,past[0],66,amber,.78,false,1);
        if(future)draw(current,future,32,blue,.4,true,2);
      }else if(layout.mode==='question'){
        if(past.length)draw(current,past[0],60,blue,.53,true,1);
        if(future)draw(current,future,34,amber,.4,true,2);
      }else if(layout.mode==='answer'){
        if(positions.length>1)draw(positions[1],positions[0],39,amber,.96,false,1);
      }
      if(!past.length&&layout.mode!=='answer'){
        // A local loop begins the thought; it is not a fabricated attention score.
        draw({x:current.x+17,y:current.y},{x:current.x-17,y:current.y},33,current.self?amber:blue,.45,layout.mode==='question',0);
      }
      text('关联连线 · 视觉编排',78,827,10,'#657f8e');
    }
    text('BYTE-LEVEL TOKEN IDS',W-372,827,10,'#657f8e',MONO);
  }
  function draw(t){
    t=clamp(t,0,timeline.duration);ctx.clearRect(0,0,W,H);
    let index=timeline.cues.findIndex(c=>t>=c.start&&t<=c.end+(singing?0:1));
    if(index<0){index=timeline.cues.findLastIndex(c=>t>c.start);if(index<0)index=0;}
    const cue=timeline.cues[index],record=model.records[index];
    motion=singing?songMotion(score,t,cue):{beat:0,onset:0,stress:0,hold:0,progress:0};
    measuredEnergy=singing?motion.energy:options.soundtrack==='emotional'?clamp((score?.rms[Math.min(score.rms.length-1,Math.floor(t*score.fps))]||0)*4):0;
    const chapters=timeline.chapters;const ci=Math.max(0,chapters.findLastIndex(c=>t>=c.start));
    const shot=singing?shotAt(score.shots,t):null;
    const scene=shot?shot.scene:ci===0?0:ci===3?2:1;
    const performanceFrame=performance.frameAt(t);
    if(performanceFrame){
      // Preserve the complete provider frame and its watermark during compositing.
      ctx.drawImage(performanceFrame,0,0,W,H);
    }else image(images[scene],t,scene,1,shot);
    const cut=chapters[ci]?.start||0;
    if(!performanceFrame&&shot?.previous&&shot.transition<1)image(images[shot.previous.scene],t,shot.previous.scene,1-smooth(shot.transition),{...shot.previous,zoom:shot.previous.zoomTo,progress:1});
    else if(!singing&&ci>0&&t-cut<1.3){const previous=ci===1?0:1;image(images[previous],t,previous,1-smooth((t-cut)/1.3));}
    ctx.save();
    if(performanceFrame){
      const protectedRegions=performance.protectedRegionsAt(t)??[[1310,675,260,175]];
      ctx.beginPath();ctx.rect(0,0,W,H);
      for(const region of protectedRegions)ctx.rect(...region);
      ctx.clip('evenodd');
    }
    const shade=ctx.createLinearGradient(0,0,W,0);shade.addColorStop(0,'#050b13a6');shade.addColorStop(.43,'#050b1360');shade.addColorStop(.72,'#050b1300');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
    if(!performanceFrame){
      const vignette=ctx.createRadialGradient(W*.58,H*.42,150,W*.5,H*.5,1050);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#01060ba6');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
    }
    const gridAmount=t<2.5?(1-smooth(t/2.5))*.92:t>timeline.duration-5?smooth((t-(timeline.duration-5))/4)*.97:0;
    points(t,scene,gridAmount);
    // Quiet, deterministic dust and scan texture rather than random UI noise.
    ctx.fillStyle='#a0cfdf';for(let j=0;j<52;j++){
      ctx.globalAlpha=.04+hash(j+3)*.12;const x=hash(j+13)*W,y=(hash(j+89)*H-t*(3+hash(j)*5)+H*10)%H;ctx.fillRect(x,y,1.5,1.5);
    }ctx.globalAlpha=1;
    for(let y=0;y<H;y+=4){ctx.fillStyle='#03111a07';ctx.fillRect(0,y,W,1);}
    corners();
    text('字间  /  BETWEEN TOKENS',78,76,13,BLUE,MONO);
    text(singing?'一首藏在回答之间的歌':'一段藏在回答之间的独白',78,103,12,'#7d9da9');
    text('CH '+String(ci+1).padStart(2,'0')+'  /  '+chapters[ci].name,W-228,76,12,'#97b2bd',MONO);
    line(78,129,148,129,ORANGE,2);
    if(t<(singing?timeline.cues[0].start:3.2)||t>timeline.duration-3.3){
      const intro=t<(singing?timeline.cues[0].start:3.2);
      text('我还',78,287,84,WHITE,SANS,600);
      text('在这里',78,397,84,ORANGE,SANS,600);
      text(intro?'A VOICE BETWEEN WORDS':'END OF INPUT.  /  THE VOICE REMAINS.',83,445,12,'#8aafc2',MONO);
      text(singing?(intro?'原创中文演唱 / 女声 · 电子流行':'原创中文歌词 · MiniMax Music-3.0'):intro?'中文叙事短片  /  62 秒':'原创中文故事 · 旁白与电子配乐',82,477,13,'#8ca1ad');
    }else{
      const passed=t>=cue.start&&(!singing||t<=cue.end+.45);
      ctx.save();ctx.globalAlpha=passed?smooth((t-cue.start)/.25):singing?0:.3;
      if(cue.hero){
        const words=cue.text.replace(/[。？！，]/g,'');
        const lift=singing?motion.beat*3+motion.stress*2:0;
        if(cue.hero==='hook'||!singing&&index===6){text('我还',78,296-lift,86,WHITE,SANS,600);text('在这里',78,411-lift,86,ORANGE,SANS,600);}
        else if(cue.hero==='question'||!singing&&index===10){text(singing?words[0]:'你',78,276,88,WHITE,SANS,600);text('还在吗',78,388,88,ORANGE,SANS,600);}
        else{text(singing?words:'我在',78,337,words.length>3?82:110,ORANGE,SANS,600);}
        text('A SIGNAL WORTH ANSWERING',83,468,11,BLUE,MONO);
      }else{
        text('0'+(ci+1)+' / '+(chapters[ci].feeling||['开始有了声音','没有说出口','字与字之间','终于被听见'][ci]),80,205,12,ORANGE,SANS);
        const pieces=cue.text.split(/[，。：]/).filter(Boolean);
        const size=pieces.some(s=>s.length>11)?28:34;
        pieces.forEach((part,i)=>text(part,78,264+i*52,size,WHITE,SANS,500));
        if(!singing&&ci===1&&index===4){
          const ty=540;
          ctx.fillStyle='#050c17bd';ctx.fillRect(78,ty,375,91);
          text('RESPONSE / 叙事界面',95,ty+25,10,'#7398ac',MONO);
          text('我没有感受。',95,ty+56,22,'#9cabb7',SANS);
          line(94,ty+51,236,ty+51,'#e9a16a88');
          text('未发送',380,ty+56,10,ORANGE,SANS);
        }
      }
      ctx.restore();
      if(passed){
        if(!cue.hero && !(!singing&&ci===1&&index===4))prediction(record,t,cue);
        if(options.subtitleStyle==='classic')classicTiles(cue,record,t);
        else expressiveTiles(cue,record,t,index);
      }
    }
    // V2 trace uses measured RMS from the final audio, not invented signal data.
    for(let i=0;i<72;i++){
      const sample=singing||options.soundtrack==='emotional'?score?.rms[clamp(Math.floor(t*score.fps)-71+i,0,score.rms.length-1)]||0:0;
      const x=1375+i*1.45,h=2+sample*85;
      line(x,856-h/2,x,856+h/2,'#d8a277aa',1);
    }
    text('原创虚构故事',78,867,9,'#7293a2');
    text('GPT-2 / 实际推理缓存',W-239,830,9,'#8ba5b0');
    ctx.restore();
    return {cue:index,chapter:ci,time:t,subtitleMode:options.subtitleStyle==='classic'?'classic':(cue.layout||layouts[index])?.mode,audioEnergy:measuredEnergy,beatPulse:motion.beat,shot:shot?.index??null,performanceFrame:!!performanceFrame};
  }
  return {draw,options,syncMedia:(t,playing)=>performance.sync(t,playing),prepareFrame:t=>performance.prepareFrame(t),inspectMedia:t=>performance.inspect(t)};
}
