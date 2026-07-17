# ADR 0003: Hash-Routing

## Entscheidung

Die App nutzt Hash-Routing.

## Gründe

FTP-Hosting benötigt keine Rewrite-Regeln. Detailseiten funktionieren nach Reload.

## Konsequenzen

URLs enthalten `#`, sind dafür aber auf einfachen statischen Hosts zuverlässig.
