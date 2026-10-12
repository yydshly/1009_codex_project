"""Recognize the completed recording; this is ASR, not music generation.

Small multilingual recognition cache stays in ignored upstream. The recognition
is evidence for lyric timing and must be reviewed against the submitted lyrics.
"""
import json
import sys
from pathlib import Path
from faster_whisper import WhisperModel
sys.stdout.reconfigure(encoding='utf8')

project = Path(__file__).resolve().parents[1]
work = project.parents[1] / 'upstream/chinese-token-cinema/analysis'
work.mkdir(parents=True, exist_ok=True)
lyrics = (project / 'assets/minimax-lyrics.txt').read_text(encoding='utf8')
model = WhisperModel('base', device='cpu', compute_type='int8', cpu_threads=6,
                     download_root=str(work / 'asr-cache'))
if '--review' in sys.argv:
    from faster_whisper.audio import decode_audio
    samples=decode_audio(str(project / 'web/public/assets/song.mp3'),sampling_rate=16000)
    reviewed=[]
    for start,end in [(0,15),(51,58),(114,135.6)]:
        segs,_=model.transcribe(samples[int(start*16000):int(end*16000)],language='zh',
            beam_size=5,word_timestamps=True,vad_filter=False,condition_on_previous_text=False,
            initial_prompt='普通话女声歌曲，我还在这里，停顿，仔细，回应。')
        for s in segs:
            item={'start':start+s.start,'end':start+s.end,'text':s.text,
              'words':[{'text':w.word,'start':start+w.start,'end':start+w.end,'probability':w.probability}
                       for w in s.words or []]}
            reviewed.append(item);print(json.dumps(item,ensure_ascii=False),flush=True)
    (work/'review.json').write_text(json.dumps(reviewed,ensure_ascii=False,indent=2),encoding='utf8')
    sys.exit(0)
segments, info = model.transcribe(str(project / 'web/public/assets/song.mp3'),
    language='zh', beam_size=5, word_timestamps=True, vad_filter=False,
    initial_prompt=lyrics, condition_on_previous_text=False)
items = []
for segment in segments:
    item = {'start':segment.start, 'end':segment.end, 'text':segment.text,
            'words':[{'text':w.word,'start':w.start,'end':w.end,'probability':w.probability}
                     for w in segment.words or []]}
    items.append(item)
    print(json.dumps(item, ensure_ascii=False), flush=True)
(work / 'transcript.json').write_text(json.dumps({'language':info.language,
    'duration':info.duration,'model':'Systran/faster-whisper-base','segments':items},
    ensure_ascii=False,indent=2),encoding='utf8')
