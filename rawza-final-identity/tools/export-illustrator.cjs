// Illustrator export of the approved release (no design changes).
//   cd tools && node export-illustrator.cjs
// Reads the approved artwork from ../release/*.svg (the single source of truth) and re-emits it as
// self-contained, explicitly coloured SVG files with named groups, into ../illustrator-export/SVG.
// Geometry is copied path for path; the only geometric operations are
//  - the saffron threads have the part hidden under the leaves removed (so nothing overlaps and the
//    one-colour/foil plate has no stacked shapes; the visible shape is unchanged), and
//  - the stand-alone saffron files move the icon by a whole-unit offset.
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { paper, fix, translate } = require('./lib.cjs');

const REL = path.join(__dirname, '..', 'release');
const OUT = path.join(__dirname, '..', 'illustrator-export', 'SVG');
fs.mkdirSync(OUT, { recursive: true });

// approved colours (release/rawza-lockup-colour.svg and the release notes); nothing new
const C = { gold: '#CFAE6E', saffron: '#C9573A', black: '#000000', white: '#FFFFFF' };

// ---------- read a release SVG: viewBox and every path under its group / piece ids
function read(file) {
  const s = fs.readFileSync(path.join(REL, file), 'utf8');
  const vb = s.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const pieces = {};
  let group = null;
  for (const line of s.split('\n')) {
    const g = line.match(/^  <g id="([^"]+)">/); if (g) group = g[1];
    const p = line.match(/^      <path fill="[^"]*" d="([^"]+)"\/>/);
    if (p) { const id = s.slice(0, s.indexOf(line)).match(/<g id="([^"]+)">\s*$/)[1]; pieces[id] = { group, d: p[1] }; }
  }
  return { W: vb[2], H: vb[3], pieces };
}
const item = (d) => new paper.CompoundPath({ pathData: d, insert: false });
const dOf = (it) => fix(it.pathData, 2);

// threads minus leaves: the hidden overlap goes, the visible shape stays
function trimThreads(src) {
  const t = item(src.pieces.threads.d), l = item(src.pieces.leaves.d);
  return dOf(t.subtract(l, { insert: false }));
}
// split the descriptor's compound path into one compound path per letter: every outer contour
// with the counters that lie inside it, in reading order
function splitDescriptor(d, text) {
  const kids = item(d).children.slice();
  const outer = kids.filter((k) => !kids.some((o) => o !== k && o.bounds.contains(k.bounds)));
  outer.sort((a, b) => a.bounds.x - b.bounds.x);
  const letters = text.replace(/ /g, '').split('');
  if (outer.length !== letters.length) throw new Error(`descriptor: ${outer.length} contours for ${letters.length} letters`);
  const count = {};
  return outer.map((o, i) => {
    const holes = kids.filter((k) => k !== o && o.bounds.contains(k.bounds));
    const cp = new paper.CompoundPath({ children: [o, ...holes].map((k) => k.clone({ insert: false })), insert: false });
    const ch = letters[i]; count[ch] = (count[ch] || 0) + 1;
    return { id: `DESC_${String(i + 1).padStart(2, '0')}_${ch}`, d: dOf(cp) };
  });
}

// ---------- writer: explicit fill and fill-rule on every path, no styles, no defs, no <use>
function write(file, { W, H, title, note, layers }) {
  const body = layers.filter((L) => L.paths.length).map((L) => `  <g id="${L.id}">\n${L.paths.map((p) => p.text
    ? `    ${p.text}`
    : `    <path id="${p.id}" fill="${p.fill}" fill-rule="nonzero" d="${p.d}"/>`).join('\n')}\n  </g>`).join('\n');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${title}. ${note}
     Source: rawza-final-identity/release (approved). Units: 1 unit = 1/700 of the RAWZA cap height.
     Vector outlines, transparent background, explicit colours. -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${W} ${H}" width="${W / 4}px" height="${H / 4}px">
  <title>${title}</title>
${body}
</svg>
`;
  fs.writeFileSync(path.join(OUT, file), svg);
}

const LETTERS = [['letter-R', 'LETTER_R'], ['letter-A-1', 'LETTER_A_01'], ['letter-W', 'LETTER_W'], ['letter-Z', 'LETTER_Z'], ['letter-A-2', 'LETTER_A_02']];
const DESC_TEXT = 'AFGHAANS RESTAURANT';
// colour schemes: [icon leaves, saffron threads, letters, descriptor]
const SCHEMES = {
  Gold: [C.gold, C.gold, C.gold, C.gold],
  Colour: [C.gold, C.saffron, C.gold, C.gold],
  Black: [C.black, C.black, C.black, C.black],
  White: [C.white, C.white, C.white, C.white],
};
function lockupLayers(src, scheme, o = {}) {
  const [leaf, thread, letter, desc] = scheme;
  const layers = [
    { id: '01_SAFFRON_ICON', paths: [{ id: 'SAFFRON_LEAVES', fill: leaf, d: src.pieces.leaves.d }] },
    { id: '02_WORDMARK_RAWZA', paths: LETTERS.map(([k, id]) => ({ id, fill: letter, d: src.pieces[k].d })) },
    { id: '03_DESCRIPTOR', paths: o.descText ? [{ text: o.descText(desc) }] : splitDescriptor(src.pieces['descriptor-text'].d, DESC_TEXT).map((p) => ({ ...p, fill: desc })) },
    // the parts that carry the saffron accent colour in the colour version, kept apart so they can
    // be recoloured on their own (in one-colour files they carry the same colour as the rest)
    { id: '04_COLOUR_COMPONENTS', paths: [{ id: 'SAFFRON_THREADS', fill: thread, d: trimThreads(src) }] },
  ];
  return layers;
}

const main = read('rawza-lockup.svg'), small = read('rawza-lockup-small.svg'), wm = read('rawza-wordmark.svg');
// check the release files agree with each other (same geometry in the colour lockup)
const mainC = read('rawza-lockup-colour.svg');
for (const k of Object.keys(main.pieces)) if (main.pieces[k].d !== mainC.pieces[k].d) throw new Error('release lockups differ: ' + k);

const files = [];
const emit = (f, spec) => { write(f, spec); files.push(f); };
for (const name of ['Gold', 'Colour', 'Black', 'White']) {
  emit(`RAWZA_Logo_${name}.svg`, { W: main.W, H: main.H, title: `RAWZA logo, ${name.toLowerCase()}`, note: noteFor(name), layers: lockupLayers(main, SCHEMES[name]) });
}
for (const name of ['Gold', 'Black']) {
  emit(`RAWZA_Wordmark_${name}.svg`, { W: wm.W, H: wm.H, title: `RAWZA wordmark, ${name.toLowerCase()}`, note: noteFor(name),
    layers: [{ id: '02_WORDMARK_RAWZA', paths: LETTERS.map(([k, id]) => ({ id, fill: SCHEMES[name][2], d: wm.pieces[k].d })) }] });
}
// saffron symbol alone: the icon from the main lockup, moved by a whole-unit offset into its own board
{
  const leaves = item(main.pieces.leaves.d), threads = item(trimThreads(main));
  const b = leaves.bounds.unite(threads.bounds), m = 40;
  const dx = Math.round(m - b.x), dy = Math.round(m - b.y);
  const W = Math.ceil(b.width) + 2 * m, H = Math.ceil(b.height) + 2 * m;
  for (const name of ['Gold', 'Colour', 'Black']) {
    const [leaf, thread] = SCHEMES[name];
    emit(`RAWZA_Saffron_${name}.svg`, { W, H, title: `RAWZA saffron symbol, ${name.toLowerCase()}`, note: noteFor(name), layers: [
      { id: '01_SAFFRON_ICON', paths: [{ id: 'SAFFRON_LEAVES', fill: leaf, d: dOf(translate(leaves, dx, dy)) }] },
      { id: '04_COLOUR_COMPONENTS', paths: [{ id: 'SAFFRON_THREADS', fill: thread, d: dOf(translate(threads, dx, dy)) }] },
    ] });
  }
}
emit('RAWZA_Logo_Small.svg', { W: small.W, H: small.H, title: 'RAWZA logo, small-size variant, black', note: 'For use below about 300 px wide. ' + noteFor('Black'), layers: lockupLayers(small, SCHEMES.Black) });
emit('RAWZA_Logo_Small_Colour.svg', { W: small.W, H: small.H, title: 'RAWZA logo, small-size variant, colour', note: 'For use below about 300 px wide. ' + noteFor('Colour'), layers: lockupLayers(small, SCHEMES.Colour) });
// foil: one plate, solid black = the area to be foiled; no overlapping shapes, no tints
emit('RAWZA_Foil_OneColour.svg', { W: main.W, H: main.H, title: 'RAWZA logo, one-colour foil separation',
  note: 'Single plate: every black area is foil. 100 % solid, no tints, no gradients, no overlapping shapes.', layers: lockupLayers(main, SCHEMES.Black) });

// editable descriptor: the same lockup, with the descriptor as live text in the release font,
// size and tracking, set at the exact origin of the approved outlines
{
  const S = require('./system.cjs'), { place } = require('./svgout.cjs'), { line } = require('./text.cjs');
  const LOCK = { iconGap: 300, iconScale: 1.08, descTrack: 0.5, descY: 910 };
  const r = S.Aref({ preset: S.RELEASE, ...LOCK });
  const art = place([{ group: 'a', pieces: r.threads }, { group: 'b', pieces: r.leaves }, { group: 'c', pieces: r.wordmark }, { group: 'd', pieces: r.descriptor }]);
  if (art.W !== main.W || art.H !== main.H) throw new Error('artboard mismatch');
  const regenerated = art.placed.find((g) => g.group === 'd').pieces[0].d;
  if (regenerated !== main.pieces['descriptor-text'].d) throw new Error('descriptor geometry mismatch');
  const font = opentype.loadSync(path.join(__dirname, 'fonts', 'CormorantGaramondV-600.ttf'));
  const cap = 80, track = 0.5 * cap, size = cap * font.unitsPerEm / font.tables.os2.sCapHeight;
  const t = line('CormorantGaramondV-600.ttf', DESC_TEXT, { cap, track: 0.5 });
  const cx = S.capCentre(r.wordmark);
  const x0 = cx - t.bounds.width / 2 - t.bounds.x + art.dx, base = LOCK.descY + cap + art.dy;
  DESC = { size, track, x0, base, cap };
  const text = (fill) => `<text id="DESCRIPTOR_TEXT" x="${x0.toFixed(2)}" y="${base.toFixed(2)}" fill="${fill}" font-family="Cormorant Garamond, CormorantGaramond-SemiBold, serif" font-weight="600" font-size="${size.toFixed(2)}" letter-spacing="${track.toFixed(2)}" xml:space="preserve">${DESC_TEXT}</text>`;
  emit('RAWZA_Descriptor_Editable.svg', { W: main.W, H: main.H, title: 'RAWZA logo with editable descriptor text',
    note: 'The descriptor is live text: requires the font Cormorant Garamond SemiBold (SIL OFL 1.1). RAWZA and the symbol are outlines.',
    layers: lockupLayers(main, SCHEMES.Black, { descText: text }) });
}
var DESC;
function noteFor(name) {
  return { Gold: `One colour: gold ${C.gold}.`, Colour: `Gold ${C.gold}, saffron threads ${C.saffron}.`, Black: `One colour: black ${C.black}.`, White: `One colour: white ${C.white} (for dark backgrounds).` }[name];
}
console.log(files.join('\n'));
console.log('descriptor text:', JSON.stringify(DESC));
