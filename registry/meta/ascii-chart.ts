import type { ComponentMeta } from "./types.ts";

export default {
  name: "ascii-chart",
  title: "ASCII Chart",
  description: "Line, bar and sparkline charts drawn in glyphs, with a hidden data table for screen readers.",
  category: "data",
  modes: ["ascii"],
  tier: "free",
  files: ["registry/ui/ascii-chart.tsx"],
  props: [
    { name: "data", type: "number[]", description: "The series, one number per point." },
    { name: "type", type: '"line" | "bar" | "sparkline"', default: '"line"', description: "Line or bars filling the box, or an inline one-row sparkline." },
    { name: "label", type: "string", description: "What the data is; captions the hidden table." },
    { name: "labels", type: "string[]", description: "Row headers for the hidden table, e.g. dates; defaults to 1, 2, 3…" },
  ],
  example: { props: { label: "Weekly visits", data: [12, 18, 15, 26, 22, 31, 28, 40, 36, 44, 39, 52] } },
  knobs: [
    { name: "type", kind: "select", options: ["line", "bar", "sparkline"], default: "line" },
    "palette",
    "glyphs",
    "cell",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
