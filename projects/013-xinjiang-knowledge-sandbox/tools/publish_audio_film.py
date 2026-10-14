"""Update the local overview only after the complete new movie passes its checks."""
from pathlib import Path
import json,re
P=Path(__file__).resolve().parents[1];W=P/'web/public';R=P/'process/round-25'
verification=json.loads((R/'recordings/media-verification.json').read_text('utf-8'))
speech=json.loads((R/'speech-and-sync-verification.json').read_text('utf-8'))
assert verification['pass'] and speech['pass'] and speech['narrations']==33
log=json.loads((R/'recordings/xinjiang-journey-cues.json').read_text('utf-8'))
cues={c['id']:c for c in log['cues'] if not c.get('ended')}
duration=verification['durationSeconds'];clock=f'{int(duration)//60}:{int(duration)%60:02d}'
h=(W/'overview.html').read_text('utf-8')
h=h.replace('当前画面 R23','当前成品 R25').replace('R23 实际完整录制影片','R25 完整声画影片').replace('49 段既有语音 / 12 条导览待补','33 条导览 / 19 条角色分支语音')
h=h.replace('<strong>10:31</strong>',f'<strong>{clock}</strong>')
h=h.replace('我们的当前完整成片 <small>R23</small>','我们的完整成片 <small>R25 · 声音整合</small>')
h=h.replace('10:31 / 1280 × 720',f'{clock} / 1280 × 720').replace('R23完整实际录制影片','R25完整声画影片').replace('./assets/media/current-r23.mp4','./assets/media/current-r25.mp4').replace('./assets/overview/current-poster.jpg','./assets/overview/current-r25-poster.jpg')
h=h.replace('实际 WebGL 录制，保留定位、动作、演示选择与结尾。内容时钟 8:32；影片含镜头抵达、回应及结果停留。新增空间导览旁白稍后补。','完整空间旅行、演示选择与人物回应。导览旁白已补齐；脚步、物件交接、庭院拍点与画面同步，环境声随镜头接续。进入交互版可尝试其他分支。')
times=['earth-arrival','region-structure','water-mountains','exchange-stops','memory-journey','memory-practice','modern-kashgar']
labels=['地球','新疆','冰谷','集市','远行','庭院','关口'];index=iter(zip(times,labels))
def cue_button(match):
 key,label=next(index);second=cues[key]['recordingSecond'];return f'<button data-player="current" data-time="{second:.2f}">{label} {int(second)//60}:{int(second)%60:02d}</button>'
h=re.sub(r'<button data-player="current" data-time="[^"]+">[^<]+</button>',cue_button,h)
h=h.replace('49 条既有 MiniMax 音频继续保留。12 条新增或改写的空间导览旁白按你的决定稍后补；本页两段视频均保留原有音轨。',f'十二条新导览已用 MiniMax 补齐。当前成片有33段导览与演示分支回应，环境声、人声和接触音统一混音。人物口型仍为声音振幅同步；分场景声景和教学节奏为原创。原帖声音完整保留。')
h=h.replace('29 段实际语音首尾核验 ↗','历史 R23 语音首尾核验 ↗')
h=h.replace('<div class="verification-links">','<div class="verification-links"><a href="./assets/records/r25-speech.json">R25 全部导览与声画同步核验 ↗</a><a href="./assets/records/r25-media.json">R25 完整影片与混音测量 ↗</a>')
(W/'overview.html').write_text(h,encoding='utf-8')
block=f'''<!-- PROJECT-OVERVIEW -->
## 项目入口与当前状态

[项目总览与原视频](http://127.0.0.1:4313/1009_codex_project/013-xinjiang-knowledge-sandbox/overview.html#watch)展示R25完整声画影片（{clock}）、原帖视频、七类内容、数据边界与历轮素材。十二条新导览已生成，当前共33条旁白和19条角色分支语音；脚步、道具与演奏接触音跟随实际动画，分场声景随镜头接续，人声优先混音。真实数据与简化人物继续沿用已有来源，口型仍为振幅同步。

默认首页为总览；`?demo=1`为完整交互故事，`?scene=...`为自由场景。新影片、原片和历史影片均从共享素材库接入，网页与本地构建通过硬链接复用；运行`tools/sync_overview_materials.py`更新入口，构建后运行`tools/reuse_generated_media.py`消除经校验的影片副本。R25按R24基线增量记录，不生成累计ZIP；所有历史素材继续保留。原演示源码与许可仍未确认。
<!-- /PROJECT-OVERVIEW -->'''
for file in [P/'README.md',P/'web/README.md']:
 text=file.read_text('utf-8');text=re.sub(r'<!-- PROJECT-OVERVIEW -->.*?<!-- /PROJECT-OVERVIEW -->',block,text,flags=re.S)
 text=text.replace('## 当前版本 · 走近地形与人的动作','## R23历史版本 · 走近地形与人的动作');file.write_text(text,encoding='utf-8')
attribution=W/'ATTRIBUTION.md';text=attribution.read_text('utf-8')
text+='\n## R25 · 完整空间导览与原创声景\n\n2026-10-11，使用MiniMax `speech-2.8-hd`和既有普通话旁白系统声线新生成十二条空间导览，九条更新、三条新增；目前33条导览与19条角色分支。请求、响应摘要、时长和SHA-256保留在R25，不包含凭据。声景、材质接触音、轻微庭院反射和教学演奏均为原创合成，不是当地实地录音或真实木卡姆复原。动作音来自渲染脚掌支撑、双手道具交接和实际演奏相位。\n\n项目总览展示R25新成片，R23历史影片和原帖完整音画保持只读。原片未作为生成输入；人物仍是简化原创造型，口型为实际语音振幅同步。最终测量与声画匹配见本轮验证文件。\n'
attribution.write_text(text,encoding='utf-8')
metadata=P.parents[1]/'projects.json';data=json.loads(metadata.read_text('utf-8'));rows=data if isinstance(data,list) else data['projects']
for row in rows:
 if row.get('slug')=='xinjiang-knowledge-sandbox':row['summary']='新疆多尺度空间旅行与原创人物故事；补齐MiniMax导览、动作接触音和分场声景，完整影片与原片对照，探索素材按内容增量保留。'
metadata.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'version':'R25','duration':clock,'narrations':speech['narrations'],'playedSpeech':speech['playedSpeech'],'ready':True},ensure_ascii=False))
