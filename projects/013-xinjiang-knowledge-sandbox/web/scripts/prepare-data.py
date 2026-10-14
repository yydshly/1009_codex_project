"""Fetch public scientific assets once; runtime reads the bundled outputs offline.
Requires Pillow. Re-run only when deliberately refreshing the dataset.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from io import BytesIO
import json
import math
from pathlib import Path
from urllib.request import urlopen, Request
from PIL import Image

WEB = Path(__file__).resolve().parents[1]
DEST = WEB / 'public' / 'assets'
DEST.mkdir(parents=True, exist_ok=True)

def fetch(url):
    with urlopen(Request(url, headers={'User-Agent': 'XinjiangResearchDemo/1.0'}), timeout=60) as response:
        return response.read()

def tilexy(lon, lat, zoom):
    n = 2 ** zoom
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n

def terrain(name, bounds, zoom, cols, rows):
    west, south, east, north = bounds
    tx0, ty0 = tilexy(west, north, zoom)
    tx1, ty1 = tilexy(east, south, zoom)
    keys = [(x, y) for y in range(math.floor(ty0), math.floor(ty1) + 1)
            for x in range(math.floor(tx0), math.floor(tx1) + 1)]
    def load(key):
        x, y = key
        url = f'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{zoom}/{x}/{y}.png'
        body = fetch(url)
        return key, Image.open(BytesIO(body)).convert('RGB'), {'url': url, 'sha256': sha256(body).hexdigest()}
    with ThreadPoolExecutor(max_workers=4) as pool:
        fetched = list(pool.map(load, keys))
    tiles = {key: image for key, image, record in fetched}
    def height(px, py):
        x, y = math.floor(px / 256), math.floor(py / 256)
        r, g, b = tiles[(x, y)].getpixel((int(px % 256), int(py % 256)))
        return r * 256 + g + b / 256 - 32768
    values = []
    # Geographic grid, north-to-south rows. Bilinear interpolation after decoding.
    for row in range(rows):
        lat = north + (south - north) * row / (rows - 1)
        for col in range(cols):
            lon = west + (east - west) * col / (cols - 1)
            tx, ty = tilexy(lon, lat, zoom)
            px, py = tx * 256, ty * 256
            ix, iy = math.floor(px), math.floor(py)
            fx, fy = px - ix, py - iy
            value = ((height(ix, iy) * (1 - fx) + height(ix + 1, iy) * fx) * (1 - fy)
                     + (height(ix, iy + 1) * (1 - fx) + height(ix + 1, iy + 1) * fx) * fy)
            values.append(round(value))
    document = {'name': name, 'bounds': bounds, 'cols': cols, 'rows': rows, 'zoom': zoom,
                'units': 'metres', 'order': 'north-to-south, west-to-east',
                'min': min(values), 'max': max(values), 'heights': values}
    output = DEST / f'{name}-dem.json'
    output.write_text(json.dumps(document, separators=(',', ':')), encoding='utf-8')
    return {'file': output.name, 'sha256': sha256(output.read_bytes()).hexdigest(),
            'bounds': bounds, 'grid': [cols, rows], 'zoom': zoom,
            'minMetres': min(values), 'maxMetres': max(values),
            'processing': 'Decoded Terrarium RGB, bilinear geographic resampling, rounded to 1 metre. No invented elevation.',
            'tiles': [record for key, image, record in fetched]}

def main():
    image_url = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/june/world.200406.3x5400x2700.jpg'
    body = fetch(image_url)
    image = Image.open(BytesIO(body)).convert('RGB')
    image.resize((2048, 1024), Image.Resampling.LANCZOS).save(DEST / 'earth-blue-marble.jpg', quality=88, optimize=True)
    manifest = {'accessedAt': datetime.now(timezone.utc).isoformat(),
                'imagery': {'url': image_url, 'sourceSHA256': sha256(body).hexdigest(),
                            'file': 'earth-blue-marble.jpg', 'sourceSize': list(image.size), 'outputSize': [2048, 1024],
                            'credit': 'NASA Earth Observatory, Blue Marble Next Generation, June 2004'},
                'elevation': {'registry': 'https://registry.opendata.aws/terrain-tiles/',
                              'credit': 'Mapzen Terrain Tiles; GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey.',
                              'datasets': [terrain('xinjiang', [73, 35, 96, 49], 5, 257, 193),
                                           terrain('tianchi', [88.07, 43.83, 88.19, 43.95], 12, 161, 145)]}}
    (DEST / 'data-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'imageBytes': (DEST / 'earth-blue-marble.jpg').stat().st_size,
                      'terrain': [{k: v for k, v in entry.items() if k != 'tiles'} for entry in manifest['elevation']['datasets']]}, ensure_ascii=False))

if __name__ == '__main__':
    main()
