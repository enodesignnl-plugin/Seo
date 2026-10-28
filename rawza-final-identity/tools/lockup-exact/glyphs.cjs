// Cormorant Garamond letters as paper shapes in font units (y down, baseline at 0), with the two
// changes the reference draws differently:
//   W: the thin middle stroke stops where it meets the thick one, instead of crossing it to a
//      serif of its own (three serifs on top, as in the reference).
//   Z: the top-left beak stops at the cap line instead of rising above it.
//   A: the crossbar sits 13 units higher (reference: its centre 61.5 px above the baseline at 216 px).
const { paper, union, inter, rect } = require('../lib.cjs');
const { dropSpecks } = require('../edit.cjs');
function contours(font, ch) {
  const d = font.charToGlyph(ch).getPath(0, 0, font.unitsPerEm).toPathData(4);
  return d.split(/(?=M)/).filter((s) => s.trim()).map((s) => new paper.Path({ pathData: s, insert: false }));
}
const whole = (cs) => dropSpecks(union(cs.map((c) => { const k = c.clone({ insert: false }); if (!k.clockwise) k.reverse(); return k; })));
function W(font) {
  const [c1, c2] = contours(font, 'W');   // the third contour is the crossing stroke with its own serif
  return dropSpecks(union([whole([c1]), whole([c2])]));
}
function Z(font) {
  return dropSpecks(inter(whole(contours(font, 'Z')), rect(-100, -625, 800, 100)));
}
function A(font) {
  const [bar, body] = contours(font, 'A');
  bar.translate(new paper.Point(0, -13));
  return whole([body, bar]);
}
function glyph(font, ch) {
  if (ch === 'A') return A(font);
  if (ch === 'W') return W(font);
  if (ch === 'Z') return Z(font);
  return whole(contours(font, ch));
}
module.exports = { glyph };
