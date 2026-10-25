// Final precision pass for direction A (W join, R taper, Z flag); the saffron icon, colours,
// typography and composition are those of the refinement round.
//   cd tools && node build-final.cjs
// Writes to ../final/ : rawza-wordmark.svg, rawza-lockup.svg, rawza-lockup-colour.svg, final-pass.html
const fs = require('fs');
const path = require('path');
const S = require('./system.cjs');
const royal = require('./royal.cjs');
const { place, svg } = require('./svgout.cjs');

const OUT = path.join(__dirname, '..', 'final');
fs.mkdirSync(OUT, { recursive: true });
const GOLD = '#CFAE6E', SAFFRON = '#B9442C';

const before = S.Aref(), after = S.Aref({ preset: S.FINAL_PASS });
const lockGroups = (r) => [{ group: 'saffron-threads', pieces: r.threads }, { group: 'crocus-leaves', pieces: r.leaves }, { group: 'wordmark', pieces: r.wordmark }, { group: 'descriptor', pieces: r.descriptor }];
const NOTE = 'Letters: Cormorant Garamond (SIL OFL 1.1), edited; final precision pass of W, R and Z.';
const art = {
  wordmark: place([{ group: 'wordmark', pieces: after.wordmark }]),
  lockup: place(lockGroups(after)),
};
const colour = { wordmark: GOLD, descriptor: GOLD, 'crocus-leaves': GOLD, 'saffron-threads': SAFFRON };
fs.writeFileSync(path.join(OUT, 'rawza-wordmark.svg'), svg(art.wordmark, 'Wordmark, final', NOTE));
fs.writeFileSync(path.join(OUT, 'rawza-lockup.svg'), svg(art.lockup, 'Lockup, final', NOTE));
fs.writeFileSync(path.join(OUT, 'rawza-lockup-colour.svg'), svg(art.lockup, 'Lockup, final, gold with saffron threads (for dark grounds)', NOTE, colour));

// ---------- page
const cmp = {
  'b-lockup': place(lockGroups(before)), 'a-lockup': art.lockup,
  'b-wordmark': place([{ group: 'wordmark', pieces: before.wordmark }]), 'a-wordmark': art.wordmark,
};
const paths = (a) => a.placed.flatMap((g) => g.pieces.map((p) => (g.group === 'saffron-threads' ? `<path style="fill:var(--th,currentColor)" d="${p.d}"/>` : `<path d="${p.d}"/>`))).join('');
const defs = Object.entries(cmp).map(([id, a]) => `<symbol id="${id}" viewBox="0 0 ${a.W} ${a.H}">${paths(a)}</symbol>`)
  .concat(['b-wordmark', 'a-wordmark'].map((id) => `<g id="raw-${id}">${paths(cmp[id])}</g>`));
let html = fs.readFileSync(path.join(__dirname, 'final-pass.src.html'), 'utf8')
  .replace('<!--SYMBOLS-->', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs.join('')}</defs></svg>`);
for (const [id, a] of Object.entries(cmp)) html = html.split(`{{AR_${id}}}`).join(`${a.W} / ${a.H}`);
const pb = royal.set(S.REFINED).pos, pa = royal.set(S.FINAL_PASS).pos;
const crop = (a, x0, y0, x1, y1) => [x0 + a.dx, y0 + a.dy, x1 - x0, y1 - y0].map((v) => v.toFixed(0));
const C = {
  B_R: crop(cmp['b-wordmark'], 0, -30, pb[1] + 800, 820), A_R: crop(cmp['a-wordmark'], 0, -30, pa[1] + 800, 820),
  B_W: crop(cmp['b-wordmark'], pb[2] - 10, -30, pb[2] + 1060, 740), A_W: crop(cmp['a-wordmark'], pa[2] - 10, -30, pa[2] + 1060, 740),
  B_Z: crop(cmp['b-wordmark'], pb[3] - 30, -50, pb[3] + 700, 740), A_Z: crop(cmp['a-wordmark'], pa[3] - 30, -50, pa[3] + 700, 740),
};
for (const [k, v] of Object.entries(C)) html = html.split(`{{VB_${k}}}`).join(v.join(' ')).split(`{{AR_${k}}}`).join(`${v[2]} / ${v[3]}`);
if (/\{\{/.test(html)) throw new Error('unreplaced placeholder: ' + html.match(/\{\{[^}]+\}\}/)[0]);
fs.writeFileSync(path.join(OUT, 'final-pass.html'), html);

for (const [n, a] of Object.entries(art)) {
  console.log(`${n}: ${a.W} x ${a.H}`);
  for (const g of a.placed) for (const p of g.pieces) console.log(`  ${g.group}/${p.id.padEnd(16)} subpaths ${p.check.subpaths}  anchors ${String(p.check.anchors).padStart(4)}  self-intersections ${p.check.selfX}  counters ${p.check.windingOk ? 'ok' : 'WRONG'}`);
}
console.log('clearance R tail to A: before', royal.set(S.REFINED).clearance.toFixed(1), ' after', royal.set(S.FINAL_PASS).clearance.toFixed(1));
