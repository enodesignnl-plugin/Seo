// DIRECTION B — WARM EDITORIAL  ·  Rawza
// Foundation: Fraunces (SIL OFL 1.1), static instance SOFT 100, opsz 144, WONK 0, wght 320:
// a soft, old-style display serif with rounded corners and ball terminals, warm rather than cold.
// Units: cap height 700, baseline y = 700, x-height line y = 218.
//
//  R  the special letter. The font's leg is kept down to its straight part, then one stroke of
//     the same broad nib (-28°) used in direction A carries on: it curves down through the
//     baseline, sweeps under the first a and thins out to a lifted hairline beyond it.
//     The tail is the relationship between the letters: the R holds the a.
//  a  the font's a, both identical.
//  w  the font's w.
//  z  the font's z.
const { paper, rect, union, sub, inter, translate } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { dropSpecks } = require('./edit.cjs');
const { stroke } = require('./qalam.cjs');

const F = loadFont(`Fraunces-S100-${process.env.RAWZA_B_WGHT || 320}.ttf`);
const XH = F.xHeight;
const PEN = { angle: -28 };

// R. As in direction A, the font's leg is kept down to y = CUT and the pen takes over inside it.
// T: x of the tail's end; o.dip: lowest point below the baseline; o.lift: rise at the end;
// o.bx: how far right of the leg the stroke reaches its lowest point
function R(T = 900, o = {}) {
  const g = F.glyph('R');
  const CUT = o.cut ?? 520, Y0 = CUT - 50;
  const edges = (y) => g.shape.getIntersections(new paper.Path.Line({ from: [250, y], to: [2000, y], insert: false })).map((q) => q.point.x).sort((a, b) => a - b);
  const [la, ra] = edges(CUT - 24), [lb, rb] = edges(CUT + 24);
  const lx = (y) => la + (lb - la) * (y - CUT + 24) / 48, rx = (y) => ra + (rb - ra) * (y - CUT + 24) / 48;
  const cx = (y) => (lx(y) + rx(y)) / 2, k = (cx(CUT + 24) - cx(CUT - 24)) / 48;
  const body = sub(g.shape, rect(lx(CUT) - 30, CUT, 1400, 900));
  const low = 700 + (o.dip ?? 80), lift = o.lift ?? 50;
  const y1 = o.y1 ?? 640, p0 = [cx(Y0), Y0], p1 = [cx(Y0) + k * (y1 - Y0), y1];
  const bx = p1[0] + (o.bx ?? 170);
  const pts = [p0, [p0[0] + k * 40, Y0 + 40], [p1[0] - k * 40, y1 - 40], p1,
    [p1[0] + k * 70, y1 + 70], [bx - (o.bh ?? 110), low], [bx, low],
    [bx + (T - bx) * 0.5, low], [T - 20, low - lift * 0.5], [T, low - lift]];
  const dir = Math.atan2(1, k), sinT = Math.abs(Math.sin(dir - PEN.angle * Math.PI / 180));
  const wf = (y) => (rx(y) - lx(y)) * Math.cos(Math.atan(k));
  const nib = wf(CUT) / sinT;              // as wide as the font's leg where the pen takes over
  const ease = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
  const end = o.end ?? 0.3;
  const pressure = (t) => 1 - (1 - end) * ease((t - (o.t0 ?? 0.33)) / (o.t1 ?? 0.33));
  const leg = inter(stroke(pts, { nib, angle: PEN.angle, pressure, tolerance: 0.4, samples: 600 }), rect(-100, CUT - 3, 4000, 1200));
  return { shape: dropSpecks(union([body, leg])), adv: g.adv };
}
// the R with the font's leg, for spacing
function Rbody() { const g = F.glyph('R'); return { shape: g.shape, adv: g.adv }; }

const a = () => { const g = F.glyph('a'); return { shape: g.shape, adv: g.adv }; };
const w = () => { const g = F.glyph('w'); return { shape: g.shape, adv: g.adv }; };
const z = () => { const g = F.glyph('z'); return { shape: g.shape, adv: g.adv }; };

function minDistance(A, B, y0) {
  let best = Infinity;
  for (const c of (A.children || [A])) for (let t = 0; t <= 1; t += 0.002) {
    const pt = c.getPointAt(c.length * t); if (!pt || pt.y < y0) continue;
    const d = pt.getDistance(B.getNearestPoint(pt)); if (d < best) best = d;
  }
  return best;
}

// reach: where the tail ends, measured from the first a's origin
const FINAL = { gap: 100, extra: [0, 0, 0, 0, 0], reach: 380, R: {} };
function set(opts) {
  const o = { ...FINAL, ...(opts || {}) };
  const A = a();
  const glyphs = [
    { id: 'letter-R', ...Rbody() }, { id: 'letter-a-1', ...A }, { id: 'letter-w', ...w() },
    { id: 'letter-z', ...z() }, { id: 'letter-a-2', shape: A.shape.clone({ insert: false }), adv: A.adv }];
  const pos = space(glyphs, { y0: XH, y1: 704, step: 4, depth: 80, gap: o.gap, minGap: [0, 20, 16, 16, 16], extra: o.extra });
  glyphs[0] = { id: 'letter-R', ...R(pos[1] + o.reach, o.R) };
  const clearance = minDistance(glyphs[0].shape, translate(A.shape, pos[1], 0), 600);
  return { glyphs, pos, clearance };
}

module.exports = { F, XH, R, a, w, z, set, FINAL };
