# RAWZA logo, exact nagemaakt

Het complete logo uit je afbeelding (`bron/referentie.jpg`), opnieuw opgebouwd als schone vectorpaden.
Het bestaat uit de toren met de bloem, RAWZA met de sierlijke R en AFGHAANS RESTAURANT.

## Wat zit erin

| Map | Inhoud |
|---|---|
| `SVG/` | Voor Illustrator: openen of slepen. Alles is in lagen en paden, er zit geen tekst in die een lettertype nodig heeft. |
| `PDF/` | Opent in Illustrator direct als vector. |
| `PNG/` | 3000 px breed, voor snel gebruik (web, social). De vrijstaande versies hebben een transparante achtergrond. |
| `lettertypen/` | Cormorant Garamond en Montserrat (variabele fonts, OFL-licentie). Nodig om de ondertitel opnieuw te typen. |
| `RAWZA_Logo_Exact_Vergelijking.png` | Je afbeelding, de vector, en de vectorcontour over je afbeelding. |

Versies:

- **Goud_Op_Chocolade_Vierkant**: precies zoals je afbeelding, met hetzelfde vierkante formaat en bruine vlak (1254 × 1254 px).
- **Goud_Op_Chocolade**: hetzelfde, strak bijgesneden.
- **Vrijstaand, zonder achtergrond:**
  - Goud_Referentie `#EDBD76` (het goud uit je afbeelding)
  - Goud `#D6B583` (huisstijl)
  - Chocolade `#2A1A12`
  - Zwart
  - Wit

Lagen in elk bestand:

- `TOREN_BLOEM`, met pad `TOREN_EN_BLOEM`;
- `WOORDMERK`, met paden `LETTER_R`, `LETTER_A`, `LETTER_W`, `LETTER_Z` en `LETTER_A_2`;
- `ONDERTITEL`, met pad `AFGHAANS_RESTAURANT`;
- bij de versies met vlak ook `ACHTERGROND`.

Een pixel in je afbeelding is in Illustrator één px.

## Lettertypen

- **AWZA**: Cormorant Garamond Medium (500), 216 px.
  - Om je afbeelding precies te volgen zijn de letters iets breder gezet: A 105,6%, W 105,0%, Z 114,9%.
  - **W:** in je afbeelding kruist de dunne middenhaal niet door naar een eigen schreef. Ik heb hem daarom laten stoppen waar hij de dikke haal raakt, zodat er bovenop drie schreven staan.
  - **Z:** het vlagje linksboven stopt op de bovenkant van de letter. De voet rechtsonder steekt niet verder uit dan de bovenbalk, zoals in je afbeelding. De Z is even breed als in je afbeelding (120 px).
  - **A:** de dwarsstreep staat 2,8 px hoger, op dezelfde hoogte als in je afbeelding.
- **AFGHAANS RESTAURANT**: Montserrat.
  - Gewicht 550, tussen Medium en SemiBold. Dat gewicht kies je in Illustrator via het paneel voor variabele fonts.
  - Grootte 34,6 px, spatiëring (tracking) 277, de spatie 1,3 px breder.
  - Dit is gemeten op je afbeelding. Daar staan alle letters op exact gelijke afstand: de afwijking is minder dan een halve pixel.
- **De sierlijke R** en **de toren met de bloem** zijn getekende paden, geen lettertype.
  - De R komt uit `../sierlijke-r-exact`.
  - De toren is overgetrokken en daarna exact spiegelsymmetrisch gemaakt, met scherpe punten.

## Afstanden en uitlijning

- **Toren → RAWZA = RAWZA → ondertitel: 42,3 px.** Gemeten tussen de kaders van de vormen, zoals Illustrator ze toont. In je afbeelding was dat 43,5 en 41,1 px.
- **Alle letters staan op dezelfde plek als in je afbeelding**, met de letterafstanden zoals ze daar zijn. Elke letter en de toren wijken hooguit 1,3 px af. Alleen de scherpe puntjes van de blaadjes en het begin van de haarlijn van de R reiken 2 à 3 px verder: in je afbeelding vervagen die.
- **De toren staat op precies dezelfde horizontale plek als in je afbeelding.** Dat is 6,6 px rechts van het midden van het woord RAWZA, gemeten van het begin van de R tot het eind van de laatste A.
- **De ondertitel eindigt precies onder het eind van de laatste A.** In je afbeelding was dat 1 px ernaast.
- **Het hele logo staat in het midden van het vierkant.**

## Hoe dicht bij je afbeelding

Vormovereenkomst per onderdeel, gemeten met de pixels van je afbeelding (randen meegerekend):

| Onderdeel | Overeenkomst |
|---|---|
| Toren met bloem | 92,5% |
| Sierlijke R | 93,5% |
| A en laatste A | 88,8% en 89,1% |
| W | 83,7% |
| Z | 88,8% |
| AFGHAANS RESTAURANT | 80,1% |

Hoe kleiner en dunner de letters, hoe lager dit getal: de randen in je afbeelding zijn wazig en een rand van een halve pixel weegt dan zwaar. De laatste afbeelding in `RAWZA_Logo_Exact_Vergelijking.png` laat elke vectorvorm als blauwe contour over je afbeelding zien.

## Goed om te weten

- In je afbeelding is de toren iets donkerder goud dan de letters. Hier hebben alle onderdelen één kleur.
- Je afbeelding is 1254 px. Heel fijne details, zoals de dikte van de haarlijnen en de puntjes van de blaadjes, zijn daarom een beste schatting.
- Ik heb de bestanden niet in Illustrator zelf kunnen openen. Wel is gecontroleerd dat elke SVG geldig is en alleen gesloten paden met een vaste kleur bevat.
- Opnieuw bouwen: zie `tools/lockup-exact/build.cjs`.
