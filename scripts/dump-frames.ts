// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 spinner-skins contributors
//
// Prints one frame of every skin as JSON, drawn by the real hooks/skins.ts.
// Used by render_assets.py. Run: bun scripts/dump-frames.ts > frames.json
import { SKINS, draw } from '../hooks/skins'

const WIDTH = 46
const ROWS = 4
const T = 140
const LEVEL = 0.6

const out: Record<string, unknown> = {}
for (const [name, skin] of Object.entries(SKINS)) {
  out[name] = {
    verb: skin.verb,
    rows: draw(skin, 'dark', T, WIDTH, ROWS, LEVEL),
    icon: draw(skin, 'dark', 25, 10, 10, 0.8),
  }
}
console.log(JSON.stringify(out))
