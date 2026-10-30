"use client";

import { Code } from "./code";
import { Preview } from "./preview";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "fumadocs-ui/components/ui/popover";
import { type ComponentType, type ReactNode, useState, useSyncExternalStore } from "react";
import { defaultOf, isVisible, type KnobValues, knobsFor, openIn, prompt, snippet } from "@/lib/component-doc";
import { useDitherTokens } from "@/lib/dotgrain/provider";
import type { DitherTokens } from "@/lib/dotgrain/types";
import { components } from "@/registry/meta";
import type { ComponentMeta, KnobMeta } from "@/registry/meta/types";
import { AsciiVideo } from "@/registry/ui/ascii-video";
import { DitherField } from "@/registry/ui/dither-field";
import { DitherImage } from "@/registry/ui/dither-image";
import { DitherProgress } from "@/registry/ui/dither-progress";
import { DitherReveal } from "@/registry/ui/dither-reveal";
import { AsciiRain } from "@/registry/ui/ascii-rain";
import { Button } from "@/registry/ui/button";
import { Toggle } from "@/registry/ui/toggle";
import { Loader } from "@/registry/ui/loader";
import { ScrambleText } from "@/registry/ui/scramble-text";

// Each preview gets its meta example props plus knob values, so props are only known at runtime.
const COMPONENTS = { "dither-field": DitherField, "dither-image": DitherImage, "dither-progress": DitherProgress, "ascii-video": AsciiVideo, "scramble-text": ScrambleText, "dither-reveal": DitherReveal, "ascii-rain": AsciiRain, button: Button, toggle: Toggle, loader: Loader } as unknown as Record<
  string,
  ComponentType<Record<string, unknown> & { children?: ReactNode }>
>;

// Knob values per component, shared by the page's playground and its copy-prompt button.
const knobs = new Map<string, KnobValues>();
const listeners = new Set<() => void>();
const EMPTY: KnobValues = {};
const subscribe = (cb: () => void) => (listeners.add(cb), () => listeners.delete(cb));

function useKnobs(name: string): [KnobValues, (values: KnobValues) => void] {
  const values = useSyncExternalStore(subscribe, () => knobs.get(name) ?? EMPTY, () => EMPTY);
  return [
    values,
    (next) => {
      knobs.set(name, next);
      listeners.forEach((cb) => cb());
    },
  ];
}

const TOKENS: (keyof DitherTokens)[] = ["mode", "pattern", "palette", "glyphs", "cell", "speed", "contrast", "threshold"];

/** Knob values on top of the style bar's tokens: what the preview renders, so knobs and code show it. */
function useEffective(meta: ComponentMeta, values: KnobValues): KnobValues {
  // Single-mode components force their mode, so mode-dependent defaults (cell, glyph knobs) follow it.
  const site = useDitherTokens(meta.modes.length === 1 ? { mode: meta.modes[0] } : {});
  // What renders: provider tokens, then the example's own props, then knobs.
  const example = Object.fromEntries(Object.entries(meta.example.props).filter(([, v]) => typeof v !== "object"));
  return { ...Object.fromEntries(TOKENS.map((k) => [k, site[k] as string | number])), ...(example as KnobValues), ...values };
}

const metaOf = (name: string): ComponentMeta => {
  const meta = components.find((c) => c.name === name);
  if (!meta) throw new Error(`Unknown component "${name}"`);
  return meta;
};

function Knob({ knob, values, set }: { knob: KnobMeta; values: KnobValues; set: (v: string | number | boolean) => void }) {
  const value = values[knob.name] ?? defaultOf(knob, values);
  const label = <span className="text-fd-muted-foreground">{knob.name}</span>;
  const input = "rounded-md border bg-fd-background px-2 py-1";
  if (knob.kind === "boolean")
    return (
      <label className="flex items-center justify-between gap-2">
        {label}
        <input type="checkbox" checked={value as boolean} onChange={(e) => set(e.target.checked)} />
      </label>
    );
  if (knob.kind === "select")
    return (
      <label className="flex items-center justify-between gap-2">
        {label}
        <select className={input} value={value as string} onChange={(e) => set(e.target.value)}>
          {knob.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
    );
  return (
    <label className="flex items-center justify-between gap-2">
      {label}
      <span className="flex items-center gap-2">
        <input type="range" min={knob.min} max={knob.max} step={knob.step} value={value as number} onChange={(e) => set(Number(e.target.value))} />
        <output className="w-10 text-right tabular-nums">{value}</output>
      </span>
    </label>
  );
}

/** Live preview with knobs, and a code tab printing exactly the tuned configuration. */
export function Playground({ name }: { name: string }) {
  const meta = metaOf(name);
  const [values, setValues] = useKnobs(name);
  const effective = useEffective(meta, values);
  const Component = COMPONENTS[name];
  const visible = knobsFor(meta).filter((k) => isVisible(k, effective));
  return (
    <Tabs items={["Preview", "Code"]} className="not-prose">
      <Tab value="Preview" className="p-0">
        <Preview>
          <Component {...meta.example.props} {...values}>
            {meta.example.children}
          </Component>
        </Preview>
        <div className="grid gap-x-6 gap-y-2 p-4 text-sm sm:grid-cols-2">
          {visible.map((knob) => (
            <Knob key={knob.name} knob={knob} values={effective} set={(v) => setValues({ ...values, [knob.name]: v })} />
          ))}
          <button type="button" className={buttonVariants({ color: "secondary", size: "sm", className: "justify-self-start" })} onClick={() => setValues(EMPTY)}>
            Reset
          </button>
        </div>
      </Tab>
      <Tab value="Code" className="p-0">
        <Code lang="tsx" code={snippet(meta, effective)} />
      </Tab>
    </Tabs>
  );
}

/** Copies an install-and-use prompt carrying the current knob values; the menu opens it in an AI tool. */
export function CopyPrompt({ name }: { name: string }) {
  const meta = metaOf(name);
  const [values] = useKnobs(name);
  const effective = useEffective(meta, values);
  const [copied, setCopied] = useState(false);
  const text = prompt(meta, effective);
  return (
    <div className="flex">
      <button
        type="button"
        className={buttonVariants({ color: "secondary", size: "sm", className: "rounded-r-none" })}
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : "Copy prompt"}
      </button>
      <Popover>
        <PopoverTrigger aria-label="Open prompt in…" className={buttonVariants({ color: "secondary", size: "sm", className: "rounded-l-none border-l-0" })}>
          ▾
        </PopoverTrigger>
        <PopoverContent className="flex w-44 flex-col p-1 text-sm">
          {openIn(text).map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-md px-2 py-1.5 hover:bg-fd-accent">
              Open in {label}
            </a>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
