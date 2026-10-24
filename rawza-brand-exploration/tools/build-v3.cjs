// Builds logo round 3 into ../../rawza-logos-v3/  (node build-v3.cjs)
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { shape, rect, union, translate, scale, fix } = require('./lib.cjs');
const CA = require('./concept-a.cjs');
const I = require('./logos-v3.cjs');

const OUT = path.join(__dirname, '..', '..', 'rawza-logos-v3');
const dOf = (i) => fix(i.pathData, 2);
const serif = opentype.loadSync(path.join(__dirname, 'fonts/CormorantGaramond-Medium.ttf'));

function setWord(glyphs, kerns, track = 0) {
  let x = 0; const out = [];
  glyphs.forEach((g, i) => { x += (kerns[i] || 0) + (i ? track : 0); out.push(translate(g.shape, x, 0)); x += g.adv; });
  return union(out);
}
function text(str, capH, trackEm) {
  const size = capH * serif.unitsPerEm / serif.tables.os2.sCapHeight;
  const gl = serif.stringToGlyphs(str); let x = 0, d = '';
  gl.forEach((g, i) => { d += g.getPath(x, 0, size).toPathData(2); x += g.advanceWidth * size / serif.unitsPerEm + (i < gl.length - 1 ? trackEm * size : 0); });
  return shape(d);
}
const cxOf = (i) => i.bounds.x + i.bounds.width / 2;
const centre = (i, cx, y) => translate(i, cx - cxOf(i), y);
function vb(items, p) {
  const bs = items.map((i) => i.bounds);
  const x0 = Math.min(...bs.map((b) => b.x)), y0 = Math.min(...bs.map((b) => b.y));
  const x1 = Math.max(...bs.map((b) => b.x + b.width)), y1 = Math.max(...bs.map((b) => b.y + b.height));
  return [x0 - p, y0 - p, x1 - x0 + 2 * p, y1 - y0 + 2 * p].map(Math.round);
}

const logos = {};
function def(id, layers, pad = 80) { logos[id] = { vb: vb(layers.map((l) => l.item), pad), layers }; }

// ---------- the round-1 Concept A wordmark, unchanged
const A = CA.make();
const word = setWord([A.R(), A.A(), A.W(), A.Z(), A.A()], A.kern);
const sub = centre(text('AFGHAANS RESTAURANT', 64, 0.42), cxOf(word), 948);
def('word', [{ item: word }, { item: sub }], 110);

function withIcon(id, icon, h) {
  const ib = union([icon.ground, icon.accent]).bounds, k = h / ib.height;
  const pl = (i) => { const s = scale(i, k, 0, 0); return translate(s, cxOf(word) - (ib.x + ib.width / 2) * k, -h - 240 - ib.y * k); };
  def(id, [{ item: pl(icon.ground) }, { item: pl(icon.accent), accent: true }, { item: word }, { item: sub }], 110);
  def(id + '-icon', [{ item: icon.ground }, { item: icon.accent, accent: true }], 40);
}
withIcon('logo1', I.saffron(), 540);
withIcon('logo2', I.seedling(), 440);

// ---------- SVG exports (champagne on transparent + walnut versions)
fs.mkdirSync(path.join(OUT, 'svg'), { recursive: true });
const colorways = { champagne: ['#C8AC7E', null], walnut: ['#2A1C17', null] };
const accents = { logo1: '#B5432F', logo2: '#2D4B7A' };
for (const [id, { vb: v, layers }] of Object.entries(logos)) {
  for (const [cw, [fg, ac]] of Object.entries(colorways)) {
    const ac2 = accents[id.split('-')[0]] || fg;
    const paths = layers.map((l) => `  <path fill="${l.accent ? ac2 : fg}" d="${dOf(l.item)}"/>`).join('\n');
    fs.writeFileSync(path.join(OUT, 'svg', `rawza-${id}-${cw}.svg`),
      `<?xml version="1.0" encoding="UTF-8"?>\n<!-- RAWZA logo round 2 — ${id} — concept artwork -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.join(' ')}" width="${Math.round(v[2] / 4)}" height="${Math.round(v[3] / 4)}">\n<title>RAWZA</title>\n${paths}\n</svg>\n`);
  }
}

// ---------- page
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>\n${Object.entries(logos).map(([id, { layers }]) =>
  `<g id="${id}">${layers.map((l) => (l.accent ? `<path style="fill:var(--accent, currentColor)" d="${dOf(l.item)}"/>` : `<path d="${dOf(l.item)}"/>`)).join('')}</g>`).join('\n')}\n</defs></svg>`;
let html = fs.readFileSync(path.join(__dirname, 'index-v3.src.html'), 'utf8').replace('<!--SPRITE-->', sprite);
html = html.replace(/<svg data-use="([\w-]+)"([^>]*)><\/svg>/g, (m, id, attrs) => {
  if (!logos[id]) throw new Error('unknown logo ' + id);
  return `<svg viewBox="${logos[id].vb.join(' ')}"${attrs} role="img" aria-label="RAWZA"><use href="#${id}"/></svg>`;
});
fs.writeFileSync(path.join(OUT, 'index.html'), html);
for (const [id, v] of Object.entries(logos)) console.log(id.padEnd(14), v.vb.join(' '));
