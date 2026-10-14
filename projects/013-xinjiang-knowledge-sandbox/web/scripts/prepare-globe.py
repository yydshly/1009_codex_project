"""Prepare NASA's blue-ocean globe texture, keeping source and output hashes."""
from datetime import datetime, timezone
from hashlib import sha256
from io import BytesIO
from importlib.util import spec_from_file_location, module_from_spec
import json
from pathlib import Path
from PIL import Image

spec=spec_from_file_location('prepare_data',Path(__file__).with_name('prepare-data.py'))
data=module_from_spec(spec)
spec.loader.exec_module(data)
url='https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/june/world.topo.bathy.200406.3x5400x2700.jpg'
body=data.fetch(url)
image=Image.open(BytesIO(body)).convert('RGB')
image.resize((4096,2048),Image.Resampling.LANCZOS).save(data.DEST/'earth-blue-marble.jpg',quality=92,optimize=True)
manifest=json.loads((data.DEST/'data-sources.json').read_text(encoding='utf-8'))
manifest['imagery']={'url':url,'sourceSHA256':sha256(body).hexdigest(),'file':'earth-blue-marble.jpg',
    'sourceSize':list(image.size),'outputSize':[4096,2048],
    'sha256':sha256((data.DEST/'earth-blue-marble.jpg').read_bytes()).hexdigest(),
    'accessedAt':datetime.now(timezone.utc).isoformat(),
    'credit':'NASA Earth Observatory / Reto Stöckli, Blue Marble Next Generation with Topography and Bathymetry, June 2004'}
(data.DEST/'data-sources.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Prepared 4096x2048 NASA topography/bathymetry image. Globe geometry remains a sphere.')
