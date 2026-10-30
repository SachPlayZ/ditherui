import type { ComponentMeta } from "./types.ts";

export default {
  name: "toggle",
  title: "Toggle",
  description: "A native checkbox switch with a dithered track that eases between off and on.",
  category: "control",
  modes: ["dither"],
  tier: "free",
  files: ["registry/ui/toggle.tsx"],
  props: [
    { name: "checked", type: "boolean", description: "Controlled state; pair with onChange." },
    { name: "defaultChecked", type: "boolean", description: "Initial state when uncontrolled." },
    { name: "onChange", type: "(event: ChangeEvent<HTMLInputElement>) => void", description: "Native change event; read event.target.checked." },
    { name: "size", type: "number", default: "24", description: "Track height in CSS pixels; the width is twice that." },
    { name: "ref", type: "Ref<HTMLInputElement>", description: "The native input; className and style go to the outer track." },
  ],
  example: { props: { defaultChecked: true, "aria-label": "Notifications" } },
  knobs: [
    { name: "size", kind: "range", min: 16, max: 48, step: 2, default: 24 },
    { name: "disabled", kind: "boolean", default: false },
    "pattern",
    "palette",
    "cell",
    "contrast",
    "threshold",
  ],
} satisfies ComponentMeta;
