import type { ComponentMeta } from "./types.ts";

export default {
  name: "dither-field",
  title: "Dither Field",
  description: "An animated dithered background field with real DOM content on top.",
  category: "background",
  modes: ["dither", "ascii"],
  tier: "free",
  files: ["registry/ui/dither-field.tsx"],
  props: [
    { name: "field", type: '"noise" | "radial" | "linear"', default: '"noise"', description: "Built-in value field to render." },
    { name: "params", type: "Record<string, number>", description: "Field parameters: noise { scale }, radial { x, y, radius }, linear { angle }." },
    { name: "interactive", type: "boolean", default: "true", description: "Brighten a soft spot under the pointer; off under reduced motion." },
    { name: "cursorRadius", type: "number", default: "120", description: "Radius of the pointer spot in CSS pixels." },
    { name: "label", type: "string", description: "Announces the background as one image; omit when decorative." },
    { name: "children", type: "ReactNode", description: "Content rendered above the field as normal DOM." },
  ],
} satisfies ComponentMeta;
