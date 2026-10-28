// Potrace output of the symmetrised icon -> one clean, exactly mirror-symmetric compound path in
// reference-image pixel units.   node icon.cjs icon_trace.svg icon.json
const fs = require('fs');
const { paper, fix } = require('../lib.cjs');
const [, , src, out] = process.argv;
const [x0, y0, U] = JSON.parse(fs.readFileSync('icon_meta.json', 'utf8'));
const svg = fs.readFileSync(src, 'utf8');
const ds = [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, ' '));
let c = new paper.CompoundPath({ pathData: ds.join(' '), insert: false });
// potrace: translate(0,H) scale(0.1,-0.1)
const H = +svg.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/)[1];
c.transform(new paper.Matrix(0.1, 0, 0, -0.1, 0, H));
c.transform(new paper.Matrix(1 / U, 0, 0, 1 / U, x0, y0));
c = c.resolveCrossings().reorient(true, true);
const ax = +process.env.AXIS;
// the trace rounds off the sharp tips (arch apex, petal and leaf tips): where the outline turns more
// than 70 degrees within 1.5 px, cut 2.8 px either side and continue both flanks to where they meet
function sharpen(p) {
  const L = p.length, st = 0.04, n = Math.floor(L / st), pts = [];
  for (let i = 0; i < n; i++) pts.push(p.getPointAt(i * st));
  const at = (i) => pts[((i % n) + n) % n], w = Math.round(1.5 / st), a = Math.round(+(process.env.TIPA || 2.8) / st), t = Math.round(1.5 / st);
  const turn = pts.map((q, i) => Math.abs(q.subtract(at(i - w)).getDirectedAngle(at(i + w).subtract(q))));
  const tips = [];
  for (let i = 0; i < n; i++) if (turn[i] > +(process.env.TIPTURN || 70) && turn[i] >= turn[(i + 1) % n] && turn[i] >= turn[(i - 1 + n) % n]) tips.push(i);
  const keep = pts.map(() => true), put = [];
  for (const k of tips) {
    const P1 = at(k - a), d1 = P1.subtract(at(k - a - t)).normalize(), P2 = at(k + a), d2 = at(k + a + t).subtract(P2).normalize();
    const den = d1.x * -d2.y - d1.y * -d2.x; if (Math.abs(den) < 1e-6) continue;
    const r = P2.subtract(P1), u = (r.x * -d2.y - r.y * -d2.x) / den;   // P1 + u d1 = P2 - v d2
    if (u <= 0 || u > 6) continue;
    for (let j = k - a + 1; j < k + a; j++) keep[((j % n) + n) % n] = false;
    put.push([((k % n) + n) % n, P1.add(d1.multiply(u))]);
  }
  const out = [];
  pts.forEach((q, i) => { const tip = put.find(([k]) => k === i); if (tip) out.push(tip[1]); else if (keep[i]) out.push(q); });
  return [new paper.Path({ segments: out, closed: true, insert: false }), put.length];
}
c = new paper.CompoundPath({ children: c.children.map((k) => { const [s, m] = sharpen(k); console.log('tips sharpened', m); return s; }), insert: false });
const b = c.bounds;
const left = c.intersect(new paper.Path.Rectangle({ from: [b.left - 5, b.top - 5], to: [ax, b.bottom + 5], insert: false }), { insert: false });
// fewer, smoother anchor points: split each contour at its corners (tangent turns more than 25
// degrees, and every point on the mirror axis), refit each run between corners with paper's simplify
function clean(p, tol) {
  const segs = p.segments, n = segs.length, corner = [];
  for (let i = 0; i < n; i++) {
    const s = segs[i], tin = s.handleIn.isZero() ? s.point.subtract(s.previous.point) : s.handleIn.multiply(-1);
    const tout = s.handleOut.isZero() ? s.next.point.subtract(s.point) : s.handleOut;
    if (Math.abs(tin.getDirectedAngle(tout)) > 25 || Math.abs(s.point.x - ax) < 1e-3) corner.push(i);
  }
  if (!corner.length) corner.push(0);
  const out = new paper.Path({ insert: false, closed: true });
  corner.forEach((c, k) => {
    const e = corner[(k + 1) % corner.length], run = new paper.Path({ insert: false });
    for (let i = c; ; i = (i + 1) % n) { run.add(segs[i].clone()); if (i === e && run.segments.length > 1) break; }
    run.firstSegment.handleIn = null; run.lastSegment.handleOut = null;
    const onAxis = run.segments.every((s) => Math.abs(s.point.x - ax) < 1e-3);
    if (!onAxis && run.segments.length > 2) { run.scale(20, P0); run.flatten(0.5); run.simplify(tol * 20); run.scale(1 / 20, P0); }
    run.segments.forEach((s, j) => {
      if (j === 0 && out.segments.length) out.lastSegment.handleOut = s.handleOut;
      else if (!(k === corner.length - 1 && j === run.segments.length - 1)) out.add(s.clone());
      else out.firstSegment.handleIn = s.handleIn;
    });
  });
  return out;
}
const P0 = new paper.Point(0, 0);
const leftClean = new paper.CompoundPath({ children: (left.children || [left]).map((k) => clean(k, +(process.env.TOL || 0.12))), insert: false });
const right = leftClean.clone({ insert: false }); right.scale(-1, 1, new paper.Point(ax, 0));
let sym = leftClean.unite(right, { insert: false });
const kids = (sym.children || [sym]).filter((p) => Math.abs(p.area) > 0.5);
console.log('parts', kids.length, kids.map((p) => p.segments.length).join(','), 'bounds', sym.bounds.toString());
fs.writeFileSync(out, JSON.stringify({ d: fix(sym.pathData, 3), axis: ax }));
