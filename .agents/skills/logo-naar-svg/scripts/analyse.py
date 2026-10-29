#!/usr/bin/env python3
"""Step 1: measure the reference image.

    python3 analyse.py <reference image> <work dir>

Writes to the work dir:
  t.npy          coverage 0..1 of the artwork per pixel (projection from background to ink colour)
  meta.json      image size, background colour, ink colour
  parts.txt      every connected shape: number, box, size, colour (HEX of its core pixels)
  overview.png   the reference at 2x with every shape boxed and numbered, to decide the parts
The background is the median of the image border; the ink colour the median of the strongest
artwork pixels. Works for light-on-dark and dark-on-light logos.
"""
import sys, os, json, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

src, work = sys.argv[1], sys.argv[2]
os.makedirs(work, exist_ok=True)
ext = os.path.splitext(src)[1].lower() or '.png'
ref = os.path.join(work, 'referentie' + ext)
if os.path.abspath(src) != os.path.abspath(ref): shutil.copy(src, ref)
im = np.asarray(Image.open(src).convert('RGB')).astype(float)
H, W = im.shape[:2]
hexc = lambda c: '#%02X%02X%02X' % tuple(int(round(v)) for v in c)

border = np.concatenate([im[:5].reshape(-1, 3), im[-5:].reshape(-1, 3), im[:, :5].reshape(-1, 3), im[:, -5:].reshape(-1, 3)])
bg = np.median(border, 0)
dist = np.linalg.norm(im - bg, axis=2)
art = dist > 60
if art.sum() < 50: sys.exit('no artwork found: is the background the same colour as the image border?')
strong = dist >= np.percentile(dist[art], 60)
ink = np.median(im[art & strong], 0)
d = ink - bg
t = np.clip(((im - bg) @ d) / (d @ d), 0, 1.3)
np.save(os.path.join(work, 't.npy'), t)

lab, n = nd.label(t > 0.4)
core = nd.binary_erosion(t > 0.5, iterations=2)
rows = []
for i, sl in enumerate(nd.find_objects(lab), 1):
    m = lab[sl] == i; area = int(m.sum())
    if area < 10: continue
    c = core[sl] & m
    col = np.median(im[sl][c if c.sum() >= 5 else m], 0)
    rows.append(dict(id=len(rows) + 1, x0=sl[1].start, x1=sl[1].stop, y0=sl[0].start, y1=sl[0].stop, area=area, colour=hexc(col)))
json.dump(dict(width=W, height=H, background=hexc(bg), ink=hexc(ink), reference=os.path.basename(ref)),
          open(os.path.join(work, 'meta.json'), 'w'), indent=1)
with open(os.path.join(work, 'parts.txt'), 'w') as f:
    f.write(f'reference {W}x{H}  background {hexc(bg)}  ink {hexc(ink)}\n')
    f.write('  nr   x0   x1   y0   y1   width height   area  colour\n')
    for r in rows:
        f.write(f"{r['id']:4d} {r['x0']:4d} {r['x1']:4d} {r['y0']:4d} {r['y1']:4d} {r['x1']-r['x0']:6d} {r['y1']-r['y0']:6d} {r['area']:6d}  {r['colour']}\n")
print(open(os.path.join(work, 'parts.txt')).read())

S = 2
ov = Image.open(src).convert('RGB').resize((W * S, H * S), Image.LANCZOS)
dr = ImageDraw.Draw(ov)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
except OSError: font = ImageFont.load_default()
for r in rows:
    dr.rectangle([r['x0'] * S, r['y0'] * S, r['x1'] * S, r['y1'] * S], outline=(63, 224, 255), width=1)
    dr.text((r['x0'] * S, r['y0'] * S - 20), str(r['id']), fill=(63, 224, 255), font=font)
ov.save(os.path.join(work, 'overview.png'))
