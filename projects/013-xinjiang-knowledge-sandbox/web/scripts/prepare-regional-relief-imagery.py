"""Crop the official 500 m NASA June BMNG tiles without retaining global originals."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

from PIL import Image

WEB = Path(__file__).resolve().parents[1]
DEST = WEB / 'public' / 'assets'
BOUNDS = [73, 35, 96, 49]
NASA = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/june/'
SOURCES = [
    ('C1', [0, 0, 90, 90], [17520, 9840, 21600, 13200], 0),
    ('D1', [90, 0, 180, 90], [0, 9840, 1440, 13200], 4080),
]


def digest(path):
    sha = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            sha.update(block)
    return sha.hexdigest()


def main():
    cache = (WEB / '.cache').resolve()
    cache.mkdir(exist_ok=True)
    result = Image.new('RGB', (5520, 3360))
    records = []
    # The temporary directory is explicitly inside this project's cache.
    # Only this helper's downloads are removed when the context exits.
    with tempfile.TemporaryDirectory(prefix='regional-r42-', dir=cache) as name:
        temporary = Path(name).resolve()
        assert temporary.is_relative_to(cache)
        for tile, bounds, crop, offset in SOURCES:
            filename = f'world.topo.bathy.200406.3x21600x21600.{tile}.jpg'
            url = NASA + filename
            target = temporary / filename
            print(f'Downloading official NASA {tile} tile', flush=True)
            subprocess.run(['curl.exe', '--fail', '--silent', '--show-error', '--retry', '2',
                            '--connect-timeout', '20', '--max-time', '180',
                            '--output', str(target), url], check=True)
            records.append({'tile': tile, 'url': url, 'bounds': bounds,
                            'sourceSize': [21600, 21600], 'cropPixels': crop,
                            'sourceSHA256': digest(target), 'sourceBytes': target.stat().st_size})
            # The public source exceeds Pillow's warning limit. Its dimensions
            # are checked before decoding; never enable this for unknown input.
            Image.MAX_IMAGE_PIXELS = 21600 * 21600
            with Image.open(target) as source:
                assert source.size == (21600, 21600)
                region = source.crop(crop).convert('RGB')
                result.paste(region, (offset, 0))
                region.close()
    filename = 'xinjiang-blue-marble-500m.jpg'
    output = DEST / filename
    result.save(output, quality=92, subsampling=0, optimize=True)
    result.close()
    record = {
        'file': filename, 'sha256': digest(output), 'bytes': output.stat().st_size,
        'bounds': BOUNDS, 'sourceResolutionMetres': 500,
        'outputSize': [5520, 3360], 'outputCRS': 'EPSG:4326',
        'outputTransform': [1 / 240, 0, 73, 0, -1 / 240, 49],
        'acquiredAt': '2004-06', 'accessedAt': datetime.now(timezone.utc).isoformat(),
        'credit': 'NASA Earth Observatory / Reto Stöckli, Blue Marble Next Generation, June 2004, topography and bathymetry shaded',
        'sourceURL': 'https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/',
        'licenseURL': 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
        'sources': records,
        'processing': 'Two native 500 m JPEG tiles cropped and joined at 90 E. No upsampling, synthetic detail, or changed elevation. Global originals are temporary; retained artifacts are the regional crop and provenance.',
        'notes': 'Shading is baked into the NASA display image. It is not higher-resolution DEM and not present-day imagery.'
    }
    (DEST / 'regional-imagery-500m.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'file': filename, 'size': record['outputSize'], 'bytes': record['bytes'], 'sha256': record['sha256']}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
