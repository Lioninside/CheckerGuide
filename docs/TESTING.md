# Testing

## Strategie

Domain-Funktionen werden mit Vitest direkt getestet. UI-Komponenten werden mit Testing Library getestet. Kritische Nutzerwege laufen mit Playwright gegen einen abgefangenen Testkatalog.

## Befehle

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run check
```

## Fixture-Regeln

Test-Fixtures dürfen echte YouTube-IDs nur verwenden, wenn sie aus einer verifizierten Quelle stammen. Für UI- und Domain-Tests werden synthetische Test-IDs genutzt, die nicht in den produktiven Katalog gelangen.

## Browsermatrix

- Smartphone: 390 x 844
- Tablet: 768 x 1024
- Desktop: 1280 x 900

## Accessibility

Playwright prüft Hauptseiten mit Axe-Smoke, Tastaturbedienung, Dialogfokus und `aria-live`.

## Lokale Smoke-Checkliste

- App startet lokal.
- Katalog-Empty-State ist verständlich, falls kein produktiver Katalog vorhanden ist.
- Profilhinweis kann bestätigt werden.
- Mit echtem Katalog funktionieren YouTube-Link, Gesehen, Merken, Zufallsauswahl, Swipen und Suche.

## Production-Smoke-Checkliste

Nach Upload von `dist/` auf `https://bartlome.com/checkerguide/`:

- `https://bartlome.com/checkerguide/` lädt ohne weiße Seite.
- Die Startseite zeigt eine tägliche Empfehlung und weitere Folgen.
- `https://bartlome.com/checkerguide/#/suche` lädt, Filter und Suchfeld reagieren.
- `https://bartlome.com/checkerguide/#/zufallsauswahl` lädt, der Button `Karte ziehen` zeigt ein Ergebnis.
- `https://bartlome.com/checkerguide/#/swipen` lädt, Weiter/Zurück und Kartenklick funktionieren.
- Ein YouTube-Link öffnet extern und es gibt keinen eingebetteten Player.
- Profilaktionen `Merken`, `Als gesehen markieren`, Export, Import und Reset reagieren lokal im Browser.
- Nach Neuladen bleiben lokale Profiländerungen im selben Browser erhalten.
- Es erscheinen keine sichtbaren technischen Fehlermeldungen oder kaputten deutschen Umlaute.
