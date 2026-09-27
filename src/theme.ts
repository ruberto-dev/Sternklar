// Theme-Verwaltung: dunkles Standard-Theme und Rotlicht-Modus.
// Der Entscheid liegt bewusst in localStorage (nicht IndexedDB), damit er
// beim App-Start synchron vor dem ersten Rendern greift (siehe index.html).

export type Theme = 'dunkel' | 'rot'

const SCHLUESSEL = 'sternklar-theme'

export function aktuellesTheme(): Theme {
  return document.documentElement.dataset.theme === 'rot' ? 'rot' : 'dunkel'
}

export function setzeTheme(theme: Theme): void {
  if (theme === 'rot') {
    document.documentElement.dataset.theme = 'rot'
  } else {
    delete document.documentElement.dataset.theme
  }
  try {
    localStorage.setItem(SCHLUESSEL, theme)
  } catch {
    // localStorage nicht verfuegbar — Theme gilt dann nur fuer diese Sitzung
  }
}
