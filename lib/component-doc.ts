import { RAMPS } from "@/registry/engine/glyphs";
import { PALETTES } from "@/registry/engine/palettes";
import type { ComponentMeta, ExampleValue, KnobMeta } from "@/registry/meta/types";
import { addCommand, REGISTRY_URL } from "./install";

export type KnobValues = Record<string, string | number | boolean>;

// Defaults mirror DEFAULT_TOKENS (asserted in the test); kept here so this module stays importable anywhere.
const TOKEN_KNOBS = {
  mode: { name: "mode", kind: "select", options: ["dither", "ascii"], default: "dither" },
  pattern: { name: "pattern", kind: "select", options: ["bayer2", "bayer4", "bayer8", "blueNoise"], default: "bayer4" },
  palette: { name: "palette", kind: "select", options: Object.keys(PALETTES), default: "ink" },
  glyphs: { name: "glyphs", kind: "select", options: Object.keys(RAMPS), default: "standard" },
  cell: { name: "cell", kind: "range", min: 1, max: 24, step: 1, default: 3 },
  speed: { name: "speed", kind: "range", min: 0, max: 3, step: 0.1, default: 1 },
  contrast: { name: "contrast", kind: "range", min: 0.25, max: 3, step: 0.05, default: 1 },
  threshold: { name: "threshold", kind: "range", min: 0, max: 1, step: 0.05, default: 0.5 },
} satisfies Record<string, KnobMeta>;

export function knobsFor(meta: ComponentMeta): KnobMeta[] {
  return meta.knobs.map((k) => {
    if (typeof k !== "string") return k;
    const knob = TOKEN_KNOBS[k];
    return k === "mode" ? { ...knob, options: meta.modes } : knob;
  });
}

/** Default shown for a knob given the other values: ASCII cells default to 10 like the provider. */
export function defaultOf(knob: KnobMeta, values: KnobValues): KnobMeta["default"] {
  return knob.name === "cell" && values.mode === "ascii" ? 10 : knob.default;
}

/** Pattern only affects dither, glyphs only ASCII. */
export function isVisible(knob: KnobMeta, values: KnobValues): boolean {
  const ascii = values.mode === "ascii";
  return knob.name === "pattern" ? !ascii : knob.name === "glyphs" ? ascii : true;
}

/** Knob values that differ from their default, in knob order. */
export function tuned(meta: ComponentMeta, values: KnobValues): KnobValues {
  const out: KnobValues = {};
  for (const knob of knobsFor(meta)) {
    const v = values[knob.name];
    if (v !== undefined && isVisible(knob, values) && v !== defaultOf(knob, values)) out[knob.name] = v;
  }
  return out;
}

const pascal = (name: string) => name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());

function attr(name: string, v: ExampleValue): string {
  if (v === true) return name;
  if (typeof v === "string") return `${name}="${v}"`;
  if (Array.isArray(v)) return `${name}={${JSON.stringify(v)}}`;
  if (typeof v === "object") return `${name}={{ ${Object.entries(v).map(([k, x]) => `${k}: ${JSON.stringify(x)}`).join(", ")} }}`;
  return `${name}={${v}}`;
}

/** Import plus JSX for the example with the tuned knob values. */
export function snippet(meta: ComponentMeta, values: KnobValues): string {
  const Name = pascal(meta.name);
  const attrs = Object.entries({ ...meta.example.props, ...tuned(meta, values) }).map(([k, v]) => attr(k, v));
  const multiline = attrs.length > 2;
  const open = multiline ? `<${Name}\n${attrs.map((a) => `  ${a}`).join("\n")}\n` : `<${Name}${attrs.map((a) => ` ${a}`).join("")}`;
  const children = meta.example.children;
  const jsx = children ? `${open}>\n  ${children}\n</${Name}>` : `${open}${multiline ? "" : " "}/>`;
  return `import { ${Name} } from "@/components/ui/${meta.name}";\n\n${jsx}`;
}

export function prompt(meta: ComponentMeta, values: KnobValues): string {
  return `Add the dotgrain ${meta.title} component to this project. ${meta.description}

1. If components.json has no "@dotgrain" entry under "registries", add it:
   "registries": { "@dotgrain": "${REGISTRY_URL}/{name}.json" }
2. Install it: ${addCommand(`@dotgrain/${meta.name}`)}
3. Use it:

\`\`\`tsx
${snippet(meta, values)}
\`\`\`

Keep the component's API as is: customise it through its props and className instead of editing the installed files. It is a client component, so keep the "use client" directive at the top of its file.`;
}

export function openIn(text: string): { label: string; href: string }[] {
  const q = encodeURIComponent(text);
  return [
    { label: "Cursor", href: `https://cursor.com/link/prompt?text=${q}` },
    { label: "Claude", href: `https://claude.ai/new?q=${q}` },
    { label: "ChatGPT", href: `https://chatgpt.com/?q=${q}` },
  ];
}
