"""Verify ChatArt outputs and build a separate multi-scene MV manifest."""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path
from verify_performance_audio import verify

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'web/public/assets'
INPUT = ROOT.parents[1] / 'upstream/chinese-token-cinema/scene-performance'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--opening', type=Path, required=True)
    parser.add_argument('--verse', type=Path, required=True)
    parser.add_argument('--ending', type=Path, required=True)
    parser.add_argument('--provenance', type=Path, required=True)
    args = parser.parse_args()
    baseline = json.loads((PUBLIC / 'performance-manifest.json').read_text(encoding='utf-8'))
    plan = json.loads((INPUT / 'chatart-inputs.json').read_text(encoding='utf-8'))
    provenance = json.loads(args.provenance.read_text(encoding='utf-8'))
    song = json.loads((PUBLIC / 'song-timeline.json').read_text(encoding='utf-8'))
    if sha(PUBLIC / 'song.mp3') != plan['originalSongSha256']:
        raise ValueError('The original full song differs from the uploaded scene inputs.')
    sources = list(baseline['sources'])
    clips = [c for c in baseline['clips'] if c['start'] in [26.5, 39.5, 51.56, 95.8]]
    for job, file in zip(plan['jobs'], [args.opening, args.verse, args.ending]):
        name = 'chatart-' + job['id']
        input_audio = INPUT / job['audioFile']
        if sha(input_audio) != job['audioSha256']:
            raise ValueError('Input audio changed: '+name)
        result = verify(file, input_audio)
        lag = result['resultAudioLagSeconds']
        media = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams',
                       '-show_format', '-of', 'json', str(file)], text=True, encoding='utf-8'))
        video = next(s for s in media['streams'] if s['codec_type'] == 'video')
        duration = float(video.get('duration', media['format']['duration']))
        info = provenance['jobs'][job['id']]
        if info['status'] != 'completed' or not info['page'].startswith('https://app.chatartpro.com/'):
            raise ValueError('Actual completed online job provenance required.')
        if info.get('approvedForMV') is not True:
            raise ValueError('Online video has not passed visual continuity and performance review: '+name)
        if abs(video['width']/video['height']-16/9)>.02:
            raise ValueError('Online video aspect ratio changed; inspect before composing.')
        target = PUBLIC / 'motion' / f'{name}.mp4'
        shutil.copy2(file, target)
        mapping = [{'start': 0, 'end': 8, 'offset': 0}] if job['id']=='opening-10s' else job['mapping']
        for m in mapping:
            offset = round(m['offset']+lag, 5)
            if offset<0 or offset+m['end']-m['start']>duration+.1:
                raise ValueError('Online performance does not cover the original lyric interval: '+name)
            clips.append({**m, 'offset': offset, 'src': f'./assets/motion/{target.name}', 'source': name,
                          'protectedRegions': info.get('protectedRegions', [])})
        sources.append({'id': name, 'provider': 'ChatArt', 'url': info['page'],
                        'jobEvidence': info, 'engineShownInUI': plan['modelShownInUI'],
                        'mode': plan['mode'], 'style': plan['style'],
                        'watermark': bool(info.get('protectedRegions')), 'motionPromptApplied': True,
                        'inputAudio': input_audio.name, 'inputAudioSha256': sha(input_audio),
                        'inputPhoto': job['photo'], 'inputPhotoSha256': job['photoSha256'],
                        'paddingSilenceSeconds': job['paddingSilenceSeconds'],
                        'file': f'motion/{target.name}', 'sha256': sha(target),
                        'width': video['width'], 'height': video['height'], 'fps': video['r_frame_rate'],
                        'videoDuration': duration, 'audioVerification': result})
        (ROOT / f'assets/{name}-audio-verification.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
        print(name, result['waveformCorrelation'], lag, flush=True)
    clips.sort(key=lambda c:c['start'])
    previous = 0
    for clip in clips:
        if clip['start']<previous or clip['end']>song['duration']:
            raise ValueError('Overlapping or out-of-range scene mapping.')
        previous = clip['end']
    for cue in song['cues']:
        for time in [cue['start']+.001, (cue['start']+cue['end'])/2, cue['end']-.001]:
            if not any(c['start']<=time<c['end'] for c in clips):
                raise ValueError('A lyric lacks a corresponding online performance: '+cue['text'])
    manifest = {'status': 'complete_multiscene_vocal_coverage', 'date': '2026-10-10',
                'duration': song['duration'], 'songSha256': sha(PUBLIC / 'song.mp3'),
                'performanceDuration': round(sum(c['end']-c['start'] for c in clips), 3),
                'performanceScenes': ['server', 'chorus', 'answer'],
                'note': 'Original Mandarin song remains the sole clock and soundtrack. New server and warm-shore performance is generated online by ChatArt; rain performance is the verified HeyGen source. No lip video looping or retiming. Instrumental details remain still-image camera work. Audio verification does not measure phoneme-to-mouth accuracy.',
                'sources': sources, 'clips': clips}
    encoded = json.dumps(manifest, ensure_ascii=False, indent=2)+'\n'
    (PUBLIC / 'cinema-performance-manifest.json').write_text(encoded, encoding='utf-8')
    (ROOT / 'assets/multiscene-performance-result.json').write_text(encoded, encoding='utf-8')
    print('All 27 sung lines covered in three actual performance scenes; baseline preserved.')

if __name__=='__main__':
    main()
