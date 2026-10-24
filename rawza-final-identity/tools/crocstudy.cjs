const { translate } = require('./lib.cjs');
const { render } = require('./view.cjs');
const { icon } = require('./crocus.cjs');
const vs = JSON.parse(process.argv[3] || '[{}]'); const parts = []; let x = 0;
for (const v of vs) { const i = icon(v); parts.push({ item: translate(i.leaves, x, 0), fill: '#cfae6e' }, { item: translate(i.threads, x, 0), fill: '#c0503a' }); x += 300; }
render(process.argv[2], parts, { width: 1400, bg: '#1e1410' });
