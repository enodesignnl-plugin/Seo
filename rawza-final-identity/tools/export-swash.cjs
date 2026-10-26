// Illustrator package for the swash-R variant (no design changes).
//   cd tools && node export-swash.cjs     ->  ../swash-r/illustrator-export/SVG
// The same artwork as ../swash-r/svg, re-emitted with named layers and paths, an explicit fill and
// fill-rule on every path, no styles, defs, masks or <use>; the descriptor split into one compound
// path per letter; plus a version with the descriptor as live text.
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { paper, fix } = require('./lib.cjs');
const SW = require('./swash.cjs');
const { place } = require('./svgout.cjs');

const OUT = path.join(__dirname, '..', 'swash-r', 'illustrator-export', 'SVG');
fs.mkdirSync(OUT, { recursive: true });
const C = { Gold: '#D6B583', Chocolate: '#2A1A12', Black: '#000000', White: '#FFFFFF' };
const LETTERS = [['letter-R', 'LETTER_R'], ['letter-A-1', 'LETTER_A_01'], ['letter-W', 'LETTER_W'], ['letter-Z', 'LETTER_Z'], ['letter-A-2', 'LETTER_A_02']];
const VARIANTS = {
  Logo: { opts: {}, text: 'RESTAURANT' },
  Logo_Afghaans: { opts: { text: 'AFGHAANS RESTAURANT', descCap: 100, descTrack: 0.5, descInset: 120 }, text: 'AFGHAANS RESTAURANT' },
};

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
function write(file, { W, H, title, note, layers }) {
  const body = layers.filter((L) => L.paths.length).map((L) => `  <g id="${L.id}">\n${L.paths.map((p) => p.text
    ? `    ${p.text}`
    : `    <path id="${p.id}" fill="${p.fill}" fill-rule="nonzero" d="${p.d}"/>`).join('\n')}\n  </g>`).join('\n');
  fs.writeFileSync(path.join(OUT, file), `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${title}. ${note}
     Swash R drawn as vector strokes; A, W, Z, A from the approved release (Cormorant Garamond, SIL OFL 1.1, edited);
     descriptor Montserrat Medium (SIL OFL 1.1). Units: 1 unit = 1/700 of the cap height of AWZA.
     Vector outlines, transparent background, explicit colours. -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${W} ${H}" width="${W / 4}px" height="${H / 4}px">
  <title>${title}</title>
${body}
</svg>
`);
  files.push(file);
}
const files = [];
const pieceMap = (art) => Object.fromEntries(art.placed.flatMap((g) => g.pieces.map((p) => [p.id, p.d])));
const word = (pm, fill) => ({ id: '01_WORDMARK_RAWZA', paths: LETTERS.map(([k, id]) => ({ id, fill, d: pm[k] })) });

const built = {};
for (const [v, { opts, text }] of Object.entries(VARIANTS)) {
  const L = SW.lockup(opts);
  const art = place([{ group: 'wordmark', pieces: L.wordmark }, { group: 'descriptor', pieces: L.descriptor }]);
  const pm = pieceMap(art), desc = splitDescriptor(pm.descriptor, text);
  built[v] = { L, art, pm, opts, text };
  const label = v === 'Logo' ? 'RAWZA logo, RESTAURANT' : 'RAWZA logo, AFGHAANS RESTAURANT';
  for (const [name, col] of Object.entries(C)) {
    write(`RAWZA_SwashR_${v}_${name}.svg`, { W: art.W, H: art.H, title: `${label}, ${name.toLowerCase()}`, note: `One colour: ${col}.`,
      layers: [word(pm, col), { id: '02_DESCRIPTOR', paths: desc.map((p) => ({ ...p, fill: col })) }] });
  }
}
// wordmark and R alone (same geometry, own artboards)
{
  const L = built.Logo.L;
  const wm = place([{ group: 'wordmark', pieces: L.wordmark }]), pm = pieceMap(wm);
  const r = place([{ group: 'wordmark', pieces: L.wordmark.slice(0, 1) }]), pr = pieceMap(r);
  for (const name of ['Gold', 'Chocolate', 'Black']) {
    write(`RAWZA_SwashR_Wordmark_${name}.svg`, { W: wm.W, H: wm.H, title: `RAWZA wordmark (swash R), ${name.toLowerCase()}`, note: `One colour: ${C[name]}.`, layers: [word(pm, C[name])] });
    write(`RAWZA_SwashR_R_${name}.svg`, { W: r.W, H: r.H, title: `Swash R, ${name.toLowerCase()}`, note: `One colour: ${C[name]}.`,
      layers: [{ id: '01_WORDMARK_RAWZA', paths: [{ id: 'LETTER_R', fill: C[name], d: pr['letter-R'] }] }] });
  }
}
// foil: one plate, solid black = foil
{
  const { art, pm, text } = built.Logo;
  write('RAWZA_SwashR_Foil_OneColour.svg', { W: art.W, H: art.H, title: 'RAWZA logo (swash R), one-colour foil separation',
    note: 'Single plate: every black area is foil. 100 % solid, no tints, no gradients, no overlapping shapes.',
    layers: [word(pm, C.Black), { id: '02_DESCRIPTOR', paths: splitDescriptor(pm.descriptor, text).map((p) => ({ ...p, fill: C.Black })) }] });
}
// editable descriptor: live text in Montserrat Medium at the exact origin of the outlines
const EDIT = {};
for (const v of Object.keys(VARIANTS)) {
  const { L, art, pm, opts, text } = built[v];
  const o = { ...SW.LOCK, ...opts };
  const font = opentype.loadSync(path.join(__dirname, 'fonts', o.descFont));
  const size = o.descCap * font.unitsPerEm / font.tables.os2.sCapHeight, track = o.descTrack * o.descCap;
  // the outline's pen origin: lockup() placed the line so its origin sits at x (see swash.cjs)
  const t = require('./text.cjs').line(o.descFont, o.text, { cap: o.descCap, track: o.descTrack });
  const x = L.wordmark[4].item.bounds.right - t.bounds.width - t.bounds.x - (o.descInset || 0);
  const x0 = x + art.dx, base = o.descY + o.descCap + art.dy;
  EDIT[v] = { size: +size.toFixed(2), letterSpacing: +track.toFixed(2), illustratorTracking: Math.round(track / size * 1000), x: +x0.toFixed(2), baseline: +base.toFixed(2) };
  const live = `<text id="DESCRIPTOR_TEXT" x="${x0.toFixed(2)}" y="${base.toFixed(2)}" fill="${C.Black}" font-family="Montserrat, Montserrat-Medium, sans-serif" font-weight="500" font-size="${size.toFixed(2)}" letter-spacing="${track.toFixed(2)}" kerning="0" style="font-kerning:none" xml:space="preserve">${text}</text>`;
  write(`RAWZA_SwashR_${v}_Descriptor_Editable.svg`, { W: art.W, H: art.H, title: `RAWZA logo (swash R) with editable descriptor, ${text}`,
    note: 'The descriptor is live text: requires the font Montserrat Medium (SIL OFL 1.1). RAWZA is outlines.',
    layers: [word(pm, C.Black), { id: '02_DESCRIPTOR', paths: [{ text: live }] }] });
}
fs.writeFileSync(path.join(OUT, '..', '.edit.json'), JSON.stringify(EDIT, null, 1));
console.log(files.join('\n'));
console.log(JSON.stringify(EDIT));
for (const v of Object.keys(built)) for (const g of built[v].art.placed) for (const p of g.pieces) console.log(`${v} ${g.group}/${p.id} selfX ${p.check.selfX} counters ${p.check.windingOk ? 'ok' : 'WRONG'}`);
