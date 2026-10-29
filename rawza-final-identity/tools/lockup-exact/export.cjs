// lockup.json -> Illustrator-ready SVGs: named layers and paths, explicit fills, no styles, defs,
// masks or <use>.   node export.cjs  ->  ../../logo-exact/SVG
const fs = require('fs');
const path = require('path');
const { paper, fix } = require('../lib.cjs');
const OUT = path.join(__dirname, '..', '..', 'logo-exact', 'SVG');
fs.mkdirSync(OUT, { recursive: true });
const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'lockup.json'), 'utf8'));
// Goud: the chosen gold (calmer and deeper than the reference, so it reads as gold and not yellow)
const C = { Goud: '#C9A063', Chocolade: '#2A1A12', Zwart: '#000000', Wit: '#FFFFFF' };
const VOORBEELD = '#EDBD76';   // the lettering colour measured in the reference
const BG = '#29170D';     // background of the reference image
const TOREN = '#DBA667';  // the tower with flower in the reference is a darker gold than the lettering
const K = 2;              // 2 units per reference pixel: the square is 2508 x 2508
const names = ['LETTER_A', 'LETTER_W', 'LETTER_Z', 'LETTER_A_2'];
const items = [['TOREN_EN_BLOEM', L.icon], ['LETTER_R', L.r], ...L.letters.map((l, i) => [names[i], l.d]), ['AFGHAANS_RESTAURANT', L.desc]];
// tight: lockup bounds plus a margin of 60 reference pixels
const bounds = items.map(([, d]) => new paper.CompoundPath({ pathData: d, insert: false }).bounds).reduce((a, b) => a.unite(b));
function svg(col, bg, tight, iconCol = col) {
  const m = 60, ox = tight ? bounds.x - m : 0, oy = tight ? bounds.y - m : 0;
  const w = tight ? bounds.width + 2 * m : 1254, h = tight ? bounds.height + 2 * m : 1254;
  const tr = (d) => { const p = new paper.CompoundPath({ pathData: d, insert: false }); p.translate(new paper.Point(-ox, -oy)); p.scale(K, new paper.Point(0, 0)); return fix(p.pathData, 2); };
  const W = Math.round(w * K), H = Math.round(h * K);
  const p = (id, d, c = col) => `    <path id="${id}" fill="${c}" fill-rule="nonzero" d="${tr(d)}"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA logo, rebuilt from the client's reference image as clean vector paths.
     Colour ${col}${iconCol !== col ? ` (tower ${iconCol})` : ''}${bg ? ` on ${bg}` : ', transparent background'}. AWZA: Cormorant Garamond Medium (outlined),
     descriptor: Montserrat 550 (outlined), swash R and tower with flower: drawn paths. -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${W} ${H}" width="${W / 2}px" height="${H / 2}px">
  <title>RAWZA logo</title>
${bg ? `  <g id="ACHTERGROND">\n    <rect id="VLAK" x="0" y="0" width="${W}" height="${H}" fill="${bg}"/>\n  </g>\n` : ''}  <g id="TOREN_BLOEM">
${p(...items[0], iconCol)}
  </g>
  <g id="WOORDMERK">
${items.slice(1, 6).map((it) => p(...it)).join('\n')}
  </g>
  <g id="ONDERTITEL">
${p(...items[6])}
  </g>
</svg>
`;
}
const files = [];
const w = (f, s) => { fs.writeFileSync(path.join(OUT, f), s); files.push(f); };
w('RAWZA_Logo_Exact_Goud_Op_Chocolade_Vierkant.svg', svg(C.Goud, BG, false));
w('RAWZA_Logo_Exact_Goud_Op_Chocolade.svg', svg(C.Goud, BG, true));
for (const [k, col] of Object.entries(C)) w(`RAWZA_Logo_Exact_${k}.svg`, svg(col, null, true));
// the exact colours of the reference, for comparison
w('RAWZA_Logo_Exact_Voorbeeldkleuren_Op_Chocolade_Vierkant.svg', svg(VOORBEELD, BG, false, TOREN));
w('RAWZA_Logo_Exact_Voorbeeldkleuren.svg', svg(VOORBEELD, null, true, TOREN));
console.log(files.join('\n'));
