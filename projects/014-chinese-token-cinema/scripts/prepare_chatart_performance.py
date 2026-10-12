"""Prepare MP3 inputs for ChatArt Art MV, keeping exact original-song mappings."""
import hashlib
import json
import math
import shutil
import subprocess
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'web/public/assets'
OUT = ROOT.parents[1] / 'upstream/chinese-token-cinema/scene-performance'
JOBS = {
    'opening-10s': {'photo': 'server.png', 'ranges': [(0, 10.3)], 'padding': False},
    'verse-rest': {'photo': 'server.png', 'ranges': [(10.3, 25.6), (76.2, 92.2)], 'padding': True},
    'ending-shore': {'photo': 'answer.png', 'ranges': [(115.8, 129)], 'padding': True},
}

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = []
    for name, spec in JOBS.items():
        offset, parts, mapping = 0, [], []
        for i, (start, end) in enumerate(spec['ranges']):
            target = OUT / f'{name}-part-{i+1}.wav'
            subprocess.run([shutil.which('ffmpeg'), '-hide_banner', '-loglevel', 'error', '-y',
                            '-i', str(PUBLIC / 'song.mp3'), '-ss', str(start), '-t', str(end-start),
                            '-vn', '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', str(target)], check=True)
            with wave.open(str(target), 'rb') as source:
                parts.append(source.readframes(source.getnframes()))
                duration = source.getnframes() / source.getframerate()
            mapping.append({'start': start, 'end': end, 'offset': round(offset, 5)})
            offset += duration
        padding = round(math.ceil(offset)-offset, 5) if spec['padding'] else 0
        base = f'{name}-chatart' if spec['padding'] else name
        target = OUT / f'{base}.wav'
        with wave.open(str(target), 'wb') as result:
            result.setnchannels(2)
            result.setsampwidth(2)
            result.setframerate(44100)
            for part in parts:
                result.writeframes(part)
            if padding:
                result.writeframes(bytes(round(padding*44100)*4))
        encoded = OUT / f'{base}.mp3'
        subprocess.run([shutil.which('ffmpeg'), '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(target), '-c:a', 'libmp3lame', '-b:a', '256k', str(encoded)], check=True)
        jobs.append({'id': name, 'photo': spec['photo'],
                     'photoSha256': hashlib.sha256((PUBLIC / spec['photo']).read_bytes()).hexdigest(),
                     'coreDuration': round(offset, 5), 'paddingSilenceSeconds': padding,
                     'inputDuration': round(offset+padding, 5), 'audioFile': encoded.name,
                     'audioSha256': hashlib.sha256(encoded.read_bytes()).hexdigest(), 'mapping': mapping})
    plan = {'status': 'prepared_inputs', 'date': '2026-10-10', 'provider': 'ChatArt',
            'modelShownInUI': 'Art MV 8', 'mode': '演唱', 'style': 'Performance 演唱',
            'page': 'https://app.chatartpro.com/ai-music/ai-music-video',
            'originalSongSha256': hashlib.sha256((PUBLIC / 'song.mp3').read_bytes()).hexdigest(),
            'jobs': jobs, 'note': 'Platform accepts MP3 and requires at least 10 seconds. Tail silence pads two jobs to whole seconds; no lyric, tempo or pitch change. Inputs are not generation results.'}
    (OUT / 'chatart-inputs.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ROOT / 'assets/chatart-performance-inputs.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(plan, ensure_ascii=False))

if __name__ == '__main__':
    main()
