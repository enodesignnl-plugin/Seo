// Potrace output -> clean outline in reference pixels (called by trace.py).
//   node trace.cjs <potrace.svg> '<meta json>' <out.json>
// meta: x0, y0, up (the potrace bitmap's origin and scale), axis (mirror x or null), tol, tipTurn, tipCut
const fs = require('fs');
const { paper, P, fix, kids } = require('./common.cjs');
const [, , src, metaJson, out] = process.argv;
const M = JSON.parse(metaJson);
const svg = fs.readFileSync(src, 'utf8');
const ds = [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, ' '));
if (!ds.length) throw new Error('potrace found nothing: check the box and --threshold');
let c = new paper.CompoundPath({ pathData: ds.join(' '), insert: false });
const H = +svg.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/)[1];
c.transform(new paper.Matrix(0.1, 0, 0, -0.1, 0, H));            // potrace: translate(0,H) scale(0.1,-0.1)
c.transform(new paper.Matrix(1 / M.up, 0, 0, 1 / M.up, M.x0, M.y0));
c = c.resolveCrossings().reorient(true, true);
const ax = M.axis;
const onAxis = (pt) => ax != null && Math.abs(pt.x - ax) < 1e-3;

// The trace rounds off sharp tips. Where the outline turns more than tipTurn degrees within
// 1.5 px, cut tipCut px either side and continue both flanks (their direction over the next
// 1.5 px) to where they meet. Works on a fine polyline; clean() refits it afterwards.
function sharpen(p) {
  const st = 0.04, n = Math.floor(p.length / st), pts = [];
  for (let i = 0; i < n; i++) pts.push(p.getPointAt(i * st));
  const at = (i) => pts[((i % n) + n) % n], w = Math.round(1.5 / st), a = Math.round(M.tipCut / st), t = Math.round(1.5 / st);
  const turn = pts.map((q, i) => Math.abs(q.subtract(at(i - w)).getDirectedAngle(at(i + w).subtract(q))));
  const put = new Map(), keep = pts.map(() => true);
  if (M.tipTurn > 0) for (let k = 0; k < n; k++) {
    if (!(turn[k] > M.tipTurn && turn[k] >= turn[(k + 1) % n] && turn[k] >= turn[(k - 1 + n) % n])) continue;
    const P1 = at(k - a), d1 = P1.subtract(at(k - a - t)).normalize(), P2 = at(k + a), d2 = at(k + a + t).subtract(P2).normalize();
    const den = d1.x * -d2.y - d1.y * -d2.x; if (Math.abs(den) < 1e-6) continue;
    const r = P2.subtract(P1), u = (r.x * -d2.y - r.y * -d2.x) / den;
    if (u <= 0 || u > 6) continue;   // flanks that do not meet close by: leave the tip as traced
    for (let j = k - a + 1; j < k + a; j++) keep[((j % n) + n) % n] = false;
    put.set(k, P1.add(d1.multiply(u)));
  }
  const seg = [];
  pts.forEach((q, i) => { if (put.has(i)) seg.push(put.get(i)); else if (keep[i]) seg.push(q); });
  return [new paper.Path({ segments: seg, closed: true, insert: false }), put.size];
}
// Split a contour at its corners (tangent turn > 25 degrees, and points on the mirror axis), refit
// each run between corners with paper's simplify at tolerance tol (source pixels).
function clean(p, tol) {
  const segs = p.segments, n = segs.length, corner = [];
  for (let i = 0; i < n; i++) {
    const s = segs[i], tin = s.handleIn.isZero() ? s.point.subtract(s.previous.point) : s.handleIn.multiply(-1);
    const tout = s.handleOut.isZero() ? s.next.point.subtract(s.point) : s.handleOut;
    if (Math.abs(tin.getDirectedAngle(tout)) > 25 || onAxis(s.point)) corner.push(i);
  }
  if (!corner.length) corner.push(0);
  const res = new paper.Path({ insert: false, closed: true }), O = P(0, 0);
  corner.forEach((cI, k) => {
    const e = corner[(k + 1) % corner.length], run = new paper.Path({ insert: false });
    for (let i = cI; ; i = (i + 1) % n) { run.add(segs[i].clone()); if (i === e && run.segments.length > 1) break; }
    run.firstSegment.handleIn = null; run.lastSegment.handleOut = null;
    if (!run.segments.every((s) => onAxis(s.point)) && run.segments.length > 2) {
      run.scale(20, O); run.flatten(0.5); run.simplify(tol * 20); run.scale(1 / 20, O);
    }
    run.segments.forEach((s, j) => {
      if (j === 0 && res.segments.length) res.lastSegment.handleOut = s.handleOut;
      else if (!(k === corner.length - 1 && j === run.segments.length - 1)) res.add(s.clone());
      else res.firstSegment.handleIn = s.handleIn;
    });
  });
  return res;
}
let tips = 0;
c = new paper.CompoundPath({ children: kids(c).map((k) => { const [s, m] = sharpen(k); tips += m; return s; }), insert: false });
let result;
if (ax != null) {
  const b = c.bounds;
  const left = c.intersect(new paper.Path.Rectangle({ from: [b.left - 5, b.top - 5], to: [ax, b.bottom + 5], insert: false }), { insert: false });
  const L = new paper.CompoundPath({ children: kids(left).map((k) => clean(k, M.tol)), insert: false });
  const R = L.clone({ insert: false }); R.scale(-1, 1, P(ax, 0));
  result = L.unite(R, { insert: false });
} else {
  result = new paper.CompoundPath({ children: kids(c).map((k) => clean(k, M.tol)), insert: false }).reorient(true, true);
}
const parts = kids(result).filter((p) => Math.abs(p.area) > 0.05);
console.log(`traced: ${parts.length} contours, ${parts.map((p) => p.segments.length).join('+')} anchor points, ${tips} tips sharpened, box ${result.bounds.toString()}`);
fs.writeFileSync(out, JSON.stringify({ kind: 'trace', d: fix(result.pathData, 3), axis: ax }));
