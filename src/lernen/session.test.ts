import { describe, expect, it } from 'vitest'
import type { Fortschritt } from '../db'
import type { Frage } from '../inhalt/typen'
import { SESSION_MAX, stelleSessionZusammen, wendeAntwortAn } from './session'

function frage(id: string, thema: string): Frage {
  return {
    id,
    thema,
    schwierigkeit: 1,
    typ: 'wahr-falsch',
    frage: 'Testfrage?',
    antworten: ['Wahr', 'Falsch'],
    korrekt: 0,
    erklaerung: 'Eine Erklaerung.',
    quelle: 'Test',
  }
}

function stand(frageId: string, faelligAm: string, box: 1 | 2 | 3 | 4 | 5 = 2): Fortschritt {
  return {
    frageId,
    thema: frageId.split('-')[0],
    box,
    faelligAm,
    richtigGesamt: 1,
    falschGesamt: 0,
    zuletztGesehen: '2026-09-20',
  }
}

const HEUTE = '2026-09-27'

describe('stelleSessionZusammen', () => {
  it('nimmt neue Fragen themenweise abwechselnd auf', () => {
    const fragen = [
      frage('a-001', 'a'),
      frage('a-002', 'a'),
      frage('b-001', 'b'),
      frage('b-002', 'b'),
    ]
    const session = stelleSessionZusammen(fragen, new Map(), HEUTE)
    expect(session.map((f) => f.id)).toEqual(['a-001', 'b-001', 'a-002', 'b-002'])
  })

  it('stellt faellige Fragen vor neue, aelteste Faelligkeit zuerst', () => {
    const fragen = [frage('a-001', 'a'), frage('a-002', 'a'), frage('a-003', 'a')]
    const fortschritt = new Map([
      ['a-002', stand('a-002', '2026-09-27')],
      ['a-003', stand('a-003', '2026-09-20')],
    ])
    const session = stelleSessionZusammen(fragen, fortschritt, HEUTE)
    expect(session.map((f) => f.id)).toEqual(['a-003', 'a-002', 'a-001'])
  })

  it('schliesst Fragen aus, die erst in Zukunft faellig sind', () => {
    const fragen = [frage('a-001', 'a')]
    const fortschritt = new Map([['a-001', stand('a-001', '2026-09-28')]])
    expect(stelleSessionZusammen(fragen, fortschritt, HEUTE)).toEqual([])
  })

  it('begrenzt die Session auf das Maximum', () => {
    const fragen = Array.from({ length: 50 }, (_, i) =>
      frage(`a-${String(i + 1).padStart(3, '0')}`, 'a'),
    )
    expect(stelleSessionZusammen(fragen, new Map(), HEUTE)).toHaveLength(SESSION_MAX)
    expect(stelleSessionZusammen(fragen, new Map(), HEUTE, 5)).toHaveLength(5)
  })
})

describe('wendeAntwortAn', () => {
  const f = frage('a-001', 'a')

  it('neue Frage richtig: Box 2, faellig in 2 Tagen', () => {
    const neu = wendeAntwortAn(f, undefined, true, HEUTE)
    expect(neu.box).toBe(2)
    expect(neu.faelligAm).toBe('2026-09-29')
    expect(neu.richtigGesamt).toBe(1)
    expect(neu.falschGesamt).toBe(0)
    expect(neu.zuletztGesehen).toBe(HEUTE)
  })

  it('neue Frage falsch: Box 1, faellig morgen', () => {
    const neu = wendeAntwortAn(f, undefined, false, HEUTE)
    expect(neu.box).toBe(1)
    expect(neu.faelligAm).toBe('2026-09-28')
    expect(neu.falschGesamt).toBe(1)
  })

  it('falsch wirft aus jeder Box zurueck in Box 1', () => {
    const bisher = stand('a-001', HEUTE, 5)
    const neu = wendeAntwortAn(f, bisher, false, HEUTE)
    expect(neu.box).toBe(1)
    expect(neu.faelligAm).toBe('2026-09-28')
  })

  it('Box 5 bleibt bei richtig Box 5, faellig in 16 Tagen', () => {
    const bisher = stand('a-001', HEUTE, 5)
    const neu = wendeAntwortAn(f, bisher, true, HEUTE)
    expect(neu.box).toBe(5)
    expect(neu.faelligAm).toBe('2026-10-13')
    expect(neu.richtigGesamt).toBe(2)
  })
})
