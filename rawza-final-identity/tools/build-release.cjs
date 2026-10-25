// Release round of direction A: icon raised, W join bracket smaller, Z beak drawn down, optical
// kerning, descriptor tracked tighter, saffron threads one step lighter; plus a small-size variant.
//   cd tools && node build-release.cjs
// Writes to ../release/ : rawza-wordmark.svg, rawza-lockup.svg, rawza-lockup-colour.svg,
// rawza-wordmark-small.svg, rawza-lockup-small.svg, rawza-lockup-small-colour.svg, release.html
// ../final/ stays as the "before" version.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const S = require('./system.cjs');
const royal = require('./royal.cjs');
const { place, svg } = require('./svgout.cjs');

const OUT = path.join(__dirname, '..', 'release');
fs.mkdirSync(OUT, { recursive: true });
const GOLD = '#CFAE6E', SAFFRON_BEFORE = '#B9442C', SAFFRON = '#C9573A';
const LOCK = { iconGap: 300, iconScale: 1.08, descTrack: 0.5, descY: 910 };

const before = S.Aref({ preset: S.FINAL_PASS }), after = S.Aref({ preset: S.RELEASE, ...LOCK });
const lockGroups = (r) => [{ group: 'saffron-threads', pieces: r.threads }, { group: 'crocus-leaves', pieces: r.leaves }, { group: 'wordmark', pieces: r.wordmark }, { group: 'descriptor', pieces: r.descriptor }];
const art = { wordmark: place([{ group: 'wordmark', pieces: after.wordmark }]), lockup: place(lockGroups(after)) };
// the small variant uses a heavier instance of the font, so it is built in its own process
const tmp = path.join(OUT, '.small.json');
execFileSync(process.execPath, [path.join(__dirname, 'small.cjs'), tmp], { env: { ...process.env, RAWZA_A_WGHT: '500' } });
const small = JSON.parse(fs.readFileSync(tmp, 'utf8')); fs.unlinkSync(tmp);

const colour = { wordmark: GOLD, descriptor: GOLD, 'crocus-leaves': GOLD, 'saffron-threads': SAFFRON };
const NOTE = 'Letters: Cormorant Garamond (SIL OFL 1.1), edited. Release version.';
const NOTE_S = 'Letters: Cormorant Garamond wght 500 (SIL OFL 1.1), edited. Small-size variant, for use below about 300 px wide.';
const files = {
  'rawza-wordmark.svg': svg(art.wordmark, 'Wordmark', NOTE),
  'rawza-lockup.svg': svg(art.lockup, 'Lockup', NOTE),
  'rawza-lockup-colour.svg': svg(art.lockup, 'Lockup, gold with saffron threads', NOTE, colour),
  'rawza-wordmark-small.svg': svg(small.wordmark, 'Wordmark, small-size variant', NOTE_S),
  'rawza-lockup-small.svg': svg(small.lockup, 'Lockup, small-size variant', NOTE_S),
  'rawza-lockup-small-colour.svg': svg(small.lockup, 'Lockup, small-size variant, gold with saffron threads', NOTE_S, colour),
};
for (const [f, s] of Object.entries(files)) fs.writeFileSync(path.join(OUT, f), s);

// ---------- page: thread paths take their colour from --th
const cmp = {
  'b-lockup': place(lockGroups(before)), 'a-lockup': art.lockup,
  'b-wordmark': place([{ group: 'wordmark', pieces: before.wordmark }]), 'a-wordmark': art.wordmark,
  's-lockup': small.lockup,
};
const paths = (a) => a.placed.flatMap((g) => g.pieces.map((p) => (g.group === 'saffron-threads' ? `<path style="fill:var(--th,currentColor)" d="${p.d}"/>` : `<path d="${p.d}"/>`))).join('');
const defs = Object.entries(cmp).map(([id, a]) => `<symbol id="${id}" viewBox="0 0 ${a.W} ${a.H}">${paths(a)}</symbol>`)
  .concat(['b-wordmark', 'a-wordmark'].map((id) => `<g id="raw-${id}">${paths(cmp[id])}</g>`));
let html = fs.readFileSync(path.join(__dirname, 'release.src.html'), 'utf8')
  .replace('<!--SYMBOLS-->', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs.join('')}</defs></svg>`)
  .split('{{SAFFRON_BEFORE}}').join(SAFFRON_BEFORE).split('{{SAFFRON}}').join(SAFFRON);
for (const [id, a] of Object.entries(cmp)) html = html.split(`{{AR_${id}}}`).join(`${a.W} / ${a.H}`);
const pb = royal.set(S.FINAL_PASS).pos, pa = royal.set(S.RELEASE).pos;
const crop = (a, x0, y0, x1, y1) => [x0 + a.dx, y0 + a.dy, x1 - x0, y1 - y0].map((v) => v.toFixed(0));
const C = {
  B_W: crop(cmp['b-wordmark'], pb[2] - 10, -30, pb[2] + 1060, 740), A_W: crop(cmp['a-wordmark'], pa[2] - 10, -30, pa[2] + 1060, 740),
  B_Z: crop(cmp['b-wordmark'], pb[3] - 30, -50, pb[3] + 700, 740), A_Z: crop(cmp['a-wordmark'], pa[3] - 30, -50, pa[3] + 700, 740),
};
for (const [k, v] of Object.entries(C)) html = html.split(`{{VB_${k}}}`).join(v.join(' ')).split(`{{AR_${k}}}`).join(`${v[2]} / ${v[3]}`);
if (/\{\{/.test(html)) throw new Error('unreplaced placeholder: ' + html.match(/\{\{[^}]+\}\}/)[0]);
fs.writeFileSync(path.join(OUT, 'release.html'), html);

for (const [n, a] of Object.entries({ ...art, 'small lockup': small.lockup })) {
  console.log(`${n}: ${a.W} x ${a.H}`);
  for (const g of a.placed) for (const p of g.pieces) console.log(`  ${g.group}/${p.id.padEnd(16)} subpaths ${p.check.subpaths}  anchors ${String(p.check.anchors).padStart(4)}  self-intersections ${p.check.selfX}  counters ${p.check.windingOk ? 'ok' : 'WRONG'}`);
}
console.log('positions before', pb.map(Math.round).join(' '), ' after', pa.map(Math.round).join(' '));
console.log('clearance R tail to A: before', royal.set(S.FINAL_PASS).clearance.toFixed(1), ' after', royal.set(S.RELEASE).clearance.toFixed(1), ' small', small.clearance.toFixed(1));
