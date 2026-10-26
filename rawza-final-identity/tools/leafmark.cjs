// RAWZA icon marks: three double-leaf symbols. Each leaf is drawn as a closed contour of cubic
// curves (no strokes, no effects), so the marks edit cleanly in Illustrator.
// Units: the mark is about 1000 high; base of the mark at y = 0, apex near y = -1000.
const { shape, union, sub } = require('./lib.cjs');
const { dropSpecks } = require('./edit.cjs');
const f = (p) => p.map((n) => +n.toFixed(2)).join(',');
// closed contour from a point list [P0, c1, c2, P1, c1, c2, P2, ...] ending back at P0
const contour = (pts) => {
  let d = `M${f(pts[0])}`;
  for (let i = 1; i < pts.length; i += 3) d += ` C${f(pts[i])} ${f(pts[i + 1])} ${f(pts[i + 2])}`;
  return shape(d + ' Z').reorient(true, true);
};
const mirror = (pts) => pts.map(([x, y]) => [-x, y]);
module.exports = { contour, mirror, shape, union, sub, dropSpecks };

// a leaf blade between base B and tip T: the outer edge bows `ob` to one side of the axis, the inner
// edge `ib` to the other; side = +1 bows the outer edge to the left of the direction B -> T.
// p: where along the axis the two control points sit ([0.25, 0.72] gives a blade widest a little
// below the middle); k turns the wanted bow into control-point offset (a cubic reaches 3/4 of it).
function blade(B, T, { ob, ib, side = 1, p = [0.25, 0.72], q, k = 4 / 3 }) {
  const ux = T[0] - B[0], uy = T[1] - B[1];
  const nx = uy * side, ny = -ux * side, nl = Math.hypot(nx, ny);
  const N = [nx / nl, ny / nl];
  const at = (t, off) => [B[0] + ux * t + N[0] * off * k, B[1] + uy * t + N[1] * off * k];
  const [p1, p2] = p, [q1, q2] = q || p;
  return contour([B, at(p1, ob), at(p2, ob * 0.92), T, at(q2, -ib * 0.92), at(q1, -ib), B]);
}
module.exports.blade = blade;

// a leaf bent onto a cubic spine (base -> tip). The leaf is biconvex: across the spine its two
// edges sit at -wo(t) (outer side) and +wi(t) (inner side), with w(t) a leaf profile that is pointed
// at both ends and widest at `peak`. side = +1 puts the outer side on the left of the direction of
// travel. Edges are sampled densely and fitted with smooth curves.
const { paper } = require('./lib.cjs');
function bez3(p, t) {
  // a cubic chain [p0, c1, c2, p1, c1, c2, p2, ...]; t runs over the whole chain
  const segs = (p.length - 1) / 3, T = Math.min(segs - 1e-9, Math.max(0, t * segs)), k = Math.floor(T), s = T - k, u = 1 - s;
  const q = p.slice(3 * k, 3 * k + 4);
  return [0, 1].map((i) => u * u * u * q[0][i] + 3 * u * u * s * q[1][i] + 3 * u * s * s * q[2][i] + s * s * s * q[3][i]);
}
const profile = (peak = 0.42, e = 0.85) => (t) => {
  // rises from 0 at the base to 1 at `peak`, falls to 0 at the tip; sharp ends
  const u = t < peak ? t / peak : (1 - t) / (1 - peak);
  return Math.pow(Math.sin(Math.PI / 2 * Math.max(0, Math.min(1, u))), e);
};
function bentLeaf(spine, { w = [70, 40], peak = 0.42, e = 0.85, side = 1, n = 160, tol = 0.35 } = {}) {
  const prof = profile(peak, e), A = [], B = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, c = bez3(spine, t);
    const a = bez3(spine, Math.max(0, t - 1e-3)), b = bez3(spine, Math.min(1, t + 1e-3));
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy); dx /= l; dy /= l;
    const nl = [dy * side, -dx * side];             // outer normal
    const f = prof(t);
    A.push([c[0] + nl[0] * w[0] * f, c[1] + nl[1] * w[0] * f]);
    B.push([c[0] - nl[0] * w[1] * f, c[1] - nl[1] * w[1] * f]);
  }
  const path = new paper.Path({ segments: [...A, ...B.reverse().slice(1, -1)], closed: true, insert: false });
  path.simplify(tol);
  return path.reorient(true, true);
}
module.exports.bentLeaf = bentLeaf;
module.exports.bez3 = bez3;

// ---------- the three marks ----------
const { paper: P2 } = require('./lib.cjs');
const mirrorItem = (it) => { const c = it.clone({ insert: false }); c.scale(-1, 1, new P2.Point(0, 0)); return c; };
const flipSpine = (sp) => sp.map(([x, y]) => [-x, y]);
// tapering hairline (both ends pointed) along part of a spine, cut out of a leaf as its midrib
function rib(spine, t0, t1, w, shift = () => 0) {
  const n = 120, A = [], B = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * i / n, c = bez3(spine, t);
    const a = bez3(spine, Math.max(0, t - 1e-3)), b = bez3(spine, Math.min(1, t + 1e-3));
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy); dx /= l; dy /= l;
    // shift(t): how far the midrib sits from the spine towards the outer (left-hand) side
    const u = i / n, h = w / 2 * Math.pow(Math.sin(Math.PI * u), 0.5) * (1 - 0.55 * u), m = shift(t);
    const cx = c[0] + dy * m, cy = c[1] - dx * m;
    A.push([cx - dy * h, cy + dx * h]); B.push([cx + dy * h, cy - dx * h]);
  }
  const p = new P2.Path({ segments: [...A, ...B.reverse().slice(1, -1)], closed: true, insert: false });
  p.simplify(0.25);
  return p;
}

// I. LANCET — two leaves lean together; their tips meet at the apex and the space between them is a
// tall pointed arch. Each leaf carries a fine midrib.
const LANCET = { spine: [[-150, 0], [-200, -330], [-150, -700], [-6, -1000]], w: [95, 55], peak: 0.42, rib: { t0: 0.07, t1: 0.86, w: 10 } };
function lancet(o = {}) {
  const c = { ...LANCET, ...o };
  let l = bentLeaf(c.spine, { w: c.w, peak: c.peak });
  // the midrib runs down the middle of the blade (the blade bows further on the outer side)
  const prof = profile(c.peak, 0.85), mid = (t) => (c.w[0] - c.w[1]) / 2 * prof(t);
  if (c.rib) l = l.subtract(rib(c.spine, c.rib.t0, c.rib.t1, c.rib.w, mid), { insert: false });
  return { left: l.reorient(true, true), right: mirrorItem(l).reorient(true, true) };
}
// II. INTERLACE — the leaves lean in and cross just below the apex, one passing over the other with
// a fine gap, as in woven or carved interlace; the tips run on a little past the crossing.
const INTERLACE = { spine: [[-170, 0], [-250, -340], [-165, -750], [110, -995]], w: [88, 52], peak: 0.42, gap: 18 };
function interlace(o = {}) {
  const c = { ...INTERLACE, ...o };
  const left = bentLeaf(c.spine, { w: c.w, peak: c.peak });
  const halo = bentLeaf(c.spine, { w: [c.w[0] + c.gap, c.w[1] + c.gap], peak: c.peak });
  const right = bentLeaf(flipSpine(c.spine), { w: c.w, peak: c.peak, side: -1 }).subtract(halo, { insert: false });
  return { left: left.reorient(true, true), right: dropSpecks(right).reorient(true, true) };
}
// III. CONTRAST — a hairline leaf and a full leaf meet at the apex, thick and thin as in a
// high-contrast serif capital: the pair reads as a pointed arch, written rather than drawn.
const CONTRAST = { left: [[-165, 0], [-225, -330], [-160, -700], [-5, -1000]], right: [[175, 0], [245, -320], [175, -700], [5, -1000]], wl: [24, 14], wr: [105, 62], peak: 0.42 };
function contrast(o = {}) {
  const c = { ...CONTRAST, ...o };
  return { left: bentLeaf(c.left, { w: c.wl, peak: c.peak }), right: bentLeaf(c.right, { w: c.wr, peak: c.peak, side: -1 }) };
}
module.exports = { ...module.exports, lancet, interlace, contrast, LANCET, INTERLACE, CONTRAST, rib };
