// RAWZA — logo round 2: two logos built on the Concept A letterforms.
//   Logo 1  "Signature leaf": the R's tail ends in a leaf.
//   Logo 2  "Garden gate": two leaves cross to form a pointed arch around a lapis star.
const { shape, sub, union, inter, rect, poly } = require('./lib.cjs');
const CA = require('./concept-a.cjs');

// ---------- leaves
// straight almond leaf from base B to tip P, half-width w; bend curves it sideways
function leaf(B, P, w, o = {}) {
  const dx = P[0] - B[0], dy = P[1] - B[1], Ln = Math.hypot(dx, dy);
  const ux = dx / Ln, uy = dy / Ln, nx = -uy, ny = ux, bend = o.bend ?? 0;
  const at = (t, s) => [B[0] + ux * Ln * t + nx * s, B[1] + uy * Ln * t + ny * s];
  const f = (p) => p.map((v) => v.toFixed(2)).join(',');
  const c1 = at(0.28, w * 1.25 + bend), c2 = at(0.72, w * 1.05 + bend * 1.4);
  const c3 = at(0.72, -w * 1.05 + bend * 1.4), c4 = at(0.28, -w * 1.25 + bend);
  let s = shape(`M${f(B)} C${f(c1)} ${f(c2)} ${f(P)} C${f(c3)} ${f(c4)} ${f(B)} Z`);
  if (o.vein !== false) {
    const vw = o.vw ?? Math.max(2.5, w * 0.09);
    const v0 = at(0.1, bend * 0.25), v1 = at(0.82, bend * 0.9), m = at(0.5, bend * 0.75);
    s = sub(s, shape(`M${f([v0[0] - nx * vw, v0[1] - ny * vw])} Q${f([m[0] - nx * vw, m[1] - ny * vw])} ${f(v1)} Q${f([m[0] + nx * vw, m[1] + ny * vw])} ${f([v0[0] + nx * vw, v0[1] + ny * vw])} Z`));
  }
  return s;
}

function bez(p0, p1, p2, p3, t) {
  const m = 1 - t;
  return [0, 1].map((k) => m * m * m * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t * t * t * p3[k]);
}
// leaf whose midrib follows a cubic curve P; widest point set by skew
function curvedLeaf(P, Wmax, o = {}) {
  const N = 120, L = [], R = [], C = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = bez(...P, t), b = bez(...P, Math.min(1, t + 0.001)), c0 = bez(...P, Math.max(0, t - 0.001));
    const dx = b[0] - c0[0], dy = b[1] - c0[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const w = Wmax * Math.pow(Math.sin(Math.PI * Math.pow(t, o.skew ?? 0.85)), 0.9) / 2;
    L.push([a[0] + nx * w, a[1] + ny * w]); R.push([a[0] - nx * w, a[1] - ny * w]); C.push([a, nx, ny]);
  }
  let s = poly([...L, ...R.reverse()]);
  if (o.vein !== false) {
    const vw = o.vw ?? 2.4, VL = [], VR = [];
    for (let i = Math.round(N * 0.06); i <= Math.round(N * 0.9); i++) {
      const [a, nx, ny] = C[i], w = vw * (1 - Math.pow(i / N, 3) * 0.6);
      VL.push([a[0] + nx * w, a[1] + ny * w]); VR.push([a[0] - nx * w, a[1] - ny * w]);
    }
    s = sub(s, poly([...VL, ...VR.reverse()]));
  }
  return s;
}

// ---------- Logo 1: the Concept A R, leg ending in a leaf that rises under the A
function leafR() {
  const g = CA.make();
  const plain = g.R({ tail: false }).shape;
  const body = inter(plain, union([rect(-10, -10, 200, 710), rect(-10, -10, 470, 378)])); // stem + bowl only
  const leg = shape('M206,366 L372,620 C404,690 462,766 588,770 C668,773 728,768 778,757 L776,746 C724,755 666,757 608,754 C544,748 500,690 474,640 L302,352 Z');
  return { shape: union([body, leg, leaf([768, 754], [1010, 612], 40, { bend: -30, vw: 2.8 })]), adv: 470 };
}
function logo1Glyphs() {
  const g = CA.make();
  return { glyphs: [leafR(), g.A(), g.W(), g.Z(), g.A()], kern: g.kern };
}

// ---------- Logo 2: garden gate of two crossing leaves, lapis eight-point star inside
function gardenGate(o = {}) {
  const cx = 240, top = 0, base = 540, half = o.half ?? 238, wl = o.wl ?? 118, sk = o.skew ?? 0.74;
  const Lc = [[cx - half + 10, base], [cx - half - 26, base - 330], [cx - 112, top + 18], [cx + 44, top - 24]];
  const Rc = Lc.map(([x, y]) => [2 * cx - x, y]);
  const left = curvedLeaf(Lc, wl, { skew: sk, vw: 2.2 }), right = curvedLeaf(Rc, wl, { skew: sk, vw: 2.2 });
  // right leaf passes over the left: a hairline gap where they cross
  const halo = sub(curvedLeaf(Rc, wl + 14, { vein: false, skew: sk }), curvedLeaf(Rc, wl, { vein: false, skew: sk }));
  const stem = (s) => curvedLeaf([[cx + s * (half - 8), base - 4], [cx + s * (half - 10), base + 26], [cx + s * (half + 2), base + 50], [cx + s * (half + 26), base + 62]], 11, { vein: false, skew: 0.25 });
  const sy = o.sy ?? 300, R0 = o.star ?? 58;
  const oct = (r) => { const a = rect(cx - r * 0.7071, sy - r * 0.7071, cx + r * 0.7071, sy + r * 0.7071); const b = a.clone({ insert: false }); b.rotate(45, [cx, sy]); return union([a, b]); };
  const star = oct(R0), collar = sub(oct(R0 + 14), oct(R0 + 7));
  return { ground: union([sub(left, halo), right, collar, stem(-1), stem(1)]), star };
}

module.exports = { leaf, curvedLeaf, leafR, logo1Glyphs, gardenGate };
