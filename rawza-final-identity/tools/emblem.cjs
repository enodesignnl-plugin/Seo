// Round 2 symbols: an ogee arch frame (after the client's reference logo), an eight-petal rosette,
// and combinations with the leaf marks and the swash R. Units: about 1000 high, base at y = 0.
const { paper, shape, union, sub, translate, scale } = require('./lib.cjs');
const { dropSpecks } = require('./edit.cjs');
const L = require('./leafmark.cjs');
const f = (p) => p.map((n) => +n.toFixed(2)).join(',');
const P = (x, y) => new paper.Point(x, y);

// closed symmetric outline from a right-half cubic chain running from the top point to the bottom
// point (both on x = 0)
function symmetric(half) {
  const left = half.map(([x, y]) => [-x, y]).reverse();
  let d = `M${f(half[0])}`;
  for (let i = 1; i < half.length; i += 3) d += ` C${f(half[i])} ${f(half[i + 1])} ${f(half[i + 2])}`;
  for (let i = 1; i < left.length; i += 3) d += ` C${f(left[i])} ${f(left[i + 1])} ${f(left[i + 2])}`;
  return shape(d + ' Z').reorient(true, true);
}
// ogee arch medallion: a finial point on top, an ogee curve into the shoulders, a small cusp at
// the widest point, and a long curve down to a point at the bottom
const OGEE = [
  [0, -1000], [14, -965], [34, -935], [78, -892],
  [170, -805], [262, -705], [268, -575],
  [270, -520], [258, -500], [256, -492],
  [258, -484], [270, -462], [270, -410],
  [266, -250], [140, -120], [0, 0],
];
function ogee(o = {}) {
  const { w = 16, half = OGEE } = o;
  const outer = symmetric(half);
  const b = outer.bounds;
  // the inner edge: the outline drawn in by `w` at the sides and a little less at the points, so
  // the line swells on the shoulders and fines at the finial, like a drawn line
  const inner = outer.clone({ insert: false });
  inner.scale((b.width - 2 * w) / b.width, (b.height - 2 * w * 1.4) / b.height, b.center);
  return { outer, frame: dropSpecks(sub(outer, inner)), inner };
}
// eight-petal rosette: four long petals on the axes, four shorter between, a small open centre
function rosette(o = {}) {
  const { r = 300, r2 = 0.72, w = [44, 44], w2 = [34, 34], hole = 70, peak = 0.45, seed = 34 } = o;
  // each petal starts clear of the centre, so the eight stay separate around the seed
  const petal = (len, ww) => L.bentLeaf([[0, -hole], [0, -hole - (len - hole) * 0.33], [0, -hole - (len - hole) * 0.67], [0, -len]], { w: ww, peak, e: 0.8 });
  const parts = [];
  for (let i = 0; i < 8; i++) {
    const p = petal(i % 2 ? r * r2 : r, i % 2 ? w2 : w);
    p.rotate(i * 45, P(0, 0));
    parts.push(p);
  }
  let s = union(parts);
  if (seed) s = union([s, new paper.Path.Circle({ center: [0, 0], radius: seed, insert: false })]);
  return dropSpecks(s);
}
module.exports = { symmetric, ogee, rosette, OGEE };
