// Round 2 after the client's feedback: shorter swash R, larger and heavier descriptor, new
// lockups and symbols.   cd tools && node build-round2.cjs   ->  ../round-2/svg/ and ../round-2/.art.json
const fs = require('fs');
const path = require('path');
const { place } = require('./svgout.cjs');
const { fix } = require('./lib.cjs');
const R2 = require('./round2.cjs');
const SW = require('./swash.cjs');
const L = require('./leafmark.cjs');

const DIR = path.join(__dirname, '..', 'round-2'), OUT = path.join(DIR, 'svg');
fs.mkdirSync(OUT, { recursive: true });
const C = { Gold: '#D6B583', Chocolate: '#2A1A12', Black: '#1A1410', White: '#FFFFFF', Lapis: '#2B4F86' };
// colour schemes: [main colour, accent colour]
const SCHEME = { Gold: [C.Gold, C.Gold], Chocolate: [C.Chocolate, C.Chocolate], Black: [C.Black, C.Black], White: [C.White, C.White], GoldLapis: [C.Gold, C.Lapis], ChocolateLapis: [C.Chocolate, C.Lapis] };

const LOGOS = {
  L1_Swash: { title: 'Swash R, kort, AFGHAANS RESTAURANT', groups: () => R2.swash(), schemes: ['Gold', 'Chocolate', 'Black', 'White'] },
  L1_Swash_ExtraKort: { title: 'Swash R, extra kort, AFGHAANS RESTAURANT', groups: () => R2.swash({ R: SW.SHORTER }), schemes: ['Gold', 'Chocolate'] },
  L1_Swash_Restaurant: { title: 'Swash R, kort, RESTAURANT', groups: () => R2.swash({ text: 'short' }), schemes: ['Gold', 'Chocolate'] },
  L2_Swash_Boog: { title: 'Swash R met boog en rozet', groups: () => R2.swash({ symbol: 'archRosette', symScale: 0.85 }), schemes: ['Gold', 'Chocolate', 'GoldLapis', 'ChocolateLapis'] },
  L3_Swash_Lancet: { title: 'Swash R met Lancet', groups: () => R2.swash({ symbol: 'lancet', symScale: 0.36, symGap: 190 }), schemes: ['Gold', 'Chocolate'] },
  L4_Klassiek_Boog: { title: 'Klassiek, boog en rozet', groups: () => R2.classic(), schemes: ['Gold', 'Chocolate', 'GoldLapis', 'ChocolateLapis'] },
  L4_Klassiek_Boog_Restaurant: { title: 'Klassiek, boog en rozet, RESTAURANT', groups: () => R2.classic({ text: 'short' }), schemes: ['Gold', 'Chocolate'] },
  L5_Rawza: { title: 'Rawza, swash R met kleine letters', groups: () => R2.titlecase(), schemes: ['Gold', 'Chocolate'] },
};
const SYMBOLS = {
  S4_Boog_Rozet: { title: 'Boog met rozet', pieces: () => R2.symPieces('archRosette'), schemes: ['Gold', 'Black', 'GoldLapis'] },
  S5_Rozet: { title: 'Rozet', pieces: () => R2.symPieces('rosette'), schemes: ['Gold', 'Black', 'GoldLapis'] },
  S6_Boog_Lancet: { title: 'Lancet in boog', pieces: () => R2.symPieces('archLancet'), schemes: ['Gold', 'Black'] },
  S7_Boog_R: { title: 'R in boog', pieces: () => R2.symPieces('archR'), schemes: ['Gold', 'Black'] },
};
const NOTE = 'Round 2. Swash R drawn as vector strokes; capitals Cormorant Garamond, lowercase Cormorant Upright, descriptor Montserrat SemiBold (all SIL OFL 1.1), outlined. Symbols drawn.';
function write(file, art, title, scheme) {
  const [main, accent] = SCHEME[scheme];
  const body = art.placed.map((g) => `  <g id="${g.group.toUpperCase()}">\n${g.pieces.map((p) => `    <path id="${p.id.toUpperCase().replace(/-/g, '_')}" fill="${p.accent ? accent : main}" fill-rule="nonzero" d="${p.d}"/>`).join('\n')}\n  </g>`).join('\n');
  fs.writeFileSync(path.join(OUT, file), `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA — ${title}, ${scheme}. ${NOTE} -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${art.W} ${art.H}" width="${art.W / 4}px" height="${art.H / 4}px">
  <title>RAWZA — ${title}</title>
${body}
</svg>
`);
}
// place() keeps only { id, d }: carry the accent flag through by id
function placeWithAccent(groups, o) {
  const art = place(groups, o);
  const acc = new Set(groups.flatMap((g) => g.pieces.filter((p) => p.accent).map((p) => p.id)));
  art.placed.forEach((g) => g.pieces.forEach((p) => { p.accent = acc.has(p.id); }));
  return art;
}
const json = { logos: {}, symbols: {} }, report = [];
for (const [name, m] of Object.entries(LOGOS)) {
  const groups = m.groups();
  const art = placeWithAccent(groups.filter((g) => g.pieces), { margin: 80 });
  for (const sc of m.schemes) write(`RAWZA_R2_${name}_${sc}.svg`, art, m.title, sc);
  json.logos[name] = { title: m.title, W: art.W, H: art.H, groups: art.placed };
  report.push([name, art, groups.fit]);
}
for (const [name, m] of Object.entries(SYMBOLS)) {
  const pieces = m.pieces();
  const art = placeWithAccent([{ group: 'symbol', pieces }], { square: true, margin: 120 });
  for (const sc of m.schemes) write(`RAWZA_R2_${name}_${sc}.svg`, art, m.title, sc);
  json.symbols[name] = { title: m.title, W: art.W, H: art.H, groups: art.placed };
  report.push([name, art]);
}
// round 1 for comparison: the long R with the round 1 descriptor
{
  const before = SW.lockup({ text: 'AFGHAANS RESTAURANT', descCap: 100, descTrack: 0.5, descInset: 120 });
  const art = place([{ group: 'wordmark', pieces: before.wordmark }, { group: 'descriptor', pieces: before.descriptor }], { margin: 80 });
  json.before = { W: art.W, H: art.H, groups: art.placed };
}
// the first round 2 length, for the comparison
{
  const g = R2.swash({ R: SW.SHORT_V1 });
  const art = place(g, { margin: 80 });
  json.v1 = { W: art.W, H: art.H, groups: art.placed };
}
// the three round 1 leaf marks, for the symbol overview
json.leaf = Object.fromEntries(['lancet', 'interlace', 'contrast'].map((k) => {
  const m = L[k](); const art = place([{ group: 'symbol', pieces: [{ id: 'left', item: m.left }, { id: 'right', item: m.right }] }], { square: true, margin: 120 });
  return [k, { W: art.W, H: art.H, groups: art.placed }];
}));
fs.writeFileSync(path.join(DIR, '.art.json'), JSON.stringify(json));
for (const [n, art, fit] of report) {
  const bad = art.placed.flatMap((g) => g.pieces).filter((p) => p.check.selfX || !p.check.windingOk);
  console.log(`${n.padEnd(28)} ${art.W} x ${art.H}  ${bad.length ? 'PROBLEM ' + bad.map((p) => p.id).join(',') : 'paths ok'}${fit ? `  descriptor clearance ${fit.clearance.toFixed(0)} track ${fit.track.toFixed(2)}` : ''}`);
}
console.log(fs.readdirSync(OUT).length, 'svg files');
