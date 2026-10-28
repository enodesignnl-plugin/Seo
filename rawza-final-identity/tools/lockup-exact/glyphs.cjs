// Cormorant Garamond letters as paper shapes in font units (y down, baseline at 0), with the two
// changes the reference draws differently:
//   W: the thin middle stroke stops where it meets the thick one, instead of crossing it to a
//      serif of its own (three serifs on top, as in the reference).
//   Z: the top-left beak stops at the cap line instead of rising above it, and the bottom bar with its
//      serif ends right under the end of the top bar (535 units) instead of 29 units further out.
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
  const z = dropSpecks(inter(whole(contours(font, 'Z')), rect(-100, -625, 800, 100)));
  const k = (535 - 300) / (564 - 300);   // bottom right part (y above -160, x beyond 300) narrowed about x 300
  for (const p of z.children || [z]) for (const sg of p.segments) {
    if (sg.point.y > -160 && sg.point.x > 300) {
      sg.point = new paper.Point(300 + (sg.point.x - 300) * k, sg.point.y);
      sg.handleIn = new paper.Point(sg.handleIn.x * k, sg.handleIn.y); sg.handleOut = new paper.Point(sg.handleOut.x * k, sg.handleOut.y);
    }
  }
  return z;
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
