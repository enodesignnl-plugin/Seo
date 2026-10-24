// Builds every RAWZA logo asset from the glyph generators.
//   node build.cjs
// 1. composes wordmarks + lockups (subtitles outlined from OFL fonts)
// 2. writes standalone SVGs to ../concepts/concept-a|b/ for Illustrator
// 3. expands ../tools/index.src.html into ../index.html with an inline sprite
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { shape, rect, union, translate, scale, fix } = require('./lib.cjs');
const CA = require('./concept-a.cjs');
const CB = require('./concept-b.cjs');

const ROOT = path.join(__dirname, '..');
const H = 700;
const defs = {};   // id -> { vb:[x,y,w,h], body }

// ---------- helpers
const dOf = (item) => fix(item.pathData, 2);
function setWord(glyphs, kerns, track = 0) {
  let x = 0; const placed = [];
  glyphs.forEach((g, i) => { x += (kerns[i] || 0) + (i ? track : 0); placed.push(translate(g.shape, x, 0)); x += g.adv; });
  return union(placed);
}
function textShape(font, str, capH, trackEm) {
  // outlines a tracked caps line; baseline y = 0, starts at x = 0
  const capUnits = font.tables.os2.sCapHeight || font.unitsPerEm * 0.66;
  const size = capH * font.unitsPerEm / capUnits;
  const track = trackEm * size;
  let x = 0, d = '';
  const glyphs = font.stringToGlyphs(str);
  glyphs.forEach((g, i) => {
    d += g.getPath(x, 0, size).toPathData(2);
    x += g.advanceWidth * size / font.unitsPerEm;
    if (i < glyphs.length - 1) {
      x += font.getKerningValue(g, glyphs[i + 1]) * size / font.unitsPerEm + track;
    }
  });
  const item = shape(d || 'M0,0');
  return item;
}
function centerX(item, cx) { const b = item.bounds; return translate(item, cx - (b.x + b.width / 2), 0); }
function place(item, x, y) { return translate(item, x, y); }
function vbOf(items, pad = [40, 40, 40, 40]) {
  const bs = items.map((i) => i.bounds);
  const x0 = Math.min(...bs.map((b) => b.x)), y0 = Math.min(...bs.map((b) => b.y));
  const x1 = Math.max(...bs.map((b) => b.x + b.width)), y1 = Math.max(...bs.map((b) => b.y + b.height));
  const [pt, pr, pb, pl] = pad;
  return [x0 - pl, y0 - pt, x1 - x0 + pl + pr, y1 - y0 + pt + pb].map((v) => Math.round(v));
}
function def(id, layers, pad, vbOverride) {
  // layers: [{ item, cls }]  — cls 'accent' paints with var(--accent)
  const vb = vbOverride || vbOf(layers.map((l) => l.item), pad);
  const body = layers.map((l) => (l.cls === 'accent'
    ? `<path class="accent" style="fill:var(--accent, currentColor)" d="${dOf(l.item)}"/>`
    : `<path d="${dOf(l.item)}"/>`)).join('');
  defs[id] = { vb, body, layers };
}

// ---------- fonts used for the outlined subtitles
const serifFont = opentype.loadSync(path.join(__dirname, 'fonts/CormorantGaramond-Medium.ttf'));
const sansFont = opentype.loadSync(path.join(__dirname, 'fonts/Jost-Regular.ttf'));
const SUBS = { afg: 'AFGHAANS RESTAURANT', rest: 'RESTAURANT' };

// ================= CONCEPT A
const A = CA.make();
const Asm = CA.make({ T: 98, h: 30, s: 40, r: 24 });
const aSeq = (g) => [g.R(), g.A(), g.W(), g.Z(), g.A()];
const aWord = setWord(aSeq(A), A.kern);
const aWordSm = setWord(aSeq(Asm), Asm.kern, 18);
const aCx = aWord.bounds.x + aWord.bounds.width / 2;
def('a-word', [{ item: aWord }], [60, 60, 60, 60]);
def('a-word-sm', [{ item: aWordSm }], [60, 60, 60, 60]);

for (const [k, str] of Object.entries(SUBS)) {
  const sub = centerX(place(textShape(serifFont, str, 64, 0.42), 0, 948), aCx);
  def(`a-lock-${k}`, [{ item: aWord }, { item: sub }], [90, 120, 90, 120]);
  const subSm = centerX(place(textShape(serifFont, str, 92, 0.34), 0, 1010), aWordSm.bounds.x + aWordSm.bounds.width / 2);
  def(`a-lock-${k}-sm`, [{ item: aWordSm }, { item: subSm }], [90, 120, 90, 120]);
}
// monogram (signature R) and stacked alternative
const aR = A.R();
const aMono = aR.shape;
def('a-mono', [{ item: aMono }], [70, 70, 70, 70]);
{
  const monoCx = 44 + 560 / 2;                 // optical centre: stem + bowl + leg, tail excluded
  const wordS = scale(aWord, 0.29, 0, 0);
  const wb = wordS.bounds;
  const wordP = place(wordS, monoCx - (wb.x + wb.width / 2), 1010);
  const rule = rect(monoCx - 230, 892, monoCx + 230, 897);
  const sub = centerX(place(textShape(serifFont, SUBS.afg, 30, 0.42), 0, 1010 + 203 + 112), monoCx);
  def('a-alt', [{ item: aMono }, { item: rule }, { item: wordP }, { item: sub }], [110, 160, 110, 160]);
}
// detail glyphs (glyph-local coordinates, used under annotation overlays)
def('a-R', [{ item: aR.shape }], [80, 80, 80, 80]);
def('a-R-plain', [{ item: A.R({ tail: false }).shape }], [80, 80, 80, 80]);
def('a-A', [{ item: A.A().shape }], [80, 80, 80, 80]);
def('a-W', [{ item: A.W().shape }], [80, 80, 80, 80]);
def('a-Z', [{ item: A.Z().shape }], [80, 80, 80, 80]);
// R + A pair for the ligature detail
def('a-RA', [{ item: setWord([A.R(), A.A()], [0, 66]) }], [80, 80, 80, 80]);

// ================= CONCEPT B
const B = CB.make();
const Bsm = CB.make({ S: 64, t: 40 });
const bSeq = (g) => [g.R(), g.A(), g.W(), g.Z(), g.A()];
const bWord = setWord(bSeq(B), B.kern);
const bWordSm = setWord(bSeq(Bsm), Bsm.kern, 26);
const bCx = bWord.bounds.x + bWord.bounds.width / 2;
def('b-word', [{ item: bWord }], [60, 60, 60, 60]);
def('b-word-sm', [{ item: bWordSm }], [60, 60, 60, 60]);

const em = CB.emblem({ water: 7 });
const emSm = CB.emblem({ frame: 30, wallGap: 40, channel: 42, cham: 96, star: 96 });
def('b-emblem', [{ item: em.ground }, { item: em.star, cls: 'accent' }], [30, 30, 30, 30]);
def('b-emblem-sm', [{ item: emSm.ground }, { item: emSm.star, cls: 'accent' }], [24, 24, 24, 24]);

for (const [k, str] of Object.entries(SUBS)) {
  const E = 440;  // emblem size in the stacked lockup
  const es = (o) => place(scale(o, E / 600, 0, 0), bCx - E / 2, -E - 130);
  const sub = centerX(place(textShape(sansFont, str, 52, 0.5), 0, H + 160), bCx);
  def(`b-lock-${k}`, [{ item: es(em.ground) }, { item: es(em.star), cls: 'accent' }, { item: bWord }, { item: sub }], [90, 120, 90, 120]);
  // without emblem
  def(`b-word-${k}`, [{ item: bWord }, { item: sub }], [90, 120, 90, 120]);
  const bCxSm = bWordSm.bounds.x + bWordSm.bounds.width / 2;
  const subSm = centerX(place(textShape(sansFont, str, 74, 0.42), 0, H + 190), bCxSm);
  const Es = 500;
  const esm = (o) => place(scale(o, Es / 600, 0, 0), bCxSm - Es / 2, -Es - 130);
  def(`b-lock-${k}-sm`, [{ item: esm(emSm.ground) }, { item: esm(emSm.star), cls: 'accent' }, { item: bWordSm }, { item: subSm }], [90, 120, 90, 120]);
  def(`b-word-${k}-sm`, [{ item: bWordSm }, { item: subSm }], [90, 120, 90, 120]);
}
{
  // horizontal: emblem seal + wordmark + subtitle hanging from the same baseline
  const E = 900;
  const es = (o) => place(scale(o, E / 600, 0, 0), 0, 0);
  const x0 = E + 190;
  const word = place(bWord, x0 - bWord.bounds.x, 0);
  const sub = place(textShape(sansFont, SUBS.afg, 56, 0.5), x0 + 4, E - 2);
  def('b-alt', [{ item: es(em.ground) }, { item: es(em.star), cls: 'accent' }, { item: word }, { item: sub }], [90, 120, 90, 120]);
}
def('b-A', [{ item: B.A().shape }], [80, 80, 80, 80]);
def('b-W', [{ item: B.W().shape }], [80, 80, 80, 80]);
def('b-R', [{ item: B.R().shape }], [80, 80, 80, 80]);
def('b-Z', [{ item: B.Z().shape }], [80, 80, 80, 80]);
def('b-emblem-plain', [{ item: CB.emblem().ground }, { item: CB.emblem().star, cls: 'accent' }], [30, 30, 30, 30]);

// ================= OUTPUT
// 1) standalone SVG exports
const exportsList = {
  'concept-a': { color: '#2A1C17', accent: '#2A1C17', ids: ['a-lock-afg', 'a-lock-rest', 'a-word', 'a-alt', 'a-mono', 'a-lock-afg-sm', 'a-word-sm'] },
  'concept-b': { color: '#2E4334', accent: '#2D4B7A', ids: ['b-lock-afg', 'b-lock-rest', 'b-word', 'b-alt', 'b-emblem', 'b-emblem-sm', 'b-lock-afg-sm', 'b-word-sm'] },
};
for (const [dir, cfg] of Object.entries(exportsList)) {
  for (const id of cfg.ids) {
    const { vb, layers } = defs[id];
    const paths = layers.map((l) => `  <path fill="${l.cls === 'accent' ? cfg.accent : cfg.color}" d="${dOf(l.item)}"/>`).join('\n');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- RAWZA — ${dir} — ${id} — concept artwork, not final production vectors -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${Math.round(vb[2] / 4)}" height="${Math.round(vb[3] / 4)}">\n<title>RAWZA</title>\n${paths}\n</svg>\n`;
    fs.writeFileSync(path.join(ROOT, 'concepts', dir, `rawza-${id}.svg`), svg);
  }
}

// 1b) tileable garden pattern for backgrounds (tone-on-tone)
fs.mkdirSync(path.join(ROOT, 'assets/patterns'), { recursive: true });
const plain = CB.emblem();
const patterns = {
  'garden-on-cypress': { tile: 132, size: 84, fill: 'rgba(242,236,223,0.075)' },
  'garden-emboss': { tile: 96, size: 60, fill: 'rgba(0,0,0,0.085)' },
  'garden-on-ivory': { tile: 132, size: 84, fill: 'rgba(46,67,52,0.07)' },
};
for (const [name, p] of Object.entries(patterns)) {
  const k = p.size / 600, o = (p.tile - p.size) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${p.tile}" height="${p.tile}" viewBox="0 0 ${p.tile} ${p.tile}"><g transform="translate(${o} ${o}) scale(${k})" fill="${p.fill}"><path d="${dOf(plain.shape)}"/></g></svg>`;
  fs.writeFileSync(path.join(ROOT, 'assets/patterns', name + '.svg'), svg);
}

// 2) inline sprite + template expansion
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>\n${Object.entries(defs)
  .map(([id, v]) => `<g id="${id}">${v.body}</g>`).join('\n')}\n</defs></svg>`;
let html = fs.readFileSync(path.join(__dirname, 'index.src.html'), 'utf8');
html = html.replace('<!--SPRITE-->', sprite);
// <svg data-use="id" ...></svg>  ->  sized inline svg using the shared definition
html = html.replace(/<svg data-use="([\w-]+)"([^>]*)><\/svg>/g, (m, id, attrs) => {
  if (!defs[id]) throw new Error('unknown logo ' + id);
  const label = /aria-label=/.test(attrs) ? '' : ' aria-label="RAWZA"';
  return `<svg viewBox="${defs[id].vb.join(' ')}"${attrs} role="img"${label}><use href="#${id}"/></svg>`;
});
// <svg data-glyph="id" viewBox="..." ...>overlay</svg> -> keep author viewBox, prepend glyph
html = html.replace(/<svg data-glyph="([\w-]+)"([^>]*)>/g, (m, id, attrs) => {
  if (!defs[id]) throw new Error('unknown glyph ' + id);
  const vb = /viewBox=/.test(attrs) ? '' : ` viewBox="${defs[id].vb.join(' ')}"`;
  return `<svg${vb}${attrs} role="img" aria-hidden="true"><use class="glyph" href="#${id}"/>`;
});
fs.writeFileSync(path.join(ROOT, 'index.html'), html);

// report
for (const [id, v] of Object.entries(defs)) console.log(id.padEnd(16), v.vb.join(' '));
