import type { ComponentMeta } from "./types.ts";

export default {
  name: "ascii-rain",
  title: "ASCII Rain",
  description: "A background of falling ASCII glyph columns with real DOM content on top.",
  category: "background",
  modes: ["ascii"],
  tier: "free",
  files: ["registry/ui/ascii-rain.tsx"],
  props: [
    { name: "density", type: "number", default: "0.7", description: "Share of columns raining, 0–1." },
    { name: "length", type: "number", default: "0.4", description: "Tail length as a share of the height, 0–1." },
    { name: "label", type: "string", description: "Announces the background as one image; omit when decorative." },
    { name: "children", type: "ReactNode", description: "Content rendered above the rain as normal DOM." },
  ],
  example: { props: { style: { height: 320 } }, children: "Hello" },
  knobs: [
    { name: "density", kind: "range", min: 0.05, max: 1, step: 0.05, default: 0.7 },
    { name: "length", kind: "range", min: 0.05, max: 1, step: 0.05, default: 0.4 },
    "palette",
    "glyphs",
    "cell",
    "speed",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
