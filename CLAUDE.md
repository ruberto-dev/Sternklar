# Sternklar — persönliche Astronomie-Lern-App

Lern-App zum Nachthimmel: Sterne, Sternbilder, Planeten, Galaxien, Kosmologie.
Nur für eine Person (Giuseppe), kein Login, kein Backend, keine Telemetrie.

Der Plan mit Phasen und Stand liegt in [`PLAN.md`](PLAN.md).

## Stack (entschieden)

- **Vite + React + TypeScript**, strikt (`strict: true`)
- **PWA** via `vite-plugin-pwa`: auf dem iPhone installierbar, voll
  offline-fähig (Precache aller Assets inkl. Content-JSON)
- **Routing:** `HashRouter` (react-router) — funktioniert ohne Server-Rewrites
  auf GitHub Pages und im Standalone-Modus
- **Speicherung:** IndexedDB via **Dexie** (nur Lernfortschritt und
  Einstellungen; die Fragen selbst bleiben statische JSON-Dateien)
- **Export/Import:** Fortschritt als JSON-Datei mit Versionsfeld,
  Import validiert vor dem Überschreiben
- **Tests:** Vitest für Lernlogik und Content-Validierung
- **Astronomie-Berechnungen:** `astronomy-engine` (MIT, rein lokal, offline)

## Design (entschieden)

- Mobile first, für iPhone-Nutzung im Dunkeln gedacht
- **Dunkles Design als Standard** (kein Light Mode)
- **Rotlicht-Modus** für draussen: eigenes Theme, das ausschliesslich
  Rottöne und Schwarz verwendet (erhält die Dunkeladaption der Augen).
  Umsetzung über CSS-Custom-Properties und `data-theme="rot"` auf `<html>`,
  nicht über CSS-Filter. Kein Element darf Farben hart codieren.
- Sprache: **Deutsch, Schweizer Rechtschreibung (ss statt ß)** — gilt für
  UI-Texte, Content, Commits und Doku dieses Projekts

## Inhalte

- Fragen als JSON-Dateien pro Thema in `content/`, strikt getrennt vom Code
- Sechs Themen, je eine Datei, Start mit 20 Fragen pro Thema:
  `sonnensystem`, `sterne`, `sternbilder`, `galaxien-kosmologie`,
  `beobachtung`, `geschichte-mythologie`
- Pflichtfelder pro Frage:
  `id`, `thema`, `schwierigkeit` (1–3),
  `typ` (`multiple-choice` | `wahr-falsch` | `karteikarte`),
  `frage`, `antworten`, `korrekt`, `erklaerung` (2–4 Sätze), `quelle`
- IDs global eindeutig, Schema `<thema>-<nnn>` (z. B. `sonnensystem-001`)
- **Nur gesicherte Fakten.** Bei unsicheren oder streuenden Werten
  (Entfernungen, Alter, Anzahlen) Bereiche angeben («ca. 100–400 Milliarden
  Sterne»), nie falsche Präzision
- `scripts/validate-content.ts` prüft alle Dateien: Pflichtfelder, Typen,
  Wertebereiche, `korrekt` verweist auf existierende Antwort, keine
  doppelten IDs über alle Dateien hinweg. Läuft in `npm test` und vor `build`.

## Lernlogik (entschieden)

- **Leitner-System mit 5 Boxen.** Richtig → nächste Box (max. Box 5),
  falsch → zurück in Box 1. Neue Fragen starten in Box 1 und sind sofort fällig.
- Wiederholungsintervalle: Box 1 = 1 Tag, Box 2 = 2, Box 3 = 4,
  Box 4 = 8, Box 5 = 16 Tage
- **Tägliche Session:** fällige Fragen zuerst (älteste Fälligkeit zuerst),
  dann neue Fragen; **max. 20 Fragen pro Session**
- Nach jeder Antwort **sofort die Erklärung** anzeigen, mit Quelle
- **Karteikarten:** Antwort aufdecken, dann Selbsteinschätzung
  «gewusst» / «nicht gewusst» — zählt wie richtig/falsch
- **Streak:** an wie vielen aufeinanderfolgenden Tagen mindestens eine
  Session abgeschlossen wurde

## Screens

1. **Start:** heute fällige Fragen, Streak, Button «Session starten»
2. **Themenübersicht:** Fortschritt pro Thema (Boxverteilung)
3. **Quiz:** die laufende Session
4. **Statistik:** Trefferquote pro Thema, schwächste Fragen
5. **Einstellungen:** Rotlicht-Modus, Export/Import, Fortschritt zurücksetzen
   (mit Bestätigungsdialog)

## «Heute am Himmel» (wird gebaut, Phase 4)

- Fester Standort **Steinebrunn TG** (Gemeinde Egnach), Koordinaten als
  Konstante in `src/config.ts` (ca. 47.55° N, 9.35° O, ca. 450 m) —
  beim Bau nochmals verifizieren
- Berechnet offline mit `astronomy-engine`:
  Mondphase und Mondauf-/-untergang, heute sichtbare Planeten
  (Auf-/Untergang, beste Sichtbarkeit), helle Sterne über dem Horizont
- Eigenes Modul `src/himmel/`, vom Lernteil entkoppelt; erscheint als
  Karte auf dem Start-Screen plus eigene Detailansicht

## Deployment

- Gratis-Hosting: **GitHub Pages oder Vercel**, Entscheid und Einrichtung
  gemeinsam mit Giuseppe am Schluss (Phase 5)
- Zu beachten: GitHub Pages ist im Gratis-Plan nur für **öffentliche**
  Repositories verfügbar; Vercel funktioniert auch mit privaten
- Bis dahin: `base` in `vite.config.ts` konfigurierbar halten, damit
  beides ohne Umbau geht

## Befehle (sobald das Gerüst steht)

```bash
npm run dev          # Entwicklungsserver
npm run build        # Content-Validierung + Produktions-Build
npm test             # Vitest + Content-Validierung
npm run validate     # nur Content-Validierung
```

## Arbeitsregeln

- Fachliche Korrektheit vor Menge: lieber eine Frage weglassen als eine
  ungesicherte Behauptung aufnehmen
- Fortschritts-Datenmodell nur rückwärtskompatibel ändern (Export/Import
  trägt eine Versionsnummer)
- Keine zusätzlichen Abhängigkeiten ohne guten Grund; alles muss offline
  funktionieren
