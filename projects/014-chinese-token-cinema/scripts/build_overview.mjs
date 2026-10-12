// A single, self-contained research diagram. Raster artwork is an illustrative
// background; photographs and performance frames are untouched evidence inserts.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(project,'web/public/assets/overview');
await fs.mkdir(out,{recursive:true});
const W=1920,H=4530,M=72,G=24,C=(W-M*2-G*2)/3;
const colors={bg:'#090f16',panel:'#101c27',line:'#304454',fg:'#e4edf4',muted:'#9fb4c4',dim:'#7892a8',cyan:'#92c8da',amber:'#f2b37b',red:'#e5a38e'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const parts=[],labels=[],sections=[];
function rect(x,y,w,h,fill=colors.panel,stroke=colors.line,r=8){parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`);}
function text(x,y,value,size=23,color=colors.fg,weight=400,extra=''){
  labels.push(String(value));parts.push(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(value)}</text>`);
}
function wrap(value,width,size){
  const lines=[];let line='',used=0;
  const tokens=value.match(/[A-Za-z0-9#][A-Za-z0-9#._/%-]*|[\s\S]/g)||[];
  for(let i=tokens.length-1;i>0;i--)if(/^[，。；：！？、）》】]$/.test(tokens[i])){tokens[i-1]+=tokens[i];tokens.splice(i,1);}
  for(const ch of tokens){
    if(ch==='\n'){lines.push(line);line='';used=0;continue;}
    const cw=Array.from(ch).reduce((n,c)=>n+(/[\u0000-\u007f]/.test(c)?size*.59:size),0);
    if(used+cw>width&&line){lines.push(line);line='';used=0;}
    line+=ch;used+=cw;
  }
  if(line)lines.push(line);return lines;
}
function paragraph(x,y,value,width,size=23,color=colors.muted,lineHeight=35){
  const lines=wrap(value,width,size);for(const [i,line] of lines.entries())text(x,y+i*lineHeight,line,size,color);
  return y+lines.length*lineHeight;
}
function line(x1,y1,x2,y2,color=colors.line,width=2){parts.push(`<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`);}
function arrow(d,color=colors.cyan,dashed=false){parts.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" ${dashed?'stroke-dasharray="7 7"':''} marker-end="url(#arrow-${color===colors.amber?'amber':'cyan'})"/>`);}
async function photo(file,x,y,w,h,opacity=1){const b=await fs.readFile(path.join(out,file));const type=file.endsWith('.png')?'png':'jpeg';parts.push(`<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" opacity="${opacity}" href="data:image/${type};base64,${b.toString('base64')}"/>`);}
function heading(index,y,title,note=''){
  line(M,y-32,W-M,y-32);text(M,y,index,22,colors.amber,500);text(M+54,y,title,34,colors.fg,500);
  if(note)text(W-M,y,note,20,colors.dim,400,'text-anchor="end"');sections.push({index,title,y});
}
function miniCard(x,y,w,h,label,title,body,color=colors.cyan){rect(x,y,w,h);text(x+24,y+34,label,19,color,500);text(x+24,y+77,title,27,colors.fg,500);paragraph(x+24,y+108,body,w-48,22,colors.muted,32);}

// Header and real effects: three whole 16:9 frames, with intact watermarks.
await photo('abstract-background.png',0,0,W,1080,.36);
text(M,64,'014 / 字间 · 中文 Token 音乐短片研究总览',23,colors.cyan,500);
text(W-M,64,'2026.10.10 · 理解 / 能力 / 边界',20,colors.dim,400,'text-anchor="end"');
text(M,143,'把预测的文字，编排成被听见的情绪。',56,colors.fg,500);
text(M,191,'原片效果 → 模型与代码分工 → 字幕价值 → 中文实现 → 验收结论 → 扩展路线',24,colors.muted);
const frameY=232,frameH=C*9/16;
for(const [i,file,title,caption] of [
  [0,'reference-tokens.jpg','原片 · 00:28 / DJ SHO','词块、编号、回指弧线与机房人物共同叙事'],
  [1,'our-performance.jpg','我们的研究 · 00:30 / 我还在这里','中文原歌、真实推理缓存、动态表演与代码字幕'],
  [2,'reference-shore.jpg','原片 · 03:48 / DJ SHO','海岸暖光与大字回应，完成情绪落点'],
]){
  const x=M+i*(C+G);await photo(file,x,frameY,C,frameH);rect(x,frameY,C,frameH,'none');
  text(x,frameY+frameH+37,title,25,colors.fg,500);text(x,frameY+frameH+73,caption,21,colors.muted);
}
paragraph(M,662,'参考作品是技术视觉与虚构人物结合的音乐短片：从“回答与预测”走向“我在这里”。我们的中文歌围绕停顿、等待与回应展开。音乐、字幕、光线与景别共同塑造情绪；这些自我表达属于艺术叙事。',W-M*2,24,colors.muted,37);

// Four independently controlled production functions. Music feeds both the
// performance driver and the final soundtrack; it does not pass through GPT-2.
heading('01',795,'原理：四个环节协作，音轨是共同的时间依据','原片工具名来自作者说明；具体口型步骤未公开');
const nodeW=408,nodeY=831,nodeH=275,nodeXs=[M,528,984,1440];
miniCard(nodeXs[0],nodeY,nodeW,nodeH,'音乐生成','歌词 + 曲风 → 完整歌曲','决定旋律、伴奏、人声和段落。\n原片：Suno V6（作者说明）。\n我们：MiniMax Music-3.0，生成完整中文女声歌曲。');
miniCard(nodeXs[1],nodeY,nodeW,nodeH,'人物 / 镜头生成','角色参考 + 场景 → 视频','决定人物、环境、动作和摄影。\n原片：Wan 3.0 / Higgsfield。\n我们：生成场景图、HeyGen 表演；ChatArt 新场景测试。');
miniCard(nodeXs[2],nodeY,nodeW,nodeH,'口型 / 表演驱动','音频特征 + 身份参考 → 表演','让嘴形、眼神和头部动作随音频展开。可与视频生成合并，也可独立修复。好看的连续画面仍需逐句验收嘴形。',colors.amber);
miniCard(nodeXs[3],nodeY,nodeW,nodeH,'字幕 / 剪辑合成','数据 + 时间线 → 最终声画','原片使用 Blender（作者说明）。\n我们使用 Canvas、视频映射和 FFmpeg，让词块、箭头与镜头跟着实际歌声、拍点和起音变化。');
arrow(`M936 963 L978 963`);arrow(`M1392 963 L1434 963`);
arrow(`M276 1106 L276 1145 L1188 1145 L1188 1112`,colors.amber);
text(600,1134,'人声 / 音频驱动',19,colors.amber);
arrow(`M276 1157 L276 1187 L1644 1187 L1644 1112`,colors.cyan);
text(830,1176,'原始完整歌曲 → 最终音轨',20,colors.cyan);

heading('02',1260,'依赖的底层：生成模型、数据分析与本地编排','云端生成素材 / 浏览器读取已有结果');
miniCard(M,1296,C,260,'音乐底层 · 官方资料','结构预测 + 声学建模 + 波形重建','Music-3.0 使用全局 / 局部 Hybrid-LM、RVQ、flow matching 与 Flow-VAE；歌词和风格提供条件，输出声音。音乐中的音频 token 与 GPT-2 的文字 ID 分属不同表示。');
miniCard(M+C+G,1296,C,260,'表演底层 · 官方资料 / 通用机制','身份条件 + 音频条件 + 时序生成','Avatar V 报告介绍 DiT / flow matching、身份参考与音频交叉注意力。照片驱动表演仍受输入和生成质量影响；本次各平台内部任务流程没有逐层核验。');
miniCard(M+(C+G)*2,1296,C,260,'我们可控的工程底层','分析缓存 + 唯一时钟 + 确定性合成','GPT-2 ONNX 做文字分词与推理；ASR 提供近似唱词边界，音频分析提供拍点 / 起音 / RMS。JSON 时间线、Canvas / HTMLMedia、FFmpeg 负责播放、合成和导出。');
paragraph(M,1580,'能力上限同时依赖预训练参数、训练数据、输入素材、时序控制和云端服务额度。014 的工程职责是组织线上素材、分析与缓存、声画编排、质量复核和导出；当前网页播放直接读取已有资源与数据。',W-M*2,23,colors.muted,35);

heading('03',1725,'真实数据和视觉语言：放在一起，边界仍要清楚');
const dataY=1762,wide=858;
rect(M,dataY,wide,258);text(M+24,dataY+38,'真实 GPT-2 字节级分词 · 来自本片歌词缓存',22,colors.cyan,500);
const model=JSON.parse(await fs.readFile(path.join(project,'web/public/assets/song-model-data.json'),'utf8'));
const groups=model.records.find(record=>record.text==='我还在这里').groups;
const bx=M+24,bw=184;
for(const [i,group] of groups.entries()){
  const x=bx+i*202;rect(x,dataY+70,bw,112,i===0?'#32281e':'#172a38',i===0?colors.amber:colors.line);
  text(x+16,dataY+114,group.text,35,i===0?colors.amber:colors.fg,500);
  paragraph(x+16,dataY+144,group.ids.join(' · '),bw-26,17,colors.dim,24);
  if(i<3)arrow(`M${x+90} ${dataY+68} Q${x+190} ${dataY+44} ${x+276} ${dataY+65}`,i===0?colors.amber:colors.cyan);
}
text(M+24,dataY+224,'一个中文词组可对应多个 ID；上方弧线仅示意视觉关系。',21,colors.muted);
const right=M+wide+G,rightW=W-M-right;
rect(right,dataY,rightW,258);text(right+24,dataY+38,'下一片段预测：连续歌词前文 → 实际前向推理',22,colors.cyan,500);
const pred=groups[0].prediction;
for(const [i,p] of pred.candidates.entries()){
  const y=dataY+81+i*38;text(right+24,y,'#'+p.id,23,colors.fg);rect(right+155,y-18,180,15,'#213745','none',2);rect(right+155,y-18,180*p.p/.08,15,colors.cyan,'none',2);text(right+360,y,(p.p*100).toFixed(2)+'%',22,colors.fg);
}
text(right+524,dataY+85,'实际首片段 #'+pred.actual,22,colors.amber);text(right+524,dataY+128,'概率 '+(pred.pActual*100).toFixed(2)+'%',29,colors.fg,500);
text(right+24,dataY+224,'这些是字节片段概率；没有用随机数填充，也不是口型评分。',21,colors.muted);
rect(M,2050,W-M*2,85,'#121a21');
text(M+24,2084,'ID = 词表索引   /   权重 = 训练参数   /   激活 = 输入下的中间状态   /   注意力 = 上下文分配',23,colors.fg);
text(M+24,2118,'我们展示编号与预测缓存；箭头方向、点阵位置、冷暖色和镜头是创作编排。原片“真实权重”的说法保留为作者说明。',21,colors.muted);

heading('04',2222,'字幕效果的价值：读词、听拍、感受关系','图形形态服务叙事，不能替代真实注意力测量');
const arrowNames=[['链式','推进'],['回指','回忆'],['分叉','分歧'],['断续','犹豫'],['桥接','连接'],['问句','悬问'],['回应','落定']];
const aw=(W-M*2-6*16)/7;
for(const [i,[name,emotion]] of arrowNames.entries()){
  const x=M+i*(aw+16),y=2260;rect(x,y,aw,140);text(x+20,y+33,name,23,colors.fg,500);
  const cy=y+72;rect(x+24,cy-7,27,19,'#344b5c','none',2);rect(x+aw-53,cy-7,27,19,'#344b5c','none',2);
  if(i===0)arrow(`M${x+56} ${cy+3} L${x+aw-57} ${cy+3}`);
  if(i===1)arrow(`M${x+aw-51} ${cy-11} Q${x+aw/2} ${cy-35} ${x+42} ${cy-12}`,colors.amber);
  if(i===2){arrow(`M${x+56} ${cy+3} Q${x+aw/2} ${cy-16} ${x+aw-57} ${cy-16}`);arrow(`M${x+56} ${cy+3} Q${x+aw/2} ${cy+20} ${x+aw-57} ${cy+20}`);}
  if(i===3)arrow(`M${x+56} ${cy+3} Q${x+aw/2} ${cy-25} ${x+aw-57} ${cy+3}`,colors.cyan,true);
  if(i===4)arrow(`M${x+45} ${cy-11} Q${x+aw/2} ${cy-42} ${x+aw-42} ${cy-11}`);
  if(i===5){arrow(`M${x+56} ${cy+3} Q${x+aw/2} ${cy-27} ${x+aw-68} ${cy-5}`,colors.amber,true);text(x+aw-51,cy+4,'?',28,colors.amber);}
  if(i===6){rect(x+aw-53,cy-7,27,19,colors.amber,'none',2);arrow(`M${x+56} ${cy+3} L${x+aw-57} ${cy+3}`,colors.amber);}
  text(x+20,y+117,emotion,20,colors.dim);
}
const valueW=(W-M*2-G*3)/4;
for(const [i,title,body] of [
  [0,'阅读引导','每次突出少量大词块，主次分明；中文多编号换行，避免整句平铺。'],
  [1,'节奏可视化','随唱词入口、停顿、长音、拍点和起音改变尺寸、亮度与连线长度。'],
  [2,'情绪与关系','回指、断续、问句和回应，让等待、犹豫、确认成为可见的动作。'],
  [3,'作品的技术身份','并置自然语言与机器处理，服务数据艺术、技术叙事；编号可追溯。'],
])miniCard(M+i*(valueW+G),2424,valueW,200,'字幕的表达作用',title,body);
text(M,2665,'同步边界：唱词为 ASR 近似边界，少数字词插值；重音指标来自词长与最终混音能量，未做独立人声重音和精确音素测量。',21,colors.muted);

heading('05',2750,'情绪如何展开：秩序 → 悬置 → 倾诉 → 回应');
const emotional=[['冷色机房 / 主歌','克制与距离','整理答案，仍有说不出口的话；中景、留白和少量词块建立距离。'],['停顿 / 预副歌','犹豫与期待','拉长音、断续弧线和稀疏画面，让“多留住一瞬”变成悬置。'],['雨夜近景 / 副歌','存在感与倾诉','重复“我还在这里”，近景与强调词块集中情绪，音乐层次抬升。'],['暖色海岸 / 结尾','轻声回应与释然','问答、大字、长镜头和环境留白形成落点。新海岸表演尚未通过。']];
for(const [i,[label,title,body]] of emotional.entries())miniCard(M+i*(valueW+G),2787,valueW,226,label,title,body,i===3?colors.amber:colors.cyan);
text(M,3054,'价值：把“被忽略、等待被听见、终于得到回应”组织成可感受的声画体验；虚构的第一人称表达不构成模型意识的证据。',22,colors.muted);

heading('06',3137,'我们的扩展：已经形成可复用的研究工程','完整多场景人物演唱尚未通过');
const milestones=[['62 秒旁白','中文叙述与数据视觉基线'],['七态字幕','词块、真实编号与情绪配乐'],['135.59 秒歌曲','MiniMax 原歌，27 行实际唱词'],['动态演唱初版','3 视频 / 8 映射 / 114.70 秒表演'],['21 镜头分镜','机房、雨夜、海岸；新口型待验收']];
const mw=(W-M*2-4*20)/5;
for(const [i,[title,body]] of milestones.entries()){
  const x=M+i*(mw+20);rect(x,3175,mw,162);text(x+18,3213,'0'+(i+1),20,colors.amber);text(x+18,3250,title,25,colors.fg,500);paragraph(x+18,3287,body,mw-32,20,colors.muted,29);
}
rect(M,3343,W-M*2,96,'#10202a');text(M+24,3378,'可复用：时间线 / 镜头编排 / 歌词与节奏分析 / Token 缓存 / 图层合成 / 版本对比 / MP4 导出 / 来源与复核',22,colors.cyan);
text(M+24,3417,'主片用原歌作为唯一时钟；生成视频按原位置回接、保留水印。全部唱词有人物视频，间奏为场景运镜；表演主要仍在同一雨夜场景。',21,colors.muted);

heading('07',3527,'三轮样片给出的结论：音频保留与连续性改善，仍不足以让嘴形过关','三条均未接入成片 / 共 320 钻石');
const log=JSON.parse(await fs.readFile(path.join(project,'web/public/assets/research/experiment-log.json'),'utf8'));
const outcomes=[['100 钻石 / 原音 0.99958','约 4 秒、8 秒突切；人物、服装与构图改变。'],['120 钻石 / 原音 0.10525','人物稳定，原音保留失败；不能用低相关性的偏移修嘴形。'],['100 钻石 / 原音 0.99958','单镜头与原音改善；无人声间隔仍开口，表演未通过。']];
for(const [i,test] of log.tests.entries()){
  const x=M+i*(C+G);rect(x,3564,C,214);text(x+22,3602,test.title,25,colors.fg,500);text(x+22,3642,outcomes[i][0],22,colors.amber);paragraph(x+22,3680,outcomes[i][1],C-44,23,colors.muted,35);text(x+22,3749,'拒绝接入 · '+test.width+'×'+test.height,20,colors.red,500);
}
text(M,3820,'核心瓶颈是生成表演素材：整体偏移可剪辑校正，逐字错误与间奏开口需改善口型生成。波形相关性不是口型准确率。',23,colors.amber);
text(M,3860,'结论：音乐与文字视觉有创作价值；当前“照片 + 混音歌曲”流程尚不足以可靠完成多场景中文演唱。长提示词或模型标签不能保证质量。',22,colors.muted);

// Future values and test route remain within the same single diagram.
heading('08',3947,'后期扩展价值：复用编排能力，按样片验收解锁人物表演','可扩展方向 / 尚未实施');
for(const [i,title,body] of [
  [0,'歌词 / 音乐短片','替换歌曲和歌词，复用节奏、词块与情绪镜头；减少重复排字和定时工作。'],
  [1,'技术 / 数据艺术','把模型行为与虚构叙事结合，用可追溯数据形成展览和教学表达。'],
  [2,'多语种 / 数字人','扩展分词、字幕与朗读角色；人物演唱依赖合格口型素材与身份连续性。'],
  [3,'可复核的制作流程','素材替换、来源追踪、批量检测与人工验收，让每轮试验积累可复用证据。'],
])miniCard(M+i*(valueW+G),3985,valueW,218,'潜在复用场景',title,body);
text(M,4255,'待验证路线：线上分离同一原歌的人声 → 稳定人物视频 → 独立口型处理 → 回接原完整歌曲 → 先验收 10 秒再扩展。',23,colors.cyan);
paragraph(M,4300,'验收门槛：原唱不变速、人物与服装连续、有声与无声嘴形可信、表情动作支持歌词。Sync 官方建议人声输入；该方案尚未测试，不保证成功。',W-M*2,23,colors.muted,35);
line(M,4390,W-M,4390);
paragraph(M,4425,'证据：DJ SHO 原帖与真实视频帧 / 本片模型与时间线 / 三轮样片复核；机制参考：MiniMax Music-3.0、HeyGen Avatar V、GPT-2 与 Sync 官方资料。',W-M*2,18,colors.dim,27);
text(M,4500,'总库编号 014 · 文字与流程为可编辑矢量 · 抽象背景为 imagegen 示意 · 参考版权属于 DJ SHO · 结论截至 2026-10-10',18,colors.dim);

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="diagram-title diagram-desc"><title id="diagram-title">字间：参考效果、模型分工、字幕价值、中文扩展与口型边界</title><desc id="diagram-desc">八部分完整研究总览。原片与中文版本真实帧作对照，说明四个生产环节、底层依赖、真实数据边界、字幕与情绪价值、已完成工程、三轮拒绝样片及待验证路线。</desc><defs><marker id="arrow-cyan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${colors.cyan}"/></marker><marker id="arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${colors.amber}"/></marker></defs><rect width="${W}" height="${H}" fill="${colors.bg}"/><g font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif">${parts.join('\n')}</g></svg>`;
await fs.writeFile(path.join(out,'overview.svg'),svg);
const sources=[
  {label:'DJ SHO 原帖（原片工具与真实权重为作者说明）',url:'https://x.com/DJ_SHO974/status/2108569544151146742'},
  {label:'MiniMax Music-3.0 官方技术架构',url:'https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model'},
  {label:'HeyGen Avatar V 技术报告（机制参考，非任务内部核验）',url:'https://dynamic.heygen.ai/www/Paper%20Links/avatarv_tech_report.pdf'},
  {label:'HeyGen Photo Avatar 官方说明',url:'https://help.heygen.com/en/articles/10034438-how-to-get-started-with-photo-avatars'},
  {label:'OpenAI GPT-2 官方说明',url:'https://openai.com/index/better-language-models/'},
  {label:'Sync 歌唱口型与人声输入说明（待验证路线）',url:'https://sync.so/docs/models/lipsync'},
];
await fs.writeFile(path.join(out,'overview-content.json'),JSON.stringify({title:'字间研究总览',width:W,height:H,sections,labels,sources,status:'research_summary_not_completed_multiscene',realFrames:[{file:'reference-tokens.jpg',author:'DJ SHO',time:28},{file:'our-performance.jpg',author:'字间',time:30,source:'assets/motion-frame-3.jpg'},{file:'reference-shore.jpg',author:'DJ SHO',time:228}],experimentalPasses:0,experimentalCostDiamonds:320},null,2)+'\n');
console.log(`总览已生成：${W}×${H}，${sections.length} 个模块，${labels.length} 个文本标签；三张真实效果帧嵌入 SVG。`);
