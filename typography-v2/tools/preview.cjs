// node preview.cjs <out.png>  — quick render of both directions for review
const { translate, union, fix } = require('./lib.cjs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
function setWord(gs, kern) { let x = 0; return union(gs.map((g, i) => { x += kern[i] || 0; const s = translate(g.shape, x, 0); x += g.adv; return s; })); }
const svg = (item, w, pad = 60) => { const b = item.bounds; return `<svg viewBox="${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}" width="${w}" style="display:block"><path fill="currentColor" d="${fix(item.pathData, 2)}"/></svg>`; };
module.exports = { setWord, svg };
if (require.main === module) (async () => {
  const B = require('./direction-b.cjs');
  const word = setWord([B.R(), B.a(), B.w({}), B.z({ join: true }), B.a()], B.kern);
  const glyphs = [B.R(), B.a(), B.w({}), B.z({ join: true })].map((g) => svg(g.shape, 220, 40)).join('');
  const html = `<body style="margin:0;background:#fff;color:#111;padding:30px">${svg(word, 1300)}<div style="display:flex;gap:30px;align-items:end;margin-top:30px">${glyphs}</div><div style="display:flex;gap:30px;align-items:end;margin-top:30px">${svg(word, 300, 20)}${svg(word, 140, 10)}${svg(word, 80, 6)}</div></body>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p.setContent(html); await p.screenshot({ path: process.argv[2], fullPage: true }); await b.close();
})();
module.exports.renderA = async (out) => {
  const A = require('./direction-a.cjs').make();
  const word = setWord([A.R(), A.A(), A.W(), A.Z(), A.A()], A.kern);
  const glyphs = [A.R(), A.A()].map((g) => svg(g.shape, 300, 40)).join('');
  const html = `<body style="margin:0;background:#fff;color:#111;padding:30px">${svg(word, 1300)}<div style="display:flex;gap:30px;align-items:end;margin-top:30px">${glyphs}${svg(word, 300, 20)}${svg(word, 120, 6)}</div></body>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p.setContent(html); await p.screenshot({ path: out, fullPage: true }); await b.close();
};
