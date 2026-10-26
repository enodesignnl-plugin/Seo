# RAWZA met swash-R — Illustrator-pakket

Het logo met de kalligrafische swash-R, klaar voor Adobe Illustrator. Aan het ontwerp is niets veranderd. Alles is vectorwerk: lettertypen zijn alleen nodig voor de bewerkbare ondertitel.

## Snel aan de slag

- **Openen in Illustrator:** *Bestand > Openen* en kies een `.svg`, `.pdf` of `.eps`.
  - Een SVG behoudt de laag- en padnamen. Een PDF of EPS opent als gewone vectorgroep, zonder namen.
- **Plakken in een bestaand document:**
  - Open de PDF in Illustrator, selecteer alles en kopieer het (Cmd/Ctrl+C). Plak het daarna in je eigen document (Cmd/Ctrl+V).
  - Of gebruik *Bestand > Plaatsen* en klik daarna in de bovenbalk op **Insluiten**.
  - Of open een SVG in een teksteditor, kopieer de volledige code en plak die direct in Illustrator. Ook dan blijft alles vector.
- **Kleur wijzigen:** selecteer de groep en kies een nieuwe vulkleur. Elk pad heeft zijn eigen expliciete kleur.

## Inhoud

| Map / bestand | Wat |
|---|---|
| `SVG/` | 17 bestanden met benoemde lagen en paden (de bron) |
| `PDF/` | dezelfde 15 logobestanden als PDF, opent direct als vector in Illustrator |
| `EPS/` | dezelfde 15 als EPS, voor drukkerijen en oudere software |
| `PNG/` | transparante voorbeelden, 4000 px breed |
| `RAWZA_SwashR_Contact_Sheet.png` | overzicht van alles |
| `Fonts/` | Montserrat (SIL OFL 1.1), alleen nodig voor de bewerkbare ondertitel |

### Bestanden (SVG; PDF en EPS hebben dezelfde namen)

| Bestand | Gebruik |
|---|---|
| `RAWZA_SwashR_Logo_{Gold,Chocolate,Black,White}` | Logo met RESTAURANT |
| `RAWZA_SwashR_Logo_Afghaans_{Gold,Chocolate,Black,White}` | Logo met AFGHAANS RESTAURANT |
| `RAWZA_SwashR_Wordmark_{Gold,Chocolate,Black}` | Alleen RAWZA |
| `RAWZA_SwashR_R_{Gold,Chocolate,Black}` | Alleen de swash-R (bijvoorbeeld voor monogram of social) |
| `RAWZA_SwashR_Foil_OneColour` | Eén drukplaat voor goudfolie: elk zwart vlak is folie, zonder overlappende vormen |
| `RAWZA_SwashR_Logo_Descriptor_Editable` | Logo met RESTAURANT als bewerkbare tekst (alleen SVG) |
| `RAWZA_SwashR_Logo_Afghaans_Descriptor_Editable` | Logo met AFGHAANS RESTAURANT als bewerkbare tekst (alleen SVG) |

## Laag- en padnamen (SVG)

```
01_WORDMARK_RAWZA   LETTER_R, LETTER_A_01, LETTER_W, LETTER_Z, LETTER_A_02
02_DESCRIPTOR       DESC_01_R … DESC_10_T   (AFGHAANS RESTAURANT: DESC_01_A … DESC_18_T)
                    of DESCRIPTOR_TEXT in de bewerkbare versie
```

## Kleuren

| Kleur | Hex |
|---|---|
| Goud | `#D6B583` |
| Chocolade | `#2A1A12` |
| Zwart | `#000000` |
| Wit | `#FFFFFF` |

Voor drukwerk: laat de goudtint door de drukker matchen op een Pantone-staal of gebruik folie. Hex-waarden zijn schermkleuren.

## Bewerkbare ondertitel

Installeer eerst `Fonts/Montserrat[wght].ttf`. De tekst staat in Montserrat **Medium**. Zet in het tekenpaneel de **kerning op 0** (niet op Auto of Metrisch). Dan valt de tekst exact op de omlijnde versie; met automatische kerning wordt de regel een fractie korter.

| | RESTAURANT | AFGHAANS RESTAURANT |
|---|---|---|
| Grootte | 182,86 SVG-eenheden (45,7 pt bij openen op standaardgrootte) | 142,86 eenheden (35,7 pt) |
| Tracking in Illustrator | **490** | **350** |
| Positie (links, basislijn) | x 2497,48 · y 1420,15 | x 2019,30 · y 1392,15 |

## Opbouw van het ontwerp

- **R:** drie penhalen.
  - De lus komt als haarlijn van links binnen.
  - De schacht is een sikkel met een fijne punt bovenaan en een ronde voet.
  - Het been loopt als zwierige staart onder de ondertitel door.
- **A, W, Z, A:** de goedgekeurde letters van richting A (Cormorant Garamond, bewerkt).
- **Ondertitel:** Montserrat Medium, rechts uitgelijnd boven de staart.
- **Eenheden:** 1 eenheid is 1/700 van de hoogte van de hoofdletters AWZA.

## Kleine maten

De haarlijnen van de R zijn heel fijn. Onder ongeveer 250 px breed (op scherm) of 35 mm (in druk) vallen ze weg. Gebruik het logo daarom niet kleiner, of laat er eerst een zwaardere versie voor kleine maten van maken.

## Controle

- **SVG en PDF:** in Inkscape opnieuw gerenderd en pixel voor pixel vergeleken met de bron. Ze zijn gelijk; de grootste afwijking is 18/255 aan de randen, en geen enkele pixel wijkt meer dan 40 af.
- **Paden en XML:**
  - geen zelfdoorsnijdingen en juiste binnenvormen;
  - geldige XML;
  - geen `<style>`, `<use>`, `<defs>`, maskers of filters.
- **Bewerkbare ondertitel:** gecontroleerd in Chromium. Met kerning uit valt de tekst op de omlijnde versie.
- **EPS:** gemaakt met Inkscape (cairo), maar niet teruggelezen, omdat hier geen Ghostscript beschikbaar is.
- **Illustrator:** het pakket is niet in Adobe Illustrator zelf geopend.
