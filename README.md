# spinner-skins

A Claude Code mod that replaces the spinner words ("Frolicking...", "Whatsbambocing...") with a live animated skin, and puts useful numbers next to it.

```
██▓███▓██▓█████   thinking | 12s
█████████▓██████  ctx 62% | $0.41
▓███▓███████████  tools 7 | Readx4 Bashx2
 ▓██████████▓███  > Bash npm test
```

The animation is not just decoration: **the pool fills as your context window fills.** Near-empty context gives a shallow, calm pool. Close to auto-compact it is full and white-hot. You can read context pressure from across the room.

## Skins

| Skin | Look |
| --- | --- |
| `lava` | Minecraft-style wobbling lava, dark red to yellow, white-hot when context is nearly full |
| `ocean` | Rolling waves, `~` crests over shaded depth |
| `matrix` | Falling glyph rain, a downpour as context fills |
| `aurora` | Drifting green-to-violet curtains |
| `nostromo` | Amber phosphor motion tracker: a scan line sweeps the scope, contacts ping as it passes, more of them as context fills |

The end-of-turn line follows the skin too: `Smelted for 3s`, `Sailed for 3s`, `Decoded for 3s`, `Glowed for 3s`, `Tracked for 3s`.

## Install

From GitHub (mirror):

```
/plugin install spinner-skins --marketplace goern/spinner-skins
```

Or straight from the primary repository:

```
/plugin install spinner-skins --marketplace https://git.b4mad.industries/goern/spinner-skins.git
```

Answer `y` to add the marketplace, then pick a scope. The mod is active at once, with no restart.

## Settings

Each option is a row in the plugin config menu. A change reloads the mod.

| Option | Default | What it does |
| --- | --- | --- |
| `skin` | `lava` | `lava`, `ocean`, `matrix`, `aurora` or `nostromo` |
| `appearance` | `light` | `light` or `dark`: picks the palette for your terminal background |
| `widthPercent` | `100` | How much of the terminal width the row (animation + info) spans, 10 to 100 |
| `infoPercent` | `60` | Share of the row the info column takes, 20 to 80; the animation gets the rest |
| `fps` | `12` | Frames per second, 1 to 30. Lower it over slow SSH |
| `showInfo` | `true` | Info column to the right of the animation |
| `reducedMotion` | `false` | Draw a still frame; only the info column updates, once a second |

The info column hides itself when the terminal is too narrow for it.

## What the info column shows

- the turn's mode (`thinking`, `tool-use`, `responding`) and elapsed time
- context-window fill and session cost, from `$.session.usage()`, polled about once a second
- tool call count with the three most used tools
- the last tool call, with its command, file path or pattern

Subagent turns are ignored: only the main loop drives the spinner and the counts.

## Limits

- Cost is an estimate, not your bill.
- It replaces the whole spinner line, so the engine's own token count and effort are not shown.
- The palette is picked by you (`appearance`). The mod API gives no theme detection.
- Terminal, desktop and VS Code surfaces only, where Claude Code raises the spinner.

## Layout

```
hooks/register.tsx   timer, usage polling, spinner and end-of-turn drawing
hooks/skins.ts       pure drawing code; add a skin by adding one object
types/index.d.ts     the mod's state contract
```

A skin is `{ verb, palettes: { light, dark }, cell(ctx) }`, where `cell` returns the character and colour for one position, or `null` for empty. Pull requests with new skins are welcome.

## License

MIT
