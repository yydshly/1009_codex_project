import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Native information design: original SVG layout with exact Chinese copy.
// Existing demonstration JPEGs are embedded without modifying their bytes.
// Set MOTION_SHARP_MODULE to the bundled Sharp ESM entry path to export PNG.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharpModule = process.env.MOTION_SHARP_MODULE || 'sharp';
const sharp = (await import(path.isAbsolute(sharpModule) ? pathToFileURL(sharpModule).href : sharpModule)).default;
const W = 3840, H = 2560;
const C = { navy:'#101323', ink:'#20283e', muted:'#606b82', indigo:'#5148e5', lime:'#d9ff77', paper:'#f1f3f8', line:'#dfe3ee', violet:'#efedff', teal:'#19766e' };
const xml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const parts = [], copy = [];
const add = s => parts.push(s);
function rect(x,y,w,h,fill,rx=20,stroke='none') { add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`); }
function line(x1,y1,x2,y2,color=C.line,width=2) { add(`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`); }
function text(x,y,str,size=30,color=C.ink,weight=400) {
  copy.push(str);
  add(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" dominant-baseline="hanging">${xml(str)}</text>`);
}
const advance = (c,size) => /[\u3000-\uffff]/u.test(c) ? size : /[MW@]/.test(c) ? size*.8 : /[il1.,: /|]/.test(c) ? size*.32 : size*.58;
function wrap(str,width,size) {
  const rows=[]; let row='', used=0;
  const tokens=str.match(/[A-Za-z0-9_.:/+→×=-]+|\s|[^\x00-\x7f]|./gu)||[];
  for (const token of tokens) {
    const tw=[...token].reduce((n,c)=>n+advance(c,size),0);
    if (used+tw>width && row) { rows.push(row.trimEnd()); row=''; used=0; }
    row+=token; used+=tw;
  }
  if(row) rows.push(row.trimEnd()); return rows;
}
function para(x,y,str,width,size=29,color=C.muted,leading=41,weight=400) {
  const rows=wrap(str,width,size);
  rows.forEach((s,i)=>text(x,y+i*leading,s,size,color,weight)); return y+rows.length*leading;
}
function pill(x,y,label,fill=C.violet,color=C.indigo,size=25) {
  const width=[...label].reduce((n,c)=>n+advance(c,size),0)+34;
  rect(x,y,width,size+23,fill,12); text(x+17,y+10,label,size,color,600); return width;
}
function number(x,y,n,color=C.indigo) {
  add(`<circle cx="${x+27}" cy="${y+27}" r="27" fill="${C.violet}"/>`);
  text(x+10,y+11,String(n).padStart(2,'0'),25,color,700);
}
function card(x,y,w,h,n,title,subtitle) {
  rect(x,y,w,h,'#ffffff',26,C.line);
  number(x+32,y+34,n); text(x+108,y+37,title,41,C.ink,700);
  para(x+34,y+108,subtitle,w-68,27,C.muted,36); line(x+34,y+145,x+w-34,y+145);
}
function row(x,y,title,desc,width=1060,tag=null,size=29) {
  if(tag) { pill(x,y,tag,C.violet,C.indigo,23); x+=76; width-=76; }
  text(x,y,title,33,C.ink,650); return para(x,y+47,desc,width,size,C.muted,40);
}
const preview=await readFile(path.join(root,'assets/preview.jpg'));
const frameUri='data:image/jpeg;base64,'+preview.toString('base64');
add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">Motion Video Kit 能力全景图</title><desc id="desc">能力、底层原理、效果证据、使用场景、扩展方向与参考价值；嵌入本地实际视频关键帧。</desc><defs><radialGradient id="glow"><stop stop-color="#5148e5" stop-opacity=".3"/><stop offset="1" stop-color="#5148e5" stop-opacity="0"/></radialGradient><clipPath id="hero"><rect x="2410" y="70" width="1334" height="445" rx="24"/></clipPath></defs><g font-family="Microsoft YaHei, PingFang SC, Arial, sans-serif">`);
rect(0,0,W,H,C.paper,0); rect(0,0,W,548,C.navy,0);
add('<ellipse cx="1850" cy="150" rx="700" ry="600" fill="url(#glow)"/>');
text(76,67,'001 / RESEARCH ATLAS',25,'#bcb6f6',650);
text(76,136,'Motion Video Kit',94,'#ffffff',750); text(978,143,'能力全景图',82,C.lime,700);
text(76,266,'把商业目标，变成可控、可评审的代码短片',47,'#ffffff',650);
text(76,340,'一套 AI 制作方法与质检工作流',35,'#cbd0df');
text(76,396,'1 个 Skill  ·  11 份参考文档  ·  7 个脚本  ·  2 个模板',29,'#a9b3cc');
pill(76,451,'底层不是 Remotion',C.lime,C.navy,29);
text(451,461,'当前模板采用 HyperFrames',30,'#f3f4f9',600);
text(76,511,'共享网页逐帧生成视频的思路；编写方式与接口不同。',25,'#bac3d8');
add(`<g clip-path="url(#hero)"><image href="${frameUri}" x="2410" y="-105" width="1334" height="750.375"/></g>`);
text(2427,521,'本地实际 MP4 · 18 秒关键帧（局部）',24,'#c5cbe0');

const X=[76,1316,2556], cw=1208, top=586, th=946, lower=1564, lh=708;
card(X[0],top,cw,th,1,'能力：串起制作环节','库提供方法、参考、脚本与模板；助手与外部工具负责执行。');
const capabilities=[
  ['业务策划与分镜','观众、真实卖点、唯一 CTA；把业务流程转成镜头与转场。'],
  ['代码动画','HTML / SVG 保持信息清晰；GSAP 编排文字、动作与转场。'],
  ['三维表达与投影标注','Three.js 展示结构与机械动作；3D 锚点投影成 2D 标签与照片连线。'],
  ['真实素材与 AI 素材协作','组织照片、图生视频与生成记录；授权与业务事实需要核实。'],
  ['独立评审与逐项复验','新评审者看实际输出；按时间点记录缺陷，修复后再检查回归。'],
  ['声音处理与客观测量','音效、增益与混音；抽帧、近静止检测、响度检查。']
];
capabilities.forEach(([title,desc],i)=>{
  const y=top+174+i*113; pill(X[0]+34,y,String(i+1).padStart(2,'0'),C.violet,C.indigo,24);
  row(X[0]+116,y,title,desc,cw-150);
  if(i<5)line(X[0]+116,y+102,X[0]+cw-34,y+102);
});
rect(X[0]+34,top+875,cw-68,48,C.violet,10);
text(X[0]+51,top+886,'不是自动运行的一键成片服务；场景与服务需要配置。',25,C.indigo,550);

card(X[1],top,cw,th,2,'原理：画面由时间决定','制作方法在渲染器之上；统一时间 t 驱动画面与标注。');
const architecture=[
  ['01 方法层','Motion Video Kit','业务需求 → 分镜 → 组件实验',C.violet,C.indigo],
  ['02 画面层','HTML / SVG + GSAP + Three.js','pose(t) / render(t)；3D 锚点 → 相机投影 → 2D 标签','#f1f3f8',C.ink],
  ['03 捕获层','HyperFrames + Chrome','定位到时间 t → 浏览器逐帧绘制与捕获','#f1f3f8',C.ink],
  ['04 输出层','FFmpeg → MP4','视频编码 / 音频混音 → 成片',C.navy,'#ffffff']
];
architecture.forEach(([label,name,desc,fill,col],i)=>{
  const x=X[1]+34,y=top+166+i*130;
  rect(x,y,cw-68,106,fill,15);
  text(x+22,y+18,label,26,col,700); text(x+203,y+14,name,34,col,650);
  text(x+203,y+63,desc,26,i===3?'#cbd0df':C.muted);
  if(i<3){line(x+90,y+112,x+90,y+124,C.indigo,4);add(`<path d="M${x+80} ${y+118}l10 10 10-10" fill="none" stroke="${C.indigo}" stroke-width="4"/>`);}
});
rect(X[1]+34,top+690,cw-68,88,C.violet,15);
text(X[1]+55,top+704,'frame(t) = render(pose(t))',39,C.indigo,650);
text(X[1]+55,top+753,'不逐帧累加场景状态；可跳帧、重渲染、比较同一时刻。',25,C.indigo);
text(X[1]+34,top+804,'制作 → 实际渲染 → 独立评审 → 修复 → 新一轮复验',29,C.ink,650);
text(X[1]+34,top+843,'判断真实像素与测量，保留问题、版本和修复记录。',27,C.muted);
text(X[1]+34,top+876,'Remotion：React + 当前帧号；本链路：HTML + 时间定位',25,C.muted);
text(X[1]+34,top+908,'方法可迁移；现成模板需要重新适配。',25,C.indigo,550);

card(X[2],top,cw,th,3,'效果与证据：分清来源','实际验证、作者复盘与专业参考，分别标注。');
const ex=X[2]+34, ew=cw-68;
rect(ex,top+165,ew,298,'#f3f5f9',16);
pill(ex+18,top+181,'本地实际验证','#e7f7c7','#36561b',23);
text(ex+246,top+185,'GitHub 研究总库',33,C.ink,650);
add(`<image href="${frameUri}" x="${ex+18}" y="${top+240}" width="384" height="216"/>`);
const fx=ex+463, fy=top+244;
[
 '链接 → 目录 → 证据 → 网页',
 '24 秒 · 1280×720 · 30fps',
 'HTML + GSAP；HyperFrames 导出',
 '46 项 DOM 状态路径比较一致',
 '3 轮独立画面评审 · 静音'
].forEach((s,i)=>text(fx,fy+i*41,s,27,i===0?C.ink:C.muted,i===0?600:400));

function roofIcon(x,y) {
  ['#c3bbf9','#9185ec','#5148e5'].forEach((f,i)=>add(`<path d="M${x} ${y+42-i*13}l54-27 54 27-54 27Z" fill="${f}" stroke="#f9faff" stroke-width="3"/>`));
  text(x+5,y+90,'机制示意',20,C.muted);
}
function phoneIcon(x,y) {
  add(`<path d="M${x} ${y+9}l46-12 3 83-46 14Z" fill="#302d5a" stroke="#aaa4f1" stroke-width="3"/><path d="M${x+51} ${y}l48 14-3 82-43-14Z" fill="#665be7" stroke="#b5aef7" stroke-width="3"/><path d="M${x+47} ${y-2}l5 84" stroke="#d9ff77" stroke-width="4"/>`);
  text(x+5,y+106,'机制示意',20,C.muted);
}
rect(ex,top+495,ew,162,'#f7f6fe',16);
pill(ex+18,top+510,'上游作者复盘',C.violet,C.indigo,22);
text(ex+254,top+513,'ALDER 屋顶检查服务',32,C.ink,650);
text(ex+18,top+563,'结构分层 → 检查照片 → 报告 → 预约',28,C.muted);
text(ex+18,top+611,'28.6 秒 · 1080p60 · 虚构品牌概念片',27,C.muted); roofIcon(ex+ew-143,top+528);
rect(ex,top+681,ew,164,'#f7f6fe',16);
pill(ex+18,top+697,'上游作者复盘',C.violet,C.indigo,22);
text(ex+254,top+700,'折叠手机概念广告',32,C.ink,650);
text(ex+18,top+750,'开合、铰链、材质与屏幕连续性',28,C.muted);
text(ex+18,top+797,'40 秒 · 6 个 Three.js 画布 · 非官方概念片',27,C.muted); phoneIcon(ex+ew-141,top+710);
text(ex,top+852,'上游未附完整成片与 MP4；案例数字未在本地复现。',25,C.muted);
text(ex,top+883,'专业参考：Work Louder / Replit Canvas / Bolt',24,C.muted);
text(ex,top+910,'参考影片属于原作者，不是 Kit 的生成成果。',23,C.muted);

card(X[0],lower,cw,lh,4,'场景：动作产生业务结果','适用性判断；没有验证广告转化。');
const scenarios=[
 ['SaaS / 开发工具','输入 → 操作 → 结果；功能发布、销售演示与流程教程。'],
 ['硬件 / 电商','结构 → 材质 → 使用方式；依赖准确资产与更细的动作校准。'],
 ['家居服务 / 物业','现场照片 → 检查 → 报告 → 下一步；真实素材支撑事实。'],
 ['广告变体 / 视频改进','调整开头、文字、CTA 与画幅；用评审定位停顿、碰撞与声音问题。']
];
scenarios.forEach(([title,desc],i)=>{
  const y=lower+173+i*120;
  text(X[0]+34,y,String(i+1).padStart(2,'0'),27,C.indigo,700);
  row(X[0]+111,y,title,desc,cw-145);
});
text(X[0]+34,lower+665,'优先用于卖点明确、文案需要准确修改的短片。',27,C.indigo,550);

card(X[1],lower,cw,lh,5,'扩展：走向重复生产','我们的设想 · 尚未实现');
const extensions=[
 ['P1','参数化行业模板','品牌、卖点、图片、CTA → JSON；数据驱动变体。'],
 ['P1','统一制作与质检入口','素材检查、渲染、测量、版本与评审台账。'],
 ['P2','渲染器适配与多画幅','Remotion 适配；16:9 / 9:16 分别设计安全区。'],
 ['P2','真实三维资产与证据管理','GLB 产品模型；授权与业务事实一一对应。'],
 ['P3','按时间点的人工评审','关键帧批注；意见 → 版本 → 修复状态。'],
 ['P3','连接实际投放实验','播放、点击与后续行动数据；区分相关与因果。']
];
extensions.forEach(([tag,title,desc],i)=>{
  const y=lower+171+i*84;
  pill(X[1]+34,y,tag,i<2?C.violet:'#e9eef2',i<2?C.indigo:C.teal,22);
  text(X[1]+119,y+1,title,31,C.ink,600);
  text(X[1]+119,y+44,desc,26,C.muted);
});

card(X[2],lower,cw,lh,6,'参考价值：迁移制作方法','把经验转成可复用、可检查的流程。');
const values=[
 ['业务先行','先写观众、可证明事实与唯一行动，再安排镜头和素材。'],
 ['确定性画面控制','以时间函数组织组件；让修改可定位、输出可重复。'],
 ['制作与评审分离','新评审者判断真实像素，而非制作者意图；发现缺陷与回归。'],
 ['可追溯的质量闭环','版本、素材来源、测量和评审记录，使经验可以复用。']
];
values.forEach(([title,desc],i)=>{
  const y=lower+171+i*113;
  number(X[2]+34,y,i+1); row(X[2]+111,y,title,desc,cw-145);
});
rect(X[2]+34,lower+644,cw-68,43,C.violet,10);
text(X[2]+50,lower+653,'最值得借鉴：制作方法与质量闭环。',26,C.indigo,650);

rect(76,2304,3688,142,C.navy,22);
text(106,2330,'采用边界',33,C.lime,650);
text(308,2332,'需配置场景模块与评审者；按需接入模型服务。部分混音脚本含固定案例时间。',29,'#eef0f8');
text(308,2377,'复杂人物表演与长剧情不是重点；字体和浏览器影响像素。测量不等于审美，方法不等于转化。',28,'#c8cfe0');
text(106,2481,'来源：github.com/echris6/motion-video-kit',27,C.ink,600);
text(106,2522,'基线：255562b · 2026-10-09 · 上游 MIT；依赖许可分别核实。',24,C.muted);
text(1600,2481,'依据：SKILL.md / gauntlet.md / three-js-patterns.md / 案例复盘 / 本地验证',25,C.muted);
pill(2775,2508,'文档与模板能力',C.violet,C.indigo,21);
pill(3144,2508,'本地实际验证','#e7f7c7','#36561b',21);
pill(3469,2508,'扩展设想','#e9eef2',C.teal,21);
add('</g></svg>');
const svg=parts.join('\n');
const svgFile=path.join(root,'assets/capability-map-v1.svg');
const pngFile=path.join(root,'assets/capability-map-v1.png');
await writeFile(svgFile,svg);
await sharp(Buffer.from(svg), {limitInputPixels:false}).png().toFile(pngFile);
const metadata={
  title:'Motion Video Kit 能力全景图',
  dimensions:{width:W,height:H},
  date:'2026-10-09',
  source:'https://github.com/echris6/motion-video-kit',
  sourceRef:'255562b04b1e5ecaa4ba98e5c9aa191d5ba7f6fa',
  production:'Native SVG information design; PNG rasterized with Sharp',
  builtinImageGeneration:{attempts:2,result:'Both failed with network error; no generated image was used; no API fallback used.'},
  evidence:{actualImage:'assets/preview.jpg (local MP4 frame at 18s)',illustrations:'Roof and folding-phone glyphs are labeled mechanism diagrams.',localVerification:'46 DOM states; 3 film critic rounds; 24s,1280x720,30fps,silent',upstreamCases:'Author reports, not locally reproduced.',extensions:'Future ideas, not implemented.'},
  fonts:'Microsoft YaHei / PingFang SC / Arial; rendered using system fonts; font files are not distributed.',
  outputs:['assets/capability-map-v1.svg','assets/capability-map-v1.png'],
  text:copy
};
await writeFile(path.join(root,'assets/capability-map.metadata.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(`已生成 ${W}×${H} 能力全景图：assets/capability-map-v1.png / .svg`);
