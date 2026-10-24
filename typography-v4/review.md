# RAWZA — typografie v4: review

Twee woordmerken, gebouwd op een echt lettertype in plaats van zelf verzonnen vormen:

- **A · Royal Signature** (`RAWZA`) is gebouwd op **Cormorant Garamond**.
- **B · Editorial Elegance** (`Rawza`) is gebouwd op **Bodoni Moda**.

In beide gevallen zijn de contouren uit het lettertype gehaald en daarna gericht aangepast. Er is niets horizontaal geschaald.

Bestanden in deze map:

| Bestand | Inhoud |
|---|---|
| `concept-a.svg`, `concept-b.svg` | Vectorcontouren, één groep per letter, geen font nodig |
| `comparison.html` | v3 en v4 naast elkaar, op wit en in champagne op donkerbruin, plus websitetypografie |
| `tools/` | De bouwcode: elke aanpassing staat als code beschreven en is opnieuw te draaien |
| `research/` | Onderzoeksbeelden, waaronder de tussenstanden van de twee correctierondes |

---

## 1. Analyse van v3

**Oorzaak van alle problemen.** In v3 is elke letter los geconstrueerd uit rechte banden, cirkels en handgezette krommen. Er was geen gedeelde logica voor:

- lijndikte,
- de overgang van dik naar dun,
- de bouw van de schreven.

Daardoor voelden de letters niet als één lettertype, hoe goed elke letter afzonderlijk ook was.

**A v3**

- **De R domineerde.** De staart liep 54 eenheden onder de basislijn door, tot onder de A. Het eerste wat je zag was de staart, niet het woord.
- **De W.** Twee V's waren in elkaar geschoven, en hun binnenste halen kruisten elkaar halverwege. Daardoor ontstond een donkere knoop met scherpe, onlogische hoeken.
- **De Z was te zwaar.** De diagonaal was even breed als de dikke haal van de A, maar loopt over de hele breedte van een smalle letter. Daardoor werd de Z de donkerste letter van het woord.
- **De spatiëring** was berekend, maar niet visueel gecorrigeerd. W–Z was bovenaan te krap.

**B v3**

- **De a en de w kwamen uit verschillende systemen.** De a was rond en had een druppel. De w was geometrisch, met scherpe punten en een andere contrastverdeling.
- **De R stond los van de rest.** Het was een zware, brede kapitaal met een eigen been, zonder relatie met de kleine letters.
- **Geen luxe karakter.** Het contrast was te laag en te onregelmatig voor een Didone, en te hoog voor een gewone serif.

## 2. Fundament en licenties

Ik heb ongeveer twintig serif-families met een open licentie naast elkaar gezet (`research/specimen.png`).

**Waarom deze twee:**

- **Cormorant Garamond voor A.** Het is een klassieke Garamond met hoog contrast op displayformaat en gebogen, beugelvormige schreven. Wat de doorslag gaf: het font heeft al een **W zonder kruising** (stylistic set 3) en een R met een lang, gespannen been dat bij de A op de basislijn uitkomt.
- **Bodoni Moda voor B.** Het is een Didone met verticale as, haarlijnschreven, bolletjes aan de a en de Bodoni-R met gekruld been. De a, w, z en R komen dus echt uit één systeem.

**Afgevallen kandidaten:**

- Cinzel: te Trajaans en te vaak gezien.
- Playfair Display en Gloock: te zwaar en te bekend.
- Italiana: haarlijnen te dun voor een logo.
- Prata en Gilda: te weinig karakter in de R.

**Licenties, gecontroleerd in de fontbestanden zelf (name-tabel) en in de meegeleverde OFL-teksten:**

| Font | Copyright | Licentie | Versie |
|---|---|---|---|
| Cormorant Garamond | © 2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant) | SIL Open Font License 1.1 | 4.001 |
| Bodoni Moda | © 2020 The Bodoni Moda Project Authors (github.com/indestructible-type/Bodoni) | SIL Open Font License 1.1 | 2.005 |

- Geen van beide licenties noemt een *Reserved Font Name*.
- De OFL staat aanpassen en commercieel gebruik toe, ook in logo's.
- Het woordmerk is **artwork** (contouren), geen font. Er wordt dus geen fontsoftware verspreid.
- De bronfonts staan in `fonts-src/` samen met hun licentietekst, zoals de OFL vraagt.

Beide fonts zijn variabel. Ik heb exacte instanties gemaakt met fontTools (`varLib.instancer`), in plaats van te vertrouwen op wat een webfont-API levert. Die API negeert de optische-maat-as.

- **A: Cormorant Garamond, wght 500.**
  - Stam van de R: 88,5 eenheden. Schreef: 13,8. Dat geeft rustig, volwassen contrast.
  - 480 voelde te broos en 560 te zwaar voor "ingetogen".
- **B: Bodoni Moda, optische maat 24, wght 450.**
  - Bij optische maat 24 is de haarlijn 8,4 eenheden op een kapitaalhoogte van 700. Bij 48 is dat 3,3.
  - Het contrast blijft modeachtig (ongeveer 11 : 1), maar de haarlijnen overleven kleinere formaten.

## 3. Wat er per letter is veranderd

Alle maten zijn in eenheden op een kapitaalhoogte van 700, loodrecht op de haal gemeten.

### A · Royal Signature

| Letter | Fundament | Aanpassing | Waarom |
|---|---|---|---|
| **R** | De R van het font | De voet loopt door als haarlijn op schreefdikte (13,5) en gaat **onder de linkerschreef van de A** door. De ronde punt van die schreef is weggesneden, zodat R en A overlappen in plaats van naad op naad te liggen. | De verlenging van v3 blijft, maar ligt nu óp de basislijn in plaats van eronder. Ze wordt een verbinding in plaats van een staart, en de R domineert niet meer. |
| **A** ×2 | De A van het font | De top is vlak afgesneden op de kapitaallijn. | **Dit is het ene extra detail:** een gebeitelde, inscriptionele top die de sterkste eigenschap van A v3 (de vlakke top) bewaart, nu zonder losse snavel. |
| **W** | De eigen ongekruiste W van het font (ss03) | De middentop en de punten onderaan krijgen dezelfde vlakke snede als de A. | Geen kruising meer. De binnenste halen raken elkaar alleen op de kapitaallijn, en de W spreekt dezelfde taal als de A. |
| **Z** | De Z van het font | De diagonaal is opnieuw opgebouwd en 12 eenheden dunner: van 85,3 naar 73,3, tegen 89,4 voor de dikke haal van de A. De randen blijven evenwijdig aan het origineel, met kleine afrondingen in de binnenhoeken. De bovenste snavel is op de kapitaallijn afgesneden. | De Z had 101.767 eenheden² inkt. Dat is nu 91.433 (−10 %), zodat hij niet meer de donkerste letter is. |

**Spatiëring.** Per paar is het wit rij voor rij gemeten, met diepe binnenruimtes begrensd. Daarna is elk paar op dezelfde gemiddelde afstand gezet, met een minimum zodat schreven elkaar niet raken.

- W–Z kreeg er 25 eenheden bij, omdat de schreef van de W en de snavel van de Z elkaar op de kapitaallijn naderen.
- R–A staat vast op het aansluitpunt.

### B · Editorial Elegance

| Letter | Fundament | Aanpassing | Waarom |
|---|---|---|---|
| **R** | De Bodoni-R met gekruld been | Het uiteinde van het been is 30 eenheden langs de basislijn uitgetrokken. Dat gebeurt met de eigen krommen van het font: de punten schuiven gelijkmatig op, de verticale dikte blijft gelijk. | De R reikt naar de a, zonder hem te raken. Dat verbindt de kapitaal met de kleine letters, zonder ligatuur. |
| **a** (eerste) | De a van het font | Ongewijzigd. | Het bolletje en de krul van Bodoni zijn al de elegantste vorm. Elke toevoeging maakte hem slechter (zie hieronder). |
| **w** | De w van het font | Ongewijzigd, wel opnieuw gespatieerd. | De w komt nu uit hetzelfde systeem als de a: dezelfde stamdikte (86 tegen 90) en dezelfde haarlijn. |
| **z** | De z van het font | De diagonaal is 10 eenheden dunner: van 89,8 naar 79,9, tegen 90,1 voor de stam van de a. De z heeft 8 % minder inkt. | Ook in Bodoni was de z de donkerste letter. |
| **a** (laatste) | De a van het font | **Eindvorm:** de staart is 56 eenheden uitgetrokken, op dezelfde manier als het been van de R. | Het woord opent en sluit met dezelfde haal. Dit volgt het principe van de eindvormen in het Perzische schrift, waar de laatste letter een ruimere uithaal krijgt. Het is ingetogen en gebaseerd op het lettertype zelf, niet op een ornament. |

**Spatiëring.** Gemeten tussen x-hoogte en basislijn, met dezelfde methode als bij A. Daarna twee correcties op het oog: a–w +12 en w–z +20, omdat de haarschreven daar op de x-hoogte bijna doorlopen. R–a staat zo dat de a onder de buik van de R valt, met vrije ruimte langs de uitgetrokken haal.

**Bewust niet gedaan in B** (getest, beelden in `research/`):

- **Een verbinding R→a.** De haal van de R botste dan op de dikke kant van de buik van de a. Het zag eruit als een fout, niet als een ligatuur. Zie `b-ra-connection-test.png`.
- **Een bolletje aan het been van de R.** Dat las als een punt: "R.".
- **Een ruitvormige punt aan de a** (de stip van een rietpen). Die oogde als een los vliegertje aan een draad.
- **Een druppelvormige punt aan de a.** Die was minder verfijnd dan Bodoni's eigen bolletje.
- **Een open taille in de R.** Die las als een fout in het contour.
- **Een cursieve versie.** De w en z werden te schrijfletterachtig en daardoor minder leesbaar.

## 4. Proces: twee correctierondes

**Ronde 1**, met browserscreenshots naast v3 (`research/pass1-*.png`):

- **A: een naad bij de R–A-verbinding.** Twee aparte paden raakten elkaar precies in één rand. Browsers tekenen daar een lichte naad, en de ronde punt van de A-schreef gaf een knobbel (`pass1-join-seam.png`). Opgelost met overlap in plaats van naad op naad (`pass2-join-fixed.png`).
- **A: W–Z bovenaan te krap.** Opgelost met +25.
- **B: a–w krap.** Opgelost met +12.
- **B: het been van de R raakte de a bijna.** Op klein formaat las dat als een vlek. Opgelost met meer ruimte, en later met de uitgetrokken haal.

**Ronde 2:**

- **B: de uitgetrokken halen.** De R en de laatste a zijn opnieuw gemaakt door de eigen punten van het font te verschuiven, in plaats van een zelf getekende staart. De eerste, getekende versie had een zichtbare knik.
- **Kleine formaten en goud.** Gecontroleerd op 240, 150 en 96 px breed, op 1× en 2× pixeldichtheid, op wit en in champagne op donkerbruin.
- **Contouren.** Gecontroleerd op zelfdoorsnijdingen (0), richting van de binnenvormen (correct) en losse restvlakjes (verwijderd).

## 5. Kwaliteitscheck

| # | Vraag | Antwoord |
|---|---|---|
| 1 | Is A zichtbaar verfijnder dan v3? | **Ja.** Het contrast, de schreven en de overgangen zijn overal gelijk. De W kruist niet meer, de Z is niet meer de zwaarste letter en de R overheerst niet. |
| 2 | Is B echt een ander merk? | **Ja.** Didone tegenover Garamond, kleine letters tegenover kapitalen, strakke redactionele spatiëring tegenover open inscriptionele, en in B geen verbinding tussen letters. |
| 3 | Voelen de letters als één lettertype? | **Ja, bij beide.** Elke letter komt uit één familie, en de aanpassingen gebruiken de eigen halen en krommen van die familie. |
| 4 | Zijn de details ingetogen en bewust? | **Ja.** A: één verbinding en vlakke toppen. B: twee uitgetrokken halen en een lichtere z. Geen ornamenten, kronen of bogen. |
| 5 | Werken ze in zwart-wit? | **Ja.** Alles is massief en éénkleurig. **Kanttekening bij B:** op 96 px breed en kleiner, zeker in goud op bruin, worden de haarlijnen (w, schreven) zwak. |
| 6 | Passen ze naast luxe restaurantidentiteiten? | **A: ja. B: ja, met één kanttekening:** de R is vooral de R van Bodoni Moda. Zie hieronder. |

### Resterende zwaktes

- **B, de onderscheidende R.** De R in B is herkenbaar en elegant, maar dat komt grotendeels van Bodoni's eigen gekrulde been. Mijn aanpassing (de uitgetrokken haal) is subtiel. Wil de klant een R die echt van RAWZA is, dan is de volgende stap een volledig nieuw getekende R door een letterontwerper, op basis van dit fundament.
- **B op kleine formaten.** Onder ongeveer 100 à 120 px breed, en in goudfolie onder ongeveer 30 mm breed (daar wordt de haarlijn dunner dan 0,1 mm), is een kleinformaatversie nodig. Dat is dezelfde opbouw op een Bodoni-instantie met optische maat 11. Daarvoor is één fontTools-commando en één regel in `concept-b.cjs` nodig.
- **A is herkenbaar als Cormorant.** Een getraind oog ziet het fundament. De eigen elementen zijn bewust bescheiden (verbinding, vlakke toppen, lichtere Z). Daardoor is het merk tijdloos, maar minder uitgesproken eigen dan een volledig getekende letter.
- **De R–A-verbinding is een haarlijn van 13,5 eenheden** (1,9 % van de kapitaalhoogte), even dik als de schreven. Bij borduren, of bij graveren met een kapitaalhoogte onder ongeveer 8 mm (daar wordt de lijn dunner dan 0,15 mm), moet die dikker. In Illustrator kan dat met een contour van 0,1 mm op alleen dat stukje.
- **De eindvorm-staart in B** zie je pas op groot formaat. Op klein formaat leest hij als een gewone a. Dat is bewust, maar het betekent ook dat het detail op een visitekaartje wegvalt.
- **De spatiëring is gemeten en daarna op twee paren met het oog bijgesteld.** Een laatste controle door een letterontwerper op ware grootte, in print, blijft aan te raden.

## 6. Illustrator en nabewerking

- **Openen.**
  - Elke SVG opent als één groep `wordmark` met per letter een groep (`letter-R`, `letter-A-1`, …).
  - Elke groep bevat één samengesteld pad, zonder transformaties en zonder fonts.
  - Eenheden: kapitaalhoogte 700 in de viewBox. Het bestand opent op halve grootte (350 pt kapitaalhoogte).
- **Eén contour voor productie.**
  - Bij A overlapt de haarlijn van de R ongeveer 17 eenheden onder de schreef van de A. Op scherm en in print zie je dat niet.
  - Voor graveren, preegstempels, borduren of effecten met transparantie: selecteer `letter-R` en `letter-A-1`, en kies Pathfinder → Verenigen.
- **Kleuren.** Overal is `#000000` gebruikt. Champagne (#C8AC7E) en donkerbruin (#2A1C17) staan in `comparison.html` als referentie.
- **Opnieuw bouwen.**
  - Commando: `cd tools && npm install && npm run build`. Je hebt Node 18 of nieuwer nodig.
  - De build schrijft `concept-a.svg`, `concept-b.svg` en `comparison.html`, en meldt per letter het aantal ankerpunten, zelfdoorsnijdingen en de controle van de binnenvormen.
  - De v3-bestanden in `typography-v3/` worden alleen gelezen, niet aangepast.
