// Refinement round for direction A: tucked W, finer R sweep, saffron crocus icon.
//   cd tools && node build-refined.cjs
// Writes to ../refined/ : rawza-wordmark.svg, rawza-lockup.svg, rawza-lockup-colour.svg,
// rawza-saffron-icon.svg, rawza-saffron-icon-colour.svg, refinement.html
const fs = require('fs');
const path = require('path');
const S = require('./system.cjs');
const { place, svg } = require('./svgout.cjs');

const OUT = path.join(__dirname, '..', 'refined');
fs.mkdirSync(OUT, { recursive: true });
const GOLD = '#CFAE6E', SAFFRON = '#B9442C';

const cur = S.A(), ref = S.Aref();
// threads first: the leaves sit over the start of the threads
const lockGroups = (r) => [{ group: 'saffron-threads', pieces: r.threads }, { group: 'crocus-leaves', pieces: r.leaves }, { group: 'wordmark', pieces: r.wordmark }, { group: 'descriptor', pieces: r.descriptor }];
const iconGroups = [{ group: 'saffron-threads', pieces: ref.iconAlone.threads }, { group: 'crocus-leaves', pieces: ref.iconAlone.leaves }];
const NOTE = 'Letters: Cormorant Garamond (SIL OFL 1.1), edited; R leg drawn as a broad-nib stroke; W joined at mid-height.';
const art = {
  wordmark: place([{ group: 'wordmark', pieces: ref.wordmark }]),
  lockup: place(lockGroups(ref)),
  icon: place(iconGroups, { square: true, margin: 60 }),
};
const colour = { wordmark: GOLD, descriptor: GOLD, 'crocus-leaves': GOLD, 'saffron-threads': SAFFRON };
const files = {
  'rawza-wordmark.svg': svg(art.wordmark, 'Direction A refined, wordmark', NOTE),
  'rawza-lockup.svg': svg(art.lockup, 'Direction A refined, lockup', NOTE),
  'rawza-lockup-colour.svg': svg(art.lockup, 'Direction A refined, lockup in gold with saffron threads (for dark grounds)', NOTE, colour),
  'rawza-saffron-icon.svg': svg(art.icon, 'Saffron crocus icon', 'Leaves and threads as separate groups.'),
  'rawza-saffron-icon-colour.svg': svg(art.icon, 'Saffron crocus icon, gold with saffron threads', 'Leaves and threads as separate groups.', colour),
};
for (const [f, s] of Object.entries(files)) fs.writeFileSync(path.join(OUT, f), s);

// ---------- page: symbols whose thread paths take their colour from --th (falls back to the text colour)
const cmp = {
  'cur-lockup': place([{ group: 'emblem', pieces: cur.emblem }, { group: 'wordmark', pieces: cur.wordmark }, { group: 'descriptor', pieces: cur.descriptor }]),
  'cur-wordmark': place([{ group: 'wordmark', pieces: cur.wordmark }]),
  'cur-icon': place([{ group: 'emblem', pieces: cur.emblem }], { square: true, margin: 60 }),
  'ref-lockup': art.lockup, 'ref-wordmark': art.wordmark, 'ref-icon': art.icon,
};
const paths = (a) => a.placed.flatMap((g) => g.pieces.map((p) => (g.group === 'saffron-threads' ? `<path style="fill:var(--th,currentColor)" d="${p.d}"/>` : `<path d="${p.d}"/>`))).join('');
const defs = Object.entries(cmp).map(([id, a]) => `<symbol id="${id}" viewBox="0 0 ${a.W} ${a.H}">${paths(a)}</symbol>`)
  .concat(['cur-wordmark', 'ref-wordmark'].map((id) => `<g id="raw-${id}">${paths(cmp[id])}</g>`));
let html = fs.readFileSync(path.join(__dirname, 'refinement.src.html'), 'utf8')
  .replace('<!--SYMBOLS-->', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs.join('')}</defs></svg>`);
for (const [id, a] of Object.entries(cmp)) html = html.split(`{{AR_${id}}}`).join(`${a.W} / ${a.H}`);
// close-up crops in each wordmark's artboard coordinates
const pc = require('./royal.cjs').set().pos, pr = require('./royal.cjs').set(S.REFINED).pos;
const crop = (a, x0, y0, x1, y1) => [x0 + a.dx, y0 + a.dy, x1 - x0, y1 - y0].map((v) => v.toFixed(0));
const C = {
  CUR_R: crop(cmp['cur-wordmark'], 0, -30, pc[1] + 800, 820), REF_R: crop(cmp['ref-wordmark'], 0, -30, pr[1] + 800, 820),
  CUR_W: crop(cmp['cur-wordmark'], pc[2] - 10, -30, pc[2] + 1060, 740), REF_W: crop(cmp['ref-wordmark'], pr[2] - 10, -30, pr[2] + 1060, 740),
};
for (const [k, v] of Object.entries(C)) html = html.split(`{{VB_${k}}}`).join(v.join(' ')).split(`{{AR_${k}}}`).join(`${v[2]} / ${v[3]}`);
if (/\{\{/.test(html)) throw new Error('unreplaced placeholder: ' + html.match(/\{\{[^}]+\}\}/)[0]);
fs.writeFileSync(path.join(OUT, 'refinement.html'), html);

for (const [n, a] of Object.entries(art)) {
  console.log(`${n}: ${a.W} x ${a.H}`);
  for (const g of a.placed) for (const p of g.pieces) console.log(`  ${g.group}/${p.id.padEnd(16)} subpaths ${p.check.subpaths}  anchors ${String(p.check.anchors).padStart(4)}  self-intersections ${p.check.selfX}  counters ${p.check.windingOk ? 'ok' : 'WRONG'}`);
}
console.log('clearance R tail to A:', require('./royal.cjs').set(S.REFINED).clearance.toFixed(1));
