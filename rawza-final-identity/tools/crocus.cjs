// The saffron crocus icon (refinement round): three slender leaves cupped around the base and,
// rising from between them, the three stigma threads that are the spice, each ending in a small
// drop. Leaves and threads are separate groups so the threads can carry the saffron colour.
// Units: about 330 high; the base of the leaves is at (0, 0), the icon points up.
const { paper, union, circle } = require('./lib.cjs');
const { dropSpecks } = require('./edit.cjs');

function bez(p, t) {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]);
}
// a stroke of width w(t) laid symmetrically about a cubic centre line (a brush, not a broad nib)
function brush(p, w, n = 160) {
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
// leaf: pointed at both ends, widest a little below the middle
const leafW = (wmax) => (t) => wmax * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.9);

function icon(o = {}) {
  const lw = o.leaf ?? 28, sw = o.side ?? 34, th = o.thread ?? 5, dot = o.dot ?? 8.5;
  const H = o.h ?? 150, sx = o.sx ?? 62, sy = o.sy ?? 128;   // centre leaf height, side leaf tip
  const leaves = [
    brush([[0, 0], [-3, -H * 0.35], [-3, -H * 0.7], [0, -H]], leafW(lw)),
    brush([[-5, 2], [-sx * 0.7, -sy * 0.18], [-sx * 1.08, -sy * 0.55], [-sx, -sy]], leafW(sw)),
    brush([[5, 2], [sx * 0.7, -sy * 0.18], [sx * 1.08, -sy * 0.55], [sx, -sy]], leafW(sw)),
  ];
  // the threads rise from the tip of the centre leaf and fan out a little
  const y0 = -H + 12, top = o.top ?? -310, fx = o.fx ?? 40, fy = o.fy ?? -288;
  const T = [
    [[0, y0], [0, y0 - 50], [0, top + 60], [0, top]],
    [[-1, y0], [-3, y0 - 60], [-fx * 0.6, fy + 50], [-fx, fy]],
    [[1, y0], [3, y0 - 60], [fx * 0.6, fy + 50], [fx, fy]],
  ];
  const threads = T.map((p) => {
    const end = p[3], c2 = p[2], L = Math.hypot(end[0] - c2[0], end[1] - c2[1]);
    // the drop at the tip sits a little along the thread's direction, so the line runs into it
    const d = [(end[0] - c2[0]) / L, (end[1] - c2[1]) / L];
    return union([brush(p, (t) => th * (0.7 + 0.3 * t)), circle(end[0] + d[0] * dot * 0.4, end[1] + d[1] * dot * 0.4, dot)]);
  });
  return { leaves: dropSpecks(union(leaves)), threads: dropSpecks(union(threads)) };
}
module.exports = { icon };
