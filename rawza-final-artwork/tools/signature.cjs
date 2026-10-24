// DIRECTION A — THE SIGNATURE  ·  RAWZA
// Starts from the v4 Royal Signature artwork: Cormorant Garamond (SIL OFL 1.1) at wght 500, edited
// outline by outline. Nothing is scaled. Units: cap height 700, baseline y = 700.
//
//  R  the signature: the font's foot is replaced by a drawn lower leg (study variants: 'kick',
//     'sweep', 'flick'; final: 'sweep'). The leg runs on below the baseline and tapers to a point
//     that stops short of the A. The v4 join into the A is gone.
//  A  one shape for both As: the font's A with the apex cut flat on the cap line and the crossbar
//     brought up to the weight of the thin diagonal (25 → 31).
//  W  the font's uncrossed W (ss03), rebalanced: the two heavy diagonals taper by 12 units towards
//     the inner joins, the two hairlines gain 6 units; apex and vertices cut flat like the A.
//  Z  diagonal 12 units thinner (as v4); the bottom beak is shortened to a crisp cut.
const { paper, P, poly, rect, union, sub, inter, lineX, along } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { thinDiagonal, dropSpecks, shiftLine } = require('./edit.cjs');

const F = loadFont('CormorantGaramondV-500.ttf');
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
  // 3 · upturned exit: the leg touches the baseline and lifts into a short tapering flick
  flick: { from: 36, to: 1, segs: [
    [652, 630, [-36, -42], [24, 27]], [735, 677, [-30, -14], [30, 2]], [816, 650, [-22, 14], [0, 0]],
    [738, 701, [38, -20], [-32, 5]], [632, 704, [34, 2], [-34, -2]]], hiB: [26, 32] },
};
function R(variant = 'kick') {
  const g = F.glyph('R');
  const outer = g.shape.children[0], counter = g.shape.children[1];
  const L = LEGS[variant];
  const c0 = replaceRun(outer, L.from, L.to, L.segs, { hiB: L.hiB });
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
  const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 4;
  const out = {};
  for (const [k, [a, b]] of Object.entries(W_PICK)) {
    const l = lines.find(([p, q]) => (near(p, a) && near(q, b)) || (near(p, b) && near(q, a)));
    if (!l) throw new Error('W edge not found: ' + k);
    out[k] = near(l[0], a) ? l : [l[1], l[0]];
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
  let s = thinDiagonal(g.shape, { t: 12, r: 9, top: 0, inset: 9 });
  s = inter(s, rect(-100, 0, 900, 800));
  // bottom beak: cut square to the beak's outer edge at height `beak` above the baseline
  if (o.beak) s = sub(s, poly([[560, 700 - o.beak + 6], [700, 700 - o.beak - 8], [700, 400], [560, 400]]));
  return { shape: dropSpecks(s), adv: g.adv };
}

// ---- the wordmark
const FINAL = { leg: 'sweep', extra: [0, 20, 0, 25, 0] };
function set(opts) {
  const o = opts || FINAL;
  const variant = o.leg || 'sweep';
  const r = R(variant), a = A(), w = W(o.W), z = Z({ beak: o.beak ?? 96 });
  const glyphs = [
    { id: 'letter-R', ...r }, { id: 'letter-A-1', ...a }, { id: 'letter-W', ...w },
    { id: 'letter-Z', ...z }, { id: 'letter-A-2', shape: a.shape.clone({ insert: false }), adv: a.adv }];
  const pos = space(glyphs, { y0: 0, y1: 704, step: 4, depth: 120, gap: o.gap ?? 105, minGap: o.minGap ?? [0, 70, 30, 30, 30], extra: o.extra || [0, 0, 0, 25, 0] });
  return { glyphs, pos };
}

module.exports = { F, R, A, W, Z, set, LEGS };
