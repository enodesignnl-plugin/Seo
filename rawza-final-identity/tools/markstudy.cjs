const { translate } = require('./lib.cjs');
const { render } = require('./view.cjs');
const { mark } = require('./saffron.cjs');
const vs = JSON.parse(process.argv[3] || '[{}]'); const parts = []; let x = 0;
for (const v of vs) { const m = mark(v); parts.push({ item: translate(m, x - m.bounds.center.x, 0) }); x += 420; }
render(process.argv[2], parts, { width: 1600 });
