import type { ComponentMeta } from "./types.ts";

export default {
  name: "dither-field",
  title: "Dither Field",
  description: "An animated dithered background field with real DOM content on top.",
  category: "background",
  modes: ["dither"],
  tier: "free",
  files: ["registry/ui/dither-field.tsx"],
  props: [
    { name: "field", type: '"noise"', default: '"noise"', description: "Built-in value field to render." },
    { name: "params", type: "Record<string, number>", description: "Field parameters, e.g. { scale: 3 }." },
    { name: "label", type: "string", description: "Announces the background as one image; omit when decorative." },
    { name: "children", type: "ReactNode", description: "Content rendered above the field as normal DOM." },
  ],
} satisfies ComponentMeta;
