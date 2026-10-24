// Geometry helpers on top of paper.js boolean ops
const paper = require('paper-jsdom');
paper.setup(new paper.Size(4000, 2000));
const { Point, Path, CompoundPath } = paper;

const P = (x, y) => new Point(x, y);
function poly(pts) {
  const p = new Path({ segments: pts.map(([x, y]) => P(x, y)), closed: true, insert: false });
  if (!p.clockwise) p.reverse();
  return p;
}
function rect(x0, y0, x1, y1) { return poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]); }
function shape(d) {
  const c = new CompoundPath({ pathData: d, insert: false });
  return c;
}
function circle(cx, cy, r) { return new Path.Circle({ center: [cx, cy], radius: r, insert: false }); }
function union(list) {
  let acc = list[0];
  for (let i = 1; i < list.length; i++) acc = acc.unite(list[i], { insert: false });
  return acc;
}
function sub(a, b) { return a.subtract(b, { insert: false }); }
function inter(a, b) { return a.intersect(b, { insert: false }); }
// concave bracket/fillet occupying the corner at C between rays towards A and B
function fillet(C, A, B) {
  return shape(`M${A[0]},${A[1]} Q${C[0]},${C[1]} ${B[0]},${B[1]} L${C[0]},${C[1]} Z`);
}
// line through two points -> x at y
function lineX(p0, p1) { return (y) => p0[0] + (p1[0] - p0[0]) * (y - p0[1]) / (p1[1] - p0[1]); }
// point along a line at distance d from point (moving towards target)
function along(from, to, d) {
  const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy);
  return [from[0] + dx / L * d, from[1] + dy / L * d];
}
function translate(item, dx, dy) { const c = item.clone({ insert: false }); c.translate(P(dx, dy)); return c; }
function scale(item, s, cx = 0, cy = 0) { const c = item.clone({ insert: false }); c.scale(s, P(cx, cy)); return c; }
function fix(s, prec) { return s.replace(/-?\d*\.\d+/g, (m) => String(+(+m).toFixed(prec))); }
function bounds(item) { const b = item.bounds; return { x: b.x, y: b.y, w: b.width, h: b.height }; }

module.exports = { paper, P, poly, rect, shape, circle, union, sub, inter, fillet, lineX, along, translate, scale, fix, bounds };
