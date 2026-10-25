// The concept B symbol: a tulip bud — two petals cupped around an opening, on a stem written with
// the same broad nib (-28°) as the R's leg, so the stem thins into the same hairline.
// The tulip (lāla) grows wild across Afghanistan and is the flower of the Nowruz festival in
// Mazar-i-Sharif; here it is kept to a closed bud, without ornament.
// Units: the bud's base (where the petals meet the stem) is at (0, 0); it points up, about 340 high.
const { paper, union, translate, shape } = require('./lib.cjs');
const { dropSpecks } = require('./edit.cjs');
const { stroke } = require('./qalam.cjs');

function bez(p, t) {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]);
}
// a stroke of width w(t) laid symmetrically about a cubic centre line
function brush(p, w, n = 200) {
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = bez(p, Math.max(0, t - 1e-3)), b = bez(p, Math.min(1, t + 1e-3)), c = bez(p, t);
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), h = w(t) / 2;
    L.push([c[0] - dy / l * h, c[1] + dx / l * h]); R.push([c[0] + dy / l * h, c[1] - dx / l * h]);
  }
  const path = new paper.Path({ segments: [...L, ...R.reverse()], closed: true, insert: false });
  path.simplify(0.25);
  return path;
}
// petal: pointed at both ends, widest a little below the middle
// foot: width kept at the base, so the two petals overlap there and close into one rounded foot
const petalW = (wmax, pk = 0.8, foot = 0) => (t) => {
  const w = wmax * Math.pow(Math.sin(Math.PI * Math.pow(t, pk)), 0.85);
  return t < 0.5 ? Math.max(w, foot * (1 - t / 0.5) ** 2 + w * 0) : w;
};

const DEF = {
  left: [[0, 0], [-80, -60], [-110, -220], [-20, -330]], wl: 70,
  right: [[4, 0], [80, -50], [100, -200], [30, -300]], wr: 60,
  stem: [[0, 0], [-2, 60], [-4, 95], [-18, 135]], nib: 16, thin: 0.9, sx: 1.12,
  fold: { p: [[0, -104], [2, -50], [20, -20], [50, -6]], w: 7, peak: 0.3, end: 0.15 },
  cup: 26,
};
function bud(opts = {}) {
  const o = { ...DEF, ...opts };
  const petals = [brush(o.left, petalW(o.wl, 0.8, o.foot || 0)), brush(o.right, petalW(o.wr, 0.8, o.foot || 0))];
  // the petals' two pointed bases are joined by a small cup, so they sit on the stem as one flower
  if (o.cup) petals.push(brush([[0, 26], [0, 10], [0, -14], [0, -o.cup - 20]], (t) => o.cup * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.7)));
  const parts = [union(petals)];
  if (o.stem) parts.push(stroke(o.stem, { nib: o.nib, angle: -28, pressure: (t) => 1 - o.thin * Math.pow(t, 0.8), tolerance: 0.4 }));
  return dropSpecks(union(parts));
}
// the bud drawn as one contour, as it would be drawn by hand: B the foot, TL/TR the petal tips,
// O the bottom of the opening between the petals; every curve is a smooth cubic
const f = (p) => p.map((n) => +n.toFixed(2)).join(',');
function body(k) {
  const d = (pts) => pts.map((p) => f(p)).join(' ');
  const c = k.pts;
  return shape(`M${f(c.B)} C${d(c.lo1)} ${f(c.P1)} C${d(c.lo2)} ${f(c.TL)} C${d(c.li1)} ${f(c.P2)} C${d(c.li2)} ${f(c.O)} `
    + `C${d(c.ri1)} ${f(c.P3)} C${d(c.ri2)} ${f(c.TR)} C${d(c.ro1)} ${f(c.P4)} C${d(c.ro2)} ${f(c.B)} Z`).reorient(true, true);
}
const BODY = {
  B: [0, 10], lo1: [[-58, 8], [-96, -70]], P1: [-98, -190], lo2: [[-100, -280], [-80, -345]], TL: [-46, -392],
  li1: [[-52, -330], [-42, -262]], P2: [-27, -200], li2: [[-14, -148], [-4, -112]], O: [0, -90],
  ri1: [[4, -110], [16, -150]], P3: [26, -210], ri2: [[36, -270], [44, -320]], TR: [48, -368],
  ro1: [[78, -325], [94, -262]], P4: [94, -185], ro2: [[94, -70], [56, 8]],
};
function bud2(opts = {}) {
  const o = { ...DEF, ...opts };
  let bd = body({ pts: { ...BODY, ...(o.body || {}) } });
  if (o.sx && o.sx !== 1) bd.scale(o.sx, 1, new paper.Point(0, 0));
  // o.fold: the line where one petal overlaps the other, cut as a tapering hairline
  // { p: cubic centre line from the bottom of the opening down, w: [width at top, width at end] }
  if (o.fold) {
    // swelling from a point inside the opening to its widest, then thinning out at the edge
    const { w, peak = 0.3, end = 0.15 } = o.fold;
    const fp = o.fold.p.map(([x, y]) => [x * (o.sx || 1), y]);
    bd = bd.subtract(brush(fp, (t) => w * (t < peak ? Math.sin(Math.PI / 2 * t / peak) ** 0.6 : 1 - (1 - end) * ((t - peak) / (1 - peak)) ** 1.2)), { insert: false });
  }
  const parts = [bd];
  if (o.stem) parts.push(stroke(o.stem, { nib: o.nib, angle: o.pen ?? -28, pressure: (t) => 1 - o.thin * Math.pow(t, 0.8), tolerance: 0.4 }));
  // optional leaf on the stem: { p: centre line (cubic), w: widest }
  if (o.leaf) parts.push(brush(o.leaf.p, petalW(o.leaf.w, 0.75)));
  return dropSpecks(union(parts));
}
module.exports = { bud, bud2, body, BODY, brush, DEF };
