// Presentation of round 2:  node build-round2.cjs && node round2-page.cjs  ->  ../round-2/ronde-2.html
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'round-2');
const J = JSON.parse(fs.readFileSync(path.join(DIR, '.art.json'), 'utf8'));

// every artwork once as a <g> in <defs>; accent pieces fill with var(--acc), the rest with currentColor
const g = (id, a) => `<g id="${id}">${a.groups.map((gr) => gr.pieces.map((p) => `<path d="${p.d}"${p.accent ? ' style="fill:var(--acc, currentColor)"' : ''}/>`).join('')).join('')}</g>`;
const defs = [
  ...Object.entries(J.logos).map(([k, a]) => g(`l-${k}`, a)),
  ...Object.entries(J.symbols).map(([k, a]) => g(`s-${k}`, a)),
  ...Object.entries(J.leaf).map(([k, a]) => g(`f-${k}`, a)),
  g('before', J.before),
].join('');
const use = (id, a, label, extra = '') => `<svg class="art" viewBox="0 0 ${a.W} ${a.H}" role="img" aria-label="${label}"${extra}><use href="#${id}"/></svg>`;
const logo = (k, label, cls = '') => use(`l-${k}`, J.logos[k], label, cls ? ` class="art ${cls}"` : '');

const LOGOS = [
  ['L1_Swash', 'L1', 'Swash-R, ingekort', 'De sierlijke R met een kortere aanloop en een kortere staart, zoals in het voorbeeld. AFGHAANS RESTAURANT staat groter en in een zwaardere letter (Montserrat SemiBold), boven de staart.', 'L1_Swash_Restaurant'],
  ['L2_Swash_Boog', 'L2', 'Swash-R met boog en rozet', 'Dezelfde R met daarboven het boogkader uit jullie voorbeeldlogo, hier met een achtbladige rozet. De rozet kan in goud of in lapis-blauw: lapis lazuli komt van oudsher uit Badakhshan, Afghanistan.', null, true],
  ['L3_Swash_Lancet', 'L3', 'Swash-R met bladsymbool', 'De R met het Lancet-symbool uit ronde 1 erboven: twee bladeren die samen een spitsboog vormen.'],
  ['L4_Klassiek_Boog', 'L4', 'Klassiek met boog', 'In de lijn van jullie eerste voorbeeldlogo: boog met rozet boven RAWZA in klassieke kapitalen, ondertitel gecentreerd eronder.', 'L4_Klassiek_Boog_Restaurant', true],
  ['L5_Rawza', 'L5', 'Rawza in kleine letters', 'De swash-R met kleine cursieve letters. De staart onderstreept het woord; de ondertitel staat gecentreerd eronder.'],
];
const logoBlock = ([k, num, name, text, alt, lapis]) => `<section class="logo" aria-labelledby="h-${k}">
  <div class="head"><span class="num">${num}</span><h3 id="h-${k}">${name}</h3></div>
  <div class="pair">
    <div class="panel dark">${logo(k, `${name}, goud op chocolade`)}</div>
    <div class="panel light">${logo(k, `${name}, chocolade op crème`)}</div>
  </div>
  ${alt || lapis ? `<div class="pair">
    ${alt ? `<div class="panel dark">${logo(alt, `${name}, met RESTAURANT`)}</div>${lapis ? '' : `<div class="panel light">${logo(alt, `${name}, met RESTAURANT, op crème`)}</div>`}` : ''}
    ${lapis ? `<div class="panel dark lapis">${logo(k, `${name}, rozet in lapis-blauw`)}</div><div class="panel light lapis">${logo(k, `${name}, chocolade met lapis-blauw, op crème`)}</div>` : ''}
  </div>` : ''}
  <p>${text}</p>
</section>`;

const SYMS = [
  ['f-lancet', J.leaf.lancet, 'Lancet', 'ronde 1'], ['f-interlace', J.leaf.interlace, 'Vlechtwerk', 'ronde 1'], ['f-contrast', J.leaf.contrast, 'Contrast', 'ronde 1'],
  ['s-S4_Boog_Rozet', J.symbols.S4_Boog_Rozet, 'Boog met rozet', 'nieuw'], ['s-S5_Rozet', J.symbols.S5_Rozet, 'Rozet', 'nieuw'],
  ['s-S6_Boog_Lancet', J.symbols.S6_Boog_Lancet, 'Lancet in boog', 'nieuw'], ['s-S7_Boog_R', J.symbols.S7_Boog_R, 'R in boog', 'nieuw'],
];
const symTile = ([id, a, name, tag]) => `<figure class="sym">
  <div class="panel dark sq">${use(id, a, `${name}, goud`)}</div>
  <div class="panel light sq">${use(id, a, `${name}, zwart`)}</div>
  <figcaption><b>${name}</b><span>${tag}</span></figcaption>
</figure>`;
const small = ([id, a, name]) => `<div class="mini">${[64, 40, 24].map((s) => `<svg class="art" style="width:${s}px;height:${s}px" viewBox="0 0 ${a.W} ${a.H}" aria-hidden="true"><use href="#${id}"/></svg>`).join('')}<span>${name}</span></div>`;

const html = `<title>RAWZA Ronde 2</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Montserrat:wght@400;500;600&display=swap">
<style>
/* Layout: the client's changes first (before/after), then the logo variants as plates in pairs,
   then the symbol options in a grid. One deliberate dark look, plates in chocolate and cream. */
*, *::before, *::after { box-sizing: border-box; }
:root {
  --choc: #241610; --plate: #2F1E16; --gold: #D6B583; --gold-dim: #a48c6b; --cream: #F3EBDD; --ink: #2A1A12; --lapis: #2B4F86; --rule: rgba(214,181,131,.2);
  --display: "Cormorant Garamond", Garamond, Georgia, serif;
  --ui: "Montserrat", "Helvetica Neue", Arial, sans-serif;
  color-scheme: dark;
}
body { background: var(--choc); color: var(--gold); font-family: var(--ui); font-size: 14.5px; line-height: 1.65; }
.wrap { max-width: 1160px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 80px; display: grid; gap: 64px; }
header { display: grid; gap: 12px; }
.eyebrow { font-size: 11px; font-weight: 500; letter-spacing: .32em; text-transform: uppercase; color: var(--gold-dim); }
h1 { font-family: var(--display); font-weight: 500; font-size: clamp(34px, 5vw, 52px); margin: 0; line-height: 1.1; }
h2 { font-family: var(--display); font-weight: 600; font-size: clamp(26px, 3.4vw, 34px); margin: 0; }
h3 { font-family: var(--display); font-weight: 600; font-size: clamp(21px, 2.6vw, 26px); margin: 0; }
p { margin: 0; max-width: 68ch; color: var(--gold-dim); }
ul.changes { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; max-width: 70ch; }
ul.changes li { padding-left: 18px; position: relative; }
ul.changes li::before { content: ""; position: absolute; left: 0; top: .72em; width: 8px; height: 1px; background: var(--gold); }
section.part { display: grid; gap: 22px; }
.logo { display: grid; gap: 14px; }
.head { display: flex; align-items: baseline; gap: 14px; border-bottom: 1px solid var(--rule); padding-bottom: 8px; }
.num { font-size: 12px; font-weight: 600; letter-spacing: .14em; color: var(--gold-dim); min-width: 3ch; }
.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 12px; }
.panel { min-width: 0; border-radius: 3px; display: grid; place-items: center; padding: clamp(22px, 5vw, 56px) clamp(16px, 4vw, 44px); }
.dark { background: var(--plate); color: var(--gold); }
.light { background: var(--cream); color: var(--ink); }
.lapis { --acc: var(--lapis); }
.art { display: block; width: 100%; height: auto; max-width: 100%; fill: currentColor; }
.compare { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: 12px; }
.compare figure { margin: 0; display: grid; gap: 8px; }
.compare figcaption { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--gold-dim); }
.grid { display: grid; gap: 16px; }
.g4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.g3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
@media (max-width: 760px) { .g4, .g3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.sym { margin: 0; display: grid; gap: 8px; }
.sq { aspect-ratio: 1 / 1; padding: 14%; }
.sq .art { height: 100%; width: auto; }
.sym figcaption { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
.sym figcaption span { color: var(--gold-dim); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
.minis { display: flex; flex-wrap: wrap; gap: 12px; }
.mini { display: flex; align-items: flex-end; gap: 14px; background: var(--plate); padding: 14px 16px; border-radius: 3px; color: var(--gold); }
.mini span { font-size: 11px; color: var(--gold-dim); letter-spacing: .08em; }
footer { border-top: 1px solid var(--rule); padding-top: 20px; display: grid; gap: 8px; font-size: 13px; }
code { color: var(--gold); font-size: 12px; word-break: break-all; }
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs}</defs></svg>
<div class="wrap">
  <header>
    <div class="eyebrow">Rawza · Afghaans restaurant · ronde 2</div>
    <h1>Logo's en symbolen, ronde 2</h1>
    <ul class="changes">
      <li>De sierlijke R is ingekort: de aanloop linksboven en de staart rechtsonder zijn korter, zoals in jullie voorbeeld.</li>
      <li>AFGHAANS RESTAURANT staat groter en in een zwaardere letter, voor betere leesbaarheid.</li>
      <li>Vijf logovarianten: in de stijl van de swash-R en in de stijl van jullie eerdere voorbeeldlogo.</li>
      <li>Vier nieuwe symbolen naast de drie bladsymbolen van ronde 1.</li>
    </ul>
  </header>

  <section class="part" aria-labelledby="h-r">
    <h2 id="h-r">De R, korter</h2>
    <div class="compare">
      <figure><div class="panel light">${use('before', J.before, 'Ronde 1: lange R')}</div><figcaption>Ronde 1</figcaption></figure>
      <figure><div class="panel light">${logo('L1_Swash', 'Ronde 2: ingekorte R, grotere ondertitel')}</div><figcaption>Ronde 2: korter, ondertitel groter en dikker</figcaption></figure>
    </div>
    <p>De aanloop begint nu boven de schacht in plaats van ver links, en de staart stopt onder het begin van de ondertitel. De vorm van de R zelf is gelijk gebleven.</p>
  </section>

  <section class="part" aria-labelledby="h-l">
    <h2 id="h-l">Logovarianten</h2>
    ${LOGOS.map(logoBlock).join('\n')}
  </section>

  <section class="part" aria-labelledby="h-s">
    <h2 id="h-s">Symbolen</h2>
    <p>Zeven opties: vier nieuwe, waarvan drie in het boogkader uit jullie voorbeeldlogo, en de drie bladsymbolen uit ronde 1.</p>
    <h3>Nieuw</h3>
    <div class="grid g4">${SYMS.slice(3).map(symTile).join('')}</div>
    <div class="grid g4">
      <figure class="sym"><div class="panel dark sq lapis">${use('s-S4_Boog_Rozet', J.symbols.S4_Boog_Rozet, 'Boog met rozet, lapis, op chocolade')}</div><figcaption><b>Boog met rozet</b><span>lapis</span></figcaption></figure>
      <figure class="sym"><div class="panel light sq lapis">${use('s-S4_Boog_Rozet', J.symbols.S4_Boog_Rozet, 'Boog met rozet, lapis, op crème')}</div><figcaption><b>Boog met rozet</b><span>lapis</span></figcaption></figure>
      <figure class="sym"><div class="panel dark sq lapis">${use('s-S5_Rozet', J.symbols.S5_Rozet, 'Rozet, lapis, op chocolade')}</div><figcaption><b>Rozet</b><span>lapis</span></figcaption></figure>
      <figure class="sym"><div class="panel light sq lapis">${use('s-S5_Rozet', J.symbols.S5_Rozet, 'Rozet, lapis, op crème')}</div><figcaption><b>Rozet</b><span>lapis</span></figcaption></figure>
    </div>
    <p>Met lapis-blauw als accent in de rozet, zoals in jullie voorbeeld. Het boogkader en de letters blijven goud of chocolade.</p>
    <h3>Ronde 1</h3>
    <div class="grid g3">${SYMS.slice(0, 3).map(symTile).join('')}</div>
    <div class="minis">${SYMS.map(small).join('')}</div>
    <p>Op 64, 40 en 24 px. Het boogkader blijft tot 24 px herkenbaar; de rozet en de R erin worden dan klein. Voor een favicon werkt de rozet of Lancet los het best.</p>
  </section>

  <footer>
    <p>Bestanden: <code>rawza-final-identity/round-2/svg/</code>, 30 SVG's als vectorpaden met benoemde lagen (WORDMARK, DESCRIPTOR, SYMBOL), in goud #D6B583, chocolade #2A1A12, zwart, wit en met lapis-accent #2B4F86. Na de keuze maak ik van de gekozen variant een volledig Illustrator-pakket.</p>
  </footer>
</div>
`;
fs.writeFileSync(path.join(DIR, 'ronde-2.html'), html);
console.log('ronde-2.html', (html.length / 1024).toFixed(0), 'KB');
