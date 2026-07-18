# Checker Guide Implementation Plan

## Ausgangslage

- Das lokale Repository war beim Start leer und hatte noch keinen Commit.
- Der GitHub-Remote ist `https://github.com/SwitzerlandTravelCentre/CheckerGuide.git`.
- Die Anwendung wird als vollstaendig statische Web-App gebaut.
- Node.js 24.x wird als reproduzierbare Active-LTS-Linie gepinnt.
- Es werden keine Secrets, keine erfundenen YouTube-IDs und kein produktiver Beispielkatalog committed.

## Architekturentscheidung

- React + Vite + TypeScript für eine kleine, schnelle statische App.
- Hash-Routing, damit FTP-Hosting ohne Server-Rewrite-Regeln funktioniert.
- Domain-Code bleibt frameworkarm und testbar:
  - `catalog` für Katalogschema, Laden und Selektoren.
  - `profile` für lokales Profil, Migration, Import, Export und Kennzahlen.
  - `search` für Normalisierung, Suche und Filter.
  - `recommendations` für tägliche und personalisierte Empfehlungen.
  - `wheel` für faire Zufallsauswahl.
  - `discover` für stabile Swipe-Reihenfolge.
- Infrastructure-Code kapselt Browser-APIs wie `localStorage`.
- UI-Komponenten rufen keine direkten Storage-APIs auf.
- Deutsche UI-Texte werden zentral gehalten.

## Produktumfang V1

- Start-Ansicht mit täglicher Empfehlung und horizontaler Folgeauswahl.
- Zufallsauswahl mit Kartenstapel, ungesehenem Pool, Screenreader-Ansage und Reduced-Motion-Verhalten.
- Swipen-Modus mit stabilem Stapel, Vor/Zurück, Tastatur und Swipe.
- Suche mit Titeln, Themen, Checker- und Themenfilter.
- Detailseite je Folge.
- Profilseite mit Anteil gesehen, sichtbarer Gesehen-Liste, Merkliste, Kennzahlen, Export, Import und Reset.
- Ueber-Seite mit inoffiziellem Fanprojekt-Hinweis.
- Datenschutzfreundliche Architektur ohne Tracking, Werbung, Embeds oder eigene Cloud.

## Katalogstrategie

- Produktiv wird ausschliesslich ein generierter statischer Katalog genutzt.
- Der initiale committed Katalog ist leer, damit keine erfundenen Episodendaten im Repository landen.
- `catalog:sync` nutzt die YouTube Data API, klassifiziert Videos, schreibt Review-Dateien und verhindert ungeprüfte Übernahmen.
- `catalog:validate` prüft Schema, Duplikate, YouTube-IDs, Themen, Checker und Produktionsguards.
- `build:production` blockiert einen leeren Produktivkatalog.

## Tests

- Unit-Tests für Profil, Migrationen, Import, Suche, Empfehlungen, Zufallsauswahl, Swipen und Kataloglogik.
- Component-Tests für zentrale UI-Bausteine, Dialoge, Buttons, Filter und Zustandsanzeigen.
- Playwright-E2E mit abgefangenem Testkatalog für Erstbesuch, Merkliste, Gesehen, Zufallsauswahl, Swipen, Suche, Import/Export, Responsive, Accessibility und Datenschutz-Smoke.
- `npm run check` kombiniert Formatpruefung, Lint, Typecheck, Unit-Tests, Katalogvalidierung und Build.

## Deployment

- GitHub Actions für CI.
- Geplanter YouTube-Katalogsync per Workflow und Secret.
- FTP/FTPS-Deployment ist vorbereitet, aber ohne Secrets deaktiviert.
- Kein Service Worker in Version 1.

## Bekannte bewusste Grenze

Ohne YouTube API Key wird kein echter Folgenkatalog erzeugt. Die App und Tests funktionieren mit einem leeren produktiven Katalog beziehungsweise Test-Fixtures, aber das echte Production-Deployment bleibt bis zum ersten erfolgreichen Katalogsync blockiert.
