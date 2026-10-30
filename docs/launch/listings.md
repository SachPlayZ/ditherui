# Directory listings

Copy and metadata for the maintainer to submit. Nothing here is submitted automatically.

## Shared

- **Name:** dotgrain
- **Namespace:** `@dotgrain`
- **Registry URL template:** `https://dotgrain.space/r/{name}.json`
- **Homepage:** https://dotgrain.space
- **Docs:** https://dotgrain.space/docs
- **Repository:** https://github.com/SachPlayZ/dotgrain
- **License:** MIT
- **One-liner:** React components rendered as dither and ASCII, with real DOM text and one tiny WebGL2 engine.
- **Description:** dotgrain is a shadcn registry of 16 free React components (backgrounds, media, text effects, controls, feedback, surfaces, charts and a hero block) where every visual is dither or ASCII. Real text stays in the DOM, canvases are decorative, reduced motion is respected, and everything renders through one ~12 kB WebGL2 engine with a Canvas2D fallback and no runtime dependencies.
- **Tags:** dither, ascii, retro, pixel, webgl, canvas, background, animation, accessibility, react, nextjs, tailwind
- **Screenshots:** https://dotgrain.space/og/docs/image.png and per-component OG images at `/og/docs/components/<name>/image.png`.

## shadcn registry index

Submit a PR to `shadcn-ui/ui` adding to `apps/v4/public/r/registries.json` (follow the repo's current contributing guide):

```json
{ "@dotgrain": "https://dotgrain.space/r/{name}.json" }
```

After it merges, `npx shadcn@latest add @dotgrain/<name>` works without a `components.json` entry. Then switch `scripts/build-registry.ts` to reference the engine as `@dotgrain/engine` (see the shortcut comment there) and remove the warning on `/docs/mcp`.

## registry.directory

Submit via the site's "Submit registry" form:

- Title: dotgrain
- URL: https://dotgrain.space
- Registry: https://dotgrain.space/r/registry.json
- Description: the one-liner above.

## 21st.dev

Publish components individually (21st.dev takes a component file plus a demo). Start with the most visual: DitherField, AsciiRain, DitherImage, HeroTerminal, Button. For each:

- Component source: `registry/ui/<name>.tsx` plus the engine as a dependency file set (`registry/engine/*`).
- Demo: `registry/examples/<name>-demo.tsx`.
- Description: the item's `description` from `registry.json`.
- Tags: the shared tags plus the item's category.
