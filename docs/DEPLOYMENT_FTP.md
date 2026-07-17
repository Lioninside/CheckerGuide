# FTP Deployment

## Build

```bash
npm ci
npm run check
npm run build:production
```

`build:production` blockiert einen leeren Katalog.

## FTPS

Der Workflow `.github/workflows/ftp-deploy.yml` nutzt FTPS und lädt `dist/` hoch.

## GitHub Secrets

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

## GitHub Variables

- `FTP_SERVER_DIR`

## Unterverzeichnis

Hash-Routing funktioniert ohne Server-Rewrites. Bei einem Unterverzeichnis muss der FTP-Zielordner korrekt gesetzt sein.

## Dry Run

Vor dem ersten echten Deployment lokal `npm run build:production` ausführen und die Ausgabe mit `npm run preview` prüfen.

## Cache und Rollback

Da der Build statisch ist, kann ein Rollback durch erneutes Hochladen eines älteren `dist/` erfolgen. Aggressives Browser-Caching sollte für `catalog/episodes.json` vermieden werden.

## Domainwechsel

Profile liegen lokal im Browser und sind an Ursprung und Browser gebunden. Ein Domainwechsel kann bestehende Profile nicht automatisch übernehmen.
