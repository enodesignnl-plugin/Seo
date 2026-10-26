// Presentation of the three icon marks:  node build-icons.cjs && node icons-page.cjs
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'icon-marks');
const art = JSON.parse(fs.readFileSync(path.join(DIR, '.art.json'), 'utf8'));
const defs = Object.entries(art).map(([k, a]) => `<g id="m-${k}">${a.pieces.map((p) => `<path d="${p.d}"/>`).join('')}</g>`).join('');
const svg = (k, cls, label, px) => `<svg class="mark ${cls}" viewBox="0 0 ${art[k].S} ${art[k].S}"${px ? ` style="width:${px}px;height:${px}px"` : ''} role="img" aria-label="${label}"><use href="#m-${k}"/></svg>`;
const SIZES = [96, 48, 32, 24, 16];
const INFO = {
  Lancet: ['I', 'Lancet', 'Twee bladeren leunen naar elkaar toe. Hun punten raken elkaar in de top, en de ruimte ertussen vormt een hoge spitsboog. Elk blad heeft een fijne middennerf.', 'Rustig, symmetrisch, architectonisch. De sterkste kandidaat voor gevel, deur en reliëfdruk.'],
  Interlace: ['II', 'Vlechtwerk', 'De bladeren kruisen elkaar vlak onder de top. Het ene blad gaat met een fijne naad over het andere heen, zoals in gesneden houtwerk en vlechtpatronen.', 'Ambachtelijk en rijk. Het kruisje bovenaan maakt het merk herkenbaar; het werkt het best vanaf 32 px.'],
  Contrast: ['III', 'Contrast', 'Een haarlijnblad en een vol blad ontmoeten elkaar in de top, dik en dun zoals in een klassieke serif-kapitaal.', 'Het meest editoriaal. Het sluit aan bij de dik-dunlijn van het woordmerk; de haarlijn vraagt wel om een minimale maat van 24 px.'],
};
const block = (k) => {
  const [num, name, how, use] = INFO[k];
  return `<section class="mk" aria-labelledby="h-${k}">
    <div class="head"><span class="num">${num}</span><h2 id="h-${k}">${name}</h2></div>
    <div class="pair">
      <div class="panel dark">${svg(k, '', `${name}, goud op chocoladebruin`)}</div>
      <div class="panel light">${svg(k, '', `${name}, zwart op crème`)}</div>
    </div>
    <div class="sizes">
      <div class="strip dark">${SIZES.map((s) => `<figure>${svg(k, '', `${name} ${s} px`, s)}<figcaption>${s}</figcaption></figure>`).join('')}</div>
      <div class="strip light">${SIZES.map((s) => `<figure>${svg(k, '', `${name} ${s} px`, s)}<figcaption>${s}</figcaption></figure>`).join('')}</div>
    </div>
    <div class="text"><p>${how}</p><p class="use">${use}</p></div>
  </section>`;
};
const html = `<title>RAWZA Icon Marks</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500&display=swap">
<style>
/* Layout: one section per mark, each a pair of large plates (gold on chocolate, black on cream),
   then the same mark at real pixel sizes, then two lines of text. Single, deliberate dark look. */
*, *::before, *::after { box-sizing: border-box; }
:root {
  --choc: #2A1A12; --plate: #33211A; --gold: #D6B583; --gold-dim: #a48c6b; --cream: #F3EBDD; --ink: #1A1410; --rule: rgba(214,181,131,.2);
  --display: "Cormorant Garamond", Garamond, Georgia, serif;
  --ui: "Jost", "Futura", "Century Gothic", sans-serif;
  color-scheme: dark;
}
body { background: var(--choc); color: var(--gold); font-family: var(--ui); font-size: 15px; line-height: 1.6; }
.wrap { max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 72px; display: grid; gap: 72px; }
header { display: grid; gap: 10px; }
.eyebrow { font-size: 11px; letter-spacing: .34em; text-transform: uppercase; color: var(--gold-dim); }
h1 { font-family: var(--display); font-weight: 500; font-size: clamp(34px, 5vw, 52px); margin: 0; line-height: 1.1; }
h2 { font-family: var(--display); font-weight: 600; font-size: clamp(24px, 3vw, 32px); margin: 0; letter-spacing: .02em; }
p { margin: 0; max-width: 64ch; color: var(--gold-dim); }
header p { color: var(--gold); opacity: .85; font-size: 16px; }
.mk { display: grid; gap: 18px; }
.head { display: flex; align-items: baseline; gap: 14px; border-bottom: 1px solid var(--rule); padding-bottom: 10px; }
.num { font-family: var(--display); font-size: 20px; color: var(--gold-dim); min-width: 2ch; }
.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 14px; }
.panel { aspect-ratio: 1 / 1; display: grid; place-items: center; border-radius: 3px; min-width: 0; }
.panel .mark { width: 62%; height: 62%; }
.dark { background: var(--plate); color: var(--gold); }
.light { background: var(--cream); color: var(--ink); }
.mark { display: block; fill: currentColor; }
.sizes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 14px; }
.strip { display: flex; align-items: flex-end; justify-content: space-around; flex-wrap: wrap; gap: 14px 10px; padding: 18px 12px 12px; border-radius: 3px; }
.strip figure { margin: 0; display: grid; justify-items: center; gap: 6px; }
.strip figcaption { font-size: 11px; letter-spacing: .08em; font-variant-numeric: tabular-nums; opacity: .6; }
.text { display: grid; gap: 6px; }
.use { color: var(--gold); }
footer { border-top: 1px solid var(--rule); padding-top: 20px; display: grid; gap: 8px; font-size: 13px; }
code { color: var(--gold); font-size: 12px; word-break: break-all; }
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs}</defs></svg>
<div class="wrap">
  <header>
    <div class="eyebrow">Rawza · Afghaans restaurant · symbool</div>
    <h1>Drie dubbelbladsymbolen</h1>
    <p>Elk symbool bestaat uit twee bladeren die naar elkaar toe buigen. Samen vormen ze een spitsboog, een verwijzing naar Afghaanse bouwkunst zonder moskeevorm. Alles is in één kleur en als vector getekend, klaar voor Illustrator.</p>
  </header>
  ${Object.keys(INFO).map(block).join('\n')}
  <footer>
    <p>Bestanden: <code>rawza-final-identity/icon-marks/svg/</code>, per symbool in goud #D6B583 en zwart #1A1410, met de lagen LEAF_LEFT en LEAF_RIGHT. Achtergronden: chocoladebruin #2A1A12 en crème #F3EBDD.</p>
  </footer>
</div>
`;
fs.writeFileSync(path.join(DIR, 'icon-marks.html'), html);
console.log('icon-marks.html', (html.length / 1024).toFixed(0), 'KB');
