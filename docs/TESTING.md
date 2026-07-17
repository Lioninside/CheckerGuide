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

## Manuelle Smoke-Checkliste

- App startet lokal.
- Katalog-Empty-State ist verständlich.
- Profilhinweis kann bestätigt werden.
- Mit echtem Katalog funktionieren YouTube-Link, Gesehen, Merken, Glücksrad, Entdecken und Suche.
