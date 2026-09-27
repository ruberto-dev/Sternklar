import { Link } from 'react-router-dom'

export default function Quiz() {
  return (
    <div className="screen">
      <header className="kopf">
        <h1>Session</h1>
      </header>

      <div className="karte hinweis">
        <p>Noch keine Fragen vorhanden.</p>
        <p className="dim">
          Die Inhalte entstehen in Phase 1, die Quiz-Logik in Phase 2. Danach
          läuft hier deine tägliche Session.
        </p>
      </div>

      <Link to="/" className="knopf">
        Zurück zum Start
      </Link>
    </div>
  )
}
