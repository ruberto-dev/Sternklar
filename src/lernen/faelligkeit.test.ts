import { describe, expect, it } from 'vitest'
import {
  BOX_INTERVALLE,
  heuteISO,
  istFaellig,
  naechsteBox,
  plusTage,
} from './faelligkeit'

describe('heuteISO', () => {
  it('formatiert ein Datum als YYYY-MM-DD', () => {
    expect(heuteISO(new Date(2026, 8, 27, 23, 59))).toBe('2026-09-27')
    expect(heuteISO(new Date(2026, 0, 3, 0, 0))).toBe('2026-01-03')
  })
})

describe('plusTage', () => {
  it('addiert Tage innerhalb eines Monats', () => {
    expect(plusTage('2026-09-01', 4)).toBe('2026-09-05')
  })

  it('geht ueber Monats- und Jahresgrenzen', () => {
    expect(plusTage('2026-12-30', 4)).toBe('2027-01-03')
  })

  it('geht ueber den Sommerzeit-Wechsel ohne Tagessprung', () => {
    // In Europa Ende Maerz: Nacht mit nur 23 Stunden
    expect(plusTage('2026-03-28', 2)).toBe('2026-03-30')
  })
})

describe('istFaellig', () => {
  it('heute faellige und ueberfaellige Fragen sind faellig', () => {
    expect(istFaellig('2026-09-27', '2026-09-27')).toBe(true)
    expect(istFaellig('2026-09-01', '2026-09-27')).toBe(true)
  })

  it('zukuenftige Fragen sind nicht faellig', () => {
    expect(istFaellig('2026-09-28', '2026-09-27')).toBe(false)
  })
})

describe('naechsteBox', () => {
  it('richtig befoerdert bis maximal Box 5', () => {
    expect(naechsteBox(1, true)).toBe(2)
    expect(naechsteBox(4, true)).toBe(5)
    expect(naechsteBox(5, true)).toBe(5)
  })

  it('falsch setzt immer auf Box 1 zurueck', () => {
    expect(naechsteBox(5, false)).toBe(1)
    expect(naechsteBox(2, false)).toBe(1)
    expect(naechsteBox(1, false)).toBe(1)
  })

  it('Intervalle verdoppeln sich von 1 bis 16 Tage', () => {
    expect(BOX_INTERVALLE).toEqual({ 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 })
  })
})
