// Presentation page for concept B (Garden), from the geometry build-garden.cjs writes.
//   node build-garden.cjs && node garden-page.cjs   ->  ../concept-b-garden/concept-b.html
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'concept-b-garden');
const { art, pos } = JSON.parse(fs.readFileSync(path.join(DIR, '.art.json'), 'utf8'));
const paths = (a, groups) => a.groups.filter((g) => !groups || groups.includes(g.group))
  .map((g) => `<g class="g-${g.group}"${g.group === 'symbol' ? ' style="fill:var(--sym, currentColor)"' : ''}>${g.pieces.map((p) => `<path d="${p.d}"/>`).join('')}</g>`).join('');
const defs = Object.entries(art).map(([k, a]) => `<g id="art-${k}">${paths(a)}</g>`).join('');
const vb = (a) => `0 0 ${a.W} ${a.H}`;
const use = (k, cls = '', label = '') => `<svg class="art ${cls}" viewBox="${vb(art[k])}" role="img" aria-label="${label}"><use href="#art-${k}"/></svg>`;
// a crop of the wordmark, in letter coordinates (cap line y = 0, baseline y = 700)
const W = art.Wordmark;
const crop = (x0, y0, x1, y1, label) => `<svg class="art crop" viewBox="${(x0 + W.dx).toFixed(0)} ${(y0 + W.dy).toFixed(0)} ${x1 - x0} ${y1 - y0}" role="img" aria-label="${label}"><use href="#art-Wordmark"/></svg>`;

// direction A, as released, for the side-by-side
const aSvg = fs.readFileSync(path.join(__dirname, '..', 'release', 'rawza-lockup-colour.svg'), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '').replace(/<!--[\s\S]*?-->\s*/, '').replace(/<title>[^<]*<\/title>/, '')
  .replace(/width="\d+" height="\d+"/, 'class="art" role="img" aria-label="Richting A, Royal Signature"')
  .replace(/id="/g, 'id="a-');

const html = `<title>Rawza Concept B</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marcellus&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap">
<style>
/* Layout: one column of large brand panels (chocolate and cream), each with a short caption; a
   two-up comparison of A and B near the end. Single deliberate look: the brand's own chocolate. */
*, *::before, *::after { box-sizing: border-box; }
:root {
  --choc: #2A1A12; --choc-2: #352217; --gold: #D6BC8A; --gold-dim: #a89068;
  --cream: #F3EBDD; --ink: #2A1A12; --pist: #A3AB82; --rule: rgba(214,188,138,.22);
  --display: "Marcellus", "Trajan Pro", Georgia, serif;
  --body: "EB Garamond", Garamond, "Times New Roman", serif;
  color-scheme: dark;
}
body { background: var(--choc); color: var(--gold); font-family: var(--body); font-size: 18px; line-height: 1.55; }
.wrap { max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 72px; display: grid; gap: 72px; }
header { display: grid; gap: 10px; padding-top: 16px; }
.eyebrow { font-family: var(--display); font-size: 13px; letter-spacing: .32em; text-transform: uppercase; color: var(--gold-dim); }
h1 { font-family: var(--display); font-weight: 400; font-size: clamp(30px, 5vw, 46px); letter-spacing: .04em; margin: 0; text-wrap: balance; }
h2 { font-family: var(--display); font-weight: 400; font-size: clamp(22px, 3vw, 28px); letter-spacing: .05em; margin: 0; text-wrap: balance; }
p { margin: 0; max-width: 64ch; }
.lede { font-size: 20px; color: var(--gold); opacity: .9; }
section { display: grid; gap: 20px; }
.head { display: grid; gap: 6px; }
.panel { min-width: 0; border-radius: 4px; display: grid; place-items: center; padding: clamp(28px, 7vw, 96px) clamp(16px, 6vw, 88px); }
.panel.choc { background: var(--choc-2); color: var(--gold); box-shadow: inset 0 0 0 1px var(--rule); }
.panel.cream { background: var(--cream); color: var(--ink); }
.art { display: block; width: 100%; height: auto; max-width: 100%; fill: currentColor; }
.hero .art { max-width: 820px; }
.mid .art { max-width: 720px; }
.cap { font-size: 16px; color: var(--gold-dim); max-width: 70ch; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 20px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 20px; }
.tile { display: grid; gap: 12px; align-content: start; min-width: 0; }
.tile .panel { aspect-ratio: 1 / 1; padding: 9%; display: block; }
.tile .panel > .art, .vs .panel > .art { width: 100%; height: 100%; }
.tile h3 { font-family: var(--display); font-weight: 400; font-size: 15px; letter-spacing: .14em; text-transform: uppercase; margin: 0; }
.tile p { font-size: 16px; color: var(--gold-dim); }
.crop { width: 100%; height: 100%; }
.sizes { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 28px 40px; }
.sizes figure { margin: 0; display: grid; gap: 8px; justify-items: center; }
.sizes figcaption { font-size: 13px; letter-spacing: .08em; color: var(--gold-dim); font-variant-numeric: tabular-nums; }
.vs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 20px; margin-bottom: 12px; }
.vs .panel { aspect-ratio: 4 / 3; padding: 8%; display: block; }
table { border-collapse: collapse; width: 100%; font-size: 16px; }
.tablewrap { overflow-x: auto; }
th, td { text-align: left; vertical-align: top; padding: 10px 14px 10px 0; border-bottom: 1px solid var(--rule); }
th { font-family: var(--display); font-weight: 400; font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: var(--gold-dim); }
td:first-child { color: var(--gold-dim); white-space: nowrap; }
.swatches { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 16px; }
.sw { display: grid; gap: 8px; }
.chip { height: 96px; border-radius: 3px; box-shadow: inset 0 0 0 1px var(--rule); }
.sw b { font-family: var(--display); font-weight: 400; letter-spacing: .1em; font-size: 14px; text-transform: uppercase; }
.sw span { font-size: 15px; color: var(--gold-dim); font-variant-numeric: tabular-nums; }
.mock { display: grid; grid-template-columns: 1fr 1.45fr; gap: 16px; align-items: end; }
.menu { aspect-ratio: 1 / 1.414; background: var(--choc-2); box-shadow: inset 0 0 0 1px var(--rule); border-radius: 3px; display: grid; place-items: center; padding: 12%; }
.card { aspect-ratio: 85 / 55; background: var(--cream); color: var(--ink); border-radius: 3px; display: grid; place-items: center; padding: 8% 18%; }
.accent { --sym: var(--pist); }
footer { display: grid; gap: 10px; font-size: 16px; color: var(--gold-dim); border-top: 1px solid var(--rule); padding-top: 24px; }
footer code { font-size: 14px; color: var(--gold); word-break: break-all; }
</style>

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs}</defs></svg>

<div class="wrap">
  <header>
    <div class="eyebrow">Rawza · Afghaans restaurant · tweede richting</div>
    <h1>Concept B — Tuin</h1>
    <p class="lede">Rawza betekent tuin. Dit concept is zachter en organischer dan richting A: een geschreven woordmerk in kleine letters, een tulpknop als symbool en een rustig palet van chocolade en champagnegoud. Alleen de R komt uit richting A.</p>
  </header>

  <section aria-labelledby="s1">
    <div class="panel choc hero">${use('Logo', '', 'Rawza logo, champagnegoud op chocoladebruin')}</div>
    <div class="head"><div class="eyebrow">1 · Hoofdlogo</div><h2 id="s1">Op donkere chocolade</h2>
    <p class="cap">De hoofdversie: champagnegoud op diep chocoladebruin. De tulpknop staat boven het midden van de letters; de ondertitel staat in Marcellus, een kapitaal met licht uitlopende einden.</p></div>
  </section>

  <section aria-labelledby="s2">
    <div class="panel cream hero">${use('Logo', '', 'Rawza logo, chocolade op crème')}</div>
    <div class="head"><div class="eyebrow">2 · Lichte achtergrond</div><h2 id="s2">Chocolade op crème</h2>
    <p class="cap">Voor papier, menukaarten en lichte schermen: dezelfde tekening in chocoladebruin. Goud op crème heeft te weinig contrast en is daarom geen standaardversie.</p></div>
  </section>

  <section aria-labelledby="s3">
    <div class="head"><div class="eyebrow">3 · Symbool en signatuur</div><h2 id="s3">De tulpknop en de R</h2></div>
    <div class="grid2">
      <div class="tile"><div class="panel choc">${use('Symbol', '', 'Tulpknop')}</div>
        <h3>De tulpknop</h3>
        <p>Twee bloembladen die elkaar omvatten; een fijne vouwlijn laat zien waar het ene blad over het andere valt. De steel is geschreven met dezelfde brede pen (hoek −28°) als het been van de R, en loopt ook uit in een haarlijn. De wilde tulp (lāla) groeit in heel Afghanistan en is de bloem van het Nowruz-feest in Mazar-i-Sharif. Hier is hij teruggebracht tot een gesloten knop, zonder ornament.</p></div>
      <div class="tile"><div class="panel choc">${use('Signature_R', '', 'De signatuur-R')}</div>
        <h3>De R als signatuur</h3>
        <p>De enige vorm die uit richting A meekomt, ongewijzigd: de R uit de goedgekeurde versie, met het been als één penstreek die na de basislijn dunner wordt tot een haarlijn. In concept B loopt die haarlijn onder de eerste a door.</p></div>
    </div>
    <div class="sizes" aria-label="Symbool op kleine maten">
      ${[96, 64, 40, 24, 16].map((s) => `<figure><svg class="art" style="width:${s}px" viewBox="${vb(art.Symbol)}" aria-hidden="true"><use href="#art-Symbol"/></svg><figcaption>${s} px</figcaption></figure>`).join('')}
    </div>
    <div class="grid3">
      <div class="tile"><div class="panel choc">${crop(100, -150, 1200, 950, 'Detail: staart van de R')}</div>
        <h3>Staart van de R</h3><p>De penstreek van de R loopt onder de a door en eindigt als haarlijn.</p></div>
      <div class="tile"><div class="panel choc">${crop(pos[2] + 330, 120, pos[2] + 730, 520, 'Detail: blad aan de w')}</div>
        <h3>Blad aan de w</h3><p>De ronde druppel bovenaan de w is vervangen door een spits blad, getekend als de bloembladen van de knop.</p></div>
      <div class="tile"><div class="panel choc">${crop(pos[4] + 260, 260, pos[4] + 760, 760, 'Detail: uitloop van de laatste a')}</div>
        <h3>Uitloop van de a</h3><p>De laatste a loopt uit in een lange haarlijn, als tegenhanger van de R. Zo opent en sluit het woord met dezelfde beweging.</p></div>
    </div>
  </section>

  <section aria-labelledby="s4">
    <div class="panel choc mid">${use('Logo', '', 'Logo met AFGHAANS RESTAURANT')}</div>
    <div class="head"><div class="eyebrow">4 · Met ondertitel</div><h2 id="s4">AFGHAANS RESTAURANT</h2>
    <p class="cap">De volledige versie, voor gevel, website en drukwerk waar de keuken genoemd moet worden.</p></div>
  </section>

  <section aria-labelledby="s5">
    <div class="grid2">
      <div class="panel choc">${use('Logo_Restaurant', '', 'Logo met RESTAURANT, op chocolade')}</div>
      <div class="panel cream">${use('Logo_Restaurant', '', 'Logo met RESTAURANT, op crème')}</div>
    </div>
    <div class="head"><div class="eyebrow">5 · Korte ondertitel</div><h2 id="s5">RESTAURANT</h2>
    <p class="cap">De korte versie, voor plekken waar duidelijk is dat het om Afghaanse keuken gaat: menukaart, servetten, visitekaartje.</p></div>
  </section>

  <section aria-labelledby="s6">
    <div class="head"><div class="eyebrow">Twee richtingen voor de klant</div><h2 id="s6">A naast B</h2></div>
    <div class="vs">
      <div class="tile"><div class="panel choc">${aSvg}</div><h3>A · Royal Signature</h3><p>Klassiek, koninklijk, staatsie. Kapitalen, saffraankrokus met rode draden.</p></div>
      <div class="tile"><div class="panel choc">${use('Logo', '', 'Concept B, Tuin')}</div><h3>B · Tuin</h3><p>Zacht, organisch, boutique. Geschreven kleine letters, tulpknop, alleen goud.</p></div>
    </div>
    <div class="tablewrap"><table>
      <thead><tr><th></th><th>A · Royal Signature</th><th>B · Tuin</th></tr></thead>
      <tbody>
        <tr><td>Schrijfwijze</td><td>RAWZA, kapitalen</td><td>Rawza, kleine letters met hoofdletter R</td></tr>
        <tr><td>Letters</td><td>Klassieke Garamond-kapitalen, bewerkt</td><td>Rechtopstaande cursief (Cormorant Upright), bewerkt: blad aan de w, uitloop aan de a</td></tr>
        <tr><td>Symbool</td><td>Saffraankrokus: drie bladeren, drie rode draden</td><td>Tulpknop: twee bloembladen en een geschreven steel</td></tr>
        <tr><td>Ondertitel</td><td>Garamond-kapitalen met lijnen</td><td>Marcellus, zonder lijnen</td></tr>
        <tr><td>Kleur</td><td>Goud met saffraanrood</td><td>Champagnegoud, geen tweede kleur nodig</td></tr>
        <tr><td>Gevoel</td><td>Statig, formeel, paleis</td><td>Warm, verfijnd, tuin en boutique</td></tr>
        <tr><td>Gedeeld</td><td colspan="2">De R met het penbeen: één signatuur in beide richtingen</td></tr>
      </tbody>
    </table></div>
  </section>

  <section aria-labelledby="s7">
    <div class="head"><div class="eyebrow">Kleur</div><h2 id="s7">Palet</h2>
    <p class="cap">Drie kleuren dragen alles. Pistache is een mogelijk accent, alleen voor het symbool in details, als de klant een tweede kleur wil. Mijn advies: het logo zelf in één kleur houden.</p></div>
    <div class="swatches">
      <div class="sw"><div class="chip" style="background:#2A1A12"></div><b>Chocolade</b><span>#2A1A12</span></div>
      <div class="sw"><div class="chip" style="background:#D6BC8A"></div><b>Champagnegoud</b><span>#D6BC8A</span></div>
      <div class="sw"><div class="chip" style="background:#F3EBDD"></div><b>Crème</b><span>#F3EBDD</span></div>
      <div class="sw"><div class="chip" style="background:#A3AB82"></div><b>Pistache (optioneel)</b><span>#A3AB82</span></div>
    </div>
    <div class="grid2">
      <div class="tile"><div class="panel choc" style="aspect-ratio:auto;display:grid;padding:12% 10%">${use('Logo_Restaurant', 'accent', 'Logo met pistache symbool')}</div><h3>Optioneel accent</h3><p>Symbool in pistache, letters in goud. Subtiel, maar het hoofdlogo blijft sterker in één kleur.</p></div>
      <div class="tile"><div class="mock">
        <div class="menu">${use('Logo_Restaurant', '', 'Menukaart')}</div>
        <div class="card">${use('Logo_Restaurant', '', 'Visitekaartje')}</div>
      </div><h3>Op drukwerk</h3><p>Menukaart (A-formaat) en visitekaartje (85 × 55 mm), schematisch.</p></div>
    </div>
  </section>

  <footer>
    <p>Bestanden: <code>rawza-final-identity/concept-b-garden/svg/</code> — logo met AFGHAANS RESTAURANT in goud, chocolade, zwart en wit; logo met RESTAURANT, woordmerk, symbool en R in goud en chocolade. Alles als vectorpaden, geen lettertype nodig.</p>
    <p>Lettertypen: Cormorant Garamond (R), Cormorant Upright (awza) en Marcellus (ondertitel), alle drie SIL Open Font License. Richting A is niet aangepast. Dit is een conceptpresentatie: een aparte versie voor kleine maten en een Illustrator-pakket volgen pas als de klant voor B kiest.</p>
  </footer>
</div>
`;
fs.writeFileSync(path.join(DIR, 'concept-b.html'), html);
console.log('concept-b.html', (html.length / 1024).toFixed(0), 'KB');
