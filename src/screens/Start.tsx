import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db'
import { ALLE_FRAGEN } from '../inhalt/laden'
import { stelleSessionZusammen } from '../lernen/session'

export default function Start() {
  const sessionGroesse = useLiveQuery(
    async () => {
      const eintraege = await db.fortschritt.toArray()
      const karte = new Map(eintraege.map((e) => [e.frageId, e]))
      return stelleSessionZusammen(ALLE_FRAGEN, karte).length
    },
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
          <span className="grossezahl">{sessionGroesse}</span>
          <span className="dim">heute fällig</span>
        </div>
        <div className="karte zahlkarte">
          <span className="grossezahl">0</span>
          <span className="dim">Tage Streak</span>
        </div>
      </div>

      {sessionGroesse > 0 ? (
        <Link to="/quiz" className="knopf primaer">
          Session starten
        </Link>
      ) : (
        <div className="karte hinweis">
          <p>Für heute alles erledigt.</p>
          <p className="dim">Morgen warten die nächsten Wiederholungen auf dich.</p>
        </div>
      )}

      <p className="dim klein zentriert">
        Fällige Wiederholungen zuerst, dann Neues — maximal 20 Fragen pro Session.
      </p>
    </div>
  )
}
