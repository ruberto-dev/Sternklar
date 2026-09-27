// Prueft die Content-Dateien in content/ auf Pflichtfelder, gueltige Werte
// und doppelte IDs. Aufruf: node scripts/validate-content.ts
// Laeuft als Pflichtschritt in `npm test` und vor `npm run build`.

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { THEMEN } from '../src/themen.ts'

const contentOrdner = join(dirname(fileURLToPath(import.meta.url)), '..', 'content')

const TYPEN = ['multiple-choice', 'wahr-falsch', 'karteikarte'] as const
const PFLICHTFELDER = [
  'id',
  'thema',
  'schwierigkeit',
  'typ',
  'frage',
  'antworten',
  'korrekt',
  'erklaerung',
  'quelle',
] as const

const fehler: string[] = []
const alleIds = new Map<string, string>() // id -> Datei
let fragenGesamt = 0
const proThema = new Map<string, number>()

function istNichtLeererText(wert: unknown): wert is string {
  return typeof wert === 'string' && wert.trim().length > 0
}

const dateien = readdirSync(contentOrdner).filter((d) => d.endsWith('.json')).sort()
const themaIds = new Set(THEMEN.map((t) => t.id))

// Jedes Thema braucht seine Datei
for (const thema of THEMEN) {
  if (!dateien.includes(`${thema.id}.json`)) {
    fehler.push(`content/${thema.id}.json fehlt (Thema «${thema.name}»)`)
  }
}

for (const datei of dateien) {
  const pfad = join(contentOrdner, datei)
  const themaAusDatei = datei.replace(/\.json$/, '')

  if (!themaIds.has(themaAusDatei)) {
    fehler.push(`${datei}: Dateiname entspricht keinem bekannten Thema`)
  }

  let inhalt: unknown
  try {
    inhalt = JSON.parse(readFileSync(pfad, 'utf8'))
  } catch (e) {
    fehler.push(`${datei}: kein gueltiges JSON (${(e as Error).message})`)
    continue
  }

  if (!Array.isArray(inhalt)) {
    fehler.push(`${datei}: oberste Ebene muss ein Array von Fragen sein`)
    continue
  }

  inhalt.forEach((frage, index) => {
    const wo = `${datei}[${index}]`
    if (typeof frage !== 'object' || frage === null || Array.isArray(frage)) {
      fehler.push(`${wo}: Eintrag ist kein Objekt`)
      return
    }
    const f = frage as Record<string, unknown>
    const id = istNichtLeererText(f.id) ? f.id : wo

    for (const feld of PFLICHTFELDER) {
      if (!(feld in f)) fehler.push(`${id}: Pflichtfeld «${feld}» fehlt`)
    }
    for (const feld of Object.keys(f)) {
      if (!(PFLICHTFELDER as readonly string[]).includes(feld)) {
        fehler.push(`${id}: unbekanntes Feld «${feld}» (Tippfehler?)`)
      }
    }

    if (istNichtLeererText(f.id)) {
      if (!new RegExp(`^${themaAusDatei}-\\d{3}$`).test(f.id)) {
        fehler.push(`${id}: id muss dem Muster «${themaAusDatei}-nnn» folgen`)
      }
      const bekannteDatei = alleIds.get(f.id)
      if (bekannteDatei) {
        fehler.push(`${id}: doppelte ID (bereits in ${bekannteDatei})`)
      } else {
        alleIds.set(f.id, datei)
      }
    } else {
      fehler.push(`${wo}: id fehlt oder ist leer`)
    }

    if (f.thema !== themaAusDatei) {
      fehler.push(`${id}: thema «${String(f.thema)}» passt nicht zur Datei ${datei}`)
    }

    if (f.schwierigkeit !== 1 && f.schwierigkeit !== 2 && f.schwierigkeit !== 3) {
      fehler.push(`${id}: schwierigkeit muss 1, 2 oder 3 sein`)
    }

    const typ = f.typ as (typeof TYPEN)[number]
    if (!TYPEN.includes(typ)) {
      fehler.push(`${id}: typ «${String(f.typ)}» ist ungueltig`)
    }

    if (!istNichtLeererText(f.frage)) fehler.push(`${id}: frage fehlt oder ist leer`)
    if (!istNichtLeererText(f.quelle)) fehler.push(`${id}: quelle fehlt oder ist leer`)

    if (!istNichtLeererText(f.erklaerung)) {
      fehler.push(`${id}: erklaerung fehlt oder ist leer`)
    } else if (f.erklaerung.trim().length < 80) {
      fehler.push(`${id}: erklaerung ist zu kurz fuer 2 bis 4 Saetze`)
    } else if (f.erklaerung.trim().length > 700) {
      fehler.push(`${id}: erklaerung ist zu lang fuer 2 bis 4 Saetze`)
    }

    // Schweizer Rechtschreibung: kein scharfes S
    for (const feld of ['frage', 'erklaerung', 'quelle'] as const) {
      if (typeof f[feld] === 'string' && (f[feld] as string).includes('ß')) {
        fehler.push(`${id}: ${feld} enthaelt «ß» — Schweizer Rechtschreibung verlangt «ss»`)
      }
    }

    if (!Array.isArray(f.antworten) || !f.antworten.every(istNichtLeererText)) {
      fehler.push(`${id}: antworten muss ein Array nicht leerer Texte sein`)
      return
    }
    const antworten = f.antworten as string[]
    if (antworten.some((a) => a.includes('ß'))) {
      fehler.push(`${id}: antworten enthalten «ß» — Schweizer Rechtschreibung verlangt «ss»`)
    }
    if (new Set(antworten).size !== antworten.length) {
      fehler.push(`${id}: antworten enthalten Duplikate`)
    }

    switch (typ) {
      case 'multiple-choice':
        if (antworten.length < 3 || antworten.length > 5) {
          fehler.push(`${id}: multiple-choice braucht 3 bis 5 Antworten`)
        }
        break
      case 'wahr-falsch':
        if (antworten.length !== 2 || antworten[0] !== 'Wahr' || antworten[1] !== 'Falsch') {
          fehler.push(`${id}: wahr-falsch braucht genau die Antworten ["Wahr", "Falsch"]`)
        }
        break
      case 'karteikarte':
        if (antworten.length !== 1) {
          fehler.push(`${id}: karteikarte braucht genau eine Antwort`)
        }
        break
    }

    if (
      typeof f.korrekt !== 'number' ||
      !Number.isInteger(f.korrekt) ||
      f.korrekt < 0 ||
      f.korrekt >= antworten.length
    ) {
      fehler.push(`${id}: korrekt muss ein gueltiger Index in antworten sein`)
    }

    fragenGesamt++
    proThema.set(themaAusDatei, (proThema.get(themaAusDatei) ?? 0) + 1)
  })
}

if (fehler.length > 0) {
  console.error(`Content-Validierung FEHLGESCHLAGEN — ${fehler.length} Problem(e):\n`)
  for (const f of fehler) console.error(`  • ${f}`)
  process.exit(1)
}

console.log(`Content-Validierung OK: ${fragenGesamt} Fragen in ${dateien.length} Dateien.`)
for (const [thema, anzahl] of [...proThema.entries()].sort()) {
  console.log(`  ${thema}: ${anzahl}`)
}
