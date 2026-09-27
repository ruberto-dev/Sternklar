import { useState } from 'react'
import { aktuellesTheme, setzeTheme } from '../theme'

export default function Einstellungen() {
  const [rotlicht, setRotlicht] = useState(aktuellesTheme() === 'rot')

  function umschalten() {
    const neu = !rotlicht
    setRotlicht(neu)
    setzeTheme(neu ? 'rot' : 'dunkel')
  }

  return (
    <div className="screen">
      <header className="kopf">
        <h1>Einstellungen</h1>
      </header>

      <div className="karte">
        <label className="zeile">
          <span>
            Rotlicht-Modus
            <span className="dim klein blockzeile">
              Nur Rottöne — erhält draussen die Dunkeladaption der Augen
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={rotlicht}
            className={`schalter${rotlicht ? ' an' : ''}`}
            onClick={umschalten}
          >
            <span className="schalterknopf" />
          </button>
        </label>
      </div>

      <div className="karte">
        <h2>Fortschritt</h2>
        <p className="dim klein">Export, Import und Zurücksetzen kommen in Phase 3.</p>
        <div className="knopfreihe">
          <button type="button" className="knopf" disabled>
            Exportieren
          </button>
          <button type="button" className="knopf" disabled>
            Importieren
          </button>
          <button type="button" className="knopf gefahr" disabled>
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  )
}
