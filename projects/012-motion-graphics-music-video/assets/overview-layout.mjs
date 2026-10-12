import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Deterministic diagram layout; raster export uses the bundled Sharp runtime.
const require = createRequire(import.meta.url);
const sharp = require(process.env.MV_OVERVIEW_SHARP || 'sharp');
const output = path.dirname(fileURLToPath(import.meta.url));
const c = { bg:'#151919', panel:'#202724', line:'#455044', text:'#f0f3e9', muted:'#b2beb1', lime:'#dbfb74', coral:'#ff987c', mint:'#93ccb8', ink:'#253224' };
const parts=[];
const esc = s => String(s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
const rect=(x,y,w,h,fill=c.panel,stroke=c.line,r=24)=>parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`);
const line=(x1,y1,x2,y2,color=c.line,width=2,arrow=false)=>parts.push(`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${arrow?'marker-end="url(#arrow)"':''}/>`);
const text=(s,x,y,size=28,color=c.text,weight=400,anchor='start')=>parts.push(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`);
const widthOf=(s,size)=>Array.from(s).reduce((a,ch)=>a+(/[\x00-\x7f]/.test(ch)?/[MW@]/.test(ch)?.82:/[il.,:;'| ]/.test(ch)?.3:.58:1)*size,0);
const wrap=(s,max,size)=>{let row='',result=[];for(const ch of Array.from(s)){if(ch==='\n'){result.push(row);row='';continue;}if(row&&widthOf(row+ch,size)>max&&!/^[，。；：、！？）]$/.test(ch)){result.push(row);row='';}row+=ch;}if(row)result.push(row);return result;};
const paragraph=(s,x,y,max,size=28,color=c.muted,leading=43,weight=400)=>{const rows=wrap(s,max,size);rows.forEach((row,i)=>text(row,x,y+i*leading,size,color,weight));return y+rows.length*leading;};
const header=(n,title,x,y,w,accent=c.lime)=>{rect(x,y,w,86,'none','none',0);rect(x,y+10,60,60,accent,accent,14);text(n,x+30,y+51,30,c.ink,700,'middle');text(title,x+82,y+51,43,c.text,650);};
const pill=(s,x,y,w,color=c.lime)=>{rect(x,y,w,45,'#2a3427',color,9);text(s,x+w/2,y+31,23,color,500,'middle');};
const icon=(type,x,y,color=c.lime)=>{parts.push(`<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">`);if(type==='person'){parts.push('<circle cx="25" cy="12" r="11"/><path d="M5 51v-7q20-26 40 0v7M15 53v15m20-15v15"/>');}else if(type==='type'){parts.push('<rect x="1" y="4" width="52" height="53" rx="5"/><path d="M12 17h30M27 17v27m-9 0h18"/>');}else if(type==='camera'){parts.push('<rect x="1" y="13" width="38" height="38" rx="6"/><path d="M39 23l17-10v38L39 41M10 4h25"/>');}else if(type==='check'){parts.push('<circle cx="27" cy="30" r="26"/><path d="M14 30l9 9 18-20"/>');}else if(type==='book'){parts.push('<path d="M0 7q15-7 29 0q15-7 29 0v49q-15-7-29 0q-14-7-29 0ZM29 7v49M8 19h13m-13 12h13m15-12h14m-14 12h14"/>');}else if(type==='stack'){parts.push('<path d="M1 16l28-14 28 14-28 14ZM1 30l28 14 28-14M1 44l28 14 28-14"/>');}else if(type==='search'){parts.push('<circle cx="23" cy="23" r="21"/><path d="M39 39l20 20M13 23h20m-10-10v20"/>');}else if(type==='flow'){parts.push('<rect x="15" y="0" width="28" height="20" rx="4"/><rect x="0" y="42" width="22" height="18" rx="4"/><rect x="38" y="42" width="22" height="18" rx="4"/><path d="M29 20v11H11v11m18-11h20v11"/>');}parts.push('</g>');};

parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="3500" viewBox="0 0 2400 3500"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${c.lime}"/></marker><pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0V56" stroke="#536044" stroke-width="1" opacity=".2" fill="none"/></pattern></defs><rect width="2400" height="3500" fill="${c.bg}"/><g font-family="Microsoft YaHei, Noto Sans SC, sans-serif">`);
rect(100,60,96,64,c.lime,c.lime,14);text('012',148,104,35,c.ink,700,'middle');text('GITHUB RESEARCH / 理解全景',220,104,27,c.muted,500);
text('从一首歌，到一支完整 MV',100,211,88,c.text,700);
text('Opus 做导演与工程师  /  模型生成素材  /  代码编排成片',103,283,35,c.lime,500);
text('Motion Graphics Music Video Skill',2260,105,28,c.muted,500,'end');

// Goal and input.
rect(100,345,1370,400);header('01','目标与实现效果',140,374,1290);
paragraph('从一首已有歌曲和创意，制作具有统一风格的完整音乐 MV。',145,483,1280,31,c.text,46);
const outcomes=[['person','角色表演与歌唱'],['type','歌词与图形动效'],['camera','节拍、镜头与转场'],['check','可审查、局部修改']];
outcomes.forEach(([type,title],i)=>{const x=145+i*321;icon(type,x,523,i===0?c.coral:c.lime);text(title,x+68,565,25,c.text,500);});
rect(145,622,618,78,'#e8dfbd','#e8dfbd',12);for(let x=164;x<750;x+=45)line(x,623,x,698,'#c6bc98',1);text('∫',172,680,55,'#b94c3f',600);text('纸感插画 ＋ 数学隐喻',247,672,31,'#2b342b',600);
rect(783,622,640,78,'#edce51','#edce51',12);parts.push('<path d="M800 631h600m-600 60h600" stroke="#292d23" stroke-width="9" stroke-dasharray="20 9"/>');text('漫画大字 ＋ 场景笑点',815,673,31,'#262b23',700);
text('音乐提供时间轴；效果由素材、编排与创作判断共同形成。',145,727,24,c.muted);
rect(1510,345,790,400);header('02','输入：你提供什么',1550,374,710);
const ins=[['核心','已有歌曲 MP3 / WAV / M4A ＋ 主题与创意'],['补充','歌词、角色设定、参考图／视频、风格与受众'],['约束','预算、重试额度、片段长度、画幅与帧率'],['运行','Claude Code、Fal 凭据与本地工具链']];
ins.forEach(([label,value],i)=>{let y=480+i*57;text(label,1555,y,25,c.lime,650);paragraph(value,1635,y,610,25,c.text,32);});
text('已有音乐作为入口，原曲保留为连续主音轨。',1555,727,24,c.muted);

// Central production architecture.
rect(100,785,2200,1140,'#1b231e','#50613e');header('03','底层原理：导演、模型与代码协作',145,814,2100);
rect(155,915,2090,172,'#2c3826','#8eaa56',18);text('Opus / Claude Code',190,967,42,c.lime,700);pill('导演 ＋ 工程师',1904,937,300,c.lime);
const directions=['研究与创意','风格与分镜','写代码与调度','审查与修订'];directions.forEach((s,i)=>{const x=206+i*518;text(s,x,1040,32,c.text,600);if(i<3)text('→',x+350,1040,36,c.lime);});
line(1200,1088,1200,1120,c.lime,3,true);
rect(155,1136,2090,72,'#232c24','#546348',12);text('Ruby CLI / MCP',189,1185,30,c.text,700);text('工具适配  ·  任务依赖  ·  请求记录  ·  素材版本',620,1185,28,c.muted);
line(1200,1208,1200,1227,c.lime,3);
line(354,1227,2046,1227,c.lime,2);
[354,777,1200,1623,2046].forEach(x=>line(x,1227,x,1247,c.lime,2,true));
const stages=[
 {n:'1',t:'分析音乐',tool:'Python',body:'节拍、起音、能量\n歌词另行对齐',color:c.mint,kind:'book'},
 {n:'2',t:'生成图像',tool:'GPT Image 2.5',body:'Sunburst\n角色参考、关键帧与编辑',color:c.coral,kind:'person'},
 {n:'3',t:'生成表演',tool:'MiniMax H3 Max',body:'单角色、绿幕、锁定镜头\n动作与歌唱表演',color:c.coral,kind:'camera'},
 {n:'4',t:'抠图与编排',tool:'Python → p5.js',body:'字幕、图形、图层、镜头\n逐帧时间线与透明帧合成',color:c.mint,kind:'stack'},
 {n:'5',t:'后期与合成',tool:'FFmpeg 输出',body:'Python 音效／混音\nSwift VFX 后期特效',color:c.mint,kind:'flow'},
];
stages.forEach((s,i)=>{const x=155+i*423;rect(x,1250,398,306,s.color===c.coral?'#382d26':'#243128',s.color,17);text(s.n,x+25,1295,27,s.color,700);icon(s.kind,x+313,1277,s.color);text(s.t,x+25,1347,37,c.text,650);text(s.tool,x+25,1400,29,s.color,600);paragraph(s.body,x+25,1451,347,26,c.muted,40);if(i<4)line(x+401,1404,x+418,1404,c.lime,2,true);});
parts.push(`<path d="M165 1590H2240" stroke="${c.lime}" stroke-width="2" fill="none"/>`);
for(let i=0;i<160;i++){const x=170+i*13;const amplitude=9+Math.abs(Math.sin(i*.79)*Math.cos(i*.22))*21;line(x,1590-amplitude,x,1590+amplitude,c.lime,3);}
rect(910,1570,590,40,'#1b231e','none',6);text('完整原曲贯穿时间轴',1205,1599,27,c.lime,600,'middle');
rect(155,1650,1250,148,'#2a3026','#798757',14);text('歌唱与口型',181,1693,30,c.text,700);text('分离人声 → 对齐片段 → 音频约束表演 → 看／听检查',181,1737,28,c.text,500);text('绑定音频不等于精准口型；专门口型模型属于扩展适配。',181,1779,25,c.coral,500);
rect(1440,1650,805,148,'#232d25','#51644b',14);text('先试代表片段 → 审查 → 扩大生成',1467,1697,28,c.lime,600);text('版本记录 ＋ 请求恢复 ＋ 局部修订',1467,1740,27,c.text);text('Agent 与人共同检查素材、音画和交付。',1467,1779,25,c.muted);
const roles=[['模型','外观、细节、动作与表演',c.coral],['代码','布局、文字、图形与时序',c.mint],['Agent 与人','风格、叙事、选择与验收',c.lime]];
roles.forEach(([label,desc,color],i)=>{let x=155+i*710;rect(x,1833,671,56,'#263027','#41503b',10);text(label,x+19,1871,26,color,650);text(desc,x+ (i===2?177:94),1871,25,c.text);});

// Outputs and extensible scenarios.
rect(100,1965,880,410);header('04','输出：你拿到什么',140,1990,800);
const outs=[['成片','默认 16:9 / 24fps / 1080p MP4，原曲连续'],['素材','角色参考、关键帧、表演、透明帧、背景动效'],['记录','分镜、提示词、配置、时间线、依赖与审查'],['溯源','素材版本、模型请求 ID、历次尝试与恢复'],['版本','清洁版、按计划制作的音效／特效版']];
outs.forEach(([label,desc],i)=>{let y=2102+i*43;text(label,145,y,25,c.lime,600);text(desc,228,y,25,c.text);});
text('支持局部修改；受影响的合成与交付仍需重做。',145,2338,25,c.muted);
rect(1020,1965,1280,410);header('05','可用与可扩展场景',1060,1990,1200);
const scenarios=[['已有','原创歌曲 MV、歌词动画、角色表演音乐短片',c.lime],['需适配','知识歌曲与项目导览、品牌音乐短片、竖屏、不同帧率、Windows、替换模型',c.coral],['需新增','可视化制作工作台、实际费用台账与硬限制、专门口型校正服务',c.mint]];
scenarios.forEach(([label,desc,color],i)=>{let y=2092+i*78;pill(label,1065,y,136,color);paragraph(desc,1225,y+31,1020,27,c.text,36);});
text('场景建议并非现成产品；改平台、画幅或模型需验证整条链路。',1065,2338,25,c.muted);

// Personal value.
rect(100,2415,2200,530);header('06','对你的价值：把生成能力组织成作品',145,2440,2100);
const values=[
 ['book','把研究变成传播','把 GitHub 能力、原理与关键结论编排为音乐导览；事实与出处仍留在网页。'],
 ['stack','积累个人制作资产','角色参考、动效模板、分镜协议、时间线与审查方法，可以跨主题复用。'],
 ['search','看懂问题来自哪里','脸与动作回到素材；布局与节拍回到代码；风格与叙事回到导演判断。'],
 ['flow','建立可演进的流程','更换模型，继续沿用版本、依赖、恢复与审查；减少盲目重复生成。'],
];
values.forEach(([symbol,title,body],i)=>{let x=145+i*531;rect(x,2540,505,280,'#263026','#465542',16);icon(symbol,x+24,2568,c.lime);text(title,x+106,2606,30,c.text,650);paragraph(body,x+25,2674,454,29,c.muted,46);});
rect(145,2855,2107,54,'#39452b','#667c44',10);text('价值核心：可控制、可修改、可复用的制作流程；模型升级后，制作方法仍可沿用。',175,2893,30,c.lime,600);

// Limits, practical entry point and provenance.
rect(100,2985,2200,310,'#242b23','#5f6c48');header('07','边界与建议起点',145,3008,2100);
const limits=[['实际效果要验收','口型、角色一致性、抠图边缘与节拍，需要实际观看、听音和校准。'],['预算要看真实用量','生成依赖云端 API；费用受时长、Agent 用量和重试影响。'],['改环境要适配','Swift 特效依赖 macOS；Windows、竖屏与新模型需要适配。']];
limits.forEach(([title,body],i)=>{let x=145+i*710;text(title,x,3120,28,c.coral,650);paragraph(body,x,3161,666,27,c.muted,39);});
rect(145,3233,2107,45,c.lime,c.lime,8);text('先做 15–30 秒 → 检查素材、口型与合成 → 再决定是否制作整曲',1198,3266,30,c.ink,650,'middle');
text('研究基线：759ba6a（2026-10-05）｜模型名称按上游约定；未验证当前可用性、费用或上游生产运行。',100,3351,25,c.muted);
text('来源：github.com/makevoid/motion-graphics-music-video-skill',100,3400,25,c.muted);
text('本地排版理解图 · 风格示意并非作者成片 · 2026-10-10',2300,3447,24,c.muted,400,'end');
parts.push('</g></svg>');
const svg=parts.join('\n');
await writeFile(path.join(output,'overview-infographic.svg'),svg,'utf8');
await sharp(Buffer.from(svg)).png().toFile(path.join(output,'overview-infographic.png'));
console.log('Generated 2400×3500 PNG and editable SVG in '+output);
