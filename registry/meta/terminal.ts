import type { ComponentMeta } from "./types.ts";

export default {
  name: "terminal",
  title: "Terminal",
  description: "Command lines as real DOM text inside an ASCII frame, with an optional typing effect.",
  category: "surface",
  modes: ["ascii"],
  tier: "free",
  files: ["registry/ui/terminal.tsx"],
  props: [
    { name: "lines", type: "string[]", description: "One string per line, shown as real DOM text." },
    { name: "typing", type: "boolean", default: "false", description: "Type the lines out on mount; skipped under reduced motion." },
    { name: "rate", type: "number", default: "40", description: "Characters per second at speed 1." },
  ],
  example: { props: { lines: ["$ npx shadcn@latest add @dotgrain/terminal", "✔ Done. 1 file added.", "$ "], typing: true } },
  knobs: [
    { name: "typing", kind: "boolean", default: true },
    { name: "rate", kind: "range", min: 5, max: 200, step: 5, default: 40 },
    "palette",
    "glyphs",
    "cell",
    "speed",
  ],
} satisfies ComponentMeta;
