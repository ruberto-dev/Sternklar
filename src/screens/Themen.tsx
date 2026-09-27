import { fragenNachThema } from '../inhalt/laden'
import { THEMEN } from '../themen'

export default function Themen() {
  return (
    <div className="screen">
      <header className="kopf">
        <h1>Themen</h1>
      </header>

      <ul className="themenliste">
        {THEMEN.map((thema) => {
          const anzahl = fragenNachThema(thema.id).length
          return (
            <li key={thema.id} className="karte">
              <h2>{thema.name}</h2>
              <p className="dim">{thema.beschreibung}</p>
              <div className="fortschrittsbalken" aria-hidden="true">
                <div className="fortschrittsfuellung" style={{ width: '0%' }} />
              </div>
              <p className="dim klein">{anzahl} Fragen · noch keine gelernt</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
