// Load glyph outlines from a font file as paper.js shapes, scaled so the cap height is 700 units
// (baseline at y = 700, cap line at y = 0, y pointing down as in SVG).
const path = require('path');
const opentype = require('opentype.js');
const { shape } = require('./lib.cjs');

const CAP = 700;
// fonts keep overlapping contours (crossbars, stroke joints); merge them into clean outlines
function clean(s) {
  const r = s.resolveCrossings();
  return r.reorient(true, true);
}
function loadFont(file) {
  const font = opentype.loadSync(path.join(__dirname, 'fonts', file));
  const k = CAP / font.tables.os2.sCapHeight;            // font units -> working units
  const byName = {};
  for (let i = 0; i < font.glyphs.length; i++) { const g = font.glyphs.get(i); if (g.name) byName[g.name] = g; }
  function glyph(name) {
    const g = byName[name] || font.charToGlyph(name);
    const p = g.getPath(0, CAP, font.unitsPerEm * k);
    return { name, shape: clean(shape(p.toPathData(3) || 'M0,0')), adv: g.advanceWidth * k, g };
  }
  const kern = (a, b) => font.getKerningValue(byName[a] || font.charToGlyph(a), byName[b] || font.charToGlyph(b)) * k;
  return { font, k, glyph, kern, xHeight: CAP - font.tables.os2.sxHeight * k };
}
module.exports = { loadFont, CAP };
