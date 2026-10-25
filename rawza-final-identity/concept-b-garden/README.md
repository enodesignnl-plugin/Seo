# Rawza — Concept B, Tuin

Een tweede, aparte logorichting naast richting A (Royal Signature). Richting A is niet aangepast.

| | A · Royal Signature | B · Tuin |
|---|---|---|
| Schrijfwijze | RAWZA | Rawza |
| Letters | Garamond-kapitalen, bewerkt | Rechtopstaande cursief (Cormorant Upright), bewerkt |
| Symbool | Saffraankrokus | Tulpknop |
| Ondertitel | Garamond-kapitalen met lijnen | Marcellus |
| Kleur | Goud en saffraanrood | Champagnegoud |

Alleen de R is uit richting A overgenomen, ongewijzigd: de goedgekeurde R met het been als penstreek.

## Wat er nieuw is

- **awza.** Kleine letters uit Cormorant Upright, een rechtopstaande cursief. De letters zijn geschreven vormen en geen boekletter. Eigen details:
  - de druppel bovenaan de w is een spits blad geworden;
  - de laatste a loopt uit in een lange haarlijn, als tegenhanger van de staart van de R.
- **Tulpknop.** Twee bloembladen met een fijne vouwlijn. De steel is geschreven met dezelfde brede pen (−28°) als de R. De wilde tulp (lāla) groeit in heel Afghanistan; hier is hij teruggebracht tot een gesloten knop.
- **Ondertitel.** Marcellus, kapitalen met licht uitlopende einden.

## Kleuren

| Kleur | Hex |
|---|---|
| Chocolade | `#2A1A12` |
| Champagnegoud | `#D6BC8A` |
| Crème (achtergrond) | `#F3EBDD` |
| Pistache (optioneel accent, alleen symbool) | `#A3AB82` |

## Bestanden

- `concept-b.html` — presentatie, ook gepubliceerd als artifact.
- `svg/` — alles als vectorpaden, geen lettertype nodig, transparante achtergrond:
  - `RAWZA_B_Logo_{Gold,Chocolate,Black,White}.svg` — met AFGHAANS RESTAURANT
  - `RAWZA_B_Logo_Restaurant_{Gold,Chocolate}.svg` — met RESTAURANT
  - `RAWZA_B_Wordmark_{Gold,Chocolate}.svg`
  - `RAWZA_B_Symbol_{Gold,Chocolate}.svg`
  - `RAWZA_B_Signature_R_{Gold,Chocolate}.svg`
- `png/` — voorbeelden op chocolade en crème, plus de volledige presentatie als afbeelding.

## Bouwen

```
cd tools
node build-garden.cjs   # SVG's
node garden-page.cjs    # presentatie
```

De bronbestanden zijn `tools/garden.cjs` (woordmerk en lockup) en `tools/bud.cjs` (symbool).

## Nog niet gedaan

Dit is een conceptpresentatie. Het volgende komt pas als de klant voor B kiest:

- een aparte versie voor kleine maten;
- een Illustrator-pakket met benoemde groepen;
- een bewerkbare ondertitel.

De SVG's zijn gecontroleerd op:

- geldige XML;
- geen zelfdoorsnijdingen;
- juiste richting van de binnenvormen.

In Illustrator zelf zijn ze niet geopend.

## Lettertypen

Alle drie vallen onder de SIL Open Font License. De licentieteksten staan in `tools/fonts/`.

- Cormorant Garamond (de R)
- Cormorant Upright (awza)
- Marcellus (ondertitel)
