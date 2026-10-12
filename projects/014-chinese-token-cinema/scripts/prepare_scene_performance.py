"""Prepare exact original-song passages for a two-scene online avatar job."""
import hashlib
import json
import shutil
import subprocess
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'web/public/assets'
OUT = ROOT.parents[1] / 'upstream/chinese-token-cinema/scene-performance'
SCENES = {
    'verse-server': {'photo': 'server.png', 'ranges': [(0, 8), (10.3, 25.6), (76.2, 92.2)],
                     'emotion': '冷色机房，中景，克制的等待'},
    'ending-shore': {'photo': 'answer.png', 'ranges': [(115.8, 129)],
                     'emotion': '暖色海岸，近景，轻声确认与停顿'},
}

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    scenes = []
    for name, spec in SCENES.items():
        offset, parts, mapping = 0, [], []
        for i, (start, end) in enumerate(spec['ranges']):
            target = OUT / f'{name}-{i+1}.wav'
            subprocess.run([shutil.which('ffmpeg'), '-hide_banner', '-loglevel', 'error', '-y',
                            '-i', str(PUBLIC / 'song.mp3'), '-ss', str(start), '-t', str(end-start),
                            '-vn', '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', str(target)], check=True)
            with wave.open(str(target), 'rb') as source:
                parts.append(source.readframes(source.getnframes()))
                duration = source.getnframes() / source.getframerate()
            mapping.append({'start': start, 'end': end, 'offset': round(offset, 5)})
            offset += duration
        target = OUT / f'{name}.wav'
        with wave.open(str(target), 'wb') as result:
            result.setnchannels(2)
            result.setsampwidth(2)
            result.setframerate(44100)
            for part in parts:
                result.writeframes(part)
        shutil.copy2(PUBLIC / spec['photo'], OUT / spec['photo'])
        scenes.append({'id': name, 'emotion': spec['emotion'], 'photo': spec['photo'],
                       'photoSha256': hashlib.sha256((PUBLIC / spec['photo']).read_bytes()).hexdigest(),
                       'duration': round(offset, 5), 'audioFile': target.name,
                       'audioSha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'mapping': mapping})
    combined = OUT / 'scene-job.wav'
    with wave.open(str(combined), 'wb') as result:
        result.setnchannels(2)
        result.setsampwidth(2)
        result.setframerate(44100)
        for scene in scenes:
            with wave.open(str(OUT / scene['audioFile']), 'rb') as source:
                result.writeframes(source.readframes(source.getnframes()))
    plan = {'status': 'prepared_not_generated', 'date': '2026-10-10',
            'duration': round(sum(s['duration'] for s in scenes), 5),
            'sourceSongSha256': hashlib.sha256((PUBLIC / 'song.mp3').read_bytes()).hexdigest(),
            'scenes': scenes,
            'note': 'Original Mandarin recording, no TTS or model download. Keep existing rain chorus; generate server verse and warm-shore ending online.'}
    (OUT / 'scene-plan.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ROOT / 'assets/scene-performance-plan.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(plan, ensure_ascii=False))

if __name__ == '__main__':
    main()
