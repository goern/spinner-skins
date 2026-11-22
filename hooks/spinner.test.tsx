import { expect, test } from 'claude-code/testing'

const SPINNER = {
  plugin: 'spinner-skins',
  component: 'Spinner',
  props: { word: 'Sauteing', message: null, suffix: '...', mode: 'thinking' },
} as const

test('the spinner draws the pool and the info column, on the terminal', async ($, on) => {
  const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal' })

  expect(await ui.find({ type: 'Text', text: /thinking/ })).toBeTruthy()
  expect(await ui.find({ type: 'Text', text: /ctx \?/ })).toBeTruthy()
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
