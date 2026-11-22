// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 spinner-skins contributors

// Pure drawing code: no `$`, no state. A skin turns (x, y, time, fill level)
// into one coloured cell; register.tsx merges the cells into rows.

export type Cell = { ch: string; color: string }

export type Ctx = {
  x: number
  y: number
  // Animation time in frames.
  t: number
  width: number
  rows: number
  // Context-window fill, 0 to 1.
  level: number
  // The skin's colours. With `shades` set, a ramp of that many steps built
  // from the palette's stops; otherwise the stops themselves.
  palette: string[]
  // Ordered dithering between neighbouring shades.
  dither: boolean
}

export type Skin = {
  // Past-tense word for the end-of-turn line ("Smelted for 3s").
  verb: string
  // Colour stops. A skin with `shades` blends them into a smooth ramp.
  palettes: { light: string[]; dark: string[] }
  shades?: number
  cell: (c: Ctx) => Cell | null
}

const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n))

const hash = (a: number, b: number): number => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}

const toRgb = (hex: string): number[] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))

const toHex = (rgb: number[]): string =>
  '#' + rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('')

// `n` evenly spaced colours blended through the stops, in order.
export const ramp = (stops: string[], n: number): string[] => {
  const rgb = stops.map(toRgb)
  return Array.from({ length: n }, (_, i) => {
    const f = (i / (n - 1)) * (rgb.length - 1)
    const a = Math.min(Math.floor(f), rgb.length - 2)
    const k = f - a
    return toHex(rgb[a].map((c, j) => c + (rgb[a + 1][j] - c) * k))
  })
}

// 4x4 ordered-dither thresholds, 0 to 1.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const threshold = (x: number, y: number): number => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16

// The shade for a value from 0 to 1 along a ramp. With dithering, a value
// between two shades picks one or the other by position, so a gradient reads
// as many more tones than the ramp holds.
const shade = (palette: string[], v: number, x: number, y: number, dither: boolean): string => {
  const f = clamp(v, 0, 1) * (palette.length - 1)
  const base = Math.floor(f)
  const i = dither ? base + (f - base > threshold(x, y) ? 1 : 0) : Math.round(f)
  return palette[clamp(i, 0, palette.length - 1)]
}

// How many rows of the pool are filled: a little at rest, all when the
// context window is full.
const depth = (level: number, rows: number): number =>
  0.6 + clamp(level, 0, 1) * (rows - 0.6)

const EIGHTHS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']

type Water = { ch: string; below: number }

// One cell of a body of water whose surface sits `top` rows below the grid's
// top edge. The surface cell is filled to its exact height with an eighth
// block, so the surface slides smoothly between rows instead of jumping a
// whole row at a time. `below` is how far under the surface the cell lies, in
// rows; 0 for the surface cell.
const water = (top: number, y: number): Water | null => {
  const covered = y + 1 - top
  if (covered <= 0.06) return null
  if (covered < 1) {
    return { ch: EIGHTHS[clamp(Math.round(covered * 8), 1, 8) - 1], below: 0 }
  }
  return { ch: '█', below: y - top }
}

const lava: Skin = {
  verb: 'Smelted',
  palettes: {
    // black-red crust, red, orange, amber, yellow, white-hot
    light: ['#2a0500', '#8a1c00', '#c9380a', '#f2641a', '#ffa21f', '#ffd84a', '#fff3b0'],
    dark: ['#2a0500', '#8a1c00', '#c9380a', '#f2641a', '#ffa21f', '#ffd84a', '#fff3b0'],
  },
  shades: 12,
  cell: ({ x, y, t, rows, level, palette, dither }) => {
    const wobble = 0.5 * Math.sin(x * 0.8 + t * 0.12) * Math.cos(x * 0.3 - t * 0.05)
    const top = rows - depth(level, rows) + wobble
    if (y + 0.5 < top) return null
    // Drifting heat noise, a cooler crust at the surface, rare bubbles of
    // brighter lava, and a little extra glow when the context is nearly full.
    const noise = Math.sin(x * 1.3 + y * 2.1 + t * 0.09) + Math.sin(x * 0.7 - t * 0.06 + y * 1.7)
    let v = 0.52 + 0.14 * noise
    const sinceSurface = y + 0.5 - top
    if (sinceSurface < 1) v -= 0.18 * (1 - sinceSurface)
    if (hash(x, y + Math.floor(t / 40)) > 0.965) v += 0.3
    if (level > 0.85) v += 0.1
    return { ch: '█', color: shade(palette, v, x, y, dither) }
  },
}

const ocean: Skin = {
  verb: 'Sailed',
  palettes: {
    // foam, shallows, open water, deep
    light: ['#5fb4e0', '#2b8fcc', '#0b6fa4', '#084a73', '#052f4d'],
    dark: ['#e8f8ff', '#9fdcfa', '#4fb3e8', '#2b8fcc', '#1b6ba3', '#103f6b'],
  },
  shades: 10,
  cell: ({ x, y, t, rows, level, palette, dither }) => {
    const base = rows - depth(level, rows)
    // Three swells of different length and speed, so the surface never
    // repeats exactly.
    const surface = (xx: number): number =>
      base +
      0.5 * Math.sin(xx * 0.5 + t * 0.15) +
      0.25 * Math.sin(xx * 1.1 - t * 0.23) +
      0.15 * Math.sin(xx * 0.23 + t * 0.07)
    const top = surface(x)
    const w = water(top, y)
    if (!w) return null

    if (w.below === 0) {
      // Foam on steep faces, an occasional glint, a paler skin elsewhere.
      const steep = Math.abs(surface(x + 1) - surface(x - 1)) > 0.5
      const glint = hash(x + Math.floor(t / 5), 9) > 0.985
      const v = glint || steep ? 0 : 0.12
      return { ch: w.ch, color: shade(palette, v, x, y, dither) }
    }
    // Darker with depth, with slow caustic ripples.
    const caustic = 0.06 * Math.sin(x * 0.9 + y * 1.3 + t * 0.05)
    const v = 0.22 + 0.7 * clamp(w.below / rows, 0, 1) + caustic
    return { ch: w.ch, color: shade(palette, v, x, y, dither) }
  },
}

const GLYPHS = '01$#@%&*+=<>'

const matrix: Skin = {
  verb: 'Decoded',
  palettes: {
    light: ['#0b5d1e', '#117a2a', '#1a9a3a', '#0a3d14'],
    dark: ['#0f6b2a', '#1fa64a', '#4cdb73', '#d9ffe3'],
  },
  cell: ({ x, y, t, rows, level, palette }) => {
    // Sparse rain at rest, a downpour when the context is nearly full.
    if (hash(x, 1) > 0.25 + 0.75 * clamp(level, 0, 1)) return null
    const speed = 0.05 + hash(x, 2) * 0.1
    const cycle = rows + 5
    const head = (t * speed + hash(x, 3) * cycle) % cycle
    const behind = head - y
    if (behind < 0 || behind > 3.5) return null
    const ch = GLYPHS[Math.floor(hash(x + y, Math.floor(t / 4)) * GLYPHS.length)]
    const i = behind < 1 ? 3 : behind < 2 ? 1 : behind < 3 ? 0 : 0
    return { ch, color: palette[i] }
  },
}

const aurora: Skin = {
  verb: 'Glowed',
  palettes: {
    light: ['#0b8f6a', '#17a98a', '#3b7fd0', '#6f4bc8', '#9b3fb0'],
    dark: ['#3dffb0', '#2fe0c8', '#5aa8ff', '#9a7bff', '#d46bff'],
  },
  cell: ({ x, y, t, rows, level, palette }) => {
    const reach = 1 + clamp(level, 0, 1) * (rows - 1)
    if (y + 0.5 < rows - reach) return null
    const v = Math.sin(x * 0.22 + t * 0.05 + y * 0.9) + Math.sin(x * 0.11 - t * 0.03)
    const i = clamp(Math.floor(((v + 2) / 4) * palette.length), 0, palette.length - 1)
    const shade = clamp(Math.floor(((v + 2) / 4) * 4), 0, 3)
    return { ch: ['░', '▒', '▓', '█'][shade], color: palette[i] }
  },
}

// Nostromo: an amber phosphor motion tracker. A scan line sweeps across, a
// faded trail glows behind it, and contacts light up as it passes. More
// context used means more contacts on the scope.
const nostromo: Skin = {
  verb: 'Tracked',
  palettes: {
    // faint grid, trail, bright trail, contact
    light: ['#c2a56a', '#a67c00', '#7a5200', '#c43c00'],
    dark: ['#4a3200', '#a36a00', '#ffb000', '#ffe9a8'],
  },
  cell: ({ x, y, t, width, level, palette }) => {
    const scan = (t * 0.45) % width
    const behind = (scan - x + width) % width
    const contactOdds = 0.012 + 0.07 * clamp(level, 0, 1)
    const isContact = hash(x, y + Math.floor(t / 90) * 7) < contactOdds

    if (behind < 1) return { ch: '|', color: palette[2] }
    if (isContact && behind < 22) {
      return { ch: behind < 8 ? 'O' : 'o', color: palette[3] }
    }
    if (behind < 10) {
      return { ch: behind < 4 ? ':' : '.', color: palette[behind < 5 ? 2 : 1] }
    }
    if (x % 4 === 0 && y % 2 === 0) return { ch: '.', color: palette[0] }
    return null
  },
}

// Calm: made to be easy on busy or sensitive attention. Everything is slow
// (a drift takes about 25 seconds, a breath about 17), low contrast, one hue
// family, no flicker, no sudden change and no alarm colours: a full context
// window only makes the water a little deeper. Twelve close shades make the
// depth gradient smooth; dithering only ever swaps neighbouring shades, which
// differ very little, so it adds texture without visible flicker. A paler
// swell sits behind the front one for a sense of distance.
const calm: Skin = {
  verb: 'Settled',
  palettes: {
    // lit surface .. deep water
    light: ['#d6ebe3', '#a8cfc4', '#7fb0aa', '#5d9097'],
    dark: ['#7fb0aa', '#5f8f8c', '#436b6d', '#2b4a4d'],
  },
  shades: 12,
  cell: ({ x, y, t, rows, level, palette, dither }) => {
    const breath = 0.3 * Math.sin(t * 0.03)
    const base = rows - depth(level, rows) - breath
    const front = water(base + 0.6 * Math.sin(x * 0.15 + t * 0.02) + 0.3 * Math.sin(x * 0.07 - t * 0.013), y)
    const back = water(base - 0.3 + 0.3 * Math.sin(x * 0.09 - t * 0.012 + 1.3), y)

    // The back swell shows wherever the front one does not fully cover.
    const showBack = back !== null && (front === null || (front.below === 0 && back.below > 0))
    if (showBack) {
      return { ch: back.ch, color: shade(palette, 0.38, x, y, dither) }
    }
    if (!front) return null
    const v = front.below === 0 ? 0 : 0.12 + 0.78 * clamp(front.below / rows, 0, 1)
    return { ch: front.ch, color: shade(palette, v, x, y, dither) }
  },
}

export const SKINS: Record<string, Skin> = { lava, ocean, matrix, aurora, nostromo, calm }

export type Run = { text: string; color: string }

// Draws the whole pool as rows of colour runs. A blank joins the run before
// it, so a row costs one Text per colour change, not one per cell.
export const draw = (
  skin: Skin,
  appearance: 'light' | 'dark',
  t: number,
  width: number,
  rows: number,
  level: number,
  dither = true,
): Run[][] => {
  const stops = skin.palettes[appearance]
  const palette = skin.shades ? ramp(stops, skin.shades) : stops
  const out: Run[][] = []
  for (let y = 0; y < rows; y++) {
    const runs: Run[] = []
    for (let x = 0; x < width; x++) {
      const cell = skin.cell({ x, y, t, width, rows, level, palette, dither })
      const prev = runs[runs.length - 1]
      if (!cell) {
        if (prev) prev.text += ' '
        else runs.push({ text: ' ', color: palette[0] })
      } else if (prev && prev.color === cell.color) {
        prev.text += cell.ch
      } else {
        runs.push({ text: cell.ch, color: cell.color })
      }
    }
    out.push(runs)
  }
  return out
}
