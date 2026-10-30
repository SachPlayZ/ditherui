import type { ComponentMeta } from "./types.ts";

export default {
  name: "scramble-text",
  title: "Scramble Text",
  description: "Text that scrambles through ASCII glyphs before settling, with the real string in the DOM from the first frame.",
  category: "text",
  modes: ["ascii"],
  tier: "free",
  files: ["registry/ui/scramble-text.tsx"],
  props: [
    { name: "children", type: "string", description: "The real text; readable and selectable from the first frame." },
    { name: "as", type: '"span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"', default: '"span"', description: "Element to render." },
    { name: "trigger", type: '"mount" | "hover" | "inView"', default: '"mount"', description: "Scramble on mount, on hover, or the first time it scrolls into view." },
    { name: "duration", type: "number", default: "900", description: "Scramble length in milliseconds." },
  ],
  example: { props: { as: "h2", trigger: "hover", cell: 4, style: { fontSize: 56, fontWeight: 700, lineHeight: 1.1, margin: 0 } }, children: "Hover to scramble" },
  knobs: [
    { name: "trigger", kind: "select", options: ["mount", "hover", "inView"], default: "hover" },
    { name: "duration", kind: "range", min: 200, max: 3000, step: 100, default: 900 },
    "cell",
    "palette",
    "glyphs",
    "speed",
  ],
} satisfies ComponentMeta;
