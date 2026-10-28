// strokes.json (source px) -> one clean compound path, 10 units per source pixel
const fs = require('fs');
const { paper, union, fix } = require('../lib.cjs');
const S = 10, O = 0.5, F = +(process.env.F || 0.8), st = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const parts = {};
for (const [k, { c, w, n, cap }] of Object.entries(st)) {
  const L = [], R = [];
  for (let i = 0; i < c.length; i++) {
    const h = w[i] / 2;
    L.push([(c[i][0] + O + n[i][0] * h) * S, (c[i][1] + O + n[i][1] * h) * S]);
    R.push([(c[i][0] + O - n[i][0] * h) * S, (c[i][1] + O - n[i][1] * h) * S]);
  }
  // pointed ends: the outline closes at the centre line, one step past the last sample
  const ext = (i, j) => [(2 * c[i][0] - c[j][0] + O) * S, (2 * c[i][1] - c[j][1] + O) * S];
  // round end: a half circle from the left edge to the right edge around the last sample
  const e = c.length - 1, arc = [];
  if (cap && cap[1]) {
    const h = w[e] / 2, a0 = Math.atan2(n[e][1], n[e][0]), tx = c[e][0] - c[e - 1][0], ty = c[e][1] - c[e - 1][1];
    const side = Math.sign(n[e][0] * ty - n[e][1] * tx) || 1;   // turn through the forward direction
    for (let i = 1; i < 24; i++) { const a = Math.PI * i / 24, u = Math.cos(a), v = Math.sin(a) * F, tl = Math.hypot(tx, ty);
      // elliptical end: half the width across, F times that along the stroke
      arc.push([(c[e][0] + O + (n[e][0] * u + tx / tl * v) * h) * S, (c[e][1] + O + (n[e][1] * u + ty / tl * v) * h) * S]); }
  } else if (k !== 'stem') arc.push(ext(e, e - 1));
  const pts = [ext(0, 1), ...L, ...arc, ...R.reverse()];
  let p = new paper.Path({ segments: pts, closed: true, insert: false });
  p.simplify(+process.argv[4] || 1.2);
  parts[k] = p.resolveCrossings().reorient(true, true);
}
let all = union(Object.values(parts));
// pinholes left where the pieces meet
if (all.children) for (const ch of all.children.slice()) if (Math.abs(ch.area) < 200) ch.remove();
if (all.children && all.children.length === 1) all = all.children[0].clone({ insert: false });
fs.writeFileSync(process.argv[3], JSON.stringify({ d: fix(all.pathData, 2), parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, fix(v.pathData, 2)])) }));
const segs = (all.children || [all]).reduce((s, c) => s + c.segments.length, 0);
console.log('contours', all.children ? all.children.length : 1, 'segments', segs, 'bounds', JSON.stringify(all.bounds).slice(0, 120));
