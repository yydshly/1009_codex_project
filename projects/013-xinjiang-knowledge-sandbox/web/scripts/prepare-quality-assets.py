"""Refresh only regional relief for the second visual comparison pass."""
from datetime import datetime, timezone
from importlib.util import spec_from_file_location, module_from_spec
import json
import subprocess
from pathlib import Path

spec = spec_from_file_location('prepare_data', Path(__file__).with_name('prepare-data.py'))
data = module_from_spec(spec)
spec.loader.exec_module(data)
cache = data.WEB / '.cache' / 'terrain'
cache.mkdir(parents=True, exist_ok=True)
def fetch_cached(url):
    tile = cache / ('-'.join(url.split('/')[-3:]))
    if tile.exists():
        return tile.read_bytes()
    # Windows curl uses the OS trust store; keep normal certificate verification.
    body = subprocess.run(['curl.exe', '--fail', '--silent', '--show-error', '--retry', '3',
        '--retry-all-errors', '--max-time', '60', url], check=True, capture_output=True).stdout
    tile.write_bytes(body)
    return body
data.fetch = fetch_cached
manifest = json.loads((data.DEST / 'data-sources.json').read_text(encoding='utf-8'))
region = data.terrain('xinjiang', [73, 35, 96, 49], 8, 769, 513)
# The z=14 Tianchi source contained implausible negative values around the lake.
# Fall back to another source level, never replace anomalous samples with invented heights.
local = data.terrain('tianchi', [88.07, 43.83, 88.19, 43.95], 13, 321, 289)
if local['minMetres'] < 500:
    local = data.terrain('tianchi', [88.07, 43.83, 88.19, 43.95], 12, 161, 145)
assert 500 < local['minMetres'] < local['maxMetres'] < 5000
glacier = data.terrain('glacier', [86.76, 43.04, 86.89, 43.17], 14, 321, 321)
assert 2000 < glacier['minMetres'] < glacier['maxMetres'] < 6000
manifest['elevation']['datasets'] = [region, local, glacier]
manifest['qualityAssetsAccessedAt'] = datetime.now(timezone.utc).isoformat()
manifest['qualityNotes'] = ['Tianchi z=14 rejected: implausible negative lake-area samples. Use a validated lower source level; no synthetic filling.', 'Procedural grain, strata, cavity shading, water ripples and ice crevasses affect display only, not measured elevations.']
(data.DEST / 'data-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps([{k: v for k, v in entry.items() if k != 'tiles'} for entry in [region,local,glacier]], ensure_ascii=False))
