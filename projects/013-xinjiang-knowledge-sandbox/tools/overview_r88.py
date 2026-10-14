"""Separate the current product guide from retained research chapters."""
from pathlib import Path
from html.parser import HTMLParser
import json,os,re
P=Path(__file__).resolve().parents[1];W=P/'web/public';R=P/'process/round-88'
assert not (R/'retention.json').exists()
p=W/'overview.html';s=p.read_text(encoding='utf-8')
assert 'id="retained-research"' not in s
offsets=[0]
for line in s.splitlines(True):offsets.append(offsets[-1]+len(line))
class Sections(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=False);self.depth=0;self.spans=[]
 def at(self):a,b=self.getpos();return offsets[a-1]+b
 def handle_starttag(self,tag,attrs):
  if tag=='section':
   if self.depth==0:self.start=self.at();self.attrs=dict(attrs)
   self.depth+=1
 def handle_endtag(self,tag):
  if tag=='section':
   self.depth-=1
   if self.depth==0:self.spans.append((self.start,self.at()+len('</section>'),self.attrs))
parser=Sections();parser.feed(s)
sections={a.get('id','hero' if 'hero' in a.get('class','').split() else ''):s[i:j] for i,j,a in parser.spans}
hero=sections['hero'].replace('R86 · 地点、变化与回应相接','R88 · 一条主线，保留全部探索').replace('喀什交换、轮台结构与河谷水利各有实际变化，镜头和字幕跟随当前观察；完成后把结果带回地图。','先定位地球，再停在新疆全貌；选事件、进入地点模型、操作后返回。其他地理、历史、文化和生活线索保留在统一入口。').replace('r86-market-response.png','r88-entry.png').replace('R86实际3D网页：选择织物后，家人使用与回应，当前步骤和字幕同步','R88实际3D网页：地球定位新疆，单一主线导航和全域地图入口').replace('R86实际网页 / 需要、交接与人物回应','R88实际网页 / 从地球开始的统一入口').replace('./?edition=r86&amp;trail=zhang&amp;learn=place&amp;learnPlace=kashgar&amp;learnModel=1&amp;learnScene=market','./?edition=r88&amp;learn=world')
hero=hero.replace('./?director=zhang','./?edition=r88&amp;director=zhang',1)
firstEnd=next(j for i,j,a in parser.spans if 'hero' in a.get('class','').split());nextStart=min(i for i,j,a in parser.spans if i>firstEnd)
facts=s[firstEnd:nextStart]
hist='''<section id="history-trails" class="section"><div class="section-heading"><div><p class="eyebrow">HISTORY / THREE QUESTIONS</p><h2>同一片地域，三个不同的历史问题。</h2></div></div><div class="source-columns"><article><h3>张骞出使</h3><p>先认识山地与盆地，再看外交目的、记载的经历与后续交流。喀什集市作为跨时期机制情境，比较货物怎样进入生活。</p><a href="./?learn=map&amp;mapMode=relations&amp;relation=zhang&amp;relationScope=region&amp;relationMotion=0">从新疆地图开始 ↗</a></article><article><h3>西域都护</h3><p>把已有地方、机构设立与地方联系放在同一张地图里理解。轮台作地域参照，抽象模型用于观察入口与内外空间。</p><a href="./?learn=map&amp;mapMode=relations&amp;relation=protectorate&amp;relationScope=region&amp;relationMotion=0">从机构与地方开始 ↗</a></article><article><h3>锡伯西迁</h3><p>分开看远行、抵达、安置与后期水利。近景按年代观察初期耕作、开渠和来水，保留家庭的原有选择。</p><a href="./?learn=map&amp;mapMode=relations&amp;relation=xibe&amp;relationScope=region&amp;relationMotion=0">从伊犁河谷开始 ↗</a></article></div></section>'''
director='''<section id="auto-director" class="section"><div class="section-heading"><div><p class="eyebrow">WATCH / EXPLORE</p><h2>自动演示与自由探索，共用同一套3D对象。</h2></div><a href="./?edition=r88&amp;director=zhang">选择三条导演路径 ▷</a></div><p>导演按地球方位、新疆地理、历史变化、地点操作和返回顺序推进。下方幕次保持可选；可以暂停、缩放、自由接管和返回地图。讲解和字幕沿用已有声音，近景回应由真实模型状态完成。</p><p>自己探索时，全域地图先停住，由你选择下一条线索；历史介绍与模型进入合并为清楚的操作。国家图层、年代索引、地形分析和原场景工具折叠保留。</p></section>'''
gaps='''<section id="gaps" class="section"><div class="section-heading"><div><p class="eyebrow">CURRENT SCOPE</p><h2>当前能操作什么，资料与模型有哪些边界？</h2></div></div><p>地图定位、三条历史探索、自然地形、用水、集市、屯居、庭院和关口等能力继续保留；自由镜头、参数、语音字幕、配置与返回仍可使用。本轮整理导航和主线，没有增加场景或人物小动作。</p><p>历史事件、现代地域参照和机制情境分别说明。地球与地点通过定位和镜头衔接，尚未实现全球连续高精度地形加载；人物与建筑仍较简化，不作特定古城或村落的写实复原。</p><a href="./assets/records/round-88.md">本轮实际检查与增量记录 ↗</a></section>'''
kept={'hero','knowledge','watch','coverage','archive','sources'}
archived=[]
for i,j,a in parser.spans:
 id=a.get('id','hero' if 'hero' in a.get('class','').split() else '')
 if id not in kept:
  fragment=s[i:j]
  if id in {'history-trails','auto-director','gaps'}:fragment=fragment.replace('id="'+id+'"','id="'+id+'-archive"',1)
  archived.append(fragment)
archive=sections['archive']
history='<details id="retained-research" class="retained-research"><summary>历轮研究、旧专题入口与前后对比（完整保留）</summary>'+''.join(archived)+'</details>'
archive=archive.replace('</section>',history+'</section>',1)
main=hero+facts+sections['knowledge']+hist+director+sections['watch']+sections['coverage']+gaps+archive+sections['sources']
a=s.index('<main id="main">')+len('<main id="main">');b=s.index('</main>',a);s=s[:a]+main+s[b:]
a=s.index('<nav aria-label="项目导航">');b=s.index('</nav>',a)+6
s=s[:a]+'<nav aria-label="项目导航"><a href="#knowledge">认识新疆</a><a href="#history-trails">历史路径</a><a href="#auto-director">自动导演</a><a href="#watch">原视频</a><a href="#archive">研究记录</a><a href="#sources">资料来源</a></nav>'+s[b:]
s=s.replace('R86三路径的模型观察与地图回应','R88统一入口与探索主线',1).replace('R86 地点变化与地图回应','R88 统一入口与探索主线',1)
p.write_text(s,encoding='utf-8')
p=W/'overview.js';s=p.read_text(encoding='utf-8');s+='''
// Old deep links still reveal their retained research chapter.
function revealRetainedChapter(){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(!target)return;for(let parent=target.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}
window.addEventListener('hashchange',revealRetainedChapter);if(location.hash)revealRetainedChapter();
''';p.write_text(s,encoding='utf-8')
p=W/'overview.css';s=p.read_text(encoding='utf-8');s+='\n.retained-research{margin-top:28px;border-top:1px solid #bcc9b8;padding:18px 0}.retained-research>summary{font-size:14px;cursor:pointer}.retained-research>.section{padding:30px 0}.site-header nav{flex-wrap:wrap;gap:12px 20px}\n';p.write_text(s,encoding='utf-8')
for target in [W/'assets/process/r88-entry.png',P/'assets/preview-r88.png']:
 target.parent.mkdir(parents=True,exist_ok=True)
 if not target.exists():os.link(R/'01-world-entry.png',target)
(R/'README.md').write_text('# R88 · 统一入口与探索主线\n\n本轮整理地球、全域地图、历史事件与地点模型的主线。其他已探索线索、旧场景、声音与原片保留。实际浏览器检查、截图与最终源码按round-87增量保存。\n',encoding='utf-8')
target=W/'assets/records/round-88.md';target.parent.mkdir(parents=True,exist_ok=True)
if not target.exists():os.link(R/'README.md',target)
catalog=P.parents[1]/'projects.json';data=json.loads(catalog.read_text(encoding='utf-8-sig'));entry=next(x for x in data['projects'] if x['id']=='013');entry.update(summary='R88：统一地球、全域地图、历史与地点模型的探索主线，合并重复导航和讲解，全域地图等待用户选择。保留三历史路径、自然与生活线索、自由操作、自动导演和返回；过程按SHA-256增量保存。',preview='assets/preview-r88.png',previewCaption='R88实际3D网页：地球定位新疆，统一层级导航和进入全域地图的主操作；其他专题与工具折叠保留。');catalog.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Current overview organized; old chapters and deep links retained')
