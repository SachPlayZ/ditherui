# dotgrain — product and engineering brief

This is the complete brief for dotgrain. It is written to be read by `/to-spec`, then split into tickets by `/to-tickets`. It follows the spec template: problem, solution, user stories, implementation decisions, testing decisions, out of scope, further notes. All product and technical decisions below are final unless listed under "Open items".

---

## Glossary

Use these terms consistently in specs, tickets, code and docs.

- **dotgrain**: the product. A React component library and its docs site. Registry namespace `@dotgrain`.
- **dotgrain Pro**: the paid tier. Separate private registry, namespace `@dotgrain-pro`.
- **Render mode**: how marks are drawn. `dither` (pixels on/off) or `ascii` (glyphs). Later: `halftone`, `pixel`.
- **Mark**: one output unit. A pixel in dither mode, a glyph in ASCII mode.
- **Cell**: the size of one mark in CSS pixels.
- **Pattern**: the dithering algorithm. Ordered patterns (`bayer2`, `bayer4`, `bayer8`, `blueNoise`) run on the GPU. Error-diffusion patterns (`atkinson`, `floyd`) run on the CPU and only for still images.
- **Palette**: the 2–4 colours marks are drawn in, ordered background to foreground (low value → high value). `palette[0]` is the background.
- **Glyph ramp**: the ordered string of characters used in ASCII mode, dark to light.
- **Tokens**: the shared settings every component reads: mode, pattern, cell, palette, glyphs, speed, contrast, threshold.
- **Provider**: `DitherProvider`, which sets tokens for a subtree.
- **Source**: what a component quantizes. A **field** (a built-in function of position and time returning 0–1), an **image**, or a **video**.
- **Field**: a built-in value generator, e.g. `noise`, `radial`, `linear`, `progress`.
- **Engine**: the shared render engine every component uses. One WebGL2 context per page.
- **View**: one component instance registered with the engine.
- **Quantize**: the core React component (`<Quantize>`) that turns a source into marks.
- **Registry item**: one installable unit in shadcn registry format.
- **Knobs**: the live control panel on a docs page that edits tokens and props.
- **Copy prompt**: a generated instruction for AI coding agents to install and use a component.
- **Style bar**: the site-wide control that changes tokens for every preview at once.

---

## Problem Statement

Developers and designers who want their site to look distinctive have two bad options. They can use popular animated component libraries (Aceternity UI, Magic UI, Rare UI, Kokonut UI), whose glow-and-gradient look is now everywhere. Or they can hand-roll retro effects like dithering and ASCII art. That means writing shaders, fighting performance problems, ignoring accessibility and getting no reuse between effects.

No library treats dither and ASCII as a complete, coherent design system. Existing dither effects are one-off backgrounds. There are no matching buttons, progress bars, charts or images, and no shared tokens, so a page built from them looks inconsistent. Existing effects also tend to be heavy (three.js), inaccessible (text rendered into canvas), and unfriendly to AI coding agents, which are now how many developers add components.

---

## Solution

dotgrain is a library of React components where every visual is rendered as dither or ASCII by one shared, dependency-free WebGL2 engine. Components share tokens, so a single provider or one prop restyles an entire site: switch from 1-bit ink to Game Boy green, from dither to ASCII.

- Components install straight into the user's codebase with the shadcn CLI (`npx shadcn@latest add @dotgrain/<name>`). Users own the code, with no runtime npm dependencies.
- A docs site lets people tune every component live with knobs. They copy the exact code, copy an AI-agent prompt, or open it in v0.
- The library is accessible by default: real text stays real DOM text, canvases are decorative, and reduced motion is respected. It is fast by default: one GPU context, rendering at low resolution, paused when offscreen.
- Most components are free under MIT. Premium blocks and full templates are sold as dotgrain Pro, installed through a token-gated private registry.
- Free tools such as `/convert` (image to dither or ASCII) bring traffic. AI channels (MCP via the shadcn MCP server, llms.txt, copy prompts) make dotgrain the default choice when someone asks an agent for "a dithered hero".

---

## User Stories

### Developer using free components

1. As a developer, I want to install a component with one `npx shadcn@latest add @dotgrain/<name>` command, so that it lands in my repo without manual copying.
2. As a developer, I want to install by direct URL without configuring a namespace, so that I can try a component in seconds.
3. As a developer, I want the shared engine to install automatically the first time I add any component, and only once, so that I never duplicate code.
4. As a developer, I want zero new npm dependencies from dotgrain components, so that my bundle and lockfile stay clean.
5. As a developer, I want every component to work without a provider, using sensible defaults, so that I can drop one in anywhere.
6. As a developer, I want to wrap my app in `DitherProvider` to set palette, pattern, cell size and mode once, so that every component matches.
7. As a developer, I want to override any token on a single component through props, so that one section can look different.
8. As a developer, I want to switch any component between dither and ASCII with one `mode` prop, so that I can explore both looks without rewriting code.
9. As a developer, I want named palettes (ink, gameboy, amber, phosphor, cga, riso) and custom 2–4 colour palettes, so that I can match my brand.
10. As a developer, I want named glyph ramps and a custom glyph string, so that ASCII components can use my own characters.
11. As a developer, I want the `ink` palette to follow light and dark mode automatically, so that my site works in both themes.
12. As a developer, I want components to forward `className`, `style` and `ref`, so that I can lay them out with Tailwind or CSS.
13. As a developer, I want full TypeScript types and an exported props type per component, so that autocomplete guides me.
14. As a developer, I want components to work in the Next.js App Router and in plain Vite React, so that I'm not locked into one framework setup.
15. As a developer, I want no layout shift or colour flash during server rendering, so that my page looks stable on load.
16. As a developer, I want components to keep working when WebGL2 is unavailable, so that no user sees a blank box.
17. As a developer, I want a `DitherField` background that animates and reacts to the cursor, so that my hero feels alive.
18. As a developer, I want `DitherField` children to render on top as normal DOM, so that my heading stays selectable and readable.
19. As a developer, I want a `DitherImage` that converts any image live with a choice of pattern, so that photos match my site's look.
20. As a developer, I want `DitherImage` to support Atkinson and Floyd–Steinberg for photos, so that detail is preserved.
21. As a developer, I want `DitherImage` to reserve its space with width and height props, so that it doesn't cause layout shift.
22. As a developer, I want `DitherImage` to fall back to the normal image if the source can't be read (CORS), so that content never disappears.
23. As a developer, I want an `AsciiVideo` that turns webcam or video into ASCII in real time, so that I can build a memorable interactive moment.
24. As a developer, I want `ScrambleText` and `DitherReveal` for headings, so that text animates in the house style.
25. As a developer, I want `Button`, `Toggle`, `Tabs`, `Accordion`, `Input` and `Tooltip` in the house style, so that interactive UI matches the visuals.
26. As a developer, I want `DitherProgress`, `Loader`, `Skeleton` and `Toast`, so that feedback states match the rest of the page.
27. As a developer, I want `Card`, `Backdrop` and `Terminal` surfaces, so that I can build whole sections in the style.
28. As a developer, I want `AsciiChart`, `DitherHeatmap` and `DitherGlobe`, so that I can show data in the style.
29. As a developer, I want ready-made free blocks (hero, features, pricing, footer, 404), so that I can assemble a page quickly.
30. As a developer, I want a `speed` token and a `speed={0}` option, so that I can calm or freeze animation.

### Designer and visitor on the docs site

31. As a designer, I want to see every component running live, so that I can judge it before installing anything.
32. As a designer, I want a knobs panel beside each preview, so that I can tune pattern, cell, palette, glyphs, speed and the component's own props.
33. As a designer, I want the code tab to show exactly the configuration I tuned, so that what I copy matches what I see.
34. As a designer, I want a site-wide style bar that restyles every preview at once, so that I can see the whole library in my palette.
35. As a visitor, I want preview controls for replay, light/dark and mobile/desktop width, so that I can test each case.
36. As a visitor, I want a gallery filterable by category and mode, so that I can find components quickly.
37. As a visitor, I want ⌘K search styled as a terminal prompt, so that navigation feels on-brand and fast.
38. As a visitor, I want install instructions as CLI and manual tabs, with an npm/pnpm/yarn/bun switch, so that I can use my own tooling.
39. As a visitor, I want a props table on every component page, so that I know every option and its default.
40. As a visitor, I want accessibility and performance notes on every page, so that I know the cost and behaviour before shipping.
41. As a visitor, I want a `/convert` tool to turn my image or logo into dither or ASCII and download the result, so that I get value even without code.
42. As a visitor, I want `/convert` to also give me the component code for the same settings, so that I can move from tool to code.
43. As a visitor, I want a `/playground` to stack components into a page and export the code, so that I can prototype a whole layout.
44. As a visitor, I want a changelog and "new" badges, so that I can see what's been added.
45. As a visitor, I want a "Built with dotgrain" showcase, so that I can see real sites using it.

### AI-assisted developer

46. As an AI-assisted developer, I want a Copy prompt button on every component page, so that I can paste a complete install-and-use instruction into my coding agent.
47. As an AI-assisted developer, I want the copy prompt to include my current knob settings, so that the agent reproduces the exact look.
48. As an AI-assisted developer, I want "Open in Cursor", "Open in Claude" and "Open in ChatGPT" options, so that I can send the prompt straight to my tool.
49. As an AI-assisted developer, I want an Open in v0 button on every free component, so that I can start a v0 chat with it.
50. As an AI-assisted developer, I want an MCP page explaining the shadcn MCP server setup, so that my agent can list, search and install dotgrain components by name.
51. As an AI agent, I want `llms.txt`, `llms-full.txt` and a Markdown version of every docs page, so that I can read the docs efficiently.
52. As an AI agent, I want an installable agent skill describing when and how to use dotgrain, so that I pick the right component and props.

### Pro customer

53. As a buyer, I want a pricing page that clearly separates free and Pro, so that I know what I'm paying for.
54. As a buyer, I want to pay through a checkout that handles tax and receipts, so that buying is simple.
55. As a Pro customer, I want to receive a licence key right after purchase, so that I can start immediately.
56. As a Pro customer, I want to add `@dotgrain-pro` to `components.json` with my key from an environment variable, so that I can install Pro items with the same CLI.
57. As a Pro customer, I want clear CLI errors when my key is missing or invalid, so that I can fix setup myself.
58. As a Pro customer, I want Pro docs pages to show live previews to everyone and code to me once my key is verified, so that I can browse before and after buying.
59. As a Pro customer, I want MCP to work with Pro items too, so that my agent can install them.
60. As a Pro customer, I want full templates (portfolio, SaaS launch, game studio, music) as complete repos, so that I can ship a site fast.
61. As a team buyer, I want a team licence, so that my colleagues can use the same Pro items.

### Accessibility and end users of sites built with dotgrain

62. As a screen-reader user, I want decorative canvases hidden from assistive tech, so that I'm not read noise.
63. As a screen-reader user, I want ASCII art to be announced as one labelled image, so that I'm not read thousands of characters.
64. As a screen-reader user, I want `ScrambleText` to expose its final text immediately, so that I hear the real heading.
65. As a keyboard user, I want every interactive component to keep native focus, keyboard behaviour and visible focus rings, so that I can use it fully.
66. As a user with motion sensitivity, I want animation to stop when I've set reduced motion, so that the site is comfortable.
67. As a user with photosensitivity, I want no rapid flashing patterns, so that the site is safe to view.
68. As a mobile user, I want effects to stay smooth and not drain my battery, so that sites built with dotgrain are pleasant on phones.

### Maintainer and contributor

69. As the maintainer, I want every component to be a thin layer over the engine, so that adding a component is fast and consistent.
70. As the maintainer, I want new render modes to work across all components automatically, so that halftone and pixel modes don't require rewrites.
71. As the maintainer, I want registry items, docs pages, props tables, copy prompts, llms.txt and the changelog generated from one metadata source, so that nothing drifts.
72. As the maintainer, I want visual regression screenshots of every example in every palette and mode, so that engine changes never silently break the look.
73. As the maintainer, I want size budgets checked in CI, so that the library stays light.
74. As the maintainer, I want Pro code in a separate private repo, so that paid code never leaks into the public repo.
75. As the maintainer, I want registry download counts per item, so that I know which components matter.
76. As a contributor, I want a contributing guide that goes from "new component" to "working install command", so that I can add components correctly.
77. As a sponsor, I want a sponsors page and README placement, so that my support is visible.

---

## Implementation Decisions

### Product decisions

- Name: **dotgrain**. Public registry namespace `@dotgrain`; Pro namespace `@dotgrain-pro`.
- Launch with dither and ASCII only. Halftone and pixel modes come later as new render modes of the same engine.
- Free components: all primitives, controls, feedback, surfaces, media, data and basic blocks. Pro: premium block packs, full-page templates and complete starter repos. Growth-driving showcase pieces (`DitherImage`, `AsciiVideo`, `HeroTerminal`) stay free.
- Licence: free code is **MIT**. Pro code ships under a separate commercial licence (per-person and team tiers, one-time payment). Pricing amounts are an open item.
- Payments: a merchant-of-record provider (Polar or Lemon Squeezy) that issues licence keys and handles global tax.

### Technical stack

- Docs site and public registry live in one public repo: Next.js (latest stable, App Router), React 19, TypeScript strict, Tailwind CSS v4, Fumadocs (MDX), pnpm.
- Pro lives in a separate private repo and deployment that serves the Pro registry and Pro templates.
- Rendering uses **raw WebGL2** with an in-house engine. No three.js, OGL, regl or other graphics library. No animation library in shipped components. A Canvas2D fallback handles environments without WebGL2.
- Distribution is the **shadcn registry** format, built with `shadcn build`.

### Engine modules

- **Context manager**: lazily creates one offscreen WebGL2 context per page, shared by all views, because browsers cap live contexts at roughly 16. Each frame it renders each visible view at quantized resolution into the shared canvas and copies the result into that view's own 2D canvas, with image smoothing off, so the CSS-sized canvas upscales crisply. It handles context loss and restore by rebuilding programs and textures while keeping views registered.
- **Scheduler**: one `requestAnimationFrame` loop for all views. It skips views that are offscreen (IntersectionObserver) and pauses when the tab is hidden. It watches `prefers-reduced-motion` live; under reduced motion, or with `speed` 0, it renders once and then only on token, size or source change. ResizeObserver triggers re-render. Device pixel ratio is capped at 2.
- **Shader programs**: GLSL ES 3.00 sources, compiled lazily and cached. Includes a full-screen vertex shader, a dither fragment shader and an ASCII fragment shader, with a field library injected into both.
- **Dither shader behaviour**: value from field or texture luminance (Rec. 709), then contrast and threshold, then ordered dithering against a threshold texture, quantized to N levels where N is the palette length; the output is that palette colour.
- **ASCII shader behaviour**: compute the cell grid, sample the source at each cell, map luminance to a glyph index in the ramp, and sample the glyph from a glyph-atlas texture. Two-colour palettes give background and foreground; three or four colours tint by luminance band.
- **Patterns**: Bayer 2/4/8 generated at init; blue noise as a 64×64 texture generated lazily (void-and-cluster) on first `blueNoise` use and cached; not embedded. Error diffusion (Atkinson, Floyd–Steinberg) runs on the CPU, in a Blob-URL Worker (built from an inline function, no bundler config) for images over 512×512, falling back to the main thread if Workers are unavailable, and only for image sources. For other sources it falls back to `bayer4` with a one-time development warning.
- **Glyph atlas**: built with Canvas2D from the ramp and the configured monospace font (default `"JetBrains Mono", ui-monospace, monospace`; the engine ships no font files, the site loads JetBrains Mono via `next/font`; the atlas rebuilds when fonts finish loading), cached by font, cell and ramp. Ramps: `standard` (`@%#*+=-:. `), `blocks` (`█▓▒░ `), `binary` (`10`), `katakana` (32 half-width characters), or custom.
- **Palettes**: `ink`, `gameboy`, `amber`, `phosphor`, `cga`, `riso`, plus custom arrays of 2–4 CSS colours parsed to RGB. `ink` follows the colour scheme (`light`, `dark`, `system`): light is `[paper, ink]`, dark is `[ink, paper]`. `system` watches both `prefers-color-scheme` and a `dark` class / `data-theme` on `<html>` (MutationObserver), so next-themes and Fumadocs work without config.
- **Fields**: `noise`, `radial`, `linear`, `progress` in phase 1; more are added as components need them. Every field exists as a GLSL function returning 0–1 and as an identical JS twin used by the CPU fallback and tests.
- **CPU fallback**: a Canvas2D implementation of the same dither and ASCII output, used without WebGL2 and in tests.
- **Size budget**: engine under 15 kB min+gzip; each component under 3 kB min+gzip on top.

### Public interfaces

Token and source types (decision-rich shape, kept as the contract):

```ts
type Mode = "dither" | "ascii";
type Pattern = "bayer2" | "bayer4" | "bayer8" | "blueNoise" | "atkinson" | "floyd";

interface DitherTokens {
  mode: Mode;                       // default "dither"
  pattern: Pattern;                 // default "bayer4"
  cell: number;                     // default 3 (dither) / 10 (ascii)
  palette: PaletteName | string[];  // 2–4 colours, background → foreground
  glyphs: GlyphRampName | string;   // dark → light
  speed: number;                    // default 1; 0 freezes
  contrast: number;                 // default 1
  threshold: number;                // default 0.5
}

type Source =
  | { kind: "field"; field: FieldName; params?: Record<string, number> }
  | { kind: "image"; src: string; crossOrigin?: "anonymous" }
  | { kind: "video"; element: HTMLVideoElement }; // type only in phase 1; engine support lands with AsciiVideo in phase 2
```

- `DitherProvider` accepts partial tokens, `colorScheme` and `font`. A `useDitherTokens(overrides)` hook merges defaults, then provider values, then props.
- `<Quantize>` accepts `source`, any token as an optional prop, `className`, `style`, `ref` and an optional `label`. With a label it renders `role="img"` and `aria-label`; without one, the canvas is `aria-hidden`. During SSR it paints `palette[0]` (the background colour) as a background, so there is no flash.
- Every component exports a `<Name>Props` type. Token props are always optional. Every component starts with `"use client"`, forwards `className`, `style` and `ref`, and contains no global CSS or injected keyframes.

### Component catalogue

| Component | Category | Modes | Tier | Phase |
| --- | --- | --- | --- | --- |
| DitherField | Background | dither, ascii | Free | 1 |
| DitherImage | Media | dither, ascii | Free | 1 |
| DitherProgress | Feedback | dither, ascii | Free | 1 |
| AsciiRain | Background | ascii | Free | 2 |
| AsciiVideo | Media | ascii | Free | 2 |
| ScrambleText | Text | ascii | Free | 2 |
| DitherReveal | Text | dither | Free | 2 |
| Button | Control | both | Free | 2 |
| Toggle | Control | dither | Free | 2 |
| Loader | Feedback | both | Free | 2 |
| Skeleton | Feedback | dither | Free | 2 |
| Card | Surface | both | Free | 2 |
| Backdrop | Surface | dither | Free | 2 |
| Terminal | Surface | ascii | Free | 2 |
| AsciiChart | Data | ascii | Free | 2 |
| HeroTerminal | Block | both | Free | 2 |
| Tooltip, Tabs, Accordion, Input | Control | both | Free | 3 |
| Toast | Feedback | dither | Free | 3 |
| DitherHeatmap, DitherGlobe | Data | dither | Free | 3 |
| CursorTrail | Interaction | both | Free | 3 |
| AsciiLogo | Media | ascii | Free | 3 |
| CompareSlider | Media | dither | Free | 3 |
| Basic blocks: features, pricing, footer, 404 | Block | both | Free | 3 |
| Premium block packs (hero, features, pricing, testimonials, auth, dashboards) | Block | both | Pro | 4 |
| Full templates: portfolio, SaaS launch, game studio, music | Template | both | Pro | 4 |
| Halftone and pixel render modes across all components | Engine | halftone, pixel | Free | 5 |

Component behaviour decisions:

- **DitherField**: built-in `noise`, `radial` or `linear` field with optional params; cursor-reactive (an eased soft radial bump added to the field value at the pointer, via pointer events so touch works; props `interactive` default true and `cursorRadius`; off under reduced motion); children render above in normal DOM flow.
- **DitherImage**: requires `src` and `alt`. Renders a visually hidden `<img alt>` for accessibility and SEO. Accepts `width` and `height` to reserve aspect ratio. Changing tokens re-renders without reloading the image. On CORS failure it shows the plain image.
- **DitherProgress**: requires `value` (0–100); optional `softness` and `label`. Native `role="progressbar"` with ARIA values; canvas is decoration. ASCII mode draws `[#####.....]` using the ramp's extremes. Value changes ease the edge only; under reduced motion they snap.
- **ScrambleText**: the real string is in the DOM from the first frame; the scramble is a visual overlay.
- **Controls**: native elements and semantics underneath; dither and ASCII are only fills, borders and transitions.
- **AsciiVideo**: needs explicit user action to start the webcam, and handles permission denial gracefully.

### Registry and distribution

- `@dotgrain/engine` is a `registry:lib` item. Every component is a `registry:ui` item with `registryDependencies: ["@dotgrain/engine"]` and an empty `dependencies` list.
- Items carry `title`, a one-sentence `description` (reused for search, llms.txt and copy prompts), `categories` and `meta.modes`.
- Three install forms are documented: namespaced, direct URL and GitHub. The namespace snippet maps `@dotgrain` to `https://dotgrain.com/r/{name}.json`.
- Free items are v0-compatible: no `cssVars` or `envVars`.
- At launch, submit to the shadcn registry index, registry.directory and 21st.dev.
- Item request counts are logged per registry item for analytics.

### Single source of truth

- Each component has one typed metadata definition: name, description, category, modes, tier, props (name, type, default, description), examples and knob ranges.
- A script generates `registry.json` from `registry/meta/<name>.ts` (phase 1 onward); the output is committed and CI fails if it is out of sync. That metadata also generates the docs page header and props table, the knobs panel, the copy prompt, the llms.txt entries, the gallery card and changelog entries.

### Docs site

- Pages: landing (`HeroTerminal` plus a live component wall), docs (introduction, installation, theming and tokens, MCP, accessibility, one page per component), gallery, `/playground`, `/convert`, pricing, Pro docs, changelog, showcase, sponsors.
- The whole site renders in dotgrain and wraps everything in a provider driven by the global **style bar** (mode, pattern, palette, cell).
- Component page order: header with mode badges and actions (Copy prompt, Open in v0, GitHub); preview with knobs, replay, light/dark and width toggles; code tab reflecting knob state; install tabs (CLI and manual, package-manager switch); usage; examples (preset looks); props table; accessibility and performance notes.
- Copy prompt template: add the namespace if missing; the install command; the usage snippet with current knob values; keep the API and customise via props and className; mark it as a client component. Primary action is "Copy prompt", with "Open in Cursor / Claude / ChatGPT" in a dropdown.
- ⌘K search over component names, descriptions and categories, styled as a terminal prompt.
- `/convert`: upload an image or logo; choose mode, pattern, palette and cell; download PNG (dither) or TXT and PNG (ASCII); copy the matching component code. Processing happens in the browser, and nothing is uploaded to a server.
- `/playground`: stack sections and blocks, tune tokens, and export a page of JSX plus the install commands.
- AI channels: `/llms.txt`, `/llms-full.txt`, a `.md` twin of every docs page, an MCP page (shadcn MCP server setup and example prompts, warning to use the `@dotgrain/` prefix), and an installable agent skill.

### Pro

- A private repo and deployment serves `@dotgrain-pro` registry items from a route that requires `Authorization: Bearer <key>`. The route validates the key with the payment provider's licence API (cached) and returns 401 with a clear message when the key is missing or invalid.
- Customer setup: put `DOTGRAIN_PRO_KEY` in `.env.local`, then map `@dotgrain-pro` in `components.json` with the bearer header reading that variable.
- Pro docs pages live on the main site. Previews are public; code views call a verification endpoint with the user's key, which is stored only in that browser.
- Templates are delivered as private GitHub repo access or a download, granted on purchase.
- The licence allows use in unlimited end products and forbids redistributing or reselling the Pro source.

### Repository conventions

- Kebab-case file names, PascalCase exports, one component per file, components under about 150 lines with logic in the engine.
- CI runs typecheck, unit tests, registry build, size-budget check and visual regression on every pull request.
- A `CLAUDE.md` in the repo carries these conventions for agents. `CONTRIBUTING.md` walks from a new component to a working install command.

---

## Testing Decisions

- **A good test checks external behaviour, not implementation.** For rendering, that means the pixels or glyphs produced for a given source and tokens, never shader internals or private engine state.
- **Primary seam: the engine's public render function through the CPU path.** Given a source, tokens and a size, it returns pixel data. It is deterministic (fixed time, no GPU), so most rendering behaviour is unit-tested here. In ASCII mode the testable CPU output is the cell → glyph-index grid (jsdom has no Canvas2D); glyph pixels are covered by the GPU parity suite. Covered: Bayer matrix generation, quantization to palette levels, glyph index mapping, field outputs, palette parsing and token merging.
- **GPU parity**: a small Playwright suite renders the same fixtures through WebGL2 and the CPU path and compares them within tolerance.
- **Component seam: rendered DOM and accessibility tree.** Test with React Testing Library: canvases are `aria-hidden`, labels produce `role="img"`, `DitherProgress` exposes ARIA values, `DitherImage` contains the hidden `<img alt>`, `ScrambleText` exposes final text, and controls keep native semantics and keyboard handling.
- **Visual regression**: Playwright screenshots of every example × every named palette × both modes, plus reduced-motion and forced-CPU runs (dev-only `?cpu=1` flag). Baselines are Linux only, generated in the official Playwright Docker image both locally and in CI.
- **Scheduler behaviour**: tests confirm that offscreen views and hidden tabs don't render, that reduced motion renders once, and that token changes trigger a re-render.
- **Install end-to-end**: in CI, create a fresh Next.js app, install every free item from the locally built registry, and typecheck and build it. Confirm the engine installs once. Run the same for Pro items against a test key, plus a missing-key case that must return 401.
- **Size budgets**: CI fails if the engine or any component exceeds its min+gzip budget.
- **Docs**: smoke tests that every component page renders, its copy prompt contains the right install command, and its props table matches the metadata.
- **Prior art**: none yet. This is a new repo, and these suites establish the patterns.

---

## Out of Scope

- npm package distribution (registry only).
- Vue, Svelte or other framework ports (possible later, not planned here).
- A custom CLI; the shadcn CLI is used.
- A custom MCP server; the shadcn MCP server is used.
- three.js or any 3D rendering beyond what the 2D shaders produce.
- User accounts with passwords on the docs site; Pro access is licence-key based.
- A Figma kit (possible later).
- Server-side image processing for `/convert`.
- Halftone and pixel modes until phase 5.

---

## Further Notes

### Phases

Each phase should become its own spec, so tickets stay small. Do not start a phase until the previous phase's exit check passes.

| Phase | Scope | Exit check |
| --- | --- | --- |
| 1 · Engine | Repo scaffold; engine (context, scheduler, shaders, patterns, palettes, glyphs, fields, CPU fallback); provider and `Quantize`; DitherField, DitherImage, DitherProgress; docs skeleton with style bar, knobs, code tab, install tabs, props table, copy prompt; CI | Three components install into a fresh Next.js app and pass all tests |
| 2 · Launch | Remaining launch components (AsciiRain through HeroTerminal); landing page; gallery; ⌘K search; `/convert`; llms.txt, MCP page, agent skill, Open in v0; registry listings | Public launch |
| 3 · Depth | Core controls, Toast, data viz, CursorTrail, AsciiLogo, CompareSlider, basic blocks; `/playground`; changelog; showcase; sponsors page | A complete page can be built from free blocks |
| 4 · Pro | Private repo and registry; licence validation; checkout and pricing page; Pro docs gating; premium block packs; templates | First paid customer |
| 5 · Widen | Halftone and pixel render modes across every component | All components pass visual regression in all four modes |

### Suggested first tracer bullet

Build the thinnest end-to-end slice first: engine with one field and Bayer 4 → `DitherField` → registry item → install into a fresh app → docs page with preview and install command. Everything else in phase 1 widens that slice.

### Launch plan (phase 2, non-engineering)

Post one component per day as a short screen recording on X before launch. Launch on Product Hunt, Show HN, r/reactjs and r/webdev, leading with `AsciiVideo` and the style bar. `/convert` serves as an ongoing traffic source. After that, add sponsors, then Pro.

### Risks

- Accessibility: never render body text into canvas.
- Performance on low-end phones: budgets, pausing, low-res rendering and CPU fallback.
- Aesthetic niche ceiling: mitigated by the free core, blocks and templates aimed at launches, portfolios and creative brands.

### Open items

- Pricing for Pro (per-person and team, one-time).
- Choice between Polar and Lemon Squeezy.
- Domain confirmation (dotgrain.com is assumed throughout).
- Monospace and pixel display fonts for the site.