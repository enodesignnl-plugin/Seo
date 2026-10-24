// Optical spacing: the white area between neighbouring letters is measured row by row,
// with deep counters clamped (as in HT Letterspacer), and every pair gets the same mean gap.
const { paper } = require('./lib.cjs');

function profile(item, y0, y1, step = 6) {
  const rows = [];
  for (let y = y0; y <= y1; y += step) {
    const line = new paper.Path.Line({ from: [-5000, y], to: [5000, y], insert: false });
    const xs = item.getIntersections(line).map((c) => c.point.x);
    rows.push(xs.length ? { min: Math.min(...xs), max: Math.max(...xs) } : null);
  }
  return rows;
}
// position glyphs so each pair has mean clamped gap `gap`; extra[i] adds a manual tweak before glyph i;
// minGap may be a number or an array per glyph (null = joined pair, no collision guard)
function space(glyphs, o) {
  const { y0, y1, depth, gap, minGap = 0, extra = [], step = 6 } = o;
  const P = glyphs.map((g) => {
    const b = g.shape.bounds, rows = profile(g.shape, y0, y1, step);
    return {
      right: rows.map((r) => Math.max(r ? r.max : -Infinity, b.x + b.width - depth)),
      left: rows.map((r) => Math.min(r ? r.min : Infinity, b.x + depth)),
      rawR: rows.map((r) => (r ? r.max : -Infinity)), rawL: rows.map((r) => (r ? r.min : Infinity)),
    };
  });
  const pos = [0];
  for (let i = 1; i < glyphs.length; i++) {
    const L = P[i - 1].right, R = P[i].left;
    const mean = R.reduce((a, v, j) => a + (v - L[j]), 0) / R.length;
    // never let ink come closer than minGap on any row (serifs, beaks)
    const mg = Array.isArray(minGap) ? minGap[i] : minGap;
    const collide = mg === null ? -Infinity : Math.max(...P[i].rawL.map((v, j) => P[i - 1].rawR[j] - v).filter(Number.isFinite)) + mg;
    pos[i] = pos[i - 1] + Math.max(gap - mean, collide) + (extra[i] || 0);
  }
  return pos;
}
module.exports = { profile, space };
