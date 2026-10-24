// Builds the final RAWZA wordmarks and the art-direction page.
//   cd tools && npm install && npm run build
// Writes to ../ : rawza-a-signature.svg, rawza-b-editorial.svg, rawza-art-direction.html
const fs = require('fs');
const path = require('path');
const { translate, fix } = require('./lib.cjs');
const A = require('./signature.cjs');
const B = require('./editorial.cjs');

const OUT = path.join(__dirname, '..');
const PAD = 40;

// ---------- clean-up and checks per letter
function cleanPath(p) {
  for (let i = p.segments.length - 1; i >= 0 && p.segments.length > 3; i--) {
    const s = p.segments[i], prev = s.previous || p.lastSegment, next = s.next || p.firstSegment;
    if (s.point.getDistance(prev.point) < 0.05 && s.handleIn.isZero() && prev.handleOut.isZero()) { s.remove(); continue; }
    if (s.handleIn.isZero() && s.handleOut.isZero() && prev.handleOut.isZero() && next.handleIn.isZero()) {
      const a = s.point.subtract(prev.point), b = next.point.subtract(s.point);
      if (Math.abs(a.cross(b)) < 1e-3 * a.length * b.length && a.dot(b) > 0) s.remove();
    }
  }
}
function inspect(item) {
  const kids = item.children ? item.children.slice() : [item];
  kids.forEach(cleanPath);
  let anchors = 0, selfX = 0, windingOk = true;
  for (const k of kids) {
    anchors += k.segments.length;
    selfX += k.getIntersections().filter((c) => !c.isTouching()).length;
    const host = kids.find((o) => o !== k && o.bounds.contains(k.bounds) && o.contains(k.interiorPoint));
    if (host && host.clockwise === k.clockwise) windingOk = false;
  }
  return { subpaths: kids.length, anchors, selfX, windingOk };
}

// ---------- letters at their final positions; origin at the artwork's top-left plus PAD.
// The vertical frame is the same for both marks: cap line at y = PAD + 10, so both files share
// one optical height (cap 700 units) and can be placed at identical scale.
function build(set) {
  const { glyphs, pos } = set();
  const letters = glyphs.map((g, i) => ({ id: g.id, shape: translate(g.shape, pos[i], 0) }));
  const b = letters.map((l) => l.shape.bounds).reduce((acc, r) => acc.unite(r));
  const top = -10, bottom = 770;                      // frame: 10 above the cap line, 70 below the baseline
  if (b.y < top || b.y + b.height > bottom) throw new Error('artwork outside the shared frame');
  const dx = PAD - b.x, dy = PAD - top;
  const W = Math.ceil(b.width + 2 * PAD), Hh = Math.ceil(bottom - top + 2 * PAD);
  const placed = letters.map((l) => {
    const s = translate(l.shape, dx, dy);
    return { id: l.id, shape: s, check: inspect(s), d: fix(s.pathData, 2) };
  });
  return { W, Hh, placed, pos, cap: dy, base: dy + 700 };
}
function writeSvg(file, art, title, note) {
  const groups = art.placed.map((l) => `  <g id="${l.id}">\n    <path fill="#000000" d="${l.d}"/>\n  </g>`).join('\n');
  fs.writeFileSync(path.join(OUT, file), `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA — ${title}. Vector outlines, one group per letter, no font needed.
     Units: cap height 700; cap line at y=${art.cap}, baseline at y=${art.base}. ${note} -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.W} ${art.Hh}" width="${Math.round(art.W / 2)}" height="${Math.round(art.Hh / 2)}">
<title>RAWZA — ${title}</title>
<g id="wordmark">
${groups}
</g>
</svg>
`);
}
const artA = build(A.set);
const artB = build(B.set);
writeSvg('rawza-a-signature.svg', artA, 'Direction A, The Signature', 'Foundation: Cormorant Garamond (SIL OFL 1.1), edited.');
writeSvg('rawza-b-editorial.svg', artB, 'Direction B, The Editorial', 'Foundation: Bodoni Moda (SIL OFL 1.1), edited. The w–z join is part of letter-z and overlaps the top of the w.');

// ---------- art-direction page: v4 artwork is read from typography-v4 (unchanged)
const V4 = path.join(__dirname, '..', '..', 'typography-v4');
function readSvg(file) {
  const s = fs.readFileSync(file, 'utf8');
  const vb = s.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const paths = [...s.matchAll(/<path[^>]* d="([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join('');
  return { vb, paths };
}
const v4a = readSvg(path.join(V4, 'concept-a.svg'));
const v4b = readSvg(path.join(V4, 'concept-b.svg'));
// v4 files have PAD 40 around their own bounds; put them in the shared frame by their cap line.
// v4 A's top is the R at y -3.4 (cap line 43.4 in its file), v4 B's top is the R at 0 (cap line 40).
const frame = (vb, capInFile) => `0 ${capInFile - (PAD + 10)} ${vb[2]} ${artA.Hh}`;
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<g id="mark-a">${artA.placed.map((l) => `<path d="${l.d}"/>`).join('')}</g>
<g id="mark-b">${artB.placed.map((l) => `<path d="${l.d}"/>`).join('')}</g>
<g id="v4-a">${v4a.paths}</g>
<g id="v4-b">${v4b.paths}</g>
</defs></svg>`;
const html = fs.readFileSync(path.join(__dirname, 'art-direction.src.html'), 'utf8')
  .replace('<!--SPRITE-->', sprite)
  .replace(/\{\{VB_A\}\}/g, `0 0 ${artA.W} ${artA.Hh}`)
  .replace(/\{\{VB_B\}\}/g, `0 0 ${artB.W} ${artB.Hh}`)
  .replace(/\{\{VB_V4A\}\}/g, frame(v4a.vb, 43.36))
  .replace(/\{\{VB_V4B\}\}/g, frame(v4b.vb, 40))
  .replace(/\{\{RA\}\}/g, (artA.W / artA.Hh).toFixed(4))
  .replace(/\{\{RB\}\}/g, (artB.W / artB.Hh).toFixed(4))
  .replace(/\{\{RV4A\}\}/g, (v4a.vb[2] / artA.Hh).toFixed(4))
  .replace(/\{\{RV4B\}\}/g, (v4b.vb[2] / artA.Hh).toFixed(4));
if (/\{\{/.test(html)) throw new Error('unreplaced placeholder in art-direction.src.html');
fs.writeFileSync(path.join(OUT, 'rawza-art-direction.html'), html);

// ---------- report
for (const [n, art] of [['A', artA], ['B', artB]]) {
  console.log(`Direction ${n}: ${art.W} x ${art.Hh}   positions ${art.pos.map(Math.round).join(' ')}`);
  for (const l of art.placed) console.log(`  ${l.id.padEnd(12)} subpaths ${l.check.subpaths}  anchors ${String(l.check.anchors).padStart(3)}  self-intersections ${l.check.selfX}  counters ${l.check.windingOk ? 'ok' : 'WRONG'}`);
}
