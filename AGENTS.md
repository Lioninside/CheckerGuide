# AGENTS.md

Diese Regeln gelten für spätere Codex-Arbeiten im Checker Guide.

## Zuerst lesen

- `README.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/CATALOG_MAINTENANCE.md`
- relevante ADRs

## Unveränderliche Produktprinzipien

- Inoffizielles Fanprojekt klar sichtbar halten.
- Keine Registrierung.
- Kein Tracking.
- Keine Werbung.
- Keine eigene Cloud in Version 1.
- Kein YouTube-Player und kein Autoplay.
- Keine ARD-Links in der V1-Oberfläche.
- Keine Views, Likes oder Beliebtheitswerte.
- Keine erfundenen Episodendaten oder YouTube-IDs.

## Architekturregeln

- Domain-Code bleibt testbar und frameworkarm.
- Keine direkten `localStorage`-Aufrufe in Features oder Components.
- Browserzugriffe gehören in `src/infrastructure`.
- UI und Domain dürfen nicht von Microsoft Graph abhängen.
- Eine spätere Cloud-Synchronisation läuft über `ProfileRepository`.
- API-Secrets dürfen nie ins Frontend oder Repository.

## UI-Regeln

- Deutsche UI-Texte konsistent halten.
- Buttons, Karten, Eingaben, Dialoge und Tags haben `border-radius: 0`.
- Das geometrische Glücksrad ist die einzige runde Ausnahme.
- Keine überladene Startseite.
- Keine sichtbaren technischen Stacktraces.

## Qualitätsregeln

- Tests und Dokumentation mit jeder relevanten Änderung aktualisieren.
- Katalogdateien nur über vorgesehene Scripts oder bewusst dokumentierte Review-Korrekturen ändern.
- Keine produktionskritischen TODOs ohne Erklärung.
- Keine Secrets committen.

## Befehle

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run catalog:validate
npm run build
npm run check
npm run test:e2e
```

`npm run build:production` muss mit leerem Katalog fehlschlagen und mit echtem Katalog erfolgreich sein.
