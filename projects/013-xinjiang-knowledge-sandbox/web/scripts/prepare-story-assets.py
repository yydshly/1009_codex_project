"""Deliberate refresh for the video-style experience. Not run by CI or the browser."""
from datetime import datetime, timezone
from hashlib import sha256
from io import BytesIO
import json
from PIL import Image
from importlib.util import spec_from_file_location, module_from_spec
from pathlib import Path

spec = spec_from_file_location('prepare_data', Path(__file__).with_name('prepare-data.py'))
data = module_from_spec(spec)
spec.loader.exec_module(data)
dest = data.DEST
manifest = json.loads((dest / 'data-sources.json').read_text(encoding='utf-8'))
url = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/june/world.200406.3x21600x10800.jpg'
body = data.fetch(url)
# The known NASA 21600x10800 raster exceeds Pillow's default pixel threshold.
Image.MAX_IMAGE_PIXELS = 250_000_000
image = Image.open(BytesIO(body)).convert('RGB')
box = (round((73 + 180) / 360 * image.width), round((90 - 49) / 180 * image.height),
       round((96 + 180) / 360 * image.width), round((90 - 35) / 180 * image.height))
crop = image.crop(box)
crop.save(dest / 'xinjiang-blue-marble.jpg', quality=93, optimize=True)
manifest['regionalImagery'] = {'url': url, 'sourceSHA256': sha256(body).hexdigest(),
    'sourceSize': list(image.size), 'file': 'xinjiang-blue-marble.jpg', 'bounds': [73, 35, 96, 49],
    'cropPixels': list(box), 'outputSize': list(crop.size),
    'sha256': sha256((dest / 'xinjiang-blue-marble.jpg').read_bytes()).hexdigest(),
    'credit': 'NASA Earth Observatory / Reto Stöckli, Blue Marble Next Generation, June 2004'}
region = data.terrain('xinjiang', [73, 35, 96, 49], 6, 385, 257)
glacier = data.terrain('glacier', [86.76, 43.04, 86.89, 43.17], 12, 161, 161)
manifest['elevation']['datasets'] = [region,
    next(entry for entry in manifest['elevation']['datasets'] if entry['file'] == 'tianchi-dem.json'), glacier]
manifest['storyAssetsAccessedAt'] = datetime.now(timezone.utc).isoformat()
(dest / 'data-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'regionalImage': list(crop.size), 'datasets': [
    {k: v for k, v in entry.items() if k != 'tiles'} for entry in [region, glacier]]}, ensure_ascii=False))
