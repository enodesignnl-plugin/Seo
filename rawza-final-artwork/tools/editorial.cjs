// DIRECTION B — THE EDITORIAL  ·  Rawza
// Foundation: Bodoni Moda (SIL OFL 1.1), static instance of the variable font at optical size 14,
// wght 400 (RAWZA_B_FONT overrides, e.g. '11-450' for v5). Arm, hairline and join geometry are read
// from the outline, so the construction holds for any instance.
// Outlines from the font, edited; nothing is scaled. Units: cap height 700, baseline y = 700.
//
//  R  the font's R.
//  a  one shape for both a's: the font's a, unchanged.
//  w  the font's w; its right arm ends in the w–z join instead of a serif.
//  z  diagonal 8 units thinner; its top bar starts at the join, so the left flag goes.
//  w–z the one bespoke construction: the w's last hairline turns into the z's top bar through a
//     rounded pen turn (study variants: 'bar', 'corner', 'turn'; final: 'turn'). The join is drawn
//     with the z and overlaps the top of the w's arm, so the two letters never meet edge to edge.
const { poly, rect, shape, union, sub, inter, translate } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { thinDiagonal, dropSpecks } = require('./edit.cjs');

const FONT = process.env.RAWZA_B_FONT || '14-400';
const F = loadFont(`BodoniModaV-${FONT}.ttf`);
const XH = F.xHeight;                 // 270.67: x-height line (y)

// w: the right arm is a hairline from the second vertex up to the right serif. Its two straight
// edges are read from the outline: ro = outer (right) edge, lo = inner (left) edge.
const WG = F.glyph('w');
const W_ARM = (() => {
  const lines = (WG.shape.children ? WG.shape.children[0] : WG.shape).curves.filter((c) => !c.hasHandles() && c.length > 200)
    .map((c) => [[c.point1.x, c.point1.y], [c.point2.x, c.point2.y]]);
  const steep = lines.filter(([p, q]) => Math.abs(q[1] - p[1]) > 250);
  // the two edges whose top end is rightmost and near the x-height
  const tops = steep.map(([p, q]) => (p[1] < q[1] ? [p, q] : [q, p])).sort((u, v) => v[0][0] - u[0][0]);
  const [outer, inner] = tops.slice(0, 2);
  const top = outer[0][1];                                        // underside of the serif (y)
  const fx = ([[x0, y0], [x1, y1]]) => (y) => x0 + (x1 - x0) * (y - y0) / (y1 - y0);
  return { ro: fx(outer), lo: fx(inner), top, x0: inner[0][0], x1: outer[0][0] };
})();
const BAR = W_ARM.top - XH;           // hairline: w serifs and z top bar

// The R keeps the font's stem: at this optical size it is 7–9 % heavier than the a's stem, the
// normal optical compensation for a capital.
function R() {
  const g = F.glyph('R');
  return { shape: g.shape, adv: g.adv };
}

function a() {
  const g = F.glyph('a');
  return { shape: g.shape, adv: g.adv };
}

function w(join) {
  const g = WG;
  if (!join) return { shape: g.shape, adv: g.adv };
  // the right serif goes; the join (drawn with the z) takes over the top of the arm
  const A = W_ARM;
  let s = sub(g.shape, rect(A.x0 - 95, XH - 20, g.adv + 20, A.top + 0.01));
  if (join === 'corner') s = union([s, poly([[A.lo(A.top), A.top], [A.ro(A.top), A.top], [A.ro(XH), XH], [A.lo(XH), XH]])]);
  return { shape: dropSpecks(s), adv: g.adv };
}

function z(o = {}) {
  const g = F.glyph('z');
  let s = thinDiagonal(g.shape, { t: o.thin ?? 8, top: XH });
  // drop the top-left flag, its bracket under the bar, and the start of the bar
  if (o.cutFlag) s = sub(s, union([rect(0, 250, o.cutFlag, 460), rect(0, XH + BAR + 0.3, 200, 380)]));
  return { shape: dropSpecks(s), adv: g.adv };
}

// The three w–z joins. Each returns extra shapes in word coordinates given the w and z positions.
const JOINS = {
  // 1 · shared hairline: the w's right serif runs on and becomes the z's top bar
  bar: { gapZ: 34, cutFlag: 96, link(xw, xz) {
    return [rect(xw + W_ARM.x0 - 84, XH, xz + 120, XH + BAR)];
  } },
  // 2 · corner: the w's last stroke rises and turns sharply into the z's top bar (no serif)
  corner: { gapZ: 0, cutFlag: 96, link(xw, xz) {
    return [rect(xw + W_ARM.lo(XH), XH, xz + 120, XH + BAR)];
  } },
  // 3 · rounded turn: the w's last stroke turns into the z's bar through a small curve, like a pen join
  turn: { gapZ: 10, cutFlag: 96, link(xw, xz) {
    const { lo, ro, top } = W_ARM, X = (x) => xw + x, x1 = ro(top);
    return [shape(`M${X(lo(top + 51))},${top + 51} L${X(lo(top + 20))},${top + 20} C${X(lo(top + 20) + 8)},${top - 4} ${X(x1 - 6)},${XH} ${X(x1 + 21)},${XH} ` +
      `L${xz + 120},${XH} L${xz + 120},${XH + BAR} L${X(x1 + 30)},${XH + BAR} C${X(x1 + 14)},${XH + BAR} ${X(ro(top + 16) + 4)},${top + 4} ${X(ro(top + 16))},${top + 16} ` +
      `L${X(ro(top + 51))},${top + 51} Z`)];
  } },
};

// ---- the wordmark
// v5 (previous round): { join: 'turn' } at '11-450'. v6: lighter optical size 14 / wght 400, more air.
const FINAL = { join: 'turn', gap: 120, ra: 670 };
function set(opts) {
  const o = opts || FINAL;
  const J = o.join ? JOINS[o.join] : null;
  const glyphs = [
    { id: 'letter-R', ...R() }, { id: 'letter-a-1', ...a() }, { id: 'letter-w', ...w(J ? o.join : null) },
    { id: 'letter-z', ...z({ cutFlag: J ? J.cutFlag : 0 }) }, { id: 'letter-a-2', ...a() }];
  const pos = space(glyphs, { y0: XH, y1: 704, step: 4, depth: 90, gap: o.gap ?? 60, minGap: [0, 16, 16, J ? null : 16, 16], extra: o.extra || [0, 0, 10, 0, 0] });
  // R–a: the a tucks under the R's bowl, clear of the R's flick
  const d = (o.ra ?? 612) - pos[1];
  for (let i = 1; i < pos.length; i++) pos[i] += d;
  if (J) {
    // the z sits so that its top bar meets the w's arm; everything after it follows
    const want = pos[2] + W_ARM.ro(XH) + J.gapZ - 96 + (o.dz ?? 0);
    const dz = want - pos[3];
    for (let i = 3; i < pos.length; i++) pos[i] += dz;
    const extra = J.link(pos[2], pos[3]);
    // the link belongs to the z (its top bar), drawn in z coordinates
    glyphs[3].shape = dropSpecks(union([glyphs[3].shape, ...extra.map((e) => translate(e, -pos[3], 0))]));
  }
  return { glyphs, pos };
}

module.exports = { F, R, a, w, z, set, JOINS };
