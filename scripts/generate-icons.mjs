// Generiert die App-Icons (Sternenhimmel mit grossem vierstrahligem Stern)
// als PNG — ohne Abhängigkeiten, direkt über das PNG-Format plus zlib.
// Aufruf: node scripts/generate-icons.mjs

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const zielordner = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

// ---- Mini-PNG-Encoder (RGBA, 8 Bit) ----

const crcTabelle = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(daten) {
  let c = 0xffffffff
  for (const byte of daten) c = crcTabelle[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(typ, daten) {
  const laenge = Buffer.alloc(4)
  laenge.writeUInt32BE(daten.length)
  const typPuffer = Buffer.from(typ, 'ascii')
  const pruefsumme = Buffer.alloc(4)
  pruefsumme.writeUInt32BE(crc32(Buffer.concat([typPuffer, daten])))
  return Buffer.concat([laenge, typPuffer, daten, pruefsumme])
}

function pngSchreiben(pfad, groesse, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(groesse, 0)
  ihdr.writeUInt32BE(groesse, 4)
  ihdr[8] = 8 // Bittiefe
  ihdr[9] = 6 // Farbtyp RGBA
  // Scanlines: je ein Filterbyte (0) vor jeder Zeile
  const zeilenBreite = groesse * 4
  const roh = Buffer.alloc((zeilenBreite + 1) * groesse)
  for (let y = 0; y < groesse; y++) {
    roh[y * (zeilenBreite + 1)] = 0
    rgba.copy(roh, y * (zeilenBreite + 1) + 1, y * zeilenBreite, (y + 1) * zeilenBreite)
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(roh, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(pfad, png)
  console.log(`geschrieben: ${pfad} (${groesse}x${groesse}, ${png.length} Bytes)`)
}

// ---- Zeichnen ----

// Deterministischer Zufall, damit die Icons reproduzierbar sind
function mulberry32(saat) {
  return function () {
    saat = (saat + 0x6d2b79f5) | 0
    let t = Math.imul(saat ^ (saat >>> 15), 1 | saat)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function begrenze(wert, min, max) {
  return Math.min(max, Math.max(min, wert))
}

// Mischt eine Farbe mit Deckkraft a auf einen opaken Hintergrund
function mische(px, i, r, g, b, a) {
  px[i] = Math.round(px[i] * (1 - a) + r * a)
  px[i + 1] = Math.round(px[i + 1] * (1 - a) + g * a)
  px[i + 2] = Math.round(px[i + 2] * (1 - a) + b * a)
}

function zeichneIcon(groesse, sicherheitsrand = 0) {
  const px = Buffer.alloc(groesse * groesse * 4)

  // Hintergrund: vertikaler Verlauf von tiefem Blau nach fast Schwarz
  for (let y = 0; y < groesse; y++) {
    const t = y / (groesse - 1)
    const r = Math.round(0x12 + (0x05 - 0x12) * t)
    const g = Math.round(0x17 + (0x07 - 0x17) * t)
    const b = Math.round(0x33 + (0x10 - 0x33) * t)
    for (let x = 0; x < groesse; x++) {
      const i = (y * groesse + x) * 4
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
      px[i + 3] = 255
    }
  }

  const innen = groesse - 2 * sicherheitsrand
  const massstab = innen / 512

  // Kleine Sterne, verteilt ueber die sichere Zone
  const zufall = mulberry32(20260927)
  for (let n = 0; n < 70; n++) {
    const sx = sicherheitsrand + zufall() * innen
    const sy = sicherheitsrand + zufall() * innen
    const radius = (0.9 + zufall() * 2.2) * massstab
    const helligkeit = 0.35 + zufall() * 0.65
    const rand = Math.ceil(radius) + 1
    for (let dy = -rand; dy <= rand; dy++) {
      for (let dx = -rand; dx <= rand; dx++) {
        const x = Math.round(sx + dx)
        const y = Math.round(sy + dy)
        if (x < 0 || y < 0 || x >= groesse || y >= groesse) continue
        const abstand = Math.hypot(dx, dy)
        const a = begrenze(1 - abstand / radius, 0, 1) ** 2 * helligkeit
        if (a > 0.01) mische(px, (y * groesse + x) * 4, 223, 232, 255, a)
      }
    }
  }

  // Grosser vierstrahliger Stern, leicht oberhalb der Mitte
  const cx = groesse / 2
  const cy = sicherheitsrand + innen * 0.44
  const strahl = innen * 0.3
  const dicke = strahl * 0.12
  const kern = strahl * 0.18
  const bereich = Math.ceil(strahl) + 2
  for (let dy = -bereich; dy <= bereich; dy++) {
    for (let dx = -bereich; dx <= bereich; dx++) {
      const x = Math.round(cx + dx)
      const y = Math.round(cy + dy)
      if (x < 0 || y < 0 || x >= groesse || y >= groesse) continue
      const horizontal =
        begrenze(1 - Math.abs(dx) / strahl, 0, 1) ** 3 *
        begrenze(1 - Math.abs(dy) / dicke, 0, 1)
      const vertikal =
        begrenze(1 - Math.abs(dy) / strahl, 0, 1) ** 3 *
        begrenze(1 - Math.abs(dx) / dicke, 0, 1)
      const glut = Math.exp(-(dx * dx + dy * dy) / (2 * kern * kern))
      const a = begrenze(horizontal + vertikal + glut, 0, 1)
      if (a > 0.01) mische(px, (y * groesse + x) * 4, 231, 238, 255, a)
    }
  }

  return px
}

mkdirSync(zielordner, { recursive: true })
pngSchreiben(join(zielordner, 'icon-512.png'), 512, zeichneIcon(512))
pngSchreiben(join(zielordner, 'icon-192.png'), 192, zeichneIcon(192))
// Maskable: Inhalt bleibt in der inneren sicheren Zone (80 %)
pngSchreiben(join(zielordner, 'icon-maskable-512.png'), 512, zeichneIcon(512, 51))
pngSchreiben(join(zielordner, 'apple-touch-icon.png'), 180, zeichneIcon(180))
