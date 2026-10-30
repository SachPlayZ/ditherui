import type { ComponentMeta } from "./types.ts";

export default {
  name: "button",
  title: "Button",
  description: "A native button with a dither or ASCII fill that eases fuller on hover and press.",
  category: "control",
  modes: ["dither", "ascii"],
  tier: "free",
  files: ["registry/ui/button.tsx"],
  props: [
    { name: "variant", type: '"solid" | "outline"', default: '"solid"', description: "Solid: filled face, fuller on hover. Outline: empty face with a border, filling on hover." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Padding and font size." },
    { name: "type", type: '"button" | "submit" | "reset"', default: '"button"', description: "Native button type; every other button attribute passes through." },
    { name: "children", type: "ReactNode", description: "The label, as real DOM text." },
  ],
  example: { props: {}, children: "Get started" },
  knobs: [
    { name: "variant", kind: "select", options: ["solid", "outline"], default: "solid" },
    { name: "size", kind: "select", options: ["sm", "md", "lg"], default: "md" },
    { name: "disabled", kind: "boolean", default: false },
    "mode",
    "pattern",
    "palette",
    "glyphs",
    "cell",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
