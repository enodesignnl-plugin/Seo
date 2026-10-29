// Shared outline helpers (paper.js booleans) for the logo-naar-svg scripts.
const fs = require('fs');
const paper = require('paper-jsdom');
paper.setup(new paper.Size(4000, 4000));
const P = (x, y) => new paper.Point(x, y);
const fix = (s, prec = 3) => s.replace(/-?\d*\.\d+/g, (m) => String(+(+m).toFixed(prec)));
const shape = (d) => new paper.CompoundPath({ pathData: d, insert: false });
function union(list) {
  let acc = list[0];
  for (let i = 1; i < list.length; i++) acc = acc.unite(list[i], { insert: false });
  return acc;
}
// remove zero-area leftovers of boolean operations
function dropSpecks(s, min = 0.05) {
  if (!s.children) return s;
  s.children.slice().forEach((k) => { if (Math.abs(k.area) < min) k.remove(); });
  return s.children.length === 1 ? s.children[0].clone({ insert: false }) : s;
}
const kids = (s) => (s.children ? s.children : [s]);
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
module.exports = { paper, P, fix, shape, union, dropSpecks, kids, readJSON };
