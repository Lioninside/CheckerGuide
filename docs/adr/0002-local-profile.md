# ADR 0002: Lokale Speicherung

## Entscheidung

Profile bleiben in `localStorage`; Export und Import nutzen JSON.

## Gründe

- keine Registrierung
- keine eigene Cloud
- keine Profildaten an Server
- einfache Wiederherstellung durch Export

## Konsequenzen

Profile sind browser- und gerätegebunden. Synchronisation bleibt ein späteres optionales Thema.
