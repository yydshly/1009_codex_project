"""Pack remaining original sung passages into two online jobs under one minute."""
import hashlib
import json
import shutil
import subprocess
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'web/public/assets'
OUT = ROOT.parents[1] / 'upstream/chinese-token-cinema/online-performance'
BATCHES = {
    'batch-a': [(0, 8), (10.3, 25.6), (26.5, 35.6), (51.56, 75.2)],
    'batch-b': [(76.2, 92.2), (95.8, 113.2), (115.8, 129)],
}

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    data = []
    for name, ranges in BATCHES.items():
        offset, parts, mapping = 0, [], []
        for i, (start, end) in enumerate(ranges):
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
        data.append({'id': name, 'duration': round(offset, 5), 'audioFile': target.name,
                     'audioSha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'mapping': mapping})
    (OUT / 'batches.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(data, ensure_ascii=False))

if __name__ == '__main__':
    main()
