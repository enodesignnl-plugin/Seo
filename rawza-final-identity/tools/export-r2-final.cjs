// Illustrator package of the best round 2 version (no design changes): the short swash R with the
// tail that runs out to a point, the release A, W, Z, A, and the heavier descriptor (Montserrat
// SemiBold) — the same artwork as round-2/svg/RAWZA_R2_L1_Swash_*.
//   cd tools && node export-r2-final.cjs   ->  ../round-2/illustrator-final/SVG
// Every path has a name and an explicit fill and fill-rule; no styles, defs, masks or <use>; the
// descriptor is one compound path per letter; one version has the descriptor as live text.
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { paper, fix } = require('./lib.cjs');
const { place } = require('./svgout.cjs');
const R2 = require('./round2.cjs');

const DIR = path.join(__dirname, '..', 'round-2', 'illustrator-final'), OUT = path.join(DIR, 'SVG');
fs.mkdirSync(OUT, { recursive: true });
const C = { Gold: '#D6B583', Chocolate: '#2A1A12', Black: '#000000', White: '#FFFFFF' };
const LETTERS = [['letter-R', 'LETTER_R'], ['letter-A-1', 'LETTER_A_01'], ['letter-W', 'LETTER_W'], ['letter-Z', 'LETTER_Z'], ['letter-A-2', 'LETTER_A_02']];
const VARIANTS = { Afghaans_Restaurant: { text: 'full', words: 'AFGHAANS RESTAURANT' }, Restaurant: { text: 'short', words: 'RESTAURANT' } };

const item = (d) => new paper.CompoundPath({ pathData: d, insert: false });
// one compound path per letter: each outer contour with the counters inside it, in reading order
function splitDescriptor(d, text) {
  const kids = item(d).children.slice();
  const outer = kids.filter((k) => !kids.some((o) => o !== k && o.bounds.contains(k.bounds)));
  outer.sort((a, b) => a.bounds.x - b.bounds.x);
  const letters = text.replace(/ /g, '').split('');
  if (outer.length !== letters.length) throw new Error(`descriptor: ${outer.length} contours for ${letters.length} letters`);
  return outer.map((o, i) => {
    const holes = kids.filter((k) => k !== o && o.bounds.contains(k.bounds));
    const cp = new paper.CompoundPath({ children: [o, ...holes].map((k) => k.clone({ insert: false })), insert: false });
    return { id: `DESC_${String(i + 1).padStart(2, '0')}_${letters[i]}`, d: fix(cp.pathData, 2) };
  });
}
const files = [];
function write(file, { W, H, title, note, layers }) {
  const body = layers.map((L) => `  <g id="${L.id}">\n${L.paths.map((p) => p.text
    ? `    ${p.text}`
    : `    <path id="${p.id}" fill="${p.fill}" fill-rule="nonzero" d="${p.d}"/>`).join('\n')}\n  </g>`).join('\n');
  fs.writeFileSync(path.join(OUT, file), `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${title}. ${note}
     Swash R drawn as vector strokes; A, W, Z, A from the approved release (Cormorant Garamond, SIL OFL 1.1, edited);
     descriptor Montserrat SemiBold (SIL OFL 1.1). Units: 1 unit = 1/700 of the cap height of AWZA.
     Vector outlines, transparent background, explicit colours. -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${W} ${H}" width="${W / 4}px" height="${H / 4}px">
  <title>${title}</title>
${body}
</svg>
`);
  files.push(file);
}
const report = {};
for (const [v, { text, words }] of Object.entries(VARIANTS)) {
  const groups = R2.swash({ text });
  const art = place(groups, { margin: 80 });
  const pm = Object.fromEntries(art.placed.flatMap((g) => g.pieces.map((p) => [p.id, p.d])));
  const desc = splitDescriptor(pm.descriptor, words);
  const layers = (col) => [
    { id: '01_WORDMARK_RAWZA', paths: LETTERS.map(([k, id]) => ({ id, fill: col, d: pm[k] })) },
    { id: '02_DESCRIPTOR', paths: desc.map((p) => ({ ...p, fill: col })) },
  ];
  for (const [name, col] of Object.entries(C)) {
    write(`RAWZA_Logo_${v}_${name}.svg`, { W: art.W, H: art.H, title: `RAWZA logo, ${words}, ${name.toLowerCase()}`, note: `One colour: ${col}.`, layers: layers(col) });
  }
  // live text at the exact origin of the outlined descriptor
  const fit = groups.fit, o = R2.DESC;
  const font = opentype.loadSync(path.join(__dirname, 'fonts', o.font));
  const size = o.cap * font.unitsPerEm / font.tables.os2.sCapHeight, track = fit.track * o.cap;
  const t0 = R2.desc(words, { track: fit.track });
  const placed = art.placed.find((g) => g.group === 'descriptor').pieces[0];
  const x0 = item(placed.d).bounds.x - t0.bounds.x;
  const base = item(placed.d).bounds.y - t0.bounds.y + o.cap;
  report[v] = { size: +size.toFixed(2), letterSpacing: +track.toFixed(2), illustratorTracking: Math.round(track / size * 1000), x: +x0.toFixed(2), baseline: +base.toFixed(2) };
  const live = `<text id="DESCRIPTOR_TEXT" x="${x0.toFixed(2)}" y="${base.toFixed(2)}" fill="${C.Black}" font-family="Montserrat, Montserrat-SemiBold, sans-serif" font-weight="600" font-size="${size.toFixed(2)}" letter-spacing="${track.toFixed(2)}" kerning="0" style="font-kerning:none" xml:space="preserve">${words}</text>`;
  write(`RAWZA_Logo_${v}_Descriptor_Editable.svg`, { W: art.W, H: art.H, title: `RAWZA logo with editable descriptor, ${words}`,
    note: 'The descriptor is live text: requires the font Montserrat SemiBold (SIL OFL 1.1), kerning 0. RAWZA is outlines.',
    layers: [layers(C.Black)[0], { id: '02_DESCRIPTOR', paths: [{ text: live }] }] });
  const bad = art.placed.flatMap((g) => g.pieces).filter((p) => p.check.selfX || !p.check.windingOk);
  console.log(v, art.W, 'x', art.H, bad.length ? 'PROBLEM' : 'paths ok', 'clearance', fit.clearance.toFixed(0));
}
fs.writeFileSync(path.join(DIR, '.edit.json'), JSON.stringify(report, null, 1));
console.log(files.join('\n'));
console.log(JSON.stringify(report));
