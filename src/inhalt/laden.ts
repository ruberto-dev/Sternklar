import type { Frage } from './typen'

// Alle Content-Dateien werden zur Buildzeit eingebunden — damit sind die
// Fragen Teil des Bundles und offline immer verfuegbar.
const dateien = import.meta.glob<Frage[]>('../../content/*.json', {
  eager: true,
  import: 'default',
})

export const ALLE_FRAGEN: Frage[] = Object.values(dateien).flat()

export function fragenNachThema(themaId: string): Frage[] {
  return ALLE_FRAGEN.filter((frage) => frage.thema === themaId)
}
