"""Expose selected immutable evidence through static web paths without copying media."""
import datetime as dt
import hashlib
import json
import os
import re
import shutil
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
PUBLIC = PROJECT / 'web/public'
PROCESS = PROJECT / 'process'
RECORDS = PUBLIC / 'assets/records'

def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def expose(source, relative):
    source = source.resolve(strict=True)
    target = PUBLIC / relative
    assert target.resolve().is_relative_to(PUBLIC.resolve())
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        if not os.path.samefile(source, target):
            raise FileExistsError(f'Existing media is not the retained original: {target}')
    else:
        os.link(source, target)
    return {'url': './' + relative, 'source': source.relative_to(PROJECT).as_posix(),
            'size': source.stat().st_size, 'sha256': digest(source), 'storage': 'shared-hardlink'}

links = [
    ('process/round-06/source/original-direct.mp4', 'assets/media/reference-original.mp4'),
    ('process/round-23/recordings/xinjiang-spatial-story.mp4', 'assets/media/current-r23.mp4'),
    ('process/audit-r23-2026-10-11/reference/001.jpg', 'assets/overview/reference-poster.jpg'),
    ('process/round-23/video-frames/region-structure.jpg', 'assets/overview/current-poster.jpg'),
    ('process/round-05/after/local.png', 'assets/overview/tianchi.png'),
    ('process/round-05/after/yardang.png', 'assets/overview/yardang.png'),
    ('process/audit-r23-2026-10-11/three-gaps-comparison.jpg', 'assets/overview/three-gaps.jpg'),
    ('process/audit-r23-2026-10-11/README.md', 'assets/records/r23-comparison-audit.md'),
    ('process/round-23/recorded-motion-verification.json', 'assets/records/r23-motion.json'),
    ('process/round-23/recorded-speech-verification.json', 'assets/records/r23-speech.json'),
    ('process/round-23/visual-review.json', 'assets/records/r23-visual-review.json'),
    ('storage/dedupe-2026-10-11/README.md', 'assets/records/storage-audit.md'),
]
for source, target in [
    ('process/round-25/recordings/xinjiang-spatial-story-r25.mp4', 'assets/media/current-r25.mp4'),
    ('process/round-25/after/region-poster.jpg', 'assets/overview/current-r25-poster.jpg'),
    ('process/round-25/speech-and-sync-verification.json', 'assets/records/r25-speech.json'),
    ('process/round-25/recordings/media-verification.json', 'assets/records/r25-media.json'),
    ('process/round-27/recordings/xinjiang-spatial-story-r27.mp4', 'assets/media/current-r27.mp4'),
    ('process/round-27/after/region-poster.jpg', 'assets/overview/current-r27-poster.jpg'),
    ('process/round-27/after/story-comparison.jpg', 'assets/overview/r27-story-comparison.jpg'),
    ('process/round-27/speech-and-sync-verification.json', 'assets/records/r27-speech.json'),
    ('process/round-27/recordings/media-verification.json', 'assets/records/r27-media.json'),
    ('process/round-27/visual-review.json', 'assets/records/r27-visual-review.json'),
    ('process/round-28/recordings/xinjiang-spatial-story-r28.mp4', 'assets/media/current-r28.mp4'),
    ('process/round-28/after/current-poster.jpg', 'assets/overview/current-r28-poster.jpg'),
    ('process/round-28/after/presence-comparison.jpg', 'assets/overview/r28-presence-comparison.jpg'),
    ('process/round-28/speech-and-sync-verification.json', 'assets/records/r28-speech.json'),
    ('process/round-28/recordings/media-verification.json', 'assets/records/r28-media.json'),
    ('process/round-28/visual-review.json', 'assets/records/r28-visual-review.json'),
    ('process/round-29/recordings/xinjiang-spatial-story-r29.mp4', 'assets/media/current-r29.mp4'),
    ('process/round-29/after/current-poster.jpg', 'assets/overview/current-r29-poster.jpg'),
    ('process/round-29/after/attention-comparison.jpg', 'assets/overview/r29-attention-comparison.jpg'),
    ('process/round-29/after/transition-comparison.jpg', 'assets/overview/r29-transition-comparison.jpg'),
    ('process/round-29/speech-and-sync-verification.json', 'assets/records/r29-speech.json'),
    ('process/round-29/recordings/media-verification.json', 'assets/records/r29-media.json'),
    ('process/round-29/visual-review.json', 'assets/records/r29-visual-review.json'),
    ('process/round-31/recordings/xinjiang-spatial-story-r31.mp4', 'assets/media/current-r31.mp4'),
    ('process/round-31/after/current-poster.jpg', 'assets/overview/current-r31-poster.jpg'),
    ('process/round-31/after/chain-comparison.jpg', 'assets/overview/r31-chain-comparison.jpg'),
    ('process/round-31/speech-and-sync-verification.json', 'assets/records/r31-speech.json'),
    ('process/round-31/recordings/media-verification.json', 'assets/records/r31-media.json'),
    ('process/round-31/visual-review.json', 'assets/records/r31-visual-review.json'),
    ('process/round-31/work-sequence-verification.json', 'assets/records/r31-work.json'),
]:
    if (PROJECT / source).is_file():
        links.append((source, target))
# The storage guide is a live document; keep its web export independent of edits.
audit = PROCESS / 'round-30/audit'
if audit.is_dir():
    for source in sorted(audit.rglob('*')):
        if source.is_file() and source.suffix.lower() in {'.jpg', '.png', '.json', '.md'}:
            links.append((source.relative_to(PROJECT).as_posix(), 'assets/records/r30-audit/' + source.relative_to(audit).as_posix()))
if (PROCESS / 'round-30/subtitle-verification.json').is_file():
    links.append(('process/round-30/subtitle-verification.json', 'assets/records/r30-subtitles.json'))
RECORDS.mkdir(parents=True, exist_ok=True)
shutil.copyfile(PROJECT / 'storage/README.md', RECORDS / 'storage-guide.md')
media = [expose(PROJECT / source, target) for source, target in links]

rounds = []
for folder in sorted(PROCESS.glob('round-*'), reverse=True):
    retention = folder / 'retention.json'
    if not retention.is_file():
        continue
    data = json.loads(retention.read_text(encoding='utf-8-sig'))
    rows = data['files']
    notes = folder / 'README.md'
    number = int(folder.name.split('-')[1])
    if notes.is_file():
        lines = notes.read_text(encoding='utf-8-sig').splitlines()
        title = re.sub(r'^R\d+\s*[·:：]\s*', '', lines[0].lstrip('# ').strip()) if lines else '增量保存记录'
        paragraphs = [line for line in lines[1:] if line.strip() and not line.startswith(('#', '<!--', '- ', '['))]
        summary = paragraphs[0] if paragraphs else '本轮截图、源码和已保存的录制证据见清单。'
    elif (folder / 'audit.json').is_file():
        # Audit-only rounds retain their original JSON report, without creating
        # new content inside a frozen round or inventing missing Markdown notes.
        notes = folder / 'audit.json'
        audit_data = json.loads(notes.read_text(encoding='utf-8-sig'))
        title = '体验检查与优化优先级'
        summary = audit_data.get('scope', '本轮检查结果与截图见原始报告。')
    else:
        notes = retention
        title = '增量保存记录'
        summary = '本轮已保存素材与源码见增量清单。'
    # Avoid reproducing lengthy iteration logs in the overview accordion.
    if len(summary) > 180:
        summary = summary[:180] + '… 完整记录见下方入口。'
    manifest = expose(retention, f'assets/records/{folder.name}.json')
    record = manifest if notes == retention else expose(notes, f'assets/records/{folder.name}{"-audit" if notes.suffix == ".json" else ""}{notes.suffix}')
    rounds.append({'id': folder.name, 'label': f'R{number:02}', 'title': title,
                   'phase': 'terrain' if number <= 8 else 'story' if number <= 19 else 'space',
                   'summary': summary, 'fileCount': len(rows),
                   'mediaCount': sum(Path(row['path']).suffix.lower() in {'.jpg','.jpeg','.png','.webp','.mp4','.webm','.wav','.mp3','.mov'} for row in rows),
                   'manifest': manifest['url'], 'notes': record['url']})
    media.extend([manifest, record])

(RECORDS / 'rounds.json').write_text(json.dumps({'asOf': dt.date.today().isoformat(), 'rounds': rounds}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(RECORDS / 'media.json').write_text(json.dumps({'asOf': dt.date.today().isoformat(), 'reference': 'https://x.com/readyfor2025/status/2108409664018977249',
    'rights': 'Original video license not confirmed; retained for local reference research. Local story is independently authored.',
    'loading': 'Selected videos use preload=none; no duplicate recording created.', 'files': media}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'rounds': len(rounds), 'sharedEntries': len(media), 'videoBytesCopied': 0}, ensure_ascii=False))
