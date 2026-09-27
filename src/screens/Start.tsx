import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db'
import { heuteISO } from '../lernen/faelligkeit'

export default function Start() {
  const faellig = useLiveQuery(
    () => db.fortschritt.where('faelligAm').belowOrEqual(heuteISO()).count(),
    [],
    0,
  )

  return (
    <div className="screen">
      <header className="kopf">
        <h1>Sternklar</h1>
        <p className="dim">Dein Nachthimmel, jeden Tag ein Stück klarer.</p>
      </header>

      <div className="kartenreihe">
        <div className="karte zahlkarte">
          <span className="grossezahl">{faellig}</span>
          <span className="dim">heute fällig</span>
        </div>
        <div className="karte zahlkarte">
          <span className="grossezahl">0</span>
          <span className="dim">Tage Streak</span>
        </div>
      </div>

      <Link to="/quiz" className="knopf primaer">
        Session starten
      </Link>

      <div className="karte hinweis">
        <p className="dim">
          120 Fragen in sechs Themen sind bereit. Die Session-Logik folgt in
          Phase 2 — danach zählt hier deine tägliche Session mit maximal 20
          fälligen Fragen.
        </p>
      </div>
    </div>
  )
}
