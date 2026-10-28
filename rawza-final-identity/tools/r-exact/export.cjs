// The traced reference R as Illustrator-ready files: one named path, explicit fill and fill-rule,
// no styles, defs, masks or <use>.   node export.cjs  ->  ../../sierlijke-r-exact/SVG
const fs = require('fs');
const path = require('path');
const { paper, fix } = require('../lib.cjs');
const OUT = path.join(__dirname, '..', '..', 'sierlijke-r-exact', 'SVG');
fs.mkdirSync(OUT, { recursive: true });
const C = { Goud_Referentie: '#EDBD76', Goud: '#D6B583', Chocolade: '#2A1A12', Zwart: '#000000', Wit: '#FFFFFF' };
const BG = '#29170D';   // the background of the reference image
const r = new paper.CompoundPath({ pathData: JSON.parse(fs.readFileSync(path.join(__dirname, 'shape.json'), 'utf8')).d, insert: false });
const m = 120, b = r.bounds;
r.translate(new paper.Point(m - b.x, m - b.y));
const W = Math.ceil(b.width + 2 * m), H = Math.ceil(b.height + 2 * m), d = fix(r.pathData, 2);
const write = (file, col, bg) => fs.writeFileSync(path.join(OUT, file), `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA, sierlijke R: traced from the client's reference image and redrawn as smooth strokes.
     One closed vector path, colour ${col}${bg ? ` on ${bg}` : ', transparent background'}. -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${W} ${H}" width="${W / 4}px" height="${H / 4}px">
  <title>RAWZA sierlijke R</title>
${bg ? `  <g id="ACHTERGROND">\n    <rect id="VLAK" x="0" y="0" width="${W}" height="${H}" fill="${bg}"/>\n  </g>\n` : ''}  <g id="SIERLIJKE_R">
    <path id="LETTER_R" fill="${col}" fill-rule="nonzero" d="${d}"/>
  </g>
</svg>
`);
for (const [k, col] of Object.entries(C)) write(`RAWZA_Sierlijke_R_Exact_${k}.svg`, col);
write('RAWZA_Sierlijke_R_Exact_Goud_Op_Chocolade.svg', C.Goud_Referentie, BG);
console.log(W, H, 'segments', r.segments ? r.segments.length : r.children.reduce((s, c) => s + c.segments.length, 0), 'closed', r.closed ?? r.children.every((c) => c.closed));
