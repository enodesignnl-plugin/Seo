// DIRECTION A — ROYAL SIGNATURE  ·  RAWZA
// Foundation: Cormorant Garamond (SIL OFL 1.1), static instance wght 420, edited outline by outline.
// Units: cap height 700, baseline y = 700, cap line y = 0.
//
//  R  the signature letter. The font's leg is kept down to its straight part; from there one
//     broad-nib (qalam) stroke at -28° takes over: full weight down the diagonal, through the
//     baseline, then thinning into a hairline that runs under the first A and lifts at the end.
//  A  the font's A (both identical).
//  W  the font's crossed W: the left V's hairline rises through the right V's heavy stroke about
//     half-way up. Its serif on the cap line is replaced by a cut at the same nib angle as the R,
//     which opens the crowded centre of the W and ties it to the R's pen logic.
//  Z  the font's Z, diagonal 6 units lighter.
const { paper, poly, rect, union, sub, inter, translate, fillet, along } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { thinDiagonal, dropSpecks, warp } = require('./edit.cjs');
const { stroke } = require('./qalam.cjs');

const F = loadFont(`CormorantGaramondV-${process.env.RAWZA_A_WGHT || 420}.ttf`);
const PEN = { angle: -28 };
function nearest(path, x, y) {
  let best = 0, bd = Infinity;
  path.segments.forEach((q, i) => { const d = Math.hypot(q.point.x - x, q.point.y - y); if (d < bd) { bd = d; best = i; } });
  return path.segments[best].point;
}
const ease = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };

// R with its leg redrawn. The font's leg is kept down to y = CUT (where it is straight and at full
// weight); the pen stroke starts higher, inside it, on the leg's own centre line, so the join is
// hidden. T: x of the tail's end; o.dip: depth of the hairline below the baseline; o.lift: rise at
// the end; o.t0/o.t1: where the stroke starts to thin and over how long; o.end: final pressure.
function R(T = 900, o = {}) {
  const g = F.glyph('R');
  const CUT = 470, Y0 = 420;
  // the leg's two edges, measured on the outline just above and below the cut (they curve a little)
  const edges = (y) => g.shape.getIntersections(new paper.Path.Line({ from: [300, y], to: [2000, y], insert: false })).map((q) => q.point.x).sort((a, b) => a - b);
  const [la, ra] = edges(CUT - 24), [lb, rb] = edges(CUT + 24);
  const lx = (y) => la + (lb - la) * (y - CUT + 24) / 48, rx = (y) => ra + (rb - ra) * (y - CUT + 24) / 48;
  const cx = (y) => (lx(y) + rx(y)) / 2, k = (cx(560) - cx(Y0)) / (560 - Y0);
  const body = sub(g.shape, rect(lx(CUT) - 30, CUT, 1400, 900));
  const p0 = [cx(Y0) - 0.5, Y0], p1 = [cx(Y0) - 0.5 + k * (660 - Y0), 660];
  const low = 700 + (o.dip ?? 56), lift = o.lift ?? 40, x1 = 640;
  const pts = [p0, [p0[0] + k * 60, Y0 + 60], [p1[0] - k * 50, 610], p1,
    [p1[0] + k * (o.turn ?? 30), 660 + (o.turn ?? 30)], [x1 + 30 - (o.turnC ?? 0), low - 4], [x1 + 100 + (o.turnE ?? 0), low],
    [x1 + 180 + (o.turnE ?? 0), low + 3], [T - 100, low - 2], [T, low - lift]];
  // the nib is sized so the stroke is exactly as wide as the font's leg where it takes over, and
  // swells with the leg's own slight widening down to the baseline; then it eases into the hairline
  const dir = Math.atan2(1, k), sinT = Math.abs(Math.sin(dir - PEN.angle * Math.PI / 180));
  const wf = (y) => (rx(y) - lx(y)) * Math.cos(Math.atan(k));
  // (eased out after the baseline instead of stopping abruptly, which left a knee in the edge)
  const sOut = (u) => (u <= 0.5 ? u : u >= 1.5 ? 1 : 0.5 + (u - 0.5) - (u - 0.5) ** 2 / 2);
  const grow = (t) => wf(Y0 + (660 - Y0) * (o.smooth ? sOut(t * 3) : Math.min(1, t * 3))) / wf(Y0);
  // o.point: over the last part of the stroke the hairline narrows further to a fine point
  const tip = (t) => (o.point ? 1 - (1 - o.point[1]) * ease((t - o.point[0]) / (1 - o.point[0])) : 1);
  const pressure = (t) => grow(t) * tip(t) * (1 - (1 - (o.end ?? 0.16)) * ease((t - (o.t0 ?? 0.26)) / (o.t1 ?? 0.5)));
  const leg = inter(stroke(pts, { nib: wf(Y0) / sinT, angle: PEN.angle, pressure, tolerance: 0.4 }), rect(-100, CUT - 3, 3000, 1000));
  return { shape: dropSpecks(union([body, leg])), adv: g.adv };
}
// the font's R with its foot serif trimmed: used to space the R against the A
function Rbody() {
  const g = F.glyph('R');
  return { shape: inter(g.shape, rect(-100, -100, 690, 800)), adv: g.adv };
}

function A() {
  const g = F.glyph('A');
  return { shape: g.shape, adv: g.adv };
}

// W: the hairline's serif goes; the stroke ends in a cut at the nib angle through (x0, y0)
function W(o = {}) {
  const g = F.glyph('W');
  let s = g.shape;
  if (o.pen !== false) {
    const [x0, y0] = o.pen || [652, 4], k = -Math.tan(PEN.angle * Math.PI / 180);
    const yAt = (x) => y0 + (x - x0) * k;
    s = sub(s, poly([[530, yAt(530)], [800, yAt(800)], [800, -300], [530, -300]]));
  }
  if (o.tuck) {
    // the left V's hairline tucks into the right V's heavy stroke and stops there: everything of it
    // beyond the heavy stroke goes, and the heavy stroke is restored as one clean band
    const c = s.children ? s.children[0] : s;
    const pt = (x, y) => { const q = nearest(c, x, y); return [q.x, q.y]; };
    const L0 = pt(391, 93), L1 = pt(509, 350), R0 = pt(470, 90), R1 = pt(707, 597);
    const Lx = (y) => L0[0] + (L1[0] - L0[0]) * (y - L0[1]) / (L1[1] - L0[1]);
    const Rx = (y) => R0[0] + (R1[0] - R0[0]) * (y - R0[1]) / (R1[1] - R0[1]);
    s = sub(s, poly([[Rx(340), 340], [Rx(95), 95], [Rx(95) + 40, -30], [800, -30], [800, 60], [Rx(340) + 170, 340]]));
    s = union([s, poly([[Lx(120), 120], [Rx(120), 120], [Rx(560), 560], [Lx(560), 560]])]);
    // soft brackets where the hairline meets the heavy stroke, like ink gathering at a pen join
    if (o.tuck.r) {
      const C1 = pt(509, 350), C2 = pt(523, 381), H1 = pt(410, 597), H2 = pt(398, 699), B2 = pt(670, 699);
      const [r1, r2] = Array.isArray(o.tuck.r) ? o.tuck.r : [o.tuck.r, o.tuck.r];
      if (r1) s = union([s, fillet(C1, along(C1, L0, r1), along(C1, H1, r1))]);
      if (r2) s = union([s, fillet(C2, along(C2, H2, r2), along(C2, B2, r2))]);
    }
    // final pass: both corners where the hairline meets the heavy stroke are filled with long, soft
    // brackets, `round` units along each edge above the join, `flow` units (along the hairline,
    // along the heavy stroke) in the crotch below, so the hairline runs into the stroke instead of
    // stopping against it
    if (o.tuck.round || o.tuck.flow) {
      const C1 = pt(509, 350), C2 = pt(523, 381), H1 = pt(410, 597), H2 = pt(398, 699), B2 = pt(670, 699);
      if (o.tuck.round) s = union([s, fillet(C1, along(C1, L0, o.tuck.round), along(C1, H1, o.tuck.round))]);
      if (o.tuck.flow) s = union([s, fillet(C2, along(C2, H2, o.tuck.flow[0]), along(C2, B2, o.tuck.flow[1]))]);
    }
  }
  if (o.serif) {
    // the right V's heavy stroke loses the inner half of its serif: its left edge runs straight up
    // to the cap line, so the two serifs in the middle of the W no longer crowd each other
    // (edge read from the font's own outline: the join brackets above change the outline here)
    const c = g.shape.children ? g.shape.children[0] : g.shape;
    const p0 = nearest(c, 391, 93), p1 = nearest(c, 509, 350);
    const Lx = (y) => p0.x + (p1.x - p0.x) * (y - p0.y) / (p1.y - p0.y);
    // o.serif = true cuts along the edge; a number keeps that many units of serif left of it
    const keep = o.serif === true ? 0 : o.serif;
    s = sub(s, poly([[Lx(p0.y + 1) - keep, p0.y + 1], [Lx(-20) - keep, -20], [280, -20], [280, p0.y + 1]]));
  }
  return { shape: dropSpecks(s), adv: g.adv };
}

function Z(o = {}) {
  const g = F.glyph('Z');
  let s = o.thin ? thinDiagonal(g.shape, { t: o.thin, r: 9, top: 0, inset: 9 }) : g.shape;
  if (o.soft) {
    // the flag at the top left is drawn in: it rises less above the cap line (by `up`) and hangs
    // less far below the bar (by `down`); the bar itself, from x 260 on, does not move
    const { up = 0.5, down = 0.6 } = o.soft;
    const w = (x) => { const u = Math.min(1, Math.max(0, (260 - x) / 110)); return u * u * (3 - 2 * u); };
    s = warp(s, (x, y) => {
      if (y > 260) return [x, y];
      const k = w(x);
      return [x, y < 0 ? y * (1 - up * k) : y - down * k * y * (1 - y / 260)];
    });
  }
  if (o.foot) {
    // the beak at the bottom right is drawn down by the same kind of warp: its tip sits `foot`
    // (a fraction of its height) lower, the bar and the diagonal above y 430 do not move
    const w = (x) => { const u = Math.min(1, Math.max(0, (x - 480) / 100)); return u * u * (3 - 2 * u); };
    const g = (y) => { const u = Math.min(1, Math.max(0, (y - 430) / 120)); return u * u * (3 - 2 * u); };
    s = warp(s, (x, y) => [x, y + o.foot * w(x) * g(y) * (700 - y)]);
  }
  return { shape: dropSpecks(inter(s, rect(-100, -60, 900, 800))), adv: g.adv };
}

// smallest distance from the part of `a` below y0 to the outline `b`
function minDistance(a, b, y0) {
  let best = Infinity;
  for (const c of (a.children || [a])) for (let t = 0; t <= 1; t += 0.002) {
    const pt = c.getPointAt(c.length * t); if (!pt || pt.y < y0) continue;
    const d = pt.getDistance(b.getNearestPoint(pt)); if (d < best) best = d;
  }
  return best;
}

// reach: where the tail ends, measured from the first A's origin
const FINAL = { gap: 230, reach: 330, extra: [0, 40, 0, 0, 0], W: {}, Z: { thin: 6 }, R: {} };
function set(opts) {
  const o = { ...FINAL, ...(opts || {}) };
  const a = A();
  const glyphs = [
    { id: 'letter-R', ...Rbody() }, { id: 'letter-A-1', ...a }, { id: 'letter-W', ...W(o.W) },
    { id: 'letter-Z', ...Z(o.Z) }, { id: 'letter-A-2', shape: a.shape.clone({ insert: false }), adv: a.adv }];
  const pos = space(glyphs, { y0: 0, y1: 704, step: 4, depth: 120, gap: o.gap, minGap: [0, 30, 30, 30, 30], extra: o.extra });
  glyphs[0] = { id: 'letter-R', ...R(pos[1] + o.reach, o.R) };
  const clearance = minDistance(glyphs[0].shape, translate(a.shape, pos[1], 0), 560);
  return { glyphs, pos, clearance };
}

module.exports = { F, R, A, W, Z, set, FINAL, minDistance };
