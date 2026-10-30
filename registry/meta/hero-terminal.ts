import type { ComponentMeta } from "./types.ts";

export default {
  name: "hero-terminal",
  title: "Hero Terminal",
  description: "A hero block with a headline, description and CTA slot beside a typing Terminal over a dither Backdrop.",
  category: "block",
  modes: ["dither", "ascii"],
  tier: "free",
  files: ["registry/ui/hero-terminal.tsx"],
  registryDependencies: ["terminal", "backdrop"],
  props: [
    { name: "title", type: "ReactNode", description: "The headline, rendered as an h1." },
    { name: "description", type: "ReactNode", description: "Supporting copy under the headline." },
    { name: "actions", type: "ReactNode", description: "CTA slot, e.g. links or Buttons." },
    { name: "lines", type: "string[]", description: "Terminal lines, typed out on mount." },
    { name: "palette", type: "PaletteName | string[]", description: "Palette for the backdrop, terminal and text." },
    { name: "contrast", type: "number", default: "0.35", description: "Backdrop contrast; keep it low behind text." },
  ],
  example: {
    props: {
      title: "Grain for the web",
      description: "Dither and ASCII components for React.",
      lines: ["$ npx shadcn@latest add @dotgrain/hero-terminal", "✔ Done. 3 files added."],
    },
  },
  knobs: ["palette", { name: "contrast", kind: "range", min: 0, max: 1, step: 0.05, default: 0.35 }],
} satisfies ComponentMeta;
