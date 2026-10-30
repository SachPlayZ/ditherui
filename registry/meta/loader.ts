import type { ComponentMeta } from "./types.ts";

export default {
  name: "loader",
  title: "Loader",
  description: "An indeterminate dither or ASCII spinner that announces its label as a status.",
  category: "feedback",
  modes: ["dither", "ascii"],
  tier: "free",
  files: ["registry/ui/loader.tsx"],
  props: [
    { name: "label", type: "string", default: '"Loading"', description: "Announced to screen readers through role=status; not shown." },
    { name: "size", type: "number", default: "48", description: "Width and height in CSS pixels." },
  ],
  example: { props: { size: 64 } },
  knobs: [
    { name: "size", kind: "range", min: 24, max: 160, step: 4, default: 64 },
    "mode",
    "pattern",
    "palette",
    "glyphs",
    "cell",
    "speed",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
