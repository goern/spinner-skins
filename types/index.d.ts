// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 spinner-skins contributors

export type View = {
  // Animation frame, bumped by the timer.
  frame: number
  // Wall clock at the last tick, in ms.
  now: number
  // When the running turn began, in ms; 0 between turns.
  startedAt: number
  // Context-window fill, whole percent; -1 until known.
  percent: number
  // Session cost so far, USD; -1 until known.
  usd: number
}

declare module 'claude-code' {
  interface PluginState {
    'spinner-skins': { view: View }
  }
}
