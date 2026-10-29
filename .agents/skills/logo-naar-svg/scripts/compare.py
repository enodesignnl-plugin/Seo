#!/usr/bin/env python3
"""Step 4: check the vector against the reference.

    python3 compare.py <work dir>/logo.json

Uses <work>/placed.json from build.cjs. Writes <out>/<name>_Vergelijking.png with three panels
(reference / vector at its final place / every vector shape as a contour where it matches the
reference) and prints, per part and per letter:
  shape     coverage overlap at the best offset: how well the shape itself matches
  moved     that offset: how far the alignment rules (or a fit error) put it from the reference
  colour    the reference colour under the shape (median of its inner pixels), for the colour codes
The numbers also go to <work>/compare.txt.
"""
import sys, os, json, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

spec_f = os.path.abspath(sys.argv[1]); work = os.path.dirname(spec_f)
spec = json.load(open(spec_f)); meta = json.load(open(os.path.join(work, 'meta.json')))
placed = json.load(open(os.path.join(work, 'placed.json')))
out = os.path.abspath(os.path.join(work, spec.get('out', 'out')))
N_W, N_H = meta['width'], meta['height']; sx, sy = placed['shift']
ref_img = os.path.join(work, meta['reference'])
tmp = os.path.join(work, 'tmp'); os.makedirs(tmp, exist_ok=True)
def render(body, S, name):
    svg = os.path.join(tmp, name + '.svg'); png = svg[:-4] + '.png'
    open(svg, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N_W} {N_H}" width="{N_W*S}" height="{N_H*S}"><g transform="translate({-sx} {-sy})">{body}</g></svg>')
    subprocess.run(['inkscape', svg, '-o', png, '-w', str(N_W * S)], capture_output=True, check=True)
    return Image.open(png).convert('RGBA')
units = []   # (label, [d...])
for n, p in placed['parts'].items():
    if len(p['items']) > 1:
        cnt = {}
        for it in p['items']:
            cnt[it['ch']] = cnt.get(it['ch'], 0) + 1
            units.append((f"{n} {it['ch']}" + (f"{cnt[it['ch']]}" if cnt[it['ch']] > 1 else ''), [it['d']]))
    else: units.append((n, [p['items'][0]['d']]))

S = 2
t = np.clip(np.load(os.path.join(work, 't.npy')), 0, 1)
A = np.asarray(Image.fromarray((t * 255).astype(np.uint8)).resize((N_W * S, N_H * S), Image.BICUBIC)).astype(float) / 255
im = np.asarray(Image.open(ref_img).convert('RGB').resize((N_W * S, N_H * S), Image.BICUBIC)).astype(float)
lab, _ = nd.label(A > 0.15)
hexc = lambda c: '#%02X%02X%02X' % tuple(int(round(v)) for v in c)
lines, off = [], {}
for name, ds in units:
    r = np.asarray(render(''.join(f'<path fill="#fff" d="{d}"/>' for d in ds), S, '_m'))[..., 3].astype(float) / 255
    ys, xs = np.where(r > 0.5)
    if not len(ys): continue
    y0, y1, x0, x1 = max(ys.min() - 40, 0), min(ys.max() + 40, N_H * S), max(xs.min() - 40, 0), min(xs.max() + 40, N_W * S)
    # reference coverage of only the shapes this part covers (neighbours left out)
    ids = np.unique(lab[r > 0.5]); ids = ids[ids > 0]
    a = A[y0:y1, x0:x1] * np.isin(lab[y0:y1, x0:x1], ids)
    inner = a[a > 0.5]; hi = np.percentile(inner, 60) if inner.size else 1
    a = np.clip(a / max(hi, 0.3), 0, 1)              # a part printed in a darker tone still compares fairly
    R = np.pad(r, 40)
    def score(dx, dy):
        b = R[y0 + 40 - dy:y1 + 40 - dy, x0 + 40 - dx:x1 + 40 - dx]
        return np.minimum(a, b).sum() / max(np.maximum(a, b).sum(), 1e-9)
    best = max((score(dx, dy), dx, dy) for dy in range(-32, 33, 4) for dx in range(-32, 33, 4))   # coarse, then fine
    best = max((score(dx, dy), dx, dy) for dy in range(best[2] - 4, best[2] + 5) for dx in range(best[1] - 4, best[1] + 5))
    # colour: inner pixels of the shape, laid where it matches the reference
    m = np.roll(np.roll(r > 0.5, best[2], 0), best[1], 1)
    for it in (3, 2, 1):
        core = nd.binary_erosion(m, iterations=it)
        if core.sum() > 20: break
    col = hexc(np.median(im[core], 0)) if core.sum() > 5 else '-'
    off[name] = (best[1] / S, best[2] / S)
    lines.append(f'{name:24s} shape {best[0]*100:5.1f}%   moved {-best[1]/S:+5.1f} px horizontal, {-best[2]/S:+5.1f} px vertical   colour {col}')
open(os.path.join(work, 'compare.txt'), 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))

S = 3
allds = [d for _, ds in units for d in ds]
fill = ''.join(f'<path fill="{meta["ink"]}" d="{d}"/>' for d in allds)
vec = render(f'<rect x="-9999" y="-9999" width="99999" height="99999" fill="{meta["background"]}"/>' + fill, S, '_fill')
line = render(''.join(f'<g transform="translate({off.get(n, (0, 0))[0]} {off.get(n, (0, 0))[1]})">' + ''.join(f'<path fill="none" stroke="#3FE0FF" stroke-width="0.7" d="{d}"/>' for d in ds) + '</g>' for n, ds in units), S, '_line')
src = Image.open(ref_img).convert('RGBA').resize((N_W * S, N_H * S), Image.BICUBIC)
al = np.asarray(vec)[..., :3].astype(float); bgc = np.array([int(meta['background'][i:i + 2], 16) for i in (1, 3, 5)])
ys, xs = np.where((np.abs(np.asarray(src)[..., :3].astype(float) - bgc).sum(2) > 60) | (np.abs(al - bgc).sum(2) > 60))
crop = (max(xs.min() - 15 * S, 0), max(ys.min() - 15 * S, 0), min(xs.max() + 15 * S, N_W * S), min(ys.max() + 15 * S, N_H * S))
pw, ph = crop[2] - crop[0], crop[3] - crop[1]
sheet = Image.new('RGB', (pw + 40, ph * 3 + 3 * 70 + 20), (245, 240, 232)); dr = ImageDraw.Draw(sheet)
try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 40)
except OSError: f = ImageFont.load_default()
for i, (p, title) in enumerate([(src, 'Referentie'), (vec, 'Vector'), (Image.alpha_composite(src, line), 'Vormcontrole: elke vectorvorm als contour op zijn plek in de referentie')]):
    y = 20 + i * (ph + 70); dr.text((20, y), title, fill=(42, 26, 18), font=f); sheet.paste(p.crop(crop).convert('RGB'), (20, y + 55))
os.makedirs(out, exist_ok=True)
sheet.save(os.path.join(out, f"{spec['name']}_Vergelijking.png")); print('sheet:', os.path.join(out, f"{spec['name']}_Vergelijking.png"))
