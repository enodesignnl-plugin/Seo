// DIRECTION B — THE EDITORIAL  ·  Rawza
// Foundation: Bodoni Moda (SIL OFL 1.1), static instance of the variable font at optical size 11,
// wght 450 — the sturdier, lower-contrast text cut: hairlines 18–21 units instead of 8 (v4).
// Outlines from the font, edited; nothing is scaled. Units: cap height 700, baseline y = 700.
//
//  R  the font's R, its stem trimmed to the weight of the lowercase stems (96.6 → 90).
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

const F = loadFont('BodoniModaV-11-450.ttf');
const XH = F.xHeight;                 // 270.67: x-height line (y)
const BAR = 18.3;                     // hairline: z top bar and w serifs are 18.3 thick

function R() {
  const g = F.glyph('R');
  // stem 129–226: take 3.3 from each side between the serifs (the serifs reach 3.3 further inwards)
  const s = sub(g.shape, union([rect(128.5, 18, 132.3, 682), rect(222.7, 18.2, 226.5, 336.8), rect(222.7, 355.2, 226.5, 682)]));
  return { shape: dropSpecks(s), adv: g.adv };
}

function a() {
  const g = F.glyph('a');
  return { shape: g.shape, adv: g.adv };
}

// w: right arm = hairline from vertex (470–493, 709) to the serif (613–634, 289); serif 529–701 at 271–289
function w(join) {
  const g = F.glyph('w');
  if (!join) return { shape: g.shape, adv: g.adv };
  // the right serif goes; the join (drawn with the z) takes over the top of the arm
  let s = sub(g.shape, rect(520, 250, 720, 289.01));
  if (join === 'corner') s = union([s, poly([[613, 289], [634, 289], [640.1, XH], [619.1, XH]])]);   // arm run on to the x-height
  return { shape: dropSpecks(s), adv: g.adv };
}

function z(o = {}) {
  const g = F.glyph('z');
  let s = thinDiagonal(g.shape, { t: o.thin ?? 8, top: XH });
  // drop the top-left flag, its bracket under the bar, and the start of the bar
  if (o.cutFlag) s = sub(s, union([rect(0, 250, o.cutFlag, 460), rect(0, 289.3, 200, 380)]));
  return { shape: dropSpecks(s), adv: g.adv };
}

// The three w–z joins. Each returns extra shapes in word coordinates given the w and z positions.
const JOINS = {
  // 1 · shared hairline: the w's right serif runs on and becomes the z's top bar
  bar: { gapZ: 34, cutFlag: 96, link(xw, xz) {
    return [rect(xw + 529, XH, xz + 120, XH + BAR)];
  } },
  // 2 · corner: the w's last stroke rises and turns sharply into the z's top bar (no serif)
  corner: { gapZ: 0, cutFlag: 96, link(xw, xz) {
    return [rect(xw + 619.1, XH, xz + 120, XH + BAR)];
  } },
  // 3 · rounded turn: the w's last stroke turns into the z's bar through a small curve, like a pen join
  turn: { gapZ: 10, cutFlag: 96, link(xw, xz) {
    const X = (x) => xw + x, k = 0.336;                     // arm slope (dx per dy)
    const lo = (y) => 613 - (y - 289) * k, ro = (y) => 634 - (y - 289) * k;   // arm edges
    return [shape(`M${X(lo(340))},340 L${X(lo(309))},309 C${X(lo(309) + 8)},285 ${X(628)},${XH} ${X(655)},${XH} ` +
      `L${xz + 120},${XH} L${xz + 120},${XH + BAR} L${X(664)},${XH + BAR} C${X(648)},${XH + BAR} ${X(ro(305) + 4)},293 ${X(ro(305))},305 ` +
      `L${X(ro(340))},340 Z`)];
  } },
};

// ---- the wordmark
const FINAL = { join: 'turn' };
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
    const want = pos[2] + 640 + J.gapZ - 96 + (o.dz ?? 0);
    const dz = want - pos[3];
    for (let i = 3; i < pos.length; i++) pos[i] += dz;
    const extra = J.link(pos[2], pos[3]);
    // the link belongs to the z (its top bar), drawn in z coordinates
    glyphs[3].shape = dropSpecks(union([glyphs[3].shape, ...extra.map((e) => translate(e, -pos[3], 0))]));
  }
  return { glyphs, pos };
}

module.exports = { F, R, a, w, z, set, JOINS };
