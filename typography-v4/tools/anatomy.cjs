// Large glyph sheet for anatomy study: node anatomy.cjs <font> <glyph names comma> <out.png>
const opentype = require('opentype.js');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [,, f, list, out] = process.argv;
const font = opentype.loadSync(require("path").join(__dirname, "..", "fonts-src", f + ".ttf"));
const byName = {}; for (let i = 0; i < font.glyphs.length; i++) { const g = font.glyphs.get(i); if (g.name) byName[g.name] = g; }
const size = 400, asc = font.tables.os2.sCapHeight * size / font.unitsPerEm;
const cells = list.split(',').map((n) => {
  const g = byName[n]; const p = g.getPath(0, size, size); const bb = p.getBoundingBox();
  const adv = g.advanceWidth * size / font.unitsPerEm;
  return `<figure><svg viewBox="${Math.min(0, bb.x1) - 20} ${size - asc - 60} ${Math.max(adv, bb.x2) - Math.min(0, bb.x1) + 40} ${asc + 140}" height="300"><line x1="-50" x2="2000" y1="${size}" y2="${size}" stroke="#e33" stroke-width="1"/><line x1="-50" x2="2000" y1="${size - asc}" y2="${size - asc}" stroke="#39f" stroke-width="1"/><rect x="0" y="${size - asc - 50}" width="${adv}" height="${asc + 120}" fill="none" stroke="#ccc"/><path d="${p.toPathData(1)}"/></svg><figcaption>${n} · adv ${g.advanceWidth}</figcaption></figure>`;
}).join('');
const html = `<style>body{margin:0;padding:16px;background:#fff;font:12px sans-serif;display:flex;flex-wrap:wrap;gap:16px}figure{margin:0}svg{display:block}</style>${cells}`;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 800 } }); await p.setContent(html); await p.screenshot({ path: out, fullPage: true }); await b.close(); })();
