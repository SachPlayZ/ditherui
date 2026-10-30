import type { ComponentMeta } from "./types.ts";

export default {
  name: "dither-reveal",
  title: "Dither Reveal",
  description: "Text that dithers in or out when it scrolls into view, mounts or is hovered, with the real text always in the DOM.",
  category: "text",
  modes: ["dither"],
  tier: "free",
  files: ["registry/ui/dither-reveal.tsx"],
  props: [
    { name: "children", type: "ReactNode", description: "The real text; always in the DOM and selectable." },
    { name: "as", type: '"span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"', default: '"span"', description: "Element to render." },
    { name: "trigger", type: '"inView" | "mount" | "hover"', default: '"inView"', description: "Run the first time it scrolls into view, on mount, or on each hover." },
    { name: "direction", type: '"in" | "out"', default: '"in"', description: "Dither the text in (appear) or out (disappear)." },
    { name: "duration", type: "number", default: "1200", description: "Run length in milliseconds." },
  ],
  example: { props: { as: "h2", trigger: "hover", cell: 2, style: { fontSize: 56, fontWeight: 700, lineHeight: 1.1, margin: 0 } }, children: "Hover to reveal" },
  knobs: [
    { name: "trigger", kind: "select", options: ["inView", "mount", "hover"], default: "inView" },
    { name: "direction", kind: "select", options: ["in", "out"], default: "in" },
    { name: "duration", kind: "range", min: 200, max: 4000, step: 100, default: 1200 },
    "pattern",
    "palette",
    "cell",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
