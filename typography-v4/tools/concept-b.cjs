// CONCEPT B — "Editorial Elegance"  ·  Rawza
// Foundation: Bodoni Moda (Owen Earl, SIL OFL 1.1), static instance of the variable font at
// optical size 24, wght 450. Outlines come from the font and are edited; nothing is scaled.
// Units: cap height 700, baseline y = 700.
//
//  R  the font's Didone R with its curled leg; the flick at the foot is drawn out along the baseline.
//  a  the font's a (ball terminal, curled tail). The final a takes a final form: its tail is drawn
//     out the same way, so the word opens and closes with the same stroke.
//  w  the font's w.
//  z  the diagonal is rebuilt 10 units thinner, so it no longer outweighs the a and the w.
const { rect } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { thinDiagonal, stretchX } = require('./edit.cjs');

const F = loadFont('BodoniModaV-24-450.ttf');

function R() {
  const g = F.glyph('R');
  return { shape: stretchX(g.shape, { x0: 575, x1: 650, L: 30, yMin: 660 }), adv: g.adv };
}

function a(o = {}) {
  const g = F.glyph('a');
  const L = o.final ? 56 : 0;
  return { shape: L ? stretchX(g.shape, { x0: 410, x1: 495, L, yMin: 630 }) : g.shape, adv: g.adv + L };
}

function w() {
  const g = F.glyph('w');
  return { shape: g.shape, adv: g.adv };
}

function z() {
  const g = F.glyph('z');
  return { shape: thinDiagonal(g.shape, { t: 10, top: F.xHeight }), adv: g.adv };
}

// ---- the wordmark: optical spacing measured between x-height and baseline
function set() {
  const glyphs = [
    { id: 'letter-R', ...R() }, { id: 'letter-a-1', ...a() }, { id: 'letter-w', ...w() },
    { id: 'letter-z', ...z() }, { id: 'letter-a-2', ...a({ final: true }) }];
  // equal mean gap for every pair; a–w and w–z get a little more where serifs meet at the x-height
  const pos = space(glyphs, { y0: F.xHeight, y1: 700, depth: 90, gap: 55, minGap: 16, extra: [0, 0, 12, 20, 0] });
  // R–a: the a tucks under the R's bowl, clear of the R's drawn-out flick
  const d = 636 - pos[1];
  for (let i = 1; i < pos.length; i++) pos[i] += d;
  return { glyphs, pos };
}

module.exports = { F, R, a, w, z, set };
