// Internal study sheet: full wordmarks at one optical size (same cap height), black on white.
//   node study.cjs <module> <out.png> '<json [{label, opts}]>' [capPx]
// Renders with the browser (Playwright); used for the micro-variant comparisons in ../studies.
const fs = require('fs');
const path = require('path');
const { translate, union } = require('./lib.cjs');
const [,, mod, out, json, capPx = 110] = process.argv;
const M = require(path.resolve(mod));
const rows = JSON.parse(json).map(({ label, opts }) => {
  const { glyphs, pos } = M.set(opts);
  const s = union(glyphs.map((g, i) => translate(g.shape, pos[i], 0)));
  const b = s.bounds, k = capPx / 700, x0 = b.x - 40, y0 = -60, w = b.width + 80, h = 900;
  return `<figure><svg viewBox="${x0} ${y0} ${w} ${h}" width="${w * k}" height="${h * k}"><path d="${s.pathData}"/></svg><figcaption>${label}</figcaption></figure>`;
}).join('');
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#fff;font:13px/1.4 -apple-system,Segoe UI,sans-serif;color:#555;display:grid;gap:18px}figure{margin:0;border-bottom:1px solid #eee;padding-bottom:10px}svg{display:block}figcaption{margin-top:2px}</style>${rows}`;
const tmp = path.join(require('os').tmpdir(), 'rawza-study.html');
fs.writeFileSync(tmp, html);
// Playwright: a local install if present, otherwise the global one of this machine
const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 400 }, deviceScaleFactor: 1 });
  await p.goto('file://' + tmp); await p.screenshot({ path: out, fullPage: true }); await b.close();
})();
