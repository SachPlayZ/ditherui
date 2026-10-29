import type { ComponentMeta } from "./types.ts";

export default {
  name: "dither-progress",
  title: "Dither Progress",
  description: "A progress bar drawn in dither or ASCII, with native progressbar semantics.",
  category: "feedback",
  modes: ["dither", "ascii"],
  tier: "free",
  files: ["registry/ui/dither-progress.tsx"],
  props: [
    { name: "value", type: "number", description: "Progress from 0 to 100; changes ease, and snap under reduced motion." },
    { name: "softness", type: "number", default: "0.05", description: "Width of the dithered edge as a fraction of the bar." },
    { name: "label", type: "string", description: "Accessible name of the progressbar." },
  ],
  example: { props: { value: 60, label: "Uploading" } },
  knobs: [
    { name: "value", kind: "range", min: 0, max: 100, step: 1, default: 60 },
    { name: "softness", kind: "range", min: 0, max: 0.5, step: 0.01, default: 0.05 },
    "mode",
    "pattern",
    "palette",
    "glyphs",
    "cell",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
