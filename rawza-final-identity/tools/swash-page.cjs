// Presentation page for the swash-R variant:  node build-swash.cjs && node swash-page.cjs
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'swash-r');
let n = 0;
const inline = (f, label) => fs.readFileSync(path.join(DIR, 'svg', f), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '').replace(/<!--[\s\S]*?-->\s*/, '').replace(/<title>[^<]*<\/title>/, '')
  .replace(/width="\d+" height="\d+"/, `class="art" role="img" aria-label="${label}"`)
  .replace(/id="/g, () => `id="s${n++}-`);
const html = `<title>Rawza Swash-R</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Montserrat:wght@400;500&display=swap">
<style>
/* Layout: one column of brand panels, chocolate and cream, each with a short caption. Single dark look. */
*, *::before, *::after { box-sizing: border-box; }
:root {
  --choc: #2A1A12; --panel: #352217; --gold: #D6B583; --gold-dim: #a68e6a; --cream: #F3EBDD; --rule: rgba(214,181,131,.22);
  --display: "Cormorant Garamond", Garamond, Georgia, serif;
  --ui: "Montserrat", "Helvetica Neue", Arial, sans-serif;
  color-scheme: dark;
}
body { background: var(--choc); color: var(--gold); font-family: var(--ui); font-size: 15px; line-height: 1.6; }
.wrap { max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 72px; display: grid; gap: 56px; }
header { display: grid; gap: 8px; }
.eyebrow { font-size: 11px; letter-spacing: .32em; text-transform: uppercase; color: var(--gold-dim); }
h1 { font-family: var(--display); font-weight: 500; font-size: clamp(32px, 5vw, 48px); margin: 0; letter-spacing: .02em; }
h2 { font-family: var(--display); font-weight: 500; font-size: clamp(22px, 3vw, 28px); margin: 0; }
p { margin: 0; max-width: 66ch; color: var(--gold-dim); }
section { display: grid; gap: 14px; }
.panel { min-width: 0; border-radius: 4px; display: grid; place-items: center; padding: clamp(24px, 7vw, 96px) clamp(16px, 6vw, 80px); }
.choc { background: var(--panel); box-shadow: inset 0 0 0 1px var(--rule); }
.cream { background: var(--cream); }
.art { display: block; width: 100%; height: auto; max-width: 860px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 16px; }
.mono { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 16px; }
.white { background: #FFFFFF; } .black { background: #0b0b0b; }
footer { border-top: 1px solid var(--rule); padding-top: 20px; display: grid; gap: 8px; font-size: 13px; }
code { color: var(--gold); font-size: 12px; word-break: break-all; }
</style>
<div class="wrap">
  <header>
    <div class="eyebrow">Rawza · Afghaans restaurant · variant</div>
    <h1>De swash-R</h1>
    <p>De kalligrafische R uit het voorbeeld, nagetekend als vector: een lus die als haarlijn binnenkomt, een sikkelvormige schacht en een zwierige staart onder RESTAURANT. A, W, Z en A zijn de goedgekeurde letters van richting A.</p>
  </header>
  <section><div class="panel choc">${inline('RAWZA_SwashR_Logo_Restaurant_Gold.svg', 'Rawza met swash-R, goud op chocolade')}</div>
    <h2>Goud op chocolade</h2><p>De hoofdversie, zoals in het voorbeeld.</p></section>
  <section><div class="panel cream">${inline('RAWZA_SwashR_Logo_Restaurant_Chocolate.svg', 'Rawza met swash-R, chocolade op crème')}</div>
    <h2>Chocolade op crème</h2><p>Voor papier en lichte achtergronden.</p></section>
  <section><div class="panel choc">${inline('RAWZA_SwashR_Logo_Afghaans_Restaurant_Gold.svg', 'Rawza met AFGHAANS RESTAURANT')}</div>
    <h2>Met AFGHAANS RESTAURANT</h2><p>De volledige ondertitel, iets kleiner gezet zodat hij boven de staart past.</p></section>
  <section><div class="grid2">
      <div class="panel choc">${inline('RAWZA_SwashR_R_Gold.svg', 'De swash-R los')}</div>
      <div class="panel choc">${inline('RAWZA_SwashR_Wordmark_Gold.svg', 'Woordmerk zonder ondertitel')}</div>
    </div><h2>De R en het woordmerk</h2><p>De R is opgebouwd uit drie penhalen: dik waar de pen omlaag gaat, haarlijn waar hij zijwaarts of omhoog gaat.</p></section>
  <section><div class="mono">
      <div class="panel white">${inline('RAWZA_SwashR_Logo_Restaurant_Black.svg', 'Zwart op wit')}</div>
      <div class="panel black">${inline('RAWZA_SwashR_Logo_Restaurant_White.svg', 'Wit op zwart')}</div>
    </div><h2>Eén kleur</h2><p>Zwart en wit, voor stempels, gravure en drukwerk in één kleur.</p></section>
  <footer>
    <p>Bestanden: <code>rawza-final-identity/swash-r/svg/</code>. Alles als vectorpaden, geen lettertype nodig. Ondertitel in Montserrat, letters in Cormorant Garamond (SIL Open Font License).</p>
    <p>De haarlijnen zijn heel fijn: onder ongeveer 250 px breed vallen ze weg. Voor kleine toepassingen is een zwaardere versie nodig.</p>
  </footer>
</div>
`;
fs.writeFileSync(path.join(DIR, 'swash-r.html'), html);
console.log('swash-r.html', (html.length / 1024).toFixed(0), 'KB');
