# ADR 0001: React und Vite

## Entscheidung

Checker Guide nutzt React, Vite und TypeScript.

## Gründe

- kleine statische App
- schnelle Builds
- gute Testintegration
- breite Wartbarkeit
- Route-Level-Code-Splitting mit React Lazy

## Alternativen

Vanilla TypeScript wäre möglich, hätte aber mehr UI-Zustandslogik in Handarbeit erfordert. Next.js wäre für diese vollständig statische FTP-App unnötig schwer.
