# FTP Deployment

## Build

```bash
npm ci
npm run check
npm run build:production
```

`build:production` blockiert einen leeren Katalog.

## Manuelles FTP-Deployment

Für manuelles Testing müssen keine FTP-Secrets in GitHub gesetzt werden.

1. Lokal `npm run build:production` ausführen.
2. Den Inhalt von `dist/` in den Serverordner für `https://bartlome.com/checkerguide/` hochladen.
3. Online die Smoke-Checkliste aus `docs/TESTING.md` ausführen.

Wichtig: Nicht den Projektordner hochladen, sondern nur den Inhalt von `dist/`.

## Automatisiertes FTPS-Deployment

Der Workflow `.github/workflows/ftp-deploy.yml` nutzt FTPS und lädt `dist/` hoch. Dafür werden GitHub Secrets benötigt.

GitHub Secrets:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

GitHub Variable:

- `FTP_SERVER_DIR`

Diese FTP-Werte sind nur für das automatische GitHub Actions Deployment nötig.

## Unterverzeichnis

Hash-Routing funktioniert ohne Server-Rewrites. Bei einem Unterverzeichnis muss der FTP-Zielordner korrekt gesetzt sein. Die App ist mit Vite `base: "./"` gebaut, damit Assets relativ zum Unterordner geladen werden.

## Dry Run

Vor dem ersten echten Deployment lokal `npm run build:production` ausführen und die Ausgabe mit `npm run preview` prüfen.

## Cache Und Rollback

Da der Build statisch ist, kann ein Rollback durch erneutes Hochladen eines älteren `dist/` erfolgen. Aggressives Browser-Caching sollte für `catalog/episodes.json` vermieden werden.

## Domainwechsel

Profile liegen lokal im Browser und sind an Ursprung und Browser gebunden. Ein Domainwechsel kann bestehende Profile nicht automatisch übernehmen.
