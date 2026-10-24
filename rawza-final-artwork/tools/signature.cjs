// DIRECTION A — THE SIGNATURE  ·  RAWZA
// Starts from the v4 Royal Signature artwork: Cormorant Garamond (SIL OFL 1.1), now at wght 400
// (RAWZA_A_WGHT overrides; v5 used 500), edited outline by outline. Nothing is scaled.
// Units: cap height 700, baseline y = 700.
//
//  R  the signature. v6: the font's leg is cut off at the bowl and redrawn with a simulated broad
//     nib (qalam.cjs, nib 76 at -28°): thick on the descent, thinning through the baseline into a
//     hairline that runs under the A's foot and exits at the nib angle. The A is spaced so the
//     stroke stays at least 55 units from it. (v5: drawn lower leg 'sweep'; also studied: 'kick',
//     'flick', 'qalam', 'swash', 'under', 'back', 'ss01', 'ss01x' — see rawza-decisions.md.)
//  A  one shape for both As: the font's A with the apex cut flat on the cap line and the crossbar
//     brought up to the weight of the thin diagonal (25 → 31).
//  W  the font's uncrossed W (ss03), rebalanced: the two heavy diagonals taper (v6: by 8) towards
//     the inner joins, the two hairlines gain 4 units; apex and vertices cut flat like the A.
//  Z  diagonal thinner (v6: by 8, to 90 % of the A's thick stroke); the bottom beak is shortened.
const { paper, P, poly, rect, union, sub, inter, lineX, along, translate } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { thinDiagonal, dropSpecks, shiftLine, warp } = require('./edit.cjs');
const { stroke } = require('./qalam.cjs');
const PEN = { nib: 76, low: 784, angle: -28 };

const WGHT = process.env.RAWZA_A_WGHT || 400;
const F = loadFont(`CormorantGaramondV-${WGHT}.ttf`);
const capCut = (s) => inter(s, rect(-100, 0, 1200, 700));

// replace the run of segments strictly between index a and index b (cyclic) of a closed path
function replaceRun(path, a, b, segs, o = {}) {
  const old = path.segments.map((s) => s.clone());
  const n = old.length, keep = [];
  for (let i = b; ; i = (i + 1) % n) { keep.push(old[i]); if (i === a) break; }
  const out = new paper.Path({ segments: [...keep, ...segs.map(([x, y, hi = [0, 0], ho = [0, 0]]) => new paper.Segment(P(x, y), P(...hi), P(...ho)))], closed: true, insert: false });
  if (o.hoA) out.segments[keep.length - 1].handleOut = P(...o.hoA);
  if (o.hiB) out.segments[0].handleIn = P(...o.hiB);
  return out;
}

// ---- R: the lower leg. Segment 36 is the outer edge of the leg at y 535, 0 the inner corner on
// the baseline, 1 the inner edge at y 657 (Cormorant Garamond 500).
const LEGS = {
  // 1 · needle kick: the foot runs out along the baseline as a serif-weight hairline ending in a point
  kick: { from: 36, to: 0, segs: [
    [668, 645, [-34, -30], [32, 26]], [760, 687, [-32, -10], [30, 6]], [842, 699.4, [-28, -3.5], [0, 0]],
    [740, 700.6, [44, 0], [-44, 0]]], hiB: [40, 0.6] },
  // 2 · descending sweep: the leg continues below the baseline and tapers to a point under the gap
  sweep: { from: 36, to: 1, segs: [
    [658, 652, [-38, -44], [33, 37]], [722, 717, [-27, -27], [17, 13]], [752, 741, [-14, -7], [0, 0]],
    [676, 727, [36, 11], [-34, -10]]], hiB: [38, 42] },
  // 4 · qalam sweep: the leg swells out of the bowl, thins through the baseline into a hairline
  //     that runs on below it and lifts at the very end, like the exit of a reed-pen stroke.
  //     Drawn relative to the leg's outer anchor O (x 551 at wght 420).
  qalam: { from: 36, to: 1, segs: (O) => { const dx = O.x - 551, f = ([x, y, hi, ho]) => [x + dx, y, hi, ho]; return [
    [642, 640, [-30, -38], [26, 30]], [714, 701, [-26, -22], [32, 20]], [800, 734, [-36, -10], [26, 3]],
    [858, 730, [-18, 3], [0, 0]], [792, 745, [30, -4], [-36, 0]], [676, 722, [40, 14], [-40, -16]]].map(f); },
    hiB: [36, 40] },
  // 5 · signature swash: as qalam, but the hairline runs on below the baseline to a tip at x = T
  //     (set from the A's position, so it always stops short of the A) and lifts at the end
  swash: { from: 36, to: 1, segs: (O, I, T) => { const dx = O.x - 551, f = ([x, y, hi, ho]) => [x + dx, y, hi, ho]; return [
    f([642, 640, [-30, -38], [26, 30]]), f([712, 704, [-26, -24], [30, 20]]), f([800, 742, [-34, -12], [34, 6]]),
    [T - 40, 746, [-30, -1], [22, 0]], [T, 737, [-16, 6], [0, 0]], [T - 46, 760, [26, -8], [-34, 2]],
    f([796, 757, [34, 0], [-40, -2]]), f([684, 728, [44, 16], [-40, -16]])]; }, hiB: [36, 40] },
  // 6 · under-sweep: the leg thins through the baseline into a hairline that passes well below
  //     the A's foot (lowest ~ 70 under the baseline) and ends in a lifted point at x = T
  under: { from: 36, to: 1, segs: (O, I, T) => { const dx = O.x - 551, f = ([x, y, hi, ho]) => [x + dx, y, hi, ho]; return [
    f([640, 642, [-30, -38], [24, 30]]), f([700, 712, [-24, -30], [28, 26]]), f([790, 760, [-40, -18], [40, 10]]),
    [T - 70, 768, [-40, -2], [30, 0]], [T, 752, [-26, 8], [0, 0]], [T - 72, 782, [32, -6], [-40, 2]],
    f([780, 775, [40, 4], [-38, -12]]), f([676, 730, [36, 22], [-36, -22]])]; }, hiB: [36, 40] },
  // 7 · return sweep: the leg's hairline turns back under the R itself and ends below the stem
  back: { from: 36, to: 1, segs: (O) => { const dx = O.x - 551, f = ([x, y, hi, ho]) => [x + dx, y, hi, ho]; return [
    f([640, 642, [-30, -38], [24, 32]]), f([690, 728, [-20, -30], [8, 26]]), f([600, 772, [44, 6], [-80, -4]]),
    f([300, 758, [70, 6], [0, 0]]), f([590, 758, [-80, 0], [36, -4]]), f([650, 716, [6, 22], [-20, -26]])].map((v) => v); }, hiB: [36, 40] },
  // 3 · upturned exit: the leg touches the baseline and lifts into a short tapering flick
  flick: { from: 36, to: 1, segs: [
    [652, 630, [-36, -42], [24, 27]], [735, 677, [-30, -14], [30, 2]], [816, 650, [-22, 14], [0, 0]],
    [738, 701, [38, -20], [-32, 5]], [632, 704, [34, 2], [-34, -2]]], hiB: [26, 32] },
};
// index of the outline point nearest to (x, y): the leg's anchor points differ by one between weights
function nearestIndex(path, x, y) {
  let best = 0, bd = Infinity;
  path.segments.forEach((s, i) => { const d = Math.hypot(s.point.x - x, s.point.y - y); if (d < bd) { bd = d; best = i; } });
  return best;
}
function R(variant = 'kick', T = 900) {
  if (variant === 'ss01') {
    // the font's own long-leg R (stylistic set 1): its leg dips below the baseline and flicks up
    const g = F.glyph('R.ss01');
    return { shape: g.shape, adv: g.adv };
  }
  if (variant === 'qalam-pen') {
    // the R's leg redrawn with a broad nib held at -30° (see qalam.cjs): the font's leg is cut off
    // below the bowl and a pen stroke takes over, running through the baseline, under the gap and
    // out in a hairline exit at the nib angle. T = x of the exit point.
    const g = F.glyph('R');
    // cut the font's leg off along its junction with the bowl (inner corner → outer corner)
    const c = g.shape.children[0], inner = c.segments[nearestIndex(c, 331, 352)].point, outer = c.segments[nearestIndex(c, 395, 330)].point;
    const body = sub(g.shape, poly([[inner.x, inner.y], [outer.x, outer.y], [1400, outer.y], [1400, 900], [inner.x, 900]]));
    const m = [(inner.x + outer.x) / 2, (inner.y + outer.y) / 2];
    const P = PEN;
    const pts = [m, [m[0] + 60, m[1] + 94], [522, 562], [584, 656], [622, 722], [680, 776], [778, P.low],
      [860, P.low + 6], [T - 40, P.low - 2], [T, P.low - 22]];
    const leg = stroke(pts, { nib: P.nib, angle: P.angle, pressure: (t) => (t < 0.42 ? 1 : Math.max(0.12, 1 - 0.9 * ((t - 0.42) / 0.58) ** 1.2)) });
    return { shape: dropSpecks(union([body, leg])), adv: g.adv };
  }
  if (variant === 'ss01x') {
    // the long-leg R with its tail drawn out and lowered: beyond x0 the tail is stretched to reach
    // T and dropped by up to `drop`, so it sweeps below the baseline instead of flicking at the A
    const g = F.glyph('R.ss01');
    const x0 = 560, x1 = 760, L = T - 756, drop = 78;
    const ease = (t) => t * t * (3 - 2 * t);
    const fn = (x, y) => {
      if (y < 560 || x <= x0) return [x, y];
      const t = Math.min(1, (x - x0) / (x1 - x0));
      return [x + L * ease(t), y + drop * ease(t) * Math.min(1, (y - 560) / 100)];
    };
    return { shape: warp(g.shape, fn), adv: g.adv };
  }
  const g = F.glyph('R');
  const outer = g.shape.children[0], counter = g.shape.children[1];
  const L = LEGS[variant];
  const from = nearestIndex(outer, 555, 536), toMap = { 0: nearestIndex(outer, 615, 700), 1: nearestIndex(outer, 556, 657) };
  const c0 = replaceRun(outer, from, toMap[L.to], typeof L.segs === 'function' ? L.segs(outer.segments[from].point, outer.segments[toMap[L.to]].point, T) : L.segs, { hiB: L.hiB });
  const shape = new paper.CompoundPath({ children: [c0, counter.clone({ insert: false })], insert: false });
  return { shape: shape.reorient(true, true), adv: g.adv };
}

function A() {
  const g = F.glyph('A');
  // crossbar 383–408 → 380–411: as heavy as the thin diagonal, so it holds at small sizes;
  // the extra is clipped to the A's outer hull so it only grows into the counters
  const hull = poly([[140, 542], [379, -8], [394, -8], [663, 547]]);
  const bar = inter(rect(150, 380, 560, 411), hull);
  return { shape: capCut(union([g.shape, bar])), adv: g.adv };
}

// ---- W: straight edges of W.ss03 at wght 500, read from the outline (approximate ends given here
// only to pick each edge; the exact coordinates come from the font)
const W_PICK = {
  thick1R: [[188, 96], [348, 550]], hair1L: [[515, 0], [348, 550]], hair1R: [[501, 139], [330, 699]],
  thick2R: [[541, 0], [754, 555]], hair2L: [[879, 115], [754, 555]], hair2R: [[909, 115], [740, 699]],
};
function wEdges(shape) {
  const lines = (shape.children ? shape.children[0] : shape).curves.filter((c) => !c.hasHandles() && c.length > 200)
    .map((c) => [[c.point1.x, c.point1.y], [c.point2.x, c.point2.y]]);
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const out = {};
  for (const [k, [a, b]] of Object.entries(W_PICK)) {
    // the straight edge whose ends lie closest to the approximate ends (either direction)
    let best = null, bd = Infinity;
    for (const [p, q] of lines) {
      const d1 = dist(p, a) + dist(q, b), d2 = dist(q, a) + dist(p, b);
      if (d1 < bd) { bd = d1; best = [p, q]; }
      if (d2 < bd) { bd = d2; best = [q, p]; }
    }
    if (bd > 80) throw new Error('W edge not found: ' + k);
    out[k] = best;
  }
  return out;
}
function intersect([p0, p1], [q0, q1]) {
  const a = lineX(p0, p1), b = lineX(q0, q1);
  // solve a(y) = b(y) for y (both edges are steep)
  const y = (() => { let lo = -2000, hi = 2000; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; ((a(lo) - b(lo)) * (a(m) - b(m)) <= 0) ? (hi = m) : (lo = m); } return (lo + hi) / 2; })();
  return [a(y), y];
}
// band along an edge, `w0` wide at its first point and `w1` at its second, on the side of `to`;
// it starts 1 unit inside the stroke so the union overlaps instead of meeting edge to edge
function edgeBand([p0, p1], w0, w1, to) {
  const away = [2 * p0[0] - to[0], 2 * p0[1] - to[1]];
  const [i0, i1] = shiftLine([p0, p1], 1, away);
  const [s0] = shiftLine([p0, p1], w0, to), [, s1] = shiftLine([p0, p1], w1, to);
  return poly([i0, i1, s1, s0]);
}
function W(o = {}) {
  const g = F.glyph('W.ss03');
  const d = o.thin ?? 12, h = o.hair ?? 6, E = wEdges(g.shape);
  let s = g.shape;
  if (d) {
    // heavy diagonals: inner edge pivots about its top, so the stroke tapers by d towards the join
    for (const [edge, next, inside] of [[E.thick1R, E.hair1L, [100, 300]], [E.thick2R, E.hair2L, [560, 300]]]) {
      const [top, bot] = edge;
      const moved = shiftLine([top, bot], d, inside)[1];
      const newEdge = [top, [bot[0] + (moved[0] - bot[0]) * 1, bot[1] + (moved[1] - bot[1])]];
      const crotch = intersect([top, newEdge[1]], next);
      s = sub(s, poly([top, bot, crotch]));
    }
  }
  if (h) {
    const half = h / 2;
    s = union([s,
      edgeBand([E.hair1L[0], along(E.hair1L[0], E.hair1L[1], 600 / 550 * Math.hypot(E.hair1L[1][0] - E.hair1L[0][0], E.hair1L[1][1] - E.hair1L[0][1]))], half, half, [300, 300]),   // run on past the join (inside the heavy stroke)
      edgeBand(E.hair1R, half, half, [700, 300]),
      edgeBand([E.hair2L[0], along(E.hair2L[0], E.hair2L[1], (600 - E.hair2L[0][1]) / (E.hair2L[1][1] - E.hair2L[0][1]) * Math.hypot(E.hair2L[1][0] - E.hair2L[0][0], E.hair2L[1][1] - E.hair2L[0][1]))], 0, half * 1.1, [600, 300]),
      edgeBand(E.hair2R, 0, half, [1100, 300]),
    ]);
  }
  return { shape: dropSpecks(capCut(s)), adv: g.adv };
}

// ---- Z
function Z(o = {}) {
  const g = F.glyph('Z');
  let s = thinDiagonal(g.shape, { t: o.thin ?? 12, r: 9, top: 0, inset: 9 });
  s = inter(s, rect(-100, 0, 900, 800));
  // bottom beak: cut square to the beak's outer edge at height `beak` above the baseline
  if (o.beak) s = sub(s, poly([[560, 700 - o.beak + 6], [700, 700 - o.beak - 8], [700, 400], [560, 400]]));
  return { shape: dropSpecks(s), adv: g.adv };
}

// smallest distance from the part of `a` below y0 to the outline `b`
function minDistance(a, b, y0) {
  let best = Infinity;
  for (const c of (a.children || [a])) for (let t = 0; t <= 1; t += 0.001) {
    const pt = c.getPointAt(c.length * t); if (!pt || pt.y < y0) continue;
    const d = pt.getDistance(b.getNearestPoint(pt)); if (d < best) best = d;
  }
  return best;
}

// ---- the wordmark
// v5 (previous round): { leg: 'sweep', extra: [0, 20, 0, 25, 0] } at wght 500.
// v6: lighter (wght 400), wider tracking, the font's own long-leg R kept clear of the A.
const FINAL = { leg: 'qalam-pen', gap: 220, reach: 140, minClear: 55, extra: [0, 0, 0, 25, 0], W: { thin: 8, hair: 4 }, zThin: 8 };
function set(opts) {
  const o = opts || FINAL;
  const variant = o.leg || 'sweep';
  const swash = variant === 'swash' || variant === 'under' || variant === 'ss01x' || variant === 'qalam-pen';
  // for the swash the R is spaced by its body (the font's R without the foot), then the tail is
  // drawn to stop `clear` units before the A's serif tip
  const body = { shape: inter(F.glyph('R').shape, rect(-100, -100, o.bodyX ?? 690, 800)), adv: F.glyph('R').adv };
  const r = swash ? body : R(variant), a = A(), w = W(o.W), z = Z({ beak: o.beak ?? 96, thin: o.zThin });
  const glyphs = [
    { id: 'letter-R', ...r }, { id: 'letter-A-1', ...a }, { id: 'letter-W', ...w },
    { id: 'letter-Z', ...z }, { id: 'letter-A-2', shape: a.shape.clone({ insert: false }), adv: a.adv }];
  const pos = space(glyphs, { y0: 0, y1: 704, step: 4, depth: 120, gap: o.gap ?? 105, minGap: o.minGap ?? [0, swash ? 30 : 70, 30, 30, 30], extra: o.extra || [0, 0, 0, 25, 0] });
  if (swash) {
    const reaching = variant === 'under' || variant === 'ss01x' || variant === 'qalam-pen';
    const build = () => {
      const T = reaching ? pos[1] + (o.reach ?? 150) : pos[1] + a.shape.bounds.x - (o.clear ?? 50);
      glyphs[0] = { id: 'letter-R', ...R(variant, T) };
    };
    build();
    // keep the leg at least `minClear` from the A: move the A (and all after it) until it is
    for (let k = 0; k < 8 && o.minClear; k++) {
      const d = minDistance(glyphs[0].shape, translate(a.shape, pos[1], 0), 560);
      if (d >= o.minClear - 0.5) break;
      for (let i = 1; i < pos.length; i++) pos[i] += (o.minClear - d) * 1.1;
      build();
    }
  }
  return { glyphs, pos };
}

module.exports = { F, R, A, W, Z, set, LEGS, minDistance };
