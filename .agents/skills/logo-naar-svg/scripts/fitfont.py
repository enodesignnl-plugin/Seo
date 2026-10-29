#!/usr/bin/env python3
"""Step 2b: find the font that matches a line of lettering, and set it as outlines.

    python3 fitfont.py <work dir> <name> --box x0,y0,x1,y1 --text "AWZA" --fonts a.ttf,b.ttf
                       [--weights 400,500,600] [--stretch] [--uniform] [--keep-font N]

The letters are the connected shapes lying wholly inside the box (shapes that overlap
horizontally, like an accent and its letter, count as one), left to right; their number must
match the text without spaces. Per font (and per weight for a variable font) every letter is
fitted: one shared size and baseline for the line, per letter its x position and, with
--stretch, a horizontal stretch (for lettering that is wider or narrower than the font).
Score: coverage overlap (IoU) with the reference, mean over the letters.

Prints a ranking, then for the best (or --keep-font N from the ranking):
  - the spacing: whether the letters sit on uniform tracking, the tracking in px and in
    Illustrator units (1/1000 em), and how far each letter is off that (--uniform puts them
    exactly on it: equal spacing)
  - writes <work>/parts/<name>.fit.json (font, weight, size, baseline, letters) and, through
    textpath.cjs, <work>/parts/<name>.json with one outline per letter.
"""
import sys, os, json, argparse, subprocess
import numpy as np
from PIL import Image, ImageFont, ImageDraw
from scipy import ndimage as nd, optimize as op
from fontTools.ttLib import TTFont

ap = argparse.ArgumentParser()
ap.add_argument('work'); ap.add_argument('name')
ap.add_argument('--box', required=True); ap.add_argument('--text', required=True)
ap.add_argument('--fonts', required=True, help='comma separated .ttf/.otf paths')
ap.add_argument('--weights', default='', help='weights to try for variable fonts, e.g. 300,400,500,600')
ap.add_argument('--stretch', action='store_true', help='fit a horizontal stretch per letter')
ap.add_argument('--uniform', action='store_true', help='place the letters on exactly uniform tracking')
ap.add_argument('--keep-font', type=int, default=1, help='use this rank of the ranking instead of the best')
a = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(a.work, 'parts'), exist_ok=True); os.makedirs(os.path.join(a.work, 'fonts'), exist_ok=True)
t = np.clip(np.load(os.path.join(a.work, 't.npy')), 0, 1)

# --- letters in the box
X0, Y0, X1, Y1 = map(int, a.box.split(','))
pad = 4; bx0, by0, bx1, by1 = max(0, X0 - pad), max(0, Y0 - pad), min(t.shape[1], X1 + pad), min(t.shape[0], Y1 + pad)
lab, n = nd.label(t > 0.3)
win = lab[by0:by1, bx0:bx1]
edge = set(np.unique(np.concatenate([win[0], win[-1], win[:, 0], win[:, -1]]))) - {0}
boxes = []
for i in set(np.unique(win)) - {0} - edge:
    ys, xs = np.where(lab == i)
    if len(ys) >= 15: boxes.append([xs.min(), xs.max() + 1, ys.min(), ys.max() + 1, [i]])
boxes.sort()
merged = []
for b in boxes:
    if merged:
        m = merged[-1]; ov = min(m[1], b[1]) - max(m[0], b[0])
        if ov > 0.5 * min(m[1] - m[0], b[1] - b[0]):
            merged[-1] = [min(m[0], b[0]), max(m[1], b[1]), min(m[2], b[2]), max(m[3], b[3]), m[4] + b[4]]; continue
    merged.append(b)
chars = [c for c in a.text if c != ' ']
if len(merged) != len(chars):
    sys.exit(f'found {len(merged)} letter shapes in the box, the text has {len(chars)} letters: '
             + ', '.join(f'x {b[0]}-{b[1]}' for b in merged) + '\n(adjust the box, or letters touching each other count as one shape)')

S = 400
def font_obj(ff, w):
    f = ImageFont.truetype(ff, S)
    if w is not None:
        try:
            axes = f.get_variation_axes(); vals = [ax['default'] for ax in axes]
            for k, ax in enumerate(axes):
                if ax['name'] in (b'Weight', 'Weight'): vals[k] = w
            f.set_variation_by_axes(vals)
        except (OSError, AttributeError): pass
    return f
def master(ff, ch, w):
    im = Image.new('L', (S * 2, S * 2), 0)
    ImageDraw.Draw(im).text((S // 2, S), ch, font=font_obj(ff, w), fill=255, anchor='ls')
    return np.asarray(im).astype(float) / 255, (S // 2, S)
def place(g, org, em, st, ox, oy, shape, off):
    sw, sh = st * em / S, em / S; acc = np.zeros(shape)
    for p in (-1 / 3, 0, 1 / 3):
        for q in (-1 / 3, 0, 1 / 3):
            acc += nd.affine_transform(g, np.diag([1 / sh, 1 / sw]), output_shape=shape, order=1,
                                       offset=[org[1] + (off[1] + 0.5 + p - oy) / sh - 0.5, org[0] + (off[0] + 0.5 + q - ox) / sw - 0.5])
    return acc / 9
iou = lambda P, T: np.minimum(P, T).sum() / max(np.maximum(P, T).sum(), 1e-9)
targets = []
for b in merged:
    m = nd.binary_dilation(np.isin(lab, b[4]), iterations=2); x0, x1, y0, y1 = b[0] - 8, b[1] + 8, b[2] - 8, b[3] + 8
    targets.append(((t * m)[y0:y1, x0:x1], (x0, y0), b))

def fit(ff, w):
    gl = [master(ff, ch, w) for ch in chars]
    p1 = []
    for (g, org), (T, off, b) in zip(gl, targets):
        gy, gx = np.where(g > 0.5); h = b[3] - b[2]
        em0 = S * h / (gy.max() - gy.min() + 1); x0 = b[0] - (gx.min() - org[0]) * em0 / S; y0 = b[2] + (org[1] - gy.min()) * em0 / S
        f = lambda p: -iou(place(g, org, p[0], p[1] if a.stretch else 1, p[2], p[3], T.shape, off), T)
        r = op.minimize(f, [em0, 1.0, x0, y0], method='Nelder-Mead', options={'xatol': 0.02, 'fatol': 1e-5, 'maxiter': 300})
        p1.append(r.x)
    em, base = float(np.median([p[0] for p in p1])), float(np.median([p[3] for p in p1]))
    out = []
    for (g, org), (T, off, b), p in zip(gl, targets, p1):
        f = lambda q: -iou(place(g, org, em, q[0] if a.stretch else 1, q[1], base, T.shape, off), T)
        r = op.minimize(f, [p[1] if a.stretch else 1, p[2]], method='Nelder-Mead', options={'xatol': 0.005, 'fatol': 1e-6})
        out.append(dict(stretch=round(float(r.x[0]) if a.stretch else 1.0, 4), x=round(float(r.x[1]), 3), iou=round(-r.fun, 4)))
    return em, base, out

ws = [float(v) for v in a.weights.split(',') if v]
runs = []
for ff in a.fonts.split(','):
    var = 'fvar' in TTFont(ff, lazy=True)
    for w in (ws or [None]) if var else [None]:
        em, base, out = fit(ff, w); score = float(np.mean([o['iou'] for o in out]))
        runs.append(dict(font=ff, wght=w, em=em, baseline=base, letters=out, score=score))
        print(f"{score:.4f}  {os.path.basename(ff)}{'' if w is None else f' wght {w:g}'}  size {em:.2f}  per letter " + ' '.join(f"{c}:{o['iou']:.2f}" for c, o in zip(chars, out)), flush=True)
runs.sort(key=lambda r: -r['score'])
print('\nranking:'); [print(f"  {k}. {r['score']:.4f}  {os.path.basename(r['font'])} {'' if r['wght'] is None else r['wght']}") for k, r in enumerate(runs[:8], 1)]
R = runs[a.keep_font - 1]

# --- static instance of a variable font (opentype.js cannot read variations)
ff = R['font']; tt = TTFont(ff)
if 'fvar' in tt:
    inst = os.path.join(a.work, 'fonts', f"{os.path.splitext(os.path.basename(ff))[0].split('[')[0]}-{R['wght']:g}.ttf")
    pins = [f"{ax.axisTag}={R['wght'] if ax.axisTag == 'wght' and R['wght'] is not None else ax.defaultValue:g}" for ax in tt['fvar'].axes]
    subprocess.run([sys.executable, '-m', 'fontTools', 'varLib.instancer', ff, *pins, '-o', inst, '-q'], check=True)
    tt = TTFont(inst); R['outline_font'] = inst
else:
    R['outline_font'] = ff

# --- spacing: are the letters on uniform tracking?
cmap = tt.getBestCmap(); hm = tt['hmtx']; upm = tt['head'].unitsPerEm; k = R['em'] / upm
pos, xcur, nsp, cnt = [], 0.0, [], 0
for c in a.text:
    if c != ' ': pos.append(xcur); nsp.append(cnt)
    else: cnt += 1
    xcur += hm[cmap[ord(c)]][0] * k
xs = np.array([o['x'] for o in R['letters']]); pos = np.array(pos); idx = np.arange(len(pos)); nsp = np.array(nsp, float)
cols = [np.ones_like(pos), idx] + ([nsp] if nsp.any() else [])
sol, *_ = np.linalg.lstsq(np.stack(cols, 1), xs - pos, rcond=None)
model = np.stack(cols, 1) @ sol + pos; res = xs - model
track = sol[1]; sp_extra = float(sol[2] - track) if nsp.any() else 0.0   # beyond a space with the same tracking
R['tracking'] = dict(px=round(float(track), 3), illustrator=round(float(track / R['em'] * 1000)), space_extra_px=round(sp_extra, 3),
                                    max_off_px=round(float(np.abs(res).max()), 2))
print(f"\nchosen: {os.path.basename(ff)} {'' if R['wght'] is None else 'wght %g' % R['wght']}, size {R['em']:.2f} px, baseline y {R['baseline']:.2f}")
print(f"tracking {track:.2f} px = {track / R['em'] * 1000:.0f} in Illustrator"
      + (f", each space {sp_extra:+.2f} px wider than a tracked space" if nsp.any() else '') + f"; letters off uniform tracking by at most {np.abs(res).max():.2f} px")
print('per letter off (px): ' + ' '.join(f'{c}{v:+.1f}' for c, v in zip(chars, res)))
if a.stretch: print('stretch per letter: ' + ' '.join(f"{c}{o['stretch'] * 100:.1f}%" for c, o in zip(chars, R['letters'])))
if a.uniform:
    for o, m in zip(R['letters'], model): o['x'] = round(float(m), 3)
    print('--uniform: letters placed exactly on that tracking')
R['text'] = a.text; R['chars'] = chars
fitf = os.path.join(a.work, 'parts', a.name + '.fit.json'); json.dump(R, open(fitf, 'w'), indent=1)
subprocess.run(['node', os.path.join(HERE, 'textpath.cjs'), fitf, os.path.join(a.work, 'parts', a.name + '.json')], check=True)
