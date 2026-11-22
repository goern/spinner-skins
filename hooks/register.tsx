import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { View } from '../types'
import { SKINS, draw } from './skins'

const ROWS = 4
const GAP = 2
const MIN_LAVA = 16
const MARGIN = 2
const MIN_INFO = 14

const view = atom(
  { plugin: 'spinner-skins', key: 'view' } as const,
  { frame: 0, now: 0, startedAt: 0, percent: -1, usd: -1 } satisfies View,
)

const fit = (text: string, width: number): string =>
  text.length <= width ? text : text.slice(0, Math.max(0, width - 1)) + '~'

const clock = (seconds: number): string =>
  seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`

const num = (value: unknown, fallback: number, lo: number, hi: number): number => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback
}

export const register: Register = (on, options) => {
  const opts = (options ?? {}) as Record<string, unknown>
  const skin = SKINS[String(opts.skin ?? 'lava')] ?? SKINS.lava
  const appearance = opts.appearance === 'dark' ? 'dark' : 'light'
  const widthPercent = num(opts.widthPercent, 100, 10, 100)
  const infoPercent = num(opts.infoPercent, 60, 20, 80)
  const isStill = opts.reducedMotion === true
  const showInfo = opts.showInfo !== false
  const tickMs = isStill ? 1000 : Math.round(1000 / num(opts.fps, 12, 1, 30))
  const pollEvery = Math.max(1, Math.round(1000 / tickMs))

  let timer: { cancel: () => void } | null = null
  let isBusy = false
  let ticks = 0
  let tools = 0
  let last = ''
  const counts: Record<string, number> = {}

  on('turn.start', async ($, e, next) => {
    // Subagents run their own turns; only the main loop owns the spinner.
    if (e.agentId !== undefined) return next(e)

    const now = await $.clock.now()
    tools = 0
    last = ''
    for (const k of Object.keys(counts)) delete counts[k]
    await update($, view, v => ({ ...v, startedAt: now, now }))

    if (!timer) {
      timer = $.clock.every(tickMs, async () => {
        if (isBusy) return
        isBusy = true
        try {
          ticks += 1
          const now = await $.clock.now()
          let percent: number | undefined
          let usd: number | undefined
          if (ticks % pollEvery === 1) {
            const usage = await $.session.usage()
            percent = usage.context.percent ?? -1
            usd = usage.cost?.usd ?? -1
          }
          await update($, view, v => ({
            ...v,
            frame: (v.frame + 1) % 1000000,
            now,
            percent: percent ?? v.percent,
            usd: usd ?? v.usd,
          }))
        } finally {
          isBusy = false
        }
      })
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)

    timer?.cancel()
    timer = null
    ticks = 0
    await update($, view, v => ({ ...v, startedAt: 0 }))
    return next(e)
  })

  on('tool.call', ($, e, next) => {
    if (e.agentId !== undefined) return next(e)

    tools += 1
    counts[e.tool] = (counts[e.tool] ?? 0) + 1
    const args = e as unknown as Record<string, unknown>
    const detail = [args.command, args.file_path, args.pattern, args.url, args.description].find(
      v => typeof v === 'string',
    )
    last = `${e.tool}${detail ? ' ' + String(detail).replace(/\s+/g, ' ') : ''}`
    return next(e)
  })

  on('ui.render', { component: 'Spinner' }, async ($, e) => {
    const v = await read($, view)
    const { Box, Text } = $.ui.resolve(e)
    const columns = e.viewport?.columns ?? 100

    // The whole row (pool + info) spans widthPercent of the terminal.
    const total = Math.max(MIN_LAVA, Math.floor(((columns - MARGIN) * widthPercent) / 100))
    const infoWidth = Math.floor((total * infoPercent) / 100) - GAP
    const hasInfo = showInfo && infoWidth >= MIN_INFO
    const lavaWidth = hasInfo ? total - infoWidth - GAP : total
    // The tool line may run on to the screen edge; the other lines stay in the column.
    const edgeWidth = columns - MARGIN - lavaWidth - GAP

    const t = isStill ? 0 : v.frame
    const level = v.percent < 0 ? 0 : v.percent / 100
    const rows = draw(skin, appearance, t, lavaWidth, ROWS, level)

    const seconds = v.startedAt ? Math.max(0, Math.floor((v.now - v.startedAt) / 1000)) : 0
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, c]) => `${name}x${c}`)
      .join(' ')
    const info = [
      `${e.props.mode} | ${clock(seconds)}`,
      `ctx ${v.percent < 0 ? '?' : v.percent + '%'} | ${v.usd < 0 ? '$?' : '$' + v.usd.toFixed(2)}`,
      `tools ${tools}${top ? ' | ' + top : ''}`,
      last ? `> ${last}` : '',
    ]

    return (
      <Box flexDirection="row">
        <Box flexDirection="column">
          {rows.map((runs, y) => (
            <Box key={`l${y}`} flexDirection="row">
              {runs.map((run, i) => (
                <Text key={`r${i}`} color={run.color}>
                  {run.text}
                </Text>
              ))}
            </Box>
          ))}
        </Box>
        {hasInfo && (
          <Box flexDirection="column">
            {info.map((line, i) => (
              <Text key={`i${i}`} dimColor>
                {' '.repeat(GAP) + fit(line, i === 3 ? edgeWidth : infoWidth)}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    )
  })

  // The end-of-turn line says "Smelted for 3s" instead of "Baked for 3s".
  on('ui.render', { component: 'TurnDuration' }, ($, e, next) =>
    next({ ...e, props: { ...e.props, word: skin.verb } }),
  )
}
