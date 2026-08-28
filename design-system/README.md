# Notch design system — "Coach's Ledger"

Standalone, self-contained specs for the Notch brand and UI. Every page renders
without the Next app, so it can be shared with a designer or pushed to
[claude.ai/design](https://claude.ai/design).

```bash
cd design-system && python3 -m http.server 4599
# open http://localhost:4599/foundations/tally.html
```

| Page                            | Covers                                                     |
| ------------------------------- | ---------------------------------------------------------- |
| `foundations/color.html`        | Surfaces, ink, and the three status hues                    |
| `foundations/type.html`         | Erode + Switzer, the scale, tabular numerals                |
| `foundations/tally.html`        | The tally device, its states, and why it's drawn as two runs |
| `components/controls.html`      | Buttons, fields, status stamps                              |
| `components/pack-card.html`     | The pack card and the compact ledger row                    |
| `brand/wordmark.html`           | Wordmark, voice (say / not), layout rules                   |

## Keeping it honest

`_tokens.css` mirrors the `@theme` block in `src/app/globals.css`, and
`_tally.js` mirrors the geometry in `src/components/tally.tsx`. If you change
either of those, change the mirror — a design system that has drifted from the
code is worse than none.

Type is pulled from the Fontshare API here rather than self-hosted, so these
pages can be shared without redistributing the font files. The ITF Free Font
License permits API delivery and self-hosting for your own site, but not
redistribution.

## Pushing to Claude Design

Each page carries an `@dsCard` marker on its first line, so the Design System
pane builds its card index automatically. Run `/login` in Claude Code to grant
design scopes, then sync — read the project, finalize a plan covering
`design-system/**`, and write.
