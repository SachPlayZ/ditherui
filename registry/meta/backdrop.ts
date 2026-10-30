import type { ComponentMeta } from "./types.ts";

export default {
  name: "backdrop",
  title: "Backdrop",
  description: "A dither texture behind a section or fixed behind the whole viewport, without affecting layout.",
  category: "surface",
  modes: ["dither"],
  tier: "free",
  files: ["registry/ui/backdrop.tsx"],
  props: [
    { name: "field", type: '"noise" | "radial" | "linear" | "rain" | "spin" | "shimmer"', default: '"noise"', description: "Built-in value field for the texture." },
    { name: "params", type: "Record<string, number>", description: "Field parameters, e.g. { scale: 3 } for noise." },
    { name: "fixed", type: "boolean", default: "false", description: "Cover the viewport behind everything instead of this element's box." },
    { name: "label", type: "string", description: "Announces the texture as one image; omit when decorative." },
    { name: "children", type: "ReactNode", description: "Section content as normal DOM." },
  ],
  example: { props: { style: { height: 240 } }, children: "Section content" },
  knobs: [
    { name: "field", kind: "select", options: ["noise", "radial", "linear", "shimmer"], default: "noise" },
    "pattern",
    "palette",
    "cell",
    "speed",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
