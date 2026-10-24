// RAWZA logo round 3: the round-1 Concept A wordmark with a small leaf icon above it.


const L = require('./lib.cjs'); const V = require('./logos-v2.cjs');
const { shape, sub, union, rect, poly, translate } = L;
const oct = (cx, cy, r) => { const a = rect(cx - r * .7071, cy - r * .7071, cx + r * .7071, cy + r * .7071); const b = a.clone({ insert: false }); b.rotate(45, [cx, cy]); return union([a, b]); };

// Icon 1 — saffron crocus (Herat saffron): three leaf-petals, three hairline threads
function saffron() {
  const cx = 200, by = 400;
  const mid = V.leaf([cx, by], [cx, 160], 32, { vw: 2.4 });
  const l = V.leaf([cx - 6, by - 4], [cx - 112, 214], 27, { bend: 16, vw: 2.2 });
  const r = V.leaf([cx + 6, by - 4], [cx + 112, 214], 27, { bend: -16, vw: 2.2 });
  const thread = (x1, y1) => V.curvedLeaf([[cx, 186], [cx + (x1 - cx) * 0.15, 130], [x1, y1 + 46], [x1, y1]], 5.5, { vein: false, skew: 0.5 });
  const drops = [[cx - 40, 46], [cx, 18], [cx + 40, 46]];
  const threads = drops.map(([x, y]) => thread(x, y + 14));
  const tips = drops.map(([x, y]) => V.leaf([x, y + 22], [x, y - 8], 7, { vein: false }));
  return { ground: union([mid, l, r]), accent: union([...threads, ...tips]) };
}
// Icon 2 — seedling: two leaves opening from one stem, a lapis star-seed between them
function seedling() {
  const cx = 200, by = 420;
  const l = V.leaf([cx - 3, by - 30], [cx - 118, 168], 34, { bend: 26, vw: 2.4 });
  const r = V.leaf([cx + 3, by - 30], [cx + 118, 168], 34, { bend: -26, vw: 2.4 });
  const stem = rect(cx - 3, by - 40, cx + 3, by + 10);
  const seed = oct(cx, 200, 22);
  return { ground: union([l, r, stem]), accent: seed };
}
module.exports = { saffron, seedling };
