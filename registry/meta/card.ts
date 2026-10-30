import type { ComponentMeta } from "./types.ts";

export default {
  name: "card",
  title: "Card",
  description: "A surface with a dither or ASCII border and optional fill around normal DOM children.",
  category: "surface",
  modes: ["dither", "ascii"],
  tier: "free",
  files: ["registry/ui/card.tsx"],
  props: [
    { name: "border", type: "number", default: "3", description: "Border width in marks (whole glyph cells in ASCII)." },
    { name: "fill", type: "number", default: "0", description: "Level inside the border, 0–1; keep it low so text stays legible." },
    { name: "children", type: "ReactNode", description: "Card content as normal DOM; padding defaults to 24px." },
  ],
  example: { props: { style: { width: 320 } }, children: "Card content" },
  knobs: [
    { name: "border", kind: "range", min: 1, max: 8, step: 1, default: 3 },
    { name: "fill", kind: "range", min: 0, max: 0.5, step: 0.05, default: 0 },
    "mode",
    "pattern",
    "palette",
    "glyphs",
    "cell",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
