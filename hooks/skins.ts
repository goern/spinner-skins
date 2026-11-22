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
  palette: string[]
}

export type Skin = {
  // Past-tense word for the end-of-turn line ("Smelted for 3s").
  verb: string
  palettes: { light: string[]; dark: string[] }
  cell: (c: Ctx) => Cell | null
}

const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n))

const hash = (a: number, b: number): number => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}

// How many rows of the pool are filled: a little at rest, all when the
// context window is full.
const depth = (level: number, rows: number): number =>
  0.6 + clamp(level, 0, 1) * (rows - 0.6)

const lava: Skin = {
  verb: 'Smelted',
  palettes: {
    // dark red .. yellow, then white-hot
    light: ['#8a1c00', '#c9380a', '#f2641a', '#ffa21f', '#ffd84a', '#fff3b0'],
    dark: ['#8a1c00', '#c9380a', '#f2641a', '#ffa21f', '#ffd84a', '#fff3b0'],
  },
  cell: ({ x, y, t, rows, level, palette }) => {
    const wobble = 0.5 * Math.sin(x * 0.8 + t * 0.12) * Math.cos(x * 0.3 - t * 0.05)
    const top = rows - depth(level, rows) + wobble
    if (y + 0.5 < top) return null
    const v = Math.sin(x * 1.3 + y * 2.1 + t * 0.09) + Math.sin(x * 0.7 - t * 0.06 + y * 1.7)
    let i = Math.floor(((v + 2) / 4) * (palette.length - 2))
    if (y + 0.5 < top + 1) i += 1
    if (level > 0.85) i += 1
    return { ch: '█', color: palette[clamp(i, 0, palette.length - 1)] }
  },
}

const ocean: Skin = {
  verb: 'Sailed',
  palettes: {
    light: ['#0b6fa4', '#0a5a8a', '#084a73', '#06395a'],
    dark: ['#7fd0f5', '#4fb3e8', '#2b8fcc', '#1b6ba3'],
  },
  cell: ({ x, y, t, rows, level, palette }) => {
    const top = rows - depth(level, rows) + 0.7 * Math.sin(x * 0.5 + t * 0.15)
    if (y + 0.5 < top) return null
    const d = Math.floor(y + 0.5 - top)
    return {
      ch: d <= 0 ? '~' : d === 1 ? '▒' : d === 2 ? '▓' : '█',
      color: palette[clamp(d, 0, palette.length - 1)],
    }
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
// window only makes the water a little deeper.
const calm: Skin = {
  verb: 'Settled',
  palettes: {
    light: ['#cfe3dc', '#a8cfc4', '#86b8b0', '#6aa0a3'],
    dark: ['#3a5a5a', '#4f7a7a', '#6a9a98', '#8dbbb4'],
  },
  cell: ({ x, y, t, rows, level, palette }) => {
    const breath = 0.3 * Math.sin(t * 0.03)
    const swell = 0.6 * Math.sin(x * 0.15 + t * 0.02) + 0.3 * Math.sin(x * 0.07 - t * 0.013)
    const top = rows - depth(level, rows) - breath + swell
    if (y + 0.5 < top) return null
    const d = clamp(Math.floor(y + 0.5 - top), 0, palette.length - 1)
    return { ch: d === 0 ? '\u2591' : '\u2592', color: palette[d] }
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
): Run[][] => {
  const palette = skin.palettes[appearance]
  const out: Run[][] = []
  for (let y = 0; y < rows; y++) {
    const runs: Run[] = []
    for (let x = 0; x < width; x++) {
      const cell = skin.cell({ x, y, t, width, rows, level, palette })
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
