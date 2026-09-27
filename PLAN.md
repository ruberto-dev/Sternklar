# Plan — Sternklar

Stand: 27.09.2026 · Status: **Phase 0 fertig, Phase 1 (Inhalte) als Nächstes**

Entscheide und Rahmen: [`CLAUDE.md`](CLAUDE.md).
«Heute am Himmel» wird auf Wunsch von Giuseppe direkt mitgebaut (Phase 4),
nicht nur architektonisch vorbereitet. Die App lebt auf Wunsch in diesem
eigenen Repository, getrennt von hytrax.

## Phase 0 — Gerüst ✅ (27.09.2026)

- Vite + React + TypeScript im Repo-Root, striktes tsconfig
- `vite-plugin-pwa` (Manifest, Service Worker, Precache), App-Icons
- HashRouter mit den fünf Screens als leere Gerüste
- Theme-System: dunkles Standard-Theme + Rotlicht-Theme über
  CSS-Custom-Properties, Umschalter funktioniert bereits
- Dexie-Schema: `fortschritt` (Frage-ID → Box, fällig am, Historie),
  `sessions`, `einstellungen`
- Vitest eingerichtet, ein erster Smoke-Test läuft

**Abnahme:** App startet lokal, ist dunkel, Rotlicht-Modus schaltbar,
Navigation zwischen leeren Screens funktioniert.

## Phase 1 — Inhalte

- Content-Schema als TypeScript-Typ + `scripts/validate-content.ts`
  (Pflichtfelder, Wertebereiche, doppelte IDs über alle Dateien)
- 6 × 20 Fragen in `content/` (Mischung aus Multiple-Choice, Wahr/Falsch,
  Karteikarten; Schwierigkeit 1–3 gemischt; Quellenangabe pro Frage;
  unsichere Werte als Bereiche)
- Validierung in `npm test` und als Pflichtschritt vor `build`

**Abnahme:** `npm run validate` grün über 120 Fragen.

## Phase 2 — Lernlogik und Quiz

- Leitner-Engine als reine Funktionen (Box-Übergänge, Fälligkeit,
  Session-Zusammenstellung max. 20) mit Vitest-Tests
- Quiz-Screen: Multiple-Choice, Wahr/Falsch, Karteikarte mit Aufdecken
  und Selbsteinschätzung; nach jeder Antwort sofort Erklärung + Quelle
- Fortschritt wird in IndexedDB geschrieben, Session-Abschluss-Screen

**Abnahme:** komplette Session durchspielbar, Fortschritt überlebt Reload.

## Phase 3 — Screens rundherum

- Start: fällige Fragen heute, Streak, «Session starten»
- Themenübersicht mit Fortschritt (Boxverteilung pro Thema)
- Statistik: Trefferquote pro Thema, schwächste Fragen
- Einstellungen: Rotlicht-Modus, Export/Import als JSON-Datei
  (mit Validierung beim Import), Fortschritt zurücksetzen mit Bestätigung

**Abnahme:** alle fünf Screens vollständig, Export → Reset → Import
stellt den Stand wieder her.

## Phase 4 — Heute am Himmel

- `astronomy-engine` einbinden, Standortkonstante Steinebrunn TG verifizieren
- Mondphase (inkl. Beleuchtungsgrad), Mondauf-/-untergang
- Sichtbare Planeten heute Nacht: Auf-/Untergang, wann am besten sichtbar
- Helle Sterne (Auswahlliste der hellsten, z. B. bis Magnitude ~1.5):
  was steht wann über dem Horizont
- Karte auf dem Start-Screen + Detailansicht; alles offline berechnet

**Abnahme:** Werte stichprobenartig gegen eine unabhängige Quelle geprüft
(z. B. Mondphase und Planetensichtbarkeit für konkrete Daten).

## Phase 5 — Feinschliff und Deployment

- Offline-Verhalten auf dem iPhone testen (Installation, Flugmodus)
- Lighthouse-/PWA-Check, Icons und Splash sauber
- Deployment gemeinsam einrichten: GitHub Pages oder Vercel
  (Entscheid mit Giuseppe), inkl. korrektem `base`-Pfad

**Abnahme:** App auf dem iPhone installiert, funktioniert im Flugmodus,
öffentliche URL steht.

## Später (nicht geplant, nur festgehalten)

- Mehr Fragen pro Thema, neue Themen (nur neue JSON-Dateien nötig)
- Standort in den Einstellungen änderbar machen
- Sternkarten-Ansicht
