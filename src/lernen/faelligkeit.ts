// Datumslogik fuer das Leitner-System. Alle Daten sind lokale Kalendertage
// im Format YYYY-MM-DD — Uhrzeiten spielen fuer die Faelligkeit keine Rolle.

export type Box = 1 | 2 | 3 | 4 | 5

// Wiederholungsintervall in Tagen, nachdem eine Frage in dieser Box landet
export const BOX_INTERVALLE: Record<Box, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
}

export function heuteISO(jetzt: Date = new Date()): string {
  const jahr = jetzt.getFullYear()
  const monat = String(jetzt.getMonth() + 1).padStart(2, '0')
  const tag = String(jetzt.getDate()).padStart(2, '0')
  return `${jahr}-${monat}-${tag}`
}

export function plusTage(datum: string, tage: number): string {
  const [jahr, monat, tag] = datum.split('-').map(Number)
  // Mittag als Basis, damit Sommerzeit-Wechsel den Kalendertag nie verschieben
  const d = new Date(jahr, monat - 1, tag, 12)
  d.setDate(d.getDate() + tage)
  return heuteISO(d)
}

// Faellig ist alles, was heute oder frueher dran ist.
// YYYY-MM-DD vergleicht sich als String korrekt chronologisch.
export function istFaellig(faelligAm: string, heute: string = heuteISO()): boolean {
  return faelligAm <= heute
}

// Box-Uebergang nach einer Antwort: richtig → naechste Box (max. 5),
// falsch → zurueck in Box 1
export function naechsteBox(box: Box, richtig: boolean): Box {
  if (!richtig) return 1
  return box < 5 ? ((box + 1) as Box) : 5
}
