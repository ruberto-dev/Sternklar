// Die sechs Themen. Die IDs entsprechen den Dateinamen in content/.
export interface ThemaInfo {
  id: string
  name: string
  beschreibung: string
}

export function themaName(id: string): string {
  return THEMEN.find((thema) => thema.id === id)?.name ?? id
}

export const THEMEN: ThemaInfo[] = [
  {
    id: 'sonnensystem',
    name: 'Sonnensystem',
    beschreibung: 'Sonne, Planeten, Monde und Kleinkörper',
  },
  {
    id: 'sterne',
    name: 'Sterne & Sternentwicklung',
    beschreibung: 'Vom Nebel zum Riesenstern, Zwerg oder Schwarzen Loch',
  },
  {
    id: 'sternbilder',
    name: 'Sternbilder & Orientierung',
    beschreibung: 'Sich am Nachthimmel zurechtfinden',
  },
  {
    id: 'galaxien-kosmologie',
    name: 'Galaxien & Kosmologie',
    beschreibung: 'Milchstrasse, ferne Galaxien und das Universum als Ganzes',
  },
  {
    id: 'beobachtung',
    name: 'Beobachtungspraxis',
    beschreibung: 'Feldstecher, Teleskop, Bedingungen und Technik',
  },
  {
    id: 'geschichte-mythologie',
    name: 'Geschichte & Mythologie',
    beschreibung: 'Wie Menschen den Himmel gedeutet und erforscht haben',
  },
]
