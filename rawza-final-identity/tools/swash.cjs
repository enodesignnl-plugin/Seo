// SWASH R — a calligraphic capital R drawn as three pointed-pen strokes, after the client's
// reference: (1) the bowl, entering as a long hairline from the far left, swelling on its right
// downstroke and crossing back through the stem as a hairline; (2) the stem, a crescent that
// starts at a point and swells as it falls; (3) the leg, a swash that falls from the bowl, runs
// under the following letters and ends in a rising hairline.
// Pointed pen: a stroke is thick where the pen moves down and hairline where it moves sideways or
// up (w = hair + (thick - hair) * max(0, down)^p), times an envelope that tapers the ends.
// Units: as the wordmark (cap line y = 0, baseline y = 700); x = 0 at the stem's middle.
const { paper, union, shape } = require('./lib.cjs');
const { dropSpecks } = require('./edit.cjs');

function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
}
// sample a cubic chain [p0, c1, c2, p1, c1, c2, p2, ...] evenly by arc length
function sample(pts, n = 600) {
  const segs = (pts.length - 1) / 3, raw = [];
  for (let i = 0; i <= n * 4; i++) {
    const T = (i / (n * 4)) * segs, k = Math.min(segs - 1, Math.floor(T)), t = T - k;
    raw.push(bez(pts[3 * k], pts[3 * k + 1], pts[3 * k + 2], pts[3 * k + 3], t));
  }
  const L = [0];
  for (let i = 1; i < raw.length; i++) L.push(L[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const total = L[L.length - 1], out = [];
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * total;
    while (j < L.length - 2 && L[j + 1] < s) j++;
    const f = (s - L[j]) / (L[j + 1] - L[j] || 1);
    out.push([raw[j][0] + (raw[j + 1][0] - raw[j][0]) * f, raw[j][1] + (raw[j + 1][1] - raw[j][1]) * f]);
  }
  return out;
}
const smooth = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
// envelope: rises from `a0` to 1 over [0, t0], falls from 1 to `a1` over [t1, 1]
const env = (t0, t1, a0 = 0, a1 = 0, e0 = 1, e1 = 1) => (t) =>
  (t < t0 ? a0 + (1 - a0) * smooth(t / t0) ** e0 : 1) * (t > t1 ? a1 + (1 - a1) * smooth((1 - t) / (1 - t1)) ** e1 : 1);

// o: { hair, thick, p, envelope(t), bias: extra weight added along the stroke (t) => units }
function pen(pts, o) {
  const { hair = 6, thick = 100, p = 1.4, envelope = () => 1, bias = () => 0, n = 600 } = o;
  const c = sample(pts, n), Lf = [], Rt = [];
  for (let i = 0; i <= n; i++) {
    const a = c[Math.max(0, i - 8)], b = c[Math.min(n, i + 8)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy); dx /= l; dy /= l;
    const t = i / n, w = Math.max(0.4, (hair + (thick - hair) * Math.max(0, dy) ** p + bias(t)) * envelope(t)) / 2;
    Lf.push([c[i][0] - dy * w, c[i][1] + dx * w]); Rt.push([c[i][0] + dy * w, c[i][1] - dx * w]);
  }
  const path = new paper.Path({ segments: [...Lf, ...Rt.reverse()], closed: true, insert: false });
  path.simplify(0.5);
  const s = path.resolveCrossings().reorient(true, true);
  return s;
}

const DEF = {
  hair: 7, thick: 112,
  bowl: [[-672, -98], [-480, -195], [-90, -222], [155, -178], [424, -137], [620, 10], [620, 201], [620, 360], [440, 512], [270, 505], [130, 500], [-60, 490], [-184, 488]],
  // tip (124, 75); right edge down to a rounded end at (-112..-146, 840..884); left edge back up
  stemPath: 'M124,75 C80,240 30,470 10,640 C-5,760 -50,872 -112,884 C-140,890 -152,868 -146,840 '
    + 'C-118,710 -72,560 -48,442 C-25,350 40,170 124,75 Z',
  leg: [[5, 500], [300, 585], [660, 880], [990, 1160], [1250, 1390], [1480, 1468], [1690, 1466], [1900, 1462], [2110, 1410], [2245, 1368]],
  legThick: 96,
};
// cut the start of a cubic chain at the first point where x reaches `x` (the curve itself is kept:
// the first segment is split with de Casteljau's construction)
function trimStartX(pts, x) {
  const [p0, p1, p2, p3] = pts.slice(0, 4);
  let lo = 0, hi = 1;
  for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (bez(p0, p1, p2, p3, m)[0] < x) lo = m; else hi = m; }
  const t = (lo + hi) / 2, L = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const a = L(p0, p1), b = L(p1, p2), c = L(p2, p3), d = L(a, b), e = L(b, c), f = L(d, e);
  return [f, e, c, p3, ...pts.slice(4)];
}
// the client's shorter version: the entry hairline starts above the stem, the tail stops under the
// start of the descriptor
const SHORT = {
  bowlStartX: -170,
  leg: [[5, 500], [300, 585], [660, 880], [990, 1160], [1210, 1360], [1400, 1450], [1560, 1458], [1640, 1460], [1700, 1446], [1760, 1424]],
};
function R(opts = {}) {
  const o = { ...DEF, ...opts };
  if (o.bowlStartX != null) o.bowl = trimStartX(o.bowl, o.bowlStartX);
  const bowl = pen(o.bowl, { hair: o.hair, thick: o.thick, p: 1.6, envelope: env(0.06, 0.93, 0.3, 0.2) });
  // the stem is drawn as a contour: a crescent from a fine point at the top to a rounded end
  const stem = shape(o.stemPath).reorient(true, true);
  const leg = pen(o.leg, { hair: o.hair, thick: o.legThick, p: 0.9, envelope: env(0.18, 0.88, 0.25, 0.1) });
  return { shape: dropSpecks(union([bowl, stem, leg])), parts: { bowl, stem, leg } };
}

// ---- the wordmark: swash R + the approved A, W, Z, A of direction A (release), and the
// descriptor nested over the R's tail, as in the reference
const { translate } = require('./lib.cjs');
const { line } = require('./text.cjs');
const LOCK = { xA: 861, descFont: 'Montserrat-500.ttf', descCap: 128, descTrack: 0.7, descAlign: 'right', descInset: 330, descY: 1030, text: 'RESTAURANT' };
function lockup(opts = {}) {
  const o = { ...LOCK, ...opts };
  const royal = require('./royal.cjs'), { RELEASE } = require('./system.cjs');
  const { glyphs, pos } = royal.set(RELEASE);
  const r = R(o.R);
  const shift = o.xA - (pos[1] + glyphs[1].shape.bounds.x);
  const wordmark = [{ id: 'letter-R', item: r.shape },
    ...glyphs.slice(1).map((g, i) => ({ id: g.id, item: translate(g.shape, pos[i + 1] + shift, 0) }))];
  const out = { wordmark };
  if (o.text) {
    const t = line(o.descFont, o.text, { cap: o.descCap, track: o.descTrack });
    const x = o.descAlign === 'right' ? wordmark[4].item.bounds.right - t.bounds.width - t.bounds.x - (o.descInset || 0) : o.descX - t.bounds.x;
    out.descriptor = [{ id: 'descriptor', item: translate(t, x, o.descY) }];
  }
  return out;
}
module.exports = { R, pen, sample, env, DEF, SHORT, LOCK, lockup, trimStartX };
