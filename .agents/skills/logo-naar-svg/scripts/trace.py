#!/usr/bin/env python3
"""Step 2a: trace a drawn part (emblem, icon, ornament, hand-drawn letter) into clean vector paths.

    python3 trace.py <work dir> <name> --box x0,y0,x1,y1 [--mirror auto|none|<x>] [options]

Only shapes lying wholly inside the box are used (connected shapes larger than --min-area
pixels); a neighbouring shape that crosses the box edge is left out, so the box can overlap
other artwork.
Steps: coverage of the box, normalised to this part's own colour (a part may be printed in a
darker or lighter tone than the ink colour), optionally made exactly mirror-symmetric, upscaled
--up times, smoothed, traced with potrace, then cleaned by trace.cjs:
  - rounded-off tips (the trace blurs sharp points) are made sharp again (--tip-turn, --tip-cut)
  - each contour is refitted with fewer, smoother anchor points between its corners (--tol)
  - with a mirror axis: the left half is cleaned, mirrored and united, so both halves are identical
Writes <work>/parts/<name>.json with the outline in reference pixels.
"""
import sys, os, json, argparse, subprocess
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ap = argparse.ArgumentParser()
ap.add_argument('work'); ap.add_argument('name')
ap.add_argument('--box', required=True, help='x0,y0,x1,y1 in reference pixels, around the whole part')
ap.add_argument('--mirror', default='none', help="'auto' finds the vertical mirror axis, or give its x")
ap.add_argument('--min-area', type=float, default=50)
ap.add_argument('--parts', default='', help='only these shape numbers from parts.txt, e.g. 7 or 1,2,3')
ap.add_argument('--up', type=int, default=10, help='upscale factor before tracing')
ap.add_argument('--blur', type=float, default=0.35, help='smoothing in source pixels before thresholding')
ap.add_argument('--threshold', type=float, default=0.5)
ap.add_argument('--tol', type=float, default=0.12, help='refit tolerance in source pixels (higher = fewer points)')
ap.add_argument('--tip-turn', type=float, default=70, help='degrees of turn within 1.5 px that count as a tip; 0 = off')
ap.add_argument('--tip-cut', type=float, default=2.8, help='px cut either side of a tip before the flanks are extended')
a = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(a.work, 'parts'), exist_ok=True)
tmp = os.path.join(a.work, 'tmp'); os.makedirs(tmp, exist_ok=True)

t = np.load(os.path.join(a.work, 't.npy'))
X0, Y0, X1, Y1 = map(int, a.box.split(','))
pad = 6; X0, Y0 = max(0, X0 - pad), max(0, Y0 - pad); X1, Y1 = min(t.shape[1], X1 + pad), min(t.shape[0], Y1 + pad)
c = t[Y0:Y1, X0:X1]
lab, n = nd.label(c > 0.3); keep = np.zeros_like(c, bool)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
for i in range(1, n + 1):
    if i not in edge and (lab == i).sum() > a.min_area: keep |= lab == i
if a.parts:
    full, _ = nd.label(t > 0.4); ids = [int(v) for v in a.parts.split(',')]
    objs = nd.find_objects(full); order = []   # analyse.py numbers the shapes in label order, skipping tiny ones
    for i, sl in enumerate(objs, 1):
        if sl is not None and (full[sl] == i).sum() >= 10: order.append(i)
    sel = np.isin(full, [order[k - 1] for k in ids])
    keep = nd.binary_dilation(sel, iterations=3)[Y0:Y1, X0:X1] & (c > 0.05)
if not keep.any(): sys.exit('no shape lies wholly inside the box: make the box a little larger')
c = np.where(nd.binary_dilation(keep, iterations=2), c, 0)
inner = c[c > 0.5]
hi = np.percentile(inner, 60) if inner.size else 1.0
c = np.clip(c / hi, 0, 1)
U = a.up
A = np.asarray(Image.fromarray((c * 255).astype(np.uint8)).resize((c.shape[1] * U, c.shape[0] * U), Image.BICUBIC)).astype(float) / 255
axis = None
if a.mirror != 'none':
    w0 = c.shape[1]
    def err(cx):
        cu = int(round(cx * U)); w = min(cu, A.shape[1] - cu) - 5
        return np.abs(A[:, cu - w:cu] - A[:, cu:cu + w][:, ::-1]).mean() if w > 10 * U else 9
    if a.mirror == 'auto':
        cands = np.arange(w0 * 0.3, w0 * 0.7, 0.1); cx = min(cands, key=err)
    else:
        cx = float(a.mirror) - X0
    cu = int(round(cx * U)); w = min(cu, A.shape[1] - cu) - 5
    half = (A[:, cu - w:cu] + A[:, cu:cu + w][:, ::-1]) / 2
    half = nd.gaussian_filter(half, U * a.blur)
    img = np.concatenate([half, half[:, ::-1]], 1)
    x0 = X0 + cx - w / U; axis = X0 + cx
    print(f'mirror axis x = {axis:.2f}  (left/right difference {err(cx):.4f}; below 0.02 is a symmetric original)')
else:
    img = nd.gaussian_filter(A, U * a.blur); x0 = X0
Image.fromarray(((img < a.threshold) * 255).astype(np.uint8)).save(os.path.join(tmp, a.name + '.pbm'))
svg = os.path.join(tmp, a.name + '_trace.svg')
subprocess.run(['potrace', os.path.join(tmp, a.name + '.pbm'), '-s', '-a', '1.1', '-O', '0.6', '-t', '50', '-o', svg], check=True)
meta = dict(x0=x0, y0=Y0, up=U, axis=axis, tol=a.tol, tipTurn=a.tip_turn, tipCut=a.tip_cut)
subprocess.run(['node', os.path.join(HERE, 'trace.cjs'), svg, json.dumps(meta), os.path.join(a.work, 'parts', a.name + '.json')], check=True)
