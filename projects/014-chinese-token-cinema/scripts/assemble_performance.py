"""Verify already downloaded online performances and map them to the original song."""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path
from verify_performance_audio import verify

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'web/public/assets'
INPUT = ROOT.parents[1] / 'upstream/chinese-token-cinema/online-performance'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--pilot', type=Path, required=True)
    parser.add_argument('--batch-a', type=Path, required=True)
    parser.add_argument('--batch-b', type=Path, required=True)
    parser.add_argument('--url-a', required=True)
    parser.add_argument('--url-b', required=True)
    args = parser.parse_args()
    batches = json.loads((INPUT / 'batches.json').read_text(encoding='utf-8'))
    jobs = [('pilot', args.pilot, 'pilot-12s.wav',
             'https://app.heygen.com/videos/e53dd97ebaff43fdbfffbf353defdb00',
             [{'start': 39.5, 'end': 51.56, 'offset': 0}])]
    for batch, file, url in zip(batches, [args.batch_a, args.batch_b], [args.url_a, args.url_b]):
        jobs.append((batch['id'], file, batch['audioFile'], url, batch['mapping']))
    (PUBLIC / 'motion').mkdir(exist_ok=True)
    sources, clips = [], []
    for name, file, input_audio, url, mapping in jobs:
        if not url.startswith('https://app.heygen.com/videos/'):
            raise ValueError('Use the actual completed owner video URL.')
        media = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams',
                       '-show_format', '-of', 'json', str(file)], text=True, encoding='utf-8'))
        video = next(s for s in media['streams'] if s['codec_type'] == 'video')
        if video['width'] != 1280 or video['height'] != 720:
            raise ValueError('Unexpected online performance size.')
        result = verify(file, INPUT / input_audio)
        lag = result['resultAudioLagSeconds']
        target = PUBLIC / 'motion' / f'heygen-{name}.mp4'
        shutil.copy2(file, target)
        for m in mapping:
            offset = round(m['offset'] + lag, 5)
            if offset + m['end'] - m['start'] > float(video['duration']) + .1:
                raise ValueError(f'{name}: performance does not cover source audio.')
            clips.append({**m, 'offset': offset, 'src': f'./assets/motion/{target.name}', 'source': name})
        sources.append({'id': name, 'provider': 'HeyGen', 'url': url,
                        'engineShownInUI': 'Avatar V', 'watermark': True,
                        'customMotionPromptApplied': False,
                        'customMotionNote': 'Custom prompt triggered a paid upsell and was not applied.',
                        'voiceMirroring': False, 'inputAudio': input_audio,
                        'inputAudioSha256': sha(INPUT / input_audio), 'inputPhoto': 'chorus.png',
                        'inputPhotoSha256': sha(PUBLIC / 'chorus.png'),
                        'file': f'motion/{target.name}', 'sha256': sha(target),
                        'width': video['width'], 'height': video['height'],
                        'fps': video['r_frame_rate'], 'videoDuration': float(video['duration']),
                        'terminalFrameHoldSeconds': round(max(0, max(m['offset']+lag+m['end']-m['start'] for m in mapping)-float(video['duration'])), 5),
                        'audioVerification': result})
        print(name, result['waveformCorrelation'], lag, flush=True)
    clips.sort(key=lambda c: c['start'])
    song = json.loads((PUBLIC / 'song-timeline.json').read_text(encoding='utf-8'))
    for cue in song['cues']:
        for time in [cue['start'] + .001, (cue['start']+cue['end'])/2, cue['end']-.001]:
            if not any(c['start'] <= time < c['end'] for c in clips):
                raise ValueError('Sung lyric lacks a corresponding performance: '+cue['text'])
    manifest = {'status': 'complete_vocal_coverage', 'date': '2026-10-10',
                'duration': song['duration'], 'songSha256': sha(PUBLIC / 'song.mp3'),
                'performanceDuration': round(sum(c['end']-c['start'] for c in clips), 3),
                'note': 'Original full song is the master clock. Online videos are muted, never looped or stretched. Instrumental gaps use original scene art. Audio lag correction is not a phoneme-to-mouth accuracy measurement.',
                'sources': sources, 'clips': clips}
    encoded = json.dumps(manifest, ensure_ascii=False, indent=2)+'\n'
    (PUBLIC / 'performance-manifest.json').write_text(encoded, encoding='utf-8')
    (ROOT / 'assets/online-performance-result.json').write_text(encoded, encoding='utf-8')
    print('All 27 sung lines covered; manifest and source files ready.')

if __name__ == '__main__':
    main()
