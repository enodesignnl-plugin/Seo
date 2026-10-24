# RAWZA — eindronde woordmerk: beslissingen

Twee richtingen, elk met één eigen typografisch gebaar:

| Richting | Woordmerk | Gebaar | Bestand |
|---|---|---|---|
| **A · The Signature** | `RAWZA` | Het been van de R loopt uit in een korte, dalende haal die vóór de A eindigt | `rawza-a-signature.svg` |
| **B · The Editorial** | `Rawza` | De laatste haal van de w draait in één ronde penbocht over in de bovenbalk van de z | `rawza-b-editorial.svg` |

Vergelijking in licht en donker, en op schaal: `rawza-art-direction.html`.

Interne vormstudies staan in `studies/`. De bouwcode staat in `tools/`, zodat elke aanpassing te herleiden en opnieuw te maken is.

## Wat er wel en niet in de werkmap stond

**Gevonden:**
- Referenties van de klant in `rawza-brand-exploration/assets/references/`:
  - 01: het eigen RAWZA-logo, in klassieke kapitalen en in een versie met een lange, zwierige R.
  - 02: The Palu.
  - 03: groene "Rawza"-schets.
  - 04: Mazar.
  - 05: Kaaj.
  - 06: Puerto.
  - 07 en 09: Piatto.
  - 08: Raaya's.
- De v4-bronnen in `typography-v4/`.

**Niet gevonden:**
- **Een v5-proef bestaat niet in deze werkmap.**
- De audit hieronder gaat daarom alleen over v4. Stuur v5 mee als die ergens anders staat; dan beoordeel ik hem op dezelfde manier.

Eerdere versies (`typography-v2/`, `typography-v3/`, `typography-v4/`, `rawza-logos-*`) zijn niet aangepast. De vergelijkingspagina leest v4 alleen.

## Fase 1 · Audit van v4

Gerenderd op gelijke kapitaalhoogte in Inkscape: `studies/audit-v4.png`.

**v4 A (RAWZA): de drie zwaarste problemen**

1. **R → eerste A.** De voet van de R loopt als één balk door in de linkerschreef van de A.
   - Het paar leest als ligatuur, met een donkere knoop op de basislijn.
   - De R raakt de A, en dat is precies wat deze ronde uitsluit.
2. **W (Cormorant ss03).** Twee zware diagonalen (89 eenheden) staan tegenover twee haarlijnen van 27.
   - De W is de donkerste letter.
   - De haarlijnen worden op 150 px grijs.
3. **Z.** De onderste snavel stijgt 160 eenheden (van y 540 tot 700) met een diepe boog. Dat geeft een donkere "laars" rechtsonder.
   - De bovenste snavel is in v4 vlak afgesneden en eindigt als een stomp wigje.
   - Boven en onder passen daardoor niet bij elkaar.

**v4 B (Rawza): de drie zwaarste problemen**

1. **De R staat los.**
   - De R-stam is 97 tegen 90 bij de a.
   - De R heeft vlakke Didone-haarschreven.
   - Boven de eerste a zit een groot gat (kapitaal 700 tegen x-hoogte 429).
   - De uitgetrokken haal van de R wijst naar de a maar haalt hem net niet. Dat leest als een bijna-botsing.
2. **De haarlijnen zijn te dun voor een logo.** De armen van de w zijn 8,8 eenheden, de balken van de z en de schreven van de R 8,4.
   - Op 96 px breed (1×) valt de w uiteen in twee losse v's.
   - De schreven van de R verdwijnen.
3. **De twee a's verschillen.**
   - De laatste a had een staart die 56 eenheden langer was, waardoor het woordeinde als krul leest.
   - De rechterschreef van de w en de bovenbalk van de z liepen op de x-hoogte bijna in elkaar over: een toevallige halve ligatuur.

## Fase 2 · Vormstudies (intern)

Elke variant staat als volledig woordmerk in zwart op wit, op dezelfde kapitaalhoogte. Alleen het beslissende kenmerk verschilt.

**A: het eindpunt van het R-been** (`studies/a-micro-variants.png`). De W, Z, A en de spatiëring zijn in alle drie gelijk.

| | Geometrische verandering |
|---|---|
| A1 | **Naaldvoet:** de voet loopt als haarlijn van schreefdikte uit tot een punt óp de basislijn. |
| A2 | **Dalende haal:** het been loopt door onder de basislijn (tot 41 eenheden eronder) en eindigt in een punt vóór de A. |
| A3 | **Opwaartse uithaal:** het been raakt de basislijn en buigt omhoog naar een punt. |

**B: de overgang van w naar z** (`studies/b-micro-variants.png`). De R, a's en spatiëring zijn in alle drie gelijk.

| | Geometrische verandering |
|---|---|
| B1 | **T-verbinding:** de rechterschreef van de w loopt door als bovenbalk van de z; de linkerhelft van de schreef blijft. |
| B2 | **Scherpe knik:** de laatste haal van de w knikt over in de bovenbalk van de z. |
| B3 | **Ronde penbocht:** de laatste haal van de w draait via een kleine bocht over in de bovenbalk van de z. |

## Fase 3 · Keuze

**A2, de dalende haal**

- **A1 valt af.** De naaldpunt ligt op dezelfde lijn als de linkerschreef van de A. Vanaf ongeveer 150 px smelten ze samen tot één basislijn, en dan is het de v4-verbinding opnieuw.
- **A3 valt af.** De opwaartse punt wijst naar de schreef van de A en leest klein als een vlekje.
- **A2 wint.**
  - De haal blijft onder de basislijn, dus buiten de baan van de A-schreef.
  - Kleinste afstand tot de A: 57,9 eenheden.
  - De R werkt ook los als initiaal.
  - Het gebaar komt uit het eigen RAWZA-logo van de klant (referentie 01), maar is ingekort zodat het niet meer onder het woord doorloopt.

**B3, de ronde penbocht**

- **B1 valt af.** Hij leest als een gewone doorlopende schreef, niet als een eigen constructie.
- **B2 valt af.** Hij is helder, maar de scherpe knik is hard tegenover de ronde a's met bolletjes.
- **B3 wint.**
  - De bocht herhaalt de boog van de a's.
  - Het woord krijgt één verbonden moment in het midden, een stille verwijzing naar het verbonden Perzische schrift, zonder pseudo-Arabische vormen.
  - Op 96 px leest hij als een gewone wz. Het idee valt daar weg, maar de leesbaarheid niet.

## Fase 4 · Wat er per letter is gedaan

Alle maten zijn in eenheden op een kapitaalhoogte van 700, loodrecht op de haal gemeten.

**A · The Signature.** Gebouwd op de v4 Royal Signature (Cormorant Garamond, wght 500).

| Letter | Wijziging |
|---|---|
| **R** | De voet van het font en de verbinding naar de A zijn verwijderd. Een nieuw getekend onderbeen sluit met dezelfde raaklijnen aan op het been van het font, daalt tot 41 onder de basislijn en loopt taps uit. |
| **A** ×2 | Eén vorm voor beide A's. Top vlak afgesneden op de kapitaallijn. Dwarsbalk van 25 naar 31, even zwaar als de dunne diagonaal. Elke A is apart gespatieerd voor zijn buren. |
| **W** | De W zonder kruising, nieuw uitgebalanceerd. De twee zware diagonalen lopen taps van 89 naar ongeveer 80 bij de binnenkruisen. De twee haarlijnen gaan van 27 naar ongeveer 33. Top en punten zijn vlak afgesneden zoals bij de A. |
| **Z** | Diagonaal 73 (was 85 in het font, tegen 89 voor de dikke haal van de A). De onderste snavel is ingekort tot een strakke snede, ongeveer 100 eenheden hoog in plaats van 160. |
| **Spatiëring** | Optisch gemeten, met daarna twee correcties op het oog: R–A +20 en W–Z +25. |

**B · The Editorial.** Bodoni Moda, nu op **optische maat 11** (wght 450) in plaats van 24. Dat is rustiger contrast en warmer, en de haarlijnen zijn 18 tot 21 in plaats van 8.

| Letter | Wijziging |
|---|---|
| **R** | De stam is aan beide kanten 3,3 dunner (96,6 → 90), zodat hij even zwaar is als de stam van de a (88,9). Verder de R van het font. |
| **a** ×2 | Identiek en onbewerkt. De eindvorm met langere staart uit v4 is weg. |
| **w** | De rechterschreef is weg; de bovenkant van de arm is onderdeel van de verbinding. |
| **z** | Diagonaal 8 dunner. De linkervlag en zijn boog zijn weg; de bovenbalk begint bij de verbinding. De penbocht hoort bij `letter-z` en overlapt bewust de bovenkant van de w-arm, zodat de letters nergens rand aan rand liggen. |
| **Spatiëring** | Optisch tussen x-hoogte en basislijn, met a–w +10. De a staat onder de buik van de R. |

## Fase 5 · Tests

Getest in **Inkscape 1.2.2** (voor deze ronde geïnstalleerd) en **Chromium** (via Playwright). Illustrator was hier niet beschikbaar en is dus **niet** getest.

**Structuur**
- Elke letter heeft een eigen `<g>` met één samengesteld pad.
- Geen transformaties, tekst, fonts, filters of raster.
- Een expliciete `viewBox` en geen achtergrond.
- Beide bestanden hebben hetzelfde kader: kapitaallijn op y 50, basislijn op y 750, hoogte 860. Op dezelfde hoogte geplaatst zijn ze dus op dezelfde optische maat.
- Inkscape herkent de groepen `letter-R`, `letter-A-1`, … per bestand.

**Contouren**
- Geen zelfdoorsnijdingen.
- De richting van de binnenvormen klopt.
- Een scan per pixelrij vond in de W nog een spleet van 0,1 eenheid langs de verbrede haarlijnen. Die is opgelost door de stroken te laten overlappen. Wat de scan nu nog vindt, zijn de natuurlijke scherpe binnenhoeken van de W.
- **Inkscape Pad → Verenigen (Path → Union)** gaf voor A één pad met 8 deelpaden (5 letters en 3 binnenvormen) en voor B één pad met 7. Bij B smelten w en z daarbij samen, zonder gat in de verbinding.

**Formaten** (400, 240, 150 en 96 px breed, wit en champagne op chocolade): zie `rawza-art-direction.html`, test 3.
- Op 150 px ontstaan bij geen van beide vreemde kruisingen of samengedrukte paren.
- Op 96 px breed (1×, Inkscape) gemeten dekking van de dunste lijnen:

| | Dunste lijnen | Dekking |
|---|---|---|
| A | dwarsbalk A | 47 % |
| | schreef R | 49 % |
| | schreef W | 70 % |
| B | bovenbalk z | 67 % |
| | haarlijn w | 77 % |
| | schreef R | 60 % |

- Beide woorden blijven leesbaar. Bij A worden de horizontale haarlijnen op die maat wel duidelijk grijs (kapitaalhoogte is dan maar 17 px).

**Pagina:** geen horizontale scroll op 1280 en 390 px. Licht- en donkermodus werken. Op 390 px scrollen de 400-px-proeven binnen hun eigen vlak.

## Fase 6 · Beoordeling

Scores van 0 tot 10, met de gewichten uit de opdracht. Dit zijn eerlijke cijfers, geen streefcijfers.

| Criterium | Gewicht | A · Signature | B · Editorial |
|---|---|---|---|
| Onderscheidend, eigen typografisch idee | 30 % | 6 | 6 |
| Samenhangende letteropbouw en optische spatiëring | 25 % | 8 | 8 |
| Past bij de smaak van de klant | 20 % | 8 | 7 |
| Reproductie en helderheid op klein formaat | 15 % | 6 | 8 |
| Schone, overdraagbare vectoren | 10 % | 8 | 8 |
| **Gewogen** | | **7,1** | **7,2** |

**Onderbouwing**
- **A, idee (6).**
  - De dalende R is herkenbaar en staat ook los.
  - De andere vier letters zijn verfijnde Cormorant. Een getraind oog ziet dat fundament.
- **B, idee (6).**
  - De penbocht tussen w en z is ongewoon en eigen.
  - Hij is pas vanaf ongeveer 150 px te zien, en de letters zijn verder die van Bodoni Moda.
- **Samenhang (8, 8).**
  - Elke richting gebruikt één familie met één lijnlogica, gelijke dubbele letters, en spatiëring die gemeten en op het oog bijgesteld is.
  - Aftrek bij A: de buik van de R is breed, en de bovensnavel van de Z is nog een afgesneden vorm in plaats van een getekende.
  - Aftrek bij B: de hoge Didone-R laat boven de eerste a een groot wit vlak.
- **Smaak (8, 7).**
  - A sluit direct aan op het eigen RAWZA-logo van de klant, en op Mazar en The Palu.
  - B sluit aan op de groene Rawza-schets, Raaya's en Kaaj.
  - Bodoni blijft voor sommige kijkers naar mode of cosmetica neigen. Optische maat 11 maakt dat minder, maar haalt het niet weg.
- **Reproductie (6, 8).** Zie de dekkingsmetingen hierboven.
- **Vectoren (8, 8).** Schoon en overdraagbaar.
  - De bewuste overlap (B: penbocht over de w-arm) moet voor productie in één pad nog verenigd worden.
  - Illustrator is niet getest.

**Conclusie.** Beide richtingen zijn duidelijk beter dan v4 en kunnen in zwart-wit naast een serieuze restaurantidentiteit staan. Geen van beide is al een volledig eigen letter.

Om boven een 8 uit te komen is de volgende stap handwerk in Illustrator of Glyphs:
- **A:** de R volledig zelf tekenen, en de Z-snavels.
- **B:** de R en de verbinding opnieuw tekenen met één consequente penlogica.

Niet meer verfijnen in code.

## Resterende punten voor Illustrator

**A · The Signature**
1. **R:** de buik is breed (de R is de breedste letter na de W). Overweeg de buik 20 à 30 eenheden smaller te tekenen, met behoud van de stamdikte.
2. **R-staart:** de punt eindigt 57,9 eenheden van de A. Dat is goed vanaf 150 px. Onder 120 px komen ze optisch dicht bij elkaar; gebruik A daarom niet smaller dan 120 px, of maak een kleinformaatversie met een kortere staart.
3. **Z:** de bovensnavel is de afgesneden vlag van het font, met een buitenkant die naar links helt. Teken hem opnieuw als een korte, rechte wig die past bij de nieuwe ondersnavel.
4. **W:** de haarlijnen zijn met rechte stroken verbreed, en de rechterhaarlijn loopt taps naar de schreef. Controleer de overgang naar de boogjes onder de schreven op groot formaat (≥ 50 cm).
5. **Kleine maten:** de horizontale haarlijnen (schreven 13,8, dwarsbalk 31) geven op 96 px ongeveer 50 % grijs. Voor gebruik onder 120 px is een zwaardere kleinformaatversie nodig.

**B · The Editorial**
1. **Penbocht:** die hoort bij `letter-z` en overlapt de bovenkant van de w-arm. Voor graveren, borduren of transparantie: w en z selecteren en Pathfinder → Verenigen.
2. **R–a:** de haal van de R ligt 27,6 eenheden van de buik van de a. Dat is bewust krap, maar op 96 px is het ongeveer 1 pixel. Controleer dit in print op visitekaartjesformaat.
3. **R:** de stam is dunner gemaakt (90). De binnenhoeken van de schreven zijn daardoor 3,3 eenheden verschoven; controleer ze op groot formaat.
4. **Bocht:** de bocht is met één kubische kromme per rand getekend. Op groot formaat kan een letterontwerper de spanning (de krommingsovergang naar de rechte arm) nog verfijnen.

## Fundamenten en licenties

| | Font | Instantie | Licentie |
|---|---|---|---|
| A | Cormorant Garamond (Christian Thalmann) | wght 500 | SIL Open Font License 1.1 |
| B | Bodoni Moda (Owen Earl) | opsz 11, wght 450 | SIL Open Font License 1.1 |

- Copyright en licentie zijn in v4 in de name-tabel van de fonts gecontroleerd.
- Beide instanties zijn met fontTools gemaakt uit de variabele fonts in `typography-v4/fonts-src/`. De licentieteksten staan in `tools/fonts/`.
- De woordmerken zijn bewerkte contouren (artwork), geen font. Er wordt geen fontsoftware verspreid.
- Er is geen nieuw lettertype ontworpen, en er is ook geen licentie op een nieuw lettertype geclaimd.

## Opnieuw bouwen

Commando: `cd tools && npm install && npm run build`.

De build schrijft de twee SVG's en de html, en meldt per letter de ankerpunten, zelfdoorsnijdingen en de controle van de binnenvormen.

De studiebladen maak je opnieuw met `npm run studies`. Daarvoor zijn Playwright en Chromium nodig.
