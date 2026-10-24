// Builds logo round 2 into ../../rawza-logos-v2/  (node build-v2.cjs)
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { shape, rect, union, translate, scale, fix } = require('./lib.cjs');
const CA = require('./concept-a.cjs');
const V = require('./logos-v2.cjs');

const OUT = path.join(__dirname, '..', '..', 'rawza-logos-v2');
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

// ---------- Logo 1: signature leaf
const l1 = V.logo1Glyphs();
const word1 = setWord(l1.glyphs, l1.kern);
const cx1 = cxOf(word1);
def('logo1', [{ item: word1 }, { item: centre(text('AFGHAANS RESTAURANT', 64, 0.42), cx1, 960) }], 110);
def('logo1-word', [{ item: word1 }]);
def('logo1-mark', [{ item: V.leafR().shape }]);

// ---------- Logo 2: garden gate crest
const light = CA.make({ T: 74, h: 13 });
const word2 = setWord([light.R({ tail: false }), light.A(), light.W(), light.Z(), light.A()], [0, 40, -30, 40, 0], 80);
const cx2 = cxOf(word2);
const gate = V.gardenGate();
const k = 1.42, gw = 480 * k;
const gplace = (i) => translate(scale(i, k, 0, 0), cx2 - gw / 2, -620 * k - 150);
const sub2 = centre(text('AFGHAANS RESTAURANT', 60, 0.42), cx2, 952);
const sb = sub2.bounds, rule = 330, gap = 70;
const rules = union([rect(sb.x - gap - rule, 918, sb.x - gap, 922), rect(sb.x + sb.width + gap, 918, sb.x + sb.width + gap + rule, 922)]);
def('logo2', [{ item: gplace(gate.ground) }, { item: gplace(gate.star), accent: true }, { item: word2 }, { item: sub2 }, { item: rules }], 110);
def('logo2-emblem', [{ item: gate.ground }, { item: gate.star, accent: true }], 60);
def('logo2-word', [{ item: word2 }]);

// ---------- SVG exports (champagne on transparent + walnut versions)
fs.mkdirSync(path.join(OUT, 'svg'), { recursive: true });
const colorways = { champagne: ['#C8AC7E', '#2D4B7A'], walnut: ['#2A1C17', '#2D4B7A'] };
for (const [id, { vb: v, layers }] of Object.entries(logos)) {
  for (const [cw, [fg, ac]] of Object.entries(colorways)) {
    const paths = layers.map((l) => `  <path fill="${l.accent ? ac : fg}" d="${dOf(l.item)}"/>`).join('\n');
    fs.writeFileSync(path.join(OUT, 'svg', `rawza-${id}-${cw}.svg`),
      `<?xml version="1.0" encoding="UTF-8"?>\n<!-- RAWZA logo round 2 — ${id} — concept artwork -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.join(' ')}" width="${Math.round(v[2] / 4)}" height="${Math.round(v[3] / 4)}">\n<title>RAWZA</title>\n${paths}\n</svg>\n`);
  }
}

// ---------- page
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>\n${Object.entries(logos).map(([id, { layers }]) =>
  `<g id="${id}">${layers.map((l) => (l.accent ? `<path style="fill:var(--accent, currentColor)" d="${dOf(l.item)}"/>` : `<path d="${dOf(l.item)}"/>`)).join('')}</g>`).join('\n')}\n</defs></svg>`;
let html = fs.readFileSync(path.join(__dirname, 'index-v2.src.html'), 'utf8').replace('<!--SPRITE-->', sprite);
html = html.replace(/<svg data-use="([\w-]+)"([^>]*)><\/svg>/g, (m, id, attrs) => {
  if (!logos[id]) throw new Error('unknown logo ' + id);
  return `<svg viewBox="${logos[id].vb.join(' ')}"${attrs} role="img" aria-label="RAWZA"><use href="#${id}"/></svg>`;
});
fs.writeFileSync(path.join(OUT, 'index.html'), html);
for (const [id, v] of Object.entries(logos)) console.log(id.padEnd(14), v.vb.join(' '));
