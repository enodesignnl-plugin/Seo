// A broad-nib (qalam) stroke: the nib, a line of width w held at a fixed angle, is swept along a
// centre line; the outline is the ribbon traced by the nib's two ends. Thick and thin come from
// the direction of travel against the nib angle, as in pen calligraphy — not from drawn contours.
//   stroke(points, { nib, angle, pressure, samples }) -> paper item
// points: cubic Bézier chain [[x,y], [c1x,c1y], [c2x,c2y], [x,y], ...] (3n+1 points)
// pressure(t): 0..1 multiplier of the nib width along the stroke (t from 0 to 1)
const { paper } = require('./lib.cjs');

function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
}
function centre(points, n) {
  const segs = (points.length - 1) / 3, out = [];
  for (let i = 0; i <= n; i++) {
    const T = (i / n) * segs, k = Math.min(segs - 1, Math.floor(T)), t = T - k;
    out.push(bez(points[3 * k], points[3 * k + 1], points[3 * k + 2], points[3 * k + 3], t));
  }
  return out;
}
function stroke(points, o = {}) {
  const { nib = 80, angle = -32, pressure = () => 1, samples = 400 } = o;
  const a = (angle * Math.PI) / 180, nx = Math.cos(a), ny = Math.sin(a);
  const c = centre(points, samples);
  // the two edges of the ribbon traced by the nib's ends; while the direction of travel never runs
  // parallel to the nib (it only does so at the exit, where the ribbon closes to a point) this is
  // the exact outline of the stroke
  const left = [], right = [];
  c.forEach(([x, y], i) => {
    const w = (nib * pressure(i / samples)) / 2;
    left.push([x + nx * w, y + ny * w]); right.push([x - nx * w, y - ny * w]);
  });
  const path = new paper.Path({ segments: [...left, ...right.reverse()], closed: true, insert: false });
  path.simplify(o.tolerance ?? 0.6);
  // if the exit ran a little past the nib angle the edges cross just before the tip and leave a
  // tiny loop; the stroke is one piece, so keep the largest part
  const s = path.resolveCrossings().reorient(true, true);
  if (!s.children) return s;
  return s.children.reduce((a, k) => (Math.abs(k.area) > Math.abs(a.area) ? k : a)).clone({ insert: false });
}

module.exports = { stroke, centre };
