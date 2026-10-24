// node word.cjs <a|b> <out.png> [width] : just the wordmark, native resolution
const { translate, union, fix } = require('./lib.cjs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [,, which, out, W = 1200] = process.argv;
(async () => {
  const { glyphs, pos } = require(which === 'a' ? './set-a.cjs' : './set-b.cjs')();
  const word = union(glyphs.map((g, i) => translate(g.shape, pos[i], 0)));
  const b = word.bounds, pad = 40;
  const html = `<body style="margin:0;background:#fff"><svg viewBox="${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}" width="${W}" style="display:block"><path d="${fix(word.pathData, 2)}"/></svg></body>`;
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: +W, height: 400 } });
  await p.setContent(html); await p.screenshot({ path: out, fullPage: true }); await br.close();
  console.log(pos.map(Math.round).join(' '));
})();
