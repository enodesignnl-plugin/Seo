// RAWZA icon marks: three double-leaf symbols (leafmark.cjs), one colour each.
//   cd tools && node build-icons.cjs   ->  ../icon-marks/svg/ and ../icon-marks/.art.json
const fs = require('fs');
const path = require('path');
const { fix, translate } = require('./lib.cjs');
const { inspect } = require('./svgout.cjs');
const L = require('./leafmark.cjs');

const DIR = path.join(__dirname, '..', 'icon-marks'), OUT = path.join(DIR, 'svg');
fs.mkdirSync(OUT, { recursive: true });
const COL = { Gold: '#D6B583', Black: '#1A1410' };
const MARKS = {
  Lancet: { make: L.lancet, title: 'Lancet', note: 'Two leaves lean together; their tips meet and the space between them is a tall pointed arch. Each leaf has a fine midrib.' },
  Interlace: { make: L.interlace, title: 'Interlace', note: 'The leaves cross just below the apex, one passing over the other with a fine gap, as in woven or carved interlace.' },
  Contrast: { make: L.contrast, title: 'Contrast', note: 'A hairline leaf and a full leaf meet at the apex, thick and thin as in a high-contrast serif capital.' },
};
const art = {};
for (const [name, m] of Object.entries(MARKS)) {
  const { left, right } = m.make();
  // square artboard, the mark centred, margin 12 % of the mark's height
  const b = left.bounds.unite(right.bounds), M = Math.round(b.height * 0.12);
  const S = Math.ceil(Math.max(b.width, b.height) + 2 * M);
  const dx = S / 2 - b.center.x, dy = S / 2 - b.center.y;
  const pieces = [['LEAF_LEFT', translate(left, dx, dy)], ['LEAF_RIGHT', translate(right, dx, dy)]];
  const checks = pieces.map(([id, it]) => [id, inspect(it)]);
  art[name] = { S, pieces: pieces.map(([id, it]) => ({ id, d: fix(it.pathData, 2) })) };
  for (const [c, col] of Object.entries(COL)) {
    const body = art[name].pieces.map((p) => `    <path id="${p.id}" fill="${col}" fill-rule="nonzero" d="${p.d}"/>`).join('\n');
    fs.writeFileSync(path.join(OUT, `RAWZA_Icon_${name}_${c}.svg`), `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA icon — ${m.title}, ${c.toLowerCase()} ${col}. ${m.note}
     Vector outlines drawn as cubic curves, transparent background, one colour. -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${S} ${S}" width="${S / 2}px" height="${S / 2}px">
  <title>RAWZA icon — ${m.title}</title>
  <g id="ICON_${name.toUpperCase()}">
${body}
  </g>
</svg>
`);
  }
  console.log(name, S, checks.map(([id, c]) => `${id}: subpaths ${c.subpaths} anchors ${c.anchors} selfX ${c.selfX} counters ${c.windingOk ? 'ok' : 'WRONG'}`).join(' | '));
}
fs.writeFileSync(path.join(DIR, '.art.json'), JSON.stringify(art));
