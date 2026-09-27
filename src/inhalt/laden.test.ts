import { describe, expect, it } from 'vitest'
import { THEMEN } from '../themen'
import { ALLE_FRAGEN, fragenNachThema } from './laden'

describe('Content-Laden', () => {
  it('laedt 120 Fragen', () => {
    expect(ALLE_FRAGEN).toHaveLength(120)
  })

  it('liefert 20 Fragen pro Thema', () => {
    for (const thema of THEMEN) {
      expect(fragenNachThema(thema.id), thema.id).toHaveLength(20)
    }
  })

  it('kennt alle drei Fragetypen', () => {
    const typen = new Set(ALLE_FRAGEN.map((f) => f.typ))
    expect(typen).toEqual(new Set(['multiple-choice', 'wahr-falsch', 'karteikarte']))
  })
})
