// DIRECTION B v3 — "Expressive Editorial": Rawza in a vertical-stress display serif.
// Changes against v2: lighter a with a smaller, tapered drop terminal; heavier, narrower w;
// unified stroke system (cap stem 100, lowercase stems 86-88, hairlines 12-14);
// overshoots on all round and pointed forms; the wz ligature removed.
// Distinctive feature: the R's leg flares into a pointed foot that leads into the a.
const { poly, rect, shape, union, sub, inter, circle } = require('./lib.cjs');

const H = 700;    // baseline; cap height 700
const XH = 262;   // x-height line (x-height 438)
const h = 12;     // hairline

// ---- R
function R() {
  const x0 = 40, x1 = x0 + 100;
  const stem = rect(x0, 0, x1, H);
  const serifs = [rect(0, 0, x1, h), rect(0, H - h, x1 + 30, H)];
  const bowlO = shape('M90,0 H244 C368,0 438,68 438,174 C438,280 368,344 244,344 H90 Z');
  const bowlI = shape(`M${x1},${h} H234 C302,${h} 342,72 342,174 C342,274 302,330 234,330 H${x1} Z`);
  const leg = shape('M212,340 C280,412 322,540 346,650 C354,684 368,698 398,700 L510,700 C468,694 448,680 438,650 C414,560 392,428 318,334 Z');
  return { shape: union([stem, ...serifs, sub(bowlO, bowlI), leg]), adv: 480 };
}

// ---- a: double-storey; drop terminal; upturned tail
function a() {
  const arch = shape(`M334,664 L334,380 C334,300 302,252 214,252 C158,252 116,266 96,290 L126,298 C136,281 160,266 196,266 C232,266 252,306 252,392 L252,664 Z`);
  const drop = union([circle(111, 325, 29), shape('M96,290 L126,298 L134,316 L86,316 Z')]);
  const bowlO = shape('M258,452 C168,462 70,502 70,594 C70,664 114,712 172,712 C210,712 238,696 254,668 L258,668 Z');
  const bowlI = shape('M258,472 C196,480 148,520 148,598 C148,654 170,692 206,692 C230,692 246,678 256,658 L258,658 Z');
  const tail = shape('M252,640 L334,640 C334,680 344,696 366,696 C382,696 394,688 402,676 L410,680 C400,702 382,714 356,714 C292,714 252,702 252,668 Z');
  return { shape: union([arch, drop, sub(bowlO, bowlI), tail]), adv: 420 };
}

// line helpers for the w
function X(l1, l2) {
  const [[x1, y1], [x2, y2]] = l1, [[x3, y3], [x4, y4]] = l2;
  const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const p = x1 * y2 - y1 * x2, q = x3 * y4 - y3 * x4;
  return [(p * (x3 - x4) - (x1 - x2) * q) / D, (p * (y3 - y4) - (y1 - y2) * q) / D];
}

// ---- w: heavy down-strokes, 22-unit up-strokes, pointed centre at x-height
function w() {
  const T1 = [22, XH], B1 = [182, H + 10], Ap = [286, XH - 6], B2 = [400, H + 10], T4 = [550, XH];
  const w1 = 112, w2 = 22, w3 = 110, w4 = 22;
  const sh = (l, dx) => l.map(([x, y]) => [x + dx, y]);
  const s1L = [T1, B1], s1R = sh(s1L, w1);
  const s2R = [B1, [Ap[0] + w2, Ap[1]]], s2L = sh(s2R, -w2);
  const s3R = [Ap, [B2[0] + w3, B2[1]]], s3L = sh(s3R, -w3);
  const s4R = [B2, T4], s4L = sh(s4R, -w4);
  const yAt = (l, y) => [l[0][0] + (l[1][0] - l[0][0]) * (y - l[0][1]) / (l[1][1] - l[0][1]), y];
  const pts = [yAt(s1L, XH), yAt(s1R, XH), X(s1R, s2L), Ap, X(s3R, s4L), yAt(s4L, XH), yAt(s4R, XH), B2, X(s3L, s2R), B1];
  const body = inter(poly(pts), rect(-40, XH - 40, 700, H + 12));
  const serifL = rect(0, XH, T1[0] + w1 + 22, XH + h);
  const serifR = rect(yAt(s4L, XH)[0] - 26, XH, T4[0] + 22, XH + h);
  return { shape: union([body, serifL, serifR]), adv: T4[0] + 22 };
}

// ---- z
function z() {
  const top = rect(20, XH, 318, XH + h);
  const beakT = shape(`M20,${XH} L20,${XH + 58} C24,${XH + 30} 36,${XH + 16} 58,${XH + h} L58,${XH} Z`);
  const diag = inter(poly([[222, XH], [318, XH], [112, H], [16, H]]), rect(16, XH, 330, H));
  const bot = rect(16, H - 14, 330, H);
  const beakB = shape(`M330,${H} L330,618 C326,656 312,680 286,${H - 14} L286,${H} Z`);
  return { shape: union([top, beakT, diag, bot, beakB]), adv: 334 };
}

module.exports = { H, XH, R, a, w, z };
