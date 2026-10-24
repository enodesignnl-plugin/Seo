// Outline edits shared by both concepts
const { poly, rect, union, sub, inter, fillet, lineX, along } = require('./lib.cjs');

// offset a line (two points) by d along its normal, towards point `to`
function shiftLine([p0, p1], d, to) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy);
  let nx = -dy / L, ny = dx / L;
  if ((to[0] - p0[0]) * nx + (to[1] - p0[1]) * ny < 0) { nx = -nx; ny = -ny; }
  return [[p0[0] + nx * d, p0[1] + ny * d], [p1[0] + nx * d, p1[1] + ny * d]];
}

// remove zero-area leftovers of boolean operations
function dropSpecks(s) {
  if (!s.children) return s;
  s.children.slice().forEach((k) => { if (Math.abs(k.area) < 1) k.remove(); });
  return s.children.length === 1 ? s.children[0].clone({ insert: false }) : s;
}

// Z/z: rebuild the diagonal t units thinner (measured square to the stroke), half from each edge.
// The diagonal's two long straight edges are found in the outline: U (upper left) and L (lower right).
// top: y of the top bar's upper edge; inset: how far the font's edges start inside the bars (joint fillets);
// r: fillet radius at the two inner joints (0 = sharp, as drawn in the font).
function thinDiagonal(shape, o) {
  const { t, r = 0, top, inset = 0 } = o;
  const kid = shape.children ? shape.children[0] : shape;
  const edges = kid.curves
    .filter((c) => !c.hasHandles() && Math.abs(c.point2.y - c.point1.y) > 0.5 * (700 - top))
    .map((c) => [[c.point1.x, c.point1.y], [c.point2.x, c.point2.y]].sort((a, b) => a[1] - b[1]))
    .sort((a, b) => lineX(...a)((top + 700) / 2) - lineX(...b)((top + 700) / 2));
  if (edges.length !== 2) throw new Error('thinDiagonal: expected two diagonal edges, found ' + edges.length);
  const [U, L] = edges;
  const Ux = lineX(...U), Lx = lineX(...L);
  const U2x = lineX(...shiftLine(U, t / 2, L[0])), L2x = lineX(...shiftLine(L, t / 2, U[0]));
  const yT = U[0][1] - inset, yB = L[1][1] + inset, e = inset ? 5 : 0.5;
  const D = poly([[Ux(top - 100) - e, top - 100], [Lx(top - 100) + e, top - 100], [Lx(800) + e, 800], [Ux(800) - e, 800]]);
  const parts = [
    sub(shape, D),
    poly([[Ux(top) - e, top], [L2x(top), top], [L2x(yT), yT], [Ux(yT) - e, yT]]),
    poly([[U2x(yB), yB], [Lx(yB) + e, yB], [Lx(700) + e, 700], [U2x(700), 700]]),
    poly([[U2x(top), top], [L2x(top), top], [L2x(700), 700], [U2x(700), 700]]),
  ];
  if (r) {
    const ct = [U2x(yT), yT], cb = [L2x(yB), yB];
    parts.push(fillet(ct, [ct[0] - r, yT], along(ct, [U2x(yT + 100), yT + 100], r)));
    parts.push(fillet(cb, [cb[0] + r, yB], along(cb, [L2x(yB - 100), yB - 100], r)));
  }
  // keep the font's horizontal extent (its vertical cuts at the bar ends)
  const b = shape.bounds;
  return dropSpecks(inter(union(parts), rect(b.x, -1000, b.x + b.width, 2000)));
}

// Draw a terminal out further: below yMin, points between x0 and x1 move right in proportion
// (0 at x0, L at x1), points beyond x1 move the full L. Handles follow the local stretch, so the
// font's own curves are kept and only lengthened; vertical stroke thickness does not change.
function stretchX(shape, { x0, x1, L, yMin }) {
  const out = shape.clone({ insert: false });
  const k = L / (x1 - x0);
  const kids = out.children ? out.children : [out];
  for (const p of kids) for (const sg of p.segments) {
    const { x, y } = sg.point;
    if (y < yMin || x <= x0) continue;
    const t = Math.min(1, (x - x0) / (x1 - x0));
    sg.point = sg.point.add([L * t, 0]);
    if (x < x1) { sg.handleIn = sg.handleIn.multiply([1 + k, 1]); sg.handleOut = sg.handleOut.multiply([1 + k, 1]); }
  }
  return out;
}

module.exports = { shiftLine, dropSpecks, thinDiagonal, stretchX };
