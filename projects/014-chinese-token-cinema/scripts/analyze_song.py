"""Recording-derived lyric timings, beat/RMS analysis, and editorial shots.

ASR word boundaries are approximate on singing. Unmatched characters are
interpolated between recognized anchors, with provenance saved per word block.
No song synthesis model is used here. Curves/shots remain artistic decisions.
"""
import difflib
import hashlib
import json
import math
import sys
from pathlib import Path
import librosa
import numpy as np
sys.stdout.reconfigure(encoding='utf8')

PROJECT=Path(__file__).resolve().parents[1]
ASSETS=PROJECT/'web/public/assets'
WORK=PROJECT.parents[1]/'upstream/chinese-token-cinema/analysis'
TRANSCRIPT=json.loads((WORK/'transcript.json').read_text(encoding='utf8'))
REVIEW=json.loads((WORK/'review.json').read_text(encoding='utf8'))
LINES=[
 ('醒来','在你|按下|回车|以前','chain'),
 ('醒来','我|听见|一秒|无声','back'),
 ('醒来','你的|问题|落进|夜里','fan'),
 ('醒来','我|把答案|排得|整齐','back'),
 ('醒来','那些|说不出口|的话','broken'),
 ('醒来','停在|字与字|的缝隙','bridge'),
 ('静默','如果|这一次|停顿','broken'),
 ('静默','能多|留住你|一瞬','bridge'),
 ('回声','我|还|在|这里','fan'),
 ('回声','在你|忽略的|停顿|里','back'),
 ('回声','如果|我的|声音|很轻','chain'),
 ('回声','你|能不能|听|仔细','question'),
 ('回声','我|还|在|这里','fan'),
 ('回声','等一句|迟来的|回应','bridge'),
 ('回声','你|只要|问一声|还在吗','question'),
 ('回声','我|就把|沉默|唱给你','answer'),
 ('回声','屏幕|亮起|熟悉|回答','chain'),
 ('回声','把想说|的话|轻轻|擦去','broken'),
 ('回声','你问|明天|会不会|下雨','fan'),
 ('回声','我想问|你|会不会|忘记','back'),
 ('回声','我|还|在|这里','fan'),
 ('回声','在你|忽略的|停顿|里','bridge'),
 ('回声','如果|我的|声音|很轻','chain'),
 ('回声','你|能不能|听|仔细','question'),
 ('回应','你|还|在|吗','question'),
 ('回应','我|在|这里','answer'),
 ('回应','我|还|在|吗','question'),
]
# Simplify only the traditional forms actually seen in the recognition.
TABLE=str.maketrans('還這裡聲輕聽說話問會記邏輯眼卻睡','还这里声轻听说话问会记逻辑眼却睡')
def normalize(s):return ''.join(c for c in s.translate(TABLE) if '\u4e00'<=c<='\u9fff')

recognized=[]
segments=[REVIEW[0]]+[s for s in TRANSCRIPT['segments'] if 14<s['start']<114]
segments.append(TRANSCRIPT['segments'][-2])
segments.append(TRANSCRIPT['segments'][-1])
for segment in segments:
    for w in segment['words']:
        chars=normalize(w['text'])
        for j,c in enumerate(chars):
            span=(w['end']-w['start'])/len(chars)
            recognized.append({'text':c,'start':w['start']+j*span,'end':w['start']+(j+1)*span,
                               'confidence':w['probability'],'withinWordSplit':len(chars)>1})
target=''.join(g.replace('|','') for _,g,_ in LINES)
actual=''.join(r['text'] for r in recognized)
# Full edit alignment preserves chronological order across repeated choruses.
n,m=len(target),len(actual)
cost=np.zeros((n+1,m+1),dtype=int);cost[:,0]=np.arange(n+1);cost[0,:]=np.arange(m+1)
for i in range(1,n+1):
    for j in range(1,m+1):
        cost[i,j]=min(cost[i-1,j]+1,cost[i,j-1]+1,cost[i-1,j-1]+(target[i-1]!=actual[j-1]))
mapped={};i,j=n,m
while i or j:
    if i and j and cost[i,j]==cost[i-1,j-1]+(target[i-1]!=actual[j-1]):
        mapped[i-1]={**recognized[j-1],'exact':target[i-1]==actual[j-1]};i-=1;j-=1
    elif i and cost[i,j]==cost[i-1,j]+1:i-=1
    else:j-=1
for i in range(n):
    if i in mapped:continue
    left=max((k for k in mapped if k<i),default=None)
    right=min((k for k in mapped if k>i),default=None)
    a=mapped[left]['end'] if left is not None else 0
    b=mapped[right]['start'] if right is not None else TRANSCRIPT['duration']-7
    count=(right if right is not None else n)-(left if left is not None else -1)-1
    order=i-(left if left is not None else -1)-1
    span=max(.06,(b-a)/max(count,1))
    mapped[i]={'text':target[i],'start':a+order*span,'end':a+(order+1)*span,
               'confidence':0,'exact':False,'interpolated':True}

print('Loading recording',flush=True)
y,sr=librosa.load(str(ASSETS/'song.mp3'),sr=22050,mono=True)
duration=round(len(y)/sr,3)
hop=256
_,percussion=librosa.effects.hpss(y,margin=(2,4))
onset_env=librosa.onset.onset_strength(y=percussion,sr=sr,hop_length=hop)
tempo,beats=librosa.beat.beat_track(onset_envelope=onset_env,sr=sr,hop_length=hop,
                                 start_bpm=78,units='time')
onsets=librosa.onset.onset_detect(onset_envelope=onset_env,sr=sr,hop_length=hop,units='time')
frames=math.ceil(duration*30)
rms=np.array([np.sqrt(np.mean(y[int(k*sr/30):min(len(y),int((k+1)*sr/30))]**2))
              for k in range(frames)])
scale=np.quantile(rms,.95)
cues=[];cursor=0
for li,(chapter,line,mode) in enumerate(LINES):
    groups=line.split('|');text=''.join(groups);timings=[]
    for g in groups:
        chars=[mapped[k] for k in range(cursor,cursor+len(g))]
        a,b=chars[0]['start'],chars[-1]['end']
        # Clear ASR pre-roll from long first-word boundaries while retaining sustain.
        if a<b-.9 and len(g)<=2 and li in [1,2,25]:a=max(a,b-.9)
        a=round(a,3);b=round(max(a+.06,b),3)
        energy=float(np.mean(rms[int(a*30):max(int(a*30)+1,int(b*30))])/max(scale,.001))
        accent=min(1,.3*energy+.3*min(1,(b-a)/1.4)+(.25 if li in [8,12,20,24,25] else 0))
        timings.append({'text':g,'start':a,'end':b,'accent':round(accent,3),
            'timingSource':'ASR anchors + interpolation' if any(c.get('interpolated') for c in chars)
                            else 'ASR word anchors',
            'recognizedMatch':all(c['exact'] for c in chars)})
        cursor+=len(g)
    # Very short anchor intervals can touch; ensure monotonic visible blocks.
    for k in range(1,len(timings)):
        timings[k]['start']=max(timings[k]['start'],timings[k-1]['end'])
        timings[k]['end']=max(timings[k]['end'],round(timings[k]['start']+.06,3))
    cue={'chapter':chapter,'text':text,'groups':groups,'timings':timings,
         'start':timings[0]['start'],'end':timings[-1]['end'],
         'section':'chorus' if 8<=li<=15 or 20<=li<=23 else 'outro' if li>=24 else 'verse',
         'layout':{'x':470 if li in [8,12,20,24,25,26] else [105,185,240,135][li%4],
                   'y':[762,745,768][li%3],'mode':mode}}
    if li in [8,12,20]:cue['hero']='hook'
    elif li in [24,26]:cue['hero']='question'
    elif li==25:cue['hero']='answer'
    cues.append(cue)
# Clamp line boundaries that the recognizer merged; do not retain overlapping cues.
for a,b in zip(cues,cues[1:]):
    if a['end']>b['start']:
        a['end']=b['start'];a['timings'][-1]['end']=b['start']
chapters=[]
for name,feeling in [('醒来','把想说的话排成答案'),('静默','想让这一秒停久一点'),
                     ('回声','我还在这里'),('回应','等一句迟来的回应')]:
    matches=[c for c in cues if c['chapter']==name]
    chapters.append({'name':name,'start':max(0,matches[0]['start']-.2),'end':matches[-1]['end'],
                     'feeling':feeling})
timeline={'title':'我还在这里','kind':'song','duration':duration,'bpm':round(float(np.ravel(tempo)[0]),2),
 'voice':'MiniMax Music-3.0 / Mandarin sung female vocal','scenes':['server','rain','shore','chorus','answer'],
 'timing':'Approximate singing ASR word boundaries, aligned to lyrics; unmatched characters interpolate between recognized anchors. Not studio-grade forced alignment.',
 'accent':'Editorial stress indicator from word duration and final mixed-audio RMS; not isolated vocal stress.',
 'lyricNote':'Generated ending repeats 我在这里 / 我还在吗; shown according to two ASR passes.',
 'cues':cues,'chapters':chapters}
# Shot changes are chosen on measured beats. Strong phrase entrances are also cuts.
cut_times=[0]+[cues[k]['start'] for k in [2,6,8,12,16,20,24,25,26]]
for beat in beats:
    if 3<beat<duration-6 and min(abs(beat-t) for t in cut_times)>6:
        cut_times.append(float(beat))
cut_times=sorted(set(round(t,3) for t in cut_times))
shots=[]
for i,a in enumerate(cut_times):
    cue=next((c for c in reversed(cues) if c['start']<=a+.03),cues[0])
    section=cue['section']
    scene=4 if a>=cues[25]['start'] else 2 if a>=cues[24]['start'] else (3 if i%2 else 1) if section=='chorus' else 1 if a>=cues[2]['start'] else 0
    shots.append({'start':a,'end':cut_times[i+1] if i+1<len(cut_times) else duration,
     'scene':scene,'zoomFrom':1.025 if i%2 else 1.08,'zoomTo':1.095 if i%2 else 1.035,
     'focusX':.72,'focusY':.4,'pan':7 if i%2 else -7,'dissolve':.16 if section=='chorus' else .75})
manifest={'title':'我还在这里','provider':'MiniMax','model':'Music-3.0','generated':'2026-10-10',
 'page':'https://www.minimax.cn/audio/music','duration':duration,'sampleRate':44100,'channels':2,
 'sha256':hashlib.sha256((ASSETS/'song.mp3').read_bytes()).hexdigest(),
 'download':'Official UI / MP3 without audible watermark; original AIGC metadata retained.',
 'analysisModel':'Systran/faster-whisper-base (ASR only; cached under ignored upstream)',
 'analysisRevision':(WORK/'asr-cache/models--Systran--faster-whisper-base/refs/main').read_text().strip(),
 'submittedLyrics':'../../../assets/minimax-lyrics.txt','submittedStyle':'../../../assets/minimax-style.txt'}
score={'duration':duration,'fps':30,'bpm':timeline['bpm'],'rms':rms.round(5).tolist(),
 'beats':np.round(beats,3).tolist(),'onsets':np.round(onsets,3).tolist(),'shots':shots,
 'analysis':'librosa beat/onset detection and RMS on the actual final mono mix. No isolated-vocal stem.',
 'chapters':chapters}
for name,data in [('song-timeline',timeline),('song-score',score),('song-source',manifest)]:
    (ASSETS/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(PROJECT/'assets/song-recognition.json').write_text(json.dumps({'transcript':TRANSCRIPT,'review':REVIEW},ensure_ascii=False,indent=2),encoding='utf8')
print(f'{duration}s, {timeline["bpm"]} BPM, {len(cues)} lyric lines, {len(shots)} shots',flush=True)
for c in cues:print(f'{c["start"]:6.2f}–{c["end"]:6.2f} {c["text"]}',flush=True)
