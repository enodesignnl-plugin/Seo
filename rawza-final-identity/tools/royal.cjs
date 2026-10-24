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
const { paper, poly, rect, union, sub, inter, translate } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { thinDiagonal, dropSpecks } = require('./edit.cjs');
const { stroke } = require('./qalam.cjs');

const F = loadFont(`CormorantGaramondV-${process.env.RAWZA_A_WGHT || 420}.ttf`);
const PEN = { angle: -28 };
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
    [p1[0] + k * 30, 690], [x1 + 30, low - 4], [x1 + 100, low],
    [x1 + 180, low + 3], [T - 100, low - 2], [T, low - lift]];
  // the nib is sized so the stroke is exactly as wide as the font's leg where it takes over, and
  // swells with the leg's own slight widening down to the baseline; then it eases into the hairline
  const dir = Math.atan2(1, k), sinT = Math.abs(Math.sin(dir - PEN.angle * Math.PI / 180));
  const wf = (y) => (rx(y) - lx(y)) * Math.cos(Math.atan(k));
  const grow = (t) => wf(Y0 + (660 - Y0) * Math.min(1, t * 3)) / wf(Y0);
  const pressure = (t) => grow(t) * (1 - (1 - (o.end ?? 0.16)) * ease((t - (o.t0 ?? 0.26)) / (o.t1 ?? 0.5)));
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
  return { shape: dropSpecks(s), adv: g.adv };
}

function Z(o = {}) {
  const g = F.glyph('Z');
  const s = o.thin ? thinDiagonal(g.shape, { t: o.thin, r: 9, top: 0, inset: 9 }) : g.shape;
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
