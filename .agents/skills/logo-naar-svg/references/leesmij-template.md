# LEESMIJ template

Write it in the client's language; this one is Dutch. Fill in measured values only. Leave out
sections that do not apply.

```markdown
# <NAAM> logo, exact nagemaakt

Het logo uit je afbeelding (`bron/<bestand>`), opnieuw opgebouwd als schone vectorpaden.

## Wat zit erin

| Map | Inhoud |
|---|---|
| `SVG/` | Voor Illustrator: openen of slepen. Alles is in lagen en paden, er zit geen tekst in die een lettertype nodig heeft. |
| `PDF/` | Opent in Illustrator direct als vector. |
| `PNG/` | 3000 px breed. De vrijstaande versies hebben een transparante achtergrond. |
| `lettertypen/` | De gebruikte fonts met hun licentie (OFL). |
| `<naam>_Vergelijking.png` | Je afbeelding, de vector, en de vectorcontour over je afbeelding. |

Versies:
- <variant>: <kleur> op <achtergrond> / vrijstaand ...

Lagen in elk bestand: `<LAAG>` met pad(en) `<ID>`, ...
Een pixel in je afbeelding is in Illustrator één px.

## Lettertypen
- **<regel>**: <font> <gewicht>, <grootte> px[, breder gezet: <letter> <x>%][, tracking <n>].
  Aanpassingen per letter: <letter>: <wat en waarom, zoals in je afbeelding>.
- **<getekend deel>**: getekend pad, overgetrokken[ en exact spiegelsymmetrisch gemaakt].

## Afstanden en uitlijning
- Alles staat op dezelfde plek als in je afbeelding (afwijking hooguit <n> px).
- <alleen als gevraagd: regel, voor → na in px>

## Kleuren
| Kleur | HEX | RGB | Gebruik |
|---|---|---|---|

Drukwerk: gewone inkt maakt van goud snel mosterdgeel. Vraag om goudfolie of metallic
(bijvoorbeeld Pantone 871 C) en laat CMYK door de drukker omzetten.

## Hoe dicht bij je afbeelding
| Onderdeel | Overeenkomst |
|---|---|
Hoe kleiner en dunner de letters, hoe lager dit getal: de randen in je afbeelding zijn wazig.

## Goed om te weten
- Je afbeelding is <b>×<h> px; heel fijne details zijn een beste schatting.
- Niet in Illustrator zelf geopend; wel gecontroleerd dat elke SVG geldig is en alleen
  gesloten paden met een vaste kleur bevat.
```
