// CONCEPT B — GARDEN  ·  Rawza
// A second, separate direction. Only the R is carried over from direction A (the release R, with its
// broad-nib leg); everything else is new:
//  · the lowercase is cut from Cormorant Upright (SIL OFL 1.1), an upright cursive: single-storey a,
//    looped w, calligraphic z — written shapes rather than a book serif, edited letter by letter
//  · the symbol is a tulip bud (two petals and a written stem), drawn here, not taken from a font
// Units: cap height 700, baseline y = 700, x-height line at y = XH (about 268).
const { paper, poly, union, sub, translate } = require('./lib.cjs');
const { loadFont } = require('./glyphs.cjs');
const { space } = require('./spacing.cjs');
const { dropSpecks } = require('./edit.cjs');
const royal = require('./royal.cjs');

const U = loadFont(`CormorantUpright-${process.env.RAWZA_B_CUT || 'Regular'}.ttf`);
const XH = U.xHeight;

// a: o.tail draws the exit stroke on into a long hairline that lifts away from the word, the
// counterpart of the R's tail. The font's exit is cut square across at `at` (along `dir`), and a
// tapering stroke of the same width and direction carries on from there:
// { at: [x, y], dir: [dx, dy], c1: handle length along dir, c2: [x, y], end: [x, y], k: taper }
function a(o = {}) {
  const g = U.glyph('a');
  let s = g.shape;
  if (o.tail) {
    const { at, dir, c1 = 60, c2, end, k = 1.4 } = o.tail;
    const L = Math.hypot(dir[0], dir[1]), d = [dir[0] / L, dir[1] / L], n = [-d[1], d[0]];
    const across = new paper.Path.Line({ from: [at[0] - n[0] * 60, at[1] - n[1] * 60], to: [at[0] + n[0] * 60, at[1] + n[1] * 60], insert: false });
    const q = s.getIntersections(across).map((x) => [x.point.x, x.point.y]);
    if (q.length !== 2) throw new Error('a: tail cut must cross the exit stroke once');
    const c = [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2], w0 = Math.hypot(q[0][0] - q[1][0], q[0][1] - q[1][1]);
    const far = (u, v) => [c[0] + d[0] * u + n[0] * v, c[1] + d[1] * u + n[1] * v];
    s = sub(s, poly([far(0, -60), far(0, 60), far(200, 60), far(200, -60)]));
    const p = [far(-2, 0), far(c1, 0), c2, end];
    s = union([s, require('./bud.cjs').brush(p, (t) => Math.max(0.5, w0 * (1 - t) ** k))]);
  }
  return { shape: dropSpecks(s), adv: g.adv };
}
function w(o = {}) {
  const g = U.glyph('w');
  const s = g.shape.clone({ insert: false });
  if (o.leaf) {
    const k = s.children[0], seg = k.segments;
    const { tip, inC, outC, base = 14, top = 20 } = o.leaf;
    const P = seg[0].point.constructor;
    // the drop: anchors 47–49 between the inner edge (46) and the arm's top (0)
    if (Math.abs(seg[48].point.x - 575.7) > 1) throw new Error('w: unexpected outline');
    seg[49].remove(); seg[47].remove();
    const t = seg[47];
    t.point = new P(tip[0], tip[1]); t.handleIn = new P(inC[0], inC[1]); t.handleOut = new P(outC[0], outC[1]);
    seg[46].handleOut = Array.isArray(base) ? new P(base[0], base[1]) : seg[46].handleOut.normalize(base);
    if (o.leaf.flow) {
      // the arm's outer edge runs straight on into the leaf: its top anchor goes
      seg[1].handleIn = new P(o.leaf.flow[0], o.leaf.flow[1]); seg[0].remove();
    } else seg[0].handleIn = Array.isArray(top) ? new P(top[0], top[1]) : new P(-top, 0);
  }
  return { shape: s, adv: g.adv };
}
function z() { const g = U.glyph('z'); return { shape: g.shape, adv: g.adv }; }

const FINAL = {
  gap: 140, extra: [0, 0, 0, 0, 0], reach: 330, R: {},
  w: { leaf: { tip: [586, 240], inC: [-12, 20], outC: [22, -2], base: [-30, -22], flow: [-10, -40] } },
  a2: { tail: { at: [490, 660], dir: [0.68, -0.73], c1: 40, c2: [575, 590], end: [680, 585], k: 1.3 } },
};
// the approved lockup settings
const LOCK = { budScale: 0.95, budGap: 110, descCap: 70, descTrack: 0.5, descY: 930 };
function set(opts) {
  const o = { ...FINAL, ...(opts || {}) };
  const A = a(), Rb = royal.F.glyph('R');
  const glyphs = [
    { id: 'letter-R', shape: Rb.shape, adv: Rb.adv }, { id: 'letter-a-1', ...A }, { id: 'letter-w', ...w(o.w) },
    { id: 'letter-z', ...z(o.z) }, { id: 'letter-a-2', ...a(o.a2) }];
  const pos = space(glyphs, { y0: XH, y1: 704, step: 4, depth: 90, gap: o.gap, minGap: [0, 20, 20, 20, 20], extra: o.extra });
  glyphs[0] = { id: 'letter-R', ...royal.R(pos[1] + o.reach, { ...require('./system.cjs').RELEASE.R, ...o.R }) };
  const clearance = royal.minDistance(glyphs[0].shape, translate(A.shape, pos[1], 0), 560);
  return { glyphs, pos, clearance };
}

// ---- lockup: bud centred above the letters, descriptor below
const { rect, scale } = require('./lib.cjs');
const { line } = require('./text.cjs');
const BUD = require('./bud.cjs');
function centre(pieces) {
  const clip = rect(-1e4, XH - 20, 1e4, 700);
  return pieces.map((p) => p.item.intersect(clip, { insert: false }).bounds).reduce((a, r) => a.unite(r)).center.x;
}
const TEXTS = { full: 'AFGHAANS RESTAURANT', short: 'RESTAURANT' };
function lockup(opts = {}) {
  const { glyphs, pos } = set(opts.preset);
  const wordmark = glyphs.map((g, i) => ({ id: g.id, item: translate(g.shape, pos[i], 0) }));
  const cx = centre(wordmark) + (opts.dx ?? 0);
  const b = BUD.bud2(opts.bud);
  const k = opts.budScale ?? 0.8, gap = opts.budGap ?? 140;
  const bs = scale(b, k, 0, 0), bb = bs.bounds;
  const mark = translate(bs, cx, -gap - (bb.y + bb.height));
  const out = { wordmark, mark: [{ id: 'bud', item: mark }] };
  if (opts.text !== false) {
    const t = line(opts.descFont ?? 'Marcellus-Regular.ttf', TEXTS[opts.text || 'full'], { cap: opts.descCap ?? 70, track: opts.descTrack ?? 0.5 });
    out.descriptor = [{ id: 'descriptor', item: translate(t, cx - t.bounds.width / 2 - t.bounds.x, opts.descY ?? 930) }];
  }
  return out;
}
module.exports = { U, XH, a, w, z, set, FINAL, LOCK, lockup, TEXTS, centre };
