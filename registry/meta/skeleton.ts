import type { ComponentMeta } from "./types.ts";

export default {
  name: "skeleton",
  title: "Skeleton",
  description: "A dithered shimmer placeholder block, sized with className or style.",
  category: "feedback",
  modes: ["dither"],
  tier: "free",
  files: ["registry/ui/skeleton.tsx"],
  props: [
    { name: "className", type: "string", description: "Size and shape it like any block; height defaults to 16px." },
    { name: "style", type: "CSSProperties", description: "Inline size, e.g. { width: 240, height: 20 }." },
  ],
  example: { props: { style: { width: 280, height: 20 } } },
  knobs: ["pattern", "palette", "cell", "speed", "contrast", "threshold"],
} satisfies ComponentMeta;
