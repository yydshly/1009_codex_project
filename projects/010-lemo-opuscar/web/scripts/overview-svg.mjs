import { overview as o } from '../public/overview-content.js';

// 与网页共用总结数据；用原生 SVG 文本和内嵌 JPEG 输出可缩放、可离线保存的单张图。
export async function createOverviewSvg(styles, ref, readImage) {
  const cats=[...new Set(styles.map(s=>s.cat))];
  const files=[...new Set([...o.examples.map(e=>e.image),...cats.map(cat=>styles.find(s=>s.cat===cat).image),'assets/upstream/frames/blueprint.jpg','assets/upstream/frames/ink-wash.jpg'])];
  const images=new Map(await Promise.all(files.map(async file=>[file,await readImage(file)])));
  const W=1600, pad=42, gap=20, body=W-pad*2, ink='#253a2d', muted='#67725e', paper='#f7f4e9', line='#d2d8c3', accent='#bd512d';
  let y=30, clipId=0; const parts=[], defs=[];
  const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const rect=(x,y,w,h,fill,stroke)=>parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}"${stroke?` stroke="${stroke}"`:''}/>`);
  const text=(t,x,y,size=20,color=ink,weight=400)=>parts.push(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}">${e(t)}</text>`);
  const wrap=(value,width,size)=>{
    const rows=[]; let row='',w=0;
    for(const c of String(value)){const cw=/[\u0000-\u007f]/.test(c)?size*.56:size;if(c==='\n'||(w+cw>width&&row)){rows.push(row);row='';w=0;if(c==='\n')continue;}row+=c;w+=cw;}
    if(row)rows.push(row);return rows;
  };
  const paragraph=(value,x,y,width,size=18,color=muted,leading=29,weight=400)=>{const rows=wrap(value,width,size);rows.forEach((r,i)=>text(r,x,y+i*leading,size,color,weight));return y+rows.length*leading;};
  const labelRows=(labels,width,size)=>{
    const measure=value=>[...value].reduce((sum,c)=>sum+(/[\u0000-\u007f]/.test(c)?size*.56:size),0);
    const rows=[];let row='';
    for(const label of labels){const next=row?row+' · '+label:label;if(row&&measure(next)>width){rows.push(row);row=label;}else row=next;}
    if(row)rows.push(row);return rows;
  };
  const image=(file,x,y,w,h)=>{const id='clip'+clipId++;defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/></clipPath>`);parts.push(`<image href="${images.get(file)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`);};
  const heading=(num,title,desc,dark=false)=>{
    rect(pad,y,48,34,accent);text(num,pad+11,y+25,20,'#fff',600);
    text(title,pad+65,y+26,29,dark?'#fff8eb':ink,600);
    const end=paragraph(desc,pad+65,y+58,body-65,18,dark?'#cbd9bc':muted,28);
    y=end+15;
  };

  rect(pad,y,body,292,'#243e34');image(o.examples[0].image,pad+820,y,body-820,292);
  rect(pad+18,y+18,795,256,'#243e34');
  text('OUR UNDERSTANDING / LEMO-OPUSCAR',pad+35,y+51,17,'#b8cfac',600);
  text('定制风格 · 组织故事 · 代码构建场景',pad+35,y+107,36,'#fff6e4',600);
  paragraph(o.thesis,pad+35,y+151,760,23,'#edc5a2',34);
  paragraph('43 种完整风格 / 9 类 / 98 段电影致敬动画',pad+35,y+211,750,22,'#dce7cf',34);
  text('背景：OPUSCAR98《阿甘正传》代码重绘画面',pad+840,y+269,15,'#fff7e5');
  y+=320;

  heading('01','产品思路：熟悉的题材 → 新的动画世界','以下链路概括 OPUSCAR98；整个库把风格、导演和制片方法整理给新题材使用。');
  const fw=(body-gap*4)/5;
  o.flow.forEach((f,i)=>{const x=pad+i*(fw+gap);rect(x,y,fw,162,'#eaf0df',line);text('0'+(i+1),x+16,y+26,16,accent,600);const end=paragraph(f.title,x+16,y+57,fw-32,21,ink,30,600);paragraph(f.detail,x+16,end+10,fw-32,17,muted,26);if(i<4)text('→',x+fw+2,y+84,22,accent);});
  y+=184;
  const ew=(body-gap*2)/3;
  o.examples.forEach((example,i)=>{const x=pad+i*(ew+gap);rect(x,y,ew,277,'#eeecdf',line);image(example.image,x+10,y+10,ew-20,181);text(example.title+' · 电影意象重新编排',x+17,y+219,21,ink,600);paragraph(example.detail,x+17,y+249,ew-34,17,muted,26);});
  y+=307;y=paragraph(o.boundaries,pad,y,body,18,muted,28)+22;

  heading('02','风格资产：9 类，完整列出 43 种','每种风格包含 STYLE.md、样片与 DEMO.md：约束材质、颜色、文字、运动、镜头和声音。');
  const cw=(body-gap*2)/3;
  cats.forEach((cat,i)=>{const x=pad+(i%3)*(cw+gap),cy=y+Math.floor(i/3)*224,group=styles.filter(s=>s.cat===cat);rect(x,cy,cw,206,'#fffef8',line);image(group[0].image,x+10,cy+10,102,186);text(cat,x+129,cy+34,23,ink,600);text(group.length+' 种',x+129,cy+58,15,accent);labelRows(group.map(s=>s.cn),cw-147,17).forEach((row,j)=>text(row,x+129,cy+87+j*27,17,muted));});
  y+=672+25;

  heading('03','约束控制：规范 → 真实代码 → 校验与观看','约束写明怎么画、怎么动、怎么同步；审美、故事与情绪需要创作判断。');
  o.controls.forEach((c,i)=>{const x=pad+(i%3)*(cw+gap),cy=y+Math.floor(i/3)*237;rect(x,cy,cw,219,'#eeefe3',line);text('0'+(i+1)+' / '+c.source,x+18,cy+28,15,accent);text(c.title,x+18,cy+61,23,ink,600);paragraph(c.detail,x+18,cy+96,cw-36,18,muted,28);});
  y+=474+24;

  heading('04','作品效果：画面成为背景与演示模块','网页内可观看本地实时蓝图与上游有声样片；导出的本图用作品真实静帧记录效果。');
  const pw=(body-gap)/2;
  const effectCards=[{file:'assets/upstream/frames/blueprint.jpg',title:'蓝图 / 规则落实为画面',detail:'蓝白 + 四级线宽 + 制图顺序 + 机械运动；网页直接运行原作画面代码，可播放与跳转，静音预览≤12fps。'},{file:'assets/upstream/frames/ink-wash.jpg',title:'水墨 / 材料参与叙事',detail:'墨色、宣纸、留白与笔触共同组织场景；网页内可切换水墨、玻璃产品、纸片立体书的上游样片。'}];
  effectCards.forEach((card,i)=>{const x=pad+i*(pw+gap);rect(x,y,pw,337,'#fffdf5',line);image(card.file,x+10,y+10,pw-20,228);text(card.title,x+18,y+270,24,ink,600);paragraph(card.detail,x+18,y+299,pw-36,18,muted,28);});
  y+=367;y=paragraph(o.evidence,pad,y,body,17,muted,27)+22;

  heading('05','使用场景：先确定内容目标，再选择画风','以下为本地应用建议；真实材料、观众目标与内容核对是创作的起点。');
  o.scenarios.forEach((s,i)=>{const x=pad+(i%3)*(cw+gap),cy=y+Math.floor(i/3)*190;rect(x,cy,cw,172,'#fffef8',line);text('0'+(i+1)+' / '+s.title,x+17,cy+31,23,ink,600);paragraph(s.outcome,x+17,cy+65,cw-34,18,muted,27);paragraph('输入：'+s.input,x+17,cy+103,cw-34,16,muted,25);paragraph('画风：'+s.styles,x+17,cy+147,cw-34,16,accent,25);});
  y+=380+20;

  const valueStart=y;rect(pad-12,valueStart-8,body+24,356,'#263e34');
  heading('06','对你的意义：从优秀案例到自己的表达能力','以研究总库为起点，迁移到你的项目、产品、原理或角色。',true);
  const vw=(body-gap*3)/4;
  o.values.forEach((v,i)=>{const x=pad+i*(vw+gap);text('0'+(i+1),x+9,y+22,18,'#edbd8e');paragraph(v.title,x+9,y+57,vw-18,23,'#fff8eb',33,600);paragraph(v.detail,x+9,y+103,vw-18,18,'#d2dfc7',29);});
  y+=202;
  text('电影 → 你的题材　 /　 Clawd → 你的主体　 /　 致敬场景 → 你的解释、发布或系列故事',pad+9,y+14,20,'#f3c69e');y=valueStart+375;

  heading('07','从理解到交付：构成可执行的创作任务','风格规范 + 导演方法 + 五轨时间线 + 逐帧渲染；制作完成后保留可修改的工程。');
  o.pipeline.forEach((p,i)=>{const x=pad+i*(fw+gap);rect(x,y,fw,71,'#e9edda',line);paragraph(p,x+15,y+28,fw-30,19,ink,27,600);if(i<4)text('→',x+fw+2,y+43,22,accent);});
  y+=101;y=paragraph(o.trial,pad,y,body,21,accent,32)+12;y=paragraph(o.conditions,pad,y,body,17,muted,27)+24;
  rect(pad,y,body,82,'#e9eadb');text('中文图解与应用判断：本地研究 · 作品与规范：Lemomo / LemoLab · MIT，第三方素材保留各自归属',pad+18,y+28,17,muted);text('固定来源 '+ref+'  /  github.com/lemomo-ai/lemo-opuscar',pad+18,y+57,15,muted);y+=112;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Math.ceil(y)}" viewBox="0 0 ${W} ${Math.ceil(y)}" role="img" aria-labelledby="title desc"><title id="title">${e(o.title)}</title><desc id="desc">${e(o.subtitle)} 全部43种风格、创作链路、约束方式、使用场景、个人价值和作品静帧。</desc><defs>${defs.join('')}</defs><rect width="100%" height="100%" fill="${paper}"/><g font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, Arial, sans-serif">${parts.join('')}</g></svg>`;
}
