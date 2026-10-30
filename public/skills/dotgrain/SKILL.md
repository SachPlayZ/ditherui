---
name: dotgrain
description: Build UI with dotgrain, the dither and ASCII React component library installed from the shadcn registry at dotgrain.space. Use when adding or styling dotgrain components (DitherField, DitherImage, AsciiRain, Button, Terminal, HeroTerminal…), choosing tokens like palette or mode, or when the user asks for a dithered, ASCII, retro or pixel look.
---

# dotgrain

Every visual is rendered as dither (pixels on/off) or ASCII (glyphs) by one tiny WebGL2 engine, with a Canvas2D fallback. Components are installed as source with the shadcn CLI, not from npm.

## Install

```bash
npx shadcn@latest add https://dotgrain.space/r/<name>.json
```

Or add `"registries": { "@dotgrain": "https://dotgrain.space/r/{name}.json" }` to `components.json` and use `npx shadcn@latest add @dotgrain/<name>`. The engine installs once to `lib/dotgrain/`; components go to `components/ui/<name>.tsx`. Docs: https://dotgrain.space/docs (append `.md` to any page for Markdown; index at https://dotgrain.space/llms.txt).

## Tokens

Wrap the app (or a section) in `DitherProvider` from `@/lib/dotgrain/provider`; every token is also an optional prop on each component.

| token | values |
|---|---|
| mode | `"dither"` \| `"ascii"` |
| pattern | `"bayer2"` \| `"bayer4"` \| `"bayer8"` \| `"blueNoise"` (images also `"atkinson"` \| `"floyd"`) |
| palette | `"ink"` (follows light/dark) \| `"gameboy"` \| `"amber"` \| `"phosphor"` \| `"cga"` \| `"riso"` \| 2–4 hex colours, background → foreground |
| glyphs | `"standard"` \| `"blocks"` \| `"binary"` \| `"katakana"` \| a custom ramp string |
| cell | mark size in px (dither ~3, ASCII ~10) |
| speed | animation speed; 0 freezes |
| contrast, threshold | tone mapping, ~1 and ~0.5 |

## Components

- Backgrounds: `DitherField` (noise/radial/linear field, children on top), `AsciiRain`, `Backdrop` (section or `fixed` viewport texture).
- Media: `DitherImage` (requires `alt`), `AsciiVideo` (video file or webcam).
- Text: `ScrambleText`, `DitherReveal`.
- Controls: `Button` (native button, `variant` solid/outline, `size`), `Toggle` (native checkbox switch).
- Feedback: `DitherProgress` (`value` 0–100), `Loader` (`role="status"`), `Skeleton` (aria-hidden; mark the region `aria-busy`).
- Surfaces: `Card` (`border`, `fill`), `Terminal` (`lines`, `typing`).
- Data: `AsciiChart` (`data`, `type` line/bar/sparkline, `label`).
- Blocks: `HeroTerminal` (`title`, `description`, `actions`, `lines`).

## Rules

- Keep real content as DOM text; never draw meaningful text only into a canvas. Canvases are `aria-hidden` unless given a `label`.
- Give images `alt` and charts a `label`; name toggles with a `<label>` or `aria-label`.
- Don't add three.js, OGL, Motion or other graphics/animation libraries for these effects; the engine handles rendering and animation.
- Respect `prefers-reduced-motion`: components already freeze to a static frame; don't override it.
- Keep text legible: low `contrast` behind text, or put text on a solid panel.
- Components are client components (`"use client"`); import them into server pages normally.
