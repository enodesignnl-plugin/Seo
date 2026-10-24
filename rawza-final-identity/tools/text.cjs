// Set a line of capitals as outlines, letter-spaced, for descriptors.
//   line(file, text, { cap, track }) -> paper item, cap line at y = 0, baseline at y = cap
// cap: cap height in artwork units; track: extra space after each letter, as a fraction of cap
const path = require('path');
const opentype = require('opentype.js');
const { shape, union } = require('./lib.cjs');
const { dropSpecks } = require('./edit.cjs');

const cache = {};
function line(file, text, o = {}) {
  const font = cache[file] || (cache[file] = opentype.loadSync(path.join(__dirname, 'fonts', file)));
  const cap = o.cap ?? 100, size = cap * font.unitsPerEm / font.tables.os2.sCapHeight;
  const k = size / font.unitsPerEm, track = (o.track ?? 0.3) * cap;
  const parts = []; let x = 0;
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    const d = g.getPath(x, cap, size).toPathData(3);
    if (d) parts.push(shape(d).resolveCrossings().reorient(true, true));
    x += g.advanceWidth * k + (i < glyphs.length - 1 ? track : 0);
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * k;
  });
  return dropSpecks(union(parts));
}
module.exports = { line };
