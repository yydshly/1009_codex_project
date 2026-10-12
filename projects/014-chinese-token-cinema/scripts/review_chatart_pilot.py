"""Extract the actual pilot's shots and face detail for human quality review."""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
TIMES = [.3, 1.2, 2.3, 3.0, 4.6, 5.1, 5.7, 6.2, 6.9, 7.3, 8.5, 9.5]
# Actual pilot changes composition at about 4 seconds; follow its visible face.
FACE_CROPS = [(700, 25, 1000, 325)]*4 + [(400, 50, 900, 650)]*6 + [(700, 25, 1000, 325)]*2

parser = argparse.ArgumentParser()
parser.add_argument('video', type=Path)
args = parser.parse_args()
capture = cv2.VideoCapture(str(args.video))
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 20)
sheets = [Image.new('RGB', (1600, 3*253), '#111820'),
          Image.new('RGB', (1200, 3*338), '#111820')]
for i, t in enumerate(TIMES):
    capture.set(cv2.CAP_PROP_POS_MSEC, t*1000)
    ok, frame = capture.read()
    if not ok:
        raise RuntimeError('Could not decode pilot at '+str(t))
    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    # Diagnostic enlargement, not a replacement shot or generated content.
    detail = ImageOps.contain(image.crop(FACE_CROPS[i]), (300, 300))
    face = Image.new('RGB', (300, 300), '#111820')
    face.paste(detail, ((300-detail.width)//2, (300-detail.height)//2))
    for sheet, tile, w, h in [(sheets[0], image.resize((400, 225)), 400, 253),
                             (sheets[1], face, 300, 338)]:
        x, y = (i%4)*w, (i//4)*h
        sheet.paste(tile, (x, y))
        ImageDraw.Draw(sheet).text((x+10, y+h-26), f'{t:.1f}s', fill='#e8edf4', font=font)
capture.release()
for sheet, name in zip(sheets, ['chatart-opening-contact.jpg', 'chatart-opening-face-contact.jpg']):
    sheet.save(ROOT/'assets'/name, quality=94)
(ROOT/'assets/chatart-opening-frame-review.json').write_text(json.dumps({
    'status': 'actual_frames_for_human_review',
    'videoSha256': hashlib.sha256(args.video.read_bytes()).hexdigest(),
    'sampleTimes': TIMES,
    'faceCropsInOriginalPixels': FACE_CROPS,
    'note': 'Frame samples show actual visual output. Cropped enlargement is diagnostic only; no automatic phoneme-to-mouth score is claimed.'
}, indent=2)+'\n', encoding='utf-8')
print('Actual pilot contact sheets saved.')
