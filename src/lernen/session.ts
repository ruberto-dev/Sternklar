// Zusammenstellung der taeglichen Session und Verbuchung von Antworten.
// Reine Funktionen ohne Datenbankzugriff — die Screens kuemmern sich um Dexie.

import type { Fortschritt } from '../db'
import type { Frage } from '../inhalt/typen'
import {
  BOX_INTERVALLE,
  heuteISO,
  istFaellig,
  naechsteBox,
  plusTage,
  type Box,
} from './faelligkeit'

export const SESSION_MAX = 20

// Faellige Fragen zuerst (aelteste Faelligkeit vorn), danach neue Fragen
// themenweise abwechselnd — insgesamt hoechstens `max` Fragen.
export function stelleSessionZusammen(
  alleFragen: Frage[],
  fortschritt: ReadonlyMap<string, Fortschritt>,
  heute: string = heuteISO(),
  max: number = SESSION_MAX,
): Frage[] {
  const faellige = alleFragen
    .filter((frage) => {
      const stand = fortschritt.get(frage.id)
      return stand !== undefined && istFaellig(stand.faelligAm, heute)
    })
    .sort((a, b) => {
      const standA = fortschritt.get(a.id)!
      const standB = fortschritt.get(b.id)!
      if (standA.faelligAm !== standB.faelligAm) {
        return standA.faelligAm < standB.faelligAm ? -1 : 1
      }
      return a.id.localeCompare(b.id)
    })

  const neue = imThemenRundlauf(alleFragen.filter((frage) => !fortschritt.has(frage.id)))

  return [...faellige, ...neue].slice(0, max)
}

// Wechselt die Themen ab (erst je Frage 1 aller Themen, dann je Frage 2 usw.),
// damit eine Session mit neuen Fragen nicht nur ein Thema enthaelt.
function imThemenRundlauf(fragen: Frage[]): Frage[] {
  const gruppen = new Map<string, Frage[]>()
  for (const frage of fragen) {
    const gruppe = gruppen.get(frage.thema)
    if (gruppe) {
      gruppe.push(frage)
    } else {
      gruppen.set(frage.thema, [frage])
    }
  }
  const listen = [...gruppen.values()]
  const ergebnis: Frage[] = []
  for (let runde = 0; listen.some((liste) => runde < liste.length); runde++) {
    for (const liste of listen) {
      if (runde < liste.length) ergebnis.push(liste[runde])
    }
  }
  return ergebnis
}

// Leitner-Verbuchung: richtig → naechste Box, falsch → Box 1.
// Eine Frage ohne bisherigen Fortschritt gilt als Box 1.
export function wendeAntwortAn(
  frage: Frage,
  bisher: Fortschritt | undefined,
  richtig: boolean,
  heute: string = heuteISO(),
): Fortschritt {
  const alteBox: Box = bisher?.box ?? 1
  const neueBox = naechsteBox(alteBox, richtig)
  return {
    frageId: frage.id,
    thema: frage.thema,
    box: neueBox,
    faelligAm: plusTage(heute, BOX_INTERVALLE[neueBox]),
    richtigGesamt: (bisher?.richtigGesamt ?? 0) + (richtig ? 1 : 0),
    falschGesamt: (bisher?.falschGesamt ?? 0) + (richtig ? 0 : 1),
    zuletztGesehen: heute,
  }
}
