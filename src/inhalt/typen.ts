// Das Schema der Fragen in content/. Wird von scripts/validate-content.ts
// geprueft, bevor Tests oder Builds laufen.

export type FrageTyp = 'multiple-choice' | 'wahr-falsch' | 'karteikarte'

export interface Frage {
  id: string
  thema: string
  schwierigkeit: 1 | 2 | 3
  typ: FrageTyp
  frage: string
  antworten: string[]
  /** Index der richtigen Antwort in `antworten` (Karteikarte: immer 0) */
  korrekt: number
  erklaerung: string
  quelle: string
}
