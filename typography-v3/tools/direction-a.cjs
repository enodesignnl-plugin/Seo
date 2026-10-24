// DIRECTION A — "Refined Signature": wide, high-contrast inscriptional capitals,
// refined from round-1 Concept A (shorter R tail with a lifted terminal, beaked A apex).
// make({ T, h }) returns the glyph set; the default is the display cut,
// a heavier-hairline "small cut" is used below ~40px cap height.
const { poly, rect, shape, union, sub, inter, fillet, lineX } = require('./lib.cjs');

const H = 700; // cap height, baseline at y = 700

function make(p = {}) {
  const T = p.T ?? 88;   // thick stroke
  const h = p.h ?? 16;   // hairline / serif thickness
  const s = p.s ?? 44;   // serif overhang
  const r = p.r ?? 30;   // bracket size
  const dt = h - 16;     // hairline gain relative to the display cut

  // serif slab + brackets on a stroke whose edges are xl(y), xr(y)
  function serif(xl, xr, where, o = {}) {
    const oL = o.oL ?? s, oR = o.oR ?? s, rL = o.rL ?? r, rR = o.rR ?? r, t = o.t ?? h;
    const parts = [];
    const [y0, yi, sg] = where === 'bottom' ? [H, H - t, -1] : [0, t, 1];
    parts.push(rect(xl(y0) - oL, Math.min(y0, yi), xr(y0) + oR, Math.max(y0, yi)));
    if (rL) parts.push(fillet([xl(yi), yi], [xl(yi + sg * rL), yi + sg * rL], [xl(yi) - rL, yi]));
    if (rR) parts.push(fillet([xr(yi), yi], [xr(yi + sg * rR), yi + sg * rR], [xr(yi) + rR, yi]));
    return parts;
  }
  const vert = (x) => () => x;

  // A — pointed apex with overshoot, low hairline crossbar
  function A() {
    const xL = 44, xR = 600, ax = (xL + xR) / 2, ay = -18;
    const outer = poly([[ax, ay], [xR, H], [xL, H]]);
    const k = (ax - xL) / (H - ay), cos = 1 / Math.sqrt(1 + k * k);
    const thin = (h + 5) / cos, thick = (T + 2) / cos;
    const lo = lineX([ax, ay], [xL, H]), li = (y) => lo(y) + thin;
    const ro = lineX([ax, ay], [xR, H]), ri = (y) => ro(y) - thick;
    const bandL = poly([[lo(ay - 50), ay - 50], [lo(H), H], [li(H), H], [li(ay - 50), ay - 50]]);
    const bandR = poly([[ri(ay - 50), ay - 50], [ri(H), H], [ro(H), H], [ro(ay - 50), ay - 50]]);
    const bar = rect(0, 448 - dt / 2, 700, 448 + h - dt / 2);
    const body = inter(union([bandL, bandR, bar]), outer);
    const beak = shape(`M${ax},${ay} L${ax - 44},${ay + 5} C${ax - 26},${ay + 10} ${ax - 14},${ay + 22} ${ax - 8},${ay + 40} Z`);
    return {
      shape: union([body, beak,
        ...serif(lo, li, 'bottom', { oL: 46, oR: 34, rL: 26, rR: 22 }),
        ...serif(ri, ro, 'bottom', { oL: 36, oR: 46, rL: 26, rR: 30 })]),
      adv: 644,
    };
  }

  // R — the signature leg runs on below the baseline and tucks under the A
  function R(o = {}) {
    const x0 = 44, x1 = x0 + T, bx = 456, hb = h + 2;
    const stem = rect(x0, 0, x1, H);
    const bowlO = shape(`M88,0 H262 C384,0 ${bx},68 ${bx},178 C${bx},292 378,362 258,362 H88 Z`);
    const ib = bx - T;
    const bowlI = shape(`M${x1},${h} H250 C330,${h} ${ib},80 ${ib},178 C${ib},282 324,${362 - hb} 246,${362 - hb} H${x1} Z`);
    const parts = [stem, sub(bowlO, bowlI),
      ...serif(vert(x0), vert(x1), 'top', { oR: 0, rR: 0 }),
      ...serif(vert(x0), vert(x1), 'bottom', { oR: 40 })];
    if (o.tail === false) {
      // a conventional leg + serif, used only to show the "before"
      parts.push(shape('M206,366 L408,684 L512,684 L304,352 Z'), rect(370, 684, 540, 700), rect(370, H - h, 552, H));
    } else {
      // leg: full weight to the baseline, then a short hairline that lifts into a fine terminal
      parts.push(shape(`M204,354 L370,616 C402,690 458,764 576,768 C672,772 756,752 826,704 C764,740 682,${754 - dt} 604,${752 - dt} C538,748 498,688 472,636 L300,340 Z`));
    }
    return { shape: union(parts), adv: 470 };
  }

  // W — crossed centre: two interlocking Vs, pointed vertices
  function W() {
    const t1 = 40, v1 = 312, t2 = 584, t3 = 392, v2 = 664, t4 = 936, vy = H + 16;
    const vA = poly([[t1, 0], [t2, 0], [v1, vy]]);
    const vB = poly([[t3, 0], [t4, 0], [v2, vy]]);
    const k = (v1 - t1) / vy, cos = 1 / Math.sqrt(1 + k * k);
    const thick = T / cos, thin = (h + 4) / cos;
    const s1o = lineX([t1, 0], [v1, vy]), s1i = (y) => s1o(y) + thick;
    const s2o = lineX([t2, 0], [v1, vy]), s2i = (y) => s2o(y) - thin;
    const s3o = lineX([t3, 0], [v2, vy]), s3i = (y) => s3o(y) + thick;
    const s4o = lineX([t4, 0], [v2, vy]), s4i = (y) => s4o(y) - thin;
    const band = (a, b) => poly([[a(-40), -40], [b(-40), -40], [b(vy + 40), vy + 40], [a(vy + 40), vy + 40]]);
    const V1 = inter(union([band(s1o, s1i), band(s2i, s2o)]), vA);
    const V2 = inter(union([band(s3o, s3i), band(s4i, s4o)]), vB);
    return {
      shape: union([V1, V2,
        ...serif(s1o, s1i, 'top', { oL: 46, oR: 34 }),
        ...serif(s3o, s3i, 'top', { oL: 36, oR: 0, rR: 0 }),
        ...serif(s2i, s2o, 'top', { oL: 0, oR: 40, rL: 0, rR: 24 }),
        ...serif(s4i, s4o, 'top', { oL: 34, oR: 46, rL: 24 })]),
      adv: 976,
    };
  }

  // Z — beaked hairline bars, heavy diagonal
  function Z() {
    const top = rect(40, 0, 478, h);
    const beakT = shape(`M40,0 L40,100 C44,52 66,24 110,${h} L110,0 Z`);
    const diag = inter(poly([[372 - (T - 88), 0], [478, 0], [150, H], [44 - (T - 88), H]]), rect(40, 0, 520, H));
    const bot = rect(40, H - h - 2, 516, H);
    const beakB = shape(`M516,700 L516,588 C512,644 488,676 436,${H - h - 2} L436,700 Z`);
    return { shape: union([top, beakT, diag, bot, beakB]), adv: 556 };
  }

  return { H, A, R, W, Z, kern: [0, 66, -34, 44, 6] };
}

module.exports = { H, make };
