// DIRECTION A v3 — "Refined Signature"
// Wide inscriptional capitals. Changes against v2:
//  R  leg runs as one continuous, tapering stroke; shallower tail with a cut terminal
//  A  flat-cut apex with a small inscriptional beak (replaces the v2 flag)
//  W  narrower, strokes taper towards blunted vertices, slightly heavier hairlines
//  Z  diagonal tapers like the W; beaks reduced to bracket size
const { poly, rect, shape, union, sub, inter, fillet, lineX } = require('./lib.cjs');

const H = 700;   // cap height; baseline at y = 700
const T = 88;    // thick stroke
const h = 16;    // hairline / serif thickness
const s = 44;    // serif overhang
const r = 30;    // bracket size

// serif slab + concave brackets on a stroke whose edges are xl(y), xr(y)
function serif(xl, xr, where, o = {}) {
  const oL = o.oL ?? s, oR = o.oR ?? s, rL = o.rL ?? r, rR = o.rR ?? r, t = o.t ?? h;
  const [y0, yi, sg] = where === 'bottom' ? [H, H - t, -1] : [0, t, 1];
  const parts = [rect(xl(y0) - oL, Math.min(y0, yi), xr(y0) + oR, Math.max(y0, yi))];
  if (rL) parts.push(fillet([xl(yi), yi], [xl(yi + sg * rL), yi + sg * rL], [xl(yi) - rL, yi]));
  if (rR) parts.push(fillet([xr(yi), yi], [xr(yi + sg * rR), yi + sg * rR], [xr(yi) + rR, yi]));
  return parts;
}
const vert = (x) => () => x;
// a straight stroke whose horizontal width changes from wTop (y=0) to wBot (y=H)
function taper(leftTop, leftBot, wTop, wBot, y0 = -60, y1 = H + 60) {
  const L = lineX([leftTop, 0], [leftBot, H]);
  const R = lineX([leftTop + wTop, 0], [leftBot + wBot, H]);
  return { L, R, band: poly([[L(y0), y0], [R(y0), y0], [R(y1), y1], [L(y1), y1]]) };
}

// ---- R
function R() {
  const x0 = 44, x1 = x0 + T, bx = 452;
  const stem = rect(x0, 0, x1, H);
  const bowlO = shape(`M88,0 H262 C382,0 ${bx},68 ${bx},176 C${bx},288 376,358 258,358 H88 Z`);
  const ib = bx - T;
  const bowlI = shape(`M${x1},${h} H250 C328,${h} ${ib},78 ${ib},176 C${ib},278 322,340 246,340 H${x1} Z`);
  // leg: one stroke — straight diagonal, a long soft turn through the baseline,
  // then a hairline that tapers under the A and ends in an angled cut
  const leg = shape('M206,350 L380,628 C398,657 428,712 498,738 C552,754 626,754 694,740 L712,733 C648,741 590,741 550,733 C518,726 498,700 478,664 L298,338 Z');
  return {
    shape: union([stem, sub(bowlO, bowlI), leg,
      ...serif(vert(x0), vert(x1), 'top', { oR: 0, rR: 0 }),
      ...serif(vert(x0), vert(x1), 'bottom', { oR: 36 })]),
    adv: 470,
  };
}

// ---- A : flat-cut apex with a small beak, low hairline crossbar
function A() {
  const xL = 44, xR = 600, ax = (xL + xR) / 2, ay = -44, cut = -12;
  const outer = inter(poly([[ax, ay], [xR, H], [xL, H]]), rect(0, cut, 700, H));
  const k = (ax - xL) / (H - ay), cos = 1 / Math.sqrt(1 + k * k);
  const thin = 21 / cos, thick = 90 / cos;
  const lo = lineX([ax, ay], [xL, H]), li = (y) => lo(y) + thin;
  const ro = lineX([ax, ay], [xR, H]), ri = (y) => ro(y) - thick;
  const band = (a, b) => poly([[a(ay - 40), ay - 40], [b(ay - 40), ay - 40], [b(H), H], [a(H), H]]);
  const bar = rect(0, 450, 700, 450 + h);
  const body = inter(union([band(lo, li), band(ri, ro), bar]), outer);
  // beak: continues the flat cut to the left, underside curving into the hairline
  const bx = lo(cut);
  const beak = shape(`M${bx + 4},${cut} L${bx - 24},${cut} C${bx - 12},${cut + 6} ${bx - 4},${cut + 16} ${lo(cut + 34)},${cut + 34} Z`);
  return {
    shape: union([body, beak,
      ...serif(lo, li, 'bottom', { oL: 44, oR: 32, rL: 26, rR: 22 }),
      ...serif(ri, ro, 'bottom', { oL: 34, oR: 44, rL: 26, rR: 30 })]),
    adv: 644,
  };
}

// ---- W : two interlocking Vs; tapering strokes; blunted vertices
function W() {
  const vy = H + 28, cutY = H + 10;              // virtual vertex depth, flat cut just below baseline
  const k1 = 0.35, k2 = 0.33;                    // slope of down-strokes / up-strokes (dx per dy)
  const t1 = 40, v1 = t1 + k1 * vy, t2 = v1 + k2 * vy;
  const t3 = 372, v2 = t3 + k1 * vy, t4 = v2 + k2 * vy;
  const vA = inter(poly([[t1 - k1 * 60, -60], [t2 + k2 * 60, -60], [v1, vy]]), rect(-100, 0, 1200, cutY));
  const vB = inter(poly([[t3 - k1 * 60, -60], [t4 + k2 * 60, -60], [v2, vy]]), rect(-100, 0, 1200, cutY));
  const at = (x0, kk) => x0 + kk * H;           // x of an edge at the baseline
  const s1 = taper(t1, at(t1, k1), 100, 84);
  const s2 = taper(t2 - 24, at(t2, -k2) - 19, 24, 19);
  const s3 = taper(t3, at(t3, k1), 100, 84);
  const s4 = taper(t4 - 24, at(t4, -k2) - 19, 24, 19);
  const V1 = inter(union([s1.band, s2.band]), vA);
  const V2 = inter(union([s3.band, s4.band]), vB);
  return {
    shape: union([V1, V2,
      ...serif(s1.L, s1.R, 'top', { oL: 44, oR: 32 }),
      ...serif(s3.L, s3.R, 'top', { oL: 34, oR: 0, rR: 0 }),
      ...serif(s2.L, s2.R, 'top', { oL: 0, oR: 38, rL: 0, rR: 24 }),
      ...serif(s4.L, s4.R, 'top', { oL: 32, oR: 44, rL: 24 })]),
    adv: Math.round(t4 + 44),
  };
}

// ---- Z : tapering diagonal, beaks reduced to bracket size
function Z() {
  const top = rect(46, 0, 470, h);
  const beakT = shape(`M46,0 L46,78 C50,42 66,22 100,${h} L100,0 Z`);
  const diag = inter(poly([[364, 0], [470, 0], [146, H], [52, H]]), rect(46, 0, 512, H));
  const bot = rect(46, H - h - 2, 508, H);
  const beakB = shape(`M508,${H} L508,612 C504,656 486,680 452,${H - h - 2} L452,${H} Z`);
  return { shape: union([top, beakT, diag, bot, beakB]), adv: 548 };
}

module.exports = { H, R, A, W, Z };
