# RAWZA — eindrichting merkidentiteit

Dit pakket bevat twee uitgewerkte richtingen, elk met:

- een woordmerk;
- een lockup met descriptor;
- een secundair merk;
- kleurversies, kleine-maten-tests en één toepassing.

Overzichtspagina: `final-comparison.html`. Eerdere rondes staan ongewijzigd in `../rawza-final-artwork/` en de mappen daarvoor.

## 1. Wat de referenties ons leren

**Wat ze premium maakt**

| Referentie | Les |
|---|---|
| The Palu | Eén eigen ingreep (Ā zonder dwarsbalk) plus een rustige lockup met lijntjes en descriptor |
| Puerto | Slank woordmerk met een klein teken erboven. De letters blijven de held. |
| Kaaj | Eén eigenzinnige letter (K, j). Warmte en karakter. |
| Piatto / Piatto Rustico | Een compleet systeem: monogram, woordmerk en descriptor, met duidelijke hiërarchie |
| Raaya's | Een zachte serif met dubbele a. Vriendelijk en warm. |
| Mazar / eerdere RAWZA-voorbeelden | Cultureel verwante toon, maar via bogen en bloemen: dat is het cliché dat we vermijden |
| Klantvoorbeeld 01 | Lichte kapitalen, een gekruiste W, en een R met een lange, dun uitlopende zwaai |
| Klantvoorbeeld 03 | Een R waarvan het been onder de a doorloopt |

**Wat ontbrak in de vorige RAWZA-versies**

- Er was geen systeem: geen teken, geen descriptor en geen lockup.
- De R-staart eindigde dik en drukte tegen de A.
- De W was stijf en niet gekruist.
- B was een koude Bodoni.
- Er was geen Afghaanse verwijzing die niet cliché was.

**Hoe RAWZA eigen wordt**

Eén pen voor alles. Een breedgepunte pen (qalam, de pen van de Perzische kalligrafie) onder een vaste hoek van −28° tekent:

- de staart van de R;
- de snede van de W;
- de drie saffraandraden van het teken.

Het Afghaanse karakter zit zo in de lijn zelf, zonder bogen, sterren of pseudo-Arabisch.

## 2. Richting A — Royal Signature (aanbevolen)

**Basis:** Cormorant Garamond, gewicht 420, bewerkt. Spatiëring optisch, ruim (gemiddeld 230 eenheden wit tussen letters, kaphoogte 700).

**R**
- Het eigen been van de letter blijft tot waar het recht en vol is.
- Daar neemt de pen het over, even breed en op dezelfde middenlijn. De naad is gemeten: maximaal 0,3 eenheid verschil.
- De streek is vol op de diagonaal, dunt uit door de basislijn en loopt als haarlijn onder de eerste A door.
- Aan het eind tilt de streek 40 eenheden op.
- Kleinste afstand tot de A: 33 eenheden. Ze raken elkaar niet.

**W**
- Dit is de gekruiste W van het font: de linker V valt halverwege door de rechter V.
- Het haarlijntje van de linker V verliest zijn schreef en eindigt in een snede onder dezelfde penhoek als de R. Daardoor ademt het midden van de W, waar eerst twee schreven tegen elkaar drukten.
- Bekeken en afgewezen:
  - een haarlijn die stopt in de dikke streek (las niet meer als kruising);
  - een halve schreef (oogde als een fout).

**A en Z**
- Beide A's zijn identiek en ongewijzigd.
- De diagonaal van de Z is 6 eenheden lichter.

**Secundair teken: de saffraandraden**
- Het teken toont de drie stempels van de saffraankrokus, de draden die de specerij zijn. Saffraan uit Herat is een bekend Afghaans product.
- Elke draad is één pennenstreek: haarlijn aan de voet, open naar de top, die eindigt in de schuine snede van de pen.
- Door de vaste penhoek krijgen de drie draden vanzelf verschillend gewicht.
- De draden staan bewust asymmetrisch, zodat het teken niet als Ψ (psi) of drietand leest.
- In de lockup gebruiken we een lichte versie met steeltje, ongeveer half zo hoog als de kaphoogte.
- Als losstaand merk (`direction-a-monogram.svg`) gebruiken we een zwaardere snede zonder steeltje, voor avatar en favicon.

**Lockup**

Opbouw van boven naar onder:
1. het teken;
2. het woordmerk;
3. — AFGHAANS RESTAURANT — in Cormorant 600, gespatieerd, met twee haarlijnen.

AFGHAANS RESTAURANT is gekozen omdat het de keuken benoemt. RESTAURANT alleen is rustiger. Beide staan op de pagina.

## 3. Richting B — Warm Editorial

**Basis:** Fraunces met SOFT 100 (afgeronde schreven), opsz 144, gewicht 320. Fraunces is warm en zacht, in de geest van Raaya's en Kaaj, en geen koele Didone.

**R–a**
- Hetzelfde principe als in A, met dezelfde penhoek.
- Het been gaat over in één streek die door de basislijn zwaait, onder de eerste a door, en eindigt als haarlijn.
- Kleinste afstand tot de a: 31 eenheden.
- Bekeken en afgewezen:
  - een bolletje aan het eind (las als een punt: "a.");
  - een ondiepe zwaai (plakte tegen de a).

**w, z en a:** ongewijzigd. Bewuste terughoudendheid: één gebaar per merk.

**Monogram:** de R met een kortere zwaai.

Bekeken en afgewezen: de R met saffraandraden. Het teken zweefde los en werd te druk.

**Lockup:** Rawza met AFGHAANS RESTAURANT in Fraunces 380, gespatieerd.

## 4. Kleuren

| Naam | HEX | Gebruik |
|---|---|---|
| Chocolade | #2A1A12 | Ondergrond, merk op licht |
| Zacht goud | #CFAE6E | Merk op donker (in druk: goudfolie) |
| Crème | #F3EBDD | Lichte ondergrond |
| Zwart | #000000 | Zwart-wit en de SVG-masters |

## 5. Tests

**Kleine maten** (op echte pixelbreedte, zie de pagina)

- A, woordmerk:
  - Op 240 px goed.
  - Op 150 px verdwijnen de R-haarlijn en de W-snede grotendeels. Het woord blijft dan goed leesbaar, maar oogt als standaard Cormorant.
  - Op 96 px leesbaar.
- A, secundair teken: op 32 px leesbaar als drie bladen. Op 16 px is het alleen nog een vorm.
- B, woordmerk: stevig tot 96 px. De zwaai verdwijnt onder ongeveer 150 px.
- B, monogram: leesbaar tot 16 px.

**Techniek**

- Geen enkele contour heeft zelfdoorsnijdingen.
- Alle binnenvormen (counters) zijn juist georiënteerd.
- Alle zes bestanden openen in Inkscape 1.2.

## 6. Eerlijke beoordeling (op 10)

| Aspect | A | B |
|---|---|---|
| Typografische kwaliteit | 8,0 | 7,5 |
| Originaliteit | 6,5 | 6,0 |
| Sierlijkheid | 8,0 | 7,0 |
| Luxe uitstraling | 8,0 | 6,5 |
| Afghaanse herkenbaarheid | 6,5 | 5,0 |
| Toepasbaarheid | 7,5 | 8,0 |

**Gewogen briefscore** (idee 30, samenhang 25, klantfit 20, reproductie 15, vector 10)

| Criterium | A | B |
|---|---|---|
| Idee | 7 | 6 |
| Samenhang | 8 | 7 |
| Klantfit | 7,5 | 6,5 |
| Reproductie | 7 | 8 |
| Vector | 9 | 9 |
| **Totaal** | **≈ 7,6** | **≈ 7,0** |

Vorige ronde: A ≈ 6,9, B ≈ 6,2.

**Wat een 9,5 nog tegenhoudt**

- De basis is herkenbaar een bestaand font. Alleen de R, de W-snede en het teken zijn eigen.
- De curves zijn met code bewerkt, niet met de hand gespannen.
- De eigen details vallen weg onder 150 px. Een aparte kleine-maten-versie ontbreekt.
- Het saffraanteken is verfijnd, maar zonder merkverhaal niet direct als saffraan te herkennen.
- B leest eerder als brasserie dan als fine dining.

**Advies**

Kies A. Laat daarna een letterontwerper deze stappen doen:
1. curvespanning en overshoots met de hand afwerken;
2. een kleine-maten-versie van het woordmerk maken, met zwaardere haarlijnen en een kortere staart;
3. een proefdruk in goudfolie laten maken op chocolade karton, om de haarlijnen te toetsen.

## 7. Bestanden en opnieuw bouwen

**Bestanden**

- SVG-masters:
  - `direction-a-wordmark.svg`, `direction-a-lockup.svg`, `direction-a-monogram.svg`
  - `direction-b-wordmark.svg`, `direction-b-lockup.svg`, `direction-b-monogram.svg`
- Opbouw van de SVG's:
  - echte contouren, zonder fonts;
  - transparante achtergrond en zwarte vulling;
  - één groep per element (`wordmark` met `letter-…`, `emblem`, `descriptor`, `monogram`);
  - geen transformaties.
- `final-comparison.html`: de overzichtspagina.
- `tools/`: de bouwscripts.
  - `royal.cjs` (A), `warm.cjs` (B), `saffron.cjs` (teken), `qalam.cjs` (pen), `system.cjs` (lockups), `build.cjs`.
  - De studiescripts `study.cjs`, `zoom.cjs`, `markstudy.cjs` en `lockstudy.cjs` gebruiken de vooraf geïnstalleerde Playwright.

**Fonts**

- Cormorant Garamond en Fraunces vallen onder SIL OFL 1.1. De licentieteksten staan in `tools/fonts/`.
- De gebruikte statische instanties zijn gemaakt met fontTools `varLib.instancer`.

**Opnieuw bouwen:** `cd tools && npm install && npm run build`.
