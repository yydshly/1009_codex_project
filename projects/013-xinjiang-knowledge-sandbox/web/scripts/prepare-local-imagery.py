"""Prepare real, georeferenced Sentinel-2 local textures (Python 3.12).

Requires rasterio==1.5.2, numpy==2.3.5, Pillow, pyproj==3.8.0, tifffile==2026.9.20.
Raw scientific products stay in ignored .cache; no account or API key required.
TCI is an existing 8-bit true-colour product, not raw reflectance or AI imagery.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from math import ceil, cos, radians
from pathlib import Path
import subprocess
import re

import numpy as np
from PIL import Image
import rasterio
import tifffile
from rasterio.transform import from_bounds
from rasterio.warp import transform_bounds, reproject, Resampling
from rasterio.windows import from_bounds as window_from_bounds

WEB = Path(__file__).resolve().parents[1]
DEST = WEB / 'public' / 'assets'
CACHE = WEB / '.cache' / 'sentinel'
API = 'https://earth-search.aws.element84.com/v1'
LICENSE = 'https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice'
SELECTION = {
    'tianchi': ('S2A_45TWJ_20240904_0_L2A', [88.07, 43.83, 88.19, 43.95]),
    'glacier': ('S2A_45TVH_20230831_0_L2A', [86.76, 43.04, 86.89, 43.17]),
}


def download(url, filename):
    CACHE.mkdir(parents=True, exist_ok=True)
    target = CACHE / filename
    if not target.exists():
        temporary = target.with_suffix(target.suffix + '.part')
        subprocess.run(['curl.exe', '--fail', '--silent', '--show-error', '--retry', '3',
                        '--retry-all-errors', '--max-time', '180', url, '-o', str(temporary)], check=True)
        temporary.replace(target)
    return target


def crop(path, bounds, width, height, categorical=False):
    """Read the relevant native UTM window, then reproject to north-up WGS84."""
    with rasterio.open(path) as src:
        projected = transform_bounds('EPSG:4326', src.crs, *bounds, densify_pts=21)
        window = window_from_bounds(*projected, transform=src.transform)
        # Keep neighbouring native pixels for interpolation at the crop boundary.
        window = rasterio.windows.Window(np.floor(window.col_off)-3, np.floor(window.row_off)-3,
                                        ceil(window.width)+6, ceil(window.height)+6)
        assert window.col_off >= 0 and window.row_off >= 0
        assert window.col_off+window.width <= src.width and window.row_off+window.height <= src.height
        native = src.read(window=window)
        output = np.zeros((src.count, height, width), dtype=src.dtypes[0])
        for band in range(src.count):
            reproject(native[band], output[band], src_transform=src.window_transform(window),
                      src_crs=src.crs, dst_transform=from_bounds(*bounds, width, height),
                      dst_crs='EPSG:4326', src_nodata=0, dst_nodata=0,
                      resampling=Resampling.nearest if categorical else Resampling.bilinear)
        metadata = {'crs': str(src.crs), 'size': [src.width, src.height],
                    'transform': list(src.transform)[:6], 'nativePixelMetres': list(src.res),
                    'readWindow': [window.col_off, window.row_off, window.width, window.height]}
        return output, metadata


def range_bytes(url, prefix, start, end):
    """Use small HTTP ranges with strict response/length validation."""
    target = CACHE / f'{prefix}-{start}-{end}.bin'
    headers = target.with_suffix('.headers')
    if not target.exists() or target.stat().st_size != end-start+1:
        subprocess.run(['curl.exe', '--fail', '--silent', '--show-error', '--retry', '3',
                        '--max-time', '60', '--range', f'{start}-{end}', url,
                        '-D', str(headers), '-o', str(target)], check=True)
    text = headers.read_text(encoding='utf-8')
    assert target.stat().st_size == end-start+1
    assert re.search(rf'content-range: bytes {start}-{end}/\d+', text, re.I)
    return target, text


def local_cog(url, prefix, bounds):
    """Cache only native TIFF blocks intersecting the AOI, without overviews.

    The sparse TIFF is only a local transport cache, never a source product or
    output for distribution. Every byte range actually used has its own hash.
    """
    header, response = range_bytes(url, prefix, 0, 65535)
    total = int(re.search(r'content-range: bytes \d+-\d+/(\d+)', response, re.I)[1])
    sparse = CACHE / f'{prefix}-aoi-cache.tif'
    with sparse.open('wb') as file:
        file.write(header.read_bytes())
        file.truncate(total)
    with tifffile.TiffFile(sparse) as tif:
        page = tif.pages[0]
        offsets, sizes = page.dataoffsets, page.databytecounts
        tile_width, tile_height = page.tilewidth, page.tilelength
    with rasterio.open(sparse) as src:
        box = transform_bounds('EPSG:4326', src.crs, *bounds, densify_pts=21)
        window = window_from_bounds(*box, transform=src.transform)
        columns = ceil(src.width/tile_width)
    indices = [row*columns+col
               for row in range(int((window.row_off-3)//tile_height), int((window.row_off+window.height+3)//tile_height)+1)
               for col in range(int((window.col_off-3)//tile_width), int((window.col_off+window.width+3)//tile_width)+1)]
    segments = [(start, min(start+524287, offsets[index]+sizes[index]-1))
                for index in indices for start in range(offsets[index], offsets[index]+sizes[index], 524288)]
    with ThreadPoolExecutor(max_workers=4) as pool:
        downloaded = list(pool.map(lambda part: range_bytes(url, prefix, *part)[0], segments))
    records = [{'range': [0, 65535], 'sha256': sha256(header.read_bytes()).hexdigest()}]
    with sparse.open('r+b') as file:
        for (start, end), part in zip(segments, downloaded):
            data = part.read_bytes()
            file.seek(start)
            file.write(data)
            records.append({'range': [start, end], 'sha256': sha256(data).hexdigest()})
    return sparse, {'fullObjectBytes': total, 'etag': re.search(r'etag: (.+)', response, re.I)[1].strip(),
                    'downloadedBytes': sum(end-start+1 for start, end in segments)+65536,
                    'nativeTileIndices': indices, 'verifiedRanges': records}


def prepare(name, selection):
    item_id, bounds = selection
    item_url = f'{API}/collections/sentinel-2-l2a/items/{item_id}'
    item_path = download(item_url, f'{item_id}.json')
    item = json.loads(item_path.read_text(encoding='utf-8'))
    assets = item['assets']
    visual_path, transport = local_cog(assets['visual']['href'], item_id, bounds)
    files = [visual_path, download(assets['scl']['href'], f'{item_id}-scl.tif')]
    west, south, east, north = bounds
    metres = [(east-west)*111320*cos(radians((north+south)/2)), (north-south)*111320]
    width, height = [ceil(m/10) for m in metres]
    rgb, source = crop(files[0], bounds, width, height)
    assert rgb.shape == (3, height, width) and rgb.dtype == np.uint8
    coverage = float(np.count_nonzero(np.any(rgb != 0, axis=0))/width/height)
    assert coverage > .999, f'{name}: incomplete true-colour coverage {coverage}'
    scl, _ = crop(files[1], bounds, ceil(metres[0]/20), ceil(metres[1]/20), categorical=True)
    count = scl.size
    stats = {str(int(v)): round(int(n)/count*100, 5) for v, n in zip(*np.unique(scl, return_counts=True))}
    cloud = sum(stats.get(str(v), 0) for v in [8, 9, 10])
    assert cloud < 1, f'{name}: inspect a different acquisition; crop SCL cloud {cloud}%'
    date=item['properties']['datetime'][:10].replace('-', '')
    year=date[:4]
    output = DEST / f'{name}-sentinel-{date}.jpg'
    Image.fromarray(np.moveaxis(rgb, 0, -1)).save(output, quality=95, subsampling=0)
    stac = DEST / f'{name}-sentinel-stac.json'
    stac.write_text(json.dumps(item, ensure_ascii=False, indent=2), encoding='utf-8')
    record = {
        'file': output.name, 'sha256': sha256(output.read_bytes()).hexdigest(),
        'bounds': bounds, 'outputSize': [width, height], 'outputCRS': 'EPSG:4326',
        'outputTransform': list(from_bounds(*bounds, width, height))[:6],
        'outputPixelMetresApprox': [round(metres[0]/width, 3), round(metres[1]/height, 3)],
        'sourceResolutionMetres': 10, 'acquiredAt': item['properties']['datetime'],
        'itemId': item_id, 'collection': item['collection'], 'itemURL': item_url,
        'stacFile': stac.name, 'stacSHA256': sha256(stac.read_bytes()).hexdigest(),
        'source': source, 'assets': [
            {'key': 'visual', 'url': assets['visual']['href'], 'transport': transport},
            {'key': 'scl', 'url': assets['scl']['href'], 'sha256': sha256(files[1].read_bytes()).hexdigest(),
             'bytes': files[1].stat().st_size}],
        'tileCloudPercent': item['properties']['eo:cloud_cover'],
        'cropSCLPercent': stats, 'cropCloudPercent': round(cloud, 5), 'validRGBFraction': coverage,
        'credit': f'Contains modified Copernicus Sentinel data {year}',
        'distribution': 'Element 84 Earth Search / AWS Sentinel-2 COGs', 'licenseURL': LICENSE,
        'processing': 'Native 10 m TCI (B04/B03/B02); cropped UTM window, bilinear reprojection to DEM WGS84 bounds, north-up JPEG quality 95. No AI upscaling, invented colours, terrain displacement, cloud filling or multi-date mosaic.',
        'quality': 'Selected from low-cloud July–September candidates (Tianchi: 2024; glacier: 2023–2025). Crop SCL statistics and visual inspection recorded; SCL is a 20 m automatic classification, not manual ground truth.',
        'accessedAt': datetime.now(timezone.utc).isoformat(),
    }
    print(json.dumps({k: record[k] for k in ['file', 'outputSize', 'cropSCLPercent', 'validRGBFraction']}, ensure_ascii=False), flush=True)
    return record


if __name__ == '__main__':
    records = {name: prepare(name, value) for name, value in SELECTION.items()}
    manifest_path = DEST / 'data-sources.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    manifest['localImagery'] = records
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
