// Shared SVG output: clean-up and checks per piece, placement in an artboard, and the SVG writer.
const { translate, fix } = require('./lib.cjs');

// ---------- clean-up and checks per piece
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

// ---------- place a set of groups ({ group, pieces }) in an artboard with a margin; square = true
// centres the art in a square board (monograms)
function place(groups, o = {}) {
  const all = groups.flatMap((g) => g.pieces);
  const b = all.map((p) => p.item.bounds).reduce((a, r) => a.unite(r));
  const m = o.margin ?? 60;
  let W = b.width + 2 * m, H = b.height + 2 * m, dx = m - b.x, dy = m - b.y;
  if (o.square) { const s = Math.max(W, H); dx += (s - W) / 2; dy += (s - H) / 2; W = H = s; }
  const placed = groups.map((g) => ({ group: g.group, pieces: g.pieces.map((p) => {
    const s = translate(p.item, dx, dy);
    return { id: p.id, check: inspect(s), d: fix(s.pathData, 2) };
  }) }));
  return { W: Math.ceil(W), H: Math.ceil(H), dx, dy, placed };
}
// fills: optional { group: colour } (default black)
function svg(art, title, note, fills = {}) {
  const body = art.placed.map((g) => `  <g id="${g.group}">\n${g.pieces.map((p) => `    <g id="${p.id}">\n      <path fill="${fills[g.group] || '#000000'}" d="${p.d}"/>\n    </g>`).join('\n')}\n  </g>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- RAWZA — ${title}. Vector outlines, one group per element, no fonts needed, transparent background.
     ${note} -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.W} ${art.H}" width="${Math.round(art.W / 4)}" height="${Math.round(art.H / 4)}">
<title>RAWZA — ${title}</title>
${body}
</svg>
`;
}

module.exports = { inspect, place, svg };
