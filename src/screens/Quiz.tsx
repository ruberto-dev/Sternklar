import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, type Fortschritt } from '../db'
import { ALLE_FRAGEN } from '../inhalt/laden'
import type { Frage } from '../inhalt/typen'
import { heuteISO } from '../lernen/faelligkeit'
import { stelleSessionZusammen, wendeAntwortAn } from '../lernen/session'
import { themaName } from '../themen'

type Phase = 'laden' | 'leer' | 'frage' | 'aufgeloest' | 'fertig'

export default function Quiz() {
  const [fragen, setFragen] = useState<Frage[]>([])
  const [fortschritt, setFortschritt] = useState<ReadonlyMap<string, Fortschritt>>(new Map())
  const [phase, setPhase] = useState<Phase>('laden')
  const [index, setIndex] = useState(0)
  const [wahl, setWahl] = useState<number | null>(null)
  const ergebnisse = useRef<boolean[]>([])
  const [gestartet] = useState(() => new Date().toISOString())

  useEffect(() => {
    let aktiv = true
    db.fortschritt.toArray().then((eintraege) => {
      if (!aktiv) return
      const karte = new Map(eintraege.map((e) => [e.frageId, e]))
      const session = stelleSessionZusammen(ALLE_FRAGEN, karte)
      setFortschritt(karte)
      setFragen(session)
      setPhase(session.length === 0 ? 'leer' : 'frage')
    })
    return () => {
      aktiv = false
    }
  }, [])

  const frage = fragen[index] as Frage | undefined

  async function verbuche(richtig: boolean) {
    if (!frage) return
    ergebnisse.current.push(richtig)
    const neu = wendeAntwortAn(frage, fortschritt.get(frage.id), richtig)
    setFortschritt((alt) => new Map(alt).set(neu.frageId, neu))
    await db.fortschritt.put(neu)
  }

  function beantworteAuswahl(gewaehlt: number) {
    if (phase !== 'frage' || !frage) return
    setWahl(gewaehlt)
    setPhase('aufgeloest')
    void verbuche(gewaehlt === frage.korrekt)
  }

  function selbstEinschaetzung(richtig: boolean) {
    void verbuche(richtig)
    weiter()
  }

  function weiter() {
    const naechster = index + 1
    if (naechster >= fragen.length) {
      void schliesseAb()
      setPhase('fertig')
    } else {
      setIndex(naechster)
      setWahl(null)
      setPhase('frage')
    }
  }

  async function schliesseAb() {
    const richtig = ergebnisse.current.filter(Boolean).length
    await db.sessions.add({
      datum: heuteISO(),
      gestartet,
      beendet: new Date().toISOString(),
      fragen: ergebnisse.current.length,
      richtig,
      falsch: ergebnisse.current.length - richtig,
    })
  }

  if (phase === 'laden') {
    return (
      <div className="screen">
        <p className="dim">Session wird vorbereitet …</p>
      </div>
    )
  }

  if (phase === 'leer') {
    return (
      <div className="screen">
        <header className="kopf">
          <h1>Session</h1>
        </header>
        <div className="karte hinweis">
          <p>Für heute ist nichts fällig.</p>
          <p className="dim">Komm morgen wieder — dann warten neue Wiederholungen.</p>
        </div>
        <Link to="/" className="knopf">
          Zurück zum Start
        </Link>
      </div>
    )
  }

  if (phase === 'fertig') {
    const richtig = ergebnisse.current.filter(Boolean).length
    const gesamt = ergebnisse.current.length
    const quote = gesamt > 0 ? Math.round((richtig / gesamt) * 100) : 0
    return (
      <div className="screen">
        <header className="kopf">
          <h1>Session abgeschlossen</h1>
          <p className="dim">Schön dran geblieben — bis morgen!</p>
        </header>
        <div className="kartenreihe">
          <div className="karte zahlkarte">
            <span className="grossezahl">{richtig}</span>
            <span className="dim">richtig</span>
          </div>
          <div className="karte zahlkarte">
            <span className="grossezahl">{gesamt - richtig}</span>
            <span className="dim">falsch</span>
          </div>
        </div>
        <div className="karte zahlkarte">
          <span className="grossezahl">{quote}%</span>
          <span className="dim">Trefferquote</span>
        </div>
        <Link to="/" className="knopf primaer">
          Zum Start
        </Link>
      </div>
    )
  }

  if (!frage) return null
  const aufgeloest = phase === 'aufgeloest'

  return (
    <div className="screen">
      <header className="quizkopf">
        <span className="dim klein">
          Frage {index + 1} von {fragen.length}
        </span>
        <div className="fortschrittsbalken" aria-hidden="true">
          <div
            className="fortschrittsfuellung"
            style={{ width: `${(index / fragen.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="karte">
        <span className="dim klein">
          {themaName(frage.thema)} · Stufe {frage.schwierigkeit}
        </span>
        <p className="fragetext">{frage.frage}</p>
      </div>

      {frage.typ === 'karteikarte' ? (
        aufgeloest ? (
          <>
            <div className="karte antwortkarte">
              <p>{frage.antworten[0]}</p>
            </div>
            <Erklaerung frage={frage} />
            <div className="knopfreihe">
              <button
                type="button"
                className="knopf falschknopf"
                onClick={() => selbstEinschaetzung(false)}
              >
                ✗ Nicht gewusst
              </button>
              <button
                type="button"
                className="knopf richtigknopf"
                onClick={() => selbstEinschaetzung(true)}
              >
                ✓ Gewusst
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="knopf primaer" onClick={() => setPhase('aufgeloest')}>
            Antwort aufdecken
          </button>
        )
      ) : (
        <>
          <div className="antwortliste">
            {frage.antworten.map((antwort, i) => {
              let klasse = 'antwort'
              if (aufgeloest) {
                if (i === frage.korrekt) klasse += ' richtig'
                else if (i === wahl) klasse += ' falsch'
                else klasse += ' inaktiv'
              }
              return (
                <button
                  key={antwort}
                  type="button"
                  disabled={aufgeloest}
                  className={klasse}
                  onClick={() => beantworteAuswahl(i)}
                >
                  <span>{antwort}</span>
                  {aufgeloest && i === frage.korrekt && <span className="antwortsymbol">✓</span>}
                  {aufgeloest && i === wahl && i !== frage.korrekt && (
                    <span className="antwortsymbol">✗</span>
                  )}
                </button>
              )
            })}
          </div>
          {aufgeloest && (
            <>
              <Erklaerung frage={frage} />
              <button type="button" className="knopf primaer" onClick={weiter}>
                Weiter
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}

function Erklaerung({ frage }: { frage: Frage }) {
  return (
    <div className="karte erklaerung">
      <p>{frage.erklaerung}</p>
      <p className="dim klein">Quelle: {frage.quelle}</p>
    </div>
  )
}
