// CONCEPT B — "Contemporary Heritage": condensed glyphic capitals whose A is
// drawn as a pointed arch on upright piers, plus a chahar-bagh garden emblem.
// make({ S, t }) returns the glyph set (display cut by default).
const { poly, rect, shape, union, sub, inter, fillet } = require('./lib.cjs');

const H = 700;

// line helpers for the W
function edge(p0, p1, off) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  return [[p0[0] - nx * off, p0[1] - ny * off], [p1[0] - nx * off, p1[1] - ny * off]];
}
function X(l1, l2) {
  const [[x1, y1], [x2, y2]] = l1, [[x3, y3], [x4, y4]] = l2;
  const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const a = x1 * y2 - y1 * x2, b = x3 * y4 - y3 * x4;
  return [(a * (x3 - x4) - (x1 - x2) * b) / D, (a * (y3 - y4) - (y1 - y2) * b) / D];
}
const atY = (l, y) => [l[0][0] + (l[1][0] - l[0][0]) * (y - l[0][1]) / (l[1][1] - l[0][1]), y];

function make(p = {}) {
  const S = p.S ?? 58;   // main stroke
  const t = p.t ?? 28;   // secondary stroke

  // glyphic flare at the foot/head of a vertical stroke edge
  // dir: +1 foot (y = baseline), -1 head ; side: -1 left edge, +1 right edge
  const flare = (x, y, dir, side, f = 9, len = 84) => fillet([x, y], [x, y - dir * len], [x + side * f, y]);

  // A — a pointed (four-centred) arch on slightly splayed piers; the crossbar
  // sits like an impost line just below the springing of the arch
  function A(o = {}) {
    const w = o.w ?? 372, ay = o.ay ?? -18, spring = o.spring ?? 292, bar = o.bar ?? 440;
    const c = w / 2, k = o.k ?? 104, dy = o.dy ?? 74, c1 = o.c1 ?? 120, sp = o.sp ?? 9;
    const ik = o.ik ?? k - 40, idy = o.idy ?? dy - 10, ic1 = o.ic1 ?? c1 - 46, ith = o.ith ?? 50 + (t - 28) * 0.6;
    const tx = sp / (H - spring); // keeps the curve tangent to the splayed pier
    const outer = shape(`M${-sp},${H} L0,${spring} C${tx * c1},${spring - c1} ${c - k},${ay + dy} ${c},${ay} C${c + k},${ay + dy} ${w - tx * c1},${spring - c1} ${w},${spring} L${w + sp},${H} Z`);
    const iy = ay + ith, il = S, ir = w - S;
    const inner = shape(`M${il - sp},${H + 2} L${il},${spring + 10} C${il + tx * ic1},${spring - ic1} ${c - ik},${iy + idy} ${c},${iy} C${c + ik},${iy + idy} ${ir - tx * ic1},${spring - ic1} ${ir},${spring + 10} L${ir + sp},${H + 2} Z`);
    const cross = inter(rect(-sp, bar, w + sp, bar + t), outer);
    return {
      shape: union([sub(outer, inner), cross,
        flare(-sp, H, 1, -1), flare(S - sp, H, 1, 1, 6),
        flare(w + sp, H, 1, 1), flare(w - S + sp, H, 1, -1, 6)]),
      adv: w, spring, bar,
    };
  }

  // R — condensed, hairline bowl, straight leg
  function R() {
    const stem = rect(0, 0, S, H);
    const bowlO = shape('M30,0 H178 C278,0 334,68 334,180 C334,292 278,360 178,360 H30 Z');
    const ib = 334 - S;
    const bowlI = shape(`M${S},${t} H174 C246,${t} ${ib},100 ${ib},180 C${ib},262 246,${360 - t} 174,${360 - t} H${S} Z`);
    const leg = poly([[168, 336], [176 + S, 330], [366, H], [358 - S, H]]);
    const parts = [stem, sub(bowlO, bowlI), leg, flare(0, H, 1, -1), flare(S, H, 1, 1, 6), flare(0, 0, -1, -1)];
    return { shape: inter(union(parts), rect(-20, -20, 420, H)), adv: 376 };
  }

  // W — condensed; the centre peak stops short of the cap line
  function Wraw(o, vy) {
    const TL = [34, 0], V1 = [176, vy], PK = [306, o.py], V2 = [436, vy], TR = [578, 0];
    const wT = S, wt = t + 2;
    const s1 = [edge(TL, V1, wT / 2), edge(TL, V1, -wT / 2)];
    const s2 = [edge(PK, V1, -wt / 2), edge(PK, V1, wt / 2)];
    const s3 = [edge(PK, V2, wT / 2), edge(PK, V2, -wT / 2)];
    const s4 = [edge(TR, V2, -wt / 2), edge(TR, V2, wt / 2)];
    const left = (pr) => (atY(pr[0], 400)[0] < atY(pr[1], 400)[0] ? pr[0] : pr[1]);
    const right = (pr) => (atY(pr[0], 400)[0] < atY(pr[1], 400)[0] ? pr[1] : pr[0]);
    const pts = {
      P1: atY(left(s1), 0), P2: atY(right(s1), 0), C1: X(right(s1), left(s2)), Q: X(left(s2), right(s3)),
      C2: X(right(s3), left(s4)), P3: atY(left(s4), 0), P4: atY(right(s4), 0),
      B2: X(right(s4), left(s3)), C3: X(left(s3), right(s2)), B1: X(right(s2), left(s1)),
    };
    const body = poly([pts.P1, pts.P2, pts.C1, pts.Q, pts.C2, pts.P3, pts.P4, pts.B2, pts.C3, pts.B1]);
    return { shape: inter(body, rect(-50, 0, 800, H + 14)), adv: pts.P4[0] + 30, pts };
  }
  function W(o = {}) {
    // solve the vertex depth so the pointed feet overshoot by 10, and the peak height
    let vy = H - 20, py = 250;
    for (let i = 0; i < 40; i++) {
      const r = Wraw({ py }, vy);
      vy += (H + 10 - r.pts.B1[1]) * 0.8;
      py += ((o.qy ?? 150) - r.pts.Q[1]) * 0.8;
    }
    return Wraw({ py }, vy);
  }

  // Z — hairline bars, full diagonal
  function Z() {
    const top = rect(18, 0, 336, t);
    const bot = rect(12, H - t - 4, 344, H);
    const diag = inter(poly([[336 - S - 4, 0], [340, 0], [16 + S, H], [12, H]]), rect(12, 0, 344, H));
    return { shape: union([top, bot, diag]), adv: 356 };
  }

  return { H, A, R, W, Z, kern: [0, 64, 50, 56, 60] };
}

// Emblem — plan of a chahar-bagh (four-part garden): wall, four beds whose
// chamfered corners open an octagonal court, eight-point pool at the centre.
function emblem(o = {}) {
  const N = 600, c = N / 2, fw = o.frame ?? 18, wallGap = o.wallGap ?? 34, ch = o.channel ?? 34, cham = o.cham ?? 104;
  const frame = sub(rect(0, 0, N, N), rect(fw, fw, N - fw, N - fw));
  const beds = [];
  const a = fw + wallGap, b = c - ch;
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const Xf = (v) => (sx > 0 ? v : N - v), Yf = (v) => (sy > 0 ? v : N - v);
    beds.push(poly([[Xf(a), Yf(a)], [Xf(b), Yf(a)], [Xf(b), Yf(b - cham)], [Xf(b - cham), Yf(b)], [Xf(a), Yf(b)]]));
  }
  const R0 = o.star ?? 92;
  const sq1 = rect(c - R0 * 0.7071, c - R0 * 0.7071, c + R0 * 0.7071, c + R0 * 0.7071);
  const sq2 = sq1.clone({ insert: false }); sq2.rotate(45, [c, c]);
  const star = union([sq1, sq2]);
  let ground = union([frame, ...beds]);
  if (o.water) {
    // hairline water channels running from the pool to the wall
    const wl = o.water, g = R0 + 22;
    ground = union([ground, rect(c - wl / 2, fw, c + wl / 2, c - g), rect(c - wl / 2, c + g, c + wl / 2, N - fw),
      rect(fw, c - wl / 2, c - g, c + wl / 2), rect(c + g, c - wl / 2, N - fw, c + wl / 2)]);
  }
  return { shape: union([ground, star]), ground, star, adv: N };
}

module.exports = { H, make, emblem };
