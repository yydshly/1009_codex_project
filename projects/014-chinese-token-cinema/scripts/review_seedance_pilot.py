"""Extract actual online frames for continuity and Mandarin mouth review.

No generated frames, retiming, face detector, or lip-sync score is used.
"""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('video', type=Path)
parser.add_argument('--output-prefix', default='seedance-single-shot')
parser.add_argument('--face-crop', type=int, nargs=4, default=[490,5,695,250],
                    help='Diagnostic face ROI in actual source pixels; default uses the Seedance composition.')
args = parser.parse_args()
if Path(args.output_prefix).name != args.output_prefix:
    parser.error('Output prefix must be a filename, not a path.')
capture = cv2.VideoCapture(str(args.video))
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
times = [.3, 1.2, 2.3, 3, 3.5, 4.1, 4.6, 5.1, 6.2, 7.3, 8.5, 9.5]
mouth_times = [0, .25, .5, .75, 1, 1.25, 1.5, 1.75,
               2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75,
               4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75,
               6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75,
               8, 8.25, 8.5, 8.75, 9, 9.25, 9.5, 9.75]
width, height = int(capture.get(3)), int(capture.get(4))
def frame_at(t):
    capture.set(cv2.CAP_PROP_POS_MSEC, t*1000)
    ok, frame = capture.read()
    if not ok:
        raise RuntimeError('Could not decode '+str(t))
    return Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

sheet = Image.new('RGB', (1600, 3*258), '#111820')
for i, t in enumerate(times):
    frame = frame_at(t).resize((400, 230))
    x, y = (i%4)*400, (i//4)*258
    sheet.paste(frame, (x, y))
    ImageDraw.Draw(sheet).text((x+10, y+233), f'{t:.2f}s', fill='#e8edf4', font=font)
sheet.save(ROOT/'assets'/f'{args.output_prefix}-contact.jpg', quality=95)

# The ROI must be grounded in the actual composition of each reviewed result.
scaled = tuple(args.face_crop)
if not (0 <= scaled[0] < scaled[2] <= width and 0 <= scaled[1] < scaled[3] <= height):
    parser.error('Face crop must remain inside the actual decoded frame.')
faces = Image.new('RGB', (8*205, 5*273), '#111820')
for i, t in enumerate(mouth_times):
    detail = frame_at(t).crop(scaled).resize((205,245))
    x, y = (i%8)*205, (i//8)*273
    faces.paste(detail,(x,y))
    ImageDraw.Draw(faces).text((x+8,y+247),f'{t:.2f}s',fill='#e8edf4',font=font)
faces.save(ROOT/'assets'/f'{args.output_prefix}-mouth-sequence.jpg', quality=96)
capture.release()
(ROOT/'assets'/f'{args.output_prefix}-frame-review.json').write_text(json.dumps({
    'status':'actual_frames_for_visual_review',
    'videoSha256':hashlib.sha256(args.video.read_bytes()).hexdigest(),
    'width':width,'height':height,'sampleTimes':times,
    'mouthSequenceTimes':mouth_times,'diagnosticFaceCrop':scaled,
    'note':'Actual decoded frames only. Sequential mouth samples help inspect starts, holds and pauses; no automatic phoneme accuracy score is claimed.'
},indent=2)+'\n',encoding='utf-8')
print('Saved actual continuity and mouth sequence sheets.')
