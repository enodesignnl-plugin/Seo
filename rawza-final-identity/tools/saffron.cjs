// The saffron mark: the three stigmas of the saffron crocus (the threads that are the spice; Herat
// saffron is one of Afghanistan's best-known products). Each thread is one stroke of the same
// broad nib (qalam.cjs, angle -28°) that draws the R's leg: it starts as a hairline at the shared
// base and opens towards the tip, which ends in the nib's own oblique cut. Because the nib angle is
// fixed, the three threads take different weights from their direction, as pen strokes do.
// Units: the mark is drawn about 330 high; the base of the threads is at (0, 0), tips point up.
const { union, translate } = require('./lib.cjs');
const { stroke } = require('./qalam.cjs');
const { dropSpecks } = require('./edit.cjs');

const ANGLE = -28;
function thread(tip, bow, o) {
  const [tx, ty] = tip;
  // a gentle outward curve: leaves the base steeply, leans out towards the tip
  const pts = [[0, 0], [tx * 0.05 + bow * 0.2, ty * 0.35], [tx * 0.55 + bow, ty * 0.75], [tx, ty]];
  const pressure = (t) => o.min + (1 - o.min) * Math.pow(t, o.pow);
  return stroke(pts, { nib: o.nib, angle: ANGLE, pressure, samples: 300, tolerance: 0.3 });
}
function mark(o = {}) {
  const opt = { nib: o.nib ?? 46, min: o.min ?? 0.08, pow: o.pow ?? 2.2 };
  // tips and bows of the three threads: [tipX, tipY, bow]
  const T = o.threads ?? [[0, -330, 0], [-92, -284, -11], [92, -284, 11]];
  const parts = T.map(([x, y, b]) => thread([x, y], b, opt));
  // the style: a short hairline stem below the point where the threads part
  if (o.stem !== false) parts.push(stroke([[0, 0], [0, 20], [0, 40], [0, o.stem ?? 70]], { nib: opt.nib, angle: ANGLE, pressure: (t) => opt.min * (1 - 0.5 * t), samples: 60 }));
  return dropSpecks(union(parts));
}
module.exports = { mark };
