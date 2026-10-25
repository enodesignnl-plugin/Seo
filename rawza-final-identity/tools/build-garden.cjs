// Concept B — Garden: a second, separate direction for Rawza (see garden.cjs and bud.cjs).
//   cd tools && node build-garden.cjs
// Writes to ../concept-b-garden/svg/ : logo (AFGHAANS RESTAURANT) in gold, chocolate, black and white;
// logo (RESTAURANT) in gold and chocolate; wordmark, symbol and signature R in gold and chocolate.
// Direction A (release/, illustrator-export/, titlecase/) is not touched.
const fs = require('fs');
const path = require('path');
const G = require('./garden.cjs');
const royal = require('./royal.cjs');
const { RELEASE } = require('./system.cjs');
const BUD = require('./bud.cjs');
const { place, svg } = require('./svgout.cjs');

const OUT = path.join(__dirname, '..', 'concept-b-garden', 'svg');
fs.mkdirSync(OUT, { recursive: true });
const COL = { gold: '#D6BC8A', chocolate: '#2A1A12', black: '#000000', white: '#FFFFFF' };

const full = G.lockup(G.LOCK), short = G.lockup({ ...G.LOCK, text: 'short' });
const groups = (r) => [{ group: 'symbol', pieces: r.mark }, { group: 'wordmark', pieces: r.wordmark }, { group: 'descriptor', pieces: r.descriptor }];
const sigR = royal.R(900, RELEASE.R);
const art = {
  Logo: place(groups(full)),
  Logo_Restaurant: place(groups(short)),
  Wordmark: place([{ group: 'wordmark', pieces: full.wordmark }]),
  Symbol: place([{ group: 'symbol', pieces: [{ id: 'bud', item: BUD.bud2() }] }], { square: true, margin: 80 }),
  Signature_R: place([{ group: 'signature-r', pieces: [{ id: 'letter-R', item: sigR.shape }] }], { margin: 60 }),
};
const NOTE = 'Concept B, Garden. R: direction A release R (Cormorant Garamond, SIL OFL 1.1, edited, broad-nib leg). '
  + 'awza: Cormorant Upright (SIL OFL 1.1), edited (leaf terminal on the w, hairline tail on the last a). '
  + 'Descriptor: Marcellus (SIL OFL 1.1), outlined. Symbol: tulip bud, drawn.';
const SETS = {
  Logo: ['gold', 'chocolate', 'black', 'white'], Logo_Restaurant: ['gold', 'chocolate'],
  Wordmark: ['gold', 'chocolate'], Symbol: ['gold', 'chocolate'], Signature_R: ['gold', 'chocolate'],
};
const TITLES = { Logo: 'Logo, AFGHAANS RESTAURANT', Logo_Restaurant: 'Logo, RESTAURANT', Wordmark: 'Wordmark', Symbol: 'Symbol (tulip bud)', Signature_R: 'Signature R' };
const written = [];
for (const [name, colours] of Object.entries(SETS)) {
  for (const c of colours) {
    const fills = Object.fromEntries(['symbol', 'wordmark', 'descriptor', 'signature-r'].map((g) => [g, COL[c]]));
    const f = `RAWZA_B_${name}_${c[0].toUpperCase()}${c.slice(1)}.svg`;
    fs.writeFileSync(path.join(OUT, f), svg(art[name], `Concept B Garden — ${TITLES[name]}, ${c}`, NOTE, fills));
    written.push(f);
  }
}
// raw geometry for the presentation page
fs.writeFileSync(path.join(__dirname, '..', 'concept-b-garden', '.art.json'), JSON.stringify({
  art: Object.fromEntries(Object.entries(art).map(([k, a]) => [k, { W: a.W, H: a.H, dx: a.dx, dy: a.dy, groups: a.placed.map((g) => ({ group: g.group, pieces: g.pieces.map((p) => ({ id: p.id, d: p.d })) })) }])),
  pos: G.set().pos,
}));

console.log(written.join('\n'));
for (const [n, a] of Object.entries(art)) {
  console.log(`${n}: ${a.W} x ${a.H}`);
  for (const g of a.placed) for (const p of g.pieces) console.log(`  ${g.group}/${p.id.padEnd(12)} subpaths ${p.check.subpaths}  anchors ${String(p.check.anchors).padStart(4)}  self-intersections ${p.check.selfX}  counters ${p.check.windingOk ? 'ok' : 'WRONG'}`);
}
console.log('clearance R tail to a:', G.set().clearance.toFixed(1));
