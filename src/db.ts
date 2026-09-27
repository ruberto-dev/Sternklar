import Dexie, { type EntityTable } from 'dexie'

// Lernfortschritt pro Frage (Leitner-Box und Faelligkeit).
// Datumsfelder sind lokale Kalendertage im Format YYYY-MM-DD.
export interface Fortschritt {
  frageId: string
  thema: string
  box: 1 | 2 | 3 | 4 | 5
  faelligAm: string
  richtigGesamt: number
  falschGesamt: number
  zuletztGesehen: string | null
}

export interface SessionEintrag {
  id?: number
  datum: string
  gestartet: string // ISO-Zeitstempel
  beendet: string | null
  fragen: number
  richtig: number
  falsch: number
}

export interface Einstellung {
  schluessel: string
  wert: unknown
}

export const db = new Dexie('sternklar') as Dexie & {
  fortschritt: EntityTable<Fortschritt, 'frageId'>
  sessions: EntityTable<SessionEintrag, 'id'>
  einstellungen: EntityTable<Einstellung, 'schluessel'>
}

db.version(1).stores({
  fortschritt: 'frageId, thema, faelligAm',
  sessions: '++id, datum',
  einstellungen: 'schluessel',
})
