import type { DitherTokens, Mode } from "../engine/types";

export interface PropMeta {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** A docs-page knob for one component prop. */
export type KnobMeta =
  | { name: string; kind: "select"; options: string[]; default: string }
  | { name: string; kind: "range"; min: number; max: number; step: number; default: number }
  | { name: string; kind: "boolean"; default: boolean };

export type ExampleValue = string | number | boolean | Record<string, string | number>;

/** Single source of truth for a component: feeds registry.json and its docs page. */
export interface ComponentMeta {
  name: string;
  title: string;
  /** One plain sentence; reused for search, llms.txt and the copy prompt. */
  description: string;
  category: "background" | "media" | "feedback";
  modes: Mode[];
  tier: "free";
  files: string[];
  props: PropMeta[];
  /** Props the docs preview starts from; the code tab and copy prompt print them. */
  example: { props: Record<string, ExampleValue>; children?: string };
  /** Docs preview knobs: shared token names or component-prop knobs. */
  knobs: (keyof DitherTokens | KnobMeta)[];
}
