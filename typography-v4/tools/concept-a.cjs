// CONCEPT A — "Royal Signature"  ·  RAWZA
// Foundation: Cormorant Garamond (Christian Thalmann, SIL OFL 1.1), static instance of the
// variable font at wght 500. Outlines come from the font and are edited with boolean operations;
// nothing is scaled. Units: cap height 700, baseline y = 700.
//
//  R  the font's R. Its foot runs on as a serif-weight hairline into the first A (set() below).
//  A  the font's A with the apex cut flat on the cap line: a chiselled, inscriptional top.
//  W  the font's own uncrossed W (stylistic set 3): two Vs that meet at the cap line, no crossing.
//     Its middle apex and vertices get the same flat cut as the A.
//  Z  the diagonal is rebuilt 12 units thinner, so it no longer outweighs the A's thick stroke;
//     the top beak is trimmed at the cap line.
const { rect, union, sub, inter } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { thinDiagonal, dropSpecks } = require('./edit.cjs');

const F = loadFont('CormorantGaramondV-500.ttf');
const capCut = (s) => inter(s, rect(-100, 0, 1200, 700));     // flat cut on the cap line and baseline

function R() {
  const g = F.glyph('R');
  return { shape: g.shape, adv: g.adv };
}

function A() {
  const g = F.glyph('A');
  return { shape: capCut(g.shape), adv: g.adv };
}

function W() {
  const g = F.glyph('W.ss03');
  return { shape: capCut(g.shape), adv: g.adv };
}

function Z() {
  const g = F.glyph('Z');
  const s = thinDiagonal(g.shape, { t: 12, r: 9, top: 0, inset: 9 });
  return { shape: dropSpecks(inter(s, rect(-100, 0, 900, 800))), adv: g.adv };
}

// ---- the wordmark: optical spacing, then the R–A join
function set() {
  const r = R(), a1 = A(), w = W(), z = Z(), a2 = A();
  const glyphs = [
    { id: 'letter-R', ...r }, { id: 'letter-A-1', ...a1 }, { id: 'letter-W', ...w },
    { id: 'letter-Z', ...z }, { id: 'letter-A-2', ...a2 }];
  // equal mean gap for every pair (deep counters clamped), a collision guard for serifs,
  // 25 units more for W–Z where the W's serif and the Z's beak meet at the cap line
  const pos = space(glyphs, { y0: 0, y1: 700, depth: 120, gap: 105, minGap: 30, extra: [0, 0, 0, 25, 0] });
  // R–A is a joined pair: the A sits where the R's foot reaches its serif
  const d = 800 - pos[1];
  for (let i = 1; i < pos.length; i++) pos[i] += d;
  // The A's rounded serif tip is cut off and the R's hairline runs on underneath the serif, so the
  // two letters overlap instead of meeting edge to edge (no hairline seam in any renderer).
  const tip = a1.shape.bounds.x;
  glyphs[1].shape = dropSpecks(sub(a1.shape, rect(tip - 10, 600, tip + 5, 720)));
  const hair = rect(r.adv - 80, 686.5, pos[1] + tip + 22, 700);    // 686.5: top of the R's foot
  glyphs[0].shape = dropSpecks(union([r.shape, hair]));
  return { glyphs, pos };
}

module.exports = { F, R, A, W, Z, set };
