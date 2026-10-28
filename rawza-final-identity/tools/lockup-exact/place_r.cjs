// The exact swash R (../r-exact/shape.json, 10 units per pixel of the 307x342 crop) moved into
// reference-image pixel units: the crop is the full reference scaled by 1/1.02, sitting at (141, 557).
const fs = require('fs');
const { paper, fix } = require('../lib.cjs');
const [dx, dy] = (process.env.OFF || '140.65,556.9').split(',').map(Number);
const r = new paper.CompoundPath({ pathData: JSON.parse(fs.readFileSync('../r-exact/shape.json', 'utf8')).d, insert: false });
r.scale(0.1 * +(process.env.SC || 1.02), new paper.Point(0, 0)); r.translate(new paper.Point(dx, dy));
fs.writeFileSync(process.argv[2], JSON.stringify({ d: fix(r.pathData, 3) }));
console.log(r.bounds.toString());
