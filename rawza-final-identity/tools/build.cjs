// Builds the RAWZA identity: six SVG masters and the comparison page.
//   cd tools && npm install && npm run build
// Writes to ../ : direction-{a,b}-{wordmark,lockup,monogram}.svg, final-comparison.html
const fs = require('fs');
const path = require('path');
const S = require('./system.cjs');

const OUT = path.join(__dirname, '..');

const { place, svg } = require('./svgout.cjs');

const A = S.A(), Ashort = S.A({ text: 'short' }), B = S.B(), Bshort = S.B({ text: 'short' });
const NOTE_A = 'Letters: Cormorant Garamond (SIL OFL 1.1), edited; R leg and saffron mark drawn as broad-nib strokes.';
const NOTE_B = 'Letters: Fraunces (SIL OFL 1.1), edited; R leg drawn as a broad-nib stroke.';
const ART = {
  'direction-a-wordmark': [place([{ group: 'wordmark', pieces: A.wordmark }]), 'Direction A, Royal Signature, wordmark', NOTE_A],
  'direction-a-lockup': [place([{ group: 'emblem', pieces: A.emblem }, { group: 'wordmark', pieces: A.wordmark }, { group: 'descriptor', pieces: A.descriptor }]), 'Direction A, Royal Signature, lockup', NOTE_A],
  'direction-a-monogram': [place([{ group: 'monogram', pieces: A.monogram }], { square: true, margin: 70 }), 'Direction A, Royal Signature, saffron mark', NOTE_A],
  'direction-b-wordmark': [place([{ group: 'wordmark', pieces: B.wordmark }]), 'Direction B, Warm Editorial, wordmark', NOTE_B],
  'direction-b-lockup': [place([{ group: 'wordmark', pieces: B.wordmark }, { group: 'descriptor', pieces: B.descriptor }]), 'Direction B, Warm Editorial, lockup', NOTE_B],
  'direction-b-monogram': [place([{ group: 'monogram', pieces: B.monogram }], { square: true, margin: 70 }), 'Direction B, Warm Editorial, R monogram', NOTE_B],
};
for (const [name, [art, title, note]] of Object.entries(ART)) fs.writeFileSync(path.join(OUT, `${name}.svg`), svg(art, title, note));
// the short-descriptor lockups are shown on the page only
const EXTRA = {
  'a-lockup-short': place([{ group: 'emblem', pieces: Ashort.emblem }, { group: 'wordmark', pieces: Ashort.wordmark }, { group: 'descriptor', pieces: Ashort.descriptor }]),
  'b-lockup-short': place([{ group: 'wordmark', pieces: Bshort.wordmark }, { group: 'descriptor', pieces: Bshort.descriptor }]),
};

// ---------- comparison page: every asset as an inline <symbol>, coloured by CSS
const sym = (id, art) => `<symbol id="${id}" viewBox="0 0 ${art.W} ${art.H}">${art.placed.flatMap((g) => g.pieces.map((p) => `<path d="${p.d}"/>`)).join('')}</symbol>`;
const raw = (id, art) => `<g id="${id}">${art.placed.flatMap((g) => g.pieces.map((p) => `<path d="${p.d}"/>`)).join('')}</g>`;
const symbols = [
  raw('raw-a-wordmark', ART['direction-a-wordmark'][0]), raw('raw-b-wordmark', ART['direction-b-wordmark'][0]),
  ...Object.entries(ART).map(([n, [art]]) => sym(n, art)),
  ...Object.entries(EXTRA).map(([n, art]) => sym(n, art)),
];
// close-up crops, in each wordmark's artboard coordinates
const wa = ART['direction-a-wordmark'][0], wb = ART['direction-b-wordmark'][0];
const posA = require('./royal.cjs').set().pos, posB = require('./warm.cjs').set().pos;
const crop = (art, x0, y0, x1, y1) => `${(x0 + art.dx).toFixed(0)} ${(y0 + art.dy).toFixed(0)} ${(x1 - x0).toFixed(0)} ${(y1 - y0).toFixed(0)}`;
const CROPS = {
  '{{CROP_A_R}}': crop(wa, 0, -30, posA[1] + 800, 800),
  '{{CROP_A_W}}': crop(wa, posA[2] - 10, -30, posA[2] + 1060, 800),
  '{{CROP_B_R}}': crop(wb, 0, -20, posB[1] + 470, 820),
};
let html = fs.readFileSync(path.join(__dirname, 'comparison.src.html'), 'utf8')
  .replace('<!--SYMBOLS-->', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${symbols.join('')}</defs></svg>`);
for (const [n, [art]] of Object.entries(ART)) html = html.replace(new RegExp(`\\{\\{AR_${n}\\}\\}`, 'g'), `${art.W} / ${art.H}`);
for (const [n, art] of Object.entries(EXTRA)) html = html.replace(new RegExp(`\\{\\{AR_${n}\\}\\}`, 'g'), `${art.W} / ${art.H}`);
for (const [k, v] of Object.entries(CROPS)) html = html.split(k).join(v);
for (const [k, v] of Object.entries(CROPS)) html = html.split(k.replace('CROP', 'CAR')).join(v.split(' ').slice(2).join(' / '));
if (/\{\{/.test(html)) throw new Error('unreplaced placeholder: ' + html.match(/\{\{[^}]+\}\}/)[0]);
fs.writeFileSync(path.join(OUT, 'final-comparison.html'), html);

// ---------- report
for (const [name, [art]] of Object.entries(ART)) {
  console.log(`${name}: ${art.W} x ${art.H}`);
  for (const g of art.placed) for (const p of g.pieces) console.log(`  ${g.group}/${p.id.padEnd(14)} subpaths ${p.check.subpaths}  anchors ${String(p.check.anchors).padStart(4)}  self-intersections ${p.check.selfX}  counters ${p.check.windingOk ? 'ok' : 'WRONG'}`);
}
console.log('clearance R tail to A:', require('./royal.cjs').set().clearance.toFixed(1), '  R tail to a:', require('./warm.cjs').set().clearance.toFixed(1));
