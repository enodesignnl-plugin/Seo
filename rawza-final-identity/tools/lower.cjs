// TITLE-CASE VARIANT  ·  Rawza
// Built from the approved release (direction A): the same R with its broad-nib leg, followed by
// the lowercase a, w, z, a of the same Cormorant Garamond instance (wght 420). The details of the
// release carry over to the lowercase:
//  w  the font's lowercase w already ends the left V's hairline inside the right V's heavy stroke
//     (the construction the capital W was given); the join gets the same soft brackets as the W,
//     and the right V's inner serif is trimmed along its own edge, as in the W.
//  z  the flag at the top left and the beak at the bottom right are drawn in with the same smooth
//     warps as the capital Z.
//  R  the release R; its tail now runs under the first a, as the leg of a title-case R.
// Units: cap height 700, baseline y = 700; x-height line at y = F.xHeight (about 268).
const { poly, rect, union, sub, translate, fillet, along } = require('./lib.cjs');
const { space } = require('./spacing.cjs');
const { dropSpecks, warp } = require('./edit.cjs');
const royal = require('./royal.cjs');

const F = royal.F;
const XH = F.xHeight;
function nearest(path, x, y) {
  let best = 0, bd = Infinity;
  path.segments.forEach((q, i) => { const d = Math.hypot(q.point.x - x, q.point.y - y); if (d < bd) { bd = d; best = i; } });
  const p = path.segments[best].point;
  return [p.x, p.y];
}
const smooth = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };

function a() { const g = F.glyph('a'); return { shape: g.shape, adv: g.adv }; }

// w: join brackets (`round` above the join, `flow` [along the hairline, along the heavy stroke]
// below it) and the trimmed inner serif, read from the font's own outline
function w(o = {}) {
  const g = F.glyph('w');
  const c = g.shape.children ? g.shape.children[0] : g.shape;
  const pt = (x, y) => nearest(c, x, y);
  let s = g.shape;
  const C1 = pt(359, 399), C2 = pt(371, 427), L0 = pt(340, 361), H1 = pt(271, 611), H2 = pt(258, 699), B2 = pt(498, 699);
  if (o.round) s = union([s, fillet(C1, along(C1, L0, o.round), along(C1, H1, o.round))]);
  if (o.flow) s = union([s, fillet(C2, along(C2, H2, o.flow[0]), along(C2, B2, o.flow[1]))]);
  if (o.serif) {
    // the heavy stroke's left edge, continued straight up to the x-height: the serif's inner half goes
    const p0 = C1, p1 = L0, Lx = (y) => p0[0] + (p1[0] - p0[0]) * (y - p0[1]) / (p1[1] - p0[1]);
    s = sub(s, poly([[Lx(p1[1] + 1), p1[1] + 1], [Lx(XH - 20), XH - 20], [220, XH - 20], [220, p1[1] + 1]]));
  }
  return { shape: dropSpecks(s), adv: g.adv };
}

// z: flag (top left) and beak (bottom right) drawn in, as in the capital Z
function z(o = {}) {
  const g = F.glyph('z');
  let s = g.shape;
  if (o.soft) {
    // the flag rises `up` less above the x-height and hangs `down` less far below the bar
    const { up = 0.6, down = 0.55 } = o.soft, top = XH, H = 170;
    const k = (x) => smooth((150 - x) / 80);
    s = warp(s, (x, y) => {
      if (y > top + H) return [x, y];
      const t = k(x), v = y - top;
      return [x, top + (v < 0 ? v * (1 - up * t) : v - down * t * v * (1 - v / H))];
    });
  }
  if (o.foot) {
    const kx = (x) => smooth((x - 330) / 60), ky = (y) => smooth((y - 540) / 90);
    s = warp(s, (x, y) => [x, y + o.foot * kx(x) * ky(y) * (700 - y)]);
  }
  return { shape: dropSpecks(s), adv: g.adv };
}

function minDistance(A, B, y0) { return royal.minDistance(A, B, y0); }

const FINAL = {
  gap: 128, extra: [0, 0, 0, 0, 0], reach: 360,
  w: { round: 20, flow: [44, 22], serif: true },
  z: { soft: { up: 0.6, down: 0.55 }, foot: 0.32 },
};
function set(opts) {
  const o = { ...FINAL, ...(opts || {}) };
  const A = a(), Rb = royal.F.glyph('R');
  const glyphs = [
    { id: 'letter-R', shape: Rb.shape, adv: Rb.adv }, { id: 'letter-a-1', ...A }, { id: 'letter-w', ...w(o.w) },
    { id: 'letter-z', ...z(o.z) }, { id: 'letter-a-2', shape: A.shape.clone({ insert: false }), adv: A.adv }];
  const pos = space(glyphs, { y0: XH, y1: 704, step: 4, depth: 90, gap: o.gap, minGap: [0, 20, 20, 20, 20], extra: o.extra });
  // the release R, its tail running out under the first a
  glyphs[0] = { id: 'letter-R', ...royal.R(pos[1] + o.reach, { ...require('./system.cjs').RELEASE.R, ...(o.R || {}) }) };
  const clearance = minDistance(glyphs[0].shape, translate(A.shape, pos[1], 0), 560);
  return { glyphs, pos, clearance };
}

module.exports = { F, XH, a, w, z, set, FINAL };
