// Swash R variant of direction A, after the client's reference: the calligraphic swash R
// (swash.cjs) with the approved A, W, Z, A of the release, and the descriptor in Montserrat nested
// over the R's tail.   cd tools && node build-swash.cjs   ->  ../swash-r/svg/
const fs = require('fs');
const path = require('path');
const SW = require('./swash.cjs');
const { place, svg } = require('./svgout.cjs');

const OUT = path.join(__dirname, '..', 'swash-r', 'svg');
fs.mkdirSync(OUT, { recursive: true });
const COL = { gold: '#D6B583', chocolate: '#2A1A12', black: '#000000', white: '#FFFFFF' };
const rest = SW.lockup(), full = SW.lockup({ text: 'AFGHAANS RESTAURANT', descCap: 100, descTrack: 0.5, descInset: 120 });
const art = {
  Logo_Restaurant: place([{ group: 'wordmark', pieces: rest.wordmark }, { group: 'descriptor', pieces: rest.descriptor }]),
  Logo_Afghaans_Restaurant: place([{ group: 'wordmark', pieces: full.wordmark }, { group: 'descriptor', pieces: full.descriptor }]),
  Wordmark: place([{ group: 'wordmark', pieces: rest.wordmark }]),
  R: place([{ group: 'wordmark', pieces: rest.wordmark.slice(0, 1) }]),
};
const SETS = { Logo_Restaurant: ['gold', 'chocolate', 'black', 'white'], Logo_Afghaans_Restaurant: ['gold', 'chocolate'], Wordmark: ['gold', 'chocolate'], R: ['gold', 'chocolate'] };
const NOTE = 'Swash R: drawn as three pointed-pen strokes. A, W, Z, A: direction A release (Cormorant Garamond, SIL OFL 1.1, edited). Descriptor: Montserrat 500 (SIL OFL 1.1), outlined.';
for (const [name, cs] of Object.entries(SETS)) for (const c of cs) {
  const f = `RAWZA_SwashR_${name}_${c[0].toUpperCase()}${c.slice(1)}.svg`;
  fs.writeFileSync(path.join(OUT, f), svg(art[name], `Swash R — ${name.replace(/_/g, ' ')}, ${c}`, NOTE, { wordmark: COL[c], descriptor: COL[c] }));
  console.log(f);
}
for (const [n, a] of Object.entries(art)) {
  console.log(`${n}: ${a.W} x ${a.H}`);
  for (const g of a.placed) for (const p of g.pieces) console.log(`  ${g.group}/${p.id.padEnd(12)} subpaths ${p.check.subpaths}  anchors ${String(p.check.anchors).padStart(4)}  self-intersections ${p.check.selfX}  counters ${p.check.windingOk ? 'ok' : 'WRONG'}`);
}
