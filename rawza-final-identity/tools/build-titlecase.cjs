// Title-case variant "Rawza": the release R with its sweep, the lowercase of the same font, the
// release saffron icon and descriptor. Writes source files in the release format to
// ../titlecase/source, then the Illustrator export runs on them:
//   node build-titlecase.cjs && RAWZA_EXPORT=titlecase node export-illustrator.cjs
const fs = require('fs');
const path = require('path');
const S = require('./system.cjs');
const { place, svg } = require('./svgout.cjs');

const OUT = path.join(__dirname, '..', 'titlecase', 'source');
fs.mkdirSync(OUT, { recursive: true });
const r = S.Atitle(S.TITLE_LOCK);
const groups = [{ group: 'saffron-threads', pieces: r.threads }, { group: 'crocus-leaves', pieces: r.leaves }, { group: 'wordmark', pieces: r.wordmark }, { group: 'descriptor', pieces: r.descriptor }];
const lock = place(groups), wm = place([{ group: 'wordmark', pieces: r.wordmark }]);
const colour = { wordmark: '#CFAE6E', descriptor: '#CFAE6E', 'crocus-leaves': '#CFAE6E', 'saffron-threads': '#C9573A' };
const NOTE = 'Title-case variant: release R, lowercase Cormorant Garamond (SIL OFL 1.1), edited.';
fs.writeFileSync(path.join(OUT, 'rawza-lockup.svg'), svg(lock, 'Rawza lockup (title case)', NOTE));
fs.writeFileSync(path.join(OUT, 'rawza-lockup-colour.svg'), svg(lock, 'Rawza lockup (title case), gold with saffron threads', NOTE, colour));
fs.writeFileSync(path.join(OUT, 'rawza-wordmark.svg'), svg(wm, 'Rawza wordmark (title case)', NOTE));
for (const [n, a] of Object.entries({ lockup: lock, wordmark: wm })) {
  console.log(`${n}: ${a.W} x ${a.H}`);
  for (const g of a.placed) for (const p of g.pieces) console.log(`  ${g.group}/${p.id.padEnd(16)} subpaths ${p.check.subpaths}  anchors ${String(p.check.anchors).padStart(4)}  self-intersections ${p.check.selfX}  counters ${p.check.windingOk ? 'ok' : 'WRONG'}`);
}
console.log('clearance R tail to a:', require('./lower.cjs').set(S.TITLE_LOCK.preset).clearance.toFixed(1));
