const { loadFont } = require('./glyphs.cjs');
const { translate } = require('./lib.cjs');
const { render } = require('./view.cjs');
const [file, text, out] = process.argv.slice(2);
const F = loadFont(file); let x = 0; const parts = [];
for (const ch of text.split(' ')) { const g = F.glyph(ch); parts.push({ item: translate(g.shape, x, 0) }); x += g.adv + 60; }
render(out, parts, { width: 1800, extra: `<line x1="-500" x2="99999" y1="700" y2="700" stroke="#a33" stroke-width="2"/>` });
console.log(Object.keys(F.font.glyphs.glyphs).length, 'glyphs; names R*:', Object.values(F.font.glyphs.glyphs).map(g=>g.name).filter(n=>/^(R|W|w|a|z|Z|A|r)(\.|$)/.test(n||'')).join(' '));
