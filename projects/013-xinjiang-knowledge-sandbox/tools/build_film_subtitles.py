"""Small external caption edition of the retained R29 film; no video re-encode.

Speech starts come from the verified film/source waveform alignment. Internal
phrase boundaries follow source silence near character-weighted positions;
they are estimates, not ASR or word-level forced alignment.
"""
import json
import argparse
import re
import subprocess
from pathlib import Path

import numpy as np

PROJECT = Path(__file__).resolve().parents[1]
PUBLIC = PROJECT / 'web/public'
OUT = PUBLIC / 'assets/captions'
FFMPEG = Path('D:/26project/26audio_and_video_project/ffmpeg-n6.1.3-win64-gpl-shared-6.1/bin/ffmpeg.exe')

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def phrases(text):
    parts = re.findall(r'[^，。！？；：]+[，。！？；：]?', text)
    result = []
    for part in parts:
        while len(part) > 36:
            result.append(part[:30])
            part = part[30:]
        if result and len(result[-1]) + len(part) <= 30:
            result[-1] += part
        else:
            result.append(part)
    assert ''.join(result) == text
    return result

def timings(file, text):
    raw = subprocess.run([str(FFMPEG), '-v', 'error', '-i', str(file), '-f', 'f32le',
                          '-ar', '16000', '-ac', '1', 'pipe:1'], check=True, capture_output=True).stdout
    samples = np.frombuffer(raw, dtype=np.float32)
    block = 160
    signal = samples[:len(samples)//block*block].reshape(-1, block)
    rms = np.sqrt(np.mean(signal**2, axis=1))
    voiced = rms > max(.003, float(rms.max())*.025)
    audible = np.flatnonzero(voiced)
    start = max(0, audible[0]*.01-.06)
    end = min(len(samples)/16000, (audible[-1]+1)*.01+.14)
    pauses = []
    run = None
    for i, active in enumerate(voiced):
        if not active and run is None:
            run = i
        elif active and run is not None:
            if i-run >= 8 and run*.01 > start+.3 and i*.01 < end-.3:
                pauses.append((run+i)*.005)
            run = None
    words = phrases(text)
    weights = [max(1, len(re.sub(r'[，。！？；：]', '', p))) for p in words]
    boundaries = [start]
    weight = 0
    for w in weights[:-1]:
        weight += w
        wanted = start+(end-start)*weight/sum(weights)
        available = [p for p in pauses if abs(p-wanted) < .7 and p > boundaries[-1]+.6 and p < end-.6]
        boundaries.append(min(available, key=lambda p: abs(p-wanted)) if available else wanted)
    boundaries.append(end)
    return [{'start': round(a, 3), 'end': round(b, 3), 'text': p}
            for a, b, p in zip(boundaries, boundaries[1:], words)]

def timestamp(seconds):
    ms = round(seconds*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}'

def vtt(rows, include_dialogue):
    lines = ['WEBVTT', '', 'NOTE 中文合成语音字幕；片段起点来自影片波形核验，句内停顿为估计。', '']
    for i, row in enumerate(rows):
        if row['kind'] == 'dialogue' and not include_dialogue:
            continue
        text = row['text']
        if len(text) > 20:
            middle = len(text)//2
            cuts = [m.end() for m in re.finditer(r'[，。！？；：]', text) if 7 < m.end() < len(text)-6]
            cut = min(cuts, key=lambda c: abs(c-middle)) if cuts else middle
            text = text[:cut]+'\n'+text[cut:]
        if row['kind'] == 'dialogue':
            text = row['role']+'：'+text
        lines += [str(i+1), f"{timestamp(row['start'])} --> {timestamp(row['end'])} line:94% position:50% size:92% align:center", text, '']
    return '\n'.join(lines)+'\n'

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--round',default='round-29');parser.add_argument('--burned-narration',action='store_true');args=parser.parse_args()
    assert re.fullmatch(r'round-\d{2}',args.round)
    record=PROJECT/'process'/args.round
    prefix='r'+args.round.split('-')[1]
    duration=read(record/'recordings/media-verification.json')['durationSeconds']
    narration = read(PUBLIC/'assets/audio-script.json')
    dialogue = {r['id']: r for r in read(PUBLIC/'assets/audio/dialogue/script.json')['clips']}
    verified = read(record/'speech-and-sync-verification.json')['results']
    rows, clips, transcript = [], {}, []
    for speech in verified:
        id, kind = speech['id'], speech['kind']
        text = narration[id] if kind == 'narration' else dialogue[id]['text']
        role = '导览' if kind == 'narration' else {'family':'家人','field':'田边的人'}.get(dialogue[id]['role'], dialogue[id]['role'])
        source = PUBLIC/'assets/audio'/((id if kind == 'narration' else 'dialogue/'+id)+'.mp3')
        clip = timings(source, text)
        if kind == 'narration':
            clips[id] = clip
        first = speech['matchedSecond']
        offset = speech['offsetSeconds']
        for part in clip:
            a = first+max(0, part['start']-offset)
            b = min(first+speech['durationSeconds'], first+part['end']-offset)
            rows.append({'id': id, 'kind': kind, 'role': role, 'start': round(a, 3), 'end': round(b, 3), 'text': part['text']})
        transcript.append({'id': id, 'kind': kind, 'role': role, 'start': round(first, 3), 'end': round(first+speech['durationSeconds'], 3), 'text': text})
    rows.sort(key=lambda r: r['start'])
    assert all(r['start'] < r['end'] < duration for r in rows)
    assert all(a['end'] <= b['start'] for a,b in zip(rows, rows[1:])), 'Overlapping captions'
    OUT.mkdir(exist_ok=True)
    (OUT/f'{prefix}-narration.zh.vtt').write_text(vtt(rows, False), encoding='utf-8')
    (OUT/f'{prefix}-complete.zh.vtt').write_text(vtt(rows, True), encoding='utf-8')
    (OUT/'narration-clips.json').write_text(json.dumps(clips, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    manifest = {'version': prefix.upper()+' film captions', 'movie': f'../media/current-{prefix}.mp4',
                'duration': duration, 'speechCount': len(transcript), 'narrations': 33, 'dialogues': 8,'burnedNarration':args.burned_narration,
                'timingMethod': 'Waveform-verified speech starts; internal phrase timings estimated from source pauses and character weight. Not word-level forced alignment.',
                'defaultTrack': 'Narration and selected replies are already in the film.' if args.burned_narration else '33 narration clips; selected character replies already have burned-in captions.',
                'phrases': rows, 'transcript': transcript}
    context_file=record/'film-contexts.json'
    if context_file.is_file():manifest['contexts']=read(context_file)
    (OUT/f'{prefix}-subtitles.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'speechClips': len(transcript), 'phrases': len(rows), 'externalBytes': sum(p.stat().st_size for p in OUT.iterdir()), 'videoReencoded': False}))

if __name__ == '__main__':
    main()
