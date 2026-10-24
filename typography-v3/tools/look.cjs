// node look.cjs <a|b> <out.png> : render the current wordmark big + small + its letters
const { translate, union, fix } = require('./lib.cjs');
const { space } = require('./spacing.cjs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const which = process.argv[2], out = process.argv[3];
const svg = (item, w, pad = 50) => { const b = item.bounds; return `<svg viewBox="${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}" width="${w}" style="display:block"><path fill="currentColor" d="${fix(item.pathData, 2)}"/></svg>`; };
const set = require(which === 'a' ? './set-a.cjs' : './set-b.cjs');
(async () => {
  const { glyphs, pos } = set();
  const word = union(glyphs.map((g, i) => translate(g.shape, pos[i], 0)));
  console.log('positions', pos.map((p) => Math.round(p)).join(' '));
  const html = `<body style="margin:0;background:#fff;color:#000;padding:20px">${svg(word, 1500)}
  <div style="display:flex;gap:24px;align-items:flex-end;margin-top:20px">${glyphs.slice(0, 4).map((g) => svg(g.shape, 300, 40)).join('')}</div>
  <div style="display:flex;gap:40px;align-items:flex-end;margin-top:20px">${svg(word, 400, 10)}${svg(word, 250, 6)}${svg(word, 150, 4)}</div></body>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 900 } });
  await p.setContent(html); await p.screenshot({ path: out, fullPage: true }); await b.close();
})();
