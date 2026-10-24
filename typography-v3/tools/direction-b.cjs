// DIRECTION B — "Expressive Editorial": Rawza in a high-contrast, vertical-stress
// display serif drawn from scratch. Ball terminals, unbracketed hairline serifs,
// a large x-height and one ligature: the w's last hairline runs into the z.
const { poly, rect, shape, union, sub, inter, circle } = require('./lib.cjs');

const H = 700;        // baseline y; cap height 700
const XH = 260;       // x-height line (x-height 440)
const S = 100;        // thick stroke
const h = 11;         // hairline

// ---- R: Didone capital; the leg flares into a pointed foot
function R() {
  const x0 = 40, x1 = x0 + 104;
  const stem = rect(x0, 0, x1, H);
  const serifs = [rect(0, 0, x1, h), rect(0, H - h, x1 + 34, H)];
  const bowlO = shape('M90,0 H246 C372,0 444,70 444,178 C444,286 372,352 246,352 H90 Z');
  const bowlI = shape(`M${x1},${h} H236 C306,${h} 340,72 340,178 C340,282 306,${352 - h - 2} 236,${352 - h - 2} H${x1} Z`);
  // leg: a heavy, slightly concave stroke whose foot flares into a hairline point on the baseline
  const leg = shape('M212,346 C282,420 326,548 352,652 C360,684 374,698 404,700 L512,700 C470,692 452,676 442,646 C418,560 392,430 318,340 Z');
  return { shape: union([stem, ...serifs, sub(bowlO, bowlI), leg]), adv: 476 };
}

// ---- a: double-storey, ball terminal on the arch, upturned tail on the stem
function a() {
  const arch = shape('M342,664 L342,370 C342,292 302,256 212,256 C152,256 104,272 82,298 L118,304 C134,284 160,271 196,271 C230,271 246,300 246,382 L246,664 Z');
  const ball = circle(102, 330, 44);
  const bowlO = shape('M262,452 C152,462 54,506 54,594 C54,664 104,710 164,710 C206,710 240,690 256,660 L262,660 Z');
  const bowlI = shape('M262,472 C190,480 152,518 152,598 C152,652 174,684 206,684 C230,684 248,670 258,648 L262,648 Z');
  const tail = shape('M246,640 L342,640 C342,676 352,694 374,694 C392,694 404,684 412,670 L420,674 C410,700 390,712 362,712 C292,712 246,700 246,664 Z');
  return { shape: union([arch, ball, sub(bowlO, bowlI), tail]), adv: 420 };
}

// line helpers for the w
function X(l1, l2) {
  const [[x1, y1], [x2, y2]] = l1, [[x3, y3], [x4, y4]] = l2;
  const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const p = x1 * y2 - y1 * x2, q = x3 * y4 - y3 * x4;
  return [(p * (x3 - x4) - (x1 - x2) * q) / D, (p * (y3 - y4) - (y1 - y2) * q) / D];
}
const line = (x0, y0, x1, y1) => [[x0, y0], [x1, y1]];

// ---- w: thick down-strokes, hairline up-strokes, pointed centre peak at x-height
function w(o = {}) {
  const vy = H + 12;
  const T1 = [24, XH], B1 = [196, vy], Ap = [302, XH - 8], B2 = [424, vy], T4 = [584, XH];
  const w1 = 108, w2 = 15, w3 = 104, w4 = 15;
  const sh = (l, dx) => l.map(([x, y]) => [x + dx, y]);
  const s1L = [T1, B1], s1R = sh(s1L, w1);
  const s2R = [B1, [Ap[0] + w2, Ap[1]]], s2L = sh(s2R, -w2);
  const s3R = [Ap, [B2[0] + w3, B2[1]]], s3L = sh(s3R, -w3);
  const s4R = [B2, T4], s4L = sh(s4R, -w4);
  const yAt = (l, y) => [l[0][0] + (l[1][0] - l[0][0]) * (y - l[0][1]) / (l[1][1] - l[0][1]), y];
  const pts = [yAt(s1L, XH), yAt(s1R, XH), X(s1R, s2L), Ap, X(s3R, s4L), yAt(s4L, XH), yAt(s4R, XH), B2, X(s3L, s2R), B1];
  const body = inter(poly(pts), rect(-40, XH - 40, 700, H + 14));
  const serifL = rect(0, XH, 164, XH + h);
  const serifR = rect(540, XH, o.joinTo ?? 620, XH + h);
  return { shape: union([body, serifL, serifR]), adv: o.adv ?? 596 };
}

// ---- z: hairline bars, heavy diagonal; o.join drops the left beak for the ligature
function z(o = {}) {
  const top = rect(o.join ? 0 : 20, XH, 322, XH + h);
  const diag = inter(poly([[226, XH], [322, XH], [110, H], [14, H]]), rect(14, XH, 330, H));
  const bot = rect(14, H - h - 2, 334, H);
  const beakB = shape(`M334,${H} L334,604 C330,650 316,676 290,${H - h - 2} L290,${H} Z`);
  const parts = [top, diag, bot, beakB];
  if (!o.join) parts.push(shape(`M20,${XH} L20,${XH + 70} C24,${XH + 34} 38,${XH + 16} 64,${XH + h} L64,${XH} Z`));
  return { shape: union(parts), adv: 350 };
}

module.exports = { H, XH, R, a, w, z, kern: [0, -22, 6, -40, 10] };
