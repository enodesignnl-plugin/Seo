// Plot a glyph outline with numbered anchor points: node points.cjs <font> <glyph> <out.png>
const { loadFont } = require('./glyphs.cjs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [,, file, name, out] = process.argv;
const F = loadFont(file); const g = F.glyph(name);
const kids = g.shape.children || [g.shape];
let marks = '', n = 0;
kids.forEach((k, ci) => k.segments.forEach((s, si) => { marks += `<circle cx="${s.point.x}" cy="${s.point.y}" r="5" fill="${ci ? '#e33' : '#06f'}"/><text x="${s.point.x + 7}" y="${s.point.y - 6}" font-size="15" fill="#333">${ci}.${si} (${Math.round(s.point.x)},${Math.round(s.point.y)})</text>`; n++; }));
const b = g.shape.bounds;
const svg = `<svg viewBox="${b.x - 80} ${b.y - 60} ${b.width + 300} ${b.height + 140}" width="1100"><line x1="-200" x2="2000" y1="700" y2="700" stroke="#f99"/><line x1="-200" x2="2000" y1="0" y2="0" stroke="#9cf"/><path d="${g.shape.pathData}" fill="#ddd" stroke="#000" stroke-width="1"/>${marks}</svg>`;
(async () => { const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1120, height: 900 } }); await p.setContent(`<body style="margin:0;background:#fff">${svg}</body>`); await p.screenshot({ path: out, fullPage: true }); await br.close(); console.log(name, 'adv', Math.round(g.adv), 'points', n); })();
