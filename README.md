# spinner-skins

Claude Code mod. Replaces the spinner words ("Frolicking...") with an animated skin plus a dashboard. Written for agents to install, configure and extend; humans can read it too.

## Install and configure (one command)

```bash
claude plugin install spinner-skins \
  --marketplace https://git.b4mad.industries/goern/spinner-skins.git \
  --config skin=nostromo --config appearance=dark \
  --config widthPercent=100 --config infoPercent=60
```

- Adds the marketplace (user scope) if missing, installs the mod, stores the options.
- Drop any `--config` you don't need; unset options use the defaults below.
- Add `-s project` or `-s local` to change the scope (default `user`).
- `-y` is only needed for marketplace-declared commands, which this mod has none of.
- Other running sessions pick the mod up with `/reload-plugins`.
- Only the Forgejo URL above works. The GitHub mirror is not set up yet.

Change options later, without reinstalling:

```bash
claude plugin configure spinner-skins                      # show options, mark unset ones
echo '{"skin":"lava"}' | claude plugin configure spinner-skins --values-stdin
```

Options you leave out keep their values. Values are single-line strings, validated against the manifest.

Verify:

```bash
claude plugin details spinner-skins     # component inventory
```

## Options

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `skin` | `lava` `ocean` `matrix` `aurora` `nostromo` `calm` | `lava` | Animation to draw |
| `appearance` | `light` `dark` | `light` | Palette set. The mod API has no theme detection, so the user picks. Use `dark` on dark terminals |
| `widthPercent` | number 10-100 | `100` | Share of terminal width the whole row spans (animation + dashboard) |
| `infoPercent` | number 20-80 | `60` | Share of that row the dashboard takes; the animation gets the rest |
| `fps` | number 1-30 | `12` | Frames per second. Lower it over slow SSH |
| `showInfo` | boolean | `true` | Dashboard on or off. It also hides itself when it would be under 14 columns |
| `reducedMotion` | boolean | `false` | One still frame; the dashboard still updates once a second |

Skins: `lava` Minecraft lava, `ocean` waves, `matrix` glyph rain, `aurora` colour curtains, `nostromo` amber motion tracker (Alien, 1979), `calm` slow muted water for sensitive attention (pair with `reducedMotion=true` or `fps=6` for even less movement).

## What the user sees

```
██▓███▓██▓█     thinking | 12s
█████████▓█     ctx 62% | $0.41
▓███▓███████    tools 7 | Readx4 Bashx2
 ▓██████████    > Bash npm test
```

- **Animation** (left): the pool is deeper, denser or has more contacts as the context window fills. Calm at rest, full near auto-compact.
- **Dashboard** (right): turn mode and elapsed time; context percent and session cost (`$.session.usage()`, polled about once a second; cost is an estimate); tool call count with the top three tools; the last tool call, which may run to the screen edge before it is cut.
- **End-of-turn line**: the verb follows the skin (`Smelted`, `Sailed`, `Decoded`, `Glowed`, `Tracked`, `Settled` for 3s).

## How it works

| File | Role |
| --- | --- |
| `.claude-plugin/plugin.json` | Manifest and `userConfig` schema. Add an option here first, then read it in `register.tsx` |
| `.claude-plugin/marketplace.json` | Makes this repo its own marketplace (`source: "./"`) |
| `hooks/register.tsx` | Everything stateful: `turn.start` starts a timer, `turn.complete` stops it, `tool.call` counts, two `ui.render` hooks draw `Spinner` and rewrite `TurnDuration` |
| `hooks/skins.ts` | Pure drawing. No `$`, no state. `SKINS` map; `draw()` merges cells into colour runs |
| `types/index.d.ts` | `$.state` contract: `View = { frame, now, startedAt, percent, usd }` under `'spinner-skins'` |
| `hooks/spinner.test.tsx` | Mount tests for both render hooks |

Data flow: a `clock.every` timer ticks every `1000/fps` ms, awaits `$.clock.now()`, polls `$.session.usage()` once per second, and writes one atom (`view`). The `Spinner` render hook reads that atom, so each write redraws the spinner. Counters (`tools`, `last`, `counts`) live in closure variables and reset on reload; the atom survives reloads.

Rules the code follows on purpose:

- Only the main loop owns the spinner: `turn.start`, `turn.complete` and `tool.call` return early when `e.agentId !== undefined`. Do not remove this: a subagent finishing would stop the animation.
- The Spinner hook returns a tree, which replaces the whole engine line, including its own token count and effort. Those are not exposed to hooks.
- `update($, view, ...)` must name its atom as a literal source, and `$` may only be passed to top-level functions or used inline. `claude plugin validate` rejects anything else. That is why the timer callback is written inline.
- A contract file may only export `type` or `interface` (no `export {}`).
- The spinner event is raised on terminal, desktop and vscode surfaces only.

## Add a skin

A skin is data:

```ts
const mine: Skin = {
  verb: 'Brewed',                                   // "Brewed for 3s"
  palettes: { light: ['#...'], dark: ['#...'] },    // dark to bright
  cell: ({ x, y, t, width, rows, level, palette }) =>
    /* Cell | null */ ({ ch: '#', color: palette[0] }),
}
```

1. Add it to `hooks/skins.ts` and to the `SKINS` map.
2. Add its name to `options` and the description in `plugin.json`.
3. Add it to the option table and skin list above.
4. Run the checks below.

`cell` rules: `x` is 0 to `width-1`, `y` is 0 to `rows-1` (rows is 4), `t` is the frame counter, `level` is context fill 0 to 1. Return `null` for an empty cell. Keep it pure and cheap: it runs `width * rows` times per frame.

## Check your work

```bash
claude plugin validate .      # must end with "Validation passed"; README/icon warnings are known
claude plugin test .          # 2 tests, both must pass
```

Neither checks how it looks. To see it: `claude --plugin-dir <this folder>`, then send a prompt.

## Known limits

- Cost is an estimate, not the bill.
- No theme detection; `appearance` is manual.
- The timer runs for the whole turn, because the mod cannot tell whether the spinner is on screen.
- `claude plugin test` exercises hooks, not terminal paint.
- No icon or screenshot yet; the plugin directory would want a square PNG.

## License

MIT
