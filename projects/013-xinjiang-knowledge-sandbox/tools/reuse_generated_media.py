"""Replace verified generated movie copies with their immutable local file aliases."""
import hashlib
import json
import os
import stat
from pathlib import Path

project = Path(__file__).resolve().parents[1]
workspace = project.parents[1]
generated = workspace / '_site' / project.name
public = project / 'web/public'
assert generated.resolve().is_relative_to((workspace / '_site').resolve())

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

plan = []
for name in ['reference-original.mp4', 'current-r23.mp4', 'current-r25.mp4', 'current-r27.mp4', 'current-r28.mp4', 'current-r29.mp4', 'current-r31.mp4']:
    relative = Path('assets/media') / name
    source, target = public / relative, generated / relative
    if not source.exists():
        continue
    assert source.resolve(strict=True).is_relative_to(public.resolve())
    assert target.resolve(strict=True).is_relative_to(generated.resolve())
    shared = os.path.samefile(source, target)
    assert sha(source) == sha(target), f'Generated media differs: {name}'
    if not shared:
        assert target.stat().st_nlink == 1, 'Refusing to replace a non-generated shared file'
    plan.append((source, target, shared, source.stat().st_size))

reused = 0
for source, target, shared, size in plan:
    if shared:
        continue
    # Only this individually verified file in generated _site is replaced.
    target.chmod(stat.S_IREAD | stat.S_IWRITE)
    target.unlink()
    os.link(source, target)
    assert os.path.samefile(source, target)
    reused += size
print(json.dumps({'sharedVideos': len(plan), 'generatedDuplicateBytesRemoved': reused, 'sourceChanged': False}))
