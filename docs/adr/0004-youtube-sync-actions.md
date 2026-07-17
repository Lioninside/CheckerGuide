# ADR 0004: YouTube-Sync in GitHub Actions

## Entscheidung

Der Katalogsync läuft als Node-Script und optional per GitHub Actions.

## Gründe

- API-Key bleibt als Secret außerhalb des Frontends
- Katalog bleibt statisch
- Review-Änderungen können als Pull Request geprüft werden

## Konsequenzen

Ohne Secret bleibt der Katalog leer und Production-Deployments werden blockiert.
