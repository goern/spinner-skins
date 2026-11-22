// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 spinner-skins contributors

import { expect, test } from 'claude-code/testing'

import { SKINS, draw } from './skins'

const SPINNER = {
  plugin: 'spinner-skins',
  component: 'Spinner',
  props: { word: 'Sauteing', message: null, suffix: '...', mode: 'thinking' },
} as const

test('the spinner draws the pool and the info column, on the terminal', async ($, on) => {
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })

  expect(await ui.find({ type: 'Text', text: /thinking/ })).toBeTruthy()
  expect(await ui.find({ type: 'Text', text: /ctx\s+\?/ })).toBeTruthy()
  await ui.unmount()
})

test('the end-of-turn line takes the skin verb', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>{(e.props as { word: string }).word}</Text>
  })

  const ui = await $.ui.mount({
    plugin: 'spinner-skins',
    component: 'TurnDuration',
    surface: 'terminal',
    props: { word: 'Baked', durationMs: 3000 },
  })

  expect((await ui.find({ type: 'Text' }))?.text).toBe('Smelted')
  await ui.unmount()
})

test('calm moves at the same pace at any frame rate', async () => {
  // The same wall-clock second draws the same picture whatever the frame counter says.
  const at = (frame: number) => JSON.stringify(draw(SKINS.calm, 'dark', frame, 40, 4, 0.5, true, 5))
  expect(at(60)).toBe(at(150))
})
